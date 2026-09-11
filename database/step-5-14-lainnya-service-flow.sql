begin;

lock table public.services in share row exclusive mode;
lock table public.orders in share row exclusive mode;

do $migration$
declare
  v_service_id uuid;
  v_service_count bigint;
  v_catalog_flow public.service_flow;
  v_order_id uuid;
  v_order_count bigint;
  v_requirement_before text;
  v_reference_count bigint;
  v_reference_count_after bigint;
  v_guard_trigger text;
  v_guard_trigger_count integer;
  v_guard_enabled "char";
  v_updated_count bigint;
  v_preserved_before jsonb;
  v_preserved_after jsonb;
begin
  select count(*)
  into v_service_count
  from public.services
  where slug = 'lainnya';

  if v_service_count <> 1 then
    raise exception
      'Migration aborted: expected exactly 1 service with slug lainnya, found %',
      v_service_count;
  end if;

  select id, flow
  into v_service_id, v_catalog_flow
  from public.services
  where slug = 'lainnya';

  if not found then
    raise exception 'Migration aborted: service slug lainnya was not found';
  end if;

  if v_catalog_flow is distinct from 'konveksi_sablon'::public.service_flow then
    raise exception
      'Migration aborted: expected lainnya catalog flow konveksi_sablon, found %',
      v_catalog_flow;
  end if;

  select count(*)
  into v_order_count
  from public.orders
  where service_id = v_service_id;

  if v_order_count <> 1 then
    raise exception
      'Migration aborted: expected exactly 1 audited lainnya order, found %',
      v_order_count;
  end if;

  select
    id,
    material,
    to_jsonb(existing_order)
      - array[
          'service_flow',
          'status',
          'material',
          'job_description',
          'updated_at'
        ]::text[]
  into v_order_id, v_requirement_before, v_preserved_before
  from public.orders as existing_order
  where service_id = v_service_id
    and order_kind = 'service'::public.order_kind
    and service_flow = 'konveksi_sablon'::public.service_flow
    and status = 'sample_mockup'::public.order_status
    and quantity = 1
    and material is not null
    and btrim(material) <> ''
    and job_description is null;

  if not found then
    raise exception
      'Migration aborted: the audited lainnya order no longer matches the safe mapping';
  end if;

  select count(*)
  into v_reference_count
  from public.order_design_references
  where order_id = v_order_id;

  select count(*), min(trigger_definition.tgname)
  into v_guard_trigger_count, v_guard_trigger
  from pg_catalog.pg_trigger as trigger_definition
  where trigger_definition.tgrelid = 'public.orders'::regclass
    and trigger_definition.tgfoid =
      'public.guard_order_before_update()'::regprocedure
    and not trigger_definition.tgisinternal;

  if v_guard_trigger_count <> 1 or v_guard_trigger is null then
    raise exception
      'Migration aborted: expected exactly one orders update guard, found %',
      v_guard_trigger_count;
  end if;

  select trigger_definition.tgenabled
  into v_guard_enabled
  from pg_catalog.pg_trigger as trigger_definition
  where trigger_definition.tgrelid = 'public.orders'::regclass
    and trigger_definition.tgname = v_guard_trigger;

  if v_guard_enabled <> 'O' then
    raise exception
      'Migration aborted: orders update guard % is not normally enabled',
      v_guard_trigger;
  end if;

  update public.services
  set flow = 'permak'::public.service_flow
  where id = v_service_id
    and flow = 'konveksi_sablon'::public.service_flow;

  if not found then
    raise exception 'Migration aborted: lainnya catalog flow changed concurrently';
  end if;

  execute format(
    'alter table public.orders disable trigger %I',
    v_guard_trigger
  );

  begin
    update public.orders
    set job_description = material,
        material = null,
        service_flow = 'permak'::public.service_flow,
        status = 'diterima'::public.order_status
    where id = v_order_id
      and service_id = v_service_id
      and order_kind = 'service'::public.order_kind
      and service_flow = 'konveksi_sablon'::public.service_flow
      and status = 'sample_mockup'::public.order_status
      and quantity = 1
      and material is not null
      and btrim(material) <> ''
      and job_description is null;

    get diagnostics v_updated_count = row_count;

    if v_updated_count <> 1 then
      raise exception
        'Migration aborted: expected to backfill 1 lainnya order, updated %',
        v_updated_count;
    end if;
  exception
    when others then
      execute format(
        'alter table public.orders enable trigger %I',
        v_guard_trigger
      );
      raise;
  end;

  execute format(
    'alter table public.orders enable trigger %I',
    v_guard_trigger
  );

  select trigger_definition.tgenabled
  into v_guard_enabled
  from pg_catalog.pg_trigger as trigger_definition
  where trigger_definition.tgrelid = 'public.orders'::regclass
    and trigger_definition.tgname = v_guard_trigger;

  if v_guard_enabled <> 'O' then
    raise exception
      'Migration validation failed: orders update guard % was not restored',
      v_guard_trigger;
  end if;

  select
    to_jsonb(migrated_order)
      - array[
          'service_flow',
          'status',
          'material',
          'job_description',
          'updated_at'
        ]::text[]
  into v_preserved_after
  from public.orders as migrated_order
  where id = v_order_id
    and service_id = v_service_id
    and order_kind = 'service'::public.order_kind
    and service_flow = 'permak'::public.service_flow
    and status = 'diterima'::public.order_status
    and quantity = 1
    and material is null
    and job_description is not null
    and job_description = v_requirement_before;

  if not found then
    raise exception 'Migration validation failed: lainnya order shape is invalid';
  end if;

  if v_preserved_after is distinct from v_preserved_before then
    raise exception
      'Migration validation failed: unrelated order data was modified';
  end if;

  select count(*)
  into v_reference_count_after
  from public.order_design_references
  where order_id = v_order_id;

  if v_reference_count_after <> v_reference_count then
    raise exception
      'Migration validation failed: design reference count changed from % to %',
      v_reference_count,
      v_reference_count_after;
  end if;

  if not exists (
    select 1
    from public.services
    where id = v_service_id
      and slug = 'lainnya'
      and flow = 'permak'::public.service_flow
  ) then
    raise exception 'Migration validation failed: catalog flow was not updated';
  end if;
end;
$migration$;

commit;

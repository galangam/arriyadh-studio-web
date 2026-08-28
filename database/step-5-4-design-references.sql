-- Apply manually in the Supabase SQL Editor.
alter table public.orders
  add column if not exists design_description text null,
  add column if not exists design_reference_path text null;

CREATE OR REPLACE FUNCTION public.prepare_order_before_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_service public.services%rowtype;
  v_product public.products%rowtype;
begin
  new.customer_name := btrim(new.customer_name);
  new.customer_company := nullif(btrim(new.customer_company), '');
  new.customer_email := nullif(btrim(new.customer_email), '');
  new.shipping_address := nullif(btrim(new.shipping_address), '');

  if new.order_kind = 'service' then
    if new.service_id is null then
      raise exception 'service_id wajib untuk pesanan layanan';
    end if;

    select *
    into v_service
    from public.services
    where id = new.service_id
      and is_active = true;

    if not found then
      raise exception 'Layanan tidak tersedia';
    end if;

    new.status := 'menunggu_harga';
    new.service_name_snapshot := v_service.name;
    new.service_flow := v_service.flow;
    new.design_reference_path := null;

    -- Clear product-only fields.
    new.product_id := null;
    new.product_name_snapshot := null;
    new.product_size := null;
    new.unit_price := null;

    -- Price/payment is intentionally empty before admin quotation.
    new.price := null;
    new.payment_method := null;
    new.payment_proof_path := null;
    new.payment_verified_at := null;
    new.quoted_at := null;

    if v_service.flow = 'konveksi_sablon' then
      new.material := nullif(btrim(new.material), '');
      new.job_description := null;
      new.design_description := nullif(btrim(new.design_description), '');

      if new.material is null then
        raise exception 'Bahan wajib dipilih untuk layanan Konveksi/Sablon';
      end if;
    else
      new.job_description := nullif(btrim(new.job_description), '');
      new.material := null;
      new.design_description := null;
      new.design_reference_path := null;

      if new.job_description is null then
        raise exception 'Deskripsi pekerjaan wajib diisi untuk layanan Permak';
      end if;
    end if;

  elsif new.order_kind = 'product' then
    if new.product_id is null then
      raise exception 'product_id wajib untuk pembelian produk';
    end if;

    select *
    into v_product
    from public.products
    where id = new.product_id
      and is_active = true;

    if not found then
      raise exception 'Produk tidak tersedia';
    end if;

    if new.product_size is null or btrim(new.product_size) = '' then
      raise exception 'Ukuran produk wajib dipilih';
    end if;

    new.product_size := btrim(new.product_size);

    if cardinality(v_product.available_sizes) > 0
       and not (new.product_size = any(v_product.available_sizes)) then
      raise exception 'Ukuran produk tidak tersedia';
    end if;

    if new.payment_method is null then
      raise exception 'Metode pembayaran wajib dipilih';
    end if;

    new.status := 'menunggu_verifikasi';
    new.product_name_snapshot := v_product.name;
    new.unit_price := v_product.price;
    new.price := v_product.price * new.quantity;

    -- Product checkout only needs name + WhatsApp in the current scope.
    new.customer_company := null;
    new.customer_email := null;
    new.shipping_address := null;

    -- Clear service-only fields.
    new.service_id := null;
    new.service_name_snapshot := null;
    new.service_flow := null;
    new.material := null;
    new.job_description := null;
    new.design_description := null;
    new.design_reference_path := null;

    new.quoted_at := null;
    new.payment_verified_at := null;
  else
    raise exception 'Jenis pesanan tidak valid';
  end if;

  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.guard_order_before_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  -- Identity / catalog source cannot be changed after creation.
  if new.id is distinct from old.id
     or new.order_code is distinct from old.order_code
     or new.payment_token is distinct from old.payment_token
     or new.order_kind is distinct from old.order_kind
     or new.service_id is distinct from old.service_id
     or new.product_id is distinct from old.product_id
     or new.service_flow is distinct from old.service_flow
     or new.service_name_snapshot is distinct from old.service_name_snapshot
     or new.product_name_snapshot is distinct from old.product_name_snapshot
     or new.product_size is distinct from old.product_size
     or new.quantity is distinct from old.quantity
     or new.material is distinct from old.material
     or new.job_description is distinct from old.job_description
     or new.design_description is distinct from old.design_description
     or new.unit_price is distinct from old.unit_price then
    raise exception 'Field identitas/snapshot pesanan tidak boleh diubah';
  end if;

  -- Design reference belongs only to service orders.
  if old.order_kind <> 'service'
     and new.design_reference_path is distinct from old.design_reference_path then
    raise exception 'Referensi desain hanya berlaku untuk pesanan layanan';
  end if;

  -- Reference may be attached once after order creation.
  if old.design_reference_path is not null
     and new.design_reference_path is distinct from old.design_reference_path then
    raise exception 'Referensi desain tidak boleh diubah setelah diunggah';
  end if;

  -- Once chosen, payment method is immutable (service starts as NULL, then becomes transfer/COD).
  if old.payment_method is not null
     and new.payment_method is distinct from old.payment_method then
    raise exception 'Metode pembayaran tidak boleh diubah setelah dipilih';
  end if;

  -- Product price is fixed from the product catalog at order creation.
  if old.order_kind = 'product' and new.price is distinct from old.price then
    raise exception 'Harga produk ready-stock tidak boleh diubah setelah pesanan dibuat';
  end if;

  -- Service quoted price may be edited only before payment confirmation/production.
  if old.order_kind = 'service'
     and new.price is distinct from old.price
     and old.status not in ('menunggu_harga', 'menunggu_pembayaran_dp') then
    raise exception 'Harga layanan tidak boleh diubah setelah proses pembayaran dimulai';
  end if;

  -- Ready-stock transfer cannot move to processing before proof exists.
  if old.order_kind = 'product'
     and old.status = 'menunggu_verifikasi'
     and new.status = 'diproses'
     and old.payment_method = 'transfer'
     and new.payment_proof_path is null then
    raise exception 'Bukti transfer wajib ada sebelum produk diproses';
  end if;

  if old.status is distinct from new.status
     and not public.is_valid_order_transition(
       old.order_kind,
       old.service_flow,
       old.status,
       new.status
     ) then
    raise exception 'Transisi status % -> % tidak diizinkan', old.status, new.status;
  end if;

  -- Quote timestamp when admin sends the first quote.
  if old.order_kind = 'service'
     and old.price is null
     and new.price is not null then
    new.quoted_at := coalesce(new.quoted_at, now());
  end if;

  -- Verification timestamp when admin moves an order into fulfillment/production.
  if old.status in ('menunggu_verifikasi', 'menunggu_konfirmasi_dp')
     and new.status not in (
       'menunggu_harga',
       'menunggu_pembayaran_dp',
       'menunggu_konfirmasi_dp',
       'menunggu_verifikasi',
       'dibatalkan'
     ) then
    new.payment_verified_at := coalesce(new.payment_verified_at, now());
  end if;

  if old.status is distinct from new.status and new.status = 'selesai' then
    new.completed_at := coalesce(new.completed_at, now());
  end if;

  if old.status is distinct from new.status and new.status = 'dibatalkan' then
    new.cancelled_at := coalesce(new.cancelled_at, now());
  end if;

  return new;
end;
$function$;

create table if not exists public.order_design_references (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  storage_path text not null,
  mime_type text not null,
  created_at timestamptz not null default now(),
  constraint order_design_references_storage_path_not_blank
    check (btrim(storage_path) <> ''),
  constraint order_design_references_storage_path_key unique (storage_path),
  constraint order_design_references_mime_type_check
    check (
      mime_type in (
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf'
      )
    )
);

create index if not exists order_design_references_order_id_idx
  on public.order_design_references (order_id, created_at, id);

alter table public.order_design_references enable row level security;

create or replace function public.guard_order_design_reference_before_insert()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  -- Lock the parent so concurrent inserts cannot bypass the five-file limit.
  perform 1
  from public.orders
  where id = new.order_id
    and order_kind = 'service'
  for update;

  if not found then
    raise exception 'Referensi desain hanya berlaku untuk pesanan layanan';
  end if;

  if (
    select count(*)
    from public.order_design_references
    where order_id = new.order_id
  ) >= 5 then
    raise exception 'Maksimal 5 referensi desain per pesanan';
  end if;

  new.storage_path := btrim(new.storage_path);
  return new;
end;
$function$;

drop trigger if exists guard_order_design_reference_before_insert
  on public.order_design_references;

create trigger guard_order_design_reference_before_insert
before insert on public.order_design_references
for each row
execute function public.guard_order_design_reference_before_insert();

-- Stop rather than silently skip a legacy path whose type cannot be inferred.
do $migration$
begin
  if exists (
    select 1
    from public.orders
    where design_reference_path is not null
      and order_kind <> 'service'
  ) then
    raise exception 'Ada design_reference_path lama pada pesanan non-layanan';
  end if;

  if exists (
    select 1
    from public.orders
    where design_reference_path is not null
      and lower(design_reference_path) !~ '\.(jpe?g|png|webp|pdf)$'
  ) then
    raise exception 'Ada design_reference_path lama dengan ekstensi yang tidak didukung';
  end if;
end;
$migration$;

insert into public.order_design_references (
  order_id,
  storage_path,
  mime_type
)
select
  id,
  design_reference_path,
  case
    when lower(design_reference_path) ~ '\.(jpg|jpeg)$' then 'image/jpeg'
    when lower(design_reference_path) ~ '\.png$' then 'image/png'
    when lower(design_reference_path) ~ '\.webp$' then 'image/webp'
    when lower(design_reference_path) ~ '\.pdf$' then 'application/pdf'
  end
from public.orders
where design_reference_path is not null
  and not exists (
    select 1
    from public.order_design_references existing_reference
    where existing_reference.storage_path = orders.design_reference_path
  )
on conflict (storage_path) do nothing;

-- Keep orders.design_reference_path temporarily as a deprecated migration
-- source. New application writes use public.order_design_references only.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'design-references',
  'design-references',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- No public, anonymous, or authenticated Storage object policies are created.
-- Uploads and signed reads use the server-only Supabase admin client.

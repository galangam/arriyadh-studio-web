alter table public.orders
  drop constraint if exists orders_service_dynamic_field_check;

alter table public.orders
  add constraint orders_service_dynamic_field_check
  check (
    order_kind = 'product'::order_kind
    or (
      service_flow = 'konveksi_sablon'::service_flow
      and job_description is null
      and (
        material is null
        or btrim(material) <> ''
      )
    )
    or (
      service_flow = 'permak'::service_flow
      and job_description is not null
      and btrim(job_description) <> ''
      and material is null
    )
  );

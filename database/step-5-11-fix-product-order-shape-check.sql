begin;

alter table public.orders
  drop constraint if exists orders_kind_shape_check;

alter table public.orders
  add constraint orders_kind_shape_check
  check (
    (
      order_kind = 'service'::order_kind
      and service_name_snapshot is not null
      and service_flow is not null
      and product_id is null
      and product_name_snapshot is null
      and product_size is null
      and unit_price is null
      and product_sleeve_type is null
    )
    or
    (
      order_kind = 'product'::order_kind
      and product_name_snapshot is not null
      and product_size is not null
      and service_id is null
      and service_name_snapshot is null
      and service_flow is null
      and job_description is null
      and unit_price is not null
      and price is not null
      and payment_method is not null
    )
  );

commit;

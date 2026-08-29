create table public.order_service_variant_sizes (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null
    references public.order_service_variants(id)
    on delete cascade,
  size text not null,
  quantity integer not null,
  created_at timestamptz not null default now(),
  constraint order_service_variant_sizes_size_check
    check (size in ('S', 'M', 'L', 'XL', 'XXL', 'XXXL')),
  constraint order_service_variant_sizes_quantity_check
    check (quantity > 0 and quantity <= 10000),
  constraint order_service_variant_sizes_variant_size_unique
    unique (variant_id, size)
);

create index order_service_variant_sizes_variant_id_idx
  on public.order_service_variant_sizes(variant_id);

alter table public.order_service_variant_sizes enable row level security;

-- No anonymous or public policies are intentionally created.
-- The trusted server-side admin client bypasses RLS.
--
-- No synchronization trigger is added. New-order subtotals and totals are
-- computed and inserted by the trusted server in one creation workflow.
-- This avoids changing legacy variant-only rows and avoids globally changing
-- orders.quantity semantics for non-structured services.

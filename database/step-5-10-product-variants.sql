alter table public.orders
  add column if not exists product_sleeve_type text null;

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  material text not null,
  sleeve_type text null,
  base_unit_price numeric(12, 0) not null,
  large_size_surcharge numeric(12, 0) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_variants_material_not_blank
    check (btrim(material) <> ''),
  constraint product_variants_sleeve_type_not_blank
    check (sleeve_type is null or btrim(sleeve_type) <> ''),
  constraint product_variants_base_unit_price_check
    check (base_unit_price >= 0),
  constraint product_variants_large_size_surcharge_check
    check (large_size_surcharge >= 0),
  constraint product_variants_configuration_key
    unique nulls not distinct (product_id, material, sleeve_type)
);

create index if not exists product_variants_product_id_active_idx
  on public.product_variants (product_id, is_active);

alter table public.product_variants enable row level security;

drop policy if exists "Public can view active product variants"
  on public.product_variants;

create policy "Public can view active product variants"
on public.product_variants
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.products
    where products.id = product_variants.product_id
      and products.is_active = true
  )
);

grant select on public.product_variants to anon, authenticated;

insert into public.product_variants (
  product_id,
  material,
  sleeve_type,
  base_unit_price,
  large_size_surcharge,
  is_active
)
select
  products.id,
  variants.material,
  variants.sleeve_type,
  variants.base_unit_price,
  variants.large_size_surcharge,
  true
from public.products
cross join (
  values
    ('Cotton Combed 30s', 'Lengan Pendek', 45000::numeric, 5000::numeric),
    ('Cotton Combed 30s', 'Lengan Panjang', 55000::numeric, 5000::numeric),
    ('Cotton Combed 24s', 'Lengan Pendek', 50000::numeric, 5000::numeric),
    ('Cotton Combed 24s', 'Lengan Panjang', 60000::numeric, 5000::numeric)
) as variants(material, sleeve_type, base_unit_price, large_size_surcharge)
where products.slug = 'kaos-polos-premium'
on conflict (product_id, material, sleeve_type) do update
set base_unit_price = excluded.base_unit_price,
    large_size_surcharge = excluded.large_size_surcharge,
    is_active = true,
    updated_at = now();

insert into public.product_variants (
  product_id,
  material,
  sleeve_type,
  base_unit_price,
  large_size_surcharge,
  is_active
)
select
  id,
  'Microfiber',
  null,
  price,
  0,
  true
from public.products
where slug = 'celana-kolor-santai'
on conflict (product_id, material, sleeve_type) do update
set base_unit_price = excluded.base_unit_price,
    large_size_surcharge = 0,
    is_active = true,
    updated_at = now();

update public.products
set name = 'Kaos Polos',
    price = 45000,
    available_sizes = array['S', 'M', 'L', 'XL', 'XXL', 'XXXL']::text[],
    description = 'Kaos polos berbahan Cotton Combed 30s atau Cotton Combed 24s dengan pilihan lengan pendek dan panjang.'
where slug = 'kaos-polos-premium';

update public.products
set name = 'Celana Kolor',
    description = 'Celana kolor berbahan Microfiber untuk penggunaan sehari-hari.'
where slug = 'celana-kolor-santai';

create or replace function public.prepare_order_before_insert()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_service public.services%rowtype;
  v_product public.products%rowtype;
  v_variant public.product_variants%rowtype;
  v_variant_count bigint;
begin
  new.customer_name := btrim(new.customer_name);
  new.customer_company := nullif(btrim(new.customer_company), '');
  new.customer_email := nullif(btrim(new.customer_email), '');
  new.shipping_address := nullif(btrim(new.shipping_address), '');

  if new.order_kind = 'service' then
    if new.service_id is null then
      raise exception 'service_id wajib untuk pesanan layanan';
    end if;

    select * into v_service
    from public.services
    where id = new.service_id and is_active = true;

    if not found then
      raise exception 'Layanan tidak tersedia';
    end if;

    new.status := 'menunggu_harga';
    new.service_name_snapshot := v_service.name;
    new.service_flow := v_service.flow;
    new.design_reference_path := null;

    new.product_id := null;
    new.product_name_snapshot := null;
    new.product_size := null;
    new.product_sleeve_type := null;
    new.unit_price := null;

    new.price := null;
    new.payment_method := null;
    new.payment_proof_path := null;
    new.payment_verified_at := null;
    new.quoted_at := null;

    if v_service.flow = 'konveksi_sablon' then
      new.material := nullif(btrim(new.material), '');
      new.job_description := null;
      new.design_description := nullif(btrim(new.design_description), '');

      if v_service.slug not in ('sablon', 'kaos', 'kemeja', 'jersey')
         and new.material is null then
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

    select * into v_product
    from public.products
    where id = new.product_id and is_active = true;

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

    new.material := nullif(btrim(new.material), '');
    new.product_sleeve_type := nullif(btrim(new.product_sleeve_type), '');

    select count(*) into v_variant_count
    from public.product_variants
    where product_id = v_product.id;

    if v_variant_count > 0 then
      select * into v_variant
      from public.product_variants
      where product_id = v_product.id
        and is_active = true
        and material = new.material
        and sleeve_type is not distinct from new.product_sleeve_type;

      if not found then
        raise exception 'Varian produk tidak tersedia';
      end if;

      new.unit_price := v_variant.base_unit_price
        + case
            when new.product_size in ('XXL', 'XXXL')
              then v_variant.large_size_surcharge
            else 0
          end;
    else
      new.material := null;
      new.product_sleeve_type := null;
      new.unit_price := v_product.price;
    end if;

    new.status := 'menunggu_verifikasi';
    new.product_name_snapshot := v_product.name;
    new.price := new.unit_price * new.quantity;

    new.customer_company := null;
    new.customer_email := null;
    new.shipping_address := null;

    new.service_id := null;
    new.service_name_snapshot := null;
    new.service_flow := null;
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

create or replace function public.guard_product_sleeve_snapshot_before_update()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if new.product_sleeve_type is distinct from old.product_sleeve_type then
    raise exception 'Field snapshot lengan produk tidak boleh diubah';
  end if;

  return new;
end;
$function$;

drop trigger if exists guard_product_sleeve_snapshot_before_update
  on public.orders;

create trigger guard_product_sleeve_snapshot_before_update
before update on public.orders
for each row
execute function public.guard_product_sleeve_snapshot_before_update();

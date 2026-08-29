alter table public.order_service_variants
  drop constraint if exists order_service_variants_material_check;

alter table public.order_service_variants
  add constraint order_service_variants_material_check
    check (
      material in (
      'Cotton Combed 24s',
      'Cotton Combed 30s',
      'Japan Drill',
      'American Drill',
      'Dryfit Milano',
      'Dryfit Adidas',
      'Dryfit MU',
      'Dryfit Wafel',
      'Dryfit Nike Brazil',
      'Dryfit Puma',
      'Dryfit Benzema',
      'Dryfit Toppo',
      'Dryfit Straw',
      'Dryfit Toppo Grafi'
      )
    );

insert into public.services (
  slug,
  name,
  flow,
  description,
  is_active,
  sort_order
)
values (
  'jersey-embos',
  'Jersey Embos',
  'konveksi_sablon',
  'Produksi jersey custom berbahan embos dengan pilihan lengan dan rincian ukuran.',
  true,
  (select coalesce(max(sort_order), 0) + 1 from public.services)
)
on conflict (slug) do nothing;

-- Preserve the complete existing function contract. Only the structured-service
-- material exception is expanded to the confirmed service slugs.

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

      if v_service.slug not in ('sablon', 'kaos', 'kemeja', 'jersey', 'jersey-embos') and new.material is null then
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

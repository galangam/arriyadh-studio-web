begin;

do $preflight$
begin
  if to_regclass('public.services') is null then
    raise exception 'CMS foundation requires the existing public.services table';
  end if;

  if to_regclass('public.products') is null then
    raise exception 'CMS foundation requires the existing public.products table';
  end                                                           if;

  if to_regprocedure('public.set_updated_at()') is null then
    raise exception 'CMS foundation requires the existing public.set_updated_at() function';
  end if;

  if to_regprocedure('private.is_admin()') is null then
    raise exception 'CMS foundation requires the existing private.is_admin() function';
  end if;
end
$preflight$;

-- A fixed primary key makes each content table an explicit singleton. The
-- application can always query id = 1, and the check prevents extra rows.
create table public.site_settings (
  id smallint primary key default 1,
  business_name text not null,
  whatsapp text null,
  phone text null,
  email text null,
  address text null,
  operating_hours text null,
  maps_url text null,
  instagram_url text null,
  facebook_url text null,
  tiktok_url text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton_check check (id = 1),
  constraint site_settings_business_name_not_blank
    check (btrim(business_name) <> ''),
  constraint site_settings_whatsapp_not_blank
    check (whatsapp is null or btrim(whatsapp) <> ''),
  constraint site_settings_phone_not_blank
    check (phone is null or btrim(phone) <> ''),
  constraint site_settings_email_not_blank
    check (email is null or btrim(email) <> ''),
  constraint site_settings_address_not_blank
    check (address is null or btrim(address) <> ''),
  constraint site_settings_operating_hours_not_blank
    check (operating_hours is null or btrim(operating_hours) <> ''),
  constraint site_settings_maps_url_not_blank
    check (maps_url is null or btrim(maps_url) <> ''),
  constraint site_settings_instagram_url_not_blank
    check (instagram_url is null or btrim(instagram_url) <> ''),
  constraint site_settings_facebook_url_not_blank
    check (facebook_url is null or btrim(facebook_url) <> ''),
  constraint site_settings_tiktok_url_not_blank
    check (tiktok_url is null or btrim(tiktok_url) <> '')
);

create table public.homepage_content (
  id smallint primary key default 1,
  hero_eyebrow text not null,
  hero_title text not null,
  hero_description text not null,
  hero_image_url text null,
  intro_title text not null,
  intro_description text not null,
  experience_value text null,
  experience_label text null,
  portfolio_title text not null,
  portfolio_description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint homepage_content_singleton_check check (id = 1),
  constraint homepage_content_hero_eyebrow_not_blank
    check (btrim(hero_eyebrow) <> ''),
  constraint homepage_content_hero_title_not_blank
    check (btrim(hero_title) <> ''),
  constraint homepage_content_hero_description_not_blank
    check (btrim(hero_description) <> ''),
  constraint homepage_content_hero_image_url_not_blank
    check (hero_image_url is null or btrim(hero_image_url) <> ''),
  constraint homepage_content_intro_title_not_blank
    check (btrim(intro_title) <> ''),
  constraint homepage_content_intro_description_not_blank
    check (btrim(intro_description) <> ''),
  constraint homepage_content_experience_value_not_blank
    check (experience_value is null or btrim(experience_value) <> ''),
  constraint homepage_content_experience_label_not_blank
    check (experience_label is null or btrim(experience_label) <> ''),
  constraint homepage_content_portfolio_title_not_blank
    check (btrim(portfolio_title) <> ''),
  constraint homepage_content_portfolio_description_not_blank
    check (btrim(portfolio_description) <> '')
);

create table public.about_content (
  id smallint primary key default 1,
  page_title text not null,
  page_subtitle text not null,
  history_title text not null,
  history_body text not null,
  founded_year integer null,
  strength_1_title text not null,
  strength_1_description text not null,
  strength_2_title text not null,
  strength_2_description text not null,
  strength_3_title text not null,
  strength_3_description text not null,
  workshop_title text not null,
  workshop_description text not null,
  workshop_image_url text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint about_content_singleton_check check (id = 1),
  constraint about_content_page_title_not_blank
    check (btrim(page_title) <> ''),
  constraint about_content_page_subtitle_not_blank
    check (btrim(page_subtitle) <> ''),
  constraint about_content_history_title_not_blank
    check (btrim(history_title) <> ''),
  constraint about_content_history_body_not_blank
    check (btrim(history_body) <> ''),
  constraint about_content_founded_year_check
    check (founded_year is null or founded_year between 1900 and 2100),
  constraint about_content_strength_1_title_not_blank
    check (btrim(strength_1_title) <> ''),
  constraint about_content_strength_1_description_not_blank
    check (btrim(strength_1_description) <> ''),
  constraint about_content_strength_2_title_not_blank
    check (btrim(strength_2_title) <> ''),
  constraint about_content_strength_2_description_not_blank
    check (btrim(strength_2_description) <> ''),
  constraint about_content_strength_3_title_not_blank
    check (btrim(strength_3_title) <> ''),
  constraint about_content_strength_3_description_not_blank
    check (btrim(strength_3_description) <> ''),
  constraint about_content_workshop_title_not_blank
    check (btrim(workshop_title) <> ''),
  constraint about_content_workshop_description_not_blank
    check (btrim(workshop_description) <> ''),
  constraint about_content_workshop_image_url_not_blank
    check (workshop_image_url is null or btrim(workshop_image_url) <> '')
);

create table public.homepage_featured_services (
  homepage_id smallint not null default 1
    references public.homepage_content(id) on delete cascade,
  service_id uuid not null
    references public.services(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (homepage_id, service_id),
  constraint homepage_featured_services_sort_order_check
    check (sort_order >= 0),
  constraint homepage_featured_services_position_key
    unique (homepage_id, sort_order)
);

create table public.homepage_featured_products (
  homepage_id smallint not null default 1
    references public.homepage_content(id) on delete cascade,
  product_id uuid not null
    references public.products(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (homepage_id, product_id),
  constraint homepage_featured_products_sort_order_check
    check (sort_order >= 0),
  constraint homepage_featured_products_position_key
    unique (homepage_id, sort_order)
);

create trigger set_site_settings_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

create trigger set_homepage_content_updated_at
before update on public.homepage_content
for each row execute function public.set_updated_at();

create trigger set_about_content_updated_at
before update on public.about_content
for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;
alter table public.homepage_content enable row level security;
alter table public.about_content enable row level security;
alter table public.homepage_featured_services enable row level security;
alter table public.homepage_featured_products enable row level security;

create policy "Public can view site settings"
on public.site_settings
for select
to anon, authenticated
using (true);

create policy "Admins can insert site settings"
on public.site_settings
for insert
to authenticated
with check ((select private.is_admin()));

create policy "Admins can update site settings"
on public.site_settings
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Public can view homepage content"
on public.homepage_content
for select
to anon, authenticated
using (true);

create policy "Admins can insert homepage content"
on public.homepage_content
for insert
to authenticated
with check ((select private.is_admin()));

create policy "Admins can update homepage content"
on public.homepage_content
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Public can view about content"
on public.about_content
for select
to anon, authenticated
using (true);

create policy "Admins can insert about content"
on public.about_content
for insert
to authenticated
with check ((select private.is_admin()));

create policy "Admins can update about content"
on public.about_content
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Public can view featured services"
on public.homepage_featured_services
for select
to anon, authenticated
using (true);

create policy "Admins can insert featured services"
on public.homepage_featured_services
for insert
to authenticated
with check ((select private.is_admin()));

create policy "Admins can update featured services"
on public.homepage_featured_services
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins can delete featured services"
on public.homepage_featured_services
for delete
to authenticated
using ((select private.is_admin()));

create policy "Public can view featured products"
on public.homepage_featured_products
for select
to anon, authenticated
using (true);

create policy "Admins can insert featured products"
on public.homepage_featured_products
for insert
to authenticated
with check ((select private.is_admin()));

create policy "Admins can update featured products"
on public.homepage_featured_products
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins can delete featured products"
on public.homepage_featured_products
for delete
to authenticated
using ((select private.is_admin()));

grant select on public.site_settings to anon, authenticated;
grant select on public.homepage_content to anon, authenticated;
grant select on public.about_content to anon, authenticated;
grant select on public.homepage_featured_services to anon, authenticated;
grant select on public.homepage_featured_products to anon, authenticated;

grant insert, update on public.site_settings to authenticated;
grant insert, update on public.homepage_content to authenticated;
grant insert, update on public.about_content to authenticated;
grant insert, update, delete on public.homepage_featured_services to authenticated;
grant insert, update, delete on public.homepage_featured_products to authenticated;

insert into public.site_settings (
  id,
  business_name,
  whatsapp,
  phone,
  email,
  address,
  operating_hours,
  maps_url,
  instagram_url,
  facebook_url,
  tiktok_url
)
values (
  1,
  'Arriyadh Studio',
  '6281214719630',
  '+62 812-1471-9630',
  'ananang559@gmail.com',
  'Jl. Moch Idris, Dusun Cibodas, Kec. Kalijati, Kabupaten Subang, Jawa Barat, Indonesia',
  'Senin – Sabtu: 09.00 – 17.00 WIB',
  'https://www.google.com/maps/place/ARRIYADH+STUDIO/@-6.5269638,107.6929188,17z/data=!3m1!4b1!4m6!3m5!1s0x2e693d4dd1f64ee7:0x3c26c2cb7b7a7eb2!8m2!3d-6.5269638!4d107.6929188!16s%2Fg%2F11ygpmhxzz?entry=ttu&g_ep=EgoyMDI2MDgxOS4wIKXMDSoASAFQAw%3D%3D',
  'https://www.instagram.com/azs_creator422/',
  'https://www.facebook.com/share/1PQa5yvU6z/',
  'https://www.tiktok.com/@arriyadh_studio'
)
on conflict (id) do nothing;

insert into public.homepage_content (
  id,
  hero_eyebrow,
  hero_title,
  hero_description,
  hero_image_url,
  intro_title,
  intro_description,
  experience_value,
  experience_label,
  portfolio_title,
  portfolio_description
)
values (
  1,
  'Terpercaya Sejak 2010',
  'Solusi Konveksi & Sablon Terbaik di Subang',
  'Kualitas premium untuk seragam, kaos, dan merchandise custom Anda. Pengerjaan tepat waktu dengan standar industri terpercaya.',
  '/images/home/hero-workshop-demo.jpeg',
  'Keahlian yang Berakar dari Pengalaman',
  'Arriyadh Studio telah menjadi mitra terpercaya di Subang selama lebih dari satu dekade. Kami memadukan teknik tradisional dengan teknologi modern untuk menghasilkan produk tekstil yang tidak hanya tahan lama tetapi juga representatif bagi identitas bisnis atau komunitas Anda.',
  '10+',
  'Tahun Pengalaman Industri',
  'Hasil Produksi Kami',
  'Beberapa hasil produksi yang telah kami kerjakan untuk berbagai kebutuhan pelanggan.'
)
on conflict (id) do nothing;

insert into public.about_content (
  id,
  page_title,
  page_subtitle,
  history_title,
  history_body,
  founded_year,
  strength_1_title,
  strength_1_description,
  strength_2_title,
  strength_2_description,
  strength_3_title,
  strength_3_description,
  workshop_title,
  workshop_description,
  workshop_image_url
)
values (
  1,
  'Mengenal Arriyadh Studio',
  'Jasa Konveksi & Sablon Terpercaya di Subang',
  'Dedikasi pada Kualitas',
  E'Arriyadh Studio berdiri sejak tahun 2010 dan bergerak dalam layanan konveksi, sablon, serta kebutuhan pakaian custom.\n\nSelama lebih dari satu dekade, kami berkomitmen memberikan hasil produksi yang rapi, berkualitas, tepat waktu, dan sesuai kebutuhan pelanggan.\n\nPelayanan kami mencakup kebutuhan individu, komunitas, organisasi, sekolah, perusahaan, maupun berbagai kebutuhan usaha lainnya.',
  2010,
  'Sejak 2010',
  'Berpengalaman',
  'Kustom & Permak',
  'Layanan Lengkap',
  'Transparan',
  'Pengerjaan Terbuka',
  'Kunjungi Workshop Kami',
  'Kami menyambut Anda untuk berkonsultasi langsung atau melihat proses pengerjaan di workshop kami yang berlokasi di Subang.',
  '/images/home/about/workshop-map.png'
)
on conflict (id) do nothing;

do $featured_seed_preflight$
declare
  missing_service_slugs text;
  missing_product_slugs text;
begin
  select string_agg(expected.slug, ', ' order by expected.sort_order)
  into missing_service_slugs
  from (
    values
      ('permak', 0),
      ('sablon', 1),
      ('kaos', 2),
      ('kemeja', 3),
      ('jersey', 4),
      ('lainnya', 5)
  ) as expected(slug, sort_order)
  where not exists (
    select 1
    from public.services
    where services.slug = expected.slug
  );

  select string_agg(expected.slug, ', ' order by expected.sort_order)
  into missing_product_slugs
  from (
    values
      ('kaos-polos-premium', 0),
      ('celana-kolor-santai', 1)
  ) as expected(slug, sort_order)
  where not exists (
    select 1
    from public.products
    where products.slug = expected.slug
  );

  if missing_service_slugs is not null or missing_product_slugs is not null then
    raise exception
      'Homepage featured seed cannot be safely created. Missing service slugs: %; missing product slugs: %',
      coalesce(missing_service_slugs, 'none'),
      coalesce(missing_product_slugs, 'none');
  end if;
end
$featured_seed_preflight$;

insert into public.homepage_featured_services (
  homepage_id,
  service_id,
  sort_order
)
select
  1,
  services.id,
  featured.sort_order
from (
  values
    ('permak', 0),
    ('sablon', 1),
    ('kaos', 2),
    ('kemeja', 3),
    ('jersey', 4),
    ('lainnya', 5)
) as featured(slug, sort_order)
join public.services on services.slug = featured.slug
on conflict do nothing;

insert into public.homepage_featured_products (
  homepage_id,
  product_id,
  sort_order
)
select
  1,
  products.id,
  featured.sort_order
from (
  values
    ('kaos-polos-premium', 0),
    ('celana-kolor-santai', 1)
) as featured(slug, sort_order)
join public.products on products.slug = featured.slug
on conflict do nothing;

-- Public CMS images use a dedicated public bucket. Future object paths should
-- use these folders: homepage/, about/, services/, products/, and portfolio/.
do $content_images_bucket_preflight$
declare
  existing_bucket storage.buckets%rowtype;
begin
  select *
  into existing_bucket
  from storage.buckets
  where id = 'content-images';

  if found and not coalesce(
    existing_bucket.name = 'content-images'
      and existing_bucket.public is true
      and existing_bucket.file_size_limit = 5242880
      and existing_bucket.allowed_mime_types is not null
      and cardinality(existing_bucket.allowed_mime_types) = 3
      and existing_bucket.allowed_mime_types @>
        array['image/jpeg', 'image/png', 'image/webp']::text[]
      and existing_bucket.allowed_mime_types <@
        array['image/jpeg', 'image/png', 'image/webp']::text[],
    false
  ) then
    raise exception
      'Existing content-images bucket is incompatible. Expected name=content-images, public=true, file_size_limit=5242880, and exactly image/jpeg, image/png, image/webp MIME types';
  end if;
end
$content_images_bucket_preflight$;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'content-images',
  'content-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "Public can read content images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'content-images');

create policy "Admins can upload content images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'content-images'
  and (select private.is_admin())
);

create policy "Admins can update content images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'content-images'
  and (select private.is_admin())
)
with check (
  bucket_id = 'content-images'
  and (select private.is_admin())
);

create policy "Admins can delete content images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'content-images'
  and (select private.is_admin())
);

commit;

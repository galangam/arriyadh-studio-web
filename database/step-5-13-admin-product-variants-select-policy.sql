begin;

do $preflight$
begin
  if to_regclass('public.product_variants') is null then
    raise exception 'Admin product variant policy requires the existing public.product_variants table';
  end if;

  if to_regprocedure('private.is_admin()') is null then
    raise exception 'Admin product variant policy requires the existing private.is_admin() function';
  end if;
end
$preflight$;

drop policy if exists "Admins can view all product variants"
  on public.product_variants;

create policy "Admins can view all product variants"
on public.product_variants
for select
to authenticated
using ((select private.is_admin()));

commit;

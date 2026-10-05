begin;
create table if not exists public.product_recommendations (
 product_id uuid primary key references public.products(id) on delete cascade,
 styles text[] not null default '{}' check(styles <@ array['natural','soft_glam','glam','bold_creative']::text[]),
 occasions text[] not null default '{}' check(occasions <@ array['diario','universidad_trabajo','salida','fiesta_evento','especial']::text[]),
 finishes text[] not null default '{}' check(finishes <@ array['natural','mate','luminoso','satinado','glossy']::text[]),
 role text check(role in ('preparacion','base','corrector','polvo','contorno','bronzer','blush','iluminador','cejas','sombras','delineador','mascara','labios','fijador','skincare','accesorio')),
 level text not null default 'cualquiera' check(level in ('principiante','intermedio','cualquiera')),
 recommendation_enabled boolean not null default false,
 recommendation_priority smallint not null default 0 check(recommendation_priority between 0 and 2),
 recommendation_reviewed boolean not null default false
);
alter table public.product_recommendations enable row level security;
revoke all on public.product_recommendations from anon,authenticated;
grant select on public.product_recommendations to anon,authenticated;
grant insert,update,delete on public.product_recommendations to authenticated;
drop policy if exists "style_public_read" on public.product_recommendations;
create policy "style_public_read" on public.product_recommendations for select to anon,authenticated using(true);
drop policy if exists "style_admin_insert" on public.product_recommendations;
create policy "style_admin_insert" on public.product_recommendations for insert to authenticated with check ((select auth.jwt()->'app_metadata'->>'role')='admin');
drop policy if exists "style_admin_update" on public.product_recommendations;
create policy "style_admin_update" on public.product_recommendations for update to authenticated using ((select auth.jwt()->'app_metadata'->>'role')='admin') with check ((select auth.jwt()->'app_metadata'->>'role')='admin');
drop policy if exists "style_admin_delete" on public.product_recommendations;
create policy "style_admin_delete" on public.product_recommendations for delete to authenticated using ((select auth.jwt()->'app_metadata'->>'role')='admin');
-- Strict category mapping. Ambiguous multi-use, hair, fragrance and body products remain unclassified.
with source as (
 select id,translate(lower(trim(category)),'áéíóúñ','aeioun') category,translate(lower(coalesce(description,'')),'áéíóúñ','aeioun') description from public.products
), classified as (
 select *,case
 when category ~ '^(rubor|colorete)' then 'blush'
 when category in ('labios','labiales') then 'labios'
 when category ~ '^base' then 'base'
 when category ~ '^corrector' then 'corrector'
 when category ~ '^polvo' then 'polvo'
 when category = 'cejas' then 'cejas'
 when category ~ '^mascara.*pestanas' then 'mascara'
 when category ~ '^(paletas? de sombra|sombras$)' then 'sombras'
 when category ~ '^delineador' then 'delineador'
 when category = 'primer' then 'preparacion'
 when category in ('skincare','cuidado facial') then 'skincare'
 when category ~ '^iluminador' then 'iluminador'
 when category ~ '^contorno' then 'contorno'
 when category ~ '^bronzer' then 'bronzer'
 when category ~ '^fijador' then 'fijador'
 when category ~ '^(accesorio|brochas$)' then 'accesorio'
 else null end inferred_role from source
)
insert into public.product_recommendations(product_id,role,finishes,recommendation_enabled)
select id,inferred_role,array_remove(array[
 case when description ~ 'acabado (de |tipo )?mate' then 'mate' end,
 case when description ~ 'acabado (de |tipo )?natural' then 'natural' end,
 case when description ~ 'acabado (de |tipo )?luminoso' then 'luminoso' end,
 case when description ~ 'acabado (de |tipo )?satinado' then 'satinado' end,
 case when description ~ 'acabado (de |tipo )?(alto brillo|brillante|glossy)' then 'glossy' end
],null),inferred_role is not null from classified
on conflict(product_id) do nothing;
commit;

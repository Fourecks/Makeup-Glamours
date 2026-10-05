-- Run using the SQL editor or execute_sql. Every mutation is rolled back.
begin;
set local role anon;
do $$ begin
 if not exists(select 1 from public.product_recommendations) then raise exception 'Public read failed';end if;
 if has_table_privilege('anon','public.product_recommendations','INSERT') or has_table_privilege('anon','public.product_recommendations','UPDATE') or has_table_privilege('anon','public.product_recommendations','DELETE') then raise exception 'Anonymous write privilege exists';end if;
end $$;
reset role;
select set_config('request.jwt.claims','{"role":"authenticated","sub":"00000000-0000-0000-0000-000000000001","app_metadata":{},"user_metadata":{"role":"admin"}}',true);
set local role authenticated;
do $$ declare affected integer;begin
 update public.product_recommendations set recommendation_priority=2;
 get diagnostics affected=row_count;
 if affected<>0 then raise exception 'Non-admin update allowed';end if;
 begin
 insert into public.product_recommendations(product_id) values((select id from public.products limit 1));
 raise exception 'Non-admin insert allowed';
 exception when insufficient_privilege then null;
 end;
 delete from public.product_recommendations;
 get diagnostics affected=row_count;
 if affected<>0 then raise exception 'Non-admin delete allowed';end if;
end $$;
reset role;
select set_config('request.jwt.claims','{"role":"authenticated","sub":"00000000-0000-0000-0000-000000000001","app_metadata":{"role":"admin"}}',true);
set local role authenticated;
do $$ declare affected integer; expected integer;begin
 select count(*) into expected from public.product_recommendations;
 update public.product_recommendations set recommendation_priority=2;
 get diagnostics affected=row_count;
 if affected<>expected then raise exception 'Admin update failed: %',affected;end if;
 delete from public.product_recommendations where product_id=(select id from public.products limit 1);
 get diagnostics affected=row_count;if affected<>1 then raise exception 'Admin delete failed';end if;
 insert into public.product_recommendations(product_id) values((select p.id from public.products p where not exists(select 1 from public.product_recommendations m where m.product_id=p.id) limit 1));
end $$;
reset role;
rollback;
select 'PASS: public read, anonymous writes denied, non-admin writes denied including forged user_metadata, admin CRUD allowed. All changes rolled back.' as result;

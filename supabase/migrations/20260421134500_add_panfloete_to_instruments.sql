-- Add panfloete to instruments (idempotent, UTF-8 safe)
insert into public.instruments (name)
select 'panfl' || chr(246) || 'te'
where not exists (
  select 1
  from public.instruments
  where name = 'panfl' || chr(246) || 'te'
);
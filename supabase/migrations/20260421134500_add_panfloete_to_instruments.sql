-- Add panflöte to instruments (idempotent)
insert into public.instruments (name)
select 'panflöte'
where not exists (
  select 1
  from public.instruments
  where name = 'panflöte'
);

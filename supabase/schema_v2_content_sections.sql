-- =====================================================================
-- Reputación / Experiencia del Cliente / Competencia — nuevas tablas
-- =====================================================================
-- Corre esto UNA VEZ en Supabase: SQL Editor > New query > pega todo >
-- Run (elige "Run and enable RLS" si te sale el aviso).
-- =====================================================================

create table if not exists public.reputation_details (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null unique references public.reports(id) on delete cascade,
  avg_rating numeric not null,
  avg_rating_previous numeric not null,
  total_reviews integer not null,
  total_reviews_previous integer not null,
  positive_count integer not null default 0,
  neutral_count integer not null default 0,
  negative_count integer not null default 0,
  response_rate_percent integer not null default 0,
  unresponded_negative integer not null default 0
);

create table if not exists public.experience_details (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null unique references public.reports(id) on delete cascade,
  avg_response_time_label text not null,
  avg_response_time_previous_label text not null,
  satisfaction_score integer not null,
  satisfaction_previous integer not null,
  total_interactions integer not null,
  total_interactions_previous integer not null
);

create table if not exists public.competitors (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  name text not null,
  rating numeric not null,
  review_count integer not null,
  notes text,
  is_you boolean not null default false,
  sort_order integer not null default 0
);

create index if not exists competitors_report_id_idx on public.competitors(report_id);

alter table public.reputation_details enable row level security;
alter table public.experience_details enable row level security;
alter table public.competitors enable row level security;

create policy "reputation_details_select_own"
  on public.reputation_details for select
  using (
    report_id in (
      select r.id from public.reports r
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

create policy "experience_details_select_own"
  on public.experience_details for select
  using (
    report_id in (
      select r.id from public.reports r
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

create policy "competitors_select_own"
  on public.competitors for select
  using (
    report_id in (
      select r.id from public.reports r
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

-- =====================================================================
-- DATOS DE EJEMPLO — Café Central Marietta (VIS-250517)
-- Reemplázalos por los datos reales de cada cliente cuando los tengas.
-- =====================================================================

insert into public.reputation_details (
  report_id, avg_rating, avg_rating_previous, total_reviews, total_reviews_previous,
  positive_count, neutral_count, negative_count, response_rate_percent, unresponded_negative
)
select r.id, 4.1, 3.7, 238, 189, 178, 41, 19, 42, 8
from public.reports r
join public.clients c on c.id = r.client_id
where c.client_code = 'VIS-250517'
on conflict (report_id) do nothing;

insert into public.experience_details (
  report_id, avg_response_time_label, avg_response_time_previous_label,
  satisfaction_score, satisfaction_previous, total_interactions, total_interactions_previous
)
select r.id, '3.2 horas', '5.8 horas', 81, 74, 2103, 1650
from public.reports r
join public.clients c on c.id = r.client_id
where c.client_code = 'VIS-250517'
on conflict (report_id) do nothing;

insert into public.competitors (report_id, name, rating, review_count, notes, is_you, sort_order)
select r.id, 'Café Central Marietta', 4.1, 238, null, true, 1
from public.reports r join public.clients c on c.id = r.client_id
where c.client_code = 'VIS-250517'
union all
select r.id, 'Marietta Coffee House', 4.4, 312, 'Mejor calificado en la zona', false, 2
from public.reports r join public.clients c on c.id = r.client_id
where c.client_code = 'VIS-250517'
union all
select r.id, 'The Daily Grind', 3.8, 156, null, false, 3
from public.reports r join public.clients c on c.id = r.client_id
where c.client_code = 'VIS-250517';

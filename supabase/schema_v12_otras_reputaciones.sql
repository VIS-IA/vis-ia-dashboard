-- =====================================================================
-- OTRAS REPUTACIONES (Booking, TripAdvisor, Yelp, etc.)
-- Google sigue siendo la reputación principal — esto es un módulo
-- complementario, distinto según el tipo de negocio.
-- =====================================================================
-- Corre esto UNA VEZ en Supabase: SQL Editor > New query > pega todo >
-- Run.
-- =====================================================================

create table if not exists public.other_reputations (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  platform text not null,
  rating numeric not null,
  scale integer not null default 5 check (scale in (5, 10)),
  review_count integer,
  sort_order integer not null default 0
);

create index if not exists other_reputations_report_id_idx on public.other_reputations(report_id);

alter table public.other_reputations enable row level security;

create policy "other_reputations_select_own"
  on public.other_reputations for select
  using (
    report_id in (
      select r.id from public.reports r
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- Days Inn: su calificación real en Booking.com, mencionada en el
-- informe original (7.4/10, en contraste con Super 8 en 7.2/10)
-- ---------------------------------------------------------------------
insert into public.other_reputations (report_id, platform, rating, scale, sort_order)
select r.id, 'Booking.com', 7.4, 10, 1
from public.reports r
join public.clients c on c.id = r.client_id
where c.client_code = 'VIS-DIW-260830';

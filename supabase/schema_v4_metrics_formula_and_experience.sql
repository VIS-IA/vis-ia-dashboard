-- =====================================================================
-- FÓRMULA DE MÉTRICAS + EXPERIENCIA POR TIPO DE NEGOCIO
-- =====================================================================
-- Corre esto UNA VEZ en Supabase: SQL Editor > New query > pega todo >
-- Run (elige "Run and enable RLS" si sale el aviso).
--
-- IMPORTANTE: esto reemplaza la tabla "metrics" y "experience_details"
-- anteriores por un sistema nuevo. Si ya cargaste datos ahí, se
-- pierden — hay que recargarlos con el formato nuevo (más abajo están
-- los datos de Café Central otra vez).
-- =====================================================================

drop table if exists public.metrics cascade;
drop table if exists public.experience_details cascade;

-- ---------------------------------------------------------------------
-- 1. Tipo de negocio del cliente (para saber qué datos de experiencia
--    del cliente le corresponden: negocio normal vs hotel)
-- ---------------------------------------------------------------------
alter table public.clients
  add column if not exists business_type text not null default 'negocio'
  check (business_type in ('negocio', 'hotel'));

-- ---------------------------------------------------------------------
-- 2. LA FÓRMULA: catálogo de métricas (se define UNA vez) +
--    valores mensuales (esto es lo único que se llena cada mes)
-- ---------------------------------------------------------------------
create table if not exists public.metric_definitions (
  metric_key text primary key,
  label text not null,
  icon_key text not null,
  unit text,                    -- ej. '/100', o vacío para conteos
  is_rating boolean not null default false,  -- true = usa estrellas y 1 decimal
  delta_style text not null check (delta_style in ('percent', 'points')),
  accent text not null check (accent in ('blue', 'green', 'purple')),
  sort_order integer not null default 0
);

create table if not exists public.metric_values (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  metric_key text not null references public.metric_definitions(metric_key),
  value_numeric numeric not null,
  unique (report_id, metric_key)
);

create index if not exists metric_values_report_id_idx on public.metric_values(report_id);

alter table public.metric_definitions enable row level security;
alter table public.metric_values enable row level security;

-- El catálogo de métricas no tiene datos privados de nadie — es solo
-- la lista de nombres/íconos — así que cualquier usuario con sesión
-- puede leerlo.
create policy "metric_definitions_select_all"
  on public.metric_definitions for select
  to authenticated
  using (true);

create policy "metric_values_select_own"
  on public.metric_values for select
  using (
    report_id in (
      select r.id from public.reports r
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

-- Las 5 métricas estándar del panel (una sola vez, para todos los clientes)
insert into public.metric_definitions (metric_key, label, icon_key, unit, is_rating, delta_style, accent, sort_order)
values
  ('vis_score', 'VIS Score', 'trending-up', '/100', false, 'points', 'blue', 1),
  ('google_rating', 'Reputación (Google)', 'star', null, true, 'points', 'green', 2),
  ('total_reviews', 'Reseñas Totales', 'message-square', null, false, 'percent', 'blue', 3),
  ('google_traffic', 'Tráfico Perfil Google', 'users', null, false, 'percent', 'purple', 4),
  ('interactions', 'Interacciones', 'trending-up', null, false, 'percent', 'purple', 5)
on conflict (metric_key) do nothing;

-- ---------------------------------------------------------------------
-- 3. Experiencia del Cliente — dos tablas separadas según el tipo de
--    negocio, porque los datos disponibles son distintos
-- ---------------------------------------------------------------------

-- Negocios normales: basado en menciones de servicio dentro de reseñas
create table if not exists public.experience_negocio (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null unique references public.reports(id) on delete cascade,
  sentiment_score integer not null,       -- 0-100, qué tan positivo es lo que dicen del servicio
  positive_mentions integer not null default 0,
  negative_mentions integer not null default 0,
  top_theme text                          -- ej. "atención al cliente", "tiempo de espera"
);

-- Hoteles: subcalificaciones reales de Booking / Expedia / TripAdvisor (escala 0-10)
create table if not exists public.experience_hotel (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null unique references public.reports(id) on delete cascade,
  cleanliness numeric not null,
  staff numeric not null,
  comfort numeric not null,
  location numeric not null,
  value_for_money numeric not null
);

alter table public.experience_negocio enable row level security;
alter table public.experience_hotel enable row level security;

create policy "experience_negocio_select_own"
  on public.experience_negocio for select
  using (
    report_id in (
      select r.id from public.reports r
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

create policy "experience_hotel_select_own"
  on public.experience_hotel for select
  using (
    report_id in (
      select r.id from public.reports r
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

-- =====================================================================
-- DATOS DE EJEMPLO — Café Central Marietta (VIS-250517)
-- Café Central es un negocio normal (business_type = 'negocio', que
-- ya es el valor por defecto).
--
-- OJO: estos números de experiencia (sentiment_score, menciones, tema)
-- son EJEMPLO/PLACEHOLDER para que veas cómo se ve la sección — no son
-- datos reales analizados de las reseñas de Café Central. Reemplázalos
-- cuando tengas el análisis real de reseñas de ese negocio.
-- =====================================================================

-- Métricas del mes (esto es lo único que se repite cada mes por cliente)
insert into public.metric_values (report_id, metric_key, value_numeric)
select r.id, v.metric_key, v.value_numeric
from public.reports r
join public.clients c on c.id = r.client_id
cross join (values
  ('vis_score', 72),
  ('google_rating', 4.1),
  ('total_reviews', 238),
  ('google_traffic', 1246),
  ('interactions', 2103)
) as v(metric_key, value_numeric)
where c.client_code = 'VIS-250517'
on conflict (report_id, metric_key) do nothing;

insert into public.experience_negocio (report_id, sentiment_score, positive_mentions, negative_mentions, top_theme)
select r.id, 78, 61, 12, 'atención al cliente'
from public.reports r
join public.clients c on c.id = r.client_id
where c.client_code = 'VIS-250517'
on conflict (report_id) do nothing;

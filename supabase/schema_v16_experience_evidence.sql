-- =====================================================================
-- EXPERIENCIA DEL CLIENTE — arquitectura basada en evidencia
-- =====================================================================
-- Corre esto UNA VEZ en Supabase: SQL Editor > New query > pega todo >
-- Run.
--
-- Reemplaza el diseño rígido anterior (experience_negocio /
-- experience_hotel, con columnas fijas) por una tabla flexible que
-- distingue el ORIGEN de cada señal: reseñas analizadas vs.
-- puntuaciones publicadas por una plataforma. Queda preparada para
-- que estos datos lleguen algún día de investigación automática, sin
-- tener que rediseñar el panel de nuevo.
--
-- Los datos existentes de Café Central se migran (no se pierden).
-- Los datos del Days Inn aún no existían en esta sección, así que no
-- hay nada que migrar para ese cliente.
-- =====================================================================

create table if not exists public.experience_evidence (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  category text not null,                 -- ej. "Limpieza", "Servicio", "Check-in"
  source text not null,                   -- ej. "Google Reviews", "Booking.com"
  source_type text not null check (source_type in ('reviews_text', 'platform_score')),
  reviews_analyzed integer,               -- solo para source_type = 'reviews_text'
  positive_mentions integer,
  negative_mentions integer,
  platform_score numeric,                 -- solo para source_type = 'platform_score'
  platform_score_scale integer,           -- 5 o 10, según la plataforma
  evidence text,                          -- cita o resumen de lo encontrado
  pattern text,                           -- patrón detectado
  confidence text check (confidence in ('Confirmado', 'Medido', 'Estimado', 'Potencial', 'No calculable')),
  analyzed_at timestamptz,
  sort_order integer not null default 0
);

create index if not exists experience_evidence_report_id_idx on public.experience_evidence(report_id);

alter table public.experience_evidence enable row level security;

create policy "experience_evidence_select_own"
  on public.experience_evidence for select
  using (
    report_id in (
      select r.id from public.reports r
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- Migración: Café Central Marietta (conservamos sus datos existentes)
-- Su fila anterior en experience_negocio era:
--   sentiment_score = 78, positive_mentions = 61, negative_mentions = 12,
--   top_theme = 'atención al cliente'
-- ---------------------------------------------------------------------
insert into public.experience_evidence (
  report_id, category, source, source_type,
  positive_mentions, negative_mentions, pattern, confidence
)
select r.id, 'Atención al cliente', 'Google Reviews', 'reviews_text',
  61, 12, 'atención al cliente', 'Estimado'
from public.reports r
join public.clients c on c.id = r.client_id
where c.client_code = 'VIS-CAF-250517'
  and not exists (
    select 1 from public.experience_evidence e where e.report_id = r.id
  );

-- Las tablas anteriores (experience_negocio, experience_hotel) se
-- dejan intactas, sin borrar, por si algo más las referencia — pero
-- el panel ya no las usa a partir de ahora.

-- =====================================================================
-- EVIDENCIA VISUAL — solo referencia a la fuente original, nunca se
-- descarga ni se guarda la imagen/video en sí
-- =====================================================================
-- Corre esto UNA VEZ en Supabase: SQL Editor > New query > pega todo >
-- Run.
-- =====================================================================

create table if not exists public.visual_evidence (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  evidence_type text not null check (evidence_type in ('photo', 'video')),
  source text not null,                 -- ej. "Google Maps", "Booking.com"
  source_url text not null,             -- URL original — el cliente la ve ahí, no en VIS IA
  title text not null,                  -- descripción breve del hallazgo
  impact text not null check (impact in ('low', 'medium', 'high', 'critical')),
  category text not null,               -- ej. "limpieza", "mantenimiento", "conflicto"
  analysis text not null,               -- por qué esta evidencia es relevante
  verified boolean not null default false,
  requires_human_review boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists visual_evidence_report_id_idx on public.visual_evidence(report_id);

alter table public.visual_evidence enable row level security;

create policy "visual_evidence_select_own"
  on public.visual_evidence for select
  using (
    report_id in (
      select r.id from public.reports r
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

-- Ningún dato de ejemplo cargado todavía — cuando tengas la URL real
-- de Google Maps del Days Inn, la insertamos con un INSERT como este:
--
-- insert into public.visual_evidence (
--   report_id, evidence_type, source, source_url, title, impact,
--   category, analysis, verified, requires_human_review
-- )
-- select r.id, 'photo', 'Google Maps', 'PEGA-AQUI-LA-URL-REAL',
--   'Título breve del hallazgo', 'high', 'limpieza',
--   'Explicación de por qué esta evidencia es relevante.',
--   false, true
-- from public.reports r
-- join public.clients c on c.id = r.client_id
-- where c.client_code = 'VIS-DIW-260830';

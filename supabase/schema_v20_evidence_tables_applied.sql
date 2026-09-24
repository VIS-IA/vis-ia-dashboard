-- =====================================================================
-- REGISTRO: v16 y v18 finalmente aplicadas (24 sept 2026)
-- =====================================================================
-- BUG ENCONTRADO: schema_v16_experience_evidence.sql y
-- schema_v18_vis_evidence_record.sql quedaron escritos en el repo pero
-- NUNCA se corrieron en la base de datos real. lib/queries.ts ya
-- asumía que existían (getExperienceDetail() y getEvidenceRecords()),
-- pero como las tablas no existían, Postgres devolvía un error en
-- cada consulta — silenciado por el try/catch de esas funciones, que
-- devolvían null/[] en vez de mostrar el error. Resultado: la sección
-- "Experiencia del Cliente" y el bloque "VIS Evidence" de la página
-- "Evidencia Visual" aparecían vacíos para TODOS los clientes, sin
-- ningún mensaje de error — parecía que sencillamente no había datos.
--
-- Esto se aplicó directamente en Supabase (proyecto CLIENTES) el 24
-- de septiembre de 2026, durante una revisión completa del panel de
-- Days Inn antes de las presentaciones con gerentes de hoteles. Este
-- archivo es el registro fiel de lo que se corrió — no hace falta
-- volver a correrlo (create table ... if not exists es seguro si
-- alguna vez se necesita reconstruir el esquema desde cero).
-- =====================================================================

create table if not exists public.experience_evidence (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  category text not null,
  source text not null,
  source_type text not null check (source_type in ('reviews_text', 'platform_score')),
  reviews_analyzed integer,
  positive_mentions integer,
  negative_mentions integer,
  platform_score numeric,
  platform_score_scale numeric,
  evidence text,
  pattern text,
  confidence text,
  analyzed_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.experience_evidence enable row level security;

create policy experience_evidence_admin_all on public.experience_evidence
  for all using (is_admin()) with check (is_admin());

create policy experience_evidence_select_own on public.experience_evidence
  for select using (
    report_id in (
      select r.id from public.reports r
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

create table if not exists public.evidence_records (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  source text not null,
  source_url text not null,
  author text,
  review_date_label text,
  rating numeric,
  review_text text not null,
  owner_response text,
  owner_response_date_label text,
  resolution_demonstrated text not null check (resolution_demonstrated in ('yes', 'not_evident', 'unknown')),
  temporal_status text not null check (temporal_status in ('historical', 'current')),
  public_persistence boolean not null default false,
  analysis text not null,
  confidence text,
  requires_human_review boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.evidence_records enable row level security;

create policy evidence_records_admin_all on public.evidence_records
  for all using (is_admin()) with check (is_admin());

create policy evidence_records_select_own on public.evidence_records
  for select using (
    report_id in (
      select r.id from public.reports r
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

create table if not exists public.evidence_record_issues (
  id uuid primary key default gen_random_uuid(),
  evidence_record_id uuid not null references public.evidence_records(id) on delete cascade,
  category text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical'))
);

alter table public.evidence_record_issues enable row level security;

create policy evidence_record_issues_admin_all on public.evidence_record_issues
  for all using (is_admin()) with check (is_admin());

create policy evidence_record_issues_select_own on public.evidence_record_issues
  for select using (
    evidence_record_id in (
      select er.id from public.evidence_records er
      join public.reports r on r.id = er.report_id
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

create table if not exists public.evidence_record_photos (
  id uuid primary key default gen_random_uuid(),
  evidence_record_id uuid not null references public.evidence_records(id) on delete cascade,
  evidence_type text not null check (evidence_type in ('photo', 'video')),
  source_url text not null,
  description text not null,
  category text not null,
  impact text not null check (impact in ('low', 'medium', 'high', 'critical')),
  analysis text not null,
  sort_order integer not null default 0
);

alter table public.evidence_record_photos enable row level security;

create policy evidence_record_photos_admin_all on public.evidence_record_photos
  for all using (is_admin()) with check (is_admin());

create policy evidence_record_photos_select_own on public.evidence_record_photos
  for select using (
    evidence_record_id in (
      select er.id from public.evidence_records er
      join public.reports r on r.id = er.report_id
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

-- NOTA: a diferencia de v16/v18 originales, aquí se agregó una
-- política "_admin_all" en cada tabla (using is_admin()), igual al
-- patrón que ya usan reputation_details, competitors y visual_evidence
-- — así el admin también puede escribir estas tablas por RLS, no solo
-- por vía service role.

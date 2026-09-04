-- =====================================================================
-- VIS EVIDENCE RECORD — registro de evidencia completo y trazable
-- (reseña + respuesta del propietario + fotos + clasificación temporal)
-- =====================================================================
-- Corre esto UNA VEZ en Supabase: SQL Editor > New query > pega todo >
-- Run.
-- =====================================================================

create table if not exists public.evidence_records (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  source text not null,                    -- ej. "Google Maps"
  source_url text not null,
  author text,
  review_date_label text,                  -- ej. "Hace ~3 años" (fecha exacta no siempre disponible)
  rating numeric,
  review_text text not null,
  owner_response text,
  owner_response_date_label text,
  resolution_demonstrated text not null default 'unknown'
    check (resolution_demonstrated in ('yes', 'not_evident', 'unknown')),
  temporal_status text not null default 'historical'
    check (temporal_status in ('historical', 'current')),
  public_persistence boolean not null default true,
  analysis text not null,
  confidence text check (confidence in ('Confirmado', 'Medido', 'Estimado', 'Potencial', 'No calculable')),
  requires_human_review boolean not null default true,
  sort_order integer not null default 0
);

create table if not exists public.evidence_record_issues (
  id uuid primary key default gen_random_uuid(),
  evidence_record_id uuid not null references public.evidence_records(id) on delete cascade,
  category text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical'))
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

create index if not exists evidence_records_report_id_idx on public.evidence_records(report_id);
create index if not exists evidence_record_issues_record_id_idx on public.evidence_record_issues(evidence_record_id);
create index if not exists evidence_record_photos_record_id_idx on public.evidence_record_photos(evidence_record_id);

alter table public.evidence_records enable row level security;
alter table public.evidence_record_issues enable row level security;
alter table public.evidence_record_photos enable row level security;

create policy "evidence_records_select_own"
  on public.evidence_records for select
  using (
    report_id in (
      select r.id from public.reports r
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

create policy "evidence_record_issues_select_own"
  on public.evidence_record_issues for select
  using (
    evidence_record_id in (
      select er.id from public.evidence_records er
      join public.reports r on r.id = er.report_id
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

create policy "evidence_record_photos_select_own"
  on public.evidence_record_photos for select
  using (
    evidence_record_id in (
      select er.id from public.evidence_records er
      join public.reports r on r.id = er.report_id
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

-- =====================================================================
-- PRIMER CASO REAL: reseña de Dawn Yarch — Days Inn (VIS-DIW-260830)
-- =====================================================================
with new_record as (
  insert into public.evidence_records (
    report_id, source, source_url, author, review_date_label, rating,
    review_text, owner_response, owner_response_date_label,
    resolution_demonstrated, temporal_status, public_persistence,
    analysis, confidence, requires_human_review
  )
  select
    r.id,
    'Google Maps',
    'https://www.google.com/maps/place/Days+Inn+by+Wyndham+Marietta+White+Water',
    'Dawn Yarch',
    'Hace aproximadamente 3 años',
    1,
    'No sé a quién le pagan por las reseñas, pero esta habitación era asquerosa. Como viajera cansada, revisé las reseñas antes de reservar. Era la más cercana y la que tenía mejores reseñas. Las puertas de las habitaciones de arriba parecían haber sido pateadas varias veces, a juzgar por la pintura. La habitación estaba sucia. Vean las fotos. Quería cambiar de habitación para ver si tal vez era solo la habitación, pero mi esposo estaba agotado. La lámpara estaba rota. Las paredes son delgadas. Los vecinos dejaron la televisión encendida toda la noche. Había insectos muertos en varios lugares. Alguien había dejado uñas postizas detrás de la cama. El tope de la puerta se desprendió en nuestra mano y tuvimos que volver a colocarlo para que mi hijo pequeño no se lastimara. La cama estaba limpia, aunque el faldón tenía una mancha desconocida. Las sábanas estaban limpias y no vi señales de chinches. Así que, si están agotados y de viaje, sigan conduciendo y busquen algo mejor.',
    'Gracias por tomarse el tiempo para contarnos sobre su experiencia en Days Inn by Wyndham Marietta White Water.',
    'Hace aproximadamente 3 años',
    'not_evident',
    'historical',
    true,
    'Esta evidencia documenta una experiencia altamente negativa ocurrida aproximadamente hace tres años y está acompañada de material visual. La antigüedad impide concluir que las condiciones descritas continúen actualmente. Sin embargo, el contenido negativo permanece públicamente accesible y constituye una exposición reputacional persistente. La respuesta del propietario confirma que hubo respuesta pública, pero no demuestra por sí misma que las condiciones hayan sido corregidas.',
    'Estimado',
    true
  from public.reports r
  join public.clients c on c.id = r.client_id
  where c.client_code = 'VIS-DIW-260830'
  returning id
)
insert into public.evidence_record_issues (evidence_record_id, category, severity)
select id, category, severity::text
from new_record, (values
  ('Limpieza', 'critical'),
  ('Mantenimiento', 'critical'),
  ('Habitación', 'critical'),
  ('Servicio', 'critical'),
  ('Ruido', 'high')
) as t(category, severity);

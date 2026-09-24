-- =====================================================================
-- REDES SOCIALES — presencia propia del negocio en Instagram/Facebook
-- (Pro + Intelligence) — aplicado en Supabase el 24 sept 2026
-- =====================================================================
-- Fase 2 de "Presencia Web y Redes" (fase 1 fue schema_v21). Distinto
-- de Reputación (reseñas de terceros): esto es la actividad propia del
-- negocio en sus cuentas — o la ausencia de ellas, que también es un
-- hallazgo válido y accionable.
-- =====================================================================

create table if not exists public.social_media_analysis (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null unique references public.reports(id) on delete cascade,
  overall_assessment text not null,
  created_at timestamptz not null default now()
);

alter table public.social_media_analysis enable row level security;

create policy social_media_analysis_admin_all on public.social_media_analysis
  for all using (is_admin()) with check (is_admin());

create policy social_media_analysis_select_own on public.social_media_analysis
  for select using (
    report_id in (
      select r.id from public.reports r
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

create table if not exists public.social_profiles (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  platform text not null,
  handle text,
  profile_url text,
  followers integer,
  last_post_label text,
  posting_frequency_label text,
  responds_to_comments boolean,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.social_profiles enable row level security;

create policy social_profiles_admin_all on public.social_profiles
  for all using (is_admin()) with check (is_admin());

create policy social_profiles_select_own on public.social_profiles
  for select using (
    report_id in (
      select r.id from public.reports r
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

create table if not exists public.social_findings (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  titulo text not null,
  descripcion text not null,
  impacto text not null check (impacto in ('Alto', 'Media', 'Baja')),
  categoria text not null,
  evidencia text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.social_findings enable row level security;

create policy social_findings_admin_all on public.social_findings
  for all using (is_admin()) with check (is_admin());

create policy social_findings_select_own on public.social_findings
  for select using (
    report_id in (
      select r.id from public.reports r
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- Datos de demostración — Days Inn by Wyndham Marietta White Water
-- (cliente de demo, reporte más reciente).
--
-- Esto NO es un dato inventado: se buscó en Instagram/Facebook por el
-- nombre y dirección exactos del hotel y no se encontró ninguna cuenta
-- propia (solo las genéricas de marca Wyndham/Days Inn) — por eso no
-- se inserta ninguna fila en social_profiles para este cliente. Solo
-- el texto de evaluación general y los 2 hallazgos son redacción de
-- presentación sobre ese hecho real.
-- ---------------------------------------------------------------------
insert into public.social_media_analysis (report_id, overall_assessment)
values (
  '4265d1bb-8698-4b72-8bfa-39536243cdb4',
  'No se encontró ninguna cuenta de Instagram o Facebook administrada específicamente por este hotel — solo existen las cuentas genéricas de la marca Days Inn/Wyndham, que no hablan de este negocio en particular. Esto es una oportunidad real: varios competidores directos en la zona sí tienen presencia propia en redes, lo que les da un canal directo para mostrar mejoras (como las renovaciones recientes) sin depender solo de reseñas de terceros.'
);

insert into public.social_findings (report_id, titulo, descripcion, impacto, categoria, evidencia, sort_order)
values
('4265d1bb-8698-4b72-8bfa-39536243cdb4','Sin presencia propia en redes sociales','No existe una cuenta de Instagram o Facebook específica de este hotel — únicamente aparecen los perfiles corporativos genéricos de Wyndham/Days Inn, que no muestran contenido de esta propiedad.','Alto','Presencia','Búsqueda directa en Instagram y Facebook por el nombre del hotel y su dirección — no se encontró ninguna cuenta propia.',1),
('4265d1bb-8698-4b72-8bfa-39536243cdb4','Sin canal directo para mostrar mejoras recientes','Las mejoras que huéspedes mencionan en reseñas recientes (personal, áreas comunes) no se pueden comunicar proactivamente sin un canal propio en redes — hoy depende 100% de que alguien más las mencione en una reseña.','Media','Oportunidad de marketing',null,2);

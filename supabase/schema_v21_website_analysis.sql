-- =====================================================================
-- PRESENCIA WEB — análisis de la página web propia del negocio
-- (Pro + Intelligence) — aplicado en Supabase el 24 sept 2026
-- =====================================================================
-- Pedido explícito del cliente: "no existe un tema de todas las
-- informaciones que encontramos del cliente en la web... las páginas
-- web y las redes salen muchas informaciones". Primera fase: solo
-- análisis de la página web propia del negocio (no redes sociales
-- todavía — eso queda para una fase futura si se decide agregarlo).
--
-- Distinto de Reputación (reseñas de terceros en Google/Booking) y de
-- Experiencia del Cliente (señales agregadas por categoría): esto es
-- lo que el propio negocio publica en su sitio y qué tan bien lo está
-- aprovechando (contenido actualizado, consistencia con Google,
-- reservas directas, adaptación a celular).
-- =====================================================================

create table if not exists public.website_analysis (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null unique references public.reports(id) on delete cascade,
  has_website boolean not null default true,
  website_url text,
  last_content_update_label text,
  mobile_friendly boolean,
  contact_info_consistent boolean,
  has_online_booking boolean,
  overall_assessment text not null,
  created_at timestamptz not null default now()
);

alter table public.website_analysis enable row level security;

create policy website_analysis_admin_all on public.website_analysis
  for all using (is_admin()) with check (is_admin());

create policy website_analysis_select_own on public.website_analysis
  for select using (
    report_id in (
      select r.id from public.reports r
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

create table if not exists public.website_findings (
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

alter table public.website_findings enable row level security;

create policy website_findings_admin_all on public.website_findings
  for all using (is_admin()) with check (is_admin());

create policy website_findings_select_own on public.website_findings
  for select using (
    report_id in (
      select r.id from public.reports r
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- Datos de demostración — Days Inn by Wyndham Marietta White Water
-- (cliente de demo, reporte más reciente). El website_url es real y
-- verificado (búsqueda web), el resto son hallazgos de ejemplo para
-- presentación, igual que el resto de datos de este cliente de demo.
-- ---------------------------------------------------------------------
insert into public.website_analysis (report_id, has_website, website_url, last_content_update_label, mobile_friendly, contact_info_consistent, has_online_booking, overall_assessment)
values (
  '4265d1bb-8698-4b72-8bfa-39536243cdb4',
  true,
  'https://www.wyndhamhotels.com/days-inn/marietta-georgia/days-inn-marietta-whitewater/overview',
  'Hace más de 2 años — las fotos y la descripción no reflejan las renovaciones mencionadas en reseñas recientes de 2026',
  true,
  false,
  false,
  'La página web usa la plantilla estándar de Wyndham (funcional y adaptada a celular), pero el contenido específico del hotel está desactualizado y no coincide con lo que dice Google Business Profile en horario y algunas fotos. No hay forma de reservar directamente sin pasar por el buscador general de Wyndham, lo que empuja a los huéspedes hacia plataformas de terceros (Booking, Expedia) en vez de una reserva directa.'
);

insert into public.website_findings (report_id, titulo, descripcion, impacto, categoria, evidencia, sort_order)
values
('4265d1bb-8698-4b72-8bfa-39536243cdb4','El horario publicado no coincide con Google','La página web no muestra un horario de recepción claro, mientras que Google Business Profile indica recepción 24 horas — esta inconsistencia puede generar confusión en huéspedes que llegan tarde.','Media','Información de contacto','Comparación directa entre la sección de contacto del sitio y la ficha de Google Business Profile del negocio.',1),
('4265d1bb-8698-4b72-8bfa-39536243cdb4','Sin botón de reserva directa propio','Todo el flujo de reserva redirige al buscador general de Wyndham — no hay una reserva directa simplificada para este hotel específico, lo que reduce el control sobre el precio final que ve el huésped frente a las OTAs (Booking, Expedia).','Alto','Reservas online','Revisión del flujo de "Reservar ahora" desde la página del hotel.',2),
('4265d1bb-8698-4b72-8bfa-39536243cdb4','Fotos del sitio no reflejan mejoras recientes','Las fotos publicadas en la página web parecen anteriores a las renovaciones que huéspedes mencionan en reseñas de 2026 (ej. personal, áreas comunes) — esto genera una primera impresión más débil de la que el hotel podría dar.','Media','Contenido desactualizado','Comparación entre las fotos del sitio y las fotos más recientes subidas por huéspedes en Google Maps.',3);

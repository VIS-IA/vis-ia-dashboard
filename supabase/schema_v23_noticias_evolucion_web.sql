-- =====================================================================
-- NOTICIAS Y MENCIONES + EVOLUCIÓN DEL SITIO WEB (Pro + Intelligence)
-- + "qué hacer y por qué" en cada hallazgo de Redes Sociales
-- Aplicado en Supabase el 25 sept 2026.
-- =====================================================================
-- Fase 3 de "Presencia Web y Redes" (fase 1 = schema_v21 Presencia Web,
-- fase 2 = schema_v22 Redes Sociales). Responde al pedido del cliente
-- de un módulo de "inteligencia digital" completo: noticias/menciones,
-- estructura de redes con recomendación accionable, y evolución
-- histórica del sitio (Wayback Machine) + tráfico público gratuito
-- (SimilarWeb/SEMrush vía su web, sin API de pago).
--
-- Investigación previa (compartida con el cliente antes de construir):
-- SimilarWeb y SEMrush cobran por su API (SEMrush exige plan Advanced,
-- $549/mes mínimo, más unidades aparte; SimilarWeb es por créditos, sin
-- precio público). PERO sus sitios web (similarweb.com, semrush.com)
-- muestran datos reales gratis sin necesidad de cuenta ni pago — se
-- decidió usar eso manualmente, igual que ya se investiga competencia,
-- en vez de pagar una suscripción sin tener aún varios clientes.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Noticias y Menciones
-- ---------------------------------------------------------------------
create table if not exists public.news_mentions_analysis (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null unique references public.reports(id) on delete cascade,
  overall_assessment text not null,
  created_at timestamptz not null default now()
);

alter table public.news_mentions_analysis enable row level security;

create policy news_mentions_analysis_admin_all on public.news_mentions_analysis
  for all using (is_admin()) with check (is_admin());

create policy news_mentions_analysis_select_own on public.news_mentions_analysis
  for select using (
    report_id in (
      select r.id from public.reports r
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

create table if not exists public.news_mentions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  titulo text not null,
  fuente text not null,
  url text,
  fecha_label text,
  resumen text not null,
  tono text not null check (tono in ('Positivo', 'Neutral', 'Negativo')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.news_mentions enable row level security;

create policy news_mentions_admin_all on public.news_mentions
  for all using (is_admin()) with check (is_admin());

create policy news_mentions_select_own on public.news_mentions
  for select using (
    report_id in (
      select r.id from public.reports r
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- Evolución del Sitio Web (Wayback Machine + tráfico público gratuito)
-- ---------------------------------------------------------------------
create table if not exists public.website_evolution_analysis (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null unique references public.reports(id) on delete cascade,
  resumen_evolucion text not null,
  tendencia text not null check (tendencia in ('Mejorando', 'Empeorando', 'Estable', 'Sin datos suficientes')),
  trafico_estimado_label text,
  trafico_fuente text,
  trafico_alcance_nota text,
  comportamiento_visitantes text,
  accion_recomendada text,
  por_que text,
  created_at timestamptz not null default now()
);

alter table public.website_evolution_analysis enable row level security;

create policy website_evolution_analysis_admin_all on public.website_evolution_analysis
  for all using (is_admin()) with check (is_admin());

create policy website_evolution_analysis_select_own on public.website_evolution_analysis
  for select using (
    report_id in (
      select r.id from public.reports r
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- Redes Sociales: agregar "qué hacer y por qué" a cada hallazgo
-- ---------------------------------------------------------------------
alter table public.social_findings
  add column if not exists accion_recomendada text,
  add column if not exists por_que text;

-- ---------------------------------------------------------------------
-- Datos de demostración — Days Inn by Wyndham Marietta White Water
-- (cliente de demo, reporte más reciente: 4265d1bb-8698-4b72-8bfa-39536243cdb4)
--
-- Investigación real (no inventada):
-- - Noticias: se buscó por el nombre del hotel; no apareció ninguna
--   nota de prensa/blog, solo fichas de OTAs (Expedia, Booking, etc.)
--   — se registró como hallazgo honesto, sin filas en news_mentions.
-- - Evolución del sitio: la URL de esta propiedad no tiene capturas en
--   Wayback Machine (típico de páginas profundas de franquicias sin
--   dominio propio) — se declaró explícitamente en vez de inventar una
--   comparación "antes vs. ahora" que no se puede comprobar.
-- - Tráfico: se consultó similarweb.com/website/wyndhamhotels.com sin
--   pagar — 13.9M visitas/3 meses, 45.26% rebote, 3.77 páginas/visita,
--   3:30 min promedio. Es tráfico del dominio de marca COMPLETO, no de
--   esta propiedad — se declara esa limitación explícitamente
--   (trafico_alcance_nota) en vez de presentarlo como dato exclusivo
--   del cliente.
-- ---------------------------------------------------------------------
insert into public.news_mentions_analysis (report_id, overall_assessment)
values (
  '4265d1bb-8698-4b72-8bfa-39536243cdb4',
  'No se encontró ninguna nota de prensa, blog o directorio local que mencione a este hotel más allá de las fichas estándar de reservas (Expedia, Booking, Hotels.com, TripAdvisor). Es normal para un hotel de esta categoría, pero también es una oportunidad: hoy no existe ningún contenido externo que hable bien del negocio fuera de sus propias reseñas.'
);

insert into public.website_evolution_analysis (
  report_id, resumen_evolucion, tendencia,
  trafico_estimado_label, trafico_fuente, trafico_alcance_nota,
  comportamiento_visitantes, accion_recomendada, por_que
) values (
  '4265d1bb-8698-4b72-8bfa-39536243cdb4',
  'No existen capturas históricas en Wayback Machine para la página específica de este hotel — es una URL dentro del dominio de la marca Wyndham, y ese tipo de páginas de franquicia normalmente no se archivan de forma individual. No podemos afirmar cómo lucía "antes" esta página en particular sin inventar una fecha o versión que no podemos comprobar.',
  'Sin datos suficientes',
  '13.9M visitas / 3 meses (dominio wyndhamhotels.com completo, todas las marcas y propiedades)',
  'SimilarWeb.com (herramienta gratuita, sin necesidad de suscripción)',
  'Esta cifra es del dominio completo de Wyndham a nivel corporativo — no aísla el tráfico de este hotel en particular. Al no tener dominio propio, este hotel no puede medir su tráfico web real de forma independiente con estas herramientas.',
  'A nivel del dominio completo, la tasa de rebote es 45% y el visitante promedio ve 3.8 páginas en 3:30 minutos — señal de que quien llega SÍ compara varias propiedades antes de decidir. Pero como el dato no está aislado por hotel, no podemos afirmar si esos visitantes específicamente consideraron esta propiedad.',
  'Crear una página propia fuera del sitio de la franquicia (o al menos un perfil robusto en Google Business Profile con enlace directo) para poder medir tráfico y comportamiento real de quienes buscan este hotel en particular, no solo la marca Wyndham en general.',
  'Sin un canal propio medible, el negocio no puede saber cuántas personas realmente llegan a ver su información específica ni ajustar nada con datos reales — depende 100% de la infraestructura de la marca.'
);

update public.social_findings
set accion_recomendada = 'Crear una cuenta de Instagram propia del hotel y publicar al menos 2-3 veces por semana con fotos reales de las habitaciones renovadas, el desayuno y el personal.',
    por_que = 'Los huéspedes deciden antes de reservar basándose en fotos recientes — hoy esa decisión depende solo de las fotos que suben terceros en Google/TripAdvisor, que la mayoría de las veces no muestran las mejoras más nuevas del hotel.'
where report_id = '4265d1bb-8698-4b72-8bfa-39536243cdb4'
  and titulo = 'Sin presencia propia en redes sociales';

update public.social_findings
set accion_recomendada = 'Publicar un post fijo (o historia destacada) cada vez que se complete una mejora — renovación de habitación, nuevo personal, cambio en áreas comunes — y responder directamente a comentarios que mencionen esas mejoras.',
    por_que = 'Una reseña negativa antigua sigue siendo lo primero que ve un cliente nuevo si nadie más cuenta la versión actualizada — un canal propio permite adelantarse a esa percepción en vez de solo reaccionar a ella.'
where report_id = '4265d1bb-8698-4b72-8bfa-39536243cdb4'
  and titulo = 'Sin canal directo para mostrar mejoras recientes';

-- =====================================================================
-- VIS IA Client Intelligence Dashboard — Supabase schema
-- =====================================================================
-- Ejecuta este archivo completo en Supabase: Dashboard > SQL Editor > New query
-- Crea las tablas, y las políticas RLS que garantizan que cada cliente
-- SOLO puede ver sus propios datos cuando inicia sesión.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. CLIENTS
-- Un row por negocio cliente. user_id se conecta a auth.users — así
-- Supabase Auth (login con email/password) sabe qué cliente es cuál.
-- ---------------------------------------------------------------------
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_code text not null unique,           -- ej. "VIS-250517"
  business_name text not null,
  location text not null,
  contact_name text,                          -- ej. "Carlos" (saludo en el panel)
  created_at timestamptz not null default now()
);

create unique index if not exists clients_user_id_idx on public.clients(user_id);

-- ---------------------------------------------------------------------
-- 2. REPORTS
-- Un row por análisis publicado para un cliente. El panel siempre
-- muestra el más reciente por analysis_date.
-- ---------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  analysis_date date not null,
  next_analysis_date date,
  vis_score_current integer not null,
  vis_score_previous integer not null,
  vis_score_delta integer not null,
  vis_score_status text not null,             -- ej. "ESTABLE", "MEJORANDO", "DECLINANDO"
  vis_score_status_note text,
  perdidas_count integer default 0,
  areas_count integer default 0,
  oportunidades_count integer default 0,
  accion_recomendada_titulo text,
  accion_recomendada_motivo text,
  created_at timestamptz not null default now()
);

create index if not exists reports_client_id_idx on public.reports(client_id);
create index if not exists reports_analysis_date_idx on public.reports(analysis_date desc);

-- ---------------------------------------------------------------------
-- 3. METRICS  ("¿Qué cambió desde tu último análisis?" grid)
-- ---------------------------------------------------------------------
create table if not exists public.metrics (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  icon_key text not null,       -- ver lib/icons.ts para las claves válidas
  label text not null,
  value text not null,
  suffix text,
  stars numeric,
  previous text not null,
  delta text not null,
  accent text not null check (accent in ('blue', 'green', 'purple')),
  sort_order integer not null default 0
);

create index if not exists metrics_report_id_idx on public.metrics(report_id);

-- ---------------------------------------------------------------------
-- 4. LOSSES  ("Pérdidas invisibles principales")
-- ---------------------------------------------------------------------
create table if not exists public.losses (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  icon_key text not null,
  titulo text not null,
  descripcion text not null,
  impacto text not null check (impacto in ('Alto', 'Media', 'Baja')),
  sort_order integer not null default 0
);

create index if not exists losses_report_id_idx on public.losses(report_id);

-- ---------------------------------------------------------------------
-- 5. OPPORTUNITIES  ("Oportunidades de valor oculto")
-- ---------------------------------------------------------------------
create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  icon_key text not null,
  titulo text not null,
  descripcion text not null,
  potencial text not null check (potencial in ('Alto', 'Medio', 'Baja')),
  sort_order integer not null default 0
);

create index if not exists opportunities_report_id_idx on public.opportunities(report_id);

-- ---------------------------------------------------------------------
-- 6. ACTIONS  ("Próximas acciones prioritarias")
-- ---------------------------------------------------------------------
create table if not exists public.actions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  texto text not null,
  prioridad text not null check (prioridad in ('Alta', 'Media', 'Baja')),
  sort_order integer not null default 0
);

create index if not exists actions_report_id_idx on public.actions(report_id);

-- =====================================================================
-- ROW LEVEL SECURITY
-- Cada cliente solo ve las filas que le pertenecen (via clients.user_id
-- = auth.uid()). Sin una política de INSERT/UPDATE/DELETE para clientes
-- normales — solo tú, desde el SQL Editor o un futuro panel admin con
-- la service_role key, puedes escribir datos.
-- =====================================================================

alter table public.clients enable row level security;
alter table public.reports enable row level security;
alter table public.metrics enable row level security;
alter table public.losses enable row level security;
alter table public.opportunities enable row level security;
alter table public.actions enable row level security;

-- clients: el usuario solo ve su propia fila
create policy "clients_select_own"
  on public.clients for select
  using (auth.uid() = user_id);

-- reports: el usuario solo ve reportes de SU client_id
create policy "reports_select_own"
  on public.reports for select
  using (
    client_id in (select id from public.clients where user_id = auth.uid())
  );

-- metrics / losses / opportunities / actions: solo filas de reportes
-- que pertenecen a un client_id del usuario actual
create policy "metrics_select_own"
  on public.metrics for select
  using (
    report_id in (
      select r.id from public.reports r
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

create policy "losses_select_own"
  on public.losses for select
  using (
    report_id in (
      select r.id from public.reports r
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

create policy "opportunities_select_own"
  on public.opportunities for select
  using (
    report_id in (
      select r.id from public.reports r
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

create policy "actions_select_own"
  on public.actions for select
  using (
    report_id in (
      select r.id from public.reports r
      join public.clients c on c.id = r.client_id
      where c.user_id = auth.uid()
    )
  );

-- =====================================================================
-- DATOS DE DEMOSTRACIÓN (Café Central Marietta)
-- Reemplaza esto por tus datos reales, o úsalo para probar el panel
-- antes de crear tu primer cliente real.
--
-- IMPORTANTE: primero crea el usuario en Supabase Dashboard >
-- Authentication > Users > Add user (con email y password), copia su
-- UUID, y pégalo abajo en lugar de 'PEGA-AQUI-EL-USER-ID'.
-- =====================================================================

-- insert into public.clients (user_id, client_code, business_name, location, contact_name)
-- values ('PEGA-AQUI-EL-USER-ID', 'VIS-250517', 'Café Central Marietta', 'Marietta, Georgia', 'Carlos');

-- insert into public.reports (
--   client_id, analysis_date, next_analysis_date,
--   vis_score_current, vis_score_previous, vis_score_delta,
--   vis_score_status, vis_score_status_note,
--   perdidas_count, areas_count, oportunidades_count,
--   accion_recomendada_titulo, accion_recomendada_motivo
-- )
-- select id, '2025-05-17', '2025-06-17',
--   72, 64, 8,
--   'ESTABLE', 'pero existen 3 oportunidades importantes',
--   2, 4, 5,
--   'Mejorar la gestión de reseñas negativas',
--   'porque está afectando tu reputación y la decisión de nuevos clientes.'
-- from public.clients where client_code = 'VIS-250517';

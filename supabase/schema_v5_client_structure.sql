-- =====================================================================
-- PASO 1 — ESTRUCTURA DEL CLIENTE (plan, estado, fecha de inicio,
-- tercer tipo de negocio "restaurante")
-- =====================================================================
-- Corre esto UNA VEZ en Supabase: SQL Editor > New query > pega todo >
-- Run.
-- =====================================================================

alter table public.clients
  add column if not exists plan text not null default 'diagnostic'
  check (plan in ('diagnostic', 'pro', 'intelligence'));

alter table public.clients
  add column if not exists estado text not null default 'activo'
  check (estado in ('activo', 'pausado'));

alter table public.clients
  add column if not exists fecha_inicio date not null default current_date;

-- Ampliar tipo de negocio para incluir "restaurante" (antes solo
-- 'negocio' y 'hotel'). Los restaurantes usan la misma tabla de
-- Experiencia del Cliente basada en reseñas que los negocios
-- normales — solo los hoteles tienen subcalificaciones de
-- Booking/Expedia/TripAdvisor.
alter table public.clients drop constraint if exists clients_business_type_check;
alter table public.clients add constraint clients_business_type_check
  check (business_type in ('negocio', 'restaurante', 'hotel'));

-- Café Central Marietta: renombramos su código al formato acordado
-- (VIS-CAF-fecha de inicio) y confirmamos su plan.
update public.clients
set client_code = 'VIS-CAF-250517',
    plan = 'diagnostic',
    estado = 'activo',
    fecha_inicio = '2026-05-17'
where client_code = 'VIS-250517' or client_code = 'VIS-CAF-250517';

-- =====================================================================
-- PÉRDIDAS Y OPORTUNIDADES — misma estructura de evidencia que el
-- Plan de Acción (Evidencia + Causa probable + Nivel de certeza)
-- =====================================================================
-- Corre esto UNA VEZ en Supabase: SQL Editor > New query > pega todo >
-- Run.
-- =====================================================================

alter table public.losses add column if not exists evidencia text;
alter table public.losses add column if not exists causa_probable text;
alter table public.losses add column if not exists nivel_certeza text
  check (nivel_certeza in ('Confirmado', 'Medido', 'Estimado', 'Potencial', 'No calculable'));

alter table public.opportunities add column if not exists evidencia text;
alter table public.opportunities add column if not exists causa_probable text;
alter table public.opportunities add column if not exists nivel_certeza text
  check (nivel_certeza in ('Confirmado', 'Medido', 'Estimado', 'Potencial', 'No calculable'));

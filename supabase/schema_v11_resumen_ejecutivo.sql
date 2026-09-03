-- =====================================================================
-- RESUMEN EJECUTIVO
-- =====================================================================
-- Corre esto UNA VEZ en Supabase: SQL Editor > New query > pega todo >
-- Run.
-- =====================================================================

alter table public.reports add column if not exists resumen_ejecutivo text;

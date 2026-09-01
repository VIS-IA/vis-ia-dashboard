-- =====================================================================
-- PLAN DE ACCIÓN — ESTRUCTURA COMPLETA
-- (Problema → Evidencia → Causa probable → Impacto → Certeza →
--  Prioridad → Acción → Métrica → Fecha de revisión)
-- =====================================================================
-- Corre esto UNA VEZ en Supabase: SQL Editor > New query > pega todo >
-- Run.
-- =====================================================================

alter table public.actions add column if not exists problema text;
alter table public.actions add column if not exists evidencia text;
alter table public.actions add column if not exists causa_probable text;
alter table public.actions add column if not exists nivel_certeza text
  check (nivel_certeza in ('Confirmado', 'Medido', 'Estimado', 'Potencial', 'No calculable'));
alter table public.actions add column if not exists metrica text;
alter table public.actions add column if not exists fecha_revision date;

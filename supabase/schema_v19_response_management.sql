-- =====================================================================
-- RESPONSE MANAGEMENT — gestión de respuesta a reseñas, con
-- detección automática de abandono (comparado contra el reporte
-- anterior, sin que nadie tenga que calcularlo a mano)
-- =====================================================================
-- Corre esto UNA VEZ en Supabase: SQL Editor > New query > pega todo >
-- Run.
-- =====================================================================

alter table public.reputation_details add column if not exists reviews_responded integer;
alter table public.reputation_details add column if not exists reviews_unresponded integer;
alter table public.reputation_details add column if not exists avg_response_time_days numeric;

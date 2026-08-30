-- =====================================================================
-- Permitir VIS Score y desglose de reputación "pendientes"
-- (sin inventar valores cuando aún no hay evidencia o no se ha
-- completado el análisis)
-- =====================================================================
-- Corre esto UNA VEZ en Supabase: SQL Editor > New query > pega todo >
-- Run.
-- =====================================================================

alter table public.reports alter column vis_score_current drop not null;
alter table public.reports alter column vis_score_previous drop not null;
alter table public.reports alter column vis_score_delta drop not null;
alter table public.reports alter column vis_score_status drop not null;

alter table public.reputation_details alter column avg_rating_previous drop not null;
alter table public.reputation_details alter column total_reviews_previous drop not null;
alter table public.reputation_details alter column positive_count drop not null;
alter table public.reputation_details alter column neutral_count drop not null;
alter table public.reputation_details alter column negative_count drop not null;
alter table public.reputation_details alter column response_rate_percent drop not null;
alter table public.reputation_details alter column unresponded_negative drop not null;
alter table public.reputation_details alter column positive_count drop default;
alter table public.reputation_details alter column neutral_count drop default;
alter table public.reputation_details alter column negative_count drop default;
alter table public.reputation_details alter column response_rate_percent drop default;
alter table public.reputation_details alter column unresponded_negative drop default;

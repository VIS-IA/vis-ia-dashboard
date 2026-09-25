-- =====================================================================
-- BORRADOR DE RESPUESTA A RESEÑAS (IA) — Pro + Intelligence
-- Aplicado en Supabase el 25 sept 2026.
-- =====================================================================
-- En "Evidencia Visual" (VIS Evidence), cada reseña real ahora puede
-- generar un borrador de respuesta redactado por IA (Claude Haiku,
-- mismo modelo económico que ya usa el Asistente VIS) — el cliente lo
-- copia/edita y lo publica él mismo en Google/Booking/TripAdvisor.
-- Nunca se publica solo. Fase 2 (más adelante, con OAuth a Google
-- Business Profile por cliente) sería publicarlo directo.
--
-- El borrador se genera desde el texto REAL de la reseña — el system
-- prompt prohíbe explícitamente inventar detalles que la reseña no
-- menciona (fechas, reembolsos, promesas concretas), mismo principio
-- de "nunca afirmar sin evidencia" del resto de VIS IA.
-- =====================================================================

alter table public.evidence_records
  add column if not exists suggested_response text,
  add column if not exists suggested_response_generated_at timestamptz;

-- Nota de seguridad: evidence_records nunca tuvo policy de UPDATE para
-- el rol cliente (solo SELECT vía evidence_records_select_own) — y así
-- se deja. El guardado del borrador lo hace el backend con el cliente
-- admin (Service Role), solo después de confirmar por una lectura
-- scoped por RLS que el registro pertenece al cliente que lo pidió.

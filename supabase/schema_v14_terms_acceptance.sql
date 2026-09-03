-- =====================================================================
-- CONSTANCIA DE ACEPTACIÓN DE TÉRMINOS Y PRIVACIDAD
-- =====================================================================
-- Corre esto UNA VEZ en Supabase: SQL Editor > New query > pega todo >
-- Run.
-- =====================================================================

alter table public.clients add column if not exists terms_accepted_at timestamptz;

-- Misma lógica de seguridad que con las 15 preguntas y el tour: el
-- cliente no tiene permiso de UPDATE directo sobre su fila en
-- "clients". Esta función solo puede tocar terms_accepted_at, y solo
-- lo pone una vez (no se pisa la fecha original si ya existía).
create or replace function public.record_terms_acceptance()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.clients
  set terms_accepted_at = coalesce(terms_accepted_at, now())
  where user_id = auth.uid();
end;
$$;

grant execute on function public.record_terms_acceptance() to authenticated;

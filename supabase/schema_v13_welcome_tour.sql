-- =====================================================================
-- RECORRIDO DE BIENVENIDA (primera vez que el cliente entra al panel)
-- =====================================================================
-- Corre esto UNA VEZ en Supabase: SQL Editor > New query > pega todo >
-- Run.
-- =====================================================================

alter table public.clients add column if not exists tour_completed boolean not null default false;

-- Misma lógica de seguridad que con las 15 preguntas: el cliente NO
-- tiene permiso de UPDATE directo sobre su fila en "clients" (evita
-- que pueda auto-cambiarse el plan u otros campos desde el
-- navegador). Esta función solo puede tocar tour_completed.
create or replace function public.mark_tour_completed()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.clients
  set tour_completed = true
  where user_id = auth.uid();
end;
$$;

grant execute on function public.mark_tour_completed() to authenticated;

-- Los clientes ya existentes (Café Central, Days Inn) ya conocen el
-- panel — no hace falta mostrarles el recorrido.
update public.clients set tour_completed = true;

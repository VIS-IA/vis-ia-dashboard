-- =====================================================================
-- CAMPANITA DE NOTIFICACIONES
-- =====================================================================
-- Corre esto UNA VEZ en Supabase: SQL Editor > New query > pega todo >
-- Run.
-- =====================================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_client_id_idx on public.notifications(client_id);

alter table public.notifications enable row level security;

create policy "notifications_select_own"
  on public.notifications for select
  using (
    client_id in (select id from public.clients where user_id = auth.uid())
  );

-- El cliente solo puede marcar SUS propias notificaciones como leídas
-- (no puede crearlas ni borrarlas desde el navegador — eso lo haces tú
-- desde el SQL Editor cuando publiques algo nuevo).
create policy "notifications_update_own"
  on public.notifications for update
  using (
    client_id in (select id from public.clients where user_id = auth.uid())
  );

-- ---------------------------------------------------------------------
-- Ejemplo real para Days Inn: avisarle que ya recibimos sus 15 respuestas
-- ---------------------------------------------------------------------
insert into public.notifications (client_id, title, message)
select id, 'Recibimos tus respuestas', 'Ya tenemos tus 15 respuestas. VIS IA está terminando de calcular tu VIS Score con esa información.'
from public.clients where client_code = 'VIS-DIW-260830';

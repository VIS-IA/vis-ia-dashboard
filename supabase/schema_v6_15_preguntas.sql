-- =====================================================================
-- PASO 2 — LAS 15 PREGUNTAS
-- =====================================================================
-- Corre esto UNA VEZ en Supabase: SQL Editor > New query > pega todo >
-- Run (elige "Run and enable RLS" si sale el aviso).
-- =====================================================================

alter table public.clients
  add column if not exists onboarding_completed boolean not null default false;

-- ---------------------------------------------------------------------
-- Catálogo de preguntas (igual para los 3 planes, se define una vez)
-- ---------------------------------------------------------------------
create table if not exists public.onboarding_questions (
  question_key text primary key,
  order_num integer not null,
  question_text text not null,
  purpose text,
  response_type text not null check (response_type in ('single_select', 'multi_select', 'text', 'economic_impact')),
  options jsonb,
  has_text_field boolean not null default true,
  text_field_label text,
  required boolean not null default true
);

-- ---------------------------------------------------------------------
-- Respuestas del cliente (una fila por pregunta, una sola vez)
-- ---------------------------------------------------------------------
create table if not exists public.client_onboarding_answers (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  question_key text not null references public.onboarding_questions(question_key),
  answer jsonb not null default '{}'::jsonb,
  answered_at timestamptz not null default now(),
  unique (client_id, question_key)
);

alter table public.onboarding_questions enable row level security;
alter table public.client_onboarding_answers enable row level security;

-- El catálogo de preguntas no tiene datos privados — cualquier usuario
-- con sesión puede leerlo (lo necesita para ver el formulario).
create policy "onboarding_questions_select_all"
  on public.onboarding_questions for select
  to authenticated
  using (true);

create policy "client_onboarding_answers_select_own"
  on public.client_onboarding_answers for select
  using (
    client_id in (select id from public.clients where user_id = auth.uid())
  );

-- El cliente puede guardar SUS PROPIAS respuestas (y corregirlas si
-- reenvía antes de confirmar), pero nunca las de otro cliente.
create policy "client_onboarding_answers_insert_own"
  on public.client_onboarding_answers for insert
  with check (
    client_id in (select id from public.clients where user_id = auth.uid())
  );

create policy "client_onboarding_answers_update_own"
  on public.client_onboarding_answers for update
  using (
    client_id in (select id from public.clients where user_id = auth.uid())
  );

-- ---------------------------------------------------------------------
-- Función segura para marcar "ya respondí" — el cliente NO tiene
-- permiso para hacer UPDATE directo sobre su fila en "clients" (eso
-- evitaría, por ejemplo, que alguien se auto-cambiara su propio plan
-- desde el navegador). Esta función solo puede tocar
-- onboarding_completed, nada más.
-- ---------------------------------------------------------------------
create or replace function public.mark_onboarding_completed()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.clients
  set onboarding_completed = true
  where user_id = auth.uid();
end;
$$;

grant execute on function public.mark_onboarding_completed() to authenticated;

-- ---------------------------------------------------------------------
-- Las 15 preguntas oficiales
-- ---------------------------------------------------------------------
insert into public.onboarding_questions (question_key, order_num, question_text, purpose, response_type, options, has_text_field, text_field_label, required)
values
('q01', 1, '¿Cómo describiría actualmente la situación general de su negocio?', 'Percepción general del empresario', 'single_select',
 '["Muy buena","Buena","Regular","Deficiente","Muy deficiente"]', true, 'Explique brevemente por qué eligió esta respuesta', true),

('q02', 2, '¿Cuál considera que es actualmente el principal problema que afecta a su negocio?', 'Problema percibido principal', 'single_select',
 '["Conseguir nuevos clientes","Convertir visitantes en clientes","Servicio al cliente","Reputación","Reseñas","Competencia","Precios","Marketing","Experiencia del cliente","Operaciones","Retención de clientes","Otro"]', true, 'Explique', true),

('q03', 3, '¿Cómo considera actualmente la capacidad de su negocio para atraer nuevos clientes?', 'Autopercepción de adquisición', 'single_select',
 '["Excelente","Buena","Regular","Baja","Muy baja"]', true, 'Explique', true),

('q04', 4, '¿Considera que una cantidad importante de personas que muestran interés en su negocio finalmente no se convierten en clientes?', 'Percepción de conversión', 'single_select',
 '["Sí","No","No estoy seguro"]', true, 'Si respondió Sí, ¿dónde cree que ocurre principalmente la pérdida?', true),

('q05', 5, '¿Cómo calificaría la experiencia que recibe actualmente un cliente cuando interactúa con su negocio?', 'Autopercepción de experiencia', 'single_select',
 '["Excelente","Buena","Regular","Deficiente","Muy deficiente"]', true, 'Explique', true),

('q06', 6, '¿Cómo considera actualmente la reputación de su negocio frente a sus clientes y posibles clientes?', 'Autopercepción de reputación', 'single_select',
 '["Excelente","Buena","Regular","Deficiente","Muy deficiente","No estoy seguro"]', true, 'Explique', true),

('q07', 7, '¿Considera que las reseñas actuales representan correctamente la experiencia que ofrece su negocio?', 'Contraste percepción vs. evidencia pública', 'single_select',
 '["Sí","En gran medida","Parcialmente","No","No estoy seguro"]', true, '¿Por qué?', true),

('q08', 8, '¿Considera que sus principales competidores ofrecen actualmente una experiencia mejor, similar o peor que la suya?', 'Autopercepción competitiva', 'single_select',
 '["Mucho mejor","Mejor","Similar","Peor","Mucho peor","No estoy seguro"]', true, '¿Qué competidor considera más importante y por qué?', true),

('q09', 9, '¿Considera que los clientes que ya compraron, visitaron o utilizaron su negocio regresan con suficiente frecuencia?', 'Percepción de retención', 'single_select',
 '["Sí","Generalmente sí","Algunas veces","Generalmente no","No","No tenemos información suficiente"]', true, 'Explique', true),

('q10', 10, '¿Qué indicadores utiliza actualmente para saber si el negocio está mejorando o empeorando?', 'Madurez de medición interna', 'multi_select',
 '["Ventas","Número de clientes","Reservas","Llamadas","Mensajes","Reseñas","Calificación en Google","Clientes recurrentes","Cancelaciones","Quejas","Reembolsos","Otro","No medimos estos indicadores"]', true, '¿Cuál considera el indicador más importante?', true),

('q11', 11, '¿Existen señales de posible pérdida económica antes, durante y después de la experiencia del cliente?', 'Base para el marco de certeza económica — nunca se afirma una pérdida sin evidencia', 'economic_impact',
 null, true, null, true),

('q12', 12, '¿Cuál es el principal resultado que desea conseguir durante los próximos 12 meses?', 'Objetivo del negocio', 'single_select',
 '["Aumentar ventas","Aumentar reservas","Conseguir más clientes","Aumentar clientes recurrentes","Mejorar reputación","Mejorar reseñas","Reducir quejas","Mejorar experiencia","Reducir pérdidas","Superar a la competencia","Mejorar rentabilidad","Ahorrar tiempo","Otro"]', true, 'Explique', true),

('q13', 13, '¿Ha realizado recientemente algún cambio importante en el negocio?', 'Correlacionar cambios con evolución de reseñas/reputación', 'multi_select',
 '["Personal","Administración","Precios","Local/instalaciones","Servicio","Marketing","Página web","Tecnología","Horarios","Productos/servicios","No","Otro"]', true, '¿Qué cambió y aproximadamente cuándo?', true),

('q14', 14, '¿Qué considera que hace diferente a su negocio frente a sus competidores?', 'Diferenciación percibida vs. real', 'multi_select',
 '["Servicio","Precio","Calidad","Ubicación","Rapidez","Experiencia","Personal","Instalaciones","Producto","Confianza/reputación","Otro"]', true, 'Describa con sus palabras', true),

('q15', 15, 'Si VIS IA pudiera ayudarle a resolver solamente una cosa durante los próximos meses, ¿cuál sería la más importante?', 'Prioridad #1 del cliente', 'single_select',
 '["Conseguir más clientes","Aumentar conversiones","Aumentar reservas","Mejorar reputación","Mejorar reseñas","Mejorar servicio","Mejorar experiencia","Reducir pérdidas","Aumentar clientes recurrentes","Superar competencia","Aumentar ventas","Ahorrar tiempo","Otro"]', true, '¿Por qué esta es su prioridad principal?', true)

on conflict (question_key) do nothing;

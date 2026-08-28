-- =====================================================================
-- DATOS DE DEMOSTRACIÓN COMPLETOS — Café Central Marietta
-- =====================================================================
-- 1. Corre primero schema.sql (una sola vez).
-- 2. Crea un usuario en Supabase Dashboard > Authentication > Users >
--    Add user, con un email y password de prueba. Copia su UUID.
-- 3. Reemplaza 'PEGA-AQUI-EL-USER-ID' abajo por ese UUID (en las 2 líneas).
-- 4. Corre este archivo completo en el SQL Editor.
-- 5. Inicia sesión en /login con ese email y password — deberías ver
--    el panel exactamente igual al demo original, pero servido desde
--    la base de datos.
-- =====================================================================

with new_client as (
  insert into public.clients (user_id, client_code, business_name, location, contact_name)
  values ('PEGA-AQUI-EL-USER-ID', 'VIS-250517', 'Café Central Marietta', 'Marietta, Georgia', 'Carlos')
  returning id
),
new_report as (
  insert into public.reports (
    client_id, analysis_date, next_analysis_date,
    vis_score_current, vis_score_previous, vis_score_delta,
    vis_score_status, vis_score_status_note,
    perdidas_count, areas_count, oportunidades_count,
    accion_recomendada_titulo, accion_recomendada_motivo
  )
  select id, '2025-05-17', '2025-06-17',
    72, 64, 8,
    'ESTABLE', 'pero existen 3 oportunidades importantes',
    2, 4, 5,
    'Mejorar la gestión de reseñas negativas',
    'porque está afectando tu reputación y la decisión de nuevos clientes.'
  from new_client
  returning id
)
insert into public.metrics (report_id, icon_key, label, value, suffix, stars, previous, delta, accent, sort_order)
select id, 'trending-up', 'VIS Score', '72', '/100', null, 'Anterior: 64/100', '+8', 'blue', 1 from new_report
union all
select id, 'star', 'Reputación (Google)', '4.1', null, 4.1, 'Anterior: 3.7', '+0.4', 'green', 2 from new_report
union all
select id, 'message-square', 'Reseñas Totales', '238', null, null, 'Anterior: 189', '+49', 'blue', 3 from new_report
union all
select id, 'users', 'Tráfico Perfil Google', '1,246', null, null, 'Anterior: 987', '+26%', 'purple', 4 from new_report
union all
select id, 'trending-up', 'Interacciones', '2,103', null, null, 'Anterior: 1,650', '+27%', 'purple', 5 from new_report;

insert into public.losses (report_id, icon_key, titulo, descripcion, impacto, sort_order)
select r.id, 'thumbs-down', 'Reseñas negativas sin respuesta', 'Estás perdiendo confianza y clientes.', 'Alto', 1
from public.reports r
join public.clients c on c.id = r.client_id
where c.client_code = 'VIS-250517'
union all
select r.id, 'clock', 'Tiempo de respuesta lento', 'Afecta la experiencia y la conversión.', 'Alto', 2
from public.reports r
join public.clients c on c.id = r.client_id
where c.client_code = 'VIS-250517';

insert into public.opportunities (report_id, icon_key, titulo, descripcion, potencial, sort_order)
select r.id, 'megaphone', 'Clientes satisfechos no están dejando reseñas', 'Puedes aumentar tu reputación fácilmente.', 'Alto', 1
from public.reports r
join public.clients c on c.id = r.client_id
where c.client_code = 'VIS-250517'
union all
select r.id, 'camera', 'Tus fotos y presentación pueden destacar más', 'Puedes atraer más clientes con mejoras simples.', 'Medio', 2
from public.reports r
join public.clients c on c.id = r.client_id
where c.client_code = 'VIS-250517';

insert into public.actions (report_id, texto, prioridad, sort_order)
select r.id, 'Responder reseñas negativas pendientes', 'Alta', 1
from public.reports r
join public.clients c on c.id = r.client_id
where c.client_code = 'VIS-250517'
union all
select r.id, 'Mejorar tiempo de respuesta en mensajes', 'Media', 2
from public.reports r
join public.clients c on c.id = r.client_id
where c.client_code = 'VIS-250517'
union all
select r.id, 'Actualizar fotos y presentación del negocio', 'Media', 3
from public.reports r
join public.clients c on c.id = r.client_id
where c.client_code = 'VIS-250517';

-- =====================================================================
-- Agregar detalle específico a cada acción del Plan de Acción
-- =====================================================================
-- Corre esto UNA VEZ en Supabase: SQL Editor > New query > pega todo >
-- Run.
-- =====================================================================

alter table public.actions add column if not exists detalle text;

-- Ejemplo: detalle para las 3 acciones de Café Central Marietta
update public.actions a
set detalle = 'Tienes 5 reseñas de 2 estrellas o menos de las últimas 4 semanas sin respuesta. Responder no cambia la calificación, pero sí muestra a futuros clientes que atiendes los problemas. Empieza por las más recientes.'
from public.reports r join public.clients c on c.id = r.client_id
where a.report_id = r.id and c.client_code = 'VIS-250517' and a.texto = 'Responder reseñas negativas pendientes';

update public.actions a
set detalle = 'Tu tiempo promedio de respuesta a mensajes es de 3.2 horas. Bajarlo a menos de 1 hora en horario de atención suele traducirse en más reservas confirmadas, porque el cliente decide rápido y compara con otros negocios mientras espera.'
from public.reports r join public.clients c on c.id = r.client_id
where a.report_id = r.id and c.client_code = 'VIS-250517' and a.texto = 'Mejorar tiempo de respuesta en mensajes';

update public.actions a
set detalle = 'Las fotos actuales del perfil tienen más de 8 meses. Negocios similares con fotos recientes (interior, platos, ambiente) reciben en promedio más clics para "Cómo llegar" y más llamadas directas desde Google.'
from public.reports r join public.clients c on c.id = r.client_id
where a.report_id = r.id and c.client_code = 'VIS-250517' and a.texto = 'Actualizar fotos y presentación del negocio';

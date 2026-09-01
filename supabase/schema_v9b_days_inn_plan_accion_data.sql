delete from public.actions where report_id = (select id from public.reports where client_id = (select id from public.clients where client_code = 'VIS-DIW-260830'));

insert into public.actions (report_id, texto, prioridad, sort_order, problema, evidencia, causa_probable, detalle, nivel_certeza, metrica, fecha_revision)
select r.id,
  'Establecer una línea base de medición antes de invertir en atraer más clientes',
  'Alta', 1,
  'El negocio quiere conseguir más clientes, pero no mide ningún indicador (ventas, reservas, clientes recurrentes, cancelaciones).',
  'El propietario confirmó directamente en las 15 preguntas que no mide estos indicadores actualmente.',
  'Sin visibilidad interna, es imposible saber si un cambio (precio, marketing, personal) realmente mejora el negocio o no.',
  'Si se invierte en atraer más clientes sin resolver primero esto, se corre el riesgo de exponer más las fricciones de experiencia que ya existen — más gente llegando a una experiencia inconsistente.',
  'Confirmado',
  'Definir 3-5 indicadores clave (reservas, clientes recurrentes, quejas) y empezar a registrarlos cada semana.',
  current_date + interval '30 days'
from public.reports r join public.clients c on c.id = r.client_id where c.client_code = 'VIS-DIW-260830'
union all
select r.id,
  'Auditar la consistencia de limpieza y condición de la propiedad',
  'Alta', 2,
  'Existen reseñas contradictorias: algunos huéspedes reportan habitaciones limpias, otros reportan suciedad y deterioro en la misma propiedad.',
  '178 menciones de "limpieza" y 170 de "propiedad" en las reseñas públicas de Google — con comentarios positivos y negativos mezclados, incluyendo un huésped que abandonó su reserva por esto.',
  'Un problema que aparece en algunas experiencias y no en otras suele apuntar a inconsistencia operativa (turnos, supervisión, personal específico) más que a falta de recursos.',
  'Al menos una reserva se perdió completamente después de haber sido confirmada, por esta causa.',
  'Confirmado',
  'Reducir las menciones negativas de limpieza en reseñas nuevas durante los próximos 60 días.',
  current_date + interval '60 days'
from public.reports r join public.clients c on c.id = r.client_id where c.client_code = 'VIS-DIW-260830'
union all
select r.id,
  'Definir qué hace mejor la competencia y cerrar esa brecha puntual',
  'Media', 3,
  'El propio negocio percibe que sus competidores directos ofrecen una experiencia superior.',
  'Respuesta directa del propietario en la pregunta 8 de las 15 preguntas internas.',
  'Sin saber específicamente en qué son mejores los competidores, cualquier esfuerzo de mejora corre el riesgo de no apuntar al lugar correcto.',
  null,
  'No calculable',
  'Completar una comparación directa (precio, limpieza, desayuno, servicio) contra 2-3 competidores cercanos.',
  current_date + interval '45 days'
from public.reports r join public.clients c on c.id = r.client_id where c.client_code = 'VIS-DIW-260830';

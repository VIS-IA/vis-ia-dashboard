-- =====================================================================
-- DAYS INN — Panel completo para demo con gerentes de hoteles
-- (aplicado directamente en Supabase el 24 de septiembre de 2026)
-- =====================================================================
-- Contexto: antes de presentaciones en vivo con gerentes de hoteles
-- (usando Days Inn by Wyndham Marietta White Water, VIS-DIW-260830,
-- plan Pro, como cliente de demostración), se revisó cada página del
-- panel buscando secciones vacías o botones sin datos por falta de
-- información real.
--
-- IMPORTANTE — esto es SOLO para el cliente de demostración:
-- Los números de impacto económico (monto_estimado), la distribución
-- de reseñas, los datos de "Experiencia del Cliente" y los registros
-- nuevos de "VIS Evidence" en este archivo son ESTIMADOS/INVENTADOS
-- con fines de presentación, autorizados explícitamente para este
-- cliente de demo. A los clientes reales NUNCA se les inventa un dato
-- — cuando falta información real, VIS IA lo dice explícitamente en
-- vez de mostrar una cifra (ver EconomicImpactCard.tsx).
--
-- La EXCEPCIÓN es el evidence_record de "Dawn Yarch": es una reseña
-- REAL de Google Maps que ya se había investigado y dejado lista en
-- schema_v18_vis_evidence_record.sql, pero nunca se había podido
-- cargar porque la tabla no existía todavía (ver schema_v20). Aquí
-- simplemente se ejecuta, sin inventar nada.
-- =====================================================================

-- 1) Resumen ejecutivo del reporte más reciente (faltaba)
update reports set resumen_ejecutivo =
  'Days Inn by Wyndham Marietta White Water sube a 55/100 en su segunda medición del VIS Score (+7 desde la línea base), tras aplicar las primeras acciones recomendadas. La reputación en Google mejora de 3.5 a 3.7/5 (601 reseñas) y la tasa de respuesta a reseñas sube de 54% a 68%. El problema de limpieza en el turno de la tarde sigue generando reseñas negativas puntuales, aunque en menor proporción que antes, y sigue siendo la prioridad #1. La relación precio-calidad continúa siendo el punto más débil frente a Ubicación y Personal, según las puntuaciones específicas de Booking.com.'
where id = '4265d1bb-8698-4b72-8bfa-39536243cdb4';

-- 2) Corrección de datos: el primer reporte guardaba perdidas_count=2
--    pero la tabla losses tiene 3 filas reales para ese reporte.
update reports set perdidas_count = 3 where id = '40f62481-c4f5-4d18-80f8-b04707879e98';

-- 3) Impacto económico (DEMO) en los hallazgos "Confirmado" que no lo tenían
update losses set monto_estimado = 2850, supuestos = 'Estimado sobre una tarifa promedio de $95/noche: huéspedes que no completan su reserva o no regresan tras una mala experiencia documentada, en un periodo de 30 días.'
  where id = '112f926d-1e50-4bb8-862e-06363b957593';
update losses set monto_estimado = 340, supuestos = 'Valor de la reserva específica cancelada, más el valor estimado de 2-3 estadías futuras de ese mismo huésped que no se van a concretar.'
  where id = 'a5337fe5-4fa9-4578-877c-bb7f0d6997b6';
update losses set monto_estimado = 1900, supuestos = 'Estimado sobre una tarifa promedio de $95/noche: huéspedes potenciales que descartan la reserva tras leer reseñas recientes que mencionan limpieza, en un periodo de 30 días.'
  where id = 'ca365b4c-6277-427f-960f-85047bb1ac50';
update opportunities set monto_estimado = 2600, supuestos = 'Estimado sobre conversión adicional de reservas directas si se usan los activos de reputación ya existentes (calificación del personal, ubicación) en marketing, en un periodo de 30 días.'
  where id = '4bcb30ab-4333-4d39-adfb-4d2efa04f36a';
update opportunities set monto_estimado = 1200, supuestos = 'Estimado de pérdidas evitadas al detectar y corregir patrones de queja antes de que se conviertan en reseñas negativas públicas, con un sistema de medición semanal activo.'
  where id = '4825c67b-19bb-4e00-9d2f-5ab968790ac5';
update opportunities set monto_estimado = 2200, supuestos = 'Estimado sobre conversión adicional de reservas directas si se usan las reseñas nuevas sobre el personal como parte del marketing del negocio, en un periodo de 30 días.'
  where id = '17ecabac-b6d3-4a2f-81e7-8484f6c6e8fd';

-- 4) Reputación (DEMO) — distribución de reseñas y gestión de respuesta
update reputation_details set
  positive_count = 350, neutral_count = 128, negative_count = 105,
  response_rate_percent = 54
  where report_id = '40f62481-c4f5-4d18-80f8-b04707879e98';

update reputation_details set
  positive_count = 380, neutral_count = 134, negative_count = 87,
  reviews_responded = 59, reviews_unresponded = 28, avg_response_time_days = 2.4
  where report_id = '4265d1bb-8698-4b72-8bfa-39536243cdb4';

-- 5) Número de reseñas de Booking.com (DEMO, faltaba en ambos reportes)
update other_reputations set review_count = 118 where report_id = '40f62481-c4f5-4d18-80f8-b04707879e98';
update other_reputations set review_count = 142 where report_id = '4265d1bb-8698-4b72-8bfa-39536243cdb4';

-- 6) Experiencia del Cliente (DEMO) — 5 señales, reporte más reciente
insert into experience_evidence (report_id, category, source, source_type, reviews_analyzed, positive_mentions, negative_mentions, platform_score, platform_score_scale, evidence, pattern, confidence, analyzed_at, sort_order)
values
('4265d1bb-8698-4b72-8bfa-39536243cdb4','Limpieza','Google Reviews','reviews_text',45,28,17,null,null,'17 de 45 reseñas recientes mencionan problemas de limpieza, concentrados en check-ins después de las 3pm.','Los huéspedes que hacen check-in en el turno de la tarde reportan más quejas de limpieza que los del turno de la mañana.','Confirmado','2026-09-15',1),
('4265d1bb-8698-4b72-8bfa-39536243cdb4','Personal / Servicio','Google Reviews','reviews_text',45,38,4,null,null,'38 de 45 reseñas destacan positivamente la amabilidad y disposición del personal de recepción.','El personal es mencionado como fortaleza consistente en casi todas las reseñas positivas recientes.','Confirmado','2026-09-15',2),
('4265d1bb-8698-4b72-8bfa-39536243cdb4','Comodidad de habitaciones','Booking.com','platform_score',null,null,null,7.6,10,'Puntuación específica de "Comodidad" en Booking.com, calculada sobre 89 huéspedes que calificaron esa categoría.',null,'Medido','2026-09-15',3),
('4265d1bb-8698-4b72-8bfa-39536243cdb4','Ubicación','Booking.com','platform_score',null,null,null,8.4,10,'Puntuación específica de "Ubicación" en Booking.com — la más alta de las categorías medidas.',null,'Medido','2026-09-15',4),
('4265d1bb-8698-4b72-8bfa-39536243cdb4','Relación precio-calidad','Booking.com','platform_score',null,null,null,6.9,10,'Puntuación específica de "Relación calidad-precio" en Booking.com — la más baja de las 4 categorías medidas.',null,'Medido','2026-09-15',5);

-- 7) Evidencia Visual (DEMO) — 2 fotos adicionales, reporte más reciente
insert into visual_evidence (report_id, evidence_type, source, source_url, title, impact, category, analysis, verified, requires_human_review, sort_order)
values
('4265d1bb-8698-4b72-8bfa-39536243cdb4','photo','Google Maps','https://www.google.com/maps/place/Days+Inn+by+Wyndham+Marietta+White+Water/@33.9607494,-84.5299952,17z','Foto adjunta a reseña de septiembre muestra polvo en mobiliario de habitación','medium','limpieza','Reseña de huésped del 12 de septiembre de 2026 incluye foto que muestra acumulación de polvo en la mesa de noche y la rejilla de A/C — consistente con el patrón de limpieza inconsistente en turno de tarde ya identificado en Pérdidas Invisibles.',true,false,2),
('4265d1bb-8698-4b72-8bfa-39536243cdb4','photo','Google Maps','https://www.google.com/maps/place/Days+Inn+by+Wyndham+Marietta+White+Water/@33.9607494,-84.5299952,17z','Foto de recepción en reseña reciente muestra área organizada y personal atento','low','personal','Reseña de agosto de 2026 incluye foto del área de recepción — coincide con el patrón positivo detectado en las menciones sobre el personal.',true,false,3);

-- 8) VIS Evidence Records — reporte más reciente
--    8a) DEMO — reseña reciente negativa, con resolución demostrada
insert into evidence_records (id, report_id, source, source_url, author, review_date_label, rating, review_text, owner_response, owner_response_date_label, resolution_demonstrated, temporal_status, public_persistence, analysis, confidence, requires_human_review, sort_order)
values
('4b7a1e10-1a11-4e4a-8b1a-9c2c6c9a1001','4265d1bb-8698-4b72-8bfa-39536243cdb4','Google','https://www.google.com/maps/place/Days+Inn+by+Wyndham+Marietta+White+Water/@33.9607494,-84.5299952,17z','Jennifer M.','12 de septiembre de 2026',2,'La habitación estaba bien ubicada pero encontramos polvo acumulado en los muebles y el aire acondicionado. El personal en recepción fue muy amable y nos cambiaron de habitación sin problema.','Gracias por su reseña, Jennifer. Lamentamos el inconveniente con la limpieza — ya reforzamos el protocolo del turno de la tarde y agradecemos que el equipo pudiera resolverlo en el momento.','14 de septiembre de 2026','yes','current',true,'Reseña reciente (12 de septiembre) que confirma con evidencia directa el patrón de limpieza inconsistente en turno de tarde ya identificado como Pérdida Invisible. El negocio respondió en 2 días y el huésped documenta que el problema se resolvió en el momento — evidencia de gestión activa, no de abandono.','Confirmado',false,1),
('4b7a1e10-1a11-4e4a-8b1a-9c2c6c9a1002','4265d1bb-8698-4b72-8bfa-39536243cdb4','Google','https://www.google.com/maps/place/Days+Inn+by+Wyndham+Marietta+White+Water/@33.9607494,-84.5299952,17z','Marcus T.','28 de agosto de 2026',5,'Excelente atención del personal, sobre todo Denise en recepción. La ubicación es muy conveniente cerca de la autopista. Volveríamos sin duda.',null,null,'not_evident','current',true,'Reseña positiva reciente que corrobora el patrón de fortaleza detectado en el personal — mencionada por nombre propio (Denise), lo cual añade credibilidad a la señal.','Confirmado',false,2);

insert into evidence_record_issues (evidence_record_id, category, severity) values
('4b7a1e10-1a11-4e4a-8b1a-9c2c6c9a1001','Limpieza','medium');

insert into evidence_record_photos (evidence_record_id, evidence_type, source_url, description, category, impact, analysis, sort_order) values
('4b7a1e10-1a11-4e4a-8b1a-9c2c6c9a1001','photo','https://www.google.com/maps/place/Days+Inn+by+Wyndham+Marietta+White+Water/@33.9607494,-84.5299952,17z','Polvo visible en mesa de noche y rejilla de A/C','limpieza','medium','Corrobora visualmente la queja de limpieza descrita en el texto de la reseña.',1);

--    8b) REAL — reseña de Dawn Yarch (ya investigada en schema_v18,
--        nunca cargada porque la tabla no existía). Se ata al reporte
--        más reciente para que aparezca en el panel actual.
with new_record as (
  insert into evidence_records (
    report_id, source, source_url, author, review_date_label, rating,
    review_text, owner_response, owner_response_date_label,
    resolution_demonstrated, temporal_status, public_persistence,
    analysis, confidence, requires_human_review, sort_order
  )
  values (
    '4265d1bb-8698-4b72-8bfa-39536243cdb4',
    'Google Maps',
    'https://www.google.com/maps/place/Days+Inn+by+Wyndham+Marietta+White+Water',
    'Dawn Yarch',
    'Hace aproximadamente 3 años',
    1,
    'No sé a quién le pagan por las reseñas, pero esta habitación era asquerosa. Como viajera cansada, revisé las reseñas antes de reservar. Era la más cercana y la que tenía mejores reseñas. Las puertas de las habitaciones de arriba parecían haber sido pateadas varias veces, a juzgar por la pintura. La habitación estaba sucia. Vean las fotos. Quería cambiar de habitación para ver si tal vez era solo la habitación, pero mi esposo estaba agotado. La lámpara estaba rota. Las paredes son delgadas. Los vecinos dejaron la televisión encendida toda la noche. Había insectos muertos en varios lugares. Alguien había dejado uñas postizas detrás de la cama. El tope de la puerta se desprendió en nuestra mano y tuvimos que volver a colocarlo para que mi hijo pequeño no se lastimara. La cama estaba limpia, aunque el faldón tenía una mancha desconocida. Las sábanas estaban limpias y no vi señales de chinches. Así que, si están agotados y de viaje, sigan conduciendo y busquen algo mejor.',
    'Gracias por tomarse el tiempo para contarnos sobre su experiencia en Days Inn by Wyndham Marietta White Water.',
    'Hace aproximadamente 3 años',
    'not_evident',
    'historical',
    true,
    'Esta evidencia documenta una experiencia altamente negativa ocurrida aproximadamente hace tres años. La antigüedad impide concluir que las condiciones descritas continúen actualmente — el patrón de limpieza detectado en los reportes recientes es de menor severidad y ya está en el Plan de Acción. Sin embargo, el contenido negativo permanece públicamente accesible y constituye una exposición reputacional persistente. La respuesta del propietario confirma que hubo respuesta pública, pero no demuestra por sí misma que las condiciones hayan sido corregidas en su momento.',
    'Estimado',
    true,
    0
  )
  returning id
)
insert into evidence_record_issues (evidence_record_id, category, severity)
select id, category, severity::text
from new_record, (values
  ('Limpieza', 'critical'),
  ('Mantenimiento', 'critical'),
  ('Habitación', 'critical'),
  ('Servicio', 'critical'),
  ('Ruido', 'high')
) as t(category, severity);

-- 9) Notificación (DEMO) — una campanita sin nada nuevo se ve "muerta"
--    en una demo en vivo; se agrega una notificación sin leer avisando
--    del reporte más reciente.
insert into notifications (client_id, title, message, read, created_at) values
('a2cf8e02-445a-47f9-9e5a-b5cfcad9aa80','Tu nuevo reporte ya está disponible','Tu VIS Score subió a 55/100 (+7 desde tu primera medición). Revisa qué cambió en tu panel.', false, '2026-09-18 09:00:00+00');

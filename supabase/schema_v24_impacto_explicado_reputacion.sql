-- =====================================================================
-- REPUTACIÓN: "Por qué esto te afecta tanto" — aplicado 25 sept 2026.
-- =====================================================================
-- El cliente pidió, además del número de reseñas/calificación, una
-- explicación en palabras de por qué las reseñas y fotos de Google
-- Maps pesan tanto para SU tipo de negocio en particular (no un texto
-- genérico de "las reseñas importan"). Se agrega como un campo de
-- texto por reporte, redactado a mano según el tipo de negocio.
--
-- Esto se conecta con el plan del cliente de buscar manualmente en el
-- perfil de Google Maps del cliente las fotos que hayan subido
-- huéspedes en los últimos 3 meses mostrando quejas, y cargarlas como
-- evidencia real en "Evidencia Visual" (visual_evidence /
-- evidence_records — tablas que ya existían, no se crea nada nuevo
-- para eso). Este campo es el texto que acompaña esa evidencia,
-- explicando la magnitud del impacto.
-- =====================================================================

alter table public.reputation_details
  add column if not exists impacto_explicado text;

-- ---------------------------------------------------------------------
-- Demo — Days Inn by Wyndham Marietta White Water
-- (reporte más reciente: 4265d1bb-8698-4b72-8bfa-39536243cdb4)
-- ---------------------------------------------------------------------
update public.reputation_details
set impacto_explicado = 'Para un hotel, Google Maps no es solo un directorio — es el primer punto de comparación real: cuando alguien busca "hoteles cerca de mí", ve varios pines uno al lado del otro con su calificación y foto de portada ANTES de entrar a cualquier página o app de reservas. Una foto reciente de un huésped mostrando un problema (una habitación sucia, una zona deteriorada) pesa más que las fotos oficiales del hotel, porque el buscador la percibe como más "real". Y esas fotos no desaparecen con el tiempo — quedan ahí, visibles junto a las de la competencia, hasta que se suben fotos más recientes y positivas que las opaquen. Por eso no basta con responder reseñas: hay que gestionar activamente qué fotos recientes están representando al hotel en ese primer vistazo.'
where report_id = '4265d1bb-8698-4b72-8bfa-39536243cdb4';

-- =====================================================================
-- IDIOMA DEL PANEL POR CLIENTE — aplicado en Supabase el 27 sept 2026.
-- =====================================================================
-- Requisito pendiente desde hace tiempo: panel bilingüe (ES/EN).
-- Decisión tomada con el cliente: el idioma es FIJO por negocio (se
-- define una sola vez al crearlo en el admin, según en qué idioma
-- prefiere que su hotel/negocio vea el panel) — no hay un botón de
-- cambio de idioma dentro del panel del cliente.
--
-- Esto resuelve también el alcance del contenido: como el idioma no
-- cambia en caliente, cada reporte se redacta directamente en el
-- idioma de ESE cliente al publicarlo (igual que hoy), sin necesidad
-- de mantener dos versiones de cada hallazgo/resumen. Lo que sí se
-- traduce es la interfaz fija del panel (menú, títulos genéricos,
-- botones) — ver lib/i18n.ts.
-- =====================================================================

alter table public.clients
  add column if not exists language text not null default 'es' check (language in ('es', 'en'));

-- ---------------------------------------------------------------------
-- Estado de esta primera entrega (27 sept 2026):
-- - Infraestructura completa: columna language, selector en el
--   formulario de "Nuevo cliente" del admin, lib/i18n.ts con el
--   diccionario ES/EN, getClientLanguage() en lib/queries.ts.
-- - Ya traducidos: el menú lateral completo (PanelSidebarNav) y la
--   página de inicio (app/panel/page.tsx + VisIaPanelInicio recibe el
--   idioma, aunque su contenido interno — VIS Score, tarjetas de
--   métricas — todavía está en español fijo, pendiente de traducir).
-- - Pendiente (próxima entrega): traducir el resto de las ~19 páginas
--   del panel (Reputación, Pérdida Invisible, Valor Oculto, Evidencia,
--   Plan de Acción, Presencia Web, Redes Sociales, etc.) y el contenido
--   interno de VisIaPanelInicio — cada una agrega su propia sección al
--   diccionario en lib/i18n.ts siguiendo el mismo patrón.
-- ---------------------------------------------------------------------

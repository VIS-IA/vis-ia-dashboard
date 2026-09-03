-- =====================================================================
-- IMPACTO ECONÓMICO — regla estructural de VIS IA
-- (aplica a negocios, restaurantes y hoteles por igual)
-- =====================================================================
-- Corre esto UNA VEZ en Supabase: SQL Editor > New query > pega todo >
-- Run.
-- =====================================================================

alter table public.losses add column if not exists monto_estimado numeric;
alter table public.losses add column if not exists moneda text not null default 'USD';
alter table public.losses add column if not exists supuestos text;

alter table public.opportunities add column if not exists monto_estimado numeric;
alter table public.opportunities add column if not exists moneda text not null default 'USD';
alter table public.opportunities add column if not exists supuestos text;

-- ---------------------------------------------------------------------
-- Days Inn (VIS-DIW-260830): no tenemos una tarifa promedio real de
-- habitación en la evidencia recopilada, así que NO se asigna un
-- monto — se deja como "No calculable con la información disponible",
-- tal como pide la regla. El nivel de certeza ya estaba cargado.
-- Si más adelante consigues la tarifa promedio real del hotel, dímelo
-- y calculamos el monto con ese dato real.
-- ---------------------------------------------------------------------

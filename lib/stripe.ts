import Stripe from "stripe";
import type { PlanTier } from "@/lib/plan";

/**
 * Cliente de Stripe para uso exclusivo en el servidor (API routes,
 * webhooks). Nunca se importa desde un componente de cliente ("use client"),
 * porque STRIPE_SECRET_KEY solo debe existir en el entorno del servidor.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2025-02-24.acacia",
});

/**
 * Mapa Price ID -> plan. Estos son los IDs reales de Test Mode creados en
 * el Dashboard de Stripe para VIS IA — Diagnostic, Pro e Intelligence.
 * Cuando se pase a producción real, estos 3 valores cambian por los
 * Price ID de Live Mode.
 */
export const PRICE_TO_PLAN: Record<string, PlanTier> = {
  "price_1UDYkDRyH6YW2bXndyIpavmk": "diagnostic",
  "price_1UDYkjRyH6YW2bXn3Gjh6QfN": "pro",
  "price_1UDYlpRyH6YW2bXn4HrfYfys": "intelligence",
};

/**
 * Mapa inverso: plan -> Price ID, usado al crear la Checkout Session
 * cuando el cliente pulsa "Actualizar a Pro" o "Actualizar a Intelligence".
 */
export const PLAN_TO_PRICE: Record<PlanTier, string> = {
  diagnostic: "price_1UDYkDRyH6YW2bXndyIpavmk",
  pro: "price_1UDYkjRyH6YW2bXn3Gjh6QfN",
  intelligence: "price_1UDYlpRyH6YW2bXn4HrfYfys",
};

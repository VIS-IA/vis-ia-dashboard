"use client";

import { useState } from "react";
import type { PlanTier } from "@/lib/plan";

/**
 * Botón que inicia el pago en Stripe para subir a un plan superior.
 * Nunca decide el plan por su cuenta — solo llama a /api/checkout, que
 * es quien valida y crea la Checkout Session real.
 */
export default function UpgradePlanButton({
  plan,
  label,
}: {
  plan: PlanTier;
  label: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error ?? "No se pudo iniciar el pago. Intenta de nuevo.");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("No se pudo iniciar el pago. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        {loading ? "Redirigiendo a pago..." : label}
      </button>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}

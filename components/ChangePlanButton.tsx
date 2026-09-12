"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PlanTier } from "@/lib/plan";

/**
 * Botón para cambiar de plan cuando el cliente YA tiene una suscripción
 * activa (a diferencia de UpgradePlanButton, que es solo para la primera
 * contratación). Llama a /api/subscription/change, que modifica la
 * suscripción existente en Stripe en vez de crear una nueva.
 */
export default function ChangePlanButton({
  plan,
  label,
}: {
  plan: PlanTier;
  label: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/subscription/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo cambiar el plan. Intenta de nuevo.");
        setLoading(false);
        return;
      }

      setSuccess(data.message ?? "Listo.");
      setLoading(false);
      router.refresh();
    } catch {
      setError("No se pudo cambiar el plan. Intenta de nuevo.");
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
        {loading ? "Procesando..." : label}
      </button>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
      {success && <p className="text-xs text-emerald-600 mt-1.5">{success}</p>}
    </div>
  );
}

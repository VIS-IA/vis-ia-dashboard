"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Confirmación de cancelación de plan. Vive en su propia página
 * (/panel/mi-cuenta/cancelar-plan), reachable solo por un enlace de
 * texto discreto desde Mi Cuenta — nunca un botón junto a los de
 * cambiar de plan — precisamente para que un clic accidental no
 * cancele nada. Además exige marcar una casilla de confirmación antes
 * de habilitar el botón real, como segunda barrera contra errores de
 * teclado/clic.
 */
export default function CancelPlanConfirm({
  alreadyScheduled,
  periodEndLabel,
}: {
  alreadyScheduled: boolean;
  periodEndLabel: string | null;
}) {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(action: "cancel" | "reactivate") {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo procesar la solicitud.");
        setLoading(false);
        return;
      }

      setMessage(data.message ?? "Listo.");
      setLoading(false);
      setConfirmed(false);
      router.refresh();
    } catch {
      setError("No se pudo procesar la solicitud. Intenta de nuevo.");
      setLoading(false);
    }
  }

  if (alreadyScheduled) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-700">
          Ya tienes una cancelación programada
          {periodEndLabel ? ` para el ${periodEndLabel}` : ""}. Hasta esa
          fecha conservas tu plan actual con normalidad.
        </p>
        <button
          onClick={() => handleSubmit("reactivate")}
          disabled={loading}
          className="bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? "Procesando..." : "Deshacer cancelación"}
        </button>
        {error && <p className="text-xs text-red-500">{error}</p>}
        {message && <p className="text-xs text-emerald-600">{message}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-700">
        Al cancelar, conservas tu plan actual hasta el final
        {periodEndLabel ? ` de tu período ya pagado (${periodEndLabel})` : ""}.
        Después de esa fecha, tu cuenta vuelve automáticamente a Diagnostic
        (tu compra única, que ya es tuya de forma permanente) — nunca te
        quedas sin acceso a lo que ya pagaste.
      </p>

      <label className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-0.5"
        />
        Entiendo que esto cancelará la renovación de mi plan.
      </label>

      <button
        onClick={() => handleSubmit("cancel")}
        disabled={!confirmed || loading}
        className="bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        {loading ? "Procesando..." : "Sí, cancelar mi plan"}
      </button>

      {error && <p className="text-xs text-red-500">{error}</p>}
      {message && <p className="text-xs text-emerald-600">{message}</p>}
    </div>
  );
}

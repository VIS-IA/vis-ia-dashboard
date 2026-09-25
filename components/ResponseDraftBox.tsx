"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, RefreshCw, Lock } from "lucide-react";

/**
 * Botón + caja de texto para el borrador de respuesta a una reseña,
 * generado por IA. El cliente siempre copia/edita — nunca se publica
 * solo. Vive dentro de cada tarjeta de "VIS Evidence" en Evidencia
 * Visual.
 */
export default function ResponseDraftBox({
  evidenceRecordId,
  initialDraft,
  canGenerate,
}: {
  evidenceRecordId: string;
  initialDraft: string | null;
  canGenerate: boolean;
}) {
  const [draft, setDraft] = useState(initialDraft);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    setError(null);
    setCopied(false);
    try {
      const res = await fetch("/api/generar-respuesta-resena", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ evidenceRecordId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "No se pudo generar la respuesta.");
        return;
      }
      setDraft(data.draft);
    } catch {
      setError("No se pudo generar la respuesta — intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("No se pudo copiar — selecciona el texto manualmente.");
    }
  }

  if (!canGenerate) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
        <Lock size={12} />
        Generar respuesta sugerida está disponible desde el plan Pro
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {draft ? (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3.5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Borrador de respuesta sugerida
          </p>
          <p className="text-sm text-blue-900 whitespace-pre-wrap">{draft}</p>
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={copy}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-800"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copiado" : "Copiar"}
            </button>
            <button
              onClick={generate}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-800 disabled:opacity-50"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              {loading ? "Generando..." : "Regenerar"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={generate}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg disabled:opacity-50"
        >
          <Sparkles size={12} className={loading ? "animate-pulse" : ""} />
          {loading ? "Generando respuesta..." : "Generar respuesta sugerida"}
        </button>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

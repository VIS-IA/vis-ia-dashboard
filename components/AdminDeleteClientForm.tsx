"use client";

import { useState, useTransition } from "react";
import { deleteClient } from "@/app/admin/(protected)/clientes/[id]/actions";

export default function AdminDeleteClientForm({
  clientId,
  businessName,
}: {
  clientId: string;
  businessName: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const canDelete = confirmText.trim() === businessName;

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteClient(clientId, confirmText);
      // Si todo sale bien, la acción redirige y esta función nunca
      // devuelve un `result` — solo llegamos aquí en caso de error.
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  if (!expanded) {
    return (
      <div className="mt-8 max-w-lg border border-red-200 rounded-xl p-6 bg-red-50/40">
        <p className="text-xs font-semibold uppercase tracking-wide text-red-600 mb-2">
          Zona de peligro
        </p>
        <p className="text-sm text-slate-600 mb-3">
          Borrar este cliente elimina permanentemente su acceso, sus reportes y todo
          su historial. No se puede deshacer.
        </p>
        <button
          onClick={() => setExpanded(true)}
          className="text-sm font-medium text-red-600 hover:text-red-700 underline"
        >
          Eliminar cliente permanentemente
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 max-w-lg border border-red-200 rounded-xl p-6 bg-red-50/40 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
        Zona de peligro
      </p>
      <p className="text-sm text-slate-600">
        Esto borra a <strong>{businessName}</strong> y todos sus reportes, conversaciones
        con VIS y su acceso al panel — de forma permanente. Para confirmar, escribe el
        nombre exacto del negocio:
      </p>
      <input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder={businessName}
        className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-3">
        <button
          onClick={handleDelete}
          disabled={!canDelete || isPending}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg px-4 py-2"
        >
          {isPending ? "Eliminando…" : "Eliminar permanentemente"}
        </button>
        <button
          onClick={() => {
            setExpanded(false);
            setConfirmText("");
            setError(null);
          }}
          className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

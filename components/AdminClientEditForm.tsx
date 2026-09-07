"use client";

import { useState, useTransition } from "react";
import type { AdminClientRow } from "@/lib/adminQueries";
import { updateClient } from "@/app/admin/(protected)/clientes/[id]/actions";

export default function AdminClientEditForm({ client }: { client: AdminClientRow }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  function handleSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateClient(client.id, formData);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Guardado." });
      }
    });
  }

  return (
    <form action={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 max-w-lg">
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Nombre del negocio</label>
        <input
          name="businessName"
          defaultValue={client.businessName}
          required
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Ubicación</label>
        <input
          name="location"
          defaultValue={client.location}
          required
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Nombre de contacto</label>
        <input
          name="contactName"
          defaultValue={client.contactName ?? ""}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Plan</label>
          <select
            name="plan"
            defaultValue={client.plan}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="diagnostic">Diagnostic</option>
            <option value="pro">Pro</option>
            <option value="intelligence">Intelligence</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Estado</label>
          <select
            name="estado"
            defaultValue={client.estado}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="activo">Activo</option>
            <option value="pausado">Pausado</option>
          </select>
        </div>
      </div>

      {message && (
        <p
          className={`text-sm rounded-lg px-3 py-2 ${
            message.type === "success"
              ? "text-emerald-700 bg-emerald-50 border border-emerald-100"
              : "text-red-600 bg-red-50 border border-red-100"
          }`}
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg px-5 py-2.5"
      >
        {isPending ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}

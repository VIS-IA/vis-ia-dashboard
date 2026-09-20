"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/app/admin/(protected)/clientes/nuevo/actions";

export default function AdminNewClientForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createClient(formData);
      // Si todo sale bien, la acción redirige y esta función nunca
      // devuelve un `result` — solo llegamos aquí en caso de error.
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form action={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 max-w-lg">
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Correo del cliente (para su acceso)</label>
        <input
          name="email"
          type="email"
          required
          placeholder="dueño@negocio.com"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-[11px] text-slate-400">
          Le llega una invitación a este correo para que cree su propia contraseña.
        </p>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Nombre del negocio</label>
        <input
          name="businessName"
          required
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Tipo de negocio</label>
          <select
            name="businessType"
            defaultValue="negocio"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="negocio">Negocio</option>
            <option value="restaurante">Restaurante</option>
            <option value="hotel">Hotel</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Plan</label>
          <select
            name="plan"
            defaultValue="diagnostic"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="diagnostic">Diagnostic</option>
            <option value="pro">PRO</option>
            <option value="intelligence">Intelligence</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Ubicación</label>
        <input
          name="location"
          required
          placeholder="Marietta, Georgia"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Nombre de contacto</label>
        <input
          name="contactName"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Teléfono</label>
          <input
            name="phone"
            placeholder="+1 678 000 0000"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Correo de contacto</label>
          <input
            name="contactEmail"
            type="email"
            placeholder="contacto@negocio.com"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Dirección completa</label>
        <input
          name="address"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Notas internas</label>
        <textarea
          name="internalNotes"
          rows={3}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg py-2.5"
      >
        {isPending ? "Creando…" : "Crear cliente y enviar invitación"}
      </button>
    </form>
  );
}

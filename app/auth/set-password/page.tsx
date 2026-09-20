"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

/**
 * Página a la que llega el cliente desde el correo de invitación que le
 * manda el panel de administrador. El enlace del correo ya trae la
 * sesión (Supabase la establece automáticamente al cargar esta página);
 * acá solo le pedimos que elija su propia contraseña — VIS IA nunca la
 * ve ni la define por él.
 */
export default function SetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setReady(true);
    });

    // Por si la sesión ya se había establecido antes de que este efecto
    // corriera (la extensión @supabase/ssr la procesa desde el enlace
    // apenas se crea el cliente).
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (updateError) {
      setError(
        "No se pudo guardar tu contraseña — tu enlace puede haber vencido. Pide uno nuevo a VIS IA."
      );
      return;
    }

    router.push("/panel");
  }

  if (!ready) {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center px-4">
        <p className="text-sm text-slate-500">Verificando tu enlace de acceso…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200 p-8 w-full max-w-sm space-y-4"
      >
        <div className="flex flex-col items-center mb-2">
          <Image src="/logo-vis-ia.png" alt="VIS IA" width={56} height={56} className="mb-3" />
          <h1 className="text-lg font-semibold text-slate-900">Crea tu contraseña</h1>
          <p className="text-sm text-slate-500 mt-1 text-center">
            Último paso para entrar a tu panel de VIS IA.
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Nueva contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Confirma tu contraseña</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg py-2.5"
        >
          {saving ? "Guardando…" : "Guardar y entrar"}
        </button>
      </form>
    </div>
  );
}

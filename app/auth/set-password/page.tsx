"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

// Si en este tiempo no se pudo establecer la sesión, dejamos de
// mostrar "verificando" y avisamos que el enlace no sirvió — nunca
// dejar al cliente esperando sin fin.
const VERIFY_TIMEOUT_MS = 8000;

type Status = "checking" | "ready" | "invalid";

/**
 * Página a la que llega el cliente desde el correo de invitación que le
 * manda el panel de administrador (o desde un enlace de "olvidé mi
 * contraseña"). Soporta los dos formatos de enlace que usa Supabase:
 * - el nuevo, con ?token_hash=...&type=... en la URL (lo verificamos
 *   nosotros mismos con verifyOtp);
 * - el clásico, con los tokens de sesión en el fragmento (#...) de la
 *   URL, que @supabase/ssr detecta solo al crear el cliente.
 * En ambos casos, acá solo le pedimos que elija su propia contraseña —
 * VIS IA nunca la ve ni la define por él.
 */
export default function SetPasswordPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let settled = false;

    function markReady() {
      if (settled) return;
      settled = true;
      setStatus("ready");
    }

    function markInvalid() {
      if (settled) return;
      settled = true;
      setStatus("invalid");
    }

    async function init() {
      const url = new URL(window.location.href);
      const tokenHash = url.searchParams.get("token_hash");
      const type = url.searchParams.get("type") as EmailOtpType | null;
      const errorDescription =
        url.searchParams.get("error_description") ||
        new URLSearchParams(window.location.hash.replace(/^#/, "")).get("error_description");

      if (errorDescription) {
        markInvalid();
        return;
      }

      // Formato nuevo: token_hash + type en la URL — lo verificamos
      // nosotros mismos, esto establece la sesión si el enlace es válido.
      if (tokenHash && type) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type,
        });
        if (!verifyError) {
          markReady();
          return;
        }
        markInvalid();
        return;
      }

      // Formato clásico: @supabase/ssr ya debería haber tomado la sesión
      // del fragmento (#access_token=...) al crear el cliente.
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        markReady();
      }
    }

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) markReady();
    });

    const timeout = setTimeout(markInvalid, VERIFY_TIMEOUT_MS);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timeout);
    };
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

  if (status === "checking") {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center px-4">
        <p className="text-sm text-slate-500">Verificando tu enlace de acceso…</p>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 w-full max-w-sm text-center space-y-2">
          <Image src="/logo-vis-ia.png" alt="VIS IA" width={56} height={56} className="mx-auto mb-2" />
          <h1 className="text-lg font-semibold text-slate-900">Este enlace ya no funciona</h1>
          <p className="text-sm text-slate-500">
            Puede haber vencido o ya haberse usado. Pídele a VIS IA que te envíe uno nuevo.
          </p>
        </div>
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

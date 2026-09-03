"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";

const PROCESSING_MESSAGES = [
  "Verificando acceso…",
  "Analizando credenciales",
  "Preparando tu VIS Intelligence Center…",
  "Cargando información de tu empresa…",
];

const TOTAL_DURATION_MS = 4400;
const MESSAGE_INTERVAL_MS = TOTAL_DURATION_MS / PROCESSING_MESSAGES.length;

function ProcessingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex((i) => Math.min(i + 1, PROCESSING_MESSAGES.length - 1));
    }, MESSAGE_INTERVAL_MS);

    // Arranca la barra de progreso en el siguiente frame para que la
    // transición CSS de 0% -> 100% se anime en vez de aparecer llena.
    const raf = requestAnimationFrame(() => setProgress(100));

    return () => {
      clearInterval(messageTimer);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center px-4">
      <div className="flex flex-col items-center w-full max-w-xs">
        <Image
          src="/logo-vis-ia.png"
          alt="VIS IA Federal Consulting"
          width={80}
          height={80}
          className="mb-6"
        />
        <div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin mb-5" />
        <p
          key={messageIndex}
          className="text-sm text-slate-600 font-medium mb-5 animate-fade-in text-center"
        >
          {PROCESSING_MESSAGES[messageIndex]}
        </p>
        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all ease-linear"
            style={{
              width: `${progress}%`,
              transitionDuration: `${TOTAL_DURATION_MS}ms`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!accepted) {
      setError("Debes aceptar los Términos de Servicio y la Política de Privacidad para continuar.");
      return;
    }

    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setLoading(false);
      setError("Correo o contraseña incorrectos.");
      return;
    }

    // Queda registrado con fecha en la cuenta del cliente — no bloquea
    // el ingreso si falla, solo intenta guardar la constancia.
    try {
      await supabase.rpc("record_terms_acceptance");
    } catch {
      // No pasa nada si falla — no bloquea el acceso al panel.
    }

    // Pantalla de "procesando" antes de entrar al panel — le da al
    // cliente la sensación de que algo real está ocurriendo, en vez
    // de saltar de golpe.
    setProcessing(true);
    setTimeout(() => {
      router.push("/panel");
      router.refresh();
    }, TOTAL_DURATION_MS);
  }

  if (processing) {
    return <ProcessingScreen />;
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center mb-6">
          <Image
            src="/logo-vis-ia.png"
            alt="VIS IA Federal Consulting"
            width={90}
            height={90}
            priority
          />
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 p-8 space-y-5"
        >
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Ingresa a tu panel
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Accede con el correo y contraseña que VIS IA te asignó.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tucorreo@negocio.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 shrink-0"
            />
            <span className="text-xs text-slate-500 leading-relaxed">
              He leído y acepto los{" "}
              <Link
                href="/terminos"
                target="_blank"
                className="underline hover:text-slate-700"
              >
                Términos de Servicio
              </Link>{" "}
              y la{" "}
              <Link
                href="/privacidad"
                target="_blank"
                className="underline hover:text-slate-700"
              >
                Política de Privacidad
              </Link>
              .
            </span>
          </label>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !accepted}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg py-2.5"
          >
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}

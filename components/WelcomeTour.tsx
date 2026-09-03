"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  TrendingUp,
  ClipboardList,
  CheckSquare,
  Sparkles,
  X,
} from "lucide-react";

const STEPS = [
  {
    icon: Sparkles,
    color: "bg-blue-50 text-blue-600",
    title: "Bienvenido a tu panel VIS IA",
    body: "Aquí verás todo lo que VIS IA descubre sobre tu negocio: reputación, oportunidades, riesgos, y un plan de acción claro. Te damos un recorrido rápido de 4 pasos.",
  },
  {
    icon: TrendingUp,
    color: "bg-emerald-50 text-emerald-600",
    title: "Tu VIS Score",
    body: "El círculo que ves en Inicio resume la salud general de tu negocio en un número de 0 a 100. Se actualiza con cada análisis nuevo — nunca lo calculamos sin suficiente evidencia.",
  },
  {
    icon: ClipboardList,
    color: "bg-purple-50 text-purple-600",
    title: "15 Preguntas",
    body: "Es información interna que solo tú conoces sobre tu negocio. Se responde una sola vez y ayuda a VIS IA a comparar lo que tú percibes contra lo que la evidencia pública muestra.",
  },
  {
    icon: CheckSquare,
    color: "bg-amber-50 text-amber-600",
    title: "Plan de Acción",
    body: "Aquí encontrarás qué hacer primero, por qué importa, y cómo saber si funcionó — con la evidencia detrás de cada recomendación. Es la parte más importante del panel.",
  },
];

export default function WelcomeTour() {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState(0);
  const supabase = createClient();

  async function finish() {
    setOpen(false);
    await supabase.rpc("mark_tour_completed");
  }

  if (!open) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 relative">
        <button
          onClick={finish}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${current.color}`}
        >
          <Icon size={22} />
        </div>

        <h2 className="text-base font-semibold text-slate-900 mb-2">
          {current.title}
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          {current.body}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  i === step ? "bg-blue-600" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-5 py-2"
          >
            {isLast ? "Empezar" : "Siguiente"}
          </button>
        </div>
      </div>
    </div>
  );
}

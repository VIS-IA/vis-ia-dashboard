"use client";

import React from "react";
import Link from "next/link";
import {
  Star,
  Sparkles,
  MessageSquare,
  TrendingUp,
  CheckSquare,
  FileText,
  ArrowUp,
  ChevronRight,
  Shield,
  Download,
  ExternalLink,
  Calendar,
  Users,
} from "lucide-react";
import { ICON_MAP } from "@/lib/icons";
import { PanelSidebar } from "@/components/PanelLayout";
import ScoreGauge from "@/components/ScoreGauge";
import NotificationsBell from "@/components/NotificationsBell";
import type { DashboardData } from "@/lib/types";

/**
 * VisIaPanelInicio
 * -----------------
 * Same approved visual design as the original static demo — only the
 * data source changed. All content now comes from the `data` prop
 * (fetched server-side from Supabase for the signed-in client) instead
 * of a hardcoded DEMO_DATA object. JSX/styling is untouched.
 */

const accentClasses: Record<string, string> = {
  blue: "text-blue-600",
  green: "text-emerald-600",
  purple: "text-purple-600",
};

function PriorityPill({ level }: { level: string }) {
  const styles: Record<string, string> = {
    Alta: "bg-red-50 text-red-600",
    Alto: "bg-red-50 text-red-600",
    Media: "bg-amber-50 text-amber-600",
    Medio: "bg-amber-50 text-amber-600",
    Baja: "bg-emerald-50 text-emerald-600",
  };
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
        styles[level] || "bg-slate-100 text-slate-600"
      }`}
    >
      {level}
    </span>
  );
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  return (
    <span className="inline-flex gap-0.5 ml-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          size={14}
          className={i < full ? "fill-amber-400 text-amber-400" : "text-slate-300"}
        />
      ))}
    </span>
  );
}

export default function VisIaPanelInicio({
  data: d,
  onboardingCompleted = false,
}: {
  data: DashboardData;
  onboardingCompleted?: boolean;
}) {
  function downloadReport() {
    const lines = [
      `VIS IA — Reporte de ${d.business.name}`,
      `${d.business.location}  •  ID: ${d.business.visId}`,
      `Último análisis: ${d.lastAnalysis}`,
      "",
      d.visScore.current !== null
        ? `VIS SCORE: ${d.visScore.current}/100 (${d.visScore.status})`
        : "VIS SCORE: PENDIENTE — falta completar las 15 preguntas internas",
      d.visScore.previous !== null && d.visScore.delta !== null
        ? `Anterior: ${d.visScore.previous}/100  •  Cambio: ${d.visScore.delta > 0 ? "+" : ""}${d.visScore.delta}`
        : "",
      `${d.visScore.statusNote}`,
      "",
      `ACCIÓN RECOMENDADA #1: ${d.accionRecomendada.titulo}`,
      d.accionRecomendada.motivo,
      "",
      "MÉTRICAS:",
      ...d.metrics.map(
        (m) => `- ${m.label}: ${m.value}${m.suffix ?? ""} (${m.previous}, ${m.delta})`
      ),
      "",
      "PÉRDIDAS INVISIBLES:",
      ...d.perdidas.map((p) => `- [${p.impacto}] ${p.titulo}: ${p.descripcion}`),
      "",
      "OPORTUNIDADES DE VALOR OCULTO:",
      ...d.oportunidades.map((o) => `- [${o.potencial}] ${o.titulo}: ${o.descripcion}`),
      "",
      "PLAN DE ACCIÓN:",
      ...d.acciones.flatMap((a, i) => {
        const item = [`${i + 1}. [${a.prioridad}] ${a.texto}`];
        if (a.problema) item.push(`   Problema: ${a.problema}`);
        if (a.evidencia) item.push(`   Evidencia: ${a.evidencia}`);
        if (a.causaProbable) item.push(`   Causa probable: ${a.causaProbable}`);
        if (a.detalle) item.push(`   Impacto: ${a.detalle}`);
        if (a.nivelCerteza) item.push(`   Certeza: ${a.nivelCerteza}`);
        if (a.metrica) item.push(`   Métrica de éxito: ${a.metrica}`);
        return item;
      }),
      "",
      "— Este es un resumen del análisis. Para el detalle completo de cada",
      "  sección (Reputación, Experiencia del Cliente, Competencia), entra",
      "  a tu panel VIS IA en línea.",
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VIS-IA-reporte-${d.business.visId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col lg:flex-row text-slate-800">
      {/* Sidebar */}
      <PanelSidebar />

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-4 py-4 lg:px-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 font-semibold text-lg overflow-hidden shrink-0">
              {d.business.logoInitial}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-slate-900 truncate">
                  {d.business.name}
                </h1>
                <CheckSquare size={16} className="text-emerald-500 shrink-0" />
              </div>
              <p className="text-sm text-slate-500">
                {d.business.location} &nbsp;•&nbsp; ID: {d.business.visId}
              </p>
              <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                Perfil público — próximamente <ExternalLink size={11} />
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-3 lg:gap-6 flex-wrap">
            <div className="text-left lg:text-right order-3 lg:order-1 w-full lg:w-auto">
              <p className="text-xs text-slate-400">Último análisis</p>
              <p className="text-sm font-medium text-slate-700">{d.lastAnalysis}</p>
            </div>
            <button
              onClick={downloadReport}
              className="order-1 lg:order-2 flex items-center gap-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg px-3 py-2 hover:bg-slate-50 whitespace-nowrap"
            >
              <Download size={15} /> <span className="hidden sm:inline">Descargar reporte</span>
            </button>
            <div className="order-2 lg:order-3">
              <NotificationsBell />
            </div>
            <div className="order-4 flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  Hola, {d.user.name}
                </p>
                <p className="text-xs text-slate-400">{d.user.role}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 space-y-6">
          {/* Hero: VIS IA Intelligence */}
          <section className="bg-white rounded-2xl border border-slate-200 p-5 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Score */}
            <div>
              <p className="text-blue-600 font-semibold text-sm mb-3">
                VIS IA INTELLIGENCE
              </p>
              <p className="text-sm text-slate-500 mb-4">
                Tu negocio está actualmente en:
              </p>
              <div className="flex items-center gap-5">
                {d.visScore.current !== null ? (
                  <>
                    <ScoreGauge score={d.visScore.current} />
                    <div>
                      <span className="bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full inline-block">
                        {d.visScore.status}
                      </span>
                      <p className="text-xs text-slate-500 mt-2">
                        {d.visScore.statusNote}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                    <span className="bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full inline-block mb-2">
                      PENDIENTE
                    </span>
                    <p className="text-sm text-amber-900">
                      {onboardingCompleted
                        ? "Ya recibimos tus respuestas a las 15 preguntas — VIS IA está terminando de calcular tu VIS Score con esa información."
                        : "El VIS Score se calcula cuando se completen las 15 preguntas — el análisis externo ya está listo, falta tu información interna."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Detected */}
            <div>
              <p className="text-slate-700 font-semibold text-sm mb-4">
                VIS IA detectó:
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                    <ArrowUp className="rotate-180 text-red-500" size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {d.detected.perdidas} PÉRDIDAS INVISIBLES
                    </p>
                    <p className="text-xs text-slate-500">
                      Están afectando tus resultados
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                    <Sparkles className="text-amber-500" size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {d.detected.areas} ÁREAS QUE REQUIEREN ATENCIÓN
                    </p>
                    <p className="text-xs text-slate-500">
                      Podrían convertirse en problemas
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <Star className="text-emerald-500" size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {d.detected.oportunidades} OPORTUNIDADES DE VALOR OCULTO
                    </p>
                    <p className="text-xs text-slate-500">
                      Puedes aprovechar para crecer más
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended action */}
            <div className="bg-emerald-50 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                    <CheckSquare className="text-emerald-600" size={16} />
                  </div>
                  <p className="text-emerald-700 font-semibold text-xs tracking-wide">
                    ACCIÓN RECOMENDADA #1
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-800 mb-1">
                  {d.accionRecomendada.titulo}
                </p>
                <p className="text-sm text-slate-600">{d.accionRecomendada.motivo}</p>
              </div>
              <Link
                href="/panel/plan-accion"
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg py-2.5 flex items-center justify-center gap-1"
              >
                Ver detalle y plan <ChevronRight size={15} />
              </Link>
            </div>
          </section>

          {/* What changed */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-600" />
                <h2 className="text-sm font-semibold text-slate-800">
                  ¿Qué cambió desde tu último análisis?
                </h2>
              </div>
              <Link
                href="/panel/comparacion"
                className="text-xs text-blue-600 font-medium flex items-center gap-1"
              >
                Ver comparación completa <ChevronRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {d.metrics.map((m, idx) => {
                const Icon = ICON_MAP[m.icon_key] ?? TrendingUp;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                      <Icon size={13} className={accentClasses[m.accent]} />
                      {m.label}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-900">
                        {m.value}
                      </span>
                      {m.suffix && (
                        <span className="text-sm text-slate-400">{m.suffix}</span>
                      )}
                      {m.stars != null && <Stars rating={m.stars} />}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-400">{m.previous}</span>
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                        <ArrowUp size={11} /> {m.delta}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Three columns */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pérdidas invisibles */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-red-600 mb-4">
                PÉRDIDAS INVISIBLES PRINCIPALES
              </h3>
              <div className="space-y-4">
                {d.perdidas.map((p, idx) => {
                  const Icon = ICON_MAP[p.icon_key] ?? Users;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                        <Icon size={15} className="text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">
                          {p.titulo}
                        </p>
                        <p className="text-xs text-slate-500">{p.descripcion}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] text-slate-400">Impacto</p>
                        <p className="text-xs font-semibold text-red-600">
                          {p.impacto}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link
                href="/panel/perdidas"
                className="mt-5 text-sm text-red-600 font-medium flex items-center gap-1"
              >
                Ver todas las pérdidas <ChevronRight size={14} />
              </Link>
            </div>

            {/* Oportunidades de valor oculto */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-emerald-600 mb-4">
                OPORTUNIDADES DE VALOR OCULTO
              </h3>
              <div className="space-y-4">
                {d.oportunidades.map((o, idx) => {
                  const Icon = ICON_MAP[o.icon_key] ?? Sparkles;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <Icon size={15} className="text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800">
                          {o.titulo}
                        </p>
                        <p className="text-xs text-slate-500">{o.descripcion}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] text-slate-400">Potencial</p>
                        <p
                          className={`text-xs font-semibold ${
                            o.potencial === "Alto"
                              ? "text-emerald-600"
                              : "text-amber-600"
                          }`}
                        >
                          {o.potencial}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link
                href="/panel/oportunidades"
                className="mt-5 text-sm text-emerald-600 font-medium flex items-center gap-1"
              >
                Ver todas las oportunidades <ChevronRight size={14} />
              </Link>
            </div>

            {/* Próximas acciones prioritarias */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-blue-600 mb-4">
                PRÓXIMAS ACCIONES PRIORITARIAS
              </h3>
              <div className="space-y-4">
                {d.acciones.map((a, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <p className="flex-1 text-sm text-slate-800">{a.texto}</p>
                    <PriorityPill level={a.prioridad} />
                  </div>
                ))}
              </div>
              <Link
                href="/panel/plan-accion"
                className="mt-5 text-sm text-blue-600 font-medium flex items-center gap-1"
              >
                Ver plan de acción completo <ChevronRight size={14} />
              </Link>
            </div>
          </section>

          {/* Footer banner */}
          <section className="bg-blue-50 rounded-2xl border border-blue-100 p-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0">
                <Shield className="text-blue-600" size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  VIS IA está vigilando tu negocio 24/7
                </p>
                <p className="text-xs text-blue-700/80 mt-0.5">
                  Analizamos, detectamos y te mostramos lo que realmente
                  importa para que tomes mejores decisiones.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-xs text-blue-700/70 flex items-center gap-1 justify-end">
                  <Calendar size={12} /> Próximo análisis automático
                </p>
                <p className="text-sm font-semibold text-blue-900">
                  {d.nextAnalysis}
                </p>
              </div>
              <Link
                href="/panel/reportes"
                className="flex items-center gap-2 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded-lg px-4 py-2.5"
              >
                <FileText size={15} /> Ver todos los reportes{" "}
                <ChevronRight size={14} />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Lock, ArrowRight } from "lucide-react";
import PanelLayout from "@/components/PanelLayout";
import UpgradePlanButton from "@/components/UpgradePlanButton";
import { getClientPlan } from "@/lib/queries";
import { PLAN_LABELS, planAtLeast, type PlanTier } from "@/lib/plan";

export const dynamic = "force-dynamic";

interface PlanItem {
  label: string;
  href?: string;
}

interface PlanContent {
  title: string;
  tagline: string;
  items: PlanItem[];
  note?: string;
}

// Contenido informativo de cada plan — lo que el cliente ve al dar clic
// en "Ver todo lo que incluye" desde el menú lateral. La idea es que
// pueda leer todo lo que trae Pro e Intelligence y se motive a subir de
// nivel, aunque hoy no tenga acceso a esas secciones.
const PLAN_CONTENT: Record<PlanTier, PlanContent> = {
  diagnostic: {
    title: "Plan Diagnostic",
    tagline: "La base de tu panel VIS IA: un diagnóstico completo de tu negocio.",
    items: [
      { label: "15 Preguntas internas de diagnóstico", href: "/panel/preguntas" },
      { label: "VIS Score — tu puntaje general", href: "/panel/vis-score" },
      { label: "Pérdida Invisible — lo que te está costando no resolver", href: "/panel/perdidas" },
      { label: "Valor Oculto — oportunidades detectadas", href: "/panel/oportunidades" },
      { label: "Reputación — reseñas y presencia online", href: "/panel/reputacion" },
      { label: "Experiencia del Cliente", href: "/panel/experiencia" },
      { label: "Competencia — cómo te comparas en tu zona", href: "/panel/competencia" },
      { label: "Evidencia Visual", href: "/panel/evidencia" },
      { label: "Plan de Acción con prioridades", href: "/panel/plan-accion" },
      { label: "Reportes descargables", href: "/panel/reportes" },
    ],
  },
  pro: {
    title: "Plan Pro",
    tagline: "Todo lo de Diagnostic, más comparación completa contra tu competencia.",
    items: [
      { label: "Todo lo incluido en el plan Diagnostic" },
      { label: "Comparación Completa — tu negocio frente a la competencia, lado a lado", href: "/panel/comparacion" },
      { label: "1 mes gratis del Asistente VIS (IA) al activarlo por primera vez" },
    ],
  },
  intelligence: {
    title: "Plan Intelligence",
    tagline: "El plan más completo: inteligencia artificial y análisis de tendencias sin límite de tiempo.",
    items: [
      { label: "Todo lo incluido en los planes Diagnostic y Pro" },
      { label: "Asistente VIS (IA) con acceso permanente — pregúntale lo que quieras sobre tu negocio", href: "/panel/asistente" },
      { label: "Análisis de Tendencias — evolución de tu negocio en el tiempo", href: "/panel/tendencias" },
    ],
    note:
      "Seguimos ampliando las funciones avanzadas de Intelligence — lo que ves arriba ya está disponible hoy en tu panel.",
  },
};

export default async function PlanDetailPage({
  params,
}: {
  params: { tier: string };
}) {
  const tier = params.tier as PlanTier;
  if (!(tier in PLAN_CONTENT)) notFound();

  const content = PLAN_CONTENT[tier];
  const plan = await getClientPlan();

  const isCurrent = plan === tier;
  const alreadyIncluded = planAtLeast(plan, tier) && !isCurrent;
  const locked = !planAtLeast(plan, tier);

  return (
    <PanelLayout title={content.title} subtitle={content.tagline}>
      <div className="max-w-2xl space-y-6">
        {isCurrent && (
          <span className="inline-block bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Tu plan actual
          </span>
        )}
        {alreadyIncluded && (
          <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
            Ya incluido en tu plan {PLAN_LABELS[plan]}
          </span>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Qué incluye
          </p>
          <ul className="space-y-3">
            {content.items.map((item) => (
              <li key={item.label} className="flex items-start gap-3">
                {locked ? (
                  <Lock size={18} className="text-slate-300 mt-0.5 shrink-0" />
                ) : (
                  <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                )}
                <span className="text-sm text-slate-700 flex-1">{item.label}</span>
                {item.href && (
                  <Link
                    href={item.href}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0 whitespace-nowrap"
                  >
                    Abrir <ArrowRight size={12} />
                  </Link>
                )}
              </li>
            ))}
          </ul>
          {content.note && (
            <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">{content.note}</p>
          )}
        </div>

        {locked && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 space-y-3">
            <p className="text-sm font-medium text-slate-800">
              Sube al plan {PLAN_LABELS[tier]} para tener acceso a todo esto.
            </p>
            <UpgradePlanButton plan={tier} label={`Subir a ${PLAN_LABELS[tier]}`} />
          </div>
        )}
      </div>
    </PanelLayout>
  );
}

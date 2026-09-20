import { getAssistantContext, getAssistantHistory } from "@/lib/assistant";
import { planAtLeast, hasVisAssistantAccess, visTrialEndsAt } from "@/lib/plan";
import PanelLayout from "@/components/PanelLayout";
import AssistantChat from "@/components/AssistantChat";

export const dynamic = "force-dynamic";

export default async function AsistentePage() {
  const context = await getAssistantContext();

  if (!context) {
    return (
      <PanelLayout title="Asistente IA">
        <p className="text-sm text-slate-500">
          Aún no hay un análisis disponible para tu negocio.
        </p>
      </PanelLayout>
    );
  }

  const isIntelligence = planAtLeast(context.plan, "intelligence");
  const hasAccess = hasVisAssistantAccess(context.plan, context.visTrialStartedAt);

  if (!hasAccess) {
    return (
      <PanelLayout
        title="Asistente IA"
        subtitle={`Asistente de ${context.businessName}`}
      >
        <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl">
          <p className="text-sm text-slate-700">
            Tu mes de prueba gratis de VIS ya terminó. VIS es una funcionalidad del
            plan <strong>Intelligence</strong> — actualiza tu plan para seguir
            teniendo acceso a tu asistente de forma permanente.
          </p>
        </div>
      </PanelLayout>
    );
  }

  const history = await getAssistantHistory(context.clientId, 20);
  const trialEndsAt = !isIntelligence ? visTrialEndsAt(context.visTrialStartedAt) : null;

  return (
    <PanelLayout
      title="Asistente IA"
      subtitle={`Pregúntale sobre el negocio de ${context.businessName}`}
    >
      {!isIntelligence && (
        <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mb-3 max-w-2xl">
          {trialEndsAt
            ? `VIS es una funcionalidad del plan Intelligence — tienes acceso gratis hasta el ${new Date(
                trialEndsAt
              ).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}.`
            : "VIS es una funcionalidad del plan Intelligence — tu negocio tiene acceso gratis por un mes, a partir de tu primer mensaje."}
        </p>
      )}
      <AssistantChat
        initialMessages={history.map((m) => ({ role: m.role, content: m.content }))}
        businessName={context.businessName}
      />
    </PanelLayout>
  );
}

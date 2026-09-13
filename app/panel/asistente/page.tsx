import { getAssistantContext, getAssistantHistory } from "@/lib/assistant";
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

  const history = await getAssistantHistory(context.clientId, 20);

  return (
    <PanelLayout
      title="Asistente IA"
      subtitle={`Pregúntale sobre el negocio de ${context.businessName}`}
    >
      <AssistantChat
        initialMessages={history.map((m) => ({ role: m.role, content: m.content }))}
        businessName={context.businessName}
      />
    </PanelLayout>
  );
}

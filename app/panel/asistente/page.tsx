import { getAssistantContext, getAssistantHistory } from "@/lib/assistant";
import { getClientLanguage } from "@/lib/queries";
import { planAtLeast, hasVisAssistantAccess, visTrialEndsAt } from "@/lib/plan";
import PanelLayout from "@/components/PanelLayout";
import AssistantChat from "@/components/AssistantChat";
import { getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AsistentePage() {
  const [context, language] = await Promise.all([getAssistantContext(), getClientLanguage()]);
  const t = getDictionary(language).asistente;

  if (!context) {
    return (
      <PanelLayout title={t.title}>
        <p className="text-sm text-slate-500">{t.noAnalysis}</p>
      </PanelLayout>
    );
  }

  const isIntelligence = planAtLeast(context.plan, "intelligence");
  const hasAccess = hasVisAssistantAccess(context.plan, context.visTrialStartedAt);

  if (!hasAccess) {
    return (
      <PanelLayout title={t.title} subtitle={t.subtitleFor(context.businessName)}>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl">
          <p className="text-sm text-slate-700">{t.trialEndedBody}</p>
        </div>
      </PanelLayout>
    );
  }

  const history = await getAssistantHistory(context.clientId, 20);
  const trialEndsAt = !isIntelligence ? visTrialEndsAt(context.visTrialStartedAt) : null;

  return (
    <PanelLayout title={t.title} subtitle={t.askAbout(context.businessName)}>
      {!isIntelligence && (
        <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mb-3 max-w-2xl">
          {trialEndsAt
            ? t.trialNoticeWithDate(
                new Date(trialEndsAt).toLocaleDateString(language === "en" ? "en-US" : "es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              )
            : t.trialNoticeNoDate}
        </p>
      )}
      <AssistantChat
        initialMessages={history.map((m) => ({ role: m.role, content: m.content }))}
        businessName={context.businessName}
      />
    </PanelLayout>
  );
}

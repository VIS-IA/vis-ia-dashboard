import { getOnboardingQuestions, getOnboardingStatus, getClientLanguage } from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import OnboardingForm from "@/components/OnboardingForm";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

function formatAnswer(answer: any, t: Dictionary["preguntas"]): string {
  if (!answer) return "—";
  if (answer.antes !== undefined) {
    const parts = [
      answer.antes && `${t.before}: ${answer.antes}`,
      answer.durante && `${t.during}: ${answer.durante}`,
      answer.despues && `${t.after}: ${answer.despues}`,
      answer.cuantificacion && `${t.quantification}: ${answer.cuantificacion}`,
      answer.monto && `${t.amount}: ${answer.monto}`,
      answer.calculo && `${t.calculation}: ${answer.calculo}`,
    ].filter(Boolean);
    return parts.join(" · ") || "—";
  }
  if (Array.isArray(answer.selected)) {
    return [answer.selected.join(", "), answer.texto].filter(Boolean).join(" — ");
  }
  if (answer.selected) {
    return [answer.selected, answer.texto].filter(Boolean).join(" — ");
  }
  return answer.texto || "—";
}

export default async function PreguntasPage() {
  const [questions, status, language] = await Promise.all([
    getOnboardingQuestions(),
    getOnboardingStatus(),
    getClientLanguage(),
  ]);
  const t = getDictionary(language).preguntas;

  if (questions.length === 0) {
    return (
      <PanelLayout title={t.title}>
        <p className="text-sm text-slate-500">{t.emptyConfig}</p>
      </PanelLayout>
    );
  }

  if (status.completed) {
    return (
      <PanelLayout title={t.title} subtitle={t.alreadyAnsweredSubtitle}>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3 max-w-2xl mb-6">
          <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
          <p className="text-sm text-emerald-800">{t.alreadyAnsweredBanner}</p>
        </div>
        <div className="space-y-3 max-w-2xl">
          {questions.map((q, idx) => (
            <div
              key={q.questionKey}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <p className="text-sm font-medium text-slate-800 mb-1">
                {idx + 1}. {q.questionText}
              </p>
              <p className="text-sm text-slate-500">
                {formatAnswer(status.answers[q.questionKey], t)}
              </p>
            </div>
          ))}
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout title={t.title} subtitle={t.subtitle}>
      <OnboardingForm questions={questions} />
    </PanelLayout>
  );
}

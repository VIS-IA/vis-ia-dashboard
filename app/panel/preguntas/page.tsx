import { getOnboardingQuestions, getOnboardingStatus } from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import OnboardingForm from "@/components/OnboardingForm";
import { CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

function formatAnswer(answer: any): string {
  if (!answer) return "—";
  if (answer.antes !== undefined) {
    const parts = [
      answer.antes && `Antes: ${answer.antes}`,
      answer.durante && `Durante: ${answer.durante}`,
      answer.despues && `Después: ${answer.despues}`,
      answer.cuantificacion && `Cuantificación: ${answer.cuantificacion}`,
      answer.monto && `Monto: ${answer.monto}`,
      answer.calculo && `Cálculo: ${answer.calculo}`,
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
  const [questions, status] = await Promise.all([
    getOnboardingQuestions(),
    getOnboardingStatus(),
  ]);

  if (questions.length === 0) {
    return (
      <PanelLayout title="15 Preguntas">
        <p className="text-sm text-slate-500">
          El cuestionario aún no está configurado. Vuelve más tarde.
        </p>
      </PanelLayout>
    );
  }

  if (status.completed) {
    return (
      <PanelLayout
        title="15 Preguntas"
        subtitle="Ya respondiste este cuestionario — gracias"
      >
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3 max-w-2xl mb-6">
          <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
          <p className="text-sm text-emerald-800">
            Tus respuestas ya fueron recibidas y VIS IA las está usando como
            contexto para tu análisis.
          </p>
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
                {formatAnswer(status.answers[q.questionKey])}
              </p>
            </div>
          ))}
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout
      title="15 Preguntas"
      subtitle="Información interna de tu negocio que solo tú conoces — nos ayuda a comparar lo que percibes contra lo que la evidencia muestra"
    >
      <OnboardingForm questions={questions} />
    </PanelLayout>
  );
}

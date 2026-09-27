import Link from "next/link";
import { ClipboardList, ChevronRight } from "lucide-react";
import {
  getDashboardData,
  getOnboardingStatus,
  getTourCompleted,
  getClientPlan,
  getClientLanguage,
} from "@/lib/queries";
import { getDictionary } from "@/lib/i18n";
import VisIaPanelInicio from "@/components/VisIaPanelInicio";
import PanelLayout from "@/components/PanelLayout";
import WelcomeTour from "@/components/WelcomeTour";

// Always fetch fresh data — this is a live client report, not static content.
export const dynamic = "force-dynamic";

export default async function PanelPage() {
  const [data, onboarding, tourCompleted, plan, language] = await Promise.all([
    getDashboardData(),
    getOnboardingStatus(),
    getTourCompleted(),
    getClientPlan(),
    getClientLanguage(),
  ]);
  const t = getDictionary(language).home;

  if (!data) {
    return (
      <PanelLayout title={t.welcomeTitle}>
        {!tourCompleted && <WelcomeTour />}
        <div className="max-w-lg bg-white rounded-2xl border border-slate-200 p-8">
          <h1 className="text-lg font-semibold text-slate-900 mb-2">{t.noReportTitle}</h1>
          <p className="text-sm text-slate-500 mb-6">{t.noReportBody}</p>
          {!onboarding.completed ? (
            <Link
              href="/panel/preguntas"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-5 py-2.5"
            >
              <ClipboardList size={16} />
              {t.answerQuestions}
              <ChevronRight size={14} />
            </Link>
          ) : (
            <p className="text-sm text-emerald-600 font-medium">{t.alreadyAnsweredThanks}</p>
          )}
        </div>
      </PanelLayout>
    );
  }

  return (
    <div>
      {!tourCompleted && <WelcomeTour />}
      {!onboarding.completed && (
        <Link
          href="/panel/preguntas"
          className="flex items-center gap-3 bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 transition-colors"
        >
          <ClipboardList size={16} />
          <span className="text-sm font-medium flex-1 min-w-0">{t.missingQuestionsBanner}</span>
          <ChevronRight size={16} />
        </Link>
      )}
      <VisIaPanelInicio
        data={data}
        onboardingCompleted={onboarding.completed}
        plan={plan}
        language={language}
      />
    </div>
  );
}

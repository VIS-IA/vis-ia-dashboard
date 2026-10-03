import { Lock } from "lucide-react";
import { PLAN_LABELS, type PlanTier } from "@/lib/plan";
import { getDictionary, type Language } from "@/lib/i18n";

export default function UpgradeNotice({
  feature,
  minPlan,
  language = "es",
}: {
  feature: string;
  minPlan: PlanTier;
  language?: Language;
}) {
  const t = getDictionary(language).upgradeNotice;
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 max-w-xl text-center">
      <Lock className="text-slate-400 mx-auto mb-3" size={24} />
      <p className="text-sm font-medium text-slate-700">
        {t.availableFrom(feature, PLAN_LABELS[minPlan])}
      </p>
      <p className="text-sm text-slate-500 mt-1">{t.writeUsOnWhatsapp}</p>
    </div>
  );
}

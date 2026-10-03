import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Lock, ArrowRight } from "lucide-react";
import PanelLayout from "@/components/PanelLayout";
import UpgradePlanButton from "@/components/UpgradePlanButton";
import { getClientPlan, getClientLanguage } from "@/lib/queries";
import { PLAN_LABELS, planAtLeast, type PlanTier } from "@/lib/plan";
import { getDictionary } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function PlanDetailPage({
  params,
}: {
  params: { tier: string };
}) {
  const tier = params.tier as PlanTier;
  const [plan, language] = await Promise.all([getClientPlan(), getClientLanguage()]);
  const t = getDictionary(language).planDetail;
  if (!(tier in t.content)) notFound();

  const content = t.content[tier];

  const isCurrent = plan === tier;
  const alreadyIncluded = planAtLeast(plan, tier) && !isCurrent;
  const locked = !planAtLeast(plan, tier);

  return (
    <PanelLayout title={content.title} subtitle={content.tagline}>
      <div className="max-w-2xl space-y-6">
        {isCurrent && (
          <span className="inline-block bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {t.currentPlanBadge}
          </span>
        )}
        {alreadyIncluded && (
          <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
            {t.alreadyIncludedBadge(PLAN_LABELS[plan])}
          </span>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t.whatsIncluded}
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
                    {t.open} <ArrowRight size={12} />
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
              {t.upgradeToPlan(PLAN_LABELS[tier])}
            </p>
            <UpgradePlanButton plan={tier} label={t.upgradeButton(PLAN_LABELS[tier])} />
          </div>
        )}
      </div>
    </PanelLayout>
  );
}

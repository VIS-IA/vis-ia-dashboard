import { getExperienceDetail, getClientLanguage } from "@/lib/queries";
import PanelLayout from "@/components/PanelLayout";
import { getDictionary, type Language } from "@/lib/i18n";
import { Users, ThumbsUp, ThumbsDown, Globe, MessageSquareText } from "lucide-react";
import type { ExperienceSignal } from "@/lib/types";

export const dynamic = "force-dynamic";

function CertaintyPill({ level }: { level: string }) {
  const styles: Record<string, string> = {
    Confirmado: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Medido: "bg-blue-50 text-blue-700 border-blue-200",
    Estimado: "bg-amber-50 text-amber-700 border-amber-200",
    Potencial: "bg-orange-50 text-orange-700 border-orange-200",
    "No calculable": "bg-slate-100 text-slate-500 border-slate-200",
  };
  return (
    <span
      className={`text-[11px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${
        styles[level] || "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      {level}
    </span>
  );
}

function SignalCard({ signal, language }: { signal: ExperienceSignal; language: Language }) {
  const isReviews = signal.sourceType === "reviews_text";
  const t = getDictionary(language).experiencia;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {isReviews ? (
            <MessageSquareText size={14} className="text-blue-500 shrink-0" />
          ) : (
            <Globe size={14} className="text-purple-500 shrink-0" />
          )}
          <p className="text-xs font-medium text-slate-500 truncate">
            {signal.source} · {isReviews ? t.reviewsAnalyzedLabel : t.platformScoreLabel}
          </p>
        </div>
        {signal.confidence && <CertaintyPill level={signal.confidence} />}
      </div>

      {isReviews ? (
        <div className="flex items-center gap-4 mb-2">
          {signal.reviewsAnalyzed !== null && (
            <span className="text-xs text-slate-500">
              {t.reviewsAnalyzedCount(signal.reviewsAnalyzed)}
            </span>
          )}
          {signal.positiveMentions !== null && (
            <span className="text-xs text-emerald-600 flex items-center gap-1">
              <ThumbsUp size={11} /> {signal.positiveMentions}
            </span>
          )}
          {signal.negativeMentions !== null && (
            <span className="text-xs text-red-500 flex items-center gap-1">
              <ThumbsDown size={11} /> {signal.negativeMentions}
            </span>
          )}
        </div>
      ) : (
        signal.platformScore !== null && (
          <p className="text-2xl font-bold text-slate-900 mb-2">
            {signal.platformScore.toFixed(1)}
            <span className="text-xs text-slate-400 font-normal">
              /{signal.platformScoreScale ?? 10}
            </span>
          </p>
        )
      )}

      {signal.pattern && (
        <p className="text-sm text-slate-700 mb-1">
          <span className="font-medium">{t.detectedPattern} </span>
          {signal.pattern}
        </p>
      )}
      {signal.evidence && (
        <p className="text-xs text-slate-500">{signal.evidence}</p>
      )}
      {signal.analyzedAt && (
        <p className="text-[11px] text-slate-400 mt-2">{t.analyzed(signal.analyzedAt)}</p>
      )}
    </div>
  );
}

export default async function ExperienciaPage() {
  const [detail, language] = await Promise.all([getExperienceDetail(), getClientLanguage()]);
  const t = getDictionary(language).experiencia;

  if (!detail || detail.signals.length === 0) {
    return (
      <PanelLayout title={t.title}>
        <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-lg text-center">
          <Users className="text-blue-400 mx-auto mb-3" size={28} />
          <p className="text-sm font-medium text-slate-800">{t.emptyTitle}</p>
          <p className="text-sm text-slate-500 mt-1">{t.emptyBody}</p>
        </div>
      </PanelLayout>
    );
  }

  // Agrupar por categoría (Limpieza, Servicio, etc.)
  const byCategory = new Map<string, ExperienceSignal[]>();
  for (const s of detail.signals) {
    const list = byCategory.get(s.category) ?? [];
    list.push(s);
    byCategory.set(s.category, list);
  }

  return (
    <PanelLayout title={t.title} subtitle={t.subtitle}>
      <div className="space-y-6 max-w-3xl">
        {Array.from(byCategory.entries()).map(([category, signals]) => (
          <div key={category}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              {category}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {signals.map((s, idx) => (
                <SignalCard key={idx} signal={s} language={language} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-400 mt-6 max-w-3xl">{t.footerNote}</p>
    </PanelLayout>
  );
}

"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { getDictionary, type Language } from "@/lib/i18n";

export default function ShareFindingButton({
  title,
  text,
  language = "es",
}: {
  title: string;
  text: string;
  language?: Language;
}) {
  const [copied, setCopied] = useState(false);
  const t = getDictionary(language).shareButton;

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text });
        return;
      } catch {
        // El usuario canceló el share nativo — no hacemos nada más.
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin permiso de portapapeles — silenciosamente no pasa nada.
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 shrink-0"
      title={t.shareThisFinding}
    >
      {copied ? (
        <>
          <Check size={13} className="text-emerald-600" />
          <span className="text-emerald-600">{t.copied}</span>
        </>
      ) : (
        <>
          <Share2 size={13} />
          <span className="hidden sm:inline">{t.share}</span>
        </>
      )}
    </button>
  );
}

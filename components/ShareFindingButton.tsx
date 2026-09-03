"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareFindingButton({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);

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
      title="Compartir este hallazgo"
    >
      {copied ? (
        <>
          <Check size={13} className="text-emerald-600" />
          <span className="text-emerald-600">Copiado</span>
        </>
      ) : (
        <>
          <Share2 size={13} />
          <span className="hidden sm:inline">Compartir</span>
        </>
      )}
    </button>
  );
}

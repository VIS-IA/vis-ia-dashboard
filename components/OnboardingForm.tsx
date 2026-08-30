"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { OnboardingQuestion, OnboardingAnswerValue } from "@/lib/types";
import { CheckCircle2 } from "lucide-react";

const CUANTIFICACION_OPTIONS = [
  "Sí, tenemos una cifra aproximada",
  "Sí, tenemos una cifra basada en datos",
  "Tenemos algunos datos pero no una cifra",
  "No sabemos cuánto representa",
  "Nunca lo hemos calculado",
];

type FormState = Record<string, Partial<OnboardingAnswerValue> & Record<string, any>>;

export default function OnboardingForm({
  questions,
}: {
  questions: OnboardingQuestion[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState<FormState>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(key: string, patch: Record<string, any>) {
    setForm((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }

  function toggleMulti(key: string, option: string) {
    setForm((prev) => {
      const current: string[] = prev[key]?.selected ?? [];
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [key]: { ...prev[key], selected: next } };
    });
  }

  function isAnswered(q: OnboardingQuestion): boolean {
    const v = form[q.questionKey];
    if (!q.required) return true;
    if (q.responseType === "economic_impact") {
      return !!(v?.antes && v?.durante && v?.despues && v?.cuantificacion);
    }
    if (q.responseType === "single_select") return !!v?.selected;
    if (q.responseType === "multi_select") return !!v?.selected?.length;
    if (q.responseType === "text") return !!v?.texto;
    return false;
  }

  async function handleSubmit() {
    setError(null);
    const missing = questions.filter((q) => !isAnswered(q));
    if (missing.length > 0) {
      setError(
        `Falta responder ${missing.length} pregunta${missing.length > 1 ? "s" : ""}. Revisa las marcadas en rojo.`
      );
      return;
    }

    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Tu sesión expiró, vuelve a iniciar sesión.");
      setSubmitting(false);
      return;
    }

    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!client) {
      setError("No se encontró tu negocio. Contacta a soporte.");
      setSubmitting(false);
      return;
    }

    const rows = questions.map((q) => ({
      client_id: client.id,
      question_key: q.questionKey,
      answer: form[q.questionKey] ?? {},
    }));

    const { error: insertError } = await supabase
      .from("client_onboarding_answers")
      .upsert(rows, { onConflict: "client_id,question_key" });

    if (insertError) {
      setError("Hubo un problema guardando tus respuestas. Intenta de nuevo.");
      setSubmitting(false);
      return;
    }

    const { error: rpcError } = await supabase.rpc("mark_onboarding_completed");
    if (rpcError) {
      setError("Tus respuestas se guardaron, pero hubo un problema al confirmar. Avísanos.");
      setSubmitting(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {questions.map((q, idx) => {
        const answered = isAnswered(q);
        return (
          <div
            key={q.questionKey}
            className={`bg-white rounded-xl border p-5 ${
              !answered && error ? "border-red-300" : "border-slate-200"
            }`}
          >
            <p className="text-sm font-semibold text-slate-800 mb-3">
              {idx + 1}. {q.questionText}
            </p>

            {q.responseType === "single_select" && q.options && (
              <div className="flex flex-wrap gap-2 mb-3">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => update(q.questionKey, { selected: opt })}
                    className={`text-xs px-3 py-1.5 rounded-full border ${
                      form[q.questionKey]?.selected === opt
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {q.responseType === "multi_select" && q.options && (
              <div className="flex flex-wrap gap-2 mb-3">
                {q.options.map((opt) => {
                  const selected: string[] = form[q.questionKey]?.selected ?? [];
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleMulti(q.questionKey, opt)}
                      className={`text-xs px-3 py-1.5 rounded-full border ${
                        selected.includes(opt)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {(q.responseType === "single_select" || q.responseType === "multi_select") &&
              q.hasTextField && (
                <textarea
                  placeholder={q.textFieldLabel ?? "Explique"}
                  value={form[q.questionKey]?.texto ?? ""}
                  onChange={(e) => update(q.questionKey, { texto: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                />
              )}

            {q.responseType === "text" && (
              <textarea
                placeholder={q.textFieldLabel ?? "Su respuesta"}
                value={form[q.questionKey]?.texto ?? ""}
                onChange={(e) => update(q.questionKey, { texto: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            )}

            {q.responseType === "economic_impact" && (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Antes de la experiencia (personas que investigan pero no llegan a ser clientes)
                  </p>
                  <textarea
                    value={form[q.questionKey]?.antes ?? ""}
                    onChange={(e) => update(q.questionKey, { antes: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none"
                    rows={2}
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Durante la experiencia (abandonos, quejas, reembolsos, cancelaciones)
                  </p>
                  <textarea
                    value={form[q.questionKey]?.durante ?? ""}
                    onChange={(e) => update(q.questionKey, { durante: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none"
                    rows={2}
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Después de la experiencia (clientes que probablemente no regresen)
                  </p>
                  <textarea
                    value={form[q.questionKey]?.despues ?? ""}
                    onChange={(e) => update(q.questionKey, { despues: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none"
                    rows={2}
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    ¿Tiene una estimación económica de esto?
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {CUANTIFICACION_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => update(q.questionKey, { cuantificacion: opt })}
                        className={`text-xs px-3 py-1.5 rounded-full border ${
                          form[q.questionKey]?.cuantificacion === opt
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Monto aproximado (si aplica)"
                    value={form[q.questionKey]?.monto ?? ""}
                    onChange={(e) => update(q.questionKey, { monto: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-2"
                  />
                  <input
                    type="text"
                    placeholder="¿Cómo se calculó? (si aplica)"
                    value={form[q.questionKey]?.calculo ?? ""}
                    onChange={(e) => update(q.questionKey, { calculo: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg px-6 py-3"
      >
        <CheckCircle2 size={16} />
        {submitting ? "Guardando…" : "Enviar mis respuestas"}
      </button>
    </div>
  );
}

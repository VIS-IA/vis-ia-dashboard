"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AssistantChat({
  initialMessages,
  businessName,
}: {
  initialMessages: ChatMessage[];
  businessName: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    setError(null);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setSending(true);

    try {
      const res = await fetch("/api/asistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo enviar el mensaje.");
        setSending(false);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setError("No se pudo enviar el mensaje — revisa tu conexión.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 flex flex-col h-[70vh] max-w-2xl">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-slate-400 text-center mt-8">
            Pregúntale a tu asistente sobre el negocio de {businessName} — su reputación,
            su VIS Score, o las oportunidades detectadas en tu último análisis.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-400 rounded-2xl px-4 py-2 text-sm">
              Escribiendo…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="text-xs text-red-500 px-4 pb-2">{error}</p>
      )}

      <div className="border-t border-slate-200 p-3 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Escribe tu pregunta sobre tu negocio..."
          disabled={sending}
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          aria-label="Enviar"
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg p-2.5"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

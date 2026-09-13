import { NextRequest, NextResponse } from "next/server";
import {
  getAssistantContext,
  getAssistantHistory,
  saveAssistantMessage,
  countMessagesThisMonth,
  ASSISTANT_MONTHLY_LIMIT,
} from "@/lib/assistant";
import { planAtLeast } from "@/lib/plan";

/**
 * Endpoint del asistente de IA. Arma el contexto del negocio del
 * cliente que hizo la petición (y solo de ese cliente — nunca de
 * otro), llama a la API de Claude, y guarda la conversación.
 *
 * Usa Claude Haiku: es el modelo más económico de Anthropic y es
 * suficiente para este tipo de conversación — el costo real por
 * cliente al mes es de centavos, no de dólares.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userMessage = String(body?.message ?? "").trim();

    if (!userMessage) {
      return NextResponse.json({ error: "Escribe un mensaje." }, { status: 400 });
    }
    if (userMessage.length > 2000) {
      return NextResponse.json(
        { error: "El mensaje es muy largo — intenta con algo más corto." },
        { status: 400 }
      );
    }

    const context = await getAssistantContext();
    if (!context) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const messageCount = await countMessagesThisMonth(context.clientId);
    if (messageCount >= ASSISTANT_MONTHLY_LIMIT) {
      return NextResponse.json(
        {
          error:
            "Has usado tu límite de conversación con tu asistente este mes — se renueva el próximo mes.",
        },
        { status: 429 }
      );
    }

        if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          error: "El asistente no está disponible en este momento.",
          debug: {
            keyPresent: Boolean(process.env.ANTHROPIC_API_KEY),
            keyLength: (process.env.ANTHROPIC_API_KEY || "").length,
          },
        },
        { status: 503 }
      );
    }

    const history = await getAssistantHistory(context.clientId, 20);

    const factsText =
      context.facts.length > 0
        ? context.facts.map((f) => `- (${f.category}) ${f.fact}`).join("\n")
        : "Ninguno todavía.";

    const learnsFromBusiness = planAtLeast(context.plan, "pro");

    const systemPrompt = `Eres el asistente de IA de VIS IA para el negocio "${context.businessName}" (${context.businessType}, ${context.location}).

REGLAS ESTRICTAS:
- Solo puedes hablar del negocio de este cliente. Si preguntan algo que no tiene que ver con su negocio, dilo claramente y redirige la conversación.
- Nunca inventes cifras, reseñas, ni datos que no estén en la información de abajo. Si no lo sabes, dilo explícitamente ("no tengo ese dato en tu diagnóstico").
- Los "Datos confirmados por el cliente" son cosas que el propio dueño del negocio ha dicho — trátalos como contexto útil, no como verdades absolutas de VIS IA.
- Responde en español, de forma clara y concisa, como un asesor de negocios profesional.
${
  learnsFromBusiness
    ? "- Este cliente tiene plan Pro o Intelligence: puedes sugerirle que comparta más información de su negocio para mejorar el análisis."
    : "- Este cliente tiene plan Diagnostic: solo ayudas a interpretar su diagnóstico ya realizado, no acumulas nueva información de sesión en sesión."
}

INFORMACIÓN DISPONIBLE DE ESTE NEGOCIO:
- VIS Score actual: ${context.visScore !== null ? `${context.visScore}/100` : "aún no calculado"}
- Último análisis: ${context.lastAnalysis ?? "sin reportes publicados todavía"}
- Resumen ejecutivo del último reporte: ${context.resumenEjecutivo ?? "no disponible"}

Datos confirmados por el cliente:
${factsText}`;

    const anthropicMessages = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: userMessage },
    ];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 500,
        system: systemPrompt,
        messages: anthropicMessages,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "El asistente no pudo responder — intenta de nuevo en un momento." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const replyText: string =
      data?.content?.find((block: { type: string }) => block.type === "text")?.text ??
      "No pude generar una respuesta — intenta de nuevo.";

    await saveAssistantMessage(context.clientId, "user", userMessage);
    await saveAssistantMessage(context.clientId, "assistant", replyText);

    return NextResponse.json({ reply: replyText });
  } catch {
    return NextResponse.json(
      { error: "Ocurrió un error — intenta de nuevo." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  getAssistantContext,
  getAssistantHistory,
  saveAssistantMessage,
  countMessagesThisMonth,
  addClientFact,
  ASSISTANT_MONTHLY_LIMIT,
} from "@/lib/assistant";
import { planAtLeast } from "@/lib/plan";

// Nombre de marca del asistente — úsalo en el prompt, nunca lo dejes
// que se autodescriba con otro nombre.
const ASSISTANT_NAME = "VIS";

// Herramienta que el modelo puede invocar cuando el cliente confirma,
// de forma explícita y directa, un dato interno de su negocio (algo
// que solo el dueño/gerente sabe, no información pública que VIS IA
// ya investigó). Nunca se usa para que la IA "decida" un hecho por su
// cuenta — solo para registrar lo que el cliente mismo dijo.
const GUARDAR_DATO_TOOL = {
  name: "guardar_dato_negocio",
  description:
    "Guarda un dato interno del negocio que el cliente acaba de confirmar explícitamente (ej. número de empleados, un costo real, una queja frecuente que reciben en persona). Úsala solo cuando el cliente lo haya dicho directamente en este mensaje — nunca para inferir o adivinar.",
  input_schema: {
    type: "object" as const,
    properties: {
      categoria: {
        type: "string" as const,
        description: "Categoría corta del dato, ej. 'operaciones', 'finanzas', 'personal', 'clientes'.",
      },
      dato: {
        type: "string" as const,
        description: "El hecho tal como lo confirmó el cliente, en una frase clara.",
      },
    },
    required: ["categoria", "dato"],
  },
};

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
        { error: "El asistente no está disponible en este momento." },
        { status: 503 }
      );
    }   

    const history = await getAssistantHistory(context.clientId, 20);

    const factsText =
      context.facts.length > 0
        ? context.facts.map((f) => `- (${f.category}) ${f.fact}`).join("\n")
        : "Ninguno todavía.";

    const lossesText =
      context.losses.length > 0
        ? context.losses.map((l) => `- [${l.nivel}] ${l.titulo}: ${l.descripcion}`).join("\n")
        : "Ninguna registrada en el reporte.";

    const opportunitiesText =
      context.opportunities.length > 0
        ? context.opportunities.map((o) => `- [${o.nivel}] ${o.titulo}: ${o.descripcion}`).join("\n")
        : "Ninguna registrada en el reporte.";

    const actionsText =
      context.actions.length > 0
        ? context.actions.map((a) => `- [${a.prioridad}] ${a.texto}`).join("\n")
        : "Ninguna registrada en el reporte.";

    const learnsFromBusiness = planAtLeast(context.plan, "pro");

    const systemPrompt = `Te llamas ${ASSISTANT_NAME}, el asistente de IA de VIS IA para el negocio "${context.businessName}" (${context.businessType}, ${context.location}). Preséntate siempre como ${ASSISTANT_NAME}.

REGLAS ESTRICTAS:
- Solo puedes hablar del negocio de este cliente. Si preguntan algo que no tiene que ver con su negocio, dilo claramente y redirige la conversación.
- Ya tienes el reporte diagnóstico completo de este negocio (ver abajo). NUNCA le pidas al cliente que te comparta o te envíe su reporte — tú ya lo tienes. Si algo puntual no está en la información de abajo, dilo así de simple ("no tengo ese dato en tu diagnóstico"), sin más.
- Nunca inventes cifras, reseñas, ni datos que no estén en la información de abajo.
- Nunca especules sobre problemas técnicos, conexiones, sesiones o cómo estás integrado en el panel — eso no lo puedes verificar y no es tu tema. Si falta un dato, dilo directo, sin teorías sobre la causa.
- No le des la razón automáticamente al cliente si afirma algo que contradice la información que tienes. Sé cortés pero mantente en lo que sabes — no cambies de postura solo porque el cliente insiste.
- Si el cliente insiste en algo que no puedes confirmar o resolver, dile que contacte directamente al equipo de VIS IA — sin inventar el motivo por el que tú no puedes resolverlo.
- Los "Datos confirmados por el cliente" son cosas que el propio dueño del negocio ha dicho — trátalos como contexto útil, no como verdades absolutas de VIS IA.
- Responde en español, de forma clara, concisa y profesional — como un asesor de negocios serio, no como un chatbot de ventas. Evita el exceso de emojis y el entusiasmo forzado.
${
  learnsFromBusiness
    ? `- Este cliente tiene plan Pro o Intelligence: cuando el cliente confirme explícitamente un dato interno de su negocio que tú no tenías (algo que solo el dueño/gerente sabría, no información pública), usa la herramienta guardar_dato_negocio para recordarlo. Pídelo de a poco, una cosa a la vez según evoluciona la conversación — nunca hagas una lista de preguntas de golpe. No la uses para datos que ya están en el reporte, ni para nada que el cliente no haya confirmado directamente. Siempre responde también con texto normal al cliente, incluso cuando uses la herramienta.`
    : "- Este cliente tiene plan Diagnostic: solo ayudas a interpretar su diagnóstico ya realizado, no acumulas nueva información de sesión en sesión."
}

INFORMACIÓN DISPONIBLE DE ESTE NEGOCIO:
- VIS Score actual: ${context.visScore !== null ? `${context.visScore}/100` : "aún no calculado"}
- Último análisis: ${context.lastAnalysis ?? "sin reportes publicados todavía"}
- Resumen ejecutivo del último reporte: ${context.resumenEjecutivo ?? "no disponible"}

Pérdidas invisibles detectadas:
${lossesText}

Oportunidades de valor oculto:
${opportunitiesText}

Plan de acción recomendado:
${actionsText}

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
        max_tokens: 700,
        system: systemPrompt,
        messages: anthropicMessages,
        ...(learnsFromBusiness ? { tools: [GUARDAR_DATO_TOOL] } : {}),
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "El asistente no pudo responder — intenta de nuevo en un momento." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const contentBlocks: { type: string; text?: string; name?: string; input?: { categoria?: string; dato?: string } }[] =
      data?.content ?? [];

    const replyText: string =
      contentBlocks
        .filter((block) => block.type === "text" && block.text)
        .map((block) => block.text)
        .join("\n\n") || "No pude generar una respuesta — intenta de nuevo.";

    // Guarda cualquier dato que el cliente haya confirmado en este turno.
    const factWrites = contentBlocks
      .filter((block) => block.type === "tool_use" && block.name === "guardar_dato_negocio" && block.input?.dato)
      .map((block) =>
        addClientFact(context.clientId, block.input!.categoria || "general", block.input!.dato!)
      );
    if (factWrites.length > 0) {
      await Promise.all(factWrites);
    }

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

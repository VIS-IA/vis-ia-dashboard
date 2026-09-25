import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { planAtLeast, type PlanTier } from "@/lib/plan";

/**
 * Genera un borrador de respuesta a una reseña real, para que el
 * cliente lo copie/edite y publique él mismo (no se publica solo).
 *
 * Igual que /api/asistente: llama a Claude Haiku directamente con
 * fetch, sin SDK — el costo por respuesta es de centavos.
 *
 * Seguridad: la lectura de la reseña (evidence_records) pasa por el
 * cliente de Supabase con la sesión del usuario, así que RLS ya
 * garantiza que solo puede pedir un borrador de UNA reseña que
 * pertenezca a su propio negocio. El guardado del borrador usa el
 * cliente admin (evidence_records no tiene policy de UPDATE para el
 * rol cliente) — pero solo después de que la lectura scoped por RLS
 * confirmó que el registro es suyo.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const evidenceRecordId = String(body?.evidenceRecordId ?? "").trim();
    if (!evidenceRecordId) {
      return NextResponse.json({ error: "Falta el identificador de la reseña." }, { status: 400 });
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const { data: client } = await supabase
      .from("clients")
      .select("id, business_name, business_type, plan")
      .eq("user_id", user.id)
      .single();
    if (!client) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const plan = (client.plan as PlanTier) ?? "diagnostic";
    if (!planAtLeast(plan, "pro")) {
      return NextResponse.json(
        { error: "Generar respuestas sugeridas es una funcionalidad del plan Pro e Intelligence." },
        { status: 403 }
      );
    }

    // Lectura scoped por RLS — si el registro no es de este cliente,
    // esto devuelve null y cortamos acá.
    const { data: record } = await supabase
      .from("evidence_records")
      .select("id, source, author, rating, review_text, owner_response")
      .eq("id", evidenceRecordId)
      .maybeSingle();

    if (!record) {
      return NextResponse.json({ error: "No se encontró esa reseña." }, { status: 404 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "El generador de respuestas no está disponible en este momento." },
        { status: 503 }
      );
    }

    const systemPrompt = `Redactas borradores de respuesta a reseñas públicas para el negocio "${client.business_name}" (${client.business_type}), en nombre de la gerencia.

REGLAS ESTRICTAS:
- Usa SOLO lo que la reseña realmente dice. Nunca inventes detalles, nombres, fechas ni promesas concretas (ej. no prometas un reembolso, descuento o fecha exacta de arreglo salvo que el cliente te lo haya confirmado).
- Responde en el mismo idioma en que está escrita la reseña.
- Tono profesional y empático, nunca defensivo ni genérico ("lamentamos su experiencia" a secas no sirve) — nombra específicamente 1-2 puntos concretos que la reseña menciona.
- Si la reseña es negativa: reconoce el problema puntual, evita excusas, invita a que vuelvan a darle una oportunidad al negocio o a contactar directamente para resolverlo.
- Si la reseña es positiva: agradece algo específico que mencionó, sin sonar como plantilla copiada.
- 3 a 5 oraciones. Sin emojis. Firma como "La Gerencia" al final.
- Responde ÚNICAMENTE con el texto de la respuesta — sin comillas, sin explicación previa, sin encabezados.`;

    const userPrompt = `Reseña (${record.source}${record.rating !== null ? `, ${record.rating}/5` : ""}${record.author ? `, de ${record.author}` : ""}):
"${record.review_text}"
${record.owner_response ? `\nYa existe una respuesta anterior del propietario a esta misma reseña: "${record.owner_response}" — si aplica, redacta un borrador NUEVO y distinto, no lo repitas.` : ""}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 400,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "No se pudo generar la respuesta — intenta de nuevo en un momento." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const contentBlocks: { type: string; text?: string }[] = data?.content ?? [];
    const draft = contentBlocks
      .filter((b) => b.type === "text" && b.text)
      .map((b) => b.text)
      .join("\n")
      .trim();

    if (!draft) {
      return NextResponse.json(
        { error: "No se pudo generar la respuesta — intenta de nuevo." },
        { status: 502 }
      );
    }

    const generatedAt = new Date().toISOString();
    const supabaseAdmin = createAdminClient();
    await supabaseAdmin
      .from("evidence_records")
      .update({ suggested_response: draft, suggested_response_generated_at: generatedAt })
      .eq("id", evidenceRecordId);

    return NextResponse.json({ draft, generatedAt });
  } catch {
    return NextResponse.json({ error: "Ocurrió un error — intenta de nuevo." }, { status: 500 });
  }
}

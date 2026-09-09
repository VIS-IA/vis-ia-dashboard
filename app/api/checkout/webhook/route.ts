import { NextRequest, NextResponse } from "next/server";
import { stripe, PRICE_TO_PLAN } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

export const runtime = "nodejs";

/**
 * Webhook de Stripe. Escucha checkout.session.completed y actualiza el
 * plan del cliente en Supabase usando la Service Role Key (este código
 * corre sin sesión de usuario — Stripe le habla directo al servidor).
 * Nunca confía en el plan que venga del frontend: siempre vuelve a
 * consultar el Price ID real de la sesión de Stripe antes de escribir
 * el plan, para que nadie pueda manipular esto desde el navegador.
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Falta configuración del webhook." },
      { status: 400 }
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Firma de webhook inválida:", err);
    return NextResponse.json({ error: "Firma inválida." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const clientId = session.client_reference_id ?? session.metadata?.clientId;

    if (!clientId) {
      console.error(
        "checkout.session.completed sin client_reference_id ni metadata.clientId"
      );
      return NextResponse.json({ received: true });
    }

    try {
      // Vuelve a consultar la Checkout Session con sus line items para
      // confirmar el Price ID real cobrado, en vez de confiar en el
      // metadata que pudo haber sido manipulado desde el navegador.
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items"],
      });
      const priceId = fullSession.line_items?.data[0]?.price?.id;
      const plan = priceId ? PRICE_TO_PLAN[priceId] : undefined;

      if (!plan) {
        console.error(
          "No se pudo determinar el plan a partir del Price ID:",
          priceId
        );
        return NextResponse.json({ received: true });
      }

      const supabaseAdmin = createAdminClient();
      const { error } = await supabaseAdmin
        .from("clients")
        .update({ plan })
        .eq("id", clientId);

      if (error) {
        console.error("Error actualizando el plan del cliente:", error);
      }
    } catch (err) {
      console.error("Error procesando checkout.session.completed:", err);
    }
  }

  return NextResponse.json({ received: true });
}

import { NextRequest, NextResponse } from "next/server";
import { stripe, PRICE_TO_PLAN } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PlanTier } from "@/lib/plan";
import type Stripe from "stripe";

export const runtime = "nodejs";

/**
 * Deriva el plan (diagnostic/pro/intelligence) del primer price activo de
 * una suscripción de Stripe. undefined si el price no está en nuestro
 * catálogo (no debería pasar en condiciones normales).
 */
function planFromSubscription(subscription: Stripe.Subscription): PlanTier | undefined {
  const priceId = subscription.items.data[0]?.price?.id;
  return priceId ? PRICE_TO_PLAN[priceId] : undefined;
}

/**
 * Sincroniza el estado real de una suscripción de Stripe hacia Supabase.
 * Se usa tanto para checkout.session.completed (primera vez) como para
 * customer.subscription.updated (cambios de plan, renovaciones, etc.) —
 * Stripe es siempre la fuente de verdad, Supabase solo refleja su estado.
 *
 * `pending_plan` se limpia automáticamente en cuanto el plan activo de la
 * suscripción coincide con lo que estaba pendiente: así es como sabemos
 * que una bajada de plan programada (via Subscription Schedule) ya entró
 * en vigor al terminar el período pagado.
 */
async function syncSubscriptionToSupabase(subscription: Stripe.Subscription) {
  const plan = planFromSubscription(subscription);
  if (!plan) {
    console.error(
      "No se pudo determinar el plan de la suscripción:",
      subscription.id
    );
    return;
  }

  const supabaseAdmin = createAdminClient();

  // Busca primero por stripe_subscription_id (caso normal); si todavía no
  // se había guardado (carrera con el primer checkout.session.completed),
  // busca por stripe_customer_id como respaldo.
  const { data: existing } = await supabaseAdmin
    .from("clients")
    .select("id, pending_plan")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();

  const clientRow =
    existing ??
    (
      await supabaseAdmin
        .from("clients")
        .select("id, pending_plan")
        .eq("stripe_customer_id", subscription.customer as string)
        .maybeSingle()
    ).data;

  if (!clientRow) {
    console.error(
      "No se encontró cliente para la suscripción:",
      subscription.id
    );
    return;
  }

  const { error } = await supabaseAdmin
    .from("clients")
    .update({
      plan,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      subscription_status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      // Si lo que estaba pendiente ya es el plan activo, la bajada
      // programada ya se aplicó — se limpia. Si no, se deja como está
      // (puede seguir pendiente, o no haber ninguna bajada programada).
      pending_plan: clientRow.pending_plan === plan ? null : clientRow.pending_plan,
    })
    .eq("id", clientRow.id);

  if (error) {
    console.error("Error sincronizando suscripción en Supabase:", error);
  }
}

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

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clientId = session.client_reference_id ?? session.metadata?.clientId;

        if (!clientId) {
          console.error(
            "checkout.session.completed sin client_reference_id ni metadata.clientId"
          );
          break;
        }

        if (session.mode === "subscription" && session.subscription) {
          // La suscripción recién creada — se sincroniza con el mismo
          // camino que cualquier otro cambio de suscripción, para no
          // duplicar la lógica de mapear price -> plan.
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          await syncSubscriptionToSupabase(subscription);
          break;
        }

        // Pago único (Diagnostic) — no es una suscripción, se actualiza
        // el plan directo consultando el Price ID real cobrado.
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
          break;
        }

        const supabaseAdmin = createAdminClient();
        const { error } = await supabaseAdmin
          .from("clients")
          .update({
            plan,
            stripe_customer_id: (session.customer as string) ?? null,
          })
          .eq("id", clientId);

        if (error) {
          console.error("Error actualizando el plan del cliente:", error);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscriptionToSupabase(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        // La suscripción terminó de verdad (canceló y ya llegó el final
        // del período, o se canceló de inmediato). El cliente vuelve a lo
        // que ya tiene de forma permanente por Diagnostic — nunca a "sin
        // plan" — porque Diagnostic es un pago único, no algo que expire.
        const subscription = event.data.object as Stripe.Subscription;
        const supabaseAdmin = createAdminClient();
        const { error } = await supabaseAdmin
          .from("clients")
          .update({
            plan: "diagnostic",
            subscription_status: "canceled",
            stripe_subscription_id: null,
            cancel_at_period_end: false,
            pending_plan: null,
            current_period_end: null,
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("Error cerrando suscripción cancelada:", error);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string | null;

        if (subscriptionId) {
          const supabaseAdmin = createAdminClient();
          const { error } = await supabaseAdmin
            .from("clients")
            .update({ subscription_status: "past_due" })
            .eq("stripe_subscription_id", subscriptionId);

          if (error) {
            console.error("Error marcando pago fallido:", error);
          }
        }
        break;
      }

      default:
        // Otros eventos no nos interesan todavía.
        break;
    }
  } catch (err) {
    console.error(`Error procesando evento ${event.type}:`, err);
  }

  return NextResponse.json({ received: true });
}

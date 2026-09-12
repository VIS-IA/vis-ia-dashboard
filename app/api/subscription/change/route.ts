import { NextRequest, NextResponse } from "next/server";
import { stripe, PLAN_TO_PRICE } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { planAtLeast, type PlanTier } from "@/lib/plan";

/**
 * Cambia el plan de una suscripción YA ACTIVA (pro <-> intelligence).
 * A diferencia de /api/checkout (que crea una Checkout Session nueva),
 * esta ruta modifica la suscripción existente en Stripe — nunca crea
 * una segunda suscripción para el mismo cliente.
 *
 * - Subir de plan (pro -> intelligence): cambio inmediato con prorrateo.
 *   Stripe cobra ahora mismo la diferencia proporcional a lo que queda
 *   del período actual. El webhook (customer.subscription.updated)
 *   sincroniza el plan real en Supabase.
 * - Bajar de plan (intelligence -> pro): NO se aplica de inmediato. Se
 *   programa con un Subscription Schedule para que el cambio entre en
 *   vigor justo cuando termine el período ya pagado — así el cliente
 *   no pierde el tiempo que ya pagó del plan superior. Mientras tanto
 *   se guarda `pending_plan` para que el panel le muestre "cambiarás a
 *   Pro el [fecha]".
 *
 * Ni Diagnostic (pago único, no es una suscripción) ni cancelar el
 * plan pasan por aquí — Diagnostic se contrata por /api/checkout, y
 * cancelar por /api/subscription/cancel.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const requestedPlan = body?.plan as PlanTier | undefined;

    if (
      !requestedPlan ||
      (requestedPlan !== "pro" && requestedPlan !== "intelligence")
    ) {
      return NextResponse.json(
        { error: "Plan inválido para cambio de suscripción." },
        { status: 400 }
      );
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
      .select("id, plan, stripe_subscription_id, pending_plan")
      .eq("user_id", user.id)
      .single();

    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
    }

    if (!client.stripe_subscription_id) {
      return NextResponse.json(
        {
          error:
            "No tienes una suscripción activa todavía — usa la opción de contratar un plan.",
        },
        { status: 400 }
      );
    }

    const currentPlan = client.plan as PlanTier;

    if (requestedPlan === currentPlan) {
      return NextResponse.json(
        { error: "Ya tienes este plan." },
        { status: 400 }
      );
    }

    const subscription = await stripe.subscriptions.retrieve(
      client.stripe_subscription_id
    );
    const currentItem = subscription.items.data[0];

    if (!currentItem) {
      return NextResponse.json(
        { error: "No se encontró el detalle de tu suscripción en Stripe." },
        { status: 500 }
      );
    }

    const newPriceId = PLAN_TO_PRICE[requestedPlan];
    const isUpgrade = planAtLeast(requestedPlan, currentPlan);

    if (isUpgrade) {
      // Cambio inmediato: Stripe prorratea automáticamente (comportamiento
      // por defecto de proration_behavior: "create_prorations") — el
      // cliente paga ahora solo la diferencia por lo que resta del período.
      await stripe.subscriptions.update(client.stripe_subscription_id, {
        items: [{ id: currentItem.id, price: newPriceId }],
        proration_behavior: "create_prorations",
      });

      // Si tenía una bajada programada pendiente, ya no aplica — se limpia.
      if (client.pending_plan) {
        const supabaseAdmin = createAdminClient();
        await supabaseAdmin
          .from("clients")
          .update({ pending_plan: null })
          .eq("id", client.id);
      }

      return NextResponse.json({
        message: "Plan actualizado. El cambio ya está activo.",
      });
    }

    // Downgrade: se programa para el final del período ya pagado, nunca
    // de inmediato, para que el cliente no pierda el tiempo que ya pagó.
    let scheduleId = subscription.schedule as string | null;

    if (scheduleId) {
      // Ya existe un Subscription Schedule (por ejemplo, de una bajada
      // programada anterior) — se libera antes de crear uno nuevo, para
      // no dejar dos programaciones compitiendo sobre la misma suscripción.
      await stripe.subscriptionSchedules.release(scheduleId);
    }

    const schedule = await stripe.subscriptionSchedules.create({
      from_subscription: client.stripe_subscription_id,
    });

    const currentPhase = schedule.phases[0];

    await stripe.subscriptionSchedules.update(schedule.id, {
      phases: [
        {
          items: [{ price: currentItem.price.id, quantity: 1 }],
          start_date: currentPhase.start_date,
          end_date: currentPhase.end_date,
        },
        {
          items: [{ price: newPriceId, quantity: 1 }],
        },
      ],
    });

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin
      .from("clients")
      .update({ pending_plan: requestedPlan })
      .eq("id", client.id);

    if (error) {
      console.error("Error guardando pending_plan:", error);
    }

    return NextResponse.json({
      message:
        "Cambio de plan programado. Se aplicará automáticamente cuando termine tu período actual.",
    });
  } catch (err) {
    console.error("Error cambiando de plan:", err);
    return NextResponse.json(
      { error: "No se pudo cambiar el plan. Intenta de nuevo." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { stripe, PLAN_TO_PRICE } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { planAtLeast, type PlanTier } from "@/lib/plan";
import type Stripe from "stripe";

/**
 * Crea una Checkout Session de Stripe para que el cliente actual suba de
 * plan. Solo permite subir (nunca bajar ni "renovar" el mismo plan) —
 * cualquier cambio distinto se maneja manualmente con el equipo de VIS IA,
 * para evitar cobros duplicados o downgrades accidentales desde este botón.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const requestedPlan = body?.plan as PlanTier | undefined;

    if (!requestedPlan || !(requestedPlan in PLAN_TO_PRICE)) {
      return NextResponse.json({ error: "Plan inválido." }, { status: 400 });
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
      .select("id, plan, stripe_customer_id, stripe_subscription_id")
      .eq("user_id", user.id)
      .single();

    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
    }

    const currentPlan = client.plan as PlanTier;

    if (planAtLeast(currentPlan, requestedPlan)) {
      return NextResponse.json(
        { error: "Ya tienes este plan o uno superior." },
        { status: 400 }
      );
    }

    // Esta ruta solo sirve para la PRIMERA vez que un cliente contrata una
    // suscripción (o para Diagnostic, que es pago único). Si ya tiene una
    // suscripción activa, cambiar de plan debe modificarla en vez de crear
    // una segunda — eso lo hace /api/subscription/change, no esta ruta.
    if (client.stripe_subscription_id) {
      return NextResponse.json(
        {
          error:
            "Ya tienes una suscripción activa — usa la opción de cambiar de plan en vez de contratar una nueva.",
        },
        { status: 400 }
      );
    }

    const priceId = PLAN_TO_PRICE[requestedPlan];
    const isOneTime = requestedPlan === "diagnostic";

    const origin =
      request.headers.get("origin") ?? process.env.NEXT_PUBLIC_BASE_URL ?? "";

    const sessionParams: Stripe.Checkout.SessionCreateParams & {
      // El SDK de stripe instalado (v17) es anterior a "managed_payments"
      // en la API de Stripe, así que su tipo aún no lo declara — se
      // extiende aquí en vez de subir la versión mayor del paquete stripe
      // (que arrastraría otros cambios de API sin probar).
      managed_payments?: { enabled: boolean };
    } = {
      mode: isOneTime ? "payment" : "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: client.id,
      metadata: {
        clientId: client.id,
        plan: requestedPlan,
      },
      success_url: `${origin}/panel/mi-cuenta?checkout=success`,
      cancel_url: `${origin}/panel/mi-cuenta?checkout=cancelled`,
      // Si el cliente ya tiene un Customer de Stripe (p. ej. de una compra
      // previa de Diagnostic), se reutiliza en vez de dejar que Checkout
      // cree uno nuevo — así no quedan Customers duplicados para la misma
      // persona en Stripe.
      ...(client.stripe_customer_id
        ? { customer: client.stripe_customer_id }
        : {}),
      // Managed Payments viene activado por defecto en cuentas nuevas de
      // Stripe y exige que cada producto tenga un tax_code específico
      // elegible para ese programa (ver Stripe docs: managed-payments
      // eligibility). Los productos VIS IA (Diagnostic/Pro/Intelligence)
      // no lo tienen configurado y no lo necesitamos — VIS IA no usa el
      // cálculo de impuestos administrado por Stripe. Se desactiva
      // explícitamente para esta sesión en vez de tocar el tax_code de
      // cada producto en el Dashboard.
      managed_payments: { enabled: false },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Error creando Checkout Session:", err);
    return NextResponse.json(
      { error: "No se pudo iniciar el pago. Intenta de nuevo." },
      { status: 500 }
    );
  }
}

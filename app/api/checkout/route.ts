import { NextRequest, NextResponse } from "next/server";
import { stripe, PLAN_TO_PRICE } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { planAtLeast, type PlanTier } from "@/lib/plan";

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
      .select("id, plan")
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

    const priceId = PLAN_TO_PRICE[requestedPlan];
    const isOneTime = requestedPlan === "diagnostic";

    const origin =
      request.headers.get("origin") ?? process.env.NEXT_PUBLIC_BASE_URL ?? "";

    const session = await stripe.checkout.sessions.create({
      mode: isOneTime ? "payment" : "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: client.id,
      metadata: {
        clientId: client.id,
        plan: requestedPlan,
      },
      success_url: `${origin}/panel/mi-cuenta?checkout=success`,
      cancel_url: `${origin}/panel/mi-cuenta?checkout=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Error creando Checkout Session:", err);
    return NextResponse.json(
      { error: "No se pudo iniciar el pago. Intenta de nuevo." },
      { status: 500 }
    );
  }
}

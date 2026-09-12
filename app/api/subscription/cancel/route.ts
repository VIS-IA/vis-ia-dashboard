import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Cancela (o reactiva) la suscripción del cliente actual.
 *
 * Cancelar NUNCA es inmediato: se marca `cancel_at_period_end: true` en
 * Stripe, así que el cliente conserva su plan hasta el final de lo que
 * ya pagó — nunca pierde el tiempo que pagó por adelantado. Cuando ese
 * período termina, Stripe dispara `customer.subscription.deleted` y el
 * webhook regresa al cliente a Diagnostic (su compra única permanente,
 * nunca "sin plan").
 *
 * `action: "reactivate"` deshace una cancelación programada mientras
 * todavía no ha terminado el período — por si el cliente se arrepiente.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body?.action === "reactivate" ? "reactivate" : "cancel";

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const { data: client } = await supabase
      .from("clients")
      .select("id, stripe_subscription_id")
      .eq("user_id", user.id)
      .single();

    if (!client) {
      return NextResponse.json({ error: "Cliente no encontrado." }, { status: 404 });
    }

    if (!client.stripe_subscription_id) {
      return NextResponse.json(
        { error: "No tienes una suscripción activa para cancelar." },
        { status: 400 }
      );
    }

    const cancelAtPeriodEnd = action === "cancel";

    await stripe.subscriptions.update(client.stripe_subscription_id, {
      cancel_at_period_end: cancelAtPeriodEnd,
    });

    // No se espera al webhook para reflejar esto: cancel_at_period_end
    // es una bandera simple (no cambia el plan ni el precio), así que se
    // actualiza aquí directamente para que el panel lo muestre al instante.
    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin
      .from("clients")
      .update({ cancel_at_period_end: cancelAtPeriodEnd })
      .eq("id", client.id);

    if (error) {
      console.error("Error actualizando cancel_at_period_end:", error);
    }

    return NextResponse.json({
      message: cancelAtPeriodEnd
        ? "Tu plan se cancelará al final de tu período actual ya pagado."
        : "Cancelación deshecha — tu plan continuará renovándose normalmente.",
    });
  } catch (err) {
    console.error("Error cancelando/reactivando suscripción:", err);
    return NextResponse.json(
      { error: "No se pudo procesar la solicitud. Intenta de nuevo." },
      { status: 500 }
    );
  }
}

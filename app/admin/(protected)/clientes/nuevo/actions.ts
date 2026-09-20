"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/adminQueries";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Genera un client_code único con el formato VIS-YYMMDD (mismo patrón
 * que los clientes ya existentes). Si dos negocios se dan de alta el
 * mismo día, le agrega una letra (VIS-260920A, VIS-260920B, ...).
 */
async function generateClientCode(
  supabaseAdmin: ReturnType<typeof createAdminClient>
): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const base = `VIS-${yy}${mm}${dd}`;

  let code = base;
  let suffixIndex = 0;
  while (true) {
    const { data } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("client_code", code)
      .maybeSingle();
    if (!data) return code;
    suffixIndex += 1;
    code = `${base}${String.fromCharCode(64 + suffixIndex)}`;
  }
}

/**
 * Da de alta un negocio nuevo: crea su acceso (invitación por correo —
 * el cliente elige su propia contraseña desde ese enlace, VIS IA nunca
 * la ve ni la define) y su fila en `clients`. requireAdmin() se vuelve
 * a verificar aquí mismo, no solo en la página que llama a esta acción,
 * porque una Server Action es un endpoint propio y se puede invocar
 * directamente.
 */
export async function createClient(formData: FormData) {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const businessName = String(formData.get("businessName") ?? "").trim();
  const businessType = String(formData.get("businessType") ?? "negocio");
  const location = String(formData.get("location") ?? "").trim();
  const plan = String(formData.get("plan") ?? "diagnostic");
  const contactName = String(formData.get("contactName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const internalNotes = String(formData.get("internalNotes") ?? "").trim();

  if (!email || !email.includes("@")) {
    return { error: "Escribe un correo válido — ahí llega la invitación de acceso del cliente." };
  }
  if (!businessName || !location) {
    return { error: "Nombre del negocio y ubicación son obligatorios." };
  }
  if (!["negocio", "restaurante", "hotel"].includes(businessType)) {
    return { error: "Tipo de negocio inválido." };
  }
  if (!["diagnostic", "pro", "intelligence"].includes(plan)) {
    return { error: "Plan inválido." };
  }

  const supabaseAdmin = createAdminClient();

  const headersList = headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${proto}://${host}` : process.env.NEXT_PUBLIC_BASE_URL ?? "";

  const { data: invited, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    email,
    { redirectTo: `${origin}/auth/set-password` }
  );

  if (inviteError || !invited?.user) {
    const alreadyExists = inviteError?.message?.toLowerCase().includes("already been registered");
    return {
      error: alreadyExists
        ? "Ya existe una cuenta con ese correo."
        : "No se pudo enviar la invitación de acceso — inténtalo de nuevo.",
    };
  }

  const clientCode = await generateClientCode(supabaseAdmin);

  const { data: newClient, error: insertError } = await supabaseAdmin
    .from("clients")
    .insert({
      user_id: invited.user.id,
      client_code: clientCode,
      business_name: businessName,
      business_type: businessType,
      location,
      plan,
      contact_name: contactName || null,
      phone: phone || null,
      address: address || null,
      contact_email: contactEmail || null,
      internal_notes: internalNotes || null,
    })
    .select("id")
    .single();

  if (insertError || !newClient) {
    // El acceso (auth.users) ya se creó — no lo borramos automáticamente
    // acá; si esto llega a fallar, se revisa a mano en Supabase.
    return {
      error: "Se envió la invitación pero no se pudo guardar el negocio — contacta soporte.",
    };
  }

  redirect(`/admin/clientes/${newClient.id}`);
}

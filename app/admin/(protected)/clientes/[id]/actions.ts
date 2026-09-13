"use server";

import { requireAdmin } from "@/lib/adminQueries";
import { revalidatePath } from "next/cache";

/**
 * Actualiza los campos editables de un cliente desde el panel admin.
 * Vuelve a verificar is_admin() aquí mismo (no solo confiar en que la
 * página que llamó a esto ya lo hizo) — una Server Action es un
 * endpoint propio y puede ser invocada directamente.
 */
export async function updateClient(clientId: string, formData: FormData) {
  const { supabase } = await requireAdmin();

  const plan = String(formData.get("plan") ?? "");
  const estado = String(formData.get("estado") ?? "");
  const businessName = String(formData.get("businessName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const internalNotes = String(formData.get("internalNotes") ?? "").trim();

  if (!["diagnostic", "pro", "intelligence"].includes(plan)) {
    return { error: "Plan inválido." };
  }
  if (!["activo", "pausado"].includes(estado)) {
    return { error: "Estado inválido." };
  }
  if (!businessName || !location) {
    return { error: "Nombre del negocio y ubicación son obligatorios." };
  }

  const { error } = await supabase
    .from("clients")
    .update({
      plan,
      estado,
      business_name: businessName,
      contact_name: contactName || null,
      location,
      phone: phone || null,
      address: address || null,
      contact_email: contactEmail || null,
      internal_notes: internalNotes || null,
    })
    .eq("id", clientId);

  if (error) {
    return { error: "No se pudo guardar — inténtalo de nuevo." };
  }

  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${clientId}`);
  revalidatePath("/admin");
  return { success: true };
}

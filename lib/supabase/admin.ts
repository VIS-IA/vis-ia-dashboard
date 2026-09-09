import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase con la Service Role Key — se salta las reglas de
 * RLS. Uso exclusivo en contextos de servidor sin sesión de usuario
 * (webhooks), nunca en código que corre en el navegador ni se importa
 * desde un componente "use client".
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import VisIaPanelInicio from "@/components/VisIaPanelInicio";
import type { DashboardData } from "@/lib/types";

export default function PanelShell({ data }: { data: DashboardData }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return <VisIaPanelInicio data={data} onSignOut={handleSignOut} />;
}

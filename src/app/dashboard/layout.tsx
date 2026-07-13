import { ReactNode } from "react";
import { DashboardNav } from "@/components/dashboard/nav";
import { ThemeSync } from "@/components/theme/theme-sync";
import { createClient } from "@/lib/supabase/server";
import { temPlano8Semanas, type AnamnesisRecord, type SubscriptionRecord } from "@/lib/types";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: anamnesis }, { data: subscription }] = await Promise.all([
    supabase
      .from("anamnesis")
      .select("genero")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<Pick<AnamnesisRecord, "genero">>(),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle<SubscriptionRecord>(),
  ]);

  const premium = temPlano8Semanas(subscription);

  return (
    <div className="min-h-screen">
      {anamnesis?.genero && <ThemeSync genero={anamnesis.genero} />}
      <DashboardNav premium={premium} />
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}

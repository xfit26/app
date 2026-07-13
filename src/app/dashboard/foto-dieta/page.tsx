import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { LockedFeature } from "@/components/dashboard/locked-feature";
import { FotoDietaForm } from "@/components/dashboard/foto-dieta-form";
import { temPlano8Semanas, type SubscriptionRecord } from "@/lib/types";

export default async function FotoDietaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user!.id)
    .maybeSingle<SubscriptionRecord>();

  if (!temPlano8Semanas(subscription)) {
    return (
      <LockedFeature
        titulo="Foto da dieta"
        descricao="Tire uma foto da sua refeição e deixe a IA estimar calorias e macros na hora."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Foto da dieta</h1>
        <p className="mt-1 text-sm text-muted">
          Envie uma foto da sua refeição para a IA estimar calorias e macros.
        </p>
      </div>
      <Card>
        <FotoDietaForm />
      </Card>
    </div>
  );
}

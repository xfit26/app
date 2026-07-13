import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { LockedFeature } from "@/components/dashboard/locked-feature";
import { SupplementChecker } from "@/components/dashboard/supplement-checker";
import {
  SUPLEMENTOS_COMUNS,
  temPlano8Semanas,
  type SubscriptionRecord,
} from "@/lib/types";

export default async function SuplementosPage() {
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
        titulo="Suplementos"
        descricao="Consulte orientações sobre os principais suplementos e verifique a regularização de um produto específico."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Suplementos</h1>
        <p className="mt-1 text-sm text-muted">
          Consulte os suplementos mais comuns e verifique um produto
          específico.
        </p>
      </div>

      <Card>
        <h2 className="font-semibold">Categorias comuns</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {SUPLEMENTOS_COMUNS.map((s) => (
            <span
              key={s}
              className="rounded-full border border-border px-3 py-1 text-xs"
            >
              {s}
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold">Verificar um produto</h2>
        <p className="mt-1 text-sm text-muted">
          Digite o nome/marca de um suplemento para receber uma orientação
          sobre regularização e pontos de atenção.
        </p>
        <div className="mt-4">
          <SupplementChecker />
        </div>
      </Card>
    </div>
  );
}

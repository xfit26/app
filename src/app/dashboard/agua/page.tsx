import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { WaterLogForm } from "@/components/dashboard/water-log-form";
import type { AnamnesisRecord, WaterLogRecord } from "@/lib/types";

export default async function AguaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const inicioDoDia = new Date();
  inicioDoDia.setHours(0, 0, 0, 0);

  const [{ data: anamnesis }, { data: logsHoje }, { data: ultimosLogs }] = await Promise.all([
    supabase
      .from("anamnesis")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<AnamnesisRecord>(),
    supabase
      .from("water_logs")
      .select("*")
      .eq("user_id", user!.id)
      .gte("created_at", inicioDoDia.toISOString())
      .order("created_at", { ascending: false })
      .returns<WaterLogRecord[]>(),
    supabase
      .from("water_logs")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(10)
      .returns<WaterLogRecord[]>(),
  ]);

  if (!anamnesis) {
    return (
      <Card className="text-center">
        <p className="text-sm text-muted">
          Preencha a anamnese para calcular sua meta diária de água.
        </p>
      </Card>
    );
  }

  const totalHojeMl = (logsHoje ?? []).reduce((acc, l) => acc + l.quantidade_ml, 0);
  const metaMl = anamnesis.agua_ml;
  const percentual = Math.min(100, Math.round((totalHojeMl / metaMl) * 100));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Controle de água</h1>
        <p className="mt-1 text-sm text-muted">
          Meta diária: {(metaMl / 1000).toFixed(1)} L (baseada no seu peso).
        </p>
      </div>

      <Card>
        <div className="flex items-baseline justify-between">
          <p className="text-2xl font-semibold">
            {(totalHojeMl / 1000).toFixed(2)} L
          </p>
          <p className="text-sm text-muted">de {(metaMl / 1000).toFixed(1)} L</p>
        </div>
        <div className="mt-3 h-3 w-full rounded-full bg-border">
          <div
            className="h-3 rounded-full bg-primary transition-all"
            style={{ width: `${percentual}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-muted">{percentual}% da meta de hoje</p>

        <div className="mt-6">
          <WaterLogForm />
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold">Últimos registros</h2>
        {ultimosLogs && ultimosLogs.length > 0 ? (
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {ultimosLogs.map((log) => (
              <li key={log.id} className="flex justify-between text-muted">
                <span>{new Date(log.created_at).toLocaleString("pt-BR")}</span>
                <span>{log.quantidade_ml} ml</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">Nenhum registro ainda.</p>
        )}
      </Card>
    </div>
  );
}

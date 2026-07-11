import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { MealLogForm } from "@/components/dashboard/meal-log-form";
import type { MealLogRecord } from "@/lib/types";

const LABELS: Record<string, string> = {
  cafe_da_manha: "Café da manhã",
  almoco: "Almoço",
  lanche: "Lanche",
  jantar: "Jantar",
  ceia: "Ceia",
  outro: "Outro",
};

export default async function RefeicoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: refeicoes } = await supabase
    .from("meal_logs")
    .select("*")
    .eq("user_id", user!.id)
    .order("horario", { ascending: false })
    .limit(20)
    .returns<MealLogRecord[]>();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Suas refeições</h1>
        <p className="mt-1 text-sm text-muted">
          Registre o que você comeu. Isso ajuda o chat Nutricionista a te dar
          orientações mais precisas.
        </p>
      </div>

      <Card>
        <MealLogForm />
      </Card>

      <div className="flex flex-col gap-2">
        {refeicoes && refeicoes.length > 0 ? (
          refeicoes.map((log) => (
            <Card key={log.id} className="flex items-center justify-between py-3">
              <div>
                <span className="text-sm font-medium">
                  {LABELS[log.refeicao] ?? log.refeicao}
                </span>
                <p className="text-sm text-muted">{log.descricao}</p>
              </div>
              <div className="text-right text-xs text-muted">
                <div>{new Date(log.horario).toLocaleString("pt-BR")}</div>
                {log.calorias_estimadas !== undefined && (
                  <div>{log.calorias_estimadas} kcal</div>
                )}
              </div>
            </Card>
          ))
        ) : (
          <p className="text-sm text-muted">Nenhuma refeição registrada ainda.</p>
        )}
      </div>
    </div>
  );
}

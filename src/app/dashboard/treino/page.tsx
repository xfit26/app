import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { WorkoutPlanRecord } from "@/lib/types";

export default async function TreinoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: workout } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<WorkoutPlanRecord>();

  if (!workout) {
    return (
      <Card className="text-center">
        <h1 className="text-xl font-semibold">Nenhum treino ainda</h1>
        <p className="mt-2 text-sm text-muted">
          Preencha a anamnese para gerar seu primeiro plano de treino.
        </p>
        <Link href="/anamnese">
          <Button className="mt-6">Preencher anamnese</Button>
        </Link>
      </Card>
    );
  }

  const { titulo, resumo, dias } = workout.conteudo;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{titulo}</h1>
        <p className="mt-1 text-sm text-muted">{resumo}</p>
      </div>

      <div className="flex flex-col gap-4">
        {dias.map((dia, i) => (
          <Card key={i}>
            <div className="flex items-baseline justify-between">
              <h2 className="font-semibold">{dia.nome}</h2>
              <span className="text-xs text-muted">{dia.foco}</span>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted">
                    <th className="pb-2 pr-2">Exercício</th>
                    <th className="pb-2 pr-2">Séries</th>
                    <th className="pb-2 pr-2">Repetições</th>
                    <th className="pb-2 pr-2">Descanso</th>
                  </tr>
                </thead>
                <tbody>
                  {dia.exercicios.map((ex, j) => (
                    <tr key={j} className="border-b border-border/60 last:border-0">
                      <td className="py-2 pr-2">
                        {ex.nome}
                        {ex.observacao && (
                          <div className="text-xs text-muted">{ex.observacao}</div>
                        )}
                      </td>
                      <td className="py-2 pr-2">{ex.series}</td>
                      <td className="py-2 pr-2">{ex.repeticoes}</td>
                      <td className="py-2 pr-2">{ex.descanso_seg}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

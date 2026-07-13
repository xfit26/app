import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { ExerciseSubstituteFinder } from "@/components/dashboard/exercise-substitute-finder";
import type { ExerciseRecord } from "@/lib/types";

export default async function SubstituirPage() {
  const supabase = await createClient();

  const { data: exercicios } = await supabase
    .from("exercises")
    .select("*")
    .order("nome")
    .returns<ExerciseRecord[]>();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Academia lotada?</h1>
        <p className="mt-1 text-sm text-muted">
          Selecione o exercício que está ocupado e receba 2 opções que
          aplicam o mesmo estímulo muscular, sem perder o objetivo do treino.
        </p>
      </div>
      <Card>
        <ExerciseSubstituteFinder exercicios={exercicios ?? []} />
      </Card>
    </div>
  );
}

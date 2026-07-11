import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RegenerateButton } from "@/components/dashboard/regenerate-button";
import type {
  AnamnesisRecord,
  DietPlanRecord,
  SubscriptionRecord,
  WorkoutPlanRecord,
} from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: anamnesis } = await supabase
    .from("anamnesis")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<AnamnesisRecord>();

  if (!anamnesis) {
    return (
      <Card className="text-center">
        <h1 className="text-xl font-semibold">Bem-vindo(a)!</h1>
        <p className="mt-2 text-sm text-muted">
          Para gerar seu treino e dieta personalizados, primeiro precisamos
          conhecer você um pouco melhor.
        </p>
        <Link href="/anamnese">
          <Button className="mt-6">Preencher anamnese</Button>
        </Link>
      </Card>
    );
  }

  const [{ data: workout }, { data: diet }, { data: subscription }] = await Promise.all([
    supabase
      .from("workout_plans")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<WorkoutPlanRecord>(),
    supabase
      .from("diet_plans")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<DietPlanRecord>(),
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle<SubscriptionRecord>(),
  ]);

  const assinaturaAtiva = subscription?.status === "active";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Sua visão geral</h1>
          <p className="mt-1 text-sm text-muted">
            Objetivo: {anamnesis.objetivo.replace("_", " ")} · Última
            atualização da anamnese em{" "}
            {new Date(anamnesis.created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <RegenerateButton anamnesisId={anamnesis.id} />
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Card>
          <h2 className="font-semibold">Treino</h2>
          {workout ? (
            <>
              <p className="mt-1 text-sm text-muted">
                {workout.conteudo.titulo}
              </p>
              <p className="mt-1 text-xs text-muted">
                {workout.conteudo.dias.length} dias de treino por semana
              </p>
              <Link href="/dashboard/treino">
                <Button variant="secondary" className="mt-4">
                  Ver treino completo
                </Button>
              </Link>
            </>
          ) : (
            <p className="mt-1 text-sm text-muted">
              Nenhum plano de treino gerado ainda.
            </p>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold">Dieta</h2>
          {diet ? (
            <>
              <p className="mt-1 text-sm text-muted">{diet.conteudo.titulo}</p>
              <p className="mt-1 text-xs text-muted">
                {diet.conteudo.calorias_diarias} kcal/dia ·{" "}
                {diet.conteudo.refeicoes.length} refeições
              </p>
              <Link href="/dashboard/dieta">
                <Button variant="secondary" className="mt-4">
                  Ver dieta completa
                </Button>
              </Link>
            </>
          ) : (
            <p className="mt-1 text-sm text-muted">
              Nenhum plano de dieta gerado ainda.
            </p>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold">Nutricionista</h2>
          <p className="mt-1 text-sm text-muted">
            {assinaturaAtiva
              ? "Converse com a IA sobre alimentação, macros e hábitos."
              : "Assine para conversar com a IA sobre alimentação e macros."}
          </p>
          <Link href={assinaturaAtiva ? "/dashboard/nutricionista" : "/assinar"}>
            <Button variant="secondary" className="mt-4">
              {assinaturaAtiva ? "Abrir chat" : "Assinar"}
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}

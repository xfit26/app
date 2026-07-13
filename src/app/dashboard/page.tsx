import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RegenerateButton } from "@/components/dashboard/regenerate-button";
import { LockBadge } from "@/components/dashboard/locked-feature";
import {
  temPlano8Semanas,
  type AnamnesisRecord,
  type DietPlanRecord,
  type SubscriptionRecord,
  type WorkoutPlanRecord,
} from "@/lib/types";

const OBJETIVO_LABELS: Record<string, string> = {
  emagrecimento: "Emagrecimento / perda de peso",
  definicao: "Definição / preservar massa",
  ganho_massa: "Ganho de massa",
};

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
          Para gerar seu treino e dieta personalizados com o treinador Léo
          Moura, primeiro precisamos conhecer você um pouco melhor.
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

  const premium = temPlano8Semanas(subscription);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Olá, {anamnesis.nome}</h1>
          <p className="mt-1 text-sm text-muted">
            Objetivo: {OBJETIVO_LABELS[anamnesis.objetivo] ?? anamnesis.objetivo} · Meta
            calórica: {Math.round(anamnesis.meta_calorica)} kcal/dia · Água:{" "}
            {(anamnesis.agua_ml / 1000).toFixed(1)} L/dia
          </p>
        </div>
        <RegenerateButton anamnesisId={anamnesis.id} />
      </div>

      {!premium && (
        <Card className="flex items-center justify-between gap-4 border-primary/40 bg-primary/5">
          <div>
            <p className="font-medium">Plano de 8 semanas</p>
            <p className="text-sm text-muted">
              Desbloqueie foto da dieta por IA, módulo de suplementos e
              correção de treino por vídeo.
            </p>
          </div>
          <Link href="/assinar">
            <Button variant="secondary">Fazer upgrade</Button>
          </Link>
        </Card>
      )}

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
          <h2 className="font-semibold">Água</h2>
          <p className="mt-1 text-sm text-muted">
            Meta: {(anamnesis.agua_ml / 1000).toFixed(1)} L/dia
          </p>
          <Link href="/dashboard/agua">
            <Button variant="secondary" className="mt-4">
              Registrar água
            </Button>
          </Link>
        </Card>

        <Card>
          <h2 className="font-semibold">Evolução</h2>
          <p className="mt-1 text-sm text-muted">
            Medidas, % de gordura e fotos de antes/depois.
          </p>
          <Link href="/dashboard/evolucao">
            <Button variant="secondary" className="mt-4">
              Ver evolução
            </Button>
          </Link>
        </Card>

        <Card>
          <h2 className="font-semibold">Treinador</h2>
          <p className="mt-1 text-sm text-muted">
            Tire dúvidas sobre o seu treino com o Léo Moura.
          </p>
          <Link href="/dashboard/treinador">
            <Button variant="secondary" className="mt-4">
              Abrir chat
            </Button>
          </Link>
        </Card>

        <Card>
          <h2 className="font-semibold flex items-center gap-1.5">
            Foto da dieta {!premium && <LockBadge />}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Estime calorias e macros a partir de uma foto da refeição.
          </p>
          <Link href="/dashboard/foto-dieta">
            <Button variant="secondary" className="mt-4">
              {premium ? "Abrir" : "Desbloquear"}
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}

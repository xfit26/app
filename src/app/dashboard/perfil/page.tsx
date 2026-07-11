import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AnamnesisRecord } from "@/lib/types";

const OBJETIVO_LABELS: Record<string, string> = {
  emagrecimento: "Emagrecimento",
  hipertrofia: "Hipertrofia (ganho de massa)",
  resistencia: "Resistência / condicionamento",
  forca: "Força",
  saude_geral: "Saúde geral / bem-estar",
};

export default async function PerfilPage() {
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Perfil</h1>
        <p className="mt-1 text-sm text-muted">{user?.email}</p>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Sua anamnese</h2>
          <Link href="/anamnese">
            <Button variant="secondary">Refazer anamnese</Button>
          </Link>
        </div>

        {anamnesis ? (
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <Info label="Idade" value={`${anamnesis.idade} anos`} />
            <Info label="Altura" value={`${anamnesis.altura_cm} cm`} />
            <Info label="Peso" value={`${anamnesis.peso_kg} kg`} />
            <Info
              label="Objetivo"
              value={OBJETIVO_LABELS[anamnesis.objetivo] ?? anamnesis.objetivo}
            />
            <Info label="Experiência" value={anamnesis.nivel_experiencia} />
            <Info
              label="Disponibilidade"
              value={`${anamnesis.dias_disponiveis}x/semana, ${anamnesis.tempo_por_sessao_min}min`}
            />
            <Info label="Local de treino" value={anamnesis.local_treino} />
            <Info
              label="Refeições/dia"
              value={String(anamnesis.refeicoes_por_dia)}
            />
            <Info
              label="Restrições alimentares"
              value={
                anamnesis.restricoes_alimentares.length
                  ? anamnesis.restricoes_alimentares.join(", ")
                  : "Nenhuma"
              }
            />
          </dl>
        ) : (
          <p className="mt-4 text-sm text-muted">
            Você ainda não preencheu a anamnese.
          </p>
        )}
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium capitalize">{value}</dd>
    </div>
  );
}

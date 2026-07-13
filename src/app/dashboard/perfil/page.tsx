import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AnamnesisRecord } from "@/lib/types";

const OBJETIVO_LABELS: Record<string, string> = {
  emagrecimento: "Emagrecimento / perda de peso",
  definicao: "Definição / preservar massa",
  ganho_massa: "Ganho de massa",
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
            <Info label="Nome" value={anamnesis.nome} />
            <Info label="Gênero" value={anamnesis.genero} />
            <Info label="Idade" value={`${anamnesis.idade} anos`} />
            <Info label="Altura" value={`${anamnesis.altura_cm} cm`} />
            <Info label="Peso" value={`${anamnesis.peso_kg} kg`} />
            <Info
              label="Objetivo"
              value={OBJETIVO_LABELS[anamnesis.objetivo] ?? anamnesis.objetivo}
            />
            <Info label="Nível de atividade física" value={anamnesis.nivel_experiencia} />
            <Info
              label="Frequência de treino"
              value={`${anamnesis.frequencia_treino}x/semana`}
            />
            <Info
              label="Aeróbico"
              value={
                anamnesis.dias_aerobico === 0
                  ? "Nenhum dia"
                  : `${anamnesis.dias_aerobico} dia(s)/semana`
              }
            />
            <Info label="Local de treino" value={anamnesis.local_treino} />
            <Info label="TMB" value={`${Math.round(anamnesis.tmb)} kcal`} />
            <Info label="Meta calórica" value={`${Math.round(anamnesis.meta_calorica)} kcal/dia`} />
            <Info label="Meta de água" value={`${(anamnesis.agua_ml / 1000).toFixed(1)} L/dia`} />
            <Info label="Tipo de dieta" value={anamnesis.tipo_dieta} />
            <Info
              label="Refeições/dia"
              value={String(anamnesis.refeicoes_por_dia)}
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

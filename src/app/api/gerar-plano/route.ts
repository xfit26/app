import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { gerarPlanoComIA } from "@/lib/ai/openai";
import { anamnesisSchema, type AnamnesisRecord } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const anamnesisId = body?.anamnesisId as string | undefined;

  if (!anamnesisId) {
    return NextResponse.json(
      { error: "anamnesisId é obrigatório." },
      { status: 400 }
    );
  }

  const { data: anamnesisRow, error: anamnesisError } = await supabase
    .from("anamnesis")
    .select("*")
    .eq("id", anamnesisId)
    .eq("user_id", user.id)
    .single<AnamnesisRecord>();

  if (anamnesisError || !anamnesisRow) {
    return NextResponse.json(
      { error: "Anamnese não encontrada." },
      { status: 404 }
    );
  }

  const anamnesis = anamnesisSchema.parse(anamnesisRow);

  let plano;
  try {
    plano = await gerarPlanoComIA(anamnesis);
  } catch (err) {
    console.error("Erro ao gerar plano com IA:", err);
    return NextResponse.json(
      { error: "Não foi possível gerar o plano no momento. Tente novamente." },
      { status: 502 }
    );
  }

  const [{ data: workout, error: workoutError }, { data: diet, error: dietError }] =
    await Promise.all([
      supabase
        .from("workout_plans")
        .insert({
          user_id: user.id,
          anamnesis_id: anamnesisId,
          conteudo: plano.treino,
        })
        .select("id")
        .single(),
      supabase
        .from("diet_plans")
        .insert({
          user_id: user.id,
          anamnesis_id: anamnesisId,
          conteudo: plano.dieta,
        })
        .select("id")
        .single(),
    ]);

  if (workoutError || dietError) {
    return NextResponse.json(
      { error: "Plano gerado, mas houve falha ao salvar." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    workoutPlanId: workout.id,
    dietPlanId: diet.id,
  });
}

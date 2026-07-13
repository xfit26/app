import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { gerarDietaComIA } from "@/lib/ai/openai";
import { buildWorkoutPlan } from "@/lib/workout/generator";
import { anamnesisSchema, type AnamnesisRecord } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const REGENERATE_COOLDOWN_MS = 60_000;

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

  const { data: ultimoTreino } = await supabase
    .from("workout_plans")
    .select("created_at")
    .eq("anamnesis_id", anamnesisId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ created_at: string }>();

  if (ultimoTreino) {
    const elapsedMs = Date.now() - new Date(ultimoTreino.created_at).getTime();
    if (elapsedMs < REGENERATE_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((REGENERATE_COOLDOWN_MS - elapsedMs) / 1000);
      return NextResponse.json(
        {
          error: `Aguarde ${waitSeconds}s antes de gerar um novo plano para esta anamnese.`,
        },
        { status: 429 }
      );
    }
  }

  const anamnesis = anamnesisSchema.parse(anamnesisRow);

  const treino = buildWorkoutPlan(anamnesis);

  const { data: workout, error: workoutError } = await supabase
    .from("workout_plans")
    .insert({
      user_id: user.id,
      anamnesis_id: anamnesisId,
      conteudo: treino,
    })
    .select("id")
    .single();

  if (workoutError || !workout) {
    return NextResponse.json(
      { error: "Não foi possível salvar o treino gerado." },
      { status: 500 }
    );
  }

  let dietPlanId: string | undefined;
  let dietWarning: string | undefined;

  try {
    const dieta = await gerarDietaComIA(anamnesis);
    const { data: diet, error: dietError } = await supabase
      .from("diet_plans")
      .insert({
        user_id: user.id,
        anamnesis_id: anamnesisId,
        conteudo: dieta,
      })
      .select("id")
      .single();

    if (dietError || !diet) {
      dietWarning = "Treino gerado, mas houve falha ao salvar a dieta.";
    } else {
      dietPlanId = diet.id;
    }
  } catch (err) {
    console.error("Erro ao gerar dieta com IA:", err);
    dietWarning = "Treino gerado, mas não foi possível gerar a dieta agora.";
  }

  return NextResponse.json({
    workoutPlanId: workout.id,
    dietPlanId,
    warning: dietWarning,
  });
}

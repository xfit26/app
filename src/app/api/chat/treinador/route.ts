import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { gerarRespostaChat } from "@/lib/ai/openai";
import { buildTreinadorSystemPrompt } from "@/lib/ai/treinador";
import {
  chatMessageSchema,
  type AnamnesisRecord,
  type WorkoutPlanRecord,
} from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const bodySchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(30),
});

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [{ data: anamnesis }, { data: workout }] = await Promise.all([
    supabase
      .from("anamnesis")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<AnamnesisRecord>(),
    supabase
      .from("workout_plans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<WorkoutPlanRecord>(),
  ]);

  const systemPrompt = buildTreinadorSystemPrompt(anamnesis ?? null, workout ?? null);

  try {
    const reply = await gerarRespostaChat(systemPrompt, parsed.data.messages);
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Erro ao gerar resposta do Treinador:", err);
    return NextResponse.json(
      { error: "Não foi possível responder agora. Tente novamente." },
      { status: 502 }
    );
  }
}

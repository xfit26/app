import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { gerarRespostaChat } from "@/lib/ai/openai";
import { buildNutricionistaSystemPrompt } from "@/lib/ai/nutricionista";
import {
  chatMessageSchema,
  type AnamnesisRecord,
  type MealLogRecord,
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

  const [{ data: anamnesis }, { data: mealLogs }] = await Promise.all([
    supabase
      .from("anamnesis")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<AnamnesisRecord>(),
    supabase
      .from("meal_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("horario", { ascending: false })
      .limit(10)
      .returns<MealLogRecord[]>(),
  ]);

  const systemPrompt = buildNutricionistaSystemPrompt(anamnesis ?? null, mealLogs ?? []);

  try {
    const reply = await gerarRespostaChat(systemPrompt, parsed.data.messages);
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Erro ao gerar resposta do Nutricionista:", err);
    return NextResponse.json(
      { error: "Não foi possível responder agora. Tente novamente." },
      { status: 502 }
    );
  }
}

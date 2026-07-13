import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { gerarOrientacaoSuplemento } from "@/lib/ai/openai";
import { temPlano8Semanas, type SubscriptionRecord } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const bodySchema = z.object({
  nome: z.string().min(2).max(200),
});

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<SubscriptionRecord>();

  if (!temPlano8Semanas(subscription)) {
    return NextResponse.json(
      { error: "Esse recurso é exclusivo do plano de 8 semanas." },
      { status: 402 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Informe o nome do suplemento." }, { status: 400 });
  }

  try {
    const orientacao = await gerarOrientacaoSuplemento(parsed.data.nome);
    return NextResponse.json({ orientacao });
  } catch (err) {
    console.error("Erro ao gerar orientação de suplemento:", err);
    return NextResponse.json(
      { error: "Não foi possível gerar a orientação agora. Tente novamente." },
      { status: 502 }
    );
  }
}

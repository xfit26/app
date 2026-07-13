import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analisarFotoRefeicao } from "@/lib/ai/openai";
import { temPlano8Semanas, type SubscriptionRecord } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_BYTES = 8 * 1024 * 1024;

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

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("foto");

  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Envie uma imagem válida." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Imagem muito grande (máx. 8MB)." }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const dataUrl = `data:${file.type};base64,${bytes.toString("base64")}`;

  try {
    const analise = await analisarFotoRefeicao(dataUrl);
    return NextResponse.json(analise);
  } catch (err) {
    console.error("Erro ao analisar foto da refeição:", err);
    return NextResponse.json(
      { error: "Não foi possível analisar a foto agora. Tente novamente." },
      { status: 502 }
    );
  }
}

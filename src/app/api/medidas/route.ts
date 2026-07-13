import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { bodyMeasurementSchema, type AnamnesisRecord } from "@/lib/types";
import { calcularPercentualGordura } from "@/lib/calc/skinfold";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodyMeasurementSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  let percentualGordura: number | null = null;

  if (parsed.data.dobras) {
    const { data: anamnesis } = await supabase
      .from("anamnesis")
      .select("genero, idade")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<Pick<AnamnesisRecord, "genero" | "idade">>();

    if (anamnesis) {
      percentualGordura = calcularPercentualGordura(
        anamnesis.genero,
        parsed.data.dobras,
        anamnesis.idade
      );
    }
  }

  const { error } = await supabase.from("body_measurements").insert({
    ...parsed.data,
    user_id: user.id,
    percentual_gordura: percentualGordura,
  });

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível salvar a medida." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, percentual_gordura: percentualGordura });
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { anamnesisSchema } from "@/lib/types";
import { calcularResultado, calcularMetaCalorica } from "@/lib/calc/tmb";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = anamnesisSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { tmb, gastoTotal, aguaMl } = calcularResultado(
    parsed.data.genero,
    parsed.data.peso_kg,
    parsed.data.altura_cm,
    parsed.data.idade,
    parsed.data.nivel_experiencia
  );
  const metaCalorica = calcularMetaCalorica(gastoTotal, parsed.data.objetivo);

  const { data, error } = await supabase
    .from("anamnesis")
    .insert({
      ...parsed.data,
      user_id: user.id,
      tmb,
      gasto_total: gastoTotal,
      meta_calorica: metaCalorica,
      agua_ml: aguaMl,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível salvar a anamnese." },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: data.id });
}

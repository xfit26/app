import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSubstitutes } from "@/lib/workout/generator";

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
  const nome = body?.nome as string | undefined;

  if (!nome) {
    return NextResponse.json({ error: "nome é obrigatório." }, { status: 400 });
  }

  return NextResponse.json({ substitutos: getSubstitutes(nome) });
}

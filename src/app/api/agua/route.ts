import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { waterLogSchema } from "@/lib/types";

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
  const parsed = waterLogSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("water_logs")
    .insert({ ...parsed.data, user_id: user.id });

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível registrar a água." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

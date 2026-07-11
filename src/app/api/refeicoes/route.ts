import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mealLogSchema } from "@/lib/types";

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
  const parsed = mealLogSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("meal_logs")
    .insert({ ...parsed.data, user_id: user.id })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível salvar a refeição." },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: data.id });
}

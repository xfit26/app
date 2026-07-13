import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { ExerciseRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  exercicio_id: z.string().uuid(),
});

/**
 * A base de substituições (exercise_substitutions) é "escondida": não tem
 * policy de select para o client, então só é lida aqui com a service role,
 * depois de confirmar que o usuário está autenticado.
 */
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
    return NextResponse.json({ error: "Exercício inválido." }, { status: 400 });
  }

  const service = createServiceClient();

  const { data: original } = await service
    .from("exercises")
    .select("*")
    .eq("id", parsed.data.exercicio_id)
    .maybeSingle<ExerciseRecord>();

  if (!original) {
    return NextResponse.json({ error: "Exercício não encontrado." }, { status: 404 });
  }

  const { data: substitutions } = await service
    .from("exercise_substitutions")
    .select("substitute_id")
    .eq("exercise_id", original.id)
    .limit(2);

  const substituteIds = (substitutions ?? []).map((s) => s.substitute_id as string);

  const { data: substitutos } = substituteIds.length
    ? await service
        .from("exercises")
        .select("*")
        .in("id", substituteIds)
        .returns<ExerciseRecord[]>()
    : { data: [] as ExerciseRecord[] };

  return NextResponse.json({
    exercicio_original: original.nome,
    substitutos,
  });
}

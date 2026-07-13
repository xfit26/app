import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("foto");
  const legenda = String(formData?.get("legenda") ?? "");

  if (!(file instanceof File) || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Envie uma imagem válida." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Imagem muito grande (máx. 8MB)." }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("progress-photos")
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json(
      { error: "Não foi possível enviar a foto." },
      { status: 500 }
    );
  }

  const { error: dbError } = await supabase.from("progress_photos").insert({
    user_id: user.id,
    storage_path: path,
    legenda,
  });

  if (dbError) {
    return NextResponse.json(
      { error: "Foto enviada, mas houve falha ao registrar." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

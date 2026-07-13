import type { createClient } from "@/lib/supabase/server";
import type { VideoCorrectionRecord } from "@/lib/types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Remove correções de vídeo expiradas (48h após o envio) do usuário: apaga o
 * áudio de feedback do Storage e o registro no banco. O vídeo original em si
 * já foi apagado logo após a análise (ver /api/videos/upload).
 */
export async function limparVideosExpirados(
  supabase: SupabaseServerClient,
  userId: string
): Promise<void> {
  const { data: expirados } = await supabase
    .from("video_corrections")
    .select("*")
    .eq("user_id", userId)
    .lt("expires_at", new Date().toISOString())
    .returns<VideoCorrectionRecord[]>();

  if (!expirados || expirados.length === 0) return;

  const paths = expirados
    .map((v) => v.feedback_audio_path)
    .filter((p): p is string => Boolean(p));

  if (paths.length > 0) {
    await supabase.storage.from("video-feedback-audio").remove(paths);
  }

  await supabase
    .from("video_corrections")
    .delete()
    .in(
      "id",
      expirados.map((v) => v.id)
    );
}

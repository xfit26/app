import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { LockedFeature } from "@/components/dashboard/locked-feature";
import { VideoCorrectionForm } from "@/components/dashboard/video-correction-form";
import { limparVideosExpirados } from "@/lib/video-cleanup";
import {
  temPlano8Semanas,
  type SubscriptionRecord,
  type VideoCorrectionRecord,
} from "@/lib/types";

const STATUS_LABELS: Record<string, string> = {
  processando: "Processando...",
  pronto: "Pronto",
  erro: "Erro ao processar",
  expirado: "Expirado",
};

function horasRestantes(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "expirando...";
  const horas = Math.floor(ms / (60 * 60 * 1000));
  const minutos = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  return `${horas}h${minutos}min restantes`;
}

export default async function VideosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user!.id)
    .maybeSingle<SubscriptionRecord>();

  if (!temPlano8Semanas(subscription)) {
    return (
      <LockedFeature
        titulo="Correção de treino por vídeo"
        descricao="Envie até 6 vídeos dos seus exercícios e receba uma correção do treinador Léo Moura em áudio."
      />
    );
  }

  await limparVideosExpirados(supabase, user!.id);

  const { data: videos } = await supabase
    .from("video_corrections")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .returns<VideoCorrectionRecord[]>();

  const videosComAudio = await Promise.all(
    (videos ?? []).map(async (v) => {
      if (!v.feedback_audio_path) return { ...v, audioUrl: null };
      const { data } = await supabase.storage
        .from("video-feedback-audio")
        .createSignedUrl(v.feedback_audio_path, 60 * 60);
      return { ...v, audioUrl: data?.signedUrl ?? null };
    })
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Correção de treino por vídeo</h1>
        <p className="mt-1 text-sm text-muted">
          Envie até 6 vídeos por vez. O vídeo enviado é usado apenas para
          gerar a correção e é apagado logo em seguida; o feedback (texto +
          áudio) fica disponível por 48 horas e depois some automaticamente.
        </p>
      </div>

      <Card>
        <VideoCorrectionForm />
      </Card>

      <div className="flex flex-col gap-4">
        {videosComAudio.length === 0 && (
          <p className="text-sm text-muted">Nenhum vídeo enviado ainda.</p>
        )}
        {videosComAudio.map((v) => (
          <Card key={v.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{v.exercicio}</p>
                <p className="text-xs text-muted">
                  Enviado em {new Date(v.created_at).toLocaleString("pt-BR")} ·{" "}
                  {STATUS_LABELS[v.status]} · {horasRestantes(v.expires_at)}
                </p>
              </div>
            </div>
            {v.feedback_texto && (
              <p className="mt-3 text-sm">{v.feedback_texto}</p>
            )}
            {v.audioUrl && <audio controls src={v.audioUrl} className="mt-3 w-full" />}
          </Card>
        ))}
      </div>
    </div>
  );
}

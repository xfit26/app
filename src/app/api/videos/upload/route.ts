import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { gerarFeedbackTreino, gerarAudioFeedback } from "@/lib/ai/openai";
import { limparVideosExpirados } from "@/lib/video-cleanup";
import { temPlano8Semanas, type SubscriptionRecord } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BYTES = 60 * 1024 * 1024;
const MAX_VIDEOS_ATIVOS = 6;

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

  await limparVideosExpirados(supabase, user.id);

  const { count } = await supabase
    .from("video_corrections")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((count ?? 0) >= MAX_VIDEOS_ATIVOS) {
    return NextResponse.json(
      {
        error: `Limite de ${MAX_VIDEOS_ATIVOS} vídeos ativos atingido. Aguarde a expiração (48h) de uma correção para enviar outra.`,
      },
      { status: 400 }
    );
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("video");
  const exercicio = String(formData?.get("exercicio") ?? "").trim();
  const observacao = String(formData?.get("observacao") ?? "").trim() || null;

  if (!exercicio) {
    return NextResponse.json({ error: "Informe o exercício." }, { status: 400 });
  }

  if (!(file instanceof File) || !file.type.startsWith("video/")) {
    return NextResponse.json({ error: "Envie um vídeo válido." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Vídeo muito grande (máx. 60MB)." }, { status: 400 });
  }

  const { data: inserted, error: insertError } = await supabase
    .from("video_corrections")
    .insert({ user_id: user.id, exercicio, observacao, status: "processando" })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return NextResponse.json(
      { error: "Não foi possível registrar o envio." },
      { status: 500 }
    );
  }

  const videoId = inserted.id as string;
  const videoPath = `${user.id}/${videoId}.${(file.name.split(".").pop() || "mp4")}`;

  try {
    // O vídeo é enviado apenas temporariamente para permitir a correção por
    // áudio; ele é removido do Storage logo em seguida, independentemente do
    // resultado da análise.
    await supabase.storage
      .from("exercise-videos")
      .upload(videoPath, file, { contentType: file.type });

    const feedbackTexto = await gerarFeedbackTreino(exercicio, observacao);
    const audioBuffer = await gerarAudioFeedback(feedbackTexto);
    const audioPath = `${user.id}/${videoId}.mp3`;

    await supabase.storage
      .from("video-feedback-audio")
      .upload(audioPath, audioBuffer, { contentType: "audio/mpeg" });

    await supabase
      .from("video_corrections")
      .update({
        status: "pronto",
        feedback_texto: feedbackTexto,
        feedback_audio_path: audioPath,
      })
      .eq("id", videoId);

    return NextResponse.json({ id: videoId, status: "pronto" });
  } catch (err) {
    console.error("Erro ao processar correção de vídeo:", err);
    await supabase
      .from("video_corrections")
      .update({ status: "erro" })
      .eq("id", videoId);
    return NextResponse.json(
      { error: "Não foi possível gerar a correção agora. Tente novamente." },
      { status: 502 }
    );
  } finally {
    await supabase.storage.from("exercise-videos").remove([videoPath]);
  }
}

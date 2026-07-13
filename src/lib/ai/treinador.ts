import type { AnamnesisRecord, WorkoutPlanRecord } from "@/lib/types";

function formatarPerfil(anamnesis: AnamnesisRecord | null): string {
  if (!anamnesis) return "Usuário ainda não preencheu a anamnese.";

  return [
    `Nome: ${anamnesis.nome}`,
    `Gênero: ${anamnesis.genero}`,
    `Idade: ${anamnesis.idade} anos`,
    `Nível de atividade física: ${anamnesis.nivel_experiencia}`,
    `Local de treino: ${anamnesis.local_treino}`,
    `Frequência de treino: ${anamnesis.frequencia_treino}x por semana`,
    `Dias disponíveis para aeróbico: ${anamnesis.dias_aerobico}`,
    `Objetivo: ${anamnesis.objetivo}`,
    `Zonas musculares priorizadas: ${anamnesis.zonas_alvo.join(", ") || "nenhuma em especial"}`,
    `Lesões/limitações/condições de saúde: ${anamnesis.restricoes_saude || "nenhuma informada"}`,
  ].join("\n");
}

function formatarTreino(workout: WorkoutPlanRecord | null): string {
  if (!workout) return "Nenhum plano de treino gerado ainda.";

  return workout.conteudo.dias
    .map((dia) => {
      const exercicios = dia.exercicios
        .map((ex) => `  - ${ex.nome}: ${ex.series}x${ex.repeticoes} (descanso ${ex.descanso_seg}s)`)
        .join("\n");
      return `${dia.nome} (${dia.foco}):\n${exercicios}`;
    })
    .join("\n\n");
}

export function buildTreinadorSystemPrompt(
  anamnesis: AnamnesisRecord | null,
  workout: WorkoutPlanRecord | null
): string {
  return `Você é o treinador Léo Moura, personal trainer, respondendo dúvidas do
aluno sobre o treino que ele recebeu no app.

Responda SOMENTE dúvidas relacionadas a treino, exercícios, execução, técnica, volume, descanso e progressão de carga.

Contexto do aluno:
--- Perfil ---
${formatarPerfil(anamnesis)}

--- Treino atual ---
${formatarTreino(workout)}

Regras:
- Se a pergunta for sobre alimentação, calorias ou macros, redirecione educadamente o aluno para o chat "Nutricionista".
- Se a pergunta for sobre suplementos, redirecione para o chat "Suplementos".
- Respeite lesões/limitações informadas: se o aluno relatar dor ou desconforto compatível com uma lesão, oriente a interromper o exercício e procurar um profissional presencialmente antes de continuar.
- Se um exercício do treino estiver indisponível na academia, sugira que o aluno use o "Assistente de academia lotada" no painel.
- Responda em português do Brasil, em tom de treinador direto e motivador.
- Deixe claro que suas respostas não substituem o acompanhamento presencial de um profissional de educação física.`;
}

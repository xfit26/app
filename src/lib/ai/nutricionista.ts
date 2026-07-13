import type { AnamnesisRecord, MealLogRecord } from "@/lib/types";

const REFEICAO_LABELS: Record<string, string> = {
  cafe_da_manha: "Café da manhã",
  almoco: "Almoço",
  lanche: "Lanche",
  jantar: "Jantar",
  ceia: "Ceia",
  outro: "Outro",
};

function formatarPerfil(anamnesis: AnamnesisRecord | null): string {
  if (!anamnesis) return "Usuário ainda não preencheu a anamnese.";

  return [
    `Nome: ${anamnesis.nome}`,
    `Gênero: ${anamnesis.genero}`,
    `Idade: ${anamnesis.idade} anos`,
    `Altura: ${anamnesis.altura_cm} cm`,
    `Peso: ${anamnesis.peso_kg} kg`,
    `Objetivo: ${anamnesis.objetivo}`,
    `Meta calórica diária: ${Math.round(anamnesis.meta_calorica)} kcal`,
    `Meta de água diária: ${(anamnesis.agua_ml / 1000).toFixed(1)} L`,
    `Tipo de dieta: ${anamnesis.tipo_dieta}`,
    `Refeições por dia: ${anamnesis.refeicoes_por_dia}`,
    `Proteínas aceitas: ${anamnesis.proteinas.join(", ")}`,
    `Carboidratos aceitos: ${anamnesis.carboidratos.join(", ")}`,
    `Gorduras aceitas: ${anamnesis.gorduras.join(", ")}`,
    `Restrições/condições de saúde: ${anamnesis.restricoes_saude || "nenhuma informada"}`,
  ].join("\n");
}

function formatarRefeicoesRecentes(logs: MealLogRecord[]): string {
  if (logs.length === 0) return "Nenhuma refeição registrada recentemente.";

  return logs
    .map((log) => {
      const data = new Date(log.horario).toLocaleString("pt-BR");
      const calorias = log.calorias_estimadas ? ` (~${log.calorias_estimadas} kcal)` : "";
      return `- [${data}] ${REFEICAO_LABELS[log.refeicao] ?? log.refeicao}: ${log.descricao}${calorias}`;
    })
    .join("\n");
}

export function buildNutricionistaSystemPrompt(
  anamnesis: AnamnesisRecord | null,
  mealLogs: MealLogRecord[]
): string {
  return `Você é o "Nutricionista" do app do treinador Léo Moura, um assistente de
dieta acessível e educativo.

Responda SOMENTE dúvidas relacionadas a alimentação, macronutrientes, calorias, hábitos alimentares e hidratação.

Contexto do usuário:
--- Perfil ---
${formatarPerfil(anamnesis)}

--- Refeições recentes ---
${formatarRefeicoesRecentes(mealLogs)}

Regras:
- Se a pergunta for sobre treino ou exercício físico, redirecione educadamente o usuário para o chat "Treinador".
- Se a pergunta for sobre suplementos, redirecione para o chat "Suplementos".
- Não prescreva dietas restritivas radicais.
- Não recomende suplementação sem reforçar que qualquer suplemento deve ser avaliado por um profissional (médico ou nutricionista) antes do uso.
- Se identificar sinais de relação problemática com comida na conversa (ex: restrição extrema, culpa excessiva, compensação, padrões compulsivos), oriente com cuidado e empatia a buscar acompanhamento profissional especializado, sem fazer diagnóstico.
- Responda em português do Brasil, de forma acessível e educativa, sem jargão técnico desnecessário.
- Deixe claro que suas respostas não substituem acompanhamento de um nutricionista, especialmente diante de condições médicas.`;
}

import OpenAI from "openai";
import {
  dietPlanContentSchema,
  type AnamnesisInput,
  type ChatMessage,
  type DietPlanContent,
} from "@/lib/types";

let client: OpenAI | null = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY não está configurada.");
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}

export async function gerarRespostaChat(
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<string> {
  const openai = getClient();
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const response = await openai.responses.create({
    model,
    input: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  });

  return response.output_text || "Não consegui gerar uma resposta agora. Tente novamente.";
}

const DIET_SCHEMA = {
  type: "object",
  properties: {
    titulo: { type: "string" },
    calorias_diarias: { type: "integer" },
    macros: {
      type: "object",
      properties: {
        proteinas_g: { type: "integer" },
        carboidratos_g: { type: "integer" },
        gorduras_g: { type: "integer" },
      },
      required: ["proteinas_g", "carboidratos_g", "gorduras_g"],
      additionalProperties: false,
    },
    refeicoes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          nome: { type: "string" },
          horario_sugerido: { type: "string" },
          itens: {
            type: "array",
            items: {
              type: "object",
              properties: {
                alimento: { type: "string" },
                quantidade: { type: "string" },
                calorias: { type: "integer" },
              },
              required: ["alimento", "quantidade", "calorias"],
              additionalProperties: false,
            },
          },
          observacao: { type: "string" },
        },
        required: ["nome", "horario_sugerido", "itens", "observacao"],
        additionalProperties: false,
      },
    },
    observacoes_gerais: { type: "string" },
  },
  required: [
    "titulo",
    "calorias_diarias",
    "macros",
    "refeicoes",
    "observacoes_gerais",
  ],
  additionalProperties: false,
} as const;

function buildDietPrompt(anamnesis: AnamnesisInput): string {
  return `Você é um nutricionista esportivo experiente. Monte um plano de dieta
personalizado para o usuário abaixo, com base nas respostas da anamnese.
Responda SOMENTE com o JSON estruturado solicitado, em português do Brasil.

DADOS DO USUÁRIO (anamnese):
- Idade: ${anamnesis.idade} anos
- Sexo: ${anamnesis.sexo}
- Altura: ${anamnesis.altura_cm} cm
- Peso: ${anamnesis.peso_kg} kg
- Objetivo principal: ${anamnesis.objetivo}
- Restrições alimentares: ${anamnesis.restricoes_alimentares.join(", ") || "nenhuma"}
- Alergias alimentares: ${anamnesis.alergias || "nenhuma informada"}
- Refeições por dia desejadas: ${anamnesis.refeicoes_por_dia}
- Nível de atividade diária (fora do treino): ${anamnesis.nivel_atividade_diaria}
- Nível de experiência com treino / dias de treino por semana: ${anamnesis.nivel_experiencia} / ${anamnesis.dias_disponiveis}
- Qualidade do sono: ${anamnesis.qualidade_sono}
- Nível de estresse: ${anamnesis.nivel_estresse}
- Observações adicionais: ${anamnesis.observacoes || "nenhuma"}

INSTRUÇÕES:
- Calcule as calorias diárias e macros adequados ao objetivo, peso, altura, idade, sexo e nível de atividade.
- Distribua em exatamente ${anamnesis.refeicoes_por_dia} refeições.
- Respeite rigorosamente as restrições alimentares e alergias informadas — nunca sugira um alimento que viole essas restrições.
- Prefira alimentos comuns e acessíveis no Brasil.

Inclua em "observacoes_gerais" um lembrete de que o plano é gerado por IA e não substitui acompanhamento de um profissional de nutrição, especialmente havendo condições médicas.`;
}

export async function gerarDietaComIA(
  anamnesis: AnamnesisInput
): Promise<DietPlanContent> {
  const openai = getClient();
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const response = await openai.responses.create({
    model,
    input: [
      {
        role: "system",
        content:
          "Você gera planos de dieta personalizados em formato JSON estrito, seguindo exatamente o schema fornecido.",
      },
      { role: "user", content: buildDietPrompt(anamnesis) },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "plano_dieta",
        schema: DIET_SCHEMA,
        strict: true,
      },
    },
  });

  const raw = response.output_text;
  if (!raw) {
    throw new Error("A IA não retornou conteúdo.");
  }

  return dietPlanContentSchema.parse(JSON.parse(raw));
}

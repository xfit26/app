import OpenAI from "openai";
import {
  dietPlanContentSchema,
  workoutPlanContentSchema,
  type AnamnesisInput,
  type DietPlanContent,
  type WorkoutPlanContent,
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

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    treino: {
      type: "object",
      properties: {
        titulo: { type: "string" },
        resumo: { type: "string" },
        dias: {
          type: "array",
          items: {
            type: "object",
            properties: {
              nome: { type: "string" },
              foco: { type: "string" },
              exercicios: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    nome: { type: "string" },
                    series: { type: "integer" },
                    repeticoes: { type: "string" },
                    descanso_seg: { type: "integer" },
                    observacao: { type: "string" },
                  },
                  required: [
                    "nome",
                    "series",
                    "repeticoes",
                    "descanso_seg",
                    "observacao",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["nome", "foco", "exercicios"],
            additionalProperties: false,
          },
        },
      },
      required: ["titulo", "resumo", "dias"],
      additionalProperties: false,
    },
    dieta: {
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
    },
  },
  required: ["treino", "dieta"],
  additionalProperties: false,
} as const;

function buildPrompt(anamnesis: AnamnesisInput): string {
  return `Você é um personal trainer e nutricionista esportivo experiente. Monte um
plano de treino e um plano de dieta personalizados para o usuário abaixo, com
base nas respostas da anamnese. Responda SOMENTE com o JSON estruturado
solicitado, em português do Brasil.

DADOS DO USUÁRIO (anamnese):
- Idade: ${anamnesis.idade} anos
- Sexo: ${anamnesis.sexo}
- Altura: ${anamnesis.altura_cm} cm
- Peso: ${anamnesis.peso_kg} kg
- Objetivo principal: ${anamnesis.objetivo}
- Nível de experiência com treino: ${anamnesis.nivel_experiencia}
- Dias disponíveis por semana para treinar: ${anamnesis.dias_disponiveis}
- Tempo disponível por sessão: ${anamnesis.tempo_por_sessao_min} minutos
- Local de treino: ${anamnesis.local_treino}
- Equipamentos disponíveis: ${anamnesis.equipamentos.join(", ") || "nenhum informado"}
- Lesões ou limitações físicas: ${anamnesis.lesoes_limitacoes || "nenhuma informada"}
- Condições médicas relevantes: ${anamnesis.condicoes_medicas || "nenhuma informada"}
- Restrições alimentares: ${anamnesis.restricoes_alimentares.join(", ") || "nenhuma"}
- Alergias alimentares: ${anamnesis.alergias || "nenhuma informada"}
- Refeições por dia desejadas: ${anamnesis.refeicoes_por_dia}
- Nível de atividade diária (fora do treino): ${anamnesis.nivel_atividade_diaria}
- Qualidade do sono: ${anamnesis.qualidade_sono}
- Nível de estresse: ${anamnesis.nivel_estresse}
- Observações adicionais: ${anamnesis.observacoes || "nenhuma"}

INSTRUÇÕES PARA O TREINO:
- Monte exatamente ${anamnesis.dias_disponiveis} dias de treino por semana, cada um cabendo em ${anamnesis.tempo_por_sessao_min} minutos.
- Use apenas exercícios compatíveis com o local de treino e os equipamentos disponíveis.
- Respeite lesões/limitações e condições médicas informadas, evitando exercícios contraindicados.
- Adeque o volume e a intensidade ao nível de experiência informado.

INSTRUÇÕES PARA A DIETA:
- Calcule as calorias diárias e macros adequados ao objetivo, peso, altura, idade, sexo e nível de atividade.
- Distribua em exatamente ${anamnesis.refeicoes_por_dia} refeições.
- Respeite rigorosamente as restrições alimentares e alergias informadas — nunca sugira um alimento que viole essas restrições.
- Prefira alimentos comuns e acessíveis no Brasil.

Inclua em "observacoes_gerais" um lembrete de que o plano é gerado por IA e não substitui acompanhamento de um profissional de educação física e nutrição, especialmente havendo condições médicas.`;
}

export interface GeneratedPlano {
  treino: WorkoutPlanContent;
  dieta: DietPlanContent;
}

export async function gerarPlanoComIA(
  anamnesis: AnamnesisInput
): Promise<GeneratedPlano> {
  const openai = getClient();
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const response = await openai.responses.create({
    model,
    input: [
      {
        role: "system",
        content:
          "Você gera planos de treino e dieta personalizados em formato JSON estrito, seguindo exatamente o schema fornecido.",
      },
      { role: "user", content: buildPrompt(anamnesis) },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "plano_treino_dieta",
        schema: RESPONSE_SCHEMA,
        strict: true,
      },
    },
  });

  const raw = response.output_text;
  if (!raw) {
    throw new Error("A IA não retornou conteúdo.");
  }

  const parsed = JSON.parse(raw);

  const treino = workoutPlanContentSchema.parse(parsed.treino);
  const dieta = dietPlanContentSchema.parse(parsed.dieta);

  return { treino, dieta };
}

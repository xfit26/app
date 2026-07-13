import OpenAI from "openai";
import {
  dietPlanContentSchema,
  workoutPlanContentSchema,
  type AnamnesisInput,
  type ChatMessage,
  type DietPlanContent,
  type WorkoutPlanContent,
} from "@/lib/types";
import { calcularResultado, calcularMetaCalorica } from "@/lib/calc/tmb";

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
  const { tmb, gastoTotal, aguaMl } = calcularResultado(
    anamnesis.genero,
    anamnesis.peso_kg,
    anamnesis.altura_cm,
    anamnesis.idade,
    anamnesis.nivel_experiencia
  );
  const metaCalorica = calcularMetaCalorica(gastoTotal, anamnesis.objetivo);

  return `Você é o treinador Léo Moura, personal trainer e nutricionista esportivo
experiente. Monte um plano de treino e um plano de dieta personalizados para
o(a) aluno(a) abaixo, com base nas respostas da anamnese. Responda SOMENTE com
o JSON estruturado solicitado, em português do Brasil.

DADOS DO ALUNO (anamnese):
- Nome: ${anamnesis.nome}
- Gênero: ${anamnesis.genero}
- Idade: ${anamnesis.idade} anos
- Altura: ${anamnesis.altura_cm} cm
- Peso: ${anamnesis.peso_kg} kg
- Percentual de gordura informado: ${anamnesis.percentual_gordura ?? "não informado"}
- Local de treino: ${anamnesis.local_treino}
- Nível de atividade física: ${anamnesis.nivel_experiencia}
- Frequência de treino: ${anamnesis.frequencia_treino}x por semana
- Dias disponíveis para aeróbico: ${anamnesis.dias_aerobico}
- Lesões/limitações/condições de saúde: ${anamnesis.restricoes_saude || "nenhuma informada"}
- Objetivo: ${anamnesis.objetivo}
- Zonas musculares priorizadas: ${anamnesis.zonas_alvo.join(", ") || "nenhuma em especial, treino equilibrado"}

CÁLCULO JÁ REALIZADO (fórmula de Harris-Benedict) — use estes valores, não
recalcule:
- TMB: ${Math.round(tmb)} kcal
- Gasto energético total diário: ${Math.round(gastoTotal)} kcal
- Meta calórica diária para o objetivo (${anamnesis.objetivo}): ${Math.round(metaCalorica)} kcal
- Meta de ingestão de água: ${(aguaMl / 1000).toFixed(1)} L/dia

PREFERÊNCIAS DE DIETA:
- Refeições por dia: ${anamnesis.refeicoes_por_dia}
- Tipo de dieta: ${anamnesis.tipo_dieta}
- Proteínas que o aluno aceita: ${anamnesis.proteinas.join(", ")}
- Carboidratos que o aluno aceita: ${anamnesis.carboidratos.join(", ")}
- Gorduras que o aluno aceita: ${anamnesis.gorduras.join(", ")}

INSTRUÇÕES PARA O TREINO:
- Monte exatamente ${anamnesis.frequencia_treino} dias de treino por semana.
- Use apenas exercícios compatíveis com o local de treino informado (${anamnesis.local_treino}).
- Dê prioridade extra (mais volume/exercícios) às zonas musculares priorizadas pelo aluno, sem negligenciar o restante do corpo.
- Se houver dias disponíveis para aeróbico (${anamnesis.dias_aerobico}), inclua recomendações de cardio nesses dias dentro do resumo do plano.
- Respeite rigorosamente lesões/limitações/condições de saúde informadas, evitando exercícios contraindicados.
- Adeque o volume e a intensidade ao nível de atividade física informado.

INSTRUÇÕES PARA A DIETA:
- Use como meta calórica diária o valor já calculado acima (${Math.round(metaCalorica)} kcal) e distribua os macros de acordo com o objetivo e o tipo de dieta (${anamnesis.tipo_dieta}).
- Se o tipo de dieta for "vegana", não utilize nenhum produto de origem animal, mesmo que apareça nas listas de proteína/gordura selecionadas. Se for "vegetariana", não utilize carnes/peixes. Se for "carb_cycling", alterne dias de maior e menor carboidrato entre as refeições/observações.
- Distribua em exatamente ${anamnesis.refeicoes_por_dia} refeições.
- Monte a dieta APENAS com alimentos das listas de proteínas, carboidratos e gorduras informadas pelo aluno — não sugira alimentos fora dessas listas.
- Mencione a meta de água (${(aguaMl / 1000).toFixed(1)} L/dia) em "observacoes_gerais".
- Prefira preparações comuns e acessíveis no Brasil.

Inclua em "observacoes_gerais" um lembrete de que o plano é gerado por IA e não substitui acompanhamento de um profissional de educação física e nutrição, especialmente havendo condições de saúde relevantes.`;
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

// ============================================================================
// Foto da dieta -> estimativa de calorias/macros (módulo do plano 8 semanas)
// ============================================================================

const FOTO_REFEICAO_SCHEMA = {
  type: "object",
  properties: {
    descricao: { type: "string" },
    calorias: { type: "integer" },
    proteinas_g: { type: "integer" },
    carboidratos_g: { type: "integer" },
    gorduras_g: { type: "integer" },
    confianca: { type: "string", enum: ["baixa", "media", "alta"] },
  },
  required: [
    "descricao",
    "calorias",
    "proteinas_g",
    "carboidratos_g",
    "gorduras_g",
    "confianca",
  ],
  additionalProperties: false,
} as const;

export interface AnaliseFotoRefeicao {
  descricao: string;
  calorias: number;
  proteinas_g: number;
  carboidratos_g: number;
  gorduras_g: number;
  confianca: "baixa" | "media" | "alta";
}

/** Analisa uma foto de refeição (data URL base64) e estima calorias/macros. */
export async function analisarFotoRefeicao(
  imageDataUrl: string
): Promise<AnaliseFotoRefeicao> {
  const openai = getClient();
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const response = await openai.responses.create({
    model,
    input: [
      {
        role: "system",
        content:
          "Você é um nutricionista esportivo estimando visualmente calorias e macros de uma refeição a partir de uma foto. Seja realista quanto à incerteza dessa estimativa visual.",
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Estime as calorias e os macros desta refeição. Responda em português do Brasil.",
          },
          { type: "input_image", image_url: imageDataUrl, detail: "auto" },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "analise_foto_refeicao",
        schema: FOTO_REFEICAO_SCHEMA,
        strict: true,
      },
    },
  });

  const raw = response.output_text;
  if (!raw) {
    throw new Error("A IA não retornou uma análise.");
  }

  return JSON.parse(raw) as AnaliseFotoRefeicao;
}

// ============================================================================
// Suplementos — orientação por IA (NÃO é uma consulta oficial à base da
// ANVISA; é uma orientação geral que deve sempre ser confirmada em
// https://consultas.anvisa.gov.br)
// ============================================================================

export async function gerarOrientacaoSuplemento(nomeSuplemento: string): Promise<string> {
  const openai = getClient();
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const systemPrompt = `Você é um assistente de orientação sobre suplementos esportivos. Você NÃO
tem acesso em tempo real ao banco de dados da ANVISA nem a laudos oficiais.
Baseado no seu conhecimento geral, dê uma orientação sobre o produto/marca
informado: se é uma categoria de suplemento reconhecida e regulamentada no
Brasil, pontos de atenção comuns (adulteração, dosagem, selo do fabricante,
registro do fabricante na ANVISA) e sempre reforce, de forma clara, que o
usuário deve confirmar a regularização do lote específico diretamente em
https://consultas.anvisa.gov.br/#/saude/, pois você não tem acesso a dados
em tempo real. Nunca afirme categoricamente que um produto "passou" ou
"reprovou" em um laudo — você não tem essa informação. Responda em
português do Brasil, de forma direta, em até 6 frases.`;

  const response = await openai.responses.create({
    model,
    input: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Suplemento/produto: ${nomeSuplemento}`,
      },
    ],
  });

  return (
    response.output_text ||
    "Não consegui gerar uma orientação agora. Consulte diretamente https://consultas.anvisa.gov.br."
  );
}

// ============================================================================
// Correção de treino por vídeo — feedback em texto + áudio (módulo do plano
// 8 semanas). Não há análise computacional do vídeo em si (visão computador
// quadro a quadro); o feedback é gerado a partir do exercício informado e das
// observações do aluno, com boas práticas de execução para aquele exercício.
// ============================================================================

export async function gerarFeedbackTreino(
  exercicio: string,
  observacao: string | null
): Promise<string> {
  const openai = getClient();
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const systemPrompt = `Você é o treinador Léo Moura dando um feedback em áudio, curto e direto (até
8 frases), sobre a execução de um exercício que o aluno gravou em vídeo e
descreveu. Dê dicas objetivas de postura, amplitude, respiração e erros
comuns naquele exercício, e recomende contato com um profissional
presencialmente se notar risco de lesão pela descrição. Fale em português do
Brasil, em tom de treinador motivador.`;

  const userPrompt = `Exercício: ${exercicio}\nObservações do aluno sobre a execução: ${
    observacao || "nenhuma observação adicional"
  }`;

  const response = await openai.responses.create({
    model,
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  return response.output_text || "Não foi possível gerar o feedback agora.";
}

/** Converte o texto de feedback em áudio (mp3) usando o modelo de TTS da OpenAI. */
export async function gerarAudioFeedback(texto: string): Promise<Buffer> {
  const openai = getClient();
  const speech = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "onyx",
    input: texto,
  });
  const arrayBuffer = await speech.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

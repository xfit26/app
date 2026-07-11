import { z } from "zod";

export const OBJETIVOS = [
  "emagrecimento",
  "hipertrofia",
  "resistencia",
  "forca",
  "saude_geral",
] as const;

export const NIVEIS_EXPERIENCIA = ["iniciante", "intermediario", "avancado"] as const;

export const LOCAIS_TREINO = ["casa", "academia", "ar_livre"] as const;

export const NIVEIS_ATIVIDADE = ["sedentario", "leve", "moderado", "intenso"] as const;

export const QUALIDADES_SONO = ["ruim", "regular", "boa"] as const;

export const NIVEIS_ESTRESSE = ["baixo", "medio", "alto"] as const;

export const SEXOS = ["masculino", "feminino", "outro"] as const;

export const EQUIPAMENTOS_DISPONIVEIS = [
  "halteres",
  "barra",
  "anilhas",
  "elasticos",
  "banco",
  "barra_fixa",
  "kettlebell",
  "maquinas",
  "nenhum",
] as const;

export const RESTRICOES_ALIMENTARES = [
  "vegetariano",
  "vegano",
  "sem_lactose",
  "sem_gluten",
  "low_carb",
  "nenhuma",
] as const;

export const anamnesisSchema = z.object({
  idade: z.coerce.number().int().min(12, "Idade mínima de 12 anos").max(100),
  sexo: z.enum(SEXOS),
  altura_cm: z.coerce.number().min(100).max(250),
  peso_kg: z.coerce.number().min(30).max(300),
  objetivo: z.enum(OBJETIVOS),
  nivel_experiencia: z.enum(NIVEIS_EXPERIENCIA),
  dias_disponiveis: z.coerce.number().int().min(1).max(7),
  tempo_por_sessao_min: z.coerce.number().int().min(15).max(180),
  local_treino: z.enum(LOCAIS_TREINO),
  equipamentos: z.array(z.enum(EQUIPAMENTOS_DISPONIVEIS)).default([]),
  lesoes_limitacoes: z.string().max(1000).optional().default(""),
  condicoes_medicas: z.string().max(1000).optional().default(""),
  restricoes_alimentares: z.array(z.enum(RESTRICOES_ALIMENTARES)).default([]),
  alergias: z.string().max(1000).optional().default(""),
  refeicoes_por_dia: z.coerce.number().int().min(2).max(8),
  nivel_atividade_diaria: z.enum(NIVEIS_ATIVIDADE),
  qualidade_sono: z.enum(QUALIDADES_SONO),
  nivel_estresse: z.enum(NIVEIS_ESTRESSE),
  observacoes: z.string().max(1000).optional().default(""),
});

export type AnamnesisInput = z.infer<typeof anamnesisSchema>;

export interface AnamnesisRecord extends AnamnesisInput {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const exercicioSchema = z.object({
  nome: z.string(),
  series: z.number().int(),
  repeticoes: z.string(),
  descanso_seg: z.number().int(),
  observacao: z.string().optional(),
});

export const diaTreinoSchema = z.object({
  nome: z.string(),
  foco: z.string(),
  exercicios: z.array(exercicioSchema),
});

export const workoutPlanContentSchema = z.object({
  titulo: z.string(),
  resumo: z.string(),
  dias: z.array(diaTreinoSchema),
});

export type WorkoutPlanContent = z.infer<typeof workoutPlanContentSchema>;

export const itemRefeicaoSchema = z.object({
  alimento: z.string(),
  quantidade: z.string(),
  calorias: z.number().optional(),
});

export const refeicaoSchema = z.object({
  nome: z.string(),
  horario_sugerido: z.string(),
  itens: z.array(itemRefeicaoSchema),
  observacao: z.string().optional(),
});

export const dietPlanContentSchema = z.object({
  titulo: z.string(),
  calorias_diarias: z.number(),
  macros: z.object({
    proteinas_g: z.number(),
    carboidratos_g: z.number(),
    gorduras_g: z.number(),
  }),
  refeicoes: z.array(refeicaoSchema),
  observacoes_gerais: z.string().optional(),
});

export type DietPlanContent = z.infer<typeof dietPlanContentSchema>;

export interface WorkoutPlanRecord {
  id: string;
  user_id: string;
  anamnesis_id: string;
  conteudo: WorkoutPlanContent;
  created_at: string;
}

export interface DietPlanRecord {
  id: string;
  user_id: string;
  anamnesis_id: string;
  conteudo: DietPlanContent;
  created_at: string;
}

export const REFEICOES = [
  "cafe_da_manha",
  "almoco",
  "lanche",
  "jantar",
  "ceia",
  "outro",
] as const;

export const mealLogSchema = z.object({
  refeicao: z.enum(REFEICOES),
  descricao: z.string().min(2).max(500),
  calorias_estimadas: z.coerce.number().int().min(0).max(5000).optional(),
});

export type MealLogInput = z.infer<typeof mealLogSchema>;

export interface MealLogRecord extends MealLogInput {
  id: string;
  user_id: string;
  horario: string;
  created_at: string;
}

export const PLANOS_ASSINATURA = ["mensal", "anual"] as const;
export type PlanoAssinatura = (typeof PLANOS_ASSINATURA)[number];

export const SUBSCRIPTION_STATUS = [
  "pending",
  "active",
  "past_due",
  "canceled",
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUS)[number];

export interface SubscriptionRecord {
  id: string;
  user_id: string;
  plano: PlanoAssinatura;
  status: SubscriptionStatus;
  pagarme_customer_id: string | null;
  pagarme_subscription_id: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

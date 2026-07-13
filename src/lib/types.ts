import { z } from "zod";

// ============================================================================
// Onboarding — gênero (define o tema visual), local de treino e objetivo
// ============================================================================

export const GENEROS = ["masculino", "feminino"] as const;
export type Genero = (typeof GENEROS)[number];

export const LOCAIS_TREINO = ["casa", "academia"] as const;
export type LocalTreino = (typeof LOCAIS_TREINO)[number];

export const NIVEIS_EXPERIENCIA = ["iniciante", "intermediario", "avancado"] as const;
export type NivelExperiencia = (typeof NIVEIS_EXPERIENCIA)[number];

export const FREQUENCIAS_TREINO = [3, 4, 5, 6] as const;

export const DIAS_AEROBICO = [0, 1, 2, 3, 4, 5, 6, 7] as const;

export const OBJETIVOS = ["emagrecimento", "definicao", "ganho_massa"] as const;
export type Objetivo = (typeof OBJETIVOS)[number];

// ============================================================================
// Mapa corporal — zonas musculares alvo selecionáveis
// ============================================================================

export const ZONAS_ALVO = [
  "peitoral_superior",
  "peitoral_meio",
  "peitoral_inferior",
  "costas_lombar",
  "costas_dorsal",
  "costas_romboides",
  "ombro_frontal",
  "ombro_medial",
  "ombro_posterior",
  "abdomen_reto",
  "abdomen_obliquo",
  "biceps",
  "triceps",
  "quadriceps_vasto_lateral",
  "quadriceps_vasto_medial",
  "quadriceps_adutores",
  "quadriceps_meio_coxa",
  "gluteo_superior",
  "gluteo_meio",
  "gluteo_inferior",
  "gluteo_lateral",
  "posterior_coxa_distal",
  "posterior_coxa_medial",
  "posterior_coxa_proximal",
  "panturrilha",
] as const;
export type ZonaAlvo = (typeof ZONAS_ALVO)[number];

// ============================================================================
// Dieta — refeições, tipo de dieta e alimentos escolhidos
// ============================================================================

export const REFEICOES_POR_DIA_OPCOES = [3, 4, 5, 6] as const;

export const TIPOS_DIETA = [
  "vegana",
  "vegetariana",
  "tradicional",
  "carb_cycling",
] as const;
export type TipoDieta = (typeof TIPOS_DIETA)[number];

export const PROTEINAS_OPCOES = [
  "frango",
  "carne_vermelha",
  "ovo",
  "whey",
  "peixe",
  "porco",
] as const;

export const CARBOIDRATOS_OPCOES = [
  "frutas",
  "arroz",
  "massa",
  "pao_branco",
  "pao_integral",
  "feijao",
  "saladas_verdes",
  "legumes",
  "tapioca",
  "cuscuz",
  "moranga",
  "aveia",
] as const;

export const GORDURAS_OPCOES = [
  "castanha",
  "nozes",
  "amendoim",
  "pasta_amendoim",
  "azeite_oliva",
  "gema_ovo",
  "abacate",
  "queijo",
  "requeijao",
] as const;

// ============================================================================
// Anamnese
// ============================================================================

export const anamnesisSchema = z.object({
  genero: z.enum(GENEROS),
  local_treino: z.enum(LOCAIS_TREINO),
  nome: z.string().min(2, "Informe seu nome").max(120),
  altura_cm: z.coerce.number().min(100).max(250),
  peso_kg: z.coerce.number().min(30).max(300),
  idade: z.coerce.number().int().min(12, "Idade mínima de 12 anos").max(100),
  percentual_gordura: z.coerce.number().min(3).max(60).optional(),
  nivel_experiencia: z.enum(NIVEIS_EXPERIENCIA),
  frequencia_treino: z.coerce.number().int().min(3).max(6),
  dias_aerobico: z.coerce.number().int().min(0).max(7),
  restricoes_saude: z.string().max(1000).optional().default(""),
  objetivo: z.enum(OBJETIVOS),
  zonas_alvo: z.array(z.enum(ZONAS_ALVO)).default([]),
  refeicoes_por_dia: z.coerce.number().int().min(3).max(6),
  tipo_dieta: z.enum(TIPOS_DIETA),
  proteinas: z.array(z.enum(PROTEINAS_OPCOES)).min(1, "Selecione ao menos uma proteína"),
  carboidratos: z
    .array(z.enum(CARBOIDRATOS_OPCOES))
    .min(1, "Selecione ao menos um carboidrato"),
  gorduras: z.array(z.enum(GORDURAS_OPCOES)).min(1, "Selecione ao menos uma gordura"),
});

export type AnamnesisInput = z.infer<typeof anamnesisSchema>;

export interface AnamnesisRecord extends AnamnesisInput {
  id: string;
  user_id: string;
  tmb: number;
  gasto_total: number;
  meta_calorica: number;
  agua_ml: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Planos (treino / dieta)
// ============================================================================

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

// ============================================================================
// Assinatura
// ============================================================================

export const PLANOS_ASSINATURA = ["oito_semanas"] as const;
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

export function assinaturaAtiva(sub: SubscriptionRecord | null | undefined): boolean {
  return sub?.status === "active";
}

/** Libera os módulos exclusivos: foto da dieta, suplementos e correção de vídeo. */
export function temPlano8Semanas(sub: SubscriptionRecord | null | undefined): boolean {
  return sub?.status === "active" && sub.plano === "oito_semanas";
}

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

// ============================================================================
// Evolução — medidas corporais e dobras cutâneas
// ============================================================================

export const dobras7Schema = z.object({
  peitoral: z.coerce.number().min(1).max(60),
  axilar_media: z.coerce.number().min(1).max(60),
  triceps: z.coerce.number().min(1).max(60),
  subescapular: z.coerce.number().min(1).max(60),
  abdominal: z.coerce.number().min(1).max(60),
  suprailiaca: z.coerce.number().min(1).max(60),
  coxa: z.coerce.number().min(1).max(60),
});

export const bodyMeasurementSchema = z.object({
  peso_kg: z.coerce.number().min(30).max(300),
  peito_cm: z.coerce.number().min(30).max(200).optional(),
  cintura_cm: z.coerce.number().min(30).max(200).optional(),
  quadril_cm: z.coerce.number().min(30).max(200).optional(),
  braco_cm: z.coerce.number().min(10).max(100).optional(),
  coxa_cm: z.coerce.number().min(20).max(150).optional(),
  dobras: dobras7Schema.optional(),
});

export type BodyMeasurementInput = z.infer<typeof bodyMeasurementSchema>;

export interface BodyMeasurementRecord extends BodyMeasurementInput {
  id: string;
  user_id: string;
  percentual_gordura: number | null;
  created_at: string;
}

// ============================================================================
// Água
// ============================================================================

export const waterLogSchema = z.object({
  quantidade_ml: z.coerce.number().int().min(50).max(3000),
});

export type WaterLogInput = z.infer<typeof waterLogSchema>;

export interface WaterLogRecord extends WaterLogInput {
  id: string;
  user_id: string;
  created_at: string;
}

// ============================================================================
// Suplementos (módulo exclusivo do plano 8 semanas)
// ============================================================================

export const SUPLEMENTOS_COMUNS = [
  "Whey Protein",
  "Creatina",
  "Albumina",
  "Hipercalórico",
  "Termogênico",
  "Glutamina",
  "Pré-treino",
] as const;

// ============================================================================
// Correção de vídeo (módulo exclusivo do plano 8 semanas)
// ============================================================================

export const VIDEO_CORRECTION_STATUS = [
  "processando",
  "pronto",
  "expirado",
  "erro",
] as const;
export type VideoCorrectionStatus = (typeof VIDEO_CORRECTION_STATUS)[number];

export interface VideoCorrectionRecord {
  id: string;
  user_id: string;
  exercicio: string;
  observacao: string | null;
  status: VideoCorrectionStatus;
  feedback_texto: string | null;
  feedback_audio_path: string | null;
  created_at: string;
  expires_at: string;
}

// ============================================================================
// Substituição de exercícios (academia lotada)
// ============================================================================

export interface ExerciseRecord {
  id: string;
  nome: string;
  grupo_muscular: string;
  padrao_movimento: string;
  local_treino: LocalTreino;
}

export interface ExerciseSubstitutionResult {
  exercicio_original: string;
  substitutos: ExerciseRecord[];
}

import type { Genero, NivelExperiencia, Objetivo } from "@/lib/types";

/**
 * Taxa Metabólica Basal — fórmula de Harris-Benedict (revisada).
 */
export function calcularTMB(
  genero: Genero,
  pesoKg: number,
  alturaCm: number,
  idade: number
): number {
  if (genero === "masculino") {
    return 88.362 + 13.397 * pesoKg + 4.799 * alturaCm - 5.677 * idade;
  }
  return 447.593 + 9.247 * pesoKg + 3.098 * alturaCm - 4.33 * idade;
}

// Fator de atividade de Harris-Benedict, usando o nível de experiência/atividade
// física informado na anamnese como proxy do nível de atividade do dia a dia.
const FATOR_ATIVIDADE: Record<NivelExperiencia, number> = {
  iniciante: 1.375, // leve
  intermediario: 1.55, // moderado
  avancado: 1.725, // intenso
};

export function calcularGastoTotal(tmb: number, nivel: NivelExperiencia): number {
  return tmb * FATOR_ATIVIDADE[nivel];
}

// Ajuste de calorias por objetivo, aplicado sobre o gasto energético total.
const AJUSTE_OBJETIVO: Record<Objetivo, number> = {
  emagrecimento: -700,
  definicao: -500,
  ganho_massa: 500,
};

export function calcularMetaCalorica(gastoTotal: number, objetivo: Objetivo): number {
  return Math.max(gastoTotal + AJUSTE_OBJETIVO[objetivo], 1000);
}

// Consumo de água recomendado: ~50ml por kg de peso corporal.
export function calcularAguaMl(pesoKg: number): number {
  return pesoKg * 50;
}

export interface ResultadoCalculo {
  tmb: number;
  gastoTotal: number;
  aguaMl: number;
}

export function calcularResultado(
  genero: Genero,
  pesoKg: number,
  alturaCm: number,
  idade: number,
  nivel: NivelExperiencia
): ResultadoCalculo {
  const tmb = calcularTMB(genero, pesoKg, alturaCm, idade);
  const gastoTotal = calcularGastoTotal(tmb, nivel);
  const aguaMl = calcularAguaMl(pesoKg);
  return { tmb, gastoTotal, aguaMl };
}

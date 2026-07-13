import type { Genero } from "@/lib/types";

/**
 * Protocolo de 7 dobras cutâneas de Jackson & Pollock (1978), em milímetros.
 */
export interface Dobras7 {
  peitoral: number;
  axilar_media: number;
  triceps: number;
  subescapular: number;
  abdominal: number;
  suprailiaca: number;
  coxa: number;
}

export function somaDobras(d: Dobras7): number {
  return (
    d.peitoral +
    d.axilar_media +
    d.triceps +
    d.subescapular +
    d.abdominal +
    d.suprailiaca +
    d.coxa
  );
}

/** Retorna o percentual de gordura corporal estimado (equação de Siri). */
export function calcularPercentualGordura(
  genero: Genero,
  dobras: Dobras7,
  idade: number
): number {
  const soma = somaDobras(dobras);
  const densidade =
    genero === "masculino"
      ? 1.112 - 0.00043499 * soma + 0.00000055 * soma ** 2 - 0.00028826 * idade
      : 1.097 - 0.00046971 * soma + 0.00000056 * soma ** 2 - 0.00012828 * idade;

  return 495 / densidade - 450;
}

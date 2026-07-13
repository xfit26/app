import type { AnamnesisInput, WorkoutPlanContent } from "@/lib/types";

type Local = "academia" | "casa";

const EXERCISE_POOL: Record<string, Record<Local, string[]>> = {
  Peito: {
    academia: ["Supino reto com barra", "Supino inclinado com halteres", "Crucifixo no cabo", "Peck deck", "Supino declinado"],
    casa: ["Flexão de braço", "Flexão declinada", "Flexão com apoio elevado", "Crucifixo com elástico"],
  },
  Costas: {
    academia: ["Puxada alta na polia", "Remada curvada com barra", "Remada baixa no cabo", "Pulldown unilateral", "Barra fixa"],
    casa: ["Remada com elástico", "Barra fixa", "Superman", "Remada invertida"],
  },
  Ombros: {
    academia: ["Desenvolvimento com halteres", "Elevação lateral", "Elevação frontal", "Desenvolvimento na máquina", "Remada alta"],
    casa: ["Desenvolvimento com halteres", "Elevação lateral com elástico", "Pike push-up"],
  },
  Bíceps: {
    academia: ["Rosca direta com barra", "Rosca alternada com halteres", "Rosca scott", "Rosca no cabo"],
    casa: ["Rosca com halteres", "Rosca com elástico", "Rosca concentrada"],
  },
  Tríceps: {
    academia: ["Tríceps corda no cabo", "Tríceps francês", "Mergulho no banco", "Tríceps testa"],
    casa: ["Mergulho entre cadeiras", "Flexão diamante", "Tríceps com elástico"],
  },
  Quadríceps: {
    academia: ["Agachamento livre", "Leg press 45°", "Cadeira extensora", "Agachamento búlgaro", "Hack machine"],
    casa: ["Agachamento livre", "Agachamento búlgaro", "Afundo", "Agachamento sumô"],
  },
  "Posterior de coxa": {
    academia: ["Mesa flexora", "Stiff com barra", "Cadeira flexora", "Bom dia"],
    casa: ["Stiff com halteres", "Elevação pélvica unilateral", "Flexão nórdica assistida"],
  },
  Glúteos: {
    academia: ["Elevação pélvica com barra", "Cadeira abdutora", "Agachamento sumô com halter", "Coice no cabo"],
    casa: ["Elevação pélvica", "Ponte unilateral", "Coice no solo", "Agachamento sumô"],
  },
  Panturrilha: {
    academia: ["Panturrilha em pé na máquina", "Panturrilha sentado", "Panturrilha no leg press"],
    casa: ["Panturrilha em pé com peso corporal", "Panturrilha unilateral"],
  },
  Abdômen: {
    academia: ["Abdominal na polia", "Prancha", "Elevação de pernas", "Abdominal infra na máquina"],
    casa: ["Prancha", "Abdominal tradicional", "Elevação de pernas", "Bicicleta no solo"],
  },
};

const RESTRICTIONS: { keyword: string; avoid: string[] }[] = [
  { keyword: "joelho", avoid: ["Agachamento livre", "Agachamento búlgaro", "Cadeira extensora", "Afundo", "Leg press", "Hack machine"] },
  { keyword: "ombro", avoid: ["Desenvolvimento", "Elevação lateral", "Elevação frontal", "Pike push-up", "Remada alta"] },
  { keyword: "lombar", avoid: ["Stiff", "Bom dia", "Remada curvada", "Agachamento livre"] },
  { keyword: "coluna", avoid: ["Stiff", "Bom dia", "Remada curvada", "Agachamento livre"] },
  { keyword: "hérnia", avoid: ["Stiff", "Bom dia", "Remada curvada", "Agachamento livre"] },
  { keyword: "punho", avoid: ["Flexão", "Supino", "Rosca"] },
];

const OBJETIVO_CONFIG: Record<string, { series: number; repeticoes: string; descanso_seg: number }> = {
  emagrecimento: { series: 3, repeticoes: "15-20", descanso_seg: 45 },
  hipertrofia: { series: 4, repeticoes: "8-12", descanso_seg: 60 },
  forca: { series: 5, repeticoes: "4-6", descanso_seg: 120 },
  resistencia: { series: 3, repeticoes: "18-25", descanso_seg: 30 },
  saude_geral: { series: 3, repeticoes: "10-12", descanso_seg: 60 },
};

type DiaSplit = { nome: string; foco: string; grupos: string[] };

function buildSplit(dias: number): DiaSplit[] {
  const full = ["Peito", "Costas", "Ombros", "Quadríceps", "Posterior de coxa", "Glúteos", "Bíceps", "Tríceps", "Abdômen"];

  if (dias <= 2) {
    return Array.from({ length: dias }, (_, i) => ({
      nome: `Treino ${String.fromCharCode(65 + i)} - Corpo inteiro`,
      foco: "Corpo inteiro",
      grupos: full,
    }));
  }

  if (dias === 3) {
    return [
      { nome: "Treino A - Peito, ombros e tríceps", foco: "Empurrar", grupos: ["Peito", "Ombros", "Tríceps"] },
      { nome: "Treino B - Costas e bíceps", foco: "Puxar", grupos: ["Costas", "Bíceps"] },
      { nome: "Treino C - Pernas e abdômen", foco: "Inferiores", grupos: ["Quadríceps", "Posterior de coxa", "Glúteos", "Panturrilha", "Abdômen"] },
    ];
  }

  if (dias === 4) {
    return [
      { nome: "Treino A - Superiores (empurrar)", foco: "Peito, ombros e tríceps", grupos: ["Peito", "Ombros", "Tríceps"] },
      { nome: "Treino B - Inferiores", foco: "Quadríceps, posterior e glúteos", grupos: ["Quadríceps", "Posterior de coxa", "Glúteos", "Panturrilha"] },
      { nome: "Treino C - Superiores (puxar)", foco: "Costas, bíceps e abdômen", grupos: ["Costas", "Bíceps", "Abdômen"] },
      { nome: "Treino D - Inferiores e ombros", foco: "Pernas e ombros", grupos: ["Quadríceps", "Glúteos", "Ombros", "Panturrilha"] },
    ];
  }

  if (dias === 5) {
    return [
      { nome: "Treino A - Peito", foco: "Peito", grupos: ["Peito", "Abdômen"] },
      { nome: "Treino B - Costas", foco: "Costas", grupos: ["Costas", "Abdômen"] },
      { nome: "Treino C - Pernas", foco: "Quadríceps, posterior e glúteos", grupos: ["Quadríceps", "Posterior de coxa", "Glúteos", "Panturrilha"] },
      { nome: "Treino D - Ombros", foco: "Ombros", grupos: ["Ombros", "Abdômen"] },
      { nome: "Treino E - Braços", foco: "Bíceps e tríceps", grupos: ["Bíceps", "Tríceps"] },
    ];
  }

  if (dias === 6) {
    return [
      { nome: "Treino A - Empurrar", foco: "Peito, ombros e tríceps", grupos: ["Peito", "Ombros", "Tríceps"] },
      { nome: "Treino B - Puxar", foco: "Costas e bíceps", grupos: ["Costas", "Bíceps"] },
      { nome: "Treino C - Pernas", foco: "Quadríceps, posterior e glúteos", grupos: ["Quadríceps", "Posterior de coxa", "Glúteos", "Panturrilha"] },
      { nome: "Treino D - Empurrar", foco: "Peito, ombros e tríceps", grupos: ["Peito", "Ombros", "Tríceps"] },
      { nome: "Treino E - Puxar", foco: "Costas e bíceps", grupos: ["Costas", "Bíceps"] },
      { nome: "Treino F - Pernas e abdômen", foco: "Inferiores e core", grupos: ["Quadríceps", "Glúteos", "Panturrilha", "Abdômen"] },
    ];
  }

  return [
    { nome: "Treino A - Empurrar", foco: "Peito, ombros e tríceps", grupos: ["Peito", "Ombros", "Tríceps"] },
    { nome: "Treino B - Puxar", foco: "Costas e bíceps", grupos: ["Costas", "Bíceps"] },
    { nome: "Treino C - Pernas", foco: "Quadríceps, posterior e glúteos", grupos: ["Quadríceps", "Posterior de coxa", "Glúteos", "Panturrilha"] },
    { nome: "Treino D - Empurrar", foco: "Peito, ombros e tríceps", grupos: ["Peito", "Ombros", "Tríceps"] },
    { nome: "Treino E - Puxar", foco: "Costas e bíceps", grupos: ["Costas", "Bíceps"] },
    { nome: "Treino F - Pernas", foco: "Quadríceps, posterior e glúteos", grupos: ["Quadríceps", "Posterior de coxa", "Glúteos"] },
    { nome: "Treino G - Mobilidade e abdômen", foco: "Core e recuperação ativa", grupos: ["Abdômen", "Panturrilha"] },
  ];
}

function exercisesAllowed(nomes: string[], restricoesTexto: string): string[] {
  const texto = restricoesTexto.toLowerCase();
  const bloqueados = RESTRICTIONS.filter((r) => texto.includes(r.keyword)).flatMap((r) => r.avoid);
  if (bloqueados.length === 0) return nomes;
  return nomes.filter((nome) => !bloqueados.some((b) => nome.toLowerCase().includes(b.toLowerCase())));
}

function pickExercises(grupo: string, local: Local, quantidade: number, restricoesTexto: string): string[] {
  const pool = EXERCISE_POOL[grupo];
  if (!pool) return [];
  // Never fall back to the unfiltered pool: a restricted exercise must never
  // reappear just because too few safe alternatives exist for this group.
  const candidatos = exercisesAllowed(pool[local], restricoesTexto);
  return candidatos.slice(0, quantidade);
}

export function buildWorkoutPlan(anamnesis: AnamnesisInput): WorkoutPlanContent {
  const local: Local = anamnesis.local_treino === "academia" ? "academia" : "casa";
  const config = OBJETIVO_CONFIG[anamnesis.objetivo] ?? OBJETIVO_CONFIG.saude_geral;
  const restricoesTexto = `${anamnesis.lesoes_limitacoes || ""} ${anamnesis.condicoes_medicas || ""}`;
  const zonas = new Set(anamnesis.zonas_prioritarias ?? []);

  const baseCount = anamnesis.nivel_experiencia === "iniciante" ? 2 : anamnesis.nivel_experiencia === "avancado" ? 4 : 3;
  const minutosPorExercicio = 10;
  const tetoPorDia = Math.max(3, Math.round(anamnesis.tempo_por_sessao_min / minutosPorExercicio));

  const split = buildSplit(anamnesis.dias_disponiveis);

  const dias = split.map((dia) => {
    let orcamento = Math.min(tetoPorDia, dia.grupos.length * (baseCount + 1));
    const exercicios: WorkoutPlanContent["dias"][number]["exercicios"] = [];

    for (const grupo of dia.grupos) {
      if (orcamento <= 0) break;
      const prioridade = zonas.has(grupo as (typeof anamnesis.zonas_prioritarias)[number]);
      const quantidade = Math.min(orcamento, prioridade ? baseCount + 1 : baseCount);
      const nomes = pickExercises(grupo, local, quantidade, restricoesTexto);

      nomes.forEach((nome, i) => {
        exercicios.push({
          nome,
          series: config.series,
          repeticoes: config.repeticoes,
          descanso_seg: config.descanso_seg,
          observacao: i === 0 && prioridade ? "Zona prioritária da sua anamnese — volume extra." : undefined,
        });
      });

      orcamento -= nomes.length;
    }

    return { nome: dia.nome, foco: dia.foco, exercicios };
  });

  return {
    titulo: `Plano de treino — ${anamnesis.dias_disponiveis}x por semana`,
    resumo: `Gerado a partir da sua anamnese: nível ${anamnesis.nivel_experiencia}, objetivo ${anamnesis.objetivo.replace("_", " ")}, treinando em ${local === "academia" ? "academia" : "casa"}${zonas.size > 0 ? `, com prioridade em ${Array.from(zonas).join(", ")}` : ""}.`,
    dias,
  };
}

export function getSubstitutes(nomeExercicio: string): string[] {
  const alvo = nomeExercicio.trim().toLowerCase();
  for (const grupo of Object.values(EXERCISE_POOL)) {
    const todos = [...grupo.academia, ...grupo.casa];
    if (todos.some((n) => n.toLowerCase() === alvo)) {
      return todos.filter((n) => n.toLowerCase() !== alvo).slice(0, 3);
    }
  }
  return [];
}

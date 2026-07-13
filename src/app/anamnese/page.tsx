"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  anamnesisSchema,
  type AnamnesisInput,
  GENEROS,
  LOCAIS_TREINO,
  NIVEIS_EXPERIENCIA,
  FREQUENCIAS_TREINO,
  DIAS_AEROBICO,
  OBJETIVOS,
  REFEICOES_POR_DIA_OPCOES,
  TIPOS_DIETA,
  PROTEINAS_OPCOES,
  CARBOIDRATOS_OPCOES,
  GORDURAS_OPCOES,
  type ZonaAlvo,
  type Genero,
} from "@/lib/types";
import { calcularResultado, calcularMetaCalorica } from "@/lib/calc/tmb";
import { setGeneroCookie } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea, CheckboxLabel } from "@/components/ui/field";
import { BodyMap } from "@/components/onboarding/body-map";

const LABELS: Record<string, string> = {
  masculino: "Masculino",
  feminino: "Feminino",
  casa: "Em casa",
  academia: "Na academia",
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
  emagrecimento: "Emagrecimento / perda de peso",
  definicao: "Definição / preservar massa e eliminar gordura",
  ganho_massa: "Ganho de massa / ganho de peso",
  vegana: "Vegana",
  vegetariana: "Vegetariana",
  tradicional: "Tradicional",
  carb_cycling: "Carb cycling (resultado mais rápido)",
  frango: "Frango",
  carne_vermelha: "Carne vermelha",
  ovo: "Ovo",
  whey: "Whey",
  peixe: "Peixe",
  porco: "Porco",
  frutas: "Frutas",
  arroz: "Arroz",
  massa: "Massa",
  pao_branco: "Pão branco",
  pao_integral: "Pão integral",
  feijao: "Feijão",
  saladas_verdes: "Saladas verdes",
  legumes: "Legumes",
  tapioca: "Tapioca",
  cuscuz: "Cuscuz",
  moranga: "Moranga",
  aveia: "Aveia",
  castanha: "Castanha",
  nozes: "Nozes",
  amendoim: "Amendoim",
  pasta_amendoim: "Pasta de amendoim",
  azeite_oliva: "Azeite de oliva",
  gema_ovo: "Gema do ovo",
  abacate: "Abacate",
  queijo: "Queijo",
  requeijao: "Requeijão",
};

const OBJETIVO_DELTA: Record<(typeof OBJETIVOS)[number], string> = {
  emagrecimento: "-700 kcal do gasto total",
  definicao: "-500 kcal do gasto total",
  ganho_massa: "+500 kcal do gasto total",
};

type AnamnesisFormInput = z.input<typeof anamnesisSchema>;

const STEP_TITLES = [
  "Gênero",
  "Local de treino",
  "Seus dados",
  "Seu cálculo e objetivo",
  "Mapa corporal",
  "Sua dieta",
];

const STEP_FIELDS: (keyof AnamnesisFormInput)[][] = [
  ["genero"],
  ["local_treino"],
  [
    "nome",
    "altura_cm",
    "peso_kg",
    "idade",
    "percentual_gordura",
    "nivel_experiencia",
    "frequencia_treino",
    "dias_aerobico",
  ],
  ["objetivo"],
  ["zonas_alvo"],
  ["refeicoes_por_dia", "tipo_dieta", "proteinas", "carboidratos", "gorduras"],
];

function ChoiceCard({
  selected,
  onClick,
  title,
  subtitle,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl border-2 px-5 py-6 text-left transition-colors ${
        selected
          ? "border-primary bg-primary/10"
          : "border-border bg-card hover:border-primary/50"
      }`}
    >
      <p className="text-lg font-semibold">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
    </button>
  );
}

export default function AnamnesePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AnamnesisFormInput, unknown, AnamnesisInput>({
    resolver: zodResolver(anamnesisSchema),
    defaultValues: {
      zonas_alvo: [],
      proteinas: [],
      carboidratos: [],
      gorduras: [],
      restricoes_saude: "",
    },
  });

  const genero = watch("genero") as Genero | undefined;
  const localTreino = watch("local_treino");
  const peso = Number(watch("peso_kg")) || 0;
  const altura = Number(watch("altura_cm")) || 0;
  const idade = Number(watch("idade")) || 0;
  const nivelExperiencia = watch("nivel_experiencia");
  const objetivo = watch("objetivo");
  const zonasAlvo = (watch("zonas_alvo") || []) as ZonaAlvo[];
  const proteinas = watch("proteinas") || [];
  const carboidratos = watch("carboidratos") || [];
  const gorduras = watch("gorduras") || [];

  const resultado = useMemo(() => {
    if (!genero || !peso || !altura || !idade || !nivelExperiencia) return null;
    return calcularResultado(genero, peso, altura, idade, nivelExperiencia);
  }, [genero, peso, altura, idade, nivelExperiencia]);

  function toggleInArray<T extends string>(field: keyof AnamnesisFormInput, value: T) {
    const current = (watch(field) as T[]) || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setValue(field, next as never, { shouldValidate: true });
  }

  function selectGenero(g: Genero) {
    setValue("genero", g, { shouldValidate: true });
    document.documentElement.dataset.theme = g;
    setGeneroCookie(g);
  }

  async function goNext() {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEP_TITLES.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(data: AnamnesisInput) {
    setSubmitting(true);
    setError(null);

    try {
      const anamneseRes = await fetch("/api/anamnese", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!anamneseRes.ok) {
        throw new Error("Não foi possível salvar sua anamnese.");
      }

      const { id } = await anamneseRes.json();

      setSubmitting(false);
      setGerando(true);

      const planoRes = await fetch("/api/gerar-plano", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anamnesisId: id }),
      });

      if (!planoRes.ok) {
        throw new Error(
          "Sua anamnese foi salva, mas não foi possível gerar o plano agora. Tente novamente no painel."
        );
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setSubmitting(false);
      setGerando(false);
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    }
  }

  if (gerando) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
        <h1 className="mt-6 text-lg font-semibold">
          O treinador Léo Moura está montando seu treino e sua dieta...
        </h1>
        <p className="mt-2 text-sm text-muted">
          Nossa IA está preparando um plano personalizado com base nas suas
          respostas. Isso pode levar até 1 minuto.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Anamnese</h1>
      <p className="mt-1 text-sm text-muted">
        Passo {step + 1} de {STEP_TITLES.length} — {STEP_TITLES[step]}
      </p>

      <div className="mt-3 h-1.5 w-full rounded-full bg-border">
        <div
          className="h-1.5 rounded-full bg-primary transition-all"
          style={{ width: `${((step + 1) / STEP_TITLES.length) * 100}%` }}
        />
      </div>

      <Card className="mt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {step === 0 && (
            <>
              <p className="text-sm text-muted">
                Qual é o seu gênero? Isso define a identidade visual do app.
              </p>
              <div className="flex gap-3">
                {GENEROS.map((g) => (
                  <ChoiceCard
                    key={g}
                    selected={genero === g}
                    onClick={() => selectGenero(g)}
                    title={LABELS[g]}
                  />
                ))}
              </div>
              {errors.genero && (
                <span className="text-xs text-red-500">{errors.genero.message}</span>
              )}
            </>
          )}

          {step === 1 && (
            <>
              <p className="text-sm text-muted">Onde você vai treinar?</p>
              <div className="flex gap-3">
                {LOCAIS_TREINO.map((l) => (
                  <ChoiceCard
                    key={l}
                    selected={localTreino === l}
                    onClick={() =>
                      setValue("local_treino", l, { shouldValidate: true })
                    }
                    title={LABELS[l]}
                  />
                ))}
              </div>
              {errors.local_treino && (
                <span className="text-xs text-red-500">
                  {errors.local_treino.message}
                </span>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <Field label="Nome" htmlFor="nome" error={errors.nome?.message}>
                <Input id="nome" {...register("nome")} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Altura (cm)" htmlFor="altura_cm" error={errors.altura_cm?.message}>
                  <Input id="altura_cm" type="number" {...register("altura_cm")} />
                </Field>
                <Field label="Peso (kg)" htmlFor="peso_kg" error={errors.peso_kg?.message}>
                  <Input id="peso_kg" type="number" step="0.1" {...register("peso_kg")} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Idade" htmlFor="idade" error={errors.idade?.message}>
                  <Input id="idade" type="number" {...register("idade")} />
                </Field>
                <Field
                  label="% de gordura (opcional)"
                  htmlFor="percentual_gordura"
                  error={errors.percentual_gordura?.message}
                >
                  <Input
                    id="percentual_gordura"
                    type="number"
                    step="0.1"
                    {...register("percentual_gordura")}
                  />
                </Field>
              </div>
              <Field
                label="Nível de atividade física"
                htmlFor="nivel_experiencia"
                error={errors.nivel_experiencia?.message}
              >
                <Select id="nivel_experiencia" {...register("nivel_experiencia")}>
                  <option value="">Selecione</option>
                  {NIVEIS_EXPERIENCIA.map((v) => (
                    <option key={v} value={v}>
                      {LABELS[v]}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Frequência de treino (dias/semana)"
                  htmlFor="frequencia_treino"
                  error={errors.frequencia_treino?.message}
                >
                  <Select id="frequencia_treino" {...register("frequencia_treino")}>
                    <option value="">Selecione</option>
                    {FREQUENCIAS_TREINO.map((v) => (
                      <option key={v} value={v}>
                        {v}x por semana
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field
                  label="Disponibilidade para aeróbico"
                  htmlFor="dias_aerobico"
                  error={errors.dias_aerobico?.message}
                >
                  <Select id="dias_aerobico" {...register("dias_aerobico")}>
                    <option value="">Selecione</option>
                    {DIAS_AEROBICO.map((v) => (
                      <option key={v} value={v}>
                        {v === 0 ? "Nenhum dia" : `${v} dia(s)`}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field
                label="Lesões, limitações ou condições de saúde (opcional)"
                htmlFor="restricoes_saude"
                error={errors.restricoes_saude?.message}
              >
                <Textarea
                  id="restricoes_saude"
                  placeholder="Ex: dor no joelho direito, hipertensão..."
                  {...register("restricoes_saude")}
                />
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              {resultado ? (
                <>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted">TMB</p>
                      <p className="mt-1 text-lg font-semibold">
                        {Math.round(resultado.tmb)} kcal
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted">Gasto total/dia</p>
                      <p className="mt-1 text-lg font-semibold">
                        {Math.round(resultado.gastoTotal)} kcal
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted">Água recomendada</p>
                      <p className="mt-1 text-lg font-semibold">
                        {(resultado.aguaMl / 1000).toFixed(1)} L
                      </p>
                    </div>
                  </div>

                  <p className="mt-2 text-sm font-medium">Qual o seu objetivo?</p>
                  <div className="flex flex-col gap-2">
                    {OBJETIVOS.map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() =>
                          setValue("objetivo", o, { shouldValidate: true })
                        }
                        className={`rounded-lg border-2 px-4 py-3 text-left transition-colors ${
                          objetivo === o
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:border-primary/50"
                        }`}
                      >
                        <p className="font-medium">{LABELS[o]}</p>
                        <p className="text-xs text-muted">
                          {OBJETIVO_DELTA[o]} ={" "}
                          {Math.round(
                            calcularMetaCalorica(resultado.gastoTotal, o)
                          )}{" "}
                          kcal/dia
                        </p>
                      </button>
                    ))}
                  </div>
                  {errors.objetivo && (
                    <span className="text-xs text-red-500">
                      {errors.objetivo.message}
                    </span>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted">
                  Preencha os dados do passo anterior para ver seu cálculo.
                </p>
              )}
            </>
          )}

          {step === 4 && (
            <BodyMap
              value={zonasAlvo}
              onChange={(zonas) =>
                setValue("zonas_alvo", zonas, { shouldValidate: true })
              }
            />
          )}

          {step === 5 && (
            <>
              <Field
                label="Refeições por dia"
                htmlFor="refeicoes_por_dia"
                error={errors.refeicoes_por_dia?.message}
              >
                <Select id="refeicoes_por_dia" {...register("refeicoes_por_dia")}>
                  <option value="">Selecione</option>
                  {REFEICOES_POR_DIA_OPCOES.map((v) => (
                    <option key={v} value={v}>
                      {v} refeições
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label="Tipo de dieta"
                htmlFor="tipo_dieta"
                error={errors.tipo_dieta?.message}
              >
                <Select id="tipo_dieta" {...register("tipo_dieta")}>
                  <option value="">Selecione</option>
                  {TIPOS_DIETA.map((v) => (
                    <option key={v} value={v}>
                      {LABELS[v]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Proteínas" htmlFor="proteinas" error={errors.proteinas?.message}>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {PROTEINAS_OPCOES.map((v) => (
                    <CheckboxLabel
                      key={v}
                      checked={proteinas.includes(v)}
                      onChange={() => toggleInArray("proteinas", v)}
                    >
                      {LABELS[v]}
                    </CheckboxLabel>
                  ))}
                </div>
              </Field>
              <Field
                label="Carboidratos"
                htmlFor="carboidratos"
                error={errors.carboidratos?.message}
              >
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {CARBOIDRATOS_OPCOES.map((v) => (
                    <CheckboxLabel
                      key={v}
                      checked={carboidratos.includes(v)}
                      onChange={() => toggleInArray("carboidratos", v)}
                    >
                      {LABELS[v]}
                    </CheckboxLabel>
                  ))}
                </div>
              </Field>
              <Field label="Gorduras" htmlFor="gorduras" error={errors.gorduras?.message}>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {GORDURAS_OPCOES.map((v) => (
                    <CheckboxLabel
                      key={v}
                      checked={gorduras.includes(v)}
                      onChange={() => toggleInArray("gorduras", v)}
                    >
                      {LABELS[v]}
                    </CheckboxLabel>
                  ))}
                </div>
              </Field>
            </>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="mt-2 flex justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={goBack}
              disabled={step === 0}
            >
              Voltar
            </Button>

            {step < STEP_TITLES.length - 1 ? (
              <Button type="button" onClick={goNext}>
                Próximo
              </Button>
            ) : (
              <Button type="submit" disabled={submitting}>
                {submitting ? "Salvando..." : "Gerar meu plano"}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}

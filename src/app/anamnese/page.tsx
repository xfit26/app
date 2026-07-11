"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  anamnesisSchema,
  type AnamnesisInput,
  OBJETIVOS,
  NIVEIS_EXPERIENCIA,
  LOCAIS_TREINO,
  NIVEIS_ATIVIDADE,
  QUALIDADES_SONO,
  NIVEIS_ESTRESSE,
  SEXOS,
  EQUIPAMENTOS_DISPONIVEIS,
  RESTRICOES_ALIMENTARES,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea, CheckboxLabel } from "@/components/ui/field";

const LABELS: Record<string, string> = {
  emagrecimento: "Emagrecimento",
  hipertrofia: "Hipertrofia (ganho de massa)",
  resistencia: "Resistência / condicionamento",
  forca: "Força",
  saude_geral: "Saúde geral / bem-estar",
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
  casa: "Em casa",
  academia: "Academia",
  ar_livre: "Ar livre",
  sedentario: "Sedentário",
  leve: "Leve",
  moderado: "Moderado",
  intenso: "Intenso",
  ruim: "Ruim",
  regular: "Regular",
  boa: "Boa",
  baixo: "Baixo",
  medio: "Médio",
  alto: "Alto",
  masculino: "Masculino",
  feminino: "Feminino",
  outro: "Outro",
  halteres: "Halteres",
  barra: "Barra",
  anilhas: "Anilhas",
  elasticos: "Elásticos",
  banco: "Banco",
  barra_fixa: "Barra fixa",
  kettlebell: "Kettlebell",
  maquinas: "Máquinas",
  nenhum: "Nenhum equipamento",
  vegetariano: "Vegetariano",
  vegano: "Vegano",
  sem_lactose: "Sem lactose",
  sem_gluten: "Sem glúten",
  low_carb: "Low carb",
  nenhuma: "Nenhuma",
};

type AnamnesisFormInput = z.input<typeof anamnesisSchema>;

const STEPS: { title: string; fields: (keyof AnamnesisFormInput)[] }[] = [
  {
    title: "Dados pessoais",
    fields: ["idade", "sexo", "altura_cm", "peso_kg", "objetivo"],
  },
  {
    title: "Rotina de treino",
    fields: [
      "nivel_experiencia",
      "dias_disponiveis",
      "tempo_por_sessao_min",
      "local_treino",
      "equipamentos",
    ],
  },
  {
    title: "Saúde",
    fields: ["lesoes_limitacoes", "condicoes_medicas"],
  },
  {
    title: "Alimentação",
    fields: ["restricoes_alimentares", "alergias", "refeicoes_por_dia"],
  },
  {
    title: "Estilo de vida",
    fields: [
      "nivel_atividade_diaria",
      "qualidade_sono",
      "nivel_estresse",
      "observacoes",
    ],
  },
];

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
      equipamentos: [],
      restricoes_alimentares: [],
      lesoes_limitacoes: "",
      condicoes_medicas: "",
      alergias: "",
      observacoes: "",
    },
  });

  const equipamentos = watch("equipamentos") || [];
  const restricoes = watch("restricoes_alimentares") || [];

  function toggleEquipamento(value: (typeof EQUIPAMENTOS_DISPONIVEIS)[number]) {
    const next = equipamentos.includes(value)
      ? equipamentos.filter((v) => v !== value)
      : [...equipamentos, value];
    setValue("equipamentos", next, { shouldValidate: true });
  }

  function toggleRestricao(value: (typeof RESTRICOES_ALIMENTARES)[number]) {
    const next = restricoes.includes(value)
      ? restricoes.filter((v) => v !== value)
      : [...restricoes, value];
    setValue("restricoes_alimentares", next, { shouldValidate: true });
  }

  async function goNext() {
    const valid = await trigger(STEPS[step].fields);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
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
          Gerando seu treino e dieta...
        </h1>
        <p className="mt-2 text-sm text-muted">
          Nossa IA está montando um plano personalizado com base nas suas
          respostas. Isso pode levar até 1 minuto.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Anamnese</h1>
      <p className="mt-1 text-sm text-muted">
        Passo {step + 1} de {STEPS.length} — {STEPS[step].title}
      </p>

      <div className="mt-3 h-1.5 w-full rounded-full bg-border">
        <div
          className="h-1.5 rounded-full bg-primary transition-all"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <Card className="mt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {step === 0 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Idade" htmlFor="idade" error={errors.idade?.message}>
                  <Input id="idade" type="number" {...register("idade")} />
                </Field>
                <Field label="Sexo" htmlFor="sexo" error={errors.sexo?.message}>
                  <Select id="sexo" {...register("sexo")}>
                    <option value="">Selecione</option>
                    {SEXOS.map((v) => (
                      <option key={v} value={v}>
                        {LABELS[v]}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Altura (cm)" htmlFor="altura_cm" error={errors.altura_cm?.message}>
                  <Input id="altura_cm" type="number" {...register("altura_cm")} />
                </Field>
                <Field label="Peso (kg)" htmlFor="peso_kg" error={errors.peso_kg?.message}>
                  <Input id="peso_kg" type="number" step="0.1" {...register("peso_kg")} />
                </Field>
              </div>
              <Field label="Objetivo principal" htmlFor="objetivo" error={errors.objetivo?.message}>
                <Select id="objetivo" {...register("objetivo")}>
                  <option value="">Selecione</option>
                  {OBJETIVOS.map((v) => (
                    <option key={v} value={v}>
                      {LABELS[v]}
                    </option>
                  ))}
                </Select>
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <Field
                label="Nível de experiência"
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
                  label="Dias disponíveis/semana"
                  htmlFor="dias_disponiveis"
                  error={errors.dias_disponiveis?.message}
                >
                  <Input
                    id="dias_disponiveis"
                    type="number"
                    min={1}
                    max={7}
                    {...register("dias_disponiveis")}
                  />
                </Field>
                <Field
                  label="Minutos por sessão"
                  htmlFor="tempo_por_sessao_min"
                  error={errors.tempo_por_sessao_min?.message}
                >
                  <Input
                    id="tempo_por_sessao_min"
                    type="number"
                    {...register("tempo_por_sessao_min")}
                  />
                </Field>
              </div>
              <Field label="Local de treino" htmlFor="local_treino" error={errors.local_treino?.message}>
                <Select id="local_treino" {...register("local_treino")}>
                  <option value="">Selecione</option>
                  {LOCAIS_TREINO.map((v) => (
                    <option key={v} value={v}>
                      {LABELS[v]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Equipamentos disponíveis" htmlFor="equipamentos">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {EQUIPAMENTOS_DISPONIVEIS.map((eq) => (
                    <CheckboxLabel
                      key={eq}
                      checked={equipamentos.includes(eq)}
                      onChange={() => toggleEquipamento(eq)}
                    >
                      {LABELS[eq]}
                    </CheckboxLabel>
                  ))}
                </div>
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <Field
                label="Lesões ou limitações físicas"
                htmlFor="lesoes_limitacoes"
                error={errors.lesoes_limitacoes?.message}
              >
                <Textarea
                  id="lesoes_limitacoes"
                  placeholder="Ex: dor no joelho direito, hérnia de disco lombar..."
                  {...register("lesoes_limitacoes")}
                />
              </Field>
              <Field
                label="Condições médicas relevantes"
                htmlFor="condicoes_medicas"
                error={errors.condicoes_medicas?.message}
              >
                <Textarea
                  id="condicoes_medicas"
                  placeholder="Ex: hipertensão, diabetes, asma..."
                  {...register("condicoes_medicas")}
                />
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              <Field label="Restrições alimentares" htmlFor="restricoes_alimentares">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {RESTRICOES_ALIMENTARES.map((r) => (
                    <CheckboxLabel
                      key={r}
                      checked={restricoes.includes(r)}
                      onChange={() => toggleRestricao(r)}
                    >
                      {LABELS[r]}
                    </CheckboxLabel>
                  ))}
                </div>
              </Field>
              <Field label="Alergias alimentares" htmlFor="alergias" error={errors.alergias?.message}>
                <Textarea
                  id="alergias"
                  placeholder="Ex: amendoim, frutos do mar..."
                  {...register("alergias")}
                />
              </Field>
              <Field
                label="Refeições por dia"
                htmlFor="refeicoes_por_dia"
                error={errors.refeicoes_por_dia?.message}
              >
                <Input
                  id="refeicoes_por_dia"
                  type="number"
                  min={2}
                  max={8}
                  {...register("refeicoes_por_dia")}
                />
              </Field>
            </>
          )}

          {step === 4 && (
            <>
              <Field
                label="Nível de atividade diária (fora do treino)"
                htmlFor="nivel_atividade_diaria"
                error={errors.nivel_atividade_diaria?.message}
              >
                <Select id="nivel_atividade_diaria" {...register("nivel_atividade_diaria")}>
                  <option value="">Selecione</option>
                  {NIVEIS_ATIVIDADE.map((v) => (
                    <option key={v} value={v}>
                      {LABELS[v]}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Qualidade do sono"
                  htmlFor="qualidade_sono"
                  error={errors.qualidade_sono?.message}
                >
                  <Select id="qualidade_sono" {...register("qualidade_sono")}>
                    <option value="">Selecione</option>
                    {QUALIDADES_SONO.map((v) => (
                      <option key={v} value={v}>
                        {LABELS[v]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field
                  label="Nível de estresse"
                  htmlFor="nivel_estresse"
                  error={errors.nivel_estresse?.message}
                >
                  <Select id="nivel_estresse" {...register("nivel_estresse")}>
                    <option value="">Selecione</option>
                    {NIVEIS_ESTRESSE.map((v) => (
                      <option key={v} value={v}>
                        {LABELS[v]}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <Field label="Observações adicionais" htmlFor="observacoes" error={errors.observacoes?.message}>
                <Textarea id="observacoes" {...register("observacoes")} />
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

            {step < STEPS.length - 1 ? (
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

const CAMPOS_DOBRAS: { id: string; label: string }[] = [
  { id: "peitoral", label: "Peitoral" },
  { id: "axilar_media", label: "Axilar média" },
  { id: "triceps", label: "Tríceps" },
  { id: "subescapular", label: "Subescapular" },
  { id: "abdominal", label: "Abdominal" },
  { id: "suprailiaca", label: "Suprailíaca" },
  { id: "coxa", label: "Coxa" },
];

export function BodyMeasurementForm() {
  const router = useRouter();
  const [showDobras, setShowDobras] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFeedback(null);

    const form = new FormData(e.currentTarget);
    const num = (id: string) => {
      const v = form.get(id);
      return v ? Number(v) : undefined;
    };

    let dobras: Record<string, number> | undefined;
    if (showDobras) {
      dobras = {};
      for (const campo of CAMPOS_DOBRAS) {
        const v = num(campo.id);
        if (v) dobras[campo.id] = v;
      }
      if (Object.keys(dobras).length < 7) dobras = undefined;
    }

    const res = await fetch("/api/medidas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        peso_kg: num("peso_kg"),
        peito_cm: num("peito_cm"),
        cintura_cm: num("cintura_cm"),
        quadril_cm: num("quadril_cm"),
        braco_cm: num("braco_cm"),
        coxa_cm: num("coxa_cm"),
        dobras,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Não foi possível salvar. Confira os campos obrigatórios.");
      return;
    }

    const data = await res.json();
    setFeedback(
      data.percentual_gordura
        ? `Registrado! % de gordura estimado: ${data.percentual_gordura.toFixed(1)}%`
        : "Registrado!"
    );
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field label="Peso (kg)" htmlFor="peso_kg">
          <Input id="peso_kg" name="peso_kg" type="number" step="0.1" required />
        </Field>
        <Field label="Peito (cm)" htmlFor="peito_cm">
          <Input id="peito_cm" name="peito_cm" type="number" step="0.1" />
        </Field>
        <Field label="Cintura (cm)" htmlFor="cintura_cm">
          <Input id="cintura_cm" name="cintura_cm" type="number" step="0.1" />
        </Field>
        <Field label="Quadril (cm)" htmlFor="quadril_cm">
          <Input id="quadril_cm" name="quadril_cm" type="number" step="0.1" />
        </Field>
        <Field label="Braço (cm)" htmlFor="braco_cm">
          <Input id="braco_cm" name="braco_cm" type="number" step="0.1" />
        </Field>
        <Field label="Coxa (cm)" htmlFor="coxa_cm">
          <Input id="coxa_cm" name="coxa_cm" type="number" step="0.1" />
        </Field>
      </div>

      <button
        type="button"
        className="self-start text-sm text-primary underline"
        onClick={() => setShowDobras((v) => !v)}
      >
        {showDobras ? "Ocultar" : "Adicionar"} dobras cutâneas (7 dobras — calcula % de gordura)
      </button>

      {showDobras && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CAMPOS_DOBRAS.map((campo) => (
            <Field key={campo.id} label={`${campo.label} (mm)`} htmlFor={campo.id}>
              <Input id={campo.id} name={campo.id} type="number" step="0.1" />
            </Field>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
      {feedback && <p className="text-sm text-primary">{feedback}</p>}

      <Button type="submit" disabled={loading} className="self-start">
        {loading ? "Salvando..." : "Registrar medidas"}
      </Button>
    </form>
  );
}

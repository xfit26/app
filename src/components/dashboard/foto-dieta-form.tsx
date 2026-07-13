"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import type { AnaliseFotoRefeicao } from "@/lib/ai/openai";

export function FotoDietaForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<AnaliseFotoRefeicao | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResultado(null);

    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/dieta/analisar-foto", {
      method: "POST",
      body: formData,
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error || "Não foi possível analisar a foto.");
      return;
    }

    setResultado(await res.json());
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field label="Foto da refeição" htmlFor="foto">
          <Input id="foto" name="foto" type="file" accept="image/*" required />
        </Field>
        <Button type="submit" disabled={loading}>
          {loading ? "Analisando..." : "Analisar com IA"}
        </Button>
      </form>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {resultado && (
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm">{resultado.descricao}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted">Calorias</p>
              <p className="font-semibold">{resultado.calorias} kcal</p>
            </div>
            <div>
              <p className="text-xs text-muted">Proteínas</p>
              <p className="font-semibold">{resultado.proteinas_g} g</p>
            </div>
            <div>
              <p className="text-xs text-muted">Carboidratos</p>
              <p className="font-semibold">{resultado.carboidratos_g} g</p>
            </div>
            <div>
              <p className="text-xs text-muted">Gorduras</p>
              <p className="font-semibold">{resultado.gorduras_g} g</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            Confiança da estimativa: {resultado.confianca}. Estimativa visual
            por IA — pode ter erro; use como referência, não como medição
            exata.
          </p>
        </div>
      )}
    </div>
  );
}

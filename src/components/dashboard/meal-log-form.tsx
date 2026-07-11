"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { REFEICOES } from "@/lib/types";

const LABELS: Record<string, string> = {
  cafe_da_manha: "Café da manhã",
  almoco: "Almoço",
  lanche: "Lanche",
  jantar: "Jantar",
  ceia: "Ceia",
  outro: "Outro",
};

export function MealLogForm() {
  const router = useRouter();
  const [refeicao, setRefeicao] = useState<string>(REFEICOES[0]);
  const [descricao, setDescricao] = useState("");
  const [calorias, setCalorias] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/refeicoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refeicao,
        descricao,
        calorias_estimadas: calorias ? Number(calorias) : undefined,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Não foi possível salvar. Tente novamente.");
      return;
    }

    setDescricao("");
    setCalorias("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Refeição" htmlFor="refeicao">
          <Select
            id="refeicao"
            value={refeicao}
            onChange={(e) => setRefeicao(e.target.value)}
          >
            {REFEICOES.map((r) => (
              <option key={r} value={r}>
                {LABELS[r]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Calorias (opcional)" htmlFor="calorias">
          <Input
            id="calorias"
            type="number"
            min={0}
            value={calorias}
            onChange={(e) => setCalorias(e.target.value)}
          />
        </Field>
      </div>
      <Field label="O que você comeu?" htmlFor="descricao">
        <Input
          id="descricao"
          required
          placeholder="Ex: 2 ovos, aveia com banana e café sem açúcar"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
      </Field>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={loading} className="self-start">
        {loading ? "Salvando..." : "Registrar refeição"}
      </Button>
    </form>
  );
}

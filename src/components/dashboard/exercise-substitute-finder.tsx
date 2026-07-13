"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import type { ExerciseRecord } from "@/lib/types";

export function ExerciseSubstituteFinder({ exercicios }: { exercicios: ExerciseRecord[] }) {
  const [exercicioId, setExercicioId] = useState(exercicios[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{
    exercicio_original: string;
    substitutos: ExerciseRecord[];
  } | null>(null);

  async function buscar() {
    if (!exercicioId) return;
    setLoading(true);
    setError(null);
    setResultado(null);

    const res = await fetch("/api/substituir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exercicio_id: exercicioId }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error || "Não foi possível buscar substitutos.");
      return;
    }

    setResultado(await res.json());
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Select value={exercicioId} onChange={(e) => setExercicioId(e.target.value)}>
            {exercicios.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.nome} ({ex.local_treino})
              </option>
            ))}
          </Select>
        </div>
        <Button type="button" onClick={buscar} disabled={loading || !exercicioId}>
          {loading ? "Buscando..." : "Está ocupado, buscar substituto"}
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {resultado && (
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm text-muted">
            Substitutos para <strong>{resultado.exercicio_original}</strong> (mesmo
            estímulo muscular):
          </p>
          {resultado.substitutos.length > 0 ? (
            <ul className="mt-2 flex flex-col gap-1">
              {resultado.substitutos.map((s) => (
                <li key={s.id} className="text-sm font-medium">
                  • {s.nome}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">
              Nenhum substituto cadastrado para esse exercício ainda.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

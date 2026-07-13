"use client";

import { useState } from "react";

export function SubstituteExerciseButton({ nome }: { nome: string }) {
  const [loading, setLoading] = useState(false);
  const [substitutos, setSubstitutos] = useState<string[] | null>(null);

  async function handleClick() {
    if (substitutos) {
      setSubstitutos(null);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/treino/substituir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    });
    setLoading(false);

    if (res.ok) {
      const data = await res.json();
      setSubstitutos(data.substitutos.length > 0 ? data.substitutos : ["Nenhuma alternativa cadastrada."]);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="text-xs text-primary underline underline-offset-2 disabled:opacity-60"
      >
        {loading ? "Buscando..." : substitutos ? "Ocultar alternativas" : "Academia lotada? Trocar"}
      </button>
      {substitutos && (
        <ul className="mt-1 list-disc pl-4 text-xs text-muted">
          {substitutos.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

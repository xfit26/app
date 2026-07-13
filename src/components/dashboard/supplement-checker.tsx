"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";

export function SupplementChecker() {
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orientacao, setOrientacao] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || loading) return;

    setLoading(true);
    setError(null);
    setOrientacao(null);

    const res = await fetch("/api/suplementos/verificar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error || "Não foi possível verificar agora.");
      return;
    }

    const data = await res.json();
    setOrientacao(data.orientacao);
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Whey Protein Growth, Creatina Max Titanium..."
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !nome.trim()}>
          {loading ? "Verificando..." : "Verificar"}
        </Button>
      </form>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {orientacao && (
        <div className="rounded-lg border border-border p-4 text-sm">
          <p className="whitespace-pre-line">{orientacao}</p>
          <p className="mt-3 text-xs text-muted">
            Orientação gerada por IA a partir de conhecimento geral — não é
            uma consulta em tempo real ao banco de laudos da ANVISA. Confirme
            a regularização do lote específico em{" "}
            <a
              href="https://consultas.anvisa.gov.br/#/saude/"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              consultas.anvisa.gov.br
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}

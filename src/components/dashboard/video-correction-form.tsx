"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";

export function VideoCorrectionForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await fetch("/api/videos/upload", {
      method: "POST",
      body: formData,
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error || "Não foi possível enviar o vídeo.");
      return;
    }

    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Exercício" htmlFor="exercicio">
        <Input id="exercicio" name="exercicio" required placeholder="Ex: Agachamento livre" />
      </Field>
      <Field label="Observações (o que você quer que eu observe?)" htmlFor="observacao">
        <Textarea
          id="observacao"
          name="observacao"
          placeholder="Ex: sinto dor no joelho na descida, não sei se a barra está bem posicionada..."
        />
      </Field>
      <Field label="Vídeo (máx. 60MB)" htmlFor="video">
        <Input id="video" name="video" type="file" accept="video/*" required />
      </Field>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={loading} className="self-start">
        {loading ? "Analisando (pode levar até 1 minuto)..." : "Enviar para correção"}
      </Button>
    </form>
  );
}

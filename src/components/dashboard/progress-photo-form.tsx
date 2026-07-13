"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export function ProgressPhotoForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const res = await fetch("/api/fotos-evolucao", {
      method: "POST",
      body: formData,
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error || "Não foi possível enviar a foto.");
      return;
    }

    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <Field label="Foto (antes/depois)" htmlFor="foto">
        <Input id="foto" name="foto" type="file" accept="image/*" required />
      </Field>
      <Field label="Legenda (opcional)" htmlFor="legenda">
        <Input id="legenda" name="legenda" placeholder="Ex: semana 4" />
      </Field>
      <Button type="submit" disabled={loading}>
        {loading ? "Enviando..." : "Enviar foto"}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const ATALHOS_ML = [200, 300, 500, 750];

export function WaterLogForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function registrar(ml: number) {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/agua", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantidade_ml: ml }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Não foi possível registrar. Tente novamente.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {ATALHOS_ML.map((ml) => (
          <Button
            key={ml}
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={() => registrar(ml)}
          >
            +{ml} ml
          </Button>
        ))}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

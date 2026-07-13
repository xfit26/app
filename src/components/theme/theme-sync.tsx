"use client";

import { useEffect } from "react";
import type { Genero } from "@/lib/types";
import { setGeneroCookie } from "@/lib/theme";

/** Aplica o tema (preto/azul ou preto/rosa) com base no gênero informado na anamnese. */
export function ThemeSync({ genero }: { genero: Genero }) {
  useEffect(() => {
    document.documentElement.dataset.theme = genero;
    setGeneroCookie(genero);
  }, [genero]);

  return null;
}

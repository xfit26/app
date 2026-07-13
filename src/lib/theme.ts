import { GENEROS, type Genero } from "@/lib/types";

export const THEME_COOKIE = "fitia_genero";

export function parseGeneroCookie(value: string | undefined): Genero | undefined {
  return GENEROS.find((g) => g === value);
}

export function setGeneroCookie(genero: Genero) {
  if (typeof document === "undefined") return;
  document.cookie = `${THEME_COOKIE}=${genero}; path=/; max-age=31536000; samesite=lax`;
}

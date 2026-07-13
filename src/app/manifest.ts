import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Léo Moura — Treino e dieta por IA",
    short_name: "Léo Moura",
    description:
      "Treinos do treinador Léo Moura e dieta personalizados por IA a partir da sua anamnese.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7faf8",
    theme_color: "#16a34a",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

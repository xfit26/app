"use client";

import { useState } from "react";
import { ZONAS_ALVO, type ZonaAlvo } from "@/lib/types";

// Mapa corporal interativo — silhueta estilizada (2D, com efeito "holográfico"
// futurista) usada para escolher as zonas musculares alvo. Não é um modelo 3D
// anatômico real: é um diagrama ilustrativo com pontos clicáveis por região,
// complementado por uma lista de checkboxes agrupada por grupo muscular para
// garantir que a seleção funcione bem em qualquer tela (inclusive celular).

const GRUPOS: { titulo: string; zonas: { id: ZonaAlvo; label: string }[] }[] = [
  {
    titulo: "Peitoral",
    zonas: [
      { id: "peitoral_superior", label: "Parte superior" },
      { id: "peitoral_meio", label: "Peitoral maior" },
      { id: "peitoral_inferior", label: "Peitoral inferior" },
    ],
  },
  {
    titulo: "Costas",
    zonas: [
      { id: "costas_lombar", label: "Lombar" },
      { id: "costas_dorsal", label: "Grande dorsal" },
      { id: "costas_romboides", label: "Romboides" },
    ],
  },
  {
    titulo: "Ombro",
    zonas: [
      { id: "ombro_frontal", label: "Porção frontal" },
      { id: "ombro_medial", label: "Porção medial" },
      { id: "ombro_posterior", label: "Porção posterior" },
    ],
  },
  {
    titulo: "Abdômen",
    zonas: [
      { id: "abdomen_reto", label: "Reto abdominal" },
      { id: "abdomen_obliquo", label: "Oblíquo" },
    ],
  },
  {
    titulo: "Braços",
    zonas: [
      { id: "biceps", label: "Bíceps" },
      { id: "triceps", label: "Tríceps" },
    ],
  },
  {
    titulo: "Quadríceps",
    zonas: [
      { id: "quadriceps_vasto_lateral", label: "Vasto lateral" },
      { id: "quadriceps_vasto_medial", label: "Vasto medial" },
      { id: "quadriceps_adutores", label: "Adutores" },
      { id: "quadriceps_meio_coxa", label: "Meio da coxa até em cima" },
    ],
  },
  {
    titulo: "Glúteo",
    zonas: [
      { id: "gluteo_superior", label: "Porção superior do glúteo máximo" },
      { id: "gluteo_meio", label: "Porção do meio do glúteo máximo" },
      { id: "gluteo_inferior", label: "Porção inferior do glúteo máximo" },
      { id: "gluteo_lateral", label: "Porção lateral do glúteo médio" },
    ],
  },
  {
    titulo: "Posterior de coxa",
    zonas: [
      { id: "posterior_coxa_distal", label: "Distal (perto do joelho)" },
      { id: "posterior_coxa_medial", label: "Medial (meio da coxa)" },
      { id: "posterior_coxa_proximal", label: "Proximal (perto do glúteo)" },
    ],
  },
  {
    titulo: "Panturrilha",
    zonas: [{ id: "panturrilha", label: "Panturrilha" }],
  },
];

interface Hotspot {
  id: ZonaAlvo;
  x: number;
  y: number;
  view: "frente" | "costas";
}

const HOTSPOTS: Hotspot[] = [
  // frente
  { id: "ombro_frontal", x: 74, y: 96, view: "frente" },
  { id: "ombro_frontal", x: 246, y: 96, view: "frente" },
  { id: "peitoral_superior", x: 116, y: 116, view: "frente" },
  { id: "peitoral_superior", x: 204, y: 116, view: "frente" },
  { id: "peitoral_meio", x: 116, y: 142, view: "frente" },
  { id: "peitoral_meio", x: 204, y: 142, view: "frente" },
  { id: "peitoral_inferior", x: 116, y: 168, view: "frente" },
  { id: "peitoral_inferior", x: 204, y: 168, view: "frente" },
  { id: "biceps", x: 58, y: 185, view: "frente" },
  { id: "biceps", x: 262, y: 185, view: "frente" },
  { id: "abdomen_reto", x: 160, y: 200, view: "frente" },
  { id: "abdomen_reto", x: 160, y: 225, view: "frente" },
  { id: "abdomen_obliquo", x: 128, y: 215, view: "frente" },
  { id: "abdomen_obliquo", x: 192, y: 215, view: "frente" },
  { id: "quadriceps_adutores", x: 150, y: 320, view: "frente" },
  { id: "quadriceps_adutores", x: 170, y: 320, view: "frente" },
  { id: "quadriceps_vasto_lateral", x: 108, y: 340, view: "frente" },
  { id: "quadriceps_vasto_lateral", x: 212, y: 340, view: "frente" },
  { id: "quadriceps_meio_coxa", x: 130, y: 360, view: "frente" },
  { id: "quadriceps_meio_coxa", x: 190, y: 360, view: "frente" },
  { id: "quadriceps_vasto_medial", x: 145, y: 400, view: "frente" },
  { id: "quadriceps_vasto_medial", x: 175, y: 400, view: "frente" },
  // costas
  { id: "ombro_posterior", x: 74, y: 96, view: "costas" },
  { id: "ombro_posterior", x: 246, y: 96, view: "costas" },
  { id: "ombro_medial", x: 90, y: 106, view: "costas" },
  { id: "ombro_medial", x: 230, y: 106, view: "costas" },
  { id: "costas_romboides", x: 160, y: 125, view: "costas" },
  { id: "costas_dorsal", x: 120, y: 155, view: "costas" },
  { id: "costas_dorsal", x: 200, y: 155, view: "costas" },
  { id: "costas_lombar", x: 160, y: 200, view: "costas" },
  { id: "triceps", x: 58, y: 185, view: "costas" },
  { id: "triceps", x: 262, y: 185, view: "costas" },
  { id: "gluteo_superior", x: 135, y: 255, view: "costas" },
  { id: "gluteo_superior", x: 185, y: 255, view: "costas" },
  { id: "gluteo_meio", x: 135, y: 275, view: "costas" },
  { id: "gluteo_meio", x: 185, y: 275, view: "costas" },
  { id: "gluteo_inferior", x: 135, y: 295, view: "costas" },
  { id: "gluteo_inferior", x: 185, y: 295, view: "costas" },
  { id: "gluteo_lateral", x: 108, y: 275, view: "costas" },
  { id: "gluteo_lateral", x: 212, y: 275, view: "costas" },
  { id: "posterior_coxa_proximal", x: 145, y: 320, view: "costas" },
  { id: "posterior_coxa_proximal", x: 175, y: 320, view: "costas" },
  { id: "posterior_coxa_medial", x: 145, y: 355, view: "costas" },
  { id: "posterior_coxa_medial", x: 175, y: 355, view: "costas" },
  { id: "posterior_coxa_distal", x: 145, y: 390, view: "costas" },
  { id: "posterior_coxa_distal", x: 175, y: 390, view: "costas" },
  { id: "panturrilha", x: 135, y: 460, view: "frente" },
  { id: "panturrilha", x: 185, y: 460, view: "frente" },
  { id: "panturrilha", x: 135, y: 460, view: "costas" },
  { id: "panturrilha", x: 185, y: 460, view: "costas" },
];

function Silhouette() {
  return (
    <g stroke="var(--primary)" strokeWidth="1.5" fill="none" opacity={0.55}>
      {/* cabeça */}
      <circle cx="160" cy="45" r="26" />
      {/* pescoço + tronco */}
      <path d="M144 68 L144 82 Q100 90 92 130 L86 190 Q84 220 96 250 L110 260 L120 480 L150 480 L155 260 L165 260 L170 480 L200 480 L210 260 L224 250 Q236 220 234 190 L228 130 Q220 90 176 82 L176 68" />
      {/* braços */}
      <path d="M92 130 Q66 150 56 190 Q50 220 60 250" />
      <path d="M228 130 Q254 150 264 190 Q270 220 260 250" />
      {/* pernas até o tornozelo */}
      <path d="M120 480 L112 600 M150 480 L148 600 M170 480 L172 600 M200 480 L208 600" />
    </g>
  );
}

export function BodyMap({
  value,
  onChange,
}: {
  value: ZonaAlvo[];
  onChange: (zonas: ZonaAlvo[]) => void;
}) {
  const [view, setView] = useState<"frente" | "costas">("frente");

  function toggle(id: ZonaAlvo) {
    onChange(value.includes(id) ? value.filter((z) => z !== id) : [...value, id]);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          Toque nos pontos do corpo ou marque na lista abaixo as zonas que
          você quer priorizar no treino.
        </p>
        <div className="flex shrink-0 gap-1 rounded-lg border border-border p-1">
          <button
            type="button"
            onClick={() => setView("frente")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              view === "frente" ? "bg-primary text-white" : "text-muted"
            }`}
          >
            Frente
          </button>
          <button
            type="button"
            onClick={() => setView("costas")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              view === "costas" ? "bg-primary text-white" : "text-muted"
            }`}
          >
            Costas
          </button>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[220px] overflow-hidden rounded-2xl border border-border bg-[radial-gradient(circle_at_50%_20%,var(--card),var(--background))] p-2">
        <svg viewBox="0 0 320 620" className="w-full">
          <defs>
            <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M20 0 L0 0 0 20" fill="none" stroke="var(--primary)" strokeWidth="0.3" opacity="0.25" />
            </pattern>
          </defs>
          <rect width="320" height="620" fill="url(#grid)" />
          <Silhouette />
          {HOTSPOTS.filter((h) => h.view === view).map((h, i) => {
            const active = value.includes(h.id);
            return (
              <circle
                key={`${h.id}-${i}`}
                cx={h.x}
                cy={h.y}
                r={active ? 9 : 7}
                className="cursor-pointer transition-all"
                fill={active ? "var(--primary)" : "var(--card)"}
                stroke="var(--primary)"
                strokeWidth={1.5}
                filter={active ? "url(#glow)" : undefined}
                onClick={() => toggle(h.id)}
              >
                <title>{h.id.replaceAll("_", " ")}</title>
              </circle>
            );
          })}
        </svg>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {GRUPOS.map((grupo) => (
          <div key={grupo.titulo} className="rounded-lg border border-border p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {grupo.titulo}
            </p>
            <div className="mt-2 flex flex-col gap-1.5">
              {grupo.zonas.map((zona) => (
                <label
                  key={zona.id}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    className="accent-primary"
                    checked={value.includes(zona.id)}
                    onChange={() => toggle(zona.id)}
                  />
                  {zona.label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted">{value.length} zona(s) selecionada(s)</p>
    </div>
  );
}

export { ZONAS_ALVO };

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "./sign-out-button";
import { LockBadge } from "./locked-feature";

const LINKS = [
  { href: "/dashboard", label: "Visão geral" },
  { href: "/dashboard/treino", label: "Treino" },
  { href: "/dashboard/dieta", label: "Dieta" },
  { href: "/dashboard/refeicoes", label: "Refeições" },
  { href: "/dashboard/agua", label: "Água" },
  { href: "/dashboard/evolucao", label: "Evolução" },
  { href: "/dashboard/substituir", label: "Academia lotada" },
  { href: "/dashboard/treinador", label: "Treinador" },
  { href: "/dashboard/nutricionista", label: "Nutricionista" },
  { href: "/dashboard/suplementos-chat", label: "Suplementos (chat)" },
  { href: "/dashboard/foto-dieta", label: "Foto da dieta", locked: true },
  { href: "/dashboard/suplementos", label: "Verificar suplemento", locked: true },
  { href: "/dashboard/videos", label: "Correção de vídeo", locked: true },
  { href: "/dashboard/perfil", label: "Perfil" },
];

export function DashboardNav({ premium }: { premium: boolean }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/dashboard" className="shrink-0 font-semibold">
          Léo Moura
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                pathname === link.href
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted hover:bg-border/40"
              }`}
            >
              {link.label}
              {link.locked && !premium && <LockBadge />}
            </Link>
          ))}
          <SignOutButton />
        </nav>
      </div>
    </header>
  );
}

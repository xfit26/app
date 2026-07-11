"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "./sign-out-button";

const LINKS = [
  { href: "/dashboard", label: "Visão geral" },
  { href: "/dashboard/treino", label: "Treino" },
  { href: "/dashboard/dieta", label: "Dieta" },
  { href: "/dashboard/perfil", label: "Perfil" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="font-semibold">
          FitIA
        </Link>
        <nav className="flex items-center gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                pathname === link.href
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted hover:bg-border/40"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <SignOutButton />
        </nav>
      </div>
    </header>
  );
}

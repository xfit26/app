import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
    >
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

/** Selo de "recurso bloqueado" para colocar ao lado do nome/ícone de um item de navegação/card. */
export function LockBadge() {
  return (
    <LockIcon className="inline-block h-3.5 w-3.5 shrink-0 text-muted" />
  );
}

/** Tela cheia mostrada no lugar de um módulo exclusivo do plano de 8 semanas. */
export function LockedFeature({
  titulo,
  descricao,
}: {
  titulo: string;
  descricao: string;
}) {
  return (
    <Card className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <LockIcon className="h-6 w-6" />
      </div>
      <h1 className="mt-4 text-xl font-semibold">{titulo}</h1>
      <p className="mt-2 text-sm text-muted">{descricao}</p>
      <p className="mt-1 text-sm text-muted">
        Esse recurso é exclusivo do <strong>plano de 8 semanas</strong>.
      </p>
      <Link href="/assinar">
        <Button className="mt-6">Fazer upgrade</Button>
      </Link>
    </Card>
  );
}

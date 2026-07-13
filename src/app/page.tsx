import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const FEATURES = [
  {
    title: "Anamnese completa",
    description:
      "Um formulário guiado coleta seus dados, objetivos, rotina, saúde e preferências alimentares.",
  },
  {
    title: "Treino sob medida",
    description:
      "A IA monta seu plano de treino considerando dias disponíveis, local, equipamentos e limitações físicas.",
  },
  {
    title: "Dieta personalizada",
    description:
      "Calorias, macros e refeições calculados para o seu objetivo, respeitando restrições e alergias.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="text-lg font-semibold">FitIA</span>
          <div className="flex gap-2">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/cadastro">
              <Button>Criar conta</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Treino e dieta personalizados por IA
          </h1>
          <p className="mt-4 text-lg text-muted">
            Responda uma anamnese rápida e receba um plano de treino e de
            alimentação feito sob medida para o seu corpo, sua rotina e seus
            objetivos.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/cadastro">
              <Button className="px-6 py-3 text-base">Começar agora</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="px-6 py-3 text-base">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title}>
              <h2 className="font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm text-muted">{f.description}</p>
            </Card>
          ))}
        </div>

        <p className="mt-16 text-xs text-muted">
          Os planos gerados por IA são um ponto de partida e não substituem o
          acompanhamento de um profissional de educação física e de um
          nutricionista, especialmente em caso de condições médicas.
        </p>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted">
        FitIA ·{" "}
        <Link href="/termos" className="hover:text-foreground">
          Termos de Uso
        </Link>{" "}
        ·{" "}
        <Link href="/privacidade" className="hover:text-foreground">
          Política de Privacidade
        </Link>
      </footer>
    </div>
  );
}

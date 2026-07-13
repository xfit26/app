import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const FEATURES = [
  {
    title: "Treino do treinador Léo Moura",
    description:
      "Treinos montados com a metodologia do Léo Moura e adaptados por IA às suas respostas: gênero, local de treino, objetivo e zonas musculares que você quer priorizar.",
  },
  {
    title: "Cálculo de TMB, água e calorias",
    description:
      "Calculamos sua taxa metabólica basal (Harris-Benedict), seu gasto total e sua meta de água, e ajustamos as calorias conforme seu objetivo.",
  },
  {
    title: "Dieta com os alimentos que você escolhe",
    description:
      "Você escolhe o tipo de dieta e as proteínas, carboidratos e gorduras que aceita comer — a IA monta o cardápio só com o que você selecionou.",
  },
  {
    title: "Painel completo do aluno",
    description:
      "Água, evolução (medidas, % de gordura por 7 dobras e fotos), chats com Treinador/Nutricionista/Suplementos e assistente de academia lotada.",
  },
  {
    title: "Plano de 8 semanas",
    description:
      "Desbloqueie foto da dieta com estimativa de calorias por IA, módulo de suplementos e correção de treino por vídeo com feedback em áudio.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="text-lg font-semibold">Léo Moura</span>
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
            Treinos do Léo Moura, adaptados por IA para você
          </h1>
          <p className="mt-4 text-lg text-muted">
            Responda a um formulário guiado sobre seu corpo, sua rotina e seus
            objetivos e receba um treino e uma dieta feitos sob medida — com
            cálculo de TMB, água e calorias, mapa corporal para priorizar
            grupos musculares e uma dieta só com os alimentos que você
            escolher.
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

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          nutricionista, especialmente em caso de condições de saúde.
        </p>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted">
        Léo Moura
      </footer>
    </div>
  );
}

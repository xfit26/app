import Link from "next/link";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Termos de Uso — FitIA",
};

export default function TermosPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/" className="text-sm text-primary">
        ← Voltar
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Termos de Uso</h1>
      <p className="mt-1 text-sm text-muted">Última atualização: julho de 2026.</p>

      <Card className="mt-6 flex flex-col gap-5 text-sm text-foreground">
        <section>
          <h2 className="font-semibold">1. O serviço</h2>
          <p className="mt-2 text-muted">
            O FitIA gera planos de treino e dieta personalizados a partir das
            respostas de uma anamnese, usando regras próprias para o treino e
            inteligência artificial para a dieta. Os planos são um ponto de
            partida e <strong>não substituem o acompanhamento de um
            profissional de educação física e de um nutricionista</strong>,
            especialmente se você tiver condições médicas, lesões ou
            restrições alimentares relevantes.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">2. Elegibilidade</h2>
          <p className="mt-2 text-muted">
            O serviço é destinado a maiores de 18 anos. Menores de idade só
            podem usar o FitIA com supervisão e consentimento de um
            responsável legal.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">3. Sua conta</h2>
          <p className="mt-2 text-muted">
            Você é responsável por manter a confidencialidade da sua senha e
            por fornecer informações verdadeiras na anamnese — planos
            gerados a partir de dados incorretos podem não ser seguros para
            você.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">4. Assinatura e pagamento</h2>
          <p className="mt-2 text-muted">
            O chat Nutricionista é um recurso pago, cobrado de forma
            recorrente (mensal ou anual) via Pagar.me. Você pode cancelar a
            qualquer momento; o acesso permanece ativo até o fim do período já
            pago. Não há reembolso de períodos parciais, salvo quando exigido
            por lei.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">5. Limitação de responsabilidade</h2>
          <p className="mt-2 text-muted">
            O FitIA é fornecido &quot;como está&quot;. Não nos
            responsabilizamos por lesões, agravamento de condições de saúde
            ou resultados insatisfatórios decorrentes do uso dos planos
            gerados, do descumprimento de recomendações médicas ou do uso do
            serviço em desacordo com estes termos.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">6. Encerramento</h2>
          <p className="mt-2 text-muted">
            Você pode encerrar sua conta a qualquer momento. Podemos suspender
            ou encerrar contas que violem estes termos ou usem o serviço de
            forma abusiva.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">7. Privacidade</h2>
          <p className="mt-2 text-muted">
            O tratamento dos seus dados, incluindo dados de saúde da
            anamnese, segue nossa{" "}
            <Link href="/privacidade" className="text-primary">
              Política de Privacidade
            </Link>
            .
          </p>
        </section>
      </Card>
    </div>
  );
}

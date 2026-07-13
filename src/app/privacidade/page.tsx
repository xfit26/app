import Link from "next/link";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Política de Privacidade — FitIA",
};

export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/" className="text-sm text-primary">
        ← Voltar
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Política de Privacidade</h1>
      <p className="mt-1 text-sm text-muted">Última atualização: julho de 2026.</p>

      <Card className="mt-6 flex flex-col gap-5 text-sm text-foreground">
        <p>
          Esta política descreve como o FitIA coleta, usa e protege seus dados
          pessoais, em conformidade com a Lei Geral de Proteção de Dados
          (LGPD — Lei nº 13.709/2018).
        </p>

        <section>
          <h2 className="font-semibold">1. Dados que coletamos</h2>
          <ul className="mt-2 list-disc pl-5 text-muted">
            <li>Cadastro: nome, e-mail e senha.</li>
            <li>
              Anamnese: idade, sexo, altura, peso, objetivo, rotina de
              treino, <strong>lesões, limitações e condições médicas</strong>{" "}
              (dados sensíveis de saúde), restrições alimentares e alergias.
            </li>
            <li>Registros de refeições que você adiciona no painel.</li>
            <li>
              Dados de pagamento (nome, CPF, telefone) para assinatura — os
              dados do cartão são tokenizados diretamente pela Pagar.me no
              seu navegador e nunca passam pelos nossos servidores.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold">2. Base legal e finalidade</h2>
          <p className="mt-2 text-muted">
            Dados de saúde são tratados mediante o seu{" "}
            <strong>consentimento explícito</strong>, dado ao preencher a
            anamnese, unicamente para gerar e personalizar seu plano de
            treino e dieta. Os demais dados são tratados para execução do
            contrato (fornecer o serviço) e cumprimento de obrigações legais
            relacionadas à cobrança.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">3. Com quem compartilhamos</h2>
          <ul className="mt-2 list-disc pl-5 text-muted">
            <li>
              <strong>Supabase</strong> — hospedagem de conta e banco de
              dados.
            </li>
            <li>
              <strong>OpenAI</strong> — geração do plano de dieta e das
              respostas do chat Nutricionista a partir dos dados da sua
              anamnese.
            </li>
            <li>
              <strong>Pagar.me</strong> — processamento de pagamentos da
              assinatura.
            </li>
          </ul>
          <p className="mt-2 text-muted">
            Não vendemos seus dados a terceiros.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">4. Seus direitos</h2>
          <p className="mt-2 text-muted">
            Você pode solicitar a qualquer momento a confirmação, o acesso, a
            correção, a anonimização, a portabilidade ou a exclusão dos seus
            dados, além de revogar seu consentimento para o tratamento de
            dados de saúde. Para exercer esses direitos, entre em contato
            pelo e-mail{" "}
            <a className="text-primary" href="mailto:privacidade@fitia.app">
              privacidade@fitia.app
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-semibold">5. Retenção</h2>
          <p className="mt-2 text-muted">
            Mantemos seus dados enquanto sua conta estiver ativa. Ao excluir
            sua conta, seus dados são removidos, exceto quando a lei exigir
            retenção por período maior (por exemplo, registros fiscais de
            pagamento).
          </p>
        </section>

        <section>
          <h2 className="font-semibold">6. Aviso sobre planos gerados por IA</h2>
          <p className="mt-2 text-muted">
            Os planos de treino e dieta são gerados automaticamente a partir
            das suas respostas e não substituem o acompanhamento de um
            profissional de educação física ou nutrição, especialmente se
            você possui condições médicas.
          </p>
        </section>
      </Card>
    </div>
  );
}

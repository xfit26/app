# Checklist de deploy — FitIA

Passo a passo para colocar o app em produção. Marque cada item conforme for
concluindo. Itens marcados com ⚠️ envolvem dinheiro real ou dados sensíveis —
não pule a validação em sandbox/teste.

## 1. Supabase (produção)

- [ ] Criar projeto em [supabase.com](https://supabase.com)
- [ ] **SQL Editor**: rodar, nesta ordem, `supabase/migrations/0001_init.sql`,
      `0002_meal_logs_subscriptions.sql` e `0003_zonas_prioritarias.sql`
- [ ] **Project Settings > API**: copiar `Project URL`, `anon public key` e
      `service_role key`
- [ ] **Authentication > URL Configuration**: adicionar
      `https://SEU-DOMINIO/auth/callback` como Redirect URL
- [ ] ⚠️ **Authentication > Emails > SMTP**: configurar um provedor próprio
      (Resend, SendGrid, Postmark...). O SMTP padrão do Supabase tem limite
      de poucos e-mails/hora e trava o cadastro de usuários reais.
- [ ] (opcional) **Authentication > Email Templates**: personalizar o e-mail
      de confirmação de conta com o nome/marca do produto

## 2. OpenAI

- [ ] Criar chave em [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- [ ] ⚠️ Definir um **limite de gasto mensal** (Billing > Limits) — a dieta é
      gerada a cada clique em "Gerar novo plano" (há cooldown de 60s por
      anamnese, mas ainda assim monitore o consumo)
- [ ] Escolher `OPENAI_MODEL` (padrão `gpt-4o-mini`, mais barato)

## 3. Pagar.me — ⚠️ validar antes de cobrar cartão real

O código (`src/lib/payments/pagarme.ts`, `pagarme-client.ts`,
`api/webhooks/pagarme/route.ts`) foi implementado **sem acesso à documentação
ao vivo** da Pagar.me. Antes de processar pagamentos reais:

- [ ] Criar conta em [dashboard.pagar.me](https://dashboard.pagar.me)
- [ ] Pegar as chaves de **teste** (`sk_test_...` / `pk_test_...`)
- [ ] Rodar o fluxo completo em sandbox: `/assinar` → cria assinatura →
      webhook chega em `/api/webhooks/pagarme` → `subscriptions.status`
      atualiza no banco
- [ ] Conferir contra [docs.pagar.me](https://docs.pagar.me) atual: formato
      do payload de criação de assinatura, mecanismo de autenticação do
      webhook (o código assume Basic Auth configurado na própria URL
      cadastrada) e os nomes/valores de `type`/`status` dos eventos
- [ ] Cadastrar a URL do webhook no painel:
      `https://usuario:senha@SEU-DOMINIO/api/webhooks/pagarme`, usando as
      mesmas credenciais de `PAGARME_WEBHOOK_USER`/`PAGARME_WEBHOOK_PASSWORD`
- [ ] Só depois de validar tudo em sandbox, trocar para as chaves de
      **produção** (`sk_live_...` / `pk_live_...`)

## 4. Domínio e variáveis de ambiente

- [ ] Definir o domínio de produção
- [ ] Preencher `NEXT_PUBLIC_SITE_URL=https://SEU-DOMINIO` (usado em
      `robots.txt` e `sitemap.xml`)
- [ ] Preencher todas as demais variáveis de `.env.example` no provedor de
      hospedagem

## 5. Deploy (Vercel recomendado)

- [ ] Conectar o repositório na [Vercel](https://vercel.com/new)
- [ ] Configurar todas as env vars do passo 4 no projeto da Vercel
- [ ] Deploy
- [ ] Testar o fluxo completo em produção: cadastro → confirmação de e-mail →
      login → anamnese → treino gerado → dieta gerada → assinatura (sandbox)
      → chat Nutricionista liberado

## 6. Legal / LGPD

- [ ] ⚠️ Revisar `/termos` e `/privacidade` com um advogado antes de abrir
      para o público — o texto atual é um rascunho razoável, não é
      aconselhamento jurídico
- [ ] Trocar o e-mail de contato placeholder (`privacidade@fitia.app`) pelo
      e-mail real de suporte/DPO em `src/app/privacidade/page.tsx`
- [ ] Preencher a identificação do controlador de dados (razão social/CNPJ)
      na política de privacidade

## 7. Observabilidade (recomendado, não bloqueia o lançamento)

- [ ] Configurar Sentry (ou similar) para capturar erros de produção — hoje
      os erros só vão para `console.error`
- [ ] Configurar alertas de gasto na OpenAI e na Pagar.me

## 8. Testes pós-deploy

- [ ] Instalar o PWA no celular ("Adicionar à tela inicial") e conferir que
      abre em modo standalone
- [ ] Testar "Academia lotada? Trocar" em `/dashboard/treino`
- [ ] Testar zonas prioritárias na anamnese e conferir a observação de
      "volume extra" no treino gerado
- [ ] Testar cancelamento de assinatura na Pagar.me e conferir que o webhook
      derruba o acesso ao chat Nutricionista
- [ ] Conferir que `/dashboard`, `/anamnese` e `/assinar` redirecionam para
      `/login` quando deslogado

## CI

O workflow `.github/workflows/ci.yml` roda `lint`, `typecheck` e `build` em
cada PR contra `main`. Ele não substitui os testes manuais dos passos acima —
não há testes automatizados dos fluxos de negócio (auth, geração de plano,
pagamento) ainda.

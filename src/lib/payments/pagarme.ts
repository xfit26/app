import type { PlanoAssinatura } from "@/lib/types";

/**
 * Integração com a API Core v5 da Pagar.me (https://docs.pagar.me).
 *
 * IMPORTANTE: a documentação oficial não pôde ser consultada ao vivo ao
 * escrever este arquivo (bloqueio de acesso). A URL base, autenticação
 * (Basic Auth com a secret key) e o formato do payload de assinatura abaixo
 * seguem o formato documentado publicamente da API v5, mas devem ser
 * confirmados contra a documentação atual antes de processar cobranças
 * reais — teste primeiro em modo sandbox (chaves de teste, prefixo `sk_test_`).
 */

const API_BASE = "https://api.pagar.me/core/v5";

const PLAN_CONFIG: Record<
  PlanoAssinatura,
  {
    interval: "week" | "month" | "year";
    intervalCount: number;
    envVar: string;
    defaultCents: number;
  }
> = {
  oito_semanas: {
    interval: "week",
    intervalCount: 8,
    envVar: "PAGARME_PLAN_OITO_SEMANAS_PRICE_CENTS",
    defaultCents: 49900,
  },
};

export function precoDoPlano(plano: PlanoAssinatura): number {
  const config = PLAN_CONFIG[plano];
  const fromEnv = process.env[config.envVar];
  return fromEnv ? Number(fromEnv) : config.defaultCents;
}

function authHeader(): string {
  const secretKey = process.env.PAGARME_SECRET_KEY;
  if (!secretKey) {
    throw new Error("PAGARME_SECRET_KEY não está configurada.");
  }
  return "Basic " + Buffer.from(`${secretKey}:`).toString("base64");
}

async function pagarmeFetch(path: string, init: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
      ...init.headers,
    },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      body?.message || body?.errors?.[0]?.message || "Erro na API da Pagar.me.";
    throw new Error(message);
  }

  return body;
}

export interface ClienteAssinatura {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
}

function splitTelefone(telefone: string) {
  const digits = telefone.replace(/\D/g, "");
  return {
    area_code: digits.slice(0, 2),
    number: digits.slice(2),
  };
}

export interface CriarAssinaturaInput {
  cliente: ClienteAssinatura;
  cardToken: string;
  plano: PlanoAssinatura;
}

export interface PagarmeSubscription {
  id: string;
  status: string;
  customer: { id: string };
  current_cycle?: { end_at?: string };
}

export async function criarAssinatura({
  cliente,
  cardToken,
  plano,
}: CriarAssinaturaInput): Promise<PagarmeSubscription> {
  const config = PLAN_CONFIG[plano];
  const { area_code, number } = splitTelefone(cliente.telefone);

  return pagarmeFetch("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      payment_method: "credit_card",
      card_token: cardToken,
      interval: config.interval,
      interval_count: config.intervalCount,
      billing_type: "prepaid",
      installments: 1,
      currency: "BRL",
      description: `Léo Moura — plano ${plano}`,
      quantity: 1,
      pricing_scheme: { scheme_type: "Unit", price: precoDoPlano(plano) },
      customer: {
        name: cliente.nome,
        email: cliente.email,
        document: cliente.cpf.replace(/\D/g, ""),
        document_type: "cpf",
        customer_type: "individual",
        phones: {
          mobile_phone: { country_code: "55", area_code, number },
        },
      },
    }),
  });
}

export async function cancelarAssinatura(subscriptionId: string): Promise<void> {
  await pagarmeFetch(`/subscriptions/${subscriptionId}`, { method: "DELETE" });
}

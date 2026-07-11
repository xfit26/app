"use client";

/**
 * Tokenização de cartão no navegador (PCI-safe): os dados do cartão vão
 * direto do browser para a Pagar.me usando a chave pública, sem passar pelo
 * nosso servidor. O token retornado é enviado à nossa API, que usa a secret
 * key para efetivar a assinatura.
 *
 * Assim como em src/lib/payments/pagarme.ts, o endpoint exato de
 * tokenização deve ser confirmado contra a documentação atual da Pagar.me
 * antes de ir para produção.
 */

export interface DadosCartao {
  number: string;
  holderName: string;
  expMonth: string;
  expYear: string;
  cvv: string;
}

export async function tokenizarCartao(card: DadosCartao): Promise<string> {
  const publicKey = process.env.NEXT_PUBLIC_PAGARME_PUBLIC_KEY;
  if (!publicKey) {
    throw new Error("NEXT_PUBLIC_PAGARME_PUBLIC_KEY não está configurada.");
  }

  const res = await fetch(
    `https://api.pagar.me/core/v5/tokens?appId=${publicKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "card",
        card: {
          number: card.number.replace(/\s/g, ""),
          holder_name: card.holderName,
          exp_month: card.expMonth,
          exp_year: card.expYear,
          cvv: card.cvv,
        },
      }),
    }
  );

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(body?.message || "Não foi possível validar o cartão.");
  }

  return body.id as string;
}

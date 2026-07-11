import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/service";
import { SUBSCRIPTION_STATUS, type SubscriptionStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * A Pagar.me v5 autentica webhooks via HTTP Basic Auth configurada na própria
 * URL cadastrada no painel (ex: https://usuario:senha@seu-dominio.com/api/webhooks/pagarme),
 * em vez de assinatura HMAC no corpo da requisição. Confirme esse
 * comportamento contra a documentação atual antes de ir para produção — não
 * foi possível consultá-la ao vivo ao escrever esta rota.
 */
function isAuthorized(request: Request): boolean {
  const expectedUser = process.env.PAGARME_WEBHOOK_USER;
  const expectedPassword = process.env.PAGARME_WEBHOOK_PASSWORD;

  if (!expectedUser || !expectedPassword) return false;

  const header = request.headers.get("authorization") || "";
  const [scheme, encoded] = header.split(" ");
  if (scheme !== "Basic" || !encoded) return false;

  const decoded = Buffer.from(encoded, "base64").toString("utf-8");
  const expected = `${expectedUser}:${expectedPassword}`;

  const a = Buffer.from(decoded);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

function normalizeStatus(eventType: string, dataStatus?: string): SubscriptionStatus | null {
  if (dataStatus && (SUBSCRIPTION_STATUS as readonly string[]).includes(dataStatus)) {
    return dataStatus as SubscriptionStatus;
  }
  if (eventType.includes("canceled") || eventType.includes("cancelled")) return "canceled";
  if (eventType.includes("payment_failed") || eventType.includes("failed")) return "past_due";
  if (eventType.includes("paid") || eventType.includes("active")) return "active";
  return null;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload?.type) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const eventType: string = payload.type;
  const data = payload.data ?? {};
  const subscriptionId: string | undefined = data.subscription?.id ?? data.id;
  const currentPeriodEnd: string | undefined = data.current_cycle?.end_at;

  const status = normalizeStatus(eventType, data.status);

  if (!subscriptionId || !status) {
    // Evento que não reconhecemos ou que não afeta o status da assinatura —
    // confirmamos o recebimento sem processar, para não gerar retries.
    return NextResponse.json({ received: true, handled: false });
  }

  const serviceClient = createServiceClient();
  const { error } = await serviceClient
    .from("subscriptions")
    .update({
      status,
      ...(currentPeriodEnd ? { current_period_end: currentPeriodEnd } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("pagarme_subscription_id", subscriptionId);

  if (error) {
    console.error("Erro ao atualizar assinatura via webhook:", error);
    return NextResponse.json({ error: "Falha ao processar." }, { status: 500 });
  }

  return NextResponse.json({ received: true, handled: true });
}

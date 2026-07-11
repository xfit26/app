import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { criarAssinatura } from "@/lib/payments/pagarme";
import { PLANOS_ASSINATURA } from "@/lib/types";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  plano: z.enum(PLANOS_ASSINATURA),
  cardToken: z.string().min(1),
  cliente: z.object({
    nome: z.string().min(2),
    email: z.string().email(),
    cpf: z.string().min(11),
    telefone: z.string().min(10),
  }),
});

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { plano, cardToken, cliente } = parsed.data;

  let subscription;
  try {
    subscription = await criarAssinatura({ cliente, cardToken, plano });
  } catch (err) {
    console.error("Erro ao criar assinatura na Pagar.me:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Não foi possível processar o pagamento.",
      },
      { status: 502 }
    );
  }

  const serviceClient = createServiceClient();
  const { error: dbError } = await serviceClient.from("subscriptions").upsert(
    {
      user_id: user.id,
      plano,
      status: subscription.status === "active" ? "active" : "pending",
      pagarme_customer_id: subscription.customer?.id ?? null,
      pagarme_subscription_id: subscription.id,
      current_period_end: subscription.current_cycle?.end_at ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (dbError) {
    console.error("Erro ao salvar assinatura:", dbError);
    return NextResponse.json(
      {
        error:
          "Pagamento processado, mas houve falha ao registrar a assinatura. Entre em contato com o suporte.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ status: subscription.status });
}

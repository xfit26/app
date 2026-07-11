import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client com a service role key — ignora RLS. Uso restrito a rotas de
 * servidor de confiança (webhook da Pagar.me, criação de assinatura) que já
 * validaram o usuário/evento por outro meio antes de escrever no banco.
 */
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não está configurada.");
  }

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

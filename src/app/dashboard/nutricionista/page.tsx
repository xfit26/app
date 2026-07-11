import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NutricionistaChat } from "@/components/dashboard/nutricionista-chat";
import type { SubscriptionRecord } from "@/lib/types";

export default async function NutricionistaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user!.id)
    .maybeSingle<SubscriptionRecord>();

  if (subscription?.status !== "active") {
    return (
      <Card className="text-center">
        <h1 className="text-xl font-semibold">Chat Nutricionista</h1>
        <p className="mt-2 text-sm text-muted">
          Assine para conversar com a IA sobre alimentação, macros, calorias e
          hábitos alimentares, com base no seu perfil e nas suas refeições.
        </p>
        <Link href="/assinar">
          <Button className="mt-6">Assinar agora</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Nutricionista</h1>
        <p className="mt-1 text-sm text-muted">
          Tire dúvidas sobre alimentação. Para dúvidas de treino, use o chat
          Personal.
        </p>
      </div>
      <Card>
        <NutricionistaChat />
      </Card>
    </div>
  );
}

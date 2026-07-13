import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ChatWidget } from "@/components/dashboard/chat-widget";

export default function SuplementoChatPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Suplementos</h1>
        <p className="mt-1 text-sm text-muted">
          Tire dúvidas gerais sobre suplementação. Para verificar a
          regularização de um produto específico, use o{" "}
          <Link href="/dashboard/suplementos" className="text-primary underline">
            módulo de suplementos
          </Link>{" "}
          (exclusivo do plano de 8 semanas).
        </p>
      </div>
      <Card>
        <ChatWidget
          endpoint="/api/chat/suplemento"
          saudacao="Olá! Posso tirar dúvidas gerais sobre whey, creatina, albumina, hipercalórico, termogênico, glutamina e pré-treino."
          placeholder="Pergunte sobre suplementos..."
        />
      </Card>
    </div>
  );
}

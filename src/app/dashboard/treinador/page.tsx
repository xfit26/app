import { Card } from "@/components/ui/card";
import { ChatWidget } from "@/components/dashboard/chat-widget";

export default function TreinadorPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Treinador</h1>
        <p className="mt-1 text-sm text-muted">
          Tire dúvidas sobre o treino que você recebeu do Léo Moura. Para
          dúvidas de alimentação, use o chat Nutricionista.
        </p>
      </div>
      <Card>
        <ChatWidget
          endpoint="/api/chat/treinador"
          saudacao="E aí! Sou o treinador Léo Moura. Pode me perguntar sobre execução dos exercícios, séries, descanso e progressão do seu treino."
          placeholder="Pergunte sobre execução, séries, descanso..."
        />
      </Card>
    </div>
  );
}

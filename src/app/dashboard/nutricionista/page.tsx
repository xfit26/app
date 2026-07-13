import { Card } from "@/components/ui/card";
import { ChatWidget } from "@/components/dashboard/chat-widget";

export default function NutricionistaPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Nutricionista</h1>
        <p className="mt-1 text-sm text-muted">
          Tire dúvidas sobre alimentação. Para dúvidas de treino, use o chat
          Treinador; para suplementos, use o chat Suplementos.
        </p>
      </div>
      <Card>
        <ChatWidget
          endpoint="/api/chat/nutricionista"
          saudacao="Olá! Sou o Nutricionista do treinador Léo Moura. Pode me perguntar sobre alimentação, calorias, macros, hidratação ou hábitos alimentares."
          placeholder="Pergunte sobre alimentação, macros, calorias..."
        />
      </Card>
    </div>
  );
}

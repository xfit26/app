import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DietPlanRecord } from "@/lib/types";

export default async function DietaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: diet } = await supabase
    .from("diet_plans")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<DietPlanRecord>();

  if (!diet) {
    return (
      <Card className="text-center">
        <h1 className="text-xl font-semibold">Nenhuma dieta ainda</h1>
        <p className="mt-2 text-sm text-muted">
          Preencha a anamnese para gerar seu primeiro plano de dieta.
        </p>
        <Link href="/anamnese">
          <Button className="mt-6">Preencher anamnese</Button>
        </Link>
      </Card>
    );
  }

  const { titulo, calorias_diarias, macros, refeicoes, observacoes_gerais } =
    diet.conteudo;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{titulo}</h1>
        <div className="mt-3 grid grid-cols-4 gap-3">
          <Card className="p-3 text-center">
            <div className="text-lg font-semibold">{calorias_diarias}</div>
            <div className="text-xs text-muted">kcal/dia</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-lg font-semibold">{macros.proteinas_g}g</div>
            <div className="text-xs text-muted">Proteínas</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-lg font-semibold">{macros.carboidratos_g}g</div>
            <div className="text-xs text-muted">Carboidratos</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-lg font-semibold">{macros.gorduras_g}g</div>
            <div className="text-xs text-muted">Gorduras</div>
          </Card>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {refeicoes.map((refeicao, i) => (
          <Card key={i}>
            <div className="flex items-baseline justify-between">
              <h2 className="font-semibold">{refeicao.nome}</h2>
              <span className="text-xs text-muted">
                {refeicao.horario_sugerido}
              </span>
            </div>
            <ul className="mt-3 flex flex-col gap-1.5 text-sm">
              {refeicao.itens.map((item, j) => (
                <li key={j} className="flex justify-between">
                  <span>
                    {item.alimento} — {item.quantidade}
                  </span>
                  {item.calorias !== undefined && (
                    <span className="text-muted">{item.calorias} kcal</span>
                  )}
                </li>
              ))}
            </ul>
            {refeicao.observacao && (
              <p className="mt-3 text-xs text-muted">{refeicao.observacao}</p>
            )}
          </Card>
        ))}
      </div>

      {observacoes_gerais && (
        <Card className="bg-primary/5 text-sm text-muted">
          {observacoes_gerais}
        </Card>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { tokenizarCartao } from "@/lib/payments/pagarme-client";
import type { PlanoAssinatura } from "@/lib/types";

const PLANOS: { id: PlanoAssinatura; label: string; precoLabel: string }[] = [
  { id: "mensal", label: "Mensal", precoLabel: "R$ 29,90/mês" },
  { id: "anual", label: "Anual", precoLabel: "R$ 299,00/ano" },
];

export default function AssinarPage() {
  const router = useRouter();
  const [plano, setPlano] = useState<PlanoAssinatura>("mensal");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [numero, setNumero] = useState("");
  const [validade, setValidade] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const [expMonth, expYear] = validade.split("/").map((s) => s.trim());
      if (!expMonth || !expYear) {
        throw new Error("Validade inválida. Use o formato MM/AA.");
      }

      const cardToken = await tokenizarCartao({
        number: numero,
        holderName: nome,
        expMonth,
        expYear,
        cvv,
      });

      const res = await fetch("/api/assinatura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plano,
          cardToken,
          cliente: { nome, email, cpf, telefone },
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Não foi possível concluir a assinatura.");
      }

      router.push("/dashboard/nutricionista");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-semibold">Assinar chat Nutricionista</h1>
      <p className="mt-1 text-sm text-muted">
        Converse com a IA sobre alimentação, macros e hábitos alimentares com
        base no seu perfil e nas suas refeições registradas.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {PLANOS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPlano(p.id)}
            className={`rounded-xl border p-4 text-left transition-colors ${
              plano === p.id
                ? "border-primary bg-primary/10"
                : "border-border bg-card"
            }`}
          >
            <div className="font-medium">{p.label}</div>
            <div className="text-sm text-muted">{p.precoLabel}</div>
          </button>
        ))}
      </div>

      <Card className="mt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Nome completo" htmlFor="nome">
            <Input id="nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
          </Field>
          <Field label="E-mail" htmlFor="email">
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="CPF" htmlFor="cpf">
              <Input
                id="cpf"
                required
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
              />
            </Field>
            <Field label="Telefone" htmlFor="telefone">
              <Input
                id="telefone"
                required
                placeholder="(11) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </Field>
          </div>

          <hr className="border-border" />

          <Field label="Número do cartão" htmlFor="numero">
            <Input
              id="numero"
              required
              inputMode="numeric"
              placeholder="0000 0000 0000 0000"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Validade (MM/AA)" htmlFor="validade">
              <Input
                id="validade"
                required
                placeholder="12/29"
                value={validade}
                onChange={(e) => setValidade(e.target.value)}
              />
            </Field>
            <Field label="CVV" htmlFor="cvv">
              <Input
                id="cvv"
                required
                inputMode="numeric"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
              />
            </Field>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? "Processando..." : "Confirmar assinatura"}
          </Button>

          <p className="text-xs text-muted">
            Pagamento processado com segurança pela Pagar.me. Seus dados de
            cartão não passam pelos nossos servidores.
          </p>
        </form>
      </Card>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { BodyMeasurementForm } from "@/components/dashboard/body-measurement-form";
import { ProgressPhotoForm } from "@/components/dashboard/progress-photo-form";
import type { BodyMeasurementRecord } from "@/lib/types";

const MEDIDAS_LABELS: { id: keyof BodyMeasurementRecord; label: string }[] = [
  { id: "peso_kg", label: "Peso" },
  { id: "peito_cm", label: "Peito" },
  { id: "cintura_cm", label: "Cintura" },
  { id: "quadril_cm", label: "Quadril" },
  { id: "braco_cm", label: "Braço" },
  { id: "coxa_cm", label: "Coxa" },
];

function encontrarComparacao(medidas: BodyMeasurementRecord[]) {
  if (medidas.length === 0) return null;
  const atual = medidas[0];
  const atualData = new Date(atual.created_at).getTime();
  const anterior = medidas.find(
    (m) => atualData - new Date(m.created_at).getTime() >= 25 * 24 * 60 * 60 * 1000
  );
  return anterior ?? medidas[medidas.length - 1] ?? null;
}

function Diferenca({
  atual,
  anterior,
  unidade,
}: {
  atual: number | null | undefined;
  anterior: number | null | undefined;
  unidade: string;
}) {
  if (atual == null || anterior == null) return <span className="text-muted">—</span>;
  const diff = atual - anterior;
  const sinal = diff > 0 ? "+" : "";
  const cor = diff > 0 ? "text-red-500" : diff < 0 ? "text-primary" : "text-muted";
  return (
    <span className={cor}>
      {sinal}
      {diff.toFixed(1)}
      {unidade}
    </span>
  );
}

export default async function EvolucaoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: medidas }, { data: fotos }] = await Promise.all([
    supabase
      .from("body_measurements")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .returns<BodyMeasurementRecord[]>(),
    supabase
      .from("progress_photos")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
  ]);

  const listaMedidas = medidas ?? [];
  const atual = listaMedidas[0] ?? null;
  const anterior = encontrarComparacao(listaMedidas);
  const comparando = atual && anterior && atual.id !== anterior.id;

  const fotosComUrl = await Promise.all(
    (fotos ?? []).map(async (foto) => {
      const { data } = await supabase.storage
        .from("progress-photos")
        .createSignedUrl(foto.storage_path, 60 * 60);
      return { ...foto, url: data?.signedUrl ?? null };
    })
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Evolução</h1>
        <p className="mt-1 text-sm text-muted">
          Registre medidas e fotos para acompanhar sua evolução ao longo do
          tempo.
        </p>
      </div>

      {comparando && (
        <Card>
          <h2 className="font-semibold">Comparativo com o registro anterior</h2>
          <p className="mt-1 text-xs text-muted">
            {new Date(anterior!.created_at).toLocaleDateString("pt-BR")} →{" "}
            {new Date(atual!.created_at).toLocaleDateString("pt-BR")}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {MEDIDAS_LABELS.map(({ id, label }) => (
              <div key={id} className="rounded-lg border border-border p-3 text-sm">
                <p className="text-muted">{label}</p>
                <p className="mt-1 font-medium">
                  <Diferenca
                    atual={atual![id] as number | null | undefined}
                    anterior={anterior![id] as number | null | undefined}
                    unidade={id === "peso_kg" ? " kg" : " cm"}
                  />
                </p>
              </div>
            ))}
            <div className="rounded-lg border border-border p-3 text-sm">
              <p className="text-muted">% de gordura (7 dobras)</p>
              <p className="mt-1 font-medium">
                <Diferenca
                  atual={atual!.percentual_gordura}
                  anterior={anterior!.percentual_gordura}
                  unidade="%"
                />
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <h2 className="font-semibold">Nova medida</h2>
        <div className="mt-4">
          <BodyMeasurementForm />
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold">Histórico de medidas</h2>
        {listaMedidas.length > 0 ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-muted">
                  <th className="py-1 pr-4">Data</th>
                  <th className="py-1 pr-4">Peso</th>
                  <th className="py-1 pr-4">Cintura</th>
                  <th className="py-1 pr-4">% gordura</th>
                </tr>
              </thead>
              <tbody>
                {listaMedidas.map((m) => (
                  <tr key={m.id} className="border-t border-border">
                    <td className="py-1.5 pr-4">
                      {new Date(m.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-1.5 pr-4">{m.peso_kg} kg</td>
                    <td className="py-1.5 pr-4">{m.cintura_cm ? `${m.cintura_cm} cm` : "—"}</td>
                    <td className="py-1.5 pr-4">
                      {m.percentual_gordura ? `${m.percentual_gordura.toFixed(1)}%` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted">Nenhuma medida registrada ainda.</p>
        )}
      </Card>

      <Card>
        <h2 className="font-semibold">Fotos de antes/depois</h2>
        <div className="mt-4">
          <ProgressPhotoForm />
        </div>
        {fotosComUrl.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {fotosComUrl.map((foto) =>
              foto.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={foto.id}
                  src={foto.url}
                  alt={foto.legenda || "Foto de evolução"}
                  className="aspect-square w-full rounded-lg border border-border object-cover"
                />
              ) : null
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">Nenhuma foto enviada ainda.</p>
        )}
      </Card>
    </div>
  );
}

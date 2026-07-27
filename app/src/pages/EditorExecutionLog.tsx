import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Field, PrimaryButton, ProgressBar, inputClass } from "../components/ui";
import { Icon } from "../components/Icon";
import { planosDisponiveisParaExecucao } from "../data/mockData";

interface StageState {
  label: string;
  planejado: number;
  executado: number;
  observacoes: string;
}

interface DesvioRow {
  id: number;
  etapa: string;
  impacto: string;
  descricao: string;
}

function deviationInfo(planejado: number, executado: number) {
  const diff = executado - planejado;
  const abs = Math.abs(diff);
  const sign = diff > 0 ? "+" : "";
  if (abs <= 1) return { text: `${sign}${diff} minuto${abs === 1 ? "" : "s"} · dentro do esperado`, color: "text-secondary" };
  if (abs <= 3) return { text: `${sign}${diff} minutos · acima do planejado`, color: "text-warning" };
  return { text: `${sign}${diff} minutos · desvio significativo`, color: "text-primary-text" };
}

function formatDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

let desvioId = 3;

export default function EditorExecutionLog() {
  const navigate = useNavigate();
  const [planoId, setPlanoId] = useState("");
  const planoSelecionado = planosDisponiveisParaExecucao.find((p) => p.id === planoId) ?? null;

  const [stages, setStages] = useState<StageState[]>([
    { label: "Etapa Inicial (Aquecimento)", planejado: 10, executado: 12, observacoes: "Aquecimento mais longo que o previsto" },
    { label: "Etapa Funcionamento", planejado: 15, executado: 14, observacoes: "Exercício de passe curto funcionou bem" },
    { label: "Etapa Principal", planejado: 35, executado: 36, observacoes: "Jogo posicional com bom entendimento" },
  ]);

  const [desvios, setDesvios] = useState<DesvioRow[]>([
    { id: 1, etapa: "Inicial", impacto: "Baixo", descricao: "Aquecimento mais longo, mas positivo" },
    { id: 2, etapa: "Principal", impacto: "Médio", descricao: "Um jogador lesionou no intervalo" },
  ]);

  const [status, setStatus] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const totalPlanejado = stages.reduce((s, e) => s + e.planejado, 0);
  const totalExecutado = stages.reduce((s, e) => s + e.executado, 0);
  const diffTotal = totalExecutado - totalPlanejado;

  const conformance = useMemo(() => {
    const impactPoints: Record<string, number> = { Baixo: 20, Médio: 10, Alto: 0 };
    const worstImpact = desvios.reduce((worst, d) => {
      const order = ["Alto", "Médio", "Baixo"];
      return order.indexOf(d.impacto) < order.indexOf(worst) ? d.impacto : worst;
    }, "Baixo");
    const timeScore = Math.abs(diffTotal) < 2 ? 30 : Math.abs(diffTotal) <= 5 ? 20 : 10;
    return 20 + timeScore + 30 + (desvios.length ? impactPoints[worstImpact] : 20);
  }, [diffTotal, desvios]);

  function updateStage(idx: number, patch: Partial<StageState>) {
    setStages((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  }

  function addDesvio() {
    setDesvios((prev) => [...prev, { id: ++desvioId, etapa: "Inicial", impacto: "Baixo", descricao: "" }]);
  }

  function updateDesvio(id: number, patch: Partial<DesvioRow>) {
    setDesvios((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }

  function removeDesvio(id: number) {
    setDesvios((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-ink sm:text-2xl">
          Registrar Execução
          {planoSelecionado && ` — ${formatDate(planoSelecionado.sessionDate)} — Team ${planoSelecionado.team} — ${planoSelecionado.coachName}`}
        </h1>
      </div>

      <Card title="Plano de Referência" icon={<Icon name="stamp" className="h-4 w-4" />}>
        <Field label="Selecione um plano aprovado" required hint="Gate obrigatório (RF5): só planos aprovados aparecem aqui.">
          <select className={inputClass} value={planoId} onChange={(e) => setPlanoId(e.target.value)}>
            <option value="">Selecione…</option>
            {planosDisponiveisParaExecucao.map((p) => (
              <option key={p.id} value={p.id}>
                {formatDate(p.sessionDate)} · Team {p.team} · {p.coachName} · aprovado em {formatDate(p.approvedAt?.slice(0, 10) ?? p.sessionDate)}
              </option>
            ))}
          </select>
        </Field>
      </Card>

      {!planoSelecionado ? (
        <Card>
          <p className="flex items-center gap-1.5 text-sm text-ink-muted">
            <Icon name="alert" className="h-4 w-4 text-warning" /> Nenhum plano selecionado — sem um plano aprovado, não
            é possível registrar execução.
          </p>
          {planosDisponiveisParaExecucao.length === 0 && (
            <p className="mt-2 text-sm text-ink-muted">
              Nenhum plano aprovado disponível no momento.{" "}
              <button type="button" onClick={() => navigate("/planos/aprovacao")} className="font-medium text-primary-text hover:underline">
                Ver fila de aprovação →
              </button>
            </p>
          )}
        </Card>
      ) : (
        <>
          <Card>
            <p className="text-sm text-ink-muted">
              <span className="font-medium text-ink">Plano:</span> {formatDate(planoSelecionado.sessionDate)} ·{" "}
              {planoSelecionado.fase} · {totalPlanejado} min total
            </p>
            <p className="text-sm text-ink-muted">
              <span className="font-medium text-ink">Súmula:</span> Confirmada · 11 jogadores
            </p>
          </Card>

          {stages.map((stage, idx) => {
            const dev = deviationInfo(stage.planejado, stage.executado);
            return (
              <Card key={stage.label} title={stage.label}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <span className="mb-1.5 block text-sm font-medium text-ink-muted">Planejado</span>
                    <p className="rounded-xl border border-line-soft bg-surface-2 px-3 py-2.5 text-sm text-ink-muted">{stage.planejado} minutos</p>
                  </div>
                  <Field label="Executado (minutos)">
                    <input
                      type="number"
                      min={0}
                      className={inputClass}
                      value={stage.executado}
                      onChange={(e) => updateStage(idx, { executado: Number(e.target.value) })}
                    />
                  </Field>
                  <div>
                    <span className="mb-1.5 block text-sm font-medium text-ink-muted">Desvio</span>
                    <p className={`rounded-xl border border-line-soft bg-surface-2 px-3 py-2.5 text-sm font-medium ${dev.color}`}>{dev.text}</p>
                  </div>
                </div>
                <Field label="Observações">
                  <input
                    className={inputClass}
                    value={stage.observacoes}
                    onChange={(e) => updateStage(idx, { observacoes: e.target.value })}
                  />
                </Field>
              </Card>
            );
          })}

          <Card>
            <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="font-semibold text-ink">
                Total Executado: {totalExecutado} minutos (Planejado: {totalPlanejado} min)
              </p>
              <p className={`font-semibold ${Math.abs(diffTotal) <= 2 ? "text-secondary" : "text-warning"}`}>
                Diferença Total: {diffTotal > 0 ? "+" : ""}
                {diffTotal} minutos
              </p>
            </div>
          </Card>

          <Card title="Desvios Registrados" icon={<Icon name="alert" className="h-4 w-4" />}>
            <button type="button" onClick={addDesvio} className="mb-4 flex items-center gap-1 text-sm font-medium text-primary-text">
              <Icon name="plus" className="h-3.5 w-3.5" /> Adicionar desvio
            </button>
            <div className="flex flex-col gap-3">
              {desvios.map((d, i) => (
                <div key={d.id} className="rounded-xl border border-line-soft bg-surface-2 p-3">
                  <p className="mb-2 text-sm font-semibold text-ink">Desvio {i + 1}</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Field label="Etapa">
                      <select
                        className={inputClass}
                        value={d.etapa}
                        onChange={(e) => updateDesvio(d.id, { etapa: e.target.value })}
                      >
                        <option>Inicial</option>
                        <option>Funcionamento</option>
                        <option>Principal</option>
                      </select>
                    </Field>
                    <Field label="Impacto">
                      <select
                        className={inputClass}
                        value={d.impacto}
                        onChange={(e) => updateDesvio(d.id, { impacto: e.target.value })}
                      >
                        <option>Baixo</option>
                        <option>Médio</option>
                        <option>Alto</option>
                      </select>
                    </Field>
                    <Field label="Descrição">
                      <input
                        className={inputClass}
                        value={d.descricao}
                        onChange={(e) => updateDesvio(d.id, { descricao: e.target.value })}
                      />
                    </Field>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDesvio(d.id)}
                    className="mt-1 flex items-center gap-1 text-xs font-medium text-primary-text hover:underline"
                  >
                    <Icon name="x" className="h-3.5 w-3.5" /> Remover
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex flex-wrap gap-2">
            <PrimaryButton variant="secondary" onClick={() => setStatus("Execução salva como draft.")}>
              Salvar como Draft
            </PrimaryButton>
            <PrimaryButton
              onClick={() => {
                setConfirmed(true);
                setStatus(`Execução confirmada. Conformidade calculada: ${conformance}%.`);
              }}
            >
              Confirmar Execução
            </PrimaryButton>
          </div>

          {status && (
            <p role="status" className="flex items-center gap-1.5 rounded-xl border border-secondary/30 bg-secondary/10 px-3 py-2 text-sm text-secondary">
              <Icon name="check" className="h-4 w-4" /> {status}
            </p>
          )}

          {confirmed && (
            <Card title="Ao confirmar" icon={<Icon name="bot" className="h-4 w-4" />}>
              <ul className="mb-3 flex flex-col gap-1 text-sm text-ink-muted">
                <li>• Sistema calcula conformidade: {conformance}%</li>
                <li>• IA gera insights</li>
                <li>• Execution log fica confirmado</li>
              </ul>
              <ProgressBar value={conformance} />
            </Card>
          )}
        </>
      )}
    </div>
  );
}

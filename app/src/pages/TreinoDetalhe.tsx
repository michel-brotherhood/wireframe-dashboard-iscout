import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { treinos } from "../data/mockData";
import { Card, StatusBadge, PrimaryButton } from "../components/ui";
import { Icon } from "../components/Icon";
import { useRole } from "../state/RoleContext";

function formatDateTime(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} às ${String(
    d.getHours(),
  ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function deviationLabel(planejado: number, executado: number) {
  const diff = executado - planejado;
  const sign = diff > 0 ? "+" : "";
  const color = Math.abs(diff) <= 1 ? "text-secondary" : Math.abs(diff) <= 3 ? "text-warning" : "text-primary-text";
  return { text: `${sign}${diff} min`, color };
}

const impactStyles: Record<string, string> = {
  Baixo: "bg-secondary/15 text-secondary",
  Médio: "bg-warning/15 text-warning",
  Alto: "bg-primary/15 text-primary-text",
};

export default function TreinoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useRole();
  const canEdit = role !== "responsavel";
  const treino = treinos.find((t) => t.id === id) ?? treinos[0];
  const { plano, sumula, executionLog } = treino;
  const totalPlanejado =
    plano.etapaInicial.duracaoMin + plano.etapaFuncionamento.duracaoMin + plano.etapaPrincipal.duracaoMin;

  const [status, setStatus] = useState<string | null>(null);

  function handleExport() {
    setStatus("Relatório exportado (PDF) — download simulado para este wireframe.");
  }

  async function handleShare() {
    const link = typeof window !== "undefined" ? window.location.href : "";
    try {
      await navigator.clipboard?.writeText(link);
      setStatus("Link copiado para a área de transferência.");
    } catch {
      setStatus(`Link: ${link}`);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="rounded-lg border border-line p-2 text-ink-muted hover:bg-surface-2"
            aria-label="Voltar ao dashboard"
          >
            <Icon name="arrowLeft" className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-heading text-lg font-semibold text-ink sm:text-xl">
              Treino: {plano.sessionDate.split("-").reverse().slice(0, 2).join("/")} · {treino.categoria} ·{" "}
              {treino.turma} · {treino.coachName}
            </h1>
          </div>
        </div>
        {canEdit && (
          <div className="flex flex-wrap gap-2">
            <PrimaryButton variant="secondary" onClick={() => navigate("/planos/novo")}>
              <Icon name="edit" className="h-4 w-4" /> Editar
            </PrimaryButton>
            <PrimaryButton variant="secondary" onClick={handleExport}>
              <Icon name="download" className="h-4 w-4" /> Exportar
            </PrimaryButton>
            <PrimaryButton variant="secondary" onClick={handleShare}>
              <Icon name="share" className="h-4 w-4" /> Compartilhar
            </PrimaryButton>
          </div>
        )}
      </div>

      {status && (
        <p role="status" className="flex items-center gap-1.5 rounded-xl border border-secondary/30 bg-secondary/10 px-3 py-2 text-sm text-secondary">
          <Icon name="check" className="h-4 w-4" /> {status}
        </p>
      )}

      {/* Seção 1: Plano */}
      <Card title="Seção 1 · Plano de Aula" icon={<Icon name="clipboard" className="h-4 w-4" />}>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <StatusBadge status={plano.status} />
          {plano.approvedAt && (
            <span className="text-ink-muted">
              {formatDateTime(plano.approvedAt)} por {plano.approvedBy}
            </span>
          )}
          <span className="ml-auto rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary-text">
            Fase: {plano.fase}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-line-soft bg-surface-2 p-3">
            <p className="text-sm font-semibold text-ink">
              Etapa Inicial (Aquecimento) — {plano.etapaInicial.duracaoMin} min
            </p>
            <p className="mt-1 text-sm text-ink-muted">Objetivo: {plano.etapaInicial.objetivo}</p>
            <p className="text-sm text-ink-muted">Coordenação: {plano.etapaInicial.coordenacao.join(", ")}</p>
            <p className="text-sm text-ink-muted">Estações: {plano.etapaInicial.estacoes.join(", ")}</p>
          </div>
          <div className="rounded-xl border border-line-soft bg-surface-2 p-3">
            <p className="text-sm font-semibold text-ink">
              Etapa Funcionamento — {plano.etapaFuncionamento.duracaoMin} min
            </p>
            <p className="mt-1 text-sm text-ink-muted">Objetivo: {plano.etapaFuncionamento.objetivo}</p>
            <p className="text-sm text-ink-muted">Tipo: {plano.etapaFuncionamento.tipo}</p>
            <p className="text-sm text-ink-muted">Tema: {plano.etapaFuncionamento.tema}</p>
          </div>
          <div className="rounded-xl border border-line-soft bg-surface-2 p-3">
            <p className="text-sm font-semibold text-ink">
              Etapa Principal — {plano.etapaPrincipal.duracaoMin} min
            </p>
            <p className="mt-1 text-sm text-ink-muted">Objetivo: {plano.etapaPrincipal.objetivo}</p>
            <p className="text-sm text-ink-muted">Sub-temas: {plano.etapaPrincipal.subTemas.join(", ")}</p>
            <p className="text-sm text-ink-muted">Orientações: {plano.etapaPrincipal.orientacoes.join(", ")}</p>
            <p className="text-sm text-ink-muted">
              Intervalo: Hidratação {plano.etapaPrincipal.intervalo.hidratacaoMin}min, Repouso{" "}
              {plano.etapaPrincipal.intervalo.repousoMin}min, Instruir {plano.etapaPrincipal.intervalo.instruirMin}min,
              Ativar {plano.etapaPrincipal.intervalo.ativarMin}min
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm font-semibold text-ink">Total Planejado: {totalPlanejado} minutos</p>
      </Card>

      {/* Seção 2: Súmula */}
      <Card
        title="Seção 2 · Súmula"
        icon={<Icon name="ball" className="h-4 w-4" />}
        headerAction={
          canEdit ? (
            <PrimaryButton variant="secondary" onClick={() => navigate("/sumulas/novo")}>
              <Icon name="edit" className="h-4 w-4" /> Editar Escalação
            </PrimaryButton>
          ) : undefined
        }
      >
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <StatusBadge status={sumula.status} />
          {sumula.confirmedAt && <span className="text-ink-muted">{formatDateTime(sumula.confirmedAt)}</span>}
          <span className="ml-auto text-ink-muted">Escalação: {sumula.entries.length} jogadores</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                <th scope="col" className="px-3 py-2">Jersey</th>
                <th scope="col" className="px-3 py-2">Nome</th>
                <th scope="col" className="px-3 py-2">Posição</th>
                <th scope="col" className="px-3 py-2">Starter</th>
              </tr>
            </thead>
            <tbody>
              {sumula.entries.map((e, i) => (
                <tr key={e.jersey} className={`border-b border-line-soft last:border-0 ${i % 2 === 1 ? "bg-surface-2/40" : ""}`}>
                  <td className="px-3 py-2 font-medium text-ink">{e.jersey}</td>
                  <td className="px-3 py-2 text-ink-muted">{e.nome}</td>
                  <td className="px-3 py-2 text-ink-muted">{e.posicao}</td>
                  <td className="px-3 py-2 text-secondary" aria-label={e.starter ? "Titular" : "Reserva"}>
                    {e.starter ? <Icon name="check" className="h-4 w-4" /> : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Seção 3: Execution Log */}
      {executionLog ? (
        <Card title="Seção 3 · Execution Log" icon={<Icon name="barChart" className="h-4 w-4" />}>
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
            <StatusBadge status={executionLog.status} />
            {executionLog.confirmedAt && <span className="text-ink-muted">{formatDateTime(executionLog.confirmedAt)}</span>}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Etapa Inicial (Aquecimento)", data: executionLog.etapaInicial },
              { label: "Etapa Funcionamento", data: executionLog.etapaFuncionamento },
              { label: "Etapa Principal", data: executionLog.etapaPrincipal },
            ].map(({ label, data }) => {
              const dev = deviationLabel(data.planejadoMin, data.executadoMin);
              return (
                <div key={label} className="rounded-xl border border-line-soft bg-surface-2 p-3">
                  <p className="text-sm font-semibold text-ink">{label}</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    Planejado: {data.planejadoMin} min &nbsp;·&nbsp; Executado: {data.executadoMin} min &nbsp;·&nbsp;{" "}
                    <span className={`font-semibold ${dev.color}`}>{dev.text}</span>
                  </p>
                  <p className="text-sm text-ink-muted">Observações: {data.observacoes}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
              <Icon name="alert" className="h-4 w-4 text-warning" /> Desvios Registrados
            </p>
            <ul className="flex flex-col gap-2">
              {executionLog.desvios.map((d) => (
                <li key={d.id} className="flex items-start gap-2 rounded-xl border border-line-soft bg-surface-2 p-3 text-sm">
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${impactStyles[d.impacto]}`}>
                    {d.impacto}
                  </span>
                  <div>
                    <p className="font-medium text-ink">Etapa {d.etapa}</p>
                    <p className="text-ink-muted">"{d.descricao}"</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      ) : (
        <Card title="Seção 3 · Execution Log" icon={<Icon name="barChart" className="h-4 w-4" />}>
          <p className="text-sm text-ink-muted">Execução ainda não registrada para este treino.</p>
        </Card>
      )}

      {/* Seção 4: Avaliação */}
      {executionLog && (
        <Card title="Seção 4 · Avaliação" icon={<Icon name="lineChart" className="h-4 w-4" />}>
          <p className="flex items-start gap-2 text-sm text-ink-muted">
            <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            Avaliação pendente de metodologia definida pela coordenação pedagógica. Indicadores pedagógicos e
            metodologia de conformidade pendentes de validação.
          </p>

          <div className="mt-4 rounded-xl border border-line-soft bg-surface-2 p-3">
            <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-ink">
              <Icon name="bot" className="h-4 w-4 text-primary" /> Inteligência Artificial
            </p>
            <p className="text-sm text-ink-muted">
              Área reservada para futuros insights de inteligência artificial, após definição dos indicadores e
              geração de uma base de dados confiável.
            </p>
          </div>

          {canEdit && (
            <div className="mt-4 flex flex-wrap gap-2">
              <PrimaryButton variant="secondary" onClick={() => navigate("/planos/novo")}>
                <Icon name="edit" className="h-4 w-4" /> Editar
              </PrimaryButton>
              <PrimaryButton variant="secondary" onClick={handleExport}>
                <Icon name="download" className="h-4 w-4" /> Exportar Relatório
              </PrimaryButton>
              <PrimaryButton variant="secondary" onClick={handleShare}>
                <Icon name="share" className="h-4 w-4" /> Compartilhar
              </PrimaryButton>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

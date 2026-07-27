import { Link, useParams } from "react-router-dom";
import { treinos } from "../data/mockData";
import {
  Card,
  ProgressBar,
  StatusBadge,
  PrimaryButton,
  conformanceTextColor,
} from "../components/ui";

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
  const color = Math.abs(diff) <= 1 ? "text-emerald-600" : Math.abs(diff) <= 3 ? "text-amber-600" : "text-red-600";
  return { text: `${sign}${diff} min`, color };
}

const impactStyles: Record<string, string> = {
  Baixo: "bg-emerald-100 text-emerald-700",
  Médio: "bg-amber-100 text-amber-700",
  Alto: "bg-red-100 text-red-700",
};

export default function TreinoDetalhe() {
  const { id } = useParams();
  const treino = treinos.find((t) => t.id === id) ?? treinos[0];
  const { plano, sumula, executionLog } = treino;
  const totalPlanejado =
    plano.etapaInicial.duracaoMin + plano.etapaFuncionamento.duracaoMin + plano.etapaPrincipal.duracaoMin;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
            aria-label="Voltar ao dashboard"
          >
            ←
          </Link>
          <div>
            <h1 className="font-heading text-lg font-semibold text-gray-900 sm:text-xl">
              Treino: {plano.sessionDate.split("-").reverse().slice(0, 2).join("/")} · Team {treino.team} ·{" "}
              {treino.coachName}
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <PrimaryButton variant="secondary">Editar</PrimaryButton>
          <PrimaryButton variant="secondary">Exportar</PrimaryButton>
          <PrimaryButton variant="secondary">Compartilhar</PrimaryButton>
        </div>
      </div>

      {/* Seção 1: Plano */}
      <Card title="Seção 1 · Plano de Aula" icon={<span aria-hidden="true">📋</span>}>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <StatusBadge status={plano.status} />
          {plano.approvedAt && (
            <span className="text-gray-500">
              {formatDateTime(plano.approvedAt)} por {plano.approvedBy}
            </span>
          )}
          <span className="ml-auto rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-primary">
            Fase: {plano.fase}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <p className="text-sm font-semibold text-gray-800">
              📋 Etapa Inicial (Aquecimento) — {plano.etapaInicial.duracaoMin} min
            </p>
            <p className="mt-1 text-sm text-gray-600">Objetivo: {plano.etapaInicial.objetivo}</p>
            <p className="text-sm text-gray-600">Coordenação: {plano.etapaInicial.coordenacao.join(", ")}</p>
            <p className="text-sm text-gray-600">Estações: {plano.etapaInicial.estacoes.join(", ")}</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <p className="text-sm font-semibold text-gray-800">
              📋 Etapa Funcionamento — {plano.etapaFuncionamento.duracaoMin} min
            </p>
            <p className="mt-1 text-sm text-gray-600">Objetivo: {plano.etapaFuncionamento.objetivo}</p>
            <p className="text-sm text-gray-600">Tipo: {plano.etapaFuncionamento.tipo}</p>
            <p className="text-sm text-gray-600">Tema: {plano.etapaFuncionamento.tema}</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <p className="text-sm font-semibold text-gray-800">
              📋 Etapa Principal — {plano.etapaPrincipal.duracaoMin} min
            </p>
            <p className="mt-1 text-sm text-gray-600">Objetivo: {plano.etapaPrincipal.objetivo}</p>
            <p className="text-sm text-gray-600">Sub-temas: {plano.etapaPrincipal.subTemas.join(", ")}</p>
            <p className="text-sm text-gray-600">Orientações: {plano.etapaPrincipal.orientacoes.join(", ")}</p>
            <p className="text-sm text-gray-600">
              Intervalo: Hidratação {plano.etapaPrincipal.intervalo.hidratacaoMin}min, Repouso{" "}
              {plano.etapaPrincipal.intervalo.repousoMin}min, Instruir {plano.etapaPrincipal.intervalo.instruirMin}min,
              Ativar {plano.etapaPrincipal.intervalo.ativarMin}min
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm font-semibold text-gray-800">Total Planejado: {totalPlanejado} minutos</p>
      </Card>

      {/* Seção 2: Súmula */}
      <Card title="Seção 2 · Súmula" icon={<span aria-hidden="true">⚽</span>}>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
          <StatusBadge status={sumula.status} />
          {sumula.confirmedAt && <span className="text-gray-500">{formatDateTime(sumula.confirmedAt)}</span>}
          <span className="ml-auto text-gray-500">Escalação: {sumula.entries.length} jogadores</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th scope="col" className="px-3 py-2">Jersey</th>
                <th scope="col" className="px-3 py-2">Nome</th>
                <th scope="col" className="px-3 py-2">Posição</th>
                <th scope="col" className="px-3 py-2">Starter</th>
              </tr>
            </thead>
            <tbody>
              {sumula.entries.map((e, i) => (
                <tr key={e.jersey} className={`border-b border-gray-100 last:border-0 ${i % 2 === 1 ? "bg-gray-50/60" : ""}`}>
                  <td className="px-3 py-2 font-medium text-gray-900">{e.jersey}</td>
                  <td className="px-3 py-2 text-gray-700">{e.nome}</td>
                  <td className="px-3 py-2 text-gray-700">{e.posicao}</td>
                  <td className="px-3 py-2 text-emerald-600" aria-label={e.starter ? "Titular" : "Reserva"}>
                    {e.starter ? "✓" : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Seção 3: Execution Log */}
      {executionLog ? (
        <Card title="Seção 3 · Execution Log" icon={<span aria-hidden="true">📊</span>}>
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
            <StatusBadge status={executionLog.status} />
            {executionLog.confirmedAt && <span className="text-gray-500">{formatDateTime(executionLog.confirmedAt)}</span>}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {[
              { label: "Etapa Inicial (Aquecimento)", data: executionLog.etapaInicial },
              { label: "Etapa Funcionamento", data: executionLog.etapaFuncionamento },
              { label: "Etapa Principal", data: executionLog.etapaPrincipal },
            ].map(({ label, data }) => {
              const dev = deviationLabel(data.planejadoMin, data.executadoMin);
              return (
                <div key={label} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <p className="text-sm font-semibold text-gray-800">📊 {label}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Planejado: {data.planejadoMin} min &nbsp;·&nbsp; Executado: {data.executadoMin} min &nbsp;·&nbsp;{" "}
                    <span className={`font-semibold ${dev.color}`}>{dev.text}</span>
                  </p>
                  <p className="text-sm text-gray-600">Observações: {data.observacoes}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-gray-800">⚠️ Desvios Registrados</p>
            <ul className="flex flex-col gap-2">
              {executionLog.desvios.map((d) => (
                <li key={d.id} className="flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm">
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${impactStyles[d.impacto]}`}>
                    {d.impacto}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800">Etapa {d.etapa}</p>
                    <p className="text-gray-600">"{d.descricao}"</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      ) : (
        <Card title="Seção 3 · Execution Log" icon={<span aria-hidden="true">📊</span>}>
          <p className="text-sm text-gray-500">Execução ainda não registrada para este treino.</p>
        </Card>
      )}

      {/* Seção 4: Conformidade */}
      {executionLog && (
        <Card title="Seção 4 · Conformidade" icon={<span aria-hidden="true">📈</span>}>
          <div className="mb-3 flex items-center gap-3">
            <span className={`text-2xl font-bold ${conformanceTextColor(executionLog.conformanceScore)}`}>
              {executionLog.conformanceScore}%
            </span>
            <div className="flex-1">
              <ProgressBar value={executionLog.conformanceScore} />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-1 text-sm text-gray-700 sm:grid-cols-2">
            <p>✓ Fase: {plano.fase} (match com planejamento)</p>
            <p>⚠️ Tempos: diferença total registrada nas 3 etapas</p>
            <p>✓ Exercícios: todos os 3 exercícios executados</p>
            <p>⚠️ Desvios: {executionLog.desvios.length} desvios registrados</p>
          </div>

          <div className="rounded-lg bg-blue-50 p-3">
            <p className="mb-2 text-sm font-semibold text-gray-800">🤖 Insights de IA</p>
            <ul className="flex flex-col gap-1 text-sm text-gray-700">
              {executionLog.insights.map((insight, i) => (
                <li key={i}>• {insight}</li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PrimaryButton variant="secondary">Editar</PrimaryButton>
            <PrimaryButton variant="secondary">Exportar Relatório</PrimaryButton>
            <PrimaryButton variant="secondary">Compartilhar</PrimaryButton>
          </div>
        </Card>
      )}
    </div>
  );
}

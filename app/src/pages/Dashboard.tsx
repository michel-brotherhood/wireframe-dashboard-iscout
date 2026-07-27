import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { treinos, conformidadePorDia, dashboardMetrics } from "../data/mockData";
import {
  Card,
  ProgressBar,
  StatusBadge,
  TeamBadge,
  PrimaryButton,
  conformanceColor,
  conformanceTextColor,
  inputClass,
} from "../components/ui";
import { Icon } from "../components/Icon";
import type { IconName } from "../components/Icon";

function formatDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

const metricCards: { icon: IconName; label: string; total: number; sub: string }[] = [
  {
    icon: "clipboard",
    label: "Planos",
    total: dashboardMetrics.planosTotal,
    sub: `${dashboardMetrics.planosAprovados} Aprovados`,
  },
  {
    icon: "ball",
    label: "Súmulas",
    total: dashboardMetrics.sumulasTotal,
    sub: `${dashboardMetrics.sumulasConfirmadas} Confirmadas`,
  },
  {
    icon: "barChart",
    label: "Execuções",
    total: dashboardMetrics.execucoesTotal,
    sub: `${dashboardMetrics.execucoesConfirmadas} Confirmadas`,
  },
];

function ConformanceDot(props: { cx?: number; cy?: number; payload?: { conformidade: number } }) {
  const { cx, cy, payload } = props;
  if (cx === undefined || cy === undefined || !payload) return null;
  const color =
    payload.conformidade >= 80 ? "#d3dc61" : payload.conformidade >= 60 ? "#f5b942" : "#e7254d";
  return <circle cx={cx} cy={cy} r={4} fill={color} stroke="#101f38" strokeWidth={1.5} />;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [dataFilter, setDataFilter] = useState("2026-07-02");
  const [teamFilter, setTeamFilter] = useState<string>("Todos");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");

  const filteredTreinos = useMemo(() => {
    return treinos.filter((t) => {
      if (dataFilter && t.sessionDate > dataFilter) return false;
      if (teamFilter !== "Todos" && t.team !== teamFilter) return false;
      if (statusFilter !== "Todos" && t.status !== statusFilter) return false;
      return true;
    });
  }, [dataFilter, teamFilter, statusFilter]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading flex items-center gap-2 text-xl font-semibold text-ink sm:text-2xl">
            <Icon name="trophy" className="h-6 w-6 text-primary" />
            Dashboard de Treinos
          </h1>
          <p className="mt-1 text-sm text-ink-muted">Visão geral de planos, súmulas e execuções</p>
        </div>
        <PrimaryButton onClick={() => navigate("/planos/novo")}>
          <Icon name="plus" className="h-4 w-4" />
          Novo Treino
        </PrimaryButton>
      </div>

      <Card>
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="flex-1">
            <span className="mb-1 block text-xs font-medium text-ink-muted">Data (até)</span>
            <input
              type="date"
              value={dataFilter}
              onChange={(e) => setDataFilter(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex-1">
            <span className="mb-1 block text-xs font-medium text-ink-muted">Team</span>
            <select
              className={inputClass}
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
            >
              <option>Todos</option>
              <option>Amarelo</option>
              <option>Azul</option>
            </select>
          </label>
          <label className="flex-1">
            <span className="mb-1 block text-xs font-medium text-ink-muted">Status</span>
            <select
              className={inputClass}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>Todos</option>
              <option>Executado</option>
              <option>Draft</option>
            </select>
          </label>
        </form>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metricCards.map((m) => (
          <Card key={m.label}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon name={m.icon} className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-ink-muted">{m.label}</p>
                <p className="text-2xl font-semibold text-ink">{m.total} Total</p>
                <p className="text-sm text-secondary">{m.sub}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm font-medium text-ink-muted">
            <Icon name="lineChart" className="h-4 w-4 text-primary" /> Conformidade Média
          </p>
          <p className={`text-lg font-semibold ${conformanceTextColor(dashboardMetrics.conformidadeMedia)}`}>
            {dashboardMetrics.conformidadeMedia}%
          </p>
        </div>
        <div className="mt-2">
          <ProgressBar value={dashboardMetrics.conformidadeMedia} />
        </div>
      </Card>

      <Card title="Conformidade por Dia" icon={<Icon name="lineChart" className="h-4 w-4" />}>
        <div className="h-64 w-full" role="img" aria-label="Gráfico de linha mostrando conformidade por dia da semana, variando entre 58% e 92%">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={conformidadePorDia} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#263a5c" />
              <XAxis dataKey="dia" tick={{ fontSize: 12, fill: "#93a4c6" }} axisLine={{ stroke: "#263a5c" }} tickLine={false} />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 12, fill: "#93a4c6" }}
                axisLine={{ stroke: "#263a5c" }}
                tickLine={false}
                width={44}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, "Conformidade"]}
                contentStyle={{ background: "#182b4a", border: "1px solid #263a5c", borderRadius: 8, color: "#f5f7fb" }}
                labelStyle={{ color: "#93a4c6" }}
              />
              <Line
                type="monotone"
                dataKey="conformidade"
                stroke="#e7254d"
                strokeWidth={2}
                dot={<ConformanceDot />}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Últimos Treinos" icon={<Icon name="calendar" className="h-4 w-4" />} className="p-0 sm:p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                <th scope="col" className="px-4 py-3">Data</th>
                <th scope="col" className="px-4 py-3">Team</th>
                <th scope="col" className="px-4 py-3">Coach</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Conformidade</th>
                <th scope="col" className="px-4 py-3 sr-only">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTreinos.map((t, i) => (
                <tr
                  key={t.id}
                  onClick={() => navigate(`/treinos/${t.id}`)}
                  tabIndex={0}
                  role="link"
                  aria-label={`Ver detalhes do treino de ${formatDate(t.sessionDate)}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") navigate(`/treinos/${t.id}`);
                  }}
                  className={`group cursor-pointer border-b border-line-soft last:border-0 outline-none hover:bg-primary/5 focus-visible:bg-primary/10 ${
                    i % 2 === 1 ? "bg-surface-2/40" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-ink">{formatDate(t.sessionDate)}</td>
                  <td className="px-4 py-3">
                    <TeamBadge team={t.team} />
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{t.coachName}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={t.status === "Executado" ? "Executado" : "Draft"} />
                  </td>
                  <td className="px-4 py-3">
                    {t.conformance !== undefined ? (
                      <div className="flex items-center gap-2">
                        <span className={`w-10 text-xs font-semibold ${conformanceTextColor(t.conformance)}`}>
                          {t.conformance}%
                        </span>
                        <div className="w-24">
                          <ProgressBar value={t.conformance} colorClass={conformanceColor(t.conformance)} size="sm" />
                        </div>
                      </div>
                    ) : (
                      <span className="text-ink-muted">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-text opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                      Ver Detalhes <Icon name="arrowRight" className="h-3.5 w-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTreinos.length >= 10 && (
          <div className="border-t border-line-soft px-4 py-3 text-center">
            <button type="button" className="text-sm font-medium text-primary-text hover:underline">
              Ver mais
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

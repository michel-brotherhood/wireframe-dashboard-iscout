import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

function formatDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

const metricCards = [
  {
    icon: "📋",
    label: "Planos",
    total: dashboardMetrics.planosTotal,
    sub: `${dashboardMetrics.planosAprovados} Aprovados`,
  },
  {
    icon: "⚽",
    label: "Súmulas",
    total: dashboardMetrics.sumulasTotal,
    sub: `${dashboardMetrics.sumulasConfirmadas} Confirmadas`,
  },
  {
    icon: "📊",
    label: "Execuções",
    total: dashboardMetrics.execucoesTotal,
    sub: `${dashboardMetrics.execucoesConfirmadas} Confirmadas`,
  },
];

function ConformanceDot(props: { cx?: number; cy?: number; payload?: { conformidade: number } }) {
  const { cx, cy, payload } = props;
  if (cx === undefined || cy === undefined || !payload) return null;
  const color =
    payload.conformidade >= 80 ? "#10b981" : payload.conformidade >= 60 ? "#fbbf24" : "#ef4444";
  return <circle cx={cx} cy={cy} r={4} fill={color} stroke="white" strokeWidth={1.5} />;
}

export default function Dashboard() {
  const [teamFilter, setTeamFilter] = useState<string>("Todos");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");

  const filteredTreinos = useMemo(() => {
    return treinos.filter((t) => {
      if (teamFilter !== "Todos" && t.team !== teamFilter) return false;
      if (statusFilter !== "Todos" && t.status !== statusFilter) return false;
      return true;
    });
  }, [teamFilter, statusFilter]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-xl font-semibold text-gray-900 sm:text-2xl">
            🏆 Dashboard de Treinos
          </h1>
          <p className="text-sm text-gray-500">Visão geral de planos, súmulas e execuções</p>
        </div>
        <PrimaryButton>
          <span aria-hidden="true">+</span> Novo Treino
        </PrimaryButton>
      </div>

      <Card>
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="flex-1">
            <span className="mb-1 block text-xs font-medium text-gray-600">Data</span>
            <input type="date" defaultValue="2026-07-02" className={inputClass} />
          </label>
          <label className="flex-1">
            <span className="mb-1 block text-xs font-medium text-gray-600">Team</span>
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
            <span className="mb-1 block text-xs font-medium text-gray-600">Status</span>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {metricCards.map((m) => (
          <Card key={m.label}>
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">
                {m.icon}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-500">{m.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{m.total} Total</p>
                <p className="text-sm text-emerald-600">{m.sub}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <span aria-hidden="true">📈</span> Conformidade Média
          </p>
          <p className={`text-lg font-semibold ${conformanceTextColor(dashboardMetrics.conformidadeMedia)}`}>
            {dashboardMetrics.conformidadeMedia}%
          </p>
        </div>
        <div className="mt-2">
          <ProgressBar value={dashboardMetrics.conformidadeMedia} />
        </div>
      </Card>

      <Card title="Conformidade por Dia" icon={<span aria-hidden="true">📈</span>}>
        <div className="h-64 w-full" role="img" aria-label="Gráfico de linha mostrando conformidade por dia da semana, variando entre 58% e 92%">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={conformidadePorDia} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="dia" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={false}
                width={44}
              />
              <Tooltip formatter={(value) => [`${value}%`, "Conformidade"]} />
              <Line
                type="monotone"
                dataKey="conformidade"
                stroke="#2563eb"
                strokeWidth={2}
                dot={<ConformanceDot />}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Últimos Treinos" icon={<span aria-hidden="true">🗓️</span>} className="p-0 sm:p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
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
                  className={`group border-b border-gray-100 last:border-0 hover:bg-primary/5 ${
                    i % 2 === 1 ? "bg-gray-50/60" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{formatDate(t.sessionDate)}</td>
                  <td className="px-4 py-3">
                    <TeamBadge team={t.team} />
                  </td>
                  <td className="px-4 py-3 text-gray-700">{t.coachName}</td>
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
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/treinos/${t.id}`}
                      className="text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                    >
                      Ver Detalhes →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 px-4 py-3 text-center">
          <button type="button" className="text-sm font-medium text-primary hover:underline">
            Ver mais
          </button>
        </div>
      </Card>
    </div>
  );
}

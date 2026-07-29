import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { treinos, isPastDeadline, todayDateString } from "../data/mockData";
import { Card, StatusBadge, PrimaryButton, inputClass } from "../components/ui";
import { Icon } from "../components/Icon";
import type { IconName } from "../components/Icon";
import { usePlanos } from "../state/PlanosContext";
import { useCurrentUser } from "../state/SessionContext";
import { escopoContem } from "../data/users";
import ResumoResponsavel from "./ResumoResponsavel";
import type { PlanoAula, Treino } from "../types";

const TODAY = todayDateString();

function formatDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function treinoSemPlanoAprovado(t: Treino) {
  return Boolean(t.executionLog) && t.plano.status !== "approved" && t.plano.status !== "executed";
}

interface MetricCard {
  icon: IconName;
  label: string;
  value: number | string;
  sub?: string;
  to?: string;
  tone?: "default" | "warning";
}

function buildCards(role: string, planos: PlanoAula[], treinosList: Treino[]): MetricCard[] {
  const aguardando = planos.filter((p) => p.status === "submitted").length;
  const ajustes = planos.filter((p) => p.status === "changes_requested").length;
  const foraDoPrazo = planos.filter((p) => isPastDeadline(p)).length;
  const proximas = planos.filter((p) => p.status === "approved" && p.sessionDate >= TODAY).length;
  const sumulasPendentes = treinosList.filter((t) => t.sumula.status === "draft").length;
  const semPlano = treinosList.filter(treinoSemPlanoAprovado).length;

  if (role === "treinador") {
    return [
      { icon: "calendar", label: "Próximas Aulas", value: proximas },
      { icon: "clipboard", label: "Planos em Rascunho", value: planos.filter((p) => p.status === "draft").length },
      { icon: "alert", label: "Planos Devolvidos", value: ajustes, sub: "Ajustes solicitados", tone: "warning" },
      { icon: "check", label: "Planos Aprovados", value: planos.filter((p) => p.status === "approved").length },
    ];
  }

  if (role === "gestor") {
    const turmas = new Set(treinosList.map((t) => `${t.categoria}-${t.turma}`)).size;
    const treinadores = new Set(treinosList.map((t) => t.coachName)).size;
    const categorias = new Set(treinosList.map((t) => t.categoria)).size;
    return [
      { icon: "network", label: "Turmas Ativas", value: turmas },
      { icon: "clipboard", label: "Treinadores", value: treinadores },
      { icon: "ball", label: "Categorias", value: categorias },
      { icon: "calendar", label: "Planos Fora do Prazo", value: foraDoPrazo, tone: "warning" },
      { icon: "barChart", label: "Executadas sem Plano Aprovado", value: semPlano, tone: "warning" },
    ];
  }

  // head_coach (padrão) — os 6 cards operacionais definidos no briefing.
  return [
    { icon: "alert", label: "Aguardando Aprovação", value: aguardando, to: "/planos/aprovacao" },
    { icon: "edit", label: "Ajustes Solicitados", value: ajustes, to: "/planos/aprovacao", tone: "warning" },
    { icon: "calendar", label: "Fora do Prazo", value: foraDoPrazo, to: "/planos/aprovacao", tone: "warning" },
    { icon: "clipboard", label: "Próximas Aulas", value: proximas },
    { icon: "ball", label: "Súmulas Pendentes", value: sumulasPendentes },
    { icon: "barChart", label: "Executadas sem Plano Aprovado", value: semPlano, tone: "warning" },
  ];
}

const STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "Todos", label: "Todos" },
  { value: "draft", label: "Rascunho" },
  { value: "submitted", label: "Aguardando Aprovação" },
  { value: "changes_requested", label: "Ajustes Solicitados" },
  { value: "approved", label: "Aprovado" },
  { value: "executed", label: "Executado" },
  { value: "cancelled", label: "Cancelado" },
  { value: "fora_do_prazo", label: "Fora do Prazo" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const { role } = user;
  const { planos } = usePlanos();

  // Recorte por escopo do usuário: cada perfil só enxerga os treinos/planos da
  // sua área de atuação (unidade + categorias/turmas; treinador só os próprios).
  const escopedTreinos = useMemo(() => treinos.filter((t) => escopoContem(t, user)), [user]);
  const escopedPlanos = useMemo(() => planos.filter((p) => escopoContem(p, user)), [planos, user]);

  const [dataFilter, setDataFilter] = useState("2026-07-02");
  const [unidadeFilter, setUnidadeFilter] = useState("Todas");
  const [categoriaFilter, setCategoriaFilter] = useState("Todas");
  const [turmaFilter, setTurmaFilter] = useState("Todas");
  const [treinadorFilter, setTreinadorFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  // No mobile os filtros ficam recolhidos por padrão para o conteúdo principal
  // aparecer sem scroll; o badge mostra quantos filtros estão ativos.
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilterCount = [
    unidadeFilter !== "Todas",
    categoriaFilter !== "Todas",
    turmaFilter !== "Todas",
    treinadorFilter !== "Todos",
    statusFilter !== "Todos",
  ].filter(Boolean).length;

  const unidades = useMemo(() => Array.from(new Set(escopedTreinos.map((t) => t.unidade))), [escopedTreinos]);
  const categorias = useMemo(() => Array.from(new Set(escopedTreinos.map((t) => t.categoria))), [escopedTreinos]);
  const turmas = useMemo(() => Array.from(new Set(escopedTreinos.map((t) => t.turma))), [escopedTreinos]);
  const treinadores = useMemo(() => Array.from(new Set(escopedTreinos.map((t) => t.coachName))), [escopedTreinos]);

  const filteredTreinos = useMemo(() => {
    return escopedTreinos.filter((t) => {
      if (dataFilter && t.sessionDate > dataFilter) return false;
      if (unidadeFilter !== "Todas" && t.unidade !== unidadeFilter) return false;
      if (categoriaFilter !== "Todas" && t.categoria !== categoriaFilter) return false;
      if (turmaFilter !== "Todas" && t.turma !== turmaFilter) return false;
      if (treinadorFilter !== "Todos" && t.coachName !== treinadorFilter) return false;
      if (statusFilter === "fora_do_prazo" && !isPastDeadline(t.plano)) return false;
      else if (statusFilter !== "Todos" && statusFilter !== "fora_do_prazo" && t.plano.status !== statusFilter) return false;
      return true;
    });
  }, [escopedTreinos, dataFilter, unidadeFilter, categoriaFilter, turmaFilter, treinadorFilter, statusFilter]);

  if (role === "responsavel") {
    return <ResumoResponsavel />;
  }

  const cards = buildCards(role, escopedPlanos, escopedTreinos);
  const roleTitle =
    role === "gestor"
      ? "Visão geral da operação"
      : role === "treinador"
        ? "Minhas aulas e planos"
        : "Painel central de gestão pedagógica e operacional";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading flex items-center gap-2 text-xl font-semibold text-ink sm:text-2xl">
            <Icon name="trophy" className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
            {roleTitle}
          </h1>
        </div>
        {role === "treinador" && (
          <PrimaryButton onClick={() => navigate("/planos/novo")}>
            <Icon name="plus" className="h-4 w-4" />
            Novo Plano
          </PrimaryButton>
        )}
      </div>

      <Card>
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
          aria-controls="dashboard-filtros"
          className="mb-3 flex w-full items-center justify-between gap-2 text-sm font-medium text-ink sm:hidden"
        >
          <span className="flex items-center gap-2">
            <Icon name="filter" className="h-4 w-4 text-primary" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary-text">
                {activeFilterCount} {activeFilterCount === 1 ? "ativo" : "ativos"}
              </span>
            )}
          </span>
          <Icon name="chevronDown" className={`h-4 w-4 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
        </button>
        <form
          id="dashboard-filtros"
          className={`${filtersOpen ? "grid" : "hidden"} grid-cols-2 gap-3 sm:grid sm:grid-cols-3 lg:grid-cols-6`}
          onSubmit={(e) => e.preventDefault()}
        >
          <label>
            <span className="mb-1 block text-xs font-medium text-ink-muted">Período (até)</span>
            <input type="date" value={dataFilter} onChange={(e) => setDataFilter(e.target.value)} className={inputClass} />
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-ink-muted">Unidade</span>
            <select className={inputClass} value={unidadeFilter} onChange={(e) => setUnidadeFilter(e.target.value)}>
              <option>Todas</option>
              {unidades.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-ink-muted">Categoria</span>
            <select className={inputClass} value={categoriaFilter} onChange={(e) => setCategoriaFilter(e.target.value)}>
              <option>Todas</option>
              {categorias.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-ink-muted">Turma</span>
            <select className={inputClass} value={turmaFilter} onChange={(e) => setTurmaFilter(e.target.value)}>
              <option>Todas</option>
              {turmas.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-ink-muted">Treinador</span>
            <select className={inputClass} value={treinadorFilter} onChange={(e) => setTreinadorFilter(e.target.value)}>
              <option>Todos</option>
              {treinadores.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-medium text-ink-muted">Status</span>
            <select className={inputClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {STATUS_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </form>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {cards.map((m) => (
          <Card
            key={m.label}
            className={m.to ? "cursor-pointer transition-colors hover:border-primary/40" : ""}
          >
            <button
              type="button"
              onClick={m.to ? () => navigate(m.to as string) : undefined}
              disabled={!m.to}
              className="flex w-full items-center gap-2.5 text-left disabled:cursor-default sm:gap-3"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${
                  m.tone === "warning" ? "bg-warning/15 text-warning" : "bg-primary/15 text-primary"
                }`}
              >
                <Icon name={m.icon} className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink-muted">{m.label}</p>
                {/* Mobile: valor empilhado sob o rótulo (card estreito de 2 col). */}
                <p className="text-2xl font-semibold text-ink sm:hidden">{m.value}</p>
                {m.sub && <p className="text-sm text-ink-muted">{m.sub}</p>}
              </div>
              {/* Desktop/tablet: valor grande à direita — preenche o card e vira KPI tile. */}
              <p className="hidden shrink-0 text-3xl font-semibold text-ink sm:block">{m.value}</p>
            </button>
          </Card>
        ))}
        {role === "gestor" && (
          <Card className="col-span-2 cursor-pointer transition-colors hover:border-primary/40 sm:col-span-1">
            <button type="button" onClick={() => navigate("/configuracoes")} className="flex w-full items-center gap-2.5 text-left sm:gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-muted sm:h-10 sm:w-10">
                <Icon name="menu" className="h-5 w-5" />
              </span>
              <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-muted">Administração</p>
                  <p className="text-base font-semibold text-ink">Gestão de Acessos</p>
                </div>
                <Icon name="arrowRight" className="h-4 w-4 shrink-0 text-ink-muted" />
              </div>
            </button>
          </Card>
        )}
      </div>

      <Card title="Indicadores Pedagógicos" icon={<Icon name="alert" className="h-4 w-4 text-warning" />}>
        <p className="text-sm text-ink-muted">
          Indicadores pedagógicos e metodologia de conformidade pendentes de validação.
        </p>
      </Card>

      <Card title="Últimos Treinos" icon={<Icon name="calendar" className="h-4 w-4" />} className="p-0 sm:p-0">
        {/* Mobile (<640px): tabela min-w-[640px] nunca cabe na viewport — em vez de
            depender só de overflow-x-auto (que o Chrome mobile pode "encadear" para
            um arraste horizontal da página inteira), a tabela some e vira lista de
            cards, eliminando a causa raiz do overflow nessa faixa de largura. */}
        <div className="flex flex-col gap-2 p-3 sm:hidden">
          {filteredTreinos.map((t) => (
            <div
              key={t.id}
              data-testid="treino-card"
              onClick={() => navigate(`/treinos/${t.id}`)}
              tabIndex={0}
              role="link"
              aria-label={`Ver detalhes do treino de ${formatDate(t.sessionDate)}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/treinos/${t.id}`);
                }
              }}
              className="cursor-pointer rounded-xl border border-line-soft bg-surface-2 p-3 outline-none hover:border-primary/40 focus-visible:bg-primary/10"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{formatDate(t.sessionDate)}</p>
                <Icon name="arrowRight" className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                {t.categoria} · {t.turma}
              </p>
              <p className="text-sm text-ink-muted">{t.coachName}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <StatusBadge status={t.plano.status} />
                {treinoSemPlanoAprovado(t) && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary-text">
                    Sem plano aprovado
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tablet/desktop (≥640px): tabela completa, com scroll horizontal contido
            (overscroll-x-contain) para não propagar o gesto pra página. */}
        <div className="hidden overflow-x-auto overscroll-x-contain sm:block">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                <th scope="col" className="px-4 py-3">Data</th>
                <th scope="col" className="px-4 py-3">Turma</th>
                <th scope="col" className="px-4 py-3">Treinador</th>
                <th scope="col" className="px-4 py-3">Status</th>
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
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/treinos/${t.id}`);
                    }
                  }}
                  className={`group cursor-pointer border-b border-line-soft last:border-0 outline-none hover:bg-primary/5 focus-visible:bg-primary/10 ${
                    i % 2 === 1 ? "bg-surface-2/40" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-ink">{formatDate(t.sessionDate)}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    {t.categoria} · {t.turma}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{t.coachName}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <StatusBadge status={t.plano.status} />
                      {treinoSemPlanoAprovado(t) && (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary-text">
                          Sem plano aprovado
                        </span>
                      )}
                    </div>
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
        {filteredTreinos.length === 0 && (
          <p className="p-4 text-sm text-ink-muted">Nenhum treino encontrado com os filtros atuais.</p>
        )}
      </Card>
    </div>
  );
}

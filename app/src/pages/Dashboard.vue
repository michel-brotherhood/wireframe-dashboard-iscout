<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { treinos, isPastDeadline, todayDateString } from "../data/mockData";
import { Card, StatusBadge, PrimaryButton, inputClass } from "../components/ui";
import Icon from "../components/Icon.vue";
import { planosStore } from "../stores/planos";
import { session } from "../stores/session";
import { escopoContem } from "../data/users";
import ResumoResponsavel from "./ResumoResponsavel.vue";

const TODAY = todayDateString();

function formatDate(iso) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function treinoSemPlanoAprovado(t) {
  return Boolean(t.executionLog) && t.plano.status !== "approved" && t.plano.status !== "executed";
}

function buildCards(role, planos, treinosList) {
  const aguardando = planos.filter((p) => p.status === "submitted").length;
  const ajustes = planos.filter((p) => p.status === "changes_requested").length;
  const foraDoPrazo = planos.filter((p) => isPastDeadline(p)).length;
  const proximas = planos.filter((p) => p.status === "approved" && p.sessionDate >= TODAY).length;
  const sumulasPendentes = treinosList.filter((t) => t.sumula.status === "draft").length;
  const semPlano = treinosList.filter(treinoSemPlanoAprovado).length;

  if (role === "treinador") {
    return [
      { icon: "calendar", label: "Próximas Aulas", value: proximas },
      { icon: "stamp", label: "Aguardando Aprovação", value: aguardando, sub: "Submetidos ao Head Coach" },
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

const STATUS_FILTER_OPTIONS = [
  { value: "Todos", label: "Todos" },
  { value: "draft", label: "Rascunho" },
  { value: "submitted", label: "Aguardando Aprovação" },
  { value: "changes_requested", label: "Ajustes Solicitados" },
  { value: "approved", label: "Aprovado" },
  { value: "executed", label: "Executado" },
  { value: "cancelled", label: "Cancelado" },
  { value: "fora_do_prazo", label: "Fora do Prazo" },
];

const router = useRouter();
function navigate(to) {
  router.push(to);
}

const role = computed(() => session.user.role);

// Recorte por escopo do usuário: cada perfil só enxerga os treinos/planos da
// sua área de atuação (unidade + categorias/turmas; treinador só os próprios).
const escopedTreinos = computed(() => treinos.filter((t) => escopoContem(t, session.user)));
const escopedPlanos = computed(() => planosStore.planos.filter((p) => escopoContem(p, session.user)));

const dataFilter = ref("2026-07-02");
const unidadeFilter = ref("Todas");
const categoriaFilter = ref("Todas");
const turmaFilter = ref("Todas");
const treinadorFilter = ref("Todos");
const statusFilter = ref("Todos");
// No mobile os filtros ficam recolhidos por padrão para o conteúdo principal
// aparecer sem scroll; o badge mostra quantos filtros estão ativos.
const filtersOpen = ref(false);
const activeFilterCount = computed(() =>
  [
    unidadeFilter.value !== "Todas",
    categoriaFilter.value !== "Todas",
    turmaFilter.value !== "Todas",
    treinadorFilter.value !== "Todos",
    statusFilter.value !== "Todos",
  ].filter(Boolean).length,
);

const unidades = computed(() => Array.from(new Set(escopedTreinos.value.map((t) => t.unidade))));
const categorias = computed(() => Array.from(new Set(escopedTreinos.value.map((t) => t.categoria))));
const turmas = computed(() => Array.from(new Set(escopedTreinos.value.map((t) => t.turma))));
const treinadores = computed(() => Array.from(new Set(escopedTreinos.value.map((t) => t.coachName))));

const filteredTreinos = computed(() =>
  escopedTreinos.value.filter((t) => {
    if (dataFilter.value && t.sessionDate > dataFilter.value) return false;
    if (unidadeFilter.value !== "Todas" && t.unidade !== unidadeFilter.value) return false;
    if (categoriaFilter.value !== "Todas" && t.categoria !== categoriaFilter.value) return false;
    if (turmaFilter.value !== "Todas" && t.turma !== turmaFilter.value) return false;
    if (treinadorFilter.value !== "Todos" && t.coachName !== treinadorFilter.value) return false;
    if (statusFilter.value === "fora_do_prazo" && !isPastDeadline(t.plano)) return false;
    else if (statusFilter.value !== "Todos" && statusFilter.value !== "fora_do_prazo" && t.plano.status !== statusFilter.value)
      return false;
    return true;
  }),
);

const cards = computed(() => buildCards(role.value, escopedPlanos.value, escopedTreinos.value));
const rascunhos = computed(() => escopedPlanos.value.filter((p) => p.status === "draft"));
const roleTitle = computed(() =>
  role.value === "gestor"
    ? "Visão geral da operação"
    : role.value === "treinador"
      ? "Minhas aulas e planos"
      : "Painel central de gestão pedagógica e operacional",
);

function onTreinoKey(e, id) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    navigate(`/treinos/${id}`);
  }
}
</script>

<template>
  <ResumoResponsavel v-if="role === 'responsavel'" />
  <div v-else class="flex flex-col gap-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="font-heading flex items-center gap-2 text-xl font-semibold text-ink sm:text-2xl">
          <Icon name="trophy" class="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
          {{ roleTitle }}
        </h1>
      </div>
      <PrimaryButton v-if="role === 'treinador'" @click="navigate('/planos/novo')">
        <Icon name="plus" class="h-4 w-4" />
        Novo Plano
      </PrimaryButton>
    </div>

    <Card>
      <button
        type="button"
        @click="filtersOpen = !filtersOpen"
        :aria-expanded="filtersOpen"
        aria-controls="dashboard-filtros"
        class="mb-3 flex w-full items-center justify-between gap-2 text-sm font-medium text-ink sm:hidden"
      >
        <span class="flex items-center gap-2">
          <Icon name="filter" class="h-4 w-4 text-primary" />
          Filtros
          <span
            v-if="activeFilterCount > 0"
            class="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary-text"
          >
            {{ activeFilterCount }} {{ activeFilterCount === 1 ? "ativo" : "ativos" }}
          </span>
        </span>
        <Icon name="chevronDown" :class="`h-4 w-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`" />
      </button>
      <form
        id="dashboard-filtros"
        :class="`${filtersOpen ? 'grid' : 'hidden'} grid-cols-2 gap-3 sm:grid sm:grid-cols-3 lg:grid-cols-6`"
        @submit.prevent
      >
        <label>
          <span class="mb-1 block text-xs font-medium text-ink-muted">Período (até)</span>
          <input type="date" v-model="dataFilter" :class="inputClass" />
        </label>
        <label>
          <span class="mb-1 block text-xs font-medium text-ink-muted">Unidade</span>
          <select :class="inputClass" v-model="unidadeFilter">
            <option>Todas</option>
            <option v-for="u in unidades" :key="u">{{ u }}</option>
          </select>
        </label>
        <label>
          <span class="mb-1 block text-xs font-medium text-ink-muted">Categoria</span>
          <select :class="inputClass" v-model="categoriaFilter">
            <option>Todas</option>
            <option v-for="c in categorias" :key="c">{{ c }}</option>
          </select>
        </label>
        <label>
          <span class="mb-1 block text-xs font-medium text-ink-muted">Turma</span>
          <select :class="inputClass" v-model="turmaFilter">
            <option>Todas</option>
            <option v-for="t in turmas" :key="t">{{ t }}</option>
          </select>
        </label>
        <label>
          <span class="mb-1 block text-xs font-medium text-ink-muted">Treinador</span>
          <select :class="inputClass" v-model="treinadorFilter">
            <option>Todos</option>
            <option v-for="c in treinadores" :key="c">{{ c }}</option>
          </select>
        </label>
        <label>
          <span class="mb-1 block text-xs font-medium text-ink-muted">Status</span>
          <select :class="inputClass" v-model="statusFilter">
            <option v-for="o in STATUS_FILTER_OPTIONS" :key="o.value" :value="o.value">
              {{ o.label }}
            </option>
          </select>
        </label>
      </form>
    </Card>

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      <Card
        v-for="m in cards"
        :key="m.label"
        :class="m.to ? 'cursor-pointer transition-colors hover:border-primary/40' : ''"
      >
        <button
          type="button"
          @click="m.to ? navigate(m.to) : undefined"
          :disabled="!m.to"
          class="flex w-full items-center gap-2.5 text-left disabled:cursor-default sm:gap-3"
        >
          <span
            :class="`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${
              m.tone === 'warning' ? 'bg-warning/15 text-warning' : 'bg-primary/15 text-primary'
            }`"
          >
            <Icon :name="m.icon" class="h-5 w-5" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-ink-muted">{{ m.label }}</p>
            <!-- Mobile: valor empilhado sob o rótulo (card estreito de 2 col). -->
            <p class="text-2xl font-semibold text-ink sm:hidden">{{ m.value }}</p>
            <p v-if="m.sub" class="text-sm text-ink-muted">{{ m.sub }}</p>
          </div>
          <!-- Desktop/tablet: valor grande à direita — preenche o card e vira KPI tile. -->
          <p class="hidden shrink-0 text-3xl font-semibold text-ink sm:block">{{ m.value }}</p>
        </button>
      </Card>
      <Card
        v-if="role === 'gestor'"
        class="col-span-2 cursor-pointer transition-colors hover:border-primary/40 sm:col-span-1"
      >
        <button
          type="button"
          @click="navigate('/configuracoes')"
          class="flex w-full items-center gap-2.5 text-left sm:gap-3"
        >
          <span
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-muted sm:h-10 sm:w-10"
          >
            <Icon name="menu" class="h-5 w-5" />
          </span>
          <div class="flex min-w-0 flex-1 items-center justify-between gap-2">
            <div class="min-w-0">
              <p class="text-sm font-medium text-ink-muted">Administração</p>
              <p class="text-base font-semibold text-ink">Gestão de Acessos</p>
            </div>
            <Icon name="arrowRight" class="h-4 w-4 shrink-0 text-ink-muted" />
          </div>
        </button>
      </Card>
    </div>

    <Card v-if="role === 'treinador' && rascunhos.length > 0" :title="`Meus Rascunhos (${rascunhos.length})`">
      <template #icon><Icon name="clipboard" class="h-4 w-4" /></template>
      <ul class="flex flex-col gap-2">
        <li v-for="p in rascunhos" :key="p.id">
          <button
            type="button"
            @click="navigate(`/planos/novo?draft=${p.id}`)"
            class="flex w-full items-center gap-3 rounded-xl border border-line-soft bg-surface-2 p-3 text-left transition-colors hover:border-primary/40"
          >
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Icon name="edit" class="h-4 w-4" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-sm font-semibold text-ink">
                {{ formatDate(p.sessionDate) }} · {{ p.categoria }} · {{ p.turma }}
              </span>
              <span class="block truncate text-xs text-ink-muted">
                {{ p.tema }} · {{ p.subtema }}
              </span>
            </span>
            <span class="flex shrink-0 items-center gap-1 text-xs font-medium text-primary-text">
              Continuar <Icon name="arrowRight" class="h-3.5 w-3.5" />
            </span>
          </button>
        </li>
      </ul>
    </Card>

    <Card title="Indicadores Pedagógicos">
      <template #icon><Icon name="alert" class="h-4 w-4 text-warning" /></template>
      <p class="text-sm text-ink-muted">
        Indicadores pedagógicos e metodologia de conformidade pendentes de validação.
      </p>
    </Card>

    <Card title="Últimos Treinos" class="p-0 sm:p-0">
      <template #icon><Icon name="calendar" class="h-4 w-4" /></template>
      <!-- Mobile (<640px): tabela min-w-[640px] nunca cabe na viewport — em vez de
            depender só de overflow-x-auto (que o Chrome mobile pode "encadear" para
            um arraste horizontal da página inteira), a tabela some e vira lista de
            cards, eliminando a causa raiz do overflow nessa faixa de largura. -->
      <div class="flex flex-col gap-2 p-3 sm:hidden">
        <div
          v-for="t in filteredTreinos"
          :key="t.id"
          data-testid="treino-card"
          @click="navigate(`/treinos/${t.id}`)"
          tabindex="0"
          role="link"
          :aria-label="`Ver detalhes do treino de ${formatDate(t.sessionDate)}`"
          @keydown="onTreinoKey($event, t.id)"
          class="cursor-pointer rounded-xl border border-line-soft bg-surface-2 p-3 outline-none hover:border-primary/40 focus-visible:bg-primary/10"
        >
          <div class="flex items-center justify-between gap-2">
            <p class="text-sm font-semibold text-ink">{{ formatDate(t.sessionDate) }}</p>
            <Icon name="arrowRight" class="h-3.5 w-3.5 shrink-0 text-ink-muted" />
          </div>
          <p class="mt-1 text-sm text-ink-muted">
            {{ t.categoria }} · {{ t.turma }}
          </p>
          <p class="text-sm text-ink-muted">{{ t.coachName }}</p>
          <div class="mt-2 flex flex-wrap items-center gap-1.5">
            <StatusBadge :status="t.plano.status" />
            <span
              v-if="treinoSemPlanoAprovado(t)"
              class="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary-text"
            >
              Sem plano aprovado
            </span>
          </div>
        </div>
      </div>

      <!-- Tablet/desktop (≥640px): tabela completa, com scroll horizontal contido
            (overscroll-x-contain) para não propagar o gesto pra página. -->
      <div class="hidden overflow-x-auto overscroll-x-contain sm:block">
        <table class="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr class="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
              <th scope="col" class="px-4 py-3">Data</th>
              <th scope="col" class="px-4 py-3">Turma</th>
              <th scope="col" class="px-4 py-3">Treinador</th>
              <th scope="col" class="px-4 py-3">Status</th>
              <th scope="col" class="px-4 py-3 sr-only">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(t, i) in filteredTreinos"
              :key="t.id"
              @click="navigate(`/treinos/${t.id}`)"
              tabindex="0"
              role="link"
              :aria-label="`Ver detalhes do treino de ${formatDate(t.sessionDate)}`"
              @keydown="onTreinoKey($event, t.id)"
              :class="`group cursor-pointer border-b border-line-soft last:border-0 outline-none hover:bg-primary/5 focus-visible:bg-primary/10 ${
                i % 2 === 1 ? 'bg-surface-2/40' : ''
              }`"
            >
              <td class="px-4 py-3 font-medium text-ink">{{ formatDate(t.sessionDate) }}</td>
              <td class="px-4 py-3 text-ink-muted">
                {{ t.categoria }} · {{ t.turma }}
              </td>
              <td class="px-4 py-3 text-ink-muted">{{ t.coachName }}</td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap items-center gap-1.5">
                  <StatusBadge :status="t.plano.status" />
                  <span
                    v-if="treinoSemPlanoAprovado(t)"
                    class="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary-text"
                  >
                    Sem plano aprovado
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-right">
                <span
                  class="inline-flex items-center gap-1 text-xs font-medium text-primary-text opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  Ver Detalhes <Icon name="arrowRight" class="h-3.5 w-3.5" />
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="filteredTreinos.length === 0" class="p-4 text-sm text-ink-muted">
        Nenhum treino encontrado com os filtros atuais.
      </p>
    </Card>
  </div>
</template>

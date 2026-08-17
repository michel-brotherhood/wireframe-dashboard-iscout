<script>
// Sequência de ids para planos novos submetidos (persistente entre navegações).
let novoPlanoSeq = 1;
</script>

<script setup>
import { ref, computed, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  Card,
  CheckboxGroup,
  Field,
  IntervaloFlow,
  PrimaryButton,
  RadioGroup,
  inputClass,
  inputErrorClass,
} from "../components/ui";
import Icon from "../components/Icon.vue";
import { planosStore, addPlano, saveDraft, updatePlano, findPlano, planosReutilizaveis, sugestaoBase } from "../stores/planos";
import { usersStore } from "../stores/users";
import { session } from "../stores/session";
import { calcDeadline, defaultSessionDateTime, diaDaSemana, FASE_TEMAS, getNow, prazoLabel } from "../data/mockData";
import { CATEGORIAS, MATERIAIS, OBJETIVOS, ORIENTACOES } from "../data/planoOptions";
import EstacaoForm from "./_EstacaoForm.vue";
import DiagramUpload from "./_DiagramUpload.vue";

const TABS = ["1. Inicial", "2. Fundamentação", "3. Principal", "4. Observações"];
const TIPOS_EXERCICIO = ["Analítico", "Global", "Situacional"];

// Após um erro de validação, leva o foco ao primeiro campo destacado (borda
// de erro) — sem isso, quem navega por teclado/leitor de tela não sabe para
// onde ir depois da mensagem de status.
function focusFirstError() {
  nextTick(() => {
    const el = document.querySelector(".border-primary-text");
    if (el && typeof el.focus === "function") el.focus();
  });
}

// Navegação por seta entre as abas (padrão ARIA tabs: roving tabindex).
function focusTab(i) {
  nextTick(() => document.getElementById(`plano-tab-${i}`)?.focus());
}
function onTabsKeydown(e) {
  const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
  if (!keys.includes(e.key)) return;
  e.preventDefault();
  let next = tab.value;
  if (e.key === "ArrowRight") next = (tab.value + 1) % TABS.length;
  else if (e.key === "ArrowLeft") next = (tab.value - 1 + TABS.length) % TABS.length;
  else if (e.key === "Home") next = 0;
  else if (e.key === "End") next = TABS.length - 1;
  tab.value = next;
  focusTab(next);
}

// Treinador Responsável = quem tem turma própria (coachName) — independe do
// papel (coach/admin): um admin com turma própria (ex.: Gerson) também entra.
const coachOptions = computed(() => Array.from(new Set(usersStore.users.filter((u) => u.coachName).map((u) => u.coachName))));
const PERIODOS = ["Manhã", "Tarde", "Noite"];
const SEMANAS = ["Semana 1", "Semana 2", "Semana 3", "Semana 4"];
const FASES = Object.keys(FASE_TEMAS);
const TURMAS = ["Turma A", "Turma B"];

function formatDateTime(iso) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} às ${String(
    d.getHours(),
  ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const router = useRouter();
const route = useRoute();

// Três modos de abrir o editor:
//  ?draft=<id>  → edita o plano em questão no lugar (rascunho ou devolvido)
//  ?base=<id>   → cria um plano NOVO já preenchido a partir de outro (duplicar)
//  (sem query)  → plano novo em branco
const editingId = computed(() => (typeof route.query.draft === "string" ? route.query.draft : null));
const baseId = typeof route.query.base === "string" ? route.query.base : null;
const draft = computed(() => (editingId.value ? planosStore.planos.find((p) => p.id === editingId.value) : undefined));
// Duplicar = plano novo, sem editar o original.
const duplicando = !editingId.value && !!baseId;
const modoNovoEmBranco = !editingId.value && !baseId;
// Fonte de pré-preenchimento (edição no lugar ou duplicação).
const initialDraft = editingId.value ? draft.value : baseId ? findPlano(baseId) : undefined;

function formatDate(iso) {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

// Plano devolvido pela coordenação sendo corrigido — mostra o comentário.
const devolvido = computed(() =>
  editingId.value && draft.value?.status === "changes_requested" ? draft.value : null,
);

const titulo = computed(() => {
  if (devolvido.value) return "Corrigir Plano Devolvido";
  if (editingId.value) return "Editar Rascunho de Plano";
  if (duplicando) return "Novo Plano (a partir de um anterior)";
  return "Criar Novo Plano de Aula";
});

const tab = ref(0);
const status = ref(null);
const statusIsError = ref(false);
const justSubmitted = ref(false);
const errors = ref({});

const defaultSession = defaultSessionDateTime();
// Ao duplicar, a data/horário começam no padrão futuro (não herdam a data
// antiga do plano-base); ao editar no lugar, herdam do próprio plano.
const data = ref(duplicando ? defaultSession.date : initialDraft?.sessionDate ?? defaultSession.date);
const horario = ref(duplicando ? defaultSession.time : initialDraft?.horario ?? defaultSession.time);
const unidade = ref(initialDraft?.unidade ?? "Atibaia");
const periodo = ref(initialDraft?.periodo ?? "Tarde");
const semana = ref(initialDraft?.semana ?? "Semana 1");
const categoria = ref(initialDraft?.categoria ?? "Sub-15");
const turma = ref(initialDraft?.turma ?? "Turma A");
const coachName = ref(initialDraft?.coachName ?? session.user?.coachName ?? coachOptions.value[0]);
const team = ref(initialDraft?.team ?? "Amarelo");
const fase = ref(initialDraft?.fase ?? FASES[0]);
const tema = ref(initialDraft?.tema ?? FASE_TEMAS[FASES[0]][0].tema);
const subtema = ref(initialDraft?.subtema ?? FASE_TEMAS[FASES[0]][0].subtemas[0]);

const inicialObjetivo = ref(initialDraft?.etapaInicial.objetivo ?? "Refinamento do gesto motor");
const estacao1 = ref(
  initialDraft?.etapaInicial.estacao1 ?? {
    nome: "Aquecimento Lúdico com Bola",
    tipo: "Com bola",
    descricao: "Jogos lúdicos de ativação com bola, foco em coordenação óculo-pedal.",
    duracaoMin: 5,
    materiais: "Bolas, Coletes",
  },
);
const estacao2 = ref(
  initialDraft?.etapaInicial.estacao2 ?? {
    nome: "Circuito Recreativo Sem Bola",
    tipo: "Recreativo",
    descricao: "Circuito de agilidade e coordenação motora sem bola.",
    duracaoMin: 5,
    materiais: "Cones, Escada de agilidade",
  },
);

const fundObjetivo = ref(initialDraft?.etapaFundamentacao.objetivo ?? "Função no modelo de jogo");
const fundDuracao = ref(initialDraft?.etapaFundamentacao.duracaoMin ?? 15);
const fundTipo = ref(initialDraft?.etapaFundamentacao.tipo ?? "Analítico");

const principalObjetivo = ref(initialDraft?.etapaPrincipal.objetivo ?? "Função no modelo de jogo");
const principalDuracao = ref(initialDraft?.etapaPrincipal.duracaoMin ?? 35);
const subTemas = ref(initialDraft?.etapaPrincipal.subTemas ?? FASE_TEMAS[FASES[0]][0].subtemas.slice(0, 2));
const orientacoes = ref(initialDraft?.etapaPrincipal.orientacoes ?? ["Jogo Posicional", "Respeito aos Setores"]);
const hidratacao = ref(initialDraft?.etapaPrincipal.intervalo.hidratacaoMin ?? 5);
const repouso = ref(initialDraft?.etapaPrincipal.intervalo.repousoMin ?? 2);
const instruir = ref(initialDraft?.etapaPrincipal.intervalo.instruirMin ?? 3);
const ativar = ref(initialDraft?.etapaPrincipal.intervalo.ativarMin ?? 2);

const observacoes = ref(
  initialDraft?.observacoes ??
    "Treino focado em passe curto e posicionamento\nAtenção especial ao intervalo para hidratação",
);

const inicialDuracao = computed(() => estacao1.value.duracaoMin + estacao2.value.duracaoMin);
const total = computed(() => inicialDuracao.value + fundDuracao.value + principalDuracao.value);

const temaOptions = computed(() => FASE_TEMAS[fase.value]);
const subtemaOptions = computed(() => temaOptions.value.find((t) => t.tema === tema.value)?.subtemas ?? []);

const deadline = computed(() => (data.value && horario.value ? calcDeadline(data.value, horario.value) : null));
const prazo = computed(() => (deadline.value ? prazoLabel(deadline.value) : null));

function handleFaseChange(newFase) {
  fase.value = newFase;
  const first = FASE_TEMAS[newFase][0];
  tema.value = first.tema;
  subtema.value = first.subtemas[0];
  // Sub-temas da Aba 3 dependem do tema — limpa para evitar seleção órfã.
  subTemas.value = [];
}

function handleTemaChange(newTema) {
  tema.value = newTema;
  const subtemas = temaOptions.value.find((t) => t.tema === newTema)?.subtemas ?? [];
  subtema.value = subtemas[0] ?? "";
  subTemas.value = [];
}

// --- "Começar mais rápido": reaproveitar um plano anterior (só em plano novo
// em branco). `sugestao` é o plano reutilizável mais recente da mesma
// categoria/turma escolhida; a lista completa fica no seletor.
const mostrarBaseUI = ref(false);
const baseAplicadoLabel = ref(null);
const reutilizaveis = computed(() => planosReutilizaveis(session.user));
const sugestao = computed(() =>
  modoNovoEmBranco ? sugestaoBase(session.user, categoria.value, turma.value) : null,
);

function aplicarBase(src) {
  if (!src) return;
  periodo.value = src.periodo;
  semana.value = src.semana;
  categoria.value = src.categoria;
  turma.value = src.turma;
  coachName.value = src.coachName;
  team.value = src.team;
  fase.value = src.fase;
  tema.value = src.tema;
  subtema.value = src.subtema;
  inicialObjetivo.value = src.etapaInicial.objetivo;
  estacao1.value = { ...src.etapaInicial.estacao1 };
  estacao2.value = { ...src.etapaInicial.estacao2 };
  fundObjetivo.value = src.etapaFundamentacao.objetivo;
  fundDuracao.value = src.etapaFundamentacao.duracaoMin;
  fundTipo.value = src.etapaFundamentacao.tipo;
  principalObjetivo.value = src.etapaPrincipal.objetivo;
  principalDuracao.value = src.etapaPrincipal.duracaoMin;
  subTemas.value = [...src.etapaPrincipal.subTemas];
  orientacoes.value = [...src.etapaPrincipal.orientacoes];
  hidratacao.value = src.etapaPrincipal.intervalo.hidratacaoMin;
  repouso.value = src.etapaPrincipal.intervalo.repousoMin;
  instruir.value = src.etapaPrincipal.intervalo.instruirMin;
  ativar.value = src.etapaPrincipal.intervalo.ativarMin;
  observacoes.value = src.observacoes;
  errors.value = {};
  baseAplicadoLabel.value = `${formatDate(src.sessionDate)} · ${src.categoria} · ${src.turma}`;
  mostrarBaseUI.value = false;
  statusIsError.value = false;
  status.value = `Campos preenchidos a partir do plano de ${baseAplicadoLabel.value}. Ajuste a data e o que precisar.`;
}

function clearError(field) {
  if (!(field in errors.value)) return;
  const next = { ...errors.value };
  delete next[field];
  errors.value = next;
}

function validateHeader() {
  const e = {};
  if (!data.value) e.data = "Informe a data da sessão.";
  if (!horario.value) e.horario = "Informe o horário da sessão.";
  if (data.value && horario.value) {
    const dl = calcDeadline(data.value, horario.value);
    if (new Date(dl).getTime() < getNow().getTime()) {
      e.data = `Prazo de 24h já vencido para esse horário — prazo limite seria ${formatDateTime(dl)}.`;
    }
  }
  return e;
}

function validateTab(idx) {
  const e = {};
  if (idx === 0) {
    if (!inicialObjetivo.value.trim()) e.inicialObjetivo = "Objetivo é obrigatório.";
    if (!estacao1.value.nome.trim()) e.estacao1Nome = "Nome da Estação 1 é obrigatório.";
    if (!estacao1.value.duracaoMin || estacao1.value.duracaoMin <= 0)
      e.estacao1Duracao = "Duração da Estação 1 deve ser maior que 0.";
    if (!estacao2.value.nome.trim()) e.estacao2Nome = "Nome da Estação 2 é obrigatório.";
    if (!estacao2.value.duracaoMin || estacao2.value.duracaoMin <= 0)
      e.estacao2Duracao = "Duração da Estação 2 deve ser maior que 0.";
  }
  if (idx === 1) {
    if (!fundObjetivo.value.trim()) e.fundObjetivo = "Objetivo é obrigatório.";
    if (!fundDuracao.value || fundDuracao.value <= 0) e.fundDuracao = "Duração deve ser maior que 0.";
  }
  if (idx === 2) {
    if (!principalObjetivo.value.trim()) e.principalObjetivo = "Objetivo é obrigatório.";
    if (!principalDuracao.value || principalDuracao.value <= 0) e.principalDuracao = "Duração deve ser maior que 0.";
  }
  return e;
}

function goToNext(nextTab) {
  const tabErrors = validateTab(tab.value);
  if (Object.keys(tabErrors).length > 0) {
    errors.value = { ...errors.value, ...tabErrors };
    focusFirstError();
    return;
  }
  tab.value = nextTab;
}

function buildPlano(statusValue, id) {
  return {
    id,
    sessionDate: data.value,
    horario: horario.value,
    unidade: unidade.value,
    periodo: periodo.value,
    semana: semana.value,
    categoria: categoria.value,
    turma: turma.value,
    team: team.value,
    coachName: coachName.value,
    fase: fase.value,
    tema: tema.value,
    subtema: subtema.value,
    status: statusValue,
    deadlineAt: calcDeadline(data.value, horario.value),
    etapaInicial: { objetivo: inicialObjetivo.value, duracaoMin: inicialDuracao.value, estacao1: estacao1.value, estacao2: estacao2.value },
    etapaFundamentacao: { objetivo: fundObjetivo.value, duracaoMin: fundDuracao.value, tipo: fundTipo.value },
    etapaPrincipal: {
      objetivo: principalObjetivo.value,
      duracaoMin: principalDuracao.value,
      subTemas: subTemas.value,
      orientacoes: orientacoes.value,
      intervalo: { hidratacaoMin: hidratacao.value, repousoMin: repouso.value, instruirMin: instruir.value, ativarMin: ativar.value },
    },
    observacoes: observacoes.value,
    createdAt: draft.value?.createdAt ?? new Date().toISOString(),
  };
}

function handleSaveDraft() {
  const id = editingId.value ?? `plan-draft-${crypto.randomUUID()}`;
  saveDraft(buildPlano("draft", id));
  statusIsError.value = false;
  justSubmitted.value = false;
  status.value = 'Rascunho salvo. Reabra depois em "Meus Rascunhos" no dashboard.';
  // Passa a editar esse rascunho, para que salvamentos seguintes o atualizem.
  if (!editingId.value) router.replace(`/planos/novo?draft=${id}`);
}

function handleSubmit() {
  const allErrors = { ...validateHeader(), ...validateTab(0), ...validateTab(1), ...validateTab(2) };
  if (Object.keys(allErrors).length > 0) {
    errors.value = allErrors;
    const firstInvalidTab = [0, 1, 2].find((i) => Object.keys(validateTab(i)).length > 0);
    if (allErrors.data || allErrors.horario) {
      tab.value = 0;
    } else if (firstInvalidTab !== undefined) {
      tab.value = firstInvalidTab;
    }
    statusIsError.value = true;
    justSubmitted.value = false;
    status.value = "Corrija os campos obrigatórios destacados antes de submeter.";
    focusFirstError();
    return;
  }
  if (total.value < 30 || total.value > 120) {
    statusIsError.value = true;
    justSubmitted.value = false;
    status.value = "Duração total precisa ficar entre 30 e 120 minutos antes de submeter.";
    return;
  }

  const id = editingId.value ?? `plan-novo-${novoPlanoSeq++}`;
  const novoPlano = buildPlano("submitted", id);
  if (editingId.value) updatePlano(novoPlano);
  else addPlano(novoPlano);

  statusIsError.value = false;
  justSubmitted.value = true;
  status.value = "Plano submetido para aprovação.";
}

function onEstacao1Patch(patch) {
  estacao1.value = { ...estacao1.value, ...patch };
  clearError("estacao1Nome");
  clearError("estacao1Duracao");
}
function onEstacao2Patch(patch) {
  estacao2.value = { ...estacao2.value, ...patch };
  clearError("estacao2Nome");
  clearError("estacao2Duracao");
}

function onInicialObjetivo(v) {
  inicialObjetivo.value = v;
  clearError("inicialObjetivo");
}
function onFundObjetivo(v) {
  fundObjetivo.value = v;
  clearError("fundObjetivo");
}
function onPrincipalObjetivo(v) {
  principalObjetivo.value = v;
  clearError("principalObjetivo");
}

function onDataInput(e) {
  data.value = e.target.value;
  clearError("data");
}
function onHorarioInput(e) {
  horario.value = e.target.value;
  clearError("horario");
}
function onFundDuracaoInput(e) {
  fundDuracao.value = Number(e.target.value);
  clearError("fundDuracao");
}
function onPrincipalDuracaoInput(e) {
  principalDuracao.value = Number(e.target.value);
  clearError("principalDuracao");
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="font-heading text-xl font-semibold text-ink sm:text-2xl">
        {{ titulo }}
      </h1>
      <router-link
        to="/planos"
        class="flex items-center gap-1.5 text-sm font-medium text-primary-text hover:underline"
      >
        <Icon name="clipboard" class="h-4 w-4" /> Meus planos
      </router-link>
    </div>

    <!-- Plano devolvido pela coordenação: mostra o que ajustar antes de reenviar. -->
    <div
      v-if="devolvido"
      class="flex items-start gap-2.5 rounded-2xl border border-warning/40 bg-warning/10 p-4"
    >
      <Icon name="alert" class="mt-0.5 h-5 w-5 shrink-0 text-warning" />
      <div class="min-w-0 text-sm">
        <p class="font-semibold text-warning">Ajustes solicitados pela coordenação</p>
        <p class="mt-0.5 text-ink">{{ devolvido.reviewComment }}</p>
        <p v-if="devolvido.reviewedBy" class="mt-1 text-xs text-ink-muted">
          {{ devolvido.reviewedBy }}{{ devolvido.reviewedAt ? ` · ${formatDateTime(devolvido.reviewedAt)}` : "" }} ·
          corrija e submeta novamente.
        </p>
      </div>
    </div>

    <!-- Começar mais rápido: reaproveitar um plano anterior (só em plano novo). -->
    <Card v-if="modoNovoEmBranco" title="Começar mais rápido">
      <template #icon><Icon name="clipboard" class="h-4 w-4" /></template>
      <p v-if="baseAplicadoLabel" class="flex items-center gap-1.5 text-sm text-secondary">
        <Icon name="check" class="h-4 w-4" /> Preenchido a partir do plano de {{ baseAplicadoLabel }}.
      </p>
      <template v-else>
        <div
          v-if="sugestao"
          class="flex flex-col gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <p class="text-sm text-ink-muted">
            <Icon name="bot" class="mr-1 inline h-4 w-4 text-primary" />
            Encontramos um plano recente de <span class="font-medium text-ink">{{ sugestao.categoria }} · {{ sugestao.turma }}</span>
            ({{ formatDate(sugestao.sessionDate) }}) — quer usar como base?
          </p>
          <PrimaryButton variant="secondary" class="shrink-0" @click="aplicarBase(sugestao)">
            <Icon name="clipboard" class="h-4 w-4" /> Usar como base
          </PrimaryButton>
        </div>
        <p v-else class="text-sm text-ink-muted">
          Comece do zero abaixo, ou reaproveite um plano já aprovado como ponto de partida.
        </p>
        <div v-if="reutilizaveis.length > 0" class="mt-3">
          <button
            type="button"
            @click="mostrarBaseUI = !mostrarBaseUI"
            :aria-expanded="mostrarBaseUI"
            class="flex items-center gap-1.5 text-sm font-medium text-primary-text hover:underline"
          >
            <Icon name="chevronDown" :class="`h-4 w-4 transition-transform ${mostrarBaseUI ? 'rotate-180' : ''}`" />
            Escolher outro plano como base ({{ reutilizaveis.length }})
          </button>
          <ul v-if="mostrarBaseUI" class="mt-2 flex flex-col gap-2">
            <li v-for="p in reutilizaveis" :key="p.id">
              <button
                type="button"
                @click="aplicarBase(p)"
                class="flex w-full items-center gap-3 rounded-xl border border-line-soft bg-surface-2 p-3 text-left transition-colors hover:border-primary/40"
              >
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon name="clipboard" class="h-4 w-4" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block text-sm font-semibold text-ink">
                    {{ formatDate(p.sessionDate) }} · {{ p.categoria }} · {{ p.turma }}
                  </span>
                  <span class="block truncate text-xs text-ink-muted">{{ p.tema }} · {{ p.subtema }}</span>
                </span>
                <span class="flex shrink-0 items-center gap-1 text-xs font-medium text-primary-text">
                  Usar <Icon name="arrowRight" class="h-3.5 w-3.5" />
                </span>
              </button>
            </li>
          </ul>
        </div>
      </template>
    </Card>

    <Card title="Dados da Sessão">
      <template #icon><Icon name="calendar" class="h-4 w-4" /></template>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Data" required :error="errors.data">
          <input type="date" :class="errors.data ? inputErrorClass : inputClass" :value="data" @input="onDataInput" />
        </Field>
        <Field label="Horário" required :error="errors.horario">
          <input type="time" :class="errors.horario ? inputErrorClass : inputClass" :value="horario" @input="onHorarioInput" />
        </Field>
        <Field label="Dia da Semana" hint="Calculado a partir da data.">
          <input :class="inputClass" :value="data ? diaDaSemana(data) : '-'" disabled />
        </Field>

        <Field label="Unidade" required>
          <select :class="inputClass" v-model="unidade" disabled>
            <option>Atibaia</option>
          </select>
        </Field>
        <Field label="Período" required>
          <select :class="inputClass" v-model="periodo">
            <option v-for="p in PERIODOS" :key="p">{{ p }}</option>
          </select>
        </Field>
        <Field label="Semana" required>
          <select :class="inputClass" v-model="semana">
            <option v-for="s in SEMANAS" :key="s">{{ s }}</option>
          </select>
        </Field>

        <Field label="Categoria" required>
          <select :class="inputClass" v-model="categoria">
            <option v-for="c in CATEGORIAS" :key="c">{{ c }}</option>
          </select>
        </Field>
        <Field label="Turma" required>
          <select :class="inputClass" v-model="turma">
            <option v-for="t in TURMAS" :key="t">{{ t }}</option>
          </select>
        </Field>
      </div>

      <div class="mt-1 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line-soft bg-surface-2 px-3 py-2 text-sm">
        <span class="text-ink-muted">
          Duração Total: <span class="font-semibold text-ink">{{ total }} min</span>
        </span>
        <span v-if="prazo" class="text-ink-muted">
          Prazo limite (sessão − 24h): <span class="font-medium text-ink">{{ formatDateTime(deadline) }}</span> ·
          <span :class="`font-semibold ${prazo.tone}`">{{ prazo.text }}</span>
        </span>
      </div>
    </Card>

    <Card title="Contexto Pedagógico">
      <template #icon><Icon name="clipboard" class="h-4 w-4" /></template>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Treinador Responsável" required hint="Selecionado explicitamente — não é definido pela cor do colete.">
          <select :class="inputClass" v-model="coachName">
            <option v-for="c in coachOptions" :key="c">{{ c }}</option>
          </select>
        </Field>
        <Field label="Fase do Jogo" required>
          <select :class="inputClass" :value="fase" @change="handleFaseChange($event.target.value)">
            <option v-for="f in FASES" :key="f">{{ f }}</option>
          </select>
        </Field>
        <Field label="Tema" required>
          <select :class="inputClass" :value="tema" @change="handleTemaChange($event.target.value)">
            <option v-for="t in temaOptions" :key="t.tema">{{ t.tema }}</option>
          </select>
        </Field>
        <Field label="Subtema" required>
          <select :class="inputClass" v-model="subtema">
            <option v-for="s in subtemaOptions" :key="s">{{ s }}</option>
          </select>
        </Field>
      </div>

      <div class="mt-1 flex items-center gap-2 text-xs text-ink-muted">
        <label for="plano-cor-colete">Cor do colete (uso na súmula):</label>
        <select
          id="plano-cor-colete"
          class="rounded-lg border border-line bg-surface-2 px-2 py-1 text-xs text-ink [color-scheme:dark]"
          v-model="team"
        >
          <option>Amarelo</option>
          <option>Azul</option>
        </select>
      </div>
    </Card>

    <div
      role="tablist"
      aria-label="Etapas do plano"
      class="flex flex-wrap gap-1 rounded-2xl border border-line bg-surface p-1"
      @keydown="onTabsKeydown"
    >
      <button
        v-for="(t, i) in TABS"
        :key="t"
        :id="`plano-tab-${i}`"
        role="tab"
        type="button"
        :aria-selected="tab === i"
        :aria-controls="`plano-panel-${i}`"
        :tabindex="tab === i ? 0 : -1"
        @click="tab = i"
        :class="`flex-1 min-w-[120px] rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
          tab === i ? 'bg-primary-hover text-white' : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
        }`"
      >
        {{ t }}
      </button>
    </div>

    <p
      v-if="status"
      role="status"
      :class="`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm ${
        statusIsError
          ? 'border-primary/30 bg-primary/10 text-primary-text'
          : 'border-secondary/30 bg-secondary/10 text-secondary'
      }`"
    >
      <Icon :name="statusIsError ? 'alert' : 'check'" class="h-4 w-4" /> {{ status }}
      <button
        v-if="justSubmitted"
        type="button"
        @click="router.push('/planos/aprovacao')"
        class="ml-1 font-medium underline underline-offset-2"
      >
        Ver fila de aprovação →
      </button>
    </p>

    <Card
      v-if="tab === 0"
      title="Aba 1 · Etapa Inicial (Aquecimento)"
      role="tabpanel"
      id="plano-panel-0"
      aria-labelledby="plano-tab-0"
    >
      <Field label="Objetivo" required :error="errors.inicialObjetivo">
        <RadioGroup :options="OBJETIVOS" :model-value="inicialObjetivo" @update:model-value="onInicialObjetivo" allow-other />
      </Field>
      <p class="mb-4 text-sm text-ink-muted">
        Duração da etapa (soma das estações): <span class="font-semibold text-ink">{{ inicialDuracao }} min</span>
      </p>
      <EstacaoForm label="Estação 1" :value="estacao1" @patch="onEstacao1Patch" />
      <EstacaoForm label="Estação 2" :value="estacao2" @patch="onEstacao2Patch" />
      <div class="flex justify-end">
        <PrimaryButton @click="goToNext(1)">
          Próximo <Icon name="arrowRight" class="h-4 w-4" />
        </PrimaryButton>
      </div>
    </Card>

    <Card
      v-if="tab === 1"
      title="Aba 2 · Etapa de Fundamentação"
      role="tabpanel"
      id="plano-panel-1"
      aria-labelledby="plano-tab-1"
    >
      <Field label="Objetivo" required :error="errors.fundObjetivo">
        <RadioGroup :options="OBJETIVOS" :model-value="fundObjetivo" @update:model-value="onFundObjetivo" allow-other />
      </Field>
      <Field label="Duração (minutos)" required :error="errors.fundDuracao">
        <input
          type="number"
          min="1"
          :class="errors.fundDuracao ? inputErrorClass : inputClass"
          :value="fundDuracao"
          @input="onFundDuracaoInput"
        />
      </Field>
      <Field label="Tipo de Exercício" required>
        <RadioGroup :options="TIPOS_EXERCICIO" v-model="fundTipo" />
      </Field>
      <p class="mb-4 text-sm text-ink-muted">
        Tema e subtema desta sessão são definidos no cabeçalho ({{ tema }} · {{ subtema }}).
      </p>
      <DiagramUpload />
      <div class="flex justify-between">
        <PrimaryButton variant="secondary" @click="tab = 0">
          <Icon name="arrowLeft" class="h-4 w-4" /> Anterior
        </PrimaryButton>
        <PrimaryButton @click="goToNext(2)">
          Próximo <Icon name="arrowRight" class="h-4 w-4" />
        </PrimaryButton>
      </div>
    </Card>

    <Card
      v-if="tab === 2"
      title="Aba 3 · Etapa Principal"
      role="tabpanel"
      id="plano-panel-2"
      aria-labelledby="plano-tab-2"
    >
      <Field label="Objetivo" required :error="errors.principalObjetivo">
        <RadioGroup :options="OBJETIVOS" :model-value="principalObjetivo" @update:model-value="onPrincipalObjetivo" allow-other />
      </Field>
      <Field label="Duração (minutos)" required :error="errors.principalDuracao">
        <input
          type="number"
          min="1"
          :class="errors.principalDuracao ? inputErrorClass : inputClass"
          :value="principalDuracao"
          @input="onPrincipalDuracaoInput"
        />
      </Field>

      <div class="mb-4">
        <Field label="Sub-temas (marque os que se aplicam)">
          <CheckboxGroup :options="subtemaOptions" v-model="subTemas" allow-other other-placeholder="Outro sub-tema" />
        </Field>
      </div>

      <div class="mb-4">
        <Field label="Orientações (marque as que se aplicam)">
          <CheckboxGroup :options="ORIENTACOES" v-model="orientacoes" allow-other other-placeholder="Outra orientação" />
        </Field>
      </div>

      <div class="mb-4">
        <span class="mb-2 block text-sm font-medium text-ink-muted">Protocolo de Intervalo</span>
        <div class="mb-3">
          <IntervaloFlow />
        </div>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label="Hidratação (min)">
            <input type="number" :class="inputClass" :value="hidratacao" @input="hidratacao = Number($event.target.value)" />
          </Field>
          <Field label="Repouso (min)">
            <input type="number" :class="inputClass" :value="repouso" @input="repouso = Number($event.target.value)" />
          </Field>
          <Field label="Instruir (min)">
            <input type="number" :class="inputClass" :value="instruir" @input="instruir = Number($event.target.value)" />
          </Field>
          <Field label="Ativar (min)">
            <input type="number" :class="inputClass" :value="ativar" @input="ativar = Number($event.target.value)" />
          </Field>
        </div>
      </div>

      <DiagramUpload />
      <div class="flex justify-between">
        <PrimaryButton variant="secondary" @click="tab = 1">
          <Icon name="arrowLeft" class="h-4 w-4" /> Anterior
        </PrimaryButton>
        <PrimaryButton @click="goToNext(3)">
          Próximo <Icon name="arrowRight" class="h-4 w-4" />
        </PrimaryButton>
      </div>
    </Card>

    <Card
      v-if="tab === 3"
      title="Aba 4 · Observações"
      role="tabpanel"
      id="plano-panel-3"
      aria-labelledby="plano-tab-3"
    >
      <Field label="Observações Gerais">
        <textarea :class="`${inputClass} min-h-[120px]`" v-model="observacoes" />
      </Field>

      <div class="mb-4 flex items-center justify-between rounded-xl border border-line-soft bg-surface-2 px-3 py-2 text-sm">
        <span class="font-medium text-ink-muted">Total Planejado</span>
        <span :class="`flex items-center gap-1.5 font-semibold ${total >= 30 && total <= 120 ? 'text-secondary' : 'text-primary-text'}`">
          {{ total }} minutos
          <Icon v-if="total >= 30 && total <= 120" name="check" class="h-4 w-4" />
          <span v-else class="inline-flex items-center gap-1">
            <Icon name="alert" class="h-4 w-4" /> fora do intervalo 30–120min
          </span>
        </span>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <PrimaryButton variant="secondary" @click="tab = 2">
          <Icon name="arrowLeft" class="h-4 w-4" /> Anterior
        </PrimaryButton>
        <div class="flex flex-col gap-2 sm:flex-row">
          <PrimaryButton variant="secondary" @click="handleSaveDraft">
            Salvar como Rascunho
          </PrimaryButton>
          <PrimaryButton @click="handleSubmit">Submeter para Aprovação</PrimaryButton>
        </div>
      </div>
    </Card>
  </div>
</template>

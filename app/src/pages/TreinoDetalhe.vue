<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { treinos } from "../data/mockData";
import { cicloDaAula } from "../data/ciclo";
import { Card, IntervaloFlow, StatusBadge, PrimaryButton, CicloAula, SumulaTabela } from "../components/ui";
import Icon from "../components/Icon.vue";
import { session } from "../stores/session";

function formatDateTime(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} às ${String(
    d.getHours(),
  ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function deviationLabel(planejado, executado) {
  const diff = executado - planejado;
  const sign = diff > 0 ? "+" : "";
  const color = Math.abs(diff) <= 1 ? "text-secondary" : Math.abs(diff) <= 3 ? "text-warning" : "text-primary-text";
  return { text: `${sign}${diff} min`, color };
}

const impactStyles = {
  Baixo: "bg-secondary/15 text-secondary",
  Médio: "bg-warning/15 text-warning",
  Alto: "bg-primary/15 text-primary-text",
};

const route = useRoute();
const router = useRouter();

const role = computed(() => session.user?.role);
const canEdit = computed(() => role.value !== "responsavel");
const treino = computed(() => treinos.find((t) => t.id === route.params.id) ?? treinos[0]);
const plano = computed(() => treino.value.plano);
const sumula = computed(() => treino.value.sumula);
const executionLog = computed(() => treino.value.executionLog);
const totalPlanejado = computed(
  () =>
    plano.value.etapaInicial.duracaoMin +
    plano.value.etapaFundamentacao.duracaoMin +
    plano.value.etapaPrincipal.duracaoMin,
);

const sessionDateShort = computed(() => plano.value.sessionDate.split("-").reverse().slice(0, 2).join("/"));

// Ciclo da aula (Plano→Captura→Súmula→Execução→Vídeos→Análise) — mock visual.
const ciclo = computed(() => cicloDaAula(treino.value));

// Data da súmula formatada dd/mm/aaaa para o cabeçalho no formato do modelo.
const sumulaData = computed(() => {
  const d = sumula.value?.sessionDate;
  return d ? d.split("-").reverse().join("/") : "";
});

// BR-02: o callout de "ajustes solicitados" citava a etapa em texto livre sem
// marcar o campo alvo — heurística simples de palavra-chave para destacar
// visualmente a etapa citada pelo Admin, em vez de só descrevê-la.
const ajusteAlvo = computed(() => {
  if (plano.value.status !== "changes_requested" || !plano.value.reviewComment) return null;
  const texto = plano.value.reviewComment.toLowerCase();
  if (texto.includes("etapa principal")) return "principal";
  if (texto.includes("fundamenta")) return "fundamentacao";
  if (texto.includes("etapa inicial") || texto.includes("aquecimento") || texto.includes("estação"))
    return "inicial";
  return null;
});

function etapaCardClass(key) {
  return ajusteAlvo.value === key
    ? "rounded-xl border-2 border-warning bg-warning/10 p-3"
    : "rounded-xl border border-line-soft bg-surface-2 p-3";
}

const execRows = computed(() => {
  if (!executionLog.value) return [];
  return [
    { label: "Etapa Inicial (Aquecimento)", data: executionLog.value.etapaInicial },
    { label: "Etapa de Fundamentação", data: executionLog.value.etapaFundamentacao },
    { label: "Etapa Principal", data: executionLog.value.etapaPrincipal },
  ].map((r) => ({ ...r, dev: deviationLabel(r.data.planejadoMin, r.data.executadoMin) }));
});

const status = ref(null);

// Editar reabre o PRÓPRIO plano: rascunho/devolvido edita no lugar; um plano
// já aprovado/executado abre uma cópia (duplicar) para não alterar o original.
function editarPlano() {
  const p = plano.value;
  if (p?.id && (p.status === "draft" || p.status === "changes_requested")) {
    router.push(`/planos/novo?draft=${p.id}`);
  } else if (p?.id) {
    router.push(`/planos/novo?base=${p.id}`);
  } else {
    router.push("/planos/novo");
  }
}

function handleExport() {
  status.value = "Relatório exportado (PDF) — download simulado para este wireframe.";
}

async function handleShare() {
  const link = typeof window !== "undefined" ? window.location.href : "";
  try {
    await navigator.clipboard?.writeText(link);
    status.value = "Link copiado para a área de transferência.";
  } catch {
    status.value = `Link: ${link}`;
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <router-link
          to="/"
          class="rounded-lg border border-line p-2 text-ink-muted hover:bg-surface-2"
          aria-label="Voltar ao dashboard"
        >
          <Icon name="arrowLeft" class="h-4 w-4" />
        </router-link>
        <div>
          <h1 class="font-heading text-lg font-semibold text-ink sm:text-xl">
            {{ treino.categoria }} · {{ treino.campo || treino.turma }}
          </h1>
          <p class="mt-0.5 text-sm text-ink-muted">
            {{ sessionDateShort }}<span v-if="plano.horario"> · {{ plano.horario }}</span> ·
            {{ treino.turma }} · {{ treino.coachName }}
          </p>
        </div>
      </div>
      <div v-if="canEdit" class="flex flex-wrap gap-2">
        <PrimaryButton variant="secondary" @click="editarPlano">
          <Icon name="edit" class="h-4 w-4" /> Editar
        </PrimaryButton>
        <PrimaryButton variant="secondary" @click="handleExport">
          <Icon name="download" class="h-4 w-4" /> Exportar
        </PrimaryButton>
        <PrimaryButton variant="secondary" @click="handleShare">
          <Icon name="share" class="h-4 w-4" /> Compartilhar
        </PrimaryButton>
      </div>
    </div>

    <p
      v-if="status"
      role="status"
      class="flex items-center gap-1.5 rounded-xl border border-secondary/30 bg-secondary/10 px-3 py-2 text-sm text-secondary"
    >
      <Icon name="check" class="h-4 w-4" /> {{ status }}
    </p>

    <!-- Ciclo da aula (acompanhamento visual do treino) -->
    <Card title="Ciclo da aula">
      <template #icon><Icon name="lineChart" class="h-4 w-4" /></template>
      <CicloAula :etapas="ciclo" />
      <p class="mt-3 text-xs text-ink-muted">
        Captura e análise são etapas futuras (câmeras + vídeo) — aqui aparecem só como acompanhamento.
      </p>
    </Card>

    <!-- Seção 1: Plano -->
    <Card title="Seção 1 · Plano de Aula">
      <template #icon><Icon name="clipboard" class="h-4 w-4" /></template>
      <div class="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <StatusBadge :status="plano.status" />
        <span v-if="plano.approvedAt" class="text-ink-muted">
          {{ formatDateTime(plano.approvedAt) }} por {{ plano.approvedBy }}
        </span>
        <span class="ml-auto rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary-text">
          Fase: {{ plano.fase }}
        </span>
      </div>

      <div
        v-if="plano.status === 'changes_requested' && plano.reviewComment"
        class="mb-3 flex items-start gap-2.5 rounded-xl border border-warning/40 bg-warning/10 p-3"
      >
        <Icon name="alert" class="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <div class="min-w-0 text-sm">
          <p class="font-semibold text-warning">Ajustes solicitados pelo Admin</p>
          <p class="mt-0.5 text-ink">{{ plano.reviewComment }}</p>
          <p v-if="plano.reviewedBy" class="mt-1 text-xs text-ink-muted">
            {{ plano.reviewedBy }}{{ plano.reviewedAt ? ` · ${formatDateTime(plano.reviewedAt)}` : "" }}
          </p>
        </div>
      </div>

      <p class="mb-1 text-sm text-ink-muted">
        <span class="font-medium text-ink">Tema:</span> {{ plano.tema }} · <span class="font-medium text-ink">Subtema:</span>
        {{ plano.subtema }} · <span class="font-medium text-ink">Horário:</span> {{ plano.horario }}
      </p>
      <p class="mb-3 text-sm text-ink-muted">
        <span class="font-medium text-ink">Período:</span> {{ plano.periodo }} · <span class="font-medium text-ink">Semana:</span>
        {{ plano.semana }}
      </p>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div :class="etapaCardClass('inicial')">
          <p class="flex items-center gap-1.5 text-sm font-semibold text-ink">
            Etapa Inicial (Aquecimento) — {{ plano.etapaInicial.duracaoMin }} min
            <Icon v-if="ajusteAlvo === 'inicial'" name="alert" class="h-3.5 w-3.5 shrink-0 text-warning" aria-label="Ajuste solicitado nesta etapa" />
          </p>
          <p class="mt-1 text-sm text-ink-muted">Objetivo: {{ plano.etapaInicial.objetivo }}</p>
          <p class="mt-2 text-sm font-medium text-ink">Estação 1 — {{ plano.etapaInicial.estacao1.nome }}</p>
          <p class="text-sm text-ink-muted">
            {{ plano.etapaInicial.estacao1.tipo }} · {{ plano.etapaInicial.estacao1.duracaoMin }} min · {{ plano.etapaInicial.estacao1.descricao }}
          </p>
          <p class="text-sm text-ink-muted">Materiais: {{ plano.etapaInicial.estacao1.materiais }}</p>
          <p class="mt-2 text-sm font-medium text-ink">Estação 2 — {{ plano.etapaInicial.estacao2.nome }}</p>
          <p class="text-sm text-ink-muted">
            {{ plano.etapaInicial.estacao2.tipo }} · {{ plano.etapaInicial.estacao2.duracaoMin }} min · {{ plano.etapaInicial.estacao2.descricao }}
          </p>
          <p class="text-sm text-ink-muted">Materiais: {{ plano.etapaInicial.estacao2.materiais }}</p>
        </div>
        <div :class="etapaCardClass('fundamentacao')">
          <p class="flex items-center gap-1.5 text-sm font-semibold text-ink">
            Etapa de Fundamentação — {{ plano.etapaFundamentacao.duracaoMin }} min
            <Icon v-if="ajusteAlvo === 'fundamentacao'" name="alert" class="h-3.5 w-3.5 shrink-0 text-warning" aria-label="Ajuste solicitado nesta etapa" />
          </p>
          <p class="mt-1 text-sm text-ink-muted">Objetivo: {{ plano.etapaFundamentacao.objetivo }}</p>
          <p class="text-sm text-ink-muted">Tipo: {{ plano.etapaFundamentacao.tipo }}</p>
        </div>
        <div :class="etapaCardClass('principal')">
          <p class="flex items-center gap-1.5 text-sm font-semibold text-ink">
            Etapa Principal — {{ plano.etapaPrincipal.duracaoMin }} min
            <Icon v-if="ajusteAlvo === 'principal'" name="alert" class="h-3.5 w-3.5 shrink-0 text-warning" aria-label="Ajuste solicitado nesta etapa" />
          </p>
          <p class="mt-1 text-sm text-ink-muted">Objetivo: {{ plano.etapaPrincipal.objetivo }}</p>
          <p class="text-sm text-ink-muted">Sub-temas: {{ plano.etapaPrincipal.subTemas.join(", ") }}</p>
          <p class="text-sm text-ink-muted">Orientações: {{ plano.etapaPrincipal.orientacoes.join(", ") }}</p>
          <p class="mb-1 mt-2 text-sm text-ink-muted">Protocolo de Intervalo:</p>
          <IntervaloFlow />
          <p class="mt-2 text-sm text-ink-muted">
            Hidratação {{ plano.etapaPrincipal.intervalo.hidratacaoMin }}min, Repouso
            {{ plano.etapaPrincipal.intervalo.repousoMin }}min, Instruir {{ plano.etapaPrincipal.intervalo.instruirMin }}min,
            Ativar {{ plano.etapaPrincipal.intervalo.ativarMin }}min
          </p>
        </div>
      </div>
      <p class="mt-3 text-sm font-semibold text-ink">Total Planejado: {{ totalPlanejado }} minutos</p>
    </Card>

    <!-- Seção 2: Súmula (formato do modelo — 1 súmula = 1 campo) -->
    <Card title="Seção 2 · Súmula">
      <template #icon><Icon name="ball" class="h-4 w-4" /></template>
      <template v-if="canEdit" #headerAction>
        <PrimaryButton variant="secondary" @click="router.push(`/sumulas/novo?treino=${treino.id}`)">
          <Icon name="edit" class="h-4 w-4" /> Editar Escalação
        </PrimaryButton>
      </template>
      <div class="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <StatusBadge :status="sumula.status" />
        <span v-if="sumula.confirmedAt" class="text-ink-muted">{{ formatDateTime(sumula.confirmedAt) }}</span>
      </div>
      <SumulaTabela
        :entries="sumula.entries"
        :campo="sumula.campo || treino.campo"
        :categoria="treino.categoria"
        :data="sumulaData"
      />
    </Card>

    <!-- Seção 3: Registro de Execução -->
    <Card v-if="executionLog" title="Seção 3 · Registro de Execução">
      <template #icon><Icon name="barChart" class="h-4 w-4" /></template>
      <div class="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <StatusBadge :status="executionLog.status" />
        <span v-if="executionLog.confirmedAt" class="text-ink-muted">{{ formatDateTime(executionLog.confirmedAt) }}</span>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="row in execRows" :key="row.label" class="rounded-xl border border-line-soft bg-surface-2 p-3">
          <p class="text-sm font-semibold text-ink">{{ row.label }}</p>
          <p class="mt-1 text-sm text-ink-muted">
            Planejado: {{ row.data.planejadoMin }} min &nbsp;·&nbsp; Executado: {{ row.data.executadoMin }} min &nbsp;·&nbsp;
            <span class="font-semibold" :class="row.dev.color">{{ row.dev.text }}</span>
          </p>
          <p class="text-sm text-ink-muted">Observações: {{ row.data.observacoes }}</p>
        </div>
      </div>

      <div class="mt-4">
        <p class="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Icon name="alert" class="h-4 w-4 text-warning" /> Desvios Registrados
        </p>
        <ul class="flex flex-col gap-2">
          <li
            v-for="d in executionLog.desvios"
            :key="d.id"
            class="flex items-start gap-2 rounded-xl border border-line-soft bg-surface-2 p-3 text-sm"
          >
            <span class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium" :class="impactStyles[d.impacto]">
              {{ d.impacto }}
            </span>
            <div>
              <p class="font-medium text-ink">Etapa {{ d.etapa }}</p>
              <p class="text-ink-muted">"{{ d.descricao }}"</p>
            </div>
          </li>
        </ul>
      </div>
    </Card>
    <Card v-else title="Seção 3 · Registro de Execução">
      <template #icon><Icon name="barChart" class="h-4 w-4" /></template>
      <p class="text-sm text-ink-muted">Execução ainda não registrada para este treino.</p>
      <div v-if="canEdit" class="mt-3">
        <PrimaryButton @click="router.push(`/execution/novo?treino=${treino.id}`)">
          <Icon name="barChart" class="h-4 w-4" /> Registrar Execução
        </PrimaryButton>
      </div>
    </Card>

    <!-- Fechamento da aula (mock): súmula + devolutiva → validação da coordenação -->
    <Card v-if="canEdit" title="Fechamento da aula">
      <template #icon><Icon name="stamp" class="h-4 w-4" /></template>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-wrap items-center gap-2 text-sm">
          <span class="flex items-center gap-1.5">
            Súmula <StatusBadge :status="sumula.status" />
          </span>
          <span class="flex items-center gap-1.5">
            Devolutiva <StatusBadge :status="executionLog ? executionLog.status : 'aguardando'" />
          </span>
        </div>
        <PrimaryButton
          @click="status = 'Fechamento enviado para validação da coordenação (protótipo).'"
        >
          <Icon name="upload" class="h-4 w-4" /> Enviar para validação
        </PrimaryButton>
      </div>
      <p class="mt-2 text-xs text-ink-muted">
        Quando aprovado pela coordenação, súmula + vídeos seguem para a análise. (Fluxo representado — sem envio real.)
      </p>
    </Card>

    <!-- Seção 4: Avaliação -->
    <Card v-if="executionLog" title="Seção 4 · Avaliação">
      <template #icon><Icon name="lineChart" class="h-4 w-4" /></template>
      <p class="flex items-start gap-2 text-sm text-ink-muted">
        <Icon name="alert" class="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        Avaliação pendente de metodologia definida pela coordenação pedagógica. Indicadores pedagógicos e
        metodologia de conformidade pendentes de validação.
      </p>

      <div class="mt-4 rounded-xl border border-line-soft bg-surface-2 p-3">
        <p class="mb-1 flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Icon name="bot" class="h-4 w-4 text-primary" /> Inteligência Artificial
        </p>
        <p class="text-sm text-ink-muted">
          Área reservada para futuros insights de inteligência artificial, após definição dos indicadores e
          geração de uma base de dados confiável.
        </p>
      </div>

      <div v-if="canEdit" class="mt-4 flex flex-wrap gap-2">
        <PrimaryButton variant="secondary" @click="editarPlano">
          <Icon name="edit" class="h-4 w-4" /> Editar
        </PrimaryButton>
        <PrimaryButton variant="secondary" @click="handleExport">
          <Icon name="download" class="h-4 w-4" /> Exportar Relatório
        </PrimaryButton>
        <PrimaryButton variant="secondary" @click="handleShare">
          <Icon name="share" class="h-4 w-4" /> Compartilhar
        </PrimaryButton>
      </div>
    </Card>
  </div>
</template>

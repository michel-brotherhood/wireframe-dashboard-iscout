<script setup>
import { ref, computed } from "vue";
import { Card, Field, IntervaloFlow, PrimaryButton, StatusBadge, inputClass } from "../components/ui";
import Icon from "../components/Icon.vue";
import { planosStore, approvePlano, requestChanges, bulkApprove } from "../stores/planos";
import { session } from "../stores/session";
import { escopoContem } from "../data/users";
import { prazoLabel } from "../data/mockData";

function formatDate(iso) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function formatDateTime(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} às ${String(
    d.getHours(),
  ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function totalPlanejado(p) {
  return p.etapaInicial.duracaoMin + p.etapaFundamentacao.duracaoMin + p.etapaPrincipal.duracaoMin;
}

const selected = ref(new Set());
const viewingId = ref(null);
const comment = ref("");
const commentError = ref(null);
const status = ref(null);

// Só planos dentro do escopo do usuário (unidade/categorias/turmas atendidas).
const noEscopo = computed(() => planosStore.planos.filter((p) => escopoContem(p, session.user)));
const pendentes = computed(() =>
  noEscopo.value.filter((p) => p.status === "submitted" || p.status === "changes_requested"),
);
const historico = computed(() =>
  noEscopo.value
    .filter((p) => p.status === "approved" || p.status === "cancelled" || p.status === "executed")
    .slice()
    .sort((a, b) => (b.reviewedAt ?? b.approvedAt ?? "").localeCompare(a.reviewedAt ?? a.approvedAt ?? "")),
);

const viewing = computed(() =>
  viewingId.value ? (planosStore.planos.find((p) => p.id === viewingId.value) ?? null) : null,
);
const prazo = computed(() => (viewing.value ? prazoLabel(viewing.value.deadlineAt) : null));

function openDetail(id) {
  viewingId.value = id;
  comment.value = "";
  commentError.value = null;
}

function backToQueue() {
  viewingId.value = null;
  comment.value = "";
  commentError.value = null;
}

function handleApprove(id) {
  approvePlano(id, comment.value.trim() || undefined, session.user.nome);
  status.value = "Plano aprovado.";
  const next = new Set(selected.value);
  next.delete(id);
  selected.value = next;
  backToQueue();
}

function handleRequestChanges(id) {
  if (!comment.value.trim()) {
    commentError.value = "Descreva o que precisa ser ajustado para o coach.";
    return;
  }
  requestChanges(id, comment.value.trim(), session.user.nome);
  status.value = "Ajustes solicitados ao coach.";
  backToQueue();
}

// Aprovar em lote é irreversível — pede confirmação explícita em vez de
// aprovar direto no primeiro clique (um clique errado numa seleção grande
// aprovaria tudo sem volta).
const confirmingBulk = ref(false);

function requestBulkApprove() {
  confirmingBulk.value = true;
}

function cancelBulkApprove() {
  confirmingBulk.value = false;
}

function bulkApproveSelected() {
  const count = selected.value.size;
  bulkApprove(Array.from(selected.value), session.user.nome);
  selected.value = new Set();
  confirmingBulk.value = false;
  status.value = `${count} ${count === 1 ? "plano aprovado" : "planos aprovados"} em lote.`;
}

function toggleSelect(id) {
  const next = new Set(selected.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  selected.value = next;
  // Mudar a seleção invalida uma confirmação pendente.
  confirmingBulk.value = false;
}

function onCommentInput(e) {
  comment.value = e.target.value;
  commentError.value = null;
}
</script>

<template>
  <div v-if="viewing" class="flex flex-col gap-6">
    <div>
      <button
        type="button"
        class="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
        @click="backToQueue"
      >
        <Icon name="arrowLeft" class="h-4 w-4" /> Voltar para a fila
      </button>
      <h1 class="font-heading flex items-center gap-2 text-xl font-semibold text-ink sm:text-2xl">
        <Icon name="stamp" class="h-6 w-6 text-primary" />
        {{ formatDate(viewing.sessionDate) }} · {{ viewing.categoria }} · {{ viewing.turma }}
      </h1>
      <p class="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
        <StatusBadge :status="viewing.status" />
        {{ viewing.unidade }} · {{ viewing.coachName }} · {{ viewing.horario }} ·
        <span class="font-medium" :class="prazo.tone">Prazo: {{ prazo.text }} ({{ formatDateTime(viewing.deadlineAt) }})</span>
      </p>
      <p class="mt-1 text-sm text-ink-muted">
        <span class="font-medium text-ink">Tema:</span> {{ viewing.tema }} · <span class="font-medium text-ink">Subtema:</span>
        {{ viewing.subtema }}
      </p>
      <p class="mt-1 text-sm text-ink-muted">
        <span class="font-medium text-ink">Período:</span> {{ viewing.periodo }} · <span class="font-medium text-ink">Semana:</span>
        {{ viewing.semana }}
      </p>
    </div>

    <p
      v-if="status"
      role="status"
      class="flex items-center gap-1.5 rounded-xl border border-secondary/30 bg-secondary/10 px-3 py-2 text-sm text-secondary"
    >
      <Icon name="check" class="h-4 w-4" /> {{ status }}
    </p>

    <Card title="Plano Completo">
      <template #icon><Icon name="clipboard" class="h-4 w-4" /></template>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div class="rounded-xl border border-line-soft bg-surface-2 p-3">
          <p class="text-sm font-semibold text-ink">Etapa Inicial (Aquecimento) — {{ viewing.etapaInicial.duracaoMin }} min</p>
          <p class="mt-1 text-sm text-ink-muted">Objetivo: {{ viewing.etapaInicial.objetivo }}</p>
          <p class="mt-2 text-sm font-medium text-ink">Estação 1 — {{ viewing.etapaInicial.estacao1.nome }}</p>
          <p class="text-sm text-ink-muted">
            {{ viewing.etapaInicial.estacao1.tipo }} · {{ viewing.etapaInicial.estacao1.duracaoMin }} min
          </p>
          <p class="mt-2 text-sm font-medium text-ink">Estação 2 — {{ viewing.etapaInicial.estacao2.nome }}</p>
          <p class="text-sm text-ink-muted">
            {{ viewing.etapaInicial.estacao2.tipo }} · {{ viewing.etapaInicial.estacao2.duracaoMin }} min
          </p>
        </div>
        <div class="rounded-xl border border-line-soft bg-surface-2 p-3">
          <p class="text-sm font-semibold text-ink">Etapa de Fundamentação — {{ viewing.etapaFundamentacao.duracaoMin }} min</p>
          <p class="mt-1 text-sm text-ink-muted">Objetivo: {{ viewing.etapaFundamentacao.objetivo }}</p>
          <p class="text-sm text-ink-muted">Tipo: {{ viewing.etapaFundamentacao.tipo }}</p>
        </div>
        <div class="rounded-xl border border-line-soft bg-surface-2 p-3">
          <p class="text-sm font-semibold text-ink">Etapa Principal — {{ viewing.etapaPrincipal.duracaoMin }} min</p>
          <p class="mt-1 text-sm text-ink-muted">Objetivo: {{ viewing.etapaPrincipal.objetivo }}</p>
          <p class="text-sm text-ink-muted">Sub-temas: {{ viewing.etapaPrincipal.subTemas.join(", ") }}</p>
          <p class="text-sm text-ink-muted">Orientações: {{ viewing.etapaPrincipal.orientacoes.join(", ") }}</p>
          <p class="mb-1 mt-2 text-sm text-ink-muted">Protocolo de Intervalo:</p>
          <IntervaloFlow />
        </div>
      </div>
      <p class="mt-3 text-sm font-semibold text-ink">Total Planejado: {{ totalPlanejado(viewing) }} minutos</p>
      <p v-if="viewing.observacoes" class="mt-1 text-sm text-ink-muted">Observações: {{ viewing.observacoes }}</p>
      <p
        v-if="viewing.reviewComment && viewing.status === 'changes_requested'"
        class="mt-3 rounded-xl border border-warning/30 bg-warning/5 p-3 text-sm text-ink"
      >
        <span class="font-medium">Ajustes solicitados anteriormente:</span> "{{ viewing.reviewComment }}"
      </p>
    </Card>

    <Card title="Decisão do Admin">
      <template #icon><Icon name="edit" class="h-4 w-4" /></template>
      <Field
        label="Comentário"
        hint="Obrigatório para solicitar ajustes · opcional ao aprovar"
        :error="commentError || ''"
      >
        <textarea
          :class="`${inputClass} min-h-[90px]`"
          :value="comment"
          placeholder="Ex.: Duração da Etapa Principal fora do padrão — ajustar antes de reaprovar."
          @input="onCommentInput"
        />
      </Field>
      <div class="flex flex-wrap gap-2">
        <PrimaryButton @click="handleApprove(viewing.id)">
          <Icon name="check" class="h-4 w-4" /> Aprovar
        </PrimaryButton>
        <PrimaryButton variant="secondary" @click="handleRequestChanges(viewing.id)">
          <Icon name="x" class="h-4 w-4" /> Solicitar Ajustes
        </PrimaryButton>
        <PrimaryButton variant="secondary" @click="backToQueue">
          <Icon name="arrowLeft" class="h-4 w-4" /> Voltar para a Fila
        </PrimaryButton>
      </div>
    </Card>
  </div>

  <div v-else class="flex flex-col gap-6">
    <div>
      <h1 class="font-heading flex items-center gap-2 text-xl font-semibold text-ink sm:text-2xl">
        <Icon name="stamp" class="h-6 w-6 text-primary" />
        Aprovações
      </h1>
      <p class="mt-1 text-sm text-ink-muted">
        Sem plano aprovado, o treinador não consegue registrar execução — gate obrigatório.
      </p>
    </div>

    <p
      v-if="status"
      role="status"
      class="flex items-center gap-1.5 rounded-xl border border-secondary/30 bg-secondary/10 px-3 py-2 text-sm text-secondary"
    >
      <Icon name="check" class="h-4 w-4" /> {{ status }}
    </p>

    <Card :title="`Fila de Aprovação (${pendentes.length})`">
      <template #icon><Icon name="alert" class="h-4 w-4" /></template>
      <template v-if="selected.size > 0" #headerAction>
        <PrimaryButton v-if="!confirmingBulk" @click="requestBulkApprove">
          <Icon name="check" class="h-4 w-4" /> Aprovar Selecionados ({{ selected.size }})
        </PrimaryButton>
        <div v-else class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-medium text-ink-muted">
            Aprovar {{ selected.size }} {{ selected.size === 1 ? "plano" : "planos" }}?
          </span>
          <PrimaryButton @click="bulkApproveSelected">
            <Icon name="check" class="h-4 w-4" /> Confirmar
          </PrimaryButton>
          <PrimaryButton variant="ghost" @click="cancelBulkApprove">Cancelar</PrimaryButton>
        </div>
      </template>
      <p v-if="pendentes.length === 0" class="text-sm text-ink-muted">Nenhum plano aguardando decisão no momento.</p>
      <div v-else class="flex flex-col gap-3">
        <div v-for="p in pendentes" :key="p.id" class="rounded-xl border border-line-soft bg-surface-2 p-3">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div class="flex min-w-0 flex-1 items-start gap-3">
              <input
                type="checkbox"
                class="mt-1 h-4 w-4 shrink-0 rounded border-line bg-surface text-primary focus:ring-primary"
                :checked="selected.has(p.id)"
                :aria-label="`Selecionar plano de ${formatDate(p.sessionDate)}`"
                @change="toggleSelect(p.id)"
              />
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="text-sm font-semibold text-ink">
                    {{ formatDate(p.sessionDate) }} · {{ p.categoria }} · {{ p.turma }}
                  </p>
                  <StatusBadge :status="p.status" />
                </div>
                <p class="text-sm text-ink-muted break-words">
                  <span>{{ p.unidade }}</span> · <span>Treinador: {{ p.coachName }}</span> · <span>{{ p.periodo }}</span> ·
                  <span>{{ p.semana }}</span> · <span>Total Planejado: {{ totalPlanejado(p) }} min</span>
                </p>
                <p class="mt-1 text-sm">
                  <span class="text-ink-muted">Prazo: {{ formatDateTime(p.deadlineAt) }} · </span>
                  <span class="font-medium" :class="prazoLabel(p.deadlineAt).tone">{{ prazoLabel(p.deadlineAt).text }}</span>
                </p>
                <p v-if="p.status === 'changes_requested' && p.reviewComment" class="mt-1 text-sm text-ink-muted">
                  Motivo anterior: "{{ p.reviewComment }}"
                </p>
              </div>
            </div>
            <div class="flex gap-2 sm:shrink-0">
              <PrimaryButton variant="secondary" class="flex-1 sm:flex-none" @click="openDetail(p.id)">
                <Icon name="clipboard" class="h-4 w-4" /> Ver Plano
              </PrimaryButton>
              <PrimaryButton variant="secondary" class="flex-1 sm:flex-none" @click="handleApprove(p.id)">
                <Icon name="check" class="h-4 w-4" /> Aprovar
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <Card title="Histórico Recente">
      <template #icon><Icon name="clipboard" class="h-4 w-4" /></template>
      <p v-if="historico.length === 0" class="text-sm text-ink-muted">Nenhuma decisão registrada ainda.</p>
      <ul v-else class="flex flex-col gap-2">
        <li v-for="p in historico" :key="p.id" class="rounded-xl border border-line-soft bg-surface-2 p-3 text-sm">
          <div class="flex flex-wrap items-center gap-2">
            <StatusBadge :status="p.status" />
            <span class="font-medium text-ink">
              {{ formatDate(p.sessionDate) }} · {{ p.categoria }} · {{ p.turma }} · {{ p.coachName }}
            </span>
            <span class="w-full text-ink-muted sm:ml-auto sm:w-auto sm:text-right">
              {{
                p.status === "approved"
                  ? `Aprovado em ${formatDateTime(p.approvedAt)} por ${p.approvedBy}`
                  : p.status === "cancelled"
                    ? `Cancelado em ${formatDateTime(p.reviewedAt)}`
                    : "Executado"
              }}
            </span>
          </div>
          <p v-if="p.reviewComment && (p.status === 'cancelled' || p.status === 'approved')" class="mt-1 text-ink-muted">
            Comentário: "{{ p.reviewComment }}"
          </p>
        </li>
      </ul>
    </Card>
  </div>
</template>

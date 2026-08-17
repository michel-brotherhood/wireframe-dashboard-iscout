<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Card, StatusBadge, PrimaryButton, inputClass } from "../components/ui";
import Icon from "../components/Icon.vue";
import { planosDoUsuario } from "../stores/planos";
import { session } from "../stores/session";
import { CATEGORIAS } from "../data/planoOptions";

const route = useRoute();
const router = useRouter();

function formatDate(iso) {
  if (!iso) return "-";
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

const STATUS_OPTIONS = [
  { value: "Todos", label: "Todos" },
  { value: "draft", label: "Rascunho" },
  { value: "submitted", label: "Aguardando Aprovação" },
  { value: "changes_requested", label: "Devolvido" },
  { value: "approved", label: "Aprovado" },
  { value: "executed", label: "Executado" },
  { value: "cancelled", label: "Cancelado" },
];
const TURMAS = ["Todas", "Turma A", "Turma B"];

// Pré-filtro de status por query (?status=changes_requested vindo do Dashboard).
const statusFilter = ref(typeof route.query.status === "string" ? route.query.status : "Todos");
const categoriaFilter = ref("Todas");
const turmaFilter = ref("Todas");

const todos = computed(() => planosDoUsuario(session.user));
const planos = computed(() =>
  todos.value.filter((p) => {
    if (statusFilter.value !== "Todos" && p.status !== statusFilter.value) return false;
    if (categoriaFilter.value !== "Todas" && p.categoria !== categoriaFilter.value) return false;
    if (turmaFilter.value !== "Todas" && p.turma !== turmaFilter.value) return false;
    return true;
  }),
);

function editar(p) {
  router.push(`/planos/novo?draft=${p.id}`);
}
function duplicar(p) {
  router.push(`/planos/novo?base=${p.id}`);
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="font-heading flex items-center gap-2 text-xl font-semibold text-ink sm:text-2xl">
          <Icon name="clipboard" class="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
          Meus Planos
        </h1>
        <p class="mt-1 text-sm text-ink-muted">
          Histórico dos seus planos de aula — reabra rascunhos, corrija devolvidos ou
          <span class="font-medium text-ink">duplique</span> um plano pronto para a próxima semana.
        </p>
      </div>
      <PrimaryButton @click="router.push('/planos/novo')">
        <Icon name="plus" class="h-4 w-4" /> Novo Plano
      </PrimaryButton>
    </div>

    <Card title="Filtros">
      <template #icon><Icon name="filter" class="h-4 w-4" /></template>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label>
          <span class="mb-1 block text-xs font-medium text-ink-muted">Status</span>
          <select :class="inputClass" v-model="statusFilter">
            <option v-for="o in STATUS_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
        </label>
        <label>
          <span class="mb-1 block text-xs font-medium text-ink-muted">Categoria</span>
          <select :class="inputClass" v-model="categoriaFilter">
            <option>Todas</option>
            <option v-for="c in CATEGORIAS" :key="c">{{ c }}</option>
          </select>
        </label>
        <label>
          <span class="mb-1 block text-xs font-medium text-ink-muted">Turma</span>
          <select :class="inputClass" v-model="turmaFilter">
            <option v-for="t in TURMAS" :key="t">{{ t }}</option>
          </select>
        </label>
      </div>
    </Card>

    <p v-if="planos.length === 0" class="rounded-2xl border border-line bg-surface p-4 text-sm text-ink-muted">
      Nenhum plano encontrado com os filtros atuais.
    </p>

    <ul v-else class="flex flex-col gap-2">
      <li
        v-for="p in planos"
        :key="p.id"
        class="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 sm:flex-row sm:items-center"
      >
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <p class="text-sm font-semibold text-ink">
              {{ formatDate(p.sessionDate) }} · {{ p.categoria }} · {{ p.turma }}
            </p>
            <StatusBadge :status="p.status" />
          </div>
          <p class="mt-0.5 truncate text-xs text-ink-muted">
            {{ p.tema }} · {{ p.subtema }} · {{ p.coachName }}
          </p>
          <p
            v-if="p.status === 'changes_requested' && p.reviewComment"
            class="mt-1 flex items-start gap-1.5 text-xs text-warning"
          >
            <Icon name="alert" class="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span class="min-w-0">Ajuste pedido: "{{ p.reviewComment }}"</span>
          </p>
        </div>
        <div class="flex shrink-0 flex-wrap gap-2">
          <PrimaryButton
            v-if="p.status === 'changes_requested'"
            variant="secondary"
            @click="editar(p)"
          >
            <Icon name="edit" class="h-4 w-4" /> Corrigir e reenviar
          </PrimaryButton>
          <PrimaryButton v-else-if="p.status === 'draft'" variant="secondary" @click="editar(p)">
            <Icon name="edit" class="h-4 w-4" /> Continuar
          </PrimaryButton>
          <PrimaryButton variant="secondary" @click="duplicar(p)">
            <Icon name="clipboard" class="h-4 w-4" /> Duplicar
          </PrimaryButton>
        </div>
      </li>
    </ul>
  </div>
</template>

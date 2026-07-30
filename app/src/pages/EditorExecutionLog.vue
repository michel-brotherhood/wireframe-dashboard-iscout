<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Card, Field, PrimaryButton, inputClass } from "../components/ui";
import Icon from "../components/Icon.vue";
import { planosStore, markExecuted } from "../stores/planos";

function deviationInfo(planejado, executado) {
  const diff = executado - planejado;
  const abs = Math.abs(diff);
  const sign = diff > 0 ? "+" : "";
  if (abs <= 1) return { text: `${sign}${diff} minuto${abs === 1 ? "" : "s"} · dentro do esperado`, color: "text-secondary" };
  if (abs <= 3) return { text: `${sign}${diff} minutos · acima do planejado`, color: "text-warning" };
  return { text: `${sign}${diff} minutos · desvio significativo`, color: "text-primary-text" };
}

function formatDate(iso) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

let desvioId = 3;

const router = useRouter();
const planosDisponiveisParaExecucao = computed(() => planosStore.planos.filter((p) => p.status === "approved"));
const planoId = ref("");
const planoSelecionado = computed(() => planosDisponiveisParaExecucao.value.find((p) => p.id === planoId.value) ?? null);

const stages = ref([
  { label: "Etapa Inicial (Aquecimento)", planejado: 10, executado: 12, observacoes: "Aquecimento mais longo que o previsto" },
  { label: "Etapa de Fundamentação", planejado: 15, executado: 14, observacoes: "Exercício de passe curto funcionou bem" },
  { label: "Etapa Principal", planejado: 35, executado: 36, observacoes: "Jogo posicional com bom entendimento" },
]);

const desvios = ref([
  { id: 1, etapa: "Inicial", impacto: "Baixo", descricao: "Aquecimento mais longo, mas positivo" },
  { id: 2, etapa: "Principal", impacto: "Médio", descricao: "Um jogador lesionou no intervalo" },
]);

const status = ref(null);
const confirmed = ref(false);

const totalPlanejado = computed(() => stages.value.reduce((s, e) => s + e.planejado, 0));
const totalExecutado = computed(() => stages.value.reduce((s, e) => s + e.executado, 0));
const diffTotal = computed(() => totalExecutado.value - totalPlanejado.value);

function updateStage(idx, patch) {
  stages.value = stages.value.map((s, i) => (i === idx ? { ...s, ...patch } : s));
}

function addDesvio() {
  desvios.value = [...desvios.value, { id: ++desvioId, etapa: "Inicial", impacto: "Baixo", descricao: "" }];
}

function updateDesvio(id, patch) {
  desvios.value = desvios.value.map((d) => (d.id === id ? { ...d, ...patch } : d));
}

function removeDesvio(id) {
  desvios.value = desvios.value.filter((d) => d.id !== id);
}

function confirmarExecucao() {
  confirmed.value = true;
  if (planoSelecionado.value) markExecuted(planoSelecionado.value.id);
  status.value = "Execução confirmada.";
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="font-heading text-xl font-semibold text-ink sm:text-2xl">
        Registrar Execução<template v-if="planoSelecionado"> — {{ formatDate(planoSelecionado.sessionDate) }} — Colete {{ planoSelecionado.team }} — {{ planoSelecionado.coachName }}</template>
      </h1>
    </div>

    <Card title="Plano de Referência">
      <template #icon><Icon name="stamp" class="h-4 w-4" /></template>
      <Field label="Selecione um plano aprovado" required hint="Gate obrigatório (RF5): só planos aprovados aparecem aqui.">
        <select :class="inputClass" :value="planoId" @change="planoId = $event.target.value">
          <option value="">Selecione…</option>
          <option v-for="p in planosDisponiveisParaExecucao" :key="p.id" :value="p.id">
            {{ formatDate(p.sessionDate) }} · Colete {{ p.team }} · {{ p.coachName }} · aprovado em {{ formatDate(p.approvedAt?.slice(0, 10) ?? p.sessionDate) }}
          </option>
        </select>
      </Field>
    </Card>

    <Card v-if="!planoSelecionado">
      <p class="flex items-center gap-1.5 text-sm text-ink-muted">
        <Icon name="alert" class="h-4 w-4 text-warning" /> Nenhum plano selecionado — sem um plano aprovado, não
        é possível registrar execução.
      </p>
      <p v-if="planosDisponiveisParaExecucao.length === 0" class="mt-2 text-sm text-ink-muted">
        Nenhum plano aprovado disponível no momento.{{ " " }}
        <button type="button" @click="router.push('/planos/aprovacao')" class="font-medium text-primary-text hover:underline">
          Ver fila de aprovação →
        </button>
      </p>
    </Card>

    <template v-else>
      <Card>
        <p class="text-sm text-ink-muted">
          <span class="font-medium text-ink">Plano:</span> {{ formatDate(planoSelecionado.sessionDate) }} ·{{ " " }}
          {{ planoSelecionado.fase }} · {{ totalPlanejado }} min total
        </p>
        <p class="text-sm text-ink-muted">
          <span class="font-medium text-ink">Súmula:</span> Confirmada
        </p>
      </Card>

      <Card v-for="(stage, idx) in stages" :key="stage.label" :title="stage.label">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <span class="mb-1.5 block text-sm font-medium text-ink-muted">Planejado</span>
            <p class="rounded-xl border border-line-soft bg-surface-2 px-3 py-2.5 text-sm text-ink-muted">{{ stage.planejado }} minutos</p>
          </div>
          <Field label="Executado (minutos)">
            <input
              type="number"
              :min="0"
              :class="inputClass"
              :value="stage.executado"
              @input="updateStage(idx, { executado: Number($event.target.value) })"
            />
          </Field>
          <div>
            <span class="mb-1.5 block text-sm font-medium text-ink-muted">Desvio</span>
            <p :class="`rounded-xl border border-line-soft bg-surface-2 px-3 py-2.5 text-sm font-medium ${deviationInfo(stage.planejado, stage.executado).color}`">{{ deviationInfo(stage.planejado, stage.executado).text }}</p>
          </div>
        </div>
        <Field label="Observações">
          <input
            :class="inputClass"
            :value="stage.observacoes"
            @input="updateStage(idx, { observacoes: $event.target.value })"
          />
        </Field>
      </Card>

      <Card>
        <div class="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p class="font-semibold text-ink">
            Total Executado: {{ totalExecutado }} minutos (Planejado: {{ totalPlanejado }} min)
          </p>
          <p :class="`font-semibold ${Math.abs(diffTotal) <= 2 ? 'text-secondary' : 'text-warning'}`">
            Diferença Total: {{ diffTotal > 0 ? "+" : "" }}{{ diffTotal }} minutos
          </p>
        </div>
      </Card>

      <Card title="Desvios Registrados">
        <template #icon><Icon name="alert" class="h-4 w-4" /></template>
        <button type="button" @click="addDesvio" class="mb-4 flex items-center gap-1 text-sm font-medium text-primary-text">
          <Icon name="plus" class="h-3.5 w-3.5" /> Adicionar desvio
        </button>
        <div class="flex flex-col gap-3">
          <div v-for="(d, i) in desvios" :key="d.id" class="rounded-xl border border-line-soft bg-surface-2 p-3">
            <p class="mb-2 text-sm font-semibold text-ink">Desvio {{ i + 1 }}</p>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Etapa">
                <select
                  :class="inputClass"
                  :value="d.etapa"
                  @change="updateDesvio(d.id, { etapa: $event.target.value })"
                >
                  <option>Inicial</option>
                  <option>Fundamentação</option>
                  <option>Principal</option>
                </select>
              </Field>
              <Field label="Impacto">
                <select
                  :class="inputClass"
                  :value="d.impacto"
                  @change="updateDesvio(d.id, { impacto: $event.target.value })"
                >
                  <option>Baixo</option>
                  <option>Médio</option>
                  <option>Alto</option>
                </select>
              </Field>
              <Field label="Descrição">
                <input
                  :class="inputClass"
                  :value="d.descricao"
                  @input="updateDesvio(d.id, { descricao: $event.target.value })"
                />
              </Field>
            </div>
            <button
              type="button"
              @click="removeDesvio(d.id)"
              class="mt-1 flex items-center gap-1 text-xs font-medium text-primary-text hover:underline"
            >
              <Icon name="x" class="h-3.5 w-3.5" /> Remover
            </button>
          </div>
        </div>
      </Card>

      <div class="flex flex-wrap gap-2">
        <PrimaryButton variant="secondary" @click="status = 'Execução salva como rascunho.'">
          Salvar como Rascunho
        </PrimaryButton>
        <PrimaryButton @click="confirmarExecucao">
          Confirmar Execução
        </PrimaryButton>
      </div>

      <p v-if="status" role="status" class="flex items-center gap-1.5 rounded-xl border border-secondary/30 bg-secondary/10 px-3 py-2 text-sm text-secondary">
        <Icon name="check" class="h-4 w-4" /> {{ status }}
      </p>

      <Card v-if="confirmed" title="Ao confirmar">
        <template #icon><Icon name="alert" class="h-4 w-4 text-warning" /></template>
        <ul class="flex flex-col gap-1 text-sm text-ink-muted">
          <li>• Registro de Execução fica confirmado</li>
          <li>• Plano marcado como Executado</li>
          <li>• Avaliação pendente de metodologia definida pela coordenação pedagógica</li>
        </ul>
      </Card>
    </template>
  </div>
</template>

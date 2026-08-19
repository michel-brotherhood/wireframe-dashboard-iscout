<script setup>
import Icon from "../Icon.vue";
import StatusBadge from "./StatusBadge.vue";

// Faixa horizontal do ciclo da aula: Plano → Captura → Súmula → Execução →
// Vídeos → Análise. `etapas` vem de data/ciclo.js → cicloDaAula(treino).
// `compact` (Dashboard) esconde o StatusBadge e mostra só ✓/○ + rótulo.
defineProps({
  etapas: { type: Array, required: true },
  compact: { type: Boolean, default: false },
});
</script>

<template>
  <div class="no-scrollbar flex items-start gap-1 overflow-x-auto pb-1">
    <template v-for="(e, i) in etapas" :key="e.key">
      <div class="flex shrink-0 flex-col items-center gap-1 text-center">
        <span
          class="flex items-center justify-center rounded-full border"
          :class="[
            compact ? 'h-6 w-6' : 'h-7 w-7',
            e.done
              ? 'border-secondary/40 bg-secondary/15 text-secondary'
              : 'border-line bg-surface-2 text-ink-muted',
          ]"
        >
          <Icon :name="e.done ? 'check' : 'minus'" class="h-3.5 w-3.5" />
        </span>
        <span class="text-[11px] font-semibold text-ink">{{ e.label }}</span>
        <StatusBadge v-if="!compact" :status="e.status" />
      </div>
      <Icon
        v-if="i < etapas.length - 1"
        name="arrowRight"
        :class="['mt-1.5 shrink-0 text-ink-faint', compact ? 'h-3 w-3' : 'h-3.5 w-3.5']"
      />
    </template>
  </div>
</template>

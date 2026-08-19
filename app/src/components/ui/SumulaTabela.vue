<script setup>
import TeamBadge from "./TeamBadge.vue";

// Súmula no formato do modelo (2ª aba do XLS): cabeçalho Campo · Categoria ·
// Data (uma vez só) e tabela ATLETA · POSIÇÃO · CAMISA · TIME. Camisa/time
// ausentes aparecem como "A definir". Não traz dados da 1ª aba (responsável/
// e-mail) nem id/UUID — isso é intencional (briefing §18/§33).
defineProps({
  entries: { type: Array, required: true },
  campo: { type: String, default: "" },
  categoria: { type: String, default: "" },
  data: { type: String, default: "" },
});
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Cabeçalho: campo/categoria/data aparecem uma vez, não por linha -->
    <div class="flex flex-wrap gap-2 text-xs">
      <span v-if="campo" class="rounded-full bg-primary/15 px-2.5 py-1 font-semibold text-primary-text">
        Campo · {{ campo }}
      </span>
      <span v-if="categoria" class="rounded-full bg-surface-2 px-2.5 py-1 font-medium text-ink">
        Categoria · {{ categoria }}
      </span>
      <span v-if="data" class="rounded-full bg-surface-2 px-2.5 py-1 font-medium text-ink-muted">
        {{ data }}
      </span>
      <span class="rounded-full bg-surface-2 px-2.5 py-1 font-medium text-ink-muted">
        {{ entries.length }} {{ entries.length === 1 ? "atleta" : "atletas" }}
      </span>
    </div>

    <!-- Mobile: cards -->
    <div class="flex flex-col gap-2 md:hidden">
      <div
        v-for="(e, i) in entries"
        :key="i"
        class="flex items-center gap-3 rounded-xl border border-line-soft bg-surface-2 p-2.5"
      >
        <span
          class="font-heading flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-base font-bold"
          :class="e.jersey == null ? 'bg-surface text-ink-faint' : 'bg-surface text-ink'"
        >
          {{ e.jersey == null ? "—" : e.jersey }}
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-ink">{{ e.nome }}</p>
          <p class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-muted">
            <span class="rounded-full bg-surface px-2 py-0.5">{{ e.posicao || "—" }}</span>
            <TeamBadge v-if="e.time" :team="e.time" />
            <span v-else class="rounded-full bg-warning/15 px-2 py-0.5 font-medium text-warning">Time a definir</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Desktop: tabela ATLETA · POSIÇÃO · CAMISA · TIME -->
    <div class="hidden overflow-x-auto md:block">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
            <th class="py-2 pr-3 font-medium">Atleta</th>
            <th class="py-2 pr-3 font-medium">Posição</th>
            <th class="py-2 pr-3 font-medium">Camisa</th>
            <th class="py-2 font-medium">Time</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(e, i) in entries" :key="i" class="border-b border-line-soft last:border-0">
            <td class="py-2 pr-3 font-medium text-ink">{{ e.nome }}</td>
            <td class="py-2 pr-3 text-ink-muted">{{ e.posicao || "—" }}</td>
            <td class="py-2 pr-3 tabular-nums">
              <span v-if="e.jersey == null" class="text-warning">A definir</span>
              <span v-else class="font-semibold text-ink">{{ e.jersey }}</span>
            </td>
            <td class="py-2">
              <TeamBadge v-if="e.time" :team="e.time" />
              <span v-else class="text-warning">A definir</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

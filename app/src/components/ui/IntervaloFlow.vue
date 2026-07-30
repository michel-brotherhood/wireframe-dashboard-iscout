<script setup>
import Icon from "../Icon.vue";
const steps = ["Hidratar", "Repousar", "Instruir", "Ativar", "Voltar ao Jogo"];
</script>

<template>
  <div class="flex flex-wrap items-center gap-1.5">
    <span v-for="(s, i) in steps" :key="s" class="flex items-center gap-1.5">
      <span
        class="rounded-full px-2.5 py-1 text-xs font-semibold"
        :class="i === steps.length - 1 ? 'bg-secondary/15 text-secondary' : 'bg-primary/15 text-primary-text'"
      >
        {{ s }}
      </span>
      <Icon v-if="i < steps.length - 1" name="arrowRight" class="h-3.5 w-3.5 text-ink-muted" />
    </span>
  </div>
</template>

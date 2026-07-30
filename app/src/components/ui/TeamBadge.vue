<script setup>
defineProps({ team: { type: String, required: true } });
</script>

<template>
  <span class="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-1 text-xs font-semibold text-ink-muted">
    <span class="h-2 w-2 rounded-full" :class="team === 'Amarelo' ? 'bg-team-amarelo' : 'bg-team-azul'" />
    Colete {{ team }}
  </span>
</template>

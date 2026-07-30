<script setup>
defineProps({ status: { type: String, required: true } });

const statusDot = {
  draft: "bg-ink-faint",
  submitted: "bg-warning",
  changes_requested: "bg-warning",
  approved: "bg-secondary",
  executed: "bg-secondary",
  cancelled: "bg-ink-faint",
  confirmed: "bg-secondary",
  Executado: "bg-secondary",
  Rascunho: "bg-ink-faint",
};

const statusLabels = {
  draft: "Rascunho",
  submitted: "Aguardando Aprovação",
  changes_requested: "Ajustes Solicitados",
  approved: "Aprovado",
  executed: "Executado",
  cancelled: "Cancelado",
  confirmed: "Confirmado",
  Executado: "Executado",
  Rascunho: "Rascunho",
};
</script>

<template>
  <span class="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-muted">
    <span class="h-1.5 w-1.5 rounded-full" :class="statusDot[status] ?? 'bg-ink-faint'" />
    {{ statusLabels[status] ?? status }}
  </span>
</template>

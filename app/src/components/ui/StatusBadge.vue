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
  // Estados do ciclo da aula (Plano→Captura→Súmula→Execução→Vídeos→Análise)
  programada: "bg-warning",
  realizada: "bg-secondary",
  em_preparacao: "bg-warning",
  enviada: "bg-secondary",
  validada: "bg-secondary",
  aguardando: "bg-ink-faint",
  disponivel: "bg-secondary",
  pronta: "bg-secondary",
  pendente: "bg-warning",
  a_definir: "bg-warning",
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
  // Estados do ciclo da aula
  programada: "Programada",
  realizada: "Realizada",
  em_preparacao: "Em preparação",
  enviada: "Enviada",
  validada: "Validada",
  aguardando: "Aguardando",
  disponivel: "Disponíveis",
  pronta: "Pronta",
  pendente: "Pendente",
  a_definir: "A definir",
};
</script>

<template>
  <span class="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-muted">
    <span class="h-1.5 w-1.5 rounded-full" :class="statusDot[status] ?? 'bg-ink-faint'" />
    {{ statusLabels[status] ?? status }}
  </span>
</template>

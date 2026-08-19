<script setup>
import Icon from "../components/Icon.vue";
import { PrimaryButton } from "../components/ui";

// Prancheta tática do exercício da estação — substitui o antigo "Upload de
// imagem" (a briefing §7 prefere dado estruturado a foto/arquivo). Nesta fase
// de wireframe é uma representação estática ("Em breve"): o editor interativo
// (arrastar cones/jogadores/setas) e a persistência das formas vêm depois (§6).
// Fica dentro do plano de aula, então é reutilizada junto com "usar plano como
// base" (mesmo tema/categoria/turma).
defineProps({
  editavel: { type: Boolean, default: false },
});
</script>

<template>
  <div>
    <div class="mb-1.5 flex flex-wrap items-center gap-2">
      <span class="text-sm font-medium text-ink-muted">Prancheta tática (diagrama do exercício)</span>
      <span class="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-ink-muted">Em breve</span>
    </div>

    <!-- Mini-campo estático (exemplo do que a prancheta representará) -->
    <div class="w-full max-w-xs overflow-hidden rounded-xl border border-line-soft">
      <svg viewBox="0 0 320 190" class="block h-auto w-full" role="img" aria-label="Exemplo de prancheta tática do exercício">
        <!-- gramado -->
        <rect x="0" y="0" width="320" height="190" fill="#0f2a1c" />
        <!-- linhas do campo -->
        <g fill="none" stroke="rgba(255,255,255,0.30)" stroke-width="1.5">
          <rect x="10" y="10" width="300" height="170" rx="4" />
          <line x1="160" y1="10" x2="160" y2="180" />
          <circle cx="160" cy="95" r="26" />
          <rect x="10" y="55" width="42" height="80" />
          <rect x="268" y="55" width="42" height="80" />
        </g>
        <circle cx="160" cy="95" r="2.5" fill="rgba(255,255,255,0.5)" />

        <!-- exemplo: linha de passe (tracejada) + seta de movimento -->
        <line x1="96" y1="70" x2="150" y2="55" stroke="rgba(255,255,255,0.55)" stroke-width="1.5" stroke-dasharray="5 4" />
        <g stroke="rgba(255,255,255,0.6)" stroke-width="1.75" fill="none">
          <path d="M150 130 q40 -10 66 -34" />
          <path d="M210 100 l6 -8 M210 100 l9 1" />
        </g>

        <!-- cones (amber) -->
        <g fill="#f5b942">
          <path d="M124 118 l5 10 h-10 z" />
          <path d="M188 74 l5 10 h-10 z" />
        </g>

        <!-- jogadores (cores dos coletes) -->
        <circle cx="96" cy="70" r="7" fill="#e6d24a" stroke="#0f2a1c" stroke-width="1.5" />
        <circle cx="150" cy="130" r="7" fill="#5b8def" stroke="#0f2a1c" stroke-width="1.5" />
      </svg>
    </div>

    <p class="mt-1.5 text-xs text-ink-muted">
      O coach vai montar o exercício sobre o campo (cones, jogadores, movimentos) — salvo junto ao plano de aula
      e reutilizável ao usar um plano como base.
    </p>

    <div v-if="editavel" class="mt-2">
      <PrimaryButton variant="secondary" disabled>
        <Icon name="edit" class="h-4 w-4" /> Editar diagrama
      </PrimaryButton>
    </div>
  </div>
</template>

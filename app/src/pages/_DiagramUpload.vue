<script setup>
import Icon from "../components/Icon.vue";
import { PrimaryButton } from "../components/ui";
</script>

<template>
  <div class="mb-4">
    <span class="mb-1 block text-sm font-medium text-ink-muted">Diagrama de Campo</span>
    <div class="flex flex-wrap items-center gap-2">
      <PrimaryButton variant="secondary" disabled>
        <Icon name="upload" class="h-4 w-4" /> Upload Diagrama
      </PrimaryButton>
      <PrimaryButton variant="secondary" disabled>
        <Icon name="edit" class="h-4 w-4" /> Desenhar no Editor
      </PrimaryButton>
      <span class="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-ink-muted">Em breve</span>
    </div>
    <div
      class="mt-2 flex h-32 w-full max-w-xs items-center justify-center rounded-xl border-2 border-dashed border-line bg-surface-2/50 text-xs uppercase tracking-wide text-ink-muted sm:h-40 sm:w-72"
    >
      Imagem do diagrama · 300×300px
    </div>
  </div>
</template>

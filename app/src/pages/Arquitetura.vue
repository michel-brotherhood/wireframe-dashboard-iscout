<script setup>
import { ref, computed } from "vue";
import { diagrams } from "../data/diagrams";
import Card from "../components/ui/Card.vue";
import Icon from "../components/Icon.vue";
import MermaidDiagram from "../components/MermaidDiagram.vue";

const kindIcon = {
  flow: "network",
  sequence: "share",
  state: "check",
  data: "clipboard",
};

const activeId = ref(diagrams[0].id);
const active = computed(() => diagrams.find((d) => d.id === activeId.value) ?? diagrams[0]);
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="font-heading flex items-center gap-2 text-xl font-semibold text-ink sm:text-2xl">
        <Icon name="network" class="h-6 w-6 text-primary" />
        Arquitetura do Sistema
      </h1>
      <p class="mt-1 text-sm text-ink-muted">
        Referência técnica renderizada a partir dos diagramas Mermaid do projeto — separada do wireframe do
        dashboard, que representa apenas o esqueleto visual das telas.
      </p>
    </div>

    <div class="flex flex-col gap-6 lg:flex-row">
      <nav
        aria-label="Selecionar diagrama"
        class="flex gap-2 overflow-x-auto overscroll-x-contain pb-1 lg:w-64 lg:shrink-0 lg:flex-col lg:overflow-visible lg:pb-0"
      >
        <button
          v-for="d in diagrams"
          :key="d.id"
          type="button"
          :aria-current="d.id === activeId"
          @click="activeId = d.id"
          :class="`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors lg:shrink ${
            d.id === activeId
              ? 'border-primary/40 bg-primary/10 text-primary-text'
              : 'border-line bg-surface text-ink-muted hover:bg-surface-2 hover:text-ink'
          }`"
        >
          <Icon :name="kindIcon[d.kind]" class="h-4 w-4 shrink-0" />
          {{ d.title }}
        </button>
      </nav>

      <Card :title="active.title" class="min-w-0 flex-1">
        <template #icon><Icon :name="kindIcon[active.kind]" class="h-4 w-4" /></template>
        <p class="mb-4 text-sm text-ink-muted">{{ active.description }}</p>
        <MermaidDiagram :key="active.id" :source="active.source" />
      </Card>
    </div>
  </div>
</template>

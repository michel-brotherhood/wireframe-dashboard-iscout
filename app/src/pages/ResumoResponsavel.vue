<script setup>
import { computed } from "vue";
import { treinos } from "../data/mockData";
import Card from "../components/ui/Card.vue";
import Icon from "../components/Icon.vue";
import { session } from "../stores/session";
import { escopoContem } from "../data/users";

// Nome do atleta "acompanhado" nesta demonstração — sem autenticação real,
// então não há como saber de fato qual responsável está olhando a tela.
const MEU_ATLETA = "Gustavo Silva";

const COMUNICADOS = [
  { titulo: "Treino de sábado remarcado", detalhe: "A sessão de sábado (04/07) passa para domingo (05/07) às 09h, mesmo campo." },
  { titulo: "Uniforme completo obrigatório", detalhe: "A partir da próxima semana, chuteira + caneleira são obrigatórias em todos os treinos." },
];

function formatDate(iso) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

// Responsável só acompanha a turma do seu atleta (escopo do usuário).
const meusTreinos = computed(() => treinos.filter((t) => escopoContem(t, session.user)));
const ultimoTreino = computed(
  () => meusTreinos.value.find((t) => t.status === "Executado") ?? meusTreinos.value[0] ?? treinos[0]
);
const plano = computed(() => ultimoTreino.value.plano);
const sumula = computed(() => ultimoTreino.value.sumula);
const presente = computed(() => sumula.value.entries.some((e) => e.nome === MEU_ATLETA));
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="font-heading flex items-center gap-2 text-xl font-semibold text-ink sm:text-2xl">
        <Icon name="trophy" class="h-6 w-6 text-primary" />
        Resumo da Aula
      </h1>
      <p class="mt-1 text-sm text-ink-muted">
        {{ formatDate(ultimoTreino.sessionDate) }} · {{ ultimoTreino.categoria }} · {{ ultimoTreino.turma }}
      </p>
    </div>

    <Card title="O que foi trabalhado">
      <template #icon><Icon name="clipboard" class="h-4 w-4" /></template>
      <div class="flex flex-col gap-3 text-sm">
        <div>
          <p class="text-ink-muted">Tema trabalhado</p>
          <p class="font-medium text-ink">
            {{ plano.tema }} · {{ plano.subtema }}
          </p>
        </div>
        <div>
          <p class="text-ink-muted">Objetivo pedagógico</p>
          <p class="font-medium text-ink">{{ plano.etapaPrincipal.objetivo }}</p>
        </div>
        <div>
          <p class="text-ink-muted">Fase de jogo</p>
          <p class="font-medium text-ink">{{ plano.fase }}</p>
        </div>
      </div>
    </Card>

    <Card title="Presença">
      <template #icon><Icon name="check" class="h-4 w-4" /></template>
      <div class="flex items-center gap-2 text-sm">
        <span
          :class="`flex h-8 w-8 items-center justify-center rounded-full ${
            presente ? 'bg-secondary/15 text-secondary' : 'bg-primary/15 text-primary-text'
          }`"
        >
          <Icon :name="presente ? 'check' : 'x'" class="h-4 w-4" />
        </span>
        <div>
          <p class="font-medium text-ink">{{ MEU_ATLETA }}</p>
          <p class="text-ink-muted">{{ presente ? "Presente nesta aula" : "Ausente nesta aula" }}</p>
        </div>
      </div>
    </Card>

    <Card title="Comunicados">
      <template #icon><Icon name="alert" class="h-4 w-4" /></template>
      <ul class="flex flex-col gap-3">
        <li
          v-for="c in COMUNICADOS"
          :key="c.titulo"
          class="rounded-xl border border-line-soft bg-surface-2 p-3 text-sm"
        >
          <p class="font-medium text-ink">{{ c.titulo }}</p>
          <p class="mt-0.5 text-ink-muted">{{ c.detalhe }}</p>
        </li>
      </ul>
    </Card>
  </div>
</template>

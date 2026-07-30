<script setup>
import { ref, computed } from "vue";
import { Card, PrimaryButton, ProgressBar, conformanceTextColor } from "../components/ui";
import Icon from "../components/Icon.vue";
import { session } from "../stores/session";
import { gruposDeReforco } from "../data/fundamentos";

const grupos = computed(() => gruposDeReforco(session.user));
const status = ref(null);

function sugerir(fundamento, qtd) {
  status.value = `Sugestão registrada (protótipo): sessão de reforço de ${fundamento} para ${qtd} atleta${qtd > 1 ? "s" : ""}.`;
}

function contexto(a) {
  return `${a.posicao} · ${a.categoria} · ${a.turma}`;
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="font-heading flex items-center gap-2 text-xl font-semibold text-ink sm:text-2xl">
        <Icon name="bot" class="h-6 w-6 text-primary" />
        Recomendações de Reforço
      </h1>
      <p class="mt-1 text-sm text-ink-muted">
        Sugestões de IA (protótipo) a partir dos indicadores de fundamentos — atletas com deficiência
        são agrupados para treinos de reforço.
      </p>
    </div>

    <p class="flex items-start gap-2 rounded-xl border border-line-soft bg-surface-2 p-3 text-sm text-ink-muted">
      <Icon name="alert" class="mt-0.5 h-4 w-4 shrink-0 text-warning" />
      Dados de fundamentos de demonstração. Esta base estruturada é o que alimentará os futuros agentes de
      IA (montar elenco, recomendar jogadores etc.). Nota abaixo de 60 é considerada deficiência.
    </p>

    <p
      v-if="status"
      role="status"
      class="flex items-center gap-1.5 rounded-xl border border-secondary/30 bg-secondary/10 px-3 py-2 text-sm text-secondary"
    >
      <Icon name="check" class="h-4 w-4" /> {{ status }}
    </p>

    <p v-if="grupos.length === 0" class="rounded-2xl border border-line bg-surface p-4 text-sm text-ink-muted">
      Nenhum grupo de reforço sugerido no seu escopo no momento — os atletas estão dentro do esperado nos
      fundamentos avaliados.
    </p>

    <Card v-for="g in grupos" :key="g.fundamento" :title="`Reforço: ${g.fundamento}`">
      <template #icon><Icon name="bot" class="h-4 w-4" /></template>
      <template #headerAction>
        <span class="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-muted">
          {{ g.atletas.length }} atletas · média {{ g.media }}
        </span>
      </template>

      <ul class="flex flex-col gap-2">
        <li
          v-for="a in g.atletas"
          :key="a.id"
          class="flex flex-col gap-2 rounded-xl border border-line-soft bg-surface-2 p-3 sm:flex-row sm:items-center"
        >
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-ink">{{ a.nome }}</p>
            <p class="truncate text-xs text-ink-muted">{{ contexto(a) }}</p>
          </div>
          <div class="flex items-center gap-3 sm:w-56">
            <div class="min-w-0 flex-1">
              <ProgressBar :value="a.score" size="sm" />
            </div>
            <span class="w-8 shrink-0 text-right text-sm font-semibold" :class="conformanceTextColor(a.score)">
              {{ a.score }}
            </span>
          </div>
        </li>
      </ul>

      <div class="mt-3 flex justify-end">
        <PrimaryButton variant="secondary" @click="sugerir(g.fundamento, g.atletas.length)">
          <Icon name="plus" class="h-4 w-4" /> Sugerir sessão de reforço
        </PrimaryButton>
      </div>
    </Card>
  </div>
</template>

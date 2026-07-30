<script setup>
import { ref } from "vue";
import Card from "../components/ui/Card.vue";
import Icon from "../components/Icon.vue";
import { USERS, escopoLabel } from "../data/users";
import { session } from "../stores/session";

function initials(nome) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

const currentUser = session.user;

// Estado de "ativo" apenas em memória (protótipo mock, sem backend).
const inativos = ref(new Set());

function toggle(id) {
  const next = new Set(inativos.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  inativos.value = next;
}

const cards = [
  { icon: "network", label: "Unidades e categorias" },
  { icon: "clipboard", label: "Turmas e treinadores" },
  { icon: "calendar", label: "Prazos de aprovação" },
];
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="font-heading flex items-center gap-2 text-xl font-semibold text-ink sm:text-2xl">
        <Icon name="menu" class="h-6 w-6 text-primary" />
        Gestão de Acessos
      </h1>
      <p class="mt-1 text-sm text-ink-muted">
        Administração de usuários e permissões — os gestores controlam quem acessa e o que cada
        perfil enxerga.
      </p>
    </div>

    <Card title="Como funciona o acesso">
      <template #icon><Icon name="stamp" class="h-4 w-4" /></template>
      <ul class="flex flex-col gap-2 text-sm text-ink-muted">
        <li>
          <span class="font-medium text-ink">Papel</span> define o que o usuário pode fazer
          (treinador cria, head coach aprova, gestor administra, responsável acompanha).
        </li>
        <li>
          <span class="font-medium text-ink">Escopo</span> define a área que ele atende
          (unidade, categorias e turmas) — é o recorte do que aparece para ele.
        </li>
        <li>Ativar/desativar um usuário libera ou bloqueia o acesso dele à plataforma.</li>
      </ul>
    </Card>

    <Card :title="`Usuários (${USERS.length})`">
      <template #icon><Icon name="clipboard" class="h-4 w-4" /></template>
      <ul class="flex flex-col gap-2">
        <li
          v-for="u in USERS"
          :key="u.id"
          class="flex flex-col gap-3 rounded-xl border border-line-soft bg-surface-2 p-3 sm:flex-row sm:items-center"
        >
          <div class="flex min-w-0 flex-1 items-center gap-3">
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-semibold text-ink-muted"
              aria-hidden="true"
            >
              {{ initials(u.nome) }}
            </span>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <p class="text-sm font-semibold text-ink">{{ u.nome }}</p>
                <span class="rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                  {{ u.cargo }}
                </span>
                <span
                  v-if="u.id === currentUser.id"
                  class="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary-text"
                >
                  Você
                </span>
              </div>
              <p class="mt-0.5 truncate text-xs text-ink-muted">{{ escopoLabel(u) }}</p>
            </div>
          </div>
          <button
            type="button"
            @click="toggle(u.id)"
            :disabled="u.id === currentUser.id"
            :aria-pressed="!inativos.has(u.id)"
            :class="`flex shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${
              !inativos.has(u.id)
                ? 'border-secondary/40 bg-secondary/10 text-secondary'
                : 'border-line bg-surface text-ink-muted'
            }`"
          >
            <span
              :class="`h-2 w-2 rounded-full ${!inativos.has(u.id) ? 'bg-secondary' : 'bg-ink-faint'}`"
              aria-hidden="true"
            />
            {{ !inativos.has(u.id) ? "Ativo" : "Inativo" }}
          </button>
        </li>
      </ul>
      <p class="mt-3 text-xs text-ink-muted">
        Protótipo — alterações de acesso são simuladas nesta tela e não persistem.
      </p>
    </Card>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card v-for="item in cards" :key="item.label">
        <div class="flex items-center gap-3 text-ink-muted">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-muted">
            <Icon :name="item.icon" class="h-5 w-5" />
          </span>
          <div>
            <p class="text-sm font-medium text-ink">{{ item.label }}</p>
            <p class="text-xs text-ink-muted">Em definição</p>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Card, Field, PrimaryButton, RadioGroup, CheckboxGroup, inputClass } from "../components/ui";
import Icon from "../components/Icon.vue";
import { escopoLabel } from "../data/users";
import { CATEGORIAS } from "../data/planoOptions";
import { usersStore, addUser, toggleAtivo, nomeEmUso } from "../stores/users";
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

function slug(nome) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]+/g, ".")
    .replace(/^\.|\.$/g, "");
}

const currentUser = session.user;

const TURMAS = ["Turma A", "Turma B"];
const PAPEIS = ["Coach", "Admin"];

// Formulário "Adicionar usuário" — só admins acessam esta tela (guarda de
// rota); prototípo, sem backend: o usuário criado vive em stores/users.js
// (localStorage), persiste no navegador e já entra ativo para login.
const showForm = ref(false);
const nome = ref("");
const papel = ref("Coach");
const categorias = ref([]);
const turmas = ref([]);
const turmaPropria = ref(false);
// Senha única de demonstração ("iscout") pré-preenchida — protótipo, sem
// necessidade de senha forte; o admin pode trocar se quiser outra.
const senha = ref("iscout");
const formError = ref(null);
const status = ref(null);

function resetForm() {
  nome.value = "";
  papel.value = "Coach";
  categorias.value = [];
  turmas.value = [];
  turmaPropria.value = false;
  senha.value = "iscout";
  formError.value = null;
}

function handleAddUser() {
  if (!nome.value.trim()) {
    formError.value = "Informe o nome do usuário.";
    return;
  }
  // Login identifica o usuário pelo nome — um nome repetido deixaria um dos
  // dois inacessível na tela de login.
  if (nomeEmUso(nome.value)) {
    formError.value = "Já existe um usuário com esse nome — use um nome diferente para o login funcionar.";
    return;
  }
  if (categorias.value.length === 0 || turmas.value.length === 0) {
    formError.value = "Selecione ao menos uma categoria e uma turma.";
    return;
  }
  if (!senha.value.trim()) {
    formError.value = "Defina uma senha de demonstração.";
    return;
  }
  const role = papel.value === "Admin" ? "admin" : "coach";
  addUser({
    nome: nome.value.trim(),
    email: `${slug(nome.value.trim())}@bigsoccer.com`,
    role,
    cargo: papel.value,
    senha: senha.value.trim(),
    escopo: { unidade: "Atibaia", categorias: [...categorias.value], turmas: [...turmas.value] },
    ...(turmaPropria.value ? { coachName: nome.value.trim() } : {}),
  });
  status.value = `${nome.value.trim()} adicionado(a) como ${papel.value}.`;
  resetForm();
  showForm.value = false;
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <h1 class="font-heading flex items-center gap-2 text-xl font-semibold text-ink sm:text-2xl">
        <Icon name="menu" class="h-6 w-6 text-primary" />
        Gestão de Acessos
      </h1>
      <p class="mt-1 text-sm text-ink-muted">
        Administração de usuários e permissões — os admins controlam quem acessa e o que cada
        perfil enxerga.
      </p>
    </div>

    <Card title="Como funciona o acesso">
      <template #icon><Icon name="stamp" class="h-4 w-4" /></template>
      <ul class="flex flex-col gap-2 text-sm text-ink-muted">
        <li>
          <span class="font-medium text-ink">Papel</span> define o que o usuário pode fazer
          (coach cria planos, súmulas e execuções; admin aprova os planos e administra os
          acessos; responsável só acompanha).
        </li>
        <li>
          <span class="font-medium text-ink">Escopo</span> define a área que ele atende
          (unidade, categorias e turmas) — é o recorte do que aparece para ele.
        </li>
        <li>Ativar/desativar um usuário libera ou bloqueia o login dele na plataforma.</li>
      </ul>
    </Card>

    <p
      v-if="status"
      role="status"
      class="flex items-center gap-1.5 rounded-xl border border-secondary/30 bg-secondary/10 px-3 py-2 text-sm text-secondary"
    >
      <Icon name="check" class="h-4 w-4" /> {{ status }}
    </p>

    <Card :title="`Usuários (${usersStore.users.length})`">
      <template #icon><Icon name="clipboard" class="h-4 w-4" /></template>
      <template #headerAction>
        <PrimaryButton variant="secondary" @click="showForm = !showForm">
          <Icon :name="showForm ? 'x' : 'plus'" class="h-4 w-4" />
          {{ showForm ? "Cancelar" : "Adicionar usuário" }}
        </PrimaryButton>
      </template>

      <div v-if="showForm" class="mb-4 flex flex-col gap-3 rounded-xl border border-line-soft bg-surface-2 p-3">
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Nome" required>
            <input :class="inputClass" v-model="nome" placeholder="Nome completo" />
          </Field>
          <Field label="Senha de demonstração" required hint="Padrão do protótipo: iscout — pode trocar se quiser.">
            <input :class="inputClass" v-model="senha" placeholder="ex.: iscout" />
          </Field>
        </div>
        <Field label="Papel">
          <RadioGroup :options="PAPEIS" v-model="papel" />
        </Field>
        <Field label="Categorias" required>
          <CheckboxGroup :options="CATEGORIAS" v-model="categorias" />
        </Field>
        <Field label="Turmas" required>
          <CheckboxGroup :options="TURMAS" v-model="turmas" />
        </Field>
        <label class="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" class="h-4 w-4 rounded border-line bg-surface-2 text-primary focus:ring-primary" v-model="turmaPropria" />
          Tem turma própria (aparece como "Treinador Responsável" ao criar planos)
        </label>
        <p v-if="formError" role="alert" class="flex items-center gap-1.5 text-sm text-primary-text">
          <Icon name="alert" class="h-4 w-4" /> {{ formError }}
        </p>
        <div>
          <PrimaryButton @click="handleAddUser">
            <Icon name="check" class="h-4 w-4" /> Salvar usuário
          </PrimaryButton>
        </div>
      </div>

      <ul class="flex flex-col gap-2">
        <li
          v-for="u in usersStore.users"
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
            @click="toggleAtivo(u.id)"
            :disabled="u.id === currentUser.id"
            :aria-pressed="u.ativo"
            :class="`flex shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${
              u.ativo
                ? 'border-secondary/40 bg-secondary/10 text-secondary'
                : 'border-line bg-surface text-ink-muted'
            }`"
          >
            <span :class="`h-2 w-2 rounded-full ${u.ativo ? 'bg-secondary' : 'bg-ink-faint'}`" aria-hidden="true" />
            {{ u.ativo ? "Ativo" : "Inativo" }}
          </button>
        </li>
      </ul>
      <p class="mt-3 text-xs text-ink-muted">
        Protótipo — usuários adicionados e o estado ativo/inativo ficam salvos neste navegador
        (sem backend). Um usuário inativo não consegue fazer login.
      </p>
    </Card>
  </div>
</template>

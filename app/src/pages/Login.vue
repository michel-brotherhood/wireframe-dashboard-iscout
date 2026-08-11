<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import logo from "../assets/brand/marca-principal.png";
import { escopoLabel } from "../data/users";
import { usersStore, verifyLogin } from "../stores/users";
import { login } from "../stores/session";
import { Field, inputClass, inputErrorClass } from "../components/ui";
import Icon from "../components/Icon.vue";

function initials(nome) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

const users = computed(() => usersStore.users);
const selectedId = ref(usersStore.users[0].id);
const selected = computed(() => usersStore.users.find((u) => u.id === selectedId.value));
const senha = ref("");
const error = ref(null);

function selectUser(id) {
  selectedId.value = id;
  error.value = null;
}

const router = useRouter();

// A rota do vue-router não muda ao logar (só a sessão) — sem isto, o
// router-view continuaria na última rota da sessão anterior (ex.: outro
// usuário tinha deixado "/execution/novo" aberto) sem passar pela guarda de
// papel de novo, já que nenhuma navegação nova dispara o beforeEach. Navegar
// para "/" antes de autenticar garante que o usuário sempre entra pela home
// do próprio papel, validada pela guarda.
async function handleLogin() {
  const user = verifyLogin(selectedId.value, senha.value);
  if (!user) {
    error.value = selected.value.ativo === false ? "Este usuário está inativo." : "Senha incorreta.";
    return;
  }
  await router.push("/");
  login(user);
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-canvas px-4 py-10">
    <div class="w-full max-w-md">
      <div class="mb-8 flex flex-col items-center text-center">
        <img :src="logo" alt="BIG SOCCER by iSCOUT" class="h-12 w-auto" />
        <h1 class="font-heading mt-6 text-xl font-semibold text-ink">Acessar plataforma</h1>
        <p class="mt-1 text-sm text-ink-muted">
          Selecione seu usuário e informe a senha. O acesso de cada usuário é definido pelo
          papel (Coach cria, Admin aprova e administra) e pela área que ele atende.
        </p>
      </div>

      <div class="rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <fieldset>
          <legend class="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Selecione seu usuário
          </legend>
          <div class="flex flex-col gap-2">
            <label
              v-for="u in users"
              :key="u.id"
              :class="`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                u.ativo === false
                  ? 'cursor-not-allowed border-line-soft bg-surface-2 opacity-50'
                  : 'cursor-pointer ' +
                    (u.id === selectedId
                      ? 'border-primary bg-primary/10'
                      : 'border-line-soft bg-surface-2 hover:border-ink-faint')
              }`"
            >
              <input
                type="radio"
                name="usuario"
                :value="u.id"
                :checked="u.id === selectedId"
                :disabled="u.ativo === false"
                @change="selectUser(u.id)"
                class="sr-only"
              />
              <span
                :class="`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  u.id === selectedId ? 'bg-primary-hover text-white' : 'bg-surface text-ink-muted'
                }`"
                aria-hidden="true"
              >
                {{ initials(u.nome) }}
              </span>
              <span class="min-w-0 flex-1">
                <span class="flex items-center gap-2">
                  <span class="truncate text-sm font-semibold text-ink">{{ u.nome }}</span>
                  <span class="shrink-0 rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                    {{ u.cargo }}
                  </span>
                  <span v-if="u.ativo === false" class="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary-text">
                    Inativo
                  </span>
                </span>
                <span class="mt-0.5 block truncate text-xs text-ink-muted">{{ escopoLabel(u) }}</span>
              </span>
              <Icon v-if="u.id === selectedId" name="check" class="h-4 w-4 shrink-0 text-primary" />
            </label>
          </div>
        </fieldset>

        <div class="mt-4">
          <Field label="Senha" required :error="error">
            <input
              type="password"
              :class="error ? inputErrorClass : inputClass"
              :value="senha"
              autocomplete="current-password"
              placeholder="Senha de demonstração"
              @input="senha = $event.target.value; error = null"
              @keydown.enter="handleLogin"
            />
          </Field>
        </div>

        <button
          type="button"
          @click="handleLogin"
          class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-hover px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-active focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:ring-primary"
        >
          Entrar como {{ selected.nome.split(" ")[0] }}
          <Icon name="arrowRight" class="h-4 w-4" />
        </button>
      </div>

      <p class="mt-4 text-center text-xs text-ink-muted">
        Protótipo — login e senha simulados no navegador, sem servidor. Senha de demonstração:
        primeiro nome em minúsculas + "123" (ex.: joao123).
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import logo from "../assets/brand/marca-principal.png";
import { USERS, escopoLabel } from "../data/users";
import { login } from "../stores/session";
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

const selectedId = ref(USERS[0].id);
const selected = computed(() => USERS.find((u) => u.id === selectedId.value));

const router = useRouter();

// A rota do vue-router não muda ao logar (só a sessão) — sem isto, o
// router-view continuaria na última rota da sessão anterior (ex.: outro
// usuário tinha deixado "/execution/novo" aberto) sem passar pela guarda de
// papel de novo, já que nenhuma navegação nova dispara o beforeEach. Navegar
// para "/" antes de autenticar garante que o usuário sempre entra pela home
// do próprio papel, validada pela guarda.
async function handleLogin() {
  await router.push("/");
  login(selected.value);
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-canvas px-4 py-10">
    <div class="w-full max-w-md">
      <div class="mb-8 flex flex-col items-center text-center">
        <img :src="logo" alt="BIG SOCCER by iSCOUT" class="h-12 w-auto" />
        <h1 class="font-heading mt-6 text-xl font-semibold text-ink">Acessar plataforma</h1>
        <p class="mt-1 text-sm text-ink-muted">
          Ambiente de demonstração — escolha um perfil para entrar. O acesso de cada
          usuário é definido pelo cargo e pela área que ele atende.
        </p>
      </div>

      <div class="rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <fieldset>
          <legend class="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Selecione seu usuário
          </legend>
          <div class="flex flex-col gap-2">
            <label
              v-for="u in USERS"
              :key="u.id"
              :class="`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                u.id === selectedId
                  ? 'border-primary bg-primary/10'
                  : 'border-line-soft bg-surface-2 hover:border-ink-faint'
              }`"
            >
              <input
                type="radio"
                name="usuario"
                :value="u.id"
                :checked="u.id === selectedId"
                @change="selectedId = u.id"
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
                </span>
                <span class="mt-0.5 block truncate text-xs text-ink-muted">{{ escopoLabel(u) }}</span>
              </span>
              <Icon v-if="u.id === selectedId" name="check" class="h-4 w-4 shrink-0 text-primary" />
            </label>
          </div>
        </fieldset>

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
        Protótipo — autenticação simulada, sem senha e sem servidor.
      </p>
    </div>
  </div>
</template>

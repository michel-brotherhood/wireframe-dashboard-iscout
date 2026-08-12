<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import logo from "../assets/brand/marca-principal.png";
import { verifyLoginByNome } from "../stores/users";
import { login } from "../stores/session";
import { Field, PrimaryButton, inputClass } from "../components/ui";
import Icon from "../components/Icon.vue";

const nomeLogin = ref("");
const senha = ref("");
const error = ref(null);

const router = useRouter();

// A rota do vue-router não muda ao logar (só a sessão) — sem isto, o
// router-view continuaria na última rota da sessão anterior (ex.: outro
// usuário tinha deixado "/execution/novo" aberto) sem passar pela guarda de
// papel de novo, já que nenhuma navegação nova dispara o beforeEach. Navegar
// para "/" antes de autenticar garante que o usuário sempre entra pela home
// do próprio papel, validada pela guarda.
async function handleLogin() {
  const user = verifyLoginByNome(nomeLogin.value, senha.value);
  if (!user) {
    error.value = "Login ou senha incorretos.";
    return;
  }
  await router.push("/");
  login(user);
}

function clearError() {
  error.value = null;
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-canvas px-4 py-10">
    <div class="w-full max-w-sm">
      <div class="mb-8 flex flex-col items-center text-center">
        <img :src="logo" alt="BIG SOCCER by iSCOUT" class="h-12 w-auto" />
        <h1 class="font-heading mt-6 text-xl font-semibold text-ink">Acessar plataforma</h1>
        <p class="mt-1 text-sm text-ink-muted">Informe seu nome e senha para entrar.</p>
      </div>

      <form class="rounded-2xl border border-line bg-surface p-4 sm:p-5" @submit.prevent="handleLogin">
        <Field label="Login">
          <input
            :class="inputClass"
            :value="nomeLogin"
            autocomplete="username"
            autocapitalize="none"
            placeholder="Seu nome (ex.: gerson)"
            @input="nomeLogin = $event.target.value; clearError()"
          />
        </Field>
        <Field label="Senha">
          <input
            type="password"
            :class="inputClass"
            :value="senha"
            autocomplete="current-password"
            placeholder="Senha"
            @input="senha = $event.target.value; clearError()"
          />
        </Field>

        <p
          v-if="error"
          role="alert"
          class="mb-4 -mt-1 flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary-text"
        >
          <Icon name="alert" class="h-4 w-4 shrink-0" /> {{ error }}
        </p>

        <PrimaryButton type="submit" class="w-full justify-center">
          Entrar <Icon name="arrowRight" class="h-4 w-4" />
        </PrimaryButton>
      </form>

      <p class="mt-4 text-center text-xs text-ink-muted">
        Protótipo — login e senha simulados no navegador, sem servidor. Senha de demonstração
        para todos os usuários: <span class="font-medium text-ink">iscout</span>.
      </p>
    </div>
  </div>
</template>

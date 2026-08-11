<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import logo from "../assets/brand/marca-principal.png";
import logoCompact from "../assets/brand/marca-compacta.png";
import Icon from "./Icon.vue";
import NotificationBell from "./NotificationBell.vue";
import { session, logout } from "../stores/session";

// Cada perfil vê ações diferentes — coach cria planos/súmulas/execuções,
// admin aprova planos e administra acessos, responsável só acompanha.
function navItemsForRole(role) {
  const items = [{ to: "/", label: role === "responsavel" ? "Resumo" : "Dashboard", icon: "lineChart" }];
  if (role !== "responsavel") {
    items.push(
      { to: "/planos/novo", label: "Novo Plano", icon: "clipboard" },
      { to: "/sumulas/novo", label: "Nova Súmula", icon: "ball" },
      { to: "/execution/novo", label: "Registrar Execução", icon: "barChart" },
    );
  }
  if (role === "admin") {
    // Admin aprova planos submetidos pelos coaches e administra os acessos.
    items.push(
      { to: "/planos/aprovacao", label: "Aprovações", icon: "stamp" },
      { to: "/configuracoes", label: "Acessos", icon: "menu" },
    );
  }
  // Recomendações de reforço (IA) — para quem planeja/supervisiona treinos.
  if (role !== "responsavel") {
    items.push({ to: "/reforco", label: "Reforço", icon: "bot" });
  }
  return items;
}

// Rótulo curto da página atual, exibido ao lado da logo no header.
function pageTitleForPath(pathname, role) {
  if (pathname === "/") return role === "responsavel" ? "Resumo" : "Dashboard";
  if (pathname.startsWith("/planos/aprovacao")) return "Aprovações";
  if (pathname.startsWith("/planos")) return "Novo Plano";
  if (pathname.startsWith("/sumulas")) return "Nova Súmula";
  if (pathname.startsWith("/execution")) return "Registrar Execução";
  if (pathname.startsWith("/treinos")) return "Detalhe do Treino";
  if (pathname.startsWith("/configuracoes")) return "Gestão de Acessos";
  if (pathname.startsWith("/reforco")) return "Recomendações de Reforço";
  if (pathname.startsWith("/arquitetura")) return "Arquitetura";
  return "";
}

const referenceNavItem = { to: "/arquitetura", label: "Arquitetura", icon: "network" };
// Arquitetura aponta direto para o diagrama fonte no Mermaid (nova aba) — a
// referência técnica vive lá, não é replicada dentro do wireframe.
const ARQUITETURA_MERMAID_URL = "https://mermaid.ai/d/400df741-4a78-42b7-82b3-38667bbb9cf6";

function initials(nome) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

const route = useRoute();
const router = useRouter();

// Reseta a rota ao sair — evita que a próxima sessão (outro usuário logando)
// reabra a página que este usuário estava vendo antes da guarda de papel
// reavaliar (ver handleLogin em Login.vue).
function handleLogout() {
  logout();
  router.push("/");
}

const user = computed(() => session.user);
const role = computed(() => session.user.role);
const pageTitle = computed(() => pageTitleForPath(route.path, role.value));
const items = computed(() => navItemsForRole(role.value));
const showArquitetura = computed(() => role.value !== "responsavel");

// Quem pode criar planos (coach/admin) ganha o "Novo Plano" como ação
// primária (FAB); responsável não tem esse item, então find() já resolve
// undefined para ele sem precisar checar o papel aqui.
const fabItem = computed(() => items.value.find((i) => i.to === "/planos/novo"));
const bottomTabs = computed(() => items.value.filter((i) => i !== fabItem.value));
const bottomTabsLeft = computed(() =>
  fabItem.value ? bottomTabs.value.slice(0, Math.ceil(bottomTabs.value.length / 2)) : bottomTabs.value,
);
const bottomTabsRight = computed(() =>
  fabItem.value ? bottomTabs.value.slice(Math.ceil(bottomTabs.value.length / 2)) : [],
);
// Responsável has a single destination — a bottom bar with one tab reads
// as broken UI, so skip it entirely rather than render a sparse bar.
const hasBottomNav = computed(
  () => Boolean(fabItem.value) || bottomTabsLeft.value.length + bottomTabsRight.value.length > 1,
);
</script>

<template>
  <div class="min-h-screen overflow-x-hidden bg-canvas">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2 focus:text-ink focus:shadow"
    >
      Pular para o conteúdo
    </a>
    <header class="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <div class="flex min-w-0 items-center gap-2.5">
          <router-link to="/" class="flex shrink-0 items-center" aria-label="BIG SOCCER by iSCOUT - início">
            <img :src="logo" alt="BIG SOCCER by iSCOUT" class="hidden h-9 w-auto sm:block" />
            <img :src="logoCompact" alt="BIG SOCCER by iSCOUT" class="h-8 w-auto sm:hidden" />
          </router-link>
          <template v-if="pageTitle">
            <span aria-hidden="true" class="h-5 w-px shrink-0 bg-line" />
            <span class="truncate text-sm font-semibold text-ink">{{ pageTitle }}</span>
          </template>
        </div>

        <nav class="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
          <router-link
            v-for="item in items"
            :key="item.to"
            :to="item.to"
            custom
            v-slot="{ href, navigate, isActive, isExactActive }"
          >
            <a
              :href="href"
              @click="navigate"
              :class="`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                (item.to === '/' ? isExactActive : isActive)
                  ? 'bg-primary/15 text-primary-text'
                  : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
              }`"
            >
              <Icon :name="item.icon" class="h-4 w-4" />
              {{ item.label }}
            </a>
          </router-link>
          <template v-if="showArquitetura">
            <span aria-hidden="true" class="mx-1 h-5 w-px bg-line" />
            <a
              :href="ARQUITETURA_MERMAID_URL"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <Icon :name="referenceNavItem.icon" class="h-4 w-4" />
              {{ referenceNavItem.label }}
              <Icon name="externalLink" class="h-3.5 w-3.5" />
            </a>
          </template>
        </nav>

        <div class="flex items-center gap-2">
          <a
            v-if="showArquitetura"
            :href="ARQUITETURA_MERMAID_URL"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Arquitetura do sistema no Mermaid (abre em nova aba)"
            class="flex h-11 w-11 items-center justify-center rounded-lg border border-line text-ink-muted md:hidden"
          >
            <Icon :name="referenceNavItem.icon" class="h-4 w-4" />
          </a>
          <NotificationBell />
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-2 rounded-lg border border-line bg-surface-2 py-1 pl-1 pr-2">
              <span
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-hover text-xs font-semibold text-white"
                aria-hidden="true"
              >
                {{ initials(user.nome) }}
              </span>
              <span class="hidden leading-tight sm:block">
                <span class="block text-xs font-semibold text-ink">{{ user.nome }}</span>
                <span class="block text-[11px] text-ink-muted">{{ user.cargo }}</span>
              </span>
            </div>
            <button
              type="button"
              @click="handleLogout"
              aria-label="Sair da conta"
              class="flex h-11 items-center gap-1.5 rounded-lg border border-line px-2.5 text-xs font-medium text-ink-muted transition-colors hover:border-ink-faint hover:text-ink"
            >
              <Icon name="arrowLeft" class="h-4 w-4" />
              <span class="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main
      :class="`mx-auto max-w-7xl px-4 pt-6 sm:px-6 ${hasBottomNav ? 'pb-24 md:pb-6' : 'pb-6'}`"
      id="main-content"
    >
      <slot />
    </main>

    <nav
      v-if="hasBottomNav"
      aria-label="Navegação principal (mobile)"
      class="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur md:hidden"
    >
      <div class="mx-auto flex max-w-md items-center px-2 pb-[max(0.375rem,env(safe-area-inset-bottom))] pt-1.5">
        <router-link
          v-for="item in bottomTabsLeft"
          :key="item.to"
          :to="item.to"
          custom
          v-slot="{ href, navigate, isActive, isExactActive }"
        >
          <a
            :href="href"
            @click="navigate"
            :class="`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px] font-medium transition-colors ${
              (item.to === '/' ? isExactActive : isActive) ? 'text-primary-text' : 'text-ink-muted hover:text-ink'
            }`"
          >
            <Icon :name="item.icon" class="h-5 w-5" />
            {{ item.label }}
          </a>
        </router-link>

        <router-link
          v-if="fabItem"
          :to="fabItem.to"
          custom
          v-slot="{ href, navigate, isActive }"
        >
          <a
            :href="href"
            @click="navigate"
            :aria-label="fabItem.label"
            :class="`-mt-7 flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white shadow-lg shadow-primary/30 ring-4 ring-canvas transition-colors ${
              isActive ? 'bg-primary-active' : 'bg-primary-hover'
            }`"
          >
            <Icon name="plus" class="h-6 w-6" />
          </a>
        </router-link>

        <router-link
          v-for="item in bottomTabsRight"
          :key="item.to"
          :to="item.to"
          custom
          v-slot="{ href, navigate, isActive, isExactActive }"
        >
          <a
            :href="href"
            @click="navigate"
            :class="`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px] font-medium transition-colors ${
              (item.to === '/' ? isExactActive : isActive) ? 'text-primary-text' : 'text-ink-muted hover:text-ink'
            }`"
          >
            <Icon :name="item.icon" class="h-5 w-5" />
            {{ item.label }}
          </a>
        </router-link>
      </div>
    </nav>
  </div>
</template>

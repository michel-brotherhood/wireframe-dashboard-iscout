<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import Icon from "./Icon.vue";
import { session } from "../stores/session";
import { planosStore } from "../stores/planos";
import { treinos } from "../data/mockData";
import { buildNotifications } from "../data/notifications";

const toneClasses = {
  info: "bg-primary/15 text-primary",
  warning: "bg-warning/15 text-warning",
  success: "bg-secondary/15 text-secondary",
};

const router = useRouter();
const user = computed(() => session.user);
const open = ref(false);
// Notificações "lidas" ficam só em memória (protótipo mock).
const read = ref(new Set());

const notifications = computed(() => buildNotifications(user.value, planosStore.planos, treinos));
const unread = computed(() => notifications.value.filter((n) => !read.value.has(n.id)).length);

function markAllRead() {
  read.value = new Set(notifications.value.map((n) => n.id));
}

function handleClick(id, to) {
  read.value = new Set(read.value).add(id);
  open.value = false;
  if (to) router.push(to);
}
</script>

<template>
  <div class="relative">
    <button
      type="button"
      @click="open = !open"
      :aria-label="`Notificações${unread > 0 ? ` (${unread} não lidas)` : ''}`"
      :aria-expanded="open"
      class="relative flex h-11 w-11 items-center justify-center rounded-lg border border-line text-ink-muted transition-colors hover:border-ink-faint hover:text-ink"
    >
      <Icon name="bell" class="h-5 w-5" />
      <span
        v-if="unread > 0"
        class="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white"
      >
        {{ unread > 9 ? "9+" : unread }}
      </span>
    </button>

    <template v-if="open">
      <!-- Backdrop para fechar ao clicar fora. -->
      <button
        type="button"
        aria-hidden="true"
        :tabindex="-1"
        @click="open = false"
        class="fixed inset-0 z-40 cursor-default"
      />
      <div
        role="dialog"
        aria-label="Notificações"
        class="fixed inset-x-3 top-[4.5rem] z-50 overflow-hidden rounded-xl border border-line bg-surface shadow-xl shadow-black/40 sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80"
      >
        <div class="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
          <span class="text-sm font-semibold text-ink">Notificações</span>
          <button
            v-if="unread > 0"
            type="button"
            @click="markAllRead"
            class="text-xs font-medium text-primary-text hover:underline"
          >
            Marcar todas como lidas
          </button>
        </div>

        <p v-if="notifications.length === 0" class="px-4 py-6 text-center text-sm text-ink-muted">
          Nenhuma notificação no momento.
        </p>
        <ul v-else class="max-h-[70vh] overflow-y-auto overscroll-contain sm:max-h-96">
          <li v-for="n in notifications" :key="n.id" class="border-b border-line-soft last:border-0">
            <button
              v-if="n.to"
              type="button"
              @click="handleClick(n.id, n.to)"
              :class="`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2 ${
                !read.has(n.id) ? 'bg-primary/5' : ''
              }`"
            >
              <span
                :class="`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${toneClasses[n.tone]}`"
              >
                <Icon :name="n.icon" class="h-4 w-4" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="flex items-center gap-2">
                  <span class="text-sm font-medium text-ink">{{ n.title }}</span>
                  <span v-if="!read.has(n.id)" class="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                </span>
                <span class="mt-0.5 block text-xs text-ink-muted">{{ n.detail }}</span>
              </span>
            </button>
            <button
              v-else
              type="button"
              @click="handleClick(n.id)"
              :class="`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2 ${
                !read.has(n.id) ? 'bg-primary/5' : ''
              }`"
            >
              <span
                :class="`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${toneClasses[n.tone]}`"
              >
                <Icon :name="n.icon" class="h-4 w-4" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="flex items-center gap-2">
                  <span class="text-sm font-medium text-ink">{{ n.title }}</span>
                  <span v-if="!read.has(n.id)" class="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                </span>
                <span class="mt-0.5 block text-xs text-ink-muted">{{ n.detail }}</span>
              </span>
            </button>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

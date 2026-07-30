<script setup>
defineProps({
  type: { type: String, default: "button" },
  variant: { type: String, default: "primary" },
});

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:ring-primary disabled:opacity-40 disabled:cursor-not-allowed";
const variants = {
  primary: "bg-primary-hover text-white hover:bg-primary-active",
  secondary: "bg-surface-2 text-ink border border-line hover:border-ink-faint",
  ghost: "text-ink-muted hover:bg-surface-2 hover:text-ink",
};
</script>

<template>
  <button :type="type" :class="[base, variants[variant]]">
    <slot />
  </button>
</template>

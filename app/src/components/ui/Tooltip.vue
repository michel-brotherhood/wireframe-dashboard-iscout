<script setup>
defineProps({ text: { type: String, required: true } });
</script>

<template>
  <span class="group/tip relative inline-block">
    <slot />
    <span
      role="tooltip"
      class="pointer-events-none absolute bottom-full left-0 z-50 mb-2 w-64 max-w-[80vw] rounded-lg border border-line bg-surface-2 p-2.5 text-xs font-normal leading-snug text-ink opacity-0 shadow-xl transition-opacity duration-150 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100"
    >
      {{ text }}
    </span>
  </span>
</template>

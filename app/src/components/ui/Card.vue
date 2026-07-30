<script setup>
defineProps({ title: { type: String, default: "" } });
</script>

<template>
  <section class="rounded-2xl border border-line bg-surface p-4">
    <div v-if="title" class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h3 class="flex items-center gap-2 text-base font-semibold text-ink">
        <span v-if="$slots.icon" class="text-primary"><slot name="icon" /></span>
        {{ title }}
      </h3>
      <slot name="headerAction" />
    </div>
    <slot />
  </section>
</template>

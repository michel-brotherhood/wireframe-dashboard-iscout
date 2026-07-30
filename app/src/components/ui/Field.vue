<script setup>
defineProps({
  label: { type: String, required: true },
  required: { type: Boolean, default: false },
  hint: { type: String, default: "" },
  error: { type: String, default: "" },
});
</script>

<template>
  <label class="mb-4 block">
    <span class="mb-1.5 block text-sm font-medium text-ink-muted">
      {{ label }}
      <span v-if="required" class="ml-0.5 text-primary-text">*</span>
    </span>
    <slot />
    <span v-if="error" role="alert" class="mt-1 block text-xs text-primary-text">{{ error }}</span>
    <span v-else-if="hint" class="mt-1 block text-xs text-ink-muted">{{ hint }}</span>
  </label>
</template>

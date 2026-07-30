<script setup>
import { computed } from "vue";
import { conformanceColor } from "./helpers.js";

const props = defineProps({
  value: { type: Number, required: true },
  colorClass: { type: String, default: "" },
  size: { type: String, default: "md" },
});

const clamped = computed(() => Math.max(0, Math.min(100, props.value)));
</script>

<template>
  <div
    role="progressbar"
    :aria-valuenow="clamped"
    :aria-valuemin="0"
    :aria-valuemax="100"
    class="w-full overflow-hidden rounded-full bg-surface-2"
    :class="size === 'sm' ? 'h-1.5' : 'h-2.5'"
  >
    <div
      class="h-full rounded-full transition-all"
      :class="colorClass || conformanceColor(clamped)"
      :style="{ width: clamped + '%' }"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import Icon from "../Icon.vue";
import { chipClass } from "./chip.js";
import { inputClass } from "./helpers.js";

// Grupo de escolha única (radio) em formato de chips, com "Outro (texto)"
// opcional. `modelValue` fora de `options` (e não vazio) é tratado como texto livre.
const props = defineProps({
  options: { type: Array, required: true },
  modelValue: { type: String, required: true },
  allowOther: { type: Boolean, default: false },
  otherPlaceholder: { type: String, default: "Especifique..." },
});
const emit = defineEmits(["update:modelValue"]);

const isCustom = computed(() => props.modelValue !== "" && !props.options.includes(props.modelValue));
const otherOn = ref(isCustom.value);

function pick(opt) {
  otherOn.value = false;
  emit("update:modelValue", opt);
}
function pickOther() {
  otherOn.value = true;
  emit("update:modelValue", "");
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-wrap gap-2">
      <label v-for="opt in options" :key="opt" :class="chipClass(!otherOn && modelValue === opt)">
        <input type="radio" class="sr-only" :checked="!otherOn && modelValue === opt" @change="pick(opt)" />
        <Icon v-if="!otherOn && modelValue === opt" name="check" class="h-3.5 w-3.5" />
        {{ opt }}
      </label>
      <label v-if="allowOther" :class="chipClass(otherOn)">
        <input type="radio" class="sr-only" :checked="otherOn" @change="pickOther" />
        <Icon v-if="otherOn" name="check" class="h-3.5 w-3.5" />
        Outro
      </label>
    </div>
    <input
      v-if="allowOther && otherOn"
      :class="inputClass"
      :placeholder="otherPlaceholder"
      :value="isCustom ? modelValue : ''"
      @input="emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

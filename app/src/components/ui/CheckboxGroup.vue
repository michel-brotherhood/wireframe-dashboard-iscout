<script setup>
import { ref, computed } from "vue";
import Icon from "../Icon.vue";
import { chipClass } from "./chip.js";
import { inputClass } from "./helpers.js";

// Grupo de checkboxes em formato de chips ("marque todas que se aplicam"), com
// opção "Outro (texto)" opcional. Um valor fora de `options` é tratado como o
// texto do "Outro". Reduz superfície de texto aberto nos formulários.
const props = defineProps({
  options: { type: Array, required: true },
  modelValue: { type: Array, required: true },
  allowOther: { type: Boolean, default: false },
  otherPlaceholder: { type: String, default: "Especifique..." },
});
const emit = defineEmits(["update:modelValue"]);

const otherValue = computed(() => props.modelValue.find((v) => !props.options.includes(v)) ?? "");
const otherOn = ref(otherValue.value !== "");

function toggle(opt) {
  emit(
    "update:modelValue",
    props.modelValue.includes(opt) ? props.modelValue.filter((v) => v !== opt) : [...props.modelValue, opt],
  );
}
function setOther(text) {
  const base = props.modelValue.filter((v) => props.options.includes(v));
  emit("update:modelValue", text.trim() ? [...base, text] : base);
}
function onOtherToggle(e) {
  otherOn.value = e.target.checked;
  if (!e.target.checked) setOther("");
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-wrap gap-2">
      <label v-for="opt in options" :key="opt" :class="chipClass(modelValue.includes(opt))">
        <input type="checkbox" class="sr-only" :checked="modelValue.includes(opt)" @change="toggle(opt)" />
        <Icon v-if="modelValue.includes(opt)" name="check" class="h-3.5 w-3.5" />
        {{ opt }}
      </label>
      <label v-if="allowOther" :class="chipClass(otherOn)">
        <input type="checkbox" class="sr-only" :checked="otherOn" @change="onOtherToggle" />
        <Icon v-if="otherOn" name="check" class="h-3.5 w-3.5" />
        Outro
      </label>
    </div>
    <input
      v-if="allowOther && otherOn"
      :class="inputClass"
      :placeholder="otherPlaceholder"
      :value="otherValue"
      @input="setOther($event.target.value)"
    />
  </div>
</template>

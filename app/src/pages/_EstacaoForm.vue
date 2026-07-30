<script setup>
import { computed } from "vue";
import { Field, CheckboxGroup, inputClass } from "../components/ui";
import { MATERIAIS } from "../data/planoOptions";
import DiagramUpload from "./_DiagramUpload.vue";

const TIPOS_ESTACAO = ["Simples", "Com bola", "Recreativo"];

const props = defineProps({
  label: { type: String, required: true },
  value: { type: Object, required: true },
});
const emit = defineEmits(["patch"]);

const materiais = computed({
  get() {
    return props.value.materiais ? props.value.materiais.split(",").map((s) => s.trim()).filter(Boolean) : [];
  },
  set(arr) {
    emit("patch", { materiais: arr.join(", ") });
  },
});
</script>

<template>
  <div class="mb-4 rounded-xl border border-line-soft bg-surface-2 p-3">
    <p class="mb-3 text-sm font-semibold text-ink">{{ label }}</p>
    <Field label="Nome" required>
      <input :class="inputClass" :value="value.nome" @input="emit('patch', { nome: $event.target.value })" />
    </Field>
    <Field label="Tipo" required>
      <select :class="inputClass" :value="value.tipo" @change="emit('patch', { tipo: $event.target.value })">
        <option v-for="t in TIPOS_ESTACAO" :key="t">{{ t }}</option>
      </select>
    </Field>
    <Field label="Descrição">
      <input :class="inputClass" :value="value.descricao" @input="emit('patch', { descricao: $event.target.value })" />
    </Field>
    <Field label="Duração (minutos)" required>
      <input
        type="number"
        min="1"
        :class="inputClass"
        :value="value.duracaoMin"
        @input="emit('patch', { duracaoMin: Number($event.target.value) })"
      />
    </Field>
    <Field label="Materiais">
      <CheckboxGroup :options="MATERIAIS" v-model="materiais" allow-other other-placeholder="Outros materiais" />
    </Field>
    <div class="mt-4">
      <DiagramUpload />
    </div>
  </div>
</template>

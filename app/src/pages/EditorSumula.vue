<script setup>
import { ref, computed } from "vue";
import { ambiguousMatches } from "../data/mockData";
import { findAtletaByMatricula } from "../data/atletas";
import { Card, Field, PrimaryButton, RadioGroup, inputClass } from "../components/ui";
import Icon from "../components/Icon.vue";
import { CATEGORIAS, POSICOES, SESSAO_OPCOES } from "../data/planoOptions";

const BLOCKED_JERSEYS = [24, 51, 69];

// Matrícula válida e única já identifica o atleta — resolve automaticamente.
// Sem matrícula, o nome precisa ser conferido contra o cadastro: se bate com
// mais de um cadastro conhecido, fica ambíguo até o treinador escolher qual;
// se não bate com nenhum, o atleta não é encontrado. Em ambos os casos a
// confirmação da escalação fica bloqueada até resolver.
function resolutionStatus(row, selections) {
  if (row.matricula.trim()) return "resolved";
  const match = ambiguousMatches.find((m) => m.nome === row.nome);
  if (!match) return "not_found";
  return selections[row.jersey] ? "resolved" : "ambiguous";
}

// `atletaId` resolvido pela matrícula contra o registro único (data/atletas.js).
const initialRoster = [
  { jersey: 1, nome: "Rodrigo Almeida", posicao: "Goleiro", matricula: "1001", starter: true },
  { jersey: 2, nome: "Maria Santos", posicao: "Lateral", matricula: "1002", starter: true },
  { jersey: 3, nome: "Pedro Costa", posicao: "Zagueiro", matricula: "1003", starter: true },
  { jersey: 4, nome: "Ana Silva", posicao: "Zagueira", matricula: "1004", starter: true },
  { jersey: 5, nome: "Carlos Oliveira", posicao: "Lateral", matricula: "1005", starter: true },
  { jersey: 6, nome: "Fernanda Costa", posicao: "Meia", matricula: "1006", starter: true },
  { jersey: 7, nome: "Bruno Silva", posicao: "Meia", matricula: "1007", starter: true },
  { jersey: 8, nome: "Juliana Santos", posicao: "Meia", matricula: "1008", starter: true },
  { jersey: 9, nome: "Ricardo Oliveira", posicao: "Atacante", matricula: "1009", starter: true },
  { jersey: 10, nome: "Beatriz Costa", posicao: "Atacante", matricula: "1010", starter: true },
  { jersey: 11, nome: "Gustavo Silva", posicao: "Atacante", matricula: "1011", starter: true },
].map((entry) => ({ ...entry, atletaId: findAtletaByMatricula(entry.matricula)?.id }));

const data = ref("2026-07-02");
const categoria = ref("Sub-15");
const corColete = ref("Amarelo");
const sessao = ref("Sessão 1 - Campo 2");

// Cabeçalho reflete a data escolhida (antes era um literal fixo, ignorando o
// campo). ISO (yyyy-mm-dd) → dd/mm/yyyy sem depender de fuso do Date.
const dataFormatada = computed(() => {
  const [y, m, d] = data.value.split("-");
  return d && m && y ? `${d}/${m}/${y}` : data.value;
});
const roster = ref(initialRoster);
const newJersey = ref("");
const newNome = ref("");
const newMatricula = ref("");
const newPosicao = ref("Goleiro");
const newPosicaoOutro = ref("");
const newStarter = ref(true);
const error = ref(null);
const resolved = ref(false);
const selections = ref({});
const status = ref(null);

function handleAdd() {
  const jerseyNum = Number(newJersey.value);
  error.value = null;

  if (!newJersey.value || !newNome.value.trim()) {
    error.value = "Preencha número do colete e nome do atleta.";
    return;
  }
  if (jerseyNum < 1 || jerseyNum > 99) {
    error.value = "Número do colete deve estar entre 1 e 99.";
    return;
  }
  if (BLOCKED_JERSEYS.includes(jerseyNum)) {
    error.value = `Número do colete ${jerseyNum} está bloqueado para uso.`;
    return;
  }
  if (roster.value.some((r) => r.jersey === jerseyNum)) {
    error.value = `Número do colete ${jerseyNum} já está em uso.`;
    return;
  }

  const posicao = newPosicao.value === "Outro" ? newPosicaoOutro.value.trim() || "—" : newPosicao.value;
  const matricula = newMatricula.value.trim();
  roster.value = [
    ...roster.value,
    { jersey: jerseyNum, nome: newNome.value.trim(), posicao, matricula, starter: newStarter.value, atletaId: findAtletaByMatricula(matricula)?.id },
  ];
  newJersey.value = "";
  newNome.value = "";
  newMatricula.value = "";
  newPosicao.value = "Goleiro";
  newPosicaoOutro.value = "";
  newStarter.value = true;
}

function handleRemove(jersey) {
  roster.value = roster.value.filter((r) => r.jersey !== jersey);
}

const starterCount = computed(() => roster.value.filter((r) => r.starter).length);
const hasDuplicateJersey = computed(() => new Set(roster.value.map((r) => r.jersey)).size !== roster.value.length);
const hasInvalidNumbers = computed(() => roster.value.some((r) => !Number.isInteger(r.jersey) || r.jersey < 1 || r.jersey > 99));
const hasEmptyNome = computed(() => roster.value.some((r) => !r.nome.trim()));

const statuses = computed(() => roster.value.map((row) => ({ row, status: resolutionStatus(row, selections.value) })));
const pendingAmbiguous = computed(() => statuses.value.filter((s) => s.status === "ambiguous"));
const notFound = computed(() => statuses.value.filter((s) => s.status === "not_found"));
const allAthletesResolved = computed(() => statuses.value.every((s) => s.status === "resolved"));

const canConfirm = computed(
  () => roster.value.length > 0 && !hasDuplicateJersey.value && !hasInvalidNumbers.value && !hasEmptyNome.value && allAthletesResolved.value,
);

const resolvedCount = computed(() => statuses.value.filter((s) => s.status === "resolved").length);

function confirmarEscalacao() {
  status.value = `Escalação confirmada e projetada — ${dataFormatada.value} · ${categoria.value} · Colete ${corColete.value} · ${roster.value.length} atletas.`;
}

function matchFor(nome) {
  return ambiguousMatches.find((m) => m.nome === nome);
}

function pickSelection(jersey, id) {
  selections.value = { ...selections.value, [jersey]: id };
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <h1 class="font-heading text-xl font-semibold text-ink sm:text-2xl">
      Criar Súmula — {{ dataFormatada }} — {{ categoria }}
    </h1>

    <Card>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Data" required>
          <input type="date" :class="inputClass" v-model="data" />
        </Field>
        <Field label="Categoria" required>
          <select :class="inputClass" v-model="categoria">
            <option v-for="c in CATEGORIAS" :key="c">{{ c }}</option>
          </select>
        </Field>
        <Field label="Cor do Colete" required>
          <select :class="inputClass" v-model="corColete">
            <option>Amarelo</option>
            <option>Azul</option>
          </select>
        </Field>
      </div>
      <div class="mt-3">
        <Field label="Sessão / Take" required>
          <RadioGroup :options="SESSAO_OPCOES" v-model="sessao" :allow-other="true" />
        </Field>
      </div>
    </Card>

    <Card title="Adicionar Atleta">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[104px_1fr_130px_150px_92px_auto] lg:items-end">
        <Field label="Número do Colete">
          <input
            type="number"
            :min="1"
            :max="99"
            :class="inputClass"
            :value="newJersey"
            @input="newJersey = $event.target.value"
          />
        </Field>
        <Field label="Nome">
          <input :class="inputClass" :value="newNome" @input="newNome = $event.target.value" />
        </Field>
        <Field label="Matrícula" hint="Sem matrícula, passa por Resolver Nomes.">
          <input :class="inputClass" :value="newMatricula" @input="newMatricula = $event.target.value" />
        </Field>
        <Field label="Posição">
          <select :class="inputClass" :value="newPosicao" @change="newPosicao = $event.target.value">
            <option v-for="p in POSICOES" :key="p">{{ p }}</option>
            <option>Outro</option>
          </select>
        </Field>
        <label class="mb-4 flex items-center gap-2 text-sm text-ink lg:mb-[13px]">
          <input
            type="checkbox"
            class="h-4 w-4 rounded border-line bg-surface-2 text-primary focus:ring-primary"
            :checked="newStarter"
            @change="newStarter = $event.target.checked"
          />
          Titular
        </label>
        <PrimaryButton @click="handleAdd" class="mb-4 lg:mb-4">
          <Icon name="plus" class="h-4 w-4" /> Adicionar
        </PrimaryButton>
      </div>
      <div v-if="newPosicao === 'Outro'" class="mb-1 sm:max-w-xs">
        <Field label="Posição (outro)">
          <input
            :class="inputClass"
            placeholder="Digite a posição"
            :value="newPosicaoOutro"
            @input="newPosicaoOutro = $event.target.value"
          />
        </Field>
      </div>
      <p v-if="error" role="alert" class="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary-text">
        <Icon name="alert" class="h-4 w-4" /> {{ error }}
      </p>
    </Card>

    <Card :title="`Escalação (${roster.length} atletas)`">
      <!-- Mobile (<640px): lista de cards em vez da tabela min-w-[640px], que nunca
           cabe na viewport e pode encadear o scroll interno pra página inteira. -->
      <div class="flex flex-col gap-2 sm:hidden">
        <div v-for="r in roster" :key="r.jersey" data-testid="atleta-card" class="rounded-xl border border-line-soft bg-surface-2 p-3">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="text-sm font-semibold text-ink">
                Colete {{ r.jersey }} — {{ r.nome }}
              </p>
              <p class="mt-1 text-sm text-ink-muted">Posição: {{ r.posicao }}</p>
              <p class="text-sm text-ink-muted">Matrícula: {{ r.matricula || "—" }}</p>
              <p class="flex items-center gap-1 text-sm text-secondary">
                <template v-if="r.starter">
                  <Icon name="check" class="h-4 w-4" /> Titular
                </template>
                <span v-else class="text-ink-muted">Reserva</span>
              </p>
            </div>
            <button
              type="button"
              @click="handleRemove(r.jersey)"
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-muted hover:bg-primary/10 hover:text-primary"
              :aria-label="`Remover ${r.nome}`"
            >
              <Icon name="x" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Tablet/desktop (≥640px): tabela completa, scroll horizontal contido. -->
      <div class="hidden overflow-x-auto overscroll-x-contain sm:block">
        <table class="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr class="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
              <th scope="col" class="px-3 py-2">Número do Colete</th>
              <th scope="col" class="px-3 py-2">Nome</th>
              <th scope="col" class="px-3 py-2">Posição</th>
              <th scope="col" class="px-3 py-2">Matrícula</th>
              <th scope="col" class="px-3 py-2">Titular</th>
              <th scope="col" class="px-3 py-2 sr-only">Ação</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in roster" :key="r.jersey" :class="`border-b border-line-soft last:border-0 ${i % 2 === 1 ? 'bg-surface-2/40' : ''}`">
              <td class="px-3 py-2 font-medium text-ink">{{ r.jersey }}</td>
              <td class="px-3 py-2 text-ink-muted">{{ r.nome }}</td>
              <td class="px-3 py-2 text-ink-muted">{{ r.posicao }}</td>
              <td class="px-3 py-2 text-ink-muted">{{ r.matricula }}</td>
              <td class="px-3 py-2 text-secondary"><Icon v-if="r.starter" name="check" class="h-4 w-4" /><template v-else>—</template></td>
              <td class="px-3 py-2 text-right">
                <button
                  type="button"
                  @click="handleRemove(r.jersey)"
                  class="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-primary/10 hover:text-primary"
                  :aria-label="`Remover ${r.nome}`"
                >
                  <Icon name="x" class="h-4 w-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mt-3 text-sm font-semibold text-ink">
        Total: {{ roster.length }} atletas ({{ starterCount }} titulares)
      </p>
      <p v-if="!canConfirm && roster.length > 0" class="mt-2 flex items-center gap-1.5 text-sm text-warning">
        <Icon name="alert" class="h-4 w-4" />
        <template v-if="hasEmptyNome">Há atletas sem nome preenchido. </template>
        <template v-if="hasInvalidNumbers">Há números de colete inválidos. </template>
        <template v-if="hasDuplicateJersey">Há números de colete duplicados. </template>
        <template v-if="pendingAmbiguous.length > 0">Ainda há nomes ambíguos pendentes de resolução. </template>
        <template v-if="notFound.length > 0">Há atletas não encontrados no cadastro — informe a matrícula ou resolva o nome.</template>
      </p>
    </Card>

    <div class="flex flex-wrap gap-2">
      <PrimaryButton
        variant="secondary"
        :disabled="pendingAmbiguous.length === 0 && notFound.length === 0"
        @click="resolved = true"
      >
        Resolver Nomes<template v-if="pendingAmbiguous.length + notFound.length > 0"> ({{ pendingAmbiguous.length + notFound.length }})</template>
      </PrimaryButton>
      <PrimaryButton :disabled="!canConfirm" @click="confirmarEscalacao">
        Confirmar Escalação
      </PrimaryButton>
    </div>
    <p v-if="status" role="status" class="flex items-center gap-1.5 rounded-xl border border-secondary/30 bg-secondary/10 px-3 py-2 text-sm text-secondary">
      <Icon name="check" class="h-4 w-4" /> {{ status }}
    </p>

    <Card v-if="resolved || pendingAmbiguous.length > 0 || notFound.length > 0" title="Resultado da Resolução">
      <div class="mb-4 flex flex-wrap gap-4 text-sm">
        <span class="flex items-center gap-1.5 text-secondary">
          <Icon name="check" class="h-4 w-4" /> {{ resolvedCount }} Resolvidos
        </span>
        <span class="flex items-center gap-1.5 text-warning">
          <Icon name="alert" class="h-4 w-4" /> {{ pendingAmbiguous.length }} Ambíguos (precisa validação manual)
        </span>
        <span class="flex items-center gap-1.5 text-ink-muted">
          <Icon name="x" class="h-4 w-4" /> {{ notFound.length }} Não encontrados
        </span>
      </div>

      <p v-if="pendingAmbiguous.length === 0 && notFound.length === 0" class="flex items-center gap-1.5 text-sm text-secondary">
        <Icon name="check" class="h-4 w-4" /> Todos os atletas foram resolvidos.
      </p>
      <div v-else class="flex flex-col gap-4">
        <template v-for="{ row } in pendingAmbiguous" :key="row.jersey">
          <fieldset v-if="matchFor(row.nome)" class="rounded-xl border border-warning/30 bg-warning/5 p-3">
            <legend class="px-1 text-sm font-medium text-ink">
              Colete {{ row.jersey }} — "{{ row.nome }}" → Selecione:
            </legend>
            <div class="flex flex-col gap-1.5">
              <label v-for="opt in matchFor(row.nome).opcoes" :key="opt.id" class="flex items-center gap-2 text-sm text-ink">
                <input
                  type="radio"
                  :name="`ambig-${row.jersey}`"
                  class="h-4 w-4 border-line bg-surface-2 text-primary focus:ring-primary"
                  :checked="selections[row.jersey] === opt.id"
                  @change="pickSelection(row.jersey, opt.id)"
                />
                {{ opt.label }}
              </label>
            </div>
          </fieldset>
        </template>
        <p v-if="notFound.length > 0" class="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm text-primary-text">
          <Icon name="alert" class="h-4 w-4 shrink-0" />
          {{ notFound.map((s) => `Colete ${s.row.jersey} — "${s.row.nome}"`).join(", ") }} não{{ " " }}
          {{ notFound.length === 1 ? "foi encontrado" : "foram encontrados" }} no cadastro. Informe a matrícula do
          atleta para confirmar.
        </p>
      </div>
    </Card>
  </div>
</template>

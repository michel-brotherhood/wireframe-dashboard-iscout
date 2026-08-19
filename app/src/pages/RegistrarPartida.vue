<script setup>
import { ref, computed } from "vue";
import { Card, Field, PrimaryButton, RadioGroup, inputClass, inputErrorClass } from "../components/ui";
import Icon from "../components/Icon.vue";
import { CATEGORIAS, POSICOES } from "../data/planoOptions";
import { findAtletaByMatricula } from "../data/atletas";
import {
  partidasStore,
  currentMatch,
  touch,
  createMatch,
  setCurrent,
  removeMatch,
  teamBib,
  conflictIds,
  isOutOfRange,
  buildPayload,
  newPlayer,
  sumulaFilename,
  atletasDaCategoria,
} from "../stores/partidas";

const SCHEME_OPTIONS = ["Duas cores", "Cor única"];

const m = computed(() => currentMatch());
const status = ref(null);

// Esquema como rótulo legível ↔ valor interno.
const schemeLabel = computed({
  get: () => (m.value.bib_scheme === "one_color_unique" ? "Cor única" : "Duas cores"),
  set: (v) => {
    m.value.bib_scheme = v === "Cor única" ? "one_color_unique" : "two_colors_repeat";
    touch();
  },
});

const isSingleColor = computed(() => m.value.bib_scheme === "one_color_unique");

const matchesList = computed(() =>
  Object.values(partidasStore.matches).slice().sort((a, b) => b.updated_at.localeCompare(a.updated_at)),
);

const dup = computed(() => conflictIds(m.value));

function playersOf(team) {
  return m.value.players.filter((p) => p.team === team);
}

const totalPlayers = computed(() => m.value.players.length);
const totalMinutes = computed(() => m.value.players.reduce((a, p) => a + (Number(p.minutes_played) || 0), 0));
const noNumber = computed(
  () => m.value.players.filter((p) => p.bib_number === "" || p.bib_number == null).length,
);
// Jogadores sem vínculo com o cadastro (athlete_id nulo) — a pipeline precisa
// do id, então esses ficam sinalizados.
const semVinculo = computed(() => m.value.players.filter((p) => !p.athlete_id).length);

// Atletas do cadastro na categoria da partida — autocomplete de matrícula.
const atletasCat = computed(() => atletasDaCategoria(m.value.category));

// --- adicionar jogador (form por time) ---
const draft = ref({
  home: { num: "", mat: "", name: "", min: "", pos: "" },
  away: { num: "", mat: "", name: "", min: "", pos: "" },
});
const addError = ref({ home: null, away: null });

// Atleta resolvido pela matrícula digitada (ou null).
function resolvedFor(team) {
  return findAtletaByMatricula(draft.value[team].mat) ?? null;
}

// Ao digitar a matrícula, se resolver, espelha nome/posição no formulário para
// o treinador conferir antes de adicionar.
function onMatricula(team) {
  const found = resolvedFor(team);
  if (found) {
    draft.value[team].name = found.nome;
    draft.value[team].pos = found.posicao;
  }
}

function addPlayer(team) {
  const d = draft.value[team];
  addError.value[team] = null;
  const found = findAtletaByMatricula(d.mat);
  const name = (found?.nome || d.name).trim();
  if (!name) {
    addError.value[team] = "Digite a matrícula ou o nome do jogador.";
    return;
  }
  // Número repetido / fora de faixa NÃO bloqueiam — nesta fase de wireframe são
  // só sinalizados (badge). A regra definitiva fica pendente de validação.
  const num = d.num === "" ? "" : Number(d.num);
  const p = newPlayer(team);
  p.name = name;
  p.athlete_id = found?.id ?? null;
  p.matricula = found ? found.matricula : d.mat.trim();
  p.position = found?.posicao || d.pos;
  p.bib_number = num;
  p.minutes_played = d.min === "" ? 0 : Number(d.min);
  m.value.players.push(p);
  touch();
  draft.value[team] = { num: "", mat: "", name: "", min: "", pos: "" };
  status.value = found ? `${name} escalado (do cadastro).` : `${name} escalado (sem cadastro).`;
}

function removePlayer(id) {
  m.value.players = m.value.players.filter((p) => p.player_uuid !== id);
  touch();
}

// contraste de texto sobre a cor do colete
function contrastText(hex) {
  const c = (hex || "").replace("#", "");
  if (c.length < 6) return "#fff";
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? "#16201b" : "#ffffff";
}

// --- ações de partida ---
function novaPartida() {
  createMatch();
  status.value = "Nova partida criada.";
}

function excluirPartida() {
  if (typeof window !== "undefined" && !window.confirm("Excluir esta partida e todos os jogadores dela?")) return;
  removeMatch(partidasStore.current);
  status.value = "Partida excluída.";
}

// --- export ---
function download(name, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

// 1 súmula = 1 campo: sem campo a exportação ainda funciona, mas avisamos —
// não é um bloqueio (regra definitiva pendente de validação).
const semCampo = computed(() => !(m.value.location && m.value.location.trim()));
const dicaCampo = " — dica: informe o Campo para identificar a súmula.";

function exportJSON() {
  download(sumulaFilename(m.value) + ".json", JSON.stringify(buildPayload(m.value), null, 2), "application/json");
  status.value = "JSON da súmula baixado" + (semCampo.value ? dicaCampo : ".");
}

// CSV no formato do modelo (aba de súmula) + a chave athlete_id que o backend
// pediu (id, não nome). Colunas: athlete_id, atleta, posicao, campo, camisa,
// time, categoria, data.
function exportCSV() {
  const { match, players } = buildPayload(m.value);
  const cols = ["athlete_id", "atleta", "posicao", "campo", "camisa", "time", "categoria", "data"];
  const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const linha = (p) =>
    [
      p.athlete_id ?? "",
      p.name,
      p.position,
      match.campo,
      p.bib_number,
      p.bib_color_label,
      match.category,
      match.match_date,
    ]
      .map(q)
      .join(",");
  const rows = [cols.join(",")].concat(players.map(linha));
  download(sumulaFilename(m.value) + ".csv", rows.join("\n"), "text/csv");
  status.value = "Súmula (CSV) baixada" + (semCampo.value ? dicaCampo : ".");
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="font-heading flex items-center gap-2 text-xl font-semibold text-ink sm:text-2xl">
          <Icon name="ball" class="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
          Registrar Partida
        </h1>
        <p class="mt-1 text-sm text-ink-muted">
          Cada partida é <span class="font-medium text-ink">a súmula de um campo</span> — atleta, posição, camisa e
          time. Selecione atletas do cadastro pela matrícula.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <label class="sr-only" for="partida-switch">Trocar de partida</label>
        <select
          id="partida-switch"
          :class="`${inputClass} sm:w-64`"
          :value="partidasStore.current"
          @change="setCurrent($event.target.value)"
        >
          <option v-for="x in matchesList" :key="x.match_uuid" :value="x.match_uuid">
            {{ x.category }} · {{ x.team_home_name }} × {{ x.team_away_name }} ·
            {{ x.match_date ? x.match_date.split("-").reverse().join("/") : "s/ data" }}
          </option>
        </select>
        <PrimaryButton variant="secondary" @click="novaPartida">
          <Icon name="plus" class="h-4 w-4" /> Nova partida
        </PrimaryButton>
      </div>
    </div>

    <p
      v-if="status"
      role="status"
      class="flex items-center gap-1.5 rounded-xl border border-secondary/30 bg-secondary/10 px-3 py-2 text-sm text-secondary"
    >
      <Icon name="check" class="h-4 w-4" /> {{ status }}
    </p>

    <!-- 1. Dados do jogo -->
    <Card title="Dados do jogo">
      <template #icon><Icon name="calendar" class="h-4 w-4" /></template>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Categoria" required>
          <select :class="inputClass" v-model="m.category" @change="touch">
            <option v-for="c in CATEGORIAS" :key="c">{{ c }}</option>
          </select>
        </Field>
        <Field label="Data" required>
          <input type="date" :class="inputClass" v-model="m.match_date" @change="touch" />
        </Field>
        <Field label="Horário">
          <input type="time" :class="inputClass" v-model="m.kickoff_time" @change="touch" />
        </Field>
      </div>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Time da casa" required>
          <input :class="inputClass" v-model="m.team_home_name" placeholder="Ex.: Verde" @input="touch" />
        </Field>
        <Field label="Time visitante" required>
          <input :class="inputClass" v-model="m.team_away_name" placeholder="Ex.: Branco" @input="touch" />
        </Field>
        <Field label="Campo" required hint="1 súmula = 1 campo">
          <input :class="inputClass" v-model="m.location" placeholder="Ex.: CAMPO OFICIAL 5" @input="touch" />
        </Field>
      </div>
      <label class="mb-4 flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          class="h-4 w-4 rounded border-line bg-surface-2 text-primary focus:ring-primary"
          v-model="m.track_score"
          @change="touch"
        />
        Registrar placar, gols e cartões (opcional)
      </label>
      <div v-if="m.track_score" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field :label="`Gols — ${m.team_home_name}`">
          <input type="number" min="0" :class="inputClass" v-model.number="m.score_home" @input="touch" />
        </Field>
        <Field :label="`Gols — ${m.team_away_name}`">
          <input type="number" min="0" :class="inputClass" v-model.number="m.score_away" @input="touch" />
        </Field>
      </div>
      <Field label="Observações">
        <textarea :class="`${inputClass} min-h-[70px]`" v-model="m.notes" placeholder="Anotações da súmula..." @input="touch" />
      </Field>
      <div>
        <PrimaryButton variant="secondary" @click="excluirPartida">
          <Icon name="x" class="h-4 w-4" /> Excluir esta partida
        </PrimaryButton>
      </div>
    </Card>

    <!-- 2. Coletes -->
    <Card title="Coletes — numeração e cores">
      <template #icon><Icon name="stamp" class="h-4 w-4" /></template>
      <p class="mb-3 text-sm text-ink-muted">
        Como os coletes foram distribuídos hoje: <span class="font-medium text-ink">cor + número</span> identificam cada jogador.
      </p>
      <Field label="Esquema">
        <RadioGroup :options="SCHEME_OPTIONS" v-model="schemeLabel" />
      </Field>
      <p class="mb-4 -mt-2 text-xs text-ink-muted">
        <template v-if="isSingleColor">Uma cor para os dois times — cada número é único, ninguém repete (recomendado).</template>
        <template v-else>Uma cor por time — números podem repetir entre os times (nº 7 casa e nº 7 visitante).</template>
      </p>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field :label="isSingleColor ? 'Cor dos coletes' : `Cor — ${m.team_home_name}`">
          <div class="flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-2 py-1.5">
            <input type="color" class="h-8 w-9 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0" v-model="m.bib_color_home" @input="touch" />
            <input :class="`${inputClass} border-0 bg-transparent px-1 focus:ring-0`" v-model="m.bib_label_home" placeholder="rótulo (ex.: Amarelo)" @input="touch" />
          </div>
        </Field>
        <Field v-if="!isSingleColor" :label="`Cor — ${m.team_away_name}`">
          <div class="flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-2 py-1.5">
            <input type="color" class="h-8 w-9 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0" v-model="m.bib_color_away" @input="touch" />
            <input :class="`${inputClass} border-0 bg-transparent px-1 focus:ring-0`" v-model="m.bib_label_away" placeholder="rótulo (ex.: Azul)" @input="touch" />
          </div>
        </Field>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <Field label="Número mínimo">
          <input type="number" :class="inputClass" v-model.number="m.number_min" @input="touch" />
        </Field>
        <Field label="Número máximo">
          <input type="number" :class="inputClass" v-model.number="m.number_max" @input="touch" />
        </Field>
      </div>
    </Card>

    <!-- 3. Elenco -->
    <Card title="Elenco — jogadores, minutos e posição">
      <template #icon><Icon name="clipboard" class="h-4 w-4" /></template>
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div
          v-for="team in ['home', 'away']"
          :key="team"
          class="overflow-hidden rounded-xl border border-line-soft"
        >
          <div
            class="flex items-center justify-between gap-2 px-3 py-2"
            :style="{ backgroundColor: teamBib(m, team).hex, color: contrastText(teamBib(m, team).hex) }"
          >
            <span class="font-heading text-sm font-semibold uppercase tracking-wide">
              {{ (team === "home" ? m.team_home_name : m.team_away_name) || (team === "home" ? "Casa" : "Visitante") }}
            </span>
            <span class="rounded-full bg-black/20 px-2 py-0.5 text-[11px] font-medium">
              {{ playersOf(team).length }} {{ playersOf(team).length === 1 ? "jogador" : "jogadores" }}
            </span>
          </div>
          <div class="flex flex-col gap-2 p-3">
            <p v-if="playersOf(team).length === 0" class="py-1 text-center text-xs text-ink-muted">
              Sem jogadores ainda.
            </p>
            <div
              v-for="p in playersOf(team)"
              :key="p.player_uuid"
              :class="`flex items-center gap-3 rounded-xl border p-2.5 ${
                dup.has(p.player_uuid) ? 'border-primary/50 bg-primary/5' : 'border-line-soft bg-surface-2'
              }`"
            >
              <span
                class="font-heading flex h-11 w-10 shrink-0 items-center justify-center rounded-lg text-lg font-bold"
                :style="{ backgroundColor: teamBib(m, team).hex, color: contrastText(teamBib(m, team).hex) }"
              >
                {{ p.bib_number === "" || p.bib_number == null ? "?" : p.bib_number }}
              </span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-ink">{{ p.name || "(sem nome)" }}</p>
                <p class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-muted">
                  <span class="rounded-full bg-surface px-2 py-0.5">{{ p.position || "—" }}</span>
                  <span v-if="!p.athlete_id" class="rounded-full bg-warning/15 px-2 py-0.5 font-medium text-warning">sem cadastro</span>
                  <span>⏱ {{ p.minutes_played || 0 }}′</span>
                  <template v-if="m.track_score">
                    <span v-if="p.goals">⚽ {{ p.goals }}</span>
                    <span v-if="p.yellow_cards">🟨 {{ p.yellow_cards }}</span>
                    <span v-if="p.red_cards">🟥 {{ p.red_cards }}</span>
                  </template>
                  <span v-if="isOutOfRange(m, p.bib_number)" class="font-semibold text-primary-text">fora da faixa</span>
                  <span v-if="dup.has(p.player_uuid)" class="font-semibold text-primary-text">nº repetido</span>
                </p>
              </div>
              <button
                type="button"
                @click="removePlayer(p.player_uuid)"
                :aria-label="`Remover ${p.name || 'jogador'}`"
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line text-primary-text hover:border-primary/40"
              >
                <Icon name="x" class="h-4 w-4" />
              </button>
            </div>

            <!-- adicionar jogador -->
            <div class="mt-1 rounded-xl border border-dashed border-line bg-surface-2/50 p-2.5">
              <div class="grid grid-cols-[64px_1fr] gap-2">
                <input
                  type="number"
                  class="font-heading rounded-lg border border-line bg-surface-2 py-2 text-center text-lg font-bold text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                  placeholder="Nº"
                  :aria-label="`Número do colete (${team})`"
                  v-model="draft[team].num"
                  @keydown.enter="addPlayer(team)"
                />
                <input
                  :class="inputClass"
                  :list="`atletas-cat-${team}`"
                  placeholder="Matrícula (ex.: 1301)"
                  :aria-label="`Matrícula (${team})`"
                  v-model="draft[team].mat"
                  @input="onMatricula(team)"
                  @keydown.enter="addPlayer(team)"
                />
                <datalist :id="`atletas-cat-${team}`">
                  <option v-for="a in atletasCat" :key="a.id" :value="a.matricula">{{ a.nome }}</option>
                </datalist>
              </div>
              <input
                :class="`${inputClass} mt-2`"
                placeholder="Nome do jogador (preenche pela matrícula)"
                :aria-label="`Nome (${team})`"
                v-model="draft[team].name"
                @keydown.enter="addPlayer(team)"
              />
              <p
                v-if="resolvedFor(team)"
                class="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-secondary"
              >
                <Icon name="check" class="h-3.5 w-3.5 shrink-0" />
                {{ resolvedFor(team).nome }} · {{ resolvedFor(team).posicao }} — atleta do cadastro
              </p>
              <p
                v-else-if="draft[team].mat || draft[team].name"
                class="mt-1.5 flex items-center gap-1.5 text-[11px] text-warning"
              >
                <Icon name="alert" class="h-3.5 w-3.5 shrink-0" /> Sem correspondência no cadastro — confira a matrícula.
              </p>
              <div class="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <input
                  type="number"
                  min="0"
                  :class="inputClass"
                  placeholder="Min. jogados"
                  :aria-label="`Minutos (${team})`"
                  v-model="draft[team].min"
                  @keydown.enter="addPlayer(team)"
                />
                <select :class="inputClass" :aria-label="`Posição (${team})`" v-model="draft[team].pos">
                  <option value="">Posição</option>
                  <option v-for="x in POSICOES" :key="x">{{ x }}</option>
                </select>
                <PrimaryButton class="sm:col-span-1" @click="addPlayer(team)">
                  <Icon name="plus" class="h-4 w-4" /> Adicionar
                </PrimaryButton>
              </div>
              <p v-if="addError[team]" role="alert" class="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary-text">
                <Icon name="alert" class="h-3.5 w-3.5" /> {{ addError[team] }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- 4. Resumo & export -->
    <Card title="Resumo & exportação">
      <template #icon><Icon name="barChart" class="h-4 w-4" /></template>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div class="rounded-xl border border-line-soft bg-surface-2 p-3">
          <p class="font-heading text-2xl font-bold text-ink">{{ totalPlayers }}</p>
          <p class="text-xs uppercase tracking-wide text-ink-muted">Jogadores</p>
        </div>
        <div class="rounded-xl border border-line-soft bg-surface-2 p-3">
          <p :class="`font-heading text-2xl font-bold ${semVinculo ? 'text-warning' : 'text-ink'}`">{{ semVinculo }}</p>
          <p class="text-xs uppercase tracking-wide text-ink-muted">Sem cadastro</p>
        </div>
        <div class="rounded-xl border border-line-soft bg-surface-2 p-3">
          <p :class="`font-heading text-2xl font-bold ${dup.size ? 'text-primary-text' : 'text-ink'}`">{{ dup.size }}</p>
          <p class="text-xs uppercase tracking-wide text-ink-muted">Nº em conflito</p>
        </div>
        <div class="rounded-xl border border-line-soft bg-surface-2 p-3">
          <p :class="`font-heading text-2xl font-bold ${noNumber ? 'text-warning' : 'text-ink'}`">{{ noNumber }}</p>
          <p class="text-xs uppercase tracking-wide text-ink-muted">Sem número</p>
        </div>
        <div class="rounded-xl border border-line-soft bg-surface-2 p-3">
          <p class="font-heading text-2xl font-bold text-ink">{{ totalMinutes }}′</p>
          <p class="text-xs uppercase tracking-wide text-ink-muted">Minutos somados</p>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <PrimaryButton @click="exportCSV">
          <Icon name="download" class="h-4 w-4" /> Súmula (CSV)
        </PrimaryButton>
        <PrimaryButton variant="secondary" @click="exportJSON">
          <Icon name="download" class="h-4 w-4" /> Súmula (JSON)
        </PrimaryButton>
      </div>
      <p class="mt-3 text-sm text-ink-muted">
        A súmula sai no formato do modelo da escolinha —
        <span class="font-medium text-ink">atleta · posição · campo · camisa · time · categoria · data</span> —
        e é nomeada por <span class="font-medium text-ink">dia + campo</span> (ex.:
        <span class="font-medium text-ink">sumula_2026-08-11_CAMPO-OFICIAL-5</span>). Placar, gols e cartões são
        <span class="font-medium text-ink">opcionais</span> (dados de jogo, fora do modelo da súmula).
      </p>
    </Card>
  </div>
</template>

import { reactive, watch } from "vue";

// Registro de partidas (jogo real entre dois times) — separado da súmula de
// treino (EditorSumula.vue, que é escalação de uma turma). Cada partida e cada
// jogador recebem um UUID; a chave que uma futura pipeline de vídeo (CV/VLM)
// usa para reconhecer o jogador é (match_uuid · cor do colete · número).
// Mock/protótipo: persiste no navegador (localStorage), sem backend.
const STORAGE_KEY = "iscout.partidas.v1";

function nowISO() {
  return new Date().toISOString();
}

function uuid() {
  return crypto.randomUUID();
}

// Molde de uma nova partida. Esquema de colete "duas cores" (uma cor por time,
// número pode repetir entre times) é o padrão; "cor única" torna o número
// global (ninguém repete).
export function newMatch() {
  const id = uuid();
  return {
    match_uuid: id,
    category: "Sub-13",
    match_date: new Date().toISOString().slice(0, 10),
    kickoff_time: "",
    team_home_name: "Time A",
    team_away_name: "Time B",
    location: "",
    bib_scheme: "two_colors_repeat", // ou "one_color_unique"
    bib_color_home: "#fbbf24",
    bib_label_home: "Amarelo",
    bib_color_away: "#5b8def",
    bib_label_away: "Azul",
    number_min: 1,
    number_max: 99,
    track_score: false,
    score_home: 0,
    score_away: 0,
    notes: "",
    players: [],
    created_at: nowISO(),
    updated_at: nowISO(),
  };
}

export function newPlayer(team) {
  return {
    player_uuid: uuid(),
    team,
    name: "",
    bib_number: "",
    position: "",
    minutes_played: 0,
    goals: 0,
    yellow_cards: 0,
    red_cards: 0,
  };
}

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && parsed.matches && typeof parsed.matches === "object") return parsed;
  } catch {
    // localStorage indisponível — segue só em memória
  }
  return null;
}

const initial = readStored() ?? { matches: {}, current: null };

// Garante ao menos uma partida "corrente" para editar já na primeira carga.
if (!initial.current || !initial.matches[initial.current]) {
  const m = newMatch();
  initial.matches[m.match_uuid] = m;
  initial.current = m.match_uuid;
}

export const partidasStore = reactive(initial);

watch(
  partidasStore,
  () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(partidasStore));
    } catch {
      // ambiente sem localStorage — segue só em memória
    }
  },
  { deep: true },
);

export function currentMatch() {
  return partidasStore.matches[partidasStore.current];
}

export function touch() {
  const m = currentMatch();
  if (m) m.updated_at = nowISO();
}

export function createMatch() {
  const m = newMatch();
  partidasStore.matches[m.match_uuid] = m;
  partidasStore.current = m.match_uuid;
  return m;
}

export function setCurrent(id) {
  if (partidasStore.matches[id]) partidasStore.current = id;
}

export function removeMatch(id) {
  delete partidasStore.matches[id];
  const rest = Object.keys(partidasStore.matches);
  if (rest.length) {
    partidasStore.current = rest[0];
  } else {
    createMatch();
  }
}

// Cor/rótulo do colete de um time, respeitando o esquema (em "cor única" os
// dois times usam a cor "home").
export function teamBib(m, team) {
  if (m.bib_scheme === "one_color_unique") {
    return { hex: m.bib_color_home, label: m.bib_label_home };
  }
  return team === "home"
    ? { hex: m.bib_color_home, label: m.bib_label_home }
    : { hex: m.bib_color_away, label: m.bib_label_away };
}

// Números em conflito: em "cor única" a chave é só o número; em "duas cores" é
// (time · número), então o mesmo número pode existir nos dois times.
export function conflictIds(m) {
  const seen = {};
  const dups = new Set();
  m.players.forEach((p) => {
    if (p.bib_number === "" || p.bib_number == null) return;
    const key = m.bib_scheme === "one_color_unique" ? `${p.bib_number}` : `${p.team}:${p.bib_number}`;
    if (seen[key] != null) {
      dups.add(p.player_uuid);
      dups.add(seen[key]);
    } else {
      seen[key] = p.player_uuid;
    }
  });
  return dups;
}

export function isOutOfRange(m, n) {
  return n !== "" && n != null && (n < m.number_min || n > m.number_max);
}

// Payload normalizado (tabelas matches/players + índice cv_index com a chave
// cor·número → player_uuid) — o shape que um backend/pipeline consumiria.
export function buildPayload(m) {
  const match = {
    match_uuid: m.match_uuid,
    category: m.category,
    match_date: m.match_date,
    kickoff_time: m.kickoff_time,
    team_home_name: m.team_home_name,
    team_away_name: m.team_away_name,
    location: m.location,
    bib_scheme: m.bib_scheme,
    bib_color_home: m.bib_color_home,
    bib_label_home: m.bib_label_home,
    bib_color_away: m.bib_scheme === "one_color_unique" ? m.bib_color_home : m.bib_color_away,
    bib_label_away: m.bib_scheme === "one_color_unique" ? m.bib_label_home : m.bib_label_away,
    number_min: m.number_min,
    number_max: m.number_max,
    score_home: m.track_score ? m.score_home : null,
    score_away: m.track_score ? m.score_away : null,
    notes: m.notes,
    created_at: m.created_at,
    updated_at: m.updated_at,
  };
  const players = m.players.map((p) => {
    const { hex, label } = teamBib(m, p.team);
    return {
      player_uuid: p.player_uuid,
      match_uuid: m.match_uuid,
      name: p.name,
      team: p.team,
      bib_color_hex: hex,
      bib_color_label: label,
      bib_number: p.bib_number,
      position: p.position,
      minutes_played: Number(p.minutes_played) || 0,
      goals: m.track_score ? Number(p.goals) || 0 : null,
      yellow_cards: m.track_score ? Number(p.yellow_cards) || 0 : null,
      red_cards: m.track_score ? Number(p.red_cards) || 0 : null,
    };
  });
  const cv_index = players.map((p) => ({
    match_uuid: m.match_uuid,
    color_hex: p.bib_color_hex,
    number: p.bib_number,
    player_uuid: p.player_uuid,
    key:
      m.bib_scheme === "one_color_unique"
        ? `${m.match_uuid}|${p.bib_number}`
        : `${m.match_uuid}|${p.bib_color_hex}|${p.bib_number}`,
  }));
  return { schema_version: 1, exported_at: nowISO(), match, players, cv_index };
}

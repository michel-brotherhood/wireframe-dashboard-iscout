import { findAtletaByMatricula } from "./atletas";

// "Agora" real do sistema — nunca uma data congelada. Centralizado aqui (em
// vez de `new Date()` espalhado pelo código) para que toda comparação com o
// instante atual passe por um único ponto. `now` é opcional e só existe para
// testes injetarem um instante determinístico — a interface real sempre usa
// o relógio real por padrão.
export function getNow(now) {
  return now ?? new Date();
}

export function isPastDeadline(plano, now = getNow()) {
  return (
    new Date(plano.deadlineAt).getTime() < now.getTime() &&
    (plano.status === "draft" || plano.status === "submitted" || plano.status === "changes_requested")
  );
}

// Prazo limite = data/horário da sessão - 24h. Nunca fixo (ex.: "véspera às
// 18h") — calculado a partir do horário real informado no plano.
export function calcDeadline(sessionDate, horario) {
  const d = new Date(`${sessionDate}T${horario}:00`);
  d.setHours(d.getHours() - 24);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

// Tempo restante/atraso em relação ao prazo limite — usado no cabeçalho do
// plano e na fila de Aprovações. `now` é injetável para permitir mock/teste.
export function prazoLabel(deadlineAt, now = getNow()) {
  const diffH = Math.round((new Date(deadlineAt).getTime() - now.getTime()) / 3600000);
  if (diffH >= 24) return { text: `Faltam ${Math.round(diffH / 24)}d`, tone: "text-ink-muted" };
  if (diffH >= 0) return { text: `Faltam ${diffH}h`, tone: diffH <= 6 ? "text-warning" : "text-ink-muted" };
  const atraso = Math.abs(diffH);
  return { text: atraso < 24 ? `Atrasado ${atraso}h` : `Atrasado ${Math.round(atraso / 24)}d`, tone: "text-primary-text" };
}

const DIAS_SEMANA = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
export function diaDaSemana(sessionDate) {
  return DIAS_SEMANA[new Date(`${sessionDate}T00:00:00`).getDay()];
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

// Data (YYYY-MM-DD) do dia real, usada como referência de "hoje" na interface
// (filtros, cálculos) — nunca uma data fixa de demonstração.
export function todayDateString(now = getNow()) {
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

// Data/horário padrão sugerido para uma nova sessão no Editor de Plano:
// sempre dinâmico (agora + 48h), nunca uma data fixa de demonstração — só
// assim o cálculo do prazo (sessão - 24h) nasce válido por padrão.
export function defaultSessionDateTime(now = getNow()) {
  const d = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  return {
    date: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`,
    time: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
  };
}

// Catálogo de temas/subtemas pedagógicos — depende da fase escolhida no
// cabeçalho do plano (item 6 do ajuste de nomenclatura pedagógica).
export const FASE_TEMAS = {
  "Organização ofensiva": [
    { tema: "Construção de Jogo", subtemas: ["Passe Curto", "Saída de Bola sob Pressão"] },
    { tema: "Progressão e Finalização", subtemas: ["Ataque a Espaços", "Combinações no Último Terço"] },
  ],
  "Organização defensiva": [
    { tema: "Pressão e Recuperação", subtemas: ["Pressão Alta", "Marcação por Zona"] },
    { tema: "Compactação Defensiva", subtemas: ["Redução de Espaços", "Cobertura entre Linhas"] },
  ],
  "Progressão e finalização": [
    { tema: "Transição Ofensiva", subtemas: ["Contra-ataque", "Ocupação de Espaços Livres"] },
    { tema: "Finalização", subtemas: ["Definição em Área", "Cruzamentos e Finalização"] },
  ],
};

// `atletaId` resolvido a partir do registro único (data/atletas.js) por
// matrícula, não digitado à mão — evita a escalação e o cadastro de atletas
// divergirem silenciosamente (ver auditoria "Evolução do Dashboard", Fase 1).
// `time` = cor do colete por atleta (dois times dentro do mesmo campo), no
// formato da 2ª aba do modelo de súmula (ATLETA·POSIÇÃO·CAMPO·CAMISA·TIME·
// CATEGORIA). `atletaId` resolvido a partir do registro único (data/atletas.js)
// por matrícula, não digitado à mão.
const rosterAmarelo = [
  { jersey: 1, nome: "Rodrigo Almeida", posicao: "Goleiro", categoria: "Sub-15", matricula: "1001", starter: true, time: "Amarelo" },
  { jersey: 2, nome: "Maria Santos", posicao: "Lateral", categoria: "Sub-15", matricula: "1002", starter: true, time: "Amarelo" },
  { jersey: 3, nome: "Pedro Costa", posicao: "Zagueiro", categoria: "Sub-15", matricula: "1003", starter: true, time: "Amarelo" },
  { jersey: 4, nome: "Ana Silva", posicao: "Zagueira", categoria: "Sub-15", matricula: "1004", starter: true, time: "Amarelo" },
  { jersey: 5, nome: "Carlos Oliveira", posicao: "Lateral", categoria: "Sub-15", matricula: "1005", starter: true, time: "Amarelo" },
  { jersey: 6, nome: "Fernanda Costa", posicao: "Meia", categoria: "Sub-15", matricula: "1006", starter: true, time: "Amarelo" },
  { jersey: 7, nome: "Bruno Silva", posicao: "Meia", categoria: "Sub-15", matricula: "1007", starter: true, time: "Azul" },
  { jersey: 8, nome: "Juliana Santos", posicao: "Meia", categoria: "Sub-15", matricula: "1008", starter: true, time: "Azul" },
  { jersey: 9, nome: "Ricardo Oliveira", posicao: "Atacante", categoria: "Sub-15", matricula: "1009", starter: true, time: "Azul" },
  { jersey: 10, nome: "Beatriz Costa", posicao: "Atacante", categoria: "Sub-15", matricula: "1010", starter: true, time: "Azul" },
  { jersey: 11, nome: "Gustavo Silva", posicao: "Atacante", categoria: "Sub-15", matricula: "1011", starter: true, time: "Azul" },
].map((entry) => ({ ...entry, atletaId: findAtletaByMatricula(entry.matricula)?.id }));

// Roster de uma súmula ainda EM PREPARAÇÃO — alguns atletas sem camisa/time
// definidos (estado "A definir" do modelo). Demonstra súmula incompleta.
const rosterEmPreparacao = [
  { jersey: 14, nome: "Lucas Orthey Kaize", posicao: "Zagueiro", categoria: "Sub-15", matricula: "1003", starter: true, time: "Amarelo" },
  { jersey: 15, nome: "Lucas Eiji Siqueira", posicao: "Lateral", categoria: "Sub-15", matricula: "1005", starter: true, time: "Amarelo" },
  { jersey: 16, nome: "Diogo Vieira Batista", posicao: "Lateral", categoria: "Sub-15", matricula: "1002", starter: true, time: "Amarelo" },
  { jersey: 22, nome: "Matheus Ciancio", posicao: "Meia", categoria: "Sub-15", matricula: "1007", starter: true, time: "Azul" },
  { jersey: 25, nome: "Gael Conte Soares", posicao: "Zagueiro", categoria: "Sub-15", matricula: "1004", starter: true, time: "Azul" },
  { jersey: null, nome: "Theo Cordeiro Rossi", posicao: "Meia", categoria: "Sub-15", matricula: "1006", starter: true, time: null },
  { jersey: null, nome: "Aymee Rodrigues Martins", posicao: "Lateral", categoria: "Sub-15", matricula: "1010", starter: false, time: null },
].map((entry) => ({ ...entry, atletaId: findAtletaByMatricula(entry.matricula)?.id }));

const plano0207 = {
  id: "plan-0207",
  sessionDate: "2026-07-02",
  horario: "16:00",
  unidade: "Atibaia",
  periodo: "Tarde",
  semana: "Semana 1",
  categoria: "Sub-15",
  turma: "Turma A",
  team: "Amarelo",
  coachName: "João Silva",
  fase: "Organização ofensiva",
  tema: "Construção de Jogo",
  subtema: "Passe Curto",
  status: "approved",
  deadlineAt: calcDeadline("2026-07-02", "16:00"),
  etapaInicial: {
    objetivo: "Refinamento do gesto motor",
    duracaoMin: 10,
    estacao1: {
      nome: "Aquecimento Lúdico com Bola",
      tipo: "Com bola",
      descricao: "Jogos lúdicos de ativação com bola, foco em coordenação óculo-pedal.",
      duracaoMin: 5,
      materiais: "Bolas, coletes",
    },
    estacao2: {
      nome: "Circuito Recreativo Sem Bola",
      tipo: "Recreativo",
      descricao: "Circuito de agilidade e coordenação motora sem bola.",
      duracaoMin: 5,
      materiais: "Cones, escada de agilidade",
    },
  },
  etapaFundamentacao: {
    objetivo: "Função no modelo de jogo",
    duracaoMin: 15,
    tipo: "Analítico",
  },
  etapaPrincipal: {
    objetivo: "Função no modelo de jogo",
    duracaoMin: 35,
    subTemas: ["Projeção em Campo", "Criação de Espaços"],
    orientacoes: ["Jogo Posicional", "Respeito aos Setores"],
    intervalo: { hidratacaoMin: 5, repousoMin: 2, instruirMin: 3, ativarMin: 2 },
  },
  observacoes:
    "Treino focado em passe curto e posicionamento. Atenção especial ao intervalo para hidratação.",
  createdAt: "2026-07-01T10:00:00",
  approvedAt: "2026-07-01T14:30:00",
  approvedBy: "Carla Mendes (Head Coach)",
};

const sumula0207 = {
  id: "sum-0207",
  sessionDate: "2026-07-02",
  team: "Amarelo",
  campo: "Campo Oficial 5",
  eventLabel: "Sessão 1 - Campo 2",
  status: "confirmed",
  entries: rosterAmarelo,
  confirmedAt: "2026-07-02T09:00:00",
};

const execution0207 = {
  id: "exec-0207",
  planoId: plano0207.id,
  sumulaId: sumula0207.id,
  status: "confirmed",
  etapaInicial: {
    planejadoMin: 10,
    executadoMin: 12,
    observacoes: "Aquecimento mais longo que o previsto",
  },
  etapaFundamentacao: {
    planejadoMin: 15,
    executadoMin: 14,
    observacoes: "Exercício de passe curto funcionou bem",
  },
  etapaPrincipal: {
    planejadoMin: 35,
    executadoMin: 36,
    observacoes: "Jogo posicional com bom entendimento",
  },
  desvios: [
    {
      id: "dev-1",
      etapa: "Inicial",
      impacto: "Baixo",
      descricao: "Aquecimento mais longo, mas positivo",
    },
    {
      id: "dev-2",
      etapa: "Principal",
      impacto: "Médio",
      descricao: "Um jogador lesionou no intervalo",
    },
  ],
  confirmedAt: "2026-07-02T18:00:00",
};

function shallowPlan(overrides) {
  return { ...plano0207, ...overrides, id: overrides.id ?? plano0207.id };
}
function shallowSumula(overrides) {
  // confirmedAt herdado de sumula0207 (02/07) ficaria preso a essa data em toda
  // súmula derivada — deriva a partir da própria sessionDate por padrão, a
  // menos que o overrides já defina confirmedAt explicitamente (ex.: rascunho).
  const sessionDate = overrides.sessionDate ?? sumula0207.sessionDate;
  return {
    ...sumula0207,
    confirmedAt: `${sessionDate}T09:00:00`,
    ...overrides,
    id: overrides.id ?? sumula0207.id,
  };
}

export const treinos = [
  // Próxima aula (ainda não aconteceu) — demonstra o estado "antes da aula" do
  // ciclo: plano aprovado, captura programada, súmula em preparação.
  {
    id: "t-0820",
    sessionDate: "2026-08-20",
    horario: "14:30",
    unidade: "Atibaia",
    categoria: "Sub-15",
    turma: "Turma A",
    team: "Amarelo",
    campo: "Campo Oficial 5",
    coachName: "João Silva",
    status: "Rascunho",
    capturaStatus: "programada",
    videosStatus: "aguardando",
    analiseStatus: "aguardando",
    plano: shallowPlan({
      id: "plan-0820",
      sessionDate: "2026-08-20",
      horario: "14:30",
      status: "approved",
      deadlineAt: calcDeadline("2026-08-20", "14:30"),
      approvedAt: "2026-08-19T10:00:00",
      approvedBy: "Carla Mendes (Head Coach)",
    }),
    sumula: {
      id: "sum-0820",
      sessionDate: "2026-08-20",
      team: "Amarelo",
      campo: "Campo Oficial 5",
      eventLabel: "Sessão 1 - Campo 1",
      status: "draft",
      entries: rosterEmPreparacao,
      confirmedAt: undefined,
    },
  },
  {
    id: "t-0702",
    sessionDate: "2026-07-02",
    unidade: "Atibaia",
    categoria: "Sub-15",
    turma: "Turma A",
    team: "Amarelo",
    campo: "Campo Oficial 5",
    coachName: "João Silva",
    status: "Executado",
    capturaStatus: "realizada",
    videosStatus: "disponivel",
    analiseStatus: "pronta",
    plano: plano0207,
    sumula: sumula0207,
    executionLog: execution0207,
  },
  {
    id: "t-0701",
    sessionDate: "2026-07-01",
    unidade: "Atibaia",
    categoria: "Sub-17",
    turma: "Turma B",
    team: "Azul",
    campo: "Quadra 3 Positivo",
    coachName: "Maria Santos",
    status: "Executado",
    capturaStatus: "realizada",
    videosStatus: "disponivel",
    analiseStatus: "aguardando",
    plano: shallowPlan({
      id: "plan-0701",
      sessionDate: "2026-07-01",
      categoria: "Sub-17",
      turma: "Turma B",
      team: "Azul",
      coachName: "Maria Santos",
      deadlineAt: calcDeadline("2026-07-01", "16:00"),
    }),
    sumula: shallowSumula({ id: "sum-0701", sessionDate: "2026-07-01", team: "Azul", campo: "Quadra 3 Positivo" }),
    executionLog: { ...execution0207, id: "exec-0701" },
  },
  {
    id: "t-0630",
    sessionDate: "2026-06-30",
    unidade: "Atibaia",
    categoria: "Sub-15",
    turma: "Turma A",
    team: "Amarelo",
    campo: "Campo Oficial 5",
    coachName: "João Silva",
    status: "Executado",
    capturaStatus: "realizada",
    videosStatus: "disponivel",
    analiseStatus: "pronta",
    plano: shallowPlan({ id: "plan-0630", sessionDate: "2026-06-30", deadlineAt: calcDeadline("2026-06-30", "16:00") }),
    sumula: shallowSumula({ id: "sum-0630", sessionDate: "2026-06-30", campo: "Campo Oficial 5" }),
    executionLog: { ...execution0207, id: "exec-0630" },
  },
  {
    id: "t-0629",
    sessionDate: "2026-06-29",
    unidade: "Atibaia",
    categoria: "Sub-17",
    turma: "Turma B",
    team: "Azul",
    campo: "Quadra 3 Positivo",
    coachName: "Maria Santos",
    status: "Rascunho",
    capturaStatus: "aguardando",
    videosStatus: "aguardando",
    analiseStatus: "aguardando",
    plano: shallowPlan({
      id: "plan-0629",
      sessionDate: "2026-06-29",
      categoria: "Sub-17",
      turma: "Turma B",
      team: "Azul",
      coachName: "Maria Santos",
      status: "draft",
      deadlineAt: calcDeadline("2026-06-29", "16:00"),
      approvedAt: undefined,
      approvedBy: undefined,
    }),
    sumula: shallowSumula({ id: "sum-0629", sessionDate: "2026-06-29", team: "Azul", campo: "Quadra 3 Positivo", status: "draft", confirmedAt: undefined }),
  },
  {
    id: "t-0628",
    sessionDate: "2026-06-28",
    unidade: "Atibaia",
    categoria: "Sub-15",
    turma: "Turma A",
    team: "Amarelo",
    campo: "Campo Oficial 5",
    coachName: "João Silva",
    status: "Executado",
    capturaStatus: "realizada",
    videosStatus: "disponivel",
    analiseStatus: "aguardando",
    plano: shallowPlan({ id: "plan-0628", sessionDate: "2026-06-28", deadlineAt: calcDeadline("2026-06-28", "16:00") }),
    sumula: shallowSumula({ id: "sum-0628", sessionDate: "2026-06-28", campo: "Campo Oficial 5" }),
    executionLog: { ...execution0207, id: "exec-0628" },
  },
  // Demonstra o card "Aulas executadas sem plano aprovado": execução registrada
  // mas o plano ligado a ela nunca chegou a "approved" (foi devolvido depois).
  {
    id: "t-0626",
    sessionDate: "2026-06-26",
    unidade: "Atibaia",
    categoria: "Sub-15",
    turma: "Turma A",
    team: "Amarelo",
    campo: "Campo Oficial 5",
    coachName: "João Silva",
    status: "Executado",
    capturaStatus: "realizada",
    videosStatus: "disponivel",
    analiseStatus: "aguardando",
    plano: shallowPlan({
      id: "plan-0626",
      sessionDate: "2026-06-26",
      status: "changes_requested",
      deadlineAt: calcDeadline("2026-06-26", "16:00"),
      approvedAt: undefined,
      approvedBy: undefined,
      reviewedAt: "2026-06-25T19:00:00",
      reviewedBy: "Carla Mendes (Head Coach)",
      reviewComment: "Duração da Etapa Principal fora do padrão — ajustar antes de reaprovar.",
    }),
    sumula: shallowSumula({ id: "sum-0626", sessionDate: "2026-06-26", campo: "Campo Oficial 5" }),
    executionLog: { ...execution0207, id: "exec-0626" },
  },
];

// Fila de Aprovações (RF3/RF4) — planos que ainda não avançaram para
// súmula/execução. Independente de `treinos` de propósito.
export const planosPendentesIniciais = [
  shallowPlan({
    id: "plan-pend-1",
    sessionDate: "2026-07-03",
    horario: "16:00",
    categoria: "Sub-15",
    turma: "Turma A",
    team: "Amarelo",
    coachName: "João Silva",
    status: "submitted",
    deadlineAt: calcDeadline("2026-07-03", "16:00"),
    createdAt: "2026-07-02T09:00:00",
    approvedAt: undefined,
    approvedBy: undefined,
  }),
  shallowPlan({
    id: "plan-pend-2",
    sessionDate: "2026-07-03",
    horario: "18:00",
    categoria: "Sub-17",
    turma: "Turma B",
    team: "Azul",
    coachName: "Maria Santos",
    fase: "Organização defensiva",
    tema: "Pressão e Recuperação",
    subtema: "Pressão Alta",
    status: "submitted",
    deadlineAt: calcDeadline("2026-07-03", "18:00"),
    createdAt: "2026-07-02T11:20:00",
    approvedAt: undefined,
    approvedBy: undefined,
  }),
  shallowPlan({
    id: "plan-pend-3",
    sessionDate: "2026-06-24",
    horario: "16:00",
    categoria: "Sub-15",
    turma: "Turma A",
    team: "Amarelo",
    coachName: "João Silva",
    status: "submitted",
    // sessionDate fixo no passado — alimenta o card/filtro "Fora do prazo" de forma
    // estável. Precisa ser uma data sem treino correspondente em `treinos`: reusar
    // uma data já ocupada (ex.: 30/06, de t-0630) cria dois planos "30/06 · Sub-15 ·
    // Turma A" com ids e status diferentes — a home mostra um "Aprovado" (o do
    // treino) e a fila de Aprovações mostra o outro "Aguardando" (achado N-01).
    deadlineAt: calcDeadline("2026-06-24", "16:00"),
    createdAt: "2026-06-23T15:45:00",
    approvedAt: undefined,
    approvedBy: undefined,
  }),
  shallowPlan({
    id: "plan-pend-4",
    sessionDate: "2026-06-27",
    horario: "16:00",
    categoria: "Sub-17",
    turma: "Turma B",
    team: "Azul",
    coachName: "Maria Santos",
    status: "changes_requested",
    deadlineAt: calcDeadline("2026-06-27", "16:00"),
    createdAt: "2026-06-26T09:00:00",
    approvedAt: undefined,
    approvedBy: undefined,
    reviewedAt: "2026-06-26T18:10:00",
    reviewedBy: "Carla Mendes (Head Coach)",
    reviewComment: "Duração total abaixo de 30 minutos — revisar Etapa Principal.",
  }),
  shallowPlan({
    id: "plan-pend-5",
    sessionDate: "2026-06-20",
    horario: "16:00",
    categoria: "Sub-15",
    turma: "Turma A",
    team: "Amarelo",
    coachName: "João Silva",
    status: "cancelled",
    deadlineAt: calcDeadline("2026-06-20", "16:00"),
    createdAt: "2026-06-18T09:00:00",
    approvedAt: undefined,
    approvedBy: undefined,
    reviewedAt: "2026-06-19T10:00:00",
    reviewedBy: "Carla Mendes (Head Coach)",
    reviewComment: "Aula cancelada — unidade fechada para manutenção do campo.",
  }),
];

// Planos já aprovados e ainda sem execução registrada — fonte do seletor
// "Plano de Referência" no Editor de Registro de Execução (gate do RF5).
export const planosDisponiveisParaExecucao = [
  plano0207,
  shallowPlan({
    id: "plan-aprov-1",
    sessionDate: "2026-07-05",
    horario: "16:00",
    categoria: "Sub-17",
    turma: "Turma B",
    team: "Azul",
    coachName: "Maria Santos",
    status: "approved",
    deadlineAt: calcDeadline("2026-07-05", "16:00"),
    createdAt: "2026-07-03T09:00:00",
    approvedAt: "2026-07-04T10:00:00",
    approvedBy: "Carla Mendes (Head Coach)",
  }),
];

export const ambiguousMatches = [
  {
    jersey: 7,
    nome: "Bruno Silva",
    opcoes: [
      { id: "a1", label: "Bruno Silva — Sub-13 — Meia — matrícula 1024" },
      { id: "a2", label: "Bruno Silva — Sub-15 — Atacante — matrícula 2081" },
    ],
  },
  {
    jersey: 10,
    nome: "Beatriz Costa",
    opcoes: [
      { id: "b1", label: "Beatriz Costa — Sub-15 — Atacante — matrícula 1573" },
      { id: "b2", label: "Beatriz Costa — Sub-17 — Meia — matrícula 1998" },
    ],
  },
];

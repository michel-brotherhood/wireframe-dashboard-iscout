import type { Treino, PlanoAula, MatchSumula, ExecutionLog } from "../types";

// "Agora" fixo do mundo mock — usado para calcular prazos vencidos ("fora do
// prazo") sem depender de Date.now() real, mantendo os dados determinísticos.
export const NOW_MOCK = "2026-07-02T12:00:00";

export function isPastDeadline(plano: PlanoAula, now: string = NOW_MOCK) {
  return plano.deadlineAt < now && (plano.status === "draft" || plano.status === "submitted" || plano.status === "changes_requested");
}

const rosterAmarelo: MatchSumula["entries"] = [
  { jersey: 1, nome: "João Silva", posicao: "Goleiro", starter: true },
  { jersey: 2, nome: "Maria Santos", posicao: "Lateral", starter: true },
  { jersey: 3, nome: "Pedro Costa", posicao: "Zagueiro", starter: true },
  { jersey: 4, nome: "Ana Silva", posicao: "Zagueira", starter: true },
  { jersey: 5, nome: "Carlos Oliveira", posicao: "Lateral", starter: true },
  { jersey: 6, nome: "Fernanda Costa", posicao: "Meia", starter: true },
  { jersey: 7, nome: "Bruno Silva", posicao: "Meia", starter: true },
  { jersey: 8, nome: "Juliana Santos", posicao: "Meia", starter: true },
  { jersey: 9, nome: "Ricardo Oliveira", posicao: "Atacante", starter: true },
  { jersey: 10, nome: "Beatriz Costa", posicao: "Atacante", starter: true },
  { jersey: 11, nome: "Gustavo Silva", posicao: "Atacante", starter: true },
];

const plano0207: PlanoAula = {
  id: "plan-0207",
  sessionDate: "2026-07-02",
  unidade: "Atibaia",
  categoria: "Sub-15",
  turma: "Turma A",
  team: "Amarelo",
  coachName: "João Silva",
  fase: "Ofensiva",
  status: "approved",
  deadlineAt: "2026-07-01T18:00:00",
  etapaInicial: {
    objetivo: "Refinamento do gesto motor",
    duracaoMin: 10,
    coordenacao: ["Aquecimento Lúdico"],
    estacoes: ["Com bola", "Sem bola", "Recreativo"],
  },
  etapaFuncionamento: {
    objetivo: "Função no modelo de jogo",
    duracaoMin: 15,
    tipo: "Analítico",
    tema: "Passe Curto",
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

const sumula0207: MatchSumula = {
  id: "sum-0207",
  sessionDate: "2026-07-02",
  team: "Amarelo",
  eventLabel: "Take 1 - Campo 2",
  status: "confirmed",
  entries: rosterAmarelo,
  confirmedAt: "2026-07-02T09:00:00",
};

const execution0207: ExecutionLog = {
  id: "exec-0207",
  planoId: plano0207.id,
  sumulaId: sumula0207.id,
  status: "confirmed",
  etapaInicial: {
    planejadoMin: 10,
    executadoMin: 12,
    observacoes: "Aquecimento mais longo que o previsto",
  },
  etapaFuncionamento: {
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

function shallowPlan(overrides: Partial<PlanoAula>): PlanoAula {
  return { ...plano0207, ...overrides, id: overrides.id ?? plano0207.id };
}
function shallowSumula(overrides: Partial<MatchSumula>): MatchSumula {
  return { ...sumula0207, ...overrides, id: overrides.id ?? sumula0207.id };
}

export const treinos: Treino[] = [
  {
    id: "t-0702",
    sessionDate: "2026-07-02",
    unidade: "Atibaia",
    categoria: "Sub-15",
    turma: "Turma A",
    team: "Amarelo",
    coachName: "João Silva",
    status: "Executado",
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
    coachName: "Maria Santos",
    status: "Executado",
    plano: shallowPlan({ id: "plan-0701", sessionDate: "2026-07-01", categoria: "Sub-17", turma: "Turma B", team: "Azul", coachName: "Maria Santos" }),
    sumula: shallowSumula({ id: "sum-0701", sessionDate: "2026-07-01", team: "Azul" }),
    executionLog: { ...execution0207, id: "exec-0701" },
  },
  {
    id: "t-0630",
    sessionDate: "2026-06-30",
    unidade: "Atibaia",
    categoria: "Sub-15",
    turma: "Turma A",
    team: "Amarelo",
    coachName: "João Silva",
    status: "Executado",
    plano: shallowPlan({ id: "plan-0630", sessionDate: "2026-06-30" }),
    sumula: shallowSumula({ id: "sum-0630", sessionDate: "2026-06-30" }),
    executionLog: { ...execution0207, id: "exec-0630" },
  },
  {
    id: "t-0629",
    sessionDate: "2026-06-29",
    unidade: "Atibaia",
    categoria: "Sub-17",
    turma: "Turma B",
    team: "Azul",
    coachName: "Maria Santos",
    status: "Draft",
    plano: shallowPlan({
      id: "plan-0629",
      sessionDate: "2026-06-29",
      categoria: "Sub-17",
      turma: "Turma B",
      team: "Azul",
      coachName: "Maria Santos",
      status: "draft",
      deadlineAt: "2026-06-28T18:00:00",
      approvedAt: undefined,
      approvedBy: undefined,
    }),
    sumula: shallowSumula({ id: "sum-0629", sessionDate: "2026-06-29", team: "Azul", status: "draft", confirmedAt: undefined }),
  },
  {
    id: "t-0628",
    sessionDate: "2026-06-28",
    unidade: "Atibaia",
    categoria: "Sub-15",
    turma: "Turma A",
    team: "Amarelo",
    coachName: "João Silva",
    status: "Executado",
    plano: shallowPlan({ id: "plan-0628", sessionDate: "2026-06-28" }),
    sumula: shallowSumula({ id: "sum-0628", sessionDate: "2026-06-28" }),
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
    coachName: "João Silva",
    status: "Executado",
    plano: shallowPlan({
      id: "plan-0626",
      sessionDate: "2026-06-26",
      status: "changes_requested",
      deadlineAt: "2026-06-25T18:00:00",
      approvedAt: undefined,
      approvedBy: undefined,
      reviewedAt: "2026-06-25T19:00:00",
      reviewedBy: "Carla Mendes (Head Coach)",
      reviewComment: "Duração da Etapa Principal fora do padrão — ajustar antes de reaprovar.",
    }),
    sumula: shallowSumula({ id: "sum-0626", sessionDate: "2026-06-26" }),
    executionLog: { ...execution0207, id: "exec-0626" },
  },
];

// Fila de Aprovações (RF3/RF4) — planos que ainda não avançaram para
// súmula/execução. Independente de `treinos` de propósito.
export const planosPendentesIniciais: PlanoAula[] = [
  shallowPlan({
    id: "plan-pend-1",
    sessionDate: "2026-07-03",
    categoria: "Sub-15",
    turma: "Turma A",
    team: "Amarelo",
    coachName: "João Silva",
    status: "submitted",
    deadlineAt: "2026-07-02T18:00:00",
    createdAt: "2026-07-02T09:00:00",
    approvedAt: undefined,
    approvedBy: undefined,
  }),
  shallowPlan({
    id: "plan-pend-2",
    sessionDate: "2026-07-03",
    categoria: "Sub-17",
    turma: "Turma B",
    team: "Azul",
    coachName: "Maria Santos",
    fase: "Defensiva",
    status: "submitted",
    deadlineAt: "2026-07-02T20:00:00",
    createdAt: "2026-07-02T11:20:00",
    approvedAt: undefined,
    approvedBy: undefined,
  }),
  shallowPlan({
    id: "plan-pend-3",
    sessionDate: "2026-06-30",
    categoria: "Sub-15",
    turma: "Turma A",
    team: "Amarelo",
    coachName: "João Silva",
    status: "submitted",
    // Prazo já vencido em relação ao NOW_MOCK — alimenta o card/filtro "Fora do prazo".
    deadlineAt: "2026-06-29T18:00:00",
    createdAt: "2026-06-29T15:45:00",
    approvedAt: undefined,
    approvedBy: undefined,
  }),
  shallowPlan({
    id: "plan-pend-4",
    sessionDate: "2026-06-27",
    categoria: "Sub-17",
    turma: "Turma B",
    team: "Azul",
    coachName: "Maria Santos",
    status: "changes_requested",
    deadlineAt: "2026-06-26T18:00:00",
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
    categoria: "Sub-15",
    turma: "Turma A",
    team: "Amarelo",
    coachName: "João Silva",
    status: "cancelled",
    deadlineAt: "2026-06-19T18:00:00",
    createdAt: "2026-06-18T09:00:00",
    approvedAt: undefined,
    approvedBy: undefined,
    reviewedAt: "2026-06-19T10:00:00",
    reviewedBy: "Carla Mendes (Head Coach)",
    reviewComment: "Aula cancelada — unidade fechada para manutenção do campo.",
  }),
];

// Planos já aprovados e ainda sem execução registrada — fonte do seletor
// "Plano de Referência" no Editor de Execution Log (gate do RF5).
export const planosDisponiveisParaExecucao: PlanoAula[] = [
  plano0207,
  shallowPlan({
    id: "plan-aprov-1",
    sessionDate: "2026-07-05",
    categoria: "Sub-17",
    turma: "Turma B",
    team: "Azul",
    coachName: "Maria Santos",
    status: "approved",
    deadlineAt: "2026-07-04T18:00:00",
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
      { id: "a1", label: "Bruno Silva (Meia, 25 anos)" },
      { id: "a2", label: "Bruno Silva (Atacante, 22 anos)" },
    ],
  },
  {
    jersey: 10,
    nome: "Beatriz Costa",
    opcoes: [
      { id: "b1", label: "Beatriz Costa (Atacante, 23 anos)" },
      { id: "b2", label: "Beatriz Costa (Meia, 26 anos)" },
    ],
  },
];

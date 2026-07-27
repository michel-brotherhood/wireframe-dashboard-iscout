import type { Treino, PlanoAula, MatchSumula, ExecutionLog } from "../types";

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
  team: "Amarelo",
  coachName: "João Silva",
  fase: "Ofensiva",
  status: "approved",
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
  approvedBy: "Manager",
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
  conformanceScore: 85,
  insights: [
    "Treino bem estruturado com boa conformidade",
    "Ajustes de tempo foram mínimos e aceitáveis",
    "Lesão no intervalo foi bem gerenciada",
    "Recomendação: Manter estrutura, revisar protocolo de segurança no intervalo",
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
    team: "Amarelo",
    coachName: "João Silva",
    status: "Executado",
    conformance: 85,
    plano: plano0207,
    sumula: sumula0207,
    executionLog: execution0207,
  },
  {
    id: "t-0701",
    sessionDate: "2026-07-01",
    team: "Azul",
    coachName: "Maria Santos",
    status: "Executado",
    conformance: 78,
    plano: shallowPlan({ id: "plan-0701", sessionDate: "2026-07-01", team: "Azul", coachName: "Maria Santos" }),
    sumula: shallowSumula({ id: "sum-0701", sessionDate: "2026-07-01", team: "Azul" }),
    executionLog: { ...execution0207, id: "exec-0701", conformanceScore: 78 },
  },
  {
    id: "t-0630",
    sessionDate: "2026-06-30",
    team: "Amarelo",
    coachName: "João Silva",
    status: "Executado",
    conformance: 92,
    plano: shallowPlan({ id: "plan-0630", sessionDate: "2026-06-30" }),
    sumula: shallowSumula({ id: "sum-0630", sessionDate: "2026-06-30" }),
    executionLog: { ...execution0207, id: "exec-0630", conformanceScore: 92 },
  },
  {
    id: "t-0629",
    sessionDate: "2026-06-29",
    team: "Azul",
    coachName: "Maria Santos",
    status: "Draft",
    plano: shallowPlan({
      id: "plan-0629",
      sessionDate: "2026-06-29",
      team: "Azul",
      coachName: "Maria Santos",
      status: "draft",
      approvedAt: undefined,
      approvedBy: undefined,
    }),
    sumula: shallowSumula({ id: "sum-0629", sessionDate: "2026-06-29", team: "Azul", status: "draft", confirmedAt: undefined }),
  },
  {
    id: "t-0628",
    sessionDate: "2026-06-28",
    team: "Amarelo",
    coachName: "João Silva",
    status: "Executado",
    conformance: 88,
    plano: shallowPlan({ id: "plan-0628", sessionDate: "2026-06-28" }),
    sumula: shallowSumula({ id: "sum-0628", sessionDate: "2026-06-28" }),
    executionLog: { ...execution0207, id: "exec-0628", conformanceScore: 88 },
  },
];

export const conformidadePorDia = [
  { dia: "Seg", conformidade: 88 },
  { dia: "Ter", conformidade: 92 },
  { dia: "Qua", conformidade: 65 },
  { dia: "Qui", conformidade: 78 },
  { dia: "Sex", conformidade: 85 },
  { dia: "Sab", conformidade: 58 },
  { dia: "Dom", conformidade: 82 },
];

export const dashboardMetrics = {
  planosTotal: 12,
  planosAprovados: 10,
  sumulasTotal: 12,
  sumulasConfirmadas: 11,
  execucoesTotal: 10,
  execucoesConfirmadas: 10,
  conformidadeMedia: 82.5,
};

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

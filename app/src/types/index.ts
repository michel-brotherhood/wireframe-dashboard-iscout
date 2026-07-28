// Team (Amarelo/Azul) is jersey-color identification — used for súmula/escalação
// only. It is not the general grouping/filtering concept for the dashboard;
// that's `turma` + `categoria` below.
export type TeamLabel = "Amarelo" | "Azul";
export type Phase = "Ofensiva" | "Defensiva";

export type Categoria = "Sub-15" | "Sub-17" | "Sub-20";
export type Turma = "Turma A" | "Turma B";

// Perfis de demonstração do wireframe — sem autenticação real, apenas altera
// o que a UI mostra/permite. Ver RoleContext.
export type Role = "treinador" | "head_coach" | "gestor" | "responsavel";

// Ciclo de vida real do plano. "Fora do prazo" e "Executado sem plano
// aprovado" não são estados armazenados — são condições calculadas a partir
// de deadlineAt / execução vs. status (ver helpers em mockData.ts).
export type PlanStatus = "draft" | "submitted" | "changes_requested" | "approved" | "executed" | "cancelled";
export type SumulaStatus = "draft" | "confirmed";
export type ExecutionStatus = "draft" | "confirmed";

export interface EtapaInicial {
  objetivo: string;
  duracaoMin: number;
  coordenacao: string[];
  estacoes: string[];
}

export interface EtapaFuncionamento {
  objetivo: string;
  duracaoMin: number;
  tipo: "Analítico" | "Global" | "Situacional";
  tema: string;
}

export interface ProtocoloIntervalo {
  hidratacaoMin: number;
  repousoMin: number;
  instruirMin: number;
  ativarMin: number;
}

export interface EtapaPrincipal {
  objetivo: string;
  duracaoMin: number;
  subTemas: string[];
  orientacoes: string[];
  intervalo: ProtocoloIntervalo;
}

export interface PlanoAula {
  id: string;
  sessionDate: string;
  unidade: string;
  categoria: Categoria;
  turma: Turma;
  team: TeamLabel;
  coachName: string;
  fase: Phase;
  status: PlanStatus;
  /** Prazo para envio/aprovação — usado para calcular "fora do prazo". */
  deadlineAt: string;
  etapaInicial: EtapaInicial;
  etapaFuncionamento: EtapaFuncionamento;
  etapaPrincipal: EtapaPrincipal;
  observacoes: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  /** Preenchido tanto para "ajustes solicitados" quanto para comentário na aprovação. */
  reviewComment?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface SumulaEntry {
  jersey: number;
  nome: string;
  posicao: string;
  starter: boolean;
}

export interface MatchSumula {
  id: string;
  sessionDate: string;
  team: TeamLabel;
  eventLabel: string;
  status: SumulaStatus;
  entries: SumulaEntry[];
  confirmedAt?: string;
}

export interface EtapaExecucao {
  planejadoMin: number;
  executadoMin: number;
  observacoes: string;
}

export type ImpactoDesvio = "Baixo" | "Médio" | "Alto";

export interface Desvio {
  id: string;
  etapa: "Inicial" | "Funcionamento" | "Principal";
  impacto: ImpactoDesvio;
  descricao: string;
}

// Sem fórmula de pontuação automática — comparação plano vs. execução fica a
// cargo de leitura humana até a coordenação pedagógica definir a metodologia.
export interface ExecutionLog {
  id: string;
  planoId: string;
  sumulaId: string;
  status: ExecutionStatus;
  etapaInicial: EtapaExecucao;
  etapaFuncionamento: EtapaExecucao;
  etapaPrincipal: EtapaExecucao;
  desvios: Desvio[];
  confirmedAt?: string;
}

export interface Treino {
  id: string;
  sessionDate: string;
  unidade: string;
  categoria: Categoria;
  turma: Turma;
  team: TeamLabel;
  coachName: string;
  status: "Draft" | "Executado";
  plano: PlanoAula;
  sumula: MatchSumula;
  executionLog?: ExecutionLog;
}

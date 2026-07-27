export type TeamLabel = "Amarelo" | "Azul";
export type Phase = "Ofensiva" | "Defensiva";

export type PlanStatus = "draft" | "submitted" | "approved" | "rejected";
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
  team: TeamLabel;
  coachName: string;
  fase: Phase;
  status: PlanStatus;
  etapaInicial: EtapaInicial;
  etapaFuncionamento: EtapaFuncionamento;
  etapaPrincipal: EtapaPrincipal;
  observacoes: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
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

export interface ExecutionLog {
  id: string;
  planoId: string;
  sumulaId: string;
  status: ExecutionStatus;
  etapaInicial: EtapaExecucao;
  etapaFuncionamento: EtapaExecucao;
  etapaPrincipal: EtapaExecucao;
  desvios: Desvio[];
  conformanceScore: number;
  insights: string[];
  confirmedAt?: string;
}

export interface Treino {
  id: string;
  sessionDate: string;
  team: TeamLabel;
  coachName: string;
  status: "Draft" | "Executado";
  conformance?: number;
  plano: PlanoAula;
  sumula: MatchSumula;
  executionLog?: ExecutionLog;
}

// Cor do colete (Amarelo/Azul) é identificação de súmula/escalação apenas —
// não é o agrupamento pedagógico do plano nem determina o treinador
// responsável. Turma/categoria são o agrupamento geral.
export type TeamLabel = "Amarelo" | "Azul";

export type Phase = "Organização ofensiva" | "Organização defensiva" | "Progressão e finalização";

export type Categoria = "Sub-13" | "Sub-15" | "Sub-17" | "Sub-20";
export type Turma = "Turma A" | "Turma B";

// Perfis de demonstração do wireframe — o papel (cargo) determina o que a UI
// mostra/permite. Ver SessionContext.
export type Role = "treinador" | "head_coach" | "gestor" | "responsavel";

// Escopo de atuação do usuário ("skill" / área que ele atende): a unidade e as
// categorias/turmas sob sua responsabilidade. É o recorte que filtra o que cada
// usuário enxerga, além do papel. Login é mock (sem backend).
export interface Escopo {
  unidade: string;
  categorias: Categoria[];
  turmas: Turma[];
}

export interface AppUser {
  id: string;
  nome: string;
  email: string;
  role: Role;
  /** Rótulo do cargo exibido na UI (ex.: "Head Coach"). */
  cargo: string;
  escopo: Escopo;
  /** Treinador: liga o usuário aos treinos/planos que ele ministra (coachName). */
  coachName?: string;
}

// Ciclo de vida real do plano. "Fora do prazo" e "Executado sem plano
// aprovado" não são estados armazenados — são condições calculadas a partir
// de deadlineAt / execução vs. status (ver helpers em mockData.ts).
export type PlanStatus = "draft" | "submitted" | "changes_requested" | "approved" | "executed" | "cancelled";
export type SumulaStatus = "draft" | "confirmed";
export type ExecutionStatus = "draft" | "confirmed";

export type TipoEstacao = "Simples" | "Com bola" | "Recreativo";

export interface Estacao {
  nome: string;
  tipo: TipoEstacao;
  descricao: string;
  duracaoMin: number;
  materiais: string;
}

export interface EtapaInicial {
  objetivo: string;
  duracaoMin: number;
  estacao1: Estacao;
  estacao2: Estacao;
}

export interface EtapaFundamentacao {
  objetivo: string;
  duracaoMin: number;
  tipo: "Analítico" | "Global" | "Situacional";
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
  /** Horário da sessão, formato HH:mm — base do cálculo do prazo (sessão - 24h). */
  horario: string;
  unidade: string;
  periodo: string;
  semana: string;
  categoria: Categoria;
  turma: Turma;
  /** Cor do colete — contexto de súmula, não é elemento pedagógico principal. */
  team: TeamLabel;
  /** Treinador responsável — selecionado explicitamente, nunca derivado da cor do colete. */
  coachName: string;
  fase: Phase;
  tema: string;
  subtema: string;
  status: PlanStatus;
  /** Prazo limite = data/horário da sessão - 24h. Calculado, nunca fixo. */
  deadlineAt: string;
  etapaInicial: EtapaInicial;
  etapaFundamentacao: EtapaFundamentacao;
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
  categoria: Categoria;
  matricula: string;
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
  etapa: "Inicial" | "Fundamentação" | "Principal";
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
  etapaFundamentacao: EtapaExecucao;
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
  status: "Rascunho" | "Executado";
  plano: PlanoAula;
  sumula: MatchSumula;
  executionLog?: ExecutionLog;
}

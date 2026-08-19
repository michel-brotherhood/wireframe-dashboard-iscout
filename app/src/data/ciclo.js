// Ciclo da aula (wireframe): traduz plano/súmula/execução + estados mock de
// captura/vídeos/análise numa sequência única de etapas, para o Dashboard e o
// Detalhe do Treino mostrarem "onde a aula está".
//   Plano → Captura → Súmula → Execução → Vídeos → Análise
// Os status usam as mesmas chaves do StatusBadge (ver components/ui/StatusBadge).
// Tudo é representação visual — nenhuma regra real de negócio.

// Status que contam como "etapa concluída" (✓); os demais são andamento (○).
const CONCLUIDOS = new Set([
  "approved",
  "confirmed",
  "executed",
  "realizada",
  "disponivel",
  "validada",
  "enviada",
  "pronta",
]);

function statusPlano(plano) {
  return plano?.status ?? "aguardando";
}

function statusSumula(sumula) {
  if (!sumula) return "aguardando";
  if (sumula.status === "confirmed") return "validada";
  if (sumula.status === "draft") return "em_preparacao";
  return sumula.status;
}

function statusExecucao(executionLog) {
  if (!executionLog) return "aguardando";
  return executionLog.status === "confirmed" ? "realizada" : executionLog.status;
}

export function cicloDaAula(treino) {
  const etapas = [
    { key: "plano", label: "Plano", status: statusPlano(treino.plano) },
    { key: "captura", label: "Captura", status: treino.capturaStatus ?? "aguardando" },
    { key: "sumula", label: "Súmula", status: statusSumula(treino.sumula) },
    { key: "execucao", label: "Execução", status: statusExecucao(treino.executionLog) },
    { key: "videos", label: "Vídeos", status: treino.videosStatus ?? "aguardando" },
    { key: "analise", label: "Análise", status: treino.analiseStatus ?? "aguardando" },
  ];
  return etapas.map((e) => ({ ...e, done: CONCLUIDOS.has(e.status) }));
}

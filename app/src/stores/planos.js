import { reactive, watch } from "vue";
import { planosPendentesIniciais, planosDisponiveisParaExecucao } from "../data/mockData";

const seedPlanos = [...planosPendentesIniciais, ...planosDisponiveisParaExecucao];

// Nome do Head Coach "logado" nesta demonstração (sem autenticação real).
const REVIEWER_NAME = "Carla Mendes (Head Coach)";

// Rascunhos criados pelo usuário persistem no navegador (protótipo, sem
// backend) para poderem ser reabertos e editados depois. Os planos-semente da
// demonstração continuam sempre "frescos" a cada carga.
const DRAFTS_KEY = "iscout.planoDrafts";

function readDrafts() {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export const planosStore = reactive({ planos: [...readDrafts(), ...seedPlanos] });

// Persiste apenas os rascunhos do usuário (status "draft").
watch(
  () => planosStore.planos,
  (planos) => {
    try {
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(planos.filter((p) => p.status === "draft")));
    } catch {
      // ambiente sem localStorage — segue só em memória
    }
  },
  { deep: true },
);

// Insere ou substitui um plano por id (upsert).
function upsert(plano) {
  planosStore.planos = planosStore.planos.some((p) => p.id === plano.id)
    ? planosStore.planos.map((p) => (p.id === plano.id ? plano : p))
    : [plano, ...planosStore.planos];
}

export function addPlano(plano) {
  planosStore.planos = [plano, ...planosStore.planos];
}

export function saveDraft(plano) {
  upsert({ ...plano, status: "draft" });
}

export function updatePlano(plano) {
  upsert(plano);
}

export function approvePlano(id, comment) {
  planosStore.planos = planosStore.planos.map((p) =>
    p.id === id
      ? {
          ...p,
          status: "approved",
          approvedAt: new Date().toISOString(),
          approvedBy: REVIEWER_NAME,
          reviewComment: comment?.trim() || undefined,
          reviewedAt: new Date().toISOString(),
          reviewedBy: REVIEWER_NAME,
        }
      : p,
  );
}

export function requestChanges(id, comment) {
  planosStore.planos = planosStore.planos.map((p) =>
    p.id === id
      ? {
          ...p,
          status: "changes_requested",
          reviewedAt: new Date().toISOString(),
          reviewedBy: REVIEWER_NAME,
          reviewComment: comment,
        }
      : p,
  );
}

export function bulkApprove(ids) {
  const idSet = new Set(ids);
  planosStore.planos = planosStore.planos.map((p) =>
    idSet.has(p.id)
      ? {
          ...p,
          status: "approved",
          approvedAt: new Date().toISOString(),
          approvedBy: REVIEWER_NAME,
          reviewedAt: new Date().toISOString(),
          reviewedBy: REVIEWER_NAME,
        }
      : p,
  );
}

export function markExecuted(id) {
  planosStore.planos = planosStore.planos.map((p) => (p.id === id ? { ...p, status: "executed" } : p));
}

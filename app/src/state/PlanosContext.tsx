import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { PlanoAula } from "../types";
import { planosPendentesIniciais, planosDisponiveisParaExecucao } from "../data/mockData";

const seedPlanos: PlanoAula[] = [...planosPendentesIniciais, ...planosDisponiveisParaExecucao];

// Nome do Head Coach "logado" nesta demonstração (sem autenticação real).
const REVIEWER_NAME = "Carla Mendes (Head Coach)";

// Rascunhos criados pelo usuário persistem no navegador (protótipo, sem
// backend) para poderem ser reabertos e editados depois. Os planos-semente da
// demonstração continuam sempre "frescos" a cada carga.
const DRAFTS_KEY = "iscout.planoDrafts";

function readDrafts(): PlanoAula[] {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? (arr as PlanoAula[]) : [];
  } catch {
    return [];
  }
}

interface PlanosContextValue {
  planos: PlanoAula[];
  addPlano: (plano: PlanoAula) => void;
  saveDraft: (plano: PlanoAula) => void;
  updatePlano: (plano: PlanoAula) => void;
  approvePlano: (id: string, comment?: string) => void;
  requestChanges: (id: string, comment: string) => void;
  bulkApprove: (ids: string[]) => void;
  markExecuted: (id: string) => void;
}

const PlanosContext = createContext<PlanosContextValue | null>(null);

export function PlanosProvider({ children }: { children: ReactNode }) {
  const [planos, setPlanos] = useState<PlanoAula[]>(() => [...readDrafts(), ...seedPlanos]);

  // Persiste apenas os rascunhos do usuário (status "draft").
  useEffect(() => {
    try {
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(planos.filter((p) => p.status === "draft")));
    } catch {
      // ambiente sem localStorage — segue só em memória
    }
  }, [planos]);

  // Insere ou substitui um plano por id (upsert).
  function upsert(plano: PlanoAula) {
    setPlanos((prev) =>
      prev.some((p) => p.id === plano.id) ? prev.map((p) => (p.id === plano.id ? plano : p)) : [plano, ...prev],
    );
  }

  function addPlano(plano: PlanoAula) {
    setPlanos((prev) => [plano, ...prev]);
  }

  function saveDraft(plano: PlanoAula) {
    upsert({ ...plano, status: "draft" });
  }

  function updatePlano(plano: PlanoAula) {
    upsert(plano);
  }

  function approvePlano(id: string, comment?: string) {
    setPlanos((prev) =>
      prev.map((p) =>
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
      ),
    );
  }

  function requestChanges(id: string, comment: string) {
    setPlanos((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "changes_requested",
              reviewedAt: new Date().toISOString(),
              reviewedBy: REVIEWER_NAME,
              reviewComment: comment,
            }
          : p,
      ),
    );
  }

  function bulkApprove(ids: string[]) {
    const idSet = new Set(ids);
    setPlanos((prev) =>
      prev.map((p) =>
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
      ),
    );
  }

  function markExecuted(id: string) {
    setPlanos((prev) => prev.map((p) => (p.id === id ? { ...p, status: "executed" } : p)));
  }

  return (
    <PlanosContext.Provider
      value={{ planos, addPlano, saveDraft, updatePlano, approvePlano, requestChanges, bulkApprove, markExecuted }}
    >
      {children}
    </PlanosContext.Provider>
  );
}

export function usePlanos() {
  const ctx = useContext(PlanosContext);
  if (!ctx) throw new Error("usePlanos deve ser usado dentro de PlanosProvider");
  return ctx;
}

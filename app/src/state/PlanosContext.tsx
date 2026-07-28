import { createContext, useContext, useState, type ReactNode } from "react";
import type { PlanoAula } from "../types";
import { planosPendentesIniciais, planosDisponiveisParaExecucao } from "../data/mockData";

const seedPlanos: PlanoAula[] = [...planosPendentesIniciais, ...planosDisponiveisParaExecucao];

// Nome do Head Coach "logado" nesta demonstração (sem autenticação real).
const REVIEWER_NAME = "Carla Mendes (Head Coach)";

interface PlanosContextValue {
  planos: PlanoAula[];
  addPlano: (plano: PlanoAula) => void;
  approvePlano: (id: string, comment?: string) => void;
  requestChanges: (id: string, comment: string) => void;
  bulkApprove: (ids: string[]) => void;
  markExecuted: (id: string) => void;
}

const PlanosContext = createContext<PlanosContextValue | null>(null);

export function PlanosProvider({ children }: { children: ReactNode }) {
  const [planos, setPlanos] = useState<PlanoAula[]>(seedPlanos);

  function addPlano(plano: PlanoAula) {
    setPlanos((prev) => [plano, ...prev]);
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
    <PlanosContext.Provider value={{ planos, addPlano, approvePlano, requestChanges, bulkApprove, markExecuted }}>
      {children}
    </PlanosContext.Provider>
  );
}

export function usePlanos() {
  const ctx = useContext(PlanosContext);
  if (!ctx) throw new Error("usePlanos deve ser usado dentro de PlanosProvider");
  return ctx;
}

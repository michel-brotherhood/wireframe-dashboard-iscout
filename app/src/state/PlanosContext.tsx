import { createContext, useContext, useState, type ReactNode } from "react";
import type { PlanoAula } from "../types";
import { planosPendentesIniciais, planosDisponiveisParaExecucao } from "../data/mockData";

const seedPlanos: PlanoAula[] = [...planosPendentesIniciais, ...planosDisponiveisParaExecucao];

interface PlanosContextValue {
  planos: PlanoAula[];
  addPlano: (plano: PlanoAula) => void;
  approvePlano: (id: string) => void;
  rejectPlano: (id: string, reason: string) => void;
  bulkApprove: (ids: string[]) => void;
}

const PlanosContext = createContext<PlanosContextValue | null>(null);

export function PlanosProvider({ children }: { children: ReactNode }) {
  const [planos, setPlanos] = useState<PlanoAula[]>(seedPlanos);

  function addPlano(plano: PlanoAula) {
    setPlanos((prev) => [plano, ...prev]);
  }

  function approvePlano(id: string) {
    setPlanos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "approved", approvedAt: new Date().toISOString(), approvedBy: "Manager" } : p,
      ),
    );
  }

  function rejectPlano(id: string, reason: string) {
    setPlanos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "rejected", rejectedAt: new Date().toISOString(), rejectedReason: reason } : p,
      ),
    );
  }

  function bulkApprove(ids: string[]) {
    const idSet = new Set(ids);
    setPlanos((prev) =>
      prev.map((p) =>
        idSet.has(p.id)
          ? { ...p, status: "approved", approvedAt: new Date().toISOString(), approvedBy: "Manager" }
          : p,
      ),
    );
  }

  return (
    <PlanosContext.Provider value={{ planos, addPlano, approvePlano, rejectPlano, bulkApprove }}>
      {children}
    </PlanosContext.Provider>
  );
}

export function usePlanos() {
  const ctx = useContext(PlanosContext);
  if (!ctx) throw new Error("usePlanos deve ser usado dentro de PlanosProvider");
  return ctx;
}

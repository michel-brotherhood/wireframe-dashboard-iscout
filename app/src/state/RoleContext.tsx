import { createContext, useContext, useState, type ReactNode } from "react";
import type { Role } from "../types";

export const ROLE_LABELS: Record<Role, string> = {
  treinador: "Treinador",
  head_coach: "Head Coach",
  gestor: "Gestor",
  responsavel: "Responsável",
};

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("head_coach");
  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole deve ser usado dentro de RoleProvider");
  return ctx;
}

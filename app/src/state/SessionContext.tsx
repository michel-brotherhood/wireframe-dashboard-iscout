import { createContext, useContext, useState, type ReactNode } from "react";
import type { AppUser, Role } from "../types";
import { findUser } from "../data/users";

export const ROLE_LABELS: Record<Role, string> = {
  treinador: "Treinador",
  head_coach: "Head Coach",
  gestor: "Gestor",
  responsavel: "Responsável",
};

const STORAGE_KEY = "iscout.sessionUserId";

interface SessionContextValue {
  user: AppUser | null;
  login: (user: AppUser) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function readStoredUser(): AppUser | null {
  try {
    const id = localStorage.getItem(STORAGE_KEY);
    return id ? (findUser(id) ?? null) : null;
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  // Sessão persiste no localStorage — recarregar a página mantém o login mock.
  const [user, setUser] = useState<AppUser | null>(readStoredUser);

  const login = (u: AppUser) => {
    try {
      localStorage.setItem(STORAGE_KEY, u.id);
    } catch {
      // ambiente sem localStorage — segue só em memória
    }
    setUser(u);
  };

  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setUser(null);
  };

  return <SessionContext.Provider value={{ user, login, logout }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession deve ser usado dentro de SessionProvider");
  return ctx;
}

/** Usuário autenticado — só chame dentro de telas protegidas (pós-login). */
export function useCurrentUser(): AppUser {
  const { user } = useSession();
  if (!user) throw new Error("useCurrentUser exige um usuário autenticado");
  return user;
}

/** Compat: papel do usuário logado. Telas protegidas sempre têm usuário. */
export function useRole(): { role: Role } {
  return { role: useCurrentUser().role };
}

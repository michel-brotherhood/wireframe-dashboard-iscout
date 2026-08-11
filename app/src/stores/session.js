import { reactive } from "vue";
import { findUser } from "./users";

export const ROLE_LABELS = {
  coach: "Coach",
  admin: "Admin",
  responsavel: "Responsável",
};

const STORAGE_KEY = "iscout.sessionUserId";

function readStoredUser() {
  try {
    const id = localStorage.getItem(STORAGE_KEY);
    return id ? findUser(id) ?? null : null;
  } catch {
    return null;
  }
}

// Sessão reativa (mock, sem backend) — persiste no localStorage.
export const session = reactive({ user: readStoredUser() });

export function login(u) {
  try {
    localStorage.setItem(STORAGE_KEY, u.id);
  } catch {
    // ambiente sem localStorage — segue só em memória
  }
  session.user = u;
}

export function logout() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  session.user = null;
}

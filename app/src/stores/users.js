import { reactive, watch } from "vue";
import { USERS as SEED_USERS } from "../data/users";

// Usuários adicionados pela tela de Gestão de Acessos (mock, sem backend) —
// persistem no navegador (protótipo), igual ao padrão já usado para rascunhos
// de plano (ver stores/planos.js). Usuários-semente (data/users.js) sempre
// carregam "frescos"; só os adicionados/os estados de ativo/inativo persistem.
const ADDED_KEY = "iscout.usersAdded";
const ATIVOS_KEY = "iscout.usersInativos";

function readAdded() {
  try {
    const raw = localStorage.getItem(ADDED_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function readInativos() {
  try {
    const raw = localStorage.getItem(ATIVOS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? new Set(arr) : new Set();
  } catch {
    return new Set();
  }
}

const inativos = readInativos();

export const usersStore = reactive({
  users: [...SEED_USERS, ...readAdded()].map((u) => ({ ...u, ativo: !inativos.has(u.id) })),
});

watch(
  () => usersStore.users,
  (users) => {
    try {
      localStorage.setItem(ADDED_KEY, JSON.stringify(users.filter((u) => u.isCustom)));
      localStorage.setItem(ATIVOS_KEY, JSON.stringify(users.filter((u) => !u.ativo).map((u) => u.id)));
    } catch {
      // ambiente sem localStorage — segue só em memória
    }
  },
  { deep: true },
);

export function findUser(id) {
  return usersStore.users.find((u) => u.id === id);
}

// Login mock: usuário existe, está ativo e a senha de demonstração confere.
export function verifyLogin(id, senha) {
  const user = findUser(id);
  if (!user || !user.ativo) return null;
  return user.senha === senha ? user : null;
}

let seq = 1;

export function addUser(user) {
  const id = `u-custom-${seq++}`;
  usersStore.users = [...usersStore.users, { ...user, id, ativo: true, isCustom: true }];
  return id;
}

export function toggleAtivo(id) {
  usersStore.users = usersStore.users.map((u) => (u.id === id ? { ...u, ativo: !u.ativo } : u));
}

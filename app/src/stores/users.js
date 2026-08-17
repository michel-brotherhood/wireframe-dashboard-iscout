import { reactive, watch } from "vue";
import { USERS as SEED_USERS } from "../data/users";

// Usuários adicionados pela tela de Gestão de Acessos (mock, sem backend) —
// persistem no navegador (protótipo), igual ao padrão já usado para rascunhos
// de plano (ver stores/planos.js). Usuários-semente (data/users.js) sempre
// carregam "frescos"; só os adicionados/os estados de ativo/inativo persistem.
const ADDED_KEY = "iscout.usersAdded";
const ATIVOS_KEY = "iscout.usersInativos";
const REMOVIDOS_KEY = "iscout.usersRemovidos";

// Só estes dois usuários podem excluir contas na Gestão de Acessos — são os
// administradores "donos" da operação (Gerson e Raspada). Um admin comum
// criado depois administra acessos e aprova planos, mas não apaga usuários.
export const SUPER_ADMIN_IDS = ["u-gerson", "u-raspada"];

export function podeExcluirUsuarios(user) {
  return !!user && SUPER_ADMIN_IDS.includes(user.id);
}

function readAdded() {
  try {
    const raw = localStorage.getItem(ADDED_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function readIdSet(key) {
  try {
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? new Set(arr) : new Set();
  } catch {
    return new Set();
  }
}

const inativos = readIdSet(ATIVOS_KEY);
// Usuários-semente excluídos ficam registrados aqui para não reaparecerem no
// reload (usuários customizados somem sozinhos, pois não são re-adicionados).
const removidos = readIdSet(REMOVIDOS_KEY);

function persistRemovidos() {
  try {
    localStorage.setItem(REMOVIDOS_KEY, JSON.stringify([...removidos]));
  } catch {
    // ambiente sem localStorage — segue só em memória
  }
}

export const usersStore = reactive({
  users: [...SEED_USERS, ...readAdded()]
    .filter((u) => !removidos.has(u.id))
    .map((u) => ({ ...u, ativo: !inativos.has(u.id) })),
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

// Compara nomes tolerando acento/maiúsculas e espaços extras — o login é o
// nome digitado à mão, não um id selecionado de uma lista.
function normalizeNome(nome) {
  return nome
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

// Login mock: usuário existe (por nome), está ativo e a senha confere. Não
// diferencia "usuário não encontrado" de "senha errada" na mensagem de erro
// (padrão de login comum, evita vazar quais nomes existem no sistema).
export function verifyLoginByNome(nome, senha) {
  const target = normalizeNome(nome);
  const user = usersStore.users.find((u) => normalizeNome(u.nome) === target);
  if (!user || !user.ativo) return null;
  return user.senha === senha ? user : null;
}

// Login identifica o usuário pelo nome — um nome duplicado deixaria o
// segundo usuário inacessível (o primeiro match sempre "ganha"). Usado pela
// Gestão de Acessos para bloquear a criação de um nome já em uso.
export function nomeEmUso(nome) {
  const target = normalizeNome(nome);
  return usersStore.users.some((u) => normalizeNome(u.nome) === target);
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

// Exclui um usuário. Customizados somem só de removê-los da lista (o watch não
// os re-persiste); usuários-semente precisam entrar no conjunto "removidos"
// para não reaparecerem no próximo carregamento.
export function deleteUser(id) {
  const alvo = usersStore.users.find((u) => u.id === id);
  if (!alvo) return;
  usersStore.users = usersStore.users.filter((u) => u.id !== id);
  if (!alvo.isCustom) {
    removidos.add(id);
    persistRemovidos();
  }
}

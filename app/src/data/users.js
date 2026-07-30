// Usuários de demonstração. O login é mock (sem senha real / sem backend):
// selecionar um usuário na tela de login define papel + escopo da sessão.
//
// "Skill" = escopo de atuação: a unidade e as categorias/turmas que o usuário
// atende. Combinado ao papel (cargo), define o que cada um enxerga no app.
export const USERS = [
  {
    id: "u-carla",
    nome: "Carla Mendes",
    email: "carla.mendes@bigsoccer.com",
    role: "head_coach",
    cargo: "Head Coach",
    // Supervisiona toda a unidade — vê todas as categorias e turmas de Atibaia.
    escopo: {
      unidade: "Atibaia",
      categorias: ["Sub-13", "Sub-15", "Sub-17", "Sub-20"],
      turmas: ["Turma A", "Turma B"],
    },
  },
  {
    id: "u-joao",
    nome: "João Silva",
    email: "joao.silva@bigsoccer.com",
    role: "treinador",
    cargo: "Treinador",
    // Atende exclusivamente a Sub-15 Turma A.
    escopo: { unidade: "Atibaia", categorias: ["Sub-15"], turmas: ["Turma A"] },
    coachName: "João Silva",
  },
  {
    id: "u-maria",
    nome: "Maria Santos",
    email: "maria.santos@bigsoccer.com",
    role: "treinador",
    cargo: "Treinadora",
    // Atende exclusivamente a Sub-17 Turma B.
    escopo: { unidade: "Atibaia", categorias: ["Sub-17"], turmas: ["Turma B"] },
    coachName: "Maria Santos",
  },
  {
    id: "u-gerson",
    nome: "Gerson",
    email: "gerson@bigsoccer.com",
    role: "treinador",
    cargo: "Técnico",
    // Atende a Sub-13 Turma A.
    escopo: { unidade: "Atibaia", categorias: ["Sub-13"], turmas: ["Turma A"] },
    coachName: "Gerson",
  },
  {
    id: "u-roberto",
    nome: "Roberto Lima",
    email: "roberto.lima@bigsoccer.com",
    role: "gestor",
    cargo: "Gestor",
    // Visão administrativa ampla — enxerga toda a operação (ver escopoContem).
    escopo: {
      unidade: "Atibaia",
      categorias: ["Sub-13", "Sub-15", "Sub-17", "Sub-20"],
      turmas: ["Turma A", "Turma B"],
    },
  },
  {
    id: "u-raspada",
    nome: "Raspada",
    email: "raspada@bigsoccer.com",
    role: "gestor",
    cargo: "Gestor",
    escopo: {
      unidade: "Atibaia",
      categorias: ["Sub-13", "Sub-15", "Sub-17", "Sub-20"],
      turmas: ["Turma A", "Turma B"],
    },
  },
  {
    id: "u-mario",
    nome: "Mário",
    email: "mario@bigsoccer.com",
    role: "gestor",
    cargo: "Gestor",
    escopo: {
      unidade: "Atibaia",
      categorias: ["Sub-13", "Sub-15", "Sub-17", "Sub-20"],
      turmas: ["Turma A", "Turma B"],
    },
  },
  {
    id: "u-ana",
    nome: "Ana Costa",
    email: "ana.costa@email.com",
    role: "responsavel",
    cargo: "Responsável",
    // Responsável por atleta da Sub-15 Turma A — só acompanha essa turma.
    escopo: { unidade: "Atibaia", categorias: ["Sub-15"], turmas: ["Turma A"] },
  },
];

export function findUser(id) {
  return USERS.find((u) => u.id === id);
}

// Um item está no escopo do usuário quando bate unidade + categoria + turma.
// Gestor tem visão administrativa total. Treinador é restrito adicionalmente
// aos treinos que ele mesmo ministra (coachName).
export function escopoContem(item, user) {
  if (user.role === "gestor") return true;
  if (item.unidade !== user.escopo.unidade) return false;
  if (!user.escopo.categorias.includes(item.categoria)) return false;
  if (!user.escopo.turmas.includes(item.turma)) return false;
  if (user.role === "treinador" && user.coachName) {
    return item.coachName === user.coachName;
  }
  return true;
}

/** Descrição curta do escopo para exibição (ex.: "Atibaia · Sub-15 · Turma A"). */
export function escopoLabel(user) {
  if (user.role === "gestor") return "Todas as unidades e categorias";
  const cats = user.escopo.categorias;
  const catLabel = cats.length > 2 ? `${cats.length} categorias` : cats.join(", ");
  const turmaLabel = user.escopo.turmas.length > 1 ? "Turmas A e B" : user.escopo.turmas.join(", ");
  return `${user.escopo.unidade} · ${catLabel} · ${turmaLabel}`;
}

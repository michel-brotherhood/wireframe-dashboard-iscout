// Usuários de demonstração (seed). O login é mock (senha simulada, validada
// no navegador — sem backend real): selecionar um usuário e digitar a senha
// de demonstração define papel + escopo da sessão. Usuários criados depois
// pela tela de Gestão de Acessos vivem em stores/users.js (usersStore), não
// aqui — este array é só a semente inicial.
//
// Papéis: "admin" aprova planos e administra acessos (visão total, ver
// escopoContem); "coach" cria planos/súmulas/execuções; "responsavel" só
// acompanha a turma do próprio atleta.
//
// "Skill" = escopo de atuação: a unidade e as categorias/turmas que o usuário
// atende. Combinado ao papel, define o que cada um enxerga no app. `coachName`
// marca quem tem turma própria (aparece como opção de "Treinador Responsável"
// ao criar um plano) — independe do papel: um admin pode manter turma própria.
export const USERS = [
  {
    id: "u-carla",
    nome: "Carla Mendes",
    email: "carla.mendes@bigsoccer.com",
    role: "coach",
    cargo: "Coach",
    senha: "carla123",
    // Segue com visão ampla da unidade (herdada do antigo papel Head Coach),
    // mas sem turma própria — não aparece como "Treinador Responsável".
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
    role: "coach",
    cargo: "Coach",
    senha: "joao123",
    // Atende exclusivamente a Sub-15 Turma A.
    escopo: { unidade: "Atibaia", categorias: ["Sub-15"], turmas: ["Turma A"] },
    coachName: "João Silva",
  },
  {
    id: "u-maria",
    nome: "Maria Santos",
    email: "maria.santos@bigsoccer.com",
    role: "coach",
    cargo: "Coach",
    senha: "maria123",
    // Atende exclusivamente a Sub-17 Turma B.
    escopo: { unidade: "Atibaia", categorias: ["Sub-17"], turmas: ["Turma B"] },
    coachName: "Maria Santos",
  },
  {
    id: "u-gerson",
    nome: "Gerson",
    email: "gerson@bigsoccer.com",
    role: "admin",
    cargo: "Admin",
    senha: "gerson123",
    // Mantém a Sub-13 Turma A (coachName) mesmo como admin — ver escopoContem:
    // papel admin já dá visão total, coachName segue valendo para ele
    // aparecer como "Treinador Responsável" ao criar planos para essa turma.
    escopo: { unidade: "Atibaia", categorias: ["Sub-13"], turmas: ["Turma A"] },
    coachName: "Gerson",
  },
  {
    id: "u-roberto",
    nome: "Roberto Lima",
    email: "roberto.lima@bigsoccer.com",
    role: "coach",
    cargo: "Coach",
    senha: "roberto123",
    escopo: {
      unidade: "Atibaia",
      categorias: ["Sub-13", "Sub-15", "Sub-17", "Sub-20"],
      turmas: ["Turma A", "Turma B"],
    },
  },
  {
    id: "u-raspada",
    nome: "Raspada Júnior",
    email: "raspada@bigsoccer.com",
    role: "admin",
    cargo: "Admin",
    senha: "raspada123",
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
    role: "coach",
    cargo: "Coach",
    senha: "mario123",
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
    senha: "ana123",
    // Responsável por atleta da Sub-15 Turma A — só acompanha essa turma.
    escopo: { unidade: "Atibaia", categorias: ["Sub-15"], turmas: ["Turma A"] },
  },
];

// Um item está no escopo do usuário quando bate unidade + categoria + turma.
// Admin tem visão administrativa total. Coach é restrito adicionalmente aos
// treinos que ele mesmo ministra, quando tem turma própria (coachName).
export function escopoContem(item, user) {
  if (user.role === "admin") return true;
  if (item.unidade !== user.escopo.unidade) return false;
  if (!user.escopo.categorias.includes(item.categoria)) return false;
  if (!user.escopo.turmas.includes(item.turma)) return false;
  if (user.role === "coach" && user.coachName) {
    return item.coachName === user.coachName;
  }
  return true;
}

/** Descrição curta do escopo para exibição (ex.: "Atibaia · Sub-15 · Turma A"). */
export function escopoLabel(user) {
  if (user.role === "admin") return "Todas as unidades e categorias";
  const cats = user.escopo.categorias;
  const catLabel = cats.length > 2 ? `${cats.length} categorias` : cats.join(", ");
  const turmaLabel = user.escopo.turmas.length > 1 ? "Turmas A e B" : user.escopo.turmas.join(", ");
  return `${user.escopo.unidade} · ${catLabel} · ${turmaLabel}`;
}

import { escopoContem } from "./users";

// Base de dados ESTRUTURADA de fundamentos por atleta (mock/demonstração).
// Alinhada à nota do briefing: os "agentes" de IA são futuros, mas o dashboard
// deve gerar a base estruturada para eles. Aqui essa base alimenta uma
// heurística simples de recomendação de reforço (sem backend / sem ML real).

// Fundamentos técnicos avaliados (notas 0–100 por atleta).
export const FUNDAMENTOS = ["Cabeceio", "Passe", "Lançamento", "Domínio", "Finalização", "Marcação"];

// Nota abaixo deste limite = deficiência no fundamento (mesmo limiar visual do
// resto do app: conformanceColor considera < 60 como "vermelho").
export const LIMITE_REFORCO = 60;

function atleta(id, nome, matricula, categoria, turma, coachName, posicao, notas) {
  return { id, nome, matricula, unidade: "Atibaia", categoria, turma, coachName, posicao, fundamentos: notas };
}

// Registro global de atletas (demonstração). Escopo por unidade/categoria/turma
// e coachName para o filtro por perfil (escopoContem) funcionar igual ao resto.
export const atletas = [
  // Sub-15 · Turma A · João Silva (mesma escalação da súmula)
  atleta("a-1001", "João Silva", "1001", "Sub-15", "Turma A", "João Silva", "Goleiro", { Cabeceio: 48, Passe: 71, "Lançamento": 82, "Domínio": 66, "Finalização": 40, "Marcação": 74 }),
  atleta("a-1002", "Maria Santos", "1002", "Sub-15", "Turma A", "João Silva", "Lateral", { Cabeceio: 58, Passe: 54, "Lançamento": 63, "Domínio": 70, "Finalização": 52, "Marcação": 68 }),
  atleta("a-1003", "Pedro Costa", "1003", "Sub-15", "Turma A", "João Silva", "Zagueiro", { Cabeceio: 78, Passe: 55, "Lançamento": 49, "Domínio": 62, "Finalização": 44, "Marcação": 81 }),
  atleta("a-1004", "Ana Silva", "1004", "Sub-15", "Turma A", "João Silva", "Zagueira", { Cabeceio: 72, Passe: 57, "Lançamento": 51, "Domínio": 64, "Finalização": 46, "Marcação": 76 }),
  atleta("a-1005", "Carlos Oliveira", "1005", "Sub-15", "Turma A", "João Silva", "Lateral", { Cabeceio: 55, Passe: 68, "Lançamento": 58, "Domínio": 73, "Finalização": 59, "Marcação": 61 }),
  atleta("a-1006", "Fernanda Costa", "1006", "Sub-15", "Turma A", "João Silva", "Meia", { Cabeceio: 44, Passe: 82, "Lançamento": 70, "Domínio": 79, "Finalização": 66, "Marcação": 52 }),
  atleta("a-1007", "Bruno Silva", "1007", "Sub-15", "Turma A", "João Silva", "Meia", { Cabeceio: 49, Passe: 76, "Lançamento": 64, "Domínio": 74, "Finalização": 57, "Marcação": 50 }),
  atleta("a-1008", "Juliana Santos", "1008", "Sub-15", "Turma A", "João Silva", "Meia", { Cabeceio: 51, Passe: 80, "Lançamento": 55, "Domínio": 77, "Finalização": 58, "Marcação": 53 }),
  atleta("a-1009", "Ricardo Oliveira", "1009", "Sub-15", "Turma A", "João Silva", "Atacante", { Cabeceio: 63, Passe: 58, "Lançamento": 47, "Domínio": 69, "Finalização": 84, "Marcação": 42 }),
  atleta("a-1010", "Beatriz Costa", "1010", "Sub-15", "Turma A", "João Silva", "Atacante", { Cabeceio: 66, Passe: 52, "Lançamento": 45, "Domínio": 71, "Finalização": 79, "Marcação": 39 }),
  atleta("a-1011", "Gustavo Silva", "1011", "Sub-15", "Turma A", "João Silva", "Atacante", { Cabeceio: 59, Passe: 49, "Lançamento": 43, "Domínio": 67, "Finalização": 81, "Marcação": 41 }),

  // Sub-17 · Turma B · Maria Santos
  atleta("a-1201", "Lucas Pereira", "1201", "Sub-17", "Turma B", "Maria Santos", "Zagueiro", { Cabeceio: 80, Passe: 62, "Lançamento": 55, "Domínio": 64, "Finalização": 48, "Marcação": 83 }),
  atleta("a-1202", "Rafael Souza", "1202", "Sub-17", "Turma B", "Maria Santos", "Volante", { Cabeceio: 57, Passe: 74, "Lançamento": 66, "Domínio": 72, "Finalização": 51, "Marcação": 69 }),
  atleta("a-1203", "Tiago Alves", "1203", "Sub-17", "Turma B", "Maria Santos", "Meia", { Cabeceio: 45, Passe: 85, "Lançamento": 71, "Domínio": 80, "Finalização": 63, "Marcação": 54 }),
  atleta("a-1204", "Felipe Rocha", "1204", "Sub-17", "Turma B", "Maria Santos", "Atacante", { Cabeceio: 68, Passe: 56, "Lançamento": 49, "Domínio": 70, "Finalização": 82, "Marcação": 44 }),
  atleta("a-1205", "Diego Martins", "1205", "Sub-17", "Turma B", "Maria Santos", "Lateral", { Cabeceio: 52, Passe: 64, "Lançamento": 58, "Domínio": 66, "Finalização": 47, "Marcação": 60 }),
  atleta("a-1206", "Gabriel Nunes", "1206", "Sub-17", "Turma B", "Maria Santos", "Meia", { Cabeceio: 50, Passe: 78, "Lançamento": 59, "Domínio": 75, "Finalização": 55, "Marcação": 57 }),

  // Sub-13 · Turma A · Gerson
  atleta("a-1301", "Enzo Ferreira", "1301", "Sub-13", "Turma A", "Gerson", "Goleiro", { Cabeceio: 40, Passe: 58, "Lançamento": 70, "Domínio": 55, "Finalização": 38, "Marcação": 62 }),
  atleta("a-1302", "Miguel Barros", "1302", "Sub-13", "Turma A", "Gerson", "Zagueiro", { Cabeceio: 66, Passe: 51, "Lançamento": 48, "Domínio": 57, "Finalização": 42, "Marcação": 70 }),
  atleta("a-1303", "Davi Ribeiro", "1303", "Sub-13", "Turma A", "Gerson", "Meia", { Cabeceio: 47, Passe: 69, "Lançamento": 53, "Domínio": 68, "Finalização": 56, "Marcação": 49 }),
  atleta("a-1304", "Théo Cardoso", "1304", "Sub-13", "Turma A", "Gerson", "Atacante", { Cabeceio: 54, Passe: 50, "Lançamento": 44, "Domínio": 61, "Finalização": 72, "Marcação": 43 }),
  atleta("a-1305", "Heitor Gomes", "1305", "Sub-13", "Turma A", "Gerson", "Lateral", { Cabeceio: 49, Passe: 60, "Lançamento": 52, "Domínio": 58, "Finalização": 46, "Marcação": 55 }),
];

// Atletas dentro do escopo (perfil) do usuário logado.
export function atletasNoEscopo(user) {
  return atletas.filter((a) => escopoContem(a, user));
}

// Grupos de reforço sugeridos: por fundamento, os atletas do escopo com nota
// abaixo do limite, ordenados do mais fraco para o menos fraco. Só vira "grupo"
// quando há pelo menos 2 atletas (faz sentido reunir para um treino de reforço).
export function gruposDeReforco(user) {
  const pool = atletasNoEscopo(user);
  return FUNDAMENTOS.map((fundamento) => {
    const fracos = pool
      .filter((a) => a.fundamentos[fundamento] < LIMITE_REFORCO)
      .map((a) => ({ ...a, score: a.fundamentos[fundamento] }))
      .sort((x, y) => x.score - y.score);
    const media = fracos.length ? Math.round(fracos.reduce((s, a) => s + a.score, 0) / fracos.length) : 0;
    return { fundamento, atletas: fracos, media };
  })
    .filter((g) => g.atletas.length >= 2)
    .sort((a, b) => b.atletas.length - a.atletas.length);
}

// Resumo para o Dashboard: total avaliado, quantos atletas têm ao menos uma
// deficiência, e os fundamentos com mais atletas sinalizados.
export function resumoReforco(user) {
  const pool = atletasNoEscopo(user);
  const sinalizados = pool.filter((a) => FUNDAMENTOS.some((f) => a.fundamentos[f] < LIMITE_REFORCO));
  const topFundamentos = FUNDAMENTOS.map((fundamento) => {
    const fracos = pool.filter((a) => a.fundamentos[fundamento] < LIMITE_REFORCO);
    const media = fracos.length
      ? Math.round(fracos.reduce((s, a) => s + a.fundamentos[fundamento], 0) / fracos.length)
      : 0;
    return { fundamento, qtd: fracos.length, media };
  })
    .filter((x) => x.qtd > 0)
    .sort((a, b) => b.qtd - a.qtd);
  return { totalAvaliados: pool.length, sinalizados: sinalizados.length, topFundamentos };
}

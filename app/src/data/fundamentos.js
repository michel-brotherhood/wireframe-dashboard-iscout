import { escopoContem } from "./users";
import { atletas } from "./atletas";

// Heurística de reforço (mock/demonstração) sobre o registro único de
// atletas (data/atletas.js). Alinhada à nota do briefing: os "agentes" de IA
// são futuros, mas o dashboard deve gerar a base estruturada para eles. Aqui
// essa base alimenta uma heurística simples de recomendação de reforço (sem
// backend / sem ML real).

// Fundamentos técnicos avaliados (notas 0–100 por atleta).
export const FUNDAMENTOS = ["Cabeceio", "Passe", "Lançamento", "Domínio", "Finalização", "Marcação"];

// Nota abaixo deste limite = deficiência no fundamento (mesmo limiar visual do
// resto do app: conformanceColor considera < 60 como "vermelho").
export const LIMITE_REFORCO = 60;

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

import { escopoContem } from "./users";

function contexto(p) {
  const [, m, d] = p.sessionDate.split("-");
  return `${d}/${m} · ${p.categoria} · ${p.turma}`;
}

// Notificações derivadas do estado atual (mock, sem backend), respeitando o
// escopo do usuário. Modela o "Admin recebe notificação" do briefing
// (Diagrama 5): submeter um plano gera alerta para quem aprova (admin);
// devolução e aprovação geram alerta para o coach.
export function buildNotifications(user, planos, treinos) {
  const meusPlanos = planos.filter((p) => escopoContem(p, user));
  const meusTreinos = treinos.filter((t) => escopoContem(t, user));
  const out = [];

  if (user.role === "admin") {
    meusPlanos
      .filter((p) => p.status === "submitted")
      .forEach((p) =>
        out.push({
          id: `sub-${p.id}`,
          title: "Plano aguardando aprovação",
          detail: `${p.coachName} · ${contexto(p)}`,
          tone: "info",
          icon: "stamp",
          to: "/planos/aprovacao",
        }),
      );
    meusPlanos
      .filter((p) => p.status === "changes_requested")
      .forEach((p) =>
        out.push({
          id: `rev-${p.id}`,
          title: "Plano reenviado após ajustes",
          detail: `${p.coachName} · ${contexto(p)}`,
          tone: "info",
          icon: "stamp",
          to: "/planos/aprovacao",
        }),
      );
    meusTreinos
      .filter((t) => t.executionLog && t.plano.status !== "approved" && t.plano.status !== "executed")
      .forEach((t) =>
        out.push({
          id: `nopl-${t.id}`,
          title: "Execução sem plano aprovado",
          detail: contexto(t),
          tone: "warning",
          icon: "alert",
          to: "/planos/aprovacao",
        }),
      );
  }

  // "Seu plano" só faz sentido pra quem tem turma própria (coachName) — coach
  // de escopo amplo sem coachName (ex.: ex-head coach/gestor) veria planos
  // alheios rotulados como "seu" se este filtro não existisse.
  if (user.role === "coach" && user.coachName) {
    meusPlanos
      .filter((p) => p.status === "changes_requested")
      .forEach((p) =>
        out.push({
          id: `chg-${p.id}`,
          title: "Ajustes solicitados no seu plano",
          detail: p.reviewComment ? `${contexto(p)} — ${p.reviewComment}` : contexto(p),
          tone: "warning",
          icon: "edit",
          to: "/",
        }),
      );
    meusPlanos
      .filter((p) => p.status === "approved")
      .forEach((p) =>
        out.push({
          id: `apr-${p.id}`,
          title: "Seu plano foi aprovado",
          detail: contexto(p),
          tone: "success",
          icon: "check",
          to: "/",
        }),
      );
  }

  if (user.role === "responsavel") {
    out.push(
      {
        id: "com-1",
        title: "Treino de sábado remarcado",
        detail: "Sábado (04/07) passa para domingo (05/07) às 09h, mesmo campo.",
        tone: "info",
        icon: "calendar",
      },
      {
        id: "com-2",
        title: "Uniforme completo obrigatório",
        detail: "Chuteira + caneleira obrigatórias a partir da próxima semana.",
        tone: "warning",
        icon: "alert",
      },
    );
  }

  return out;
}

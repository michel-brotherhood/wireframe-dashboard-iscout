import { useState } from "react";
import type { PlanoAula } from "../types";
import { Card, Field, IntervaloFlow, PrimaryButton, StatusBadge, inputClass } from "../components/ui";
import { Icon } from "../components/Icon";
import { usePlanos } from "../state/PlanosContext";
import { prazoLabel } from "../data/mockData";

function formatDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function formatDateTime(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} às ${String(
    d.getHours(),
  ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function totalPlanejado(p: PlanoAula) {
  return p.etapaInicial.duracaoMin + p.etapaFundamentacao.duracaoMin + p.etapaPrincipal.duracaoMin;
}

export default function AprovacaoPlanos() {
  const { planos, approvePlano, requestChanges, bulkApprove: bulkApproveCtx } = usePlanos();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const pendentes = planos.filter((p) => p.status === "submitted" || p.status === "changes_requested");
  const historico = planos
    .filter((p) => p.status === "approved" || p.status === "cancelled" || p.status === "executed")
    .sort((a, b) => (b.reviewedAt ?? b.approvedAt ?? "").localeCompare(a.reviewedAt ?? a.approvedAt ?? ""));

  const viewing = viewingId ? (planos.find((p) => p.id === viewingId) ?? null) : null;

  function openDetail(id: string) {
    setViewingId(id);
    setComment("");
    setCommentError(null);
  }

  function backToQueue() {
    setViewingId(null);
    setComment("");
    setCommentError(null);
  }

  function handleApprove(id: string) {
    approvePlano(id, comment.trim() || undefined);
    setStatus("Plano aprovado.");
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    backToQueue();
  }

  function handleRequestChanges(id: string) {
    if (!comment.trim()) {
      setCommentError("Descreva o que precisa ser ajustado para o treinador.");
      return;
    }
    requestChanges(id, comment.trim());
    setStatus("Ajustes solicitados ao treinador.");
    backToQueue();
  }

  function bulkApprove() {
    const count = selected.size;
    bulkApproveCtx(Array.from(selected));
    setSelected(new Set());
    setStatus(`${count} ${count === 1 ? "plano aprovado" : "planos aprovados"} em lote.`);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (viewing) {
    const prazo = prazoLabel(viewing.deadlineAt);
    return (
      <div className="flex flex-col gap-6">
        <div>
          <button
            type="button"
            onClick={backToQueue}
            className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink"
          >
            <Icon name="arrowLeft" className="h-4 w-4" /> Voltar para a fila
          </button>
          <h1 className="font-heading flex items-center gap-2 text-xl font-semibold text-ink sm:text-2xl">
            <Icon name="stamp" className="h-6 w-6 text-primary" />
            {formatDate(viewing.sessionDate)} · {viewing.categoria} · {viewing.turma}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
            <StatusBadge status={viewing.status} />
            {viewing.unidade} · {viewing.coachName} · {viewing.horario} ·{" "}
            <span className={`font-medium ${prazo.tone}`}>Prazo: {prazo.text} ({formatDateTime(viewing.deadlineAt)})</span>
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            <span className="font-medium text-ink">Tema:</span> {viewing.tema} · <span className="font-medium text-ink">Subtema:</span>{" "}
            {viewing.subtema}
          </p>
        </div>

        {status && (
          <p role="status" className="flex items-center gap-1.5 rounded-xl border border-secondary/30 bg-secondary/10 px-3 py-2 text-sm text-secondary">
            <Icon name="check" className="h-4 w-4" /> {status}
          </p>
        )}

        <Card title="Plano Completo" icon={<Icon name="clipboard" className="h-4 w-4" />}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-line-soft bg-surface-2 p-3">
              <p className="text-sm font-semibold text-ink">Etapa Inicial (Aquecimento) — {viewing.etapaInicial.duracaoMin} min</p>
              <p className="mt-1 text-sm text-ink-muted">Objetivo: {viewing.etapaInicial.objetivo}</p>
              <p className="mt-2 text-sm font-medium text-ink">Estação 1 — {viewing.etapaInicial.estacao1.nome}</p>
              <p className="text-sm text-ink-muted">
                {viewing.etapaInicial.estacao1.tipo} · {viewing.etapaInicial.estacao1.duracaoMin} min
              </p>
              <p className="mt-2 text-sm font-medium text-ink">Estação 2 — {viewing.etapaInicial.estacao2.nome}</p>
              <p className="text-sm text-ink-muted">
                {viewing.etapaInicial.estacao2.tipo} · {viewing.etapaInicial.estacao2.duracaoMin} min
              </p>
            </div>
            <div className="rounded-xl border border-line-soft bg-surface-2 p-3">
              <p className="text-sm font-semibold text-ink">Etapa de Fundamentação — {viewing.etapaFundamentacao.duracaoMin} min</p>
              <p className="mt-1 text-sm text-ink-muted">Objetivo: {viewing.etapaFundamentacao.objetivo}</p>
              <p className="text-sm text-ink-muted">Tipo: {viewing.etapaFundamentacao.tipo}</p>
            </div>
            <div className="rounded-xl border border-line-soft bg-surface-2 p-3">
              <p className="text-sm font-semibold text-ink">Etapa Principal — {viewing.etapaPrincipal.duracaoMin} min</p>
              <p className="mt-1 text-sm text-ink-muted">Objetivo: {viewing.etapaPrincipal.objetivo}</p>
              <p className="text-sm text-ink-muted">Sub-temas: {viewing.etapaPrincipal.subTemas.join(", ")}</p>
              <p className="text-sm text-ink-muted">Orientações: {viewing.etapaPrincipal.orientacoes.join(", ")}</p>
              <p className="mb-1 mt-2 text-sm text-ink-muted">Protocolo de Intervalo:</p>
              <IntervaloFlow />
            </div>
          </div>
          <p className="mt-3 text-sm font-semibold text-ink">Total Planejado: {totalPlanejado(viewing)} minutos</p>
          {viewing.observacoes && <p className="mt-1 text-sm text-ink-muted">Observações: {viewing.observacoes}</p>}
          {viewing.reviewComment && viewing.status === "changes_requested" && (
            <p className="mt-3 rounded-xl border border-warning/30 bg-warning/5 p-3 text-sm text-ink">
              <span className="font-medium">Ajustes solicitados anteriormente:</span> "{viewing.reviewComment}"
            </p>
          )}
        </Card>

        <Card title="Decisão do Head Coach" icon={<Icon name="edit" className="h-4 w-4" />}>
          <Field
            label="Comentário"
            hint="Obrigatório para solicitar ajustes · opcional ao aprovar"
            error={commentError ?? undefined}
          >
            <textarea
              className={`${inputClass} min-h-[90px]`}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setCommentError(null);
              }}
              placeholder="Ex.: Duração da Etapa Principal fora do padrão — ajustar antes de reaprovar."
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <PrimaryButton onClick={() => handleApprove(viewing.id)}>
              <Icon name="check" className="h-4 w-4" /> Aprovar
            </PrimaryButton>
            <PrimaryButton variant="secondary" onClick={() => handleRequestChanges(viewing.id)}>
              <Icon name="x" className="h-4 w-4" /> Solicitar Ajustes
            </PrimaryButton>
            <PrimaryButton variant="secondary" onClick={backToQueue}>
              <Icon name="arrowLeft" className="h-4 w-4" /> Voltar para a Fila
            </PrimaryButton>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading flex items-center gap-2 text-xl font-semibold text-ink sm:text-2xl">
          <Icon name="stamp" className="h-6 w-6 text-primary" />
          Aprovações
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Sem plano aprovado, o treinador não consegue registrar execução — gate obrigatório.
        </p>
      </div>

      {status && (
        <p role="status" className="flex items-center gap-1.5 rounded-xl border border-secondary/30 bg-secondary/10 px-3 py-2 text-sm text-secondary">
          <Icon name="check" className="h-4 w-4" /> {status}
        </p>
      )}

      <Card
        title={`Fila de Aprovação (${pendentes.length})`}
        icon={<Icon name="alert" className="h-4 w-4" />}
        headerAction={
          selected.size > 0 ? (
            <PrimaryButton onClick={bulkApprove}>
              <Icon name="check" className="h-4 w-4" /> Aprovar Selecionados ({selected.size})
            </PrimaryButton>
          ) : undefined
        }
      >
        {pendentes.length === 0 ? (
          <p className="text-sm text-ink-muted">Nenhum plano aguardando decisão no momento.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pendentes.map((p) => {
              const prazo = prazoLabel(p.deadlineAt);
              return (
                <div key={p.id} className="rounded-xl border border-line-soft bg-surface-2 p-3">
                  <div className="flex flex-wrap items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-line bg-surface text-primary focus:ring-primary"
                      checked={selected.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      aria-label={`Selecionar plano de ${formatDate(p.sessionDate)}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-ink">
                          {formatDate(p.sessionDate)} · {p.categoria} · {p.turma}
                        </p>
                        <StatusBadge status={p.status} />
                      </div>
                      <p className="text-sm text-ink-muted">
                        {p.unidade} · Treinador: {p.coachName} · Total Planejado: {totalPlanejado(p)} min
                      </p>
                      <p className="mt-1 text-sm">
                        <span className="text-ink-muted">Prazo: {formatDateTime(p.deadlineAt)} · </span>
                        <span className={`font-medium ${prazo.tone}`}>{prazo.text}</span>
                      </p>
                      {p.status === "changes_requested" && p.reviewComment && (
                        <p className="mt-1 text-sm text-ink-muted">Motivo anterior: "{p.reviewComment}"</p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <PrimaryButton variant="secondary" onClick={() => openDetail(p.id)}>
                        <Icon name="clipboard" className="h-4 w-4" /> Ver Plano
                      </PrimaryButton>
                      <PrimaryButton variant="secondary" onClick={() => handleApprove(p.id)}>
                        <Icon name="check" className="h-4 w-4" /> Aprovar
                      </PrimaryButton>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card title="Histórico Recente" icon={<Icon name="clipboard" className="h-4 w-4" />}>
        {historico.length === 0 ? (
          <p className="text-sm text-ink-muted">Nenhuma decisão registrada ainda.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {historico.map((p) => (
              <li key={p.id} className="rounded-xl border border-line-soft bg-surface-2 p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={p.status} />
                  <span className="font-medium text-ink">
                    {formatDate(p.sessionDate)} · {p.categoria} · {p.turma} · {p.coachName}
                  </span>
                  <span className="ml-auto text-ink-muted">
                    {p.status === "approved"
                      ? `Aprovado em ${formatDateTime(p.approvedAt)} por ${p.approvedBy}`
                      : p.status === "cancelled"
                        ? `Cancelado em ${formatDateTime(p.reviewedAt)}`
                        : `Executado`}
                  </span>
                </div>
                {p.reviewComment && (p.status === "cancelled" || p.status === "approved") && (
                  <p className="mt-1 text-ink-muted">Comentário: "{p.reviewComment}"</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

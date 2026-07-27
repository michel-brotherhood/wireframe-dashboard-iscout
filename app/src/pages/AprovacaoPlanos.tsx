import { useState } from "react";
import { planosPendentesIniciais } from "../data/mockData";
import type { PlanoAula } from "../types";
import { Card, Field, PrimaryButton, StatusBadge, inputClass } from "../components/ui";
import { Icon } from "../components/Icon";

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
  return p.etapaInicial.duracaoMin + p.etapaFuncionamento.duracaoMin + p.etapaPrincipal.duracaoMin;
}

export default function AprovacaoPlanos() {
  const [planos, setPlanos] = useState<PlanoAula[]>(planosPendentesIniciais);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const pendentes = planos.filter((p) => p.status === "submitted");
  const historico = planos
    .filter((p) => p.status === "approved" || p.status === "rejected")
    .sort((a, b) => (b.approvedAt ?? b.rejectedAt ?? "").localeCompare(a.approvedAt ?? a.rejectedAt ?? ""));

  function approveOne(id: string) {
    setPlanos((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: "approved", approvedAt: new Date().toISOString(), approvedBy: "Manager" }
          : p,
      ),
    );
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function bulkApprove() {
    const count = selected.size;
    setPlanos((prev) =>
      prev.map((p) =>
        selected.has(p.id)
          ? { ...p, status: "approved", approvedAt: new Date().toISOString(), approvedBy: "Manager" }
          : p,
      ),
    );
    setSelected(new Set());
    setStatus(`${count} ${count === 1 ? "plano aprovado" : "planos aprovados"} em lote.`);
  }

  function openReject(id: string) {
    setRejectingId(id);
    setRejectReason("");
    setRejectError(null);
  }

  function confirmReject(id: string) {
    if (!rejectReason.trim()) {
      setRejectError("Descreva o motivo da rejeição para o treinador.");
      return;
    }
    setPlanos((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: "rejected", rejectedAt: new Date().toISOString(), rejectedReason: rejectReason.trim() }
          : p,
      ),
    );
    setRejectingId(null);
    setRejectReason("");
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading flex items-center gap-2 text-xl font-semibold text-ink sm:text-2xl">
          <Icon name="stamp" className="h-6 w-6 text-primary" />
          Aprovação de Planos
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Sem plano aprovado, o treinador não consegue registrar execução — gate obrigatório (RF4/RF5).
        </p>
      </div>

      {status && (
        <p role="status" className="flex items-center gap-1.5 rounded-xl border border-secondary/30 bg-secondary/10 px-3 py-2 text-sm text-secondary">
          <Icon name="check" className="h-4 w-4" /> {status}
        </p>
      )}

      <Card
        title={`Pendentes de Aprovação (${pendentes.length})`}
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
          <p className="text-sm text-ink-faint">Nenhum plano aguardando aprovação no momento.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pendentes.map((p) => (
              <div key={p.id} className="rounded-xl border border-line-soft bg-surface-2 p-3">
                <div className="flex flex-wrap items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-line bg-surface text-primary focus:ring-primary"
                    checked={selected.has(p.id)}
                    onChange={() => toggleSelect(p.id)}
                    aria-label={`Selecionar plano de ${formatDate(p.sessionDate)}`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink">
                      {formatDate(p.sessionDate)} · Team {p.team} · {p.coachName}
                    </p>
                    <p className="text-sm text-ink-muted">
                      Fase: {p.fase} · Total Planejado: {totalPlanejado(p)} min · Submetido em{" "}
                      {formatDateTime(p.createdAt)}
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">Objetivo principal: {p.etapaPrincipal.objetivo}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <PrimaryButton variant="secondary" onClick={() => approveOne(p.id)}>
                      <Icon name="check" className="h-4 w-4" /> Aprovar
                    </PrimaryButton>
                    <PrimaryButton variant="secondary" onClick={() => openReject(p.id)}>
                      <Icon name="x" className="h-4 w-4" /> Rejeitar
                    </PrimaryButton>
                  </div>
                </div>

                {rejectingId === p.id && (
                  <div className="mt-3 border-t border-line pt-3">
                    <Field label="Motivo da rejeição" required error={rejectError ?? undefined}>
                      <textarea
                        className={`${inputClass} min-h-[80px]`}
                        value={rejectReason}
                        onChange={(e) => {
                          setRejectReason(e.target.value);
                          setRejectError(null);
                        }}
                        placeholder="Ex.: Duração total fora do intervalo, revisar Etapa Principal."
                      />
                    </Field>
                    <div className="flex gap-2">
                      <PrimaryButton onClick={() => confirmReject(p.id)}>Confirmar Rejeição</PrimaryButton>
                      <PrimaryButton variant="secondary" onClick={() => setRejectingId(null)}>
                        Cancelar
                      </PrimaryButton>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Histórico Recente" icon={<Icon name="clipboard" className="h-4 w-4" />}>
        {historico.length === 0 ? (
          <p className="text-sm text-ink-faint">Nenhuma decisão registrada ainda.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {historico.map((p) => (
              <li key={p.id} className="rounded-xl border border-line-soft bg-surface-2 p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={p.status} />
                  <span className="font-medium text-ink">
                    {formatDate(p.sessionDate)} · Team {p.team} · {p.coachName}
                  </span>
                  <span className="ml-auto text-ink-faint">
                    {p.status === "approved"
                      ? `Aprovado em ${formatDateTime(p.approvedAt)} por ${p.approvedBy}`
                      : `Rejeitado em ${formatDateTime(p.rejectedAt)}`}
                  </span>
                </div>
                {p.status === "rejected" && p.rejectedReason && (
                  <p className="mt-1 text-ink-muted">Motivo: "{p.rejectedReason}"</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

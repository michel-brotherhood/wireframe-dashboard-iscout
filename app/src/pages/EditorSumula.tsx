import { useState } from "react";
import { ambiguousMatches } from "../data/mockData";
import { Card, Field, PrimaryButton, inputClass } from "../components/ui";
import { Icon } from "../components/Icon";
import type { Categoria } from "../types";

const BLOCKED_JERSEYS = [24, 51, 69];
const CATEGORIAS: Categoria[] = ["Sub-13", "Sub-15", "Sub-17", "Sub-20"];

interface Row {
  jersey: number;
  nome: string;
  posicao: string;
  matricula: string;
  starter: boolean;
}

// Matrícula válida e única já identifica o atleta — resolve automaticamente.
// Sem matrícula, o nome precisa ser conferido contra o cadastro: se bate com
// mais de um cadastro conhecido, fica ambíguo até o treinador escolher qual;
// se não bate com nenhum, o atleta não é encontrado. Em ambos os casos a
// confirmação da escalação fica bloqueada até resolver.
type ResolutionStatus = "resolved" | "ambiguous" | "not_found";

function resolutionStatus(row: Row, selections: Record<number, string>): ResolutionStatus {
  if (row.matricula.trim()) return "resolved";
  const match = ambiguousMatches.find((m) => m.nome === row.nome);
  if (!match) return "not_found";
  return selections[row.jersey] ? "resolved" : "ambiguous";
}

const initialRoster: Row[] = [
  { jersey: 1, nome: "João Silva", posicao: "Goleiro", matricula: "1001", starter: true },
  { jersey: 2, nome: "Maria Santos", posicao: "Lateral", matricula: "1002", starter: true },
  { jersey: 3, nome: "Pedro Costa", posicao: "Zagueiro", matricula: "1003", starter: true },
  { jersey: 4, nome: "Ana Silva", posicao: "Zagueira", matricula: "1004", starter: true },
  { jersey: 5, nome: "Carlos Oliveira", posicao: "Lateral", matricula: "1005", starter: true },
  { jersey: 6, nome: "Fernanda Costa", posicao: "Meia", matricula: "1006", starter: true },
  { jersey: 7, nome: "Bruno Silva", posicao: "Meia", matricula: "1007", starter: true },
  { jersey: 8, nome: "Juliana Santos", posicao: "Meia", matricula: "1008", starter: true },
  { jersey: 9, nome: "Ricardo Oliveira", posicao: "Atacante", matricula: "1009", starter: true },
  { jersey: 10, nome: "Beatriz Costa", posicao: "Atacante", matricula: "1010", starter: true },
  { jersey: 11, nome: "Gustavo Silva", posicao: "Atacante", matricula: "1011", starter: true },
];

export default function EditorSumula() {
  const [categoria, setCategoria] = useState<Categoria>("Sub-15");
  const [roster, setRoster] = useState<Row[]>(initialRoster);
  const [newJersey, setNewJersey] = useState("");
  const [newNome, setNewNome] = useState("");
  const [newMatricula, setNewMatricula] = useState("");
  const [newStarter, setNewStarter] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);
  const [selections, setSelections] = useState<Record<number, string>>({});
  const [status, setStatus] = useState<string | null>(null);

  function handleAdd() {
    const jerseyNum = Number(newJersey);
    setError(null);

    if (!newJersey || !newNome.trim()) {
      setError("Preencha número do colete e nome do atleta.");
      return;
    }
    if (jerseyNum < 1 || jerseyNum > 99) {
      setError("Número do colete deve estar entre 1 e 99.");
      return;
    }
    if (BLOCKED_JERSEYS.includes(jerseyNum)) {
      setError(`Número do colete ${jerseyNum} está bloqueado para uso.`);
      return;
    }
    if (roster.some((r) => r.jersey === jerseyNum)) {
      setError(`Número do colete ${jerseyNum} já está em uso.`);
      return;
    }

    setRoster([...roster, { jersey: jerseyNum, nome: newNome.trim(), posicao: "—", matricula: newMatricula.trim(), starter: newStarter }]);
    setNewJersey("");
    setNewNome("");
    setNewMatricula("");
    setNewStarter(true);
  }

  function handleRemove(jersey: number) {
    setRoster(roster.filter((r) => r.jersey !== jersey));
  }

  const starterCount = roster.filter((r) => r.starter).length;
  const jerseySet = new Set(roster.map((r) => r.jersey));
  const hasDuplicateJersey = jerseySet.size !== roster.length;
  const hasInvalidNumbers = roster.some((r) => !Number.isInteger(r.jersey) || r.jersey < 1 || r.jersey > 99);
  const hasEmptyNome = roster.some((r) => !r.nome.trim());

  const statuses = roster.map((row) => ({ row, status: resolutionStatus(row, selections) }));
  const pendingAmbiguous = statuses.filter((s) => s.status === "ambiguous");
  const notFound = statuses.filter((s) => s.status === "not_found");
  const allAthletesResolved = statuses.every((s) => s.status === "resolved");

  const canConfirm =
    roster.length > 0 && !hasDuplicateJersey && !hasInvalidNumbers && !hasEmptyNome && allAthletesResolved;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-xl font-semibold text-ink sm:text-2xl">
        Criar Súmula — 02/07/2026 — {categoria}
      </h1>

      <Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <Field label="Data" required>
            <input type="date" className={inputClass} defaultValue="2026-07-02" />
          </Field>
          <Field label="Categoria" required>
            <select className={inputClass} value={categoria} onChange={(e) => setCategoria(e.target.value as Categoria)}>
              {CATEGORIAS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Cor do Colete" required>
            <select className={inputClass} defaultValue="Amarelo">
              <option>Amarelo</option>
              <option>Azul</option>
            </select>
          </Field>
          <Field label="Sessão / Take" required>
            <input className={inputClass} defaultValue="Sessão 1 - Campo 2" />
          </Field>
        </div>
      </Card>

      <Card title="Adicionar Atleta">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[140px_1fr_140px_120px_auto] sm:items-end">
          <Field label="Número do Colete">
            <input
              type="number"
              min={1}
              max={99}
              className={inputClass}
              value={newJersey}
              onChange={(e) => setNewJersey(e.target.value)}
            />
          </Field>
          <Field label="Nome">
            <input className={inputClass} value={newNome} onChange={(e) => setNewNome(e.target.value)} />
          </Field>
          <Field label="Matrícula" hint="Sem matrícula, o nome precisa passar por Resolver Nomes.">
            <input className={inputClass} value={newMatricula} onChange={(e) => setNewMatricula(e.target.value)} />
          </Field>
          <label className="mb-4 flex items-center gap-2 text-sm text-ink sm:mb-[13px]">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-line bg-surface-2 text-primary focus:ring-primary"
              checked={newStarter}
              onChange={(e) => setNewStarter(e.target.checked)}
            />
            Titular
          </label>
          <PrimaryButton onClick={handleAdd} className="mb-4 sm:mb-4">
            <Icon name="plus" className="h-4 w-4" /> Adicionar
          </PrimaryButton>
        </div>
        {error && (
          <p role="alert" className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary-text">
            <Icon name="alert" className="h-4 w-4" /> {error}
          </p>
        )}
      </Card>

      <Card title={`Escalação (${roster.length} atletas)`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
                <th scope="col" className="px-3 py-2">Número do Colete</th>
                <th scope="col" className="px-3 py-2">Nome</th>
                <th scope="col" className="px-3 py-2">Posição</th>
                <th scope="col" className="px-3 py-2">Matrícula</th>
                <th scope="col" className="px-3 py-2">Titular</th>
                <th scope="col" className="px-3 py-2 sr-only">Ação</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((r, i) => (
                <tr key={r.jersey} className={`border-b border-line-soft last:border-0 ${i % 2 === 1 ? "bg-surface-2/40" : ""}`}>
                  <td className="px-3 py-2 font-medium text-ink">{r.jersey}</td>
                  <td className="px-3 py-2 text-ink-muted">{r.nome}</td>
                  <td className="px-3 py-2 text-ink-muted">{r.posicao}</td>
                  <td className="px-3 py-2 text-ink-muted">{r.matricula}</td>
                  <td className="px-3 py-2 text-secondary">{r.starter ? <Icon name="check" className="h-4 w-4" /> : "—"}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemove(r.jersey)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-primary/10 hover:text-primary"
                      aria-label={`Remover ${r.nome}`}
                    >
                      <Icon name="x" className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm font-semibold text-ink">
          Total: {roster.length} atletas ({starterCount} titulares)
        </p>
        {!canConfirm && roster.length > 0 && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-warning">
            <Icon name="alert" className="h-4 w-4" />
            {hasEmptyNome && "Há atletas sem nome preenchido. "}
            {hasInvalidNumbers && "Há números de colete inválidos. "}
            {hasDuplicateJersey && "Há números de colete duplicados. "}
            {pendingAmbiguous.length > 0 && "Ainda há nomes ambíguos pendentes de resolução. "}
            {notFound.length > 0 && "Há atletas não encontrados no cadastro — informe a matrícula ou resolva o nome."}
          </p>
        )}
      </Card>

      <div className="flex flex-wrap gap-2">
        <PrimaryButton
          variant="secondary"
          disabled={pendingAmbiguous.length === 0 && notFound.length === 0}
          onClick={() => setResolved(true)}
        >
          Resolver Nomes
          {pendingAmbiguous.length + notFound.length > 0 && ` (${pendingAmbiguous.length + notFound.length})`}
        </PrimaryButton>
        <PrimaryButton disabled={!canConfirm} onClick={() => setStatus("Escalação confirmada e projetada.")}>
          Confirmar Escalação
        </PrimaryButton>
      </div>
      {status && (
        <p role="status" className="flex items-center gap-1.5 rounded-xl border border-secondary/30 bg-secondary/10 px-3 py-2 text-sm text-secondary">
          <Icon name="check" className="h-4 w-4" /> {status}
        </p>
      )}

      {(resolved || pendingAmbiguous.length > 0 || notFound.length > 0) && (
        <Card title="Resultado da Resolução">
          <div className="mb-4 flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-secondary">
              <Icon name="check" className="h-4 w-4" /> {statuses.filter((s) => s.status === "resolved").length} Resolvidos
            </span>
            <span className="flex items-center gap-1.5 text-warning">
              <Icon name="alert" className="h-4 w-4" /> {pendingAmbiguous.length} Ambíguos (precisa validação manual)
            </span>
            <span className="flex items-center gap-1.5 text-ink-muted">
              <Icon name="x" className="h-4 w-4" /> {notFound.length} Não encontrados
            </span>
          </div>

          {pendingAmbiguous.length === 0 && notFound.length === 0 ? (
            <p className="flex items-center gap-1.5 text-sm text-secondary">
              <Icon name="check" className="h-4 w-4" /> Todos os atletas foram resolvidos.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {pendingAmbiguous.map(({ row }) => {
                const match = ambiguousMatches.find((m) => m.nome === row.nome);
                if (!match) return null;
                return (
                  <fieldset key={row.jersey} className="rounded-xl border border-warning/30 bg-warning/5 p-3">
                    <legend className="px-1 text-sm font-medium text-ink">
                      Colete {row.jersey} — "{row.nome}" → Selecione:
                    </legend>
                    <div className="flex flex-col gap-1.5">
                      {match.opcoes.map((opt) => (
                        <label key={opt.id} className="flex items-center gap-2 text-sm text-ink">
                          <input
                            type="radio"
                            name={`ambig-${row.jersey}`}
                            className="h-4 w-4 border-line bg-surface-2 text-primary focus:ring-primary"
                            checked={selections[row.jersey] === opt.id}
                            onChange={() => setSelections({ ...selections, [row.jersey]: opt.id })}
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                );
              })}
              {notFound.length > 0 && (
                <p className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm text-primary-text">
                  <Icon name="alert" className="h-4 w-4 shrink-0" />
                  {notFound.map((s) => `Colete ${s.row.jersey} — "${s.row.nome}"`).join(", ")} não{" "}
                  {notFound.length === 1 ? "foi encontrado" : "foram encontrados"} no cadastro. Informe a matrícula do
                  atleta para confirmar.
                </p>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

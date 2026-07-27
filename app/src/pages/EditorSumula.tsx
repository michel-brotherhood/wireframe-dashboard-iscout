import { useState } from "react";
import { ambiguousMatches } from "../data/mockData";
import { Card, Field, PrimaryButton, inputClass } from "../components/ui";
import { Icon } from "../components/Icon";

const BLOCKED_JERSEYS = [24, 51, 69];

interface Row {
  jersey: number;
  nome: string;
  posicao: string;
  starter: boolean;
}

const initialRoster: Row[] = [
  { jersey: 1, nome: "João Silva", posicao: "Goleiro", starter: true },
  { jersey: 2, nome: "Maria Santos", posicao: "Lateral", starter: true },
  { jersey: 3, nome: "Pedro Costa", posicao: "Zagueiro", starter: true },
  { jersey: 4, nome: "Ana Silva", posicao: "Zagueira", starter: true },
  { jersey: 5, nome: "Carlos Oliveira", posicao: "Lateral", starter: true },
  { jersey: 6, nome: "Fernanda Costa", posicao: "Meia", starter: true },
  { jersey: 7, nome: "Bruno Silva", posicao: "Meia", starter: true },
  { jersey: 8, nome: "Juliana Santos", posicao: "Meia", starter: true },
  { jersey: 9, nome: "Ricardo Oliveira", posicao: "Atacante", starter: true },
  { jersey: 10, nome: "Beatriz Costa", posicao: "Atacante", starter: true },
  { jersey: 11, nome: "Gustavo Silva", posicao: "Atacante", starter: true },
];

export default function EditorSumula() {
  const [roster, setRoster] = useState<Row[]>(initialRoster);
  const [newJersey, setNewJersey] = useState("");
  const [newNome, setNewNome] = useState("");
  const [newStarter, setNewStarter] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);
  const [selections, setSelections] = useState<Record<number, string>>({});
  const [status, setStatus] = useState<string | null>(null);

  function handleAdd() {
    const jerseyNum = Number(newJersey);
    setError(null);

    if (!newJersey || !newNome.trim()) {
      setError("Preencha jersey e nome do jogador.");
      return;
    }
    if (jerseyNum < 1 || jerseyNum > 99) {
      setError("Jersey deve estar entre 1 e 99.");
      return;
    }
    if (BLOCKED_JERSEYS.includes(jerseyNum)) {
      setError(`Jersey ${jerseyNum} está bloqueado para uso.`);
      return;
    }
    if (roster.some((r) => r.jersey === jerseyNum)) {
      setError(`Jersey ${jerseyNum} já está em uso.`);
      return;
    }

    setRoster([...roster, { jersey: jerseyNum, nome: newNome.trim(), posicao: "—", starter: newStarter }]);
    setNewJersey("");
    setNewNome("");
    setNewStarter(true);
  }

  function handleRemove(jersey: number) {
    setRoster(roster.filter((r) => r.jersey !== jersey));
  }

  const starterCount = roster.filter((r) => r.starter).length;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-xl font-semibold text-ink sm:text-2xl">
        Criar Súmula — 02/07/2026 — Team Amarelo
      </h1>

      <Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Data" required>
            <input type="date" className={inputClass} defaultValue="2026-07-02" />
          </Field>
          <Field label="Team" required>
            <select className={inputClass} defaultValue="Amarelo">
              <option>Amarelo</option>
              <option>Azul</option>
            </select>
          </Field>
          <Field label="Event" required>
            <input className={inputClass} defaultValue="Take 1 - Campo 2" />
          </Field>
        </div>
      </Card>

      <Card title="Adicionar Jogador">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[120px_1fr_120px_auto] sm:items-end">
          <Field label="Jersey">
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
          <label className="mb-4 flex items-center gap-2 text-sm text-ink sm:mb-[13px]">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-line bg-surface-2 text-primary focus:ring-primary"
              checked={newStarter}
              onChange={(e) => setNewStarter(e.target.checked)}
            />
            Starter
          </label>
          <PrimaryButton onClick={handleAdd} className="mb-4 sm:mb-4">
            <Icon name="plus" className="h-4 w-4" /> Adicionar
          </PrimaryButton>
        </div>
        {error && (
          <p role="alert" className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
            <Icon name="alert" className="h-4 w-4" /> {error}
          </p>
        )}
      </Card>

      <Card title={`Escalação (${roster.length} jogadores)`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
                <th scope="col" className="px-3 py-2">Jersey</th>
                <th scope="col" className="px-3 py-2">Nome</th>
                <th scope="col" className="px-3 py-2">Posição</th>
                <th scope="col" className="px-3 py-2">Starter</th>
                <th scope="col" className="px-3 py-2 sr-only">Ação</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((r, i) => (
                <tr key={r.jersey} className={`border-b border-line-soft last:border-0 ${i % 2 === 1 ? "bg-surface-2/40" : ""}`}>
                  <td className="px-3 py-2 font-medium text-ink">{r.jersey}</td>
                  <td className="px-3 py-2 text-ink-muted">{r.nome}</td>
                  <td className="px-3 py-2 text-ink-muted">{r.posicao}</td>
                  <td className="px-3 py-2 text-secondary">{r.starter ? <Icon name="check" className="h-4 w-4" /> : "—"}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemove(r.jersey)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-primary/10 hover:text-primary"
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
          Total: {roster.length} jogadores ({starterCount} starters)
        </p>
      </Card>

      <div className="flex flex-wrap gap-2">
        <PrimaryButton variant="secondary" onClick={() => setResolved(true)}>
          Resolver Nomes
        </PrimaryButton>
        <PrimaryButton disabled={roster.length !== 11} onClick={() => setStatus("Escalação confirmada e projetada.")}>
          Confirmar Escalação
        </PrimaryButton>
      </div>
      {status && (
        <p role="status" className="flex items-center gap-1.5 rounded-xl border border-secondary/30 bg-secondary/10 px-3 py-2 text-sm text-secondary">
          <Icon name="check" className="h-4 w-4" /> {status}
        </p>
      )}

      {resolved && (
        <Card title="Resultado da Resolução">
          <div className="mb-4 flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-secondary">
              <Icon name="check" className="h-4 w-4" /> 9 Resolvidos
            </span>
            <span className="flex items-center gap-1.5 text-warning">
              <Icon name="alert" className="h-4 w-4" /> 2 Ambíguos (precisa validação manual)
            </span>
            <span className="flex items-center gap-1.5 text-ink-faint">
              <Icon name="x" className="h-4 w-4" /> 0 Não encontrados
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {ambiguousMatches.map((m) => (
              <fieldset key={m.jersey} className="rounded-xl border border-warning/30 bg-warning/5 p-3">
                <legend className="px-1 text-sm font-medium text-ink">
                  Jersey {m.jersey} — "{m.nome}" → Selecione:
                </legend>
                <div className="flex flex-col gap-1.5">
                  {m.opcoes.map((opt) => (
                    <label key={opt.id} className="flex items-center gap-2 text-sm text-ink">
                      <input
                        type="radio"
                        name={`ambig-${m.jersey}`}
                        className="h-4 w-4 border-line bg-surface-2 text-primary focus:ring-primary"
                        checked={selections[m.jersey] === opt.id}
                        onChange={() => setSelections({ ...selections, [m.jersey]: opt.id })}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>

          <div className="mt-4">
            <PrimaryButton disabled={Object.keys(selections).length < ambiguousMatches.length}>
              Confirmar Seleções
            </PrimaryButton>
          </div>
        </Card>
      )}
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Field, PrimaryButton, inputClass, inputErrorClass } from "../components/ui";
import { Icon } from "../components/Icon";
import { usePlanos } from "../state/PlanosContext";
import type { Categoria, EtapaFuncionamento, Phase, PlanoAula, TeamLabel, Turma } from "../types";

const TABS = ["1. Inicial", "2. Funcionamento", "3. Principal", "4. Observações"] as const;

const COORDENACAO_OPTIONS = ["Aquecimento Lúdico", "Aquecimento Técnico"];
const ESTACOES_OPTIONS = ["Com bola", "Sem bola", "Recreativo"];

// "Hoje" fixo do mundo mock (mesma data usada como padrão no filtro do Dashboard).
// Plano precisa ser criado com pelo menos 24h de antecedência da sessão.
const HOJE_MOCK = "2026-07-02";
const MIN_DATA = "2026-07-03";

// Prazo de envio/aprovação: véspera da sessão, 18h — mesma convenção usada
// nos dados mock da fila de Aprovações.
function deadlineFor(sessionDate: string) {
  const d = new Date(`${sessionDate}T00:00:00`);
  d.setDate(d.getDate() - 1);
  const iso = d.toISOString().slice(0, 10);
  return `${iso}T18:00:00`;
}

function DiagramUpload() {
  return (
    <div className="mb-4">
      <span className="mb-1 block text-sm font-medium text-ink-muted">Diagrama de Campo</span>
      <div className="flex flex-wrap gap-2">
        <PrimaryButton variant="secondary">
          <Icon name="upload" className="h-4 w-4" /> Upload Diagrama
        </PrimaryButton>
        <PrimaryButton variant="secondary">
          <Icon name="edit" className="h-4 w-4" /> Desenhar no Editor
        </PrimaryButton>
      </div>
      <div className="mt-2 flex h-32 w-full max-w-xs items-center justify-center rounded-xl border-2 border-dashed border-line bg-surface-2/50 text-xs uppercase tracking-wide text-ink-muted sm:h-40 sm:w-72">
        Imagem do diagrama · 300×300px
      </div>
    </div>
  );
}

function Checklist({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (opt: string) => void;
}) {
  return (
    <fieldset className="mb-4">
      <legend className="mb-1 text-sm font-medium text-ink-muted">{label}</legend>
      <div className="flex flex-col gap-1.5">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-line bg-surface-2 text-primary focus:ring-primary"
              checked={selected.includes(opt)}
              onChange={() => onToggle(opt)}
            />
            {opt}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function DynamicList({
  label,
  addLabel,
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  label: string;
  addLabel: string;
  items: string[];
  onAdd: () => void;
  onUpdate: (idx: number, value: string) => void;
  onRemove: (idx: number) => void;
}) {
  return (
    <div className="mb-4">
      <span className="mb-1 block text-sm font-medium text-ink-muted">{label}</span>
      {items.map((v, i) => (
        <div key={i} className="mb-2 flex items-center gap-2">
          <input
            className={inputClass}
            value={v}
            aria-label={`${label} ${i + 1}`}
            onChange={(e) => onUpdate(i, e.target.value)}
          />
          <button
            type="button"
            onClick={() => onRemove(i)}
            aria-label={`Remover ${label.toLowerCase()} ${i + 1}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-muted hover:bg-primary/10 hover:text-primary"
          >
            <Icon name="x" className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button type="button" className="flex items-center gap-1 text-sm font-medium text-primary-text" onClick={onAdd}>
        <Icon name="plus" className="h-3.5 w-3.5" /> {addLabel}
      </button>
    </div>
  );
}

let novoPlanoSeq = 1;

export default function EditorPlano() {
  const navigate = useNavigate();
  const { addPlano } = usePlanos();
  const [tab, setTab] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [statusIsError, setStatusIsError] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [data, setData] = useState("2026-07-03");
  const [unidade] = useState("Atibaia");
  const [categoria, setCategoria] = useState("Sub-15");
  const [turma, setTurma] = useState("Turma A");
  const [team, setTeam] = useState("Amarelo");
  const [fase, setFase] = useState("Ofensiva");

  const [inicialObjetivo, setInicialObjetivo] = useState("Refinamento do gesto motor");
  const [inicialDuracao, setInicialDuracao] = useState(10);
  const [coordenacao, setCoordenacao] = useState<string[]>(["Aquecimento Lúdico"]);
  const [estacoes, setEstacoes] = useState<string[]>(["Com bola", "Sem bola", "Recreativo"]);

  const [funcObjetivo, setFuncObjetivo] = useState("Função no modelo de jogo");
  const [funcDuracao, setFuncDuracao] = useState(15);
  const [funcTipo, setFuncTipo] = useState("Analítico");
  const [funcTema, setFuncTema] = useState("Passe Curto");

  const [principalObjetivo, setPrincipalObjetivo] = useState("Função no modelo de jogo");
  const [principalDuracao, setPrincipalDuracao] = useState(35);
  const [subTemas, setSubTemas] = useState(["Projeção em Campo", "Criação de Espaços"]);
  const [orientacoes, setOrientacoes] = useState(["Jogo Posicional", "Respeito aos Setores"]);
  const [hidratacao, setHidratacao] = useState(5);
  const [repouso, setRepouso] = useState(2);
  const [instruir, setInstruir] = useState(3);
  const [ativar, setAtivar] = useState(2);

  const [observacoes, setObservacoes] = useState(
    "Treino focado em passe curto e posicionamento\nAtenção especial ao intervalo para hidratação",
  );

  const total = inicialDuracao + funcDuracao + principalDuracao;

  function toggleFrom(list: string[], setList: (v: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  }

  function addItem(list: string[], setList: (v: string[]) => void) {
    setList([...list, ""]);
  }

  function updateItem(list: string[], setList: (v: string[]) => void, idx: number, value: string) {
    setList(list.map((v, i) => (i === idx ? value : v)));
  }

  function removeItem(list: string[], setList: (v: string[]) => void, idx: number) {
    setList(list.filter((_, i) => i !== idx));
  }

  function clearError(field: string) {
    setErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validateHeader(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!data) e.data = "Informe a data da sessão.";
    else if (data < MIN_DATA) e.data = `Plano deve ser criado com 24h de antecedência (a partir de ${MIN_DATA}).`;
    return e;
  }

  function validateTab(idx: number): Record<string, string> {
    const e: Record<string, string> = {};
    if (idx === 0) {
      if (!inicialObjetivo.trim()) e.inicialObjetivo = "Objetivo é obrigatório.";
      if (!inicialDuracao || inicialDuracao <= 0) e.inicialDuracao = "Duração deve ser maior que 0.";
    }
    if (idx === 1) {
      if (!funcObjetivo.trim()) e.funcObjetivo = "Objetivo é obrigatório.";
      if (!funcDuracao || funcDuracao <= 0) e.funcDuracao = "Duração deve ser maior que 0.";
      if (!funcTema.trim()) e.funcTema = "Tema é obrigatório.";
    }
    if (idx === 2) {
      if (!principalObjetivo.trim()) e.principalObjetivo = "Objetivo é obrigatório.";
      if (!principalDuracao || principalDuracao <= 0) e.principalDuracao = "Duração deve ser maior que 0.";
    }
    return e;
  }

  function goToNext(nextTab: number) {
    const tabErrors = validateTab(tab);
    if (Object.keys(tabErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...tabErrors }));
      return;
    }
    setTab(nextTab);
  }

  function handleSubmit() {
    const allErrors = { ...validateHeader(), ...validateTab(0), ...validateTab(1), ...validateTab(2) };
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      const firstInvalidTab = [0, 1, 2].find((i) => Object.keys(validateTab(i)).length > 0);
      if (allErrors.data) {
        setTab(0);
      } else if (firstInvalidTab !== undefined) {
        setTab(firstInvalidTab);
      }
      setStatusIsError(true);
      setJustSubmitted(false);
      setStatus("Corrija os campos obrigatórios destacados antes de submeter.");
      return;
    }
    if (total < 30 || total > 120) {
      setStatusIsError(true);
      setJustSubmitted(false);
      setStatus("Duração total precisa ficar entre 30 e 120 minutos antes de submeter.");
      return;
    }

    const novoPlano: PlanoAula = {
      id: `plan-novo-${novoPlanoSeq++}`,
      sessionDate: data,
      unidade,
      categoria: categoria as Categoria,
      turma: turma as Turma,
      team: team as TeamLabel,
      coachName: team === "Amarelo" ? "João Silva" : "Maria Santos",
      fase: fase as Phase,
      status: "submitted",
      deadlineAt: deadlineFor(data),
      etapaInicial: { objetivo: inicialObjetivo, duracaoMin: inicialDuracao, coordenacao, estacoes },
      etapaFuncionamento: {
        objetivo: funcObjetivo,
        duracaoMin: funcDuracao,
        tipo: funcTipo as EtapaFuncionamento["tipo"],
        tema: funcTema,
      },
      etapaPrincipal: {
        objetivo: principalObjetivo,
        duracaoMin: principalDuracao,
        subTemas,
        orientacoes,
        intervalo: { hidratacaoMin: hidratacao, repousoMin: repouso, instruirMin: instruir, ativarMin: ativar },
      },
      observacoes,
      createdAt: new Date().toISOString(),
    };
    addPlano(novoPlano);

    setStatusIsError(false);
    setJustSubmitted(true);
    setStatus("Plano submetido para aprovação.");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-ink sm:text-2xl">
          Criar Novo Plano de Aula
        </h1>
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Data" required error={errors.data} hint={!errors.data ? `Mínimo: ${MIN_DATA} (24h após ${HOJE_MOCK})` : undefined}>
            <input
              type="date"
              min={MIN_DATA}
              className={errors.data ? inputErrorClass : inputClass}
              value={data}
              onChange={(e) => {
                setData(e.target.value);
                clearError("data");
              }}
            />
          </Field>
          <Field label="Unidade" required hint="Única unidade cadastrada nesta demonstração.">
            <select className={inputClass} value={unidade} disabled>
              <option>Atibaia</option>
            </select>
          </Field>
          <Field label="Categoria" required>
            <select className={inputClass} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              <option>Sub-15</option>
              <option>Sub-17</option>
              <option>Sub-20</option>
            </select>
          </Field>
          <Field label="Turma" required>
            <select className={inputClass} value={turma} onChange={(e) => setTurma(e.target.value)}>
              <option>Turma A</option>
              <option>Turma B</option>
            </select>
          </Field>
          <Field label="Team (colete)" required hint="Cor do colete — usada na súmula, não é o agrupamento da turma.">
            <select className={inputClass} value={team} onChange={(e) => setTeam(e.target.value)}>
              <option>Amarelo</option>
              <option>Azul</option>
            </select>
          </Field>
          <Field label="Fase" required>
            <select className={inputClass} value={fase} onChange={(e) => setFase(e.target.value)}>
              <option>Ofensiva</option>
              <option>Defensiva</option>
            </select>
          </Field>
        </div>
      </Card>

      <div role="tablist" aria-label="Etapas do plano" className="flex flex-wrap gap-1 rounded-2xl border border-line bg-surface p-1">
        {TABS.map((t, i) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === i}
            onClick={() => setTab(i)}
            className={`flex-1 min-w-[120px] rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
              tab === i ? "bg-primary-hover text-white" : "text-ink-muted hover:bg-surface-2 hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {status && (
        <p
          role="status"
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm ${
            statusIsError
              ? "border-primary/30 bg-primary/10 text-primary-text"
              : "border-secondary/30 bg-secondary/10 text-secondary"
          }`}
        >
          <Icon name={statusIsError ? "alert" : "check"} className="h-4 w-4" /> {status}
          {justSubmitted && (
            <button
              type="button"
              onClick={() => navigate("/planos/aprovacao")}
              className="ml-1 font-medium underline underline-offset-2"
            >
              Ver fila de aprovação →
            </button>
          )}
        </p>
      )}

      {tab === 0 && (
        <Card title="Aba 1 · Etapa Inicial (Aquecimento)">
          <Field label="Objetivo" required error={errors.inicialObjetivo}>
            <input
              className={errors.inicialObjetivo ? inputErrorClass : inputClass}
              value={inicialObjetivo}
              onChange={(e) => {
                setInicialObjetivo(e.target.value);
                clearError("inicialObjetivo");
              }}
            />
          </Field>
          <Field label="Duração (minutos)" required error={errors.inicialDuracao}>
            <input
              type="number"
              min={1}
              className={errors.inicialDuracao ? inputErrorClass : inputClass}
              value={inicialDuracao}
              onChange={(e) => {
                setInicialDuracao(Number(e.target.value));
                clearError("inicialDuracao");
              }}
            />
          </Field>
          <Checklist
            label="Coordenação (selecione)"
            options={COORDENACAO_OPTIONS}
            selected={coordenacao}
            onToggle={(opt) => toggleFrom(coordenacao, setCoordenacao, opt)}
          />
          <Checklist
            label="Estações (selecione)"
            options={ESTACOES_OPTIONS}
            selected={estacoes}
            onToggle={(opt) => toggleFrom(estacoes, setEstacoes, opt)}
          />
          <DiagramUpload />
          <div className="flex justify-end">
            <PrimaryButton onClick={() => goToNext(1)}>
              Próximo <Icon name="arrowRight" className="h-4 w-4" />
            </PrimaryButton>
          </div>
        </Card>
      )}

      {tab === 1 && (
        <Card title="Aba 2 · Etapa Funcionamento">
          <Field label="Objetivo" required error={errors.funcObjetivo}>
            <input
              className={errors.funcObjetivo ? inputErrorClass : inputClass}
              value={funcObjetivo}
              onChange={(e) => {
                setFuncObjetivo(e.target.value);
                clearError("funcObjetivo");
              }}
            />
          </Field>
          <Field label="Duração (minutos)" required error={errors.funcDuracao}>
            <input
              type="number"
              min={1}
              className={errors.funcDuracao ? inputErrorClass : inputClass}
              value={funcDuracao}
              onChange={(e) => {
                setFuncDuracao(Number(e.target.value));
                clearError("funcDuracao");
              }}
            />
          </Field>
          <fieldset className="mb-4">
            <legend className="mb-1 text-sm font-medium text-ink-muted">Tipo de Exercício *</legend>
            <div className="flex flex-wrap gap-4">
              {["Analítico", "Global", "Situacional"].map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="radio"
                    name="tipo-exercicio"
                    className="h-4 w-4 border-line bg-surface-2 text-primary focus:ring-primary"
                    checked={funcTipo === opt}
                    onChange={() => setFuncTipo(opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </fieldset>
          <Field label="Tema" required error={errors.funcTema}>
            <input
              className={errors.funcTema ? inputErrorClass : inputClass}
              value={funcTema}
              onChange={(e) => {
                setFuncTema(e.target.value);
                clearError("funcTema");
              }}
            />
          </Field>
          <DiagramUpload />
          <div className="flex justify-between">
            <PrimaryButton variant="secondary" onClick={() => setTab(0)}>
              <Icon name="arrowLeft" className="h-4 w-4" /> Anterior
            </PrimaryButton>
            <PrimaryButton onClick={() => goToNext(2)}>
              Próximo <Icon name="arrowRight" className="h-4 w-4" />
            </PrimaryButton>
          </div>
        </Card>
      )}

      {tab === 2 && (
        <Card title="Aba 3 · Etapa Principal">
          <Field label="Objetivo" required error={errors.principalObjetivo}>
            <input
              className={errors.principalObjetivo ? inputErrorClass : inputClass}
              value={principalObjetivo}
              onChange={(e) => {
                setPrincipalObjetivo(e.target.value);
                clearError("principalObjetivo");
              }}
            />
          </Field>
          <Field label="Duração (minutos)" required error={errors.principalDuracao}>
            <input
              type="number"
              min={1}
              className={errors.principalDuracao ? inputErrorClass : inputClass}
              value={principalDuracao}
              onChange={(e) => {
                setPrincipalDuracao(Number(e.target.value));
                clearError("principalDuracao");
              }}
            />
          </Field>

          <DynamicList
            label="Sub-temas (adicione)"
            addLabel="Adicionar outro"
            items={subTemas}
            onAdd={() => addItem(subTemas, setSubTemas)}
            onUpdate={(i, v) => updateItem(subTemas, setSubTemas, i, v)}
            onRemove={(i) => removeItem(subTemas, setSubTemas, i)}
          />

          <DynamicList
            label="Orientações (adicione)"
            addLabel="Adicionar outra"
            items={orientacoes}
            onAdd={() => addItem(orientacoes, setOrientacoes)}
            onUpdate={(i, v) => updateItem(orientacoes, setOrientacoes, i, v)}
            onRemove={(i) => removeItem(orientacoes, setOrientacoes, i)}
          />

          <div className="mb-4">
            <span className="mb-2 block text-sm font-medium text-ink-muted">Protocolo de Intervalo</span>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field label="Hidratação (min)">
                <input type="number" className={inputClass} value={hidratacao} onChange={(e) => setHidratacao(Number(e.target.value))} />
              </Field>
              <Field label="Repouso (min)">
                <input type="number" className={inputClass} value={repouso} onChange={(e) => setRepouso(Number(e.target.value))} />
              </Field>
              <Field label="Instruir (min)">
                <input type="number" className={inputClass} value={instruir} onChange={(e) => setInstruir(Number(e.target.value))} />
              </Field>
              <Field label="Ativar (min)">
                <input type="number" className={inputClass} value={ativar} onChange={(e) => setAtivar(Number(e.target.value))} />
              </Field>
            </div>
          </div>

          <DiagramUpload />
          <div className="flex justify-between">
            <PrimaryButton variant="secondary" onClick={() => setTab(1)}>
              <Icon name="arrowLeft" className="h-4 w-4" /> Anterior
            </PrimaryButton>
            <PrimaryButton onClick={() => goToNext(3)}>
              Próximo <Icon name="arrowRight" className="h-4 w-4" />
            </PrimaryButton>
          </div>
        </Card>
      )}

      {tab === 3 && (
        <Card title="Aba 4 · Observações">
          <Field label="Observações Gerais">
            <textarea
              className={`${inputClass} min-h-[120px]`}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </Field>

          <div className="mb-4 flex items-center justify-between rounded-xl border border-line-soft bg-surface-2 px-3 py-2 text-sm">
            <span className="font-medium text-ink-muted">Total Planejado</span>
            <span className={`flex items-center gap-1.5 font-semibold ${total >= 30 && total <= 120 ? "text-secondary" : "text-primary-text"}`}>
              {total} minutos
              {total >= 30 && total <= 120 ? (
                <Icon name="check" className="h-4 w-4" />
              ) : (
                <span className="inline-flex items-center gap-1">
                  <Icon name="alert" className="h-4 w-4" /> fora do intervalo 30–120min
                </span>
              )}
            </span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <PrimaryButton variant="secondary" onClick={() => setTab(2)}>
              <Icon name="arrowLeft" className="h-4 w-4" /> Anterior
            </PrimaryButton>
            <div className="flex flex-col gap-2 sm:flex-row">
              <PrimaryButton
                variant="secondary"
                onClick={() => {
                  setStatusIsError(false);
                  setJustSubmitted(false);
                  setStatus("Plano salvo como draft.");
                }}
              >
                Salvar como Draft
              </PrimaryButton>
              <PrimaryButton onClick={handleSubmit}>Submeter para Aprovação</PrimaryButton>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

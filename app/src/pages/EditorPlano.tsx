import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Field, IntervaloFlow, PrimaryButton, inputClass, inputErrorClass } from "../components/ui";
import { Icon } from "../components/Icon";
import { usePlanos } from "../state/PlanosContext";
import { calcDeadline, diaDaSemana, FASE_TEMAS, NOW_MOCK, prazoLabel } from "../data/mockData";
import type { Categoria, Estacao, Phase, PlanoAula, TeamLabel, TipoEstacao, Turma } from "../types";

const TABS = ["1. Inicial", "2. Fundamentação", "3. Principal", "4. Observações"] as const;

const COACHES = ["João Silva", "Maria Santos"];
const PERIODOS = ["Manhã", "Tarde", "Noite"];
const SEMANAS = ["Semana 1", "Semana 2", "Semana 3", "Semana 4"];
const FASES = Object.keys(FASE_TEMAS) as Phase[];
const CATEGORIAS: Categoria[] = ["Sub-13", "Sub-15", "Sub-17", "Sub-20"];
const TURMAS: Turma[] = ["Turma A", "Turma B"];
const TIPOS_ESTACAO: TipoEstacao[] = ["Simples", "Com bola", "Recreativo"];

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} às ${String(
    d.getHours(),
  ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
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

function EstacaoForm({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Estacao;
  onChange: (patch: Partial<Estacao>) => void;
}) {
  return (
    <div className="mb-4 rounded-xl border border-line-soft bg-surface-2 p-3">
      <p className="mb-3 text-sm font-semibold text-ink">{label}</p>
      <Field label="Nome" required>
        <input className={inputClass} value={value.nome} onChange={(e) => onChange({ nome: e.target.value })} />
      </Field>
      <Field label="Tipo" required>
        <select className={inputClass} value={value.tipo} onChange={(e) => onChange({ tipo: e.target.value as TipoEstacao })}>
          {TIPOS_ESTACAO.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>
      <Field label="Descrição">
        <input className={inputClass} value={value.descricao} onChange={(e) => onChange({ descricao: e.target.value })} />
      </Field>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Duração (minutos)" required>
          <input
            type="number"
            min={1}
            className={inputClass}
            value={value.duracaoMin}
            onChange={(e) => onChange({ duracaoMin: Number(e.target.value) })}
          />
        </Field>
        <Field label="Materiais">
          <input className={inputClass} value={value.materiais} onChange={(e) => onChange({ materiais: e.target.value })} />
        </Field>
      </div>
      <DiagramUpload />
    </div>
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
  const [horario, setHorario] = useState("16:00");
  const [unidade] = useState("Atibaia");
  const [periodo, setPeriodo] = useState("Tarde");
  const [semana, setSemana] = useState("Semana 1");
  const [categoria, setCategoria] = useState<Categoria>("Sub-15");
  const [turma, setTurma] = useState<Turma>("Turma A");
  const [coachName, setCoachName] = useState(COACHES[0]);
  const [team, setTeam] = useState<TeamLabel>("Amarelo");
  const [fase, setFase] = useState<Phase>(FASES[0]);
  const [tema, setTema] = useState(FASE_TEMAS[FASES[0]][0].tema);
  const [subtema, setSubtema] = useState(FASE_TEMAS[FASES[0]][0].subtemas[0]);

  const [inicialObjetivo, setInicialObjetivo] = useState("Refinamento do gesto motor");
  const [estacao1, setEstacao1] = useState<Estacao>({
    nome: "Aquecimento Lúdico com Bola",
    tipo: "Com bola",
    descricao: "Jogos lúdicos de ativação com bola, foco em coordenação óculo-pedal.",
    duracaoMin: 5,
    materiais: "Bolas, coletes",
  });
  const [estacao2, setEstacao2] = useState<Estacao>({
    nome: "Circuito Recreativo Sem Bola",
    tipo: "Recreativo",
    descricao: "Circuito de agilidade e coordenação motora sem bola.",
    duracaoMin: 5,
    materiais: "Cones, escada de agilidade",
  });

  const [fundObjetivo, setFundObjetivo] = useState("Função no modelo de jogo");
  const [fundDuracao, setFundDuracao] = useState(15);
  const [fundTipo, setFundTipo] = useState("Analítico");

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

  const inicialDuracao = estacao1.duracaoMin + estacao2.duracaoMin;
  const total = inicialDuracao + fundDuracao + principalDuracao;

  const temaOptions = FASE_TEMAS[fase];
  const subtemaOptions = temaOptions.find((t) => t.tema === tema)?.subtemas ?? [];

  const deadline = data && horario ? calcDeadline(data, horario) : null;
  const prazo = deadline ? prazoLabel(deadline) : null;

  function handleFaseChange(newFase: Phase) {
    setFase(newFase);
    const first = FASE_TEMAS[newFase][0];
    setTema(first.tema);
    setSubtema(first.subtemas[0]);
  }

  function handleTemaChange(newTema: string) {
    setTema(newTema);
    const subtemas = temaOptions.find((t) => t.tema === newTema)?.subtemas ?? [];
    setSubtema(subtemas[0] ?? "");
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
    if (!horario) e.horario = "Informe o horário da sessão.";
    if (data && horario) {
      const dl = calcDeadline(data, horario);
      if (dl < NOW_MOCK) {
        e.data = `Prazo de 24h já vencido para esse horário — prazo limite seria ${formatDateTime(dl)}.`;
      }
    }
    return e;
  }

  function validateTab(idx: number): Record<string, string> {
    const e: Record<string, string> = {};
    if (idx === 0) {
      if (!inicialObjetivo.trim()) e.inicialObjetivo = "Objetivo é obrigatório.";
      if (!estacao1.nome.trim()) e.estacao1Nome = "Nome da Estação 1 é obrigatório.";
      if (!estacao1.duracaoMin || estacao1.duracaoMin <= 0) e.estacao1Duracao = "Duração da Estação 1 deve ser maior que 0.";
      if (!estacao2.nome.trim()) e.estacao2Nome = "Nome da Estação 2 é obrigatório.";
      if (!estacao2.duracaoMin || estacao2.duracaoMin <= 0) e.estacao2Duracao = "Duração da Estação 2 deve ser maior que 0.";
    }
    if (idx === 1) {
      if (!fundObjetivo.trim()) e.fundObjetivo = "Objetivo é obrigatório.";
      if (!fundDuracao || fundDuracao <= 0) e.fundDuracao = "Duração deve ser maior que 0.";
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
      if (allErrors.data || allErrors.horario) {
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
      horario,
      unidade,
      categoria,
      turma,
      team,
      coachName,
      fase,
      tema,
      subtema,
      status: "submitted",
      deadlineAt: calcDeadline(data, horario),
      etapaInicial: { objetivo: inicialObjetivo, duracaoMin: inicialDuracao, estacao1, estacao2 },
      etapaFundamentacao: { objetivo: fundObjetivo, duracaoMin: fundDuracao, tipo: fundTipo as "Analítico" | "Global" | "Situacional" },
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

      <Card title="Dados da Sessão" icon={<Icon name="calendar" className="h-4 w-4" />}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Data" required error={errors.data}>
            <input
              type="date"
              className={errors.data ? inputErrorClass : inputClass}
              value={data}
              onChange={(e) => {
                setData(e.target.value);
                clearError("data");
              }}
            />
          </Field>
          <Field label="Horário" required error={errors.horario}>
            <input
              type="time"
              className={errors.horario ? inputErrorClass : inputClass}
              value={horario}
              onChange={(e) => {
                setHorario(e.target.value);
                clearError("horario");
              }}
            />
          </Field>
          <Field label="Dia da Semana" hint="Calculado a partir da data.">
            <input className={inputClass} value={data ? diaDaSemana(data) : "-"} disabled />
          </Field>

          <Field label="Unidade" required>
            <select className={inputClass} value={unidade} disabled>
              <option>Atibaia</option>
            </select>
          </Field>
          <Field label="Período" required>
            <select className={inputClass} value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
              {PERIODOS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Semana" required>
            <select className={inputClass} value={semana} onChange={(e) => setSemana(e.target.value)}>
              {SEMANAS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>

          <Field label="Categoria" required>
            <select className={inputClass} value={categoria} onChange={(e) => setCategoria(e.target.value as Categoria)}>
              {CATEGORIAS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Turma" required>
            <select className={inputClass} value={turma} onChange={(e) => setTurma(e.target.value as Turma)}>
              {TURMAS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Treinador Responsável" required hint="Selecionado explicitamente — não é definido pela cor do colete.">
            <select className={inputClass} value={coachName} onChange={(e) => setCoachName(e.target.value)}>
              {COACHES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="Fase do Jogo" required>
            <select className={inputClass} value={fase} onChange={(e) => handleFaseChange(e.target.value as Phase)}>
              {FASES.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </Field>
          <Field label="Tema" required>
            <select className={inputClass} value={tema} onChange={(e) => handleTemaChange(e.target.value)}>
              {temaOptions.map((t) => (
                <option key={t.tema}>{t.tema}</option>
              ))}
            </select>
          </Field>
          <Field label="Subtema" required>
            <select className={inputClass} value={subtema} onChange={(e) => setSubtema(e.target.value)}>
              {subtemaOptions.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line-soft bg-surface-2 px-3 py-2 text-sm">
          <span className="text-ink-muted">
            Duração Total: <span className="font-semibold text-ink">{total} min</span>
          </span>
          {prazo && (
            <span className="text-ink-muted">
              Prazo limite (sessão − 24h): <span className="font-medium text-ink">{formatDateTime(deadline as string)}</span> ·{" "}
              <span className={`font-semibold ${prazo.tone}`}>{prazo.text}</span>
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-ink-muted">
          <span>Cor do colete (uso na súmula):</span>
          <select
            className="rounded-lg border border-line bg-surface-2 px-2 py-1 text-xs text-ink [color-scheme:dark]"
            value={team}
            onChange={(e) => setTeam(e.target.value as TeamLabel)}
          >
            <option>Amarelo</option>
            <option>Azul</option>
          </select>
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
          <p className="mb-4 text-sm text-ink-muted">
            Duração da etapa (soma das estações): <span className="font-semibold text-ink">{inicialDuracao} min</span>
          </p>
          <EstacaoForm
            label="Estação 1"
            value={estacao1}
            onChange={(patch) => {
              setEstacao1((prev) => ({ ...prev, ...patch }));
              clearError("estacao1Nome");
              clearError("estacao1Duracao");
            }}
          />
          <EstacaoForm
            label="Estação 2"
            value={estacao2}
            onChange={(patch) => {
              setEstacao2((prev) => ({ ...prev, ...patch }));
              clearError("estacao2Nome");
              clearError("estacao2Duracao");
            }}
          />
          <div className="flex justify-end">
            <PrimaryButton onClick={() => goToNext(1)}>
              Próximo <Icon name="arrowRight" className="h-4 w-4" />
            </PrimaryButton>
          </div>
        </Card>
      )}

      {tab === 1 && (
        <Card title="Aba 2 · Etapa de Fundamentação">
          <Field label="Objetivo" required error={errors.fundObjetivo}>
            <input
              className={errors.fundObjetivo ? inputErrorClass : inputClass}
              value={fundObjetivo}
              onChange={(e) => {
                setFundObjetivo(e.target.value);
                clearError("fundObjetivo");
              }}
            />
          </Field>
          <Field label="Duração (minutos)" required error={errors.fundDuracao}>
            <input
              type="number"
              min={1}
              className={errors.fundDuracao ? inputErrorClass : inputClass}
              value={fundDuracao}
              onChange={(e) => {
                setFundDuracao(Number(e.target.value));
                clearError("fundDuracao");
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
                    checked={fundTipo === opt}
                    onChange={() => setFundTipo(opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </fieldset>
          <p className="mb-4 text-sm text-ink-muted">
            Tema e subtema desta sessão são definidos no cabeçalho ({tema} · {subtema}).
          </p>
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
            <div className="mb-3">
              <IntervaloFlow />
            </div>
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
                  setStatus("Plano salvo como rascunho.");
                }}
              >
                Salvar como Rascunho
              </PrimaryButton>
              <PrimaryButton onClick={handleSubmit}>Submeter para Aprovação</PrimaryButton>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

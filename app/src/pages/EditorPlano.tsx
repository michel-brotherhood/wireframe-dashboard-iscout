import { useState } from "react";
import { Card, Field, PrimaryButton, inputClass } from "../components/ui";

const TABS = ["1. Inicial", "2. Funcionamento", "3. Principal", "4. Observações"] as const;

const COORDENACAO_OPTIONS = ["Aquecimento Lúdico", "Aquecimento Técnico"];
const ESTACOES_OPTIONS = ["Com bola", "Sem bola", "Recreativo"];

function DiagramUpload() {
  return (
    <div className="mb-4">
      <span className="mb-1 block text-sm font-medium text-gray-700">Diagrama de Campo</span>
      <div className="flex flex-wrap gap-2">
        <PrimaryButton variant="secondary">Upload Diagrama</PrimaryButton>
        <PrimaryButton variant="secondary">Desenhar no Editor</PrimaryButton>
      </div>
      <div className="mt-2 flex h-32 w-full max-w-xs items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400 sm:h-40 sm:w-72">
        Imagem do diagrama (300×300px)
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
      <legend className="mb-1 text-sm font-medium text-gray-700">{label}</legend>
      <div className="flex flex-col gap-1.5">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
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

export default function EditorPlano() {
  const [tab, setTab] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  const [data, setData] = useState("2026-07-03");
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-xl font-semibold text-gray-900 sm:text-2xl">
          Criar Novo Plano de Aula
        </h1>
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Data" required>
            <input type="date" className={inputClass} value={data} onChange={(e) => setData(e.target.value)} />
          </Field>
          <Field label="Team" required>
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

      <div role="tablist" aria-label="Etapas do plano" className="flex flex-wrap gap-1 rounded-xl border border-gray-200 bg-white p-1">
        {TABS.map((t, i) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === i}
            onClick={() => setTab(i)}
            className={`flex-1 min-w-[120px] rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              tab === i ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <Card title="Aba 1 · Etapa Inicial (Aquecimento)">
          <Field label="Objetivo" required>
            <input className={inputClass} value={inicialObjetivo} onChange={(e) => setInicialObjetivo(e.target.value)} />
          </Field>
          <Field label="Duração (minutos)" required>
            <input
              type="number"
              min={1}
              className={inputClass}
              value={inicialDuracao}
              onChange={(e) => setInicialDuracao(Number(e.target.value))}
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
            <PrimaryButton onClick={() => setTab(1)}>Próximo →</PrimaryButton>
          </div>
        </Card>
      )}

      {tab === 1 && (
        <Card title="Aba 2 · Etapa Funcionamento">
          <Field label="Objetivo" required>
            <input className={inputClass} value={funcObjetivo} onChange={(e) => setFuncObjetivo(e.target.value)} />
          </Field>
          <Field label="Duração (minutos)" required>
            <input
              type="number"
              min={1}
              className={inputClass}
              value={funcDuracao}
              onChange={(e) => setFuncDuracao(Number(e.target.value))}
            />
          </Field>
          <fieldset className="mb-4">
            <legend className="mb-1 text-sm font-medium text-gray-700">Tipo de Exercício *</legend>
            <div className="flex flex-wrap gap-4">
              {["Analítico", "Global", "Situacional"].map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="tipo-exercicio"
                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                    checked={funcTipo === opt}
                    onChange={() => setFuncTipo(opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </fieldset>
          <Field label="Tema" required>
            <input className={inputClass} value={funcTema} onChange={(e) => setFuncTema(e.target.value)} />
          </Field>
          <DiagramUpload />
          <div className="flex justify-between">
            <PrimaryButton variant="secondary" onClick={() => setTab(0)}>
              ← Anterior
            </PrimaryButton>
            <PrimaryButton onClick={() => setTab(2)}>Próximo →</PrimaryButton>
          </div>
        </Card>
      )}

      {tab === 2 && (
        <Card title="Aba 3 · Etapa Principal">
          <Field label="Objetivo" required>
            <input className={inputClass} value={principalObjetivo} onChange={(e) => setPrincipalObjetivo(e.target.value)} />
          </Field>
          <Field label="Duração (minutos)" required>
            <input
              type="number"
              min={1}
              className={inputClass}
              value={principalDuracao}
              onChange={(e) => setPrincipalDuracao(Number(e.target.value))}
            />
          </Field>

          <div className="mb-4">
            <span className="mb-1 block text-sm font-medium text-gray-700">Sub-temas (adicione)</span>
            {subTemas.map((v, i) => (
              <input
                key={i}
                className={`${inputClass} mb-2`}
                value={v}
                onChange={(e) => updateItem(subTemas, setSubTemas, i, e.target.value)}
              />
            ))}
            <button type="button" className="text-sm font-medium text-primary" onClick={() => addItem(subTemas, setSubTemas)}>
              + Adicionar outro
            </button>
          </div>

          <div className="mb-4">
            <span className="mb-1 block text-sm font-medium text-gray-700">Orientações (adicione)</span>
            {orientacoes.map((v, i) => (
              <input
                key={i}
                className={`${inputClass} mb-2`}
                value={v}
                onChange={(e) => updateItem(orientacoes, setOrientacoes, i, e.target.value)}
              />
            ))}
            <button
              type="button"
              className="text-sm font-medium text-primary"
              onClick={() => addItem(orientacoes, setOrientacoes)}
            >
              + Adicionar outra
            </button>
          </div>

          <div className="mb-4">
            <span className="mb-2 block text-sm font-medium text-gray-700">Protocolo de Intervalo</span>
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
              ← Anterior
            </PrimaryButton>
            <PrimaryButton onClick={() => setTab(3)}>Próximo →</PrimaryButton>
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

          <div className="mb-4 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
            <span className="font-medium text-gray-700">Total Planejado</span>
            <span className={`font-semibold ${total >= 30 && total <= 120 ? "text-emerald-600" : "text-danger"}`}>
              {total} minutos {total >= 30 && total <= 120 ? "✓" : "⚠️ fora do intervalo 30–120min"}
            </span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <PrimaryButton variant="secondary" onClick={() => setTab(2)}>
              ← Anterior
            </PrimaryButton>
            <div className="flex flex-col gap-2 sm:flex-row">
              <PrimaryButton variant="secondary" onClick={() => setStatus("Plano salvo como draft.")}>
                Salvar como Draft
              </PrimaryButton>
              <PrimaryButton
                disabled={total < 30 || total > 120}
                onClick={() => setStatus("Plano submetido para aprovação.")}
              >
                Submeter para Aprovação
              </PrimaryButton>
            </div>
          </div>
          {status && (
            <p role="status" className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {status}
            </p>
          )}
        </Card>
      )}
    </div>
  );
}

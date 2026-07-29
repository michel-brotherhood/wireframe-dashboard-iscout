import { treinos } from "../data/mockData";
import { Card } from "../components/ui";
import { Icon } from "../components/Icon";
import { useCurrentUser } from "../state/SessionContext";
import { escopoContem } from "../data/users";

// Nome do atleta "acompanhado" nesta demonstração — sem autenticação real,
// então não há como saber de fato qual responsável está olhando a tela.
const MEU_ATLETA = "Gustavo Silva";

const COMUNICADOS = [
  { titulo: "Treino de sábado remarcado", detalhe: "A sessão de sábado (04/07) passa para domingo (05/07) às 09h, mesmo campo." },
  { titulo: "Uniforme completo obrigatório", detalhe: "A partir da próxima semana, chuteira + caneleira são obrigatórias em todos os treinos." },
];

function formatDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

export default function ResumoResponsavel() {
  const user = useCurrentUser();
  // Responsável só acompanha a turma do seu atleta (escopo do usuário).
  const meusTreinos = treinos.filter((t) => escopoContem(t, user));
  const ultimoTreino = meusTreinos.find((t) => t.status === "Executado") ?? meusTreinos[0] ?? treinos[0];
  const { plano, sumula } = ultimoTreino;
  const presente = sumula.entries.some((e) => e.nome === MEU_ATLETA);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading flex items-center gap-2 text-xl font-semibold text-ink sm:text-2xl">
          <Icon name="trophy" className="h-6 w-6 text-primary" />
          Resumo da Aula
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {formatDate(ultimoTreino.sessionDate)} · {ultimoTreino.categoria} · {ultimoTreino.turma}
        </p>
      </div>

      <Card title="O que foi trabalhado" icon={<Icon name="clipboard" className="h-4 w-4" />}>
        <div className="flex flex-col gap-3 text-sm">
          <div>
            <p className="text-ink-muted">Tema trabalhado</p>
            <p className="font-medium text-ink">
              {plano.tema} · {plano.subtema}
            </p>
          </div>
          <div>
            <p className="text-ink-muted">Objetivo pedagógico</p>
            <p className="font-medium text-ink">{plano.etapaPrincipal.objetivo}</p>
          </div>
          <div>
            <p className="text-ink-muted">Fase de jogo</p>
            <p className="font-medium text-ink">{plano.fase}</p>
          </div>
        </div>
      </Card>

      <Card title="Presença" icon={<Icon name="check" className="h-4 w-4" />}>
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              presente ? "bg-secondary/15 text-secondary" : "bg-primary/15 text-primary-text"
            }`}
          >
            <Icon name={presente ? "check" : "x"} className="h-4 w-4" />
          </span>
          <div>
            <p className="font-medium text-ink">{MEU_ATLETA}</p>
            <p className="text-ink-muted">{presente ? "Presente nesta aula" : "Ausente nesta aula"}</p>
          </div>
        </div>
      </Card>

      <Card title="Comunicados" icon={<Icon name="alert" className="h-4 w-4" />}>
        <ul className="flex flex-col gap-3">
          {COMUNICADOS.map((c) => (
            <li key={c.titulo} className="rounded-xl border border-line-soft bg-surface-2 p-3 text-sm">
              <p className="font-medium text-ink">{c.titulo}</p>
              <p className="mt-0.5 text-ink-muted">{c.detalhe}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

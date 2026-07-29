import { useState } from "react";
import { Card } from "../components/ui";
import { Icon } from "../components/Icon";
import { USERS, escopoLabel } from "../data/users";
import { useCurrentUser } from "../state/SessionContext";

function initials(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function Configuracoes() {
  const currentUser = useCurrentUser();
  // Estado de "ativo" apenas em memória (protótipo mock, sem backend).
  const [inativos, setInativos] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setInativos((prev) => {
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
          <Icon name="menu" className="h-6 w-6 text-primary" />
          Gestão de Acessos
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Administração de usuários e permissões — os gestores controlam quem acessa e o que cada
          perfil enxerga.
        </p>
      </div>

      <Card title="Como funciona o acesso" icon={<Icon name="stamp" className="h-4 w-4" />}>
        <ul className="flex flex-col gap-2 text-sm text-ink-muted">
          <li>
            <span className="font-medium text-ink">Papel</span> define o que o usuário pode fazer
            (treinador cria, head coach aprova, gestor administra, responsável acompanha).
          </li>
          <li>
            <span className="font-medium text-ink">Escopo</span> define a área que ele atende
            (unidade, categorias e turmas) — é o recorte do que aparece para ele.
          </li>
          <li>Ativar/desativar um usuário libera ou bloqueia o acesso dele à plataforma.</li>
        </ul>
      </Card>

      <Card title={`Usuários (${USERS.length})`} icon={<Icon name="clipboard" className="h-4 w-4" />}>
        <ul className="flex flex-col gap-2">
          {USERS.map((u) => {
            const ativo = !inativos.has(u.id);
            const isCurrent = u.id === currentUser.id;
            return (
              <li
                key={u.id}
                className="flex flex-col gap-3 rounded-xl border border-line-soft bg-surface-2 p-3 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-semibold text-ink-muted"
                    aria-hidden="true"
                  >
                    {initials(u.nome)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-ink">{u.nome}</p>
                      <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                        {u.cargo}
                      </span>
                      {isCurrent && (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary-text">
                          Você
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ink-muted">{escopoLabel(u)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(u.id)}
                  disabled={isCurrent}
                  aria-pressed={ativo}
                  className={`flex shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${
                    ativo
                      ? "border-secondary/40 bg-secondary/10 text-secondary"
                      : "border-line bg-surface text-ink-muted"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${ativo ? "bg-secondary" : "bg-ink-faint"}`} aria-hidden="true" />
                  {ativo ? "Ativo" : "Inativo"}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-ink-muted">
          Protótipo — alterações de acesso são simuladas nesta tela e não persistem.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: "network" as const, label: "Unidades e categorias" },
          { icon: "clipboard" as const, label: "Turmas e treinadores" },
          { icon: "calendar" as const, label: "Prazos de aprovação" },
        ].map((item) => (
          <Card key={item.label}>
            <div className="flex items-center gap-3 text-ink-muted">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-muted">
                <Icon name={item.icon} className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{item.label}</p>
                <p className="text-xs text-ink-muted">Em definição</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

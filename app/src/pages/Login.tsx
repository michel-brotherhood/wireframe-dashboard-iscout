import { useState } from "react";
import logo from "../assets/brand/marca-principal.png";
import { USERS, escopoLabel } from "../data/users";
import { useSession } from "../state/SessionContext";
import { Icon } from "../components/Icon";
import type { AppUser } from "../types";

function initials(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function Login() {
  const { login } = useSession();
  const [selectedId, setSelectedId] = useState<string>(USERS[0].id);
  const selected = USERS.find((u) => u.id === selectedId) as AppUser;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-canvas px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={logo} alt="BIG SOCCER by iSCOUT" className="h-12 w-auto" />
          <h1 className="font-heading mt-6 text-xl font-semibold text-ink">Acessar plataforma</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Ambiente de demonstração — escolha um perfil para entrar. O acesso de cada
            usuário é definido pelo cargo e pela área que ele atende.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5">
          <fieldset>
            <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Selecione seu usuário
            </legend>
            <div className="flex flex-col gap-2">
              {USERS.map((u) => {
                const active = u.id === selectedId;
                return (
                  <label
                    key={u.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                      active
                        ? "border-primary bg-primary/10"
                        : "border-line-soft bg-surface-2 hover:border-ink-faint"
                    }`}
                  >
                    <input
                      type="radio"
                      name="usuario"
                      value={u.id}
                      checked={active}
                      onChange={() => setSelectedId(u.id)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                        active ? "bg-primary-hover text-white" : "bg-surface text-ink-muted"
                      }`}
                      aria-hidden="true"
                    >
                      {initials(u.nome)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-ink">{u.nome}</span>
                        <span className="shrink-0 rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                          {u.cargo}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-ink-muted">{escopoLabel(u)}</span>
                    </span>
                    {active && <Icon name="check" className="h-4 w-4 shrink-0 text-primary" />}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <button
            type="button"
            onClick={() => login(selected)}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-hover px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-active focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:ring-primary"
          >
            Entrar como {selected.nome.split(" ")[0]}
            <Icon name="arrowRight" className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-ink-muted">
          Protótipo — autenticação simulada, sem senha e sem servidor.
        </p>
      </div>
    </div>
  );
}

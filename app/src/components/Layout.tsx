import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/brand/marca-principal.png";
import logoCompact from "../assets/brand/marca-compacta.png";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";
import { useCurrentUser, useSession } from "../state/SessionContext";
import { NotificationBell } from "./NotificationBell";
import type { Role } from "../types";

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
}

// Cada perfil vê ações diferentes — treinador cria, head coach revisa,
// gestor administra, responsável só acompanha. Ver seção 3 do briefing.
function navItemsForRole(role: Role): NavItem[] {
  const items: NavItem[] = [{ to: "/", label: role === "responsavel" ? "Resumo" : "Dashboard", icon: "lineChart" }];
  if (role === "treinador") {
    items.push(
      { to: "/planos/novo", label: "Novo Plano", icon: "clipboard" },
      { to: "/sumulas/novo", label: "Nova Súmula", icon: "ball" },
      { to: "/execution/novo", label: "Registrar Execução", icon: "barChart" },
    );
  }
  if (role === "head_coach") {
    items.push({ to: "/planos/aprovacao", label: "Aprovações", icon: "stamp" });
  }
  if (role === "gestor") {
    items.push({ to: "/configuracoes", label: "Configurações", icon: "menu" });
  }
  return items;
}

const referenceNavItem: NavItem = { to: "/arquitetura", label: "Arquitetura", icon: "network" };
// Arquitetura aponta direto para o diagrama fonte no Mermaid (nova aba) — a
// referência técnica vive lá, não é replicada dentro do wireframe.
const ARQUITETURA_MERMAID_URL = "https://mermaid.ai/d/400df741-4a78-42b7-82b3-38667bbb9cf6";

function initials(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function UserMenu() {
  const user = useCurrentUser();
  const { logout } = useSession();
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 py-1 pl-1 pr-2">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-hover text-xs font-semibold text-white"
          aria-hidden="true"
        >
          {initials(user.nome)}
        </span>
        <span className="hidden leading-tight sm:block">
          <span className="block text-xs font-semibold text-ink">{user.nome}</span>
          <span className="block text-[11px] text-ink-muted">{user.cargo}</span>
        </span>
      </div>
      <button
        type="button"
        onClick={logout}
        aria-label="Sair da conta"
        className="flex h-11 items-center gap-1.5 rounded-lg border border-line px-2.5 text-xs font-medium text-ink-muted transition-colors hover:border-ink-faint hover:text-ink"
      >
        <Icon name="arrowLeft" className="h-4 w-4" />
        <span className="hidden sm:inline">Sair</span>
      </button>
    </div>
  );
}

function NavLinkPill({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      className={({ isActive }) =>
        `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive ? "bg-primary/15 text-primary-text" : "text-ink-muted hover:bg-surface-2 hover:text-ink"
        }`
      }
    >
      <Icon name={item.icon} className="h-4 w-4" />
      {item.label}
    </NavLink>
  );
}

function BottomTabLink({ to, label, icon }: NavItem) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px] font-medium transition-colors ${
          isActive ? "text-primary-text" : "text-ink-muted hover:text-ink"
        }`
      }
    >
      <Icon name={icon} className="h-5 w-5" />
      {label}
    </NavLink>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const { role } = useCurrentUser();
  const items = navItemsForRole(role);
  const showArquitetura = role !== "responsavel";

  // Só o treinador tem uma ação de criação primária (Novo Plano) — outros
  // perfis não ganham um FAB, só uma barra de abas simples.
  const fabItem = role === "treinador" ? items.find((i) => i.to === "/planos/novo") : undefined;
  const bottomTabs = items.filter((i) => i !== fabItem);
  const mid = Math.ceil(bottomTabs.length / 2);
  const bottomTabsLeft = fabItem ? bottomTabs.slice(0, mid) : bottomTabs;
  const bottomTabsRight = fabItem ? bottomTabs.slice(mid) : [];
  // Responsável has a single destination — a bottom bar with one tab reads
  // as broken UI, so skip it entirely rather than render a sparse bar.
  const hasBottomNav = Boolean(fabItem) || bottomTabsLeft.length + bottomTabsRight.length > 1;

  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2 focus:text-ink focus:shadow"
      >
        Pular para o conteúdo
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2" aria-label="BIG SOCCER by iSCOUT - início">
            <img src={logo} alt="BIG SOCCER by iSCOUT" className="hidden h-9 w-auto sm:block" />
            <img src={logoCompact} alt="BIG SOCCER by iSCOUT" className="h-8 w-auto sm:hidden" />
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
            {items.map((item) => (
              <NavLinkPill key={item.to} item={item} />
            ))}
            {showArquitetura && (
              <>
                <span aria-hidden="true" className="mx-1 h-5 w-px bg-line" />
                <a
                  href={ARQUITETURA_MERMAID_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  <Icon name={referenceNavItem.icon} className="h-4 w-4" />
                  {referenceNavItem.label}
                  <Icon name="externalLink" className="h-3.5 w-3.5" />
                </a>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {showArquitetura && (
              <a
                href={ARQUITETURA_MERMAID_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Arquitetura do sistema no Mermaid (abre em nova aba)"
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-line text-ink-muted md:hidden"
              >
                <Icon name={referenceNavItem.icon} className="h-4 w-4" />
              </a>
            )}
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </header>

      <main className={`mx-auto max-w-7xl px-4 pt-6 sm:px-6 ${hasBottomNav ? "pb-24 md:pb-6" : "pb-6"}`} id="main-content">
        {children}
      </main>

      {hasBottomNav && (
        <nav
          aria-label="Navegação principal (mobile)"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur md:hidden"
        >
          <div className="mx-auto flex max-w-md items-center px-2 pb-[max(0.375rem,env(safe-area-inset-bottom))] pt-1.5">
            {bottomTabsLeft.map((item) => (
              <BottomTabLink key={item.to} {...item} />
            ))}

            {fabItem && (
              <NavLink
                to={fabItem.to}
                aria-label={fabItem.label}
                className={({ isActive }) =>
                  `-mt-7 flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white shadow-lg shadow-primary/30 ring-4 ring-canvas transition-colors ${
                    isActive ? "bg-primary-active" : "bg-primary-hover"
                  }`
                }
              >
                <Icon name="plus" className="h-6 w-6" />
              </NavLink>
            )}

            {bottomTabsRight.map((item) => (
              <BottomTabLink key={item.to} {...item} />
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}

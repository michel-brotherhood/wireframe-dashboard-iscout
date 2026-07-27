import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/brand/marca-principal.png";
import logoCompact from "../assets/brand/marca-compacta.png";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";

const navItems: { to: string; label: string; icon: IconName }[] = [
  { to: "/", label: "Dashboard", icon: "lineChart" },
  { to: "/planos/novo", label: "Novo Plano", icon: "clipboard" },
  { to: "/planos/aprovacao", label: "Aprovação", icon: "stamp" },
  { to: "/sumulas/novo", label: "Nova Súmula", icon: "ball" },
  { to: "/execution/novo", label: "Registrar Execução", icon: "barChart" },
];

const referenceNavItem: { to: string; label: string; icon: IconName } = {
  to: "/arquitetura",
  label: "Arquitetura",
  icon: "network",
};

// Bottom tab bar (mobile only): the two most-checked destinations on each
// side of a raised "Novo Plano" FAB — the primary create action and the
// contract-before-execution gate (RF2/RF5) this app exists to enforce.
const bottomTabsLeft: { to: string; label: string; icon: IconName }[] = [
  { to: "/", label: "Início", icon: "lineChart" },
  { to: "/planos/aprovacao", label: "Aprovação", icon: "stamp" },
];
const bottomTabsRight: { to: string; label: string; icon: IconName }[] = [
  { to: "/sumulas/novo", label: "Súmula", icon: "ball" },
  { to: "/execution/novo", label: "Execução", icon: "barChart" },
];

function BottomTabLink({ to, label, icon }: { to: string; label: string; icon: IconName }) {
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
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/15 text-primary-text"
                      : "text-ink-muted hover:bg-surface-2 hover:text-ink"
                  }`
                }
              >
                <Icon name={item.icon} className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
            <span aria-hidden="true" className="mx-1 h-5 w-px bg-line" />
            <NavLink
              to={referenceNavItem.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-primary/15 text-primary-text" : "text-ink-muted hover:bg-surface-2 hover:text-ink"
                }`
              }
            >
              <Icon name={referenceNavItem.icon} className="h-4 w-4" />
              {referenceNavItem.label}
            </NavLink>
          </nav>

          <NavLink
            to={referenceNavItem.to}
            aria-label="Arquitetura do sistema (referência técnica)"
            className={({ isActive }) =>
              `flex h-9 w-9 items-center justify-center rounded-lg border border-line md:hidden ${
                isActive ? "bg-primary/15 text-primary-text" : "text-ink-muted"
              }`
            }
          >
            <Icon name={referenceNavItem.icon} className="h-4 w-4" />
          </NavLink>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 md:pb-6">
        {children}
      </main>

      <nav
        aria-label="Navegação principal (mobile)"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur md:hidden"
      >
        <div className="mx-auto flex max-w-md items-center px-2 pb-[max(0.375rem,env(safe-area-inset-bottom))] pt-1.5">
          {bottomTabsLeft.map((item) => (
            <BottomTabLink key={item.to} {...item} />
          ))}

          <NavLink
            to="/planos/novo"
            aria-label="Criar novo plano de aula"
            className={({ isActive }) =>
              `-mt-7 flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white shadow-lg shadow-primary/30 ring-4 ring-canvas transition-colors ${
                isActive ? "bg-primary-active" : "bg-primary-hover"
              }`
            }
          >
            <Icon name="plus" className="h-6 w-6" />
          </NavLink>

          {bottomTabsRight.map((item) => (
            <BottomTabLink key={item.to} {...item} />
          ))}
        </div>
      </nav>
    </div>
  );
}

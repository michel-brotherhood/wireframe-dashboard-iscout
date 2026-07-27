import { useEffect, useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/brand/marca-principal.png";
import logoCompact from "../assets/brand/marca-compacta.png";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";

const navItems: { to: string; label: string; icon: IconName }[] = [
  { to: "/", label: "Dashboard", icon: "lineChart" },
  { to: "/planos/novo", label: "Novo Plano", icon: "clipboard" },
  { to: "/sumulas/novo", label: "Nova Súmula", icon: "ball" },
  { to: "/execution/novo", label: "Registrar Execução", icon: "barChart" },
];

const referenceNavItem: { to: string; label: string; icon: IconName } = {
  to: "/arquitetura",
  label: "Arquitetura",
  icon: "network",
};

export default function Layout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

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

          <button
            type="button"
            className="rounded-lg border border-line p-2 text-ink-muted md:hidden"
            aria-label={menuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Icon name={menuOpen ? "x" : "menu"} className="h-5 w-5" />
          </button>
        </div>

        {menuOpen && (
          <nav
            className="border-t border-line bg-surface px-4 py-2 md:hidden"
            aria-label="Navegação principal (mobile)"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive ? "bg-primary/15 text-primary-text" : "text-ink-muted"
                  }`
                }
              >
                <Icon name={item.icon} className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
            <div className="my-1 h-px bg-line" aria-hidden="true" />
            <NavLink
              to={referenceNavItem.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive ? "bg-primary/15 text-primary-text" : "text-ink-muted"
                }`
              }
            >
              <Icon name={referenceNavItem.icon} className="h-4 w-4" />
              {referenceNavItem.label}
            </NavLink>
          </nav>
        )}
      </header>

      <main id="main-content" className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}

import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/brand/marca-principal.png";
import logoCompact from "../assets/brand/marca-compacta.png";

const navItems = [
  { to: "/", label: "Dashboard", icon: "📈" },
  { to: "/planos/novo", label: "Novo Plano", icon: "📋" },
  { to: "/sumulas/novo", label: "Nova Súmula", icon: "⚽" },
  { to: "/execution/novo", label: "Registrar Execução", icon: "📊" },
];

export default function Layout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-alt">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:shadow"
      >
        Pular para o conteúdo
      </a>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2" aria-label="BIG SOCCER by iSCOUT - início">
            <img src={logo} alt="BIG SOCCER by iSCOUT" className="hidden h-10 w-auto sm:block" />
            <img src={logoCompact} alt="BIG SOCCER by iSCOUT" className="h-9 w-auto sm:hidden" />
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                <span className="mr-1.5" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            className="rounded-lg border border-gray-300 p-2 text-gray-600 md:hidden"
            aria-label="Abrir menu de navegação"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span aria-hidden="true">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>

        {menuOpen && (
          <nav
            className="border-t border-gray-200 bg-white px-4 py-2 md:hidden"
            aria-label="Navegação principal (mobile)"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive ? "bg-primary/10 text-primary" : "text-gray-700"
                  }`
                }
              >
                <span className="mr-2" aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main id="main-content" className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}

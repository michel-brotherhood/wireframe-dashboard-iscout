import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TreinoDetalhe from "./pages/TreinoDetalhe";
import EditorPlano from "./pages/EditorPlano";
import EditorSumula from "./pages/EditorSumula";
import EditorExecutionLog from "./pages/EditorExecutionLog";
import AprovacaoPlanos from "./pages/AprovacaoPlanos";
import Arquitetura from "./pages/Arquitetura";
import Configuracoes from "./pages/Configuracoes";
import { PlanosProvider } from "./state/PlanosContext";
import { SessionProvider, useSession, useCurrentUser } from "./state/SessionContext";
import type { Role } from "./types";

// Guarda de rota por papel: sem o papel exigido, redireciona para o Dashboard.
// Complementa o filtro de menu (navItemsForRole) — impede acesso direto por URL
// (ou rota "presa" após troca de usuário) a telas fora do perfil.
function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { role } = useCurrentUser();
  return roles.includes(role) ? <>{children}</> : <Navigate to="/" replace />;
}

function AuthenticatedApp() {
  return (
    <PlanosProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/treinos/:id" element={<TreinoDetalhe />} />
          <Route
            path="/planos/novo"
            element={
              <RequireRole roles={["treinador"]}>
                <EditorPlano />
              </RequireRole>
            }
          />
          <Route
            path="/planos/aprovacao"
            element={
              <RequireRole roles={["head_coach", "gestor"]}>
                <AprovacaoPlanos />
              </RequireRole>
            }
          />
          <Route
            path="/sumulas/novo"
            element={
              <RequireRole roles={["treinador"]}>
                <EditorSumula />
              </RequireRole>
            }
          />
          <Route
            path="/execution/novo"
            element={
              <RequireRole roles={["treinador"]}>
                <EditorExecutionLog />
              </RequireRole>
            }
          />
          <Route path="/arquitetura" element={<Arquitetura />} />
          <Route
            path="/configuracoes"
            element={
              <RequireRole roles={["gestor"]}>
                <Configuracoes />
              </RequireRole>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </PlanosProvider>
  );
}

// Gate de sessão: sem usuário autenticado, o app é a tela de login. Com usuário,
// entra no shell autenticado (login → dashboard).
function Gate() {
  const { user } = useSession();
  return user ? <AuthenticatedApp /> : <Login />;
}

export default function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <Gate />
      </SessionProvider>
    </BrowserRouter>
  );
}

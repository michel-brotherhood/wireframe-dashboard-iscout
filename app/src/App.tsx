import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { SessionProvider, useSession } from "./state/SessionContext";

function AuthenticatedApp() {
  return (
    <PlanosProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/treinos/:id" element={<TreinoDetalhe />} />
          <Route path="/planos/novo" element={<EditorPlano />} />
          <Route path="/planos/aprovacao" element={<AprovacaoPlanos />} />
          <Route path="/sumulas/novo" element={<EditorSumula />} />
          <Route path="/execution/novo" element={<EditorExecutionLog />} />
          <Route path="/arquitetura" element={<Arquitetura />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
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

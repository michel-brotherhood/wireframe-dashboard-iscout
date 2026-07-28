import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import TreinoDetalhe from "./pages/TreinoDetalhe";
import EditorPlano from "./pages/EditorPlano";
import EditorSumula from "./pages/EditorSumula";
import EditorExecutionLog from "./pages/EditorExecutionLog";
import AprovacaoPlanos from "./pages/AprovacaoPlanos";
import Arquitetura from "./pages/Arquitetura";
import Configuracoes from "./pages/Configuracoes";
import { PlanosProvider } from "./state/PlanosContext";
import { RoleProvider } from "./state/RoleContext";

export default function App() {
  return (
    <BrowserRouter>
      <RoleProvider>
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
      </RoleProvider>
    </BrowserRouter>
  );
}

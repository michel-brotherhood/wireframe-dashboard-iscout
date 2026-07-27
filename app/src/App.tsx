import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import TreinoDetalhe from "./pages/TreinoDetalhe";
import EditorPlano from "./pages/EditorPlano";
import EditorSumula from "./pages/EditorSumula";
import EditorExecutionLog from "./pages/EditorExecutionLog";
import Arquitetura from "./pages/Arquitetura";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/treinos/:id" element={<TreinoDetalhe />} />
          <Route path="/planos/novo" element={<EditorPlano />} />
          <Route path="/sumulas/novo" element={<EditorSumula />} />
          <Route path="/execution/novo" element={<EditorExecutionLog />} />
          <Route path="/arquitetura" element={<Arquitetura />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

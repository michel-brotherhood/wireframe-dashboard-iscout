import { createRouter, createWebHistory } from "vue-router";
import { session } from "../stores/session";

import Dashboard from "../pages/Dashboard.vue";
import TreinoDetalhe from "../pages/TreinoDetalhe.vue";
import EditorPlano from "../pages/EditorPlano.vue";
import AprovacaoPlanos from "../pages/AprovacaoPlanos.vue";
import EditorSumula from "../pages/EditorSumula.vue";
import EditorExecutionLog from "../pages/EditorExecutionLog.vue";
import Arquitetura from "../pages/Arquitetura.vue";
import Configuracoes from "../pages/Configuracoes.vue";
import Reforco from "../pages/Reforco.vue";

// Guarda de rota por papel: sem o papel exigido, redireciona ao Dashboard.
// Complementa o filtro de menu (navItemsForRole) — impede acesso direto por URL
// (ou rota "presa" após troca de usuário) a telas fora do perfil.
const routes = [
  { path: "/", component: Dashboard },
  { path: "/treinos/:id", component: TreinoDetalhe },
  { path: "/planos/novo", component: EditorPlano, meta: { roles: ["treinador"] } },
  { path: "/planos/aprovacao", component: AprovacaoPlanos, meta: { roles: ["head_coach", "gestor"] } },
  { path: "/sumulas/novo", component: EditorSumula, meta: { roles: ["treinador"] } },
  { path: "/execution/novo", component: EditorExecutionLog, meta: { roles: ["treinador"] } },
  { path: "/reforco", component: Reforco, meta: { roles: ["treinador", "head_coach", "gestor"] } },
  { path: "/arquitetura", component: Arquitetura },
  { path: "/configuracoes", component: Configuracoes, meta: { roles: ["gestor"] } },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to) => {
  const roles = to.meta.roles;
  if (roles && session.user && !roles.includes(session.user.role)) return "/";
  return true;
});

export default router;

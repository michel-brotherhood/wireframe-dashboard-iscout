import { reactive, watch } from "vue";

// Filtros do Dashboard (Unidade/Categoria/Turma/Treinador/Status/Data)
// persistem no navegador e são reaproveitados pelos indicadores (card de IA
// no Dashboard e tela de Reforço) — ao navegar entre telas ou recarregar a
// página, o recorte escolhido continua aplicado em vez de resetar.
const STORAGE_KEY = "iscout.dashboardFilters";

const DEFAULTS = {
  data: "2026-07-02",
  unidade: "Todas",
  categoria: "Todas",
  turma: "Todas",
  treinador: "Todos",
  status: "Todos",
};

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const saved = raw ? JSON.parse(raw) : {};
    return { ...DEFAULTS, ...saved };
  } catch {
    return { ...DEFAULTS };
  }
}

export const dashboardFilters = reactive(readStored());

watch(
  dashboardFilters,
  (filters) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch {
      // ambiente sem localStorage — segue só em memória
    }
  },
  { deep: true },
);

export function resetDashboardFilters() {
  Object.assign(dashboardFilters, DEFAULTS);
}

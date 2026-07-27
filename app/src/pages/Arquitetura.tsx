import { useState } from "react";
import { diagrams } from "../data/diagrams";
import { Card } from "../components/ui";
import { Icon } from "../components/Icon";
import { MermaidDiagram } from "../components/MermaidDiagram";

export default function Arquitetura() {
  const [activeId, setActiveId] = useState(diagrams[0].id);
  const active = diagrams.find((d) => d.id === activeId) ?? diagrams[0];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading flex items-center gap-2 text-xl font-semibold text-ink sm:text-2xl">
          <Icon name="network" className="h-6 w-6 text-primary" />
          Arquitetura do Sistema
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Referência técnica renderizada a partir dos diagramas Mermaid do projeto — separada do wireframe do
          dashboard, que representa apenas o esqueleto visual das telas.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav
          aria-label="Selecionar diagrama"
          className="flex gap-2 overflow-x-auto pb-1 lg:w-64 lg:shrink-0 lg:flex-col lg:overflow-visible lg:pb-0"
        >
          {diagrams.map((d) => (
            <button
              key={d.id}
              type="button"
              aria-current={d.id === activeId}
              onClick={() => setActiveId(d.id)}
              className={`shrink-0 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors lg:shrink ${
                d.id === activeId
                  ? "border-primary/40 bg-primary/10 text-primary-text"
                  : "border-line bg-surface text-ink-muted hover:bg-surface-2 hover:text-ink"
              }`}
            >
              {d.title}
            </button>
          ))}
        </nav>

        <Card title={active.title} icon={<Icon name="network" className="h-4 w-4" />} className="flex-1">
          <p className="mb-4 text-sm text-ink-muted">{active.description}</p>
          <MermaidDiagram key={active.id} source={active.source} title={active.title} />
        </Card>
      </div>
    </div>
  );
}

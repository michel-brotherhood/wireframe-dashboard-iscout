import { Card } from "../components/ui";
import { Icon } from "../components/Icon";

export default function Configuracoes() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading flex items-center gap-2 text-xl font-semibold text-ink sm:text-2xl">
          <Icon name="menu" className="h-6 w-6 text-primary" />
          Configurações Administrativas
        </h1>
        <p className="mt-1 text-sm text-ink-muted">Visão de Gestor — área conceitual, sem funcionalidade real nesta etapa.</p>
      </div>

      <Card title="Área reservada" icon={<Icon name="alert" className="h-4 w-4" />}>
        <p className="text-sm text-ink-muted">
          Configurações administrativas (unidades, categorias, turmas, treinadores, permissões e prazos) pendentes de
          definição com a coordenação. Este espaço representa apenas onde essas telas viverão no produto final.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: "network" as const, label: "Unidades e categorias" },
          { icon: "clipboard" as const, label: "Turmas e treinadores" },
          { icon: "stamp" as const, label: "Permissões por perfil" },
          { icon: "calendar" as const, label: "Prazos de aprovação" },
        ].map((item) => (
          <Card key={item.label}>
            <div className="flex items-center gap-3 text-ink-muted">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-muted">
                <Icon name={item.icon} className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{item.label}</p>
                <p className="text-xs text-ink-muted">Em definição</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

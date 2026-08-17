# BIG SOCCER by iSCOUT — Dashboard de Gestão da Escolinha

Protótipo funcional (wireframe navegável, em código) do painel operacional da
escolinha: cobre o ciclo completo de uma aula — **planejar → aprovar →
executar → comprovar** — com login por perfil, permissões por escopo e uma
base estruturada de indicadores pensada para alimentar agentes de IA no
futuro.

**Sem backend.** Todos os dados vivem em módulos JavaScript (`app/src/data/`)
e o estado de sessão/rascunhos persiste no `localStorage` do navegador — o
objetivo é validar fluxo e UX antes de construir a API real.

- **Aplicação:** [`app/`](./app) (Vue 3 + Vite + Tailwind)
- **Documentação técnica detalhada:** [`app/README.md`](./app/README.md)
- **Diagramas de arquitetura:** [`DIAGRAMAS_mermaid.md`](./DIAGRAMAS_mermaid.md)

---

## Esferas do projeto

O dashboard é organizado em seis esferas funcionais, cada uma com sua própria
tela e regras de acesso:

### 1. Planejamento pedagógico — Plano de Aula
`/planos/novo` · perfis `coach`/`admin`

Criação do plano em etapas estruturadas (Inicial/Aquecimento →
Fundamentação → Principal → Observações), com catálogos fechados de
objetivos, materiais e orientações metodológicas, validação de prazo (envio
com no mínimo 24h de antecedência da sessão) e duração total dentro da
faixa esperada. Rascunhos ficam salvos e podem ser retomados depois.

### 2. Aprovação
`/planos/aprovacao` · perfil `admin`

Fila de planos aguardando decisão da coordenação: aprovar (individual ou em
lote, com confirmação antes de aplicar), solicitar ajustes com comentário
específico para o coach, e histórico de decisões já tomadas.

### 3. Execução em campo — Súmula e Registro de Execução
`/sumulas/novo` e `/execution/novo` · perfis `coach`/`admin`

Escalação da sessão (atleta, número do colete, posição, titular/reserva) e,
depois do treino, o registro do que de fato aconteceu — tempo executado por
etapa comparado ao planejado, e os desvios relevantes registrados um a um.
A execução só pode ser registrada sobre um plano já aprovado.

### 3a. Registro de partida — jogo entre dois times
`/partidas/nova` · perfis `coach`/`admin`

Registro de uma **partida real** (distinto da súmula de treino acima),
**adaptado ao modelo de referência `sumula.html`** e trazido para a
identidade visual do dashboard:

- Dois times (casa × visitante) com elenco próprio; placar/gols/cartões
  opcionais.
- Esquema de coletes configurável — **duas cores** (o número pode repetir
  entre os times) ou **cor única** (número global) — com cor + rótulo por
  time e faixa de numeração.
- UUID por partida e por jogador, mais um índice `cv_index` com a chave
  `(match_uuid · cor · número → player_uuid)` — pensado para uma futura
  análise de vídeo reconhecer cada jogador em campo.
- Exportação em JSON (schema normalizado `matches` / `players` /
  `cv_index`), CSV e cópia de UUIDs; múltiplas partidas ficam salvas no
  navegador.

A súmula de treino (esfera 3) segue intacta — esta é uma tela separada,
acessível pelo card "Registrar Partida" no Dashboard.

### 4. Indicadores e reforço — base estruturada para IA
Card no Dashboard + `/reforco` · perfis `coach`/`admin`

Cada atleta tem notas por fundamento técnico (cabeceio, passe, lançamento,
domínio, finalização, marcação); a tela de Reforço agrupa automaticamente
quem está abaixo do esperado em cada fundamento, sugerindo focos de treino.
Hoje é uma heurística local (sem IA de verdade), mas o *formato* dos dados
já é o que um agente de recomendação real vai precisar consumir mais
adiante.

### 5. Gestão de acessos e perfis
`/configuracoes` · perfil `admin`

Cadastro de usuários com papel (coach/admin), escopo de atuação
(unidade/categoria/turma) e ativação/desativação de login. Três perfis
regem tudo o que cada pessoa vê e pode fazer no sistema:

| Perfil | Pode fazer |
|---|---|
| **Admin** | Aprova/devolve planos, administra acessos, e enxerga todas as unidades/turmas |
| **Coach** | Cria planos, súmulas e registros de execução da própria turma |
| **Responsável** | Acompanha, só leitura, a turma do próprio atleta |

### 6. Visão do responsável
`/` (home do perfil `responsavel`)

Resumo somente-leitura da última aula da turma do atleta: tema trabalhado,
objetivo pedagógico, presença e comunicados gerais da escola — sem acesso a
planejamento, aprovação ou dados de outras turmas.

---

## Arquitetura (referência técnica)

O item "Arquitetura" do menu aponta para um diagrama vivo do sistema
(Mermaid), não replicado dentro do protótipo — é onde vive a referência
técnica de como as peças se encaixam.

## Stack técnica

Vue 3 (Composition API, `<script setup>`, JavaScript puro) + Vite + Tailwind
CSS v4 + vue-router 4. Sem framework de estado externo — módulos
`reactive()`/`ref()` simples em `app/src/stores/`. Testes end-to-end com
Playwright. PWA-ready (instalável, com shell offline básico).

## Como rodar localmente

```bash
cd app
npm install
npm run dev        # servidor de desenvolvimento
npm run build       # build de produção
npm run test:e2e    # suíte Playwright
npm run lint         # oxlint
```

## Deploy

Cloudflare Pages, publicando o build de `app/` a cada push na branch
principal.

---

Para detalhes de implementação (modelo de dados, guarda de rotas, estrutura
de pastas, PWA), veja [`app/README.md`](./app/README.md).

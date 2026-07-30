# BIG SOCCER by iSCOUT — Dashboard de Treinos

Protótipo (wireframe funcional) do dashboard de gestão de treinos da escolinha:
planejamento de aula, súmula, execução e fluxo de aprovação, com login e
permissões por papel/escopo. **Sem backend** — todos os dados vivem em
módulos JS (`src/data/`) e `localStorage`, para demonstração e validação de
produto antes da construção da API real.

## Stack

- **Vue 3** (Composition API, `<script setup>`) — **JavaScript puro, sem TypeScript**
- **Vite 8** + **Tailwind CSS v4** (tokens de tema em `src/index.css`, `@theme`)
- **vue-router 4** — rotas com guarda por papel (`meta.roles` + `router.beforeEach`)
- **Mermaid** — só na página Arquitetura, para o diagrama de arquitetura do sistema
- **Playwright** — testes e2e (`tests/e2e`)
- Sem Pinia/Vuex: estado global é feito com módulos `reactive()`/`ref()` simples em `src/stores/`

## Scripts

```bash
npm run dev        # servidor de desenvolvimento
npm run build      # build de produção (dist/)
npm run preview    # serve o build de produção localmente
npm run lint        # oxlint
npm run test:e2e    # playwright
```

## Estrutura

```
src/
  data/         # dados "semente" (mock) — fonte da verdade da demonstração
    users.js         # usuários, papel (role), escopo (unidade/categorias/turmas), escopoContem()
    mockData.js       # treinos, planos, súmulas, fases/temas
    fundamentos.js     # base estruturada de IA (ver seção própria abaixo)
    notifications.js   # itens do sino de notificações
    planoOptions.js     # opções fechadas dos formulários (materiais, objetivos, etc.)
    diagrams.js         # definições Mermaid da página Arquitetura
  stores/       # estado reativo global (módulos reactive(), não é Pinia)
    session.js    # usuário logado (persistido em localStorage.iscout.sessionUserId)
    planos.js      # planos + rascunhos (persistidos em localStorage.iscout.planoDrafts)
  router/       # rotas + guarda de acesso por papel
  components/   # Layout, Icon, NotificationBell, ui/* (primitives), MermaidDiagram
  pages/        # uma tela por rota
public/
  manifest.webmanifest, sw.js, icon-*.png   # PWA (instalável + offline básico)
  _redirects                                  # fallback de SPA no Cloudflare Pages
```

## Modelo de usuários, papéis e escopo

Login é mock: escolher um usuário na tela de login define `role` + `escopo`
da sessão (sem senha real). Definidos em `src/data/users.js`.

- **Papéis (`role`)**: `treinador` | `head_coach` | `gestor` | `responsavel`
- **Escopo**: `{ unidade, categorias[], turmas[] }`, mais `coachName` para
  treinador (só enxerga o que ele mesmo ministra)
- **Filtro único de visibilidade**: `escopoContem(item, user)` — usado em
  toda tela/lista que precisa respeitar o que cada perfil pode ver
- **Guarda de rota**: cada rota tem `meta.roles`; `router.beforeEach`
  redireciona para `/` se o papel da sessão não está na lista — acesso
  direto por URL não contorna a regra, só esconder item de menu não seria
  suficiente

## IA de recomendação de reforço — base de dados estruturada

Ponto de referência para integração futura com agentes de IA (ver
`src/data/fundamentos.js`).

O briefing do projeto define que **agentes de IA** (ex.: agente para montar
elenco, recomendar jogadores, analisar vídeos, sugerir contratações) estão
**fora do escopo do MVP**, mas que **o dashboard deve gerar a base de dados
estruturada** que esses agentes vão consumir no futuro. A funcionalidade de
"recomendação de reforço" implementa exatamente essa base, hoje como
heurística mock (sem ML real, sem backend):

```js
FUNDAMENTOS = ["Cabeceio", "Passe", "Lançamento", "Domínio", "Finalização", "Marcação"]
LIMITE_REFORCO = 60  // nota abaixo disso = deficiência no fundamento

// registro por atleta
{ id, nome, matricula, unidade, categoria, turma, coachName, posicao,
  fundamentos: { Cabeceio: 0-100, Passe: 0-100, ... } }

atletasNoEscopo(user)  // atletas do escopo do usuário logado (via escopoContem)
gruposDeReforco(user)  // por fundamento: atletas do escopo com nota < 60,
                        // ordenados do mais fraco pro menos fraco;
                        // só forma grupo com >= 2 atletas
                        // → [{ fundamento, atletas: [{...atleta, score}], media }]
resumoReforco(user)    // agregado para o Dashboard:
                        // { totalAvaliados, sinalizados, topFundamentos }
```

Consumido por:
- **`pages/Reforco.vue`** (rota `/reforco`, papéis `treinador`/`head_coach`/`gestor`) —
  um card por fundamento deficiente, lista de atletas afetados e ação mock
  "Sugerir sessão de reforço"
- **`pages/Dashboard.vue`** — card-resumo "Indicadores de Fundamentos (IA)"
  com atalho para a tela de Reforço

**Status da integração com agentes reais**: o *formato* dos dados (atleta →
notas por fundamento → agregação em grupos de deficiência) já existe e já
está em uso na UI — é a base estruturada que o briefing pede. O que ainda
não existe é o ponto de conexão: hoje tudo roda no client (`data/*.js` +
`localStorage`), sem endpoint HTTP, sem schema versionado, sem nada que um
agente externo possa chamar. Isso nasce quando entrar backend/API — nesse
momento dá para expor esse mesmo shape (`atleta`, `gruposDeReforco`,
`resumoReforco`) via um endpoint real em vez do módulo JS local.

## PWA

Instalável e com funcionamento offline básico:
- `public/manifest.webmanifest` — nome, ícones, `display: standalone`, tema navy
- `public/sw.js` — service worker escrito à mão (sem Workbox/plugin): shell
  pré-cacheado no install; navegações em network-first com fallback ao `/`
  em cache; assets same-origin em cache-first com runtime caching
- Registrado só em produção (`src/main.js`, `import.meta.env.PROD`) para não
  atrapalhar o `npm run dev`

## Arquitetura (diagrama)

O item "Arquitetura" do menu **não** renderiza um diagrama interno — aponta
para o diagrama fonte no Mermaid (`pages/Arquitetura.vue` / link direto no
header), aberto em nova aba. A referência técnica de arquitetura vive lá,
não é replicada dentro do wireframe.

## Deploy

Cloudflare Pages, servindo `dist/` do build. `public/_redirects` garante o
fallback de SPA (`/* /index.html 200`) para rotas do `vue-router`.

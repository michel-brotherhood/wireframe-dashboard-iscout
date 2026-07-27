# 🎯 PROMPT PARA CLAUDE CODE - DASHBOARD GESTÃO DE TREINOS
## BIG SOCCER by iSCOUT - Plano de Aula Digital

**COPIE E COLE TUDO ISSO NO CLAUDE CODE**

---

## 📋 CONTEXTO

Você é um designer UI/UX profissional. Sua tarefa é criar wireframes detalhados para um **sistema de gestão de treinos com IA** que digitaliza o processo de planejamento e execução de treinos em uma escolinha de futebol.

### O Sistema Funciona Assim:

1. **PLANEJAMENTO (24h antes):** Treinador cria um plano de aula com 4 etapas estruturadas
2. **ESCALAÇÃO (antes do treino):** Treinador preenche súmula com 11 jogadores
3. **EXECUÇÃO (durante treino):** Treinador registra o que realmente aconteceu
4. **ANÁLISE (após treino):** Sistema calcula conformidade (plano vs execução) e gera insights de IA

### Stack Técnico:
- Frontend: React + TypeScript + TailwindCSS
- Backend: FastAPI + Python
- BD: PostgreSQL + Redis
- IA: VLM para análise de conformidade

### Usuários:
- **Coach:** Cria planos, súmulas, registra execução
- **Manager:** Aprova planos, monitora conformidade
- **Analyst:** Analisa dados e gera relatórios

---

## 🎨 DESIGN SYSTEM

### Cores:
- **Azul (#2563eb):** Primária, ações, links
- **Amarelo (#fbbf24):** Time Amarelo, destaque
- **Azul Escuro (#1e40af):** Team Azul, alternativa
- **Verde (#10b981):** Sucesso, aprovado, positivo
- **Vermelho (#ef4444):** Erro, rejeitado, negativo
- **Cinza (#6b7280):** Neutro, desabilitado
- **Branco (#ffffff):** Fundo
- **Cinza Claro (#f3f4f6):** Fundo secundário

### Tipografia:
- **Headings:** Segoe UI / Roboto, Bold, 18-24px
- **Body:** Segoe UI / Roboto, Regular, 14-16px
- **Labels:** Segoe UI / Roboto, Regular, 12-14px
- **Monospace:** Para dados técnicos

### Componentes:
- Cards com sombra leve (shadow-sm)
- Inputs com border cinza, focus azul
- Buttons com hover effect
- Tabelas com alternância de cores
- Badges para status
- Progress bars para conformidade
- Icons simples (✓, ✗, ⚠️, →, ←, +, X, 📋, ⚽, 📊, 📈)

### Spacing (Grid 8px):
- Padding cards: 16px
- Padding inputs: 8px
- Margin seções: 16px
- Margin elementos: 8px

### Responsividade:
- **Desktop:** 1920px (full layout)
- **Tablet:** 768px (2 colunas, stack)
- **Mobile:** 375px (1 coluna, stack vertical)

### Acessibilidade:
- WCAG 2.1 AA
- Contraste mínimo 4.5:1
- Labels em todos os inputs
- Navegação por teclado
- Alt text em ícones

---

## 📱 TAREFA 1: DASHBOARD PRINCIPAL

### Objetivo:
Criar a tela principal que mostra visão geral de todos os treinos, conformidade média e últimas atividades.

### Layout:

```
┌─────────────────────────────────────────────────────────────┐
│ 🏆 BIG SOCCER - Dashboard de Treinos                       │
├─────────────────────────────────────────────────────────────┤
│ Filtros: [Data: 02/07] [Team: Amarelo ▼] [Status: ▼]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ 📋 Planos    │  │ ⚽ Súmulas    │  │ 📊 Execuções │     │
│  │ 12 Total     │  │ 12 Total     │  │ 10 Total     │     │
│  │ 10 Aprovados │  │ 11 Confirmadas│  │ 10 Confirmadas│    │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 📈 Conformidade Média: 82.5%  ████████░░            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ GRÁFICO: Conformidade por Dia ──────────────────────┐  │
│  │                                                       │  │
│  │  100% ┤     ╱╲                                       │  │
│  │   80% ┤    ╱  ╲    ╱╲                                │  │
│  │   60% ┤   ╱    ╲  ╱  ╲                               │  │
│  │   40% ┤  ╱      ╲╱    ╲                              │  │
│  │   20% ┤ ╱                ╲                           │  │
│  │    0% ┼─────────────────────────────────────         │  │
│  │       └─ Seg Ter Qua Qui Sex Sab Dom                │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ ÚLTIMOS TREINOS ────────────────────────────────────┐  │
│  │ Data   │ Team    │ Coach   │ Status  │ Conformidade  │  │
│  │────────┼─────────┼─────────┼─────────┼──────────────│  │
│  │ 02/07  │ Amarelo │ João    │ ✓ Exec  │ 85% ████░   │  │
│  │ 01/07  │ Azul    │ Maria   │ ✓ Exec  │ 78% ███░    │  │
│  │ 30/06  │ Amarelo │ João    │ ✓ Exec  │ 92% █████░  │  │
│  │ 29/06  │ Azul    │ Maria   │ ⏳ Draft │ -           │  │
│  │ 28/06  │ Amarelo │ João    │ ✓ Exec  │ 88% ████░   │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Elementos:

1. **Header:**
   - Logo + Título
   - Filtros: Data (date picker), Team (dropdown: Amarelo/Azul), Status (dropdown)
   - Botão "Novo Treino"

2. **Cards de Métricas (4 cards):**
   - Total Planos (12) com aprovados (10)
   - Total Súmulas (12) com confirmadas (11)
   - Total Execuções (10) com confirmadas (10)
   - Conformidade Média (82.5%) com barra de progresso

3. **Gráfico de Linha:**
   - Conformidade por dia da semana
   - Cores: Verde (>80%), Amarelo (60-80%), Vermelho (<60%)
   - Responsivo

4. **Tabela de Últimos Treinos:**
   - Colunas: Data, Team (com cor), Coach, Status (com ícone), Conformidade (barra)
   - Linhas clicáveis (hover effect)
   - Paginação: Mostrar 10, com "Ver mais"

### Interações:
- Clique em linha da tabela → Abre detalhe do treino
- Clique em "Novo Treino" → Abre editor de plano
- Filtros → Atualiza dashboard em tempo real
- Hover em linha → Destaca e mostra botão "Ver Detalhes"

---

## 📋 TAREFA 2: DETALHE DE TREINO

### Objetivo:
Mostrar visão completa de um treino: Plano → Súmula → Execution → Conformidade

### Layout (4 Seções):

```
┌─────────────────────────────────────────────────────────────┐
│ ← Voltar | Treino: 02/07 - Team Amarelo - João Silva       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─ SEÇÃO 1: PLANO DE AULA ──────────────────────────────┐  │
│ │ Status: ✓ Aprovado (01/07 às 14:30 por Manager)      │  │
│ │ Fase: Ofensiva                                         │  │
│ │                                                         │  │
│ │ 📋 Etapa Inicial (Aquecimento) - Planejado: 10 min   │  │
│ │    Objetivo: Refinamento do gesto motor               │  │
│ │    Coordenação: Aquecimento Lúdico                    │  │
│ │    Estações: Com bola, Sem bola, Recreativo          │  │
│ │                                                         │  │
│ │ 📋 Etapa Funcionamento - Planejado: 15 min           │  │
│ │    Objetivo: Função no modelo de jogo                │  │
│ │    Tipo: Analítico                                    │  │
│ │    Tema: Passe Curto                                  │  │
│ │                                                         │  │
│ │ 📋 Etapa Principal - Planejado: 35 min               │  │
│ │    Objetivo: Função no modelo de jogo                │  │
│ │    Sub-temas: Projeção em Campo, Criação de Espaços  │  │
│ │    Orientações: Jogo Posicional, Respeito aos Setores│  │
│ │    Intervalo: Hidratação 5min, Repouso 2min, ...    │  │
│ │                                                         │  │
│ │ Total Planejado: 60 minutos                           │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌─ SEÇÃO 2: SÚMULA ──────────────────────────────────────┐  │
│ │ Status: ✓ Confirmada (02/07 às 09:00)                │  │
│ │ Escalação: 11 jogadores                               │  │
│ │                                                         │  │
│ │ Jersey │ Nome              │ Posição   │ Starter      │  │
│ │────────┼───────────────────┼───────────┼──────────    │  │
│ │ 1      │ João Silva        │ Goleiro   │ ✓           │  │
│ │ 2      │ Maria Santos      │ Lateral   │ ✓           │  │
│ │ 3      │ Pedro Costa       │ Zagueiro  │ ✓           │  │
│ │ 4      │ Ana Silva         │ Zagueira  │ ✓           │  │
│ │ 5      │ Carlos Oliveira   │ Lateral   │ ✓           │  │
│ │ 6      │ Fernanda Costa    │ Meia      │ ✓           │  │
│ │ 7      │ Bruno Silva       │ Meia      │ ✓           │  │
│ │ 8      │ Juliana Santos    │ Meia      │ ✓           │  │
│ │ 9      │ Ricardo Oliveira  │ Atacante  │ ✓           │  │
│ │ 10     │ Beatriz Costa     │ Atacante  │ ✓           │  │
│ │ 11     │ Gustavo Silva     │ Atacante  │ ✓           │  │
│ │                                                         │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌─ SEÇÃO 3: EXECUTION LOG ───────────────────────────────┐  │
│ │ Status: ✓ Confirmada (02/07 às 18:00)                │  │
│ │                                                         │  │
│ │ 📊 Etapa Inicial (Aquecimento)                        │  │
│ │    Planejado: 10 min  │  Executado: 12 min  │ +2 min │  │
│ │    Observações: Aquecimento mais longo que o previsto │  │
│ │                                                         │  │
│ │ 📊 Etapa Funcionamento                                │  │
│ │    Planejado: 15 min  │  Executado: 14 min  │ -1 min │  │
│ │    Observações: Exercício de passe curto funcionou   │  │
│ │                                                         │  │
│ │ 📊 Etapa Principal                                    │  │
│ │    Planejado: 35 min  │  Executado: 36 min  │ +1 min │  │
│ │    Observações: Jogo posicional com bom entendimento │  │
│ │                                                         │  │
│ │ ⚠️ Desvios Registrados:                                │  │
│ │    • Etapa Inicial (Impacto: Baixo)                   │  │
│ │      "Aquecimento mais longo, mas positivo"           │  │
│ │    • Etapa Principal (Impacto: Médio)                 │  │
│ │      "Um jogador lesionou no intervalo"               │  │
│ │                                                         │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                             │
│ ┌─ SEÇÃO 4: CONFORMIDADE ────────────────────────────────┐  │
│ │                                                         │  │
│ │ Score: 85%  ████████░░                                │  │
│ │                                                         │  │
│ │ Análise Detalhada:                                    │  │
│ │ ✓ Fase: Ofensiva (match com planejamento)            │  │
│ │ ⚠️ Tempos: Diferença de 3 min total (+2, -1, +1)     │  │
│ │ ✓ Exercícios: Todos os 3 exercícios executados       │  │
│ │ ⚠️ Desvios: 2 desvios registrados (1 baixo, 1 médio) │  │
│ │                                                         │  │
│ │ 🤖 Insights de IA:                                    │  │
│ │ • "Treino bem estruturado com boa conformidade"      │  │
│ │ • "Ajustes de tempo foram mínimos e aceitáveis"      │  │
│ │ • "Lesão no intervalo foi bem gerenciada"            │  │
│ │ • "Recomendação: Manter estrutura, revisar protocolo │  │
│ │    de segurança no intervalo"                         │  │
│ │                                                         │  │
│ │ [Editar] [Exportar Relatório] [Compartilhar]         │  │
│ │                                                         │  │
│ └─────────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Elementos:

1. **Header:**
   - Botão voltar
   - Título com data, team, coach
   - Botões de ação: Editar, Exportar, Compartilhar

2. **Seção 1 - Plano de Aula:**
   - Status com data/hora e quem aprovou
   - Fase (Ofensiva/Defensiva)
   - 4 etapas em cards: Inicial, Funcionamento, Principal, Observações
   - Cada etapa mostra: Objetivo, Duração planejada, Detalhes

3. **Seção 2 - Súmula:**
   - Status com data/hora de confirmação
   - Tabela com 11 jogadores (Jersey, Nome, Posição, Starter)
   - Botão "Editar Escalação"

4. **Seção 3 - Execution Log:**
   - Status com data/hora de confirmação
   - 3 etapas com: Planejado, Executado, Desvio (em cores)
   - Observações de cada etapa
   - Seção de desvios registrados com impacto

5. **Seção 4 - Conformidade:**
   - Score 0-100% com barra de progresso colorida
   - Análise detalhada (fase, tempos, exercícios, desvios)
   - Insights de IA (pontos fortes, recomendações)
   - Botões de ação

### Interações:
- Clique em "Editar" → Abre editor correspondente
- Clique em "Exportar Relatório" → Download PDF
- Clique em "Compartilhar" → Copia link
- Hover em insights → Mostra tooltip com mais detalhes

---

## ✏️ TAREFA 3: EDITOR DE PLANO DE AULA

### Objetivo:
Criar interface para treinador preencher plano com 4 etapas estruturadas.

### Layout (4 Abas Navegáveis):

```
┌─────────────────────────────────────────────────────────────┐
│ Criar Novo Plano de Aula                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Data: [02/07/2026]  Team: [Amarelo ▼]  Fase: [Ofensiva ▼] │
│                                                             │
│ ┌─ ABAS ─────────────────────────────────────────────────┐ │
│ │ [1. Inicial] [2. Funcionamento] [3. Principal] [4. Obs]│ │
│ └────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─ ABA 1: ETAPA INICIAL (AQUECIMENTO) ──────────────────┐ │
│ │                                                         │ │
│ │ Objetivo *                                              │ │
│ │ [Refinamento do gesto motor_________________________] │ │
│ │                                                         │ │
│ │ Duração (minutos) *                                     │ │
│ │ [10]                                                    │ │
│ │                                                         │ │
│ │ Coordenação (selecione):                                │ │
│ │ ☑ Aquecimento Lúdico                                   │ │
│ │ ☐ Aquecimento Técnico                                  │ │
│ │                                                         │ │
│ │ Estações (selecione):                                   │ │
│ │ ☑ Com bola                                             │ │
│ │ ☑ Sem bola                                             │ │
│ │ ☑ Recreativo                                           │ │
│ │                                                         │ │
│ │ Diagrama de Campo:                                      │ │
│ │ [Upload Diagrama] ou [Desenhar no Editor]              │ │
│ │ [Imagem do diagrama aqui - 300x300px]                  │ │
│ │                                                         │ │
│ │ [← Anterior] [Próximo →]                               │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─ ABA 2: ETAPA FUNCIONAMENTO ──────────────────────────┐ │
│ │                                                         │ │
│ │ Objetivo *                                              │ │
│ │ [Função no modelo de jogo_____________________________] │ │
│ │                                                         │ │
│ │ Duração (minutos) *                                     │ │
│ │ [15]                                                    │ │
│ │                                                         │ │
│ │ Tipo de Exercício *                                     │ │
│ │ ◉ Analítico   ○ Global   ○ Situacional                │ │
│ │                                                         │ │
│ │ Tema *                                                  │ │
│ │ [Passe Curto_____________________________________]     │ │
│ │                                                         │ │
│ │ Diagrama de Campo:                                      │ │
│ │ [Upload Diagrama] ou [Desenhar no Editor]              │ │
│ │ [Imagem do diagrama aqui - 300x300px]                  │ │
│ │                                                         │ │
│ │ [← Anterior] [Próximo →]                               │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─ ABA 3: ETAPA PRINCIPAL ──────────────────────────────┐ │
│ │                                                         │ │
│ │ Objetivo *                                              │ │
│ │ [Função no modelo de jogo_____________________________] │ │
│ │                                                         │ │
│ │ Duração (minutos) *                                     │ │
│ │ [35]                                                    │ │
│ │                                                         │ │
│ │ Sub-temas (adicione):                                   │ │
│ │ + Projeção em Campo                                     │ │
│ │ + Criação de Espaços                                    │ │
│ │ [+ Adicionar outro]                                     │ │
│ │                                                         │ │
│ │ Orientações (adicione):                                 │ │
│ │ + Jogo Posicional                                       │ │
│ │ + Respeito aos Setores                                  │ │
│ │ [+ Adicionar outra]                                     │ │
│ │                                                         │ │
│ │ Protocolo de Intervalo:                                 │ │
│ │ Hidratação: [5] min   Repouso: [2] min                │ │
│ │ Instruir: [3] min     Ativar: [2] min                 │ │
│ │                                                         │ │
│ │ Diagrama de Campo:                                      │ │
│ │ [Upload Diagrama] ou [Desenhar no Editor]              │ │
│ │ [Imagem do diagrama aqui - 300x300px]                  │ │
│ │                                                         │ │
│ │ [← Anterior] [Próximo →]                               │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─ ABA 4: OBSERVAÇÕES ──────────────────────────────────┐ │
│ │                                                         │ │
│ │ Observações Gerais:                                     │ │
│ │ ┌───────────────────────────────────────────────────┐  │ │
│ │ │ Treino focado em passe curto e posicionamento    │  │ │
│ │ │ Atenção especial ao intervalo para hidratação    │  │ │
│ │ │                                                   │  │ │
│ │ │                                                   │  │ │
│ │ │                                                   │  │ │
│ │ └───────────────────────────────────────────────────┘  │ │
│ │                                                         │ │
│ │ [← Anterior]                                            │ │
│ │ [Salvar como Draft]  [Submeter para Aprovação]         │ │
│ │                                                         │ │
│ │ Total Planejado: 60 minutos ✓                          │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Elementos:

1. **Header:**
   - Título "Criar Novo Plano de Aula"
   - Inputs: Data, Team, Fase

2. **Abas (4 abas navegáveis):**
   - Aba 1: Etapa Inicial
   - Aba 2: Etapa Funcionamento
   - Aba 3: Etapa Principal
   - Aba 4: Observações

3. **Cada Aba tem:**
   - Campos obrigatórios (marcados com *)
   - Validação em tempo real
   - Upload de diagrama ou editor visual
   - Navegação: [← Anterior] [Próximo →]

4. **Aba Final:**
   - Mostra total planejado (60 min)
   - Botões: [Salvar como Draft] [Submeter para Aprovação]

### Validações:
- Todos os campos obrigatórios preenchidos
- Duração total entre 30-120 minutos
- Datas válidas (24h antes)

### Interações:
- Navegação entre abas (próximo/anterior)
- Adicionar/remover sub-temas e orientações
- Upload ou desenho de diagramas
- Salvar como draft (sem validação)
- Submeter (com validação completa)

---

## ⚽ TAREFA 4: EDITOR DE SÚMULA

### Objetivo:
Criar interface para preencher escalação com 11 jogadores e resolver nomes.

### Layout:

```
┌─────────────────────────────────────────────────────────────┐
│ Criar Súmula - 02/07/2026 - Team Amarelo                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Data: [02/07/2026]  Team: [Amarelo ▼]  Event: [Take 1 - Campo 2] │
│                                                             │
│ ┌─ ADICIONAR JOGADOR ────────────────────────────────────┐ │
│ │ Jersey: [1]  Nome: [João Silva]  Starter: ☑           │ │
│ │ [Adicionar]                                             │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─ ESCALAÇÃO (11 JOGADORES) ────────────────────────────┐ │
│ │                                                         │ │
│ │ Jersey │ Nome              │ Posição   │ Starter │ Ação│ │
│ │────────┼───────────────────┼───────────┼─────────┼────│ │
│ │ 1      │ João Silva        │ Goleiro   │ ✓       │ [X]│ │
│ │ 2      │ Maria Santos      │ Lateral   │ ✓       │ [X]│ │
│ │ 3      │ Pedro Costa       │ Zagueiro  │ ✓       │ [X]│ │
│ │ 4      │ Ana Silva         │ Zagueira  │ ✓       │ [X]│ │
│ │ 5      │ Carlos Oliveira   │ Lateral   │ ✓       │ [X]│ │
│ │ 6      │ Fernanda Costa    │ Meia      │ ✓       │ [X]│ │
│ │ 7      │ Bruno Silva       │ Meia      │ ✓       │ [X]│ │
│ │ 8      │ Juliana Santos    │ Meia      │ ✓       │ [X]│ │
│ │ 9      │ Ricardo Oliveira  │ Atacante  │ ✓       │ [X]│ │
│ │ 10     │ Beatriz Costa     │ Atacante  │ ✓       │ [X]│ │
│ │ 11     │ Gustavo Silva     │ Atacante  │ ✓       │ [X]│ │
│ │                                                         │ │
│ │ Total: 11 jogadores (11 starters)                      │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Resolver Nomes]  [Confirmar Escalação]                   │
│                                                             │
│ ┌─ RESULTADO DA RESOLUÇÃO (após clicar Resolver) ──────┐ │
│ │ ✓ 9 Resolvidos                                         │ │
│ │ ⚠️ 2 Ambíguos (precisa validação manual)               │ │
│ │ ✗ 0 Não encontrados                                    │ │
│ │                                                         │ │
│ │ Ambíguos:                                               │ │
│ │ • Jersey 7 - "Bruno Silva" → Selecione:               │ │
│ │   ○ Bruno Silva (Meia, 25 anos)                        │ │
│ │   ○ Bruno Silva (Atacante, 22 anos)                    │ │
│ │                                                         │ │
│ │ • Jersey 10 - "Beatriz Costa" → Selecione:            │ │
│ │   ○ Beatriz Costa (Atacante, 23 anos)                 │ │
│ │   ○ Beatriz Costa (Meia, 26 anos)                      │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Elementos:

1. **Header:**
   - Título com data, team, event
   - Inputs: Data, Team, Event

2. **Seção "Adicionar Jogador":**
   - Jersey (input number, 1-99)
   - Nome (input text)
   - Starter (checkbox)
   - Botão [Adicionar]

3. **Tabela de Escalação:**
   - Colunas: Jersey, Nome, Posição, Starter, Ação
   - Cada linha tem botão [X] para remover
   - Total de jogadores no rodapé

4. **Botões de Ação:**
   - [Resolver Nomes] → Chama fuzzy matching
   - [Confirmar Escalação] → Valida e confirma

5. **Resultado da Resolução (modal/seção):**
   - Mostra: Resolvidos, Ambíguos, Não encontrados
   - Para ambíguos: Radio buttons para selecionar
   - Botão [Confirmar Seleções]

### Validações:
- Jersey entre 1-99
- Sem duplicatas
- Sem bloqueados (24, 51, 69)
- 11 jogadores exatamente

### Interações:
- Adicionar jogador → Aparece na tabela
- Remover jogador → Desaparece da tabela
- Resolver nomes → Mostra resultado com ambíguos
- Confirmar → Valida e fecha editor

---

## 📊 TAREFA 5: EDITOR DE EXECUTION LOG

### Objetivo:
Registrar como o treino realmente aconteceu (tempos reais, desvios, observações).

### Layout:

```
┌─────────────────────────────────────────────────────────────┐
│ Registrar Execução - 02/07/2026 - Team Amarelo - João      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Referência:                                                 │
│ Plano: 02/07/2026 - Ofensiva - 60 min total               │
│ Súmula: ✓ Confirmada - 11 jogadores                        │
│                                                             │
│ ┌─ ETAPA INICIAL (AQUECIMENTO) ─────────────────────────┐ │
│ │ Planejado: 10 minutos                                  │ │
│ │ Executado: [12] minutos                                │ │
│ │ Desvio: +2 minutos (⚠️ Acima do planejado)             │ │
│ │ Observações: [Aquecimento mais longo que o previsto___] │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─ ETAPA FUNCIONAMENTO ─────────────────────────────────┐ │
│ │ Planejado: 15 minutos                                  │ │
│ │ Executado: [14] minutos                                │ │
│ │ Desvio: -1 minuto (✓ Dentro do esperado)               │ │
│ │ Observações: [Exercício de passe curto funcionou bem_] │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─ ETAPA PRINCIPAL ─────────────────────────────────────┐ │
│ │ Planejado: 35 minutos                                  │ │
│ │ Executado: [36] minutos                                │ │
│ │ Desvio: +1 minuto (✓ Dentro do esperado)               │ │
│ │ Observações: [Jogo posicional com bom entendimento____] │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                             │
│ Total Executado: 62 minutos (Planejado: 60 min)            │
│ Diferença Total: +2 minutos                                │
│                                                             │
│ ┌─ DESVIOS REGISTRADOS ─────────────────────────────────┐ │
│ │ [+ Adicionar desvio]                                   │ │
│ │                                                         │ │
│ │ ┌─ Desvio 1 ────────────────────────────────────────┐ │ │
│ │ │ Etapa: [Inicial ▼]                                 │ │ │
│ │ │ Impacto: [Baixo ▼]                                 │ │ │
│ │ │ Descrição: [Aquecimento mais longo, mas positivo_] │ │ │
│ │ │ [X] Remover                                        │ │ │
│ │ └────────────────────────────────────────────────────┘ │ │
│ │                                                         │ │
│ │ ┌─ Desvio 2 ────────────────────────────────────────┐ │ │
│ │ │ Etapa: [Principal ▼]                               │ │ │
│ │ │ Impacto: [Médio ▼]                                 │ │ │
│ │ │ Descrição: [Um jogador lesionou no intervalo_____] │ │ │
│ │ │ [X] Remover                                        │ │ │
│ │ └────────────────────────────────────────────────────┘ │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Salvar como Draft]  [Confirmar Execução]                  │
│                                                             │
│ Ao confirmar:                                               │
│ • Sistema calcula conformidade: 85%                        │ │
│ • IA gera insights                                         │ │
│ • Execution log fica confirmado                            │ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Elementos:

1. **Header:**
   - Título com data, team, coach
   - Referência ao plano e súmula

2. **3 Seções (uma para cada etapa):**
   - Planejado (label, não editável)
   - Executado (input number)
   - Desvio (calculado automaticamente, com cor)
   - Observações (textarea)
   - Cores: Verde (<2 min), Amarelo (2-5 min), Vermelho (>5 min)

3. **Total Executado:**
   - Mostra soma dos tempos reais
   - Mostra diferença total vs planejado

4. **Seção "Desvios Registrados":**
   - [+ Adicionar desvio]
   - Cada desvio: Etapa (dropdown), Impacto (dropdown), Descrição (textarea), [X] Remover

5. **Botões:**
   - [Salvar como Draft]
   - [Confirmar Execução]

### Validações:
- Tempos reais > 0
- Observações preenchidas (opcional)
- Ao confirmar: Calcula conformidade

### Interações:
- Preencher tempos → Calcula desvios em tempo real
- Adicionar desvio → Aparece novo card
- Remover desvio → Desaparece
- Confirmar → Calcula conformidade e gera insights de IA

---

## 🎨 ESTILO GERAL

### Tipografia:
- **Headings (H1-H3):** Segoe UI / Roboto, Bold, 18-24px
- **Body:** Segoe UI / Roboto, Regular, 14-16px
- **Labels:** Segoe UI / Roboto, Regular, 12-14px

### Cores por Status:
- **Draft:** Cinza (#6b7280)
- **Submitted:** Amarelo (#fbbf24)
- **Approved:** Verde (#10b981)
- **Confirmed:** Verde (#10b981)
- **Rejected:** Vermelho (#ef4444)

### Componentes Reutilizáveis:
- **Cards:** Sombra leve, border cinza claro
- **Inputs:** Border cinza, focus azul
- **Buttons:** Azul primário, hover mais escuro
- **Tables:** Alternância de cores (branco/cinza claro)
- **Progress Bars:** Cores por faixa (verde/amarelo/vermelho)
- **Badges:** Status com cores apropriadas

### Responsividade:
- **Desktop (1920px):** Layout full com 2-3 colunas
- **Tablet (768px):** Layout 2 colunas, stack vertical
- **Mobile (375px):** Layout 1 coluna, stack vertical

---

## 📝 NOTAS IMPORTANTES

1. **Campos Obrigatórios:** Marcar com * (asterisco)
2. **Validação:** Em tempo real com mensagens claras
3. **Estados:** Mostrar draft/submitted/approved/confirmed com cores
4. **Ícones:** Usar simples e consistentes (✓, ✗, ⚠️, →, ←, +, X)
5. **Acessibilidade:** WCAG 2.1 AA (contraste, navegação por teclado)
6. **Responsividade:** Testar em desktop, tablet, mobile
7. **Performance:** Lazy loading em tabelas grandes
8. **Feedback:** Mostrar loading, sucesso, erro com mensagens claras

---

## 🚀 COMECE!

Crie wireframes profissionais e detalhados para as 5 tarefas acima. Use o design system especificado. Garanta responsividade e acessibilidade.

Boa sorte! 🎉

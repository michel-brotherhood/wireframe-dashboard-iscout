# 📊 DIAGRAMAS MERMAID - PARA CLAUDE CODE VISUALIZAR
## Dashboard de Gestão de Treinos - BIG SOCCER by iSCOUT

**Use estes diagramas como referência visual enquanto cria os wireframes**

---

## DIAGRAMA 1: ARQUITETURA DO SISTEMA

```mermaid
graph TB
    subgraph Frontend["🖥️ FRONTEND<br/>React + TypeScript + TailwindCSS"]
        PlanEditor["📋 Editor de Plano<br/>4 Etapas"]
        SumulaEditor["⚽ Editor de Súmula<br/>11 Jogadores"]
        ExecutionEditor["📊 Editor de Execution<br/>Tempos Reais"]
        Dashboard["📈 Dashboard<br/>Conformidade + Insights"]
    end

    subgraph API["🔌 API REST<br/>FastAPI + Python"]
        PlanAPI["POST /plans<br/>GET /plans/{id}<br/>PUT /plans/{id}<br/>POST /plans/{id}:submit<br/>POST /plans/{id}:approve"]
        SumulaAPI["POST /sumulas<br/>POST /sumulas/{id}/entries<br/>POST /sumulas/{id}:resolve<br/>POST /sumulas/{id}:confirm"]
        ExecutionAPI["POST /execution-logs<br/>PUT /execution-logs/{id}<br/>POST /execution-logs/{id}:confirm"]
        DashboardAPI["GET /dashboard/metrics<br/>GET /dashboard/conformance<br/>GET /dashboard/recent"]
    end

    subgraph Services["⚙️ SERVICES<br/>Lógica de Negócio"]
        PlanService["PlanService<br/>Criar, Validar, Aprovar"]
        SumulaService["SumulaService<br/>Criar, Resolver, Confirmar"]
        ExecutionService["ExecutionService<br/>Criar, Calcular Conformidade"]
        RosterResolver["RosterResolver<br/>Fuzzy Matching"]
    end

    subgraph Data["💾 PERSISTÊNCIA"]
        PostgreSQL["PostgreSQL<br/>plan_aula<br/>match_sumula<br/>sumula_entry<br/>execution_log<br/>roster_assignments"]
        Redis["Redis<br/>Cache (5 min)<br/>Sessions (24h)"]
        S3["S3<br/>Diagramas<br/>Vídeos"]
    end

    PlanEditor --> PlanAPI
    SumulaEditor --> SumulaAPI
    ExecutionEditor --> ExecutionAPI
    Dashboard --> DashboardAPI

    PlanAPI --> PlanService
    SumulaAPI --> SumulaService
    ExecutionAPI --> ExecutionService
    DashboardAPI --> PlanService
    DashboardAPI --> ExecutionService

    PlanService --> PostgreSQL
    SumulaService --> PostgreSQL
    ExecutionService --> PostgreSQL
    RosterResolver --> PostgreSQL

    PlanService --> Redis
    SumulaService --> Redis
    ExecutionService --> Redis

    SumulaService --> S3
    ExecutionService --> S3

    style Frontend fill:#e3f2fd,stroke:#2563eb,stroke-width:2px
    style API fill:#f3e5f5,stroke:#7c3aed,stroke-width:2px
    style Services fill:#e8f5e9,stroke:#10b981,stroke-width:2px
    style Data fill:#fff3e0,stroke:#f59e0b,stroke-width:2px
```

---

## DIAGRAMA 2: FLUXO DE 4 FASES

```mermaid
graph LR
    subgraph Phase1["📋 FASE 1<br/>PLANEJAMENTO<br/>24h antes"]
        P1A["Treinador<br/>Cria Plano"]
        P1B["Define 4<br/>Etapas"]
        P1C["Submete para<br/>Aprovação"]
        P1D["Status:<br/>draft → approved"]
    end

    subgraph Phase2["⚽ FASE 2<br/>ESCALAÇÃO<br/>Antes do treino"]
        P2A["Preenche<br/>Súmula"]
        P2B["Jersey +<br/>Nome +<br/>Posição"]
        P2C["Resolve<br/>Nomes"]
        P2D["Status:<br/>draft → confirmed"]
    end

    subgraph Phase3["📊 FASE 3<br/>EXECUÇÃO<br/>Durante treino"]
        P3A["Registra<br/>Execution Log"]
        P3B["Tempos reais<br/>+ Exercícios<br/>+ Desvios"]
        P3C["Calcula<br/>Conformidade"]
        P3D["Status:<br/>draft → confirmed"]
    end

    subgraph Phase4["📈 FASE 4<br/>ANÁLISE<br/>Após treino"]
        P4A["Dashboard<br/>Mostra"]
        P4B["Plano vs<br/>Execução"]
        P4C["Insights<br/>de IA"]
        P4D["Auditoria<br/>Completa"]
    end

    P1A --> P1B --> P1C --> P1D
    P2A --> P2B --> P2C --> P2D
    P3A --> P3B --> P3C --> P3D
    P4A --> P4B --> P4C --> P4D

    P1D -.->|Referência| P3A
    P2D -.->|Referência| P3A
    P3D -.->|Dados| P4A

    style Phase1 fill:#e3f2fd,stroke:#2563eb,stroke-width:2px
    style Phase2 fill:#f3e5f5,stroke:#7c3aed,stroke-width:2px
    style Phase3 fill:#e8f5e9,stroke:#10b981,stroke-width:2px
    style Phase4 fill:#fff3e0,stroke:#f59e0b,stroke-width:2px
```

---

## DIAGRAMA 3: CICLO DE VIDA DE UM TREINO

```mermaid
stateDiagram-v2
    [*] --> PlanDraft: Treinador cria
    
    PlanDraft --> PlanSubmitted: Submete
    PlanSubmitted --> PlanApproved: Gestor aprova
    PlanSubmitted --> PlanRejected: Gestor rejeita
    PlanRejected --> PlanDraft: Volta para edição
    
    PlanApproved --> SumulaDraft: Preenche súmula
    SumulaDraft --> SumulaConfirmed: Confirma escalação
    
    SumulaConfirmed --> ExecutionDraft: Treino acontece
    ExecutionDraft --> ExecutionConfirmed: Registra execução
    
    ExecutionConfirmed --> Analyzed: Calcula conformidade
    Analyzed --> [*]: Finalizado
    
    note right of PlanDraft
        Status: draft
        Pode ser editado
        Não aparece em dashboard
    end note
    
    note right of PlanApproved
        Status: approved
        Pronto para execução
        Aparece em dashboard
    end note
    
    note right of SumulaConfirmed
        Status: confirmed
        Escalação projetada em roster
        Gate de processamento OK
    end note
    
    note right of ExecutionConfirmed
        Status: confirmed
        Conformidade calculada
        Insights de IA gerados
    end note
```

---

## DIAGRAMA 4: FLUXO DE DADOS DA DASHBOARD

```mermaid
graph TD
    User["👤 Usuário<br/>Acessa Dashboard"]
    
    User --> Frontend["📱 Frontend<br/>Aplica Filtros"]
    Frontend --> API1["GET /api/v1/dashboard/metrics"]
    Frontend --> API2["GET /api/v1/dashboard/conformance"]
    
    API1 --> Cache{"⚡ Redis<br/>Cache<br/>hit?"}
    API2 --> Cache
    
    Cache -->|Sim| CacheReturn["Retorna<br/>em cache<br/>~10ms"]
    Cache -->|Não| Service["⚙️ Service<br/>Executa queries"]
    
    Service --> Q1["SELECT COUNT(*)<br/>FROM plan_aula"]
    Service --> Q2["SELECT COUNT(*)<br/>FROM match_sumula"]
    Service --> Q3["SELECT AVG(conformance)<br/>FROM execution_log"]
    Service --> Q4["SELECT * FROM execution_log<br/>ORDER BY created_at DESC"]
    
    Q1 --> DB["💾 PostgreSQL<br/>Índices otimizados"]
    Q2 --> DB
    Q3 --> DB
    Q4 --> DB
    
    DB --> Service
    Service --> Aggregation["Agrega<br/>Dados"]
    Aggregation --> Metrics["📊 Cards de<br/>Métricas"]
    Aggregation --> Chart["📈 Gráfico de<br/>Conformidade"]
    Aggregation --> Table["📋 Tabela de<br/>Últimos Treinos"]
    
    CacheReturn --> Metrics
    CacheReturn --> Chart
    CacheReturn --> Table
    
    Metrics --> Display["🎨 Visualização<br/>na Dashboard"]
    Chart --> Display
    Table --> Display
    
    Display --> User
    
    style User fill:#e3f2fd
    style Frontend fill:#f3e5f5
    style API1 fill:#f3e5f5
    style API2 fill:#f3e5f5
    style Cache fill:#fff3e0
    style Service fill:#e8f5e9
    style DB fill:#fff3e0
    style Display fill:#e3f2fd
    style Metrics fill:#c8e6c9
    style Chart fill:#c8e6c9
    style Table fill:#c8e6c9
```

---

## DIAGRAMA 5: FLUXO DE CRIAÇÃO DE PLANO

```mermaid
sequenceDiagram
    actor Coach as 🏃 Treinador
    participant Frontend as 📱 Frontend
    participant API as 🔌 API
    participant Service as ⚙️ Service
    participant DB as 💾 PostgreSQL

    Coach->>Frontend: 1. Clica "Criar Plano"
    Frontend->>Frontend: 2. Abre editor com 4 abas
    Coach->>Frontend: 3-6. Preenche 4 etapas
    Coach->>Frontend: 7. Clica "Salvar"
    
    Frontend->>API: 8. POST /api/v1/plans
    API->>Service: 9. create_plan(payload)
    Service->>Service: 10. Valida (24h antes? duração 30-120min?)
    Service->>DB: 11. INSERT INTO plan_aula
    DB-->>Service: 12. Plan criado (id, status='draft')
    Service-->>API: 13. Response 201 Created
    API-->>Frontend: 14. Plan com status 'draft'
    Frontend-->>Coach: 15. "Plano criado com sucesso"

    Coach->>Frontend: 16. Clica "Submeter para Aprovação"
    Frontend->>API: 17. POST /api/v1/plans/{id}:submit
    API->>Service: 18. submit_plan(plan_id)
    Service->>DB: 19. UPDATE plan_aula SET status = 'submitted'
    DB-->>Service: 20. Atualizado
    Service-->>API: 21. Response 200 OK
    API-->>Frontend: 22. Plan com status 'submitted'
    Frontend-->>Coach: 23. "Plano submetido para aprovação"
    
    Note over Coach,DB: Gestor recebe notificação
```

---

## DIAGRAMA 6: FLUXO DE CONFIRMAÇÃO DE SÚMULA

```mermaid
sequenceDiagram
    actor Coach as 🏃 Treinador
    participant Frontend as 📱 Frontend
    participant API as 🔌 API
    participant Service as ⚙️ Service
    participant Resolver as 🔧 RosterResolver
    participant DB as 💾 PostgreSQL

    Coach->>Frontend: 1. Clica "Criar Súmula"
    Frontend->>API: 2. POST /api/v1/sumulas
    API->>Service: 3. create_sumula()
    Service->>DB: 4. INSERT INTO match_sumula (status='draft')
    DB-->>Service: 5. Súmula criada
    Service-->>API: 6. Response 201
    API-->>Frontend: 7. Súmula vazia
    Frontend-->>Coach: 8. "Adicione 11 jogadores"

    Coach->>Frontend: 9. Preenche 11 jogadores (jersey + nome)
    Frontend->>API: 10. POST /api/v1/sumulas/{id}/entries (bulk)
    API->>Service: 11. add_entries(sumula_id, entries)
    Service->>DB: 12. INSERT INTO sumula_entry (11 linhas)
    DB-->>Service: 13. Entries criadas
    Service-->>API: 14. Response 201
    API-->>Frontend: 15. Entries adicionadas
    Frontend-->>Coach: 16. "11 jogadores adicionados"

    Coach->>Frontend: 17. Clica "Resolver Nomes"
    Frontend->>API: 18. POST /api/v1/sumulas/{id}:resolve
    API->>Service: 19. resolve_entries(sumula_id)
    Service->>Resolver: 20. fuzzy_match(nome, team)
    Resolver->>DB: 21. SELECT * FROM athletes WHERE team=?
    DB-->>Resolver: 22. Lista de atletas
    Resolver-->>Service: 23. Resolvidos, ambíguos, não encontrados
    Service->>DB: 24. UPDATE sumula_entry SET athlete_id=?
    DB-->>Service: 25. Entries atualizadas
    Service-->>API: 26. Response 200
    API-->>Frontend: 27. Status de resolução
    Frontend-->>Coach: 28. "9 resolvidos, 2 ambíguos, 0 não encontrados"

    Coach->>Frontend: 29. Clica "Confirmar Escalação"
    Frontend->>API: 30. POST /api/v1/sumulas/{id}:confirm
    API->>Service: 31. confirm_sumula(sumula_id)
    Service->>DB: 32. BEGIN TRANSACTION
    Service->>DB: 33. UPDATE match_sumula SET status='confirmed'
    Service->>DB: 34. INSERT INTO roster_assignments (11 linhas)
    Service->>DB: 35. COMMIT TRANSACTION
    DB-->>Service: 36. Súmula confirmada
    Service-->>API: 37. Response 200
    API-->>Frontend: 38. Súmula confirmada
    Frontend-->>Coach: 39. "Escalação confirmada e projetada"
```

---

## DIAGRAMA 7: FLUXO DE EXECUTION LOG

```mermaid
sequenceDiagram
    actor Coach as 🏃 Treinador
    participant Frontend as 📱 Frontend
    participant API as 🔌 API
    participant Service as ⚙️ Service
    participant VLM as 🤖 VLM (IA)
    participant DB as 💾 PostgreSQL

    Coach->>Frontend: 1. Clica "Registrar Execução"
    Frontend->>API: 2. POST /api/v1/execution-logs
    API->>Service: 3. create_execution_log(plan_id, sumula_id)
    Service->>DB: 4. INSERT INTO execution_log (status='draft')
    DB-->>Service: 5. Execution log criado
    Service-->>API: 6. Response 201
    API-->>Frontend: 7. Execution log vazio
    Frontend-->>Coach: 8. "Preencha tempos reais"

    Coach->>Frontend: 9. Preenche tempos (etapa inicial, func, principal)
    Coach->>Frontend: 10. Adiciona desvios (motivo, impacto)
    Coach->>Frontend: 11. Clica "Confirmar Execução"
    
    Frontend->>API: 12. POST /api/v1/execution-logs/{id}:confirm
    API->>Service: 13. confirm_execution_log(execution_id)
    Service->>Service: 14. Calcula conformance_score (0-100%)
    Service->>VLM: 15. Analisa desvios e gera insights
    VLM-->>Service: 16. Insights de IA (pontos fortes, recomendações)
    Service->>DB: 17. UPDATE execution_log SET status='confirmed', conformance_score=?, insights=?
    DB-->>Service: 18. Execution log confirmado
    Service-->>API: 19. Response 200
    API-->>Frontend: 20. Execution log com score
    Frontend-->>Coach: 21. "Execução registrada com conformidade 85%"
```

---

## DIAGRAMA 8: MODELO DE DADOS (ER)

```mermaid
erDiagram
    USERS ||--o{ PLAN_AULA : creates
    USERS ||--o{ MATCH_SUMULA : creates
    USERS ||--o{ EXECUTION_LOG : creates

    PLAN_AULA ||--|| EXECUTION_LOG : "1:1"
    MATCH_SUMULA ||--|| EXECUTION_LOG : "1:1"
    MATCH_SUMULA ||--o{ SUMULA_ENTRY : contains
    SUMULA_ENTRY }o--|| ATHLETES : references
    ROSTER_ASSIGNMENTS }o--|| ATHLETES : assigns

    PLAN_AULA {
        uuid id PK
        date session_date
        string team_label
        uuid coach_id FK
        string phase
        string status
        json etapa_inicial
        json etapa_funcionamento
        json etapa_principal
        text observacoes
        timestamp created_at
        timestamp approved_at
    }

    MATCH_SUMULA {
        uuid id PK
        date session_date
        string team_label
        string event_label
        string status
        uuid created_by FK
        timestamp created_at
        timestamp confirmed_at
    }

    SUMULA_ENTRY {
        uuid id PK
        uuid sumula_id FK
        int jersey_number
        uuid athlete_id FK
        string athlete_name
        string position
        boolean starter
    }

    EXECUTION_LOG {
        uuid id PK
        uuid plan_aula_id FK
        uuid sumula_id FK
        int etapa_inicial_duracao_real
        int etapa_func_duracao_real
        int etapa_principal_duracao_real
        json desvios
        int conformance_score
        string status
        timestamp created_at
        timestamp confirmed_at
    }

    ROSTER_ASSIGNMENTS {
        uuid id PK
        string team_label
        int jersey_number
        uuid athlete_id FK
        date valid_from
        date valid_to
    }

    ATHLETES {
        uuid id PK
        string name
        int age
        string position
    }

    USERS {
        uuid id PK
        string email
        string name
        string role
    }
```

---

## DIAGRAMA 9: CONFORMIDADE - CÁLCULO

```mermaid
graph TD
    Input["Execution Log<br/>Tempos Reais<br/>Desvios<br/>Exercícios"]
    
    Input --> C1["Fase Match<br/>20%"]
    Input --> C2["Tempos<br/>30%"]
    Input --> C3["Exercícios<br/>30%"]
    Input --> C4["Desvios<br/>20%"]
    
    C1 --> C1Check{"Fase do plano<br/>==<br/>Fase execução?"}
    C1Check -->|Sim| C1Score["20 pontos"]
    C1Check -->|Não| C1Score2["0 pontos"]
    
    C2 --> C2Check{"Diferença<br/>tempo total"}
    C2Check -->|< 2 min| C2Score["30 pontos"]
    C2Check -->|2-5 min| C2Score2["20 pontos"]
    C2Check -->|> 5 min| C2Score3["10 pontos"]
    
    C3 --> C3Check{"Exercícios<br/>executados?"}
    C3Check -->|Todos| C3Score["30 pontos"]
    C3Check -->|Parcial| C3Score2["15 pontos"]
    C3Check -->|Nenhum| C3Score3["0 pontos"]
    
    C4 --> C4Check{"Impacto<br/>dos desvios"}
    C4Check -->|Baixo| C4Score["20 pontos"]
    C4Check -->|Médio| C4Score2["10 pontos"]
    C4Check -->|Alto| C4Score3["0 pontos"]
    
    C1Score --> Sum["Soma<br/>Todos os Pontos"]
    C1Score2 --> Sum
    C2Score --> Sum
    C2Score2 --> Sum
    C2Score3 --> Sum
    C3Score --> Sum
    C3Score2 --> Sum
    C3Score3 --> Sum
    C4Score --> Sum
    C4Score2 --> Sum
    C4Score3 --> Sum
    
    Sum --> Result["Conformance Score<br/>0-100%"]
    
    Result --> Interpretation["Interpretação:<br/>90-100%: Excelente<br/>80-89%: Bom<br/>70-79%: Aceitável<br/>< 70%: Crítico"]
    
    style Input fill:#e3f2fd
    style C1 fill:#f3e5f5
    style C2 fill:#f3e5f5
    style C3 fill:#f3e5f5
    style C4 fill:#f3e5f5
    style Sum fill:#e8f5e9
    style Result fill:#c8e6c9
    style Interpretation fill:#fff3e0
```

---

## DIAGRAMA 10: ENDPOINTS DA API

```mermaid
graph TB
    API["🔌 API REST<br/>FastAPI"]
    
    API --> Plans["📋 /api/v1/plans"]
    Plans --> P1["POST - Criar plano"]
    Plans --> P2["GET - Listar planos"]
    Plans --> P3["GET /{id} - Obter um"]
    Plans --> P4["PUT /{id} - Atualizar"]
    Plans --> P5["POST /{id}:submit - Submeter"]
    Plans --> P6["POST /{id}:approve - Aprovar"]
    Plans --> P7["DELETE /{id} - Deletar"]
    
    API --> Sumulas["⚽ /api/v1/sumulas"]
    Sumulas --> S1["POST - Criar súmula"]
    Sumulas --> S2["POST /{id}/entries - Adicionar jogadores"]
    Sumulas --> S3["POST /{id}:resolve - Resolver nomes"]
    Sumulas --> S4["POST /{id}:confirm - Confirmar"]
    
    API --> Execution["📊 /api/v1/execution-logs"]
    Execution --> E1["POST - Criar"]
    Execution --> E2["PUT /{id} - Atualizar"]
    Execution --> E3["POST /{id}:confirm - Confirmar"]
    
    API --> Dashboard["📈 /api/v1/dashboard"]
    Dashboard --> D1["GET /metrics - Métricas"]
    Dashboard --> D2["GET /conformance - Conformidade"]
    Dashboard --> D3["GET /recent-trainings - Últimos"]
    
    style API fill:#f3e5f5
    style Plans fill:#e3f2fd
    style Sumulas fill:#e3f2fd
    style Execution fill:#e3f2fd
    style Dashboard fill:#e3f2fd
```

---

**Use estes diagramas como referência enquanto cria os wireframes no Claude Code!**

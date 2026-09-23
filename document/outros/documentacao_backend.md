# Estrutura do Projeto - MVP Sistema de Controle de Acesso

## 📁 Estrutura de Diretórios

```
src/backend/
│
├── config/
│   ├── database/
│   │   ├── sql/
│   │   │   ├── schema/
│   │   │   │   ├── 01_workers.sql              # Schema da tabela workers
│   │   │   │   ├── 02_services.sql             # Schema da tabela services
│   │   │   │   ├── 03_service_authorizations.sql   # Schema da tabela service_authorizations
│   │   │   │   └── 04_access_logs.sql          # Schema da tabela access_logs
│   │   │   │
│   │   │   └── seeds/
│   │   │       ├── 01_workers_seed.sql         # Dados iniciais de workers
│   │   │       ├── 02_services_seed.sql        # Dados iniciais de services
│   │   │       └── 03_authorizations_seed.sql  # Dados iniciais de autorizações
│   │   │
│   │   ├── create_tables.js                # Script para criação das tabelas
│   │   ├── db_config.js                    # Configuração de conexão com Supabase
│   │   └── fill_tables.js                  # Script para popular as tabelas
│   │
│   └── constants.js                        # Constantes da aplicação
│
├── controllers/
│   └── AccessController.js                 # Controller para requisições do ESP32
│
├── services/
│   ├── AccessValidationService.js          # Lógica de validação de acesso
│   └── LogService.js                       # Lógica de registro de logs
│
├── repositories/
│   ├── WorkerRepository.js                 # Acesso a dados de workers
│   ├── ServiceRepository.js                # Acesso a dados de services
│   └── AuthorizationRepository.js          # Acesso a dados de autorizações
│
├── routes/
│   ├── access.js                           # Rotas de acesso do ESP32
│   └── index.js                            # Agregador de rotas
│
├── middlewares/
│   └── errorHandler.js                     # Middleware de tratamento de erros
│
├── utils/
│   └── dateFormatter.js                    # Utilitário para formatação de datas
│
├── server.js                               # Arquivo principal do servidor
├── package.json                            # Dependências do projeto
├── .env                                    # Variáveis de ambiente (não versionar)
└── .env.example                            # Exemplo de variáveis de ambiente
```

---

## 🗄️ Schema do Banco de Dados

### Tabela: `workers`
```
┌─────────────────────────────────────────────────────────────┐
│ workers                                                     │
├─────────────────────────────────────────────────────────────┤
│ id                    SERIAL PRIMARY KEY                    │
│ rfid_uid              VARCHAR(50) UNIQUE NOT NULL           │
│ password_hash         VARCHAR(255) NOT NULL                 │
│ name                  VARCHAR(255) NOT NULL                 │
│ active                BOOLEAN DEFAULT true                  │
│ created_at            TIMESTAMPTZ DEFAULT NOW()             │
│ created_at_readable   VARCHAR(50)                           │
│ updated_at            TIMESTAMPTZ DEFAULT NOW()             │
│ updated_at_readable   VARCHAR(50)                           │
└─────────────────────────────────────────────────────────────┘
```

**Descrição**: Armazena informações básicas de identificação e autenticação dos trabalhadores/funcionários.

**Campos-chave**:
- `rfid_uid`: Identificador único do cartão RFID (usado para autenticação)
- `password_hash`: Senha criptografada para autenticação adicional
- `active`: Permite desativar um worker sem deletá-lo do sistema

---

### Tabela: `services`
```
┌─────────────────────────────────────────────────────────────┐
│ services                                                    │
├─────────────────────────────────────────────────────────────┤
│ id                    SERIAL PRIMARY KEY                    │
│ name                  VARCHAR(255) NOT NULL                 │
│ room_id               VARCHAR(50) NOT NULL                  │
│ rfid_responsible      VARCHAR(50) NOT NULL [FK: workers]    │
│ start_time            TIME NOT NULL                         │
│ end_time              TIME NOT NULL                         │
│ weekdays              VARCHAR(50) NOT NULL                  │
│ validity_start        TIMESTAMPTZ NOT NULL                  │
│ validity_start_readable VARCHAR(50)                         │
│ validity_end          TIMESTAMPTZ NOT NULL                  │
│ validity_end_readable VARCHAR(50)                           │
│ active                BOOLEAN DEFAULT true                  │
│ created_at            TIMESTAMPTZ DEFAULT NOW()             │
│ created_at_readable   VARCHAR(50)                           │
│ updated_at            TIMESTAMPTZ DEFAULT NOW()             │
│ updated_at_readable   VARCHAR(50)                           │
└─────────────────────────────────────────────────────────────┘
```

**Descrição**: Define os agendamentos de atividades nas salas com suas restrições de horário.

**Campos-chave**:
- `room_id`: Identificador da sala/local onde o serviço acontece
- `rfid_responsible`: Worker responsável pelo serviço (chave estrangeira)
- `start_time` e `end_time`: Horários de funcionamento do serviço
- `weekdays`: Dias da semana em que o serviço opera
- `validity_start` e `validity_end`: Período de validade do serviço

**Restrições**:
- `fk_services_responsible`: Referencia `workers(rfid_uid)` com ON DELETE RESTRICT

---

### Tabela: `service_authorizations`
```
┌─────────────────────────────────────────────────────────────┐
│ service_authorizations                                      │
├─────────────────────────────────────────────────────────────┤
│ id                    SERIAL PRIMARY KEY                    │
│ rfid_uid              VARCHAR(50) NOT NULL [FK: workers]    │
│ service_id            INTEGER NOT NULL [FK: services]       │
│ active                BOOLEAN DEFAULT true                  │
│ created_at            TIMESTAMPTZ DEFAULT NOW()             │
│ created_at_readable   VARCHAR(50)                           │
│ updated_at            TIMESTAMPTZ DEFAULT NOW()             │
│ updated_at_readable   VARCHAR(50)                           │
│                                                             │
│ UNIQUE(rfid_uid, service_id)                                │
└─────────────────────────────────────────────────────────────┘
```

**Descrição**: Relacionamento muitos-para-muitos entre workers e services. Define quais trabalhadores estão autorizados em quais serviços.

**Campos-chave**:
- `rfid_uid`: Referencia o worker autorizado
- `service_id`: Referencia o serviço no qual o worker tem autorização

**Restrições**:
- `fk_authorizations_worker`: Referencia `workers(rfid_uid)` com ON DELETE CASCADE
- `fk_authorizations_service`: Referencia `services(id)` com ON DELETE CASCADE
- `unique_worker_service`: Garante que não haverá duplicatas de autorização

---

### Tabela: `access_logs`
```
┌─────────────────────────────────────────────────────────────┐
│ access_logs                                                 │
├─────────────────────────────────────────────────────────────┤
│ id                         SERIAL PRIMARY KEY               │
│ request_id                 VARCHAR(255) UNIQUE NOT NULL     │
│ rfid_uid                   VARCHAR(50)                      │
│ room_id                    VARCHAR(50) NOT NULL             │
│ event_type                 VARCHAR(10) NOT NULL             │
│ timestamp_request          TIMESTAMPTZ NOT NULL             │
│ timestamp_request_readable VARCHAR(50)                      │
│ access_granted             BOOLEAN NOT NULL                 │
│ message                    TEXT                             │
│ service_authorization_id   INTEGER [FK: service_auth...]    │
│ origin_ip                  VARCHAR(45)                      │
│ created_at                 TIMESTAMPTZ DEFAULT NOW()        │
│ created_at_readable        VARCHAR(50)                      │
└─────────────────────────────────────────────────────────────┘

CHECK: event_type IN ('entry', 'exit')
```

**Descrição**: Registra todas as tentativas de acesso (autorizadas ou negadas). Essencial para auditoria e rastreamento de segurança.

**Campos-chave**:
- `request_id`: Identificador único da requisição (gerado pelo ESP32)
- `rfid_uid`: RFID que tentou acessar (pode ser NULL se RFID inválido)
- `room_id`: Sala onde a tentativa de acesso ocorreu
- `event_type`: Tipo de evento ('entry' ou 'exit')
- `access_granted`: Se o acesso foi concedido ou negado
- `service_authorization_id`: Autorização que validou o acesso (NULL se negado)

**Restrições**:
- `fk_logs_authorization`: Referencia `service_authorizations(id)` com ON DELETE SET NULL
- `check_event_type`: Garante que event_type seja apenas 'entry' ou 'exit'

---

## 🔗 Relacionamentos

```
┌──────────┐         ┌──────────────────────┐         ┌──────────┐
│ workers  │◄────────│ service_authorizations│────────►│ services│
└──────────┘         └──────────────────────┘         └──────────┘
     ▲                         │                            ▲
     │                         │                            │
     │                         ▼                            │
     │                  ┌─────────────┐                     │
     │                  │ access_logs │                     │
     │                  └─────────────┘                     │
     │                         │                            │
     └─────────────────────────┴────────────────────────────┘
     
Legenda:
◄──── : aponta para a chave estrangeira
```

### Detalhamento dos Relacionamentos:

**1. workers → services** (rfid_responsible)
- Relação: 1:N (Um para Muitos)
- Cada serviço tem **UM** responsável
- Um worker pode ser responsável por **MÚLTIPLOS** serviços
- Comportamento: ON DELETE RESTRICT (não permite deletar worker se ele é responsável por algum serviço)

**2. workers ↔ services** (através de service_authorizations)
- Relação: N:M (Muitos para Muitos)
- Um worker pode estar autorizado em **MÚLTIPLOS** serviços
- Um serviço pode ter **MÚLTIPLOS** workers autorizados
- Comportamento: ON DELETE CASCADE (deleta autorizações se worker ou service for deletado)

**3. access_logs → workers** (rfid_uid, nullable)
- Relação: N:1 (Muitos para Um)
- Cada log pode referenciar um worker (se o RFID for válido)
- Um worker pode ter **MÚLTIPLOS** logs
- Campo é nullable pois pode haver tentativas com RFID inválido

**4. access_logs → service_authorizations** (service_authorization_id, nullable)
- Relação: N:1 (Muitos para Um)
- Cada log pode referenciar uma autorização específica que foi validada
- Uma autorização pode aparecer em **MÚLTIPLOS** logs
- Comportamento: ON DELETE SET NULL (mantém o log mesmo se a autorização for deletada)

---

## 📋 Fluxo de Validação de Acesso

```
┌──────────────────────────────────────────────────────────────┐
│                    ESP32 → Backend                           │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │ AccessController    │
                   │ recebe requisição   │
                   └─────────────────────┘
                              │
                              ▼
              ┌────────────────────────────────┐
              │ AccessValidationService        │
              │ 1. Valida RFID                 │
              │ 2. Busca serviços ativos       │
              │ 3. Verifica autorizações       │
              │ 4. Valida horários/dias        │
              │ 5. Valida período de validade  │
              └────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
         ┌──────────┐              ┌──────────────┐
         │ Concede  │              │ Nega Acesso  │
         │ Acesso   │              │              │
         └──────────┘              └──────────────┘
                │                           │
                └─────────────┬─────────────┘
                              ▼
                     ┌─────────────────┐
                     │ LogService      │
                     │ registra log    │
                     └─────────────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │ Resposta ao ESP32   │
                   │ {granted: boolean}  │
                   └─────────────────────┘
```

---

## 📝 Observações Importantes

### Formato de Datas Readable:
O formato GMT-3 que será armazenado em todos os campos `*_readable` segue o padrão:
```
dd/mm/yyyy HH:MM:SS
```

**Exemplo**: `23/10/2025 14:30:45`

**Implementação**: Utiliza a função `toReadable()` do arquivo `utils/dateFormatter.js`

---

### Formato de Weekdays:
String com dias da semana separados por vírgula, usando as seguintes abreviações:
```
SEG,TER,QUA,QUI,SEX,SAB,DOM
```

**Exemplos válidos**:
- `SEG,QUA,SEX` → Segunda, Quarta e Sexta
- `SEG,TER,QUA,QUI,SEX` → Dias úteis
- `SAB,DOM` → Finais de semana
- `SEG,TER,QUA,QUI,SEX,SAB,DOM` → Todos os dias

---

### Estrutura de Arquivos de Configuração:

**db_config.js**: 
- Exporta cliente do Supabase configurado
- Utiliza variáveis de ambiente (.env)

**create_tables.js**:
- Script para executar todos os arquivos SQL da pasta `schema/`
- Cria as tabelas na ordem correta respeitando dependências

**fill_tables.js**:
- Script para executar todos os arquivos SQL da pasta `seeds/`
- Popula as tabelas com dados iniciais para testes

**constants.js**:
- Define constantes utilizadas em toda a aplicação
- Exemplo: códigos de erro, mensagens padrão, etc.

---

## 🔐 Políticas de Segurança

### Autenticação:
- **RFID + Senha**: Workers são autenticados por RFID e senha (password_hash)
- **Validação em Múltiplas Camadas**: 
  1. RFID válido e worker ativo
  2. Autorização para o serviço específico
  3. Horário dentro do permitido
  4. Data dentro do período de validade

### Auditoria:
- **Todos os eventos são registrados** em `access_logs`
- Tentativas negadas também são logadas
- Campos de rastreamento: `origin_ip`, `request_id`
- Timestamps em GMT-3 para facilitar análise

### Integridade de Dados:
- **Chaves estrangeiras** garantem consistência referencial
- **Restrições CHECK** validam valores permitidos
- **UNIQUE constraints** evitam duplicatas
- **Campos readable** facilitam consultas sem conversão de timezone

---

## 🚀 Próximos Passos

- [ ] Interface web para gerenciamento
- [ ] Dashboard de visualização de logs
- [ ] Notificações em tempo real
- [ ] Relatórios gerenciais
- [ ] API de administração completa
- [ ] Integração com sistemas externos
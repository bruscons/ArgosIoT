# IoTrain Frontend

Frontend do sistema de controle de acesso IoTrain desenvolvido com Next.js 14.

## Descrição

Interface web para visualização e monitoramento do sistema de controle de acesso em tempo real, incluindo dashboard interativo, relatórios históricos e monitoramento de dispositivos IoT (ESP32).

## Funcionalidades

-  **Tela de Login**: Autenticação de usuários (sem backend por enquanto)
-  **Dashboard**: Visualização em tempo real de acessos via MQTT
-  **Gráficos em Tempo Real**: Acompanhamento de acessos permitidos, negados e erros
-  **Monitoramento de Dispositivos**: Status dos dispositivos ESP32 conectados
-  **Relatórios**: Histórico completo de acessos com filtros avançados
-  **Atualização em Tempo Real**: Comunicação via MQTT para eventos instantâneos

## Instalação

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Instalação de Dependências

```bash
npm install
```

## Configuração

Crie um arquivo `.env.local` na raiz do projeto (`src/frontend/.env.local`) com as seguintes variáveis:

```env
# URL da API Backend
# Exemplo local: http://localhost:3000
# Exemplo produção: http://159.223.199.233:3000
NEXT_PUBLIC_API_URL=http://localhost:3000

# URL do Broker MQTT (WebSocket)
# Para HiveMQ Cloud com SSL: wss://[broker].s1.eu.hivemq.cloud:8884
# Para HiveMQ Cloud sem SSL: ws://[broker].s1.eu.hivemq.cloud:8883
# Exemplo local: ws://localhost:8083
NEXT_PUBLIC_MQTT_URL=wss://d8375c5d1154430bbaedae91fd4e1632.s1.eu.hivemq.cloud:8884

# Credenciais MQTT (opcional, mas recomendado para produção)
NEXT_PUBLIC_MQTT_USERNAME=Argos
NEXT_PUBLIC_MQTT_PASSWORD=ioTrain*99!
```

**Nota**: Você pode usar o arquivo `env.example` como base. Copie-o para `.env.local` e ajuste os valores conforme seu ambiente.

### Variáveis de Ambiente

| Variável | Descrição | Obrigatório | Padrão |
|----------|-----------|-------------|--------|
| `NEXT_PUBLIC_API_URL` | URL base do backend API | Sim | `http://localhost:3000` |
| `NEXT_PUBLIC_MQTT_URL` | URL do broker MQTT (WebSocket) | Sim | `ws://localhost:8083` |
| `NEXT_PUBLIC_MQTT_USERNAME` | Username para autenticação MQTT | Não | (vazio) |
| `NEXT_PUBLIC_MQTT_PASSWORD` | Password para autenticação MQTT | Não | (vazio) |

**Importante**: 
- Todas as variáveis devem começar com `NEXT_PUBLIC_` para serem acessíveis no cliente
- Para HiveMQ Cloud, use `wss://` (WebSocket Secure) na porta 8884 para SSL
- Para desenvolvimento local sem SSL, use `ws://` na porta 8083

## Executando

### Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3001`

**Nota**: O frontend roda na porta **3001** para não conflitar com o backend que roda na porta **3000**.

### Produção

```bash
npm run build
npm start
```

## Estrutura de Pastas

```
src/frontend/
├── app/                          # Páginas Next.js (App Router)
│   ├── dashboard/                # Página do dashboard principal
│   │   └── page.tsx
│   ├── login/                    # Tela de login
│   │   └── page.tsx
│   ├── relatorios/               # Página de relatórios e histórico
│   │   └── page.tsx
│   ├── layout.tsx                # Layout principal
│   ├── page.tsx                  # Página inicial (redireciona para login)
│   └── globals.css               # Estilos globais
├── components/                   # Componentes React
│   └── Dashboard/
│       ├── RealtimeChart.tsx    # Gráfico de acessos em tempo real
│       ├── DeviceMonitor.tsx     # Monitoramento de dispositivos
│       └── AccessLogsTable.tsx  # Tabela de logs de acesso
├── services/                     # Serviços de comunicação
│   ├── ApiService.ts             # Cliente HTTP para API REST
│   └── MQTTService.ts            # Cliente MQTT para tempo real
├── hooks/                        # Hooks customizados
│   ├── useRealtimeData.ts        # Hook para dados MQTT em tempo real
│   └── useAccessLogs.ts          # Hook para logs de acesso
├── utils/                        # Utilitários
│   └── dateFormatter.ts          # Formatação de datas
├── config/                       # Configurações e constantes
│   └── constants.ts              # Constantes da aplicação
├── types/                        # Definições de tipos TypeScript
│   └── index.ts
├── .env.local                    # Variáveis de ambiente (não commitado)
├── env.example                   # Exemplo de variáveis de ambiente
└── package.json
```

## Páginas

### `/login`
Tela de autenticação do sistema. Por enquanto, redireciona automaticamente para o dashboard sem validação.

### `/dashboard`
Dashboard principal com:
- **Gráfico em Tempo Real**: Visualização de acessos agrupados por minuto
- **Monitoramento de Dispositivos**: Status dos ESP32 conectados
- **Tabela de Logs**: Histórico recente de acessos

### `/relatorios`
Página de relatórios com:
- **Filtros Avançados**: Por sala, tipo de evento, e período
- **Tabela Completa**: Todos os logs de acesso com informações detalhadas

## Componentes Principais

### RealtimeChart
Gráfico de barras que exibe acessos em tempo real recebidos via MQTT, agrupados por minuto. Mostra:
- Acessos Permitidos (verde)
- Acessos Negados (vermelho)
- Erros (amarelo)

### DeviceMonitor
Lista de dispositivos ESP32 conectados ao sistema, mostrando:
- Nome e ID do dispositivo
- Status (Online/Offline/Erro)
- Sala associada
- Última atualização

### AccessLogsTable
Tabela completa de logs de acesso com colunas:
- Sala
- Atividade (Entrada/Saída)
- Equipe
- Responsável
- Número de Pessoas
- Entrada
- Saída
- Duração

## Tecnologias

- **Next.js 14+**: Framework React com App Router
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização utilitária
- **Recharts**: Biblioteca de gráficos
- **MQTT.js**: Cliente MQTT para comunicação em tempo real

## Integração

O frontend se comunica com:

### Backend API (REST)
- `GET /api/access/logs` - Buscar logs de acesso
- `GET /api/access/stats` - Buscar estatísticas
- `GET /api/devices` - Listar dispositivos

### MQTT Broker
- **Tópico de Subscrição**: `access/response/+`
- **Protocolo**: WebSocket Secure (WSS) ou WebSocket (WS)
- **Formato**: JSON

## Dados em Tempo Real vs Históricos

### Tempo Real (MQTT)
- Eventos recebidos via MQTT
- Atualização instantânea
- Últimos 100 eventos mantidos em memória
- Usado no gráfico em tempo real

### Históricos (API REST)
- Dados do banco de dados PostgreSQL
- Filtros e paginação
- Usado nas tabelas de relatórios

## Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento na porta 3001
- `npm run build` - Gera build de produção
- `npm start` - Inicia servidor de produção na porta 3001
- `npm run lint` - Executa o linter

## Desenvolvimento

### Estrutura de Dados

Os eventos MQTT seguem o formato:
```typescript
interface AccessEvent {
  request_id: string;
  response_type: 'success' | 'denied' | 'error';
  access_granted: boolean;
  message: {
    line1: string;
    line2: string;
  };
  timestamp: number;
  device_id?: string;
}
```

### Hooks Customizados

- **useRealtimeData**: Gerencia conexão MQTT e eventos em tempo real
- **useAccessLogs**: Busca e filtra logs de acesso do backend

## Licença

ISC

## Desenvolvido por

IoTrain - Inteli

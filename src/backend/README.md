# Sistema de Controle de Acesso - Backend

Sistema de backend para controle de acesso em estações de trem utilizando ESP32, RFID e PostgreSQL.

## Requisitos

- Node.js 16+ 
- PostgreSQL 12+
- npm ou yarn

## Instalação

1. Clone o repositório e navegue até a pasta backend:
```bash
cd src/backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
- Copie o arquivo `.env.example` para `.env`
- Preencha as credenciais do seu banco de dados PostgreSQL

```bash
cp .env.example .env
```

4. Configure o banco de dados:
```bash
npm run db:setup
```

Este comando vai criar todas as tabelas e preencher com dados de teste.

## Scripts Disponíveis

- `npm start` - Inicia o servidor em modo produção
- `npm run dev` - Inicia o servidor em modo desenvolvimento com auto-reload
- `npm run db:create` - Cria apenas as tabelas no banco de dados
- `npm run db:seed` - Preenche as tabelas com dados fictícios
- `npm run db:setup` - Executa db:create e db:seed em sequência

## Estrutura do Projeto

```
src/backend/
├── config/
│   ├── database/
│   │   ├── sql/
│   │   │   ├── schema/      # Scripts de criação de tabelas
│   │   │   └── seeds/       # Dados fictícios para teste
│   │   ├── db_config.js     # Configuração do PostgreSQL
│   │   ├── create_tables.js # Script para criar tabelas
│   │   └── fill_tables.js   # Script para popular dados
│   └── constants.js         # Constantes da aplicação
├── controllers/
│   └── AccessController.js  # Controller de acesso
├── services/
│   ├── AccessValidationService.js  # Lógica de validação
│   └── LogService.js               # Lógica de logging
├── repositories/
│   ├── WorkerRepository.js         # Acesso a dados de workers
│   ├── ServiceRepository.js        # Acesso a dados de services
│   └── AuthorizationRepository.js  # Acesso a dados de autorizações
├── routes/
│   ├── index.js             # Centralizador de rotas
│   └── access.js            # Rotas de acesso
├── middlewares/
│   └── errorHandler.js      # Tratamento de erros
├── utils/
│   └── dateFormatter.js     # Formatação de datas
├── server.js                # Arquivo principal
├── package.json
└── .env
```

## Endpoint Principal

### POST /api/access/verify

Endpoint para verificação de acesso pelo ESP32.

**Formato da requisição:**
```json
{
  "request_id": "SALA01_E_1729450234567_A1B2C3D4_00001",
  "timestamp": "1729450234567",
  "event_type": "ENTRY",
  "location": {
    "room_id": "SALA01",
    "door_id": "PORTA01",
    "esp_id": "ESP001"
  },
  "rfid": {
    "uid": "A1B2C3D4",
    "password_hash": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"
  },
  "message_hash": "3a52ce780950d4d969792a2559cd519d7ee8c4b067b82fc63b64e9e3e5e9f8c2"
}
```

**Formato da resposta:**
```json
{
  "request_id": "SALA01_E_1729450234567_A1B2C3D4_00001",
  "response_type": "success",
  "access_granted": true,
  "message": {
    "line1": "Acesso permitido",
    "line2": "Bem-vindo!"
  },
  "display_duration": 3000,
  "message_hash": "d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4"
}
```

## Dados de Teste

O sistema vem pré-configurado com os seguintes dados de teste:

### Workers:
- RFID: A1B2, Senha: 1234, Nome: Agent Smith
- RFID: B5C607E8, Senha: 5678, Nome: Ada Lovelace
- RFID: 0123456789ABC012, Senha: abcd, Nome: Neo

### Serviços:
- Manutenção Elétrica (SALA_A, SEG/QUA/SEX, 08:00-12:00)
- Limpeza Técnica (SALA_B, TER/QUI, 14:00-17:00)
- Reunião Técnica (SALA_C, SEG-SEX, 09:00-11:00)

## Desenvolvimento

Para desenvolvimento local com auto-reload:
```bash
npm run dev
```

O servidor iniciará na porta definida no .env (padrão: 3000).
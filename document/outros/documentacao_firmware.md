# Documentação do Firmware ESP32 - Sistema de Controle de Acesso
## Projeto TIC TRENS - Controle de Acesso para Estações de Trem

---

## 📁 Estrutura de Arquivos

```
src/firmware/
│
├── wokwi.ino                      # Arquivo principal do firmware (loop e setup)
│
├── config.h                       # Configurações gerais do sistema
│   ├── Identificação (ROOM_ID, DOOR_ID, ESP_ID)
│   ├── Configuração WiFi
│   ├── Configuração de timeouts
│   ├── Pinagem dos sensores RFID (entrada e saída)
│   ├── Pinagem e mapa do keypad
│   ├── Pinagem do LCD I2C
│   └── Pinagem do LED RGB
│
├── types.h                        # Definições de tipos, structs e enums
│   ├── SystemState (enum dos estados da máquina)
│   ├── EventType (enum ENTRY/EXIT)
│   ├── ResponseType (enum SUCCESS/ERROR)
│   ├── Location (struct com room_id, door_id, esp_id)
│   ├── RfidInfo (struct com uid e timestamp)
│   ├── AccessRequest (struct da requisição)
│   ├── AccessResponse (struct da resposta)
│   └── SystemGlobalState (struct do estado global)
│
├── door.h / door.cpp              # Classe para controle do LED RGB (representa a porta)
│   ├── init() - Inicializa pinos
│   ├── showAccess(granted) - Verde/Vermelho
│   ├── showWaiting() - Azul
│   ├── showProcessing() - Amarelo
│   ├── showError() - Vermelho
│   └── turnOff() - Apaga LED
│
├── simulated_rfid_card.h / .cpp   # Classe para simulação de cartões RFID
│   ├── getUid() - Retorna UID
│   └── getOwnerName() - Retorna nome do dono
│
└── libraries.txt                  # Lista de bibliotecas necessárias
    ├── LiquidCrystal I2C
    ├── Keypad
    ├── ArduinoJson
    ├── WiFi
    └── HttpClient
```

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                         ESP32                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │              MÁQUINA DE ESTADOS                    │     │
│  │                                                    │     │
│  │  AGUARDANDO_CONTATO → AGUARDANDO_RFID              │     │
│  │         ↓                                          │     │
│  │  AGUARDANDO_SENHA (apenas para ENTRY)              │     │
│  │         ↓                                          │     │
│  │  ENVIANDO → MOSTRANDO_RESULTADO → RESET            │     │
│  │         ↓                                          │     │
│  │  ERRO (em caso de falha)                           │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  RFID    │  │  RFID    │  │  Keypad  │  │  LCD     │     │
│  │  Entrada │  │  Saída   │  │  4x4     │  │  16x2    │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│                                                             │
│  ┌──────────┐                                               │
│  │ LED RGB  │  (Representa a porta)                         │
│  └──────────┘                                               │
│                                                             │
│  ┌──────────────────────────────────────────────┐           │
│  │          WiFi Connection                     │           │
│  └──────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP POST (JSON)
                          ▼
                   ┌──────────────┐
                   │   Backend    │
                   │   API REST   │
                   └──────────────┘
```

---

## 🎯 Conceito de Segurança: Dupla Autenticação

### Autenticação de Dois Fatores (2FA):

**1. Algo que você TEM**: Cartão RFID
- Identificação física através do cartão

**2. Algo que você SABE**: Senha pessoal
- Confirmação através de conhecimento privado

### Fluxo de Autenticação:

```
ENTRADA (ENTRY):
  1. Usuário aproxima cartão RFID → Sistema lê UID
  2. Sistema solicita senha → Usuário digita senha no keypad
  3. ESP32 envia {RFID + password_hash} → Backend valida
  4. Backend responde → LED indica resultado

SAÍDA (EXIT):
  1. Usuário aproxima cartão RFID → Sistema lê UID
  2. ESP32 envia {RFID} → Backend valida
  3. Backend responde → LED indica resultado
  
Nota: Na saída não é necessário senha (apenas RFID)
```

---

## 🔄 Máquina de Estados

### Estados do Sistema:

```
┌─────────────────────────────────────────────────────────────┐
│ STATE_AGUARDANDO_CONTATO                                    │
│ - Estado inicial                                            │
│ - LCD: "Aguardando... / Aproxime cartao"                    │
│ - LED: Apagado                                              │
│ - Aguarda: Tecla '1' (ENTRY) ou '2' (EXIT)                  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ STATE_AGUARDANDO_RFID                                       │
│ - Aguardando digitação do UID do cartão                     │
│ - LCD: "Digite cartao:"                                     │
│ - LED: Azul (showWaiting)                                   │
│ - Aceita: Dígitos 0-9, A-F (até 16 caracteres)              │
│ - Teclas especiais:                                         │
│   * → Cancela e volta ao início                             │
│   D → Apaga último dígito                                   │
│   # → Confirma RFID digitado                                │
│ - Auto-confirma ao completar 16 dígitos                     │
└─────────────────────────────────────────────────────────────┘
                          │
                ┌─────────┴─────────┐
                │                   │
        (se ENTRY)            (se EXIT)
                │                   │
                ▼                   ▼
┌──────────────────────────┐   ┌─────────────────┐
│ STATE_AGUARDANDO_SENHA   │   │  STATE_ENVIANDO │
│ - Aguarda senha          │   └─────────────────┘
│ - LCD: "Digite senha:"   │
│ - LED: Azul (showWaiting)│
│ - Aceita: 0-9, A-D       │
│ - Mostra: ****           │
│ - Teclas especiais:      │
│   * → Cancela            │
│   D → Apaga dígito       │
│   # → Confirma senha     │
│ - Auto-confirma aos 16   │
└──────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│ STATE_ENVIANDO                                              │
│ - Conecta WiFi                                              │
│ - Gera request_id único                                     │
│ - Monta JSON de requisição                                  │
│ - Envia POST HTTP para backend                              │
│ - LED: Amarelo (showProcessing)                             │
│ - LCD: "Processando..."                                     │
└─────────────────────────────────────────────────────────────┘
                │
        ┌───────┴───────┐
        │               │
     (sucesso)      (erro)
        │               │
        ▼               ▼
┌───────────────┐   ┌─────────┐
│ STATE_        │   │ STATE_  │
│ MOSTRANDO_    │   │ ERRO    │
│ RESULTADO     │   │         │
└───────────────┘   └─────────┘
        │
        ▼
   [RESET SYSTEM]
```

### Descrição Detalhada dos Estados:

#### **STATE_AGUARDANDO_CONTATO**
- **Estado inicial** do sistema
- Aguarda que o usuário escolha o tipo de operação
- Tecla '1' = Entrada (ENTRY) → requer RFID + Senha
- Tecla '2' = Saída (EXIT) → requer apenas RFID

#### **STATE_AGUARDANDO_RFID**
- Sistema aguarda digitação do UID do cartão RFID no keypad
- Suporta UIDs de até 16 caracteres hexadecimais
- Valida se o UID existe na lista de cartões (simulação)
- Na aplicação real, o RFID será lido automaticamente pelos leitores MFRC522

#### **STATE_AGUARDANDO_SENHA** (apenas para ENTRY)
- Solicita senha de 4 a 16 dígitos
- Mostra asteriscos (*) no LCD para privacidade
- Senha é hasheada antes de ser enviada (TODO: implementar hash real)

#### **STATE_ENVIANDO**
- Conecta ao WiFi (se não estiver conectado)
- Gera ID único da requisição
- Monta JSON conforme especificação
- Envia requisição POST para o backend
- Aguarda resposta com timeout

#### **STATE_MOSTRANDO_RESULTADO**
- Exibe mensagem recebida do backend no LCD
- Acende LED verde (acesso permitido) ou vermelho (negado)
- Aguarda tempo definido pelo backend (display_duration)
- Retorna automaticamente ao estado inicial

#### **STATE_ERRO**
- Estado de falha do sistema
- Pode ocorrer por: timeout WiFi, erro de servidor, JSON inválido, etc.
- Mostra código de erro no LCD
- Reseta o sistema após exibir mensagem

---

## 📊 Fluxo de Comunicação

### Requisição do ESP32 para Backend:

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

**Campos da Requisição**:
- `request_id`: ID único no formato `ROOM_EVENT_TIMESTAMP_UID_COUNTER`
- `timestamp`: Timestamp em milissegundos (será sincronizado via NTP na versão final)
- `event_type`: "ENTRY" ou "EXIT"
- `location`: Identificação física do dispositivo
- `rfid.uid`: UID do cartão RFID
- `rfid.password_hash`: Hash da senha (apenas para ENTRY)
- `message_hash`: Hash de integridade de toda a mensagem

---

### Resposta do Backend para ESP32:

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

**Campos da Resposta**:
- `request_id`: Mesmo ID da requisição (para validação)
- `response_type`: "success" ou "error"
- `access_granted`: true ou false
- `message.line1`: Primeira linha do LCD (até 16 caracteres)
- `message.line2`: Segunda linha do LCD (até 16 caracteres)
- `display_duration`: Tempo em ms para exibir mensagem (padrão: 3000ms)
- `message_hash`: Hash de integridade da resposta

---

## 🎨 Indicadores Visuais (LED RGB)

### Estados do LED:

```
┌──────────────┬─────────────────────────────────────────────┐
│   COR LED    │              SIGNIFICADO                    │
├──────────────┼─────────────────────────────────────────────┤
│   Apagado    │ Sistema aguardando interação inicial        │
├──────────────┼─────────────────────────────────────────────┤
│    Azul      │ Aguardando entrada do usuário               │
│              │ (digitação de RFID ou senha)                │
├──────────────┼─────────────────────────────────────────────┤
│   Amarelo    │ Processando requisição no servidor          │
│  (R+G mix)   │ (enviando dados e aguardando resposta)      │
├──────────────┼─────────────────────────────────────────────┤
│    Verde     │ Acesso PERMITIDO                            │
│              │ Porta pode ser aberta                       │
├──────────────┼─────────────────────────────────────────────┤
│  Vermelho    │ Acesso NEGADO ou ERRO do sistema            │
│              │ Porta permanece fechada                     │
└──────────────┴─────────────────────────────────────────────┘
```


## ⚙️ Configurações do Sistema

### Identificação do Sistema:

```cpp
#define ROOM_ID "SALA01"      // Identificador da sala
#define DOOR_ID "PORTA01"     // Identificador da porta
#define ESP_ID "ESP001"       // Identificador único do ESP32
```

### Configuração de Rede:

```cpp
#define WIFI_SSID "Wokwi-GUEST"              // Nome da rede WiFi
#define WIFI_PASSWORD ""                      // Senha da rede
#define SERVER_URL "http://127.0.0.1:80/api/access"  // Endpoint do backend
#define SERVER_PORT 80
```

### Timeouts e Limites:

```cpp
#define HTTP_TIMEOUT_MS 10000           // Timeout de requisições HTTP (10s)
#define LCD_MESSAGE_DURATION 3000       // Duração de mensagens no LCD (3s)
#define REQUEST_COUNTER_MAX 99999       // Máximo do contador antes de resetar
```

---

## 📟 Pinagem dos Componentes

### Leitores RFID (MFRC522):

```
Barramento SPI compartilhado:
├── SCK:  GPIO 18
├── MISO: GPIO 19
└── MOSI: GPIO 23

Leitor de Entrada:
├── SS:   GPIO 5
└── RST:  GPIO 22

Leitor de Saída:
├── SS:   GPIO 21
└── RST:  GPIO 27
```

### Keypad 4x4:

```
Linhas (Rows):
├── ROW1: GPIO 16
├── ROW2: GPIO 4
├── ROW3: GPIO 2
└── ROW4: GPIO 15

Colunas (Cols):
├── COL1: GPIO 32
├── COL2: GPIO 33
├── COL3: GPIO 25
└── COL4: GPIO 17

Mapa de Teclas:
┌───┬───┬───┬───┐
│ 1 │ 2 │ 3 │ A │
├───┼───┼───┼───┤
│ 4 │ 5 │ 6 │ B │
├───┼───┼───┼───┤
│ 7 │ 8 │ 9 │ C │
├───┼───┼───┼───┤
│ * │ 0 │ # │ D │
└───┴───┴───┴───┘
```

### LCD 16x2 (I2C):

```
├── SDA: GPIO 26
├── SCL: GPIO 14
└── I2C Address: 0x27
```

### LED RGB (Porta):

```
├── RED:   GPIO 0
├── GREEN: GPIO 13
└── BLUE:  GPIO 12
```

---

## 🔐 Formato do Request ID

### Estrutura:

```
ROOM_ID _ EVENT_TYPE _ TIMESTAMP _ RFID_UID _ COUNTER
   ↓          ↓            ↓           ↓         ↓
SALA01  _    E    _  1729450234567 _ A1B2C3D4 _ 00001
```

### Componentes:

1. **ROOM_ID**: Identificador da sala (ex: SALA01)
2. **EVENT_TYPE**: 
   - `E` = ENTRY (Entrada)
   - `S` = EXIT (Saída - do inglês "Saída")
3. **TIMESTAMP**: Timestamp em milissegundos desde epoch
4. **RFID_UID**: UID do cartão RFID
5. **COUNTER**: Contador sequencial com 5 dígitos (00001 a 99999)

### Exemplos:

```
SALA01_E_1729450234567_A1B2C3D4_00001  → Entrada #1
SALA01_S_1729450298123_B5C607E8_00002  → Saída #2
SALA02_E_1729450334789_0123456789ABC012_00003  → Entrada #3
```

---

## 🚨 Códigos de Erro

### Códigos Exibidos no LCD:

```
┌──────────┬──────────────────────────────────────────────┐
│  CÓDIGO  │                DESCRIÇÃO                     │
├──────────┼──────────────────────────────────────────────┤
│ Erro 001 │ Falha na conexão WiFi                        │
│          │ - Não conseguiu conectar ao AP              │
│          │ - Timeout de conexão (10s)                  │
├──────────┼──────────────────────────────────────────────┤
│ Erro 002 │ Erro ao processar resposta do servidor       │
│          │ - JSON inválido ou corrompido               │
│          │ - Campos obrigatórios ausentes              │
├──────────┼──────────────────────────────────────────────┤
│ Erro 003 │ Erro de comunicação com servidor             │
│          │ - Servidor offline ou inacessível           │
│          │ - Timeout HTTP                              │
│          │ - Código HTTP de erro                       │
├──────────┼──────────────────────────────────────────────┤
│ Erro 004 │ Erro no envio da requisição                  │
│          │ - Falha ao montar JSON                      │
│          │ - Falha ao enviar POST                      │
├──────────┼──────────────────────────────────────────────┤
│ Erro 005 │ Cartão RFID inválido                         │
│          │ - UID não encontrado no sistema             │
│          │ (na versão final: cartão não cadastrado)    │
├──────────┼──────────────────────────────────────────────┤
│ Erro 999 │ Erro genérico/desconhecido do sistema        │
│          │ - Estado inconsistente                      │
│          │ - Exceção não tratada                       │
└──────────┴──────────────────────────────────────────────┘
```

---

## 🧪 Cartões RFID Simulados (Para Testes)

```cpp
SimulatedRfidCard* testCards[] = {
  new SimulatedRfidCard("A1B2", "Agent Smith"),
  new SimulatedRfidCard("B5C607E8", "Ada Lovelace"),
  new SimulatedRfidCard("0123456789ABC012", "Neo")
};
```

**Nota**: Na aplicação final, os leitores MFRC522 lerão os UIDs automaticamente. Os cartões simulados são apenas para desenvolvimento e testes no Wokwi.

---

## 🔧 Funções Principais

### Controle de Estado:

```cpp
void resetSystem()
// Reseta o sistema para o estado inicial
// Limpa buffers, apaga LED, atualiza LCD

void setSystemState(SystemState state)
// Muda o estado atual do sistema
// Registra timestamp de entrada no estado
```

### Processamento de Entrada:

```cpp
bool processRfid()
// Valida RFID digitado e salva informações
// Retorna: true se RFID válido, false caso contrário

bool processPassword()
// Processa senha digitada e mostra feedback
// Retorna: true se senha foi confirmada
```

### Geração de Dados:

```cpp
String generateHash(const String& input)
// TODO: Implementar hash real
// Atualmente retorna input sem modificação

String generateRequestId()
// Gera ID único no formato especificado
// Incrementa contador global

String buildRequestJson()
// Monta JSON completo da requisição
// Retorna: String JSON pronta para envio
```

### Comunicação:

```cpp
bool connectWiFi()
// Conecta ao WiFi com timeout de 10s
// Retorna: true se conectado

bool sendJson()
// Envia requisição POST e processa resposta
// Retorna: true se sucesso

bool processServerResponse(const String& jsonResponse)
// Parseia JSON da resposta do servidor
// Preenche systemState.current_response
// Retorna: true se JSON válido
```

### Utilitários:

```cpp
void showMessageOnLcd(const String& line1, const String& line2, unsigned int duration)
// Exibe mensagem no LCD por tempo determinado
// TODO: Validar tamanho das linhas (max 16 chars)

SimulatedRfidCard* findCardByUid(const String& uid)
// Busca cartão simulado pelo UID
// Retorna: ponteiro para cartão ou nullptr
```

---

## 📝 TODOs e Melhorias Futuras

### Implementações Pendentes:

#### 1. **Sincronização de Tempo (NTP)**
```cpp
// Atualmente usa millis() que reseta quando ESP reinicia
// TODO: Implementar sincronização via NTP para timestamps reais
```

#### 2. **Hash Criptográfico Real**
```cpp
// TODO: Implementar hash para password_hash e message_hash
```

#### 3. **Integração com MFRC522**
```cpp
// TODO: Substituir simulação por leitura real dos sensores RFID
// Implementar detecção de cartão presente
// Ler UID automaticamente ao aproximar cartão
```

#### 4. **Validação de Tamanho de Strings**
```cpp
// TODO: Validar que mensagens do LCD não excedam 16 caracteres
// Implementar truncamento ou scroll de texto
```

#### 5. **Persistência do Contador**
```cpp
// TODO: Salvar request_counter em memória não-volátil (EEPROM/SPIFFS)
// Recuperar valor após reinicialização
```

#### 6. **Watchdog Timer**
```cpp
// TODO: Implementar watchdog para recuperação automática de travamentos
// Resetar ESP32 em caso de timeout
```

#### 7. **Modo de Debug**
```cpp
// TODO: Adicionar logs via Serial para debugging
// Implementar níveis de log (INFO, WARNING, ERROR)
```

#### 8. **Feedback Sonoro**
```cpp
// TODO: Adicionar buzzer para feedback auditivo
// Beep diferente para sucesso/erro
```

---

## ⚠️ Observações Importantes

### Segurança:

1. **Hash de Senha**: 
   - A senha NUNCA deve ser enviada em texto plano
   - Implementar hash antes do envio
   - Backend valida hash comparando com banco de dados

2. **Integridade da Mensagem**:
   - `message_hash` garante que a mensagem não foi alterada
   - Validar hash no backend antes de processar
   - Recusar requisições com hash inválido

3. **HTTPS vs HTTP**:
   - Versão atual usa HTTP para simplificação
   - **Produção deve usar HTTPS** para criptografia em trânsito
   - Implementar validação de certificado SSL

### Performance:

1. **Timeouts**:
   - HTTP_TIMEOUT_MS = 10s (ajustar conforme latência da rede)
   - WiFi connection timeout = 10s

2. **Memória**:
   - JSON buffers limitados a 512 bytes
   - Monitorar heap disponível em operação

### Usabilidade:

1. **Feedback Visual**:
   - LED sempre indica estado atual do sistema
   - Cores intuitivas (verde=ok, vermelho=erro, azul=aguardando)

2. **Mensagens no LCD**:
   - Máximo 16 caracteres por linha
   - Mensagens claras e objetivas
   - Tempo de exibição configurável pelo backend

3. **Cancelamento**:
   - Tecla '*' cancela operação a qualquer momento
   - Sistema retorna ao estado inicial de forma limpa

---

## 🔄 Ciclo de Vida Típico

### Cenário 1: Entrada Bem-Sucedida

```
1. Sistema em repouso
   └→ LCD: "Aguardando... / Aproxime cartao"
   └→ LED: Apagado

2. Usuário pressiona '1' (ENTRY)
   └→ Estado: AGUARDANDO_RFID
   └→ LED: Azul

3. Usuário digita UID: "A1B2C3D4" + '#'
   └→ Sistema valida cartão
   └→ Estado: AGUARDANDO_SENHA
   └→ LCD: "Digite senha:"

4. Usuário digita senha: "1234" + '#'
   └→ Estado: ENVIANDO
   └→ LED: Amarelo
   └→ LCD: "Processando..."

5. ESP32 conecta WiFi e envia requisição
   └→ Backend valida RFID + senha + horários
   └→ Backend responde: access_granted = true

6. Sistema recebe resposta
   └→ Estado: MOSTRANDO_RESULTADO
   └→ LED: Verde
   └→ LCD: "Acesso permitido / Bem-vindo!"
   └→ Aguarda 3 segundos

7. Sistema reseta
   └→ Volta ao estado inicial
```

### Cenário 2: Saída

```
1. Usuário pressiona '2' (EXIT)
   └→ Estado: AGUARDANDO_RFID
   └→ LED: Azul

2. Usuário digita UID: "B5C607E8" + '#'
   └→ Estado: ENVIANDO (pula senha)
   └→ LED: Amarelo

3. Backend valida e responde
   └→ LED: Verde
   └→ LCD: "Saida autorizada / Até logo!"
```

### Cenário 3: Acesso Negado

```
1. Usuário tenta entrada com credenciais inválidas
   └→ Backend valida e nega acesso
   └→ LED: Vermelho
   └→ LCD: "Acesso negado / Credenciais invalidas"
   └→ Sistema reseta após 3s
```

---

## 📚 Bibliotecas Utilizadas

```
LiquidCrystal I2C  → Controle do display LCD via I2C
Keypad             → Leitura do teclado matricial 4x4
ArduinoJson        → Serialização/deserialização de JSON
WiFi               → Conexão WiFi do ESP32
HTTPClient         → Cliente HTTP para requisições REST
```

---

## 🎓 Contexto do Projeto

### Sobre o Projeto TIC TRENS:

Este sistema foi desenvolvido para a **TIC TRENS** visando o controle de acesso a áreas restritas das **estações de trem da cidade de São Paulo**.

### Características do Ambiente Real:

- **Ambientes críticos**: Salas de equipamentos, áreas técnicas
- **Alto tráfego**: Múltiplos acessos simultâneos em diferentes locais
- **Auditoria completa**: Todos os acessos são registrados
- **Autenticação forte**: RFID + Senha para máxima segurança
- **Rastreabilidade**: Request ID único permite rastreamento completo

### Benefícios:

✅ **Segurança**: Autenticação dupla (cartão + senha)  
✅ **Rastreabilidade**: Logs completos de todos os eventos  
✅ **Flexibilidade**: Horários e permissões configuráveis  
✅ **Escalabilidade**: Múltiplos ESPs gerenciados centralmente  
✅ **Auditoria**: Histórico completo para investigações  

---

## 🚀 Próximos Passos

### MVP Atual:
- [x] Máquina de estados funcional
- [x] Comunicação HTTP com backend
- [x] Simulação de cartões RFID
- [x] Interface LCD 16x2
- [x] Feedback visual com LED RGB
- [x] Keypad para entrada de dados

### Versão Final:
- [ ] Hash para senhas
- [ ] Sincronização NTP
- [ ] Comunicação HTTPS
- [ ] Persistência de dados em EEPROM
- [ ] Watchdog timer
- [ ] Modo de configuração via Serial
- [ ] Logs de debug estruturados
- [ ] OTA (Over-The-Air) updates
- [ ] Buzzer para feedback sonoro
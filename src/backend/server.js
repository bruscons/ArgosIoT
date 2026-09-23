// ./server.js

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/database/db_config");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");
const MQTTService = require("./services/MQTTService");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Rotas
app.use(routes);

// Tratamento de erros
app.use(errorHandler);

// Verificar conexão com banco de dados e MQTT antes de iniciar servidor
async function startServer() {
  let dbConnected = false;
  
  try {
    console.log("Verificando conexão com o banco de dados...");
    console.log(`Host: ${process.env.DB_HOST || 'não configurado'}`);
    console.log(`Database: ${process.env.DB_DATABASE || 'não configurado'}`);
    console.log(`Port: ${process.env.DB_PORT || 'não configurado'}`);

    // Tentar obter uma conexão do pool com timeout
    const connectPromise = pool.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout ao conectar ao banco de dados (10s)')), 10000)
    );

    const client = await Promise.race([connectPromise, timeoutPromise]);
    console.log("✓ Conexão com banco de dados estabelecida");
    
    // Testar a conexão com uma query simples
    await client.query('SELECT NOW()');
    console.log("✓ Teste de query bem-sucedido");

    // Liberar a conexão de volta para o pool
    client.release();
    dbConnected = true;

  } catch (error) {
    console.error("\n  Erro ao conectar com o banco de dados:");
    console.error("Mensagem:", error.message);
    console.error("Código:", error.code);
    console.error("\n Verifique:");
    console.error("  - Se o PostgreSQL está rodando");
    console.error("  - Se as credenciais no .env estão corretas");
    console.error("  - Se o host e porta estão acessíveis");
    console.error("\n  O servidor será iniciado mesmo sem conexão ao banco.");
    console.error("  Algumas funcionalidades podem não funcionar.\n");
    dbConnected = false;
  }

  // Inicializar MQTT Service
  try {
    console.log("Inicializando serviço MQTT...");
    await MQTTService.connect();
    console.log("✓ Serviço MQTT inicializado com sucesso");
  } catch (mqttError) {
    console.warn("  Não foi possível conectar ao MQTT:", mqttError.message);
    console.warn("  O servidor continuará sem MQTT.\n");
  }

  // Iniciar servidor mesmo se o banco não estiver conectado
  // Isso permite que o servidor rode e tente reconectar depois
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n Servidor iniciado na porta ${PORT}`);
    if (dbConnected) {
      console.log(`✓ Banco de dados: Conectado`);
    } else {
      console.log(`  Banco de dados: Desconectado (tentando reconectar...)`);
    }
    console.log(` Status MQTT: http://localhost:${PORT}/api/access/mqtt/status`);
    console.log(`\n Tópicos MQTT:`);
    console.log(`  Requisições: access/request/{device_id}`);
    console.log(`  Respostas:   access/response/{device_id}\n`);
  });
}

// Shutdown MQTT
process.on('SIGINT', () => {
  console.log('\nRecebido SIGINT. Fechando servidor...');
  MQTTService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nRecebido SIGTERM. Fechando servidor...');
  MQTTService.disconnect();
  process.exit(0);
});

// Iniciar o servidor
startServer();

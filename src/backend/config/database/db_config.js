// config/database/db_config.js

const { Pool } = require("pg");
require("dotenv").config();

// Validar variáveis de ambiente obrigatórias
const requiredEnvVars = [
  "DB_USER",
  "DB_HOST",
  "DB_DATABASE",
  "DB_PASSWORD",
  "DB_PORT",
];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error("Erro: Variáveis de ambiente faltando no arquivo .env:");
  missingVars.forEach((varName) => console.error(`  - ${varName}`));
  process.exit(1);
}

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  // Força o uso de IPv4 ao invés de IPv6
  family: 4,
  // Configurações de timeout e reconexão
  connectionTimeoutMillis: 10000, // 10 segundos
  idleTimeoutMillis: 30000, // 30 segundos
  max: 20, // máximo de conexões no pool
});

// Teste de conexão ao inicializar
pool.on("connect", () => {
  console.log("Conexão com PostgreSQL estabelecida");
});

// Tratamento de erros melhorado - não encerra o processo
pool.on("error", (err) => {
  console.error("Erro inesperado no cliente PostgreSQL:", err);
  console.error("Detalhes:", {
    code: err.code,
    message: err.message,
    stack: err.stack,
  });
  
  // Não encerra o processo imediatamente
  // O pool tentará reconectar automaticamente
  console.warn("O pool tentará reconectar automaticamente...");
});

module.exports = pool;

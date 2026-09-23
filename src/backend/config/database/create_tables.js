// config/database/create_tables.js

const pool = require("./db_config");
const fs = require("fs").promises;
const path = require("path");

async function createTables() {
  let client;

  try {
    console.log("Tentando conectar ao banco de dados...");
    client = await pool.connect();
    console.log("Conexão estabelecida com sucesso!");

    console.log("\nIniciando criação das tabelas...");

    // Diretório onde estão os arquivos SQL de schema
    const schemaDir = path.join(__dirname, "sql", "schema");

    // Lista de arquivos SQL na ordem correta de execução
    const schemaFiles = [
      "01_workers.sql",
      "02_services.sql",
      "03_service_authorizations.sql",
      "04_access_logs.sql",
    ];

    // Executar cada arquivo SQL
    for (const file of schemaFiles) {
      const filePath = path.join(schemaDir, file);
      console.log(`\nLendo arquivo: ${filePath}`);

      const sql = await fs.readFile(filePath, "utf-8");
      console.log(`Executando ${file}...`);

      await client.query(sql);
      console.log(`${file} executado com sucesso`);
    }

    console.log("\nTodas as tabelas foram criadas com sucesso!");
  } catch (error) {
    console.error("\nErro ao criar tabelas:");
    console.error("Mensagem:", error.message);
    console.error("Stack:", error.stack);
    throw error;
  } finally {
    if (client) {
      client.release();
      console.log("\nConexão liberada");
    }
    await pool.end();
    console.log("Pool encerrado");
  }
}

// Executar a função
console.log("SCRIPT DE CRIAÇÃO DE TABELAS\n");
createTables()
  .then(() => {
    console.log("\nSCRIPT FINALIZADO COM SUCESSO");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nSCRIPT FINALIZADO COM ERRO");
    process.exit(1);
  });

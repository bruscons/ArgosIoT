// config/database/fill_tables.js

const pool = require("./db_config");
const fs = require("fs").promises;
const path = require("path");

async function fillTables() {
  let client;

  try {
    console.log("Tentando conectar ao banco de dados...");
    client = await pool.connect();
    console.log("Conexão estabelecida com sucesso!");

    console.log("\nIniciando preenchimento das tabelas com dados fictícios...");

    // Diretório onde estão os arquivos SQL de seeds
    const seedsDir = path.join(__dirname, "sql", "seeds");

    // Lista de arquivos SQL na ordem correta de execução
    const seedFiles = [
      "01_workers_seed.sql",
      "02_services_seed.sql",
      "03_authorizations_seed.sql",
    ];

    // Executar cada arquivo SQL
    for (const file of seedFiles) {
      const filePath = path.join(seedsDir, file);
      console.log(`\nLendo arquivo: ${filePath}`);

      const sql = await fs.readFile(filePath, "utf-8");
      console.log(`Executando ${file}...`);

      await client.query(sql);
      console.log(`${file} executado com sucesso`);
    }

    console.log("\nTodas as tabelas foram preenchidas com sucesso!");
  } catch (error) {
    console.error("\nErro ao preencher tabelas:");
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
console.log("SCRIPT DE PREENCHIMENTO DE DADOS\n");
fillTables()
  .then(() => {
    console.log("\nSCRIPT FINALIZADO COM SUCESSO");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nSCRIPT FINALIZADO COM ERRO");
    process.exit(1);
  });

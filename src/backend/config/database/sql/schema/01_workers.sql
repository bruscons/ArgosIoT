-- Tabela de trabalhadores/funcionários
-- Armazena informações básicas de identificação e autenticação

CREATE TABLE IF NOT EXISTS workers (
    id SERIAL PRIMARY KEY,
    rfid_uid VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_at_readable VARCHAR(50),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at_readable VARCHAR(50)
);
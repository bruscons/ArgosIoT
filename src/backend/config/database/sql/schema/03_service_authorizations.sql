-- Tabela de autorizações de serviço
-- Relacionamento muitos-para-muitos entre workers e services
-- Define quais trabalhadores estão autorizados em quais serviços

CREATE TABLE IF NOT EXISTS service_authorizations (
    id SERIAL PRIMARY KEY,
    rfid_uid VARCHAR(50) NOT NULL,
    service_id INTEGER NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_at_readable VARCHAR(50),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at_readable VARCHAR(50),
    
    -- Chave estrangeira para workers
    CONSTRAINT fk_authorizations_worker FOREIGN KEY (rfid_uid) 
        REFERENCES workers(rfid_uid) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Chave estrangeira para services
    CONSTRAINT fk_authorizations_service FOREIGN KEY (service_id) 
        REFERENCES services(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Garante que não haverá duplicatas de autorização
    CONSTRAINT unique_worker_service UNIQUE (rfid_uid, service_id)
);
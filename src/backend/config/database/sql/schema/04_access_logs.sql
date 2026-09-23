-- Tabela de logs de acesso
-- Registra todas as tentativas de acesso (autorizadas ou negadas)
-- Essencial para auditoria e rastreamento de segurança

CREATE TABLE IF NOT EXISTS access_logs (
    id SERIAL PRIMARY KEY,
    request_id VARCHAR(255) UNIQUE NOT NULL,
    rfid_uid VARCHAR(50),
    room_id VARCHAR(50) NOT NULL,
    event_type VARCHAR(10) NOT NULL,
    timestamp_request TIMESTAMPTZ NOT NULL,
    timestamp_request_readable VARCHAR(50),
    access_granted BOOLEAN NOT NULL,
    message TEXT,
    service_authorization_id INTEGER,
    origin_ip VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_at_readable VARCHAR(50),
    
    -- Chave estrangeira para service_authorizations (pode ser NULL se acesso foi negado)
    CONSTRAINT fk_logs_authorization FOREIGN KEY (service_authorization_id) 
        REFERENCES service_authorizations(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE,
    
    -- Garante que event_type seja apenas 'entry' ou 'exit'
    CONSTRAINT check_event_type CHECK (event_type IN ('entry', 'exit'))
);
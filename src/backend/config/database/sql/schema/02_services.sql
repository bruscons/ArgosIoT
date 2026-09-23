-- Tabela de serviços
-- Define os agendamentos de atividades nas salas com suas restrições de horário

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    room_id VARCHAR(50) NOT NULL,
    rfid_responsible VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    weekdays VARCHAR(50) NOT NULL,
    validity_start TIMESTAMPTZ NOT NULL,
    validity_start_readable VARCHAR(50),
    validity_end TIMESTAMPTZ NOT NULL,
    validity_end_readable VARCHAR(50),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_at_readable VARCHAR(50),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at_readable VARCHAR(50),
    
    -- Chave estrangeira para o responsável do serviço
    CONSTRAINT fk_services_responsible FOREIGN KEY (rfid_responsible) 
        REFERENCES workers(rfid_uid) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
);
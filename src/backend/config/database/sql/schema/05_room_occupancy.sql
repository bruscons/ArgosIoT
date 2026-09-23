-- =============================================================================
-- Tabela: room_occupancy
-- Descrição: Armazena dados de ocupação das salas captados pelas câmeras de
--            monitoramento. Cada sala tem um registro que é atualizado em
--            tempo real conforme as câmeras detectam entrada/saída de pessoas.
-- =============================================================================

CREATE TABLE IF NOT EXISTS room_occupancy (
    -- Identificador único do registro
    id SERIAL PRIMARY KEY,
    
    -- Identificador da sala (referência à sala monitorada)
    -- Exemplo: 'SALA_01', 'SALA_A', 'PLATAFORMA_NORTE'
    room_id VARCHAR(50) NOT NULL UNIQUE,
    
    -- Quantidade atual de pessoas na sala (valor >= 0)
    current_count INTEGER NOT NULL DEFAULT 0 CHECK (current_count >= 0),
    
    -- Identificador da câmera que fez a última atualização
    -- Útil para rastreabilidade e debug
    last_camera_id VARCHAR(50) DEFAULT NULL,
    
    -- Timestamp da última atualização de contagem
    last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- Comentários nas colunas (documentação no banco)
-- =============================================================================

COMMENT ON TABLE room_occupancy IS 'Dados de ocupação das salas monitoradas por câmeras';
COMMENT ON COLUMN room_occupancy.room_id IS 'Identificador único da sala monitorada';
COMMENT ON COLUMN room_occupancy.current_count IS 'Número atual de pessoas detectadas na sala';
COMMENT ON COLUMN room_occupancy.last_camera_id IS 'ID da câmera que realizou a última atualização';
COMMENT ON COLUMN room_occupancy.last_updated_at IS 'Timestamp da última atualização de contagem';

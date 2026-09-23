-- Seed data para service_authorizations
-- Dados fictícios de autorizações entre workers e services

INSERT INTO service_authorizations (rfid_uid, service_id, active, created_at, created_at_readable, updated_at, updated_at_readable) VALUES
-- Agent Smith autorizado em Manutenção Elétrica (é o responsável)
('A1B2', 1, true, '2025-01-20 08:05:00-03', '20/01/2025 08:05:00', '2025-01-20 08:05:00-03', '20/01/2025 08:05:00'),

-- Agent Smith também autorizado em Segurança Noturna
('A1B2', 4, true, '2025-01-23 08:00:00-03', '23/01/2025 08:00:00', '2025-01-23 08:00:00-03', '23/01/2025 08:00:00'),

-- Agent Smith autorizado em Inspeção (é o responsável)
('A1B2', 5, true, '2025-01-24 11:25:00-03', '24/01/2025 11:25:00', '2025-01-24 11:25:00-03', '24/01/2025 11:25:00'),

-- Ada Lovelace autorizada em Limpeza Técnica (é a responsável)
('AABB', 2, true, '2025-01-21 10:35:00-03', '21/01/2025 10:35:00', '2025-01-21 10:35:00-03', '21/01/2025 10:35:00'),

-- Ada Lovelace também autorizada em Reunião Técnica
('AABB', 3, true, '2025-01-22 09:20:00-03', '22/01/2025 09:20:00', '2025-01-22 09:20:00-03', '22/01/2025 09:20:00'),

-- Neo autorizado em Reunião Técnica (é o responsável)
('001122', 3, true, '2025-01-22 09:20:00-03', '22/01/2025 09:20:00', '2025-01-22 09:20:00-03', '22/01/2025 09:20:00'),

-- Neo também autorizado em Manutenção Elétrica
('001122', 1, true, '2025-01-20 08:10:00-03', '20/01/2025 08:10:00', '2025-01-20 08:10:00-03', '20/01/2025 08:10:00'),

-- Ana autorizada em Segurança Noturna (é a responsável)
('C2B1A1', 4, true, '2025-01-23 07:50:00-03', '23/01/2025 07:50:00', '2025-01-23 07:50:00-03', '23/01/2025 07:50:00'),

-- Pedro autorizado em Limpeza mas com autorização inativa
('A123', 2, false, '2025-01-21 10:40:00-03', '21/01/2025 10:40:00', '2025-01-21 10:40:00-03', '21/01/2025 10:40:00'),

-- 1234 autorizado na janela MANHÃ de SALA_01
('1234', 6, true, '2025-02-01 09:20:00-03', '01/02/2025 09:20:00', '2025-02-01 09:20:00-03', '01/02/2025 09:20:00'),

-- 1234 autorizado na janela TARDE/NOITE de SALA_01
('1234', 7, true, '2025-02-01 09:21:00-03', '01/02/2025 09:21:00', '2025-02-01 09:21:00-03', '01/02/2025 09:21:00'),

-- (Opcional, só para deixar claro que o serviço de SALA_02 está “agendado” para alguém)
-- Autoriza AABB no serviço de SALA_02 - 1234 NÃO terá autorização
('AABB', 8, true, '2025-02-01 09:22:00-03', '01/02/2025 09:22:00', '2025-02-01 09:22:00-03', '01/02/2025 09:22:00');

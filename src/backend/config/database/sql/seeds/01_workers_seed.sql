-- Seed data para workers
-- Dados fictícios de trabalhadores para testes

-- Hash das senhas (bcrypt):
-- password: "1234" -> $2b$10$YQ98zqWL.IkHFOKj4GcP6e8JHLVVqK6.SaHvN3JHFzLWH1qZQE6OC
-- password: "5678" -> $2b$10$nR4pjHqHvQqV8YGKZXzJPuXLFk1KxV2xLHqV8YGKZXzJPuXLFk1Kx
-- password: "abcd" -> $2b$10$mN6lkHGfDqW9xHJLVVqK6.TaGvM4IGGzMXI2pYF8JHFzLWH1qZQE7P

INSERT INTO workers (rfid_uid, password_hash, name, active, created_at, created_at_readable, updated_at, updated_at_readable) VALUES
('A1B2', '1234', 'Agent Smith', true, '2025-01-15 10:30:00-03', '15/01/2025 10:30:00', '2025-01-15 10:30:00-03', '15/01/2025 10:30:00'),

('AABB', '1122', 'Ada Lovelace', true, '2025-01-16 14:20:00-03', '16/01/2025 14:20:00', '2025-01-16 14:20:00-03', '16/01/2025 14:20:00'),

('001122', 'BC32', 'Neo', true, '2025-01-17 09:00:00-03', '17/01/2025 09:00:00', '2025-01-17 09:00:00-03', '17/01/2025 09:00:00'),

('C2B1A1', '12345', 'Ana Costa', true, '2025-01-18 11:45:00-03', '18/01/2025 11:45:00', '2025-01-18 11:45:00-03', '18/01/2025 11:45:00'),

('A123', '123', 'Pedro Almeida', false, '2025-01-19 16:30:00-03', '19/01/2025 16:30:00', '2025-01-19 16:30:00-03', '19/01/2025 16:30:00'),

('1234', '4321', 'Tecnico Teste', true, '2025-02-01 09:00:00-03', '01/02/2025 09:00:00', '2025-02-01 09:00:00-03', '01/02/2025 09:00:00'),

('0000', '4321', 'RFID 0000', true, '2025-02-01 09:05:00-03', '01/02/2025 09:05:00', '2025-02-01 09:05:00-03', '01/02/2025 09:05:00');
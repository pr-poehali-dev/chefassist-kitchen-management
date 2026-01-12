-- Добавляем поля для авторизации сотрудников
ALTER TABLE t_p93487342_chefassist_kitchen_m.employees 
ADD COLUMN email VARCHAR(255) UNIQUE,
ADD COLUMN password_hash VARCHAR(255),
ADD COLUMN is_online BOOLEAN DEFAULT false,
ADD COLUMN last_seen TIMESTAMP;

-- Создаём индекс для быстрого поиска по email
CREATE INDEX idx_employees_email ON t_p93487342_chefassist_kitchen_m.employees(email);

-- Создаём индекс для быстрого поиска онлайн сотрудников
CREATE INDEX idx_employees_online ON t_p93487342_chefassist_kitchen_m.employees(is_online, restaurant_id);
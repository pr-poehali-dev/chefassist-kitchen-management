-- Создание таблиц для инвентаризации

-- Таблица инвентаризаций
CREATE TABLE IF NOT EXISTS t_p93487342_chefassist_kitchen_m.inventories (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL REFERENCES t_p93487342_chefassist_kitchen_m.restaurants(id),
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    responsible VARCHAR(255),
    status VARCHAR(50) DEFAULT 'in_progress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Таблица продуктов инвентаризации
CREATE TABLE IF NOT EXISTS t_p93487342_chefassist_kitchen_m.inventory_products (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER NOT NULL REFERENCES t_p93487342_chefassist_kitchen_m.inventories(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'product',
    product_order INTEGER DEFAULT 0
);

-- Таблица записей инвентаризации (кто сколько внёс)
CREATE TABLE IF NOT EXISTS t_p93487342_chefassist_kitchen_m.inventory_entries (
    id SERIAL PRIMARY KEY,
    inventory_product_id INTEGER NOT NULL REFERENCES t_p93487342_chefassist_kitchen_m.inventory_products(id),
    user_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 3) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_inventories_restaurant ON t_p93487342_chefassist_kitchen_m.inventories(restaurant_id, status);
CREATE INDEX IF NOT EXISTS idx_inventory_products_inventory ON t_p93487342_chefassist_kitchen_m.inventory_products(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_entries_product ON t_p93487342_chefassist_kitchen_m.inventory_entries(inventory_product_id);
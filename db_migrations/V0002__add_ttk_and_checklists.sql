CREATE TABLE IF NOT EXISTS ttk (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    output INTEGER DEFAULT 0,
    ingredients TEXT NOT NULL,
    tech TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS checklists (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
    name VARCHAR(255) NOT NULL,
    workshop VARCHAR(100) NOT NULL,
    responsible VARCHAR(255),
    completed_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS checklist_items (
    id SERIAL PRIMARY KEY,
    checklist_id INTEGER NOT NULL REFERENCES checklists(id),
    text TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    timestamp TIMESTAMP,
    item_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_ttk_restaurant ON ttk(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_checklists_restaurant ON checklists(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_checklist ON checklist_items(checklist_id);
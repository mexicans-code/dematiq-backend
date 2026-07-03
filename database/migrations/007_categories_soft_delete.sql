ALTER TABLE categories ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive'));
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);
UPDATE categories SET status = 'active' WHERE status IS NULL;

-- Actualizar getProducts para ignorar categorías inactivas
CREATE OR REPLACE VIEW active_categories AS
SELECT * FROM categories WHERE status = 'active';

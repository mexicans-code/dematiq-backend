-- Extiende la tabla brands con columnas adicionales

ALTER TABLE brands ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Actualizar el slug para incluir caracteres especiales (opcional)
UPDATE brands SET status = 'active' WHERE status IS NULL;

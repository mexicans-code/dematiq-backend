-- ============================================
-- Dematiq - Migración: Extensiones de Productos
-- Agrega columnas del CSV masivo y tabla marcas
-- ============================================

-- 1. TABLA DE MARCAS
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. NUEVAS COLUMNAS EN PRODUCTS
ALTER TABLE products ADD COLUMN IF NOT EXISTS external_id UUID;
ALTER TABLE products ADD COLUMN IF NOT EXISTS mpn VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'MXN';
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_2 TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS datasheet_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;

-- 3. ÍNDICES
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_external_id ON products(external_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_mpn ON products(mpn);

-- 4. Insertar marcas del CSV (extraídas de los datos)
INSERT INTO brands (id, name, slug) VALUES
  ('238d4c20-6ca7-4394-9f25-8499ba63084e', 'Siemens', 'siemens'),
  ('69e883da-e7c1-454b-9079-37fc8c093ab4', 'Schneider Electric', 'schneider-electric'),
  ('da1087a1-e654-4bb2-99e3-943007115ef1', 'Fluke', 'fluke'),
  ('6447a2a5-5432-4261-9056-b7f22c82eac5', 'Phoenix Contact', 'phoenix-contact'),
  ('c76919f3-6ee8-445e-a07c-49a0277bf48b', 'Wago', 'wago'),
  ('11c6cb2f-5de9-4412-a474-f7b78a6db838', 'Panduit', 'panduit'),
  ('273686f0-6f33-4480-9bfe-9e70c1a6c994', 'Legrand', 'legrand'),
  ('eed651ea-ff80-4fb7-af29-ca2c5cc4350b', 'ABB', 'abb'),
  ('511e9756-9bfe-4b6f-a6bf-e6bf38101e31', 'Lutron', 'lutron'),
  ('c62be9f8-1759-4510-8cb3-1765e94db086', 'Klein Tools', 'klein-tools'),
  ('1a4a8395-6708-45f4-8ab7-a5f763cc05b0', 'Eaton', 'eaton'),
  ('a571448c-f345-4fab-921b-be77bb1d4599', 'Bticino', 'bticino');

-- ============================================
-- Dematiq - Migración: Jerarquía de Categorías
-- Agrega parent_id para categorías padre-hijo
-- ============================================

-- 1. Agregar columna parent_id
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES categories(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- 2. Función para obtener categorías con subcategorías
CREATE OR REPLACE FUNCTION get_categories_tree()
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT JSONB_AGG(
    JSONB_BUILD_OBJECT(
      'id', c.id,
      'name', c.name,
      'slug', c.slug,
      'description', c.description,
      'image_url', c.image_url,
      'parent_id', c.parent_id,
      'created_at', c.created_at,
      'subcategories', COALESCE(
        (SELECT JSONB_AGG(
          JSONB_BUILD_OBJECT(
            'id', s.id,
            'name', s.name,
            'slug', s.slug,
            'description', s.description,
            'image_url', s.image_url,
            'parent_id', s.parent_id,
            'created_at', s.created_at
          ) ORDER BY s.name
        ) FROM categories s WHERE s.parent_id = c.id),
        '[]'::JSONB
      )
    ) ORDER BY c.name
  ) INTO result
  FROM categories c
  WHERE c.parent_id IS NULL;

  RETURN COALESCE(result, '[]'::JSONB);
END;
$$;

-- 3. Actualizar categorías existentes (opcional - seeds se actualizarán manualmente)
-- Ejemplo: UPDATE categories SET parent_id = (SELECT id FROM categories WHERE slug = 'controladores') WHERE slug = 'plc';

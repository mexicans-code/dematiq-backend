ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive'));
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- Actualizar usuarios existentes como activos
UPDATE profiles SET status = 'active' WHERE status IS NULL;

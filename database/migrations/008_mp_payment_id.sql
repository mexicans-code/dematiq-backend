ALTER TABLE orders ADD COLUMN IF NOT EXISTS mp_payment_id TEXT;
CREATE INDEX IF NOT EXISTS idx_orders_mp_payment_id ON orders(mp_payment_id);

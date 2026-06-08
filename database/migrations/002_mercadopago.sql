ALTER TABLE orders ADD COLUMN IF NOT EXISTS mp_order_id TEXT;
CREATE INDEX IF NOT EXISTS idx_orders_mp_order_id ON orders(mp_order_id);

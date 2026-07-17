INSERT INTO settings (key, value) VALUES ('checkout_notes', '')
ON CONFLICT (key) DO NOTHING;

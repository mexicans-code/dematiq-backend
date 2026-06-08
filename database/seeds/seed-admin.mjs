import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const password_hash = await bcrypt.hash('admin123', 10);

const { data, error } = await supabase
  .from('profiles')
  .upsert(
    {
      name: 'Admin Dematiq',
      email: 'admin@dematiq.com',
      password_hash,
      role: 'admin',
      phone: '555-0000',
      company_name: 'Dematiq',
      rfc: 'DEMA000101XXX',
    },
    { onConflict: 'email' }
  )
  .select('id, name, email, role')
  .single();

if (error) {
  console.error('Error al crear admin:', error.message);
  process.exit(1);
}

console.log('Usuario admin creado:', data);
console.log('Email: admin@dematiq.com');
console.log('Password: admin123');

import { readFileSync, writeFileSync } from 'fs';

const csvPath = process.argv[2] || 'C:/Users/Ricardo Medina/Downloads/productos_rows.csv';
const csv = readFileSync(csvPath, 'utf8');
const lines = csv.split('\n').filter(Boolean);
const headers = lines[0].split(',');

const rows = [];
for (let i = 1; i < lines.length; i++) {
  const vals = [];
  let current = '';
  let inQuote = false;
  for (const ch of lines[i]) {
    if (ch === '"') { inQuote = !inQuote; continue; }
    if (ch === ',' && !inQuote) { vals.push(current); current = ''; continue; }
    current += ch;
  }
  vals.push(current);

  const obj = {};
  headers.forEach((h, idx) => obj[h.trim()] = (vals[idx] || '').trim());
  rows.push(obj);
}

function esc(val) {
  if (!val || val === 'null' || val === '') return 'NULL';
  return "'" + val.replace(/'/g, "''") + "'";
}

function jsonb(val) {
  if (!val || val === '') return "'{}'::jsonb";
  // Convertir de {key: value, key: value} a {"key": "value", "key": "value"}
  let json = val.replace(/^{|}$/g, '').trim();
  const parts = [];
  let current = '';
  let depth = 0;
  for (const ch of json) {
    if (ch === '{' || ch === '[') depth++;
    else if (ch === '}' || ch === ']') depth--;
    if (ch === ',' && depth === 0) { parts.push(current.trim()); current = ''; continue; }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());

  const obj = {};
  for (const part of parts) {
    const colonIdx = part.indexOf(':');
    if (colonIdx === -1) continue;
    const key = part.slice(0, colonIdx).trim().replace(/^["']|["']$/g, '');
    let value = part.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
    // Try numeric
    if (value === 'true' || value === 'false') obj[key] = value === 'true';
    else if (!isNaN(Number(value)) && value !== '') obj[key] = Number(value);
    else obj[key] = value;
  }

  const jsonStr = JSON.stringify(obj);
  return "'" + jsonStr.replace(/'/g, "''") + "'::jsonb";
}

let sql = '-- ============================================\n';
sql += '-- Dematiq - Productos Masivos del CSV\n';
sql += '-- Total: ' + rows.length + ' productos\n';
sql += '-- Generado: ' + new Date().toISOString().split('T')[0] + '\n';
sql += '-- ============================================\n\n';

const cols = [
  'external_id', 'sku', 'name', 'slug', 'description', 'summary', 'mpn',
  'price', 'stock', 'image_url', 'image_2', 'datasheet_url', 'specs',
  'status', 'currency', 'brand_id'
];

sql += 'INSERT INTO products (' + cols.join(', ') + ') VALUES\n';

const valueStrings = rows.map(r => {
  const vals = [
    esc(r.id),
    esc(r.sku),
    esc(r.nombre),
    esc(r.slug),
    esc(r.descripcion),
    esc(r.resumen),
    esc(r.mpn),
    r.precio || '0',
    r.stock || '0',
    esc(r.imagen_1),
    esc(r.imagen_2),
    esc(r.ficha_tecnica),
    jsonb(r.especificaciones),
    r.activo === 'true' ? "'active'" : "'inactive'",
    esc(r.moneda || 'MXN'),
    esc(r.marca_id),
  ];
  return '(' + vals.join(', ') + ')';
});

sql += valueStrings.join(',\n') + ';\n';

const outPath = process.argv[3] || 'C:/Users/Ricardo Medina/Desktop/dematiq-backend/database/seeds/003_products_csv.sql';
writeFileSync(outPath, sql, 'utf8');
console.log('Archivo generado: database/seeds/003_products_csv.sql');
console.log('Productos procesados: ' + rows.length);

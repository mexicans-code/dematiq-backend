-- ============================================
-- Dematiq - Seed completo de catálogo
-- Adaptado para esquema actual (categories con parent_id, brands con UUIDs, products con status)
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- ─── 0. LIMPIAR DATOS EXISTENTES (orden por FK) ─────────────
DELETE FROM products;
DELETE FROM categories WHERE parent_id IS NOT NULL;
DELETE FROM categories WHERE parent_id IS NULL;
DELETE FROM brands;

-- ─── 1. MARCAS ───────────────────────────────────────────────
INSERT INTO brands (id, name, slug) VALUES
  ('238d4c20-6ca7-4394-9f25-8499ba63084e', 'Siemens',           'siemens'),
  ('69e883da-e7c1-454b-9079-37fc8c093ab4', 'Schneider Electric', 'schneider-electric'),
  ('eed651ea-ff80-4fb7-af29-ca2c5cc4350b', 'ABB',                'abb'),
  ('da1087a1-e654-4bb2-99e3-943007115ef1', 'Fluke',              'fluke'),
  ('c62be9f8-1759-4510-8cb3-1765e94db086', 'Klein Tools',        'klein-tools'),
  ('273686f0-6f33-4480-9bfe-9e70c1a6c994', 'Legrand',            'legrand'),
  ('1a4a8395-6708-45f4-8ab7-a5f763cc05b0', 'Eaton',              'eaton'),
  ('6447a2a5-5432-4261-9056-b7f22c82eac5', 'Phoenix Contact',    'phoenix-contact'),
  ('11c6cb2f-5de9-4412-a474-f7b78a6db838', 'Panduit',            'panduit'),
  ('a571448c-f345-4fab-921b-be77bb1d4599', 'Bticino',            'bticino'),
  ('c76919f3-6ee8-445e-a07c-49a0277bf48b', 'Wago',               'wago'),
  ('511e9756-9bfe-4b6f-a6bf-e6bf38101e31', 'Lutron',             'lutron');

-- ─── 2. CATEGORÍAS PADRE ────────────────────────────────────
INSERT INTO categories (name, slug) VALUES
  ('Automatización Industrial', 'automatizacion-industrial'),
  ('Protección Eléctrica',      'proteccion-electrica'),
  ('Canalización y Cableado',   'canalizacion-cableado'),
  ('Domótica e Iluminación',    'domotica-iluminacion'),
  ('Instrumentos de Medición',  'instrumentos-medicion'),
  ('Control y Distribución',    'control-distribucion'),
  ('Conectividad Industrial',   'conectividad-industrial');

-- ─── 3. SUBCATEGORÍAS (categories con parent_id) ────────────
INSERT INTO categories (name, slug, parent_id) VALUES
  -- Automatización Industrial
  ('PLCs y Controladores',        'plcs-controladores',        (SELECT id FROM categories WHERE slug='automatizacion-industrial')),
  ('Variadores de Frecuencia',    'variadores-frecuencia',     (SELECT id FROM categories WHERE slug='automatizacion-industrial')),
  ('Sensores Industriales',       'sensores-industriales',     (SELECT id FROM categories WHERE slug='automatizacion-industrial')),
  ('HMI y Pantallas Táctiles',    'hmi-pantallas',             (SELECT id FROM categories WHERE slug='automatizacion-industrial')),
  -- Protección Eléctrica
  ('Interruptores Termomagnéticos','interruptores-termomagneticos', (SELECT id FROM categories WHERE slug='proteccion-electrica')),
  ('Supresores de Picos',          'supresores-picos',            (SELECT id FROM categories WHERE slug='proteccion-electrica')),
  ('Fusibles Industriales',        'fusibles-industriales',       (SELECT id FROM categories WHERE slug='proteccion-electrica')),
  ('Relevadores de Protección',    'relevadores-proteccion',      (SELECT id FROM categories WHERE slug='proteccion-electrica')),
  -- Canalización y Cableado
  ('Canaletas y Ductos',          'canaletas-ductos',           (SELECT id FROM categories WHERE slug='canalizacion-cableado')),
  ('Charolas Portacables',        'charolas-portacables',       (SELECT id FROM categories WHERE slug='canalizacion-cableado')),
  ('Tubería Conduit',             'tuberia-conduit',            (SELECT id FROM categories WHERE slug='canalizacion-cableado')),
  ('Conectores y Prensaestopas',  'conectores-prensaestopas',   (SELECT id FROM categories WHERE slug='canalizacion-cableado')),
  -- Domótica e Iluminación
  ('Dimmers y Atenuadores',       'dimmers-atenuadores',        (SELECT id FROM categories WHERE slug='domotica-iluminacion')),
  ('Interruptores Inteligentes',  'interruptores-inteligentes', (SELECT id FROM categories WHERE slug='domotica-iluminacion')),
  ('Luminarias LED Industriales', 'luminarias-led',             (SELECT id FROM categories WHERE slug='domotica-iluminacion')),
  ('Sensores de Movimiento',      'sensores-movimiento',        (SELECT id FROM categories WHERE slug='domotica-iluminacion')),
  -- Instrumentos de Medición
  ('Multímetros Digitales',       'multimetros-digitales',      (SELECT id FROM categories WHERE slug='instrumentos-medicion')),
  ('Pinzas Amperimétricas',       'pinzas-amperimetricas',      (SELECT id FROM categories WHERE slug='instrumentos-medicion')),
  ('Analizadores de Redes',       'analizadores-redes',         (SELECT id FROM categories WHERE slug='instrumentos-medicion')),
  ('Termómetros Infrarrojos',     'termometros-infrarrojos',    (SELECT id FROM categories WHERE slug='instrumentos-medicion')),
  -- Control y Distribución
  ('Contactores y Arrancadores',  'contactores-arrancadores',   (SELECT id FROM categories WHERE slug='control-distribucion')),
  ('Tableros de Distribución',    'tableros-distribucion',      (SELECT id FROM categories WHERE slug='control-distribucion')),
  ('Botones y Señalización',      'botones-senalizacion',       (SELECT id FROM categories WHERE slug='control-distribucion')),
  ('Temporizadores',              'temporizadores',             (SELECT id FROM categories WHERE slug='control-distribucion')),
  -- Conectividad Industrial
  ('Switches Ethernet',           'switches-ethernet',          (SELECT id FROM categories WHERE slug='conectividad-industrial')),
  ('Módulos de Comunicación',     'modulos-comunicacion',       (SELECT id FROM categories WHERE slug='conectividad-industrial')),
  ('Cables de Red Industrial',    'cables-red-industrial',      (SELECT id FROM categories WHERE slug='conectividad-industrial')),
  ('Routers Industriales',        'routers-industriales',       (SELECT id FROM categories WHERE slug='conectividad-industrial'));

-- ─── 4. PRODUCTOS ───────────────────────────────────────────
INSERT INTO products (name, sku, slug, summary, price, currency, stock, status, brand_id, category_id, specs) VALUES
  -- PLCs y Controladores
  ('PLC LOGO! 8 230RCE',         'SIE-LOGO8-230',    'sie-logo8-230',    'Módulo lógico compacto con servidor web integrado',              4850.00,  'MXN', 15, 'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='plcs-controladores'), '{}'),
  ('PLC Modicon M221 24I/O',     'SCH-M221-24IO',    'sch-m221-24io',    'Controlador compacto para automatización de máquinas',           7200.00,  'MXN', 8,  'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='plcs-controladores'), '{}'),
  ('PLC AC500 PM573',            'ABB-AC500-PM573',   'abb-ac500-pm573',  'Controlador de alto rendimiento para aplicaciones complejas',    12500.00, 'MXN', 4,  'active', (SELECT id FROM brands WHERE slug='abb'),                (SELECT id FROM categories WHERE slug='plcs-controladores'), '{}'),

  -- Variadores de Frecuencia
  ('Variador SINAMICS V20 1HP',  'SIE-V20-1HP',      'sie-v20-1hp',      'Variador compacto para bombas y ventiladores',                   5600.00,  'MXN', 12, 'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='variadores-frecuencia'), '{}'),
  ('Variador Altivar 312 2HP',   'SCH-ATV312-2HP',   'sch-atv312-2hp',   'Drive para máquinas industriales simples',                       8900.00,  'MXN', 6,  'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='variadores-frecuencia'), '{}'),
  ('Variador ACS355 3HP',        'ABB-ACS355-3HP',   'abb-acs355-3hp',   'Micro drive para maquinaria general',                            11200.00, 'MXN', 5,  'active', (SELECT id FROM brands WHERE slug='abb'),                (SELECT id FROM categories WHERE slug='variadores-frecuencia'), '{}'),

  -- Sensores Industriales
  ('Sensor Inductivo 8mm PNP',   'SIE-IND-8PNP',     'sie-ind-8pnp',     'Sensor de proximidad inductivo M18 con conector M12',            1250.00,  'MXN', 30, 'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='sensores-industriales'), '{}'),
  ('Sensor Fotoeléctrico XUB',   'SCH-XUB-FOTO',     'sch-xub-foto',     'Sensor fotoeléctrico difuso con alcance de 1m',                  2100.00,  'MXN', 18, 'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='sensores-industriales'), '{}'),

  -- Interruptores Termomagnéticos
  ('Interruptor iC60N 2P 20A',   'SCH-IC60N-2P20',   'sch-ic60n-2p20',   'Interruptor miniatura curva C para protección de circuitos',     890.00,   'MXN', 50, 'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='interruptores-termomagneticos'), '{}'),
  ('Interruptor 5SY6 1P 16A',    'SIE-5SY6-1P16',    'sie-5sy6-1p16',    'Interruptor automático miniatura residencial e industrial',      520.00,   'MXN', 80, 'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='interruptores-termomagneticos'), '{}'),
  ('Interruptor S200 2P 32A',    'ABB-S200-2P32',     'abb-s200-2p32',    'Interruptor automático modular System pro M compact',            1150.00,  'MXN', 35, 'active', (SELECT id FROM brands WHERE slug='abb'),                (SELECT id FROM categories WHERE slug='interruptores-termomagneticos'), '{}'),
  ('Interruptor FAZ 1P 20A',     'EAT-FAZ-1P20',     'eat-faz-1p20',     'Interruptor miniatura para protección de líneas',                680.00,   'MXN', 45, 'active', (SELECT id FROM brands WHERE slug='eaton'),              (SELECT id FROM categories WHERE slug='interruptores-termomagneticos'), '{}'),

  -- Supresores de Picos
  ('Supresor iPRD 40r 1P',       'SCH-IPRD-40R',     'sch-iprd-40r',     'Dispositivo contra sobretensiones transitorias tipo 2',          2800.00,  'MXN', 20, 'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='supresores-picos'), '{}'),

  -- Fusibles Industriales
  ('Fusible NH gG 100A',         'SIE-NH-GG100',     'sie-nh-gg100',     'Fusible de cuchillas NH tamaño 0 para protección general',       350.00,   'MXN', 100,'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='fusibles-industriales'), '{}'),
  ('Fusible cilíndrico 10A',     'LEG-FUS-10A',      'leg-fus-10a',      'Fusible cilíndrico 10x38mm para protección de circuitos',        85.00,    'MXN', 200,'active', (SELECT id FROM brands WHERE slug='legrand'),           (SELECT id FROM categories WHERE slug='fusibles-industriales'), '{}'),

  -- Canaletas y Ductos
  ('Canaleta ranurada 40x60mm',  'PAN-CAN-4060',     'pan-can-4060',     'Canaleta de cableado ranurada PVC para tableros',                185.00,   'MXN', 150,'active', (SELECT id FROM brands WHERE slug='panduit'),           (SELECT id FROM categories WHERE slug='canaletas-ductos'), '{}'),
  ('Canaleta DLP 40x16mm',       'LEG-DLP-4016',     'leg-dlp-4016',     'Canaleta de pared para instalaciones residenciales',             120.00,   'MXN', 200,'active', (SELECT id FROM brands WHERE slug='legrand'),           (SELECT id FROM categories WHERE slug='canaletas-ductos'), '{}'),

  -- Conectores y Prensaestopas
  ('Conector COMBICON 5pos',     'PHX-COMB-5P',      'phx-comb-5p',      'Conector enchufable para PCB de 5 posiciones',                   95.00,    'MXN', 300,'active', (SELECT id FROM brands WHERE slug='phoenix-contact'),   (SELECT id FROM categories WHERE slug='conectores-prensaestopas'), '{}'),
  ('Borne de conexión 221-415',  'WAG-221-415',      'wag-221-415',      'Borne de conexión compacto con palanca 5 conductores',           45.00,    'MXN', 500,'active', (SELECT id FROM brands WHERE slug='wago'),              (SELECT id FROM categories WHERE slug='conectores-prensaestopas'), '{}'),

  -- Dimmers y Atenuadores
  ('Dimmer Maestro CL 150W',     'LUT-MACL-153M',    'lut-macl-153m',    'Dimmer para LED/CFL con tecnología patentada',                   1850.00,  'MXN', 25, 'active', (SELECT id FROM brands WHERE slug='lutron'),            (SELECT id FROM categories WHERE slug='dimmers-atenuadores'), '{}'),
  ('Dimmer Living Light 300W',   'BTI-DIM-300W',     'bti-dim-300w',     'Regulador de intensidad para lámparas incandescentes',           950.00,   'MXN', 30, 'active', (SELECT id FROM brands WHERE slug='bticino'),           (SELECT id FROM categories WHERE slug='dimmers-atenuadores'), '{}'),

  -- Interruptores Inteligentes
  ('Interruptor Caseta Wireless','LUT-PD6ANS',       'lut-pd6ans',       'Interruptor inalámbrico para iluminación inteligente',           2200.00,  'MXN', 15, 'active', (SELECT id FROM brands WHERE slug='lutron'),            (SELECT id FROM categories WHERE slug='interruptores-inteligentes'), '{}'),

  -- Luminarias LED Industriales
  ('Luminaria LED High Bay 200W','SCH-HB-200W',      'sch-hb-200w',      'Campana LED industrial para naves y almacenes',                  4500.00,  'MXN', 10, 'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='luminarias-led'), '{}'),

  -- Multímetros Digitales
  ('Multímetro Fluke 117',       'FLK-117',          'flk-117',          'Multímetro True RMS para electricistas comerciales',              8102.56,  'MXN', 12, 'active', (SELECT id FROM brands WHERE slug='fluke'),             (SELECT id FROM categories WHERE slug='multimetros-digitales'), '{}'),
  ('Multímetro Fluke 87V',       'FLK-87V',          'flk-87v',          'Multímetro industrial de alta precisión True RMS',               12500.00, 'MXN', 6,  'active', (SELECT id FROM brands WHERE slug='fluke'),             (SELECT id FROM categories WHERE slug='multimetros-digitales'), '{}'),

  -- Pinzas Amperimétricas
  ('Pinza Amperimétrica 376 FC', 'FLK-376FC',        'flk-376fc',        'Pinza CA/CC True RMS con iFlex y Fluke Connect',                15800.00, 'MXN', 8,  'active', (SELECT id FROM brands WHERE slug='fluke'),             (SELECT id FROM categories WHERE slug='pinzas-amperimetricas'), '{}'),
  ('Pinza CL800 600A AC/DC',     'KLN-CL800',        'kln-cl800',        'Pinza amperimétrica digital de rango automático',                5200.00,  'MXN', 14, 'active', (SELECT id FROM brands WHERE slug='klein-tools'),       (SELECT id FROM categories WHERE slug='pinzas-amperimetricas'), '{}'),

  -- Analizadores de Redes
  ('Analizador de Energía 1760', 'FLK-1760',         'flk-1760',         'Registrador trifásico de calidad de energía eléctrica',          85000.00, 'MXN', 2,  'active', (SELECT id FROM brands WHERE slug='fluke'),             (SELECT id FROM categories WHERE slug='analizadores-redes'), '{}'),

  -- Termómetros Infrarrojos
  ('Termómetro IR Fluke 62 MAX+','FLK-62MAX-PLUS',   'flk-62max-plus',   'Termómetro infrarrojo resistente IP54',                          4800.00,  'MXN', 18, 'active', (SELECT id FROM brands WHERE slug='fluke'),             (SELECT id FROM categories WHERE slug='termometros-infrarrojos'), '{}'),

  -- Contactores y Arrancadores
  ('Contactor SIRIUS 3RT2 25A',  'SIE-3RT2-25A',     'sie-3rt2-25a',     'Contactor de potencia 3 polos hasta 11kW a 400V',               2100.00,  'MXN', 25, 'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='contactores-arrancadores'), '{}'),
  ('Contactor TeSys D LC1D 32A', 'SCH-LC1D-32A',     'sch-lc1d-32a',     'Contactor tripolar para control de motores hasta 15kW',         2450.00,  'MXN', 20, 'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='contactores-arrancadores'), '{}'),
  ('Contactor AF26-30 26A',      'ABB-AF26-30',      'abb-af26-30',      'Contactor serie AF con bobina electrónica universal',            2800.00,  'MXN', 15, 'active', (SELECT id FROM brands WHERE slug='abb'),                (SELECT id FROM categories WHERE slug='contactores-arrancadores'), '{}'),

  -- Tableros de Distribución
  ('Tablero PRAGMA 24 módulos',  'SCH-PRA-24M',      'sch-pra-24m',      'Tablero modular empotrable para distribución eléctrica',         3200.00,  'MXN', 10, 'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='tableros-distribucion'), '{}'),

  -- Botones y Señalización
  ('Botonera XB5 22mm verde',    'SCH-XB5-AA31',     'sch-xb5-aa31',     'Pulsador rasante verde NA para tableros de control',             380.00,   'MXN', 60, 'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='botones-senalizacion'), '{}'),
  ('Indicador LED 22mm rojo',    'SIE-3SU1-RED',     'sie-3su1-red',     'Luz indicadora LED 24V para señalización en tableros',           290.00,   'MXN', 70, 'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='botones-senalizacion'), '{}'),

  -- Temporizadores
  ('Temporizador LOGO! TD',      'SIE-LOGO-TD',      'sie-logo-td',      'Módulo de visualización y temporización para LOGO!',             1200.00,  'MXN', 20, 'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='temporizadores'), '{}'),

  -- Switches Ethernet
  ('Switch SCALANCE XB005',      'SIE-XB005',        'sie-xb005',        'Switch Ethernet industrial no gestionado 5 puertos',             3800.00,  'MXN', 12, 'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='switches-ethernet'), '{}'),
  ('Switch ConneXium 8 puertos', 'SCH-TCSESM-8P',   'sch-tcsesm-8p',    'Switch Ethernet gestionado para redes industriales',             6500.00,  'MXN', 7,  'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='switches-ethernet'), '{}'),

  -- Módulos de Comunicación
  ('Módulo PROFINET CM 1542-1',  'SIE-CM1542-1',     'sie-cm1542-1',     'Procesador de comunicaciones PROFINET para S7-1500',             9800.00,  'MXN', 5,  'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='modulos-comunicacion'), '{}'),

  -- Cables de Red Industrial
  ('Cable Cat6 Industrial 305m', 'PAN-CAT6-IND',     'pan-cat6-ind',     'Cable UTP Cat6 blindado para ambientes industriales',            8500.00,  'MXN', 8,  'active', (SELECT id FROM brands WHERE slug='panduit'),           (SELECT id FROM categories WHERE slug='cables-red-industrial'), '{}'),

  -- HMI y Pantallas Táctiles
  ('HMI KTP700 Basic 7"',        'SIE-KTP700',       'sie-ktp700',       'Panel táctil a color de 7 pulgadas para procesos',               14500.00, 'MXN', 6,  'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='hmi-pantallas'), '{}'),
  ('HMI Magelis STU 5.7"',       'SCH-HMIS-57',      'sch-hmis-57',      'Terminal de diálogo gráfico compacto con pantalla táctil',       11200.00, 'MXN', 4,  'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='hmi-pantallas'), '{}'),

  -- Charolas Portacables
  ('Charola tipo escalera 30cm', 'PAN-CHAR-30',      'pan-char-30',      'Charola tipo escalera de aluminio para rutas de cable',          650.00,   'MXN', 40, 'active', (SELECT id FROM brands WHERE slug='panduit'),           (SELECT id FROM categories WHERE slug='charolas-portacables'), '{}'),

  -- Tubería Conduit
  ('Tubo Conduit PVC 3/4"',      'LEG-COND-34',      'leg-cond-34',      'Tubo rígido PVC tipo pesado para canalización eléctrica',        45.00,    'MXN', 300,'active', (SELECT id FROM brands WHERE slug='legrand'),           (SELECT id FROM categories WHERE slug='tuberia-conduit'), '{}'),

  -- Sensores de Movimiento
  ('Sensor Ocupación Maestro',   'LUT-MS-OPS6M',     'lut-ms-ops6m',     'Sensor de ocupación dual PIR para ahorro energético',            1650.00,  'MXN', 20, 'active', (SELECT id FROM brands WHERE slug='lutron'),            (SELECT id FROM categories WHERE slug='sensores-movimiento'), '{}'),

  -- Relevadores de Protección
  ('Relevador térmico LRD 12-18A','SCH-LRD-18A',     'sch-lrd-18a',      'Relé de sobrecarga térmica para protección de motores',          1450.00,  'MXN', 22, 'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='relevadores-proteccion'), '{}'),
  ('Relevador 3RU2 10-16A',      'SIE-3RU2-16A',     'sie-3ru2-16a',     'Relé de sobrecarga SIRIUS para montaje en contactor',            1680.00,  'MXN', 18, 'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='relevadores-proteccion'), '{}'),

  -- Routers Industriales
  ('Router SCALANCE M876-4',     'SIE-M876-4',       'sie-m876-4',       'Router industrial 4G/LTE para acceso remoto seguro',             22000.00, 'MXN', 3,  'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='routers-industriales'), '{}')
;

-- ─── VERIFICACIÓN ───────────────────────────────────────────
SELECT '✅ Marcas: '         || COUNT(*) FROM brands
UNION ALL
SELECT '✅ Categorías padre: ' || COUNT(*) FROM categories WHERE parent_id IS NULL
UNION ALL
SELECT '✅ Subcategorías: '  || COUNT(*) FROM categories WHERE parent_id IS NOT NULL
UNION ALL
SELECT '✅ Productos: '      || COUNT(*) FROM products;

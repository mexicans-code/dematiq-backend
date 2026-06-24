-- ============================================
-- Dematiq - Seed completo con marcas y categorías
-- Ejecutar TODO en Supabase SQL Editor
-- 1. Limpia datos existentes
-- 2. Migración 006: columnas extra en brands
-- 3. Inserta marcas con descripción y web
-- 4. Inserta categorías padre + subcategorías
-- 5. Inserta productos con brand_id y category_id
-- ============================================

-- ════════════════════════════════════════════
-- 0. EXTENDER TABLA BRANDS (Migración 006)
-- ════════════════════════════════════════════
ALTER TABLE brands ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- ════════════════════════════════════════════
-- 1. LIMPIAR DATOS
-- ════════════════════════════════════════════
DELETE FROM products;
DELETE FROM categories WHERE parent_id IS NOT NULL;
DELETE FROM categories WHERE parent_id IS NULL;
DELETE FROM brands;

-- ════════════════════════════════════════════
-- 2. MARCAS (con logo_url y website_url reales)
-- ════════════════════════════════════════════
INSERT INTO brands (id, name, slug, description, logo_url, website_url, status) VALUES
  ('238d4c20-6ca7-4394-9f25-8499ba63084e', 'Siemens',           'siemens',           'Líder global en automatización industrial, tecnología de accionamiento y digitalización.',              'https://upload.wikimedia.org/wikipedia/commons/5/5f/Siemens-logo.svg',                                                                 'https://www.siemens.com',               'active'),
  ('69e883da-e7c1-454b-9079-37fc8c093ab4', 'Schneider Electric', 'schneider-electric', 'Empresa multinacional francesa especializada en automatización, gestión energética y electrificación.', 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Schneider_Electric_Logo.svg',                                                    'https://www.se.com',                    'active'),
  ('eed651ea-ff80-4fb7-af29-ca2c5cc4350b', 'ABB',                'abb',               'Tecnología líder en electrificación, robótica, automatización y motores industriales.',                  'https://upload.wikimedia.org/wikipedia/commons/c/cd/ABB_logo.svg',                                                                   'https://www.abb.com',                   'active'),
  ('da1087a1-e654-4bb2-99e3-943007115ef1', 'Fluke',              'fluke',             'Fabricante líder de instrumentos de medición y prueba electrónica para la industria.',                   'https://upload.wikimedia.org/wikipedia/commons/6/6c/Fluke_Corporation_logo.svg',                                                     'https://www.fluke.com',                 'active'),
  ('c62be9f8-1759-4510-8cb3-1765e94db086', 'Klein Tools',        'klein-tools',       'Herramientas profesionales para electricistas desde 1857, fabricadas en EE.UU.',                         'https://upload.wikimedia.org/wikipedia/commons/2/2f/Klein_Tools_logo.svg',                                                           'https://www.kleintools.com',            'active'),
  ('273686f0-6f33-4480-9bfe-9e70c1a6c994', 'Legrand',            'legrand',           'Especialista mundial en infraestructuras eléctricas y digitales para edificios.',                        'https://upload.wikimedia.org/wikipedia/commons/f/f2/Legrand_logo.svg',                                                               'https://www.legrand.com',               'active'),
  ('1a4a8395-6708-45f4-8ab7-a5f763cc05b0', 'Eaton',              'eaton',             'Empresa de gestión energética que ofrece soluciones eléctricas, hidráulicas y mecánicas.',               'https://upload.wikimedia.org/wikipedia/commons/1/19/Eaton_Corporation_logo.svg',                                                     'https://www.eaton.com',                 'active'),
  ('6447a2a5-5432-4261-9056-b7f22c82eac5', 'Phoenix Contact',    'phoenix-contact',   'Líder en conexión industrial, tecnología de automatización e interfaces.',                               'https://upload.wikimedia.org/wikipedia/commons/3/34/Phoenix_Contact_logo.svg',                                                       'https://www.phoenixcontact.com',        'active'),
  ('11c6cb2f-5de9-4412-a474-f7b78a6db838', 'Panduit',            'panduit',           'Soluciones de infraestructura eléctrica y de red para entornos empresariales e industriales.',           'https://upload.wikimedia.org/wikipedia/commons/d/d7/Panduit_logo.svg',                                                               'https://www.panduit.com',               'active'),
  ('a571448c-f345-4fab-921b-be77bb1d4599', 'Bticino',            'bticino',           'Marca italiana de soluciones para instalaciones eléctricas residenciales y comerciales de alta gama.',   'https://upload.wikimedia.org/wikipedia/commons/1/17/Bticino_logo.svg',                                                               'https://www.bticino.com',               'active'),
  ('c76919f3-6ee8-445e-a07c-49a0277bf48b', 'Wago',               'wago',              'Especialista en conexión eléctrica, bornes de conexión y automatización descentralizada.',               'https://upload.wikimedia.org/wikipedia/commons/c/c5/Wago_logo.svg',                                                                  'https://www.wago.com',                  'active'),
  ('511e9756-9bfe-4b6f-a6bf-e6bf38101e31', 'Lutron',             'lutron',            'Innovador mundial en sistemas de control de iluminación y sombras para hogares y edificios.',            'https://upload.wikimedia.org/wikipedia/commons/e/e0/Lutron_logo.svg',                                                                'https://www.lutron.com',                'active');

-- ════════════════════════════════════════════
-- 3. CATEGORÍAS PADRE
-- ════════════════════════════════════════════
INSERT INTO categories (name, slug) VALUES
  ('Automatización Industrial', 'automatizacion-industrial'),
  ('Protección Eléctrica',      'proteccion-electrica'),
  ('Canalización y Cableado',   'canalizacion-cableado'),
  ('Domótica e Iluminación',    'domotica-iluminacion'),
  ('Instrumentos de Medición',  'instrumentos-medicion'),
  ('Control y Distribución',    'control-distribucion'),
  ('Conectividad Industrial',   'conectividad-industrial');

-- ════════════════════════════════════════════
-- 4. SUBCATEGORÍAS
-- ════════════════════════════════════════════
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

-- ════════════════════════════════════════════
-- 5. PRODUCTOS (cada subcategoria tiene productos de múltiples marcas)
-- ════════════════════════════════════════════
INSERT INTO products (name, sku, slug, summary, price, currency, stock, status, brand_id, category_id, specs) VALUES
  -- === PLCs y Controladores (Siemens, Schneider, ABB) ===
  ('PLC LOGO! 8 230RCE',         'SIE-LOGO8-230',    'logo8-230',          'Módulo lógico compacto con servidor web integrado, pantalla LCD y 8E/4S.',
   4850.00,  'MXN', 15, 'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='plcs-controladores'), '["8 entradas digitales","4 salidas a relé","Servidor web integrado","Puerto Ethernet","Programación LOGO! Soft Comfort"]'),
  ('PLC S7-1200 CPU 1212C',      'SIE-1212C-DC',     's7-1212c',           'Controlador compacto SIMATIC con 8E/6S, ideal para automatización básica.',
   12500.00, 'MXN', 8,  'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='plcs-controladores'), '["8 entradas digitales 24V","6 salidas digitales","PROFINET onboard","Hasta 4 módulos de señal","Memoria de trabajo 50KB"]'),
  ('PLC Modicon M221 24I/O',     'SCH-M221-24IO',    'm221-24io',          'Controlador compacto para automatización de máquinas, 14E/10S.',
   7200.00,  'MXN', 12, 'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='plcs-controladores'), '["14 entradas digitales","10 salidas digitales","Puerto Ethernet","USB programación","EcoStruxure Machine Expert"]'),
  ('PLC Modicon M241 40I/O',     'SCH-M241-40IO',    'm241-40io',          'Controlador avanzado con 24E/16S y comunicación Ethernet nativa.',
   15800.00, 'MXN', 5,  'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='plcs-controladores'), '["24 entradas digitales","16 salidas digitales","2 puertos Ethernet","CANopen integrado","Hasta 7 módulos de expansión"]'),
  ('PLC AC500 PM573',            'ABB-AC500-PM573',   'ac500-pm573',        'Controlador de alto rendimiento para aplicaciones complejas y distribuidas.',
   22500.00, 'MXN', 4,  'active', (SELECT id FROM brands WHERE slug='abb'),                (SELECT id FROM categories WHERE slug='plcs-controladores'), '["Procesador ARM Cortex","2MB memoria de programa","Ethernet + RS485","RTC integrado","Automation Builder compatible"]'),

  -- === Variadores de Frecuencia (Siemens, Schneider, ABB) ===
  ('Variador SINAMICS V20 1HP',  'SIE-V20-1HP',      'sinamics-v20-1hp',   'Variador compacto para aplicaciones básicas de bombas y ventiladores.',
   5600.00,  'MXN', 18, 'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='variadores-frecuencia'), '["0.75 kW (1HP)","Rango 200-240V","Control V/f","BISSE integrado","IP20"]'),
  ('Variador SINAMICS G120 5HP', 'SIE-G120-5HP',     'sinamics-g120-5hp',  'Convertidor de frecuencia modular de alto rendimiento.',
   28500.00, 'MXN', 6,  'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='variadores-frecuencia'), '["4 kW (5HP)","380-480V trifásico","Control vectorial","PROFINET","Safety Integrated"]'),
  ('Variador Altivar 312 2HP',   'SCH-ATV312-2HP',   'altivar-312-2hp',    'Drive simple y robusto para máquinas industriales sencillas.',
   8900.00,  'MXN', 10, 'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='variadores-frecuencia'), '["1.5 kW (2HP)","200-240V monofásico","Hasta 200Hz","Modbus integrado","Configuración por software"]'),
  ('Variador Altivar 630 10HP',  'SCH-ATV630-10HP',  'altivar-630-10hp',   'Drive de alto rendimiento para procesos con control de par preciso.',
   42000.00, 'MXN', 3,  'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='variadores-frecuencia'), '["7.5 kW (10HP)","380-480V","Control vectorial","EtherNet/IP","Seguridad funcional SIL3"]'),
  ('Variador ACS355 3HP',        'ABB-ACS355-3HP',   'acs355-3hp',         'Micro drive versátil para maquinaria general con herramientas de arranque rápidas.',
   11200.00, 'MXN', 7,  'active', (SELECT id FROM brands WHERE slug='abb'),                (SELECT id FROM categories WHERE slug='variadores-frecuencia'), '["2.2 kW (3HP)","200-480V","Control vectorial sensorless","FlashDrop","IP20"]'),
  ('Variador ACS580 7.5HP',      'ABB-ACS580-7HP',   'acs580-7hp',         'Drive universal para todas las aplicaciones, con asistente de puesta en marcha.',
   34000.00, 'MXN', 4,  'active', (SELECT id FROM brands WHERE slug='abb'),                (SELECT id FROM categories WHERE slug='variadores-frecuencia'), '["5.5 kW (7.5HP)","380-480V","Control escalar y vectorial","Ethernet/IP, Profinet","Asistente de arranque intuitivo"]'),

  -- === Sensores Industriales (Siemens, Schneider, ABB) ===
  ('Sensor Inductivo 8mm PNP',   'SIE-IND-8PNP',     'inductivo-8mm',      'Sensor de proximidad inductivo M18 con conector M12, alcance 8mm.',
   1250.00,  'MXN', 45, 'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='sensores-industriales'), '["Alcance 8mm","PNP normalmente abierto","M18 x 70mm","IP67","Conector M12"]'),
  ('Sensor Inductivo 15mm NPN',  'SIE-IND-15NPN',    'inductivo-15mm',     'Sensor inductivo cilíndrico M30 para detección de metales a larga distancia.',
   2100.00,  'MXN', 30, 'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='sensores-industriales'), '["Alcance 15mm","NPN normalmente abierto","M30 x 60mm","IP68","Incluye tuerca de fijación"]'),
  ('Sensor Fotoeléctrico XUB',   'SCH-XUB-FOTO',     'fotoelectrico-xub',  'Sensor fotoeléctrico difuso con alcance de 1m para detección de objetos.',
   2100.00,  'MXN', 22, 'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='sensores-industriales'), '["Alcance 1m (difuso)","PNP/ NPN configurable","M18 x 80mm","IP67","Cable 2m"]'),
  ('Sensor Capacitivo 12mm',     'SCH-CAP-12MM',     'capacitivo-12mm',    'Sensor capacitivo para detección de líquidos, plásticos y sólidos a 12mm.',
   2800.00,  'MXN', 18, 'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='sensores-industriales'), '["Alcance 12mm","PNP salida","M30 x 70mm","IP65","Ajuste por potenciómetro"]'),
  ('Sensor Ultrasonido UB1200',  'ABB-UB-1200',      'ultrasonido-1200',   'Sensor ultrasónico con alcance de 1200mm para detección de cualquier material.',
   4500.00,  'MXN', 12, 'active', (SELECT id FROM brands WHERE slug='abb'),                (SELECT id FROM categories WHERE slug='sensores-industriales'), '["Rango 1200mm","Salida analógica 4-20mA","M30 x 90mm","IP67","Compensación de temperatura"]'),

  -- === HMI y Pantallas Táctiles (Siemens, Schneider) ===
  ('HMI KTP700 Basic 7"',        'SIE-KTP700',       'ktp700',             'Panel táctil a color de 7 pulgadas con teclas de función para visualización de procesos.',
   14500.00, 'MXN', 9,  'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='hmi-pantallas'), '["7 pulgadas TFT 64K colores","Resistiva táctil + 8 teclas","PROFINET","WinCC Basic","IP65 frente"]'),
  ('HMI KTP400 Basic 4.3"',      'SIE-KTP400',       'ktp400',             'Panel compacto de 4.3 pulgadas ideal para paneles de control locales.',
   8200.00,  'MXN', 14, 'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='hmi-pantallas'), '["4.3 pulgadas","Táctil resistiva + 4 teclas","PROFINET","Puerto USB","IP65"]'),
  ('HMI Magelis STU 5.7"',       'SCH-HMIS-57',      'magelis-stu-57',     'Terminal de diálogo gráfico compacto con pantalla táctil a color de 5.7".',
   11200.00, 'MXN', 6,  'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='hmi-pantallas'), '["5.7 pulgadas TFT","Táctil resistiva","Ethernet + USB","Vijeo Designer","IP65"]'),
  ('HMI Magelis GTO 10.4"',      'SCH-HMIGTO-104',   'magelis-gto-104',    'Panel táctil avanzado de 10.4 pulgadas para supervisión de procesos complejos.',
   28500.00, 'MXN', 3,  'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='hmi-pantallas'), '["10.4 pulgadas","Táctil capacitiva multicomando","Ethernet, USB, RS232/485","Vijeo Designer","IP65 frente"]'),

  -- === Interruptores Termomagnéticos (Siemens, Schneider, ABB, Eaton) ===
  ('Interruptor iC60N 2P 20A',   'SCH-IC60N-2P20',   'ic60n-2p20',         'Interruptor miniatura curva C para protección de circuitos residenciales e industriales.',
   890.00,   'MXN', 80, 'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='interruptores-termomagneticos'), '["2 polos","20A curva C","6kA poder de corte","IEC 60898","Montaje carril DIN"]'),
  ('Interruptor iC60N 1P 10A',   'SCH-IC60N-1P10',   'ic60n-1p10',         'Interruptor monopolar curva C para protección de circuitos de alumbrado.',
   520.00,   'MXN', 120,'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='interruptores-termomagneticos'), '["1 polo","10A curva C","6kA poder de corte","IEC 60898","Montaje carril DIN"]'),
  ('Interruptor 5SY6 1P 16A',    'SIE-5SY6-1P16',    '5sy6-1p16',          'Interruptor automático miniatura para protección de líneas en instalaciones eléctricas.',
   520.00,   'MXN', 100,'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='interruptores-termomagneticos'), '["1 polo","16A curva C","10kA poder de corte","IEC 60898","Carril DIN"]'),
  ('Interruptor 5SY4 3P 32A',    'SIE-5SY4-3P32',    '5sy4-3p32',          'Interruptor tripolar para protección de cargas trifásicas hasta 32A.',
   1850.00,  'MXN', 45, 'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='interruptores-termomagneticos'), '["3 polos","32A curva C","6kA","IEC 60898","Bornes de jaula"]'),
  ('Interruptor S200 2P 32A',    'ABB-S200-2P32',     's200-2p32',          'Interruptor automático modular System pro M compacto con doble bornes.',
   1150.00,  'MXN', 55, 'active', (SELECT id FROM brands WHERE slug='abb'),                (SELECT id FROM categories WHERE slug='interruptores-termomagneticos'), '["2 polos","32A","Curva C","6kA","Doble bornes jaula"]'),
  ('Interruptor S200 1P 25A',    'ABB-S200-1P25',     's200-1p25',          'Interruptor monopolar System pro M para protección de circuitos de uso general.',
   680.00,   'MXN', 90, 'active', (SELECT id FROM brands WHERE slug='abb'),                (SELECT id FROM categories WHERE slug='interruptores-termomagneticos'), '["1 polo","25A","Curva C","6kA","Doble bornes jaula"]'),
  ('Interruptor FAZ 1P 20A',     'EAT-FAZ-1P20',     'faz-1p20',           'Interruptor miniatura para protección de líneas, ideal para tableros de distribución.',
   680.00,   'MXN', 65, 'active', (SELECT id FROM brands WHERE slug='eaton'),              (SELECT id FROM categories WHERE slug='interruptores-termomagneticos'), '["1 polo","20A","Curva C","10kA","UL 1077 / CSA"]'),

  -- === Supresores de Picos (Schneider, Eaton) ===
  ('Supresor iPRD 40r 1P',       'SCH-IPRD-40R',     'iprd-40r',           'Dispositivo contra sobretensiones transitorias tipo 2 para instalaciones eléctricas.',
   2800.00,  'MXN', 25, 'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='supresores-picos'), '["Tipo 2","40kA (8/20µs)","1 polo","220-240V","Inrush 1.5kA"]'),
  ('Supresor SPD 3P 65kA',       'SCH-SPD-65K',      'spd-65k',            'Supresor trifásico tipo 1+2 para instalaciones industriales de alto riesgo.',
   8500.00,  'MXN', 8,  'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='supresores-picos'), '["Tipo 1+2","65kA","3 polos","380-415V","Alarma remota"]'),
  ('Supresor Eaton MSP 40kA',    'EAT-MSP-40K',      'msp-40k',            'Protector contra sobretensiones tipo 2 para tableros de distribución.',
   3200.00,  'MXN', 15, 'active', (SELECT id FROM brands WHERE slug='eaton'),              (SELECT id FROM categories WHERE slug='supresores-picos'), '["Tipo 2","40kA","1 polo","277V","Indicador de fin de vida"]'),

  -- === Fusibles Industriales (Siemens, Legrand) ===
  ('Fusible NH gG 100A',         'SIE-NH-GG100',     'nh-gg-100',          'Fusible de cuchillas NH tamaño 0 para protección general de circuitos.',
   350.00,   'MXN', 150,'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='fusibles-industriales'), '["NH00","100A","gG uso general","500V AC","Base NH00"]'),
  ('Fusible NH aM 63A',          'SIE-NH-AM63',      'nh-am-63',           'Fusible de cuchillas NH para protección de motores y arrancadores.',
   420.00,   'MXN', 120,'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='fusibles-industriales'), '["NH00","63A","aM acompañamiento motor","500V","Tamaño 000"]'),
  ('Fusible cilíndrico 10A',     'LEG-FUS-10A',      'cilindrico-10a',     'Fusible cilíndrico 10x38mm para protección de circuitos de control y alumbrado.',
   85.00,    'MXN', 300,'active', (SELECT id FROM brands WHERE slug='legrand'),           (SELECT id FROM categories WHERE slug='fusibles-industriales'), '["10x38mm","10A","gG","400V","Base portafusible"]'),
  ('Fusible cilíndrico 20A',     'LEG-FUS-20A',      'cilindrico-20a',     'Fusible cilíndrico 14x51mm para protección de circuitos de potencia hasta 20A.',
   120.00,   'MXN', 250,'active', (SELECT id FROM brands WHERE slug='legrand'),           (SELECT id FROM categories WHERE slug='fusibles-industriales'), '["14x51mm","20A","gG","500V","Tamaño 14x51"]'),

  -- === Reles de Protección (Schneider, Siemens) ===
  ('Relevador térmico LRD 12-18A','SCH-LRD-18A',     'lrd-18a',            'Relé de sobrecarga térmica clase 10A para protección de motores trifásicos.',
   1450.00,  'MXN', 35, 'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='relevadores-proteccion'), '["Rango 12-18A","Clase 10A","Contactos NA+NC","Compensación térmica","Montaje directo contactor"]'),
  ('Relevador térmico LRD 2.5-4A','SCH-LRD-4A',      'lrd-4a',             'Relé de sobrecarga para motores pequeños, compatible con contactores TeSys D.',
   980.00,   'MXN', 40, 'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='relevadores-proteccion'), '["Rango 2.5-4A","Clase 10A","Contactos NA+NC","IEC 60947","Reset manual/automático"]'),
  ('Relevador 3RU2 10-16A',      'SIE-3RU2-16A',     '3ru2-16a',           'Relé de sobrecarga SIRIUS para montaje directo en contactores SIRIUS.',
   1680.00,  'MXN', 25, 'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='relevadores-proteccion'), '["Rango 10-16A","Clase 10","Contactos 1NA+1NC","IEC 60947-4-1","Montaje directo 3RT2"]'),

  -- === Canaletas y Ductos (Panduit, Legrand) ===
  ('Canaleta ranurada 40x60mm',  'PAN-CAN-4060',     'canaleta-4060',      'Canaleta de cableado ranurada en PVC color gris, 40x60mm para tableros eléctricos.',
   185.00,   'MXN', 200,'active', (SELECT id FROM brands WHERE slug='panduit'),           (SELECT id FROM categories WHERE slug='canaletas-ductos'), '["40x60mm","Longitud 2m","PVC gris claro","IP54","Tapa a presión"]'),
  ('Canaleta ranurada 80x80mm',  'PAN-CAN-8080',     'canaleta-8080',      'Canaleta de cableado ranurada PVC para distribución principal de cables en tableros.',
   320.00,   'MXN', 120,'active', (SELECT id FROM brands WHERE slug='panduit'),           (SELECT id FROM categories WHERE slug='canaletas-ductos'), '["80x80mm","Longitud 2m","PVC gris","Grado de protección IP54","Tapa ranurada"]'),
  ('Canaleta DLP 40x16mm',       'LEG-DLP-4016',     'dlp-4016',           'Canaleta de pared DLP para instalaciones residenciales y comerciales ligeras.',
   120.00,   'MXN', 300,'active', (SELECT id FROM brands WHERE slug='legrand'),           (SELECT id FROM categories WHERE slug='canaletas-ductos'), '["40x16mm","Longitud 2m","PVC blanco","Autoadhesiva","Tapa a presión"]'),

  -- === Conectores y Prensaestopas (Phoenix Contact, Wago) ===
  ('Conector COMBICON 5pos',     'PHX-COMB-5P',      'com bicón-5pos',     'Conector enchufable para PCB de 5 posiciones, paso 3.81mm.',
   95.00,    'MXN', 500,'active', (SELECT id FROM brands WHERE slug='phoenix-contact'),   (SELECT id FROM categories WHERE slug='conectores-prensaestopas'), '["5 posiciones","Paso 3.81mm","Bornes de tornillo","160V / 6A","Color verde"]'),
  ('Prensaestopa M20 x 1.5',     'PHX-PREN-M20',     'prensaestopa-m20',   'Prensaestopa de nylon para cables de 6-12mm, grado de protección IP68.',
   35.00,    'MXN', 800,'active', (SELECT id FROM brands WHERE slug='phoenix-contact'),   (SELECT id FROM categories WHERE slug='conectores-prensaestopas'), '["M20 x 1.5","Rango 6-12mm","Nylon PA66","IP68","Gris"]'),
  ('Borne de conexión 221-415',  'WAG-221-415',      '221-415',            'Borne de conexión compacto con palanca, para 5 conductores de 0.14-4mm².',
   45.00,    'MXN', 600,'active', (SELECT id FROM brands WHERE slug='wago'),              (SELECT id FROM categories WHERE slug='conectores-prensaestopas'), '["5 conductores","0.14-4mm²","450V / 32A","Palanca naranja","Transparente"]'),
  ('Borne 2273-203',             'WAG-2273-203',     '2273-203',           'Borne de conexión compacto de 3 conductores para aplicaciones de iluminación.',
   25.00,    'MXN', 1000,'active', (SELECT id FROM brands WHERE slug='wago'),              (SELECT id FROM categories WHERE slug='conectores-prensaestopas'), '["3 conductores","0.5-2.5mm²","400V / 24A","Transparente","Push-in"]'),

  -- === Dimmers y Atenuadores (Lutron, Bticino) ===
  ('Dimmer Maestro CL 150W',     'LUT-MACL-153M',    'maestro-cl-150w',    'Dimmer para LED y CFL con tecnología patentada de disipación de calor.',
   1850.00,  'MXN', 35, 'active', (SELECT id FROM brands WHERE slug='lutron'),            (SELECT id FROM categories WHERE slug='dimmers-atenuadores'), '["150W LED/CFL","120V","Maestro","Tecnología HED","3 vías compatible"]'),
  ('Dimmer Maestro 600W',        'LUT-MA-600',       'maestro-600w',       'Dimmer de alta potencia para lámparas incandescentes y halógenas.',
   2200.00,  'MXN', 20, 'active', (SELECT id FROM brands WHERE slug='lutron'),            (SELECT id FROM categories WHERE slug='dimmers-atenuadores'), '["600W incandescente","120V","Maestro","Disipador de aluminio","3 vías"]'),
  ('Dimmer Living Light 300W',   'BTI-DIM-300W',     'living-light-300w',  'Regulador de intensidad para lámparas incandescentes y halógenas, diseño elegante.',
   950.00,   'MXN', 40, 'active', (SELECT id FROM brands WHERE slug='bticino'),           (SELECT id FROM categories WHERE slug='dimmers-atenuadores'), '["300W","220-240V","Living Light","Mecanismo estándar","Placa frontal incluida"]'),

  -- === Interruptores Inteligentes (Lutron, Bticino) ===
  ('Interruptor Caseta Wireless','LUT-PD6ANS',       'caseta-wireless',    'Interruptor inalámbrico para iluminación inteligente con tecnología Clear Connect.',
   2200.00,  'MXN', 22, 'active', (SELECT id FROM brands WHERE slug='lutron'),            (SELECT id FROM categories WHERE slug='interruptores-inteligentes'), '["120V","600W incandescente","Clear Connect RF","App Caseta","Hub requerido"]'),
  ('Interruptor Living Now WiFi', 'BTI-LN-WIFI',     'living-now-wifi',    'Interruptor inteligente WiFi para control remoto desde app de iluminación.',
   1650.00,  'MXN', 18, 'active', (SELECT id FROM brands WHERE slug='bticino'),           (SELECT id FROM categories WHERE slug='interruptores-inteligentes'), '["220-240V","WiFi 2.4GHz","App Living Now","Compatible Alexa/Google","Neutro requerido"]'),

  -- === Luminarias LED (Schneider, Eaton) ===
  ('Luminaria LED High Bay 200W','SCH-HB-200W',      'high-bay-200w',      'Luminaria LED industrial tipo campana para naves, almacenes y talleres.',
   4500.00,  'MXN', 15, 'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='luminarias-led'), '["200W","20000 lúmenes","5000K luz día","IP65","Montaje suspendido"]'),
  ('Luminaria LED Panel 600x600', 'SCH-LED-PANEL',   'panel-600x600',      'Panel LED cuadrado para cielos rasos, luz blanca de alta eficiencia.',
   2800.00,  'MXN', 30, 'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='luminarias-led'), '["40W","3600 lúmenes","4000K neutro","IP20","Empotrable"]'),
  ('Luminaria LED 150W',          'EAT-LED-150W',     'led-industrial-150w','Luminaria LED industrial de 150W para iluminación de naves y exteriores.',
   5800.00,  'MXN', 20, 'active', (SELECT id FROM brands WHERE slug='eaton'),              (SELECT id FROM categories WHERE slug='luminarias-led'), '["150W","18000 lúmenes","5000K","IP66","Vida útil 50000h"]'),

  -- === Multímetros Digitales (Fluke, Klein Tools) ===
  ('Multímetro Fluke 117',       'FLK-117',          'fluke-117',          'Multímetro True RMS para electricistas comerciales con detección de tensión sin contacto.',
   8100.00,  'MXN', 18, 'active', (SELECT id FROM brands WHERE slug='fluke'),             (SELECT id FROM categories WHERE slug='multimetros-digitales'), '["600V CA/CC","True RMS","VoltAlert NCV","AutoV","Resistencia 50MΩ"]'),
  ('Multímetro Fluke 87V',       'FLK-87V',          'fluke-87v',          'Multímetro industrial de alta precisión True RMS con filtro paso bajo.',
   12500.00, 'MXN', 10, 'active', (SELECT id FROM brands WHERE slug='fluke'),             (SELECT id FROM categories WHERE slug='multimetros-digitales'), '["1000V CA/CC","True RMS","Filtro paso bajo","Frecuencia 200kHz","IP67"]'),
  ('Multímetro Fluke 179',       'FLK-179',          'fluke-179',          'Multímetro digital True RMS de uso general con medición de temperatura.',
   11200.00, 'MXN', 8,  'active', (SELECT id FROM brands WHERE slug='fluke'),             (SELECT id FROM categories WHERE slug='multimetros-digitales'), '["600V CA/CC","True RMS","Termopar tipo K","Resistencia","Capacitancia"]'),
  ('Multímetro Klein MM700',     'KLN-MM700',        'klein-mm700',        'Multímetro auto-rango True RMS con medición de temperatura y capacitancia.',
   3800.00,  'MXN', 25, 'active', (SELECT id FROM brands WHERE slug='klein-tools'),       (SELECT id FROM categories WHERE slug='multimetros-digitales'), '["600V CA/CC","True RMS","Termopar tipo K","Capacitancia 1000µF","Resistencia 40MΩ"]'),

  -- === Pinzas Amperimétricas (Fluke, Klein Tools) ===
  ('Pinza Amperimétrica 376 FC', 'FLK-376FC',        'pinza-376fc',        'Pinza CA/CC True RMS 1000A con iFlex y conectividad Fluke Connect.',
   15800.00, 'MXN', 12, 'active', (SELECT id FROM brands WHERE slug='fluke'),             (SELECT id FROM categories WHERE slug='pinzas-amperimetricas'), '["1000A CA/CC","True RMS","iFlex 2500A","Fluke Connect","CAT IV 600V"]'),
  ('Pinza Amperimétrica 375 FC', 'FLK-375FC',        'pinza-375fc',        'Pinza CA/CC True RMS 600A con iFlex y registro de datos.',
   12800.00, 'MXN', 8,  'active', (SELECT id FROM brands WHERE slug='fluke'),             (SELECT id FROM categories WHERE slug='pinzas-amperimetricas'), '["600A CA/CC","True RMS","iFlex 2500A","Registro inalámbrico","CAT III 600V"]'),
  ('Pinza CL800 600A',           'KLN-CL800',        'klein-cl800',        'Pinza amperimétrica digital True RMS con auto-rango 600A AC/DC.',
   5200.00,  'MXN', 20, 'active', (SELECT id FROM brands WHERE slug='klein-tools'),       (SELECT id FROM categories WHERE slug='pinzas-amperimetricas'), '["600A CA/CC","True RMS","600V CA/CC","Resistencia 40MΩ","Capacitancia 1000µF"]'),

  -- === Analizadores de Redes (Fluke) ===
  ('Analizador de Energía 1760', 'FLK-1760',         'fluke-1760',         'Registrador trifásico de calidad de energía eléctrica de clase A.',
   85000.00, 'MXN', 3,  'active', (SELECT id FROM brands WHERE slug='fluke'),             (SELECT id FROM categories WHERE slug='analizadores-redes'), '["Clase A IEC 61000-4-30","4 canales de tensión + 4 corriente","Registro 1 año","PQ Log software","Reportes automáticos"]'),
  ('Analizador 435 Serie II',    'FLK-435-II',       'fluke-435',          'Analizador trifásico de calidad de energía con detección de eventos.',
   65000.00, 'MXN', 2,  'active', (SELECT id FROM brands WHERE slug='fluke'),             (SELECT id FROM categories WHERE slug='analizadores-redes'), '["Clase A","4U+4I","Flicker","Armónicos hasta 50º","PowerLog 5.0"]'),

  -- === Termómetros Infrarrojos (Fluke, Klein Tools) ===
  ('Termómetro IR Fluke 62 MAX+','FLK-62MAX-PLUS',   'ir-62-max-plus',     'Termómetro infrarrojo resistente IP54 con óptica 10:1 y láser.',
   4800.00,  'MXN', 25, 'active', (SELECT id FROM brands WHERE slug='fluke'),             (SELECT id FROM categories WHERE slug='termometros-infrarrojos'), '["Rango -30° a 650°C","IP54","Óptica 10:1","Láser doble","Precisión ±1.5°C"]'),
  ('Termómetro IR Klein IR1',    'KLN-IR1',          'klein-ir1',          'Termómetro infrarrojo compacto con rango -20° a 430°C para mantenimiento.',
   2800.00,  'MXN', 30, 'active', (SELECT id FROM brands WHERE slug='klein-tools'),       (SELECT id FROM categories WHERE slug='termometros-infrarrojos'), '["Rango -20° a 430°C","Óptica 8:1","Láser guía","Retroiluminación","Precisión ±2°C"]'),

  -- === Contactores y Arrancadores (Siemens, Schneider, ABB, Eaton) ===
  ('Contactor SIRIUS 3RT2 25A',  'SIE-3RT2-25A',     'sirius-3rt2-25a',    'Contactor de potencia 3 polos para motores hasta 11kW a 400V.',
   2100.00,  'MXN', 35, 'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='contactores-arrancadores'), '["25A","3 polos","220-230V 50/60Hz","11kW @ 400V","IEC 60947"]'),
  ('Contactor SIRIUS 3RT2 12A',  'SIE-3RT2-12A',     'sirius-3rt2-12a',    'Contactor compacto para motores pequeños y circuitos de control.',
   1450.00,  'MXN', 50, 'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='contactores-arrancadores'), '["12A","3 polos","220-230V","5.5kW @ 400V","IEC 60947"]'),
  ('Contactor TeSys D LC1D 32A', 'SCH-LC1D-32A',     'tesys-lc1d-32a',     'Contactor tripolar para control de motores hasta 15kW en aplicaciones industriales.',
   2450.00,  'MXN', 30, 'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='contactores-arrancadores'), '["32A","3 polos","220V 50/60Hz","15kW @ 400V","IEC 60947-4-1"]'),
  ('Contactor TeSys K LC1K 9A',  'SCH-LC1K-9A',      'tesys-lc1k-9a',      'Contactor miniatura para circuitos de control y motores pequeños.',
   680.00,   'MXN', 80, 'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='contactores-arrancadores'), '["9A","3 polos","220V","4kW @ 400V","Carril DIN 35mm"]'),
  ('Contactor AF26-30 26A',      'ABB-AF26-30',      'af26-30',            'Contactor serie AF con bobina electrónica universal para amplio rango de tensión.',
   2800.00,  'MXN', 22, 'active', (SELECT id FROM brands WHERE slug='abb'),                (SELECT id FROM categories WHERE slug='contactores-arrancadores'), '["26A","3 polos","Bobina 100-250V AC/DC","7.5kW @ 400V","Electrónica integrada"]'),
  ('Contactor AF09-30 9A',       'ABB-AF09-30',      'af09-30',            'Contactor compacto serie AF para aplicaciones de iluminación y control.',
   1800.00,  'MXN', 45, 'active', (SELECT id FROM brands WHERE slug='abb'),                (SELECT id FROM categories WHERE slug='contactores-arrancadores'), '["9A","3 polos","Bobina 24V AC/DC","4kW @ 400V","Carril DIN"]'),
  ('Arrancador Eaton XT 12A',    'EAT-XT-12A',       'eaton-xt-12a',       'Arrancador combinado con protección térmica integrada para motores.',
   4500.00,  'MXN', 15, 'active', (SELECT id FROM brands WHERE slug='eaton'),              (SELECT id FROM categories WHERE slug='contactores-arrancadores'), '["12A","Hasta 5.5kW","Protección clase 10","220-240V","Reset manual"]'),

  -- === Tableros de Distribución (Schneider, ABB) ===
  ('Tablero PRAGMA 24 módulos',  'SCH-PRA-24M',      'pragma-24m',         'Tablero modular empotrable para distribución eléctrica de 24 módulos.',
   3200.00,  'MXN', 18, 'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='tableros-distribucion'), '["24 módulos","Empotrable","Puerta transparente","IP40","Bornes de 63A"]'),
  ('Tablero PRAGMA 48 módulos',  'SCH-PRA-48M',      'pragma-48m',         'Tablero modular para distribución eléctrica de gran capacidad, 48 módulos.',
   5800.00,  'MXN', 8,  'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='tableros-distribucion'), '["48 módulos","Empotrable","Puerta opaca","IP40","Bornes de 125A"]'),
  ('Tablero ABB Mistral 36M',    'ABB-M36-36M',      'mistral-36m',        'Tablero modular Mistral de 36 módulos con puerta transparente.',
   4200.00,  'MXN', 12, 'active', (SELECT id FROM brands WHERE slug='abb'),                (SELECT id FROM categories WHERE slug='tableros-distribucion'), '["36 módulos","Empotrable/sobreponer","Puerta transparente","IP54","Bornes 100A"]'),

  -- === Botones y Señalización (Schneider, Siemens) ===
  ('Botonera XB5 22mm verde',    'SCH-XB5-AA31',     'xb5-verde',          'Pulsador rasante verde NA de 22mm para tableros de control y mando.',
   380.00,   'MXN', 90, 'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='botones-senalizacion'), '["22mm","Verde","1NA + retorno","Cuerpo plástico","XB5 serie"]'),
  ('Botonera XB5 22mm rojo',     'SCH-XB5-AA32',     'xb5-rojo',           'Pulsador rasante rojo NA de 22mm para parada de emergencia o alarma.',
   380.00,   'MXN', 85, 'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='botones-senalizacion'), '["22mm","Rojo","1NA + retorno","XB5 serie","Incluye base de contacto"]'),
  ('Selector XB5 2 posiciones',  'SCH-XB5-AD25',     'xb5-selector',       'Selector de 2 posiciones con retorno por resorte, 22mm.',
   520.00,   'MXN', 60, 'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='botones-senalizacion'), '["22mm","2 posiciones","Retorno resorte","1NA","XB5 serie"]'),
  ('Indicador LED 22mm rojo',    'SIE-3SU1-RED',     '3su1-rojo',          'Luz indicadora LED 24V para señalización óptica en tableros de control.',
   290.00,   'MXN', 100,'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='botones-senalizacion'), '["22mm","LED rojo 24V AC/DC","SIRIUS 3SU1","Grado de protección IP20","Bornes de tornillo"]'),
  ('Indicador LED 22mm verde',   'SIE-3SU1-GRN',     '3su1-verde',         'Luz indicadora LED verde 24V para señalización de estado en tableros.',
   290.00,   'MXN', 100,'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='botones-senalizacion'), '["22mm","LED verde 24V AC/DC","SIRIUS 3SU1","IP20","Bornes de tornillo"]'),

  -- === Temporizadores (Siemens, Schneider) ===
  ('Temporizador LOGO! TD',      'SIE-LOGO-TD',      'logo-td',            'Módulo de visualización y temporización para LOGO! 8 con pantalla OLED.',
   1200.00,  'MXN', 30, 'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='temporizadores'), '["Pantalla OLED","Para LOGO! 8","Hasta 99:59:59","Reemplazo LOGO! TD","Montaje directo"]'),
  ('Temporizador RE22R2Q',       'SCH-RE22R2Q',      're22r2q',            'Relé temporizador multifunción con 10 rangos de tiempo (0.1s a 10 días).',
   1350.00,  'MXN', 25, 'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='temporizadores'), '["Multifunción","10 rangos 0.1s-10 días","220-240V AC","2 contactos NA","Carril DIN"]'),

  -- === Switches Ethernet (Siemens, Schneider) ===
  ('Switch SCALANCE XB005',      'SIE-XB005',        'scalance-xb005',     'Switch Ethernet industrial no gestionado de 5 puertos para automatización.',
   3800.00,  'MXN', 18, 'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='switches-ethernet'), '["5 puertos 10/100","No gestionado","24V DC","IP20","Montaje carril DIN"]'),
  ('Switch SCALANCE XC206',      'SIE-XC206',        'scalance-xc206',     'Switch Ethernet gestionado de 6 puertos para redes industriales PROFINET.',
   9500.00,  'MXN', 8,  'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='switches-ethernet'), '["6 puertos 10/100","Gestionado","PROFINET","MRP","VLAN, QoS"]'),
  ('Switch ConneXium 8 puertos', 'SCH-TCSESM-8P',   'connexium-8p',       'Switch Ethernet industrial gestionado de 8 puertos para entornos exigentes.',
   6500.00,  'MXN', 12, 'active', (SELECT id FROM brands WHERE slug='schneider-electric'), (SELECT id FROM categories WHERE slug='switches-ethernet'), '["8 puertos 10/100","Gestionado","Redundancia RSTP","QoS","Rango -40 a 70°C"]'),

  -- === Módulos de Comunicación (Siemens) ===
  ('Módulo PROFINET CM 1542-1',  'SIE-CM1542-1',     'cm-1542-1',          'Procesador de comunicaciones PROFINET para SIMATIC S7-1500.',
   9800.00,  'MXN', 6,  'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='modulos-comunicacion'), '["PROFINET IRT","2 puertos RJ45","MRP","S2 redundancia","Para S7-1500"]'),
  ('Módulo Ethernet CP 343-1',   'SIE-CP343-1',      'cp-343-1',           'Procesador de comunicaciones Industrial Ethernet para SIMATIC S7-300.',
   12500.00, 'MXN', 4,  'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='modulos-comunicacion'), '["Industrial Ethernet","PROFINET IO","2 puertos RJ45","MRP","Para S7-300"]'),

  -- === Cables de Red Industrial (Panduit, Siemens) ===
  ('Cable Cat6 Industrial 305m', 'PAN-CAT6-IND',     'cat6-industrial',    'Cable FTP Cat6 blindado de 4 pares para ambientes industriales, 305m.',
   8500.00,  'MXN', 10, 'active', (SELECT id FROM brands WHERE slug='panduit'),           (SELECT id FROM categories WHERE slug='cables-red-industrial'), '["Cat6","FTP","305m","PVC","Industria"]'),
  ('Cable Cat5e Industrial 305m','PAN-CAT5E-IND',    'cat5e-industrial',   'Cable UTP Cat5e de 4 pares para redes industriales, 305m, color azul.',
   5400.00,  'MXN', 15, 'active', (SELECT id FROM brands WHERE slug='panduit'),           (SELECT id FROM categories WHERE slug='cables-red-industrial'), '["Cat5e","UTP","305m","Azul","Industria"]'),

  -- === Routers Industriales (Siemens) ===
  ('Router SCALANCE M876-4',     'SIE-M876-4',       'scalance-m876-4',    'Router industrial 4G/LTE para comunicación remota segura con plantas.',
   22000.00, 'MXN', 4,  'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='routers-industriales'), '["4G/LTE","VPN","Router NAT","2 puertos Ethernet","Antenas SMA"]'),
  ('Router SCALANCE M8-2',       'SIE-M8-2',         'scalance-m8-2',      'Router industrial para conexión WAN con soporte de VPN y firewall.',
   15000.00, 'MXN', 5,  'active', (SELECT id FROM brands WHERE slug='siemens'),           (SELECT id FROM categories WHERE slug='routers-industriales'), '["WAN","VPN IPSec","Firewall","2 puertos Ethernet","Carril DIN"]'),

  -- === Charolas Portacables (Panduit) ===
  ('Charola tipo escalera 30cm', 'PAN-CHAR-30',      'charola-escalera-30','Charola tipo escalera de aluminio para rutas de cableado industrial, 30cm ancho.',
   650.00,   'MXN', 60, 'active', (SELECT id FROM brands WHERE slug='panduit'),           (SELECT id FROM categories WHERE slug='charolas-portacables'), '["30cm ancho","Aluminio","Tipo escalera","Longitud 3m","Galvanizada"]'),

  -- === Tubería Conduit (Legrand) ===
  ('Tubo Conduit PVC 3/4"',      'LEG-COND-34',      'cond-pvc-34',        'Tubo rígido PVC tipo pesado para canalización eléctrica de 3/4 pulgada.',
   45.00,    'MXN', 500,'active', (SELECT id FROM brands WHERE slug='legrand'),           (SELECT id FROM categories WHERE slug='tuberia-conduit'), '["3/4 pulgada","PVC pesado","Longitud 3m","Diámetro interior 20mm","Rango temp -5 a 60°C"]'),

  -- === Sensores de Movimiento (Lutron) ===
  ('Sensor Ocupación Maestro',   'LUT-MS-OPS6M',     'ocupacion-maestro',  'Sensor de ocupación y vacancia dual PIR para ahorro energético.',
   1650.00,  'MXN', 28, 'active', (SELECT id FROM brands WHERE slug='lutron'),            (SELECT id FROM categories WHERE slug='sensores-movimiento'), '["PIR dual","120V","Maestro","360°","Techo 2.4-4.6m"]')
;

-- ════════════════════════════════════════════
-- 6. VERIFICACIÓN
-- ════════════════════════════════════════════
SELECT '✅ Marcas: '         || COUNT(*) FROM brands
UNION ALL
SELECT '✅ Categorías padre: ' || COUNT(*) FROM categories WHERE parent_id IS NULL
UNION ALL
SELECT '✅ Subcategorías: '  || COUNT(*) FROM categories WHERE parent_id IS NOT NULL
UNION ALL
SELECT '✅ Productos: '      || COUNT(*) FROM products;

-- Verificar que cada subcategoria tenga al menos 2 marcas distintas
SELECT
  cat.name AS subcategoria,
  COUNT(DISTINCT p.brand_id) AS marcas_distintas,
  COUNT(p.id) AS total_productos
FROM categories cat
JOIN products p ON p.category_id = cat.id
WHERE cat.parent_id IS NOT NULL
GROUP BY cat.id, cat.name
ORDER BY marcas_distintas DESC;

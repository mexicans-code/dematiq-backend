-- ============================================
-- Dematiq - Productos Iniciales
-- ============================================

INSERT INTO products (name, slug, description, sku, category_id, price, stock, specs) VALUES
(
  'PLC S7-1200',
  'plc-s7-1200',
  'Controlador lógico programable compacto para aplicaciones de automatización de media y baja complejidad. Ideal para sistemas de control industrial, monitoreo de procesos y automatización de maquinaria.',
  'PLC-S7-1200-AC',
  1,
  299.99,
  15,
  '["CPU compacta con E/S integradas", "Comunicación PROFINET integrada", "Memoria de trabajo de 50 KB", "Hasta 4 módulos de expansión", "Alimentación 120/240 VAC", "Grado de protección IP20"]'
),
(
  'PLC S7-1500',
  'plc-s7-1500',
  'Controlador lógico programable de alto rendimiento para automatización compleja y aplicaciones de alta velocidad.',
  'PLC-S7-1500-AC',
  1,
  899.99,
  8,
  '["CPU de alto rendimiento", "Comunicación PROFINET IRT", "Memoria de trabajo de 500 KB", "Hasta 32 módulos de expansión", "Alimentación 120/240 VAC", "Grado de protección IP20"]'
),
(
  'Sensor Inductivo M18',
  'sensor-inductivo-m18',
  'Sensor de proximidad inductivo para detección de objetos metálicos sin contacto. Ideal para aplicaciones de posicionamiento y conteo en entornos industriales.',
  'SEN-M18-IND',
  2,
  38.50,
  50,
  '["Alcance de detección de 8 mm", "Salida PNP/NPN seleccionable", "Cuerpo roscado M18", "Rango de temperatura -25 a 70°C", "Grado de protección IP67", "LED indicador de estado"]'
),
(
  'Sensor Fotoeléctrico',
  'sensor-fotoelectrico',
  'Sensor fotoeléctrico de barrera para detección de objetos a larga distancia. Ideal para aplicaciones de acceso, seguridad y control de procesos.',
  'SEN-FOT-BARR',
  2,
  52.00,
  35,
  '["Alcance de hasta 20 m", "Tecnología infrarroja", "Salida PNP/NPN seleccionable", "Cuerpo compacto", "Grado de protección IP67", "LED indicador de alineación"]'
),
(
  'Variador Altivar 320',
  'variador-altivar-320',
  'Variador de velocidad para motores asíncronos trifásicos. Ofrece control preciso de par y velocidad para aplicaciones de bombeo, ventilación y transporte.',
  'VAR-ATV320-1',
  3,
  245.00,
  20,
  '["Potencia de 0.37 a 15 kW", "Control vectorial sin sensor", "Comunicación Modbus integrada", "Protección térmica del motor", "Frenado por inyección DC", "Grado de protección IP20"]'
),
(
  'Variador PowerFlex 525',
  'variador-powerflex-525',
  'Variador de CA de alto rendimiento con control de velocidad y par para aplicaciones exigentes en automatización industrial.',
  'VAR-PF525-2',
  3,
  389.00,
  12,
  '["Potencia de 0.37 a 22 kW", "Control vectorial y V/Hz", "Puerto Ethernet/IP integrado", "Seguridad STO (Safe Torque Off)", "Frenado dinámico", "Grado de protección IP20/NEMA 1"]'
),
(
  'Pantalla HMI 7"',
  'pantalla-hmi-7',
  'Pantalla táctil industrial de 7" para visualización y control de procesos. Ideal para supervisión de maquinaria y líneas de producción.',
  'HMI-7-TFT',
  4,
  425.00,
  10,
  '["Pantalla TFT LCD 7\" a color", "Resolución 800x480", "Interfaz táctil resistiva", "Puertos USB y RS232/RS485", "Software de diseño incluido", "Grado de protección IP65 (frente)"]'
),
(
  'Pantalla HMI 10"',
  'pantalla-hmi-10',
  'Pantalla táctil industrial de 10 pulgadas para aplicaciones avanzadas de supervisión y control de procesos industriales.',
  'HMI-10-TFT',
  4,
  680.00,
  7,
  '["Pantalla TFT LCD 10.1\" a color", "Resolución 1024x600", "Interfaz táctil capacitiva", "Puertos Ethernet, USB y RS232", "Soporte para gráficos avanzados", "Grado de protección IP65 (frente)"]'
),
(
  'Cable RS485 10m',
  'cable-rs485-10m',
  'Cable blindado para comunicación RS485 con conector DB9. Ideal para redes industriales de sensores y actuadores en entornos de automatización.',
  'CBL-RS485-10M',
  5,
  18.99,
  100,
  '["Longitud de 10 metros", "Blindaje trenzado", "Impedancia de 120 ohmios", "Conectores DB9 en ambos extremos", "Tensión máxima 300 V", "Temperatura -20 a 80°C"]'
),
(
  'Cable Ethernet Industrial',
  'cable-ethernet-industrial',
  'Cable Ethernet industrial Cat6 blindado para redes PROFINET y EtherNet/IP. Resistente a interferencias electromagnéticas.',
  'CBL-ETH-CAT6',
  5,
  25.50,
  80,
  '["Longitud de 5 metros", "Categoría 6 (hasta 1 Gbps)", "Blindaje SF/UTP", "Conectores RJ45 blindados", "Apto para arrastre en cadena", "Temperatura -40 a 85°C"]'
),
(
  'Fuente Poder 24V 5A',
  'fuente-poder-24v-5a',
  'Fuente de alimentación conmutada de 24V CC con 5A de corriente de salida. Ideal para alimentar PLCs, sensores y equipos de automatización.',
  'PS-24V-5A',
  6,
  89.99,
  25,
  '["Entrada 100-240 VAC", "Salida 24V CC / 5A (120W)", "Protección contra cortocircuitos", "Protección contra sobrecarga", "Carcasa metálica", "Montaje en riel DIN"]'
),
(
  'Fuente Poder 12V 10A',
  'fuente-poder-12v-10a',
  'Fuente de alimentación conmutada de 12V CC con 10A de corriente de salida. Ideal para alimentar dispositivos electrónicos y equipos industriales.',
  'PS-12V-10A',
  6,
  72.00,
  30,
  '["Entrada 100-240 VAC", "Salida 12V CC / 10A (120W)", "Protección contra sobrecarga", "Protección contra sobretensión", "Carcasa metálica", "Montaje en riel DIN"]'
);

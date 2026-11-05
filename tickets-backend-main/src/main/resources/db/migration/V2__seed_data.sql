-- ===================================================
-- DATOS INICIALES DEL SISTEMA
-- ===================================================

-- Roles
INSERT INTO roles (nombre, descripcion) VALUES
('ADMINISTRADOR', 'Administrador del sistema'),
('SUPERVISOR',    'Supervisor de soporte'),
('AGENTE',        'Agente de soporte técnico'),
('USUARIO',       'Usuario solicitante');

-- Impactos
INSERT INTO impactos (nombre, valor, descripcion) VALUES
('Bajo',     1, 'Afecta a un usuario, tiene solución alterna'),
('Medio',    2, 'Afecta a varios usuarios o área'),
('Alto',     3, 'Afecta a dependencia completa'),
('Crítico',  4, 'Afecta a toda la institución o servicio crítico');

-- Urgencias
INSERT INTO urgencias (nombre, valor, descripcion) VALUES
('Baja',      1, 'Puede esperar sin afectar operaciones'),
('Media',     2, 'Requiere atención en el día'),
('Alta',      3, 'Requiere atención en pocas horas'),
('Inmediata', 4, 'Requiere atención inmediata');

-- Prioridades
INSERT INTO prioridades (nombre, nivel, descripcion, color) VALUES
('Baja',     1, 'Atención normal',        '#6B7280'),
('Media',    2, 'Atención dentro del día', '#F59E0B'),
('Alta',     3, 'Atención urgente',        '#EF4444'),
('Crítica',  4, 'Atención inmediata',      '#7C3AED');

-- Estatus del ticket
INSERT INTO estatus_ticket (nombre, descripcion, orden, color, es_final) VALUES
('Nuevo',               'Ticket recién creado',               1,  '#3B82F6', FALSE),
('Asignado',            'Ticket asignado a un agente',        2,  '#8B5CF6', FALSE),
('En revisión',         'El agente está revisando el ticket', 3,  '#F59E0B', FALSE),
('En atención',         'El agente está trabajando en ello',  4,  '#F97316', FALSE),
('Pendiente usuario',   'Esperando respuesta del usuario',    5,  '#6B7280', FALSE),
('Pendiente tercero',   'Esperando respuesta de tercero',     6,  '#6B7280', FALSE),
('Resuelto',            'Problema resuelto',                  7,  '#10B981', FALSE),
('Cerrado',             'Ticket cerrado formalmente',         8,  '#6B7280', TRUE),
('Cancelado',           'Ticket cancelado',                   9,  '#EF4444', TRUE),
('Reabierto',           'Ticket reabierto por el usuario',    10, '#3B82F6', FALSE),
('Escalado',            'Ticket escalado a nivel superior',   11, '#DC2626', FALSE);

-- Tipos de solicitud
INSERT INTO tipos_solicitud (nombre, descripcion) VALUES
('Incidente',              'Interrupción o degradación de servicio'),
('Requerimiento',          'Solicitud de nuevo servicio o recurso'),
('Solicitud de servicio',  'Petición de servicio estándar'),
('Consulta',               'Pregunta o duda técnica'),
('Mantenimiento preventivo','Revisión programada'),
('Cambio',                 'Solicitud de modificación controlada');

-- Categorías de servicio
INSERT INTO categorias_servicio (nombre, descripcion, icono) VALUES
('Hardware',          'Equipos físicos de cómputo',            'cpu'),
('Software',          'Aplicaciones y sistemas',               'code'),
('Red / Internet',    'Conectividad y redes',                  'wifi'),
('Correo / Cuentas',  'Correo electrónico y cuentas de usuario','mail'),
('Impresoras',        'Impresoras y escáneres',                'printer'),
('Telefonía',         'Teléfonos y extensiones',               'phone'),
('Accesos / Permisos','Accesos a sistemas y permisos',         'lock'),
('Videoconferencia',  'Sistemas de videoconferencia',          'video'),
('Otro',              'Otros servicios no categorizados',      'help-circle');

-- Subcategorías Hardware
INSERT INTO subcategorias_servicio (categoria_servicio_id, nombre) VALUES
(1, 'Laptop'),
(1, 'Desktop'),
(1, 'Monitor'),
(1, 'Teclado'),
(1, 'Mouse'),
(1, 'Impresora'),
(1, 'Escáner'),
(1, 'UPS'),
(1, 'Proyector'),
(1, 'Otro');

-- Subcategorías Software
INSERT INTO subcategorias_servicio (categoria_servicio_id, nombre) VALUES
(2, 'Instalación'),
(2, 'Configuración'),
(2, 'Falla / Error'),
(2, 'Actualización'),
(2, 'Licenciamiento'),
(2, 'Acceso'),
(2, 'Integración'),
(2, 'Otro');

-- Subcategorías Red / Internet
INSERT INTO subcategorias_servicio (categoria_servicio_id, nombre) VALUES
(3, 'Sin conexión'),
(3, 'Intermitencia'),
(3, 'Lentitud'),
(3, 'Configuración de red'),
(3, 'VPN'),
(3, 'WiFi'),
(3, 'Puerto de red'),
(3, 'Otro');

-- Subcategorías Correo / Cuentas
INSERT INTO subcategorias_servicio (categoria_servicio_id, nombre) VALUES
(4, 'Alta de cuenta'),
(4, 'Baja de cuenta'),
(4, 'Cambio de contraseña'),
(4, 'Bloqueo de cuenta'),
(4, 'Configuración de correo'),
(4, 'Permisos de acceso'),
(4, 'Otro');

-- Subcategorías Impresoras
INSERT INTO subcategorias_servicio (categoria_servicio_id, nombre) VALUES
(5, 'Instalación de impresora'),
(5, 'Atasco de papel'),
(5, 'Calidad de impresión'),
(5, 'Sin tóner / cartucho'),
(5, 'No imprime'),
(5, 'Configuración'),
(5, 'Otro');

-- Subcategorías Telefonía
INSERT INTO subcategorias_servicio (categoria_servicio_id, nombre) VALUES
(6, 'Sin línea'),
(6, 'Configuración de extensión'),
(6, 'Teléfono dañado'),
(6, 'Buzón de voz'),
(6, 'Otro');

-- Subcategorías Accesos / Permisos
INSERT INTO subcategorias_servicio (categoria_servicio_id, nombre) VALUES
(7, 'Alta de acceso'),
(7, 'Baja de acceso'),
(7, 'Modificación de permisos'),
(7, 'Desbloqueo de usuario'),
(7, 'Otro');

-- Subcategorías Videoconferencia
INSERT INTO subcategorias_servicio (categoria_servicio_id, nombre) VALUES
(8, 'Zoom'),
(8, 'Teams'),
(8, 'Google Meet'),
(8, 'Equipo de sala'),
(8, 'Otro');

-- Subcategorías Otro
INSERT INTO subcategorias_servicio (categoria_servicio_id, nombre) VALUES
(9, 'Otro servicio');

-- Dependencias de ejemplo
INSERT INTO dependencias (nombre, descripcion) VALUES
('Rectoría',                 'Oficina de rectoría'),
('Secretaría Académica',     'Área académica'),
('Recursos Humanos',         'Gestión de personal'),
('Finanzas y Presupuesto',   'Área financiera'),
('Servicios Escolares',      'Atención a estudiantes'),
('Dirección de TI',          'Tecnologías de información'),
('Biblioteca',               'Servicios bibliotecarios'),
('Centro de Cómputo',        'Laboratorios de cómputo');

-- Edificios de ejemplo
INSERT INTO edificios (nombre, direccion) VALUES
('Edificio A - Administración', 'Av. Principal 100'),
('Edificio B - Académico',      'Av. Principal 102'),
('Edificio C - Laboratorios',   'Calle Ciencias 50');

-- Pisos
INSERT INTO pisos (edificio_id, nombre, numero) VALUES
(1, 'Planta Baja', 'PB'),
(1, 'Primer Piso',  '1'),
(1, 'Segundo Piso', '2'),
(2, 'Planta Baja', 'PB'),
(2, 'Primer Piso',  '1'),
(3, 'Planta Baja', 'PB'),
(3, 'Primer Piso',  '1');

-- Parámetros del sistema
INSERT INTO parametros_sistema (clave, valor, descripcion) VALUES
('max_imagen_mb',                  '10',   'Tamaño máximo por imagen en MB'),
('tiempo_reapertura_horas',        '72',   'Horas disponibles para reabrir un ticket resuelto'),
('cierre_automatico_dias',         '7',    'Días para cerrar automáticamente tickets resueltos'),
('dominio_permitido',              '',     'Dominio de correo permitido (vacío = todos)'),
('sla_respuesta_horas_baja',       '48',   'SLA respuesta prioridad baja (horas)'),
('sla_respuesta_horas_media',      '24',   'SLA respuesta prioridad media (horas)'),
('sla_respuesta_horas_alta',       '8',    'SLA respuesta prioridad alta (horas)'),
('sla_respuesta_horas_critica',    '2',    'SLA respuesta prioridad crítica (horas)'),
('sla_resolucion_horas_baja',      '120',  'SLA resolución prioridad baja (horas)'),
('sla_resolucion_horas_media',     '72',   'SLA resolución prioridad media (horas)'),
('sla_resolucion_horas_alta',      '24',   'SLA resolución prioridad alta (horas)'),
('sla_resolucion_horas_critica',   '8',    'SLA resolución prioridad crítica (horas)'),
('max_evidencias_ticket',          '5',    'Máximo de evidencias por ticket');

-- Usuario administrador por defecto (password: Admin123!)
-- Contraseña debe cambiarse al primer acceso
INSERT INTO usuarios (nombre, apellido_paterno, correo, password_hash, rol_id, activo, correo_verificado)
VALUES ('Admin', 'Sistema', 'admin@soporte.local',
        '$2a$10$YlrSIp3mKVBLIVCkVlRE.OZRq7P3YyHgB2k7mSSp5nY5hH6jN7fBi',
        (SELECT id FROM roles WHERE nombre = 'ADMINISTRADOR'),
        TRUE, TRUE);

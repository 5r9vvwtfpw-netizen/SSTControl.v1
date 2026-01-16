-- Script para crear 20 trabajadores de prueba
-- Empresa: Empresa Demo SST

DO $$
DECLARE
  company_id_var VARCHAR;
  year_var TEXT;
  company_code TEXT;
BEGIN
  -- Obtener el ID de "Empresa Demo SST"
  SELECT id INTO company_id_var FROM companies WHERE name = 'Empresa Demo SST' LIMIT 1;
  
  IF company_id_var IS NULL THEN
    RAISE EXCEPTION 'No se encontró la empresa "Empresa Demo SST"';
  END IF;
  
  -- Año actual y código de empresa
  year_var := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  company_code := UPPER(SUBSTRING(company_id_var, 1, 6));
  
  -- Limpiar trabajadores existentes de prueba (opcional)
  -- DELETE FROM workers WHERE company_id = company_id_var;
  
  -- Insertar 20 trabajadores de prueba
  INSERT INTO workers (id, company_id, identification_number, name, email, position, department, contract_type, contract_number, start_date, status)
  VALUES 
    -- DEPARTAMENTO: PRODUCCIÓN (5 trabajadores)
    (gen_random_uuid(), company_id_var, '1010234567', 'Carlos Andrés Rodríguez', 'carlos.rodriguez@demo.com', 'Operario de Producción', 'Producción', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-0001', '2024-01-15', 'activo'),
    (gen_random_uuid(), company_id_var, '1020345678', 'María Fernanda López', 'maria.lopez@demo.com', 'Supervisor de Línea', 'Producción', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-0002', '2024-02-01', 'activo'),
    (gen_random_uuid(), company_id_var, '1030456789', 'Juan Pablo Martínez', 'juan.martinez@demo.com', 'Operario de Maquinaria', 'Producción', 'fijo', 'CONT-' || company_code || '-' || year_var || '-0003', '2024-03-10', 'activo'),
    (gen_random_uuid(), company_id_var, '1040567890', 'Ana María Gómez', 'ana.gomez@demo.com', 'Control de Calidad', 'Producción', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-0004', '2024-01-20', 'activo'),
    (gen_random_uuid(), company_id_var, '1050678901', 'Luis Fernando Castro', 'luis.castro@demo.com', 'Jefe de Producción', 'Producción', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-0005', '2023-06-15', 'activo'),
    
    -- DEPARTAMENTO: MANTENIMIENTO (3 trabajadores)
    (gen_random_uuid(), company_id_var, '1060789012', 'Pedro Antonio Ruiz', 'pedro.ruiz@demo.com', 'Técnico de Mantenimiento', 'Mantenimiento', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-0006', '2024-04-01', 'activo'),
    (gen_random_uuid(), company_id_var, '1070890123', 'Sandra Milena Vargas', 'sandra.vargas@demo.com', 'Electricista', 'Mantenimiento', 'fijo', 'CONT-' || company_code || '-' || year_var || '-0007', '2024-05-15', 'activo'),
    (gen_random_uuid(), company_id_var, '1080901234', 'Jorge Alberto Morales', 'jorge.morales@demo.com', 'Jefe de Mantenimiento', 'Mantenimiento', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-0008', '2023-08-20', 'activo'),
    
    -- DEPARTAMENTO: ADMINISTRACIÓN (4 trabajadores)
    (gen_random_uuid(), company_id_var, '1091012345', 'Diana Carolina Pérez', 'diana.perez@demo.com', 'Asistente Administrativa', 'Administración', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-0009', '2024-02-15', 'activo'),
    (gen_random_uuid(), company_id_var, '1101123456', 'Roberto Carlos Suárez', 'roberto.suarez@demo.com', 'Contador', 'Administración', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-0010', '2023-11-01', 'activo'),
    (gen_random_uuid(), company_id_var, '1111234567', 'Laura Sofía Ramírez', 'laura.ramirez@demo.com', 'Gerente Administrativa', 'Administración', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-0011', '2023-05-10', 'activo'),
    (gen_random_uuid(), company_id_var, '1121345678', 'Andrés Felipe Torres', 'andres.torres@demo.com', 'Auxiliar Contable', 'Administración', 'temporal', 'CONT-' || company_code || '-' || year_var || '-0012', '2024-06-01', 'activo'),
    
    -- DEPARTAMENTO: RECURSOS HUMANOS (3 trabajadores)
    (gen_random_uuid(), company_id_var, '1131456789', 'Claudia Patricia Herrera', 'claudia.herrera@demo.com', 'Jefe de RRHH', 'Recursos Humanos', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-0013', '2023-07-15', 'activo'),
    (gen_random_uuid(), company_id_var, '1141567890', 'Camilo Andrés Sánchez', 'camilo.sanchez@demo.com', 'Coordinador SST', 'Recursos Humanos', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-0014', '2023-09-01', 'activo'),
    (gen_random_uuid(), company_id_var, '1151678901', 'Patricia Elena Gutiérrez', 'patricia.gutierrez@demo.com', 'Asistente de Nómina', 'Recursos Humanos', 'fijo', 'CONT-' || company_code || '-' || year_var || '-0015', '2024-03-15', 'activo'),
    
    -- DEPARTAMENTO: LOGÍSTICA (3 trabajadores)
    (gen_random_uuid(), company_id_var, '1161789012', 'Miguel Ángel Jiménez', 'miguel.jimenez@demo.com', 'Conductor', 'Logística', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-0016', '2024-04-20', 'activo'),
    (gen_random_uuid(), company_id_var, '1171890123', 'Carolina Andrea Mejía', 'carolina.mejia@demo.com', 'Coordinadora de Bodega', 'Logística', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-0017', '2023-10-15', 'activo'),
    (gen_random_uuid(), company_id_var, '1181901234', 'Fabián Leonardo Ortiz', 'fabian.ortiz@demo.com', 'Auxiliar de Bodega', 'Logística', 'temporal', 'CONT-' || company_code || '-' || year_var || '-0018', '2024-07-01', 'activo'),
    
    -- DEPARTAMENTO: VENTAS (2 trabajadores)
    (gen_random_uuid(), company_id_var, '1192012345', 'Natalia Marcela Ríos', 'natalia.rios@demo.com', 'Asesora Comercial', 'Ventas', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-0019', '2024-02-20', 'activo'),
    (gen_random_uuid(), company_id_var, '1202123456', 'Diego Alejandro Parra', 'diego.parra@demo.com', 'Gerente de Ventas', 'Ventas', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-0020', '2023-04-10', 'activo');

  RAISE NOTICE '✅ Se insertaron 20 trabajadores de prueba exitosamente';
  RAISE NOTICE 'Empresa ID: %', company_id_var;
  
  -- Actualizar el número de trabajadores en la empresa
  UPDATE companies SET number_of_workers = 20 WHERE id = company_id_var;
  RAISE NOTICE '✅ Actualizado número de trabajadores en la empresa a 20';
  
EXCEPTION
  WHEN unique_violation THEN
    RAISE NOTICE '⚠️ Algunos trabajadores ya existen (números de contrato duplicados). Ejecute primero: DELETE FROM workers WHERE company_id = (SELECT id FROM companies WHERE name = ''Empresa Demo SST'');';
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error al insertar trabajadores: %', SQLERRM;
END $$;

-- Verificar trabajadores insertados
SELECT 
  department,
  COUNT(*) as cantidad,
  STRING_AGG(name, ', ' ORDER BY name) as trabajadores
FROM workers 
WHERE company_id = (SELECT id FROM companies WHERE name = 'Empresa Demo SST')
GROUP BY department
ORDER BY department;

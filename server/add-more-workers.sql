-- Script para AGREGAR 20 trabajadores adicionales de prueba
-- NO elimina los existentes, solo agrega más

DO $$
DECLARE
  company_id_var VARCHAR;
  year_var TEXT;
  company_code TEXT;
  max_contract_num INTEGER := 0;
  current_workers INTEGER := 0;
BEGIN
  -- Obtener el ID de "Empresa Demo SST"
  SELECT id INTO company_id_var FROM companies WHERE name = 'Empresa Demo SST' LIMIT 1;
  
  IF company_id_var IS NULL THEN
    RAISE EXCEPTION 'No se encontró la empresa "Empresa Demo SST"';
  END IF;
  
  -- Contar trabajadores actuales
  SELECT COUNT(*) INTO current_workers FROM workers WHERE company_id = company_id_var;
  RAISE NOTICE 'Trabajadores actuales: %', current_workers;
  
  -- Año actual y código de empresa
  year_var := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  company_code := UPPER(SUBSTRING(company_id_var, 1, 6));
  
  -- Obtener el número máximo de contrato existente
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(contract_number FROM 'CONT-[A-Z0-9]+-\d+-(\d+)') AS INTEGER)
  ), 0) INTO max_contract_num
  FROM workers 
  WHERE company_id = company_id_var 
    AND contract_number LIKE 'CONT-' || company_code || '-' || year_var || '-%';
  
  RAISE NOTICE 'Último número de contrato: %', max_contract_num;
  
  -- Insertar 20 trabajadores ADICIONALES (empezando desde max_contract_num + 1)
  INSERT INTO workers (id, company_id, identification_number, name, email, position, department, contract_type, contract_number, start_date, status)
  VALUES 
    -- DEPARTAMENTO: PRODUCCIÓN (5 trabajadores)
    (gen_random_uuid(), company_id_var, '2010234567', 'Carlos Andrés Rodríguez López', 'carlos.rodriguez2@demo.com', 'Operario de Producción', 'Producción', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-' || LPAD((max_contract_num + 1)::TEXT, 4, '0'), '2024-01-15', 'activo'),
    (gen_random_uuid(), company_id_var, '2020345678', 'María Fernanda López García', 'maria.lopez2@demo.com', 'Supervisor de Línea', 'Producción', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-' || LPAD((max_contract_num + 2)::TEXT, 4, '0'), '2024-02-01', 'activo'),
    (gen_random_uuid(), company_id_var, '2030456789', 'Juan Pablo Martínez Silva', 'juan.martinez2@demo.com', 'Operario de Maquinaria', 'Producción', 'fijo', 'CONT-' || company_code || '-' || year_var || '-' || LPAD((max_contract_num + 3)::TEXT, 4, '0'), '2024-03-10', 'activo'),
    (gen_random_uuid(), company_id_var, '2040567890', 'Ana María Gómez Torres', 'ana.gomez2@demo.com', 'Control de Calidad', 'Producción', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-' || LPAD((max_contract_num + 4)::TEXT, 4, '0'), '2024-01-20', 'activo'),
    (gen_random_uuid(), company_id_var, '2050678901', 'Luis Fernando Castro Díaz', 'luis.castro2@demo.com', 'Jefe de Producción', 'Producción', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-' || LPAD((max_contract_num + 5)::TEXT, 4, '0'), '2023-06-15', 'activo'),
    
    -- DEPARTAMENTO: MANTENIMIENTO (3 trabajadores)
    (gen_random_uuid(), company_id_var, '2060789012', 'Pedro Antonio Ruiz Mendoza', 'pedro.ruiz2@demo.com', 'Técnico de Mantenimiento', 'Mantenimiento', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-' || LPAD((max_contract_num + 6)::TEXT, 4, '0'), '2024-04-01', 'activo'),
    (gen_random_uuid(), company_id_var, '2070890123', 'Sandra Milena Vargas Cruz', 'sandra.vargas2@demo.com', 'Electricista', 'Mantenimiento', 'fijo', 'CONT-' || company_code || '-' || year_var || '-' || LPAD((max_contract_num + 7)::TEXT, 4, '0'), '2024-05-15', 'activo'),
    (gen_random_uuid(), company_id_var, '2080901234', 'Jorge Alberto Morales Ramos', 'jorge.morales2@demo.com', 'Jefe de Mantenimiento', 'Mantenimiento', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-' || LPAD((max_contract_num + 8)::TEXT, 4, '0'), '2023-08-20', 'activo'),
    
    -- DEPARTAMENTO: ADMINISTRACIÓN (4 trabajadores)
    (gen_random_uuid(), company_id_var, '2091012345', 'Diana Carolina Pérez Ortiz', 'diana.perez2@demo.com', 'Asistente Administrativa', 'Administración', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-' || LPAD((max_contract_num + 9)::TEXT, 4, '0'), '2024-02-15', 'activo'),
    (gen_random_uuid(), company_id_var, '2101123456', 'Roberto Carlos Suárez Gómez', 'roberto.suarez2@demo.com', 'Contador', 'Administración', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-' || LPAD((max_contract_num + 10)::TEXT, 4, '0'), '2023-11-01', 'activo'),
    (gen_random_uuid(), company_id_var, '2111234567', 'Laura Sofía Ramírez Vega', 'laura.ramirez2@demo.com', 'Gerente Administrativa', 'Administración', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-' || LPAD((max_contract_num + 11)::TEXT, 4, '0'), '2023-05-10', 'activo'),
    (gen_random_uuid(), company_id_var, '2121345678', 'Andrés Felipe Torres Cano', 'andres.torres2@demo.com', 'Auxiliar Contable', 'Administración', 'temporal', 'CONT-' || company_code || '-' || year_var || '-' || LPAD((max_contract_num + 12)::TEXT, 4, '0'), '2024-06-01', 'activo'),
    
    -- DEPARTAMENTO: RECURSOS HUMANOS (3 trabajadores)
    (gen_random_uuid(), company_id_var, '2131456789', 'Claudia Patricia Herrera Ríos', 'claudia.herrera2@demo.com', 'Jefe de RRHH', 'Recursos Humanos', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-' || LPAD((max_contract_num + 13)::TEXT, 4, '0'), '2023-07-15', 'activo'),
    (gen_random_uuid(), company_id_var, '2141567890', 'Camilo Andrés Sánchez Gil', 'camilo.sanchez2@demo.com', 'Analista SST', 'Recursos Humanos', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-' || LPAD((max_contract_num + 14)::TEXT, 4, '0'), '2023-09-01', 'activo'),
    (gen_random_uuid(), company_id_var, '2151678901', 'Patricia Elena Gutiérrez Parra', 'patricia.gutierrez2@demo.com', 'Asistente de Nómina', 'Recursos Humanos', 'fijo', 'CONT-' || company_code || '-' || year_var || '-' || LPAD((max_contract_num + 15)::TEXT, 4, '0'), '2024-03-15', 'activo'),
    
    -- DEPARTAMENTO: LOGÍSTICA (3 trabajadores)
    (gen_random_uuid(), company_id_var, '2161789012', 'Miguel Ángel Jiménez León', 'miguel.jimenez2@demo.com', 'Conductor', 'Logística', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-' || LPAD((max_contract_num + 16)::TEXT, 4, '0'), '2024-04-20', 'activo'),
    (gen_random_uuid(), company_id_var, '2171890123', 'Carolina Andrea Mejía Castro', 'carolina.mejia2@demo.com', 'Coordinadora de Bodega', 'Logística', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-' || LPAD((max_contract_num + 17)::TEXT, 4, '0'), '2023-10-15', 'activo'),
    (gen_random_uuid(), company_id_var, '2181901234', 'Fabián Leonardo Ortiz Rojas', 'fabian.ortiz2@demo.com', 'Auxiliar de Bodega', 'Logística', 'temporal', 'CONT-' || company_code || '-' || year_var || '-' || LPAD((max_contract_num + 18)::TEXT, 4, '0'), '2024-07-01', 'activo'),
    
    -- DEPARTAMENTO: VENTAS (2 trabajadores)
    (gen_random_uuid(), company_id_var, '2192012345', 'Natalia Marcela Ríos Valencia', 'natalia.rios2@demo.com', 'Asesora Comercial', 'Ventas', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-' || LPAD((max_contract_num + 19)::TEXT, 4, '0'), '2024-02-20', 'activo'),
    (gen_random_uuid(), company_id_var, '2202123456', 'Diego Alejandro Parra Mora', 'diego.parra2@demo.com', 'Gerente de Ventas', 'Ventas', 'indefinido', 'CONT-' || company_code || '-' || year_var || '-' || LPAD((max_contract_num + 20)::TEXT, 4, '0'), '2023-04-10', 'activo');

  RAISE NOTICE '✅ Se agregaron 20 trabajadores adicionales exitosamente';
  
  -- Actualizar el contador de trabajadores
  SELECT COUNT(*) INTO current_workers FROM workers WHERE company_id = company_id_var;
  UPDATE companies SET number_of_workers = current_workers WHERE id = company_id_var;
  
  RAISE NOTICE '✅ Total de trabajadores ahora: %', current_workers;
  
END $$;

-- Verificar el resumen por departamento
SELECT 
  department,
  COUNT(*) as cantidad
FROM workers 
WHERE company_id = (SELECT id FROM companies WHERE name = 'Empresa Demo SST')
GROUP BY department
ORDER BY cantidad DESC, department;

-- Total general
SELECT COUNT(*) as total_trabajadores 
FROM workers 
WHERE company_id = (SELECT id FROM companies WHERE name = 'Empresa Demo SST');

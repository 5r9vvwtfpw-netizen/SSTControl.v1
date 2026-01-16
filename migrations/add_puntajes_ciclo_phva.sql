-- Migración para Ticket SST-2025-0011
-- Agregar columna puntajes_por_ciclo_phva a evaluaciones_sst
-- Esta columna almacena los puntajes por ciclo PHVA (Planear, Hacer, Verificar, Actuar)

-- Ejecutar este script en la base de datos de PRODUCCIÓN
ALTER TABLE evaluaciones_sst 
ADD COLUMN IF NOT EXISTS puntajes_por_ciclo_phva TEXT;

-- Verificar que la columna se creó correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'evaluaciones_sst' 
AND column_name = 'puntajes_por_ciclo_phva';

import { sql } from 'drizzle-orm';
import { db } from '../db';

async function tableExists(tableName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = ${tableName}
    ) AS "exists"
  `);
  return (result as any).rows?.[0]?.exists === true;
}

async function enumExists(enumName: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT EXISTS (
      SELECT 1 FROM pg_type WHERE typname = ${enumName}
    ) AS "exists"
  `);
  return (result as any).rows?.[0]?.exists === true;
}

async function createEnumIfNotExists(name: string, values: string[]): Promise<void> {
  const exists = await enumExists(name);
  if (!exists) {
    const valuesStr = values.map(v => `'${v}'`).join(', ');
    await db.execute(sql.raw(`CREATE TYPE "${name}" AS ENUM (${valuesStr})`));
    console.log(`[PESV Migration] Created enum: ${name}`);
  }
}

async function createTableIfNotExists(tableName: string, createSql: ReturnType<typeof sql>): Promise<boolean> {
  const exists = await tableExists(tableName);
  if (exists) {
    return false;
  }
  await db.execute(createSql);
  console.log(`[PESV Migration] Created table: ${tableName}`);
  return true;
}

export async function createPesvTables(): Promise<void> {
  console.log('[PESV Migration] Checking PESV tables in database...');
  let tablesCreated = 0;

  try {
    await createEnumIfNotExists('probabilidad_riesgo', ['muy_baja', 'baja', 'media', 'alta', 'muy_alta']);
    await createEnumIfNotExists('impacto_riesgo', ['insignificante', 'menor', 'moderado', 'mayor', 'catastrofico']);
    await createEnumIfNotExists('nivel_riesgo_iso31000', ['bajo', 'medio', 'alto', 'muy_alto', 'critico']);
    await createEnumIfNotExists('categoria_riesgo_vial', ['conductor', 'vehiculo', 'via', 'entorno', 'organizacional']);
    await createEnumIfNotExists('estado_tratamiento_riesgo', ['identificado', 'en_evaluacion', 'en_tratamiento', 'controlado', 'cerrado']);
    await createEnumIfNotExists('tipo_tratamiento_riesgo', ['evitar', 'reducir', 'compartir', 'aceptar']);
    await createEnumIfNotExists('categoria_spf', ['exposicion_riesgo', 'resultado_final', 'resultado_intermedio', 'intervencion']);
    await createEnumIfNotExists('estado_objetivo_sv', ['definido', 'en_progreso', 'cumplido', 'no_cumplido', 'cancelado']);
    await createEnumIfNotExists('frecuencia_medicion', ['diaria', 'semanal', 'quincenal', 'mensual', 'trimestral', 'semestral', 'anual']);
    await createEnumIfNotExists('rol_comite_sv', ['presidente', 'secretario', 'representante_direccion', 'representante_trabajadores', 'lider_pesv', 'coordinador_sst', 'otro']);
    await createEnumIfNotExists('estado_integrante_comite', ['activo', 'inactivo']);
    await createEnumIfNotExists('estado_acta_comite', ['borrador', 'aprobada', 'anulada']);
    await createEnumIfNotExists('modalidad_reunion', ['presencial', 'virtual', 'mixta']);
    await createEnumIfNotExists('estado_sincronizacion_riesgo', ['sincronizado', 'pendiente_sst', 'pendiente_pesv', 'desvinculado']);
    await createEnumIfNotExists('origen_riesgo_vinculado', ['pesv', 'sst', 'manual']);
    await createEnumIfNotExists('maintenance_type', ['preventivo', 'correctivo', 'predictivo']);

    if (await createTableIfNotExists('evaluaciones_pesv', sql`
      CREATE TABLE evaluaciones_pesv (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        company_id VARCHAR NOT NULL REFERENCES companies(id),
        anio INTEGER NOT NULL,
        mes INTEGER NOT NULL DEFAULT 12,
        nivel VARCHAR NOT NULL,
        estado VARCHAR NOT NULL DEFAULT 'en-progreso',
        puntaje_planear NUMERIC,
        puntaje_hacer NUMERIC,
        puntaje_verificar NUMERIC,
        puntaje_actuar NUMERIC,
        puntaje_total NUMERIC,
        puntaje_maximo NUMERIC,
        porcentaje_cumplimiento NUMERIC,
        numero_vehiculos INTEGER,
        numero_conductores INTEGER,
        responsable_nombre VARCHAR,
        responsable_cargo VARCHAR,
        observaciones TEXT,
        evaluacion_sst_id VARCHAR,
        parent_evaluacion_id VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)) tablesCreated++;

    if (await createTableIfNotExists('respuestas_pasos_pesv', sql`
      CREATE TABLE respuestas_pasos_pesv (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        evaluacion_id VARCHAR NOT NULL REFERENCES evaluaciones_pesv(id) ON DELETE CASCADE,
        paso_id VARCHAR NOT NULL,
        cumple INTEGER,
        no_aplica INTEGER DEFAULT 0,
        justificacion_na TEXT,
        modo_verificacion TEXT,
        evidencias TEXT,
        observaciones TEXT,
        hallazgo TEXT,
        accidente_sst_id VARCHAR,
        capacitacion_sst_id VARCHAR,
        inspeccion_sst_id VARCHAR,
        accion_mejora_sst_id VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)) tablesCreated++;

    if (await createTableIfNotExists('acciones_mejora_pesv', sql`
      CREATE TABLE acciones_mejora_pesv (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        evaluacion_id VARCHAR NOT NULL REFERENCES evaluaciones_pesv(id) ON DELETE CASCADE,
        respuesta_paso_id VARCHAR,
        paso_id VARCHAR,
        descripcion TEXT NOT NULL,
        responsable VARCHAR,
        fecha_limite DATE,
        estado VARCHAR DEFAULT 'pendiente',
        observaciones TEXT,
        company_id VARCHAR REFERENCES companies(id),
        tipo_accion VARCHAR DEFAULT 'correctiva',
        prioridad VARCHAR DEFAULT 'media',
        fuente_hallazgo VARCHAR,
        fuente_id VARCHAR,
        evidencia_cierre TEXT,
        fecha_cierre DATE,
        verificado_por VARCHAR,
        eficacia_verificada INTEGER DEFAULT 0,
        vinculacion_sst_id VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)) tablesCreated++;

    if (await createTableIfNotExists('revisiones_direccion_pesv', sql`
      CREATE TABLE revisiones_direccion_pesv (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        company_id VARCHAR NOT NULL REFERENCES companies(id),
        evaluacion_pesv_id VARCHAR REFERENCES evaluaciones_pesv(id),
        codigo VARCHAR NOT NULL,
        fecha_revision DATE NOT NULL,
        presidida_por TEXT NOT NULL,
        participantes TEXT,
        revision_indicadores INTEGER NOT NULL DEFAULT 0,
        revision_auditorias INTEGER NOT NULL DEFAULT 0,
        revision_siniestros INTEGER NOT NULL DEFAULT 0,
        revision_acciones_mejora INTEGER NOT NULL DEFAULT 0,
        revision_cumplimiento_legal INTEGER NOT NULL DEFAULT 0,
        revision_recursos INTEGER NOT NULL DEFAULT 0,
        revision_capacitaciones INTEGER NOT NULL DEFAULT 0,
        revision_inspecciones INTEGER NOT NULL DEFAULT 0,
        resumen_indicadores TEXT,
        resumen_auditorias TEXT,
        resumen_siniestros TEXT,
        resumen_acciones_mejora TEXT,
        analisis_general TEXT,
        decisiones TEXT,
        compromisos TEXT,
        vinculacion_revision_sst_id VARCHAR,
        estado VARCHAR NOT NULL DEFAULT 'borrador',
        fecha_proxima_revision DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)) tablesCreated++;

    if (await createTableIfNotExists('contexto_organizacional_pesv', sql`
      CREATE TABLE contexto_organizacional_pesv (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        company_id VARCHAR NOT NULL REFERENCES companies(id),
        evaluacion_pesv_id VARCHAR REFERENCES evaluaciones_pesv(id),
        tipo_factor VARCHAR NOT NULL,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        categoria VARCHAR,
        impacto_seguridad TEXT,
        nivel_impacto VARCHAR,
        fecha_identificacion DATE,
        fecha_revision DATE,
        activo INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)) tablesCreated++;

    if (await createTableIfNotExists('riesgos_viales', sql`
      CREATE TABLE riesgos_viales (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        company_id VARCHAR NOT NULL REFERENCES companies(id),
        evaluacion_pesv_id VARCHAR REFERENCES evaluaciones_pesv(id),
        codigo VARCHAR NOT NULL,
        nombre TEXT NOT NULL,
        descripcion TEXT NOT NULL,
        categoria categoria_riesgo_vial NOT NULL,
        fuente_riesgo TEXT,
        causas_raiz TEXT,
        consecuencias TEXT,
        probabilidad probabilidad_riesgo NOT NULL,
        impacto impacto_riesgo NOT NULL,
        valor_riesgo INTEGER,
        nivel_riesgo nivel_riesgo_iso31000,
        probabilidad_residual probabilidad_riesgo,
        impacto_residual impacto_riesgo,
        valor_riesgo_residual INTEGER,
        nivel_riesgo_residual nivel_riesgo_iso31000,
        controles_existentes TEXT,
        eficacia_controles VARCHAR,
        estado estado_tratamiento_riesgo NOT NULL DEFAULT 'identificado',
        responsable_id VARCHAR,
        fecha_identificacion DATE,
        fecha_ultima_evaluacion DATE,
        fecha_proxima_revision DATE,
        paso_pesv_relacionado VARCHAR,
        accidente_relacionado_id VARCHAR,
        inspeccion_relacionada_id VARCHAR,
        observaciones TEXT,
        activo INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)) tablesCreated++;

    if (await createTableIfNotExists('tratamientos_riesgo_vial', sql`
      CREATE TABLE tratamientos_riesgo_vial (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        company_id VARCHAR NOT NULL REFERENCES companies(id),
        riesgo_vial_id VARCHAR NOT NULL REFERENCES riesgos_viales(id) ON DELETE CASCADE,
        tipo_tratamiento tipo_tratamiento_riesgo NOT NULL,
        descripcion TEXT NOT NULL,
        justificacion TEXT,
        acciones_requeridas TEXT,
        recursos_necesarios TEXT,
        presupuesto_estimado NUMERIC,
        responsable_id VARCHAR,
        fecha_inicio DATE,
        fecha_limite DATE,
        fecha_implementacion DATE,
        estado VARCHAR NOT NULL DEFAULT 'pendiente',
        porcentaje_avance INTEGER DEFAULT 0,
        resultados_obtenidos TEXT,
        reduccion_probabilidad INTEGER,
        reduccion_impacto INTEGER,
        eficacia VARCHAR,
        accion_mejora_pesv_id VARCHAR,
        observaciones TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)) tablesCreated++;

    if (await createTableIfNotExists('factores_desempeno_sv', sql`
      CREATE TABLE factores_desempeno_sv (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        company_id VARCHAR NOT NULL REFERENCES companies(id),
        evaluacion_pesv_id VARCHAR REFERENCES evaluaciones_pesv(id),
        codigo VARCHAR NOT NULL,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        categoria categoria_spf NOT NULL,
        elemento_relacionado TEXT,
        valor_base NUMERIC,
        valor_actual NUMERIC,
        meta_anual NUMERIC,
        unidad_medida VARCHAR,
        tendencia VARCHAR,
        observaciones TEXT,
        activo INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)) tablesCreated++;

    if (await createTableIfNotExists('indicadores_sv', sql`
      CREATE TABLE indicadores_sv (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        company_id VARCHAR NOT NULL REFERENCES companies(id),
        evaluacion_pesv_id VARCHAR REFERENCES evaluaciones_pesv(id),
        factor_desempeno_id VARCHAR REFERENCES factores_desempeno_sv(id),
        codigo VARCHAR NOT NULL,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        formula TEXT,
        unidad_medida VARCHAR NOT NULL,
        frecuencia_medicion frecuencia_medicion NOT NULL DEFAULT 'mensual',
        fuente_datos TEXT,
        valor_meta NUMERIC,
        valor_minimo NUMERIC,
        valor_maximo NUMERIC,
        valor_actual NUMERIC,
        fecha_ultima_medicion DATE,
        responsable_id VARCHAR,
        activo INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)) tablesCreated++;

    if (await createTableIfNotExists('mediciones_indicador_sv', sql`
      CREATE TABLE mediciones_indicador_sv (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        company_id VARCHAR NOT NULL REFERENCES companies(id),
        indicador_id VARCHAR NOT NULL REFERENCES indicadores_sv(id) ON DELETE CASCADE,
        fecha_medicion DATE NOT NULL,
        valor NUMERIC NOT NULL,
        observaciones TEXT,
        cumple_meta INTEGER,
        desviacion NUMERIC,
        registrado_por VARCHAR,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)) tablesCreated++;

    if (await createTableIfNotExists('objetivos_sv', sql`
      CREATE TABLE objetivos_sv (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        company_id VARCHAR NOT NULL REFERENCES companies(id),
        evaluacion_pesv_id VARCHAR REFERENCES evaluaciones_pesv(id),
        codigo VARCHAR NOT NULL,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        anio INTEGER NOT NULL,
        fecha_inicio DATE,
        fecha_fin DATE,
        indicador_asociado VARCHAR,
        meta_cuantitativa TEXT,
        valor_meta NUMERIC,
        valor_actual NUMERIC,
        porcentaje_avance NUMERIC,
        recursos_asignados TEXT,
        responsable_id VARCHAR,
        alineado_politica INTEGER NOT NULL DEFAULT 1,
        estado estado_objetivo_sv NOT NULL DEFAULT 'definido',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)) tablesCreated++;

    if (await createTableIfNotExists('auditorias_pesv', sql`
      CREATE TABLE auditorias_pesv (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        company_id VARCHAR NOT NULL REFERENCES companies(id),
        evaluacion_pesv_id VARCHAR REFERENCES evaluaciones_pesv(id),
        codigo VARCHAR NOT NULL,
        titulo TEXT NOT NULL,
        tipo VARCHAR NOT NULL DEFAULT 'interna',
        fecha_programada DATE NOT NULL,
        fecha_ejecucion DATE,
        alcance TEXT,
        criterios TEXT,
        auditor_lider_id VARCHAR,
        equipo_auditor TEXT,
        hallazgos_conformidades INTEGER DEFAULT 0,
        hallazgos_nc_menores INTEGER DEFAULT 0,
        hallazgos_nc_mayores INTEGER DEFAULT 0,
        hallazgos_observaciones INTEGER DEFAULT 0,
        hallazgos_om INTEGER DEFAULT 0,
        conclusiones TEXT,
        recomendaciones TEXT,
        estado VARCHAR NOT NULL DEFAULT 'programada',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)) tablesCreated++;

    if (await createTableIfNotExists('hallazgos_auditoria_pesv', sql`
      CREATE TABLE hallazgos_auditoria_pesv (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        company_id VARCHAR NOT NULL REFERENCES companies(id),
        auditoria_id VARCHAR NOT NULL REFERENCES auditorias_pesv(id) ON DELETE CASCADE,
        codigo VARCHAR NOT NULL,
        tipo VARCHAR NOT NULL,
        clausula_referencia VARCHAR,
        descripcion TEXT NOT NULL,
        evidencia TEXT,
        requiere_accion INTEGER NOT NULL DEFAULT 0,
        accion_propuesta TEXT,
        responsable_accion_id VARCHAR,
        fecha_limite DATE,
        fecha_cierre DATE,
        estado VARCHAR NOT NULL DEFAULT 'abierto',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)) tablesCreated++;

    if (await createTableIfNotExists('comite_integrantes_pesv', sql`
      CREATE TABLE comite_integrantes_pesv (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        company_id VARCHAR NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        worker_id VARCHAR,
        nombre TEXT NOT NULL,
        cargo TEXT NOT NULL,
        rol rol_comite_sv NOT NULL,
        email TEXT,
        telefono TEXT,
        fecha_ingreso DATE NOT NULL,
        estado estado_integrante_comite NOT NULL DEFAULT 'activo',
        observaciones TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)) tablesCreated++;

    if (await createTableIfNotExists('actas_comite_pesv', sql`
      CREATE TABLE actas_comite_pesv (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        company_id VARCHAR NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        numero_acta INTEGER NOT NULL,
        fecha_reunion DATE NOT NULL,
        hora_inicio TEXT,
        hora_fin TEXT,
        lugar TEXT,
        modalidad modalidad_reunion NOT NULL DEFAULT 'presencial',
        temas_orden_dia TEXT NOT NULL,
        desarrollo_reunion TEXT,
        compromisos TEXT,
        asistentes_ids TEXT[] DEFAULT '{}',
        invitados TEXT,
        proxima_reunion DATE,
        estado estado_acta_comite NOT NULL DEFAULT 'borrador',
        observaciones TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)) tablesCreated++;

    if (await createTableIfNotExists('riesgos_sst_pesv_vinculacion', sql`
      CREATE TABLE riesgos_sst_pesv_vinculacion (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        company_id VARCHAR NOT NULL REFERENCES companies(id),
        riesgo_vial_id VARCHAR,
        peligro_iperc_id VARCHAR,
        origen origen_riesgo_vinculado NOT NULL,
        estado_sincronizacion estado_sincronizacion_riesgo NOT NULL DEFAULT 'sincronizado',
        nivel_riesgo_pesv TEXT,
        nivel_riesgo_sst TEXT,
        fundamento_normativo TEXT DEFAULT 'Decreto 1072/2015 Art. 2.2.4.6.15 y Resolución 40595/2022',
        justificacion_vinculacion TEXT,
        vinculado_por VARCHAR,
        fecha_vinculacion TIMESTAMP NOT NULL DEFAULT NOW(),
        fecha_ultima_sync TIMESTAMP DEFAULT NOW(),
        activo INTEGER NOT NULL DEFAULT 1,
        observaciones TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `)) tablesCreated++;

    if (await createTableIfNotExists('vehicle_maintenances', sql`
      CREATE TABLE vehicle_maintenances (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
        company_id VARCHAR NOT NULL REFERENCES companies(id),
        vehicle_id VARCHAR NOT NULL REFERENCES vehicles(id),
        maintenance_type maintenance_type NOT NULL,
        description TEXT NOT NULL,
        maintenance_date DATE NOT NULL,
        mileage_at_maintenance INTEGER,
        next_maintenance_date DATE,
        next_maintenance_mileage INTEGER,
        cost NUMERIC,
        provider VARCHAR,
        invoice_number VARCHAR,
        notes TEXT,
        status VARCHAR NOT NULL DEFAULT 'completado',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)) tablesCreated++;

    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_evaluaciones_pesv_company ON evaluaciones_pesv(company_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_respuestas_pasos_evaluacion ON respuestas_pasos_pesv(evaluacion_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_acciones_mejora_pesv_evaluacion ON acciones_mejora_pesv(evaluacion_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_comite_integrantes_pesv_company ON comite_integrantes_pesv(company_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_actas_comite_pesv_company ON actas_comite_pesv(company_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_riesgos_viales_company ON riesgos_viales(company_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_auditorias_pesv_company ON auditorias_pesv(company_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_indicadores_sv_company ON indicadores_sv(company_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_objetivos_sv_company ON objetivos_sv(company_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_vehicle_maintenances_company ON vehicle_maintenances(company_id)`);

    if (tablesCreated > 0) {
      console.log(`[PESV Migration] ${tablesCreated} PESV tables created successfully`);
    } else {
      console.log('[PESV Migration] All PESV tables already exist');
    }

  } catch (error: any) {
    console.error('[PESV Migration] Error creating PESV tables:', error.message);
    console.error('[PESV Migration] Stack:', error.stack);
  }
}

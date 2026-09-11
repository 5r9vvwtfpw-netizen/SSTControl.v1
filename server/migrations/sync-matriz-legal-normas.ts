import { db } from '../db';
import { sql } from 'drizzle-orm';

/**
 * Agrega nuevas normas a la matriz legal de todas las empresas que ya
 * tienen la matriz inicializada pero no tienen estas entradas:
 *   - Resolución 2346/2007 Art. 4-5 (Profesiograma)
 *   - Decreto 1072/2015 Art. 2.2.4.6.8 (Organigrama SST)
 *   - Resolución 2646/2008 Art. 8 (Perfil Sociodemográfico)
 *   - Resolución 3461/2025 (Comité de Convivencia Laboral)
 */
export async function syncMatrizLegalNormas() {
  console.log('[Migration] Sincronizando nuevas normas en matriz_legal...');

  try {
    const result = await db.execute(sql`
      SELECT DISTINCT company_id FROM matriz_legal
    `);

    const companyIds: string[] = (result.rows as { company_id: string }[]).map(r => r.company_id);

    if (companyIds.length === 0) {
      console.log('[Migration] No hay empresas con matriz legal. Saltando.');
      return;
    }

    const nuevasNormas = [
      {
        norma: 'Resolución 2346 de 2007 – Art. 4 y 5',
        fechaEmision: '2007-07-11',
        entidadEmisora: 'Ministerio de la Protección Social',
        categoria: 'medicina-trabajo',
        titulo: 'Profesiograma – Perfil de Exámenes Médicos por Cargo',
        descripcion: 'El profesiograma define para cada cargo los exámenes médicos ocupacionales requeridos según la exposición a factores de riesgo (Art. 4 y 5 Res. 2346/2007). Debe elaborarse con el médico especialista en SST.',
        obligaciones: 'Elaborar y mantener actualizado el profesiograma, definiendo para cada cargo los exámenes médicos de ingreso, periódicos y retiro según los factores de riesgo del puesto.',
        articulosAplicables: 'Art. 4, Art. 5, Art. 7',
        alcance: 'Todos los empleadores',
        periodicidad: 'Actualización anual o ante cambios en el cargo',
        responsableCumplimiento: 'Coordinador SST / Médico Especialista en SST',
        validacionAutomatica: 1,
        codigoValidacion: 'PROFESIOGRAMA'
      },
      {
        norma: 'Decreto 1072 de 2015 – Art. 2.2.4.6.8',
        fechaEmision: '2015-05-26',
        entidadEmisora: 'Ministerio del Trabajo',
        categoria: 'sistema-gestion',
        titulo: 'Organigrama del SG-SST – Roles y Responsabilidades',
        descripcion: 'El empleador debe definir y comunicar la estructura organizativa del SG-SST con roles, responsabilidades y autoridades en materia de SST a todos los niveles de la organización.',
        obligaciones: 'Documentar y divulgar el organigrama del SG-SST con los roles de: Representante Legal, Responsable SST, COPASST o Vigía, Brigadas de Emergencia y demás responsables preventivos.',
        articulosAplicables: 'Art. 2.2.4.6.8, Art. 2.2.4.6.9',
        alcance: 'Todos los empleadores',
        periodicidad: 'Actualización ante cambios organizacionales',
        responsableCumplimiento: 'Alta Dirección / Coordinador SST',
        validacionAutomatica: 1,
        codigoValidacion: 'ORGANIGRAMA_SST'
      },
      {
        norma: 'Resolución 2646 de 2008 – Art. 8',
        fechaEmision: '2008-07-17',
        entidadEmisora: 'Ministerio de la Protección Social',
        categoria: 'riesgo-psicosocial',
        titulo: 'Perfil Sociodemográfico de los Trabajadores',
        descripcion: 'El empleador debe actualizar anualmente el perfil sociodemográfico de la población trabajadora como insumo para medicina del trabajo y gestión de riesgo psicosocial.',
        obligaciones: 'Consolidar anualmente el perfil sociodemográfico y usarlo para programas de vigilancia epidemiológica y gestión de riesgo psicosocial.',
        articulosAplicables: 'Art. 8',
        alcance: 'Todos los empleadores',
        periodicidad: 'Actualización anual',
        responsableCumplimiento: 'Coordinador SST / RRHH',
        validacionAutomatica: 1,
        codigoValidacion: 'PERFIL_SOCIODEMOGRAFICO'
      },
      {
        norma: 'Resolución 3461 de 2025',
        fechaEmision: '2025-09-01',
        entidadEmisora: 'Ministerio del Trabajo',
        categoria: 'comites-sst',
        titulo: 'Conformación y funcionamiento del Comité de Convivencia Laboral',
        descripcion: 'Reglamenta la conformación y el funcionamiento preventivo del Comité de Convivencia Laboral por centro de trabajo; deroga las Resoluciones 652 y 1356 de 2012.',
        obligaciones: 'Conformar y garantizar el funcionamiento del Comité por centro de trabajo según el número de trabajadores; realizar reuniones ordinarias mensuales y extraordinarias por cada queja; proteger la confidencialidad; tramitar el procedimiento preventivo en máximo 65 días calendario; elaborar informes trimestrales y anual; y remitir el acoso sexual o la violencia por razones de género a una ruta separada.',
        articulosAplicables: 'Resolución 3461 de 2025',
        alcance: 'Empleadores y empresas públicas o privadas, según su número de trabajadores y centros de trabajo',
        periodicidad: 'Reuniones ordinarias mensuales y extraordinarias por queja',
        responsableCumplimiento: 'RRHH / Coordinador SST',
        validacionAutomatica: 0,
        codigoValidacion: 'CCL_3461_2025'
      }
    ];

    let totalAdded = 0;

    for (const companyId of companyIds) {
      const existingResult = await db.execute(sql`
        SELECT norma FROM matriz_legal WHERE company_id = ${companyId}
      `);
      const existingSet = new Set((existingResult.rows as { norma: string }[]).map(r => r.norma));

      for (const n of nuevasNormas) {
        if (existingSet.has(n.norma)) continue;

        await db.execute(sql`
          INSERT INTO matriz_legal (
            id, company_id, norma, fecha_emision, entidad_emisora,
            categoria, titulo, descripcion, obligaciones, articulos_aplicables,
            alcance, periodicidad, responsable_cumplimiento,
            estado_cumplimiento, validacion_automatica, codigo_validacion,
            created_at, updated_at
          ) VALUES (
            gen_random_uuid(),
            ${companyId},
            ${n.norma},
            ${n.fechaEmision}::date,
            ${n.entidadEmisora},
            ${n.categoria},
            ${n.titulo},
            ${n.descripcion},
            ${n.obligaciones},
            ${n.articulosAplicables},
            ${n.alcance},
            ${n.periodicidad},
            ${n.responsableCumplimiento},
            'no-cumple',
            ${n.validacionAutomatica},
            ${n.codigoValidacion},
            now(),
            now()
          )
        `);
        totalAdded++;
      }
    }

    console.log(`[Migration] Matriz legal: ${totalAdded} nuevas normas agregadas a ${companyIds.length} empresa(s).`);
  } catch (error) {
    console.error('[Migration] Error sincronizando normas matriz legal:', error);
    throw error;
  }
}

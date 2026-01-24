/**
 * PDF Plan de Emergencias - Informe de Trazabilidad
 * 
 * Genera un informe PDF completo con toda la trazabilidad del Plan de Emergencias.
 * Sigue el formato corporativo estandarizado según ISO 45001:2018 y normativa colombiana.
 * 
 * Contenido:
 * 1. Datos del Plan de Emergencias
 * 2. Brigadas de Emergencia con integrantes
 * 3. Análisis de Vulnerabilidad
 * 4. Inventario de Recursos de Emergencia
 * 5. Historial de Simulacros con participantes
 * 6. Zonas de Evacuación
 * 7. Rutas de Evacuación
 * 8. Puntos de Encuentro
 * 
 * Normativa: Resolución 0312/2019, Decreto 1072/2015, ISO 45001:2018
 */

import PDFDocument from 'pdfkit';
import { db } from '../db';
import { 
  planesEmergencia,
  brigadasEmergencia,
  miembrosBrigada,
  analisisVulnerabilidad,
  recursosEmergencia,
  simulacros,
  participantesSimulacro,
  zonasEvacuacion,
  rutasEvacuacion,
  puntosEncuentro,
  companies,
  workers,
} from '@shared/schema';
import { eq, inArray } from 'drizzle-orm';
import {
  PDF_COLORS,
  PDF_CONFIG,
  addStandardHeader,
  addSectionBar,
  addSimpleTable,
  addSignatureFooter,
  addProviderContactFooter,
  checkPageBreak,
  formatDate,
  getSignersForCompany,
  loadCompanyLogo,
} from './pdf-standardizer';

export interface GeneratePlanEmergenciasPdfOptions {
  planId: string;
  companyId: string;
}

/**
 * Genera el PDF de trazabilidad completa del Plan de Emergencias
 */
export async function generatePlanEmergenciasPdf(
  options: GeneratePlanEmergenciasPdfOptions
): Promise<Buffer> {
  const { planId, companyId } = options;

  // Obtener datos del plan
  const [plan] = await db
    .select()
    .from(planesEmergencia)
    .where(eq(planesEmergencia.id, planId))
    .limit(1);

  if (!plan) {
    throw new Error('Plan de emergencias no encontrado');
  }

  // Obtener datos de la empresa
  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  if (!company) {
    throw new Error('Empresa no encontrada');
  }

  // Obtener datos relacionados en paralelo
  const [
    brigadas,
    analisis,
    recursos,
    simulacrosList,
    zonas,
    rutas,
    puntos,
  ] = await Promise.all([
    db.select().from(brigadasEmergencia).where(eq(brigadasEmergencia.planEmergenciaId, planId)),
    db.select().from(analisisVulnerabilidad).where(eq(analisisVulnerabilidad.companyId, companyId)),
    db.select().from(recursosEmergencia).where(eq(recursosEmergencia.companyId, companyId)),
    db.select().from(simulacros).where(eq(simulacros.planEmergenciaId, planId)),
    db.select().from(zonasEvacuacion).where(eq(zonasEvacuacion.companyId, companyId)),
    db.select().from(rutasEvacuacion).where(eq(rutasEvacuacion.companyId, companyId)),
    db.select().from(puntosEncuentro).where(eq(puntosEncuentro.companyId, companyId)),
  ]);

  // Obtener miembros de brigadas con nombres de trabajadores
  const brigadaIds = brigadas.map(b => b.id);
  let miembrosConNombres: Array<{brigadaId: string; rol: string; certificadoVigente: number | null; nombreTrabajador: string}> = [];
  
  if (brigadaIds.length > 0) {
    const miembrosRaw = await db.select().from(miembrosBrigada).where(inArray(miembrosBrigada.brigadaId, brigadaIds));
    const workerIds = miembrosRaw.map(m => m.workerId);
    
    if (workerIds.length > 0) {
      const workersData = await db.select({ id: workers.id, name: workers.name }).from(workers).where(inArray(workers.id, workerIds));
      const workerMap = new Map(workersData.map(w => [w.id, w.name || 'N/A']));
      
      miembrosConNombres = miembrosRaw.map(m => ({
        brigadaId: m.brigadaId,
        rol: m.rol,
        certificadoVigente: m.certificadoVigente,
        nombreTrabajador: workerMap.get(m.workerId) || 'N/A',
      }));
    }
  }

  // Obtener participantes de simulacros
  const simulacroIds = simulacrosList.map(s => s.id);
  let participantesMap = new Map<string, number>();
  
  if (simulacroIds.length > 0) {
    const allParticipantes = await db.select().from(participantesSimulacro).where(inArray(participantesSimulacro.simulacroId, simulacroIds));
    for (const p of allParticipantes) {
      participantesMap.set(p.simulacroId, (participantesMap.get(p.simulacroId) || 0) + 1);
    }
  }

  // Obtener firmantes
  const signers = await getSignersForCompany(companyId, true);

  // Cargar logo de la empresa
  let logoBuffer: Buffer | null = null;
  if (company.logoUrl) {
    logoBuffer = await loadCompanyLogo(company.logoUrl);
  }

  // Crear documento PDF
  const doc = new PDFDocument({
    size: PDF_CONFIG.PAGE_SIZE,
    margins: {
      top: PDF_CONFIG.MARGIN,
      bottom: PDF_CONFIG.MARGIN,
      left: PDF_CONFIG.MARGIN,
      right: PDF_CONFIG.MARGIN,
    },
  });

  const chunks: Buffer[] = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  // Encabezado corporativo
  await addStandardHeader({
    doc,
    company: {
      id: company.id,
      name: company.name,
      nit: company.nit,
      address: company.address,
      logoUrl: company.logoUrl,
    },
    documentTitle: 'INFORME DE TRAZABILIDAD - PLAN DE EMERGENCIAS',
    documentCode: plan.codigo,
    version: plan.version || '1.0',
    date: new Date(),
    logoBuffer,
  });

  doc.y += 10;

  // 1. INFORMACIÓN DEL PLAN
  doc.y = addSectionBar(doc, '1. INFORMACIÓN DEL PLAN DE EMERGENCIAS', doc.y);
  
  const planInfo = [
    ['Código', plan.codigo],
    ['Nombre', plan.nombre],
    ['Versión', plan.version || '1.0'],
    ['Estado', plan.estado === 'vigente' ? 'Vigente' : plan.estado === 'en_revision' ? 'En Revisión' : plan.estado === 'borrador' ? 'Borrador' : 'Obsoleto'],
    ['Fecha de Elaboración', formatDate(plan.fechaElaboracion)],
    ['Elaborado por', plan.elaboradoPor || 'N/A'],
    ['Alcance', plan.alcance || 'N/A'],
  ];

  for (const [label, value] of planInfo) {
    doc.y = checkPageBreak(doc, 15, doc.y);
    doc.fontSize(9).font('Helvetica-Bold').text(`${label}: `, PDF_CONFIG.MARGIN, doc.y, { continued: true });
    doc.font('Helvetica').text(value || 'N/A');
  }

  doc.y += 15;

  // 2. BRIGADAS DE EMERGENCIA
  doc.y = addSectionBar(doc, '2. BRIGADAS DE EMERGENCIA', doc.y);
  
  if (brigadas.length === 0) {
    doc.fontSize(9).font('Helvetica-Oblique').fillColor('#666666');
    doc.text('No hay brigadas registradas para este plan.', PDF_CONFIG.MARGIN, doc.y);
    doc.fillColor(PDF_COLORS.BLACK);
    doc.y += 15;
  } else {
    for (const brigada of brigadas) {
      const miembrosBrigadaActual = miembrosConNombres.filter(m => m.brigadaId === brigada.id);
      
      doc.y = checkPageBreak(doc, 60, doc.y);
      
      doc.fontSize(10).font('Helvetica-Bold').fillColor(PDF_COLORS.GREEN_PRIMARY);
      doc.text(`${brigada.nombre}`, PDF_CONFIG.MARGIN, doc.y);
      doc.fillColor(PDF_COLORS.BLACK);
      
      doc.fontSize(8).font('Helvetica');
      doc.text(`Tipo: ${formatTipoBrigada(brigada.tipo)} | Activa: ${brigada.activa ? 'Sí' : 'No'}`, PDF_CONFIG.MARGIN, doc.y);
      
      if (brigada.funcionesDurante) {
        doc.text(`Funciones Durante: ${brigada.funcionesDurante.substring(0, 100)}${brigada.funcionesDurante.length > 100 ? '...' : ''}`, PDF_CONFIG.MARGIN, doc.y);
      }
      
      if (miembrosBrigadaActual.length > 0) {
        doc.y += 5;
        const headers = ['Nombre', 'Rol', 'Certificado'];
        const rows = miembrosBrigadaActual.map(m => [
          m.nombreTrabajador,
          formatRolBrigada(m.rol),
          m.certificadoVigente ? 'Sí' : 'No',
        ]);
        doc.y = addSimpleTable(doc, headers, rows, { y: doc.y, columnWidths: [200, 150, 80] });
      } else {
        doc.text('Sin miembros registrados', PDF_CONFIG.MARGIN, doc.y);
      }
      
      doc.y += 10;
    }
  }

  // 3. ANÁLISIS DE VULNERABILIDAD
  doc.y = addSectionBar(doc, '3. ANÁLISIS DE VULNERABILIDAD', doc.y);
  
  if (analisis.length === 0) {
    doc.fontSize(9).font('Helvetica-Oblique').fillColor('#666666');
    doc.text('No hay análisis de vulnerabilidad registrados.', PDF_CONFIG.MARGIN, doc.y);
    doc.fillColor(PDF_COLORS.BLACK);
    doc.y += 15;
  } else {
    const headers = ['Código', 'Fecha', 'Metodología', 'Nivel Riesgo Global', 'Realizado Por'];
    const rows = analisis.map(a => [
      a.codigo,
      formatDate(a.fechaAnalisis),
      a.metodologia || 'Diamante',
      a.nivelRiesgoGlobal || 'N/A',
      a.realizadoPor || 'N/A',
    ]);
    doc.y = addSimpleTable(doc, headers, rows, { y: doc.y });
    doc.y += 10;
  }

  // 4. RECURSOS DE EMERGENCIA
  doc.y = addSectionBar(doc, '4. RECURSOS DE EMERGENCIA', doc.y);
  
  if (recursos.length === 0) {
    doc.fontSize(9).font('Helvetica-Oblique').fillColor('#666666');
    doc.text('No hay recursos de emergencia registrados.', PDF_CONFIG.MARGIN, doc.y);
    doc.fillColor(PDF_COLORS.BLACK);
    doc.y += 15;
  } else {
    const headers = ['Código', 'Recurso', 'Tipo', 'Ubicación', 'Estado'];
    const rows = recursos.map(r => [
      r.codigo,
      r.nombre,
      formatTipoRecurso(r.tipo),
      r.ubicacion || 'N/A',
      formatEstadoRecurso(r.estado),
    ]);
    doc.y = addSimpleTable(doc, headers, rows, { y: doc.y });
    doc.y += 10;
  }

  // 5. HISTORIAL DE SIMULACROS
  doc.y = addSectionBar(doc, '5. HISTORIAL DE SIMULACROS', doc.y);
  
  if (simulacrosList.length === 0) {
    doc.fontSize(9).font('Helvetica-Oblique').fillColor('#666666');
    doc.text('No hay simulacros registrados para este plan.', PDF_CONFIG.MARGIN, doc.y);
    doc.fillColor(PDF_COLORS.BLACK);
    doc.y += 15;
  } else {
    for (const simulacro of simulacrosList) {
      const numParticipantes = participantesMap.get(simulacro.id) || simulacro.numeroParticipantes || 0;
      
      doc.y = checkPageBreak(doc, 60, doc.y);
      
      doc.fontSize(10).font('Helvetica-Bold').fillColor(PDF_COLORS.GREEN_PRIMARY);
      doc.text(`${simulacro.nombre}`, PDF_CONFIG.MARGIN, doc.y);
      doc.fillColor(PDF_COLORS.BLACK);
      
      doc.fontSize(8).font('Helvetica');
      doc.text(`Código: ${simulacro.codigo} | Tipo: ${formatTipoSimulacro(simulacro.tipo)}`, PDF_CONFIG.MARGIN, doc.y);
      doc.text(`Fecha Programada: ${formatDate(simulacro.fechaProgramada)} | Estado: ${formatEstadoSimulacro(simulacro.estado)}`, PDF_CONFIG.MARGIN, doc.y);
      doc.text(`Coordinador: ${simulacro.coordinadorNombre || 'N/A'} | Participantes: ${numParticipantes}`, PDF_CONFIG.MARGIN, doc.y);
      
      if (simulacro.fechaEjecucion) {
        doc.text(`Fecha Ejecución: ${formatDate(simulacro.fechaEjecucion)}`, PDF_CONFIG.MARGIN, doc.y);
      }
      
      if (simulacro.tiempoEvacuacion) {
        doc.text(`Tiempo Evacuación: ${simulacro.tiempoEvacuacion} segundos | Calificación: ${simulacro.calificacionGeneral || 'N/A'}`, PDF_CONFIG.MARGIN, doc.y);
      }
      
      if (simulacro.leccionesAprendidas) {
        doc.text(`Lecciones: ${simulacro.leccionesAprendidas.substring(0, 100)}${simulacro.leccionesAprendidas.length > 100 ? '...' : ''}`, PDF_CONFIG.MARGIN, doc.y);
      }
      
      doc.y += 10;
    }
  }

  // 6. ZONAS DE EVACUACIÓN
  doc.y = addSectionBar(doc, '6. ZONAS DE EVACUACIÓN', doc.y);
  
  if (zonas.length === 0) {
    doc.fontSize(9).font('Helvetica-Oblique').fillColor('#666666');
    doc.text('No hay zonas de evacuación registradas.', PDF_CONFIG.MARGIN, doc.y);
    doc.fillColor(PDF_COLORS.BLACK);
    doc.y += 15;
  } else {
    const headers = ['Código', 'Zona', 'Piso/Área', 'Capacidad'];
    const rows = zonas.map(z => [
      z.codigo,
      z.nombre,
      z.piso || z.area || 'N/A',
      String(z.capacidadPersonas || 'N/A'),
    ]);
    doc.y = addSimpleTable(doc, headers, rows, { y: doc.y });
    doc.y += 10;
  }

  // 7. RUTAS DE EVACUACIÓN
  doc.y = addSectionBar(doc, '7. RUTAS DE EVACUACIÓN', doc.y);
  
  if (rutas.length === 0) {
    doc.fontSize(9).font('Helvetica-Oblique').fillColor('#666666');
    doc.text('No hay rutas de evacuación registradas.', PDF_CONFIG.MARGIN, doc.y);
    doc.fillColor(PDF_COLORS.BLACK);
    doc.y += 15;
  } else {
    const headers = ['Código', 'Ruta', 'Origen', 'Destino', 'Distancia'];
    const rows = rutas.map(r => [
      r.codigo,
      r.nombre,
      r.puntoInicio || 'N/A',
      r.puntoFin || 'N/A',
      r.distanciaMetros ? `${r.distanciaMetros}m` : 'N/A',
    ]);
    doc.y = addSimpleTable(doc, headers, rows, { y: doc.y });
    doc.y += 10;
  }

  // 8. PUNTOS DE ENCUENTRO
  doc.y = addSectionBar(doc, '8. PUNTOS DE ENCUENTRO', doc.y);
  
  if (puntos.length === 0) {
    doc.fontSize(9).font('Helvetica-Oblique').fillColor('#666666');
    doc.text('No hay puntos de encuentro registrados.', PDF_CONFIG.MARGIN, doc.y);
    doc.fillColor(PDF_COLORS.BLACK);
    doc.y += 15;
  } else {
    const headers = ['Código', 'Punto', 'Ubicación', 'Capacidad', 'Accesible'];
    const rows = puntos.map(p => [
      p.codigo,
      p.nombre,
      p.ubicacion || 'N/A',
      String(p.capacidadPersonas || 'N/A'),
      p.esAccesible ? 'Sí' : 'No',
    ]);
    doc.y = addSimpleTable(doc, headers, rows, { y: doc.y });
    doc.y += 10;
  }

  // Resumen estadístico
  doc.y = checkPageBreak(doc, 120, doc.y);
  doc.y = addSectionBar(doc, 'RESUMEN ESTADÍSTICO', doc.y);
  
  const simulacrosEjecutados = simulacrosList.filter(s => s.estado === 'completado').length;
  const simulacrosProgramados = simulacrosList.filter(s => s.estado === 'programado').length;
  
  const resumen = [
    ['Total Brigadas', String(brigadas.length)],
    ['Total Miembros de Brigada', String(miembrosConNombres.length)],
    ['Análisis de Vulnerabilidad', String(analisis.length)],
    ['Recursos de Emergencia', String(recursos.length)],
    ['Simulacros Ejecutados', String(simulacrosEjecutados)],
    ['Simulacros Programados', String(simulacrosProgramados)],
    ['Zonas de Evacuación', String(zonas.length)],
    ['Rutas de Evacuación', String(rutas.length)],
    ['Puntos de Encuentro', String(puntos.length)],
  ];

  for (const [label, value] of resumen) {
    doc.fontSize(9).font('Helvetica-Bold').text(`${label}: `, PDF_CONFIG.MARGIN, doc.y, { continued: true });
    doc.font('Helvetica').text(value);
  }

  doc.y += 20;

  // Footer de contacto y firmantes
  addProviderContactFooter(doc, { includeAllEmails: false, compact: true });
  addSignatureFooter(doc, signers, true);

  // Finalizar documento
  doc.end();

  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    doc.on('error', reject);
  });
}

// Funciones de formateo auxiliares
function formatTipoBrigada(tipo: string | null): string {
  const tipos: Record<string, string> = {
    primeros_auxilios: 'Primeros Auxilios',
    evacuacion: 'Evacuación',
    control_incendios: 'Control de Incendios',
    busqueda_rescate: 'Búsqueda y Rescate',
    comunicaciones: 'Comunicaciones',
    integral: 'Brigada Integral',
  };
  return tipos[tipo || ''] || tipo || 'N/A';
}

function formatRolBrigada(rol: string | null): string {
  const roles: Record<string, string> = {
    jefe_brigada: 'Jefe de Brigada',
    subjefe: 'Subjefe',
    brigadista: 'Brigadista',
    coordinador_zona: 'Coordinador de Zona',
  };
  return roles[rol || ''] || rol || 'N/A';
}

function formatTipoRecurso(tipo: string | null): string {
  const tipos: Record<string, string> = {
    extintor: 'Extintor',
    botiquin: 'Botiquín',
    camilla: 'Camilla',
    dea: 'Desfibrilador (DEA)',
    kit_derrames: 'Kit Derrames',
    senalizacion: 'Señalización',
    linterna_emergencia: 'Linterna Emergencia',
    megafono: 'Megáfono',
    equipo_rescate: 'Equipo Rescate',
    otro: 'Otro',
  };
  return tipos[tipo || ''] || tipo || 'N/A';
}

function formatEstadoRecurso(estado: string | null): string {
  const estados: Record<string, string> = {
    operativo: 'Operativo',
    requiere_mantenimiento: 'Requiere Mantenimiento',
    vencido: 'Vencido',
    fuera_servicio: 'Fuera de Servicio',
  };
  return estados[estado || ''] || estado || 'N/A';
}

function formatTipoSimulacro(tipo: string | null): string {
  const tipos: Record<string, string> = {
    evacuacion: 'Evacuación',
    incendio: 'Incendio',
    sismo: 'Sismo',
    inundacion: 'Inundación',
    derrame: 'Derrame Químico',
    primeros_auxilios: 'Primeros Auxilios',
    multiple: 'Múltiple',
    otro: 'Otro',
  };
  return tipos[tipo || ''] || tipo || 'N/A';
}

function formatEstadoSimulacro(estado: string | null): string {
  const estados: Record<string, string> = {
    programado: 'Programado',
    en_ejecucion: 'En Ejecución',
    completado: 'Completado',
    cancelado: 'Cancelado',
  };
  return estados[estado || ''] || estado || 'N/A';
}

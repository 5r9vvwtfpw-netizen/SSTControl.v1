/**
 * Job: Alertas de Cumplimiento Normativo SST
 *
 * Genera notificaciones automáticas para los clientes cuando:
 * 1. Tienen estándares de la Resolución 0312 sin completar
 * 2. Su evaluación anual está próxima a vencer o ya venció
 * 3. Tienen acciones del plan de mejora vencidas o próximas a vencer
 * 4. Nunca han iniciado una autoevaluación (empresa nueva)
 */

import cron from 'node-cron';
import { storage } from '../storage';
import { sendNotificationEmail } from './notifications';
import logger from '../lib/logger';

const TIPOS = {
  ESTANDARES_INCOMPLETOS: 'alerta-estandares-incompletos',
  EVALUACION_ANUAL: 'alerta-evaluacion-anual',
  ACCIONES_VENCIDAS: 'alerta-acciones-vencidas',
  SIN_EVALUACION: 'alerta-sin-evaluacion',
  VENCIMIENTOS_PESV: 'alerta-vencimientos-pesv',
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getAdminUserForCompany(companyId: string) {
  const admins = await storage.getUsersByRole(['admin', 'responsable_sst', 'superusuario'], companyId);
  return admins.find(u => u.email) ?? null;
}

async function yaEnvioNotificacion(companyId: string, tipo: string, diasAtras: number): Promise<boolean> {
  const notificaciones = await storage.listCopasstNotificaciones(companyId, { tipo });
  const corte = new Date();
  corte.setDate(corte.getDate() - diasAtras);
  return notificaciones.some(n => n.createdAt && new Date(n.createdAt) >= corte);
}

async function crearYEnviarAlerta(params: {
  companyId: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  companyName: string;
}) {
  const { companyId, tipo, titulo, mensaje, companyName } = params;

  const admin = await getAdminUserForCompany(companyId);
  if (!admin) return;

  await storage.createCopasstNotificacion({
    companyId,
    userId: admin.id,
    asignacionId: null,
    tipo,
    titulo,
    mensaje,
    estado: 'pendiente',
    fechaProgramada: new Date(),
  });

  if (admin.email) {
    await sendNotificationEmail({
      to: admin.email,
      titulo,
      mensaje,
      tipo: 'alerta',
      companyName,
    });
  }

  logger.info({ companyId, tipo }, `[ComplianceAlerts] Alerta enviada: ${tipo}`);
}

// ─── Alerta 1: Estándares sin completar ──────────────────────────────────────

export async function alertarEstandaresIncompletos(): Promise<number> {
  const companies = await storage.getCompanies();
  let enviadas = 0;

  for (const company of companies) {
    try {
      if (await yaEnvioNotificacion(company.id, TIPOS.ESTANDARES_INCOMPLETOS, 7)) continue;

      const evaluaciones = await storage.getEvaluacionesSst(company.id);
      if (evaluaciones.length === 0) continue;

      // Tomar la evaluación más reciente
      const ultima = evaluaciones.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      const respuestas = await storage.getRespuestasEstandares(ultima.id, company.id);
      const incompletos = respuestas.filter(r => r.cumple === 0 && r.noAplica === 0);

      if (incompletos.length === 0) continue;

      const estandares = await storage.getEstandaresSst();
      const estandaresMap = new Map(estandares.map(e => [e.id, e]));

      const listaTexto = incompletos
        .slice(0, 10)
        .map(r => {
          const est = estandaresMap.get(r.estandarId);
          return est ? `• [${est.codigo ?? 'S/C'}] ${est.nombre}` : `• Estándar ID: ${r.estandarId}`;
        })
        .join('\n');

      const resto = incompletos.length > 10 ? `\n... y ${incompletos.length - 10} más.` : '';

      const titulo = `Tiene ${incompletos.length} estándar(es) sin cumplir en su evaluación SST`;
      const mensaje =
        `Su empresa "${company.name}" tiene ${incompletos.length} estándar(es) de la Resolución 0312 de 2019 marcados como "No Cumple" en su última autoevaluación (${ultima.anio}).\n\n` +
        `Estándares pendientes:\n${listaTexto}${resto}\n\n` +
        `Ingrese al módulo VERIFICAR → Autoevaluaciones para gestionar su Plan de Mejora y subsanar estos incumplimientos.`;

      await crearYEnviarAlerta({ companyId: company.id, tipo: TIPOS.ESTANDARES_INCOMPLETOS, titulo, mensaje, companyName: company.name });
      enviadas++;
    } catch (err: any) {
      logger.error({ companyId: company.id, error: err.message }, '[ComplianceAlerts] Error en alerta estándares incompletos');
    }
  }

  return enviadas;
}

// ─── Alerta 2: Evaluación anual próxima a vencer o vencida ───────────────────

export async function alertarEvaluacionAnual(): Promise<number> {
  const companies = await storage.getCompanies();
  let enviadas = 0;

  for (const company of companies) {
    try {
      if (await yaEnvioNotificacion(company.id, TIPOS.EVALUACION_ANUAL, 30)) continue;

      const evaluaciones = await storage.getEvaluacionesSst(company.id);
      const anioActual = new Date().getFullYear();

      // Si ya tiene evaluación del año en curso, no alertar
      const tieneDelAnio = evaluaciones.some(e => e.anio === anioActual);
      if (tieneDelAnio) continue;

      let titulo: string;
      let mensaje: string;

      if (evaluaciones.length === 0) continue; // Manejado por Alerta 4

      const ultima = evaluaciones.sort((a, b) => b.anio - a.anio)[0];
      const aniosDesde = anioActual - ultima.anio;

      if (aniosDesde === 0) continue;

      if (aniosDesde >= 1) {
        titulo = `Autoevaluación anual SST pendiente — Año ${anioActual}`;
        mensaje =
          `La empresa "${company.name}" no ha realizado la autoevaluación de Estándares Mínimos del año ${anioActual}.\n\n` +
          `Su última evaluación registrada es del año ${ultima.anio} con un cumplimiento del ${ultima.porcentajeCumplimiento}%.\n\n` +
          `La Resolución 0312 de 2019 exige realizar esta evaluación anualmente. El incumplimiento puede generar observaciones o sanciones en una visita del Ministerio de Trabajo.\n\n` +
          `Ingrese al módulo VERIFICAR → Autoevaluaciones para crear la evaluación del año ${anioActual}.`;
      } else {
        continue;
      }

      await crearYEnviarAlerta({ companyId: company.id, tipo: TIPOS.EVALUACION_ANUAL, titulo, mensaje, companyName: company.name });
      enviadas++;
    } catch (err: any) {
      logger.error({ companyId: company.id, error: err.message }, '[ComplianceAlerts] Error en alerta evaluación anual');
    }
  }

  return enviadas;
}

// ─── Alerta 3: Acciones del plan de mejora vencidas o próximas a vencer ──────

export async function alertarAccionesMejoraVencidas(): Promise<number> {
  const companies = await storage.getCompanies();
  let enviadas = 0;
  const hoy = new Date();
  const en7Dias = new Date();
  en7Dias.setDate(hoy.getDate() + 7);

  for (const company of companies) {
    try {
      if (await yaEnvioNotificacion(company.id, TIPOS.ACCIONES_VENCIDAS, 1)) continue;

      const evaluaciones = await storage.getEvaluacionesSst(company.id);
      if (evaluaciones.length === 0) continue;

      const accionesProblema: { descripcion: string; estado: string; fechaCompromiso: string }[] = [];

      for (const eval_ of evaluaciones) {
        const acciones = await storage.getAccionesMejora(eval_.id, company.id);
        for (const accion of acciones) {
          if (accion.estado === 'completada') continue;
          if (!accion.fechaCompromiso) continue;

          const fecha = new Date(accion.fechaCompromiso);
          const vencida = fecha < hoy;
          const proximaAVencer = fecha >= hoy && fecha <= en7Dias;

          if (vencida || proximaAVencer) {
            accionesProblema.push({
              descripcion: accion.descripcionAccion,
              estado: vencida ? 'VENCIDA' : 'Vence en ≤7 días',
              fechaCompromiso: fecha.toLocaleDateString('es-CO'),
            });
          }
        }
      }

      if (accionesProblema.length === 0) continue;

      const vencidas = accionesProblema.filter(a => a.estado === 'VENCIDA').length;
      const proximas = accionesProblema.filter(a => a.estado !== 'VENCIDA').length;

      const listaTexto = accionesProblema
        .slice(0, 8)
        .map(a => `• [${a.estado}] ${a.descripcionAccion.substring(0, 80)}${a.descripcionAccion.length > 80 ? '...' : ''} — Fecha: ${a.fechaCompromiso}`)
        .join('\n');

      const resto = accionesProblema.length > 8 ? `\n... y ${accionesProblema.length - 8} más.` : '';

      const titulo = vencidas > 0
        ? `${vencidas} acción(es) del Plan de Mejora vencida(s) sin completar`
        : `${proximas} acción(es) del Plan de Mejora vencen en los próximos 7 días`;

      const mensaje =
        `La empresa "${company.name}" tiene acciones del Plan de Mejora que requieren atención:\n\n` +
        `${listaTexto}${resto}\n\n` +
        `El incumplimiento sistemático de las acciones del Plan de Mejora puede afectar su calificación en la autoevaluación anual y generar hallazgos en visitas de inspección.\n\n` +
        `Ingrese al módulo ACTUAR → Plan de Mejora para actualizar el avance de cada acción.`;

      await crearYEnviarAlerta({ companyId: company.id, tipo: TIPOS.ACCIONES_VENCIDAS, titulo, mensaje, companyName: company.name });
      enviadas++;
    } catch (err: any) {
      logger.error({ companyId: company.id, error: err.message }, '[ComplianceAlerts] Error en alerta acciones vencidas');
    }
  }

  return enviadas;
}

// ─── Alerta 4: Empresa sin ninguna evaluación iniciada ───────────────────────

export async function alertarEmpresasSinEvaluacion(): Promise<number> {
  const companies = await storage.getCompanies();
  let enviadas = 0;
  const hace30Dias = new Date();
  hace30Dias.setDate(hace30Dias.getDate() - 30);

  for (const company of companies) {
    try {
      if (await yaEnvioNotificacion(company.id, TIPOS.SIN_EVALUACION, 14)) continue;

      const evaluaciones = await storage.getEvaluacionesSst(company.id);
      if (evaluaciones.length > 0) continue;

      // Solo aplica si la empresa fue creada hace más de 30 días
      const createdAt = (company as any).createdAt;
      if (createdAt && new Date(createdAt) > hace30Dias) continue;

      const titulo = 'Pendiente: Autoevaluación inicial de Estándares Mínimos SST';
      const mensaje =
        `La empresa "${company.name}" aún no ha iniciado su Autoevaluación de Estándares Mínimos según la Resolución 0312 de 2019.\n\n` +
        `Este diagnóstico inicial es el primer paso obligatorio del SG-SST. Le permite:\n` +
        `• Conocer el nivel de cumplimiento actual de su empresa\n` +
        `• Identificar los estándares que deben implementarse según su tamaño y nivel de riesgo\n` +
        `• Generar automáticamente el Plan de Mejora para los incumplimientos encontrados\n\n` +
        `Sin esta evaluación, el sistema no puede generar los indicadores de resultado ni el plan de mejora.\n\n` +
        `Ingrese al módulo VERIFICAR → Autoevaluaciones y haga clic en "Nueva Evaluación" para comenzar.`;

      await crearYEnviarAlerta({ companyId: company.id, tipo: TIPOS.SIN_EVALUACION, titulo, mensaje, companyName: company.name });
      enviadas++;
    } catch (err: any) {
      logger.error({ companyId: company.id, error: err.message }, '[ComplianceAlerts] Error en alerta sin evaluación');
    }
  }

  return enviadas;
}

// ─── Alerta 5: Vencimientos PESV (SOAT, Revisión Técnica, Licencias) ─────────

export async function alertarVencimientosPesv(): Promise<number> {
  const companies = await storage.getCompanies();
  let enviadas = 0;
  const DIAS_AVISO = 30;

  for (const company of companies) {
    try {
      const yaNotificado = await yaEnvioNotificacion(company.id, TIPOS.VENCIMIENTOS_PESV, 7);
      if (yaNotificado) continue;

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const limite = new Date(hoy);
      limite.setDate(limite.getDate() + DIAS_AVISO);

      const vencidos: string[] = [];
      const proximos: string[] = [];

      // Verificar vehículos
      const vehiculos = await storage.getVehicles(company.id);
      for (const v of vehiculos) {
        if (v.status === 'inactivo' || v.status === 'dado_de_baja') continue;

        if (v.soatExpiry) {
          const d = new Date(v.soatExpiry);
          if (!isNaN(d.getTime())) {
            if (d < hoy) vencidos.push(`SOAT vehículo ${v.plate} (venció ${d.toLocaleDateString('es-CO')})`);
            else if (d <= limite) proximos.push(`SOAT vehículo ${v.plate} (vence ${d.toLocaleDateString('es-CO')})`);
          }
        }
        if (v.technicalReviewExpiry) {
          const d = new Date(v.technicalReviewExpiry);
          if (!isNaN(d.getTime())) {
            if (d < hoy) vencidos.push(`Revisión Técnica ${v.plate} (venció ${d.toLocaleDateString('es-CO')})`);
            else if (d <= limite) proximos.push(`Revisión Técnica ${v.plate} (vence ${d.toLocaleDateString('es-CO')})`);
          }
        }
      }

      // Verificar conductores
      const conductores = await storage.getDrivers(company.id);
      for (const c of conductores) {
        if (c.status === 'inactivo') continue;

        if (c.licenseExpiry) {
          const d = new Date(c.licenseExpiry);
          if (!isNaN(d.getTime())) {
            const nombre = c.name || c.identificationNumber || 'Conductor';
            if (d < hoy) vencidos.push(`Licencia de conducción ${nombre} (venció ${d.toLocaleDateString('es-CO')})`);
            else if (d <= limite) proximos.push(`Licencia de conducción ${nombre} (vence ${d.toLocaleDateString('es-CO')})`);
          }
        }
        if (c.medicalExamExpiry) {
          const d = new Date(c.medicalExamExpiry);
          if (!isNaN(d.getTime())) {
            const nombre = c.name || c.identificationNumber || 'Conductor';
            if (d < hoy) vencidos.push(`Examen médico conductor ${nombre} (venció ${d.toLocaleDateString('es-CO')})`);
            else if (d <= limite) proximos.push(`Examen médico conductor ${nombre} (vence ${d.toLocaleDateString('es-CO')})`);
          }
        }
      }

      if (vencidos.length === 0 && proximos.length === 0) continue;

      const lineasVencidos = vencidos.length > 0
        ? `\n\n🔴 DOCUMENTOS VENCIDOS (${vencidos.length}):\n• ${vencidos.join('\n• ')}`
        : '';
      const lineasProximos = proximos.length > 0
        ? `\n\n🟡 PRÓXIMOS A VENCER — dentro de ${DIAS_AVISO} días (${proximos.length}):\n• ${proximos.join('\n• ')}`
        : '';

      await crearYEnviarAlerta({
        companyId: company.id,
        companyName: company.name,
        tipo: TIPOS.VENCIMIENTOS_PESV,
        titulo: `⚠️ Alerta PESV: Documentos vencidos o próximos a vencer`,
        mensaje: `Se han detectado documentos de vehículos o conductores que requieren atención inmediata en el PESV de ${company.name}.${lineasVencidos}${lineasProximos}\n\nPor favor ingrese al módulo PESV → Vehículos / Conductores para renovar los documentos.`,
      });
      enviadas++;
    } catch (err: any) {
      logger.error({ companyId: company.id, error: err.message }, '[ComplianceAlerts] Error alertas vencimientos PESV');
    }
  }

  return enviadas;
}

// ─── Runner combinado ─────────────────────────────────────────────────────────

export async function runComplianceAlerts(tipos?: string[]) {
  logger.info('[ComplianceAlerts] Iniciando verificación de alertas de cumplimiento...');

  const resultados: Record<string, number> = {};

  const correr = (tipo: string) => !tipos || tipos.includes(tipo);

  if (correr('estandares')) {
    resultados.estandaresIncompletos = await alertarEstandaresIncompletos();
  }
  if (correr('evaluacion_anual')) {
    resultados.evaluacionAnual = await alertarEvaluacionAnual();
  }
  if (correr('acciones')) {
    resultados.accionesVencidas = await alertarAccionesMejoraVencidas();
  }
  if (correr('sin_evaluacion')) {
    resultados.sinEvaluacion = await alertarEmpresasSinEvaluacion();
  }
  if (correr('vencimientos_pesv')) {
    resultados.vencimientosPesv = await alertarVencimientosPesv();
  }

  const total = Object.values(resultados).reduce((a, b) => a + b, 0);
  logger.info({ resultados, total }, '[ComplianceAlerts] Verificación completada');
  return resultados;
}

// ─── Scheduler ───────────────────────────────────────────────────────────────

export function startComplianceAlertsCron() {
  // Vencimientos PESV (SOAT, RTM, licencias) — todos los días a las 8:00 AM Colombia (13:00 UTC)
  cron.schedule('0 13 * * *', () => {
    alertarVencimientosPesv().catch(err =>
      logger.error({ error: err.message }, '[ComplianceAlerts] Cron vencimientos PESV falló')
    );
  });

  // Acciones vencidas — todos los días a las 7:00 AM Colombia (12:00 UTC)
  cron.schedule('0 12 * * *', () => {
    alertarAccionesMejoraVencidas().catch(err =>
      logger.error({ error: err.message }, '[ComplianceAlerts] Cron acciones vencidas falló')
    );
  });

  // Estándares incompletos + Sin evaluación — cada lunes a las 9:00 AM Colombia (14:00 UTC)
  cron.schedule('0 14 * * 1', () => {
    alertarEstandaresIncompletos().catch(err =>
      logger.error({ error: err.message }, '[ComplianceAlerts] Cron estándares incompletos falló')
    );
    alertarEmpresasSinEvaluacion().catch(err =>
      logger.error({ error: err.message }, '[ComplianceAlerts] Cron sin evaluación falló')
    );
  });

  // Evaluación anual — el día 1 de cada mes a las 10:00 AM Colombia (15:00 UTC)
  cron.schedule('0 15 1 * *', () => {
    alertarEvaluacionAnual().catch(err =>
      logger.error({ error: err.message }, '[ComplianceAlerts] Cron evaluación anual falló')
    );
  });

  logger.info('[ComplianceAlerts] Crons de alertas de cumplimiento programados');
}

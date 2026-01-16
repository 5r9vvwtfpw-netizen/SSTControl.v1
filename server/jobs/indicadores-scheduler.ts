import cron from 'node-cron';
import { storage } from '../storage';
import { calcularIndicador, parsePeriodoToDateRange } from '../indicadores-calculators';
import logger from '../lib/logger';
import type { IndicadorSst, InsertMedicionIndicador } from '@shared/schema';

interface CalculoResult {
  indicadorId: string;
  indicadorNombre: string;
  companyId: string;
  periodo: string;
  valorCalculado: number;
  cumpleMeta: boolean;
  error?: string;
}

interface ResumenCalculo {
  fechaEjecucion: string;
  totalIndicadores: number;
  medicionesCreadas: number;
  alertasGeneradas: number;
  errores: number;
  detalles: CalculoResult[];
}

function getCurrentPeriodo(frecuencia: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  
  switch (frecuencia) {
    case 'mensual':
      return `${year}-${month.toString().padStart(2, '0')}`;
    case 'trimestral':
      const quarter = Math.ceil(month / 3);
      return `${year}-Q${quarter}`;
    case 'semestral':
      const semester = month <= 6 ? 1 : 2;
      return `${year}-S${semester}`;
    case 'anual':
      return `${year}`;
    default:
      return `${year}-${month.toString().padStart(2, '0')}`;
  }
}

function esMomentoDeCalcular(frecuencia: string, fecha: Date = new Date()): boolean {
  const day = fecha.getDate();
  const month = fecha.getMonth() + 1;
  
  if (day !== 1) return false;
  
  switch (frecuencia) {
    case 'mensual':
      return true;
    case 'trimestral':
      return [1, 4, 7, 10].includes(month);
    case 'semestral':
      return [1, 7].includes(month);
    case 'anual':
      return month === 1;
    default:
      return false;
  }
}

async function medicionYaExiste(indicadorId: string, periodo: string, companyId: string): Promise<boolean> {
  const mediciones = await storage.getMedicionesIndicador(indicadorId, companyId);
  return mediciones.some(m => m.periodo === periodo);
}

async function calcularIndicadorAutomatico(
  indicador: IndicadorSst,
  periodo: string
): Promise<CalculoResult> {
  const result: CalculoResult = {
    indicadorId: indicador.id,
    indicadorNombre: indicador.nombre,
    companyId: indicador.companyId,
    periodo,
    valorCalculado: 0,
    cumpleMeta: true
  };

  try {
    if (!indicador.codigoCalculo) {
      result.error = 'Indicador sin código de cálculo configurado';
      return result;
    }

    const yaExiste = await medicionYaExiste(indicador.id, periodo, indicador.companyId);
    if (yaExiste) {
      result.error = 'Medición ya existe para este periodo';
      return result;
    }

    const dateRange = parsePeriodoToDateRange(periodo);
    const calculo = await calcularIndicador(indicador.codigoCalculo, indicador.companyId, dateRange);
    
    result.valorCalculado = calculo.valorCalculado;
    
    let cumpleMeta = 1;
    let desviacion: number | undefined;
    
    if (indicador.valorMeta !== null && indicador.valorMeta !== undefined) {
      const metaStr = indicador.meta.toLowerCase();
      const valorMeta = indicador.valorMeta;
      
      if (metaStr.includes('≥') || metaStr.includes('>=')) {
        cumpleMeta = calculo.valorCalculado >= valorMeta ? 1 : 0;
      } else if (metaStr.includes('≤') || metaStr.includes('<=')) {
        cumpleMeta = calculo.valorCalculado <= valorMeta ? 1 : 0;
      } else if (metaStr.includes('>')) {
        cumpleMeta = calculo.valorCalculado > valorMeta ? 1 : 0;
      } else if (metaStr.includes('<')) {
        cumpleMeta = calculo.valorCalculado < valorMeta ? 1 : 0;
      } else {
        cumpleMeta = Math.abs(calculo.valorCalculado - valorMeta) <= (valorMeta * 0.05) ? 1 : 0;
      }
      
      if (valorMeta !== 0) {
        desviacion = Math.round(((calculo.valorCalculado - valorMeta) / valorMeta) * 100);
      }
    }
    
    result.cumpleMeta = cumpleMeta === 1;

    const medicionData: InsertMedicionIndicador = {
      indicadorId: indicador.id,
      periodo,
      fechaMedicion: new Date(),
      valorMedido: calculo.valorCalculado.toString(),
      valorNumerico: Math.round(calculo.valorCalculado),
      cumpleMeta,
      desviacion,
      analisis: `Cálculo automático. Detalles: ${JSON.stringify(calculo.detallesCalculo)}`,
      responsableMedicion: 'Sistema (cálculo automático)'
    };

    await storage.createMedicionIndicador(medicionData, indicador.companyId);
    
    logger.info({
      job: 'indicadores-scheduler',
      indicadorId: indicador.id,
      periodo,
      valor: calculo.valorCalculado,
      cumpleMeta: result.cumpleMeta
    }, `Medición creada para indicador ${indicador.nombre}`);

  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Error desconocido';
    logger.error({
      job: 'indicadores-scheduler',
      indicadorId: indicador.id,
      periodo,
      error: result.error
    }, `Error calculando indicador ${indicador.nombre}`);
  }

  return result;
}

async function getIndicadoresAutomaticosGlobal(): Promise<IndicadorSst[]> {
  const companies = await storage.getCompanies();
  const allIndicadores: IndicadorSst[] = [];
  
  for (const company of companies) {
    const indicadores = await storage.getIndicadoresSst(company.id);
    const automaticos = indicadores.filter(i => i.esCalculoAutomatico === 1 && i.activo === 1);
    allIndicadores.push(...automaticos);
  }
  
  return allIndicadores;
}

export async function ejecutarCalculoIndicadores(): Promise<ResumenCalculo> {
  const context = {
    job: 'indicadores-scheduler',
    timestamp: new Date().toISOString()
  };

  logger.info(context, 'Iniciando job de cálculo automático de indicadores SST...');

  const resumen: ResumenCalculo = {
    fechaEjecucion: new Date().toISOString(),
    totalIndicadores: 0,
    medicionesCreadas: 0,
    alertasGeneradas: 0,
    errores: 0,
    detalles: []
  };

  try {
    const indicadores = await getIndicadoresAutomaticosGlobal();
    resumen.totalIndicadores = indicadores.length;

    if (indicadores.length === 0) {
      logger.info(context, 'No hay indicadores automáticos activos');
      return resumen;
    }

    logger.info({ ...context, count: indicadores.length }, `Encontrados ${indicadores.length} indicadores automáticos`);

    const hoy = new Date();

    for (const indicador of indicadores) {
      if (!esMomentoDeCalcular(indicador.frecuenciaMedicion, hoy)) {
        continue;
      }

      const periodo = getCurrentPeriodo(indicador.frecuenciaMedicion);
      const resultado = await calcularIndicadorAutomatico(indicador, periodo);
      resumen.detalles.push(resultado);

      if (resultado.error) {
        resumen.errores++;
      } else {
        resumen.medicionesCreadas++;
        if (!resultado.cumpleMeta) {
          resumen.alertasGeneradas++;
        }
      }
    }

    logger.info({
      ...context,
      medicionesCreadas: resumen.medicionesCreadas,
      alertasGeneradas: resumen.alertasGeneradas,
      errores: resumen.errores
    }, 'Job de cálculo de indicadores completado');

  } catch (error) {
    logger.error({
      ...context,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, 'Error en job de cálculo de indicadores');
  }

  return resumen;
}

export async function ejecutarCalculoMasivoEmpresa(
  companyId: string,
  periodo: string
): Promise<ResumenCalculo> {
  const context = {
    job: 'indicadores-calculo-masivo',
    companyId,
    periodo,
    timestamp: new Date().toISOString()
  };

  logger.info(context, 'Iniciando cálculo masivo de indicadores para empresa...');

  const resumen: ResumenCalculo = {
    fechaEjecucion: new Date().toISOString(),
    totalIndicadores: 0,
    medicionesCreadas: 0,
    alertasGeneradas: 0,
    errores: 0,
    detalles: []
  };

  try {
    const indicadores = await storage.getIndicadoresSst(companyId);
    const automaticos = indicadores.filter(i => i.esCalculoAutomatico === 1 && i.activo === 1);
    resumen.totalIndicadores = automaticos.length;

    if (automaticos.length === 0) {
      logger.info(context, 'No hay indicadores automáticos activos para esta empresa');
      return resumen;
    }

    for (const indicador of automaticos) {
      const resultado = await calcularIndicadorAutomatico(indicador, periodo);
      resumen.detalles.push(resultado);

      if (resultado.error) {
        resumen.errores++;
      } else {
        resumen.medicionesCreadas++;
        if (!resultado.cumpleMeta) {
          resumen.alertasGeneradas++;
        }
      }
    }

    logger.info({
      ...context,
      medicionesCreadas: resumen.medicionesCreadas,
      alertasGeneradas: resumen.alertasGeneradas,
      errores: resumen.errores
    }, 'Cálculo masivo de indicadores completado');

  } catch (error) {
    logger.error({
      ...context,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, 'Error en cálculo masivo de indicadores');
  }

  return resumen;
}

export function startIndicadoresSchedulerCron() {
  cron.schedule('0 11 * * *', () => {
    ejecutarCalculoIndicadores();
  });

  logger.info({ env: process.env.NODE_ENV }, 'Indicadores SST scheduler iniciado (ejecuta diariamente a las 6:00 AM hora Colombia)');
}

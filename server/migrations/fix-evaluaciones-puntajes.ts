import { db } from '../db';
import { sql } from 'drizzle-orm';
import * as schema from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Migración para corregir puntajes de evaluaciones SST según Resolución 0312/2019
 * 
 * PROBLEMA: Las respuestas guardadas tienen puntaje_obtenido y puntaje_maximo incorrectos
 * cuando no corresponden al tipo de empresa (tipo1, tipo2, tipo3, tipo4).
 * 
 * SOLUCIÓN: Recalcular TODAS las evaluaciones usando los puntajes correctos del maestro
 * de estándares según el tipo de empresa de cada evaluación.
 */
export async function fixEvaluacionesPuntajes() {
  console.log('[Migration] Corrigiendo puntajes de evaluaciones SST (Resolución 0312)...');
  
  try {
    const evaluaciones = await db.select().from(schema.evaluacionesSst);
    const estandares = await db.select().from(schema.estandaresSst);
    const componentes = await db.select().from(schema.componentesSst);
    
    let corregidas = 0;
    let respuestasActualizadas = 0;
    
    for (const evaluacion of evaluaciones) {
      const respuestas = await db.select()
        .from(schema.respuestasEstandares)
        .where(eq(schema.respuestasEstandares.evaluacionId, evaluacion.id));
      
      if (respuestas.length === 0) continue;
      
      // Obtener puntaje máximo según tipo de empresa
      const getPuntajeMaxEstandar = (estandar: typeof estandares[0]) => {
        switch (evaluacion.tipoEmpresa) {
          case 'tipo1': return estandar.puntajeTipo1 || 0;
          case 'tipo2': return estandar.puntajeTipo2 || 0;
          case 'tipo3': return estandar.puntajeTipo3 || 0;
          case 'tipo4': return estandar.puntajeTipo4 || 0;
          default: return 0;
        }
      };
      
      // Recalcular puntajes de cada respuesta
      let necesitaCorreccion = false;
      for (const respuesta of respuestas) {
        const estandar = estandares.find(e => e.id === respuesta.estandarId);
        if (!estandar) continue;
        
        const puntajeMaxCorrecto = getPuntajeMaxEstandar(estandar);
        
        // Calcular puntaje obtenido correcto: cumple/noAplica = puntajeMax, no cumple = 0
        const puntajeObtenidoCorrecto = (respuesta.cumple || respuesta.noAplica) 
          ? puntajeMaxCorrecto 
          : 0;
        
        // Si los valores guardados son incorrectos, corregirlos
        if (respuesta.puntajeObtenido !== puntajeObtenidoCorrecto || 
            respuesta.puntajeMaximo !== puntajeMaxCorrecto) {
          necesitaCorreccion = true;
          
          await db.update(schema.respuestasEstandares)
            .set({
              puntajeObtenido: puntajeObtenidoCorrecto,
              puntajeMaximo: puntajeMaxCorrecto,
              updatedAt: sql`now()`
            })
            .where(eq(schema.respuestasEstandares.id, respuesta.id));
          
          respuestasActualizadas++;
        }
      }
      
      if (!necesitaCorreccion) continue;
      
      // Recargar respuestas actualizadas
      const respuestasActuales = await db.select()
        .from(schema.respuestasEstandares)
        .where(eq(schema.respuestasEstandares.evaluacionId, evaluacion.id));
      
      // Calcular totales por ciclo PHVA
      const puntajesPorCicloPhva: Record<string, { obtenido: number; maximo: number }> = {
        planear: { obtenido: 0, maximo: 0 },
        hacer: { obtenido: 0, maximo: 0 },
        verificar: { obtenido: 0, maximo: 0 },
        actuar: { obtenido: 0, maximo: 0 },
      };
      
      const puntajesPorComponente: Record<string, { obtenido: number; maximo: number }> = {};
      let puntajeTotal = 0;
      let puntajeMaximo = 0;
      
      for (const respuesta of respuestasActuales) {
        const estandar = estandares.find(e => e.id === respuesta.estandarId);
        if (!estandar) continue;
        
        const puntajeMaxEstandar = getPuntajeMaxEstandar(estandar);
        const puntajeObtenido = respuesta.puntajeObtenido || 0;
        
        puntajeTotal += puntajeObtenido;
        puntajeMaximo += puntajeMaxEstandar;
        
        // Agrupar por componente
        const componente = componentes.find(c => c.id === estandar.componenteId);
        if (componente) {
          const key = componente.numero.toString();
          if (!puntajesPorComponente[key]) {
            puntajesPorComponente[key] = { obtenido: 0, maximo: 0 };
          }
          puntajesPorComponente[key].obtenido += puntajeObtenido;
          puntajesPorComponente[key].maximo += puntajeMaxEstandar;
          
          // Agrupar por ciclo PHVA
          const ciclo = componente.cicloPhva;
          if (ciclo && puntajesPorCicloPhva[ciclo]) {
            puntajesPorCicloPhva[ciclo].obtenido += puntajeObtenido;
            puntajesPorCicloPhva[ciclo].maximo += puntajeMaxEstandar;
          }
        }
      }
      
      // Calcular porcentaje (máximo 100%)
      const porcentaje = puntajeMaximo > 0 
        ? Math.min(Math.round((puntajeTotal / puntajeMaximo) * 100), 100)
        : 0;
      
      // Determinar nivel de cumplimiento
      let nivelCumplimiento: 'critico' | 'moderadamente-aceptable' | 'aceptable';
      if (porcentaje < 60) {
        nivelCumplimiento = 'critico';
      } else if (porcentaje < 85) {
        nivelCumplimiento = 'moderadamente-aceptable';
      } else {
        nivelCumplimiento = 'aceptable';
      }
      
      // Actualizar evaluación
      await db.update(schema.evaluacionesSst)
        .set({
          puntajeTotal,
          puntajeMaximo,
          porcentajeCumplimiento: porcentaje,
          nivelCumplimiento,
          puntajesPorComponente: JSON.stringify(puntajesPorComponente),
          puntajesPorCicloPhva: JSON.stringify(puntajesPorCicloPhva)
        })
        .where(eq(schema.evaluacionesSst.id, evaluacion.id));
      
      console.log(`[Migration] ✅ Evaluación ${evaluacion.id.substring(0, 8)}... (${evaluacion.tipoEmpresa}): ${evaluacion.porcentajeCumplimiento ?? 0}% → ${porcentaje}%`);
      corregidas++;
    }
    
    if (corregidas > 0) {
      console.log(`[Migration] ✅ ${corregidas} evaluaciones corregidas, ${respuestasActualizadas} respuestas actualizadas`);
    } else {
      console.log('[Migration] ✅ No hay evaluaciones que corregir');
    }
  } catch (error: any) {
    console.error('[Migration] ⚠️ Error corrigiendo puntajes:', error.message);
  }
}

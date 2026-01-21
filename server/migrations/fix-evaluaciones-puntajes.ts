import { db } from '../db';
import { sql } from 'drizzle-orm';
import * as schema from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function fixEvaluacionesPuntajes() {
  console.log('[Migration] Corrigiendo puntajes de evaluaciones SST (Resolución 0312)...');
  
  try {
    const evaluaciones = await db.select().from(schema.evaluacionesSst);
    let corregidas = 0;
    
    for (const evaluacion of evaluaciones) {
      if (evaluacion.porcentajeCumplimiento && evaluacion.porcentajeCumplimiento > 100) {
        const respuestas = await db.select()
          .from(schema.respuestasEstandares)
          .where(eq(schema.respuestasEstandares.evaluacionId, evaluacion.id));
        
        const estandares = await db.select().from(schema.estandaresSst);
        
        let puntajeMaximoReal = 0;
        let puntajeObtenidoReal = 0;
        
        for (const respuesta of respuestas) {
          const estandar = estandares.find(e => e.id === respuesta.estandarId);
          if (estandar) {
            let puntajeMaxEstandar = 0;
            switch (evaluacion.tipoEmpresa) {
              case 'tipo1':
                puntajeMaxEstandar = estandar.puntajeTipo1 || 0;
                break;
              case 'tipo2':
                puntajeMaxEstandar = estandar.puntajeTipo2 || 0;
                break;
              case 'tipo3':
              case 'tipo4':
                puntajeMaxEstandar = estandar.puntajeTipo3 || 0;
                break;
            }
            puntajeMaximoReal += puntajeMaxEstandar;
            puntajeObtenidoReal += respuesta.puntajeObtenido || 0;
          }
        }
        
        const porcentajeReal = puntajeMaximoReal > 0 
          ? Math.round((puntajeObtenidoReal / puntajeMaximoReal) * 100) 
          : 0;
        
        const porcentajeFinal = Math.min(porcentajeReal, 100);
        
        let nivelCumplimiento: 'critico' | 'moderadamente-aceptable' | 'aceptable';
        if (porcentajeFinal < 60) {
          nivelCumplimiento = 'critico';
        } else if (porcentajeFinal < 85) {
          nivelCumplimiento = 'moderadamente-aceptable';
        } else {
          nivelCumplimiento = 'aceptable';
        }
        
        await db.update(schema.evaluacionesSst)
          .set({
            puntajeTotal: puntajeObtenidoReal,
            puntajeMaximo: puntajeMaximoReal,
            porcentajeCumplimiento: porcentajeFinal,
            nivelCumplimiento
          })
          .where(eq(schema.evaluacionesSst.id, evaluacion.id));
        
        console.log(`[Migration] ✅ Evaluación ${evaluacion.id}: ${evaluacion.porcentajeCumplimiento}% → ${porcentajeFinal}%`);
        corregidas++;
      }
    }
    
    if (corregidas > 0) {
      console.log(`[Migration] ✅ ${corregidas} evaluaciones corregidas`);
    } else {
      console.log('[Migration] ✅ No hay evaluaciones que corregir');
    }
  } catch (error: any) {
    console.error('[Migration] ⚠️ Error corrigiendo puntajes:', error.message);
  }
}

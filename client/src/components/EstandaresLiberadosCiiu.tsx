/**
 * Sistema de Liberación de Estándares por CIIU
 * 
 * Determina y muestra qué estándares de la Resolución 0312/2019 aplican
 * a una empresa según su código CIIU, nivel de riesgo y número de trabajadores.
 * 
 * Referencias normativas:
 * - Resolución 0312 de 2019: Estándares Mínimos del SG-SST
 * - Decreto 1607 de 2002: Clasificación de Actividades Económicas
 * - Decreto 1072 de 2015: Decreto Único del Sector Trabajo
 * 
 * Principio: Solo agregar código - Este componente es independiente y no modifica
 * ningún archivo existente del sistema.
 * 
 * @author SST Colombia
 * @version 1.0.0
 * @date 2026-01
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  CheckCircle2, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  Building2, 
  Users, 
  Shield,
  FileText,
  Info
} from "lucide-react";
import { useMemo } from "react";
import { peligrosPorCIIU } from "@/data/peligros-por-ciiu";

export type RiskLevel = "I" | "II" | "III" | "IV" | "V";
export type Chapter = "1" | "2" | "3";

/**
 * Obtiene el nivel de riesgo desde el código CIIU usando el mapeo de peligros
 * Si no encuentra el CIIU, retorna null para indicar que se debe usar el riesgo manual
 */
export function getRiskLevelFromCiiu(ciiuCode: string | null | undefined): RiskLevel | null {
  if (!ciiuCode) return null;
  
  const ciiuData = peligrosPorCIIU.find(p => p.codigoCIIU === ciiuCode);
  if (!ciiuData) return null;
  
  return ciiuData.nivelRiesgo;
}

export interface EstandarInfo {
  id: string;
  numero: string;
  nombre: string;
  cicloPhva: "PLANEAR" | "HACER" | "VERIFICAR" | "ACTUAR";
  peso: number;
  capitulos: Chapter[];
  obligatorio: boolean;
}

export interface EstandaresLiberadosResult {
  chapter: Chapter;
  chapterLabel: string;
  totalEstandares: number;
  estandaresLiberados: number;
  estandaresBloqueados: number;
  porcentajeAcceso: number;
  mensaje: string;
  requiereUpgrade: boolean;
  estandaresAplicables: string[];
}

/**
 * Catálogo completo de los 61 estándares según Resolución 0312/2019
 * con mapeo a los capítulos aplicables (1, 2, 3)
 */
const CATALOGO_ESTANDARES: EstandarInfo[] = [
  // CICLO PLANEAR (25 estándares)
  { id: "1.1.1", numero: "1.1.1", nombre: "Responsable del SG-SST", cicloPhva: "PLANEAR", peso: 0.5, capitulos: ["1", "2", "3"], obligatorio: true },
  { id: "1.1.2", numero: "1.1.2", nombre: "Responsabilidades en SST", cicloPhva: "PLANEAR", peso: 0.5, capitulos: ["2", "3"], obligatorio: true },
  { id: "1.1.3", numero: "1.1.3", nombre: "Asignación de recursos", cicloPhva: "PLANEAR", peso: 0.5, capitulos: ["2", "3"], obligatorio: true },
  { id: "1.1.4", numero: "1.1.4", nombre: "Afiliación al SGSS", cicloPhva: "PLANEAR", peso: 0.5, capitulos: ["1", "2", "3"], obligatorio: true },
  { id: "1.1.5", numero: "1.1.5", nombre: "Pago pensiones y salud", cicloPhva: "PLANEAR", peso: 0.5, capitulos: ["2", "3"], obligatorio: true },
  { id: "1.1.6", numero: "1.1.6", nombre: "Conformación COPASST", cicloPhva: "PLANEAR", peso: 0.5, capitulos: ["2", "3"], obligatorio: true },
  { id: "1.1.7", numero: "1.1.7", nombre: "Capacitación COPASST", cicloPhva: "PLANEAR", peso: 0.5, capitulos: ["2", "3"], obligatorio: true },
  { id: "1.1.8", numero: "1.1.8", nombre: "Conformación Comité Convivencia", cicloPhva: "PLANEAR", peso: 0.5, capitulos: ["2", "3"], obligatorio: true },
  { id: "1.2.1", numero: "1.2.1", nombre: "Programa capacitación", cicloPhva: "PLANEAR", peso: 2, capitulos: ["2", "3"], obligatorio: true },
  { id: "1.2.2", numero: "1.2.2", nombre: "Capacitación en SST", cicloPhva: "PLANEAR", peso: 2, capitulos: ["1", "2", "3"], obligatorio: true },
  { id: "1.2.3", numero: "1.2.3", nombre: "Inducción y reinducción", cicloPhva: "PLANEAR", peso: 2, capitulos: ["2", "3"], obligatorio: true },
  { id: "2.1.1", numero: "2.1.1", nombre: "Política de SST", cicloPhva: "PLANEAR", peso: 1, capitulos: ["2", "3"], obligatorio: true },
  { id: "2.2.1", numero: "2.2.1", nombre: "Objetivos del SG-SST", cicloPhva: "PLANEAR", peso: 1, capitulos: ["2", "3"], obligatorio: true },
  { id: "2.3.1", numero: "2.3.1", nombre: "Evaluación inicial del SG-SST", cicloPhva: "PLANEAR", peso: 1, capitulos: ["2", "3"], obligatorio: true },
  { id: "2.4.1", numero: "2.4.1", nombre: "Plan anual de trabajo", cicloPhva: "PLANEAR", peso: 2, capitulos: ["1", "2", "3"], obligatorio: true },
  { id: "2.5.1", numero: "2.5.1", nombre: "Archivo y retención documental", cicloPhva: "PLANEAR", peso: 2, capitulos: ["2", "3"], obligatorio: true },
  { id: "2.6.1", numero: "2.6.1", nombre: "Rendición de cuentas", cicloPhva: "PLANEAR", peso: 1, capitulos: ["2", "3"], obligatorio: true },
  { id: "2.7.1", numero: "2.7.1", nombre: "Matriz legal", cicloPhva: "PLANEAR", peso: 2, capitulos: ["2", "3"], obligatorio: true },
  { id: "2.8.1", numero: "2.8.1", nombre: "Mecanismos de comunicación", cicloPhva: "PLANEAR", peso: 1, capitulos: ["2", "3"], obligatorio: true },
  { id: "2.9.1", numero: "2.9.1", nombre: "Identificación y evaluación de adquisiciones", cicloPhva: "PLANEAR", peso: 1, capitulos: ["2", "3"], obligatorio: true },
  { id: "2.10.1", numero: "2.10.1", nombre: "Evaluación de contratistas", cicloPhva: "PLANEAR", peso: 2, capitulos: ["2", "3"], obligatorio: true },
  { id: "2.11.1", numero: "2.11.1", nombre: "Gestión del cambio", cicloPhva: "PLANEAR", peso: 1, capitulos: ["2", "3"], obligatorio: true },
  
  // CICLO HACER (30 estándares)
  { id: "3.1.1", numero: "3.1.1", nombre: "Evaluaciones médicas ocupacionales", cicloPhva: "HACER", peso: 1, capitulos: ["1", "2", "3"], obligatorio: true },
  { id: "3.1.2", numero: "3.1.2", nombre: "Actividades de prevención y promoción", cicloPhva: "HACER", peso: 1, capitulos: ["2", "3"], obligatorio: true },
  { id: "3.1.3", numero: "3.1.3", nombre: "Información al médico", cicloPhva: "HACER", peso: 1, capitulos: ["2", "3"], obligatorio: true },
  { id: "3.1.4", numero: "3.1.4", nombre: "Restricciones y recomendaciones", cicloPhva: "HACER", peso: 1, capitulos: ["2", "3"], obligatorio: true },
  { id: "3.1.5", numero: "3.1.5", nombre: "Custodia de historias clínicas", cicloPhva: "HACER", peso: 1, capitulos: ["2", "3"], obligatorio: true },
  { id: "3.1.6", numero: "3.1.6", nombre: "Perfiles de cargo", cicloPhva: "HACER", peso: 1, capitulos: ["2", "3"], obligatorio: true },
  { id: "3.1.7", numero: "3.1.7", nombre: "Seguimiento de indicadores", cicloPhva: "HACER", peso: 1, capitulos: ["2", "3"], obligatorio: true },
  { id: "3.1.8", numero: "3.1.8", nombre: "Agua potable, servicios sanitarios", cicloPhva: "HACER", peso: 1, capitulos: ["2", "3"], obligatorio: true },
  { id: "3.1.9", numero: "3.1.9", nombre: "Manejo de residuos", cicloPhva: "HACER", peso: 1, capitulos: ["2", "3"], obligatorio: true },
  { id: "3.2.1", numero: "3.2.1", nombre: "Reporte de accidentes", cicloPhva: "HACER", peso: 2, capitulos: ["1", "2", "3"], obligatorio: true },
  { id: "3.2.2", numero: "3.2.2", nombre: "Investigación de accidentes", cicloPhva: "HACER", peso: 2, capitulos: ["2", "3"], obligatorio: true },
  { id: "3.2.3", numero: "3.2.3", nombre: "Registro estadístico de AT y EL", cicloPhva: "HACER", peso: 1, capitulos: ["2", "3"], obligatorio: true },
  { id: "3.3.1", numero: "3.3.1", nombre: "Medición de frecuencia de AT", cicloPhva: "HACER", peso: 1, capitulos: ["2", "3"], obligatorio: true },
  { id: "3.3.2", numero: "3.3.2", nombre: "Medición de severidad de AT", cicloPhva: "HACER", peso: 1, capitulos: ["2", "3"], obligatorio: true },
  { id: "3.3.3", numero: "3.3.3", nombre: "Medición de mortalidad por AT", cicloPhva: "HACER", peso: 1, capitulos: ["2", "3"], obligatorio: true },
  { id: "3.3.4", numero: "3.3.4", nombre: "Medición de prevalencia de EL", cicloPhva: "HACER", peso: 1, capitulos: ["2", "3"], obligatorio: true },
  { id: "3.3.5", numero: "3.3.5", nombre: "Medición de incidencia de EL", cicloPhva: "HACER", peso: 1, capitulos: ["2", "3"], obligatorio: true },
  { id: "3.3.6", numero: "3.3.6", nombre: "Medición de ausentismo", cicloPhva: "HACER", peso: 1, capitulos: ["2", "3"], obligatorio: true },
  { id: "4.1.1", numero: "4.1.1", nombre: "Metodología identificación de peligros", cicloPhva: "HACER", peso: 4, capitulos: ["2", "3"], obligatorio: true },
  { id: "4.1.2", numero: "4.1.2", nombre: "Identificación de peligros", cicloPhva: "HACER", peso: 4, capitulos: ["1", "2", "3"], obligatorio: true },
  { id: "4.1.3", numero: "4.1.3", nombre: "Evaluación y valoración de riesgos", cicloPhva: "HACER", peso: 3, capitulos: ["2", "3"], obligatorio: true },
  { id: "4.1.4", numero: "4.1.4", nombre: "Medidas de prevención y control", cicloPhva: "HACER", peso: 2.5, capitulos: ["2", "3"], obligatorio: true },
  { id: "4.2.1", numero: "4.2.1", nombre: "Medidas de prevención implementadas", cicloPhva: "HACER", peso: 2.5, capitulos: ["2", "3"], obligatorio: true },
  { id: "4.2.2", numero: "4.2.2", nombre: "Verificación procedimientos seguros", cicloPhva: "HACER", peso: 2.5, capitulos: ["2", "3"], obligatorio: true },
  { id: "4.2.3", numero: "4.2.3", nombre: "Inspecciones a instalaciones", cicloPhva: "HACER", peso: 2.5, capitulos: ["2", "3"], obligatorio: true },
  { id: "4.2.4", numero: "4.2.4", nombre: "Mantenimiento de instalaciones", cicloPhva: "HACER", peso: 2.5, capitulos: ["2", "3"], obligatorio: true },
  { id: "4.2.5", numero: "4.2.5", nombre: "Entrega de EPP", cicloPhva: "HACER", peso: 2.5, capitulos: ["2", "3"], obligatorio: true },
  { id: "4.2.6", numero: "4.2.6", nombre: "Plan de prevención y respuesta", cicloPhva: "HACER", peso: 5, capitulos: ["2", "3"], obligatorio: true },
  { id: "4.2.7", numero: "4.2.7", nombre: "Brigada de emergencias", cicloPhva: "HACER", peso: 5, capitulos: ["2", "3"], obligatorio: true },
  
  // CICLO VERIFICAR (5 estándares)
  { id: "5.1.1", numero: "5.1.1", nombre: "Indicadores de estructura", cicloPhva: "VERIFICAR", peso: 1.25, capitulos: ["2", "3"], obligatorio: true },
  { id: "5.1.2", numero: "5.1.2", nombre: "Indicadores de proceso", cicloPhva: "VERIFICAR", peso: 1.25, capitulos: ["2", "3"], obligatorio: true },
  { id: "5.1.3", numero: "5.1.3", nombre: "Indicadores de resultado", cicloPhva: "VERIFICAR", peso: 1.25, capitulos: ["2", "3"], obligatorio: true },
  { id: "5.1.4", numero: "5.1.4", nombre: "Auditoría anual", cicloPhva: "VERIFICAR", peso: 5, capitulos: ["2", "3"], obligatorio: true },
  { id: "5.1.5", numero: "5.1.5", nombre: "Revisión por la dirección", cicloPhva: "VERIFICAR", peso: 1.25, capitulos: ["2", "3"], obligatorio: true },
  
  // CICLO ACTUAR (1 estándar pero representa el 10%)
  { id: "6.1.1", numero: "6.1.1", nombre: "Acciones preventivas y correctivas", cicloPhva: "ACTUAR", peso: 2.5, capitulos: ["2", "3"], obligatorio: true },
  { id: "6.1.2", numero: "6.1.2", nombre: "Acciones de mejora", cicloPhva: "ACTUAR", peso: 2.5, capitulos: ["2", "3"], obligatorio: true },
  { id: "6.1.3", numero: "6.1.3", nombre: "Plan de mejoramiento", cicloPhva: "ACTUAR", peso: 2.5, capitulos: ["2", "3"], obligatorio: true },
  { id: "6.1.4", numero: "6.1.4", nombre: "Implementación de medidas", cicloPhva: "ACTUAR", peso: 2.5, capitulos: ["2", "3"], obligatorio: true },
];

/**
 * Los 7 estándares del Capítulo 1 (Microempresas) según Resolución 0312/2019
 * Referencia para validación - el catálogo principal ya los tiene mapeados
 */
const ESTANDARES_CAPITULO_1 = ["1.1.1", "1.1.4", "1.2.2", "2.4.1", "3.1.1", "3.2.1", "4.1.2"];

/**
 * Calcula el capítulo aplicable según Resolución 0312/2019
 */
export function calcularCapituloAplicable(
  trabajadores: number,
  nivelRiesgo: RiskLevel
): Chapter {
  const riesgoAlto = nivelRiesgo === "IV" || nivelRiesgo === "V";
  
  if (trabajadores > 50 || riesgoAlto) {
    return "3";
  }
  
  if (trabajadores >= 11 && trabajadores <= 50) {
    return "2";
  }
  
  return "1";
}

/**
 * Obtiene la etiqueta del capítulo
 */
function getChapterLabel(chapter: Chapter): string {
  const labels = {
    "1": "Microempresa (1-10 trabajadores, Riesgo I/II/III)",
    "2": "Pequeña Empresa (11-50 trabajadores, Riesgo I/II/III)",
    "3": "Mediana/Grande o Riesgo Alto (>50 trabajadores o Riesgo IV/V)",
  };
  return labels[chapter];
}

/**
 * Obtiene los estándares liberados según el capítulo
 */
export function getEstandaresLiberados(chapter: Chapter): EstandarInfo[] {
  return CATALOGO_ESTANDARES.filter(e => e.capitulos.includes(chapter));
}

/**
 * Calcula el resultado completo de liberación de estándares
 * 
 * Si se proporciona ciiuCode y no nivelRiesgo, intenta obtener el riesgo desde el CIIU.
 * Prioridad: nivelRiesgo manual > riesgo derivado de CIIU > default "I"
 */
export function calcularEstandaresLiberados(
  trabajadores: number,
  nivelRiesgoManual: RiskLevel | null | undefined,
  ciiuCode?: string | null
): EstandaresLiberadosResult {
  // Determinar nivel de riesgo: prioridad al manual, luego CIIU, luego default
  let nivelRiesgo: RiskLevel;
  let riesgoSource: 'manual' | 'ciiu' | 'default' = 'default';
  
  if (nivelRiesgoManual) {
    nivelRiesgo = nivelRiesgoManual;
    riesgoSource = 'manual';
  } else if (ciiuCode) {
    const riesgoCiiu = getRiskLevelFromCiiu(ciiuCode);
    if (riesgoCiiu) {
      nivelRiesgo = riesgoCiiu;
      riesgoSource = 'ciiu';
    } else {
      nivelRiesgo = "I";
    }
  } else {
    nivelRiesgo = "I";
  }
  
  const chapter = calcularCapituloAplicable(trabajadores, nivelRiesgo);
  const estandaresAplicables = getEstandaresLiberados(chapter);
  const totalSistema = CATALOGO_ESTANDARES.length;
  
  const sourceMsg = riesgoSource === 'ciiu' 
    ? ` (Riesgo ${nivelRiesgo} determinado automáticamente desde CIIU ${ciiuCode})`
    : riesgoSource === 'manual' 
      ? ` (Riesgo ${nivelRiesgo} asignado manualmente)`
      : ' (Riesgo I por defecto)';
  
  return {
    chapter,
    chapterLabel: getChapterLabel(chapter),
    totalEstandares: totalSistema,
    estandaresLiberados: estandaresAplicables.length,
    estandaresBloqueados: totalSistema - estandaresAplicables.length,
    porcentajeAcceso: Math.round((estandaresAplicables.length / totalSistema) * 100),
    mensaje: `Según Resolución 0312/2019, su empresa aplica ${estandaresAplicables.length} estándares mínimos obligatorios.${sourceMsg}`,
    requiereUpgrade: chapter === "1",
    estandaresAplicables: estandaresAplicables.map(e => e.numero),
  };
}

export interface EstandaresLiberadosCiiuProps {
  /** Número de trabajadores de la empresa */
  trabajadores: number;
  /** Nivel de riesgo manual (opcional - si no se proporciona, se deriva del CIIU) */
  nivelRiesgo?: RiskLevel | null;
  /** Código CIIU de la empresa (se usa para derivar el riesgo si no hay riesgo manual) */
  ciiuCode?: string | null;
  companyName?: string;
  showDetails?: boolean;
}

/**
 * Componente que muestra los estándares liberados según CIIU y suscripción
 * 
 * La lógica de prioridad para determinar el nivel de riesgo es:
 * 1. nivelRiesgo manual (si se proporciona)
 * 2. Riesgo derivado del CIIU (si hay código CIIU válido)
 * 3. Riesgo "I" por defecto
 */
export function EstandaresLiberadosCiiu({
  trabajadores,
  nivelRiesgo,
  ciiuCode,
  companyName = "Empresa",
  showDetails = true,
}: EstandaresLiberadosCiiuProps) {
  const result = useMemo(
    () => calcularEstandaresLiberados(trabajadores, nivelRiesgo, ciiuCode),
    [trabajadores, nivelRiesgo, ciiuCode]
  );
  
  // Calcular el nivel de riesgo efectivo (para mostrar en la UI)
  const riesgoEfectivo = useMemo((): RiskLevel => {
    if (nivelRiesgo) return nivelRiesgo;
    if (ciiuCode) {
      const riesgoCiiu = getRiskLevelFromCiiu(ciiuCode);
      if (riesgoCiiu) return riesgoCiiu;
    }
    return "I";
  }, [nivelRiesgo, ciiuCode]);
  
  const estandaresPorCiclo = useMemo(() => {
    const estandaresActivos = getEstandaresLiberados(result.chapter);
    return {
      PLANEAR: estandaresActivos.filter(e => e.cicloPhva === "PLANEAR"),
      HACER: estandaresActivos.filter(e => e.cicloPhva === "HACER"),
      VERIFICAR: estandaresActivos.filter(e => e.cicloPhva === "VERIFICAR"),
      ACTUAR: estandaresActivos.filter(e => e.cicloPhva === "ACTUAR"),
    };
  }, [result.chapter]);

  const getRiskBadgeColor = (risk: RiskLevel) => {
    const colors = {
      "I": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "II": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "III": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      "IV": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      "V": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[risk];
  };

  return (
    <Card data-testid="card-estandares-liberados">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Estándares Aplicables</CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1" data-testid="badge-trabajadores">
              <Users className="h-3 w-3" />
              {trabajadores} trabajadores
            </Badge>
            <Badge className={getRiskBadgeColor(riesgoEfectivo)} data-testid="badge-riesgo">
              Riesgo {riesgoEfectivo}
            </Badge>
            {ciiuCode && (
              <Badge variant="outline" data-testid="badge-ciiu">
                CIIU {ciiuCode}
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>{result.chapterLabel}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Estándares liberados</span>
          <span className="text-2xl font-bold text-primary" data-testid="text-estandares-count">
            {result.estandaresLiberados} / {result.totalEstandares}
          </span>
        </div>
        
        <Progress value={result.porcentajeAcceso} className="h-2" />
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Unlock className="h-4 w-4 text-green-500" />
            <span>{result.estandaresLiberados} estándares activos</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span>{result.estandaresBloqueados} no aplican</span>
          </div>
        </div>

        {result.requiereUpgrade && (
          <Alert data-testid="alert-upgrade">
            <Info className="h-4 w-4" />
            <AlertTitle>Capítulo 1 - Estándares Básicos</AlertTitle>
            <AlertDescription>
              Las microempresas (1-10 trabajadores, Riesgo I/II/III) solo requieren 
              cumplir 7 estándares básicos según la Resolución 0312/2019.
            </AlertDescription>
          </Alert>
        )}

        {showDetails && (
          <div className="pt-4 border-t space-y-4">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Distribución por Ciclo PHVA
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(["PLANEAR", "HACER", "VERIFICAR", "ACTUAR"] as const).map(ciclo => (
                <Card key={ciclo} className="p-3">
                  <div className="text-xs font-medium text-muted-foreground mb-1">{ciclo}</div>
                  <div className="text-xl font-bold" data-testid={`count-${ciclo.toLowerCase()}`}>
                    {estandaresPorCiclo[ciclo].length}
                  </div>
                  <div className="text-xs text-muted-foreground">estándares</div>
                </Card>
              ))}
            </div>

            <div className="space-y-2">
              <h5 className="text-sm font-medium">Estándares aplicables:</h5>
              <div className="flex flex-wrap gap-1">
                {result.estandaresAplicables.slice(0, 15).map(numero => (
                  <Badge key={numero} variant="secondary" className="text-xs">
                    {numero}
                  </Badge>
                ))}
                {result.estandaresAplicables.length > 15 && (
                  <Badge variant="outline" className="text-xs">
                    +{result.estandaresAplicables.length - 15} más
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default EstandaresLiberadosCiiu;

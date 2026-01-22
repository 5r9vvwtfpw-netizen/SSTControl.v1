/**
 * Integración de CIIU para IPERC y Estándares
 * 
 * Este componente actúa como wrapper de integración que combina:
 * - IpercCiiuFilter: Filtro de peligros por CIIU
 * - EstandaresLiberadosCiiu: Panel de estándares liberados
 * 
 * Proporciona una interfaz unificada que usa el CIIU como fuente primaria
 * para determinar el nivel de riesgo y los estándares aplicables.
 * 
 * Principio: Solo agregar código - Este archivo puede importarse donde se necesite
 * sin modificar componentes existentes.
 * 
 * @author SST Colombia
 * @version 1.0.0
 * @date 2026-01
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Building2, AlertTriangle, CheckCircle2, FileText, Shield } from "lucide-react";
import { useMemo } from "react";

import { IpercCiiuFilter, getCiiuPeligrosData } from "./IpercCiiuFilter";
import { 
  EstandaresLiberadosCiiu, 
  getRiskLevelFromCiiu as getRiskFromPeligros,
  calcularEstandaresLiberados,
  calcularCapituloAplicable,
  getEstandaresLiberados,
  type RiskLevel,
  type Chapter
} from "./EstandaresLiberadosCiiu";
import { PeligroEspecificoSector } from "@/data/peligros-por-ciiu";
import { getCiiuRiskClassification, MARCO_LEGAL_CLASIFICACION_RIESGOS } from "@shared/ciiu-unified-classification";

/**
 * Obtiene el nivel de riesgo usando clasificación unificada (Decreto 768/2022 + 1607/2002)
 * Prioriza peligrosPorCIIU para mantener compatibilidad, luego usa clasificación oficial
 */
export function getRiskLevelFromCiiu(ciiuCode: string | null | undefined): RiskLevel | null {
  if (!ciiuCode) return null;
  
  const riesgoPeligros = getRiskFromPeligros(ciiuCode);
  if (riesgoPeligros) return riesgoPeligros;
  
  const clasificacion = getCiiuRiskClassification(ciiuCode);
  if (clasificacion.found) {
    return clasificacion.riskLevel;
  }
  
  return null;
}

export { MARCO_LEGAL_CLASIFICACION_RIESGOS };

export interface CompanyContext {
  /** Código CIIU de la empresa (4 dígitos) */
  ciiuCode: string | null;
  /** Número de trabajadores */
  trabajadores: number;
  /** Nivel de riesgo manual (opcional - se deriva del CIIU si no se proporciona) */
  nivelRiesgoManual?: RiskLevel | null;
  /** Nombre de la empresa */
  companyName?: string;
}

export interface IpercIntegracionResult {
  /** Si el CIIU fue encontrado en el mapeo */
  ciiuEncontrado: boolean;
  /** Nivel de riesgo efectivo (derivado de CIIU o manual) */
  nivelRiesgo: RiskLevel;
  /** Fuente del nivel de riesgo */
  riesgoSource: 'ciiu' | 'manual' | 'default';
  /** Capítulo aplicable (1, 2, 3) */
  chapter: Chapter;
  /** Número de estándares aplicables */
  estandaresCount: number;
  /** Número de peligros específicos del sector */
  peligrosEspecificosCount: number;
  /** Mensaje informativo */
  mensaje: string;
}

/**
 * Calcula el contexto completo de IPERC y estándares basado en CIIU
 * 
 * Esta función es la fuente de verdad para la integración CIIU→Riesgo→Capítulo→Estándares
 */
export function calcularContextoIperc(context: CompanyContext): IpercIntegracionResult {
  const { ciiuCode, trabajadores, nivelRiesgoManual } = context;
  
  // 1. Determinar nivel de riesgo
  let nivelRiesgo: RiskLevel;
  let riesgoSource: 'ciiu' | 'manual' | 'default';
  
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
      riesgoSource = 'default';
    }
  } else {
    nivelRiesgo = "I";
    riesgoSource = 'default';
  }
  
  // 2. Calcular capítulo y estándares
  const chapter = calcularCapituloAplicable(trabajadores, nivelRiesgo);
  const estandares = getEstandaresLiberados(chapter);
  
  // 3. Obtener peligros del CIIU
  const ciiuData = getCiiuPeligrosData(ciiuCode);
  
  // 4. Generar mensaje
  let mensaje = "";
  if (riesgoSource === 'ciiu') {
    mensaje = `CIIU ${ciiuCode} → Riesgo ${nivelRiesgo} → ${estandares.length} estándares obligatorios`;
  } else if (riesgoSource === 'manual') {
    mensaje = `Riesgo ${nivelRiesgo} (manual) → ${estandares.length} estándares obligatorios`;
  } else {
    mensaje = `Sin CIIU válido → Riesgo ${nivelRiesgo} por defecto → ${estandares.length} estándares`;
  }
  
  return {
    ciiuEncontrado: ciiuData.found,
    nivelRiesgo,
    riesgoSource,
    chapter,
    estandaresCount: estandares.length,
    peligrosEspecificosCount: ciiuData.peligrosEspecificos.length,
    mensaje,
  };
}

export interface IpercIntegracionCiiuProps {
  /** Contexto de la empresa */
  company: CompanyContext;
  /** Callback cuando se selecciona un peligro para agregar a la matriz */
  onSelectPeligro?: (peligro: PeligroEspecificoSector) => void;
  /** Mostrar solo el panel de estándares (sin peligros) */
  soloEstandares?: boolean;
  /** Mostrar solo el panel de peligros (sin estándares) */
  soloPeligros?: boolean;
}

/**
 * Componente integrador que muestra tanto los peligros por CIIU como los estándares aplicables
 * 
 * Uso típico:
 * ```tsx
 * <IpercIntegracionCiiu
 *   company={{ 
 *     ciiuCode: empresa.ciiuCode, 
 *     trabajadores: empresa.trabajadores 
 *   }}
 *   onSelectPeligro={(peligro) => agregarPeligroAMatriz(peligro)}
 * />
 * ```
 */
export function IpercIntegracionCiiu({
  company,
  onSelectPeligro,
  soloEstandares = false,
  soloPeligros = false,
}: IpercIntegracionCiiuProps) {
  const contexto = useMemo(() => calcularContextoIperc(company), [company]);
  
  // Si solo se quiere un panel, renderizar directamente
  if (soloEstandares) {
    return (
      <EstandaresLiberadosCiiu
        trabajadores={company.trabajadores}
        nivelRiesgo={company.nivelRiesgoManual}
        ciiuCode={company.ciiuCode}
        companyName={company.companyName}
      />
    );
  }
  
  if (soloPeligros) {
    return (
      <IpercCiiuFilter
        ciiuCode={company.ciiuCode}
        companyName={company.companyName}
        riskLevel={contexto.nivelRiesgo}
        onSelectPeligro={onSelectPeligro}
      />
    );
  }
  
  // Panel completo con tabs
  return (
    <div className="space-y-4" data-testid="iperc-integracion-ciiu">
      {/* Resumen del contexto */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                {company.companyName || "Contexto de la Empresa"}
              </CardTitle>
            </div>
            <div className="flex gap-2 flex-wrap">
              {company.ciiuCode && (
                <Badge variant="outline" data-testid="badge-ciiu-context">
                  CIIU {company.ciiuCode}
                </Badge>
              )}
              <Badge 
                variant={contexto.riesgoSource === 'ciiu' ? "default" : "secondary"}
                data-testid="badge-riesgo-context"
              >
                Riesgo {contexto.nivelRiesgo}
                {contexto.riesgoSource === 'ciiu' && " (CIIU)"}
                {contexto.riesgoSource === 'manual' && " (Manual)"}
              </Badge>
              <Badge variant="outline" data-testid="badge-chapter-context">
                Capítulo {contexto.chapter}
              </Badge>
            </div>
          </div>
          <CardDescription>{contexto.mensaje}</CardDescription>
        </CardHeader>
      </Card>

      {!company.ciiuCode && (
        <Alert data-testid="alert-sin-ciiu">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Sin código CIIU</AlertTitle>
          <AlertDescription>
            Registre el código CIIU de la empresa para obtener peligros específicos del sector 
            y calcular automáticamente el nivel de riesgo según el Decreto 1607/2002.
          </AlertDescription>
        </Alert>
      )}

      {contexto.ciiuEncontrado && (
        <Alert variant="default" className="border-green-200 bg-green-50 dark:bg-green-950" data-testid="alert-ciiu-encontrado">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800 dark:text-green-200">CIIU identificado</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">
            Se encontraron {contexto.peligrosEspecificosCount} peligros específicos para su sector económico.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs con contenido */}
      <Tabs defaultValue="estandares" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="estandares" className="flex items-center gap-2" data-testid="tab-estandares">
            <Shield className="h-4 w-4" />
            Estándares ({contexto.estandaresCount})
          </TabsTrigger>
          <TabsTrigger value="peligros" className="flex items-center gap-2" data-testid="tab-peligros">
            <FileText className="h-4 w-4" />
            Peligros ({contexto.peligrosEspecificosCount})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="estandares" className="mt-4">
          <EstandaresLiberadosCiiu
            trabajadores={company.trabajadores}
            nivelRiesgo={company.nivelRiesgoManual}
            ciiuCode={company.ciiuCode}
            companyName={company.companyName}
          />
        </TabsContent>
        
        <TabsContent value="peligros" className="mt-4">
          <IpercCiiuFilter
            ciiuCode={company.ciiuCode}
            companyName={company.companyName}
            riskLevel={contexto.nivelRiesgo}
            onSelectPeligro={onSelectPeligro}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Re-exportar utilidades para uso externo
export { 
  calcularCapituloAplicable,
  getEstandaresLiberados,
  getCiiuPeligrosData,
};

export default IpercIntegracionCiiu;

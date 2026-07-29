/**
 * Filtro IPERC por CIIU - Componente de filtrado inteligente
 * 
 * Filtra y sugiere peligros específicos basados en el código CIIU de la empresa
 * siguiendo la metodología GTC-45:2012 y el Decreto 1607/2002.
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
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Building2, Filter, Shield, Sparkles, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { peligrosPorCIIU, PeligroPorCIIU, PeligroEspecificoSector } from "@/data/peligros-por-ciiu";

export interface IpercCiiuFilterProps {
  ciiuCode?: string | null;
  companyName?: string;
  riskLevel?: "I" | "II" | "III" | "IV" | "V" | null;
  onSelectPeligro?: (peligro: PeligroEspecificoSector) => void;
}

export interface CiiuFilterResult {
  found: boolean;
  ciiuData: PeligroPorCIIU | null;
  peligrosPrioritarios: string[];
  peligrosEspecificos: PeligroEspecificoSector[];
  normativaEspecifica: { codigo: string; norma: string; descripcion: string; obligatorio: boolean }[];
  eppRecomendado: string[];
  capacitacionesObligatorias: string[];
}

/**
 * Obtiene los datos de peligros para uno o varios códigos CIIU.
 * Cuando se pasan múltiples códigos hace un merge sin duplicados
 * (backward-compatible: acepta string o string[]).
 */
export function getCiiuPeligrosData(
  ciiuCode: string | string[] | null | undefined
): CiiuFilterResult {
  const codes = (Array.isArray(ciiuCode) ? ciiuCode : [ciiuCode]).filter(Boolean) as string[];

  if (codes.length === 0) {
    return {
      found: false,
      ciiuData: null,
      peligrosPrioritarios: [],
      peligrosEspecificos: [],
      normativaEspecifica: [],
      eppRecomendado: [],
      capacitacionesObligatorias: [],
    };
  }

  const matches = codes
    .map(c => peligrosPorCIIU.find(p => p.codigoCIIU === c))
    .filter(Boolean) as PeligroPorCIIU[];

  if (matches.length === 0) {
    return {
      found: false,
      ciiuData: null,
      peligrosPrioritarios: [],
      peligrosEspecificos: [],
      normativaEspecifica: [],
      eppRecomendado: [],
      capacitacionesObligatorias: [],
    };
  }

  // Merge: unión sin duplicados usando el código/texto como clave
  const peligrosEspecificos = Array.from(
    new Map(matches.flatMap(m => m.peligrosEspecificos).map(p => [p.codigo, p])).values()
  );
  const peligrosPrioritarios = Array.from(new Set(matches.flatMap(m => m.peligrosPrioritarios)));
  const normativaEspecifica = Array.from(
    new Map(matches.flatMap(m => m.normativaEspecifica).map(n => [n.codigo, n])).values()
  );
  const eppRecomendado = Array.from(new Set(matches.flatMap(m => m.eppRecomendado)));
  const capacitacionesObligatorias = Array.from(new Set(matches.flatMap(m => m.capacitacionesObligatorias)));

  return {
    found: true,
    ciiuData: matches[0], // principal para compatibilidad
    peligrosPrioritarios,
    peligrosEspecificos,
    normativaEspecifica,
    eppRecomendado,
    capacitacionesObligatorias,
  };
}

/**
 * Obtiene el color del badge según la clasificación del peligro
 */
function getClasificacionColor(clasificacion: string): string {
  const colors: Record<string, string> = {
    biologico: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    fisico: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    quimico: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    psicosocial: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    biomecanico: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    condiciones_seguridad: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    fenomenos_naturales: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  };
  return colors[clasificacion] || "bg-gray-100 text-gray-800";
}

/**
 * Obtiene la etiqueta legible de la clasificación
 */
function getClasificacionLabel(clasificacion: string): string {
  const labels: Record<string, string> = {
    biologico: "Biológico",
    fisico: "Físico",
    quimico: "Químico",
    psicosocial: "Psicosocial",
    biomecanico: "Biomecánico",
    condiciones_seguridad: "Cond. Seguridad",
    fenomenos_naturales: "Fenómenos Naturales",
  };
  return labels[clasificacion] || clasificacion;
}

/**
 * Componente de filtro IPERC por CIIU
 * 
 * Muestra peligros específicos del sector económico de la empresa
 * basado en su código CIIU, facilitando la identificación de riesgos
 * prioritarios según la actividad económica.
 */
export function IpercCiiuFilter({ 
  ciiuCode, 
  companyName = "Empresa",
  riskLevel,
  onSelectPeligro 
}: IpercCiiuFilterProps) {
  const [selectedClasificacion, setSelectedClasificacion] = useState<string>("todos");
  
  const filterResult = useMemo(() => getCiiuPeligrosData(ciiuCode), [ciiuCode]);
  
  const filteredPeligros = useMemo(() => {
    if (!filterResult.found || !filterResult.peligrosEspecificos) return [];
    
    if (selectedClasificacion === "todos") {
      return filterResult.peligrosEspecificos;
    }
    
    return filterResult.peligrosEspecificos.filter(
      p => p.clasificacion === selectedClasificacion
    );
  }, [filterResult, selectedClasificacion]);
  
  const clasificaciones = useMemo(() => {
    if (!filterResult.peligrosEspecificos) return [];
    const unique = Array.from(new Set(filterResult.peligrosEspecificos.map(p => p.clasificacion)));
    return unique;
  }, [filterResult.peligrosEspecificos]);

  if (!ciiuCode) {
    return (
      <Alert data-testid="alert-no-ciiu">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Sin código CIIU</AlertTitle>
        <AlertDescription>
          La empresa no tiene un código CIIU registrado. Registre el código CIIU 
          en el perfil de la empresa para obtener sugerencias de peligros específicos 
          del sector económico.
        </AlertDescription>
      </Alert>
    );
  }

  if (!filterResult.found) {
    return (
      <Alert data-testid="alert-ciiu-not-found">
        <Building2 className="h-4 w-4" />
        <AlertTitle>CIIU {ciiuCode} sin mapeo específico</AlertTitle>
        <AlertDescription>
          El código CIIU {ciiuCode} no tiene peligros específicos predefinidos en el sistema.
          Utilice el selector general de peligros GTC-45 para identificar los riesgos aplicables.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card data-testid="card-iperc-ciiu-filter">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Peligros por Sector Económico</CardTitle>
          </div>
          <Badge variant="outline" data-testid="badge-ciiu-code">
            CIIU {ciiuCode} - Riesgo {riskLevel || "N/A"}
          </Badge>
        </div>
        <CardDescription>
          {filterResult.ciiuData?.descripcionCIIU} • Sector: {filterResult.ciiuData?.sector}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select 
            value={selectedClasificacion} 
            onValueChange={setSelectedClasificacion}
          >
            <SelectTrigger className="w-[200px]" data-testid="select-clasificacion-filter">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tipos</SelectItem>
              {clasificaciones.map(c => (
                <SelectItem key={c} value={c}>
                  {getClasificacionLabel(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="secondary">
            {filteredPeligros.length} peligros específicos
          </Badge>
        </div>

        <div className="grid gap-3">
          {filteredPeligros.map((peligro, idx) => (
            <Card 
              key={peligro.codigo} 
              className="hover-elevate cursor-pointer"
              onClick={() => onSelectPeligro?.(peligro)}
              data-testid={`card-peligro-${idx}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getClasificacionColor(peligro.clasificacion)}>
                        {getClasificacionLabel(peligro.clasificacion)}
                      </Badge>
                      <span className="font-medium text-sm">{peligro.peligro}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{peligro.descripcion}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <AlertTriangle className="h-3 w-3 text-amber-500" />
                      <span className="text-xs text-amber-600 dark:text-amber-400">
                        {peligro.efectosPosibles}
                      </span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPeligro?.(peligro);
                    }}
                    data-testid={`button-agregar-peligro-${idx}`}
                  >
                    Agregar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filterResult.normativaEspecifica && filterResult.normativaEspecifica.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Normativa Específica del Sector
            </h4>
            <div className="space-y-1">
              {filterResult.normativaEspecifica.map(norma => (
                <div key={norma.codigo} className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <span className="font-medium">{norma.norma}:</span>
                  <span className="text-muted-foreground">{norma.descripcion}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {filterResult.eppRecomendado && filterResult.eppRecomendado.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm mb-2">EPP Recomendado</h4>
            <div className="flex gap-1 flex-wrap">
              {filterResult.eppRecomendado.map((epp, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {epp}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default IpercCiiuFilter;

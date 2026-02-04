/**
 * COMPONENTE DE TRAZABILIDAD NORMATIVA PESV
 * Muestra la trazabilidad normativa de cada paso del PESV
 * 
 * PRINCIPIO: Solo agregar código nuevo, no modificar existente
 */

import { Info, Scale, FileText, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  getTrazabilidadPaso, 
  formatNormativaAplicable,
  type TrazabilidadPasoPesv 
} from "@/data/pesv-normativa-trazabilidad";

interface TrazabilidadPesvBannerProps {
  codigoPaso: string;
  mostrarEvidencias?: boolean;
  mostrarRequisitos?: boolean;
  compacto?: boolean;
}

export function TrazabilidadPesvBanner({
  codigoPaso,
  mostrarEvidencias = false,
  mostrarRequisitos = false,
  compacto = false
}: TrazabilidadPesvBannerProps) {
  const [isOpen, setIsOpen] = useState(!compacto);
  const trazabilidad = getTrazabilidadPaso(codigoPaso);

  if (!trazabilidad) {
    return null;
  }

  const normativas = formatNormativaAplicable(trazabilidad);

  const cicloColors = {
    planear: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    hacer: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    verificar: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    actuar: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  };

  if (compacto) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="border rounded-lg bg-muted/30 p-3">
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-between p-0 h-auto hover:bg-transparent"
              data-testid="btn-toggle-trazabilidad"
            >
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Trazabilidad Normativa - Paso {trazabilidad.paso}
                </span>
                <Badge variant="outline" className={cicloColors[trazabilidad.ciclo]}>
                  {trazabilidad.ciclo.toUpperCase()}
                </Badge>
              </div>
              <Info className="h-4 w-4 text-muted-foreground" />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-3 space-y-2">
            <div className="grid gap-1">
              {normativas.map((norma, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <FileText className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{norma}</span>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  }

  return (
    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Trazabilidad Normativa
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Paso {trazabilidad.paso}: {trazabilidad.codigo}
            </Badge>
            <Badge className={cicloColors[trazabilidad.ciclo]}>
              {trazabilidad.ciclo.toUpperCase()}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {trazabilidad.nombre}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Normativas aplicables */}
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Normativa Aplicable
          </h4>
          <div className="grid gap-2">
            {trazabilidad.normativaAplicable.resolucion40595 && (
              <div className="flex items-start gap-2 text-sm p-2 rounded bg-background/50">
                <Badge variant="secondary" className="shrink-0 text-xs">
                  Res. 40595/2022
                </Badge>
                <span>{trazabilidad.normativaAplicable.resolucion40595}</span>
              </div>
            )}
            {trazabilidad.normativaAplicable.decreto1072 && (
              <div className="flex items-start gap-2 text-sm p-2 rounded bg-background/50">
                <Badge variant="secondary" className="shrink-0 text-xs">
                  Dec. 1072/2015
                </Badge>
                <span>{trazabilidad.normativaAplicable.decreto1072}</span>
              </div>
            )}
            {trazabilidad.normativaAplicable.iso39001 && (
              <div className="flex items-start gap-2 text-sm p-2 rounded bg-background/50">
                <Badge variant="secondary" className="shrink-0 text-xs">
                  ISO 39001:2012
                </Badge>
                <span>{trazabilidad.normativaAplicable.iso39001}</span>
              </div>
            )}
            {trazabilidad.normativaAplicable.iso31000 && (
              <div className="flex items-start gap-2 text-sm p-2 rounded bg-background/50">
                <Badge variant="secondary" className="shrink-0 text-xs">
                  ISO 31000:2018
                </Badge>
                <span>{trazabilidad.normativaAplicable.iso31000}</span>
              </div>
            )}
          </div>
        </div>

        {/* Requisitos específicos */}
        {mostrarRequisitos && trazabilidad.requisitosEspecificos.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Requisitos Específicos
            </h4>
            <ul className="grid gap-1">
              {trazabilidad.requisitosEspecificos.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary">•</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Evidencias requeridas */}
        {mostrarEvidencias && trazabilidad.evidenciasRequeridas.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Evidencias Requeridas
            </h4>
            <ul className="grid gap-1">
              {trazabilidad.evidenciasRequeridas.map((evidencia, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary">•</span>
                  {evidencia}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Frecuencia de revisión */}
        {trazabilidad.frecuenciaRevision && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Info className="h-3 w-3" />
            Frecuencia de revisión: <strong>{trazabilidad.frecuenciaRevision}</strong>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TrazabilidadPesvBanner;

/**
 * BANNER DE TRAZABILIDAD CAPACITACIONES SST ↔ PESV
 * Muestra la relación bidireccional entre capacitaciones de seguridad vial (PESV)
 * y el Programa de Capacitación Anual de SST
 * 
 * PRINCIPIO: Solo agregar código nuevo, no modificar existente
 * NORMATIVA: 
 * - Decreto 1072/2015 Art. 2.2.4.6.11 - Programa de Capacitación SST
 * - Resolución 40595/2022 Art. 5 Paso 10 - Plan de capacitación PESV
 */

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight, Scale, Link2 } from "lucide-react";
import { Link } from "wouter";

interface TrazabilidadCapacitacionesSstPesvBannerProps {
  direccion: 'pesv-to-sst' | 'sst-to-pesv';
  cantidadCapacitaciones?: number;
}

export function TrazabilidadCapacitacionesSstPesvBanner({
  direccion,
  cantidadCapacitaciones = 0
}: TrazabilidadCapacitacionesSstPesvBannerProps) {
  if (direccion === 'pesv-to-sst') {
    return (
      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
        <Link2 className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <Scale className="h-4 w-4" />
          Trazabilidad con Programa de Capacitación SST
        </AlertTitle>
        <AlertDescription className="mt-2">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Las capacitaciones en seguridad vial forman parte integral del{" "}
              <strong>Programa de Capacitación Anual</strong> según:
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-white dark:bg-transparent text-xs">
                Dec. 1072/2015 Art. 2.2.4.6.11
              </Badge>
              <Badge variant="outline" className="bg-white dark:bg-transparent text-xs">
                Res. 40595/2022 Paso 10
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Link href="/programa-capacitacion-anual">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 border-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                  data-testid="link-sst-capacitacion"
                >
                  <GraduationCap className="h-4 w-4" />
                  Ver Programa SST Completo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
      <Link2 className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800 dark:text-green-300 flex items-center gap-2">
        <Scale className="h-4 w-4" />
        Capacitaciones de Seguridad Vial (PESV)
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-green-700 dark:text-green-400">
            {cantidadCapacitaciones > 0 ? (
              <>
                Hay <strong>{cantidadCapacitaciones} capacitación(es)</strong> de seguridad vial 
                registradas en el módulo PESV que complementan este programa.
              </>
            ) : (
              <>
                Las capacitaciones de seguridad vial del módulo PESV se integran 
                con este programa según Resolución 40595/2022.
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-white dark:bg-transparent text-xs">
              Res. 40595/2022 Paso 10
            </Badge>
            <Badge variant="outline" className="bg-white dark:bg-transparent text-xs">
              ISO 39001:2012 §7.2
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Link href="/pesv/capacitaciones">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-green-300 hover:bg-green-100 dark:hover:bg-green-900/40"
                data-testid="link-pesv-capacitacion"
              >
                <GraduationCap className="h-4 w-4" />
                Ver Capacitaciones PESV
                {cantidadCapacitaciones > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {cantidadCapacitaciones}
                  </Badge>
                )}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}

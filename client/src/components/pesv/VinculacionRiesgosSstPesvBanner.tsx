/**
 * COMPONENTE DE VINCULACIÓN SST-PESV PARA RIESGOS
 * Muestra la vinculación entre riesgos PESV e IPERC SST
 * 
 * Fundamento normativo:
 * - Decreto 1072/2015 Art. 2.2.4.6.15: Los riesgos viales DEBEN estar en matriz SST
 * - Resolución 40595/2022 Art. 5: Articulación PESV-SST
 * 
 * PRINCIPIO: Solo agregar código nuevo, no modificar existente
 */

import { Link2, ArrowRight, AlertTriangle, CheckCircle, Info, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface VinculacionData {
  vinculacion: {
    id: string;
    riesgoVialId: string;
    peligroIpercId: string;
    origen: "pesv" | "sst" | "manual";
    estadoSincronizacion: "pendiente" | "sincronizado" | "desvinculado" | "requiere_revision";
    nivelRiesgoPesv: string | null;
    nivelRiesgoSst: string | null;
    justificacionVinculacion: string | null;
    createdAt: string;
  } | null;
  peligroIperc?: {
    id: string;
    descripcionPeligro: string;
    nivelRiesgo: string;
    valorRiesgo: number;
  } | null;
  riesgoVial?: {
    id: string;
    codigo: string;
    nombre: string;
    nivelRiesgo: string;
    valorRiesgo: number;
  } | null;
}

interface VinculacionRiesgosSstPesvBannerProps {
  riesgoVialId?: string;
  peligroIpercId?: string;
  modo: "pesv" | "sst";
  onSincronizar?: () => void;
  mostrarAcciones?: boolean;
}

export function VinculacionRiesgosSstPesvBanner({
  riesgoVialId,
  peligroIpercId,
  modo,
  onSincronizar,
  mostrarAcciones = true
}: VinculacionRiesgosSstPesvBannerProps) {
  const endpoint = modo === "pesv" 
    ? `/api/riesgos-vinculacion/por-riesgo-vial/${riesgoVialId}`
    : `/api/riesgos-vinculacion/por-peligro-iperc/${peligroIpercId}`;

  const { data, isLoading, isError } = useQuery<VinculacionData>({
    queryKey: ["riesgo-vinculacion", riesgoVialId || peligroIpercId, modo],
    enabled: !!(riesgoVialId || peligroIpercId)
  });

  if (isLoading) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-48" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return null;
  }

  const tieneVinculacion = data?.vinculacion !== null;
  
  const nivelColors: Record<string, string> = {
    aceptable: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    bajo: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    moderado: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    medio: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    alto: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    muy_alto: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    critico: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
  };

  if (!tieneVinculacion) {
    return (
      <Alert className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800 dark:text-amber-300">
          Riesgo sin Vinculación SST
        </AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-400">
          <p className="text-sm mb-2">
            Según el Decreto 1072/2015 Art. 2.2.4.6.15, todos los riesgos laborales 
            (incluidos los viales) deben estar identificados en la matriz de peligros SST.
          </p>
          {mostrarAcciones && onSincronizar && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onSincronizar}
              className="mt-2"
              data-testid="btn-sincronizar-a-sst"
            >
              <Link2 className="h-4 w-4 mr-2" />
              Sincronizar a Matriz SST
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  const vinc = data!.vinculacion!;
  const estadoIcons = {
    sincronizado: <CheckCircle className="h-4 w-4 text-green-600" />,
    pendiente: <Info className="h-4 w-4 text-blue-600" />,
    requiere_revision: <AlertTriangle className="h-4 w-4 text-amber-600" />,
    desvinculado: <AlertTriangle className="h-4 w-4 text-gray-500" />
  };

  return (
    <Card className="border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            Vinculación SST-PESV
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={vinc.estadoSincronizacion === "sincronizado" 
                ? "border-green-300 text-green-700 dark:text-green-300" 
                : "border-amber-300 text-amber-700 dark:text-amber-300"}
            >
              {estadoIcons[vinc.estadoSincronizacion]}
              <span className="ml-1 capitalize">{vinc.estadoSincronizacion.replace("_", " ")}</span>
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Origen: {vinc.origen.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-background/50">
          {modo === "pesv" ? (
            <>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Riesgo PESV (ISO 31000)</p>
                <div className="flex items-center gap-2">
                  <Badge className={nivelColors[vinc.nivelRiesgoPesv || "medio"]}>
                    {vinc.nivelRiesgoPesv || "N/A"}
                  </Badge>
                  <span className="text-sm font-medium">
                    {data?.riesgoVial?.nombre || "Riesgo Vial"}
                  </span>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Peligro SST (GTC-45)</p>
                <div className="flex items-center gap-2">
                  <Badge className={nivelColors[vinc.nivelRiesgoSst || "moderado"]}>
                    {vinc.nivelRiesgoSst || "N/A"}
                  </Badge>
                  <span className="text-sm font-medium truncate max-w-[150px]" title={data?.peligroIperc?.descripcionPeligro}>
                    {data?.peligroIperc?.descripcionPeligro?.substring(0, 40) || "Peligro IPERC"}...
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Peligro SST (GTC-45)</p>
                <div className="flex items-center gap-2">
                  <Badge className={nivelColors[vinc.nivelRiesgoSst || "moderado"]}>
                    {vinc.nivelRiesgoSst || "N/A"}
                  </Badge>
                  <span className="text-sm font-medium truncate max-w-[150px]">
                    {data?.peligroIperc?.descripcionPeligro?.substring(0, 40)}...
                  </span>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 rotate-180" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Riesgo PESV (ISO 31000)</p>
                <div className="flex items-center gap-2">
                  <Badge className={nivelColors[vinc.nivelRiesgoPesv || "medio"]}>
                    {vinc.nivelRiesgoPesv || "N/A"}
                  </Badge>
                  <span className="text-sm font-medium">
                    {data?.riesgoVial?.codigo} - {data?.riesgoVial?.nombre || "Riesgo Vial"}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {vinc.justificacionVinculacion && (
          <div className="text-xs text-muted-foreground flex items-start gap-2 pt-2 border-t">
            <Scale className="h-3 w-3 mt-0.5 shrink-0" />
            <span>{vinc.justificacionVinculacion}</span>
          </div>
        )}

        <div className="text-xs text-muted-foreground pt-2 border-t">
          <Info className="h-3 w-3 inline mr-1" />
          Fundamento: Decreto 1072/2015 Art. 2.2.4.6.15 y Resolución 40595/2022
        </div>
      </CardContent>
    </Card>
  );
}

export default VinculacionRiesgosSstPesvBanner;

/**
 * BANNER DE ORIGEN PESV PARA MATRIZ IPERC
 * Muestra los peligros en la matriz SST que fueron sincronizados desde PESV
 * 
 * Fundamento normativo:
 * - Decreto 1072/2015 Art. 2.2.4.6.15: Todos los riesgos laborales deben estar en matriz SST
 * - Resolución 40595/2022: Articulación PESV-SST
 * 
 * PRINCIPIO: Solo agregar código nuevo, no modificar existente
 */

import { Link2, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface VinculacionItem {
  vinculacion: {
    id: string;
    riesgoVialId: string;
    peligroIpercId: string;
    origen: string;
    estadoSincronizacion: string;
    nivelRiesgoPesv: string | null;
    nivelRiesgoSst: string | null;
    createdAt: string;
  };
  peligroIperc: {
    id: string;
    descripcionPeligro: string;
    nivelRiesgo: string;
    valorRiesgo: number;
  } | null;
  riesgoVial: {
    id: string;
    codigo: string;
    nombre: string;
    nivelRiesgo: string;
    valorRiesgo: number;
  } | null;
}

interface OrigenPesvBannerProps {
  compacto?: boolean;
}

export function OrigenPesvBanner({ compacto = false }: OrigenPesvBannerProps) {
  const [isOpen, setIsOpen] = useState(!compacto);
  
  const { data, isLoading, isError } = useQuery<VinculacionItem[]>({
    queryKey: ["/api/peligros-iperc/origen-pesv"]
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

  if (isError || !data || data.length === 0) {
    return null;
  }

  const nivelColors: Record<string, string> = {
    aceptable: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    bajo: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    moderado: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    medio: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    alto: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    muy_alto: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    critico: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
  };

  if (compacto) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Alert className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800 dark:text-blue-300">
                  {data.length} riesgo(s) sincronizado(s) desde PESV
                </AlertTitle>
              </div>
              <Button variant="ghost" size="icon">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <AlertDescription className="mt-2 text-blue-700 dark:text-blue-400">
              <div className="space-y-2 mt-2">
                {data.map((item) => (
                  <div key={item.vinculacion.id} className="flex items-center gap-2 text-sm p-2 rounded bg-background/50">
                    <CheckCircle className="h-3 w-3 text-green-600 shrink-0" />
                    <Badge variant="outline" className="text-xs shrink-0">
                      {item.riesgoVial?.codigo}
                    </Badge>
                    <span className="truncate">{item.riesgoVial?.nombre || "Riesgo PESV"}</span>
                    <Badge className={nivelColors[item.vinculacion.nivelRiesgoSst || "moderado"] + " text-xs ml-auto"}>
                      {item.vinculacion.nivelRiesgoSst || "N/A"}
                    </Badge>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </CollapsibleContent>
        </Alert>
      </Collapsible>
    );
  }

  return (
    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Riesgos Vinculados desde PESV
          </CardTitle>
          <Badge variant="secondary">
            {data.length} peligro(s) de origen vial
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Los siguientes peligros fueron sincronizados automáticamente desde la Matriz de Riesgos PESV 
          según el Decreto 1072/2015 Art. 2.2.4.6.15.
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          {data.map((item) => (
            <div key={item.vinculacion.id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-background/50 border">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="shrink-0">
                    PESV: {item.riesgoVial?.codigo || "N/A"}
                  </Badge>
                  <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="text-xs text-green-600">Sincronizado</span>
                </div>
                <p className="text-sm font-medium truncate">
                  {item.riesgoVial?.nombre || "Riesgo Vial"}
                </p>
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {item.peligroIperc?.descripcionPeligro || "Sin descripción"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Nivel SST</p>
                  <Badge className={nivelColors[item.vinculacion.nivelRiesgoSst || "moderado"]}>
                    {item.vinculacion.nivelRiesgoSst || "N/A"}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-xs text-muted-foreground mt-4 pt-2 border-t">
          <AlertTriangle className="h-3 w-3 inline mr-1" />
          Los riesgos viales han sido mapeados de ISO 31000 (5x5) a GTC-45 (4x4) automáticamente.
        </p>
      </CardContent>
    </Card>
  );
}

export default OrigenPesvBanner;

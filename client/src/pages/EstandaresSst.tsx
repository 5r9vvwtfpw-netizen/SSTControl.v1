import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, ChevronRight, CheckCircle2, Circle, Info } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SstStandard } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

type EstandaresResponse = {
  tipoEmpresa: string;
  chapter: string;
  riskLevel: string;
  totalEstandares: number;
  estandares: SstStandard[];
};

export default function EstandaresSst() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch standards filtered by company chapter
  const { data: estandaresData, isLoading: standardsLoading, error } = useQuery<EstandaresResponse>({
    queryKey: ["/api/estandares-sst/mi-empresa"],
    enabled: !!user?.companyId,
  });

  const standards = estandaresData?.estandares || [];

  const filteredStandards = standards.filter((standard) => {
    const matchesSearch = 
      standard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (standard.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      standard.phvaCycle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const groupedStandards = {
    "Planear": filteredStandards.filter(s => s.phvaCycle === "planear"),
    "Hacer": filteredStandards.filter(s => s.phvaCycle === "hacer"),
    "Verificar": filteredStandards.filter(s => s.phvaCycle === "verificar"),
    "Actuar": filteredStandards.filter(s => s.phvaCycle === "actuar"),
  };

  const phaseDescriptions = {
    "Planear": "Establecimiento del SG-SST",
    "Hacer": "Implementación y operación",
    "Verificar": "Verificación del sistema",
    "Actuar": "Mejoramiento continuo",
  };

  const phaseColors = {
    "Planear": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    "Hacer": "bg-green-500/10 text-green-700 dark:text-green-400",
    "Verificar": "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    "Actuar": "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Estándares Mínimos SST</h1>
          <p className="text-muted-foreground">Sistema de Gestión de Seguridad y Salud en el Trabajo - Resolución 1111 de 2017</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar estándares..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
      </div>

      {standardsLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Cargando estándares...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {(Object.keys(groupedStandards) as Array<keyof typeof groupedStandards>).map((phase) => {
            const phaseStandards = groupedStandards[phase];
            if (phaseStandards.length === 0) return null;

            return (
              <div key={phase} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold" data-testid={`text-phase-${phase.toLowerCase()}`}>
                    {phase}
                  </h2>
                  <Badge className={phaseColors[phase]}>
                    {phaseDescriptions[phase]}
                  </Badge>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {phaseStandards.map((standard) => (
                    <Card 
                      key={standard.id} 
                      className="hover-elevate transition-all cursor-pointer"
                      onClick={() => setLocation(`/estandares-sst/${standard.id}`)}
                      data-testid={`card-standard-${standard.id}`}
                    >
                      <CardHeader className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg leading-tight">
                            {standard.name}
                          </CardTitle>
                          <Badge variant="secondary" className="shrink-0">
                            {standard.maxScore}%
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {standard.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Circle className="h-3 w-3" />
                            <span>Ver ítems</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredStandards.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron estándares que coincidan con la búsqueda</p>
            </div>
          )}
        </div>
      )}

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Ciclo PHVA</CardTitle>
          <CardDescription>
            Los estándares mínimos del SG-SST están organizados según el ciclo de mejora continua Planear-Hacer-Verificar-Actuar
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-1">
            <div className="font-medium text-sm">Planear (25%)</div>
            <div className="text-xs text-muted-foreground">Recursos y gestión integral</div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-sm">Hacer (50%)</div>
            <div className="text-xs text-muted-foreground">Gestión de salud y peligros</div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-sm">Verificar (5%)</div>
            <div className="text-xs text-muted-foreground">Verificación del sistema</div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-sm">Actuar (10%)</div>
            <div className="text-xs text-muted-foreground">Mejoramiento continuo</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

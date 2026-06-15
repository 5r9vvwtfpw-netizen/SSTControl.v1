import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SstStandard, SstItem } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useRoute } from "wouter";
import { hasCompanyAdminAccess, canWrite } from "@shared/permissions";

export default function DetalleEstandarSst() {
  const { user } = useAuth();
  const isAdmin = user?.role ? canWrite(user.role, 'sst_items') : false;
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/estandares-sst/:id");
  const standardId = params?.id;

  const { data: standard, isLoading: standardLoading } = useQuery<SstStandard>({
    queryKey: ["/api/sst-standards", standardId],
    enabled: !!standardId,
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery<SstItem[]>({
    queryKey: ["/api/sst-standards", standardId, "items"],
    enabled: !!standardId,
  });

  const phaseColors = {
    "planear": "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    "hacer": "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    "verificar": "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    "actuar": "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  };

  const phaseLabels = {
    "planear": "Planear",
    "hacer": "Hacer",
    "verificar": "Verificar",
    "actuar": "Actuar",
  };

  if (standardLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Cargando estándar...</p>
        </div>
      </div>
    );
  }

  if (!standard) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Estándar no encontrado</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setLocation("/estandares-sst")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Estándares
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/estandares-sst")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Estándares
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold" data-testid="text-standard-name">
                {standard.name}
              </h1>
              <Badge variant="secondary" className="text-base" data-testid="badge-score">
                {standard.maxScore}%
              </Badge>
              <Badge className={phaseColors[standard.phvaCycle]} data-testid="badge-phase">
                {phaseLabels[standard.phvaCycle]}
              </Badge>
            </div>
            {standard.description && (
              <p className="text-muted-foreground mt-2" data-testid="text-description">
                {standard.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Ítems de Evaluación</CardTitle>
            <CardDescription>
              Criterios específicos para evaluar este estándar
            </CardDescription>
          </div>
          {isAdmin && (
            <Button size="sm" data-testid="button-add-item">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Ítem
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {itemsLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Cargando ítems...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay ítems de evaluación registrados</p>
              {isAdmin && (
                <p className="text-sm text-muted-foreground mt-2">
                  Los ítems se agregarán según la Resolución 1111 de 2017
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <Card key={item.id} data-testid={`item-card-${item.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono">
                            {item.itemNumber}
                          </Badge>
                        </div>
                        <CardTitle className="text-base mb-2">
                          {item.description}
                        </CardTitle>
                        {item.evaluationCriteria && (
                          <CardDescription className="mt-2">
                            <strong>Criterio:</strong> {item.evaluationCriteria}
                          </CardDescription>
                        )}
                      </div>
                      <Badge variant="secondary">
                        {item.maxScore} pts
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Información del Estándar</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <div className="text-sm font-medium">Ciclo PHVA</div>
            <div className="text-sm text-muted-foreground">
              {phaseLabels[standard.phvaCycle]} - {
                standard.phvaCycle === "planear" ? "Establecimiento del SG-SST" :
                standard.phvaCycle === "hacer" ? "Implementación y operación" :
                standard.phvaCycle === "verificar" ? "Verificación del sistema" :
                "Mejoramiento continuo"
              }
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">Puntaje Máximo</div>
            <div className="text-sm text-muted-foreground">
              {standard.maxScore}% del total (100%)
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">Normativa</div>
            <div className="text-sm text-muted-foreground">
              Resolución 1111 de 2017
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">Ítems de Evaluación</div>
            <div className="text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? "ítem registrado" : "ítems registrados"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

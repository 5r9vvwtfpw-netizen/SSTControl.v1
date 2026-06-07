import { ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useCompanyContext } from "@/hooks/use-company-context";
import { isModuleAllowedForChapter, CHAPTER_DESCRIPTIONS, type ChapterType } from "@shared/chapter-modules";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, ArrowLeft, Building2 } from "lucide-react";
import type { Company } from "@shared/schema";

interface ChapterGateProps {
  children: ReactNode;
}

function isPesvRoute(path: string): boolean {
  const cleanPath = path.split("?")[0];
  return cleanPath === "/pesv" || cleanPath.startsWith("/pesv/");
}

export function ChapterGate({ children }: ChapterGateProps) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { companyChapter, canSelectCompany, selectedCompanyId, selectedCompany, isLoading } = useCompanyContext();

  const { data: userCompany } = useQuery<Company>({
    queryKey: ["/api/company/current"],
    enabled: !!user && !canSelectCompany && !!user.companyId,
    staleTime: 60000,
  });

  const effectiveCompany = canSelectCompany ? selectedCompany : userCompany;
  const companyHasVehicles = (effectiveCompany?.numberOfVehicles ?? 0) > 0;

  const effectiveChapter: ChapterType | null = (() => {
    if (canSelectCompany && !selectedCompanyId) {
      return null;
    }
    return companyChapter;
  })();

  const publicRoutes = ["/induccion-virtual", "/login", "/auth", "/pricing", "/terminos-servicio", "/politica-privacidad", "/politica-cookies", "/contrato-saas", "/recuperar-contrasena", "/restablecer-contrasena", "/demo", "/recomendar", "/portal-empleados", "/portal-licenciado", "/configuracion-induccion", "/mi-suscripcion", "/checkout", "/pago-pse", "/planes-suscripcion"];
  const isPublicRoute = publicRoutes.some(r => location === r || location.startsWith(r + "/"));

  const isAllowed = effectiveChapter === null 
    || isPublicRoute
    || isModuleAllowedForChapter(location, effectiveChapter)
    || (isPesvRoute(location) && companyHasVehicles);

  // Si está cargando, mostrar el contenido (evitar flash de contenido)
  if (isLoading) {
    return <>{children}</>;
  }

  // Si está permitido, mostrar el contenido
  if (isAllowed) {
    return <>{children}</>;
  }

  // Mostrar mensaje de acceso restringido
  const chapterInfo = effectiveChapter ? CHAPTER_DESCRIPTIONS[effectiveChapter] : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">Módulo no disponible</CardTitle>
          <CardDescription className="text-base">
            Este módulo no está incluido en su plan actual según la Resolución 0312/2019
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {chapterInfo && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{chapterInfo.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {chapterInfo.description}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Estándares aplicables: <strong>{chapterInfo.standards}</strong>
              </p>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground text-center">
            Para acceder a módulos avanzados como Auditorías Internas, Revisión por Dirección, 
            PESV completo, y otros módulos especializados, su empresa debe cumplir con los 
            requisitos de 21 o 61 estándares según la Resolución 0312 de 2019.
          </p>

          <div className="flex justify-center pt-2">
            <Button 
              variant="outline" 
              onClick={() => setLocation("/")}
              className="gap-2"
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

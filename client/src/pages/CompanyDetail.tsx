import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, ArrowLeft, FileText, TrendingUp } from "lucide-react";
import { SstStandard } from "@shared/schema";
import { calculateChapter, getChapterDescription, getChapterStandards } from "@shared/utils";
import { getCiiuLabel } from "@/lib/ciiu-codes";

interface Company {
  id: string;
  name: string;
  nit: string;
  numberOfWorkers: number;
  riskLevel: "I" | "II" | "III" | "IV" | "V";
  calculatedChapter: "1" | "2" | "3";
  ciiuCode?: string | null;
}

export default function CompanyDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: company, isLoading: companyLoading } = useQuery<Company>({
    queryKey: ["/api/companies", id],
  });

  const { data: standards = [], isLoading: standardsLoading } = useQuery<SstStandard[]>({
    queryKey: ["/api/sst-standards"],
  });

  if (companyLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground" data-testid="text-loading">Cargando información de la empresa...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground" data-testid="text-not-found">Empresa no encontrada</p>
        <Button onClick={() => setLocation("/empresas")} data-testid="button-back">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Gestión de Empresas
        </Button>
      </div>
    );
  }

  const chapter = company.calculatedChapter;
  const totalStandards = getChapterStandards(chapter);

  // Group standards by PHVA cycle
  const groupedStandards = {
    "planear": standards.filter(s => s.phvaCycle === "planear"),
    "hacer": standards.filter(s => s.phvaCycle === "hacer"),
    "verificar": standards.filter(s => s.phvaCycle === "verificar"),
    "actuar": standards.filter(s => s.phvaCycle === "actuar"),
  };

  const phaseLabels = {
    "planear": "Planear",
    "hacer": "Hacer",
    "verificar": "Verificar",
    "actuar": "Actuar",
  };

  const phaseColors = {
    "planear": "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    "hacer": "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    "verificar": "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
    "actuar": "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
  };

  const phasePercentages = {
    "planear": 25,
    "hacer": 60,
    "verificar": 5,
    "actuar": 10,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/empresas")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-company-name">{company.name}</h1>
              <p className="text-muted-foreground" data-testid="text-company-nit">NIT: {company.nit}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Company Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Empresa</CardTitle>
          <CardDescription>Clasificación según Resolución 0312/2019</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Trabajadores</p>
              <p className="text-2xl font-bold" data-testid="text-workers">{company.numberOfWorkers}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Nivel de Riesgo</p>
              <p className="text-2xl font-bold" data-testid="text-risk">{company.riskLevel}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Actividad Económica</p>
              <p className="text-lg font-bold" data-testid="text-ciiu">
                {company.ciiuCode ? (
                  <span title={getCiiuLabel(company.ciiuCode)}>
                    {company.ciiuCode} - {getCiiuLabel(company.ciiuCode).substring(0, 40)}{getCiiuLabel(company.ciiuCode).length > 40 ? '...' : ''}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-base">No especificada</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SST Standards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" data-testid="text-standards-title">Estándares Mínimos SST</h2>
            <p className="text-muted-foreground">Resolución 0312/2019 - Ciclo PHVA</p>
          </div>
          <Link href="/evaluaciones-sst">
            <Button data-testid="button-create-evaluation">
              <FileText className="h-4 w-4 mr-2" />
              Crear Evaluación
            </Button>
          </Link>
        </div>

        {standardsLoading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Cargando estándares...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedStandards).map(([phase, phaseStandards]) => {
              if (phaseStandards.length === 0) return null;

              const totalPhaseScore = phaseStandards.reduce((sum, s) => sum + s.maxScore, 0);

              return (
                <div key={phase} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={phaseColors[phase as keyof typeof phaseColors]}
                      data-testid={`badge-phase-${phase}`}
                    >
                      {phaseLabels[phase as keyof typeof phaseLabels]} ({phasePercentages[phase as keyof typeof phasePercentages]}%)
                    </Badge>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="grid gap-3">
                    {phaseStandards.map((standard) => (
                      <Card
                        key={standard.id}
                        className="hover-elevate"
                        data-testid={`card-standard-${standard.id}`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <CardTitle className="text-base" data-testid={`text-standard-name-${standard.id}`}>
                                {standard.name}
                              </CardTitle>
                              {standard.description && (
                                <CardDescription className="mt-1" data-testid={`text-standard-description-${standard.id}`}>
                                  {standard.description}
                                </CardDescription>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary" data-testid={`text-standard-score-${standard.id}`}>
                                {standard.maxScore}%
                              </div>
                              <div className="text-xs text-muted-foreground">Puntaje máximo</div>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Card */}
      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumen del Sistema de Gestión SST
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Planear</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">25%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hacer</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">60%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verificar</p>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">5%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Actuar</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">10%</p>
            </div>
          </div>
          <p className="text-sm text-center text-muted-foreground">
            Total: 100% - {totalStandards} estándares mínimos aplicables
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, FileText, TriangleAlert } from "lucide-react";
import { Link } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompanyContext } from "@/hooks/use-company-context";
import { openCompanyDocument } from "@/lib/company-context-url";

type DiagnosticEvidence = {
  companyName: string;
  companyNit: string | null;
  hasCiiu: boolean;
  isTestCompany: boolean;
  evaluation: { id: string; anio: number; mes: number | null } | null;
  p03Response: {
    cumple: number | null;
    noAplica: number | null;
    evidencias: string | null;
    observaciones: string | null;
  } | null;
  contextFactorCount: number;
  vehicleCount: number;
  activeVehicleCount: number;
  driverCount: number;
  activeDriverCount: number;
  activeRouteCount: number;
  activeRoutesWithCriticalPoints: number;
};

function p03Status(data: DiagnosticEvidence): string {
  if (!data.evaluation || !data.p03Response) return "Sin respuesta registrada";
  if (data.p03Response.noAplica === 1) return "Marcado como no aplica";
  if (data.p03Response.cumple === 1) return "Marcado como cumple";
  if (data.p03Response.cumple === 0) return "Marcado como no cumple";
  return "Pendiente de valoración";
}

export default function PesvInformeAnualDiagnostico() {
  const { selectedCompany } = useCompanyContext();
  const { data, isLoading, isError, refetch } = useQuery<DiagnosticEvidence>({
    queryKey: ["/api/pesv/informes-anuales/diagnostico-organizacion/evidencias", selectedCompany?.id],
  });

  const sourceLinks = [
    {
      label: "Abrir Contexto Organizacional",
      href: "/pesv/contexto-organizacional",
      pdf: "/api/contexto-organizacional-pesv/pdf",
      available: (data?.contextFactorCount ?? 0) > 0,
      pdfLabel: "PDF de contexto organizacional",
    },
    {
      label: "Abrir inventario de vehículos",
      href: "/pesv/vehiculos",
      pdf: "/api/pesv/vehiculos/pdf",
      available: (data?.vehicleCount ?? 0) > 0,
      pdfLabel: "PDF de vehículos",
    },
    {
      label: "Abrir base de conductores",
      href: "/pesv/conductores",
      pdf: "/api/pesv/conductores/pdf",
      available: (data?.driverCount ?? 0) > 0,
      pdfLabel: "PDF de conductores",
    },
    {
      label: "Abrir rutas seguras",
      href: "/pesv/rutas-seguras",
      pdf: "/api/pesv/rutas-seguras/pdf",
      available: (data?.activeRouteCount ?? 0) > 0,
      pdfLabel: "PDF de rutas seguras",
    },
  ];

  const evidenceRows = data ? [
    {
      title: "Caracterización de la empresa",
      detail: data.hasCiiu
        ? "El perfil tiene actividad económica registrada; no se encontró un documento de caracterización adjunto."
        : "Falta registrar la actividad económica y aportar el documento de caracterización.",
      count: data.hasCiiu ? "Dato de empresa registrado" : "Dato pendiente",
    },
    {
      title: "Inventario de vehículos",
      detail: data.vehicleCount
        ? `${data.vehicleCount} vehículo(s) registrados; ${data.activeVehicleCount} con estado activo. La cantidad no acredita por sí sola que la matriz esté actualizada.`
        : "No hay vehículos registrados para esta empresa.",
      count: `${data.vehicleCount} registrados`,
    },
    {
      title: "Base de datos de conductores",
      detail: data.driverCount
        ? `${data.driverCount} conductor(es) registrados; ${data.activeDriverCount} con estado activo. Revisar que la base corresponda al diagnóstico vigente.`
        : "No hay conductores registrados para esta empresa.",
      count: `${data.driverCount} registrados`,
    },
    {
      title: "Rutas y puntos críticos",
      detail: data.activeRoutesWithCriticalPoints
        ? `${data.activeRoutesWithCriticalPoints} ruta(s) activa(s) tienen puntos críticos registrados. Esto no sustituye la revisión del diagnóstico de infraestructura vial.`
        : "No se encontraron rutas activas con puntos críticos registrados.",
      count: `${data.activeRouteCount} rutas activas`,
    },
  ] : [];

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-6" data-testid="annual-pesv-organization-diagnosis">
      <Button variant="ghost" asChild className="-ml-3">
        <Link href="/pesv/informes-anuales">
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Volver a informes anuales
        </Link>
      </Button>

      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">PESV · Informe anual SISI/PESV · 8</p>
        <h1 className="text-2xl font-bold md:text-3xl">Diagnóstico del estado actual de la seguridad vial</h1>
        <p className="max-w-3xl text-muted-foreground">
          Pregunta: ¿La empresa ha definido el diagnóstico del estado actual de la seguridad vial?
        </p>
        <p className="text-sm font-medium">Evidencia solicitada: Copia del diagnóstico en PDF</p>
        {data?.isTestCompany && <Badge variant="outline">Prueba funcional · DEMO-PRUEBA</Badge>}
      </header>

      {isLoading ? (
        <Card><CardContent className="p-6 text-muted-foreground">Consultando los registros de P03…</CardContent></Card>
      ) : isError ? (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>No se pudieron consultar las fuentes del diagnóstico</AlertTitle>
          <AlertDescription>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Reintentar</Button>
          </AlertDescription>
        </Alert>
      ) : data ? (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{data.companyName || selectedCompany?.name || "Empresa"}</CardTitle>
                  <CardDescription>PESV P03 · Diagnóstico de la organización</CardDescription>
                  {data.companyNit && <CardDescription>NIT {data.companyNit}</CardDescription>}
                </div>
                <Badge variant="secondary">Requiere verificación</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Los registros consultados no conforman una copia completa del diagnóstico</AlertTitle>
                <AlertDescription>
                  La aplicación conserva datos en módulos separados, pero no registra un documento único que reúna y
                  valide los cuatro componentes. El PDF de Contexto Organizacional solo contiene factores internos y
                  externos; no debe entregarse como si fuera el diagnóstico completo.
                </AlertDescription>
              </Alert>

              <div className="rounded-md border p-4">
                <p className="text-sm text-muted-foreground">Valoración P03 en la evaluación más reciente</p>
                <p className="mt-1 font-medium">
                  {data.evaluation ? `Evaluación ${data.evaluation.anio}` : "No hay evaluación PESV registrada"}
                  {data.evaluation ? ` · ${p03Status(data)}` : ""}
                </p>
                {data.p03Response?.evidencias && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Evidencia descrita en P03: {data.p03Response.evidencias}
                  </p>
                )}
                {data.p03Response?.observaciones && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Observaciones: {data.p03Response.observaciones}
                  </p>
                )}
                {data.evaluation && (
                  <Button variant="ghost" className="h-auto px-0 text-primary underline-offset-4 hover:underline" asChild>
                    <Link href={`/pesv/evaluacion/${data.evaluation.id}`}>Abrir evaluación P03</Link>
                  </Button>
                )}
                {data.evaluation && (
                  <Button
                    variant="ghost"
                    className="ml-3 h-auto px-0 text-primary underline-offset-4 hover:underline"
                    onClick={() => openCompanyDocument(`/api/evaluaciones-pesv/${data.evaluation!.id}/pdf`, selectedCompany?.id)}
                  >
                    Abrir PDF de evaluación PESV
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <h2 className="text-base font-semibold">Fuentes y componentes que deben revisarse</h2>
                <Button variant="outline" asChild>
                  <Link href={selectedCompany?.id ? `/empresas/${selectedCompany.id}` : "/empresas"}>
                    Abrir perfil de la empresa
                  </Link>
                </Button>
                {evidenceRows.map((row) => (
                  <div key={row.title} className="rounded-md border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{row.title}</p>
                      <Badge variant="outline">{row.count}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{row.detail}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t pt-4">
                <div>
                  <h2 className="font-semibold">Módulos y documentos fuente</h2>
                  <p className="text-sm text-muted-foreground">
                    Consulta cada fuente por separado. Estos PDF no se presentan como un diagnóstico consolidado.
                  </p>
                </div>
                {sourceLinks.map((source) => (
                  <div key={source.href} className="flex flex-col justify-between gap-2 rounded-md border p-3 sm:flex-row sm:items-center">
                    <Button variant="ghost" className="h-auto justify-start px-0 text-primary underline-offset-4 hover:underline" asChild>
                      <Link href={source.href}>{source.label}</Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!source.available}
                      onClick={() => openCompanyDocument(source.pdf, selectedCompany?.id)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {source.pdfLabel}
                    </Button>
                  </div>
                ))}
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>No hay un PDF único del diagnóstico completo</AlertTitle>
                  <AlertDescription>
                    El informe muestra el estado de los datos disponibles y sus fuentes. Hace falta documentar y validar
                    la caracterización y el diagnóstico de rutas y puntos críticos antes de presentar una copia completa.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </main>
  );
}

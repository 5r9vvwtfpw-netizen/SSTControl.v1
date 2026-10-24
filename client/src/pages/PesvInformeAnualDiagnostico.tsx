import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, TriangleAlert } from "lucide-react";
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

  const evidenceRows = data ? [
    {
      title: "Caracterización de la empresa",
      detail: data.hasCiiu
        ? "El perfil tiene actividad económica registrada; no se encontró un documento de caracterización adjunto."
        : "Falta registrar la actividad económica y aportar el documento de caracterización.",
      count: data.hasCiiu ? "Dato de empresa registrado" : "Dato pendiente",
      source: "Perfil de la empresa",
      href: selectedCompany?.id ? `/empresas/${selectedCompany.id}` : "/empresas",
    },
    {
      title: "Inventario de vehículos",
      detail: data.vehicleCount
        ? `${data.vehicleCount} vehículo(s) registrados; ${data.activeVehicleCount} con estado activo. La cantidad no acredita por sí sola que la matriz esté actualizada.`
        : "No hay vehículos registrados para esta empresa.",
      count: `${data.vehicleCount} registrados`,
      source: "Vehículos",
      href: "/pesv/vehiculos",
    },
    {
      title: "Base de datos de conductores",
      detail: data.driverCount
        ? `${data.driverCount} conductor(es) registrados; ${data.activeDriverCount} con estado activo. Revisar que la base corresponda al diagnóstico vigente.`
        : "No hay conductores registrados para esta empresa.",
      count: `${data.driverCount} registrados`,
      source: "Conductores",
      href: "/pesv/conductores",
    },
    {
      title: "Rutas y puntos críticos",
      detail: data.activeRoutesWithCriticalPoints
        ? `${data.activeRoutesWithCriticalPoints} ruta(s) activa(s) tienen puntos críticos registrados. Esto no sustituye la revisión del diagnóstico de infraestructura vial.`
        : "No se encontraron rutas activas con puntos críticos registrados.",
      count: `${data.activeRouteCount} rutas activas`,
      source: "Rutas seguras",
      href: "/pesv/rutas-seguras",
    },
    {
      title: "Contexto organizacional complementario",
      detail: `${data.contextFactorCount} factor(es) activos registrados; aportan información contextual y no reemplazan la caracterización de la empresa.`,
      count: `${data.contextFactorCount} factores`,
      source: "Contexto Organizacional",
      href: "/pesv/contexto-organizacional",
    },
  ] : [];
  const containsFunctionalTest = [data?.p03Response?.evidencias, data?.p03Response?.observaciones]
    .some((text) => /PRUEBA FUNCIONAL|ESCENARIO DE PRUEBA/i.test(text || ""));

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
                <AlertTitle>
                  {containsFunctionalTest
                    ? "La respuesta P03 contiene información marcada como prueba funcional"
                    : "Los registros consultados no conforman una copia completa del diagnóstico"}
                </AlertTitle>
                <AlertDescription>
                  El PDF consolidado reúne los datos registrados en los módulos fuente. Debe revisarse antes de presentarlo:
                  la información compilada no valida por sí sola la vigencia del inventario ni el diagnóstico técnico de las rutas.
                  {containsFunctionalTest && " Los datos de prueba no son evidencia real para presentar a SISI/PESV."}
                </AlertDescription>
              </Alert>

              <div className="rounded-md border bg-muted/20 p-4">
                <p className="text-sm text-muted-foreground">Valoración P03 en la evaluación más reciente</p>
                <p className="mt-1 font-medium">
                  {data.evaluation ? `Evaluación ${data.evaluation.anio}` : "No hay evaluación PESV registrada"}
                  {data.evaluation ? ` · ${p03Status(data)}` : ""}
                </p>
                {data.p03Response?.evidencias && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {containsFunctionalTest
                      ? "P03 tiene una descripción de evidencia marcada como prueba; no es un archivo adjunto ni acredita cumplimiento."
                      : "P03 tiene una descripción de evidencia, pero no se almacena como archivo adjunto."}
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
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-md border p-4">
                  <p className="text-sm text-muted-foreground">Factores de contexto activos</p>
                  <p className="text-2xl font-semibold">{data.contextFactorCount}</p>
                </div>
                <div className="rounded-md border p-4">
                  <p className="text-sm text-muted-foreground">Vehículos activos / registrados</p>
                  <p className="text-2xl font-semibold">{data.activeVehicleCount} / {data.vehicleCount}</p>
                </div>
                <div className="rounded-md border p-4">
                  <p className="text-sm text-muted-foreground">Conductores activos / registrados</p>
                  <p className="text-2xl font-semibold">{data.activeDriverCount} / {data.driverCount}</p>
                </div>
                <div className="rounded-md border p-4">
                  <p className="text-sm text-muted-foreground">Rutas activas con puntos críticos</p>
                  <p className="text-2xl font-semibold">{data.activeRoutesWithCriticalPoints} / {data.activeRouteCount}</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-md border">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 font-medium">Componente solicitado</th>
                      <th className="p-3 font-medium">Estado / información registrada</th>
                      <th className="p-3 font-medium">Módulo fuente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evidenceRows.map((row) => (
                      <tr key={row.title} className="border-t">
                        <td className="p-3 font-medium">{row.title}</td>
                        <td className="p-3">
                          <div className="mb-1"><Badge variant="outline">{row.count}</Badge></div>
                          <span className="text-muted-foreground">{row.detail}</span>
                        </td>
                        <td className="p-3">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={row.href}>Abrir {row.source}</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Alert>
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>El PDF consolidado debe ser revisado antes de presentarlo</AlertTitle>
                <AlertDescription>
                  Incluye en un solo archivo la ficha de empresa, la evaluación P03, los registros de vehículos y conductores,
                  las rutas con sus puntos críticos y el contexto organizacional. No agrega firmas ni declara cumplimiento.
                </AlertDescription>
              </Alert>

              <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
                <Button
                  onClick={() => openCompanyDocument(
                    "/api/pesv/informes-anuales/diagnostico-organizacion.pdf",
                    selectedCompany?.id,
                  )}
                  data-testid="button-download-pesv-consolidated-diagnosis"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar diagnóstico consolidado PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </main>
  );
}

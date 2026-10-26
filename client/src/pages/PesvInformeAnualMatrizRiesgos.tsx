import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, TriangleAlert } from "lucide-react";
import { Link } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompanyContext } from "@/hooks/use-company-context";
import { openCompanyDocument } from "@/lib/company-context-url";

type RiskMatrixEvidence = {
  companyName: string;
  companyNit: string | null;
  isTestCompany: boolean;
  risks: Array<{
    id: string;
    codigo: string;
    nombre: string;
    categoria: string;
    probabilidad: string;
    impacto: string;
    nivelRiesgo: string | null;
    activo: number;
  }>;
  treatments: Array<{
    id: string;
    riesgoVialId: string;
    estado: string;
    porcentajeAvance: number | null;
  }>;
};

export default function PesvInformeAnualMatrizRiesgos() {
  const { selectedCompany } = useCompanyContext();
  const { data, isLoading, isError, refetch } = useQuery<RiskMatrixEvidence>({
    queryKey: ["/api/pesv/informes-anuales/matriz-riesgos-viales/evidencias", selectedCompany?.id],
  });

  const activeRisks = data?.risks.filter((risk) => risk.activo !== 0) ?? [];
  const inactiveRisks = data?.risks.filter((risk) => risk.activo === 0) ?? [];
  const activeRiskIds = new Set(activeRisks.map((risk) => risk.id));
  const activeTreatments = data?.treatments.filter((treatment) => activeRiskIds.has(treatment.riesgoVialId)) ?? [];

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-6" data-testid="annual-pesv-risk-matrix-report">
      <Button variant="ghost" asChild className="-ml-3">
        <Link href="/pesv/informes-anuales">
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Volver a informes anuales
        </Link>
      </Button>

      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">PESV · Informe anual SISI/PESV · 10</p>
        <h1 className="text-2xl font-bold md:text-3xl">Matriz de riesgos de seguridad vial</h1>
        <p className="max-w-3xl text-muted-foreground">
          Pregunta: ¿Posee matriz de riesgos de seguridad vial, de acuerdo con la operación de la organización?
        </p>
        <p className="text-sm font-medium">Evidencia solicitada: Copia en archivo Excel</p>
        {data?.isTestCompany && <Badge variant="outline">Prueba funcional · DEMO-PRUEBA</Badge>}
      </header>

      {isLoading ? (
        <Card><CardContent className="p-6 text-muted-foreground">Consultando la matriz P04 y sus tratamientos…</CardContent></Card>
      ) : isError ? (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>No se pudo consultar la Matriz de Riesgos Viales</AlertTitle>
          <AlertDescription>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Reintentar</Button>
          </AlertDescription>
        </Alert>
      ) : data ? (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>{data.companyName || selectedCompany?.name || "Empresa"}</CardTitle>
                <CardDescription>Fuente: PESV P04 · Matriz de Riesgos Viales</CardDescription>
                {data.companyNit && <CardDescription>NIT {data.companyNit}</CardDescription>}
              </div>
              <Badge variant="secondary">Requiere verificación</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.isTestCompany && (
              <Alert>
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Datos de DEMO-PRUEBA</AlertTitle>
                <AlertDescription>
                  El archivo Excel se identificará como prueba funcional. No lo presentes como evidencia real.
                </AlertDescription>
              </Alert>
            )}
            <Alert>
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>La cantidad de registros no confirma que la matriz cubra toda la operación</AlertTitle>
              <AlertDescription>
                Revisa los riesgos, controles y tratamientos frente a las actividades, vehículos, conductores y rutas de la organización.
                El Excel es una copia de los datos registrados; no declara cumplimiento ni completa información faltante.
              </AlertDescription>
            </Alert>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border p-4">
                <p className="text-sm text-muted-foreground">Riesgos activos</p>
                <p className="text-2xl font-semibold">{activeRisks.length}</p>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-sm text-muted-foreground">Riesgos inactivos / históricos</p>
                <p className="text-2xl font-semibold">{inactiveRisks.length}</p>
              </div>
              <div className="rounded-md border p-4">
                <p className="text-sm text-muted-foreground">Tratamientos asociados a riesgos activos</p>
                <p className="text-2xl font-semibold">{activeTreatments.length}</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-md border">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 font-medium">Componente</th>
                    <th className="p-3 font-medium">Información registrada</th>
                    <th className="p-3 font-medium">Módulo fuente</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3 font-medium">Matriz de riesgos viales</td>
                    <td className="p-3">{activeRisks.length} riesgos activos · {inactiveRisks.length} inactivos/históricos</td>
                    <td className="p-3">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/pesv/matriz-riesgos">Abrir Matriz de Riesgos Viales</Link>
                      </Button>
                    </td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3 font-medium">Tratamientos y seguimiento</td>
                    <td className="p-3">{activeTreatments.length} tratamientos vinculados a riesgos activos</td>
                    <td className="p-3">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/pesv/matriz-riesgos">Abrir tratamientos en P04</Link>
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
              <Button
                onClick={() => openCompanyDocument(
                  "/api/pesv/informes-anuales/matriz-riesgos-viales.xlsx",
                  selectedCompany?.id,
                )}
                data-testid="button-download-pesv-annual-risk-matrix"
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar copia de la matriz en Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, FileText, TriangleAlert } from "lucide-react";
import { Link } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompanyContext } from "@/hooks/use-company-context";
import { openCompanyDocument } from "@/lib/company-context-url";
import { SPF_PESV_TRACEABILITY } from "@shared/iso39001-mapping";

type BaselineEvidenceState = {
  companyName: string;
  companyNit: string | null;
  isTestCompany: boolean;
  factors: Array<{
    id: string;
    codigo: string;
    nombre: string;
    categoria: string;
    unidadMedida: string | null;
    valorBase: string | null;
    valorActual: string | null;
    observaciones: string | null;
    activo: number;
  }>;
};

const TEST_SCENARIO_MARKER = "ESCENARIO DE PRUEBA PESV";

function formatValue(value: string | null, unit: string | null): string {
  if (value === null || value.trim() === "") return "Sin valor";
  return unit ? `${value} ${unit}` : value;
}

export default function PesvInformeAnualLineaBase() {
  const { selectedCompany } = useCompanyContext();
  const { data, isLoading, isError, refetch } = useQuery<BaselineEvidenceState>({
    queryKey: ["/api/pesv/informes-anuales/linea-base/evidencias", selectedCompany?.id],
  });

  const factors = data?.factors ?? [];
  const activeFactors = factors.filter((factor) => factor.activo !== 0);
  const withBaseValue = activeFactors.filter(
    (factor) => factor.valorBase !== null && factor.valorBase.trim() !== "",
  );
  const zeroBaseValues = withBaseValue.filter((factor) => Number(factor.valorBase) === 0);
  const hasTestScenarioValues = activeFactors.some((factor) => factor.observaciones?.includes(TEST_SCENARIO_MARKER));

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-6" data-testid="annual-pesv-baseline-report">
      <Button variant="ghost" asChild className="-ml-3">
        <Link href="/pesv/informes-anuales">
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Volver a informes anuales
        </Link>
      </Button>

      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">PESV · Informe anual SISI/PESV · 7</p>
        <h1 className="text-2xl font-bold md:text-3xl">Línea base del estado de la seguridad vial</h1>
        <p className="max-w-3xl text-muted-foreground">
          Pregunta: ¿La empresa ha definido la línea base o primera medición del estado actual de la seguridad vial?
        </p>
        <p className="text-sm font-medium">Evidencia solicitada: Copia en PDF</p>
        {data?.isTestCompany && <Badge variant="outline">Prueba funcional · DEMO-PRUEBA</Badge>}
      </header>

      {isLoading ? (
        <Card><CardContent className="p-6 text-muted-foreground">Consultando los factores de desempeño de la empresa…</CardContent></Card>
      ) : isError ? (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>No se pudieron consultar los factores de desempeño</AlertTitle>
          <AlertDescription>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Reintentar</Button>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{data?.companyName || selectedCompany?.name || "Empresa"}</CardTitle>
                  <CardDescription>Fuente consultada: Factores de Desempeño de Seguridad Vial</CardDescription>
                  {data?.companyNit && <CardDescription>NIT {data.companyNit}</CardDescription>}
                </div>
                <Badge variant="secondary">Requiere verificación</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasTestScenarioValues && (
                <Alert>
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle>Valores de escenario de prueba</AlertTitle>
                  <AlertDescription>
                    Los valores marcados como escenario se usan para probar la pantalla y el PDF. No son mediciones reales,
                    no permiten determinar el cumplimiento de la empresa y no deben entregarse como evidencia.
                  </AlertDescription>
                </Alert>
              )}
              <Alert>
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>La información disponible no permite confirmar por sí sola una línea base</AlertTitle>
                <AlertDescription>
                  El módulo registra valores base, pero no identifica de forma estructurada cuándo se midieron ni su fuente.
                  Confirma que correspondan a una medición real antes de presentarlos como evidencia. Un valor cero no se
                  interpreta automáticamente como una medición.
                </AlertDescription>
              </Alert>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-md border p-4">
                  <p className="text-sm text-muted-foreground">Factores activos</p>
                  <p className="text-2xl font-semibold">{activeFactors.length}</p>
                </div>
                <div className="rounded-md border p-4">
                  <p className="text-sm text-muted-foreground">Con valor base registrado</p>
                  <p className="text-2xl font-semibold">{withBaseValue.length}</p>
                </div>
                <div className="rounded-md border p-4">
                  <p className="text-sm text-muted-foreground">Valores base iguales a cero</p>
                  <p className="text-2xl font-semibold">{zeroBaseValues.length}</p>
                </div>
              </div>

              {activeFactors.length > 0 ? (
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full min-w-[820px] text-left text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-3 font-medium">Código</th>
                        <th className="p-3 font-medium">Factor</th>
                        <th className="p-3 font-medium">Paso / estándar relacionado</th>
                        <th className="p-3 font-medium">Valor base registrado</th>
                        <th className="p-3 font-medium">Valor actual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeFactors.map((factor) => (
                        <tr key={factor.id} className="border-t">
                          <td className="p-3">{factor.codigo}</td>
                          <td className="p-3">{factor.nombre}</td>
                          <td className="p-3">
                            <div className="font-medium">
                              {SPF_PESV_TRACEABILITY.resolution} · Paso {SPF_PESV_TRACEABILITY.pesvStep}
                            </div>
                            <div className="text-xs text-muted-foreground">{SPF_PESV_TRACEABILITY.pesvStepTitle}</div>
                            <div className="mt-1 text-xs">ISO 39001:2012 · cláusula {SPF_PESV_TRACEABILITY.isoClause}</div>
                          </td>
                          <td className="p-3">{formatValue(factor.valorBase, factor.unidadMedida)}</td>
                          <td className="p-3">{formatValue(factor.valorActual, factor.unidadMedida)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>No hay factores de desempeño registrados</AlertTitle>
                  <AlertDescription>
                    Registra la información en el módulo fuente antes de generar la copia PDF.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" asChild>
                  <Link href="/pesv/factores-desempeno">P04. Abrir factores de desempeño</Link>
                </Button>
                <Button
                  onClick={() => openCompanyDocument("/api/factores-desempeno-sv/pdf", selectedCompany?.id)}
                  disabled={activeFactors.length === 0}
                  data-testid="button-download-baseline-source-pdf"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Abrir copia PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, ExternalLink, TriangleAlert } from "lucide-react";
import { Link } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompanyContext } from "@/hooks/use-company-context";
import { openCompanyDocument } from "@/lib/company-context-url";

type RiskControlState = {
  companyName: string;
  companyNit: string | null;
  isTestCompany: boolean;
  evaluation: { id: string; anio: number; mes: number | null; estado: string } | null;
  p04Response: { cumple: number | null; noAplica: number | null; evidencias: string | null; observaciones: string | null } | null;
  criteria: Array<{ id: string; criterioTexto: string; verificado: number; observacion: string | null }>;
  documents: Array<{ id: string; evidenciaTexto: string; archivoUrl: string | null; archivoNombre: string | null }>;
  risks: Array<{
    id: string;
    codigo: string;
    nombre: string;
    categoria: string;
    probabilidad: string;
    impacto: string;
    nivelRiesgo: string | null;
    controlesExistentes: string | null;
    activo: number;
  }>;
  treatments: Array<{
    id: string;
    riesgoVialId: string;
    tipoTratamiento: string;
    descripcion: string;
    estado: string;
    porcentajeAvance: number | null;
    resultadosObtenidos: string | null;
    eficacia: string | null;
  }>;
};

function responseStatus(response: RiskControlState["p04Response"]): string {
  if (!response) return "Sin respuesta registrada";
  if (response.noAplica === 1) return "Marcado como no aplica";
  if (response.cumple === 1) return "Marcado como cumple en la evaluación";
  if (response.cumple === 0) return "Marcado como no cumple en la evaluación";
  return "Pendiente de valoración";
}

export default function PesvInformeAnualRiesgosControl() {
  const { selectedCompany } = useCompanyContext();
  const { data, isLoading, isError, refetch } = useQuery<RiskControlState>({
    queryKey: ["/api/pesv/informes-anuales/riesgos-seguridad-vial/evidencias", selectedCompany?.id],
  });

  const activeRisks = data?.risks.filter((risk) => risk.activo !== 0) ?? [];
  const activeRiskIds = new Set(activeRisks.map((risk) => risk.id));
  const activeTreatments = data?.treatments.filter((item) => activeRiskIds.has(item.riesgoVialId)) ?? [];
  const risksWithoutTreatment = activeRisks.filter((risk) =>
    !activeTreatments.some((item) => item.riesgoVialId === risk.id),
  );
  const completedTreatments = activeTreatments.filter((item) =>
    item.estado.toLocaleLowerCase("es-CO") === "implementado" || (item.porcentajeAvance ?? 0) >= 100,
  );
  const verifiedCriteria = data?.criteria.filter((item) => item.verificado === 1).length ?? 0;
  const attachedDocuments = data?.documents.filter((item) => Boolean(item.archivoUrl)).length ?? 0;

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-6" data-testid="annual-pesv-risk-control-report">
      <Button variant="ghost" asChild className="-ml-3">
        <Link href="/pesv/informes-anuales">
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Volver a informes anuales
        </Link>
      </Button>

      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">PESV · Informe anual SISI/PESV · 9</p>
        <h1 className="text-2xl font-bold md:text-3xl">Evaluación y control de riesgos en seguridad vial</h1>
        <p className="max-w-3xl text-muted-foreground">
          Pregunta: ¿Se tiene definido y aplicado un procedimiento de evaluación y control de riesgos en seguridad vial?
        </p>
        <p className="text-sm font-medium">Evidencia solicitada: Copia en PDF</p>
        {data?.isTestCompany && <Badge variant="outline">Prueba funcional · DEMO-PRUEBA</Badge>}
      </header>

      {isLoading ? (
        <Card><CardContent className="p-6 text-muted-foreground">Consultando la evaluación P04, la matriz y los tratamientos…</CardContent></Card>
      ) : isError ? (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>No se pudieron consultar las fuentes de P04</AlertTitle>
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
                <CardDescription>P04 · Evaluación PESV · Matriz de Riesgos Viales</CardDescription>
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
                <AlertDescription>La pantalla y el PDF se identifican como prueba funcional. No presentes ese documento como evidencia real.</AlertDescription>
              </Alert>
            )}
            <Alert>
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>Los registros no confirman por sí solos la aplicación del procedimiento</AlertTitle>
              <AlertDescription>
                Revisa las medidas, su avance, los criterios P04 y los soportes adjuntos. La evaluación no declara cumplimiento automáticamente ni infiere evidencia para atención a víctimas desde otras categorías.
              </AlertDescription>
            </Alert>

            <div className="rounded-md border bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground">Valoración P04 en la evaluación más reciente</p>
              <p className="mt-1 font-medium">
                {data.evaluation ? `Evaluación ${data.evaluation.anio} · ${data.evaluation.estado}` : "No hay evaluación PESV registrada"} · {responseStatus(data.p04Response)}
              </p>
              {data.p04Response?.evidencias && <p className="mt-2 text-sm text-muted-foreground">Evidencia descrita: {data.p04Response.evidencias}</p>}
              {data.p04Response?.observaciones && <p className="mt-2 text-sm text-muted-foreground">Observaciones: {data.p04Response.observaciones}</p>}
              {data.evaluation && (
                <div className="mt-2">
                  <Button variant="ghost" className="h-auto px-0 text-primary underline-offset-4 hover:underline" asChild>
                    <Link href={`/pesv/evaluacion/${data.evaluation.id}`}>Abrir evaluación P04</Link>
                  </Button>
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-md border p-4"><p className="text-sm text-muted-foreground">Riesgos activos</p><p className="text-2xl font-semibold">{activeRisks.length}</p></div>
              <div className="rounded-md border p-4"><p className="text-sm text-muted-foreground">Riesgos sin tratamiento</p><p className="text-2xl font-semibold">{risksWithoutTreatment.length}</p></div>
              <div className="rounded-md border p-4"><p className="text-sm text-muted-foreground">Tratamientos implementados / 100 %</p><p className="text-2xl font-semibold">{completedTreatments.length} / {activeTreatments.length}</p></div>
              <div className="rounded-md border p-4"><p className="text-sm text-muted-foreground">Criterios P04 verificados</p><p className="text-2xl font-semibold">{verifiedCriteria} / {data.criteria.length}</p></div>
            </div>

            <div className="overflow-x-auto rounded-md border">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-muted/50"><tr>
                  <th className="p-3 font-medium">Componente</th>
                  <th className="p-3 font-medium">Estado / información registrada</th>
                  <th className="p-3 font-medium">Módulo fuente</th>
                </tr></thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-3 font-medium">Riesgos viales</td>
                    <td className="p-3">{activeRisks.length} activos · {risksWithoutTreatment.length} sin tratamiento asociado</td>
                    <td className="p-3"><Button variant="outline" size="sm" asChild><Link href="/pesv/matriz-riesgos">Abrir Matriz de Riesgos Viales</Link></Button></td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3 font-medium">Tratamientos y seguimiento</td>
                    <td className="p-3">{activeTreatments.length} tratamientos · {completedTreatments.length} implementados o con avance 100 %</td>
                    <td className="p-3"><Button variant="outline" size="sm" asChild><Link href="/pesv/matriz-riesgos">Abrir tratamientos en P04</Link></Button></td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3 font-medium">Criterios de verificación P04</td>
                    <td className="p-3">{verifiedCriteria} de {data.criteria.length} criterios verificados</td>
                    <td className="p-3">{data.evaluation ? <Button variant="outline" size="sm" asChild><Link href={`/pesv/evaluacion/${data.evaluation.id}`}>Abrir evaluación PESV</Link></Button> : "Sin evaluación fuente"}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-3 font-medium">Soportes documentales P04</td>
                    <td className="p-3">{attachedDocuments} de {data.documents.length} evidencias con archivo asociado</td>
                    <td className="p-3">{data.evaluation ? <Button variant="outline" size="sm" asChild><Link href={`/pesv/evaluacion/${data.evaluation.id}`}>Revisar evidencias P04</Link></Button> : "Sin evaluación fuente"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {data.documents.some((item) => item.archivoUrl) && (
              <div className="space-y-2">
                <h2 className="font-semibold">Soportes documentales registrados</h2>
                {data.documents.filter((item) => item.archivoUrl).map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm">
                    <span>{item.evidenciaTexto} · {item.archivoNombre || "Archivo adjunto"}</span>
                    <a className="inline-flex items-center text-primary underline" href={item.archivoUrl!} target="_blank" rel="noreferrer">
                      Abrir archivo <ExternalLink className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
              <Button onClick={() => openCompanyDocument(
                "/api/pesv/informes-anuales/riesgos-seguridad-vial.pdf",
                selectedCompany?.id,
              )} data-testid="button-download-pesv-annual-risk-control">
                <Download className="mr-2 h-4 w-4" />
                Descargar informe consolidado PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}

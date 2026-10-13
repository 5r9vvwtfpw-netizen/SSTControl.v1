import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, FileText, TriangleAlert } from "lucide-react";
import { Link } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompanyContext } from "@/hooks/use-company-context";
import { openCompanyDocument } from "@/lib/company-context-url";
import { formatDateCO } from "@/lib/utils/formatters";
import type { ResponsibleDesignation, Worker } from "@shared/schema";

const pesvPositionNames = new Set(["responsable del pesv", "líder del pesv"]);

export default function PesvInformeAnualResponsable() {
  const { selectedCompany } = useCompanyContext();
  const { data: designations = [], isLoading, isError } = useQuery<ResponsibleDesignation[]>({
    queryKey: ["/api/responsible-designations"],
  });
  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const currentDesignation = useMemo(
    () => designations
      .filter((item) => pesvPositionNames.has(item.position.trim().toLocaleLowerCase("es-CO")) && item.status === "activo")
      .sort((a, b) => b.designationDate.localeCompare(a.designationDate))[0],
    [designations],
  );
  const designatedWorker = currentDesignation?.workerId
    ? workers.find((worker) => worker.id === currentDesignation.workerId)
    : undefined;
  const responsibleName = currentDesignation?.isExternalLso
    ? currentDesignation.externalLsoName
    : designatedWorker?.name;

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-6" data-testid="annual-pesv-responsible-report">
      <Button variant="ghost" asChild>
        <Link href="/pesv/informes-anuales"><ArrowLeft className="mr-2 h-4 w-4" />Volver a informes anuales</Link>
      </Button>

      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">PESV · Informe anual SISI/PESV</p>
        <h1 className="text-2xl font-bold md:text-3xl">Designación del Responsable del PESV</h1>
        <p className="max-w-3xl text-muted-foreground">
          Verifica la designación vigente y consulta el acta de la empresa. El documento incluye las funciones, facultades delegadas, articulación con el SG-SST y espacios de firma del Representante Legal y de la persona designada.
        </p>
      </header>

      {isError ? (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>No se pudo consultar la designación</AlertTitle>
          <AlertDescription>Vuelve a intentarlo o abre el módulo de designaciones para revisar el registro de la empresa.</AlertDescription>
        </Alert>
      ) : isLoading ? (
        <Card><CardContent className="p-6 text-muted-foreground">Consultando la designación de la empresa…</CardContent></Card>
      ) : currentDesignation ? (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>{selectedCompany?.name || "Empresa"}</CardTitle>
                <CardDescription>
                  {responsibleName || "Persona designada"} · Designación del {formatDateCO(currentDesignation.designationDate)}
                </CardDescription>
              </div>
              <Badge>Designación activa</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border p-4">
              <div className="flex items-center gap-2 font-medium"><FileText className="h-4 w-4" />Evidencia de designación</div>
              <p className="mt-2 text-sm text-muted-foreground">
                El acta se genera con los datos registrados. Para que conste la aceptación, debe quedar firmada por el Representante Legal y la persona designada.
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href="/designacion-responsable">Revisar designación</Link>
              </Button>
              <Button onClick={() => openCompanyDocument(`/api/responsible-designations/${currentDesignation.id}/acta-pdf`)}>
                <Download className="mr-2 h-4 w-4" />Descargar acta PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>No hay un Responsable del PESV con designación activa</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>Registra la designación en el módulo existente. Después podrás volver aquí para consultar y descargar el acta de esta empresa.</p>
            <Button asChild size="sm"><Link href="/designacion-responsable">Abrir designaciones</Link></Button>
          </AlertDescription>
        </Alert>
      )}
    </main>
  );
}

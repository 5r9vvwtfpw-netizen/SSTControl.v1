import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText, TriangleAlert } from "lucide-react";
import { Link } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompanyContext } from "@/hooks/use-company-context";
import { openCompanyDocument } from "@/lib/company-context-url";
import { formatDateCO } from "@/lib/utils/formatters";
import type { ActoAdministrativoPesv, ComiteIntegrantePesv } from "@shared/schema";

export default function PesvInformeAnualComite() {
  const { selectedCompany } = useCompanyContext();
  const { data: acts = [], isLoading: actsLoading, isError: actsError } = useQuery<ActoAdministrativoPesv[]>({
    queryKey: ["/api/pesv/comite/actos-administrativos"],
  });
  const { data: members = [], isLoading: membersLoading, isError: membersError } = useQuery<ComiteIntegrantePesv[]>({
    queryKey: ["/api/pesv/comite/integrantes"],
  });

  const currentAct = useMemo(
    () => acts.filter((act) => act.estado === "vigente").sort((a, b) => b.fechaExpedicion.localeCompare(a.fechaExpedicion))[0],
    [acts],
  );
  const activeMembers = members.filter((member) => member.estado === "activo");
  const loading = actsLoading || membersLoading;
  const hasError = actsError || membersError;

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-6" data-testid="annual-pesv-committee-report">
      <Button variant="ghost" asChild>
        <Link href="/pesv/informes-anuales"><ArrowLeft className="mr-2 h-4 w-4" />Volver a informes anuales</Link>
      </Button>
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">PESV · Informe anual SISI/PESV</p>
        <h1 className="text-2xl font-bold md:text-3xl">Existencia del Comité de Seguridad Vial</h1>
        <p className="max-w-3xl text-muted-foreground">
          Revisa la conformación registrada en el PESV y consulta la evidencia exacta que solicita el informe: copia del acta del máximo órgano social en PDF.
        </p>
      </header>

      {hasError ? (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>No se pudieron consultar los registros</AlertTitle>
          <AlertDescription>Vuelve a intentarlo o abre el módulo de conformación del equipo PESV.</AlertDescription>
        </Alert>
      ) : loading ? (
        <Card><CardContent className="p-6 text-muted-foreground">Consultando los registros del comité…</CardContent></Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{selectedCompany?.name || "Empresa"}</CardTitle>
                  <CardDescription>Información tomada del módulo Conformación del Equipo de Trabajo PESV (P01).</CardDescription>
                </div>
                {currentAct && activeMembers.length > 0
                  ? <Badge>Conformación registrada</Badge>
                  : <Badge variant="secondary">Registro incompleto</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border p-4">
                  <p className="text-sm text-muted-foreground">Integrantes activos registrados</p>
                  <p className="text-2xl font-semibold">{activeMembers.length}</p>
                </div>
                <div className="rounded-md border p-4">
                  <p className="text-sm text-muted-foreground">Acto administrativo vigente</p>
                  <p className="font-semibold">{currentAct ? `${currentAct.tipoDocumento} No. ${currentAct.numeroDocumento}` : "No registrado"}</p>
                  {currentAct && <p className="text-sm text-muted-foreground">Expedido el {formatDateCO(currentAct.fechaExpedicion)}</p>}
                </div>
              </div>

              <Alert>
                <FileText className="h-4 w-4" />
                <AlertTitle>Documento solicitado por el informe</AlertTitle>
                <AlertDescription>
                  La evidencia debe ser el acta original del máximo órgano social de la empresa. El acto administrativo PESV generado por el sistema y las actas de reuniones del comité no reemplazan ese documento.
                  El PDF original se conserva sin cambios; los documentos que genera el sistema siguen la estandarización institucional.
                </AlertDescription>
              </Alert>

              {currentAct?.actaMaximoOrganoUrl ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-green-600/30 bg-green-50/50 p-4">
                  <div>
                    <p className="font-medium">Acta original adjunta</p>
                    <p className="text-sm text-muted-foreground">{currentAct.actaMaximoOrganoFileName || "Documento PDF"}</p>
                  </div>
                  <Button onClick={() => openCompanyDocument(currentAct.actaMaximoOrganoUrl!)}>
                    <FileText className="mr-2 h-4 w-4" />Abrir evidencia PDF
                  </Button>
                </div>
              ) : (
                <Alert variant="destructive">
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle>Falta adjuntar el acta original</AlertTitle>
                  <AlertDescription>
                    {currentAct
                      ? "La empresa tiene un acto administrativo PESV vigente, pero el archivo solicitado por este informe todavía no está adjunto."
                      : "Registra primero la conformación del equipo PESV y luego adjunta el acta original del máximo órgano social."}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end">
                <Button variant="outline" asChild>
                  <Link href="/pesv/comite?tab=acto-administrativo">Abrir conformación y evidencia del comité</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}

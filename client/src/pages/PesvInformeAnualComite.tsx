import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, TriangleAlert } from "lucide-react";
import { Link } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompanyContext } from "@/hooks/use-company-context";
import { formatDateCO } from "@/lib/utils/formatters";
import type { ActaMaximoOrganoPesv, ActoAdministrativoPesv, ComiteIntegrantePesv } from "@shared/schema";

type AnnualEvidenceState = {
  companyName: string;
  companyNit: string | null;
};

export default function PesvInformeAnualComite() {
  const { selectedCompany } = useCompanyContext();
  const { data: acts = [], isLoading: actsLoading, isError: actsError } = useQuery<ActoAdministrativoPesv[]>({
    queryKey: ["/api/pesv/comite/actos-administrativos"],
  });
  const { data: members = [], isLoading: membersLoading, isError: membersError } = useQuery<ComiteIntegrantePesv[]>({
    queryKey: ["/api/pesv/comite/integrantes"],
  });
  const { data: socialBodyMinutes = [], isLoading: minutesLoading, isError: minutesError } = useQuery<ActaMaximoOrganoPesv[]>({
    queryKey: ["/api/pesv/comite/acta-maximo-organo"],
  });
  const { data: evidenceState, isLoading: evidenceLoading } = useQuery<AnnualEvidenceState>({
    queryKey: ["/api/pesv/informes-anuales/comite-seguridad-vial/evidencia"],
  });

  const currentAct = useMemo(
    () => acts.filter((act) => act.estado === "vigente").sort((a, b) => b.fechaExpedicion.localeCompare(a.fechaExpedicion))[0],
    [acts],
  );
  const activeMembers = members.filter((member) => member.estado === "activo");
  const latestSocialBodyMinute = [...socialBodyMinutes].sort((a, b) =>
    new Date(b.fechaReunion).getTime() - new Date(a.fechaReunion).getTime() || b.createdAt.getTime() - a.createdAt.getTime(),
  )[0];
  const loading = actsLoading || membersLoading || evidenceLoading || minutesLoading;
  const hasError = actsError || membersError || minutesError;

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-6" data-testid="annual-pesv-committee-report">
      <Button variant="ghost" asChild>
        <Link href="/pesv/informes-anuales"><ArrowLeft className="mr-2 h-4 w-4" />Volver a informes anuales</Link>
      </Button>
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">PESV · Informe anual SISI/PESV</p>
        <h1 className="text-2xl font-bold md:text-3xl">Existencia del Comité de Seguridad Vial</h1>
        <p className="max-w-3xl text-muted-foreground">
          Consulta la conformación registrada para el Comité de Seguridad Vial.
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
                  <CardTitle>{evidenceState?.companyName || selectedCompany?.name || "Empresa"}</CardTitle>
                  <CardDescription>
                    {evidenceState?.companyNit ? `NIT ${evidenceState.companyNit} · ` : ""}
                    Datos de conformación del módulo P01.
                  </CardDescription>
                </div>
                {currentAct && activeMembers.length > 0
                  ? <Badge>Datos registrados en P01</Badge>
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

              <div className="flex justify-end">
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    asChild={!!latestSocialBodyMinute}
                    disabled={!latestSocialBodyMinute}
                    data-testid="button-download-annual-social-act"
                  >
                    {latestSocialBodyMinute
                      ? <a href={`/api/pesv/comite/acta-maximo-organo/${latestSocialBodyMinute.id}/pdf?download=1`}><Download className="mr-2 h-4 w-4" />Descargar acta PDF</a>
                      : <span><Download className="mr-2 h-4 w-4" />Descargar acta PDF</span>}
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/pesv/comite?tab=acta-organo-social">
                      {latestSocialBodyMinute ? "Gestionar acta en P01" : "Generar acta en P01"}
                    </Link>
                  </Button>
                </div>
              </div>
              {!latestSocialBodyMinute && (
                <p className="text-sm text-muted-foreground text-right" data-testid="text-annual-act-download-requirement">
                  Registra el acta en P01; después podrás descargarla aquí para presentarla en SISI/PESV.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}

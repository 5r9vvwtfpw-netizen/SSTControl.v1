import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Download, FileSpreadsheet, FileText, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuarterlyReportMissingGuide } from "@/components/pesv/QuarterlyReportMissingGuide";
import { useCompanyContext } from "@/hooks/use-company-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, buildHeaders, getSelectedCompanyId } from "@/lib/queryClient";

type RoadSafetyPolicyReport = {
  companyName: string;
  companyNit: string;
  consultedAt: string;
  hasApprovedPolicy: boolean;
  draftExists: boolean;
  approvalIncomplete: boolean;
  policy: null | {
    id: string;
    nombre: string | null;
    codigo: string;
    version: string;
    fechaEmision: string;
    fechaProximaRevision: string;
    representanteLegal: string;
    cedulaRepresentante: string;
    fechaFirma: string;
  };
};

export default function PesvInformeTrimestralPolitica() {
  const { selectedCompany } = useCompanyContext();
  const { toast } = useToast();
  const [downloading, setDownloading] = useState("");
  const companyKey = selectedCompany?.id || getSelectedCompanyId() || "empresa-activa";
  const { data, isLoading, isError, refetch } = useQuery<RoadSafetyPolicyReport>({
    queryKey: ["/api/pesv/informes-trimestrales/politica-seguridad-vial/estado", companyKey],
    queryFn: async () => (await apiRequest("GET", "/api/pesv/informes-trimestrales/politica-seguridad-vial/estado")).json(),
  });

  const download = async (format: "pdf" | "xlsx" | "policy") => {
    const path = format === "policy"
      ? `/api/politicas-sst/${encodeURIComponent(data?.policy?.id || "")}/pdf`
      : `/api/pesv/informes-trimestrales/politica-seguridad-vial.${format}`;
    const label = format === "xlsx" ? "Excel" : "PDF";
    setDownloading(format);
    try {
      const response = await fetch(path, { credentials: "include", headers: buildHeaders() });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || `No se pudo generar el archivo ${label}.`);
      }
      const objectUrl = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = format === "xlsx"
        ? `informe_politica_seguridad_vial_${data?.companyNit || "empresa"}.xlsx`
        : format === "policy"
          ? `politica_seguridad_vial_aprobada_${data?.policy?.codigo || "PESV"}.pdf`
          : `informe_politica_seguridad_vial_${data?.companyNit || "empresa"}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
      toast({ title: "Descarga iniciada", description: format === "policy" ? "Se descargó la copia PDF de la política vigente." : `Se descargó el informe en ${label}.` });
    } catch (error) {
      toast({ title: "No se pudo descargar", description: error instanceof Error ? error.message : "Intenta nuevamente.", variant: "destructive" });
    } finally {
      setDownloading("");
    }
  };

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-6" data-testid="pesv-quarterly-policy-report">
      <Button variant="ghost" size="sm" asChild><Link href="/pesv/informes-trimestrales"><ArrowLeft className="mr-2 h-4 w-4" />Volver a informes trimestrales</Link></Button>
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">PESV · Informe trimestral</p>
        <h1 className="text-2xl font-bold md:text-3xl">Política de Seguridad Vial</h1>
        <p className="max-w-3xl text-muted-foreground">Verifica si hay una política de Seguridad Vial vigente registrada y descarga su copia aprobada en PDF.</p>
      </header>

      {isLoading ? <Card><CardContent className="p-6 text-muted-foreground">Consultando la política registrada…</CardContent></Card> : null}
      {isError ? <Alert variant="destructive"><TriangleAlert className="h-4 w-4" /><AlertTitle>No se pudo consultar el informe</AlertTitle><AlertDescription><Button variant="outline" className="mt-2" onClick={() => refetch()}>Reintentar</Button></AlertDescription></Alert> : null}
      {data && (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><CardTitle>{data.companyName}</CardTitle><CardDescription>NIT {data.companyNit} · Consulta {new Date(data.consultedAt).toLocaleDateString("es-CO")}</CardDescription></div>
              <Badge variant={data.hasApprovedPolicy ? "default" : "destructive"}>{data.hasApprovedPolicy ? "Política vigente registrada" : "No hay política vigente registrada"}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <section className="rounded-md border p-4" data-testid="road-safety-policy-answer">
              <p className="text-sm text-muted-foreground">¿Cuenta con Política de Seguridad Vial aprobada y vigente?</p>
              <p className="mt-1 text-xl font-semibold">{data.hasApprovedPolicy ? "Sí" : "No"}</p>
              {data.policy ? (
                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  <div><dt className="text-muted-foreground">Documento</dt><dd className="font-medium">{data.policy.nombre || data.policy.codigo}</dd></div>
                  <div><dt className="text-muted-foreground">Código · versión</dt><dd className="font-medium">{data.policy.codigo} · {data.policy.version}</dd></div>
                  <div><dt className="text-muted-foreground">Fecha de firma registrada</dt><dd className="font-medium">{data.policy.fechaFirma}</dd></div>
                  <div><dt className="text-muted-foreground">Representante Legal</dt><dd className="font-medium">{data.policy.representanteLegal} · C.C. {data.policy.cedulaRepresentante}</dd></div>
                </dl>
              ) : data.approvalIncomplete ? (
                <p className="mt-2 text-sm text-muted-foreground">Hay una política marcada como vigente, pero faltan datos de firma del Representante Legal o la fecha de firma para acreditarla como aprobada.</p>
              ) : data.draftExists ? (
                <p className="mt-2 text-sm text-muted-foreground">Hay una política en borrador, pero no cuenta como política aprobada y vigente.</p>
              ) : null}
            </section>

            <Card className="bg-muted/20">
              <CardHeader className="pb-3"><CardTitle className="text-base">Módulo fuente y evidencia</CardTitle><CardDescription>El informe reutiliza el documento oficial registrado en Políticas SST.</CardDescription></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button variant="outline" asChild><Link href="/politica-sst">Abrir Políticas SST · Paso P03</Link></Button>
                {data.policy && <Button onClick={() => download("policy")} disabled={!!downloading}><FileText className="mr-2 h-4 w-4" />Descargar copia aprobada en PDF</Button>}
              </CardContent>
            </Card>

            {!data.hasApprovedPolicy && (
              <QuarterlyReportMissingGuide guide={{
                key: "politica-seguridad-vial",
                title: "Política de Seguridad Vial aprobada",
                 missing: [data.approvalIncomplete
                   ? "El registro vigente no tiene completos el nombre e identificación del Representante Legal y la fecha de firma."
                   : data.draftExists ? "La política encontrada aún está en borrador." : "No se encontró una política de Seguridad Vial vigente."],
                step: "P03 — Política de Seguridad Vial",
                route: "PESV > Planear > Políticas SST",
                instruction: "Registra o actualiza la política en el módulo fuente, apruébala y vuelve a consultar el informe. No se genera ni se supone una política por ausencia de datos.",
                actions: [{ href: "/politica-sst", label: "Abrir Políticas SST (P03)" }],
              }} />
            )}

            <div className="flex flex-wrap gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => download("pdf")} disabled={!!downloading}><Download className="mr-2 h-4 w-4" />{downloading === "pdf" ? "Generando…" : "Descargar informe PDF"}</Button>
              <Button variant="outline" onClick={() => download("xlsx")} disabled={!!downloading}><FileSpreadsheet className="mr-2 h-4 w-4" />{downloading === "xlsx" ? "Generando…" : "Descargar informe Excel"}</Button>
            </div>
            <p className="text-xs text-muted-foreground">El informe consulta el estado vigente hoy; el módulo fuente no conserva historial suficiente para reconstruir si la política estuvo vigente en trimestres anteriores.</p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, FileText, FileWarning } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyContext } from "@/hooks/use-company-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, buildHeaders, getSelectedCompanyId } from "@/lib/queryClient";
import { useState } from "react";

type IncompleteSiniestro = {
  id: string;
  incidentDate: string | null;
  vehiclePlate: string | null;
  driverName: string | null;
  missingFields: string[];
};

type SiniestrosReportStatus = {
  companyName: string;
  companyNit: string;
  total: number;
  ready: number;
  incomplete: IncompleteSiniestro[];
};

function displayDate(value: string | null) {
  if (!value) return "Fecha pendiente";
  const match = value.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}

function getDownloadName(disposition: string | null, fallback: string) {
  const match = disposition?.match(/filename="?([^";]+)"?/i);
  return match?.[1] || fallback;
}

export default function PesvInformes() {
  const { selectedCompany } = useCompanyContext();
  const { toast } = useToast();
  const [downloading, setDownloading] = useState<"excel" | "pdf" | null>(null);
  const companyContextKey = selectedCompany?.id || getSelectedCompanyId() || "empresa-activa";

  const {
    data: status,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<SiniestrosReportStatus>({
    queryKey: ["/api/pesv/informes/siniestros/estado", companyContextKey],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/pesv/informes/siniestros/estado");
      return response.json();
    },
  });

  const downloadReport = async (format: "excel" | "pdf") => {
    const url = format === "excel"
      ? "/api/pesv/informes/siniestros.xlsx"
      : "/api/pesv/informes/siniestros.pdf";
    setDownloading(format);

    try {
      const response = await fetch(url, {
        credentials: "include",
        headers: buildHeaders(),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || "No fue posible generar el informe.");
      }

      const blob = await response.blob();
      const fallback = format === "excel"
        ? "registro_vehiculos_siniestrados.xlsx"
        : "registro_vehiculos_siniestrados.pdf";
      const filename = getDownloadName(response.headers.get("Content-Disposition"), fallback);
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
      toast({
        title: "Informe descargado",
        description: `Se descargó el archivo ${format.toUpperCase()} de siniestros PESV.`,
      });
    } catch (downloadError) {
      toast({
        title: "No se pudo descargar",
        description: downloadError instanceof Error ? downloadError.message : "Intenta nuevamente.",
        variant: "destructive",
      });
      await refetch();
    } finally {
      setDownloading(null);
    }
  };

  const reportBlocked = !status || status.total === 0 || status.incomplete.length > 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6" data-testid="pesv-informes-page">
      <div>
        <p className="text-sm font-medium text-primary">PESV · Generador de informes</p>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" data-testid="text-pesv-informes-title">
          Informes para la Superintendencia de Transporte
        </h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Los archivos se construyen con los datos de Siniestros, Vehículos, Conductores y las actas existentes del Comité PESV.
          Esta pantalla no duplica ni captura información.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Registro de vehículos siniestrados</CardTitle>
              <CardDescription className="mt-1">
                Un solo informe completo con los campos solicitados en la evidencia de la Superintendencia de Transporte.
              </CardDescription>
            </div>
            {status && (
              <Badge variant={status.incomplete.length === 0 && status.total > 0 ? "default" : "secondary"}>
                {status.incomplete.length === 0 && status.total > 0 ? "Listo para descargar" : "Requiere completar datos"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : isError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4" role="alert">
              <p className="font-medium">No se pudo consultar el estado del informe.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Verifica que tengas una empresa activa."}
              </p>
              <Button className="mt-3" variant="outline" onClick={() => refetch()}>
                Reintentar
              </Button>
            </div>
          ) : status ? (
            <>
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="rounded-md border px-4 py-3">
                  <span className="text-muted-foreground">Empresa</span>
                  <p className="font-semibold">{status.companyName} · NIT {status.companyNit}</p>
                </div>
                <div className="rounded-md border px-4 py-3">
                  <span className="text-muted-foreground">Siniestros registrados</span>
                  <p className="font-semibold">{status.total}</p>
                </div>
                <div className="rounded-md border px-4 py-3">
                  <span className="text-muted-foreground">Registros completos</span>
                  <p className="font-semibold">{status.ready}</p>
                </div>
                <div className="rounded-md border px-4 py-3">
                  <span className="text-muted-foreground">Con datos pendientes</span>
                  <p className="font-semibold">{status.incomplete.length}</p>
                </div>
              </div>

              {status.total === 0 ? (
                <div className="rounded-md border border-dashed p-6 text-center">
                  <FileWarning className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                  <p className="font-medium">No hay siniestros registrados para esta empresa.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Registra los eventos en el módulo PESV de Siniestros para que aparezcan en este informe.
                  </p>
                </div>
              ) : status.incomplete.length > 0 ? (
                <div className="space-y-3">
                  <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                      <div>
                        <p className="font-semibold">
                          No se habilita la descarga hasta completar los {status.incomplete.length} registros pendientes.
                        </p>
                        <p className="mt-1 text-sm">
                          Abre cada siniestro en el módulo existente. El informe no llenará datos que no estén registrados.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
                    {status.incomplete.map((incident) => (
                      <div
                        key={incident.id}
                        className="rounded-md border p-4"
                        data-testid={`incomplete-siniestro-${incident.id}`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">
                              {displayDate(incident.incidentDate)} · {incident.vehiclePlate || "Vehículo sin placa vinculada"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {incident.driverName || "Conductor sin nombre vinculado"}
                            </p>
                            <p className="mt-2 text-sm">
                              <span className="font-medium">Falta:</span> {incident.missingFields.join(" · ")}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/pesv/siniestros?editarSiniestro=${encodeURIComponent(incident.id)}`}>
                              Completar en Siniestros
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-md border border-emerald-300 bg-emerald-50 p-4 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  <p>Todos los siniestros tienen los datos requeridos. Puedes descargar el informe completo.</p>
                </div>
              )}

              <div className="flex flex-wrap gap-3 border-t pt-4">
                <Button
                  onClick={() => downloadReport("excel")}
                  disabled={reportBlocked || downloading !== null}
                  data-testid="button-download-siniestros-excel"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  {downloading === "excel" ? "Generando Excel…" : "Descargar Excel"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => downloadReport("pdf")}
                  disabled={reportBlocked || downloading !== null}
                  data-testid="button-download-siniestros-pdf"
                >
                  {downloading === "pdf" ? <Download className="mr-2 h-4 w-4 animate-pulse" /> : <FileText className="mr-2 h-4 w-4" />}
                  {downloading === "pdf" ? "Generando PDF…" : "Descargar PDF"}
                </Button>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

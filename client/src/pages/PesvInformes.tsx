import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, FileText, FileWarning } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  period: { from?: string; to?: string };
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

type MissingFieldGuide = {
  key: "incident" | "vehicle" | "driver" | "committee";
  title: string;
  fields: string[];
  step: string;
  route: string;
  instruction: string;
  href: string;
  actionLabel: string;
};

function getMissingFieldGuides(missingFields: string[], incidentId: string): MissingFieldGuide[] {
  const incidentFieldNames = new Set([
    "Fecha del siniestro",
    "Cantidad de personas fallecidas",
    "Cantidad de heridos graves",
    "Cantidad de heridos leves",
    "Cantidad de personas en choque simple",
    "Al menos una persona clasificada por nivel de pérdida",
    "Consecutivo IPAT en RNAT/RUNT",
    "Organismo de tránsito o autoridad del IPAT",
  ]);
  const vehicleFieldNames = new Set(["Placa del vehículo"]);
  const driverFieldNames = new Set(["Nombre del conductor", "Identificación del conductor"]);
  const committeeFieldNames = new Set(["Acta y fecha del comité que analizó el siniestro"]);
  const knownFieldNames = new Set([
    ...incidentFieldNames,
    ...vehicleFieldNames,
    ...driverFieldNames,
    ...committeeFieldNames,
  ]);
  const unknownFields = missingFields.filter((field) => !knownFieldNames.has(field));
  const definitions: MissingFieldGuide[] = [
    {
      key: "incident",
      title: "Registro del siniestro",
      fields: missingFields.filter((field) => incidentFieldNames.has(field)).concat(unknownFields),
      step: "Paso 21 (V02) — Verificar: Registro y análisis de siniestros viales",
      route: "PESV > Evaluaciones PESV > Paso 21 (V02) > Siniestros Viales",
      instruction: "Completa estos datos en el registro del siniestro y guarda los cambios.",
      href: `/pesv/siniestros?editarSiniestro=${encodeURIComponent(incidentId)}`,
      actionLabel: "Abrir este siniestro (V02)",
    },
    {
      key: "vehicle",
      title: "Vehículo de la empresa",
      fields: missingFields.filter((field) => vehicleFieldNames.has(field)),
      step: "Paso 12 (H04) — Hacer: Gestión de vehículos seguros",
      route: "PESV > Evaluaciones PESV > Paso 12 (H04) > Vehículos PESV",
      instruction: "Registra o corrige la placa del vehículo; después vuelve al siniestro y verifica que esté vinculado.",
      href: "/pesv/vehiculos",
      actionLabel: "Abrir Vehículos PESV (H04)",
    },
    {
      key: "driver",
      title: "Conductor de la empresa",
      fields: missingFields.filter((field) => driverFieldNames.has(field)),
      step: "Paso 9 (H01) — Hacer: Fortalecimiento institucional - Factor Humano",
      route: "PESV > Evaluaciones PESV > Paso 9 (H01) > Conductores PESV",
      instruction: "Registra o corrige el nombre y la identificación; después vuelve al siniestro y verifica que esté vinculado.",
      href: "/pesv/conductores",
      actionLabel: "Abrir Conductores PESV (H01)",
    },
    {
      key: "committee",
      title: "Acta que analizó el siniestro",
      fields: missingFields.filter((field) => committeeFieldNames.has(field)),
      step: "Paso 1 (P01) — Planear: Conformación del equipo de trabajo",
      route: "PESV > Evaluaciones PESV > Paso 1 (P01) > Comité PESV > pestaña Actas",
      instruction: "Registra el acta y su fecha en P01. Luego vuelve a este siniestro y selecciona esa acta para vincularla.",
      href: "/pesv/comite?tab=actas",
      actionLabel: "Abrir Actas del Comité PESV (P01)",
    },
  ];

  return definitions.filter((guide) => guide.fields.length > 0);
}

export default function PesvInformes() {
  const { selectedCompany } = useCompanyContext();
  const { toast } = useToast();
  const [downloading, setDownloading] = useState<"excel" | "pdf" | null>(null);
  const [draftPeriod, setDraftPeriod] = useState({ from: "", to: "" });
  const [appliedPeriod, setAppliedPeriod] = useState({ from: "", to: "" });
  const companyContextKey = selectedCompany?.id || getSelectedCompanyId() || "empresa-activa";
  const periodIsReversed = Boolean(
    draftPeriod.from && draftPeriod.to && draftPeriod.from > draftPeriod.to,
  );
  const hasAppliedPeriod = Boolean(appliedPeriod.from || appliedPeriod.to);

  const withPeriodQuery = (path: string) => {
    const params = new URLSearchParams();
    if (appliedPeriod.from) params.set("from", appliedPeriod.from);
    if (appliedPeriod.to) params.set("to", appliedPeriod.to);
    const query = params.toString();
    return query ? `${path}?${query}` : path;
  };

  const {
    data: status,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<SiniestrosReportStatus>({
    queryKey: [
      "/api/pesv/informes/siniestros/estado",
      companyContextKey,
      appliedPeriod.from,
      appliedPeriod.to,
    ],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        withPeriodQuery("/api/pesv/informes/siniestros/estado"),
      );
      return response.json();
    },
  });

  const applyPeriod = () => {
    if (periodIsReversed) {
      toast({
        title: "Revisa las fechas",
        description: "La fecha inicial no puede ser posterior a la fecha final.",
        variant: "destructive",
      });
      return;
    }
    setAppliedPeriod({ ...draftPeriod });
  };

  const showAllRecords = () => {
    const emptyPeriod = { from: "", to: "" };
    setDraftPeriod(emptyPeriod);
    setAppliedPeriod(emptyPeriod);
  };

  const downloadReport = async (format: "excel" | "pdf") => {
    const url = format === "excel"
      ? withPeriodQuery("/api/pesv/informes/siniestros.xlsx")
      : withPeriodQuery("/api/pesv/informes/siniestros.pdf");
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
        <p className="text-sm font-medium text-primary">PESV · Informe mensual</p>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl" data-testid="text-pesv-informes-title">
          Informe mensual para la Superintendencia de Transporte
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
          <div className="space-y-3 rounded-md border p-4">
            <div>
              <h3 className="font-semibold">Período del informe</h3>
              <p className="text-sm text-muted-foreground">
                Deja las fechas en blanco para consultar todos los siniestros. Al elegir fechas, el archivo indicará el período incluido.
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <label className="grid gap-1 text-sm">
                <span>Desde</span>
                <Input
                  type="date"
                  value={draftPeriod.from}
                  onChange={(event) => setDraftPeriod((current) => ({ ...current, from: event.target.value }))}
                  data-testid="input-pesv-report-from"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span>Hasta</span>
                <Input
                  type="date"
                  value={draftPeriod.to}
                  onChange={(event) => setDraftPeriod((current) => ({ ...current, to: event.target.value }))}
                  data-testid="input-pesv-report-to"
                />
              </label>
              <Button
                variant="outline"
                onClick={applyPeriod}
                disabled={downloading !== null || periodIsReversed}
                data-testid="button-apply-pesv-report-period"
              >
                Aplicar período
              </Button>
              <Button
                variant="ghost"
                onClick={showAllRecords}
                disabled={downloading !== null || (!hasAppliedPeriod && !draftPeriod.from && !draftPeriod.to)}
              >
                Ver todos
              </Button>
            </div>
            {periodIsReversed && (
              <p className="text-sm text-destructive" role="alert">
                La fecha inicial no puede ser posterior a la fecha final.
              </p>
            )}
          </div>

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
                  <span className="text-muted-foreground">
                    {hasAppliedPeriod ? "Siniestros dentro del período" : "Siniestros registrados"}
                  </span>
                  <p className="font-semibold" data-testid="text-pesv-report-total">{status.total}</p>
                </div>
                <div className="rounded-md border px-4 py-3">
                  <span className="text-muted-foreground">Registros completos</span>
                  <p className="font-semibold" data-testid="text-pesv-report-ready">{status.ready}</p>
                </div>
                <div className="rounded-md border px-4 py-3">
                  <span className="text-muted-foreground">Con datos pendientes</span>
                  <p className="font-semibold" data-testid="text-pesv-report-incomplete">{status.incomplete.length}</p>
                </div>
              </div>
              {hasAppliedPeriod && (
                <p className="text-sm text-muted-foreground" data-testid="text-pesv-report-period">
                  Período consultado: {appliedPeriod.from ? displayDate(appliedPeriod.from) : "Inicio"}
                  {" al "}
                  {appliedPeriod.to ? displayDate(appliedPeriod.to) : "Actualidad"}
                </p>
              )}

              {status.total === 0 ? (
                <div className="rounded-md border border-dashed p-6 text-center">
                  <FileWarning className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                  <p className="font-medium">
                    {hasAppliedPeriod
                      ? "No hay siniestros registrados en el período seleccionado."
                      : "No hay siniestros registrados para esta empresa."}
                  </p>
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
                          No se habilita la descarga hasta completar los {status.incomplete.length} registros pendientes
                          {hasAppliedPeriod ? " del período seleccionado." : " de la empresa."}
                        </p>
                        <p className="mt-1 text-sm">
                          Cada pendiente indica el paso y módulo del PESV donde debes completarlo. Luego regresa al informe para verificarlo.
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
                            <div className="mt-3 space-y-3">
                              {getMissingFieldGuides(incident.missingFields, incident.id).map((guide) => (
                                <div
                                  key={guide.key}
                                  className="rounded-md border bg-muted/30 p-3"
                                  data-testid={`missing-guidance-${guide.key}-${incident.id}`}
                                >
                                  <p className="font-medium">{guide.title}</p>
                                  <p className="mt-1 text-sm">
                                    <span className="font-medium">Falta:</span> {guide.fields.join(" · ")}
                                  </p>
                                  <p className="mt-2 text-sm">
                                    <span className="font-medium">Paso del PESV:</span> {guide.step}
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium">Ruta:</span> {guide.route}
                                  </p>
                                  <p className="mt-1 text-sm text-muted-foreground">{guide.instruction}</p>
                                  <Button className="mt-3" variant="outline" size="sm" asChild>
                                    <Link
                                      href={guide.href}
                                      data-testid={`missing-guidance-link-${guide.key}-${incident.id}`}
                                    >
                                      {guide.actionLabel}
                                    </Link>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/pesv/siniestros?editarSiniestro=${encodeURIComponent(incident.id)}`}>
                              Volver a este siniestro (V02)
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
                  <p>
                    {hasAppliedPeriod
                      ? "Todos los siniestros del período seleccionado tienen los datos requeridos. Puedes descargar el informe del período."
                      : "Todos los siniestros tienen los datos requeridos. Puedes descargar el informe completo."}
                  </p>
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

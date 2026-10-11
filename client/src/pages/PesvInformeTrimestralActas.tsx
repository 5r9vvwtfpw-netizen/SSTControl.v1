import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, CheckCircle2, Download, FileSpreadsheet, FileText } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCompanyContext } from "@/hooks/use-company-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, buildHeaders, getSelectedCompanyId } from "@/lib/queryClient";

type ActaEvidenceRecord = {
  meetingId: string;
  scheduledDate: string;
  meetingTopic: string | null;
  meetingState: string;
  frequency: string;
  actaId: string | null;
  numeroActa: number | null;
  fechaReunion: string | null;
  estado: string | null;
  temasOrdenDia: string | null;
  desarrolloReunion: string | null;
  compromisos: string | null;
  observaciones: string | null;
};

type ActaReportStatus = {
  companyName: string;
  companyNit: string;
  total: number;
  ready: number;
  incomplete: Array<{
    meetingId: string;
    scheduledDate: string;
    meetingTopic: string | null;
    actaId: string | null;
    missing: string[];
  }>;
  records: ActaEvidenceRecord[];
};

function getQuarterPeriod(year: number, quarter: number) {
  const fromMonth = (quarter - 1) * 3;
  const format = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return { from: format(new Date(year, fromMonth, 1)), to: format(new Date(year, fromMonth + 3, 0)) };
}

function displayDate(value?: string | null) {
  if (!value) return "—";
  const date = value.slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return date ? `${date[3]}/${date[2]}/${date[1]}` : value;
}

export default function PesvInformeTrimestralActas() {
  const { selectedCompany } = useCompanyContext();
  const { toast } = useToast();
  const today = new Date();
  const [quarter, setQuarter] = useState(Math.floor(today.getMonth() / 3) + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [downloading, setDownloading] = useState<"excel" | "pdf" | null>(null);
  const period = getQuarterPeriod(year, quarter);
  const companyKey = selectedCompany?.id || getSelectedCompanyId() || "empresa-activa";
  const query = new URLSearchParams(period).toString();
  const { data, isLoading, isError, refetch } = useQuery<ActaReportStatus>({
    queryKey: ["/api/pesv/informes-trimestrales/actas-siniestros/estado", companyKey, period.from, period.to],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/pesv/informes-trimestrales/actas-siniestros/estado?${query}`);
      return response.json();
    },
  });

  const blocked = !data || data.incomplete.length > 0 || data.total === 0;
  const download = async (format: "excel" | "pdf") => {
    setDownloading(format);
    try {
      const path = format === "excel"
        ? "/api/pesv/informes-trimestrales/actas-siniestros.xlsx"
        : "/api/pesv/informes-trimestrales/actas-siniestros.pdf";
      const response = await fetch(`${path}?${query}`, {
        credentials: "include",
        headers: buildHeaders(),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || "No fue posible generar el informe.");
      }
      const objectUrl = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `actas_comite_pesv_siniestros_T${quarter}_${year}.${format === "excel" ? "xlsx" : "pdf"}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
      toast({ title: "Informe descargado", description: `Se descargó el informe trimestral en ${format.toUpperCase()}.` });
    } catch (error) {
      toast({ title: "No se pudo descargar", description: error instanceof Error ? error.message : "Intenta nuevamente.", variant: "destructive" });
      await refetch();
    } finally {
      setDownloading(null);
    }
  };

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-6" data-testid="pesv-quarterly-actas-report-page">
      <header>
        <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2">
          <Link href="/pesv/informes-trimestrales"><ArrowLeft className="mr-2 h-4 w-4" />Volver a informes trimestrales</Link>
        </Button>
        <p className="text-sm font-medium text-primary">PESV · Informe trimestral</p>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl">Copias de actas del Comité PESV</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Toma las reuniones programadas en el Cronograma del Comité PESV durante el trimestre y reúne sus actas en un solo PDF para cargar ante la entidad.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Período del informe</CardTitle>
          <CardDescription>Selecciona el trimestre y año que se van a consultar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-end gap-3">
            <label className="grid gap-1 text-sm">
              <span>Trimestre</span>
              <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={quarter} onChange={(event) => setQuarter(Number(event.target.value))}>
                <option value={1}>Primer trimestre (enero–marzo)</option>
                <option value={2}>Segundo trimestre (abril–junio)</option>
                <option value={3}>Tercer trimestre (julio–septiembre)</option>
                <option value={4}>Cuarto trimestre (octubre–diciembre)</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span>Año</span>
              <Input type="number" min={2000} max={today.getFullYear() + 1} value={year} onChange={(event) => setYear(Number(event.target.value))} />
            </label>
            {data && (
              <>
                <Badge variant="secondary">{data.total} reunión(es) programada(s)</Badge>
                <Badge variant={data.incomplete.length ? "destructive" : "default"}>{data.ready} con acta completa</Badge>
              </>
            )}
          </div>

          {isLoading ? <p className="text-sm text-muted-foreground">Consultando actas…</p> : null}
          {isError ? (
            <div role="alert" className="rounded-md border border-destructive/30 p-4">
              <p>No se pudo consultar la información del trimestre.</p>
              <Button className="mt-2" variant="outline" onClick={() => refetch()}>Reintentar</Button>
            </div>
          ) : null}

          {data && data.total === 0 && (
            <div className="space-y-3 rounded-md border border-dashed p-5">
              <p className="font-medium">No hay reuniones programadas en el Cronograma PESV para el trimestre consultado.</p>
              <Button asChild size="sm" variant="outline"><Link href="/pesv/comite?tab=cronograma">Revisar Cronograma del Comité PESV (P01)</Link></Button>
            </div>
          )}

          {data && data.incomplete.length > 0 && (
            <div className="space-y-3">
              <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-950">
                <p className="font-semibold"><AlertCircle className="mr-2 inline h-4 w-4" />Hay reuniones del cronograma sin acta trimestral lista.</p>
                <p className="mt-1 text-sm">Completa el acta en Comité PESV, apruébala y vincúlala a la reunión programada.</p>
              </div>
              {data.incomplete.map((incident) => (
                <div key={incident.meetingId} className="rounded-md border p-4">
                  <p className="font-medium">{displayDate(incident.scheduledDate)} · {incident.meetingTopic || "Reunión del Comité PESV"}</p>
                  <ul className="mt-2 list-disc pl-5 text-sm">{incident.missing.map((field) => <li key={field}>{field}</li>)}</ul>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline"><Link href="/pesv/comite?tab=cronograma">Abrir Cronograma del Comité PESV (P01)</Link></Button>
                    <Button asChild size="sm" variant="outline"><Link href="/pesv/comite?tab=actas">Abrir Actas del Comité PESV (P01)</Link></Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {data && data.total > 0 && data.incomplete.length === 0 && (
            <>
              <div className="flex items-start gap-2 rounded-md border border-emerald-300 bg-emerald-50 p-4 text-emerald-950">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <p>Las actas vinculadas contienen desarrollo de la investigación interna y están aprobadas. El PDF incluirá las copias generadas desde el Comité PESV.</p>
              </div>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50 text-left"><th className="p-3">Fecha programada</th><th className="p-3">Frecuencia / tema</th><th className="p-3">Acta</th><th className="p-3">Estado</th></tr></thead>
                  <tbody>{data.records.map((record) => (
                    <tr key={record.meetingId} className="border-b last:border-0">
                      <td className="p-3">{displayDate(record.scheduledDate)}</td>
                      <td className="p-3">{record.frequency} · {record.meetingTopic || "—"}</td>
                      <td className="p-3">{record.numeroActa ?? "—"} · {displayDate(record.fechaReunion)}</td>
                      <td className="p-3">{record.estado}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </>
          )}

          <div className="flex flex-wrap gap-3 border-t pt-4">
            <Button onClick={() => download("excel")} disabled={blocked || downloading !== null}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />{downloading === "excel" ? "Generando Excel…" : "Descargar Excel"}
            </Button>
            <Button variant="outline" onClick={() => download("pdf")} disabled={blocked || downloading !== null}>
              <FileText className="mr-2 h-4 w-4" />{downloading === "pdf" ? <Download className="mr-2 h-4 w-4 animate-pulse" /> : null}Descargar PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

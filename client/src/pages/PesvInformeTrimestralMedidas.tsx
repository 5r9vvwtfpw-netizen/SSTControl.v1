import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Download, FileCheck2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { apiRequest, buildHeaders, getSelectedCompanyId } from "@/lib/queryClient";
import { useCompanyContext } from "@/hooks/use-company-context";
import { useToast } from "@/hooks/use-toast";

type ReportState = {
  companyName: string;
  companyNit: string;
  representativeName: string | null;
  routeMeasures: number;
  gpsExpenses: number;
  gpsExpensesTotalCop: number;
  gpsMonitoringRecords: number;
  speedAlerts: number;
  missing: string[];
};

function quarterDates(year: number, quarter: number) {
  const firstMonth = (quarter - 1) * 3;
  const format = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return { from: format(new Date(year, firstMonth, 1)), to: format(new Date(year, firstMonth + 3, 0)) };
}

export default function PesvInformeTrimestralMedidas() {
  const { selectedCompany } = useCompanyContext();
  const { toast } = useToast();
  const now = new Date();
  const [quarter, setQuarter] = useState(Math.floor(now.getMonth() / 3) + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [confirmed, setConfirmed] = useState(false);
  const period = quarterDates(year, quarter);
  const companyKey = selectedCompany?.id || getSelectedCompanyId() || "empresa-activa";
  const params = new URLSearchParams(period).toString();
  const { data, isLoading, isError, refetch } = useQuery<ReportState>({
    queryKey: ["/api/pesv/informes-trimestrales/medidas-prevencion/estado", companyKey, period.from, period.to],
    queryFn: async () => (await apiRequest("GET", `/api/pesv/informes-trimestrales/medidas-prevencion/estado?${params}`)).json(),
  });

  const download = async () => {
    try {
      const response = await fetch(`/api/pesv/informes-trimestrales/medidas-prevencion.pdf?${params}&confirm=1`, {
        credentials: "include",
        headers: buildHeaders(),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || "No fue posible generar la certificación.");
      }
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `certificacion_medidas_prevencion_${period.from}_${period.to}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast({ title: "Certificación descargada", description: "Revisa el documento y sus soportes antes de presentarlo." });
    } catch (error) {
      toast({ title: "No se pudo generar el documento", description: error instanceof Error ? error.message : "Error inesperado", variant: "destructive" });
    }
  };

  return (
    <main className="container mx-auto max-w-5xl space-y-6 py-6">
      <Button asChild variant="ghost" size="sm"><Link href="/pesv/informes-trimestrales"><ArrowLeft className="mr-2 h-4 w-4" />Volver a informes trimestrales</Link></Button>
      <header>
        <p className="text-sm font-medium text-primary">PESV · Informe trimestral</p>
        <h1 className="text-2xl font-bold md:text-3xl">Certificación de medidas para prevenir la accidentalidad</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Consolida señalización, controles y gestión de rutas (H08), junto con operación GPS, alertas de velocidad y gastos registrados (H07). Revisa la información antes de emitir la certificación firmada por el Representante Legal.
        </p>
      </header>
      <Card>
        <CardHeader><CardTitle>Período de certificación</CardTitle><CardDescription>Selecciona el trimestre que revisará y certificará la empresa.</CardDescription></CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-sm">Trimestre
            <select className="h-10 rounded-md border bg-background px-3" value={quarter} onChange={(event) => { setQuarter(Number(event.target.value)); setConfirmed(false); }}>
              <option value={1}>Primer trimestre (enero–marzo)</option><option value={2}>Segundo trimestre (abril–junio)</option><option value={3}>Tercer trimestre (julio–septiembre)</option><option value={4}>Cuarto trimestre (octubre–diciembre)</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">Año<input className="h-10 w-28 rounded-md border bg-background px-3" type="number" min="2020" max="2100" value={year} onChange={(event) => { setYear(Number(event.target.value)); setConfirmed(false); }} /></label>
          <Button variant="outline" onClick={() => refetch()}>Consultar período</Button>
        </CardContent>
      </Card>
      {isLoading ? <p>Consultando la información del trimestre…</p> : isError ? (
        <Alert variant="destructive"><AlertTitle>No se pudo consultar</AlertTitle><AlertDescription>Verifica la empresa activa e intenta nuevamente.</AlertDescription></Alert>
      ) : data && (
        <>
          <Card>
            <CardHeader><CardTitle>{data.companyName}</CardTitle><CardDescription>NIT {data.companyNit} · {period.from} al {period.to}</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-md border p-3"><span className="text-sm text-muted-foreground">Medidas registradas en Rutas Seguras</span><p className="text-xl font-semibold">{data.routeMeasures}</p></div>
                <div className="rounded-md border p-3"><span className="text-sm text-muted-foreground">Registros de monitoreo GPS</span><p className="text-xl font-semibold">{data.gpsMonitoringRecords}</p></div>
                <div className="rounded-md border p-3"><span className="text-sm text-muted-foreground">Alertas de velocidad</span><p className="text-xl font-semibold">{data.speedAlerts}</p></div>
                <div className="rounded-md border p-3"><span className="text-sm text-muted-foreground">Gastos GPS registrados</span><p className="text-xl font-semibold">{data.gpsExpenses}</p></div>
                <div className="rounded-md border p-3"><span className="text-sm text-muted-foreground">Total GPS del período</span><p className="text-xl font-semibold">{new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(data.gpsExpensesTotalCop)}</p></div>
              </div>
              {data.missing.length > 0 && <Alert><AlertTriangle className="h-4 w-4" /><AlertTitle>Falta completar información</AlertTitle><AlertDescription><ul className="list-disc space-y-1 pl-5">{data.missing.map((item) => <li key={item}>{item}</li>)}</ul><div className="mt-3 flex flex-wrap gap-2"><Button asChild size="sm" variant="outline"><Link href="/pesv/rutas-seguras">Abrir Rutas Seguras (H08)</Link></Button><Button asChild size="sm" variant="outline"><Link href="/pesv/monitoreo-gps">Abrir Monitoreo GPS (H07)</Link></Button><Button asChild size="sm" variant="outline"><Link href="/empresas">Abrir Empresas</Link></Button></div></AlertDescription></Alert>}
              <div className="flex items-start gap-3 rounded-md border p-3">
                <Checkbox id="confirm-measures-report" checked={confirmed} onCheckedChange={(value) => setConfirmed(value === true)} />
                <Label htmlFor="confirm-measures-report" className="leading-5">Confirmo que el Representante Legal verificó las medidas y gastos de este período y autoriza emitir la certificación con la firma registrada para la empresa.</Label>
              </div>
              <Button onClick={download} disabled={!confirmed || data.missing.length > 0}><FileCheck2 className="mr-2 h-4 w-4" /><Download className="mr-2 h-4 w-4" />Descargar certificación PDF</Button>
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}

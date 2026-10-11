import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, FileSpreadsheet, FileText } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCompanyContext } from "@/hooks/use-company-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, buildHeaders, getSelectedCompanyId } from "@/lib/queryClient";

type LessonReport = {
  companyName: string;
  companyNit: string;
  total: number;
  read: number;
  feedback: number;
  period: { from: string; to: string };
  records: Array<{
    asunto: string;
    contenido: string;
    fechaEnvio: string;
    fechaEvento: string | null;
    leccionAprendida: string | null;
    trabajador: string | null;
    fechaLectura: string | null;
    retroalimentacion: string | null;
  }>;
};

function getQuarterPeriod(year: number, quarter: number) {
  const firstMonth = (quarter - 1) * 3;
  const format = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return { from: format(new Date(year, firstMonth, 1)), to: format(new Date(year, firstMonth + 3, 0)) };
}

function displayDate(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("es-CO");
}

export default function PesvInformeTrimestralLecciones() {
  const { selectedCompany } = useCompanyContext();
  const { toast } = useToast();
  const now = new Date();
  const [quarter, setQuarter] = useState(Math.floor(now.getMonth() / 3) + 1);
  const [year, setYear] = useState(now.getFullYear());
  const period = getQuarterPeriod(year, quarter);
  const companyKey = selectedCompany?.id || getSelectedCompanyId() || "empresa-activa";
  const params = new URLSearchParams(period).toString();
  const { data, isLoading, isError, refetch } = useQuery<LessonReport>({
    queryKey: ["/api/pesv/informes-trimestrales/lecciones-aprendidas/estado", companyKey, period.from, period.to],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/pesv/informes-trimestrales/lecciones-aprendidas/estado?${params}`);
      return response.json();
    },
  });

  const download = async (format: "pdf" | "xlsx") => {
    try {
      const response = await fetch(`/api/pesv/informes-trimestrales/lecciones-aprendidas.${format}?${params}`, {
        credentials: "include",
        headers: buildHeaders(),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || "No fue posible descargar el informe.");
      }
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `evidencia_lecciones_aprendidas_${period.from}_${period.to}.${format}`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({ title: "No se pudo descargar", description: error instanceof Error ? error.message : "Intenta nuevamente.", variant: "destructive" });
    }
  };

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-6" data-testid="pesv-quarterly-lessons-report-page">
      <header>
        <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2">
          <Link href="/pesv/informes-trimestrales"><ArrowLeft className="mr-2 h-4 w-4" />Volver a informes trimestrales</Link>
        </Button>
        <p className="text-sm font-medium text-primary">PESV · Informe trimestral</p>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl">Divulgación de lecciones aprendidas</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Reúne lecciones registradas en las investigaciones, las comunicaciones enviadas por el Portal de Empleados, sus lecturas y las respuestas de los destinatarios. No corresponde a capacitaciones ni certificaciones.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Período del informe</CardTitle>
          <CardDescription>La fecha de divulgación determina el trimestre consultado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-end gap-3">
            <label className="grid gap-1 text-sm">Trimestre
              <select className="h-10 rounded-md border bg-background px-3" value={quarter} onChange={(e) => setQuarter(Number(e.target.value))}>
                <option value={1}>Primer trimestre (enero–marzo)</option><option value={2}>Segundo trimestre (abril–junio)</option>
                <option value={3}>Tercer trimestre (julio–septiembre)</option><option value={4}>Cuarto trimestre (octubre–diciembre)</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">Año
              <Input type="number" min={2000} max={now.getFullYear()+1} value={year} onChange={(e) => setYear(Number(e.target.value))} />
            </label>
            {data && <><Badge variant="secondary">{data.total} destinatarios</Badge><Badge variant="outline">{data.read} lecturas confirmadas</Badge><Badge variant={data.feedback === data.total ? "default" : "secondary"}>{data.feedback} respuestas registradas</Badge></>}
          </div>
          {isLoading && <p className="text-sm text-muted-foreground">Consultando comunicaciones…</p>}
          {isError && <div role="alert"><p>No se pudo consultar la información del trimestre.</p><Button variant="outline" onClick={() => refetch()}>Reintentar</Button></div>}
          {data?.total === 0 && <p className="rounded-md border border-dashed p-4">No hay comunicaciones de lecciones aprendidas registradas para este trimestre.</p>}
          {data && data.records.length > 0 && (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50 text-left">{["Divulgación","Lección aprendida","Destinatario","Lectura","Retroalimentación"].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
                <tbody>{data.records.map((row, i) => <tr className="border-b align-top last:border-0" key={`${row.asunto}-${i}`}>
                  <td className="p-3">{displayDate(row.fechaEnvio)}<br/><span className="font-medium">{row.asunto}</span></td>
                  <td className="p-3">{row.leccionAprendida || "Pendiente en la investigación"}</td>
                  <td className="p-3">{row.trabajador || "Sin destinatario asociado"}</td>
                  <td className="p-3">{row.fechaLectura ? `Confirmada · ${displayDate(row.fechaLectura)}` : "Pendiente"}</td>
                  <td className="p-3 whitespace-pre-wrap">{row.retroalimentacion || "Pendiente de respuesta"}</td>
                </tr>)}</tbody>
              </table>
            </div>
          )}
          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button onClick={() => download("xlsx")}><FileSpreadsheet className="mr-2 h-4 w-4"/>Descargar Excel</Button>
            <Button variant="outline" onClick={() => download("pdf")}><FileText className="mr-2 h-4 w-4"/>Descargar PDF</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

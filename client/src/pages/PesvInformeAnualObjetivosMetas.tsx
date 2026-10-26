import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, TriangleAlert } from "lucide-react";
import { Link } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCompanyContext } from "@/hooks/use-company-context";
import { downloadAuthenticatedReport } from "@/lib/download-report";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

type Evidence = {
  companyName: string;
  companyNit: string | null;
  objectives: Array<{
    objective: {
      id: string;
      codigo: string;
      titulo: string;
      descripcion: string | null;
      anio: number;
      metaCuantitativa: string | null;
      indicadorAsociado: string | null;
      estado: string;
    };
    communications: Array<{
      id: string;
      asunto: string;
      contenido: string;
      fechaEnvio: string;
      publicoObjetivo: string;
      totalDestinatarios: number;
      totalLecturas: number;
      requiereConfirmacionLectura: number;
    }>;
  }>;
  totals: { objectives: number; communications: number; recipients: number; confirmedReads: number };
};

export default function PesvInformeAnualObjetivosMetas() {
  const { selectedCompany } = useCompanyContext();
  const { toast } = useToast();
  const [showObjectiveForm, setShowObjectiveForm] = useState(false);
  const [objectiveForm, setObjectiveForm] = useState({ codigo: "", titulo: "", anio: "", metaCuantitativa: "" });
  const { data, isLoading, isError, refetch } = useQuery<Evidence>({
    queryKey: ["/api/pesv/informes-anuales/objetivos-metas/estado", selectedCompany?.id],
  });
  const createObjective = useMutation({
    mutationFn: () => apiRequest("POST", "/api/objetivos-sv", {
      codigo: objectiveForm.codigo.trim(),
      titulo: objectiveForm.titulo.trim(),
      anio: Number(objectiveForm.anio),
      metaCuantitativa: objectiveForm.metaCuantitativa.trim() || null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pesv/informes-anuales/objetivos-metas/estado"] });
      queryClient.invalidateQueries({ queryKey: ["/api/objetivos-sv"] });
      setObjectiveForm({ codigo: "", titulo: "", anio: "", metaCuantitativa: "" });
      setShowObjectiveForm(false);
      toast({ title: "Objetivo P05 registrado", description: "Ya puedes vincularlo con una comunicación de difusión." });
    },
    onError: (error: any) => toast({ title: "No se pudo registrar el objetivo", description: error.message, variant: "destructive" }),
  });

  const downloadPdf = async () => {
    try {
      await downloadAuthenticatedReport({
        url: "/api/pesv/informes-anuales/objetivos-metas.pdf",
        filename: "divulgacion_objetivos_metas_pesv.pdf",
      });
      toast({ title: "PDF descargado", description: "Se descargó el consolidado de evidencia disponible." });
    } catch (error: any) {
      toast({ title: "No se pudo descargar el PDF", description: error.message, variant: "destructive" });
    }
  };

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-6" data-testid="annual-pesv-objectives-disclosure-report">
      <Button variant="ghost" asChild className="-ml-3">
        <Link href="/pesv/informes-anuales"><ArrowLeft className="mr-2 h-4 w-4" />Volver a informes anuales</Link>
      </Button>
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">PESV · Informe anual SISI/PESV · 11</p>
        <h1 className="text-2xl font-bold md:text-3xl">Divulgación de objetivos y metas del PESV</h1>
        <p className="max-w-3xl text-muted-foreground">¿Los objetivos y metas son del conocimiento del personal de la organización?</p>
        <p className="text-sm font-medium">Evidencia solicitada: copias de las evidencias de difusión en PDF.</p>
      </header>
      <Button variant="outline" asChild>
        <Link href="/comunicacion-sst">Registrar difusión en Comunicación SST</Link>
      </Button>
      <Button variant="outline" onClick={() => setShowObjectiveForm((visible) => !visible)}>
        {showObjectiveForm ? "Cerrar registro de objetivo" : "Registrar objetivo P05"}
      </Button>
      {showObjectiveForm && (
        <Card>
          <CardHeader><CardTitle>Registrar objetivo o meta en P05</CardTitle><CardDescription>Se guarda en la fuente PESV P05 para vincularla luego con una comunicación.</CardDescription></CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => {
              event.preventDefault();
              const year = Number(objectiveForm.anio);
              if (!objectiveForm.codigo.trim() || !objectiveForm.titulo.trim() || !Number.isInteger(year) || year < 2000 || year > 2200) {
                toast({ title: "Revisa los datos", description: "Ingresa código, objetivo y un año válido.", variant: "destructive" });
                return;
              }
              createObjective.mutate();
            }}>
              <div className="space-y-2"><Label htmlFor="objective-code">Código *</Label><Input id="objective-code" value={objectiveForm.codigo} onChange={(event) => setObjectiveForm({ ...objectiveForm, codigo: event.target.value })} required /></div>
              <div className="space-y-2"><Label htmlFor="objective-year">Año *</Label><Input id="objective-year" type="number" min="2000" max="2200" value={objectiveForm.anio} onChange={(event) => setObjectiveForm({ ...objectiveForm, anio: event.target.value })} required /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="objective-title">Objetivo *</Label><Input id="objective-title" value={objectiveForm.titulo} onChange={(event) => setObjectiveForm({ ...objectiveForm, titulo: event.target.value })} required /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="objective-goal">Meta cuantitativa</Label><Textarea id="objective-goal" value={objectiveForm.metaCuantitativa} onChange={(event) => setObjectiveForm({ ...objectiveForm, metaCuantitativa: event.target.value })} /></div>
              <div className="flex gap-2 md:col-span-2"><Button type="submit" disabled={createObjective.isPending}>{createObjective.isPending ? "Guardando…" : "Guardar en P05"}</Button><Button type="button" variant="ghost" onClick={() => setShowObjectiveForm(false)}>Cancelar</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Card><CardContent className="p-6 text-muted-foreground">Consultando objetivos P05 y comunicaciones vinculadas…</CardContent></Card>
      ) : isError ? (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" /><AlertTitle>No se pudo consultar la evidencia</AlertTitle>
          <AlertDescription><Button variant="outline" size="sm" onClick={() => refetch()}>Reintentar</Button></AlertDescription>
        </Alert>
      ) : data ? (
        <>
          <Alert>
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Las lecturas registradas no demuestran comprensión</AlertTitle>
            <AlertDescription>
              El PDF diferencia objetivos sin comunicación vinculada, destinatarios y lecturas confirmadas. Revisa que la comunicación cubra al personal correspondiente antes de presentarla como evidencia.
            </AlertDescription>
          </Alert>
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{data.companyName || selectedCompany?.name || "Empresa"}</CardTitle>
                  <CardDescription>Fuente: PESV P05 y Comunicación SST</CardDescription>
                  {data.companyNit && <CardDescription>NIT {data.companyNit}</CardDescription>}
                </div>
                <Button onClick={downloadPdf} data-testid="button-download-pesv-objectives-disclosure-pdf">
                  <Download className="mr-2 h-4 w-4" />Descargar PDF consolidado
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div><p className="text-sm text-muted-foreground">Objetivos P05</p><p className="text-xl font-semibold">{data.totals.objectives}</p></div>
                <div><p className="text-sm text-muted-foreground">Comunicaciones</p><p className="text-xl font-semibold">{data.totals.communications}</p></div>
                <div><p className="text-sm text-muted-foreground">Destinatarios registrados</p><p className="text-xl font-semibold">{data.totals.recipients}</p></div>
                <div><p className="text-sm text-muted-foreground">Lecturas confirmadas</p><p className="text-xl font-semibold">{data.totals.confirmedReads}</p></div>
              </div>
              {data.objectives.length === 0 ? (
                <Alert><AlertTitle>No hay objetivos P05 registrados</AlertTitle><AlertDescription>Sin objetivos registrados no es posible asociar ni verificar su divulgación.</AlertDescription></Alert>
              ) : data.objectives.map(({ objective, communications }) => (
                <Card key={objective.id} data-testid={`objective-disclosure-${objective.id}`}>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">{objective.codigo} · {objective.titulo}</CardTitle>
                        <CardDescription>{objective.anio} · {objective.indicadorAsociado || "Sin indicador asociado"} · Meta: {objective.metaCuantitativa || "Sin registro"}</CardDescription>
                      </div>
                      <Badge variant={communications.length ? "secondary" : "outline"}>{communications.length ? `${communications.length} comunicación(es)` : "Sin difusión vinculada"}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {communications.length === 0 ? <p className="text-sm text-muted-foreground">No hay evidencia de difusión asociada a este objetivo.</p> : communications.map((communication) => (
                      <div key={communication.id} className="rounded-md border p-3">
                        <p className="font-medium">{communication.asunto}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(communication.fechaEnvio).toLocaleDateString("es-CO")} · Público: {communication.publicoObjetivo} · Lecturas: {communication.totalLecturas}/{communication.totalDestinatarios}
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm">{communication.contenido}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </>
      ) : null}
    </main>
  );
}

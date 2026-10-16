import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { Link } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompanyContext } from "@/hooks/use-company-context";
import { formatDateCO } from "@/lib/utils/formatters";

interface ActaA02 {
  id: string;
  evaluacionPesvId: string;
  codigo: string;
  fechaRevision: string;
  presididaPor: string;
  fechaAprobacion: string;
}

export default function PesvInformeAnualSeguimientoDireccion() {
  const { selectedCompany } = useCompanyContext();
  const { data: actas = [], isLoading, isError, refetch } = useQuery<ActaA02[]>({
    queryKey: ["/api/pesv/informes-anuales/seguimiento-direccion/evidencias", selectedCompany?.id],
    queryFn: async () => {
      const response = await fetch("/api/pesv/informes-anuales/seguimiento-direccion/evidencias", { credentials: "include" });
      if (!response.ok) throw new Error("No se pudieron consultar las actas aprobadas.");
      return response.json();
    },
  });

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-6" data-testid="pesv-annual-director-follow-up">
      <header className="space-y-3">
        <Button asChild variant="ghost" className="-ml-3">
          <Link href="/pesv/informes-anuales"><ArrowLeft className="mr-2 h-4 w-4" /> Volver a informes</Link>
        </Button>
        <p className="text-sm font-medium text-primary">PESV · SISI/PESV · A02</p>
        <h1 className="text-2xl font-bold md:text-3xl">Actas de seguimiento al PESV por la Alta Dirección</h1>
        <p className="max-w-3xl text-muted-foreground">
          Consulta y descarga las actas A02 aprobadas para cargarlas en la plataforma SISI/PESV. Esta pantalla entrega documentos fuente; no responde por la empresa las preguntas de SISI/PESV ni genera actas nuevas.
        </p>
      </header>

      {isLoading ? (
        <Card><CardContent className="p-6 text-muted-foreground">Consultando las actas de la empresa…</CardContent></Card>
      ) : isError ? (
        <Alert variant="destructive">
          <AlertTitle>No se pudieron consultar las actas</AlertTitle>
          <AlertDescription>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Reintentar</Button>
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>{selectedCompany?.name || "Empresa"}</CardTitle>
                <CardDescription>Actas fuente del módulo PESV A02 · Revisión por la Dirección</CardDescription>
              </div>
              <Badge variant={actas.length ? "default" : "secondary"}>
                {actas.length ? `${actas.length} acta(s) aprobada(s)` : "Sin actas aprobadas"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {actas.length ? (
              <div className="space-y-3">
                {actas.map((acta) => (
                  <div key={acta.id} className="flex flex-col justify-between gap-3 rounded-md border p-4 sm:flex-row sm:items-center">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{acta.codigo}</span>
                        <Badge variant="secondary">Aprobada</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Revisión: {formatDateCO(acta.fechaRevision)} · Aprobada: {formatDateCO(acta.fechaAprobacion)}
                      </p>
                      <p className="text-sm text-muted-foreground">Presidida por: {acta.presididaPor}</p>
                    </div>
                    <Button asChild>
                      <a
                        href={`/api/evaluaciones-pesv/${acta.evaluacionPesvId}/revisiones-direccion/${acta.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        data-testid={`download-approved-acta-${acta.id}`}
                      >
                        <Download className="mr-2 h-4 w-4" /> Abrir PDF
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertTitle>No hay actas A02 aprobadas para consultar</AlertTitle>
                <AlertDescription>
                  Las revisiones en borrador no se presentan como evidencia aprobada. Revisa los registros en el módulo fuente.
                </AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end">
              <Button variant="outline" asChild>
                <Link href="/pesv/revision-direccion">Abrir Revisión por la Dirección (A02)</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

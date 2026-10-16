import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ActaA02 {
  id: string;
  evaluacionPesvId: string;
  codigo: string;
  fechaRevision: string;
  presididaPor: string;
  fechaAprobacion: string;
}

export default function PesvInformeAnualSeguimientoDireccion() {
  const { data: actas = [], isLoading, error } = useQuery<ActaA02[]>({
    queryKey: ["/api/pesv/informes-anuales/seguimiento-direccion/evidencias"],
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

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2 text-primary"><FileText className="h-5 w-5" aria-hidden="true" /></div>
            <div>
              <CardTitle>Actas fuente disponibles</CardTitle>
              <CardDescription>Se muestran únicamente revisiones con aprobación registrada.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p className="text-sm text-muted-foreground">Consultando actas…</p> : null}
          {error ? <p role="alert" className="text-sm text-destructive">{error.message}</p> : null}
          {!isLoading && !error && actas.length === 0 ? (
            <div className="rounded-md border border-dashed p-5 text-sm text-muted-foreground">
              No hay actas A02 con aprobación registrada. Las revisiones en borrador no se presentan como evidencia aprobada.
              <div className="mt-3">
                <Button asChild variant="outline"><Link href="/pesv/revision-direccion">Abrir Revisión por la Dirección</Link></Button>
              </div>
            </div>
          ) : null}
          {actas.map((acta) => (
            <div key={acta.id} className="flex flex-col justify-between gap-3 rounded-md border p-4 sm:flex-row sm:items-center">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{acta.codigo}</span>
                  <Badge variant="secondary">Aprobada</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Revisión: {new Date(`${acta.fechaRevision}T00:00:00`).toLocaleDateString("es-CO")}
                  {" · "}Presidida por: {acta.presididaPor}
                </p>
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
        </CardContent>
      </Card>
    </main>
  );
}

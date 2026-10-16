import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, FileText, TriangleAlert } from "lucide-react";
import { Link } from "wouter";
import type { PoliticaSst } from "@shared/schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompanyContext } from "@/hooks/use-company-context";
import { openCompanyDocument } from "@/lib/company-context-url";

export default function PesvInformeAnualPolitica() {
  const { selectedCompany } = useCompanyContext();
  const { data: policies = [], isLoading, isError, refetch } = useQuery<PoliticaSst[]>({
    queryKey: ["/api/politicas-sst"],
  });
  const sourcePolicy = policies.find((policy) => policy.codigo === "POL-SEG-02");

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-6" data-testid="annual-pesv-policy-report">
      <header className="space-y-2">
        <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2">
          <Link href="/pesv/informes-anuales"><ArrowLeft className="mr-2 h-4 w-4" />Volver a informes anuales</Link>
        </Button>
        <p className="text-sm font-medium text-primary">PESV · Informe anual SISI/PESV</p>
        <h1 className="text-2xl font-bold md:text-3xl">Política de Seguridad Vial</h1>
        <p className="max-w-3xl text-muted-foreground">P02 · Trazabilidad con la política SST del estándar 2.1.1.</p>
      </header>

      {isLoading && <Card><CardContent className="p-6 text-muted-foreground">Consultando la política fuente…</CardContent></Card>}
      {isError && (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>No se pudo consultar la política</AlertTitle>
          <AlertDescription>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>Reintentar</Button>
          </AlertDescription>
        </Alert>
      )}
      {!isLoading && !isError && sourcePolicy ? (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>{selectedCompany?.name || "Empresa"}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">PESV P02 · Estándar SG-SST 2.1.1</p>
              </div>
              <Badge>Política fuente registrada</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border p-4">
              <div className="flex items-center gap-2 font-medium">
                <FileText className="h-4 w-4" aria-hidden="true" />
                Política de Seguridad Vial
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href="/politicas-sst">Abrir política fuente</Link>
              </Button>
              <Button onClick={() => openCompanyDocument(`/api/politicas-sst/${sourcePolicy.id}/pdf`)} data-testid="button-download-p02-source">
                <Download className="mr-2 h-4 w-4" />Descargar política fuente PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : !isLoading && !isError ? (
        <Alert>
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>No se encontró la política fuente</AlertTitle>
          <AlertDescription>
            <Button variant="outline" asChild><Link href="/politicas-sst">Abrir Políticas SST</Link></Button>
          </AlertDescription>
        </Alert>
      ) : null}
    </main>
  );
}

import { ArrowRight, FileText } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const annualCertifications = [
  {
    href: "/pesv/informes-anuales/resolucion-40595-2022",
    title: "Certificación del PESV — Resolución 40595 de 2022",
    description: "Declaración independiente del Representante Legal",
  },
  {
    href: "/pesv/informes-anuales/responsable-pesv",
    title: "Designación del Responsable del PESV",
    description: "Acta de designación con poder de decisión y articulación con el SG-SST",
  },
  {
    href: "/pesv/informes-anuales/comite-seguridad-vial",
    title: "Existencia del Comité de Seguridad Vial",
    description: "Consulta la conformación del comité y adjunta el acta original del máximo órgano social",
  },
];

export default function PesvInformesAnuales() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-6" data-testid="pesv-annual-reports-page">
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">PESV · SISI/PESV</p>
        <h1 className="text-2xl font-bold md:text-3xl">Informe anual SISI/PESV</h1>
        <p className="max-w-3xl text-muted-foreground">
          Consulta los informes anuales SISI/PESV y la evidencia que corresponde a cada punto.
        </p>
      </header>

      <section aria-labelledby="annual-pesv-reports-title" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="annual-pesv-reports-title" className="text-lg font-semibold">Informes</h2>
          <Badge variant="secondary">3 informes incorporados</Badge>
        </div>
        {annualCertifications.map((report) => (
          <Card key={report.href}>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-primary/10 p-2 text-primary">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <CardTitle>{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex justify-end border-t pt-4">
              <Button asChild>
                <Link href={report.href}>Abrir informe <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}

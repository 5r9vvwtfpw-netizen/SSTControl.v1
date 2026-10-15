import { ArrowRight, FileText } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PesvInformesTrimestrales() {
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-6" data-testid="pesv-quarterly-reports-page">
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">PESV · Superintendencia de Transporte</p>
        <h1 className="text-2xl font-bold md:text-3xl">Informe trimestral Superintendencia</h1>
        <p className="max-w-3xl text-muted-foreground">
          Reúne los informes trimestrales solicitados para el PESV. Cada informe consulta los datos de los módulos existentes.
        </p>
      </header>

      <section aria-labelledby="quarterly-report-list-title" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="quarterly-report-list-title" className="text-lg font-semibold">
            Informes
          </h2>
          <Badge variant="secondary">5 de 9 incorporados</Badge>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <CardTitle>Registro de vehículos siniestrados</CardTitle>
                <CardDescription>
                  Informe trimestral basado en los siniestros, vehículos, conductores y actas del Comité PESV ya registrados.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex justify-end border-t pt-4">
            <Button asChild>
              <Link href="/pesv/informes-trimestrales/siniestros" data-testid="link-quarterly-siniestros-report">
                Abrir informe
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <CardTitle>Política de Seguridad Vial</CardTitle>
                <CardDescription>
                  Verifica si existe una política aprobada y vigente y permite descargar su copia oficial en PDF.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex justify-end border-t pt-4">
            <Button asChild>
              <Link href="/pesv/informes-trimestrales/politica-seguridad-vial" data-testid="link-quarterly-policy-report">
                Abrir informe
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <CardTitle>Copias de actas del Comité PESV</CardTitle>
                <CardDescription>
                  Copias de las actas que registran la investigación interna de los siniestros del trimestre.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex justify-end border-t pt-4">
            <Button asChild>
              <Link href="/pesv/informes-trimestrales/actas-siniestros" data-testid="link-quarterly-actas-report">
                Abrir informe
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <CardTitle>Divulgación de lecciones aprendidas</CardTitle>
                <CardDescription>
                  Evidencia trimestral de comunicaciones SST, lecturas y retroalimentación registrada por los trabajadores en el Portal de Empleados.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex justify-end border-t pt-4">
            <Button asChild>
              <Link href="/pesv/informes-trimestrales/lecciones-aprendidas" data-testid="link-quarterly-lessons-report">
                Abrir informe
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <CardTitle>Certificación de medidas para prevenir la accidentalidad</CardTitle>
                <CardDescription>
                  Certificación trimestral basada en medidas de Rutas Seguras y gastos GPS, con firma registrada del Representante Legal.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex justify-end border-t pt-4">
            <Button asChild>
              <Link href="/pesv/informes-trimestrales/medidas-prevencion" data-testid="link-quarterly-prevention-measures">
                Abrir informe
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, FileText, Wallet, Shield, ExternalLink, CheckCircle2, AlertCircle, Building2 } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { TrazabilidadPesvBanner } from "@/components/pesv/TrazabilidadPesvBanner";
import { BackToPesvEvaluationButton } from "@/components/BackToPesvEvaluationButton";

interface EvidenciaItem {
  nombre: string;
  descripcion: string;
  modulo: string;
  ruta: string;
  icono: React.ReactNode;
}

const EVIDENCIAS_REQUERIDAS: EvidenciaItem[] = [
  {
    nombre: "Política de Seguridad Vial",
    descripcion: "Declaración formal del compromiso de la alta dirección con la seguridad vial",
    modulo: "Políticas SST/PESV",
    ruta: "/politicas-sst",
    icono: <FileText className="h-5 w-5" />
  },
  {
    nombre: "Designación de Responsables",
    descripcion: "Designación formal del responsable del PESV y delegación de funciones",
    modulo: "Designación de Responsable",
    ruta: "/designacion-responsable",
    icono: <Users className="h-5 w-5" />
  },
  {
    nombre: "Asignación de Recursos",
    descripcion: "Presupuesto y recursos asignados para la implementación del PESV",
    modulo: "Asignación de Recursos",
    ruta: "/asignacion-recursos",
    icono: <Wallet className="h-5 w-5" />
  },
  {
    nombre: "Comité de Seguridad Vial",
    descripcion: "Participación activa de la dirección en el Comité de Seguridad Vial",
    modulo: "Comité PESV",
    ruta: "/pesv/comite",
    icono: <Building2 className="h-5 w-5" />
  }
];

const REQUISITOS_PASO: string[] = [
  "Asignación de recursos financieros, técnicos y humanos para el PESV",
  "Participación activa de la alta dirección en el Comité de Seguridad Vial",
  "Rendición de cuentas sobre el desempeño del PESV",
  "Promoción activa de la cultura de seguridad vial en la organización",
  "Revisión periódica del PESV por la alta dirección"
];

export default function PesvLiderazgo() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-6 space-y-6" data-testid="page-pesv-liderazgo">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/pesv">
          <Button variant="ghost" size="icon" data-testid="button-back-pesv">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold" data-testid="text-page-title">
            Paso 4: Liderazgo y Compromiso de la Alta Dirección
          </h1>
          <p className="text-muted-foreground">
            Demostración del compromiso de la alta dirección con la seguridad vial
          </p>
        </div>
        <BackToPesvEvaluationButton />
      </div>

      <TrazabilidadPesvBanner codigoPaso="P04" compacto={false} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card data-testid="card-requisitos">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Requisitos del Paso 4
            </CardTitle>
            <CardDescription>
              Según Resolución 40595/2022 - Artículo 5
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {REQUISITOS_PASO.map((requisito, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{requisito}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card data-testid="card-frecuencia">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Frecuencia de Revisión
            </CardTitle>
            <CardDescription>
              Periodicidad establecida para verificación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="font-medium">Revisión por la Dirección</span>
              <Badge variant="secondary">Semestral</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              La alta dirección debe revisar el PESV al menos cada 6 meses para 
              asegurar su conveniencia, adecuación y eficacia continua, conforme 
              al Artículo 2.2.4.6.31 del Decreto 1072/2015.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card data-testid="card-evidencias">
        <CardHeader>
          <CardTitle>Evidencias Requeridas</CardTitle>
          <CardDescription>
            Documentos y registros que demuestran el cumplimiento del Paso 4
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {EVIDENCIAS_REQUERIDAS.map((evidencia, index) => (
              <Link key={index} href={evidencia.ruta}>
                <div 
                  className="p-4 border rounded-lg hover-elevate cursor-pointer transition-colors"
                  data-testid={`link-evidencia-${index}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {evidencia.icono}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{evidencia.nombre}</h4>
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {evidencia.descripcion}
                      </p>
                      <Badge variant="outline" className="mt-2">
                        {evidencia.modulo}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20" data-testid="card-nota-normativa">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Nota sobre Trazabilidad
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                Este paso está integrado con los módulos SST existentes. Las evidencias 
                de liderazgo y compromiso se documentan a través de las Políticas, 
                Designación de Responsables, Asignación de Recursos y participación 
                en el Comité de Seguridad Vial. Esto asegura la trazabilidad bidireccional 
                SST-PESV conforme a los requisitos del Decreto 1072/2015 e ISO 45001:2018.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

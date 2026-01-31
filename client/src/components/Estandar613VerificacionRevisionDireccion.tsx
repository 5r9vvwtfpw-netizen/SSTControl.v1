import { AlertTriangle, CheckCircle2, FileText, Users, Briefcase, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface Estandar613VerificacionRevisionDireccionProps {
  isVisible: boolean;
  evaluationId?: string;
}

const criteriosVerificacion = [
  "Solicitar a la empresa los soportes que den cuenta del alcance de la auditoría, verificando el cumplimiento de los aspectos señalados en los numerales del artículo 2.2.4.6.30 del Decreto 1072 de 2015",
  "Verificar que la auditoría abarca: cumplimiento de la política de SST, resultados de los indicadores de estructura, proceso y resultado",
  "Comprobar que la auditoría evalúa la participación de los trabajadores",
  "Verificar que se revisa el desarrollo de la responsabilidad y obligación de rendir cuentas",
  "Confirmar que se audita el mecanismo de comunicación de los contenidos del SG-SST a los trabajadores",
  "Verificar que se evalúa la planificación, desarrollo y aplicación del SG-SST",
  "Comprobar que se revisa la gestión del cambio y la consideración de la SST en nuevos procesos",
  "Verificar que se auditan los resultados de auditorías previas y las acciones correctivas implementadas",
];

export function Estandar613VerificacionRevisionDireccion({ isVisible, evaluationId }: Estandar613VerificacionRevisionDireccionProps) {
  if (!isVisible) return null;

  const baseParams = evaluationId 
    ? `from=evaluation&evaluationId=${evaluationId}` 
    : "from=evaluation";
  
  const buildUrl = (path: string, tab?: string) => {
    const params = tab ? `tab=${tab}&${baseParams}` : baseParams;
    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}${params}`;
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Modo Verificación - Estándar 6.1.3
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
            Revisión por la alta dirección. Verificar que el alcance de la auditoría 
            cumple con todos los aspectos señalados en el artículo 2.2.4.6.30 del 
            Decreto 1072 de 2015, incluyendo política, indicadores, participación, 
            comunicación y gestión del cambio.
          </p>

          <div className="mt-3 p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-md border border-emerald-200 dark:border-emerald-800">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
              <CheckCircle2 className="h-3 w-3 inline mr-1" />
              Criterios de verificación:
            </p>
            <ul className="text-xs text-emerald-600 dark:text-emerald-400 space-y-1 list-disc list-inside">
              {criteriosVerificacion.map((criterio, idx) => (
                <li key={idx}>{criterio}</li>
              ))}
            </ul>
          </div>

          <div className="mt-3 p-3 bg-yellow-100/50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Normativa aplicable:
            </p>
            <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
              <li><strong>Decreto 1072/2015 Art. 2.2.4.6.30</strong> - Alcance de la auditoría de cumplimiento del SG-SST</li>
              <li><strong>Decreto 1072/2015 Art. 2.2.4.6.31</strong> - Revisión por la alta dirección</li>
              <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 6.1.3</li>
              <li><strong>ISO 45001:2018 Numeral 9.3</strong> - Revisión por la dirección</li>
            </ul>
          </div>

          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
            Evidencia esperada: Actas de revisión por la dirección, informes de auditoría 
            con alcance completo según Art. 2.2.4.6.30, registros de participación de 
            trabajadores, comunicaciones del SG-SST, documentos de gestión del cambio, 
            seguimiento a acciones correctivas de auditorías previas.
          </p>

          <div className="flex gap-2 mt-3 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-revision-direccion-613"
              asChild
            >
              <Link href={buildUrl("/revisiones-direccion")}>
                <Briefcase className="h-4 w-4 mr-2" />
                Revisión Dirección
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-auditorias-613"
              asChild
            >
              <Link href={buildUrl("/auditorias-internas")}>
                <ClipboardList className="h-4 w-4 mr-2" />
                Ver Auditorías
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-copasst-613"
              asChild
            >
              <Link href={buildUrl("/copasst")}>
                <Users className="h-4 w-4 mr-2" />
                Ver COPASST
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-documentos-613"
              asChild
            >
              <Link href={buildUrl("/conservacion-documentos")}>
                <FileText className="h-4 w-4 mr-2" />
                Ver Documentos
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

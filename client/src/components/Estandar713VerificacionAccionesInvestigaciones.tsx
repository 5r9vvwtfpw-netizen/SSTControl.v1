import { AlertTriangle, CheckCircle2, FileText, Search, ClipboardCheck, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface Estandar713VerificacionAccionesInvestigacionesProps {
  isVisible: boolean;
  evaluationId?: string;
}

const criteriosVerificacion = [
  "Solicitar la evidencia documental de las acciones de mejora planteadas conforme a los resultados de las investigaciones realizadas y verificar su efectividad",
  "Verificar que cada accidente de trabajo e incidente grave tiene acciones correctivas derivadas",
  "Comprobar que las acciones incluyen responsable, recursos y cronograma de implementación",
  "Verificar el seguimiento a la implementación de las acciones propuestas",
  "Confirmar que se evalúa la eficacia de las acciones para prevenir recurrencia",
  "Verificar que las lecciones aprendidas se comunican a los trabajadores",
];

export function Estandar713VerificacionAccionesInvestigaciones({ isVisible, evaluationId }: Estandar713VerificacionAccionesInvestigacionesProps) {
  if (!isVisible) return null;

  const baseParams = evaluationId 
    ? `from=evaluation&evaluationId=${evaluationId}` 
    : "from=evaluation";
  
  const buildUrl = (path: string, tab?: string) => {
    const params = tab ? `tab=${tab}&${baseParams}` : baseParams;
    return `${path}?${params}`;
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Modo Verificación - Estándar 7.1.3
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
            Acciones de mejora con base en investigaciones de accidentes de trabajo y 
            enfermedades. Verificar que las acciones correctivas responden a los hallazgos 
            de las investigaciones y que se evalúa su efectividad.
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
              <li><strong>Decreto 1072/2015 Art. 2.2.4.6.32</strong> - Investigación de incidentes, accidentes y enfermedades</li>
              <li><strong>Decreto 1072/2015 Art. 2.2.4.6.33</strong> - Acciones preventivas y correctivas</li>
              <li><strong>Resolución 1401/2007</strong> - Investigación de accidentes e incidentes</li>
              <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 7.1.3</li>
            </ul>
          </div>

          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
            Evidencia esperada: Informes de investigación de accidentes, plan de acciones 
            correctivas, seguimiento de implementación, evaluación de eficacia, 
            registros de comunicación de lecciones aprendidas.
          </p>

          <div className="flex gap-2 mt-3 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-investigaciones-713"
              asChild
            >
              <Link href={buildUrl("/accidentes", "investigaciones")}>
                <Search className="h-4 w-4 mr-2" />
                Investigaciones
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-acciones-713"
              asChild
            >
              <Link href={buildUrl("/acciones-correctivas")}>
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Acciones Correctivas
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-estadisticas-713"
              asChild
            >
              <Link href={buildUrl("/accidentes", "estadisticas")}>
                <Activity className="h-4 w-4 mr-2" />
                Estadísticas AT
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-documentos-713"
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

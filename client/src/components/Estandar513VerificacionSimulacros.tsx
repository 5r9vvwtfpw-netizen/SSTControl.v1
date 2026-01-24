import { AlertTriangle, CheckCircle2, FileText, Calendar, Users, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface Estandar513VerificacionSimulacrosProps {
  isVisible: boolean;
  evaluationId?: string;
}

const criteriosVerificacion = [
  "Solicitar los registros de la realización de los simulacros de emergencias",
  "Verificar que se realizan al menos un simulacro anual con participación de todos los trabajadores",
  "Confirmar la existencia de un cronograma de simulacros aprobado",
  "Revisar los informes de evaluación post-simulacro con análisis de fortalezas y aspectos a mejorar",
  "Verificar la implementación de las acciones de mejora identificadas en simulacros anteriores",
  "Comprobar la participación de entidades externas cuando corresponda (bomberos, cruz roja, defensa civil)",
];

export function Estandar513VerificacionSimulacros({ isVisible, evaluationId }: Estandar513VerificacionSimulacrosProps) {
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
            Modo Verificación - Estándar 5.1.3
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
            Simulacros de emergencias. Verificar la realización de simulacros periódicos, 
            la participación de los trabajadores, los informes de evaluación y las acciones 
            de mejora implementadas.
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
              <li><strong>Decreto 1072/2015 Art. 2.2.4.6.25</strong> - Prevención, preparación y respuesta ante emergencias</li>
              <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 5.1.3</li>
              <li><strong>Ley 1523/2012</strong> - Política Nacional de Gestión del Riesgo</li>
              <li><strong>NTC 1700</strong> - Higiene y Seguridad - Medidas de seguridad en edificaciones</li>
            </ul>
          </div>

          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
            Evidencia esperada: Cronograma de simulacros, registros fotográficos, listados de 
            asistencia, informes de evaluación post-simulacro, actas con observaciones y 
            acciones de mejora, comunicaciones a entidades externas participantes.
          </p>

          <div className="flex gap-2 mt-3 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-simulacros-513"
              asChild
            >
              <Link href={buildUrl("/plan-emergencias", "simulacros")}>
                <Users className="h-4 w-4 mr-2" />
                Ver Simulacros
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-cronograma-513"
              asChild
            >
              <Link href={buildUrl("/cronograma-actividades")}>
                <Calendar className="h-4 w-4 mr-2" />
                Ver Cronograma
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-plan-emergencias-513"
              asChild
            >
              <Link href={buildUrl("/plan-emergencias", "planes")}>
                <ClipboardList className="h-4 w-4 mr-2" />
                Plan de Emergencias
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-documentos-513"
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

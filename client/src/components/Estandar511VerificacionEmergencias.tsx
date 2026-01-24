import { AlertTriangle, CheckCircle2, FileText, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface Estandar511VerificacionEmergenciasProps {
  isVisible: boolean;
  evaluationId?: string;
}

const criteriosVerificacion = [
  "Solicitar el plan de prevención, preparación y respuesta ante emergencias y constatar evidencias de su divulgación",
  "Verificar si existen los planos de las instalaciones que identifican áreas y salidas de emergencia",
  "Verificar si existe la debida señalización de la empresa",
  "Verificar los soportes que evidencien la realización de los simulacros y análisis de los mismos",
  "Validar que las recomendaciones emitidas con base en dicho análisis hayan sido tenidas en cuenta en el mejoramiento del plan de emergencias",
  "Verificar la conformación, capacitación y dotación de la brigada de emergencias",
];

export function Estandar511VerificacionEmergencias({ isVisible, evaluationId }: Estandar511VerificacionEmergenciasProps) {
  if (!isVisible) return null;

  const fromParam = evaluationId 
    ? `?from=evaluation&evaluationId=${evaluationId}` 
    : "?from=evaluation";

  return (
    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            Modo Verificación - Estándar 5.1.1
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            Plan de prevención, preparación y respuesta ante emergencias. Verificar la existencia 
            del plan, su divulgación, planos de emergencia, señalización, simulacros realizados 
            y seguimiento a las recomendaciones derivadas de los mismos.
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
              <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 5.1.1</li>
              <li><strong>Ley 1523/2012</strong> - Política Nacional de Gestión del Riesgo de Desastres</li>
              <li><strong>Resolución 2400/1979</strong> - Medidas de seguridad en establecimientos de trabajo</li>
            </ul>
          </div>

          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
            Evidencia esperada: Plan de emergencias documentado, planos de evacuación, 
            registros de simulacros con análisis, actas de conformación de brigada, 
            certificados de capacitación de brigadistas, evidencia fotográfica de señalización.
          </p>

          <div className="flex gap-2 mt-3 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/50"
              data-testid="button-ver-plan-emergencias-511"
              asChild
            >
              <Link href={`/plan-emergencias${fromParam}`}>
                <FileText className="h-4 w-4 mr-2" />
                Ver Plan de Emergencias
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/50"
              data-testid="button-ver-simulacros-511"
              asChild
            >
              <Link href={`/simulacros${fromParam}`}>
                <Users className="h-4 w-4 mr-2" />
                Ver Simulacros
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/50"
              data-testid="button-ver-brigada-511"
              asChild
            >
              <Link href={`/brigada${fromParam}`}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Ver Brigada
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/50"
              data-testid="button-ver-planos-511"
              asChild
            >
              <Link href={`/conservacion-documentos${fromParam}`}>
                <MapPin className="h-4 w-4 mr-2" />
                Ver Planos
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

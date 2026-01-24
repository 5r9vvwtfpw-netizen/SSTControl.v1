import { HardHat, Users, ShieldCheck, CheckCircle2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface Estandar426VerificacionEPPProps {
  isVisible: boolean;
  evaluationId?: string;
}

const criteriosVerificacion = [
  "Solicitar los soportes que evidencien la entrega y reposición de los elementos de protección personal a los trabajadores",
  "Verificar los soportes del cumplimiento del criterio por parte de los contratistas y subcontratistas",
  "Verificar los soportes que evidencien la realización de la capacitación en el uso de los elementos de protección personal",
  "Confirmar que los EPP entregados corresponden a los riesgos identificados en la matriz IPERC",
  "Verificar que existe un procedimiento de solicitud y reposición de EPP dañados o deteriorados",
  "Comprobar que los trabajadores usan correctamente los EPP asignados durante las actividades de riesgo",
];

export function Estandar426VerificacionEPP({ isVisible, evaluationId }: Estandar426VerificacionEPPProps) {
  if (!isVisible) return null;

  const fromParam = evaluationId 
    ? `?from=evaluation&evaluationId=${evaluationId}` 
    : "?from=evaluation";

  return (
    <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <HardHat className="h-5 w-5 text-teal-600 dark:text-teal-400 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-teal-800 dark:text-teal-200">
            Modo Verificación - Estándar 4.2.6
          </p>
          <p className="text-sm text-teal-600 dark:text-teal-400 mt-1">
            Entrega de Elementos de Protección Personal EPP y capacitación en uso adecuado, 
            se verifica con contratistas y subcontratistas. Verificar registros de entrega, 
            reposición y capacitación tanto para trabajadores directos como para personal de contratistas.
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
              <li><strong>Decreto 1072/2015 Art. 2.2.4.6.24</strong> - Obligación de suministro de EPP</li>
              <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 4.2.6</li>
              <li><strong>Resolución 2400/1979 Arts. 176-201</strong> - Especificaciones técnicas de EPP</li>
              <li><strong>Ley 1562/2012 Art. 11</strong> - Responsabilidad del empleador en suministro de EPP</li>
            </ul>
          </div>

          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
            Evidencia esperada: Formato de entrega de EPP firmado, matriz de EPP por cargo, 
            registros de reposición, verificación a contratistas, listas de asistencia a capacitaciones, 
            fichas técnicas y certificaciones de los EPP.
          </p>

          <div className="flex gap-2 mt-3 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-teal-300 text-teal-700 hover:bg-teal-100 dark:border-teal-600 dark:text-teal-300 dark:hover:bg-teal-900/50"
              data-testid="button-ver-epp-426"
              asChild
            >
              <Link href={`/epp${fromParam}`}>
                <HardHat className="h-4 w-4 mr-2" />
                Ver Entregas EPP
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-teal-300 text-teal-700 hover:bg-teal-100 dark:border-teal-600 dark:text-teal-300 dark:hover:bg-teal-900/50"
              data-testid="button-ver-capacitaciones-426"
              asChild
            >
              <Link href={`/capacitaciones${fromParam}`}>
                <GraduationCap className="h-4 w-4 mr-2" />
                Ver Capacitaciones
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-teal-300 text-teal-700 hover:bg-teal-100 dark:border-teal-600 dark:text-teal-300 dark:hover:bg-teal-900/50"
              data-testid="button-ver-trabajadores-426"
              asChild
            >
              <Link href={`/trabajadores${fromParam}`}>
                <Users className="h-4 w-4 mr-2" />
                Ver Trabajadores
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-teal-300 text-teal-700 hover:bg-teal-100 dark:border-teal-600 dark:text-teal-300 dark:hover:bg-teal-900/50"
              data-testid="button-ver-iperc-426"
              asChild
            >
              <Link href={`/iperc${fromParam}`}>
                <ShieldCheck className="h-4 w-4 mr-2" />
                Ver Matriz IPERC
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

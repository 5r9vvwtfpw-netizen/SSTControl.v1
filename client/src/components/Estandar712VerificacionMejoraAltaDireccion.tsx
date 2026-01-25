import { AlertTriangle, CheckCircle2, FileText, Briefcase, TrendingUp, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface Estandar712VerificacionMejoraAltaDireccionProps {
  isVisible: boolean;
  evaluationId?: string;
}

const criteriosVerificacion = [
  "Solicitar la evidencia documental de las acciones correctivas, preventivas y/o de mejora que se implementaron según lo detectado en la revisión por la Alta Dirección del Sistema de Gestión de Seguridad y Salud en el Trabajo",
  "Verificar que las acciones responden a los hallazgos identificados en la revisión por la dirección",
  "Comprobar que cada acción tiene responsable, recursos asignados y fecha de implementación",
  "Verificar el seguimiento y cierre efectivo de las acciones derivadas de la revisión",
  "Confirmar que se evalúa la eficacia de las acciones implementadas",
  "Verificar que existe comunicación de los resultados a las partes interesadas",
];

export function Estandar712VerificacionMejoraAltaDireccion({ isVisible, evaluationId }: Estandar712VerificacionMejoraAltaDireccionProps) {
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
            Modo Verificación - Estándar 7.1.2
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
            Acciones de mejora conforme a revisión de la Alta Dirección. Verificar que 
            las acciones correctivas, preventivas y de mejora responden a los hallazgos 
            de la revisión por la dirección y tienen seguimiento efectivo.
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
              <li><strong>Decreto 1072/2015 Art. 2.2.4.6.31</strong> - Revisión por la alta dirección</li>
              <li><strong>Decreto 1072/2015 Art. 2.2.4.6.34</strong> - Mejora continua</li>
              <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 7.1.2</li>
              <li><strong>ISO 45001:2018 Numeral 10.3</strong> - Mejora continua</li>
            </ul>
          </div>

          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
            Evidencia esperada: Acta de revisión por la dirección, plan de acciones 
            derivadas, seguimiento de implementación, evaluación de eficacia, 
            comunicaciones a partes interesadas, registros de cierre.
          </p>

          <div className="flex gap-2 mt-3 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-revision-712"
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
              data-testid="button-ver-acciones-712"
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
              data-testid="button-ver-mejora-712"
              asChild
            >
              <Link href={buildUrl("/mejora-continua")}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Mejora Continua
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-documentos-712"
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

import { ClipboardList, Users, CheckCircle2, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface Estandar424VerificacionInspeccionesProps {
  isVisible: boolean;
  evaluationId?: string;
}

const criteriosVerificacion = [
  "Verificar existencia de formatos de registro de visitas de inspección elaborados y aprobados",
  "Revisar evidencia de inspecciones realizadas a instalaciones, maquinaria y equipos",
  "Confirmar que las inspecciones incluyen equipos relacionados con prevención y atención de emergencias",
  "Verificar la participación del COPASST en las inspecciones realizadas",
  "Comprobar que existe cronograma de inspecciones y se cumple periódicamente",
  "Revisar que los hallazgos de inspecciones generan acciones correctivas documentadas",
];

export function Estandar424VerificacionInspecciones({ isVisible, evaluationId }: Estandar424VerificacionInspeccionesProps) {
  if (!isVisible) return null;

  const fromParam = evaluationId 
    ? `?from=evaluation&evaluationId=${evaluationId}` 
    : "?from=evaluation";

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <ClipboardList className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Modo Verificación - Estándar 4.2.4
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
            Solicitar los formatos de registro de visitas de inspección elaborados. 
            Solicitar la evidencia de las visitas de inspección realizadas a las instalaciones, 
            maquinaria y equipos, incluidos los relacionados con la prevención y atención de emergencias 
            y verificar la participación del COPASST en las mismas.
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
              <li><strong>Decreto 1072/2015 Art. 2.2.4.6.31</strong> - Revisión por la alta dirección</li>
              <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 4.2.4</li>
              <li><strong>Decreto 1072/2015 Art. 2.2.4.6.8 numeral 9</strong> - Funciones del COPASST</li>
            </ul>
          </div>

          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
            Evidencia esperada: Formatos de inspección estandarizados, cronograma de inspecciones, 
            registros de inspecciones realizadas, actas del COPASST, evidencia fotográfica, 
            plan de acción y seguimiento a hallazgos.
          </p>

          <div className="flex gap-2 mt-3 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-inspecciones-424"
              asChild
            >
              <Link href={`/inspecciones${fromParam}`}>
                <FileSearch className="h-4 w-4 mr-2" />
                Ver Inspecciones
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-copasst-424"
              asChild
            >
              <Link href={`/copasst${fromParam}`}>
                <Users className="h-4 w-4 mr-2" />
                Ver COPASST
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-acciones-424"
              asChild
            >
              <Link href={`/medidas-preventivas${fromParam}`}>
                <ClipboardList className="h-4 w-4 mr-2" />
                Ver Acciones
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

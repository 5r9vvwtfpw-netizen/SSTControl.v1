import { Wrench, CheckCircle2, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface Estandar425VerificacionMantenimientoProps {
  isVisible: boolean;
  evaluationId?: string;
}

const criteriosVerificacion = [
  "Verificar existencia de programa de mantenimiento preventivo documentado",
  "Revisar cronograma de mantenimiento con fechas, responsables y frecuencias",
  "Confirmar que el mantenimiento se realiza según manuales de fabricante",
  "Verificar registros de mantenimientos realizados (preventivos y correctivos)",
  "Comprobar seguimiento a hallazgos de inspecciones que requieren mantenimiento",
  "Revisar que los reportes de condiciones inseguras generan órdenes de trabajo",
  "Verificar competencia del personal que realiza el mantenimiento",
];

export function Estandar425VerificacionMantenimiento({ isVisible, evaluationId }: Estandar425VerificacionMantenimientoProps) {
  if (!isVisible) return null;

  const fromParam = evaluationId 
    ? `?from=evaluation&evaluationId=${evaluationId}` 
    : "?from=evaluation";

  return (
    <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Wrench className="h-5 w-5 text-violet-600 dark:text-violet-400 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-violet-800 dark:text-violet-200">
            Modo Verificación - Estándar 4.2.5
          </p>
          <p className="text-sm text-violet-600 dark:text-violet-400 mt-1">
            Solicitar la evidencia del mantenimiento preventivo y/o correctivo en las instalaciones, 
            equipos, máquinas y herramientas, de acuerdo con los manuales de uso de estos y los 
            informes de las visitas de inspección o reportes de condiciones inseguras.
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
              <li><strong>Decreto 1072/2015 Art. 2.2.4.6.24</strong> - Medidas de prevención y control</li>
              <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 4.2.5</li>
              <li><strong>Resolución 2400/1979</strong> - Disposiciones sobre vivienda, higiene y seguridad</li>
              <li><strong>Ley 9/1979 Art. 112</strong> - Obligación de mantenimiento de equipos</li>
            </ul>
          </div>

          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
            Evidencia esperada: Programa de mantenimiento preventivo, cronograma, fichas técnicas, 
            hojas de vida de equipos, órdenes de trabajo, registros de mantenimientos realizados, 
            certificados de competencia del personal.
          </p>

          <div className="flex gap-2 mt-3 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-violet-300 text-violet-700 hover:bg-violet-100 dark:border-violet-600 dark:text-violet-300 dark:hover:bg-violet-900/50"
              data-testid="button-ver-mantenimiento-425"
              asChild
            >
              <Link href={`/inspecciones${fromParam}`}>
                <Wrench className="h-4 w-4 mr-2" />
                Ver Inspecciones
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-violet-300 text-violet-700 hover:bg-violet-100 dark:border-violet-600 dark:text-violet-300 dark:hover:bg-violet-900/50"
              data-testid="button-ver-cronograma-425"
              asChild
            >
              <Link href={`/cronograma${fromParam}`}>
                <Calendar className="h-4 w-4 mr-2" />
                Ver Cronograma
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-violet-300 text-violet-700 hover:bg-violet-100 dark:border-violet-600 dark:text-violet-300 dark:hover:bg-violet-900/50"
              data-testid="button-ver-documentos-425"
              asChild
            >
              <Link href={`/conservacion-documentos${fromParam}`}>
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

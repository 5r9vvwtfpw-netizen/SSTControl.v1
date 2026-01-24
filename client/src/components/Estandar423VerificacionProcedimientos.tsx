import { FileText, ClipboardCheck, Users, BookOpen, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface Estandar423VerificacionProcedimientosProps {
  isVisible: boolean;
  evaluationId?: string;
}

const criteriosVerificacion = [
  "Verificar que existan procedimientos documentados para tareas de alto riesgo identificadas en la matriz IPERC",
  "Revisar que los instructivos contengan medidas de prevención y control de riesgos",
  "Confirmar que las fichas técnicas estén actualizadas y disponibles en idioma español",
  "Verificar evidencia de socialización y entrega de documentos a los trabajadores",
  "Comprobar que los trabajadores conocen y aplican los procedimientos establecidos",
  "Verificar registros de capacitación sobre los procedimientos e instructivos",
];

export function Estandar423VerificacionProcedimientos({ isVisible, evaluationId }: Estandar423VerificacionProcedimientosProps) {
  if (!isVisible) return null;

  const fromParam = evaluationId 
    ? `?from=evaluation&evaluationId=${evaluationId}` 
    : "?from=evaluation";

  return (
    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <ClipboardCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Modo Verificación - Estándar 4.2.3
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            Solicitar los procedimientos, instructivos, fichas técnicas cuando aplique y protocolos de SST 
            y el soporte de entrega de los mismos a los trabajadores. Verificar que estén documentados, 
            actualizados y que los trabajadores los conozcan.
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
              <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 4.2.3</li>
              <li><strong>Decreto 1496/2018</strong> - Sistema Globalmente Armonizado (SGA)</li>
              <li><strong>Resolución 0773/2021</strong> - Trabajo seguro en alturas (cuando aplique)</li>
            </ul>
          </div>

          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
            Evidencia esperada: Procedimientos de trabajo seguro, instructivos operacionales, 
            fichas de seguridad (FDS/MSDS), protocolos de SST, registros de capacitación, actas de entrega 
            firmadas por los trabajadores.
          </p>

          <div className="flex gap-2 mt-3 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50"
              data-testid="button-ver-documentos-423"
              asChild
            >
              <Link href={`/conservacion-documentos${fromParam}`}>
                <FileText className="h-4 w-4 mr-2" />
                Ver Documentos SST
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50"
              data-testid="button-ver-capacitaciones-423"
              asChild
            >
              <Link href={`/capacitaciones${fromParam}`}>
                <BookOpen className="h-4 w-4 mr-2" />
                Ver Capacitaciones
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50"
              data-testid="button-ver-trabajadores-423"
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
              className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50"
              data-testid="button-ver-iperc-423"
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

import { AlertTriangle, CheckCircle2, FileText, ClipboardCheck, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface Estandar711VerificacionAccionesCorrectivasProps {
  isVisible: boolean;
  evaluationId?: string;
}

const criteriosVerificacion = [
  "Solicitar la evidencia documental de la implementación de las acciones preventivas y/o correctivas",
  "Verificar que las acciones correctivas se derivan de: investigación de accidentes, auditorías, revisión por la dirección, inspecciones",
  "Comprobar que cada acción tiene responsable asignado, fecha de cumplimiento y seguimiento",
  "Verificar que las acciones abordan las causas raíz identificadas",
  "Confirmar que se evalúa la eficacia de las acciones implementadas",
  "Verificar que las acciones preventivas se basan en la identificación de peligros y evaluación de riesgos",
  "Comprobar que existe registro del cierre efectivo de las acciones",
];

export function Estandar711VerificacionAccionesCorrectivas({ isVisible, evaluationId }: Estandar711VerificacionAccionesCorrectivasProps) {
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
            Modo Verificación - Estándar 7.1.1
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
            Acciones preventivas y correctivas. Verificar la evidencia documental de 
            la implementación de acciones que aborden las causas raíz de los hallazgos 
            y la evaluación de su eficacia.
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
              <li><strong>Decreto 1072/2015 Art. 2.2.4.6.33</strong> - Acciones preventivas y correctivas</li>
              <li><strong>Decreto 1072/2015 Art. 2.2.4.6.34</strong> - Mejora continua</li>
              <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 7.1.1</li>
              <li><strong>ISO 45001:2018 Numeral 10.2</strong> - No conformidad y acción correctiva</li>
            </ul>
          </div>

          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
            Evidencia esperada: Registro de acciones correctivas y preventivas, análisis 
            de causas raíz, planes de acción con responsables y fechas, seguimiento de 
            cumplimiento, evaluación de eficacia, registros de cierre.
          </p>

          <div className="flex gap-2 mt-3 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-acciones-711"
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
              data-testid="button-ver-no-conformidades-711"
              asChild
            >
              <Link href={buildUrl("/no-conformidades")}>
                <AlertCircle className="h-4 w-4 mr-2" />
                No Conformidades
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-mejora-711"
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
              data-testid="button-ver-documentos-711"
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

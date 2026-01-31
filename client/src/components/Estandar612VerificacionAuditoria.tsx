import { AlertTriangle, CheckCircle2, FileText, ClipboardCheck, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface Estandar612VerificacionAuditoriaProps {
  isVisible: boolean;
  evaluationId?: string;
}

const criteriosVerificacion = [
  "Verificar soportes de la realización de auditorías internas al Sistema de Gestión de SST, con alcance a todas las áreas de la empresa, adelantadas por lo menos una (1) vez al año",
  "Solicitar el programa de la auditoría que deberá incluir entre otros aspectos: la definición de la idoneidad de la persona que sea auditora, el alcance de la auditoría, la periodicidad, la metodología y la presentación de informes",
  "Verificar que se haya planificado con la participación del COPASST",
  "Comprobar que los auditores son independientes (no auditan su propio trabajo)",
  "Revisar que los resultados de la auditoría fueron comunicados a los responsables",
  "Verificar que se definieron acciones correctivas y de mejora a partir de los hallazgos",
];

export function Estandar612VerificacionAuditoria({ isVisible, evaluationId }: Estandar612VerificacionAuditoriaProps) {
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
            Modo Verificación - Estándar 6.1.2
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
            Auditoría anual. Verificar la realización de auditorías internas al SG-SST 
            con alcance a todas las áreas, planificadas con participación del COPASST 
            y ejecutadas por personal idóneo e independiente.
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
              <li><strong>Decreto 1072/2015 Art. 2.2.4.6.29</strong> - Auditoría de cumplimiento del SG-SST</li>
              <li><strong>Decreto 1072/2015 Art. 2.2.4.6.30</strong> - Alcance de la auditoría</li>
              <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 6.1.2</li>
              <li><strong>ISO 45001:2018 Numeral 9.2</strong> - Auditoría interna</li>
            </ul>
          </div>

          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
            Evidencia esperada: Programa de auditoría aprobado, plan de auditoría, 
            informes de auditoría con hallazgos, actas de apertura y cierre, 
            certificados de competencia de auditores, acta del COPASST de participación 
            en la planificación, plan de acciones correctivas.
          </p>

          <div className="flex gap-2 mt-3 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-auditorias-612"
              asChild
            >
              <Link href={buildUrl("/auditorias-internas")}>
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Ver Auditorías
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-copasst-612"
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
              data-testid="button-ver-cronograma-612"
              asChild
            >
              <Link href={buildUrl("/planes-trabajo-anual")}>
                <Calendar className="h-4 w-4 mr-2" />
                Cronograma SST
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-documentos-612"
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

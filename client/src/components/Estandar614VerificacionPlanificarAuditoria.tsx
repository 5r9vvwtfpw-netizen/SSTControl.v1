import { AlertTriangle, CheckCircle2, FileText, Users, ClipboardCheck, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface Estandar614VerificacionPlanificarAuditoriaProps {
  isVisible: boolean;
  evaluationId?: string;
}

const criteriosVerificacion = [
  "Solicitar el documento donde conste la revisión anual por la alta dirección y la comunicación de los resultados al COPASST y al responsable del Sistema de Gestión de SST",
  "Verificar que existe acta del COPASST donde conste su participación en la planificación de la auditoría",
  "Comprobar que el COPASST conoce el programa y cronograma de auditorías",
  "Verificar que los resultados de la auditoría fueron comunicados formalmente al COPASST",
  "Confirmar que el responsable del SG-SST recibió comunicación de los resultados",
  "Verificar que existen registros de las acciones tomadas a partir de los resultados comunicados",
];

export function Estandar614VerificacionPlanificarAuditoria({ isVisible, evaluationId }: Estandar614VerificacionPlanificarAuditoriaProps) {
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
            Modo Verificación - Estándar 6.1.4
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
            Planificar auditoría con el COPASST. Verificar que la auditoría se planificó 
            con participación del COPASST y que los resultados de la revisión por la 
            alta dirección fueron comunicados al COPASST y al responsable del SG-SST.
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
              <li><strong>Decreto 1072/2015 Art. 2.2.4.6.31</strong> - Revisión por la alta dirección</li>
              <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 6.1.4</li>
              <li><strong>Resolución 2013/1986</strong> - Funciones del COPASST</li>
            </ul>
          </div>

          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
            Evidencia esperada: Actas del COPASST con participación en planificación de auditoría, 
            comunicaciones formales de resultados, acta de revisión por la dirección con 
            evidencia de comunicación, registros de acciones derivadas.
          </p>

          <div className="flex gap-2 mt-3 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-copasst-614"
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
              data-testid="button-ver-auditorias-614"
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
              data-testid="button-ver-comunicaciones-614"
              asChild
            >
              <Link href={buildUrl("/comunicaciones-sst")}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Comunicaciones
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-documentos-614"
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

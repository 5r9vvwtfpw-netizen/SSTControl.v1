import { AlertTriangle, CheckCircle2, FileText, BarChart3, TrendingUp, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface Estandar611VerificacionIndicadoresProps {
  isVisible: boolean;
  evaluationId?: string;
}

const criteriosVerificacion = [
  "Solicitar los indicadores del Sistema de Gestión de SST definidos por la empresa",
  "Solicitar informe con los resultados de la evaluación del Sistema de Gestión de SST",
  "Verificar que los indicadores están de acuerdo con los indicadores mínimos señalados en el presente acto administrativo",
  "Comprobar que existen indicadores de estructura, proceso y resultado",
  "Verificar que cada indicador tiene ficha técnica con: definición, interpretación, límite, método de cálculo, fuente de información, periodicidad y responsable",
  "Confirmar que se realiza seguimiento periódico a los indicadores definidos",
];

export function Estandar611VerificacionIndicadores({ isVisible, evaluationId }: Estandar611VerificacionIndicadoresProps) {
  if (!isVisible) return null;

  const baseParams = evaluationId 
    ? `from=evaluation&evaluationId=${evaluationId}` 
    : "from=evaluation";
  
  const buildUrl = (path: string, tab?: string) => {
    const params = tab ? `tab=${tab}&${baseParams}` : baseParams;
    // Handle paths that already have query params
    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}${params}`;
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Modo Verificación - Estándar 6.1.1
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
            Definición de indicadores del Sistema de Gestión de Seguridad y Salud en el Trabajo. 
            Verificar que la empresa tiene definidos indicadores de estructura, proceso y resultado 
            con sus respectivas fichas técnicas y seguimiento periódico.
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
              <li><strong>Decreto 1072/2015 Art. 2.2.4.6.19</strong> - Indicadores del SG-SST</li>
              <li><strong>Decreto 1072/2015 Art. 2.2.4.6.20</strong> - Indicadores de estructura</li>
              <li><strong>Decreto 1072/2015 Art. 2.2.4.6.21</strong> - Indicadores de proceso</li>
              <li><strong>Decreto 1072/2015 Art. 2.2.4.6.22</strong> - Indicadores de resultado</li>
              <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 6.1.1</li>
            </ul>
          </div>

          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
            Evidencia esperada: Matriz de indicadores SST, fichas técnicas de cada indicador, 
            informes de seguimiento periódico, gráficas de tendencias, actas de revisión por 
            la dirección con análisis de indicadores.
          </p>

          <div className="flex gap-2 mt-3 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-indicadores-611"
              asChild
            >
              <Link href={buildUrl("/objetivos-sst?tab=indicadores")}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Indicadores
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-estadisticas-611"
              asChild
            >
              <Link href={buildUrl("/indicadores-accidentalidad")}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Estadísticas
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-metas-611"
              asChild
            >
              <Link href={buildUrl("/objetivos-sst")}>
                <Target className="h-4 w-4 mr-2" />
                Objetivos y Metas
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900/50"
              data-testid="button-ver-documentos-611"
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

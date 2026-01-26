import { AlertTriangle, CheckCircle2, FileText, Briefcase, Users, Target, BarChart3 } from "lucide-react";
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

const elementosRevision = [
  {
    nombre: "Revisión por Dirección",
    descripcion: "Actas de revisión con decisiones y compromisos de la Alta Dirección",
    ruta: "/revisiones-direccion",
    tab: undefined,
    icono: Briefcase,
  },
  {
    nombre: "Política SST",
    descripcion: "Verificar alineación de acciones con la política de SST",
    ruta: "/politicas-sst",
    tab: undefined,
    icono: Target,
  },
  {
    nombre: "Objetivos SST",
    descripcion: "Cumplimiento de objetivos y metas del SG-SST",
    ruta: "/objetivos-sst",
    tab: undefined,
    icono: BarChart3,
  },
  {
    nombre: "Responsables SST",
    descripcion: "Matriz de responsabilidades y rendición de cuentas",
    ruta: "/responsables",
    tab: undefined,
    icono: Users,
  },
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
            <strong>Acciones de mejora conforme a revisión de la Alta Dirección.</strong> Según 
            el Decreto 1072/2015 Art. 2.2.4.6.31, la Alta Dirección debe revisar el SG-SST mínimo 
            una vez al año y definir acciones correctivas, preventivas y de mejora con responsables, 
            recursos y cronograma.
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
              <li><strong>ISO 45001:2018 Numeral 9.3</strong> - Revisión por la dirección</li>
              <li><strong>ISO 45001:2018 Numeral 10.3</strong> - Mejora continua</li>
            </ul>
          </div>

          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
            Evidencia esperada: Acta de revisión por la dirección, plan de acciones derivadas con 
            responsables y fechas, asignación de recursos, seguimiento de implementación, 
            evaluación de eficacia, comunicaciones a partes interesadas.
          </p>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Elementos de la Revisión por la Dirección (Decreto 1072/2015 Art. 2.2.4.6.31):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {elementosRevision.map((elemento, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="justify-start h-auto py-2 px-3 border-blue-200 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/50"
                  data-testid={`button-elemento-712-${idx}`}
                  asChild
                >
                  <Link href={buildUrl(elemento.ruta, elemento.tab)}>
                    <elemento.icono className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-xs font-medium">{elemento.nombre}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mt-4 flex-wrap">
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

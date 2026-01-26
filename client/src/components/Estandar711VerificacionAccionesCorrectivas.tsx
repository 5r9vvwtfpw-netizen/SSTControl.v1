import { AlertTriangle, CheckCircle2, TrendingUp, Search, Briefcase } from "lucide-react";
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

const fuentesAcciones = [
  {
    nombre: "Investigación de Accidentes",
    descripcion: "Acciones derivadas de investigación de AT, EL e incidentes (Art. 2.2.4.6.32)",
    ruta: "/accidentes",
    tab: "investigaciones",
    icono: Search,
  },
  {
    nombre: "Revisión por Dirección",
    descripcion: "Decisiones y compromisos de la Alta Dirección (Art. 2.2.4.6.31)",
    ruta: "/revisiones-direccion",
    tab: undefined,
    icono: Briefcase,
  },
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
            <strong>Acciones preventivas y correctivas con base en los resultados del SG-SST.</strong> Según 
            el Decreto 1072/2015 Art. 2.2.4.6.33, verificar que se definan e implementen acciones basadas en 
            la supervisión, auditorías y revisión por la dirección, orientadas a identificar causas fundamentales 
            de no conformidades.
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
            de causas raíz (5 porqués, espina de pescado), planes de acción con responsables y fechas, 
            seguimiento de cumplimiento, evaluación de eficacia, registros de cierre.
          </p>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Fuentes de Acciones Correctivas/Preventivas (Decreto 1072/2015):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {fuentesAcciones.map((fuente, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="justify-start h-auto py-2 px-3 border-blue-200 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/50"
                  data-testid={`button-fuente-${idx}`}
                  asChild
                >
                  <Link href={buildUrl(fuente.ruta, fuente.tab)}>
                    <fuente.icono className="h-4 w-4 mr-2 flex-shrink-0" />
                    <div className="text-left">
                      <span className="block text-xs font-medium">{fuente.nombre}</span>
                      <span className="block text-[10px] text-muted-foreground">{fuente.descripcion}</span>
                    </div>
                  </Link>
                </Button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

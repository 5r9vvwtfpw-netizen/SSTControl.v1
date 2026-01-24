import { Shield, CheckCircle2, FileText, Users, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface Estandar512VerificacionBrigadaProps {
  isVisible: boolean;
  evaluationId?: string;
}

const criteriosVerificacion = [
  "Solicitar el documento de conformación de la brigada de prevención, preparación y respuesta ante emergencias",
  "Verificar los soportes de la capacitación y entrenamiento de los brigadistas",
  "Confirmar que la brigada cuenta con la dotación necesaria para atender emergencias",
  "Verificar que existe un programa de capacitación periódica para los brigadistas",
  "Comprobar que los brigadistas conocen el plan de emergencias y sus funciones específicas",
  "Verificar registros de participación de la brigada en simulacros",
];

export function Estandar512VerificacionBrigada({ isVisible, evaluationId }: Estandar512VerificacionBrigadaProps) {
  if (!isVisible) return null;

  const baseParams = evaluationId 
    ? `from=evaluation&evaluationId=${evaluationId}` 
    : "from=evaluation";
  
  const buildUrl = (path: string, tab?: string) => {
    const params = tab ? `tab=${tab}&${baseParams}` : baseParams;
    return `${path}?${params}`;
  };

  return (
    <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
            Modo Verificación - Estándar 5.1.2
          </p>
          <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
            Brigada de prevención, preparación y respuesta ante emergencias. Verificar 
            la conformación de la brigada, capacitación de sus miembros, dotación 
            de equipos y participación en simulacros.
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
              <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 5.1.2</li>
              <li><strong>Ley 1523/2012</strong> - Política Nacional de Gestión del Riesgo</li>
              <li><strong>Resolución 2400/1979</strong> - Brigadas de emergencia</li>
            </ul>
          </div>

          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3 font-medium">
            Evidencia esperada: Acta de conformación de brigada, listado de brigadistas, 
            certificados de capacitación, inventario de dotación, registros de entrenamiento, 
            informes de participación en simulacros.
          </p>

          <div className="flex gap-2 mt-3 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-900/50"
              data-testid="button-ver-brigada-512"
              asChild
            >
              <Link href={buildUrl("/plan-emergencias", "brigadas")}>
                <Shield className="h-4 w-4 mr-2" />
                Ver Brigada
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-900/50"
              data-testid="button-ver-capacitaciones-512"
              asChild
            >
              <Link href={buildUrl("/capacitaciones")}>
                <GraduationCap className="h-4 w-4 mr-2" />
                Ver Capacitaciones
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-900/50"
              data-testid="button-ver-simulacros-512"
              asChild
            >
              <Link href={buildUrl("/plan-emergencias", "simulacros")}>
                <Users className="h-4 w-4 mr-2" />
                Ver Simulacros
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-900/50"
              data-testid="button-ver-documentos-512"
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

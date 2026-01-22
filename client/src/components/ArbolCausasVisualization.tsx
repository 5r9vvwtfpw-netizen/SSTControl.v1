import type { AccidentInvestigation } from "@shared/schema";
import { 
  AlertTriangle, 
  Zap, 
  ShieldAlert, 
  User, 
  Briefcase, 
  Target,
  Info
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ArbolCausasVisualizationProps {
  investigation: AccidentInvestigation;
  eventDescription: string;
}

const IMMEDIATE_CAUSES_OPTIONS: Record<string, string> = {
  "operar_sin_autorizacion": "Operar sin autorización",
  "no_uso_epp": "No usar equipo de protección personal",
  "velocidad_inadecuada": "Velocidad inadecuada",
  "no_seguir_procedimiento": "No seguir procedimiento establecido",
  "posicion_inadecuada": "Posición inadecuada para la tarea",
  "levantar_peso_incorrecto": "Levantamiento incorrecto de cargas",
  "distraccion": "Distracción durante la tarea",
  "fatiga": "Fatiga del trabajador",
};

const CONDITION_CAUSES_OPTIONS: Record<string, string> = {
  "proteccion_inadecuada": "Protecciones inadecuadas o inexistentes",
  "herramienta_defectuosa": "Herramientas o equipos defectuosos",
  "orden_limpieza": "Falta de orden y limpieza",
  "iluminacion_deficiente": "Iluminación deficiente",
  "ventilacion_inadecuada": "Ventilación inadecuada",
  "espacio_reducido": "Espacio de trabajo reducido",
  "senalizacion_deficiente": "Señalización deficiente o inexistente",
  "piso_resbaloso": "Piso resbaloso o en mal estado",
};

const BASIC_PERSONAL_CAUSES: Record<string, string> = {
  "falta_conocimiento": "Falta de conocimiento o capacitación",
  "falta_habilidad": "Falta de habilidad para la tarea",
  "motivacion_inadecuada": "Motivación inadecuada",
  "estres_tension": "Estrés o tensión",
  "problemas_salud": "Problemas de salud física o mental",
  "fatiga_cansancio": "Fatiga o cansancio",
};

const BASIC_WORK_CAUSES: Record<string, string> = {
  "supervision_inadecuada": "Supervisión inadecuada",
  "liderazgo_deficiente": "Liderazgo deficiente",
  "ingenieria_inadecuada": "Ingeniería inadecuada",
  "herramientas_inadecuadas": "Herramientas o equipos inadecuados",
  "mantenimiento_deficiente": "Mantenimiento deficiente",
  "comunicacion_deficiente": "Comunicación deficiente",
  "procedimientos_ausentes": "Procedimientos ausentes o inadecuados",
};

function getCauseLabel(value: string, options: Record<string, string>): string {
  return options[value] || value;
}

function TreeNode({ 
  children, 
  className = "",
  bgColor = "bg-card",
  borderColor = "border-border",
  icon: Icon,
  iconColor = "text-foreground"
}: { 
  children: React.ReactNode;
  className?: string;
  bgColor?: string;
  borderColor?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
}) {
  return (
    <div className={`relative px-3 py-2 rounded-md border ${bgColor} ${borderColor} shadow-sm ${className}`}>
      <div className="flex items-start gap-2">
        {Icon && <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconColor}`} />}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}

function ConnectorVertical({ className = "" }: { className?: string }) {
  return (
    <div className={`w-0.5 h-6 bg-muted-foreground/30 mx-auto ${className}`} />
  );
}

function ConnectorHorizontal({ className = "" }: { className?: string }) {
  return (
    <div className={`h-0.5 bg-muted-foreground/30 flex-1 ${className}`} />
  );
}

export function ArbolCausasVisualization({ investigation, eventDescription }: ArbolCausasVisualizationProps) {
  const immediateActs = investigation.immediateActCauses || [];
  const immediateConditions = investigation.immediateConditionCauses || [];
  const basicPersonal = investigation.basicPersonalCauses || [];
  const basicWork = investigation.basicWorkCauses || [];
  const rootCause = investigation.rootCause;

  const hasImmediateCauses = immediateActs.length > 0 || immediateConditions.length > 0;
  const hasBasicCauses = basicPersonal.length > 0 || basicWork.length > 0;
  const hasRootCause = rootCause && rootCause.trim().length > 0;

  if (!hasImmediateCauses && !hasBasicCauses && !hasRootCause) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Info className="w-5 h-5" />
          <span>No se han identificado causas aún. Complete el análisis de causas para visualizar el árbol.</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 md:p-6 overflow-x-auto">
      <div className="min-w-[320px]">
        <div className="flex flex-col items-center gap-0">
          <TreeNode 
            bgColor="bg-red-50 dark:bg-red-950/30" 
            borderColor="border-red-200 dark:border-red-800"
            icon={AlertTriangle}
            iconColor="text-red-600 dark:text-red-400"
            className="max-w-md text-center"
          >
            <div className="font-semibold text-red-700 dark:text-red-300">Evento / Accidente</div>
            <div className="text-muted-foreground mt-1 line-clamp-2">{eventDescription}</div>
          </TreeNode>

          {hasImmediateCauses && (
            <>
              <ConnectorVertical />
              
              <div className="flex items-center justify-center w-full max-w-2xl gap-2">
                <ConnectorHorizontal />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                <ConnectorHorizontal />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-2">
                <div className="flex flex-col gap-2">
                  <div className="text-center">
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800">
                      <Zap className="w-3 h-3 mr-1" />
                      Actos Inseguros
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2">
                    {immediateActs.length > 0 ? (
                      immediateActs.map((cause, idx) => (
                        <TreeNode 
                          key={`act-${idx}`}
                          bgColor="bg-amber-50 dark:bg-amber-950/20" 
                          borderColor="border-amber-200 dark:border-amber-800"
                          icon={Zap}
                          iconColor="text-amber-600 dark:text-amber-400"
                        >
                          {getCauseLabel(cause, IMMEDIATE_CAUSES_OPTIONS)}
                        </TreeNode>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground text-sm py-2">
                        Sin actos inseguros identificados
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="text-center">
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800">
                      <ShieldAlert className="w-3 h-3 mr-1" />
                      Condiciones Inseguras
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2">
                    {immediateConditions.length > 0 ? (
                      immediateConditions.map((cause, idx) => (
                        <TreeNode 
                          key={`cond-${idx}`}
                          bgColor="bg-orange-50 dark:bg-orange-950/20" 
                          borderColor="border-orange-200 dark:border-orange-800"
                          icon={ShieldAlert}
                          iconColor="text-orange-600 dark:text-orange-400"
                        >
                          {getCauseLabel(cause, CONDITION_CAUSES_OPTIONS)}
                        </TreeNode>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground text-sm py-2">
                        Sin condiciones inseguras identificadas
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {hasBasicCauses && (
            <>
              <ConnectorVertical className="mt-4" />
              
              <div className="flex items-center justify-center w-full max-w-2xl gap-2">
                <ConnectorHorizontal />
                <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                <ConnectorHorizontal />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-2">
                <div className="flex flex-col gap-2">
                  <div className="text-center">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800">
                      <User className="w-3 h-3 mr-1" />
                      Factores Personales
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2">
                    {basicPersonal.length > 0 ? (
                      basicPersonal.map((cause, idx) => (
                        <TreeNode 
                          key={`personal-${idx}`}
                          bgColor="bg-blue-50 dark:bg-blue-950/20" 
                          borderColor="border-blue-200 dark:border-blue-800"
                          icon={User}
                          iconColor="text-blue-600 dark:text-blue-400"
                        >
                          {getCauseLabel(cause, BASIC_PERSONAL_CAUSES)}
                        </TreeNode>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground text-sm py-2">
                        Sin factores personales identificados
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="text-center">
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-800">
                      <Briefcase className="w-3 h-3 mr-1" />
                      Factores del Trabajo
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2">
                    {basicWork.length > 0 ? (
                      basicWork.map((cause, idx) => (
                        <TreeNode 
                          key={`work-${idx}`}
                          bgColor="bg-indigo-50 dark:bg-indigo-950/20" 
                          borderColor="border-indigo-200 dark:border-indigo-800"
                          icon={Briefcase}
                          iconColor="text-indigo-600 dark:text-indigo-400"
                        >
                          {getCauseLabel(cause, BASIC_WORK_CAUSES)}
                        </TreeNode>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground text-sm py-2">
                        Sin factores del trabajo identificados
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {hasRootCause && (
            <>
              <ConnectorVertical className="mt-4" />
              
              <TreeNode 
                bgColor="bg-purple-50 dark:bg-purple-950/30" 
                borderColor="border-purple-200 dark:border-purple-800"
                icon={Target}
                iconColor="text-purple-600 dark:text-purple-400"
                className="max-w-md text-center"
              >
                <div className="font-semibold text-purple-700 dark:text-purple-300">Causa Raíz</div>
                <div className="mt-1">{rootCause}</div>
              </TreeNode>
            </>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2 font-medium">Leyenda de Colores:</div>
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-200 dark:bg-red-800 border border-red-300 dark:border-red-700" />
              <span>Evento/Accidente</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-amber-200 dark:bg-amber-800 border border-amber-300 dark:border-amber-700" />
              <span>Acto Inseguro</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-orange-200 dark:bg-orange-800 border border-orange-300 dark:border-orange-700" />
              <span>Condición Insegura</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-blue-200 dark:bg-blue-800 border border-blue-300 dark:border-blue-700" />
              <span>Factor Personal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-indigo-200 dark:bg-indigo-800 border border-indigo-300 dark:border-indigo-700" />
              <span>Factor del Trabajo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-purple-200 dark:bg-purple-800 border border-purple-300 dark:border-purple-700" />
              <span>Causa Raíz</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

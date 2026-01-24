import { HardHat, Users, ShieldCheck, CheckCircle2, AlertTriangle, FileCheck, GraduationCap, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface Estandar426VerificacionEPPProps {
  isVisible: boolean;
  evaluationId?: string;
}

const elementosVerificacion = [
  {
    id: 1,
    nombre: "Entrega de EPP a trabajadores",
    descripcion: "Registros de entrega inicial y reposición de elementos de protección personal",
    ejemplos: ["Formato de entrega firmado", "Inventario de EPP", "Control de reposiciones", "Tallas asignadas"],
  },
  {
    id: 2,
    nombre: "Cumplimiento de contratistas y subcontratistas",
    descripcion: "Verificación de que contratistas cumplen con entrega de EPP a su personal",
    ejemplos: ["Registros del contratista", "Certificación de entrega", "Supervisión de uso", "Actas de verificación"],
  },
  {
    id: 3,
    nombre: "Capacitación en uso de EPP",
    descripcion: "Evidencia de formación sobre uso correcto, mantenimiento y cuidado de EPP",
    ejemplos: ["Listas de asistencia", "Material de capacitación", "Evaluaciones de conocimiento", "Registros fotográficos"],
  },
  {
    id: 4,
    nombre: "Especificaciones técnicas de EPP",
    descripcion: "Fichas técnicas, certificaciones y vida útil de los elementos entregados",
    ejemplos: ["Fichas técnicas", "Certificados de calidad", "Fechas de vencimiento", "Normas aplicables"],
  },
];

const criteriosVerificacion = [
  "Solicitar los soportes que evidencien la entrega y reposición de los elementos de protección personal a los trabajadores",
  "Verificar los soportes del cumplimiento del criterio por parte de los contratistas y subcontratistas",
  "Verificar los soportes que evidencien la realización de la capacitación en el uso de los elementos de protección personal",
  "Confirmar que los EPP entregados corresponden a los riesgos identificados en la matriz IPERC",
  "Verificar que existe un procedimiento de solicitud y reposición de EPP dañados o deteriorados",
  "Comprobar que los trabajadores usan correctamente los EPP asignados durante las actividades de riesgo",
];

const elementosAVerificar = [
  "Formato de entrega de EPP firmado por trabajadores",
  "Matriz de EPP por cargo según exposición a riesgos",
  "Registros de reposición de EPP por deterioro o vencimiento",
  "Contratos con cláusulas de SST para contratistas",
  "Registros de verificación de EPP a contratistas",
  "Listas de asistencia a capacitaciones de uso de EPP",
  "Material de capacitación sobre EPP",
  "Fichas técnicas y certificaciones de los EPP",
];

const normativaAplicable = [
  { norma: "Decreto 1072/2015", articulo: "Art. 2.2.4.6.24", descripcion: "Obligación de suministro de EPP" },
  { norma: "Resolución 0312/2019", articulo: "Estándar 4.2.6", descripcion: "Entrega de EPP y capacitación, incluye contratistas" },
  { norma: "Resolución 2400/1979", articulo: "Arts. 176-201", descripcion: "Especificaciones técnicas de EPP" },
  { norma: "Ley 1562/2012", articulo: "Art. 11", descripcion: "Responsabilidad del empleador en suministro de EPP" },
];

export function Estandar426VerificacionEPP({ isVisible, evaluationId }: Estandar426VerificacionEPPProps) {
  if (!isVisible) return null;

  const fromParam = evaluationId 
    ? `?from=evaluation&evaluationId=${evaluationId}` 
    : "?from=evaluation";

  return (
    <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <HardHat className="h-5 w-5 text-teal-600 dark:text-teal-400 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-teal-800 dark:text-teal-200">
            Modo Verificación - Estándar 4.2.6
          </p>
          <p className="text-sm text-teal-600 dark:text-teal-400 mt-1">
            Entrega de Elementos de Protección Personal EPP y capacitación en uso adecuado, 
            se verifica con contratistas y subcontratistas. Verificar registros de entrega, 
            reposición y capacitación tanto para trabajadores directos como para personal de contratistas.
          </p>

          <div className="mt-3 p-3 bg-teal-100/50 dark:bg-teal-900/30 rounded-md border border-teal-200 dark:border-teal-800">
            <p className="text-xs font-semibold text-teal-700 dark:text-teal-300 mb-2">
              Elementos a verificar:
            </p>
            <div className="grid gap-2">
              {elementosVerificacion.map((elemento) => (
                <div key={elemento.id} className="flex items-start gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded border border-teal-100 dark:border-teal-900">
                  <FileCheck className="h-4 w-4 text-teal-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-teal-800 dark:text-teal-200">{elemento.nombre}</p>
                    <p className="text-xs text-teal-600 dark:text-teal-400">{elemento.descripcion}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {elemento.ejemplos.map((ejemplo, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-teal-300 text-teal-600 dark:border-teal-700 dark:text-teal-300">
                          {ejemplo}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-md border border-emerald-200 dark:border-emerald-800">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
              <CheckCircle2 className="h-3 w-3 inline mr-1" />
              Criterios de verificación (Resolución 0312/2019):
            </p>
            <ul className="text-xs text-emerald-600 dark:text-emerald-400 space-y-1 list-disc list-inside">
              {criteriosVerificacion.map((criterio, idx) => (
                <li key={idx}>{criterio}</li>
              ))}
            </ul>
          </div>

          <div className="mt-3 p-3 bg-cyan-100/50 dark:bg-cyan-900/30 rounded-md border border-cyan-200 dark:border-cyan-800">
            <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 mb-2">
              <ShieldCheck className="h-3 w-3 inline mr-1" />
              Documentos/Evidencias requeridas:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {elementosAVerificar.map((elemento, idx) => (
                <div key={idx} className="flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400">
                  <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                  <span>{elemento}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 p-3 bg-violet-100/50 dark:bg-violet-900/30 rounded-md border border-violet-200 dark:border-violet-800">
            <p className="text-xs font-semibold text-violet-700 dark:text-violet-300 mb-2">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              Normativa aplicable:
            </p>
            <div className="grid gap-1">
              {normativaAplicable.map((norma, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-violet-200 text-violet-700 dark:bg-violet-800 dark:text-violet-200 flex-shrink-0">
                    {norma.norma}
                  </Badge>
                  <span className="text-violet-600 dark:text-violet-400">
                    {norma.articulo} - {norma.descripcion}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/entrega-epp${fromParam}`}>
              <Button size="sm" variant="outline" className="text-xs border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-300 dark:hover:bg-teal-900/50">
                <HardHat className="h-3 w-3 mr-1" />
                Ir a Entrega EPP
              </Button>
            </Link>
            <Link href={`/capacitaciones${fromParam}`}>
              <Button size="sm" variant="outline" className="text-xs border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-300 dark:hover:bg-teal-900/50">
                <GraduationCap className="h-3 w-3 mr-1" />
                Ir a Capacitaciones
              </Button>
            </Link>
            <Link href={`/evaluacion-proveedores${fromParam}`}>
              <Button size="sm" variant="outline" className="text-xs border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-300 dark:hover:bg-teal-900/50">
                <Building2 className="h-3 w-3 mr-1" />
                Ir a Contratistas
              </Button>
            </Link>
            <Link href={`/trabajadores${fromParam}`}>
              <Button size="sm" variant="outline" className="text-xs border-teal-300 text-teal-700 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-300 dark:hover:bg-teal-900/50">
                <Users className="h-3 w-3 mr-1" />
                Ir a Trabajadores
              </Button>
            </Link>
          </div>

          <div className="mt-3 p-2 bg-orange-100/50 dark:bg-orange-900/30 rounded border border-orange-200 dark:border-orange-800">
            <p className="text-xs text-orange-700 dark:text-orange-300">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              <strong>Importante:</strong> Este estándar aplica tanto para trabajadores directos como para 
              contratistas y subcontratistas. Asegúrese de verificar que los contratistas también cumplen 
              con la entrega de EPP y capacitación a su personal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Wrench, ClipboardCheck, Settings, Building2, Cog, AlertTriangle, CheckCircle2, FileText, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface Estandar425VerificacionMantenimientoProps {
  isVisible: boolean;
  evaluationId?: string;
}

const tiposMantenimiento = [
  {
    id: 1,
    nombre: "Mantenimiento preventivo",
    descripcion: "Acciones programadas para prevenir fallas y asegurar el funcionamiento óptimo",
    ejemplos: ["Lubricación", "Ajustes periódicos", "Cambio de piezas", "Calibración", "Limpieza técnica"],
  },
  {
    id: 2,
    nombre: "Mantenimiento correctivo",
    descripcion: "Reparaciones realizadas después de detectar fallas o averías",
    ejemplos: ["Reparación de equipos", "Reemplazo de componentes", "Corrección de fallas eléctricas", "Soldaduras"],
  },
  {
    id: 3,
    nombre: "Mantenimiento predictivo",
    descripcion: "Monitoreo de condiciones para anticipar fallas antes de que ocurran",
    ejemplos: ["Análisis de vibraciones", "Termografía", "Ultrasonido", "Análisis de aceites"],
  },
];

const elementosAVerificar = [
  {
    categoria: "Instalaciones locativas",
    elementos: ["Pisos y techos", "Paredes y estructuras", "Instalaciones eléctricas", "Sistemas de iluminación", "Instalaciones hidráulicas y sanitarias"],
  },
  {
    categoria: "Equipos y maquinaria",
    elementos: ["Máquinas de producción", "Equipos de cómputo", "Sistemas de ventilación/HVAC", "Montacargas y equipos de elevación", "Compresores y equipos neumáticos"],
  },
  {
    categoria: "Herramientas",
    elementos: ["Herramientas manuales", "Herramientas eléctricas", "Herramientas neumáticas", "Equipos de medición", "Escaleras y andamios"],
  },
];

const criteriosVerificacion = [
  "Verificar existencia de programa de mantenimiento preventivo documentado",
  "Revisar cronograma de mantenimiento con fechas, responsables y frecuencias",
  "Confirmar que el mantenimiento se realiza según manuales de fabricante",
  "Verificar registros de mantenimientos realizados (preventivos y correctivos)",
  "Comprobar seguimiento a hallazgos de inspecciones que requieren mantenimiento",
  "Revisar que los reportes de condiciones inseguras generan órdenes de trabajo",
  "Verificar competencia del personal que realiza el mantenimiento",
];

const evidenciaDocumental = [
  "Programa de mantenimiento preventivo anual",
  "Cronograma de mantenimiento con frecuencias establecidas",
  "Fichas técnicas y manuales de equipos",
  "Hojas de vida de equipos y maquinaria",
  "Órdenes de trabajo de mantenimiento",
  "Registros de mantenimientos realizados con fechas y responsables",
  "Reportes de condiciones inseguras atendidas",
  "Certificados de competencia del personal de mantenimiento",
  "Contratos de mantenimiento con proveedores externos (si aplica)",
];

export function Estandar425VerificacionMantenimiento({ isVisible, evaluationId }: Estandar425VerificacionMantenimientoProps) {
  if (!isVisible) return null;

  const fromParam = evaluationId 
    ? `?from=evaluation&evaluationId=${evaluationId}` 
    : "?from=evaluation";

  return (
    <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Wrench className="h-5 w-5 text-violet-600 dark:text-violet-400 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-violet-800 dark:text-violet-200">
            Modo Verificación - Estándar 4.2.5
          </p>
          <p className="text-sm text-violet-600 dark:text-violet-400 mt-1">
            Solicitar la evidencia del mantenimiento preventivo y/o correctivo en las instalaciones, 
            equipos, máquinas y herramientas, de acuerdo con los manuales de uso de estos y los 
            informes de las visitas de inspección o reportes de condiciones inseguras.
          </p>

          <div className="mt-3 p-3 bg-violet-100/50 dark:bg-violet-900/30 rounded-md border border-violet-200 dark:border-violet-800">
            <p className="text-xs font-semibold text-violet-700 dark:text-violet-300 mb-2">
              <Settings className="h-3 w-3 inline mr-1" />
              Tipos de mantenimiento a verificar:
            </p>
            <div className="grid gap-2">
              {tiposMantenimiento.map((tipo) => (
                <div key={tipo.id} className="flex items-start gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded border border-violet-100 dark:border-violet-900">
                  <Cog className="h-4 w-4 text-violet-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-violet-800 dark:text-violet-200">{tipo.nombre}</p>
                    <p className="text-xs text-violet-600 dark:text-violet-400">{tipo.descripcion}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tipo.ejemplos.map((ejemplo, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-violet-300 text-violet-600 dark:border-violet-700 dark:text-violet-300">
                          {ejemplo}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 p-3 bg-indigo-100/50 dark:bg-indigo-900/30 rounded-md border border-indigo-200 dark:border-indigo-800">
            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
              <Building2 className="h-3 w-3 inline mr-1" />
              Elementos sujetos a mantenimiento:
            </p>
            <div className="grid gap-2">
              {elementosAVerificar.map((cat, idx) => (
                <div key={idx} className="p-2 bg-white/50 dark:bg-gray-800/50 rounded border border-indigo-100 dark:border-indigo-900">
                  <p className="text-xs font-medium text-indigo-800 dark:text-indigo-200 mb-1">{cat.categoria}</p>
                  <div className="flex flex-wrap gap-1">
                    {cat.elementos.map((elem, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-indigo-300 text-indigo-600 dark:border-indigo-700 dark:text-indigo-300">
                        {elem}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

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
              <Shield className="h-3 w-3 inline mr-1" />
              Normativa aplicable:
            </p>
            <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
              <li><strong>Decreto 1072/2015 Art. 2.2.4.6.24</strong> - Medidas de prevención y control</li>
              <li><strong>Resolución 0312/2019 Art. 16</strong> - Estándar mínimo 4.2.5</li>
              <li><strong>Decreto 1072/2015 Art. 2.2.4.6.12 numeral 14</strong> - Conservación de documentos de mantenimiento</li>
              <li><strong>Resolución 2400/1979 Art. 30-36</strong> - Mantenimiento de máquinas, herramientas y equipos</li>
              <li><strong>NTC 4114</strong> - Realización de inspecciones planeadas</li>
            </ul>
          </div>

          <div className="mt-3 p-3 bg-orange-100/50 dark:bg-orange-900/30 rounded-md border border-orange-200 dark:border-orange-800">
            <p className="text-xs font-semibold text-orange-800 dark:text-orange-200 mb-2">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              Evidencia documental requerida:
            </p>
            <ul className="text-xs text-orange-700 dark:text-orange-300 space-y-1 list-disc list-inside">
              {evidenciaDocumental.map((elemento, idx) => (
                <li key={idx}>{elemento}</li>
              ))}
            </ul>
          </div>

          <div className="mt-3 p-3 bg-blue-100/50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-2">
              <Calendar className="h-3 w-3 inline mr-1" />
              Frecuencias recomendadas de mantenimiento:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-700 dark:text-blue-300">
              <div className="p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                <p className="font-medium">Instalaciones eléctricas</p>
                <p className="text-[10px]">Semestral o anual</p>
              </div>
              <div className="p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                <p className="font-medium">Equipos de emergencia</p>
                <p className="text-[10px]">Mensual (extintores: anual recarga)</p>
              </div>
              <div className="p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                <p className="font-medium">Maquinaria industrial</p>
                <p className="text-[10px]">Según manual fabricante</p>
              </div>
              <div className="p-2 bg-white/50 dark:bg-gray-800/50 rounded">
                <p className="font-medium">Herramientas manuales</p>
                <p className="text-[10px]">Trimestral o antes de uso</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/inspecciones${fromParam}`}>
              <Button variant="outline" size="sm" className="text-xs">
                <ClipboardCheck className="h-3 w-3 mr-1" />
                Inspecciones
              </Button>
            </Link>
            <Link href={`/conservacion-documentos${fromParam}`}>
              <Button variant="outline" size="sm" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Documentos
              </Button>
            </Link>
            <Link href={`/iperc${fromParam}`}>
              <Button variant="outline" size="sm" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Matriz IPERC
              </Button>
            </Link>
            <Link href={`/hallazgos${fromParam}`}>
              <Button variant="outline" size="sm" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Hallazgos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

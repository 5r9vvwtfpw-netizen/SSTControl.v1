import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Download,
  Eye,
  EyeOff,
  RotateCcw,
  Printer,
} from "lucide-react";

const ESTADOS = [
  { value: "abierto", label: "Abierto", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", descripcion: "El cliente acaba de crear el ticket. Nadie lo ha revisado." },
  { value: "en_revision", label: "En Revisión", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", descripcion: "Un agente está analizando el problema." },
  { value: "en_progreso", label: "En Progreso", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200", descripcion: "Se está trabajando activamente en la solución." },
  { value: "pendiente_cliente", label: "Pendiente Cliente", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200", descripcion: "Se envió respuesta al cliente. Esperando su confirmación." },
  { value: "resuelto", label: "Resuelto", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", descripcion: "El problema fue solucionado." },
  { value: "cerrado", label: "Cerrado", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200", descripcion: "Caso finalizado. No requiere más acción." },
];

const PRIORIDADES = [
  { value: "baja", label: "Baja", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", tiempo: "72 horas", descripcion: "Consultas generales, dudas de uso." },
  { value: "media", label: "Media", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300", tiempo: "48 horas", descripcion: "Problemas que no bloquean el trabajo." },
  { value: "alta", label: "Alta", color: "bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-300", tiempo: "24 horas", descripcion: "Funcionalidades importantes no disponibles." },
  { value: "critica", label: "Crítica", color: "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300", tiempo: "4 horas", descripcion: "Sistema caído o pérdida de datos. Atención inmediata." },
];

const CATEGORIAS = [
  { value: "soporte_tecnico", label: "Soporte Técnico", ejemplos: "Error al cargar página, botón no funciona, pantalla en blanco." },
  { value: "facturacion", label: "Facturación", ejemplos: "Problemas con pagos, facturas, cambios de plan." },
  { value: "error_bug", label: "Error/Bug", ejemplos: "Error específico del sistema, mensaje de error rojo." },
  { value: "capacitacion", label: "Capacitación", ejemplos: "Cómo usar una funcionalidad, dónde encontrar algo." },
  { value: "nueva_funcionalidad", label: "Nueva Funcionalidad", ejemplos: "Sugerencias, solicitudes de mejora." },
  { value: "consulta_general", label: "Consulta General", ejemplos: "Preguntas sobre normativa, alcance del sistema." },
];

const RESPUESTAS_TIPO = [
  {
    categoria: "No puede registrar trabajador",
    respuesta: "Hola [Nombre]. Para registrar un trabajador, vaya a Hacer > Trabajadores > Nuevo Trabajador. Asegúrese de completar todos los campos obligatorios marcados con asterisco (*): Nombre, Documento, Cargo y Área. Si su plan tiene límite de trabajadores, verifique el cupo disponible en Configuración > Mi Suscripción.",
  },
  {
    categoria: "No puede generar un PDF",
    respuesta: "Hola [Nombre]. Para generar el PDF, primero verifique que la evaluación tenga al menos un estándar calificado. Vaya a la evaluación, revise que los estándares tengan respuestas marcadas (Cumple/No Cumple), y luego intente descargar el PDF nuevamente desde el botón 'Descargar PDF'.",
  },
  {
    categoria: "Error al guardar formulario",
    respuesta: "Hola [Nombre]. Este error puede ocurrir cuando un campo obligatorio está vacío o tiene un formato incorrecto. Por favor: 1) Revise que todos los campos marcados con * estén completos. 2) En campos de fecha, use el formato correcto. 3) Intente guardar nuevamente. Si el error persiste, envíenos un screenshot del mensaje de error exacto.",
  },
  {
    categoria: "Problemas de acceso / contraseña",
    respuesta: "Hola [Nombre]. Si olvidó su contraseña, contacte al administrador de su empresa para que la restablezca desde Configuración > Usuarios. Si es usted el administrador, puede usar la opción 'Cambiar Contraseña' en la esquina superior derecha del sistema.",
  },
  {
    categoria: "Consulta sobre facturación",
    respuesta: "Hola [Nombre]. Puede consultar sus facturas y estado de suscripción en Configuración > Mi Suscripción > Dashboard de Facturación. Allí verá el historial de pagos, la próxima fecha de cobro y los detalles de su plan actual. Si necesita cambiar de plan, puede hacerlo desde la misma sección.",
  },
  {
    categoria: "Solicitud de capacitación",
    respuesta: "Hola [Nombre]. El sistema cuenta con Videos de Ayuda accesibles desde el botón 'Video de Ayuda' en la esquina superior derecha de cada página. También puede consultar los videos disponibles en la Biblioteca de Videos desde el menú lateral. Si necesita capacitación específica sobre algún módulo, indíquenos cuál para orientarle mejor.",
  },
  {
    categoria: "Error es un bug del sistema",
    respuesta: "[NOTA INTERNA] Confirmado como bug del sistema. El error ocurre en [módulo/página]. Se reportará al equipo de desarrollo. Ticket relacionado: [número]. // [RESPUESTA AL CLIENTE] Hola [Nombre]. Hemos identificado que se trata de un error del sistema. Nuestro equipo técnico ya está trabajando en la corrección. Le notificaremos cuando esté resuelto. Disculpe las molestias.",
  },
];

export default function ManualSoporte() {
  const { user } = useAuth();

  if (!user || (user.role !== "soporte" && user.role !== "superadmin")) {
    return <Redirect to="/" />;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-4xl" data-testid="page-manual-soporte">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-manual-title">Manual del Agente de Soporte</h1>
            <p className="text-muted-foreground">Guía práctica para atender tickets de clientes - SST Colombia</p>
          </div>
        </div>
        <Button onClick={handlePrint} variant="outline" data-testid="button-print-manual">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir Manual
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Regla Fundamental
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-4 space-y-2">
            <p className="font-semibold text-red-800 dark:text-red-200">
              NUNCA acceder a los datos de la empresa del cliente.
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">
              El soporte se da exclusivamente mediante instrucciones escritas. El agente guía al cliente paso a paso
              para que él mismo resuelva el problema en su cuenta. Esto es obligatorio por el modelo de servicio
              automatizado en la nube (cumplimiento normativo colombiano para no generar IVA por intervención humana).
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-blue-500" />
            Flujo de Atención Paso a Paso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {[
              { paso: 1, titulo: "Revisar tickets pendientes", desc: "Al iniciar turno, abra el Panel de Tickets. Revise primero los tickets con prioridad Crítica (banner rojo) y Alta." },
              { paso: 2, titulo: "Abrir el ticket", desc: "Haga clic en el ticket para ver el detalle en el panel derecho. Lea la descripción completa del problema." },
              { paso: 3, titulo: "Cambiar estado a 'En Revisión'", desc: "Haga clic en 'Cambiar Estado' y seleccione 'En Revisión'. Esto indica al equipo que usted ya está atendiendo este ticket." },
              { paso: 4, titulo: "Coordinar internamente (si es necesario)", desc: "Si necesita consultar con otro agente, escriba una NOTA INTERNA (marque la casilla 'Nota interna'). El cliente NO verá este mensaje." },
              { paso: 5, titulo: "Responder al cliente", desc: "Escriba la solución o instrucciones SIN marcar 'Nota interna'. Use las plantillas de respuesta como guía. Sea claro y específico." },
              { paso: 6, titulo: "Esperar confirmación", desc: "El ticket cambia automáticamente a 'Pendiente Cliente'. Cuando el cliente responda, vuelve a 'En Progreso'." },
              { paso: 7, titulo: "Resolver o escalar", desc: "Si el cliente confirma que se resolvió, cambie a 'Resuelto'. Si es un bug del sistema, use nota interna para documentar y escale al equipo de desarrollo." },
            ].map((item) => (
              <div key={item.paso} className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm">
                  {item.paso}
                </div>
                <div>
                  <p className="font-medium">{item.titulo}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Estados del Ticket
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ESTADOS.map((estado) => (
              <div key={estado.value} className="flex items-start gap-3">
                <Badge className={`${estado.color} min-w-[140px] justify-center`}>{estado.label}</Badge>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">{estado.descripcion}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Prioridades y Tiempos de Respuesta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {PRIORIDADES.map((p) => (
              <div key={p.value} className="flex items-start gap-3 flex-wrap">
                <Badge className={`${p.color} min-w-[80px] justify-center`}>{p.label}</Badge>
                <div className="flex-1 min-w-[200px]">
                  <span className="text-sm">{p.descripcion}</span>
                </div>
                <Badge variant="outline" className="min-w-[100px] justify-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {p.tiempo}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Categorías de Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {CATEGORIAS.map((c) => (
              <div key={c.value} className="border-b last:border-0 pb-3 last:pb-0">
                <p className="font-medium">{c.label}</p>
                <p className="text-sm text-muted-foreground">Ejemplos: {c.ejemplos}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-500" />
            <EyeOff className="h-5 w-5 text-gray-500" />
            Respuestas vs. Notas Internas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-md p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Respuesta Normal</span>
              </div>
              <p className="text-sm text-muted-foreground">
                El cliente VE este mensaje. Use para dar instrucciones, pedir información, o comunicar soluciones.
              </p>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Casilla "Nota interna" = DESMARCADA</p>
            </div>
            <div className="border rounded-md p-4 space-y-2 bg-amber-50 dark:bg-amber-950">
              <div className="flex items-center gap-2">
                <EyeOff className="h-4 w-4 text-amber-600" />
                <span className="font-medium">Nota Interna</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Solo visible para agentes de soporte. Use para coordinar con su equipo, documentar hallazgos, o reportar bugs.
              </p>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Casilla "Nota interna" = MARCADA</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            Plantillas de Respuesta por Situación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {RESPUESTAS_TIPO.map((r, idx) => (
            <div key={idx} className="border rounded-md p-4 space-y-2">
              <p className="font-medium text-sm">{r.categoria}</p>
              <Separator />
              <p className="text-sm text-muted-foreground whitespace-pre-line">{r.respuesta}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Cuándo Escalar al Equipo de Desarrollo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-3">
              Escale al equipo de desarrollo cuando el problema NO se puede resolver con instrucciones al cliente:
            </p>
            {[
              "El cliente envía un screenshot con un mensaje de error rojo del sistema (error 500, 'relation does not exist', etc.)",
              "Una funcionalidad que antes funcionaba dejó de funcionar para todos los usuarios de una empresa",
              "El sistema muestra datos incorrectos (cálculos errados, fechas equivocadas, porcentajes mal)",
              "Un PDF se genera incompleto o con información incorrecta",
              "El problema se reproduce siguiendo exactamente los pasos que el cliente describe",
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-red-500 font-bold flex-shrink-0">!</span>
                <span className="text-sm">{item}</span>
              </div>
            ))}
            <Separator className="my-4" />
            <p className="text-sm font-medium">Al escalar, documente en una NOTA INTERNA:</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
              <li>Empresa afectada y usuario que reporta</li>
              <li>Pasos exactos para reproducir el error</li>
              <li>Screenshot del error (si el cliente lo envió)</li>
              <li>Módulo y página donde ocurre</li>
              <li>Desde cuándo ocurre (si el cliente lo sabe)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

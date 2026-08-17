import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Download, FileText, RefreshCw, Lock,
  ChevronDown, ChevronRight, ShieldCheck,
} from "lucide-react";

interface ConfidencialidadData {
  nombreAsistente: string;
  ccAsistente: string;
  cargoAsistente: string;
  nombreConsultor: string;
  identificacionConsultor: string;
  fechaAcuerdo: string;
}

const today = new Date().toLocaleDateString("es-CO", {
  day: "numeric", month: "long", year: "numeric",
});

const DEFAULTS: ConfidencialidadData = {
  nombreAsistente: "",
  ccAsistente: "",
  cargoAsistente: "Asistente de Gestión SST",
  nombreConsultor: "",
  identificacionConsultor: "",
  fechaAcuerdo: today,
};

const CLAUSULAS = [
  {
    num: "PRIMERA",
    titulo: "Objeto y Partes",
    resumen: "Establece que el acceso de EL ASISTENTE es estrictamente instrumental, derivado de la alianza del Consultor con SST-Colombia, y no le confiere ningún derecho autónomo sobre la plataforma ni sobre los clientes atendidos.",
  },
  {
    num: "SEGUNDA",
    titulo: "Definiciones",
    resumen: "Define La Plataforma, Datos Sensibles (salud, accidentalidad, incapacidades), Información Confidencial, Incidente de Seguridad y Cliente del Consultor.",
  },
  {
    num: "TERCERA",
    titulo: "Alcance del Acceso Autorizado",
    resumen: "Solo empresas y módulos autorizados. Prohibido acceso no autorizado, compartir credenciales y acceso fuera de horario sin permiso escrito.",
  },
  {
    num: "CUARTA",
    titulo: "Confidencialidad Reforzada",
    resumen: "5 años post-terminación. Cubre datos sensibles de trabajadores, metodologías, tarifas, arquitectura, planes de trabajo y matrices de peligro.",
  },
  {
    num: "QUINTA",
    titulo: "Exclusividad de Clientes y No Captación",
    resumen: "Los clientes son exclusivos del Consultor. EL ASISTENTE no puede contactarlos, asesorarlos ni contratarlos directa o indirectamente, durante la vigencia y por 3 años después. Aplica si actúa de forma independiente, con otro empleador o a través de intermediarios.",
  },
  {
    num: "SEXTA",
    titulo: "Prohibiciones Expresas de Manejo de Datos",
    resumen: "Sin descarga masiva, sin capturas de datos personales, sin reenvío a correos personales, sin USB no autorizados, sin impresión no autorizada.",
  },
  {
    num: "SÉPTIMA",
    titulo: "Uso Aceptable del Sistema",
    resumen: "Solo uso laboral, dispositivos autorizados, cierre de sesión obligatorio, sin software no autorizado, sin intentos de elusión de controles.",
  },
  {
    num: "OCTAVA",
    titulo: "Deber de Reporte de Incidentes",
    resumen: "Notificar al Consultor Y a SST-Colombia (admin@sst-colombia.com) en máximo 12 horas ante pérdida de dispositivo, acceso sospechoso o divulgación accidental.",
  },
  {
    num: "NOVENA",
    titulo: "Protección de Datos Personales",
    resumen: "Ley 1581/2012. Datos de salud = sensibles. Prohíbe ceder o transferir datos. Sanciones SIC y responsabilidad penal (art. 269F C.P.) por violación.",
  },
  {
    num: "DÉCIMA",
    titulo: "Monitoreo y Evidencia Digital",
    resumen: "Una (1) credencial. Registro de IP, fecha, hora y duración de sesión. Alerta por IP no autorizada. Logs conservados 5 años con valor probatorio pleno (Ley 527/1999).",
  },
  {
    num: "DÉCIMA PRIMERA",
    titulo: "Devolución y Eliminación de Información",
    resumen: "Al terminar: eliminar toda información en 48 horas y entregar declaración escrita firmada. Incumplimiento activa cláusula penal.",
  },
  {
    num: "DÉCIMA SEGUNDA",
    titulo: "Cláusula Penal y Responsabilidad Solidaria",
    resumen: "Pena de $50.000.000 COP por cada incidente comprobado. EL CONSULTOR responde solidariamente ante EL PROVEEDOR por el incumplimiento de EL ASISTENTE.",
  },
  {
    num: "DÉCIMA TERCERA",
    titulo: "Vigencia, Ley Aplicable y Jurisdicción",
    resumen: "Vigente mientras EL ASISTENTE acceda a La Plataforma. Sobreviven: confidencialidad (5 años) y no captación (3 años). Ley 1581, Ley 527, C.P. art. 269F. Jueces Civiles de Medellín.",
  },
];

export default function ConfidencialidadAsistentes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState<ConfidencialidadData>(DEFAULTS);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (user?.role !== "superadmin") {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No tienes permisos para acceder a esta página.
      </div>
    );
  }

  const handleChange = (field: keyof ConfidencialidadData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleReset = () => setData(DEFAULTS);

  const handleDownload = async () => {
    if (!data.nombreAsistente.trim() || !data.ccAsistente.trim()) {
      toast({ title: "Completa el nombre y la cédula del asistente", variant: "destructive" });
      return;
    }
    if (!data.nombreConsultor.trim() || !data.identificacionConsultor.trim()) {
      toast({ title: "Completa el nombre e identificación del consultor", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/confidencialidad-asistentes/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al generar el PDF");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Confidencialidad-Asistente-${data.nombreAsistente.replace(/\s+/g, "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Acuerdo generado y descargado correctamente" });
    } catch {
      toast({ title: "Error al generar el PDF", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-green-700" />
            Confidencialidad — Asistentes de Consultores
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Acuerdo de confidencialidad y no captación de clientes para asistentes que manejan el software SST en nombre de un consultor aliado.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="default" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Restablecer
          </Button>
          <Button onClick={handleDownload} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Generar PDF
          </Button>
        </div>
      </div>

      {/* Datos del asistente */}
      <Card className="border-green-400 ring-1 ring-green-300">
        <CardHeader>
          <CardTitle className="text-base text-green-800">✏️ Datos del Asistente</CardTitle>
          <CardDescription>
            Estos datos aparecen en la portada, el cuerpo y el bloque de firmas del acuerdo.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="nombreAsistente">
              Nombre completo del asistente <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombreAsistente"
              placeholder="Ej: Laura Marcela Ríos Gómez"
              value={data.nombreAsistente}
              onChange={handleChange("nombreAsistente")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ccAsistente">
              Cédula de ciudadanía <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ccAsistente"
              placeholder="Ej: 1.023.456.789"
              value={data.ccAsistente}
              onChange={handleChange("ccAsistente")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cargoAsistente">Cargo / Rol</Label>
            <Input
              id="cargoAsistente"
              placeholder="Ej: Asistente de Gestión SST"
              value={data.cargoAsistente}
              onChange={handleChange("cargoAsistente")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Datos del consultor */}
      <Card className="border-amber-300 ring-1 ring-amber-200">
        <CardHeader>
          <CardTitle className="text-base text-amber-800">✏️ Datos del Consultor que Autoriza</CardTitle>
          <CardDescription>
            El consultor que firma como responsable solidario del acuerdo.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="nombreConsultor">
              Nombre completo o razón social del consultor <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombreConsultor"
              placeholder="Ej: Carlos Andrés Pérez Gómez"
              value={data.nombreConsultor}
              onChange={handleChange("nombreConsultor")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="identificacionConsultor">
              C.C. o NIT del consultor <span className="text-red-500">*</span>
            </Label>
            <Input
              id="identificacionConsultor"
              placeholder="Ej: 1.045.678.901 o 901.234.567-8"
              value={data.identificacionConsultor}
              onChange={handleChange("identificacionConsultor")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fechaAcuerdo">Fecha de suscripción</Label>
            <Input
              id="fechaAcuerdo"
              placeholder="Ej: 17 de agosto de 2026"
              value={data.fechaAcuerdo}
              onChange={handleChange("fechaAcuerdo")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Datos fijos del proveedor */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4 text-gray-500" />
            Datos del Proveedor — Fijos
          </CardTitle>
          <CardDescription>Aparecen igual en todos los acuerdos. No son editables.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
          <div><span className="font-semibold">Razón social:</span> SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.</div>
          <div><span className="font-semibold">NIT:</span> 902.036.337-4</div>
          <div><span className="font-semibold">Representante Legal:</span> LUZ ADRIANA DIAZ CALLE</div>
          <div><span className="font-semibold">C.C.:</span> 52.223.631</div>
          <div className="sm:col-span-2"><span className="font-semibold">Correo incidentes:</span> admin@sst-colombia.com</div>
        </CardContent>
      </Card>

      {/* Alerta cláusula penal */}
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex gap-3">
        <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5 text-red-600" />
        <div>
          <span className="font-semibold">Cláusula Penal:</span> $50.000.000 COP por incidente comprobado.
          El Consultor responde <span className="font-semibold">solidariamente</span> ante SST-Colombia
          por cualquier incumplimiento del Asistente.
          Confidencialidad: 5 años · No captación de clientes: 3 años.
        </div>
      </div>

      {/* Vista previa de cláusulas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-700" />
            Las 13 Cláusulas (fijas)
          </CardTitle>
          <CardDescription>
            El texto de cada cláusula es estándar. Haz clic para expandir y leer el resumen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {CLAUSULAS.map((c) => (
            <div key={c.num} className="border rounded-md overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded((prev) => ({ ...prev, [c.num]: !prev[c.num] }))}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-700 border-green-300 text-xs font-mono shrink-0">
                    {c.num}
                  </Badge>
                  <span className="text-sm font-medium">{c.titulo}</span>
                </div>
                {expanded[c.num]
                  ? <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                  : <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                }
              </button>
              {expanded[c.num] && (
                <div className="px-4 pb-3 pt-1 text-sm text-gray-600 bg-gray-50 border-t">
                  {c.resumen}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Botón inferior */}
      <div className="flex justify-end">
        <Button onClick={handleDownload} disabled={isGenerating} size="default">
          {isGenerating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Generar y Descargar PDF
        </Button>
      </div>
    </div>
  );
}

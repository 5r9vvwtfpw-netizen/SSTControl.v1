import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, FileText, RefreshCw, Lock, ChevronDown, ChevronRight } from "lucide-react";

interface AlianzaData {
  nombreConsultor: string;
  ccConsultor: string;
  fechaAlianza: string;
}

const DEFAULTS: AlianzaData = {
  nombreConsultor: "",
  ccConsultor: "",
  fechaAlianza: new Date().toLocaleDateString("es-CO", {
    day: "numeric", month: "long", year: "numeric"
  }),
};

const CLAUSULAS = [
  { num: "PRIMERA",        titulo: "Objeto de la Alianza",                                  resumen: "Establece que EL CONSULTOR presta servicios SST a sus propios clientes usando la plataforma de EL PROVEEDOR. Los clientes son del consultor; el proveedor solo aporta el software." },
  { num: "SEGUNDA",        titulo: "Definiciones",                                           resumen: "Define La Plataforma, Lógica de Negocio, Información Confidencial y Obra Derivada." },
  { num: "TERCERA",        titulo: "Licenciamiento de la Plataforma",                       resumen: "Licencia de uso limitada, personal, revocable y no transferible. Prohíbe ingeniería inversa, plagio, desarrollo de competencia y acceso a terceros no autorizados." },
  { num: "CUARTA",         titulo: "Obligaciones de EL CONSULTOR",                          resumen: "Prestar servicios con idoneidad, mantener confidencialidad 5 años, no subcontratar sin autorización, cumplir Ley 1581." },
  { num: "QUINTA",         titulo: "Propiedad Intelectual y Anti-Plagio",                   resumen: "La plataforma es propiedad exclusiva e inalienable del proveedor. Violación activa cláusula penal e indemnización de daños." },
  { num: "SEXTA",          titulo: "No Competencia",                                         resumen: "4 años de no competencia después de terminar la alianza en plataformas de gestión SST." },
  { num: "SÉPTIMA",        titulo: "Confidencialidad Reforzada",                            resumen: "5 años de confidencialidad sobre metodologías, clientes, precios, arquitectura técnica y datos personales." },
  { num: "OCTAVA",         titulo: "No Solicitud de Clientes ni Personal",                  resumen: "Los clientes del consultor le pertenecen. EL CONSULTOR no puede contactar clientes previos del proveedor por 2 años tras terminar." },
  { num: "NOVENA",         titulo: "Cláusula Penal",                                         resumen: "Pena de $100.000.000 COP por incumplimiento de confidencialidad, no competencia, no solicitud o propiedad intelectual." },
  { num: "DÉCIMA",         titulo: "Evidencia Digital y Monitoreo de Acceso",               resumen: "Máximo 2 credenciales. Registro de IPs, alertas por IP no autorizada, límite de 8 horas de sesión, retención de logs 5 años." },
  { num: "DÉCIMA PRIMERA", titulo: "Vigencia y Terminación",                                resumen: "1 año prorrogable. Terminación por justa causa: incumplimiento grave, insolvencia, inhabilitación profesional." },
  { num: "DÉCIMA SEGUNDA", titulo: "Solución de Controversias y Jurisdicción",              resumen: "Arreglo directo 15 días, conciliación 30 días, Jueces Civiles de Medellín como última instancia." },
  { num: "DÉCIMA TERCERA", titulo: "Ley Aplicable",                                          resumen: "Leyes de Colombia: Código de Comercio, Ley 23/1982, Ley 1915/2018, Decisión Andina 351, Ley 1581/2012, Ley 527/1999." },
  { num: "DÉCIMA CUARTA",  titulo: "Disposiciones Generales",                               resumen: "Integralidad, modificaciones escritas, nulidad parcial, independencia del consultor, notificaciones por correo." },
];

export default function AlianzaConsultoresSST() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState<AlianzaData>(DEFAULTS);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (user?.role !== "superadmin") {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No tienes permisos para acceder a esta página.
      </div>
    );
  }

  const handleChange = (field: keyof AlianzaData) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleReset = () => setData(DEFAULTS);

  const handleDownload = async () => {
    if (!data.nombreConsultor.trim() || !data.ccConsultor.trim()) {
      toast({ title: "Completa el nombre y la cédula del consultor", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch("/api/alianza-consultores/pdf", {
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
      a.download = `Alianza-SST-${data.nombreConsultor.replace(/\s+/g, "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Alianza generada y descargada correctamente" });
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
            <FileText className="h-6 w-6 text-green-700" />
            Alianza Consultores SST
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Ingresa los datos del consultor. Las 14 cláusulas son fijas — solo cambia el nombre, cédula y fecha.
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

      {/* Datos editables del consultor */}
      <Card className="border-green-400 ring-1 ring-green-300">
        <CardHeader>
          <CardTitle className="text-base text-green-800">✏️ Datos del Consultor Aliado</CardTitle>
          <CardDescription>Estos datos aparecen en la portada, el cuerpo y el bloque de firmas del documento.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="nombreConsultor">
              Nombre completo del consultor <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombreConsultor"
              placeholder="Ej: Carlos Andrés Pérez Gómez"
              value={data.nombreConsultor}
              onChange={handleChange("nombreConsultor")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ccConsultor">
              Cédula de ciudadanía <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ccConsultor"
              placeholder="Ej: 1.023.456.789"
              value={data.ccConsultor}
              onChange={handleChange("ccConsultor")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fechaAlianza">Fecha de suscripción</Label>
            <Input
              id="fechaAlianza"
              placeholder="Ej: 15 de agosto de 2026"
              value={data.fechaAlianza}
              onChange={handleChange("fechaAlianza")}
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
          <CardDescription>Estos datos no son editables y aparecen igual en todas las alianzas.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
          <div><span className="font-semibold">Razón social:</span> SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.</div>
          <div><span className="font-semibold">NIT:</span> 902.036.337-4</div>
          <div><span className="font-semibold">Representante Legal:</span> LUZ ADRIANA DIAZ CALLE</div>
          <div><span className="font-semibold">C.C.:</span> 52.223.631</div>
          <div className="sm:col-span-2"><span className="font-semibold">Correo notificaciones:</span> admin@sst-colombia.com</div>
        </CardContent>
      </Card>

      {/* Vista previa de cláusulas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">📋 Las 14 Cláusulas (fijas)</CardTitle>
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

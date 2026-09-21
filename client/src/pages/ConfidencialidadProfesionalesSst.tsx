import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Download, FileText, RefreshCw, Lock,
  ChevronDown, ChevronRight, ShieldCheck,
} from "lucide-react";

interface ProfesionalSstData {
  nombreProfesional: string;
  identificacionProfesional: string;
  profesion: string;
  licenciaSst: string;
  correoProfesional: string;
  fechaAcuerdo: string;
}

const today = new Date().toLocaleDateString("es-CO", {
  day: "numeric", month: "long", year: "numeric",
});

const DEFAULTS: ProfesionalSstData = {
  nombreProfesional: "",
  identificacionProfesional: "",
  profesion: "Profesional en Seguridad y Salud en el Trabajo",
  licenciaSst: "",
  correoProfesional: "",
  fechaAcuerdo: today,
};

const CLAUSULAS = [
  ["PRIMERA", "Objeto y partes", "Establece un acuerdo autónomo de confidencialidad entre SST-Colombia y el Profesional en SST. Su único alcance adicional es documentar una autorización limitada de uso del software; no es una alianza comercial ni crea una relación laboral, civil o de prestación de servicios."],
  ["SEGUNDA", "Definiciones reforzadas", "Define Plataforma, Información Confidencial, Datos Personales, Datos Sensibles, Información de Salud, Cliente, Incidente de Seguridad, Credencial, Registro de Acceso y Uso Autorizado."],
  ["TERCERA", "Autorización de uso y mínimo privilegio", "El Profesional recibe únicamente un derecho personal, limitado, no exclusivo, intransferible y revocable para usar el software en el alcance autorizado. Una sola credencial, dispositivo y ubicación no autorizan accesos simultáneos ni fuera del alcance."],
  ["CUARTA", "Información protegida", "Incluye datos de trabajadores, salud ocupacional, accidentes, incapacidades, matrices de peligros, evaluaciones, evidencias, usuarios, credenciales, metodologías, código, tarifas, clientes, arquitectura, lógica de negocio y cualquier información derivada."],
  ["QUINTA", "Confidencialidad reforzada", "La reserva es indefinida para datos sensibles, información de salud, secretos empresariales y credenciales; para la demás información confidencial se mantiene durante diez años después de terminar el acceso, sin excepciones implícitas."],
  ["SEXTA", "Finalidad, uso permitido y deber de reserva", "La información solo puede tratarse para el uso autorizado del software. Se prohíbe aprovecharla, reproducirla, compartirla, cruzarla o usarla para beneficio propio o de terceros, incluso después de terminar el acceso."],
  ["SÉPTIMA", "Tratamiento de datos personales", "Reconoce la aplicación de la Ley 1581 de 2012 y sus normas reglamentarias, incluyendo reglas reforzadas para datos sensibles y de salud. El acceso no implica cesión, autorización general ni facultad para transferir datos."],
  ["OCTAVA", "Prohibiciones expresas de privacidad y extracción", "Prohíbe capturas, fotografías, descargas masivas, scraping, copias a correo personal, nubes no autorizadas, memorias USB, mensajería personal, herramientas de IA externas, impresión no autorizada, ingeniería inversa y cualquier extracción."],
  ["NOVENA", "Credenciales, dispositivos, monitoreo y evidencia digital", "Exige una credencial nominal, dispositivos autorizados, cierre de sesión, registro de IP, fecha, hora, dispositivo, duración y módulos consultados. Los logs y alertas podrán conservarse cinco años como evidencia de seguridad."],
  ["DÉCIMA", "Reporte agravado de incidentes", "Obliga a informar de inmediato y máximo dentro de 12 horas cualquier pérdida, acceso sospechoso, divulgación, envío equivocado, captura, descarga, credencial expuesta o incidente que afecte información personal o confidencial. La demora agrava la responsabilidad."],
  ["DÉCIMA PRIMERA", "Deberes profesionales y de integridad", "Exige actuar dentro del alcance autorizado, conservar la reserva profesional, no alterar evidencias, no presentar información como propia, atender medidas de seguridad y colaborar con investigaciones de incidentes."],
  ["DÉCIMA SEGUNDA", "Devolución, eliminación y certificación", "Cuando termine o se revoque la autorización de uso, deben cesar los accesos, eliminar copias en 48 horas, desinstalar herramientas no autorizadas y entregar una declaración escrita firmada de cumplimiento."],
  ["DÉCIMA TERCERA", "Propiedad intelectual y no apropiación", "La plataforma, sus contenidos, metodologías, código y documentos permanecen bajo sus respectivos titulares. El acceso no autoriza copiar, descompilar, entrenar modelos, crear productos derivados ni reutilizar arquitectura o flujos."],
  ["DÉCIMA CUARTA", "Cláusula penal por incumplimiento grave", "Fija una cláusula penal de $100.000.000 COP por cada incumplimiento grave comprobado. Las acciones que formen parte del mismo hecho se consideran un solo incumplimiento y no se cobran por separado."],
  ["DÉCIMA QUINTA", "Vigencia, supervivencia y jurisdicción", "El acuerdo rige mientras exista autorización de uso o información conservada. Sobreviven indefinidamente las obligaciones sobre datos sensibles, salud, secretos, credenciales y no apropiación; la demás confidencialidad dura diez años."],
];

export default function ConfidencialidadProfesionalesSst() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState<ProfesionalSstData>(DEFAULTS);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (user?.role !== "superadmin") {
    return <div className="p-8 text-center text-muted-foreground">No tienes permisos para acceder a esta página.</div>;
  }

  const handleChange = (field: keyof ProfesionalSstData) =>
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setData((current) => ({ ...current, [field]: event.target.value }));

  const handleDownload = async () => {
    if (!data.nombreProfesional.trim() || !data.identificacionProfesional.trim()) {
      toast({ title: "Completa el nombre y la identificación del profesional", variant: "destructive" });
      return;
    }
    if (!data.correoProfesional.trim()) {
      toast({ title: "Completa el correo del profesional", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/confidencialidad-profesionales-sst/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("No se pudo generar el acuerdo");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `Confidencialidad-Profesional-SST-${data.nombreProfesional.replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      toast({ title: "Acuerdo generado y descargado correctamente" });
    } catch (error: any) {
      toast({ title: error.message || "Error al generar el acuerdo", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <ShieldCheck className="h-6 w-6 text-green-700" />
            Confidencialidad — Profesionales en SST
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acuerdo autónomo de confidencialidad, privacidad y uso restringido de información para profesionales que acceden al sistema SST-Colombia.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setData(DEFAULTS)}>
            <RefreshCw className="mr-2 h-4 w-4" /> Restablecer
          </Button>
          <Button onClick={handleDownload} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Generar PDF
          </Button>
        </div>
      </div>

      <Card className="border-green-400 ring-1 ring-green-300">
        <CardHeader>
          <CardTitle className="text-base text-green-800">Datos del Profesional en SST</CardTitle>
          <CardDescription>Estos datos se incorporan en la portada, el cuerpo y el bloque de firmas.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="profesional-sst-nombre">Nombre completo *</Label>
            <Input id="profesional-sst-nombre" value={data.nombreProfesional} onChange={handleChange("nombreProfesional")} placeholder="Ej. Laura Marcela Ríos Gómez" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profesional-sst-identificacion">Cédula o identificación *</Label>
            <Input id="profesional-sst-identificacion" value={data.identificacionProfesional} onChange={handleChange("identificacionProfesional")} placeholder="Ej. 1.023.456.789" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profesional-sst-profesion">Profesión / perfil</Label>
            <Input id="profesional-sst-profesion" value={data.profesion} onChange={handleChange("profesion")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profesional-sst-licencia">Licencia SST (si aplica)</Label>
            <Input id="profesional-sst-licencia" value={data.licenciaSst} onChange={handleChange("licenciaSst")} placeholder="Número de licencia" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profesional-sst-correo">Correo del profesional *</Label>
            <Input id="profesional-sst-correo" type="email" value={data.correoProfesional} onChange={handleChange("correoProfesional")} placeholder="profesional@ejemplo.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profesional-sst-fecha">Fecha de suscripción</Label>
            <Input id="profesional-sst-fecha" value={data.fechaAcuerdo} onChange={handleChange("fechaAcuerdo")} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Lock className="h-4 w-4 text-gray-500" /> Datos del Proveedor — Fijos</CardTitle>
          <CardDescription>No se modifican desde este módulo.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 text-sm text-gray-700 sm:grid-cols-2">
          <div><span className="font-semibold">Razón social:</span> SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.</div>
          <div><span className="font-semibold">NIT:</span> 902.036.337-4</div>
          <div><span className="font-semibold">Representante Legal:</span> LUZ ADRIANA DIAZ CALLE</div>
          <div><span className="font-semibold">C.C.:</span> 52.223.631</div>
          <div className="sm:col-span-2"><span className="font-semibold">Correo para incidentes:</span> admin@sst-colombia.com</div>
        </CardContent>
      </Card>

      <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
        <div>
          <span className="font-semibold">Acuerdo independiente:</span> este documento es de confidencialidad y privacidad. La única autorización adicional es el uso limitado del software; no es una alianza comercial, contrato de prestación de servicios, contrato laboral ni relación de representación.
          <br />
          <br />
          <span className="font-semibold">Cláusula penal:</span> $100.000.000 COP por cada incumplimiento grave comprobado; no se acumula por cada acción dentro del mismo hecho.
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><FileText className="h-5 w-5 text-green-700" /> Las 15 cláusulas</CardTitle>
          <CardDescription>El texto es estándar para este tipo de acuerdo. Expande cada sección para revisar su alcance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {CLAUSULAS.map(([num, title, summary]) => (
            <div key={num} className="overflow-hidden rounded-md border">
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-gray-50"
                onClick={() => setExpanded((current) => ({ ...current, [num]: !current[num] }))}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="shrink-0 border-green-300 font-mono text-xs text-green-700">{num}</Badge>
                  <span className="text-sm font-medium">{title}</span>
                </div>
                {expanded[num] ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
              </button>
              {expanded[num] && <div className="border-t bg-gray-50 px-4 pb-3 pt-1 text-sm text-gray-600">{summary}</div>}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleDownload} disabled={isGenerating}>
          <Download className="mr-2 h-4 w-4" /> Generar y Descargar PDF
        </Button>
      </div>
    </div>
  );
}
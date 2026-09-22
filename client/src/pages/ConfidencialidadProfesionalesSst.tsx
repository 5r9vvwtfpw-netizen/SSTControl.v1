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
  ["PRIMERA", "Objeto y partes", "Protege principalmente el software SST-Colombia, su propiedad intelectual, información técnica, secretos empresariales y conocimiento reservado. El Profesional solo recibe una autorización limitada de uso; no es una alianza ni una relación laboral o de prestación de servicios."],
  ["SEGUNDA", "Definiciones del software e información reservada", "Define la Plataforma, la Información Confidencial del Software, la Información Confidencial, Datos Personales, Incidente, Credencial y Registro de Acceso."],
  ["TERCERA", "Autorización de uso y mínimo privilegio", "El Profesional recibe únicamente un derecho personal, limitado, no exclusivo, intransferible y revocable para usar el software en el alcance autorizado. Una sola credencial, dispositivo y ubicación no autorizan accesos simultáneos ni fuera del alcance."],
  ["CUARTA", "Información protegida", "El núcleo de protección son el código, arquitectura, estructura de datos, interfaces, módulos, flujos, automatizaciones, integraciones, metodologías, controles, reportes, precios y estrategias de SST-Colombia. Los datos de empresas y trabajadores quedan protegidos como obligación complementaria."],
  ["QUINTA", "Confidencialidad reforzada", "La reserva sobre código, arquitectura, lógica de negocio, seguridad, credenciales, secretos empresariales e Información Confidencial del Software es indefinida; la demás información confidencial se protege durante diez años."],
  ["SEXTA", "Finalidad y protección frente a competencia", "El software solo puede usarse en el alcance autorizado. Se prohíbe utilizar información confidencial de SST-Colombia para desarrollar, apoyar, mejorar o comercializar productos o servicios que reproduzcan o compitan con la Plataforma, sin impedir el ejercicio profesional independiente."],
  ["SÉPTIMA", "Protección complementaria de datos personales", "Si el Profesional visualiza datos personales dentro de la Plataforma, debe tratarlos solo para la finalidad autorizada y conforme a la Ley 1581 de 2012. Esta obligación es complementaria y no cambia el objeto principal del acuerdo."],
  ["OCTAVA", "Protección del software y prohibiciones de extracción", "Prohíbe copiar interfaces, flujos, documentación o código; extraer información, hacer scraping o consultas automatizadas; usar herramientas externas no aprobadas; realizar ingeniería inversa; y usar el conocimiento reservado para crear o mejorar productos propios o de terceros."],
  ["NOVENA", "Seguridad de acceso, monitoreo y evidencia digital", "Exige una credencial nominal, dispositivos protegidos y cierre de sesión. Registra IP, fecha, hora, dispositivo, duración, módulos, cambios, descargas y eventos para proteger la Plataforma y conservar evidencia."],
  ["DÉCIMA", "Reporte de incidentes", "Obliga a informar en máximo 12 horas cualquier pérdida, acceso sospechoso, credencial expuesta, extracción, copia, reproducción, divulgación o exposición de la Plataforma o de su información confidencial."],
  ["DÉCIMA PRIMERA", "Deberes de uso e integridad", "Exige conservar la integridad de la Plataforma, no presentar sus contenidos, diseños, metodologías o desarrollos como propios, atender auditorías y colaborar en investigaciones."],
  ["DÉCIMA SEGUNDA", "Devolución, eliminación y certificación", "Al terminar o revocarse el acceso, deben cesar las sesiones, eliminar copias de la Plataforma y su información en 48 horas, desinstalar herramientas no autorizadas y certificar el cumplimiento."],
  ["DÉCIMA TERCERA", "Propiedad intelectual y no apropiación", "El código, arquitectura, interfaces, metodologías, documentación, diseños, flujos, automatizaciones e integraciones permanecen bajo sus titulares. El acceso no autoriza explotar, copiar, reconstruir ni crear productos derivados o competidores."],
  ["DÉCIMA CUARTA", "Cláusula Penal", "Fija una cláusula penal única de $100.000.000 COP como estimación anticipada y definitiva de los perjuicios derivados del incumplimiento de las obligaciones principales del acuerdo."],
  ["DÉCIMA QUINTA", "Vigencia, supervivencia y jurisdicción", "El acuerdo rige mientras exista autorización de uso o información conservada. Sobreviven indefinidamente las obligaciones sobre Información Confidencial del Software, código, arquitectura, secretos, credenciales, propiedad intelectual y no apropiación; la demás confidencialidad dura diez años."],
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
             Confidencialidad y protección del software — Profesionales en SST
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
             Acuerdo autónomo para proteger la confidencialidad, propiedad intelectual y uso restringido del software SST-Colombia frente a profesionales que reciben autorización de acceso.
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
           <span className="font-semibold">Acuerdo independiente:</span> el objeto principal es proteger el software, su propiedad intelectual y su información confidencial. La única autorización es el uso limitado de la Plataforma; no es una alianza comercial, contrato de prestación de servicios, contrato laboral ni relación de representación.
          <br />
          <br />
          <span className="font-semibold">Cláusula penal:</span> $100.000.000 COP como estimación anticipada y definitiva de perjuicios, conforme a la estructura usada en los demás contratos.
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
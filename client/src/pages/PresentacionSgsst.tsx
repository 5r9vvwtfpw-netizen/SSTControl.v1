import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Loader2, RefreshCw, ShieldCheck, BarChart3, Users, PanelsTopLeft } from "lucide-react";

interface PresentationData {
  empresa: string;
  nit: string;
  destinatario: string;
  fechaEmision: string;
}

type Field = keyof PresentationData;
const MAX_LENGTH: Record<Field, number> = { empresa: 120, nit: 30, destinatario: 120, fechaEmision: 10 };
const getLocalDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};
const makeDefaults = (): PresentationData => ({ empresa: "", nit: "", destinatario: "", fechaEmision: getLocalDate() });
const stripControls = (value: string) => value.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function safeFilename(value: string) {
  const slug = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);
  return `${slug || "Empresa"}-Presentacion-SG-SST.pdf`;
}

export default function PresentacionSgsst() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<PresentationData>(makeDefaults);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);

  if (user?.role !== "superadmin") {
    return <div className="p-8 text-center text-muted-foreground">No tienes permisos para acceder a esta página.</div>;
  }

  const setField = (field: Field) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = stripControls(event.target.value).slice(0, MAX_LENGTH[field]);
    setData((current) => ({ ...current, [field]: value }));
    setFeedback(null);
  };

  const handleReset = () => {
    if (isGenerating) return;
    setData(makeDefaults());
    setFeedback(null);
  };

  const handleDownload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isGenerating) return;
    const empresa = stripControls(data.empresa).trim();
    const nit = stripControls(data.nit).trim();
    const destinatario = stripControls(data.destinatario).trim();
    const fechaEmision = data.fechaEmision.trim();
    if (!empresa) return setFeedback({ type: "error", message: "Ingresa el nombre de la empresa destinataria." });
    if (empresa.length > MAX_LENGTH.empresa || nit.length > MAX_LENGTH.nit || destinatario.length > MAX_LENGTH.destinatario) {
      return setFeedback({ type: "error", message: "Verifica los límites de caracteres de los campos." });
    }
    if (!fechaEmision || !isValidDate(fechaEmision)) {
      return setFeedback({ type: "error", message: "Ingresa una fecha de emisión válida." });
    }

    setIsGenerating(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/presentacion-sgsst/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ empresa, nit, destinatario, fechaEmision }),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error || `No se pudo generar la presentación (HTTP ${response.status}).`);
      }
      const contentType = response.headers.get("Content-Type") || "";
      if (!/^application\/pdf(?:\s*;|$)/i.test(contentType.trim())) {
        throw new Error("La respuesta del servidor no es un archivo PDF válido.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = safeFilename(empresa);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
      setFeedback({ type: "success", message: "La presentación se generó y la descarga del PDF ha comenzado. Está lista para enviarse manualmente." });
      toast({ title: "Descarga de la presentación iniciada" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ocurrió un error al generar la presentación.";
      setFeedback({ type: "error", message });
      toast({ title: "Error al generar la presentación", description: message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="container mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <FileText className="h-6 w-6 text-green-700" />
            Presentación SG-SST
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Prepara una presentación comercial personalizada para una empresa prospecto. Descarga el PDF para revisarlo y enviarlo manualmente.
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <Button type="button" variant="outline" onClick={handleReset} disabled={isGenerating} className="flex-1 sm:flex-none">
            <RefreshCw className="mr-2 h-4 w-4" /> Restablecer
          </Button>
          <Button type="submit" form="presentacion-sgsst-form" disabled={isGenerating} className="flex-1 sm:flex-none">
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            {isGenerating ? "Generando…" : "Descargar PDF"}
          </Button>
        </div>
      </div>

      <form id="presentacion-sgsst-form" onSubmit={handleDownload} className="space-y-6">
        <Card className="border-green-400 ring-1 ring-green-300">
          <CardHeader>
            <CardTitle className="text-base text-green-800">Datos de la empresa destinataria</CardTitle>
            <CardDescription>Personalizan la portada del documento. Los campos señalados pueden dejarse en blanco.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="presentacion-empresa">Nombre o razón social <span className="text-red-500">*</span></Label>
              <Input id="presentacion-empresa" value={data.empresa} onChange={setField("empresa")} placeholder="Nombre de la empresa" maxLength={120} required aria-describedby="presentacion-empresa-help" />
              <p id="presentacion-empresa-help" className="text-sm text-muted-foreground">Obligatorio. Máximo 120 caracteres.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="presentacion-nit">NIT</Label>
              <Input id="presentacion-nit" value={data.nit} onChange={setField("nit")} placeholder="NIT de la empresa" maxLength={30} />
              <p className="text-sm text-muted-foreground">Puede dejarse en blanco. Máximo 30 caracteres.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="presentacion-destinatario">Dirigido a</Label>
              <Input id="presentacion-destinatario" value={data.destinatario} onChange={setField("destinatario")} placeholder="Nombre completo o cargo profesional" maxLength={120} />
              <p className="text-sm text-muted-foreground">Nombre completo o cargo profesional. Puede dejarse en blanco.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="presentacion-fecha">Fecha de emisión <span className="text-red-500">*</span></Label>
              <Input id="presentacion-fecha" type="date" value={data.fechaEmision} onChange={setField("fechaEmision")} required aria-describedby="presentacion-fecha-help" />
              <p id="presentacion-fecha-help" className="text-sm text-muted-foreground">Se inicia con la fecha local de hoy.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contenido incluido en la presentación</CardTitle>
            <CardDescription>Cuatro páginas comerciales originales acompañan la portada personalizada.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 text-sm sm:grid-cols-2">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />
              <div><p className="font-semibold">Gestión SG-SST</p><p className="mt-1 text-muted-foreground">Organización de obligaciones, planes, actividades, evidencias y seguimiento en una plataforma.</p></div>
            </div>
            <div className="flex gap-3">
              <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />
              <div><p className="font-semibold">Informes SST y PESV</p><p className="mt-1 text-muted-foreground">Ejemplos de reportes para conocer la presentación y el alcance de la información disponible.</p></div>
            </div>
            <div className="flex gap-3">
              <PanelsTopLeft className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />
              <div><p className="font-semibold">Portales para la operación</p><p className="mt-1 text-muted-foreground">Acceso para empleadores y profesionales LSO, con información y herramientas según su función.</p></div>
            </div>
            <div className="flex gap-3">
              <Users className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />
              <div><p className="font-semibold">Suscripción por trabajador</p><p className="mt-1 text-muted-foreground">COP $10.000 por trabajador al mes.</p></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-300 bg-amber-50/50">
          <CardContent className="pt-6 text-sm text-amber-950">
            <p className="font-semibold">Sobre los reportes de muestra</p>
            <p className="mt-1 text-amber-900">Los ejemplos de reportes SST y PESV incluidos son ilustrativos; no representan resultados reales ni datos de la empresa destinataria.</p>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">El PDF se descarga en este dispositivo. No se envía por correo automáticamente; queda listo para compartirlo manualmente.</p>
      </form>

      {isGenerating && <p role="status" className="text-sm text-muted-foreground">Generando la presentación SG-SST…</p>}
      {feedback && (
        <p role={feedback.type === "error" ? "alert" : "status"} className={feedback.type === "error" ? "text-sm font-medium text-destructive" : "text-sm font-medium text-green-700"}>
          {feedback.message}
        </p>
      )}
    </main>
  );
}
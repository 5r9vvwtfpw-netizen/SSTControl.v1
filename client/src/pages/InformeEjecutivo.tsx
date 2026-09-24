import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Loader2, RefreshCw } from "lucide-react";

interface InformeData {
  tituloInforme: string;
  incluirPesv: boolean;
  empresaDestinataria1: string;
  nitDestinataria1: string;
  empresaDestinataria2: string;
  nitDestinataria2: string;
  nombreProfesional: string;
}

type InformeTextField = keyof Omit<InformeData, "incluirPesv">;

const DEFAULTS: InformeData = {
  tituloInforme: "Gestión del SG-SST de la empresa",
  incluirPesv: false,
  empresaDestinataria1: "",
  nitDestinataria1: "",
  empresaDestinataria2: "",
  nitDestinataria2: "",
  nombreProfesional: "",
};

const FIELD_MAX_LENGTH: Record<InformeTextField, number> = {
  tituloInforme: 100,
  empresaDestinataria1: 120,
  nitDestinataria1: 30,
  empresaDestinataria2: 120,
  nitDestinataria2: 30,
  nombreProfesional: 100,
};

const stripControls = (value: string) => value.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

export default function InformeEjecutivo() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<InformeData>(DEFAULTS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);

  if (user?.role !== "superadmin") {
    return <div className="p-8 text-center text-muted-foreground">No tienes permisos para acceder a esta página.</div>;
  }

  const setField = (field: InformeTextField) => (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = stripControls(event.target.value).slice(0, FIELD_MAX_LENGTH[field]);
    setData((current) => {
      const updated = { ...current, [field]: value };
      if (field === "empresaDestinataria2" && !value.trim()) {
        updated.nitDestinataria2 = "";
      }
      return updated;
    });
    setFeedback(null);
  };

  const handleReset = () => {
    setData(DEFAULTS);
    setFeedback(null);
  };

  const handleDownload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const tituloInforme = data.tituloInforme.trim();
    const empresaDestinataria1 = data.empresaDestinataria1.trim();
    const empresaDestinataria2 = data.empresaDestinataria2.trim();
    const nombreProfesional = data.nombreProfesional.trim();

    if (!tituloInforme) {
      setFeedback({ type: "error", message: "Escribe el título que aparecerá en la portada." });
      return;
    }
    if (!empresaDestinataria1) {
      setFeedback({ type: "error", message: "Ingresa la razón social de la primera empresa." });
      return;
    }
    if (
      empresaDestinataria2 &&
      empresaDestinataria1.localeCompare(empresaDestinataria2, undefined, { sensitivity: "accent" }) === 0
    ) {
      setFeedback({ type: "error", message: "Las empresas deben tener nombres diferentes." });
      return;
    }
    if (
      tituloInforme.length > FIELD_MAX_LENGTH.tituloInforme ||
      empresaDestinataria1.length > FIELD_MAX_LENGTH.empresaDestinataria1 ||
      empresaDestinataria2.length > FIELD_MAX_LENGTH.empresaDestinataria2 ||
      nombreProfesional.length > FIELD_MAX_LENGTH.nombreProfesional ||
      data.nitDestinataria1.trim().length > FIELD_MAX_LENGTH.nitDestinataria1 ||
      data.nitDestinataria2.trim().length > FIELD_MAX_LENGTH.nitDestinataria2
    ) {
      setFeedback({ type: "error", message: "Verifica los límites de caracteres de los campos." });
      return;
    }

    setIsGenerating(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/informe-ejecutivo/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          tituloInforme,
          incluirPesv: data.incluirPesv,
          empresaDestinataria1,
          nitDestinataria1: stripControls(data.nitDestinataria1).trim(),
          empresaDestinataria2,
          nitDestinataria2: empresaDestinataria2 ? stripControls(data.nitDestinataria2).trim() : "",
          nombreProfesional,
        }),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error || `No se pudo generar el informe (HTTP ${response.status}).`);
      }
      const contentType = response.headers.get("Content-Type") || "";
      if (!/^application\/pdf(?:\s*;|$)/i.test(contentType.trim())) {
        throw new Error("La respuesta del servidor no es un archivo PDF válido.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "Informe-Ejecutivo-SG-SST.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);

      setFeedback({ type: "success", message: "El informe ejecutivo se generó y se inició la descarga del PDF." });
      toast({ title: "Descarga del informe iniciada" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ocurrió un error al generar el informe.";
      setFeedback({ type: "error", message });
      toast({ title: "Error al generar el informe", description: message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <FileText className="h-6 w-6 text-green-700" />
            Informe Ejecutivo
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            SST Colombia emite el informe. Ingresa una o dos empresas a las que se dirige y cuya gestión SG-SST se describe.
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <Button type="button" variant="outline" onClick={handleReset} disabled={isGenerating} className="flex-1 sm:flex-none">
            <RefreshCw className="mr-2 h-4 w-4" />
            Restablecer
          </Button>
          <Button type="submit" form="informe-ejecutivo-form" disabled={isGenerating} className="flex-1 sm:flex-none">
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isGenerating ? "Generando…" : "Descargar PDF"}
          </Button>
        </div>
      </div>

      <form id="informe-ejecutivo-form" onSubmit={handleDownload} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Título de portada</CardTitle>
            <CardDescription>
              Edita el título para ajustarlo al propósito de este informe. Se imprimirá en la portada del PDF.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-xl space-y-1.5">
              <Label htmlFor="tituloInforme">Título del informe</Label>
              <Input
                id="tituloInforme"
                value={data.tituloInforme}
                onChange={setField("tituloInforme")}
                placeholder="Título para la portada"
                maxLength={FIELD_MAX_LENGTH.tituloInforme}
                required
                aria-describedby="tituloInforme-help"
              />
              <p id="tituloInforme-help" className="text-sm text-muted-foreground">
                Puedes cambiarlo para cada cliente; el límite es de 100 caracteres.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contenido de seguridad vial</CardTitle>
            <CardDescription>
              El informe se genera solo con contenido SG-SST. Activa esta casilla si el cliente también requiere información del PESV.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={data.incluirPesv}
                onChange={(event) => {
                  setData((current) => ({ ...current, incluirPesv: event.target.checked }));
                  setFeedback(null);
                }}
                className="mt-0.5 h-4 w-4 rounded border-input accent-green-700"
              />
              <span>Incluir contenido del Plan Estratégico de Seguridad Vial (PESV)</span>
            </label>
          </CardContent>
        </Card>

        <Card className="border-green-400 ring-1 ring-green-300">
          <CardHeader>
            <CardTitle className="text-base text-green-800">Empresas del informe</CardTitle>
            <CardDescription>
              Una o dos empresas que reciben este informe y cuya gestión SG-SST se describe. No es necesario repetir sus datos.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="empresaDestinataria1">
                Primera empresa <span className="text-red-500">*</span>
              </Label>
              <Input
                id="empresaDestinataria1"
                value={data.empresaDestinataria1}
                onChange={setField("empresaDestinataria1")}
                placeholder="Nombre de la empresa"
                maxLength={120}
                aria-required="true"
                aria-describedby="empresaDestinataria1-help"
              />
              <p id="empresaDestinataria1-help" className="text-sm text-muted-foreground">
                Obligatoria. Razón social de la empresa.
              </p>
              <div className="space-y-1.5 pt-2">
                <Label htmlFor="nitDestinataria1">NIT de la primera empresa</Label>
                <Input
                  id="nitDestinataria1"
                  value={data.nitDestinataria1}
                  onChange={setField("nitDestinataria1")}
                  placeholder="NIT"
                  maxLength={FIELD_MAX_LENGTH.nitDestinataria1}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="empresaDestinataria2">Segunda empresa</Label>
              <Input
                id="empresaDestinataria2"
                value={data.empresaDestinataria2}
                onChange={setField("empresaDestinataria2")}
                placeholder="Déjalo en blanco si no aplica"
                maxLength={120}
                aria-describedby="empresaDestinataria2-help"
              />
              <p id="empresaDestinataria2-help" className="text-sm text-muted-foreground">
                Si la incluyes, debe ser distinta de la primera empresa.
              </p>
              <div className="space-y-1.5 pt-2">
                <Label htmlFor="nitDestinataria2">NIT de la segunda empresa</Label>
                <Input
                  id="nitDestinataria2"
                  value={data.nitDestinataria2}
                  onChange={setField("nitDestinataria2")}
                  placeholder="NIT"
                  maxLength={FIELD_MAX_LENGTH.nitDestinataria2}
                  disabled={!data.empresaDestinataria2.trim()}
                  aria-describedby="nitDestinataria2-help"
                />
                <p id="nitDestinataria2-help" className="text-sm text-muted-foreground">
                  Disponible cuando ingreses una segunda empresa. Se borrará si eliminas su nombre.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profesional SST</CardTitle>
            <CardDescription>Si no indicas un nombre, el informe se referirá al cargo sin identificar a una persona.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-xl space-y-1.5">
              <Label htmlFor="nombreProfesional">
                Nombre de la profesional SST
              </Label>
              <Input
                id="nombreProfesional"
                value={data.nombreProfesional}
                onChange={setField("nombreProfesional")}
                placeholder="Nombre completo"
                maxLength={FIELD_MAX_LENGTH.nombreProfesional}
              />
              <p className="text-sm text-muted-foreground">Déjalo en blanco si el informe no debe mencionar a una profesional por nombre.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos del proveedor — fijos</CardTitle>
            <CardDescription>Estos datos son fijos para los informes y no se pueden editar aquí.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Razón social</p>
              <p className="font-medium">SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">NIT</p>
              <p className="font-medium">902.036.337-4</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Representante Legal</p>
              <p className="font-medium">LUZ ADRIANA DIAZ CALLE</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">C.C.</p>
              <p className="font-medium">52.223.631</p>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <p className="text-sm text-muted-foreground">Correo notificaciones</p>
              <p className="font-medium">admin@sst-colombia.com</p>
            </div>
          </CardContent>
        </Card>
      </form>

      {isGenerating && (
        <p role="status" className="text-sm text-muted-foreground">Generando el informe ejecutivo…</p>
      )}
      {feedback && (
        <p
          role={feedback.type === "error" ? "alert" : "status"}
          className={feedback.type === "error" ? "text-sm font-medium text-destructive" : "text-sm font-medium text-green-700"}
        >
          {feedback.message}
        </p>
      )}
    </div>
  );
}
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Loader2, RefreshCw } from "lucide-react";

type FormData = {
  empresa: string;
  nit: string;
  ciudad: string;
  tarifaHora: string;
  horasMinimas: string;
  horasPorSesion: string;
  vigenciaDias: string;
  nombreProveedor: string;
  nitProveedor: string;
  email: string;
  whatsapp: string;
  mensajePrincipal: string;
};

const DEFAULTS: FormData = {
  empresa: "",
  nit: "",
  ciudad: "Medellín, Antioquia",
  tarifaHora: "50000",
  horasMinimas: "8",
  horasPorSesion: "2",
  vigenciaDias: "15",
  nombreProveedor: "SISTEMA AUTOMATIZADO DE GESTION INTEGRAL S.A.S",
  nitProveedor: "902.036.337-4",
  email: "legal@sst-colombia.com",
  whatsapp: "+57 300 522 0679",
  mensajePrincipal: "",
};

export default function CotizacionTransicion() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<FormData>(DEFAULTS);
  const [isGenerating, setIsGenerating] = useState(false);

  if (user?.role !== "superadmin") {
    return <div className="p-8 text-center text-muted-foreground">No tienes permisos para acceder a esta página.</div>;
  }

  const setField = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setData((current) => ({ ...current, [field]: event.target.value }));

  const handleDownload = async () => {
    if (!data.empresa.trim()) {
      toast({ title: "Completa la empresa destinataria", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const response = await fetch("/api/cotizacion-transicion/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("No se pudo generar la cotización");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "Cotizacion-Transicion-SST-PESV.pdf";
      anchor.click();
      URL.revokeObjectURL(url);
      toast({ title: "Cotización descargada correctamente" });
    } catch (error: any) {
      toast({ title: error.message || "Error al generar la cotización", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => setData(DEFAULTS);
  const subtotal = (Number(data.tarifaHora) || 0) * (Number(data.horasMinimas) || 0);
  const iva = Math.round(subtotal * 0.19);

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <FileText className="h-6 w-6 text-green-700" />
            Cotización de Transición SST/PESV
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Capacitación para reemplazar al Profesional en SST y enseñar los tres portales.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" /> Restablecer
          </Button>
          <Button onClick={handleDownload} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Descargar PDF
          </Button>
        </div>
      </div>

      <Card className="border-green-400 ring-1 ring-green-300">
        <CardHeader>
          <CardTitle className="text-base text-green-800">Empresa destinataria</CardTitle>
          <CardDescription>Estos datos aparecerán en la portada de la cotización.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="transicion-empresa">Nombre de la empresa *</Label>
            <Input id="transicion-empresa" value={data.empresa} onChange={setField("empresa")} placeholder="Ej. Transportes Limicio Ltda." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="transicion-nit">NIT</Label>
            <Input id="transicion-nit" value={data.nit} onChange={setField("nit")} placeholder="900.000.000-0" />
          </div>
          <div className="space-y-1.5 sm:col-span-3">
            <Label htmlFor="transicion-ciudad">Ciudad</Label>
            <Input id="transicion-ciudad" value={data.ciudad} onChange={setField("ciudad")} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50/30">
        <CardHeader>
          <CardTitle className="text-base text-green-800">Condiciones de capacitación</CardTitle>
          <CardDescription>La propuesta calcula automáticamente subtotal, IVA y total.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="transicion-tarifa">Valor por hora (COP)</Label>
            <Input id="transicion-tarifa" type="number" min="0" value={data.tarifaHora} onChange={setField("tarifaHora")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="transicion-horas">Horas mínimas</Label>
            <Input id="transicion-horas" type="number" min="1" value={data.horasMinimas} onChange={setField("horasMinimas")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="transicion-sesion">Horas por sesión</Label>
            <Input id="transicion-sesion" type="number" min="1" value={data.horasPorSesion} onChange={setField("horasPorSesion")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="transicion-vigencia">Vigencia (días)</Label>
            <Input id="transicion-vigencia" type="number" min="1" value={data.vigenciaDias} onChange={setField("vigenciaDias")} />
          </div>
          <div className="rounded-md border bg-white p-3 text-sm sm:col-span-4">
            <strong>Resumen:</strong> {data.horasMinimas || 0} horas en {Math.ceil((Number(data.horasMinimas) || 0) / (Number(data.horasPorSesion) || 1))} sesiones.{" "}
            <strong>Subtotal:</strong> ${subtotal.toLocaleString("es-CO")} · <strong>Total con IVA:</strong> ${(subtotal + iva).toLocaleString("es-CO")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos del proveedor</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="transicion-proveedor">Razón social</Label>
            <Input id="transicion-proveedor" value={data.nombreProveedor} onChange={setField("nombreProveedor")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="transicion-nit-proveedor">NIT proveedor</Label>
            <Input id="transicion-nit-proveedor" value={data.nitProveedor} onChange={setField("nitProveedor")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="transicion-email">Correo</Label>
            <Input id="transicion-email" value={data.email} onChange={setField("email")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="transicion-whatsapp">WhatsApp</Label>
            <Input id="transicion-whatsapp" value={data.whatsapp} onChange={setField("whatsapp")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Objeto de la propuesta</CardTitle>
          <CardDescription>Opcional. Si queda vacío, se genera un texto estándar con la empresa.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea value={data.mensajePrincipal} onChange={setField("mensajePrincipal")} rows={4} placeholder="Capacitar y habilitar al equipo..." />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleDownload} disabled={isGenerating}>
          <Download className="mr-2 h-4 w-4" /> Descargar cotización PDF
        </Button>
      </div>
    </div>
  );
}
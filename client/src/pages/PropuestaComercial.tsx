import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, FileText, RefreshCw } from "lucide-react";

interface PropuestaData {
  web: string;
  email: string;
  whatsapp: string;
  tagline: string;
  mensajePrincipal: string;
  empresa: string;
  nit: string;
  ciudad: string;
  nombreProveedor: string;
  nitProveedor: string;
  // Paquete personalizado
  numTrabajadores: string;
  precioPorTrabajador: string;
  nombreProfesional: string;
  tarifaGestion: string;
  tarifaAuditoria: string;
  visitasMes: string;
  horasPorVisita: string;
  diasPrueba: string;
}

const DEFAULTS: PropuestaData = {
  web: "sst.sagisas.co",
  email: "legal@sst-colombia.com",
  whatsapp: "+57 300 522 0679",
  tagline: "Ciclo PHVA completo con los 61 estándares mínimos de la Res. 0312/2019, PESV Supertransporte (Res. 40595/2022 — 24 pasos P-H-V-A), exámenes médicos ocupacionales, capacitaciones y cronograma anual, COPASST y Comité de Convivencia, brigadas de emergencia, accidentalidad e incidentes, matriz de peligros e inspecciones, matriz de riesgo automática según código CIIU, plan anual de trabajo automatizado, control de mantenimiento vehicular, objetivos e indicadores SST, y Licenciado SST con firma digital. Todo esto más Portal del Empleado GRATIS, Asistente Virtual IA, soporte 24 horas y actualizaciones normativas automáticas — sin costo adicional.",
  mensajePrincipal: "Esta cotización incluye un periodo de prueba gratuito de 7 días y garantiza el cumplimiento normativo según lo expuesto en la reunión virtual. La propuesta comprende dos componentes independientes: la plataforma SaaS (Sadgi SAS) y el servicio de auditoría y gestión por parte del profesional en SST. Los pagos de ambos servicios se realizarán de manera independiente. Operamos bajo un modelo de colaboración sin exclusividad.",
  empresa: "",
  nit: "",
  ciudad: "Medellín, Antioquia",
  nombreProveedor: "SISTEMA AUTOMATIZADO DE GESTION INTEGRAL S.A.S",
  nitProveedor: "902.036.337-4",
  numTrabajadores: "20",
  precioPorTrabajador: "10000",
  nombreProfesional: "",
  tarifaGestion: "250000",
  tarifaAuditoria: "450000",
  visitasMes: "2",
  horasPorVisita: "3",
  diasPrueba: "7",
};

export default function PropuestaComercial() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState<PropuestaData>(DEFAULTS);

  if (user?.role !== "superadmin") {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No tienes permisos para acceder a esta página.
      </div>
    );
  }

  const handleChange = (field: keyof PropuestaData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleReset = () => setData(DEFAULTS);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/propuesta-comercial/pdf", {
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
      a.download = "SST-Colombia-Propuesta-Comercial.pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "PDF descargado correctamente" });
    } catch {
      toast({ title: "Error al generar el PDF", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-green-700" />
            Propuesta Comercial PDF
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Personaliza los datos y descarga el brochure para enviar a empresas potenciales.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="default" onClick={handleReset} data-testid="button-reset-propuesta">
            <RefreshCw className="h-4 w-4 mr-2" />
            Restablecer
          </Button>
          <Button onClick={handleDownload} disabled={isGenerating} data-testid="button-download-propuesta">
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Descargar PDF
          </Button>
        </div>
      </div>

      {/* Datos del Proveedor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos del Proveedor (tu empresa)</CardTitle>
          <CardDescription>Aparecen en el pie del PDF</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="nombreProveedor">Razón Social</Label>
            <Input
              id="nombreProveedor"
              value={data.nombreProveedor}
              onChange={handleChange("nombreProveedor")}
              data-testid="input-nombre-proveedor"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nitProveedor">NIT</Label>
            <Input
              id="nitProveedor"
              value={data.nitProveedor}
              onChange={handleChange("nitProveedor")}
              data-testid="input-nit-proveedor"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ciudad">Ciudad</Label>
            <Input
              id="ciudad"
              value={data.ciudad}
              onChange={handleChange("ciudad")}
              data-testid="input-ciudad"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contacto */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información de Contacto</CardTitle>
          <CardDescription>Aparece en la sección inferior del PDF</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="web">Sitio Web</Label>
            <Input
              id="web"
              value={data.web}
              onChange={handleChange("web")}
              data-testid="input-web"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={data.email}
              onChange={handleChange("email")}
              data-testid="input-email"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input
              id="whatsapp"
              value={data.whatsapp}
              onChange={handleChange("whatsapp")}
              data-testid="input-whatsapp"
            />
          </div>
        </CardContent>
      </Card>

      {/* Empresa destinataria */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Empresa Destinataria</CardTitle>
          <CardDescription>Aparece personalizado en el PDF de propuesta</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="empresa">Nombre de la Empresa</Label>
            <Input
              id="empresa"
              placeholder="Ej: Transportes Hospitalarios S.A.S."
              value={data.empresa}
              onChange={handleChange("empresa")}
              data-testid="input-empresa"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nit">NIT</Label>
            <Input
              id="nit"
              placeholder="Ej: 900.123.456-7"
              value={data.nit}
              onChange={handleChange("nit")}
              data-testid="input-nit-empresa"
            />
          </div>
        </CardContent>
      </Card>

      {/* Paquete personalizado */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader>
          <CardTitle className="text-base text-green-800">Paquete Personalizado</CardTitle>
          <CardDescription>Genera una propuesta con el detalle exacto de la inversión mensual</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="numTrabajadores">N° de Trabajadores</Label>
            <Input
              id="numTrabajadores"
              type="number"
              min="1"
              value={data.numTrabajadores}
              onChange={handleChange("numTrabajadores")}
              data-testid="input-num-trabajadores"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="precioPorTrabajador">Precio por Trabajador (COP)</Label>
            <Input
              id="precioPorTrabajador"
              type="number"
              min="0"
              value={data.precioPorTrabajador}
              onChange={handleChange("precioPorTrabajador")}
              data-testid="input-precio-trabajador"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="diasPrueba">Días de Prueba</Label>
            <Input
              id="diasPrueba"
              type="number"
              min="0"
              value={data.diasPrueba}
              onChange={handleChange("diasPrueba")}
              data-testid="input-dias-prueba"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-3">
            <Label htmlFor="nombreProfesional">Nombre del Profesional Aliado</Label>
            <Input
              id="nombreProfesional"
              placeholder="Ej: Hernán Valencia"
              value={data.nombreProfesional}
              onChange={handleChange("nombreProfesional")}
              data-testid="input-nombre-profesional"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tarifaAuditoria">Auditoría y Administración (COP)</Label>
            <Input
              id="tarifaAuditoria"
              type="number"
              min="0"
              value={data.tarifaAuditoria}
              onChange={handleChange("tarifaAuditoria")}
              data-testid="input-tarifa-auditoria"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tarifaGestion">Gestión Presencial (COP)</Label>
            <Input
              id="tarifaGestion"
              type="number"
              min="0"
              value={data.tarifaGestion}
              onChange={handleChange("tarifaGestion")}
              data-testid="input-tarifa-gestion"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="visitasMes">Visitas al Mes</Label>
            <Input
              id="visitasMes"
              type="number"
              min="1"
              value={data.visitasMes}
              onChange={handleChange("visitasMes")}
              data-testid="input-visitas-mes"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="horasPorVisita">Horas por Visita</Label>
            <Input
              id="horasPorVisita"
              type="number"
              min="1"
              placeholder="Ej: 3"
              value={data.horasPorVisita}
              onChange={handleChange("horasPorVisita")}
              data-testid="input-horas-por-visita"
            />
          </div>
        </CardContent>
      </Card>

      {/* Mensaje Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mensaje Principal</CardTitle>
          <CardDescription>Aparece en la propuesta personalizada — edítalo según cada cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.mensajePrincipal}
            onChange={handleChange("mensajePrincipal")}
            rows={5}
            data-testid="textarea-mensaje-principal"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleDownload} disabled={isGenerating} size="default" data-testid="button-download-propuesta-bottom">
          {isGenerating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Descargar PDF
        </Button>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  DEFAULT_PROPOSAL_DELIVERABLES,
  DEFAULT_PROPOSAL_OBJECT,
  DEFAULT_PROPOSAL_SCOPE,
  DEFAULT_PROPOSAL_TERMS,
  propuestaComercialSchema,
  type PropuestaComercialInput,
} from "@shared/propuesta-comercial";
import { Download, FileText, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";

const PROVIDER = {
  name: "SISTEMA AUTOMATIZADO DE GESTION INTEGRAL S.A.S.",
  nit: "902.036.337-4",
  city: "Medellín, Antioquia",
  web: "sst.sagisas.co",
  email: "legal@sst-colombia.com",
  phone: "+57 300 522 0679",
};

type ProposalForm = PropuestaComercialInput;

function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function makeDefaults(): ProposalForm {
  return {
    empresa: "",
    nit: "",
    destinatario: "",
    ciudad: "",
    fechaEmision: localDate(),
    vigenciaDias: 15,
    titulo: "Gestión operativa y administrativa SG-SST y PESV",
    objeto: DEFAULT_PROPOSAL_OBJECT,
    alcance: DEFAULT_PROPOSAL_SCOPE,
    entregables: DEFAULT_PROPOSAL_DELIVERABLES,
    condiciones: DEFAULT_PROPOSAL_TERMS,
    aplicaIva: true,
    tarifaIva: 19,
    conceptos: [{
      descripcion: "Servicio mensual de gestión operativa SG-SST y PESV",
      periodicidad: "Mensual",
      cantidad: 1,
      tarifa: 500000,
    }],
  };
}

const formatMoney = (amount: number) =>
  `$${Math.round(amount).toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;

function sanitizeText(value: string, max: number) {
  return value.replace(/[\u0000-\u0009\u000b-\u001f\u007f-\u009f]/g, "").slice(0, max);
}

export default function PropuestaComercialVersatil() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<ProposalForm>(makeDefaults);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState("");

  const subtotal = useMemo(
    () => data.conceptos.reduce((sum, item) => sum + item.cantidad * item.tarifa, 0),
    [data.conceptos],
  );
  const iva = data.aplicaIva ? Math.round(subtotal * data.tarifaIva / 100) : 0;
  const total = subtotal + iva;

  if (user?.role !== "superadmin") {
    return <div className="p-8 text-center text-muted-foreground">No tienes permisos para acceder a esta página.</div>;
  }

  const setField = <K extends keyof ProposalForm>(field: K, value: ProposalForm[K]) => {
    setData((current) => ({ ...current, [field]: value }));
    setFeedback("");
  };

  const setTextField = (field: Exclude<keyof ProposalForm, "aplicaIva" | "tarifaIva" | "vigenciaDias" | "conceptos">, max: number) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setField(field, sanitizeText(event.target.value, max) as ProposalForm[typeof field]);

  const reset = () => {
    if (isGenerating) return;
    setData(makeDefaults());
    setFeedback("");
  };

  const updateConcept = (index: number, field: "descripcion" | "periodicidad" | "cantidad" | "tarifa", value: string) => {
    setData((current) => ({
      ...current,
      conceptos: current.conceptos.map((item, itemIndex) => itemIndex !== index ? item : {
        ...item,
        [field]: field === "descripcion" ? sanitizeText(value, 180)
          : field === "periodicidad" ? sanitizeText(value, 40)
            : Math.max(0, Number(value) || 0),
      }),
    }));
    setFeedback("");
  };

  const handleDownload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = propuestaComercialSchema.safeParse(data);
    if (!parsed.success) {
      setFeedback(parsed.error.issues[0]?.message || "Revisa los datos de la propuesta.");
      return;
    }
    setIsGenerating(true);
    setFeedback("");
    try {
      const response = await fetch("/api/propuesta-comercial/versatil/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(parsed.data),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || `No se pudo generar el PDF (HTTP ${response.status}).`);
      }
      const contentType = response.headers.get("Content-Type") || "";
      if (!/^application\/pdf(?:\s*;|$)/i.test(contentType.trim())) {
        throw new Error("La respuesta del servidor no es un PDF válido.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      const slug = data.empresa.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "cliente";
      anchor.download = `Propuesta-Comercial-${slug}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
      setFeedback("La propuesta se generó y la descarga del PDF ha comenzado.");
      toast({ title: "Descarga de la propuesta iniciada" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ocurrió un error al generar la propuesta.";
      setFeedback(message);
      toast({ title: "Error al generar la propuesta", description: message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="container mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <FileText className="h-6 w-6 text-green-700" /> Propuesta Operativa y Administrativa
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Completa la información del cliente y la oferta. Los datos de SST-Colombia permanecen fijos.
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <Button type="button" variant="outline" onClick={reset} disabled={isGenerating} className="flex-1 sm:flex-none">
            <RefreshCw className="mr-2 h-4 w-4" /> Restablecer
          </Button>
          <Button type="submit" form="proposal-form" disabled={isGenerating} className="flex-1 sm:flex-none">
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            {isGenerating ? "Generando…" : "Descargar PDF"}
          </Button>
        </div>
      </div>

      <form id="proposal-form" onSubmit={handleDownload} className="space-y-6">
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-base">Datos del proveedor</CardTitle>
            <CardDescription>Identidad fija que aparece en la propuesta y el PDF.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <div><span className="text-muted-foreground">Razón social</span><p className="font-medium">{PROVIDER.name}</p></div>
            <div><span className="text-muted-foreground">NIT</span><p className="font-medium">{PROVIDER.nit}</p></div>
            <div><span className="text-muted-foreground">Domicilio</span><p className="font-medium">{PROVIDER.city}</p></div>
            <div><span className="text-muted-foreground">Contacto</span><p className="font-medium">{PROVIDER.email} · {PROVIDER.phone}</p></div>
            <div><span className="text-muted-foreground">Sitio web</span><p className="font-medium">{PROVIDER.web}</p></div>
          </CardContent>
        </Card>

        <Card className="border-green-400 ring-1 ring-green-300">
          <CardHeader>
            <CardTitle className="text-base text-green-800">Empresa destinataria</CardTitle>
            <CardDescription>Información del cliente que aparecerá en la portada.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="proposal-company">Razón social <span className="text-red-500">*</span></Label>
              <Input id="proposal-company" value={data.empresa} onChange={setTextField("empresa", 120)} maxLength={120} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proposal-nit">NIT</Label>
              <Input id="proposal-nit" value={data.nit} onChange={setTextField("nit", 30)} maxLength={30} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proposal-recipient">Dirigido a</Label>
              <Input id="proposal-recipient" value={data.destinatario} onChange={setTextField("destinatario", 120)} maxLength={120} placeholder="Nombre completo o cargo profesional" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proposal-city">Ciudad del cliente</Label>
              <Input id="proposal-city" value={data.ciudad} onChange={setTextField("ciudad", 100)} maxLength={100} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proposal-date">Fecha de emisión</Label>
              <Input id="proposal-date" type="date" value={data.fechaEmision} onChange={(event) => setField("fechaEmision", event.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proposal-validity">Vigencia (días calendario)</Label>
              <Input id="proposal-validity" type="number" min="1" max="365" value={data.vigenciaDias} onChange={(event) => setField("vigenciaDias", Number(event.target.value) || 1)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Servicio y alcance</CardTitle>
            <CardDescription>Texto base de la oferta integral; puedes ajustarlo para cada cliente.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="proposal-title">Título de la propuesta</Label>
              <Input id="proposal-title" value={data.titulo} onChange={setTextField("titulo", 140)} maxLength={140} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proposal-object">Objeto del servicio</Label>
              <Textarea id="proposal-object" value={data.objeto} onChange={setTextField("objeto", 1200)} maxLength={1200} rows={3} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proposal-scope">Alcance</Label>
              <Textarea id="proposal-scope" value={data.alcance} onChange={setTextField("alcance", 6000)} maxLength={6000} rows={8} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proposal-deliverables">Entregables</Label>
              <Textarea id="proposal-deliverables" value={data.entregables} onChange={setTextField("entregables", 3000)} maxLength={3000} rows={4} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proposal-terms">Condiciones comerciales</Label>
              <Textarea id="proposal-terms" value={data.condiciones} onChange={setTextField("condiciones", 3000)} maxLength={3000} rows={4} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/30">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base text-green-800">Conceptos y tarifas</CardTitle>
                <CardDescription>Agrega varios servicios o componentes con su periodicidad y valor.</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setData((current) => current.conceptos.length >= 8 ? current : ({
                  ...current,
                  conceptos: [...current.conceptos, { descripcion: "", periodicidad: "Mensual", cantidad: 1, tarifa: 0 }],
                }))}
                disabled={data.conceptos.length >= 8}
              >
                <Plus className="mr-2 h-4 w-4" /> Agregar concepto
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.conceptos.map((item, index) => (
              <div key={index} className="grid gap-3 rounded-md border bg-white p-3 sm:grid-cols-12">
                <div className="space-y-1.5 sm:col-span-5">
                  <Label htmlFor={`concept-description-${index}`}>Concepto</Label>
                  <Input id={`concept-description-${index}`} value={item.descripcion} maxLength={180} onChange={(event) => updateConcept(index, "descripcion", event.target.value)} required />
                </div>
                <div className="space-y-1.5 sm:col-span-3">
                  <Label htmlFor={`concept-period-${index}`}>Periodicidad</Label>
                  <Input id={`concept-period-${index}`} value={item.periodicidad} maxLength={40} onChange={(event) => updateConcept(index, "periodicidad", event.target.value)} required />
                </div>
                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor={`concept-qty-${index}`}>Cant.</Label>
                  <Input id={`concept-qty-${index}`} type="number" min="0.01" step="0.01" value={item.cantidad} onChange={(event) => updateConcept(index, "cantidad", event.target.value)} required />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor={`concept-rate-${index}`}>Tarifa COP</Label>
                  <Input id={`concept-rate-${index}`} type="number" min="0" step="1" value={item.tarifa} onChange={(event) => updateConcept(index, "tarifa", event.target.value)} required />
                </div>
                <div className="flex items-end sm:col-span-1">
                  <Button type="button" variant="ghost" size="icon" aria-label={`Eliminar concepto ${index + 1}`} onClick={() => setData((current) => ({
                    ...current,
                    conceptos: current.conceptos.length > 1 ? current.conceptos.filter((_, itemIndex) => itemIndex !== index) : current.conceptos,
                  }))} disabled={data.conceptos.length <= 1}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-2 rounded-md border bg-white p-3 text-sm">
                <input type="checkbox" checked={data.aplicaIva} onChange={(event) => {
                  setData((current) => ({ ...current, aplicaIva: event.target.checked, tarifaIva: event.target.checked ? (current.tarifaIva || 19) : 0 }));
                  setFeedback("");
                }} className="h-4 w-4 accent-green-700" />
                Aplicar IVA a esta propuesta
              </label>
              <div className="space-y-1.5">
                <Label htmlFor="proposal-iva">Tarifa de IVA (%)</Label>
                <Input id="proposal-iva" type="number" min="0" max="100" step="0.01" value={data.tarifaIva} disabled={!data.aplicaIva} onChange={(event) => setField("tarifaIva", Math.max(0, Math.min(100, Number(event.target.value) || 0)))} />
                <p className="text-xs text-muted-foreground">Verifica la tarifa aplicable al servicio antes de emitir la propuesta.</p>
              </div>
            </div>
            <div className="rounded-md border bg-white p-4 text-sm">
              <div className="flex justify-between gap-4"><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div>
              {data.aplicaIva && <div className="mt-2 flex justify-between gap-4"><span>IVA ({data.tarifaIva}%)</span><strong>{formatMoney(iva)}</strong></div>}
              <div className="mt-3 flex justify-between border-t pt-3 text-base text-green-900"><span className="font-bold">Total</span><strong>{formatMoney(total)} COP</strong></div>
            </div>
          </CardContent>
        </Card>

        {feedback && <p role="status" className="rounded-md border bg-background p-3 text-sm">{feedback}</p>}
        <div className="flex justify-end">
          <Button type="submit" disabled={isGenerating}>
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            {isGenerating ? "Generando…" : "Descargar propuesta PDF"}
          </Button>
        </div>
      </form>
    </main>
  );
}

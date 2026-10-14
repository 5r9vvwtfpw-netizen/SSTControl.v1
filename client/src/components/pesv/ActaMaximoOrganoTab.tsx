import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FileDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ActaMaximoOrganoPesv } from "@shared/schema";

const organosSociales = [
  "Asamblea General de Accionistas",
  "Junta de Socios",
  "Asamblea General de Asociados",
];

const getLocalDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const createEmptyForm = () => ({
  organoSocial: "",
  existeCsv: "",
  tipoSesion: "",
  fechaReunion: getLocalDate(),
  modalidad: "Presencial",
  lugar: "",
  asistentes: "",
  quorumTipo: "",
  quorumDetalle: "",
  decisionTipo: "",
  decisionDetalle: "",
  presidenteNombre: "",
  secretarioNombre: "",
  organoSocialOtro: "",
});

export default function ActaMaximoOrganoTab({ isAdmin }: { isAdmin: boolean }) {
  const { toast } = useToast();
  const [form, setForm] = useState(createEmptyForm);
  const { data: actas = [], isLoading } = useQuery<ActaMaximoOrganoPesv[]>({
    queryKey: ["/api/pesv/comite/acta-maximo-organo"],
  });
  const save = useMutation({
    mutationFn: async () => {
      const organoSocial = form.organoSocial === "Otro" ? form.organoSocialOtro.trim() : form.organoSocial;
      const quorum = `${form.quorumTipo}${form.quorumDetalle.trim() ? `: ${form.quorumDetalle.trim()}` : ""}`;
      const decision = `${form.decisionTipo}${form.decisionDetalle.trim() ? `: ${form.decisionDetalle.trim()}` : ""}`;
      const lugar = `${form.modalidad}${form.lugar.trim() ? ` — ${form.lugar.trim()}` : ""}`;
      return (await apiRequest("POST", "/api/pesv/comite/acta-maximo-organo", {
        organoSocial,
        existeCsv: form.existeCsv === "true",
        tipoSesion: form.tipoSesion,
        fechaReunion: form.fechaReunion,
        lugar,
        asistentes: form.asistentes,
        quorum,
        decision,
        presidenteNombre: form.presidenteNombre,
        secretarioNombre: form.secretarioNombre,
      })).json();
    },
    onSuccess: (acta: ActaMaximoOrganoPesv) => {
      queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/acta-maximo-organo"] });
      setForm(createEmptyForm());
      window.open(`/api/pesv/comite/acta-maximo-organo/${acta.id}/pdf?download=1`, "_blank", "noopener,noreferrer");
      toast({ title: `Acta ${acta.numeroActa} generada`, description: "El PDF se abrió en una pestaña nueva." });
    },
    onError: (error: Error) => toast({ title: "No se pudo generar el acta", description: error.message, variant: "destructive" }),
  });

  const set = (field: keyof ReturnType<typeof createEmptyForm>, value: string) => setForm(previous => ({ ...previous, [field]: value }));
  const year = form.fechaReunion ? new Date(`${form.fechaReunion}T12:00:00`).getFullYear() : new Date().getFullYear();
  const nextActNumber = actas.reduce((max, acta) => {
    const match = acta.numeroActa.match(/^(\d+)-(\d{4})$/);
    return match?.[2] === String(year) ? Math.max(max, Number(match[1])) : max;
  }, 0) + 1;
  const numberPreview = `${String(nextActNumber).padStart(3, "0")}-${year}`;
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      !form.organoSocial
      || (form.organoSocial === "Otro" && !form.organoSocialOtro.trim())
      || !form.existeCsv
      || !form.tipoSesion
      || !form.quorumTipo
      || !form.decisionTipo
    ) {
      toast({ title: "Completa las selecciones requeridas", description: "Selecciona el órgano social, la existencia del CSV, el tipo de sesión, el quórum y el resultado de la decisión.", variant: "destructive" });
      return;
    }
    save.mutate();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Acta del máximo órgano social</CardTitle>
          <CardDescription>Registra la sesión y sus decisiones. El sistema genera el PDF; no se cargan archivos.</CardDescription>
        </CardHeader>
        <CardContent>
          {!isAdmin ? <p className="text-sm text-muted-foreground">No tienes permisos para registrar esta acta.</p> : (
            <form className="space-y-4" onSubmit={submit}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>Número de acta</Label>
                  <Input value={isLoading ? "Calculando…" : numberPreview} readOnly aria-readonly="true" data-testid="input-auto-act-number" />
                  <p className="text-xs text-muted-foreground">Consecutivo asignado automáticamente al guardar.</p>
                </div>
                <div className="space-y-2">
                  <Label>Órgano social</Label>
                  <Select value={form.organoSocial} onValueChange={v => set("organoSocial", v)}>
                    <SelectTrigger data-testid="select-social-body"><SelectValue placeholder="Seleccionar órgano" /></SelectTrigger>
                    <SelectContent>
                      {organosSociales.map(organo => <SelectItem key={organo} value={organo}>{organo}</SelectItem>)}
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>¿Existe el Comité de Seguridad Vial (CSV)?</Label>
                  <Select value={form.existeCsv} onValueChange={v => set("existeCsv", v)}>
                    <SelectTrigger data-testid="select-csv-exists"><SelectValue placeholder="Seleccionar respuesta" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Sí</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de sesión</Label>
                  <Select value={form.tipoSesion} onValueChange={v => set("tipoSesion", v)}>
                    <SelectTrigger data-testid="select-session-type"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ordinaria">Ordinaria</SelectItem>
                      <SelectItem value="Extraordinaria">Extraordinaria</SelectItem>
                      <SelectItem value="Universal">Universal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Field label="Fecha de la sesión" type="date" value={form.fechaReunion} onChange={v => set("fechaReunion", v)} />
                <div className="space-y-2">
                  <Label>Modalidad</Label>
                  <Select value={form.modalidad} onValueChange={v => set("modalidad", v)}>
                    <SelectTrigger data-testid="select-meeting-mode"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Presencial">Presencial</SelectItem>
                      <SelectItem value="Virtual">Virtual</SelectItem>
                      <SelectItem value="Mixta">Mixta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Field label={form.modalidad === "Virtual" ? "Plataforma o enlace de la sesión" : "Lugar de la sesión"} value={form.lugar} onChange={v => set("lugar", v)} />
                <Field label="Presidente de la sesión" value={form.presidenteNombre} onChange={v => set("presidenteNombre", v)} />
                <Field label="Secretario de la sesión" value={form.secretarioNombre} onChange={v => set("secretarioNombre", v)} />
              </div>
              {form.organoSocial === "Otro" && (
                <Field label="Nombre del órgano social" value={form.organoSocialOtro} onChange={v => set("organoSocialOtro", v)} />
              )}
              <TextField label="Asistentes y representación" value={form.asistentes} onChange={v => set("asistentes", v)} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Verificación del quórum</Label>
                  <Select value={form.quorumTipo} onValueChange={v => set("quorumTipo", v)}>
                    <SelectTrigger data-testid="select-quorum-outcome"><SelectValue placeholder="Seleccionar resultado" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Quórum deliberatorio y decisorio verificado">Quórum verificado</SelectItem>
                      <SelectItem value="Reunión universal">Reunión universal</SelectItem>
                      <SelectItem value="No se alcanzó el quórum">No se alcanzó el quórum</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <TextField label="Detalle del quórum (asistentes, total y porcentaje)" value={form.quorumDetalle} onChange={v => set("quorumDetalle", v)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Resultado de la decisión</Label>
                  <Select value={form.decisionTipo} onValueChange={v => set("decisionTipo", v)}>
                    <SelectTrigger data-testid="select-decision-outcome"><SelectValue placeholder="Seleccionar resultado" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aprobada">Aprobada</SelectItem>
                      <SelectItem value="No aprobada">No aprobada</SelectItem>
                      <SelectItem value="Aplazada">Aplazada</SelectItem>
                      <SelectItem value="Sin decisión">Sin decisión</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <TextField label="Decisión y detalles relacionados con el PESV" value={form.decisionDetalle} onChange={v => set("decisionDetalle", v)} />
              </div>
              <Button type="submit" disabled={save.isPending || isLoading}>
                <Plus className="mr-2 h-4 w-4" />{save.isPending ? "Generando..." : "Guardar y generar PDF"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Actas registradas</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p className="text-sm text-muted-foreground">Cargando...</p> : actas.length === 0
            ? <p className="text-sm text-muted-foreground">No hay actas registradas.</p>
            : actas.map(acta => (
              <div key={acta.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
                <div>
                  <div className="font-medium">Acta {acta.numeroActa} · {acta.organoSocial}</div>
                  <div className="text-sm text-muted-foreground">{acta.tipoSesion} · {acta.fechaReunion} · {acta.estado}</div>
                </div>
                <Button variant="outline" onClick={() => window.open(`/api/pesv/comite/acta-maximo-organo/${acta.id}/pdf?download=1`, "_blank", "noopener,noreferrer")}>
                  <FileDown className="mr-2 h-4 w-4" />Descargar PDF
                </Button>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return <div className="space-y-2"><Label>{label}</Label><Input required value={value} type={type} placeholder={placeholder} onChange={event => onChange(event.target.value)} /></div>;
}
function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div className="space-y-2"><Label>{label}</Label><Textarea required value={value} rows={3} onChange={event => onChange(event.target.value)} /></div>;
}

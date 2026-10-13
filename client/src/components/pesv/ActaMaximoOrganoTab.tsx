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

const emptyForm = {
  numeroActa: "",
  organoSocial: "",
  tipoSesion: "",
  fechaReunion: "",
  lugar: "",
  asistentes: "",
  quorum: "",
  decision: "",
  presidenteNombre: "",
  secretarioNombre: "",
};

export default function ActaMaximoOrganoTab({ isAdmin }: { isAdmin: boolean }) {
  const { toast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const { data: actas = [], isLoading } = useQuery<ActaMaximoOrganoPesv[]>({
    queryKey: ["/api/pesv/comite/acta-maximo-organo"],
  });
  const save = useMutation({
    mutationFn: async () => (await apiRequest("POST", "/api/pesv/comite/acta-maximo-organo", form)).json(),
    onSuccess: (acta: ActaMaximoOrganoPesv) => {
      queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/acta-maximo-organo"] });
      setForm(emptyForm);
      window.open(`/api/pesv/comite/acta-maximo-organo/${acta.id}/pdf`, "_blank", "noopener,noreferrer");
      toast({ title: "Acta generada", description: "El PDF se abrió en una pestaña nueva." });
    },
    onError: (error: Error) => toast({ title: "No se pudo generar el acta", description: error.message, variant: "destructive" }),
  });

  const set = (field: keyof typeof emptyForm, value: string) => setForm(previous => ({ ...previous, [field]: value }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Acta del máximo órgano social</CardTitle>
          <CardDescription>Registra la sesión y sus decisiones. El sistema genera el PDF; no se cargan archivos.</CardDescription>
        </CardHeader>
        <CardContent>
          {!isAdmin ? <p className="text-sm text-muted-foreground">No tienes permisos para registrar esta acta.</p> : (
            <form className="space-y-4" onSubmit={event => { event.preventDefault(); save.mutate(); }}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Número de acta" value={form.numeroActa} onChange={v => set("numeroActa", v)} />
                <Field label="Órgano social" value={form.organoSocial} onChange={v => set("organoSocial", v)} placeholder="Asamblea, junta de socios..." />
                <div className="space-y-2">
                  <Label>Tipo de sesión</Label>
                  <Select value={form.tipoSesion} onValueChange={v => set("tipoSesion", v)}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ordinaria">Ordinaria</SelectItem>
                      <SelectItem value="Extraordinaria">Extraordinaria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Field label="Fecha de la sesión" type="date" value={form.fechaReunion} onChange={v => set("fechaReunion", v)} />
                <Field label="Lugar o modalidad" value={form.lugar} onChange={v => set("lugar", v)} />
                <Field label="Presidente de la sesión" value={form.presidenteNombre} onChange={v => set("presidenteNombre", v)} />
                <Field label="Secretario de la sesión" value={form.secretarioNombre} onChange={v => set("secretarioNombre", v)} />
              </div>
              <TextField label="Asistentes y representación" value={form.asistentes} onChange={v => set("asistentes", v)} />
              <TextField label="Quórum" value={form.quorum} onChange={v => set("quorum", v)} />
              <TextField label="Decisión sobre el PESV" value={form.decision} onChange={v => set("decision", v)} />
              <Button type="submit" disabled={save.isPending}>
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
                <Button variant="outline" onClick={() => window.open(`/api/pesv/comite/acta-maximo-organo/${acta.id}/pdf`, "_blank", "noopener,noreferrer")}>
                  <FileDown className="mr-2 h-4 w-4" />Abrir PDF
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

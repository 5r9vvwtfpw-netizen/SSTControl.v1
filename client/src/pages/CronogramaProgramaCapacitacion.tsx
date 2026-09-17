import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ProgramTraining, TrainingProgram } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, Download, ExternalLink, LayoutList, Pencil, Plus, Trash2, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type TrainingForm = {
  topic: string; description: string; trainingCategory: string; legalBasis: string;
  scheduledDate: string; scheduledTime: string; duration: string; frequency: string;
  actualDate: string; actualTime: string; location: string; modality: string;
  instructor: string; instructorQualifications: string; responsible: string;
  targetAudience: string; estimatedAttendees: string; actualAttendees: string;
  materials: string; equipment: string; requiresEvaluation: string; evaluationScore: string;
  status: string; observations: string; attachmentUrl: string; evidenceUrl: string;
};

const emptyForm: TrainingForm = {
  topic: "", description: "", trainingCategory: "", legalBasis: "", scheduledDate: "", scheduledTime: "",
  duration: "1", frequency: "unica", actualDate: "", actualTime: "", location: "", modality: "presencial",
  instructor: "", instructorQualifications: "", responsible: "", targetAudience: "", estimatedAttendees: "0",
  actualAttendees: "0", materials: "", equipment: "", requiresEvaluation: "1", evaluationScore: "",
  status: "programada", observations: "", attachmentUrl: "", evidenceUrl: "",
};

const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const statusLabels: Record<string, string> = { programada: "Programada", en_curso: "En curso", completada: "Completada", cancelada: "Cancelada", reprogramada: "Reprogramada" };

function dateValue(value?: string | Date | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}
function statusTone(status: string) {
  return status === "completada" ? "default" : status === "cancelada" ? "destructive" : status === "en_curso" ? "secondary" : "outline";
}

export default function CronogramaProgramaCapacitacion() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [view, setView] = useState<"detalle" | "matriz">("detalle");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProgramTraining | null>(null);
  const [form, setForm] = useState<TrainingForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const programQuery = useQuery<TrainingProgram>({ queryKey: [`/api/training-programs/${id}`], enabled: !!id });
  const trainingsQuery = useQuery<ProgramTraining[]>({ queryKey: [`/api/program-trainings/${id}`], enabled: !!id });
  const trainings = trainingsQuery.data ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const metrics = useMemo(() => {
    const completed = trainings.filter(t => t.status === "completada").length;
    const overdue = trainings.filter(t => t.status !== "completada" && t.status !== "cancelada" && dateValue(t.scheduledDate) < today).length;
    const participants = trainings.reduce((sum, t) => sum + (t.actualAttendees ?? t.estimatedAttendees ?? 0), 0);
    return { completed, overdue, participants, compliance: trainings.length ? Math.round(completed / trainings.length * 100) : 0 };
  }, [trainings, today]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: [`/api/program-trainings/${id}`] });
  const downloadPdf = () => {
    if (!id) return;
    window.open(`/api/training-programs/${id}/cronograma-pdf`, "_blank", "noopener,noreferrer");
  };
  const saveMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => editing
      ? apiRequest("PATCH", `/api/program-trainings/${editing.id}`, payload)
      : apiRequest("POST", "/api/program-trainings", { ...payload, programId: id }),
    onSuccess: () => { refresh(); setDialogOpen(false); toast({ title: editing ? "Actividad actualizada" : "Actividad programada" }); },
    onError: (error: Error) => toast({ title: "No se pudo guardar la actividad", description: error.message, variant: "destructive" }),
  });
  const deleteMutation = useMutation({
    mutationFn: (trainingId: string) => apiRequest("DELETE", `/api/program-trainings/${trainingId}`),
    onSuccess: () => { refresh(); setDeleteId(null); toast({ title: "Actividad eliminada" }); },
    onError: (error: Error) => toast({ title: "No se pudo eliminar", description: error.message, variant: "destructive" }),
  });

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm, scheduledDate: `${programQuery.data?.year ?? new Date().getFullYear()}-01-15` }); setDialogOpen(true); };
  const openEdit = (training: ProgramTraining) => {
    setEditing(training);
    setForm(Object.fromEntries(Object.keys(emptyForm).map(key => [key, key === "scheduledDate" ? dateValue(training.scheduledDate) : key === "actualDate" ? dateValue(training.actualDate) : String((training as any)[key] ?? emptyForm[key as keyof TrainingForm])])) as TrainingForm);
    setDialogOpen(true);
  };
  const submit = () => {
    const required: [keyof TrainingForm, string][] = [["topic", "tema"], ["trainingCategory", "categoría"], ["scheduledDate", "fecha programada"], ["duration", "duración"], ["instructor", "instructor"], ["targetAudience", "población objetivo"]];
    const missing = required.find(([key]) => !String(form[key]).trim());
    if (missing) { toast({ title: "Completa los campos obligatorios", description: `Indica la ${missing[1]}.`, variant: "destructive" }); return; }
    if (!form.scheduledDate || (form.actualDate && form.actualDate < form.scheduledDate)) { toast({ title: "Revisa las fechas", description: "La fecha real no puede ser anterior a la fecha programada.", variant: "destructive" }); return; }
    const payload: Record<string, unknown> = { ...form, duration: Number(form.duration), estimatedAttendees: Number(form.estimatedAttendees), actualAttendees: Number(form.actualAttendees), requiresEvaluation: Number(form.requiresEvaluation), evaluationScore: form.evaluationScore ? Number(form.evaluationScore) : null };
    if (!form.actualDate) {
      delete payload.actualDate;
    }
    saveMutation.mutate(payload);
  };

  if (programQuery.isLoading || trainingsQuery.isLoading) return <div className="p-6 max-w-7xl mx-auto"><div className="h-8 w-72 animate-pulse rounded bg-muted mb-6" /><div className="h-32 animate-pulse rounded bg-muted" /></div>;
  if (programQuery.isError || trainingsQuery.isError || !programQuery.data) return <div className="p-6 max-w-7xl mx-auto"><Card><CardContent className="py-12 text-center"><p className="text-destructive mb-4">No fue posible cargar el cronograma.</p><Button onClick={() => { programQuery.refetch(); trainingsQuery.refetch(); }}>Reintentar</Button></CardContent></Card></div>;
  const program = programQuery.data;
  const byMonth = months.map((name, index) => ({ name, items: trainings.filter(t => new Date(t.scheduledDate).getMonth() === index) }));

  return <div className="min-h-[100dvh] bg-background p-4 md:p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      <Link href="/programa-capacitacion-anual" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Programas de capacitación</Link>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div><div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary font-semibold"><CalendarDays className="h-4 w-4" />Cronograma anual · {program.year}</div><h1 className="text-3xl font-bold mt-2">{program.title}</h1><p className="text-muted-foreground mt-1 max-w-2xl">Actividades planeadas, ejecución y evidencia del programa general.</p></div>
         <div className="flex flex-wrap gap-2">
           <Button variant="outline" onClick={downloadPdf} disabled={!trainings.length}>
             <Download className="h-4 w-4 mr-2" />PDF completo
           </Button>
           <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Nueva actividad</Button>
         </div>
      </header>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {([
          { label: "Total", value: trainings.length, Icon: LayoutList },
          { label: "Completadas", value: metrics.completed, Icon: CheckCircle2 },
          { label: "Pendientes / vencidas", value: trainings.filter(t => t.status !== "completada" && t.status !== "cancelada").length, Icon: Clock3 },
          { label: "Cumplimiento", value: `${metrics.compliance}%`, Icon: CheckCircle2 },
          { label: "Participantes", value: metrics.participants, Icon: Users },
        ] as { label: string; value: string | number; Icon: LucideIcon }[]).map(({ label, value, Icon }) => <Card key={label}><CardContent className="p-4"><div className="flex items-center justify-between text-muted-foreground text-xs"><span>{label}</span><Icon className="h-4 w-4" /></div><div className="text-2xl font-bold mt-2">{value}</div></CardContent></Card>)}
      </div>
      {metrics.overdue > 0 && <div className="border border-amber-300 bg-amber-50 dark:bg-amber-950/20 rounded-lg px-4 py-3 text-sm text-amber-900 dark:text-amber-200">{metrics.overdue} actividad{metrics.overdue > 1 ? "es" : ""} tiene{metrics.overdue > 1 ? "n" : ""} fecha vencida sin completar.</div>}
      <div className="flex border-b gap-5"><button className={`pb-3 text-sm font-medium border-b-2 ${view === "detalle" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`} onClick={() => setView("detalle")}>Vista detallada</button><button className={`pb-3 text-sm font-medium border-b-2 ${view === "matriz" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`} onClick={() => setView("matriz")}>Matriz enero–diciembre</button></div>
      {view === "detalle" ? <section className="space-y-3">{trainings.length === 0 ? <Card><CardContent className="py-16 text-center"><CalendarDays className="h-10 w-10 mx-auto text-muted-foreground mb-3" /><h2 className="font-semibold">Aún no hay actividades</h2><p className="text-sm text-muted-foreground mt-1 mb-4">Programa la primera capacitación para comenzar a hacer seguimiento.</p><Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Programar actividad</Button></CardContent></Card> : trainings.slice().sort((a,b) => dateValue(a.scheduledDate).localeCompare(dateValue(b.scheduledDate))).map(training => <Card key={training.id}><CardContent className="p-4 md:p-5"><div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Badge variant={statusTone(training.status) as any}>{statusLabels[training.status] ?? training.status}</Badge><span className="text-xs text-muted-foreground">{training.trainingCategory}{training.isObligatory ? " · Obligatoria" : ""}</span></div><h2 className="font-semibold text-lg mt-2">{training.topic}</h2><p className="text-sm text-muted-foreground mt-1">{training.description || "Sin descripción registrada."}</p><div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm"><div><span className="text-xs text-muted-foreground block">Programada</span>{dateValue(training.scheduledDate)}{training.scheduledTime ? ` · ${training.scheduledTime}` : ""}</div><div><span className="text-xs text-muted-foreground block">Fecha real</span>{training.actualDate ? dateValue(training.actualDate) : "Pendiente"}</div><div><span className="text-xs text-muted-foreground block">Responsable</span>{training.responsible || training.instructor}</div><div><span className="text-xs text-muted-foreground block">Participantes</span>{training.actualAttendees ?? 0} / {training.estimatedAttendees}</div></div>{(training.evaluationScore != null || training.evidenceUrl || training.attachmentUrl) && <div className="flex flex-wrap gap-3 mt-4 text-xs">{training.evaluationScore != null && <span className="text-muted-foreground">Evaluación: <strong className="text-foreground">{training.evaluationScore}/100</strong></span>}{training.evidenceUrl && <a href={training.evidenceUrl} target="_blank" rel="noreferrer" className="text-primary inline-flex items-center gap-1">Evidencia <ExternalLink className="h-3 w-3" /></a>}{training.attachmentUrl && <a href={training.attachmentUrl} target="_blank" rel="noreferrer" className="text-primary inline-flex items-center gap-1">Material <ExternalLink className="h-3 w-3" /></a>}</div>}</div><div className="flex gap-2 shrink-0"><Button size="icon" variant="outline" onClick={() => openEdit(training)} aria-label="Editar actividad"><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="outline" onClick={() => setDeleteId(training.id)} aria-label="Eliminar actividad"><Trash2 className="h-4 w-4 text-destructive" /></Button></div></div></CardContent></Card>)}</section> : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{byMonth.map(month => <Card key={month.name} className={month.items.length ? "border-primary/30" : ""}><CardHeader className="pb-3"><CardTitle className="text-base flex justify-between">{month.name}<span className="text-xs font-normal text-muted-foreground">{month.items.length} actividad{month.items.length !== 1 ? "es" : ""}</span></CardTitle></CardHeader><CardContent className="space-y-2">{month.items.length ? month.items.map(t => <button key={t.id} onClick={() => openEdit(t)} className="w-full text-left rounded-md border p-3 hover:bg-muted/50"><div className="flex items-center justify-between gap-2"><span className="font-medium text-sm truncate">{t.topic}</span><span className={`h-2 w-2 rounded-full shrink-0 ${t.status === "completada" ? "bg-emerald-500" : t.status === "cancelada" ? "bg-red-500" : "bg-amber-500"}`} /></div><p className="text-xs text-muted-foreground mt-1">{dateValue(t.scheduledDate)} · {statusLabels[t.status]}</p></button>) : <p className="text-sm text-muted-foreground py-2">Sin actividades programadas.</p>}</CardContent></Card>)}</div>}
    </div>
    <TrainingDialog open={dialogOpen} onOpenChange={setDialogOpen} form={form} setForm={setForm} editing={!!editing} pending={saveMutation.isPending} onSubmit={submit} />
    <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Eliminar actividad?</AlertDialogTitle><AlertDialogDescription>Esta acción eliminará el registro del cronograma y no se puede deshacer.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}

function TrainingDialog({ open, onOpenChange, form, setForm, editing, pending, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; form: TrainingForm; setForm: React.Dispatch<React.SetStateAction<TrainingForm>>; editing: boolean; pending: boolean; onSubmit: () => void }) {
  const field = (key: keyof TrainingForm, label: string, required = false, type = "text") => <div className="space-y-1.5"><Label>{label}{required ? " *" : ""}</Label><Input type={type} value={form[key]} onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))} /></div>;
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto"><DialogHeader><DialogTitle>{editing ? "Editar actividad" : "Programar actividad"}</DialogTitle><DialogDescription>Registra lo planeado y actualiza la ejecución cuando ocurra.</DialogDescription></DialogHeader><div className="grid md:grid-cols-2 gap-4 py-3">{field("topic", "Tema", true)}{field("trainingCategory", "Categoría", true)}{field("scheduledDate", "Fecha programada", true, "date")}{field("scheduledTime", "Hora programada", false, "time")}{field("duration", "Duración (horas)", true, "number")}{field("instructor", "Instructor", true)}{field("responsible", "Responsable")}{field("targetAudience", "Población objetivo", true)}{field("estimatedAttendees", "Asistentes estimados", false, "number")}{field("actualAttendees", "Asistentes reales", false, "number")}{field("actualDate", "Fecha real", false, "date")}{field("location", "Lugar")}{field("legalBasis", "Fundamento legal")}{field("evaluationScore", "Evaluación (0–100)", false, "number")}{field("evidenceUrl", "Enlace de evidencia")}{field("attachmentUrl", "Enlace de material")}<div className="space-y-1.5"><Label>Estado</Label><select className="flex h-10 w-full rounded-md border bg-background px-3 text-sm" value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div className="space-y-1.5"><Label>Modalidad</Label><select className="flex h-10 w-full rounded-md border bg-background px-3 text-sm" value={form.modality} onChange={e => setForm(prev => ({ ...prev, modality: e.target.value }))}><option value="presencial">Presencial</option><option value="virtual">Virtual</option><option value="mixta">Mixta</option></select></div><div className="md:col-span-2 space-y-1.5"><Label>Descripción</Label><Textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} /></div><div className="md:col-span-2 space-y-1.5"><Label>Observaciones</Label><Textarea value={form.observations} onChange={e => setForm(prev => ({ ...prev, observations: e.target.value }))} /></div></div><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button onClick={onSubmit} disabled={pending}>{pending ? "Guardando..." : editing ? "Guardar cambios" : "Programar actividad"}</Button></DialogFooter></DialogContent></Dialog>;
}
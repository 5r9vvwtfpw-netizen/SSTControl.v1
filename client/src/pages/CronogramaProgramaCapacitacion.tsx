import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { openCompanyDocument } from "@/lib/company-context-url";
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
import { ArrowLeft, Bot, CalendarDays, CheckCircle2, Clock3, Download, ExternalLink, LayoutList, Loader2, Pencil, Plus, Sparkles, Trash2, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CAPACITACIONES_OBLIGATORIAS, type CapacitacionPredefinida } from "@/data/catalogos-sst";

type TrainingForm = {
  topic: string; description: string; trainingCategory: string; legalBasis: string;
  scheduledDate: string; scheduledTime: string; duration: string; frequency: string;
  actualDate: string; actualTime: string; location: string; modality: string;
  instructor: string; instructorQualifications: string; responsible: string;
  targetAudience: string; estimatedAttendees: string; actualAttendees: string;
  materials: string; equipment: string; requiresEvaluation: string; evaluationScore: string;
  status: string; observations: string; attachmentUrl: string; evidenceUrl: string; isObligatory: string;
};
type AttendanceInput = { workerId: string; attended: number };
type AttendanceRosterEntry = {
  id: string; name: string; position: string; department: string;
  active: boolean; attendanceId: string | null; attended: number | null;
};

const emptyForm: TrainingForm = {
  topic: "", description: "", trainingCategory: "", legalBasis: "", scheduledDate: "", scheduledTime: "",
  duration: "1", frequency: "unica", actualDate: "", actualTime: "", location: "", modality: "presencial",
  instructor: "", instructorQualifications: "", responsible: "", targetAudience: "", estimatedAttendees: "",
  actualAttendees: "", materials: "", equipment: "", requiresEvaluation: "1", evaluationScore: "",
  status: "programada", observations: "", attachmentUrl: "", evidenceUrl: "", isObligatory: "0",
};

const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const statusLabels: Record<string, string> = { programada: "Programada", en_curso: "En curso", completada: "Completada", cancelada: "Cancelada", reprogramada: "Reprogramada" };
const categoryOptions = ["Inducción", "Reinducción", "Capacitación", "Entrenamiento", "Simulacro", "Promoción y prevención", "COPASST", "Brigada", "Otra"];

function categoryForTemplate(template: CapacitacionPredefinida) {
  const title = template.nombre.toLowerCase();
  if (title.includes("inducción") && title.includes("reinducción")) return "Reinducción";
  if (title.includes("inducción")) return "Inducción";
  if (title.includes("brigada")) return "Brigada";
  if (title.includes("simulacro")) return "Simulacro";
  if (title.includes("copasst") || title.includes("vigía")) return "COPASST";
  if (title.includes("entrenamiento") || title.includes("alturas")) return "Entrenamiento";
  return "Capacitación";
}

function dateValue(value?: string | Date | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}
function suggestedDateForFrequency(year: number, frequency: string) {
  const monthStep = frequency === "mensual" ? 1 : frequency === "trimestral" ? 3 : frequency === "semestral" ? 6 : frequency === "anual" ? 12 : 0;
  if (!monthStep || year < new Date().getFullYear()) return "";
  const toIsoDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const today = toIsoDate(new Date());
  for (let month = 0; month < 12; month += monthStep) {
    const firstWeekday = new Date(year, month, 1).getDay();
    const firstMonday = 1 + ((8 - firstWeekday) % 7);
    const candidate = toIsoDate(new Date(year, month, firstMonday));
    if (candidate >= today) return candidate;
  }
  return "";
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
  const [dialogMode, setDialogMode] = useState<"programacion" | "ejecucion">("programacion");
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
    openCompanyDocument(`/api/training-programs/${id}/cronograma-pdf`);
  };
  const saveMutation = useMutation({
    mutationFn: async ({ payload, attendance }: { payload: Record<string, unknown>; attendance?: AttendanceInput[] }) => {
      let finalPayload = payload;
      if (editing && attendance?.length) {
        const syncResponse = await apiRequest("PUT", `/api/program-training-attendance/${editing.id}/roster`, attendance);
        const synced = await syncResponse.json() as { total: number };
        finalPayload = { ...payload, actualAttendees: synced.total };
      }
      return editing
        ? apiRequest("PATCH", `/api/program-trainings/${editing.id}`, finalPayload)
        : apiRequest("POST", "/api/program-trainings", { ...finalPayload, programId: id });
    },
    onSuccess: () => {
      refresh();
      if (editing) queryClient.invalidateQueries({ queryKey: [`/api/program-training-attendance/${editing.id}/roster`] });
      setDialogOpen(false);
      toast({ title: editing ? "Actividad actualizada" : "Actividad programada" });
    },
    onError: (error: Error) => toast({ title: "No se pudo guardar la actividad", description: error.message, variant: "destructive" }),
  });
  const deleteMutation = useMutation({
    mutationFn: (trainingId: string) => apiRequest("DELETE", `/api/program-trainings/${trainingId}`),
    onSuccess: () => { refresh(); setDeleteId(null); toast({ title: "Actividad eliminada" }); },
    onError: (error: Error) => toast({ title: "No se pudo eliminar", description: error.message, variant: "destructive" }),
  });

  const openCreate = () => { setEditing(null); setDialogMode("programacion"); setForm({ ...emptyForm }); setDialogOpen(true); };
  const openEdit = (training: ProgramTraining) => {
    setEditing(training);
    setDialogMode("programacion");
    setForm(Object.fromEntries(Object.keys(emptyForm).map(key => [key, key === "scheduledDate" ? dateValue(training.scheduledDate) : key === "actualDate" ? dateValue(training.actualDate) : String((training as any)[key] ?? emptyForm[key as keyof TrainingForm])])) as TrainingForm);
    setDialogOpen(true);
  };
  const openExecution = (training: ProgramTraining) => {
    openEdit(training);
    setDialogMode("ejecucion");
  };
  const submit = (attendance?: AttendanceInput[]) => {
    if (dialogMode === "ejecucion") {
      if (!form.actualDate || attendance === undefined) {
        toast({ title: "Completa la ejecución", description: "Registra la fecha real y verifica la lista de asistencia.", variant: "destructive" });
        return;
      }
      if (form.actualDate < dateValue(editing?.scheduledDate)) {
        toast({ title: "Revisa la fecha real", description: "No puede ser anterior a la fecha programada.", variant: "destructive" });
        return;
      }
    } else {
      const required: [keyof TrainingForm, string][] = [["topic", "tema"], ["trainingCategory", "categoría"], ["scheduledDate", "fecha programada"], ["duration", "duración"], ["instructor", "instructor"], ["targetAudience", "población objetivo"]];
      const missing = required.find(([key]) => !String(form[key]).trim());
      if (missing) { toast({ title: "Completa los campos obligatorios", description: `Indica la ${missing[1]}.`, variant: "destructive" }); return; }
    }
    const payload: Record<string, unknown> = {
      ...form,
      duration: Number(form.duration || 1),
      frequency: form.frequency,
      isObligatory: Number(form.isObligatory),
      estimatedAttendees: Number(form.estimatedAttendees || 0),
      actualAttendees: dialogMode === "ejecucion" && attendance?.length ? new Set(attendance.filter(item => item.attended === 1).map(item => item.workerId)).size : form.actualAttendees === "" ? 0 : Number(form.actualAttendees),
      requiresEvaluation: Number(form.requiresEvaluation),
      evaluationScore: form.evaluationScore === "" ? null : Number(form.evaluationScore),
      status: dialogMode === "ejecucion" ? "completada" : form.status,
    };
    if (!form.actualDate) delete payload.actualDate;
    saveMutation.mutate({ payload, attendance: dialogMode === "ejecucion" ? attendance ?? [] : undefined });
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
      {view === "detalle" ? (
        <section className="space-y-3">
          {trainings.length === 0 ? (
            <Card><CardContent className="py-16 text-center"><CalendarDays className="h-10 w-10 mx-auto text-muted-foreground mb-3" /><h2 className="font-semibold">Aún no hay actividades</h2><p className="text-sm text-muted-foreground mt-1 mb-4">Programa la primera capacitación para comenzar a hacer seguimiento.</p><Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Programar actividad</Button></CardContent></Card>
          ) : trainings.slice().sort((a, b) => dateValue(a.scheduledDate).localeCompare(dateValue(b.scheduledDate))).map(training => (
            <Card key={training.id}>
              <CardContent className="p-4 md:p-5">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><Badge variant={statusTone(training.status) as any}>{statusLabels[training.status] ?? training.status}</Badge><span className="text-xs text-muted-foreground">{training.trainingCategory}{training.isObligatory ? " · Obligatoria" : ""}</span></div>
                    <h2 className="font-semibold text-lg mt-2">{training.topic}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{training.description || "Sin descripción registrada."}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
                      <div><span className="text-xs text-muted-foreground block">Programada</span>{dateValue(training.scheduledDate)}{training.scheduledTime ? ` · ${training.scheduledTime}` : ""}</div>
                      <div><span className="text-xs text-muted-foreground block">Fecha real</span>{training.actualDate ? dateValue(training.actualDate) : "Pendiente"}</div>
                      <div><span className="text-xs text-muted-foreground block">Responsable</span>{training.responsible || training.instructor}</div>
                      <div><span className="text-xs text-muted-foreground block">Asistentes reales / estimados</span>{training.actualAttendees == null ? "Pendiente" : training.actualAttendees} / {training.estimatedAttendees}</div>
                    </div>
                    {(training.evaluationScore != null || training.evidenceUrl || training.attachmentUrl) && (
                      <div className="flex flex-wrap gap-3 mt-4 text-xs">
                        {training.evaluationScore != null && <span className="text-muted-foreground">Evaluación: <strong className="text-foreground">{training.evaluationScore}/100</strong></span>}
                        {training.evidenceUrl && <a href={training.evidenceUrl} target="_blank" rel="noreferrer" className="text-primary inline-flex items-center gap-1">Evidencia <ExternalLink className="h-3 w-3" /></a>}
                        {training.attachmentUrl && <a href={training.attachmentUrl} target="_blank" rel="noreferrer" className="text-primary inline-flex items-center gap-1">Material <ExternalLink className="h-3 w-3" /></a>}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    {training.status !== "completada" && <Button size="sm" variant="outline" onClick={() => openExecution(training)}><CheckCircle2 className="h-4 w-4 mr-1" />Registrar ejecución</Button>}
                    <Button size="icon" variant="outline" onClick={() => openEdit(training)} aria-label="Editar actividad"><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="outline" onClick={() => setDeleteId(training.id)} aria-label="Eliminar actividad"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{byMonth.map(month => <Card key={month.name} className={month.items.length ? "border-primary/30" : ""}><CardHeader className="pb-3"><CardTitle className="text-base flex justify-between">{month.name}<span className="text-xs font-normal text-muted-foreground">{month.items.length} actividad{month.items.length !== 1 ? "es" : ""}</span></CardTitle></CardHeader><CardContent className="space-y-2">{month.items.length ? month.items.map(t => <button key={t.id} onClick={() => openEdit(t)} className="w-full text-left rounded-md border p-3 hover:bg-muted/50"><div className="flex items-center justify-between gap-2"><span className="font-medium text-sm truncate">{t.topic}</span><span className={`h-2 w-2 rounded-full shrink-0 ${t.status === "completada" ? "bg-emerald-500" : t.status === "cancelada" ? "bg-red-500" : "bg-amber-500"}`} /></div><p className="text-xs text-muted-foreground mt-1">{dateValue(t.scheduledDate)} · {statusLabels[t.status]}</p></button>) : <p className="text-sm text-muted-foreground py-2">Sin actividades programadas.</p>}</CardContent></Card>)}</div>
      )}
    </div>
     <TrainingDialog open={dialogOpen} onOpenChange={setDialogOpen} form={form} setForm={setForm} editing={!!editing} trainingId={editing?.id ?? null} programId={id ?? ""} programYear={program.year} mode={dialogMode} onModeChange={setDialogMode} pending={saveMutation.isPending} onSubmit={submit} />
    <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>¿Eliminar actividad?</AlertDialogTitle><AlertDialogDescription>Esta acción eliminará el registro del cronograma y no se puede deshacer.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}

function TrainingDialog({
  open, onOpenChange, form, setForm, editing, trainingId, programId, programYear, mode, onModeChange, pending, onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: TrainingForm;
  setForm: React.Dispatch<React.SetStateAction<TrainingForm>>;
  editing: boolean;
  trainingId: string | null;
  programId: string;
  programYear: number;
  mode: "programacion" | "ejecucion";
  onModeChange: (mode: "programacion" | "ejecucion") => void;
  pending: boolean;
  onSubmit: (attendance?: AttendanceInput[]) => void;
}) {
  const { toast } = useToast();
  const [request, setRequest] = useState("");
  const [proposal, setProposal] = useState<Partial<TrainingForm> | null>(null);
  const [estimateMessage, setEstimateMessage] = useState("");
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<Set<string>>(new Set());
  const [workerSearch, setWorkerSearch] = useState("");
  const assistant = useMutation({
    mutationFn: async (description: string) => {
      const response = await apiRequest("POST", "/api/program-trainings/assistant-suggest", { description });
      return response.json();
    },
    onSuccess: (data: any) => setProposal(data),
    onError: (error: Error) => toast({ title: "No se pudo preparar la propuesta", description: error.message, variant: "destructive" }),
  });
  const estimate = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", `/api/program-trainings/${programId}/attendee-estimate?targetAudience=${encodeURIComponent(form.targetAudience)}`);
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.available) {
        update("estimatedAttendees", String(data.count));
        setEstimateMessage(`Estimado: ${data.count}. Fuente: ${data.source}.`);
      } else setEstimateMessage(data.message);
    },
    onError: (error: Error) => toast({ title: "No se pudo calcular el estimado", description: error.message, variant: "destructive" }),
  });
  const rosterQuery = useQuery<AttendanceRosterEntry[]>({
    queryKey: [`/api/program-training-attendance/${trainingId}/roster`],
    enabled: open && mode === "ejecucion" && !!trainingId,
  });
  useEffect(() => {
    if (open) {
      setRequest("");
      setProposal(null);
      setEstimateMessage("");
      setWorkerSearch("");
    }
  }, [open]);
  useEffect(() => {
    if (rosterQuery.data) setSelectedWorkerIds(new Set(rosterQuery.data.filter(worker => worker.attended === 1).map(worker => worker.id)));
  }, [rosterQuery.data]);
  const update = (key: keyof TrainingForm, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  const attendanceEntries = (rosterQuery.data ?? [])
    .filter(worker => selectedWorkerIds.has(worker.id) || worker.attendanceId)
    .map(worker => ({ workerId: worker.id, attended: selectedWorkerIds.has(worker.id) ? 1 : 0 }));
  const hasDetailedAttendance = (rosterQuery.data ?? []).some(worker => worker.attendanceId);
  const useManualAttendeeTotal = !hasDetailedAttendance && selectedWorkerIds.size === 0;
  const visibleWorkers = (rosterQuery.data ?? []).filter(worker =>
    `${worker.name} ${worker.position} ${worker.department}`.toLowerCase().includes(workerSearch.toLowerCase()),
  );
  const suggestedDate = suggestedDateForFrequency(programYear, form.frequency);
  const field = (key: keyof TrainingForm, label: string, required = false, type = "text") => (
    <div className="space-y-1.5" key={key}>
      <Label>{label}{required ? " *" : ""}</Label>
      <Input type={type} min={type === "number" ? 0 : undefined} value={form[key]} onChange={e => update(key, e.target.value)} />
    </div>
  );
  const applyTemplate = (template: CapacitacionPredefinida) => {
    setForm(prev => ({
      ...prev,
      topic: template.nombre,
      description: template.contenidoMinimo.join("\n"),
      trainingCategory: categoryForTemplate(template),
      legalBasis: template.normativaBase,
      duration: String(template.duracionHoras),
      frequency: template.frecuencia,
      targetAudience: template.dirigidoA.join(", "),
      modality: template.modalidad.length === 1 ? template.modalidad[0] : prev.modality,
      isObligatory: template.obligatoria ? "1" : "0",
    }));
    setProposal(null);
  };
  const applyProposal = () => {
    if (proposal) setForm(prev => ({ ...prev, ...proposal }));
    setProposal(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "ejecucion" ? "Registrar ejecución" : editing ? "Editar actividad" : "Programar actividad"}</DialogTitle>
          <DialogDescription>
            {mode === "ejecucion" ? "Registra los resultados reales después de realizar la actividad." : "Elige una plantilla o prepara un borrador para revisar antes de guardar."}
          </DialogDescription>
        </DialogHeader>

        {editing && (
          <div className="flex gap-2">
            <Button type="button" variant={mode === "programacion" ? "default" : "outline"} onClick={() => onModeChange("programacion")}>Programación</Button>
            <Button type="button" variant={mode === "ejecucion" ? "default" : "outline"} onClick={() => onModeChange("ejecucion")}>Registrar ejecución</Button>
          </div>
        )}

        {mode === "programacion" ? (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center gap-2 font-medium"><Bot className="h-4 w-4 text-primary" />Asistente para preparar la actividad</div>
              <Select onValueChange={value => {
                const template = CAPACITACIONES_OBLIGATORIAS.find(item => item.codigo === value);
                if (template) applyTemplate(template);
              }}>
                <SelectTrigger><SelectValue placeholder="Precargar desde una capacitación del catálogo" /></SelectTrigger>
                <SelectContent>
                  {CAPACITACIONES_OBLIGATORIAS.map(item => <SelectItem key={item.codigo} value={item.codigo}>{item.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="space-y-2">
                <Label htmlFor="activity-assistant-request">O describe la actividad que necesitas</Label>
                <Textarea id="activity-assistant-request" value={request} maxLength={1200} onChange={e => setRequest(e.target.value)} placeholder="Ej.: capacitación sobre manipulación segura de cargas para el personal de bodega." />
                <Button type="button" variant="outline" disabled={!request.trim() || assistant.isPending} onClick={() => { setProposal(null); assistant.mutate(request.trim()); }}>
                  {assistant.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  {assistant.isPending ? "Preparando..." : "Preparar propuesta"}
                </Button>
              </div>
              {proposal && (
                <div className="rounded-md border bg-background p-3 space-y-2" role="status">
                  <p className="text-sm font-medium">Propuesta para revisar</p>
                  <p className="text-sm">{proposal.topic}</p>
                  <p className="text-xs text-muted-foreground">{proposal.description}</p>
                  <p className="text-xs">Categoría: {proposal.trainingCategory} · Población: {proposal.targetAudience}</p>
                  <Button type="button" size="sm" onClick={applyProposal}>Usar propuesta</Button>
                </div>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {field("topic", "Tema", true)}
              <div className="space-y-1.5">
                <Label>Categoría *</Label>
                <Select value={form.trainingCategory} onValueChange={value => update("trainingCategory", value)}>
                  <SelectTrigger><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger>
                  <SelectContent>
                    {!categoryOptions.includes(form.trainingCategory) && form.trainingCategory && <SelectItem value={form.trainingCategory}>{form.trainingCategory} · registro anterior</SelectItem>}
                    {categoryOptions.map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Fecha programada *</Label>
                <Input type="date" value={form.scheduledDate} onChange={e => update("scheduledDate", e.target.value)} />
                {suggestedDate ? <div className="flex items-center justify-between gap-2"><p className="text-xs text-muted-foreground">Sugerencia orientativa según la frecuencia; revísala con el calendario de la empresa.</p><Button type="button" size="sm" variant="outline" onClick={() => update("scheduledDate", suggestedDate)}>Sugerir {suggestedDate}</Button></div> : <p className="text-xs text-muted-foreground">Elige la fecha; no se asigna una fecha automática para una actividad única o un año pasado.</p>}
              </div>
              {field("scheduledTime", "Hora programada", false, "time")}
              {field("duration", "Duración (horas)", true, "number")}
              {field("instructor", "Instructor", true)}
              {field("responsible", "Responsable")}
              {field("targetAudience", "Población objetivo", true)}
              <div className="space-y-1.5">
                <Label>Asistentes estimados</Label>
                <Input type="number" min={0} value={form.estimatedAttendees} onChange={e => update("estimatedAttendees", e.target.value)} />
                <Button type="button" size="sm" variant="outline" disabled={!form.targetAudience.trim() || estimate.isPending} onClick={() => { setEstimateMessage(""); estimate.mutate(); }}>
                  {estimate.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Users className="h-4 w-4 mr-1" />}Calcular con trabajadores activos
                </Button>
                {estimateMessage && <p className="text-xs text-muted-foreground" role="status">{estimateMessage}</p>}
              </div>
              {field("location", "Lugar")}
              {field("legalBasis", "Fundamento legal")}
              <div className="space-y-1.5">
                <Label>Frecuencia</Label>
                <Select value={form.frequency} onValueChange={value => update("frequency", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["unica", "anual", "semestral", "trimestral", "mensual"].map(value => <SelectItem key={value} value={value}>{value === "unica" ? "Única vez" : value[0].toUpperCase() + value.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Modalidad</Label>
                <Select value={form.modality} onValueChange={value => update("modality", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["presencial", "virtual", "mixta"].map(value => <SelectItem key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Estado</Label>
                <Select value={form.status} onValueChange={value => update("status", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(statusLabels).filter(([value]) => value !== "completada").map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-6"><input id="training-obligatory" type="checkbox" checked={form.isObligatory === "1"} onChange={e => update("isObligatory", e.target.checked ? "1" : "0")} /><Label htmlFor="training-obligatory">Actividad obligatoria</Label></div>
              <div className="md:col-span-2 space-y-1.5"><Label>Descripción y contenido</Label><Textarea rows={4} value={form.description} onChange={e => update("description", e.target.value)} /></div>
              {field("attachmentUrl", "Enlace de material")}
              {field("materials", "Materiales planeados")}
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 py-3">
            {field("actualDate", "Fecha real", true, "date")}
            {field("actualTime", "Hora real", false, "time")}
            <div className="md:col-span-2 space-y-2 rounded-lg border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div><Label>Asistencia por trabajador</Label><p className="text-xs text-muted-foreground">Marca a quienes asistieron. El total se calcula desde la lista.</p></div>
                <Badge variant="secondary">{useManualAttendeeTotal ? `${form.actualAttendees || "0"} asistentes · total manual` : `${selectedWorkerIds.size} asistentes reales`}</Badge>
              </div>
              {useManualAttendeeTotal && <div className="space-y-1"><Label htmlFor="manual-actual-attendees">Total real si no vas a detallar la lista</Label><Input id="manual-actual-attendees" type="number" min={0} value={form.actualAttendees} onChange={e => update("actualAttendees", e.target.value)} /><p className="text-xs text-muted-foreground">Si marcas trabajadores, el total se calcula desde sus registros y reemplaza este valor.</p></div>}
              <Input value={workerSearch} onChange={e => setWorkerSearch(e.target.value)} placeholder="Buscar por nombre, cargo o área" />
              {rosterQuery.isLoading ? <p className="text-sm text-muted-foreground py-3">Cargando trabajadores...</p> : rosterQuery.isError ? <div className="py-3"><p className="text-sm text-destructive">No se pudo cargar la lista. No guardes la ejecución hasta volver a intentarlo.</p><Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => rosterQuery.refetch()}>Reintentar</Button></div> : visibleWorkers.length === 0 ? <p className="text-sm text-muted-foreground py-3">No hay trabajadores que coincidan con la búsqueda.</p> : (
                <div className="max-h-64 overflow-y-auto divide-y rounded-md border">
                  {visibleWorkers.map(worker => (
                    <label key={worker.id} className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/40">
                      <input type="checkbox" checked={selectedWorkerIds.has(worker.id)} onChange={e => setSelectedWorkerIds(previous => {
                        const next = new Set(previous);
                        if (e.target.checked) next.add(worker.id); else next.delete(worker.id);
                        return next;
                      })} />
                      <span className="min-w-0 flex-1"><span className="block font-medium truncate">{worker.name}</span><span className="block text-xs text-muted-foreground truncate">{worker.position} · {worker.department}{worker.active ? "" : " · Registro histórico"}</span></span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {field("evaluationScore", "Evaluación (0–100)", false, "number")}
            {field("evidenceUrl", "Enlace de evidencia")}
            {field("equipment", "Equipos utilizados")}
            <div className="md:col-span-2 space-y-1.5"><Label>Observaciones</Label><Textarea value={form.observations} onChange={e => update("observations", e.target.value)} /></div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="button" onClick={() => onSubmit(mode === "ejecucion" && rosterQuery.isSuccess ? attendanceEntries : undefined)} disabled={pending || (mode === "ejecucion" && !rosterQuery.isSuccess)}>{pending ? "Guardando..." : mode === "ejecucion" ? "Guardar ejecución" : editing ? "Guardar cambios" : "Programar actividad"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
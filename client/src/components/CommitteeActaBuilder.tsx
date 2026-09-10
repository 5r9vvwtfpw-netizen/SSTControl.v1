import { useEffect, useMemo, useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Loader2,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import type {
  CommitteeActaAgendaItem,
  CommitteeActaCommitment,
  CommitteeActaParticipant,
  CommitteeActaSigner,
  CommitteeActaEstado,
} from "@shared/schema";

export type CommitteeActaMember = {
  workerId: string;
  name: string;
  position?: string | null;
  representation?: string | null;
  role?: string | null;
  principal?: boolean;
  active?: boolean;
};

type Committee = "copasst" | "convivencia";

type Draft = {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  lugar: string;
  modalidad: "presencial" | "virtual" | "mixta";
  periodoComite: string;
  tipoReunion: string;
  participantes: CommitteeActaParticipant[];
  invitados: string[];
  ordenDia: CommitteeActaAgendaItem[];
  compromisos: CommitteeActaCommitment[];
  firmantes: CommitteeActaSigner[];
  proximaReunion: string;
  legacyNotes: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  committee: Committee;
  companyId: string;
  companyName?: string;
  periodLabel?: string;
  members: CommitteeActaMember[];
  acta?: any | null;
  onSaved?: () => void;
};

const meetingTypes = [
  { value: "ordinaria", label: "Ordinaria" },
  { value: "extraordinaria", label: "Extraordinaria" },
  { value: "constitucion", label: "Constitución" },
  { value: "eleccion", label: "Elección" },
  { value: "seguimiento", label: "Seguimiento" },
  { value: "investigacion", label: "Investigación o tratamiento de una situación" },
];

const commitmentTypes = [
  { value: "accion", label: "Acción" },
  { value: "recomendacion", label: "Recomendación" },
  { value: "solicitud", label: "Solicitud" },
  { value: "seguimiento", label: "Seguimiento" },
];

const attendanceOptions = [
  { value: "asistio", label: "Asistió" },
  { value: "no_asistio", label: "No asistió" },
  { value: "suplente", label: "Suplente que reemplazó" },
  { value: "invitado", label: "Asistió como invitado" },
];

const statusOptions: Array<{ value: CommitteeActaEstado; label: string }> = [
  { value: "borrador", label: "Borrador" },
  { value: "pendiente_firmas", label: "Pendiente de firma física" },
  { value: "parcialmente_firmada", label: "Parcialmente firmada" },
  { value: "firmada", label: "Firmada físicamente" },
  { value: "cerrada", label: "Cerrada" },
  { value: "anulada", label: "Anulada" },
];

const defaultAgenda = (committee: Committee): CommitteeActaAgendaItem[] => [
  { id: makeId(), title: "Verificación de asistencia y quórum", notes: "" },
  { id: makeId(), title: "Lectura y aprobación del acta anterior", notes: "" },
  { id: makeId(), title: "Revisión de compromisos pendientes", notes: "" },
  {
    id: makeId(),
    title: committee === "copasst" ? "Temas de Seguridad y Salud en el Trabajo" : "Temas de convivencia laboral",
    notes: "",
  },
  { id: makeId(), title: "Proposiciones y varios", notes: "" },
  { id: makeId(), title: "Definición de compromisos", notes: "" },
  { id: makeId(), title: "Lectura y aprobación del acta", notes: "" },
  { id: makeId(), title: "Cierre", notes: "" },
];

function makeId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function buildInitialDraft(
  committee: Committee,
  members: CommitteeActaMember[],
  periodLabel?: string,
  acta?: any | null,
): Draft {
  const oldParticipants = asArray<CommitteeActaParticipant>(acta?.participantes);
  const participants = members.filter((member) => member.active !== false).map((member) => {
    const previous = oldParticipants.find((item) => item.workerId === member.workerId || item.name === member.name);
    return {
      workerId: member.workerId,
      name: member.name,
      position: member.position || "",
      representation: member.representation || "",
      role: member.role || "",
      attendance: previous?.attendance || "no_asistio",
    } satisfies CommitteeActaParticipant;
  });

  const oldCommitments = asArray<CommitteeActaCommitment>(acta?.compromisos);
  const commitments = oldCommitments.length
    ? oldCommitments
    : asArray<string>(acta?.acuerdos).map((description) => ({
      id: makeId(),
      description,
      responsible: "",
      dueDate: "",
      type: "accion" as const,
      status: "pendiente" as const,
      evidence: "",
    }));

  const oldAgenda = asArray<CommitteeActaAgendaItem>(acta?.ordenDia);
  const oldType = acta?.tipoReunion || (acta?.tipo === "sesion" ? "ordinaria" : acta?.tipo) || "ordinaria";
  const oldSigners = asArray<CommitteeActaSigner>(acta?.firmantes);
  const oldFirmas = asArray<CommitteeActaSigner>(acta?.firmas);

  return {
    fecha: acta?.fecha || today(),
    horaInicio: acta?.horaInicio || "",
    horaFin: acta?.horaFin || "",
    lugar: acta?.lugar || "",
    modalidad: acta?.modalidad === "virtual" || acta?.modalidad === "mixta" ? acta.modalidad : "presencial",
    periodoComite: acta?.periodoComite || periodLabel || "",
    tipoReunion: oldType,
    participantes: participants,
    invitados: asArray<string>(acta?.invitados),
    ordenDia: oldAgenda.length ? oldAgenda : defaultAgenda(committee),
    compromisos: commitments,
    firmantes: oldSigners.length ? oldSigners : oldFirmas,
    proximaReunion: acta?.proximaReunion || "",
    legacyNotes: acta?.notas || acta?.contenido || "",
  };
}

function typeLabel(type: string) {
  return meetingTypes.find((item) => item.value === type)?.label || type;
}

function formalText(draft: Draft, committee: Committee, companyName: string) {
  const present = draft.participantes.filter((item) => item.attendance !== "no_asistio");
  const quorum = present.length > 0 ? "se verificó la asistencia de los participantes registrados." : "la asistencia quedó pendiente de verificación.";
  const date = draft.fecha ? new Date(`${draft.fecha}T12:00:00`).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" }) : "la fecha indicada";
  const committeeName = committee === "copasst"
    ? "Comité Paritario de Seguridad y Salud en el Trabajo — COPASST"
    : "Comité de Convivencia Laboral";
  const opening = `En ${draft.lugar || "el lugar registrado"}, siendo las ${draft.horaInicio || "hora no indicada"} del ${date}, se reunieron los integrantes del ${committeeName} de ${companyName || "la empresa"}, en modalidad ${draft.modalidad}, con el propósito de realizar la reunión ${typeLabel(draft.tipoReunion).toLowerCase()}${draft.periodoComite ? ` correspondiente al período ${draft.periodoComite}` : ""}. ${quorum}`;
  const agenda = draft.ordenDia.map((item, index) => `${index + 1}. ${item.title}`).join("\n");
  const development = draft.ordenDia
    .filter((item) => item.notes.trim())
    .map((item, index) => `${index + 1}. ${item.title}\n${item.notes.trim()}`)
    .join("\n\n");
  const commitments = draft.compromisos.length
    ? draft.compromisos.map((item, index) => `${index + 1}. ${item.description}${item.responsible ? ` — Responsable: ${item.responsible}` : ""}${item.dueDate ? ` — Fecha límite: ${item.dueDate}` : ""}`).join("\n")
    : "No se registraron compromisos nuevos.";
  const close = `No existiendo otros asuntos por tratar, se dio por finalizada la reunión${draft.horaFin ? ` a las ${draft.horaFin}` : ""}. Los participantes manifiestan que el contenido del acta corresponde a lo tratado y acordado durante la sesión.`;
  const signatureMessage = `CONSTANCIA DE FIRMA FÍSICA
El presente documento se imprime para firma física de los integrantes seleccionados del comité. La relación de firmantes corresponde a los miembros vigentes registrados, incluidos los representantes elegidos por votación.`;
  return [
    opening,
    "",
    "ORDEN DEL DÍA",
    agenda || "No se registraron puntos.",
    "",
    "DESARROLLO",
    development || draft.legacyNotes || "No se registró desarrollo adicional.",
    "",
    "ACUERDOS Y COMPROMISOS",
    commitments,
    "",
    signatureMessage,
    "",
    close,
  ].join("\n");
}

export function CommitteeActaBuilder({
  open,
  onOpenChange,
  committee,
  companyId,
  companyName = "",
  periodLabel,
  members,
  acta,
  onSaved,
}: Props) {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(() => buildInitialDraft(committee, members, periodLabel, acta));
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<CommitteeActaEstado>("borrador");
  const [invitedText, setInvitedText] = useState("");

  useEffect(() => {
    if (open) {
      setStep(0);
      const next = buildInitialDraft(committee, members, periodLabel, acta);
      setDraft(next);
      setInvitedText(next.invitados.join(", "));
      setSaveStatus((acta?.estado as CommitteeActaEstado) || "borrador");
    }
  }, [open, committee, periodLabel, acta, members]);

  const selectedParticipants = useMemo(
    () => draft.participantes.filter((participant) => participant.attendance !== "no_asistio"),
    [draft.participantes],
  );

  const quorumLabel = selectedParticipants.length > 0
    ? `${selectedParticipants.length} participante(s) registrado(s)`
    : "Sin asistencia registrada";

  const updateDraft = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const updateAgenda = (id: string, patch: Partial<CommitteeActaAgendaItem>) =>
    updateDraft("ordenDia", draft.ordenDia.map((item) => item.id === id ? { ...item, ...patch } : item));

  const updateCommitment = (id: string, patch: Partial<CommitteeActaCommitment>) =>
    updateDraft("compromisos", draft.compromisos.map((item) => item.id === id ? { ...item, ...patch } : item));

  const updateParticipant = (workerId: string, attendance: CommitteeActaParticipant["attendance"]) =>
    updateDraft("participantes", draft.participantes.map((item) => item.workerId === workerId ? { ...item, attendance } : item));

  const updateSigners = (workerId: string, checked: boolean) => {
    const participant = draft.participantes.find((item) => item.workerId === workerId);
    if (!participant) return;
    const current = draft.firmantes.filter((item) => item.workerId !== workerId);
    updateDraft("firmantes", checked ? [...current, {
      workerId: participant.workerId,
      name: participant.name,
      position: participant.position,
      role: participant.role,
      signed: false,
    }] : current);
  };

  const updateSignerSigned = (workerId: string, signed: boolean) => {
    updateDraft("firmantes", draft.firmantes.map((signer) => (
      signer.workerId === workerId ? { ...signer, signed } : signer
    )));
  };

  const validateStep = () => {
    if (step === 0 && (!draft.fecha || !draft.tipoReunion)) {
      toast({ variant: "destructive", title: "Completa la información de la reunión", description: "La fecha y el tipo de reunión son obligatorios." });
      return false;
    }
    if (step === 1 && selectedParticipants.length === 0) {
      toast({ variant: "destructive", title: "Registra la asistencia", description: "Marca al menos un participante como asistente o suplente." });
      return false;
    }
    if (step === 2 && draft.ordenDia.length === 0) {
      toast({ variant: "destructive", title: "Agrega el orden del día", description: "El acta debe tener al menos un punto." });
      return false;
    }
    if (step === 5 && draft.firmantes.length === 0) {
      toast({ variant: "destructive", title: "Selecciona firmantes", description: "Elige al menos un miembro de la reunión para firmar el acta." });
      return false;
    }
    return true;
  };

  const handleSave = async (status: CommitteeActaEstado) => {
    if (!validateStep() && step !== 6) return;
    if (status === "firmada" && draft.firmantes.some((signer) => !signer.signed)) {
      toast({
        variant: "destructive",
        title: "Faltan firmas físicas",
        description: "Marca la firma física recibida para cada firmante antes de cerrar el acta como firmada.",
      });
      return;
    }
    setSaving(true);
    try {
      const content = formalText(draft, committee, companyName);
      const selectedPresident = draft.firmantes.find((item) => (item.role || "").toLowerCase().includes("presidente"));
      const selectedSecretary = draft.firmantes.find((item) => (item.role || "").toLowerCase().includes("secret"));
      const payload = committee === "copasst"
        ? {
          fecha: draft.fecha,
          notas: content,
          horaInicio: draft.horaInicio || null,
          horaFin: draft.horaFin || null,
          lugar: draft.lugar || null,
          modalidad: draft.modalidad,
          periodoComite: draft.periodoComite || null,
          tipoReunion: draft.tipoReunion,
          participantes: draft.participantes,
          invitados: draft.invitados,
          ordenDia: draft.ordenDia,
          compromisos: draft.compromisos,
          firmantes: draft.firmantes,
          proximaReunion: draft.proximaReunion || null,
          estado: status,
          presidenteWorkerId: selectedPresident?.workerId || null,
          presidente: selectedPresident?.name || null,
          secretariaWorkerId: selectedSecretary?.workerId || null,
          secretaria: selectedSecretary?.name || null,
        }
        : {
          companyId,
          tipo: "sesion",
          fecha: draft.fecha,
          asunto: `${typeLabel(draft.tipoReunion)} del Comité de Convivencia`,
          contenido: content,
          asistentes: selectedParticipants.map((participant) => participant.name),
          acuerdos: draft.compromisos.map((item) => item.description),
          observaciones: draft.legacyNotes || null,
          firmas: draft.firmantes,
          horaInicio: draft.horaInicio || null,
          horaFin: draft.horaFin || null,
          lugar: draft.lugar || null,
          modalidad: draft.modalidad,
          periodoComite: draft.periodoComite || null,
          tipoReunion: draft.tipoReunion,
          participantes: draft.participantes,
          invitados: draft.invitados,
          ordenDia: draft.ordenDia,
          compromisos: draft.compromisos,
          firmantes: draft.firmantes,
          proximaReunion: draft.proximaReunion || null,
          estado: status,
        };

      const path = committee === "copasst"
        ? (acta ? `/api/copasst-actas/${acta.id}` : "/api/copasst-actas")
        : (acta ? `/api/convivencia-actas/${acta.id}` : "/api/convivencia-actas");
      const method = acta ? "PATCH" : "POST";
      await apiRequest(method, path, payload);
      await queryClient.invalidateQueries({ queryKey: [committee === "copasst" ? "/api/copasst-actas" : "/api/convivencia-actas", companyId] });
      toast({
        title: acta ? "Acta actualizada" : "Acta creada",
        description: status === "pendiente_firmas"
          ? "Quedó preparada para imprimir y recoger las firmas físicas."
          : status === "firmada"
            ? "Se registró como firmada físicamente."
            : "El acta fue guardada.",
      });
      onOpenChange(false);
      onSaved?.();
    } catch (error: any) {
      toast({ variant: "destructive", title: "No se pudo guardar el acta", description: error?.message || "Verifica los datos e intenta nuevamente." });
    } finally {
      setSaving(false);
    }
  };

  const steps = ["Reunión", "Participantes", "Orden del día", "Lo tratado", "Compromisos", "Firmantes", "Vista previa"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{acta ? "Editar acta guiada" : "Nueva acta guiada"} — {committee === "copasst" ? "COPASST" : "Convivencia"}</DialogTitle>
          <DialogDescription>
            Registra los hechos de la reunión. El sistema construye el acta formal; este flujo no usa el Portal de Empleados.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 border-b pb-3">
          {steps.map((label, index) => (
            <Button key={label} type="button" size="sm" variant={step === index ? "default" : "outline"} onClick={() => index <= step && setStep(index)}>
              <span className="mr-1">{index + 1}.</span>{label}
            </Button>
          ))}
        </div>

        {step === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3">
            <label className="space-y-1 text-sm">Fecha *
              <Input type="date" value={draft.fecha} onChange={(event) => updateDraft("fecha", event.target.value)} />
            </label>
            <label className="space-y-1 text-sm">Tipo de reunión *
              <Select value={draft.tipoReunion} onValueChange={(value) => updateDraft("tipoReunion", value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{meetingTypes.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
              </Select>
            </label>
            <label className="space-y-1 text-sm">Hora de inicio
              <Input type="time" value={draft.horaInicio} onChange={(event) => updateDraft("horaInicio", event.target.value)} />
            </label>
            <label className="space-y-1 text-sm">Hora de finalización
              <Input type="time" value={draft.horaFin} onChange={(event) => updateDraft("horaFin", event.target.value)} />
            </label>
            <label className="space-y-1 text-sm">Lugar o modalidad física
              <Input value={draft.lugar} onChange={(event) => updateDraft("lugar", event.target.value)} placeholder="Sala, sede o enlace" />
            </label>
            <label className="space-y-1 text-sm">Modalidad
              <Select value={draft.modalidad} onValueChange={(value: Draft["modalidad"]) => updateDraft("modalidad", value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="presencial">Presencial</SelectItem>
                  <SelectItem value="virtual">Virtual</SelectItem>
                  <SelectItem value="mixta">Mixta</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-1 text-sm">Período del comité
              <Input value={draft.periodoComite} onChange={(event) => updateDraft("periodoComite", event.target.value)} placeholder="Ej. 2026-2027" />
            </label>
            <label className="space-y-1 text-sm">Próxima reunión
              <Input type="date" value={draft.proximaReunion} onChange={(event) => updateDraft("proximaReunion", event.target.value)} />
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><Users className="h-4 w-4" /><span className="font-medium">Miembros vigentes</span><Badge variant="outline">{quorumLabel}</Badge></div>
              <Button type="button" variant="outline" size="sm" onClick={() => updateDraft("participantes", draft.participantes.map((item): CommitteeActaParticipant => ({ ...item, attendance: "asistio" })))}>Marcar todos asistentes</Button>
            </div>
            {draft.participantes.length === 0 ? <p className="text-sm text-muted-foreground">No hay miembros vigentes cargados para este comité.</p> : (
              <div className="space-y-2">
                {draft.participantes.map((participant) => (
                  <div key={participant.workerId || participant.name} className="grid grid-cols-1 md:grid-cols-[1fr_240px] items-center gap-2 border rounded-md p-3">
                    <div><p className="font-medium">{participant.name}</p><p className="text-xs text-muted-foreground">{participant.position || "Sin cargo"} · {participant.representation || "Comité"} · {participant.role || "Miembro"}</p></div>
                    <Select value={participant.attendance} onValueChange={(value: CommitteeActaParticipant["attendance"]) => updateParticipant(participant.workerId || participant.name, value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{attendanceOptions.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}
            <label className="space-y-1 text-sm block">Invitados externos
              <Input value={invitedText} onChange={(event) => { setInvitedText(event.target.value); updateDraft("invitados", event.target.value.split(",").map((value) => value.trim()).filter(Boolean)); }} placeholder="Separados por coma" />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 py-3">
            <p className="text-sm text-muted-foreground">Puedes editar, eliminar y agregar puntos. El contenido de cada punto se diligencia en el paso siguiente.</p>
            {draft.ordenDia.map((item, index) => (
              <div key={item.id} className="flex gap-2 items-start">
                <Badge variant="outline" className="mt-2">{index + 1}</Badge>
                <Input className="flex-1" value={item.title} onChange={(event) => updateAgenda(item.id, { title: event.target.value })} />
                <Button type="button" variant="ghost" size="icon" onClick={() => updateDraft("ordenDia", draft.ordenDia.filter((candidate) => candidate.id !== item.id))}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => updateDraft("ordenDia", [...draft.ordenDia, { id: makeId(), title: "Nuevo punto", notes: "" }])}><Plus className="h-4 w-4 mr-2" />Agregar punto</Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 py-3">
            {draft.ordenDia.map((item, index) => (
              <div key={item.id} className="space-y-1">
                <label className="text-sm font-medium">{index + 1}. {item.title}</label>
                <Textarea value={item.notes} onChange={(event) => updateAgenda(item.id, { notes: event.target.value })} placeholder="Escribe únicamente lo ocurrido en este punto." rows={3} />
              </div>
            ))}
            <div className="space-y-1">
              <label className="text-sm font-medium">Notas adicionales o antecedentes</label>
              <Textarea value={draft.legacyNotes} onChange={(event) => updateDraft("legacyNotes", event.target.value)} placeholder="Información adicional que deba conservarse en el acta." rows={4} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 py-3">
            <p className="text-sm text-muted-foreground">Cada compromiso queda disponible para seguimiento en futuras reuniones.</p>
            {draft.compromisos.map((item, index) => (
              <div key={item.id} className="border rounded-md p-3 space-y-3">
                <div className="flex justify-between items-center"><Badge variant="outline">Compromiso {index + 1}</Badge><Button type="button" variant="ghost" size="icon" onClick={() => updateDraft("compromisos", draft.compromisos.filter((candidate) => candidate.id !== item.id))}><Trash2 className="h-4 w-4" /></Button></div>
                <Textarea value={item.description} onChange={(event) => updateCommitment(item.id, { description: event.target.value })} placeholder="Descripción del compromiso" rows={2} />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <Input value={item.responsible} onChange={(event) => updateCommitment(item.id, { responsible: event.target.value })} placeholder="Responsable" />
                  <Input type="date" value={item.dueDate || ""} onChange={(event) => updateCommitment(item.id, { dueDate: event.target.value })} />
                  <Select value={item.type} onValueChange={(value: CommitteeActaCommitment["type"]) => updateCommitment(item.id, { type: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{commitmentTypes.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>
                  <Input value={item.evidence || ""} onChange={(event) => updateCommitment(item.id, { evidence: event.target.value })} placeholder="Evidencia esperada" />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => updateDraft("compromisos", [...draft.compromisos, { id: makeId(), description: "", responsible: "", dueDate: "", type: "accion", status: "pendiente", evidence: "" }])}><Plus className="h-4 w-4 mr-2" />Agregar compromiso</Button>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4 py-3">
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
              <p className="font-semibold">Firma física del acta</p>
              <p className="mt-1">El acta se imprime y se firma físicamente. Selecciona a los integrantes vigentes del comité que deben firmarla; esta lista incluye los representantes elegidos por votación.</p>
            </div>
            <div className="space-y-2">
              {selectedParticipants.map((participant) => {
                const checked = draft.firmantes.some((signer) => signer.workerId === participant.workerId);
                const signer = draft.firmantes.find((item) => item.workerId === participant.workerId);
                return (
                  <div key={participant.workerId || participant.name} className="border rounded-md p-3 space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Checkbox checked={checked} onCheckedChange={(value) => updateSigners(participant.workerId || participant.name, Boolean(value))} />
                      <span>
                        <span className="font-medium block">{participant.name}</span>
                        <span className="text-xs text-muted-foreground">{participant.position || "Sin cargo"} · {participant.role || "Miembro"}</span>
                      </span>
                    </label>
                    {checked && (
                      <label className="ml-7 flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                        <Checkbox checked={Boolean(signer?.signed)} onCheckedChange={(value) => updateSignerSigned(participant.workerId || participant.name, Boolean(value))} />
                        Firma física recibida
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4 py-3">
            <div className="flex items-center gap-2"><FileText className="h-5 w-5" /><h3 className="font-semibold">Vista previa del acta</h3></div>
            <pre className="whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-sm leading-6 max-h-[420px] overflow-y-auto">{formalText(draft, committee, companyName)}</pre>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="md:col-span-2">
                <span className="text-muted-foreground">Estado del acta</span>
                <Select value={saveStatus} onValueChange={(value) => setSaveStatus(value as CommitteeActaEstado)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><span className="text-muted-foreground">Asistencia</span><p className="font-medium">{quorumLabel}</p></div>
              <div><span className="text-muted-foreground">Firmantes</span><p className="font-medium">{draft.firmantes.length}</p></div>
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
          <div className="flex gap-2">
            <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep((current) => current - 1)}><ArrowLeft className="h-4 w-4 mr-2" />Anterior</Button>
            {step < 6 && <Button type="button" onClick={() => { if (validateStep()) setStep((current) => current + 1); }}>Siguiente<ArrowRight className="h-4 w-4 ml-2" /></Button>}
          </div>
          {step === 6 && <div className="flex gap-2">
            <Button type="button" variant="outline" disabled={saving} onClick={() => handleSave(saveStatus)}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Guardar estado</Button>
            <Button type="button" disabled={saving} onClick={() => handleSave("pendiente_firmas")}>{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}Preparar para firma física</Button>
          </div>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
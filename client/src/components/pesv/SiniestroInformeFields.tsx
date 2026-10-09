import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ActaComitePesv } from "@shared/schema";

type ActaOption = Pick<ActaComitePesv, "id" | "numeroActa" | "fechaReunion" | "temasOrdenDia">;

export type SiniestroInformeFieldValues = {
  fatalities: number | string | null;
  severeInjuries: number | string | null;
  minorInjuries: number | string | null;
  simpleCollisionPeople: number | string | null;
  policeReport: string | null;
  ipatAuthorityName: string | null;
  committeeActaId: string | null;
};

interface SiniestroInformeFieldsProps {
  values: SiniestroInformeFieldValues;
  actas: ActaOption[];
  onChange: (field: keyof SiniestroInformeFieldValues, value: string) => void;
}

function formatMeetingDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("es-CO");
}

export function SiniestroInformeFields({ values, actas, onChange }: SiniestroInformeFieldsProps) {
  const selectedActa = actas.find((acta) => acta.id === values.committeeActaId);

  const countField = (
    field: "fatalities" | "severeInjuries" | "minorInjuries" | "simpleCollisionPeople",
    label: string,
  ) => (
    <div className="space-y-2">
      <Label htmlFor={`siniestro-${field}`}>{label} *</Label>
      <Input
        id={`siniestro-${field}`}
        type="number"
        min="0"
        step="1"
        required
        value={values[field] ?? ""}
        onChange={(event) => onChange(field, event.target.value)}
        data-testid={`input-${field}`}
      />
    </div>
  );

  return (
    <section className="col-span-2 space-y-4 rounded-md border p-4" aria-labelledby="siniestro-report-fields-title">
      <div>
        <h3 id="siniestro-report-fields-title" className="font-semibold">Datos para el informe de siniestros</h3>
        <p className="text-sm text-muted-foreground">
          Registre 0 cuando no haya personas en una categoría. Los valores se informan por separado.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {countField("fatalities", "Fatalidad: personas fallecidas")}
        {countField("severeInjuries", "Heridos graves: número de personas")}
        {countField("minorInjuries", "Heridos leves: número de personas")}
        {countField("simpleCollisionPeople", "Choque simple: personas implicadas")}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="siniestro-police-report">Consecutivo del IPAT en RNAT/RUNT</Label>
          <Input
            id="siniestro-police-report"
            value={values.policeReport ?? ""}
            onChange={(event) => onChange("policeReport", event.target.value)}
            placeholder="Consecutivo o “No elaborado”"
            data-testid="input-police-report"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="siniestro-ipat-authority">Organismo de tránsito o autoridad que elaboró el IPAT</Label>
          <Input
            id="siniestro-ipat-authority"
            value={values.ipatAuthorityName ?? ""}
            onChange={(event) => onChange("ipatAuthorityName", event.target.value)}
            placeholder="Nombre de la autoridad o “No aplica”"
            data-testid="input-ipat-authority"
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="siniestro-committee-acta">Acta del comité donde se analizó el siniestro</Label>
          <Select
            value={values.committeeActaId || ""}
            onValueChange={(value) => onChange("committeeActaId", value)}
          >
            <SelectTrigger id="siniestro-committee-acta" data-testid="select-committee-acta">
              <SelectValue placeholder="Seleccionar acta existente" />
            </SelectTrigger>
            <SelectContent>
              {actas.map((acta) => (
                <SelectItem key={acta.id} value={acta.id}>
                  Acta {acta.numeroActa} · {formatMeetingDate(acta.fechaReunion)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            El informe tomará el número y la fecha directamente del acta seleccionada.
            {selectedActa ? ` Fecha que se incluirá: ${formatMeetingDate(selectedActa.fechaReunion)}.` : ""}
            {actas.length === 0 ? " Registre primero el acta en el módulo Comité PESV." : ""}
          </p>
        </div>
      </div>
    </section>
  );
}

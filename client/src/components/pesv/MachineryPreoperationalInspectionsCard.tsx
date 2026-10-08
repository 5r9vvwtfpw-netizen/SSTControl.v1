import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Eye, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCompanyContext } from "@/hooks/use-company-context";
import { apiRequest } from "@/lib/queryClient";
import { openCompanyDocument } from "@/lib/company-context-url";
import {
  MAQUINARIA_CHECKLIST,
  type MaquinariaChecklistKey,
  type MaquinariaInspectionAnswer,
} from "@shared/pesv-maquinaria-checklist";

type MachineryInspection = {
  id: string;
  inspection_date: string;
  plate: string | null;
  serial_number: string | null;
  machinery_type: string | null;
  worker_name: string;
  shift: string;
  engine_hours: number | string;
  result: string;
  work_front: string | null;
  observations: string | null;
  evidence_urls: string[] | null;
  answers: Partial<Record<MaquinariaChecklistKey, MaquinariaInspectionAnswer>> | null;
};

export function MachineryPreoperationalInspectionsCard() {
  const { effectiveCompanyId } = useCompanyContext();
  const [selectedInspection, setSelectedInspection] = useState<MachineryInspection | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { data: inspections = [], isLoading } = useQuery<MachineryInspection[]>({
    queryKey: ["/api/portal/admin/inspecciones-maquinaria", effectiveCompanyId || "sin-empresa"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/portal/admin/inspecciones-maquinaria");
      const body = await response.json();
      return body.inspecciones || [];
    },
    enabled: !!effectiveCompanyId,
  });

  const openPdf = (inspection: MachineryInspection) => {
    openCompanyDocument(
      `/api/portal/admin/inspecciones-maquinaria/${inspection.id}/pdf`,
      effectiveCompanyId,
    );
  };

  return (
    <>
    <Card data-testid="card-machinery-preoperational-inspections">
      <CardHeader>
        <CardTitle className="text-lg">Inspecciones preoperacionales de maquinaria</CardTitle>
        <CardDescription>
          Registros del paso H06 enviados por trabajadores desde el Portal de Empleados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando inspecciones preoperacionales...</p>
        ) : inspections.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay inspecciones preoperacionales de maquinaria registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Trabajador</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Horómetro</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inspections.slice(0, 200).map((inspection) => (
                  <TableRow key={inspection.id}>
                    <TableCell>{String(inspection.inspection_date).slice(0, 10)}</TableCell>
                    <TableCell>{inspection.plate || inspection.serial_number || "Sin identificación"}</TableCell>
                    <TableCell>{inspection.worker_name}</TableCell>
                    <TableCell>{inspection.shift}</TableCell>
                    <TableCell>{inspection.engine_hours} h</TableCell>
                    <TableCell>
                      <Badge variant={inspection.result === "apta" ? "default" : "destructive"}>
                        {inspection.result === "apta" ? "APTA" : "NO APTA"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="Ver detalle"
                          aria-label="Ver detalle de la inspección de maquinaria"
                          data-testid={`button-view-machinery-inspection-${inspection.id}`}
                          onClick={() => {
                            setSelectedInspection(inspection);
                            setDetailOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="Descargar informe PDF"
                          aria-label="Descargar informe PDF de la inspección de maquinaria"
                          data-testid={`button-pdf-machinery-inspection-${inspection.id}`}
                          onClick={() => openPdf(inspection)}
                        >
                          <FileDown className="h-4 w-4 text-blue-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
    <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle de inspección preoperacional de maquinaria</DialogTitle>
          <DialogDescription>
            Registro diligenciado por el trabajador desde el Portal de Empleados.
          </DialogDescription>
        </DialogHeader>
        {selectedInspection && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
              <div>
                <p className="font-semibold">
                  {selectedInspection.plate || selectedInspection.serial_number || "Equipo sin identificación"}
                  {selectedInspection.machinery_type ? ` · ${selectedInspection.machinery_type}` : ""}
                </p>
                <p className="text-sm text-muted-foreground">
                  {String(selectedInspection.inspection_date).slice(0, 10)} · {selectedInspection.shift}
                </p>
              </div>
              <Badge variant={selectedInspection.result === "apta" ? "default" : "destructive"}>
                {selectedInspection.result === "apta" ? "APTA" : "NO APTA"}
              </Badge>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Trabajador</p>
                <p className="font-medium">{selectedInspection.worker_name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Horómetro</p>
                <p className="font-medium">{String(selectedInspection.engine_hours)} h</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Frente de trabajo</p>
                <p className="font-medium">{selectedInspection.work_front || "No especificado"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Evidencias adjuntas</p>
                <p className="font-medium">{selectedInspection.evidence_urls?.length || 0}</p>
              </div>
            </div>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Lista de chequeo</h3>
              <div className="space-y-2">
                {MAQUINARIA_CHECKLIST.map(([key, label]) => {
                  const answer = selectedInspection.answers?.[key];
                  const value = answer?.value;
                  const answerLabel = value === "conforme"
                    ? "Conforme"
                    : value === "falla"
                      ? "Falla"
                      : value === "no_aplica"
                        ? "No aplica"
                        : "Sin respuesta";
                  return (
                    <div key={key} className="rounded-md border p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm">{label}</span>
                        <Badge variant={value === "falla" ? "destructive" : value === "conforme" ? "default" : "secondary"}>
                          {answerLabel}
                        </Badge>
                      </div>
                      {answer?.comment && (
                        <p className="mt-2 text-sm text-muted-foreground">{answer.comment}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {selectedInspection.observations && (
              <div className="space-y-1 rounded-md border p-3">
                <h3 className="text-sm font-semibold">Observaciones</h3>
                <p className="text-sm whitespace-pre-wrap">{selectedInspection.observations}</p>
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setDetailOpen(false)}>Cerrar</Button>
          {selectedInspection && (
            <Button onClick={() => openPdf(selectedInspection)}>
              <FileDown className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCompanyContext } from "@/hooks/use-company-context";
import { apiRequest } from "@/lib/queryClient";

type MachineryInspection = {
  id: string;
  inspection_date: string;
  plate: string | null;
  serial_number: string | null;
  worker_name: string;
  shift: string;
  engine_hours: number;
  result: string;
};

export function MachineryPreoperationalInspectionsCard() {
  const { effectiveCompanyId } = useCompanyContext();
  const { data: inspections = [], isLoading } = useQuery<MachineryInspection[]>({
    queryKey: ["/api/portal/admin/inspecciones-maquinaria", effectiveCompanyId || "sin-empresa"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/portal/admin/inspecciones-maquinaria");
      const body = await response.json();
      return body.inspecciones || [];
    },
    enabled: !!effectiveCompanyId,
  });

  return (
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
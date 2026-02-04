/**
 * COMPONENTE: Resumen de Capacitaciones PESV para mostrar en SST
 * Muestra las capacitaciones de seguridad vial del módulo PESV
 * con indicador de origen para trazabilidad
 * 
 * PRINCIPIO: Solo agregar código nuevo, no modificar existente
 * NORMATIVA: Decreto 1072/2015 Art. 2.2.4.6.11 + Res. 40595/2022 Paso 10
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { Car, ExternalLink, Calendar, Users, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Link } from "wouter";

interface RoadSafetyTraining {
  id: string;
  title: string;
  trainingDate: string;
  instructor: string | null;
  totalAttendees: number;
  status: string;
}

export function CapacitacionesPesvResumen() {
  const { data: trainings = [], isLoading } = useQuery<RoadSafetyTraining[]>({
    queryKey: ["/api/road-safety-trainings"],
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle2 }> = {
      programada: { label: "Programada", variant: "outline", icon: Clock },
      "en-curso": { label: "En Curso", variant: "secondary", icon: AlertCircle },
      completada: { label: "Completada", variant: "default", icon: CheckCircle2 },
      cancelada: { label: "Cancelada", variant: "destructive", icon: AlertCircle },
    };
    const config = statusConfig[status] || statusConfig.programada;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-muted-foreground">
            Cargando capacitaciones PESV...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (trainings.length === 0) {
    return null;
  }

  return (
    <Card className="border-green-200 dark:border-green-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">Capacitaciones PESV</CardTitle>
            <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300">
              Seguridad Vial
            </Badge>
          </div>
          <Link href="/pesv/capacitaciones">
            <Button variant="outline" size="sm" className="gap-1" data-testid="link-ver-todas-pesv">
              Ver todas
              <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        </div>
        <CardDescription>
          Capacitaciones de seguridad vial registradas en el módulo PESV (Res. 40595/2022)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Capacitación</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead className="text-center">Asistentes</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Origen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainings.slice(0, 5).map((training) => (
              <TableRow key={training.id}>
                <TableCell className="font-medium">{training.title}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(training.trainingDate)}
                  </div>
                </TableCell>
                <TableCell>{training.instructor || '-'}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    {training.totalAttendees}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(training.status)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 gap-1">
                    <Car className="h-3 w-3" />
                    PESV
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {trainings.length > 5 && (
          <div className="mt-3 text-center">
            <Link href="/pesv/capacitaciones">
              <Button variant="ghost" size="sm" className="text-green-600">
                Ver {trainings.length - 5} capacitaciones más →
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

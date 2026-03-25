import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { CompanySede } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Plus, Pencil, Trash2, MapPin, Phone, Mail, Users, Star } from "lucide-react";

const sedeFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  city: z.string().optional(),
  address: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  isMain: z.number().default(0),
  status: z.string().default("activa"),
});

type SedeFormValues = z.infer<typeof sedeFormSchema>;

type SedeWithCount = CompanySede & { workerCount: number };

export default function CompanySedes() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSede, setEditingSede] = useState<SedeWithCount | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: sedes = [], isLoading } = useQuery<SedeWithCount[]>({
    queryKey: ["/api/company-sedes"],
  });

  const form = useForm<SedeFormValues>({
    resolver: zodResolver(sedeFormSchema),
    defaultValues: {
      name: "",
      city: "",
      address: "",
      contactPhone: "",
      contactEmail: "",
      isMain: 0,
      status: "activa",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: SedeFormValues) => apiRequest("POST", "/api/company-sedes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-sedes"] });
      toast({ title: "Sede creada correctamente" });
      closeDialog();
    },
    onError: (error: any) => {
      toast({ title: "Error al crear sede", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: SedeFormValues) =>
      apiRequest("PATCH", `/api/company-sedes/${editingSede?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-sedes"] });
      toast({ title: "Sede actualizada correctamente" });
      closeDialog();
    },
    onError: (error: any) => {
      toast({ title: "Error al actualizar", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/company-sedes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-sedes"] });
      toast({ title: "Sede eliminada" });
    },
    onError: (error: any) => {
      toast({ title: "No se puede eliminar", description: error.message, variant: "destructive" });
    },
  });

  function closeDialog() {
    setDialogOpen(false);
    setEditingSede(null);
    form.reset({ name: "", city: "", address: "", contactPhone: "", contactEmail: "", isMain: 0, status: "activa" });
  }

  function openCreate() {
    setEditingSede(null);
    form.reset({ name: "", city: "", address: "", contactPhone: "", contactEmail: "", isMain: 0, status: "activa" });
    setDialogOpen(true);
  }

  function openEdit(sede: SedeWithCount) {
    setEditingSede(sede);
    form.reset({
      name: sede.name,
      city: sede.city || "",
      address: sede.address || "",
      contactPhone: sede.contactPhone || "",
      contactEmail: sede.contactEmail || "",
      isMain: sede.isMain,
      status: sede.status,
    });
    setDialogOpen(true);
  }

  function onSubmit(data: SedeFormValues) {
    if (editingSede) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  }

  const filtered = sedes.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.city || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.address || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalWorkers = sedes.reduce((acc, s) => acc + (s.workerCount || 0), 0);
  const activeSedes = sedes.filter((s) => s.status === "activa").length;

  return (
    <div className="p-6 space-y-6" data-testid="page-company-sedes">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Sedes y Plantas</h1>
          <p className="text-muted-foreground">Gestione las ubicaciones de su empresa</p>
        </div>
        <Button onClick={openCreate} data-testid="button-create-sede">
          <Plus className="mr-2 h-4 w-4" />
          Nueva Sede
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sedes</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-sedes">{sedes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sedes Activas</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-sedes">{activeSedes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trabajadores Asignados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-assigned-workers">{totalWorkers}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Buscar por nombre, ciudad o dirección..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
          data-testid="input-search-sedes"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sede</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Trabajadores</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Cargando sedes...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {sedes.length === 0
                      ? "No hay sedes registradas. Cree la primera sede."
                      : "No se encontraron sedes con ese criterio de búsqueda."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((sede) => (
                  <TableRow key={sede.id} data-testid={`row-sede-${sede.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium" data-testid={`text-sede-name-${sede.id}`}>{sede.name}</span>
                        {sede.isMain === 1 && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Principal
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell data-testid={`text-sede-city-${sede.id}`}>
                      {sede.city || "—"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" data-testid={`text-sede-address-${sede.id}`}>
                      {sede.address || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {sede.contactPhone && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span data-testid={`text-sede-phone-${sede.id}`}>{sede.contactPhone}</span>
                          </div>
                        )}
                        {sede.contactEmail && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span data-testid={`text-sede-email-${sede.id}`}>{sede.contactEmail}</span>
                          </div>
                        )}
                        {!sede.contactPhone && !sede.contactEmail && "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" data-testid={`text-sede-workers-${sede.id}`}>
                        {sede.workerCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={sede.status === "activa" ? "default" : "secondary"}
                        data-testid={`badge-sede-status-${sede.id}`}
                      >
                        {sede.status === "activa" ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEdit(sede)}
                          data-testid={`button-edit-sede-${sede.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(sede.id)}
                          disabled={sede.workerCount > 0}
                          data-testid={`button-delete-sede-${sede.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle data-testid="text-dialog-title">
              {editingSede ? "Editar Sede" : "Nueva Sede"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la sede</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Planta Principal, Oficina Bogotá" {...field} data-testid="input-sede-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Bogotá" {...field} data-testid="input-sede-city" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-sede-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="activa">Activa</SelectItem>
                          <SelectItem value="inactiva">Inactiva</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Cra 15 #100-20" {...field} data-testid="input-sede-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 601-1234567" {...field} data-testid="input-sede-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email de contacto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: sede@empresa.com" {...field} data-testid="input-sede-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="isMain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de sede</FormLabel>
                    <Select onValueChange={(v) => field.onChange(parseInt(v))} value={String(field.value)}>
                      <FormControl>
                        <SelectTrigger data-testid="select-sede-type">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">Sucursal</SelectItem>
                        <SelectItem value="1">Sede Principal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeDialog} data-testid="button-cancel">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit-sede"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Guardando..."
                    : editingSede
                    ? "Actualizar"
                    : "Crear Sede"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

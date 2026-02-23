import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Users, Building2, Plus, Edit, Trash2, Search, Filter,
  BookOpen, Scale, Phone, Mail, UserCircle, RefreshCcw, X
} from "lucide-react";
import { Link } from "wouter";
import { ParteInteresada, insertParteInteresadaSchema, User } from "@shared/schema";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";

const tipoOptions = [
  { value: "interna", label: "Interna" },
  { value: "externa", label: "Externa" }
];

const categoriaOptions = [
  { value: "trabajadores", label: "Trabajadores" },
  { value: "sindicatos", label: "Sindicatos" },
  { value: "contratistas", label: "Contratistas" },
  { value: "proveedores", label: "Proveedores" },
  { value: "clientes", label: "Clientes" },
  { value: "arl", label: "ARL" },
  { value: "autoridades", label: "Autoridades" },
  { value: "comunidad", label: "Comunidad" },
  { value: "accionistas", label: "Accionistas" },
  { value: "otros", label: "Otros" }
];

const frecuenciaOptions = [
  { value: "diaria", label: "Diaria" },
  { value: "semanal", label: "Semanal" },
  { value: "quincenal", label: "Quincenal" },
  { value: "mensual", label: "Mensual" },
  { value: "bimestral", label: "Bimestral" },
  { value: "trimestral", label: "Trimestral" },
  { value: "semestral", label: "Semestral" },
  { value: "anual", label: "Anual" },
  { value: "segun_necesidad", label: "Según necesidad" }
];

const medioComunicacionOptions = [
  { value: "email", label: "Correo electrónico" },
  { value: "reunion", label: "Reunión presencial" },
  { value: "virtual", label: "Reunión virtual" },
  { value: "informe", label: "Informe escrito" },
  { value: "telefono", label: "Teléfono" },
  { value: "cartelera", label: "Cartelera informativa" },
  { value: "capacitacion", label: "Capacitación" },
  { value: "otro", label: "Otro" }
];

const nivelOptions = [
  { value: "alto", label: "Alto" },
  { value: "medio", label: "Medio" },
  { value: "bajo", label: "Bajo" }
];

const getCategoriaColor = (categoria: string) => {
  const colors: Record<string, string> = {
    trabajadores: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    sindicatos: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    contratistas: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    proveedores: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
    clientes: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    arl: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    autoridades: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    comunidad: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
    accionistas: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    otros: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
  };
  return colors[categoria] || colors.otros;
};

const getNivelColor = (nivel: string) => {
  const colors: Record<string, string> = {
    alto: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    medio: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    bajo: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
  };
  return colors[nivel] || colors.medio;
};

const getTipoColor = (tipo: string) => {
  return tipo === "interna" 
    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
};

const formSchema = insertParteInteresadaSchema.extend({
  nombre: z.string().min(1, "El nombre es requerido"),
  tipo: z.enum(["interna", "externa"]),
  categoria: z.enum(["trabajadores", "sindicatos", "contratistas", "proveedores", "clientes", "arl", "autoridades", "comunidad", "accionistas", "otros"]),
  nivelInfluencia: z.string().min(1, "El nivel de influencia es requerido"),
  nivelInteres: z.string().min(1, "El nivel de interés es requerido"),
});

type FormData = z.infer<typeof formSchema>;

export default function PartesInteresadas() {
  const [activeTab, setActiveTab] = useState("lista");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("todos");
  const [filterCategoria, setFilterCategoria] = useState<string>("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ParteInteresada | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const [necesidadesInput, setNecesidadesInput] = useState("");
  const [expectativasInput, setExpectativasInput] = useState("");
  const [requisitosInput, setRequisitosInput] = useState("");
  
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      tipo: "externa",
      categoria: "otros",
      descripcion: "",
      contactoPrincipal: "",
      cargo: "",
      email: "",
      telefono: "",
      necesidades: [],
      expectativas: [],
      requisitosLegales: [],
      frecuenciaComunicacion: "",
      medioComunicacion: "",
      nivelInfluencia: "medio",
      nivelInteres: "medio",
      activo: 1,
    },
  });

  const { data: partesInteresadas = [], isLoading } = useQuery<ParteInteresada[]>({
    queryKey: ["/api/partes-interesadas"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("POST", "/api/partes-interesadas", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partes-interesadas"] });
      toast({
        title: "Parte interesada creada",
        description: "La parte interesada se ha registrado correctamente.",
      });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la parte interesada.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      return await apiRequest("PATCH", `/api/partes-interesadas/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partes-interesadas"] });
      toast({
        title: "Parte interesada actualizada",
        description: "Los cambios se han guardado correctamente.",
      });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la parte interesada.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/partes-interesadas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partes-interesadas"] });
      toast({
        title: "Parte interesada eliminada",
        description: "El registro se ha eliminado correctamente.",
      });
      setDeleteConfirmId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la parte interesada.",
        variant: "destructive",
      });
    },
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    form.reset({
      nombre: "",
      tipo: "externa",
      categoria: "otros",
      descripcion: "",
      contactoPrincipal: "",
      cargo: "",
      email: "",
      telefono: "",
      necesidades: [],
      expectativas: [],
      requisitosLegales: [],
      frecuenciaComunicacion: "",
      medioComunicacion: "",
      nivelInfluencia: "medio",
      nivelInteres: "medio",
      activo: 1,
    });
    setNecesidadesInput("");
    setExpectativasInput("");
    setRequisitosInput("");
  };

  const handleEdit = (item: ParteInteresada) => {
    setEditingItem(item);
    form.reset({
      nombre: item.nombre,
      tipo: item.tipo,
      categoria: item.categoria,
      descripcion: item.descripcion || "",
      contactoPrincipal: item.contactoPrincipal || "",
      cargo: item.cargo || "",
      email: item.email || "",
      telefono: item.telefono || "",
      necesidades: item.necesidades || [],
      expectativas: item.expectativas || [],
      requisitosLegales: item.requisitosLegales || [],
      frecuenciaComunicacion: item.frecuenciaComunicacion || "",
      medioComunicacion: item.medioComunicacion || "",
      nivelInfluencia: item.nivelInfluencia,
      nivelInteres: item.nivelInteres,
      activo: item.activo,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: FormData) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const addToArray = (field: "necesidades" | "expectativas" | "requisitosLegales", value: string, setInput: (v: string) => void) => {
    if (value.trim()) {
      const currentValues = form.getValues(field) || [];
      form.setValue(field, [...currentValues, value.trim()]);
      setInput("");
    }
  };

  const removeFromArray = (field: "necesidades" | "expectativas" | "requisitosLegales", index: number) => {
    const currentValues = form.getValues(field) || [];
    form.setValue(field, currentValues.filter((_, i) => i !== index));
  };

  const filteredData = partesInteresadas.filter(item => {
    const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTipo = filterTipo === "todos" || item.tipo === filterTipo;
    const matchesCategoria = filterCategoria === "todos" || item.categoria === filterCategoria;
    return matchesSearch && matchesTipo && matchesCategoria;
  });

  const getCategoriaLabel = (value: string) => {
    return categoriaOptions.find(opt => opt.value === value)?.label || value;
  };

  const getFrecuenciaLabel = (value: string) => {
    return frecuenciaOptions.find(opt => opt.value === value)?.label || value;
  };

  const stats = {
    total: partesInteresadas.length,
    internas: partesInteresadas.filter(p => p.tipo === "interna").length,
    externas: partesInteresadas.filter(p => p.tipo === "externa").length,
    altaInfluencia: partesInteresadas.filter(p => p.nivelInfluencia === "alto").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Partes Interesadas</h1>
        <p className="text-muted-foreground">
          Identificación y gestión de partes interesadas - ISO 45001:2018 Cláusula 4.2 / Decreto 1072/2015
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Referencia Normativa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Scale className="h-4 w-4" />
                ISO 45001:2018 - Cláusula 4.2
              </h4>
              <p className="text-sm text-muted-foreground">
                Comprensión de las necesidades y expectativas de los trabajadores y otras partes interesadas.
                La organización debe determinar:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Las otras partes interesadas, además de los trabajadores, pertinentes al SG-SST</li>
                <li>Las necesidades y expectativas pertinentes de trabajadores y partes interesadas</li>
                <li>Cuáles de estas necesidades y expectativas se convierten en requisitos legales y otros requisitos</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Decreto 1072/2015 - Art. 2.2.4.6.8
              </h4>
              <p className="text-sm text-muted-foreground">
                Obligaciones de los empleadores en el SG-SST. Se debe garantizar la consulta y participación 
                de los trabajadores y sus representantes ante el COPASST o Vigía de SST.
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Comunicación con las partes interesadas externas e internas</li>
                <li>Cumplimiento de requisitos legales aplicables</li>
                <li>Gestión de expectativas y necesidades</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Partes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Internas</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.internas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Externas</CardTitle>
            <Building2 className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.externas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alta Influencia</CardTitle>
            <RefreshCcw className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.altaInfluencia}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="lista" data-testid="tab-lista">Lista de Partes Interesadas</TabsTrigger>
          <TabsTrigger value="matriz" data-testid="tab-matriz">Matriz Influencia/Interés</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Partes Interesadas Identificadas</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-nueva-parte">
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Parte Interesada
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingItem ? "Editar Parte Interesada" : "Nueva Parte Interesada"}
                      </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="nombre"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nombre de la parte interesada" {...field} data-testid="input-nombre" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="tipo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-tipo">
                                      <SelectValue placeholder="Seleccione tipo" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {tipoOptions.map(opt => (
                                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="categoria"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Categoría *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-categoria">
                                      <SelectValue placeholder="Seleccione categoría" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {categoriaOptions.map(opt => (
                                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="descripcion"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Descripción</FormLabel>
                                <FormControl>
                                  <Input placeholder="Descripción breve" {...field} value={field.value || ""} data-testid="input-descripcion" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-4">Información de Contacto</h4>
                          <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="contactoPrincipal"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Contacto Principal</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Nombre del contacto" {...field} value={field.value || ""} data-testid="input-contacto" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="cargo"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cargo</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Cargo del contacto" {...field} value={field.value || ""} data-testid="input-cargo" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="correo@ejemplo.com" {...field} value={field.value || ""} data-testid="input-email" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="telefono"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Teléfono</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Número de teléfono" {...field} value={field.value || ""} data-testid="input-telefono" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-4">Requisitos y Expectativas (ISO 45001:2018)</h4>
                          
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="necesidades"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Necesidades</FormLabel>
                                  <div className="flex gap-2">
                                    <Input
                                      placeholder="Agregar necesidad..."
                                      value={necesidadesInput}
                                      onChange={(e) => setNecesidadesInput(e.target.value)}
                                      onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          addToArray("necesidades", necesidadesInput, setNecesidadesInput);
                                        }
                                      }}
                                      data-testid="input-necesidad"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => addToArray("necesidades", necesidadesInput, setNecesidadesInput)}
                                      data-testid="button-add-necesidad"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {(field.value || []).map((item, index) => (
                                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                        {item}
                                        <X
                                          className="h-3 w-3 cursor-pointer"
                                          onClick={() => removeFromArray("necesidades", index)}
                                        />
                                      </Badge>
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="expectativas"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Expectativas</FormLabel>
                                  <div className="flex gap-2">
                                    <Input
                                      placeholder="Agregar expectativa..."
                                      value={expectativasInput}
                                      onChange={(e) => setExpectativasInput(e.target.value)}
                                      onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          addToArray("expectativas", expectativasInput, setExpectativasInput);
                                        }
                                      }}
                                      data-testid="input-expectativa"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => addToArray("expectativas", expectativasInput, setExpectativasInput)}
                                      data-testid="button-add-expectativa"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {(field.value || []).map((item, index) => (
                                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                        {item}
                                        <X
                                          className="h-3 w-3 cursor-pointer"
                                          onClick={() => removeFromArray("expectativas", index)}
                                        />
                                      </Badge>
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="requisitosLegales"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Requisitos Legales Aplicables</FormLabel>
                                  <div className="flex gap-2">
                                    <Input
                                      placeholder="Agregar requisito legal..."
                                      value={requisitosInput}
                                      onChange={(e) => setRequisitosInput(e.target.value)}
                                      onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          addToArray("requisitosLegales", requisitosInput, setRequisitosInput);
                                        }
                                      }}
                                      data-testid="input-requisito"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => addToArray("requisitosLegales", requisitosInput, setRequisitosInput)}
                                      data-testid="button-add-requisito"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {(field.value || []).map((item, index) => (
                                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                        {item}
                                        <X
                                          className="h-3 w-3 cursor-pointer"
                                          onClick={() => removeFromArray("requisitosLegales", index)}
                                        />
                                      </Badge>
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-4">Comunicación</h4>
                          <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="frecuenciaComunicacion"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Frecuencia de Comunicación</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-frecuencia">
                                        <SelectValue placeholder="Seleccione frecuencia" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {frecuenciaOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="medioComunicacion"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Medio de Comunicación</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-medio">
                                        <SelectValue placeholder="Seleccione medio" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {medioComunicacionOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-4">Nivel de Influencia e Interés</h4>
                          <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                              control={form.control}
                              name="nivelInfluencia"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nivel de Influencia *</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-influencia">
                                        <SelectValue placeholder="Seleccione nivel" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {nivelOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="nivelInteres"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nivel de Interés *</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-interes">
                                        <SelectValue placeholder="Seleccione nivel" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {nivelOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={handleCloseDialog}>
                            Cancelar
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={createMutation.isPending || updateMutation.isPending}
                            data-testid="button-guardar"
                          >
                            {createMutation.isPending || updateMutation.isPending ? "Guardando..." : "Guardar"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 mb-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar partes interesadas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
                <Select value={filterTipo} onValueChange={setFilterTipo}>
                  <SelectTrigger className="w-full sm:w-40" data-testid="filter-tipo">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los tipos</SelectItem>
                    {tipoOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                  <SelectTrigger className="w-full sm:w-48" data-testid="filter-categoria">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas las categorías</SelectItem>
                    {categoriaOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Cargando...</div>
              ) : filteredData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron partes interesadas
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Influencia</TableHead>
                        <TableHead>Interés</TableHead>
                        <TableHead>Frecuencia</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((item) => (
                        <TableRow key={item.id} data-testid={`row-parte-${item.id}`}>
                          <TableCell className="font-medium">
                            <div>
                              {item.nombre}
                              {item.descripcion && (
                                <p className="text-xs text-muted-foreground">{item.descripcion}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTipoColor(item.tipo)}>
                              {item.tipo === "interna" ? "Interna" : "Externa"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getCategoriaColor(item.categoria)}>
                              {getCategoriaLabel(item.categoria)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getNivelColor(item.nivelInfluencia)}>
                              {item.nivelInfluencia.charAt(0).toUpperCase() + item.nivelInfluencia.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getNivelColor(item.nivelInteres)}>
                              {item.nivelInteres.charAt(0).toUpperCase() + item.nivelInteres.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.frecuenciaComunicacion ? getFrecuenciaLabel(item.frecuenciaComunicacion) : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {item.contactoPrincipal && (
                                <div className="flex items-center gap-1">
                                  <UserCircle className="h-3 w-3" />
                                  {item.contactoPrincipal}
                                </div>
                              )}
                              {item.email && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  {item.email}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(item)}
                                data-testid={`button-edit-${item.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Dialog open={deleteConfirmId === item.id} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteConfirmId(item.id)}
                                    data-testid={`button-delete-${item.id}`}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Confirmar eliminación</DialogTitle>
                                  </DialogHeader>
                                  <p>¿Está seguro que desea eliminar la parte interesada "{item.nombre}"?</p>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                                      Cancelar
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => deleteMutation.mutate(item.id)}
                                      disabled={deleteMutation.isPending}
                                    >
                                      {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
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
        </TabsContent>

        <TabsContent value="matriz" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Influencia e Interés</CardTitle>
              <CardDescription>
                Visualización de partes interesadas según su nivel de influencia e interés en el SG-SST
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div></div>
                <div className="col-span-2 font-semibold mb-2">Nivel de Interés</div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="flex items-center justify-center font-semibold" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                  Nivel de Influencia
                </div>
                <div className="space-y-2">
                  <div className="text-center text-sm font-medium">Bajo</div>
                </div>
                <div className="space-y-2">
                  <div className="text-center text-sm font-medium">Medio</div>
                </div>
                <div className="space-y-2">
                  <div className="text-center text-sm font-medium">Alto</div>
                </div>

                <div className="text-sm font-medium flex items-center justify-center">Alto</div>
                <div className="border rounded-md p-2 min-h-24 bg-yellow-50 dark:bg-yellow-950">
                  <p className="text-xs font-medium mb-1 text-center">Mantener satisfechos</p>
                  <div className="space-y-1">
                    {partesInteresadas.filter(p => p.nivelInfluencia === "alto" && p.nivelInteres === "bajo").map(p => (
                      <Badge key={p.id} className={getCategoriaColor(p.categoria)} title={p.nombre}>
                        {p.nombre.length > 15 ? p.nombre.substring(0, 15) + "..." : p.nombre}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="border rounded-md p-2 min-h-24 bg-orange-50 dark:bg-orange-950">
                  <p className="text-xs font-medium mb-1 text-center">Gestionar de cerca</p>
                  <div className="space-y-1">
                    {partesInteresadas.filter(p => p.nivelInfluencia === "alto" && p.nivelInteres === "medio").map(p => (
                      <Badge key={p.id} className={getCategoriaColor(p.categoria)} title={p.nombre}>
                        {p.nombre.length > 15 ? p.nombre.substring(0, 15) + "..." : p.nombre}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="border rounded-md p-2 min-h-24 bg-red-50 dark:bg-red-950">
                  <p className="text-xs font-medium mb-1 text-center">Gestión activa</p>
                  <div className="space-y-1">
                    {partesInteresadas.filter(p => p.nivelInfluencia === "alto" && p.nivelInteres === "alto").map(p => (
                      <Badge key={p.id} className={getCategoriaColor(p.categoria)} title={p.nombre}>
                        {p.nombre.length > 15 ? p.nombre.substring(0, 15) + "..." : p.nombre}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="text-sm font-medium flex items-center justify-center">Medio</div>
                <div className="border rounded-md p-2 min-h-24 bg-gray-50 dark:bg-gray-900">
                  <p className="text-xs font-medium mb-1 text-center">Monitorear</p>
                  <div className="space-y-1">
                    {partesInteresadas.filter(p => p.nivelInfluencia === "medio" && p.nivelInteres === "bajo").map(p => (
                      <Badge key={p.id} className={getCategoriaColor(p.categoria)} title={p.nombre}>
                        {p.nombre.length > 15 ? p.nombre.substring(0, 15) + "..." : p.nombre}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="border rounded-md p-2 min-h-24 bg-yellow-50 dark:bg-yellow-950">
                  <p className="text-xs font-medium mb-1 text-center">Mantener informados</p>
                  <div className="space-y-1">
                    {partesInteresadas.filter(p => p.nivelInfluencia === "medio" && p.nivelInteres === "medio").map(p => (
                      <Badge key={p.id} className={getCategoriaColor(p.categoria)} title={p.nombre}>
                        {p.nombre.length > 15 ? p.nombre.substring(0, 15) + "..." : p.nombre}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="border rounded-md p-2 min-h-24 bg-orange-50 dark:bg-orange-950">
                  <p className="text-xs font-medium mb-1 text-center">Gestionar expectativas</p>
                  <div className="space-y-1">
                    {partesInteresadas.filter(p => p.nivelInfluencia === "medio" && p.nivelInteres === "alto").map(p => (
                      <Badge key={p.id} className={getCategoriaColor(p.categoria)} title={p.nombre}>
                        {p.nombre.length > 15 ? p.nombre.substring(0, 15) + "..." : p.nombre}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="text-sm font-medium flex items-center justify-center">Bajo</div>
                <div className="border rounded-md p-2 min-h-24 bg-green-50 dark:bg-green-950">
                  <p className="text-xs font-medium mb-1 text-center">Mínimo esfuerzo</p>
                  <div className="space-y-1">
                    {partesInteresadas.filter(p => p.nivelInfluencia === "bajo" && p.nivelInteres === "bajo").map(p => (
                      <Badge key={p.id} className={getCategoriaColor(p.categoria)} title={p.nombre}>
                        {p.nombre.length > 15 ? p.nombre.substring(0, 15) + "..." : p.nombre}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="border rounded-md p-2 min-h-24 bg-gray-50 dark:bg-gray-900">
                  <p className="text-xs font-medium mb-1 text-center">Mantener informados</p>
                  <div className="space-y-1">
                    {partesInteresadas.filter(p => p.nivelInfluencia === "bajo" && p.nivelInteres === "medio").map(p => (
                      <Badge key={p.id} className={getCategoriaColor(p.categoria)} title={p.nombre}>
                        {p.nombre.length > 15 ? p.nombre.substring(0, 15) + "..." : p.nombre}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="border rounded-md p-2 min-h-24 bg-blue-50 dark:bg-blue-950">
                  <p className="text-xs font-medium mb-1 text-center">Mantener satisfechos</p>
                  <div className="space-y-1">
                    {partesInteresadas.filter(p => p.nivelInfluencia === "bajo" && p.nivelInteres === "alto").map(p => (
                      <Badge key={p.id} className={getCategoriaColor(p.categoria)} title={p.nombre}>
                        {p.nombre.length > 15 ? p.nombre.substring(0, 15) + "..." : p.nombre}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium mb-2">Leyenda de Categorías</h4>
                <div className="flex flex-wrap gap-2">
                  {categoriaOptions.map(cat => (
                    <Badge key={cat.value} className={getCategoriaColor(cat.value)}>
                      {cat.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

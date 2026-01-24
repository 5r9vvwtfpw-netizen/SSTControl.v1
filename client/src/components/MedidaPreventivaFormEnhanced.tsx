/**
 * Formulario Inteligente de Medidas Preventivas/Correctivas
 * =========================================================
 * 
 * Componente con auto-llenado automático siguiendo el patrón de formularios inteligentes:
 * - Código único auto-generado (MP-YYYY-NNN / MC-YYYY-NNN / MM-YYYY-NNN)
 * - Al seleccionar tipo de medida: auto-llena título, descripción, prioridad y fecha
 * - Responsable sugerido desde contexto del usuario
 * - Badges visuales "Auto" en campos auto-llenados
 * 
 * Basado en:
 * - Decreto 1072/2015 Art. 2.2.4.6.33 (Acciones preventivas y correctivas)
 * - Resolución 0312/2019 Estándar 4.1.1 (Acciones de mejora)
 * 
 * @author Sistema SG-SST Colombia
 * @date Enero 2026
 */

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Sparkles, AlertTriangle, CheckCircle2, TrendingUp, Calendar, User, Tag, FileText, Info } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Worker } from "@shared/schema";
import {
  TIPOS_MEDIDAS_PREVENTIVAS,
  CATEGORIAS_MEDIDAS,
  TipoMedidaPreventiva,
  generarCodigoMedida,
  calcularFechaVencimiento,
  getMedidasPorCategoria
} from "@/data/medidas-preventivas-automatizacion";

const formSchema = z.object({
  codigo: z.string().min(1, "El código es requerido"),
  categoria: z.enum(['preventiva', 'correctiva', 'mejora']),
  tipoMedidaCodigo: z.string().optional(),
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  responsible: z.string().min(1, "Debe seleccionar un responsable"),
  dueDate: z.string().min(1, "La fecha de vencimiento es requerida"),
  status: z.enum(['pendiente', 'en-progreso', 'completada', 'vencida']),
  priority: z.enum(['baja', 'media', 'alta']),
  relatedArea: z.string().optional(),
});

export type MedidaPreventivaFormData = z.infer<typeof formSchema>;

interface MedidaPreventivaFormEnhancedProps {
  onSubmit: (data: MedidaPreventivaFormData) => void;
  onCancel: () => void;
  existingMeasuresCount: number;
  isLoading?: boolean;
  defaultArea?: string;
}

export function MedidaPreventivaFormEnhanced({
  onSubmit,
  onCancel,
  existingMeasuresCount,
  isLoading = false,
  defaultArea = ""
}: MedidaPreventivaFormEnhancedProps) {
  const { user } = useAuth();
  const [selectedCategoria, setSelectedCategoria] = useState<'preventiva' | 'correctiva' | 'mejora'>('preventiva');
  const [selectedTipoMedida, setSelectedTipoMedida] = useState<TipoMedidaPreventiva | null>(null);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const medidasFiltradas = useMemo(() => {
    return getMedidasPorCategoria(selectedCategoria);
  }, [selectedCategoria]);

  const form = useForm<MedidaPreventivaFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigo: "",
      categoria: "preventiva",
      tipoMedidaCodigo: "",
      title: "",
      description: "",
      responsible: user?.fullName || user?.username || "",
      dueDate: "",
      status: "pendiente",
      priority: "media",
      relatedArea: defaultArea,
    },
  });

  useEffect(() => {
    const codigoGenerado = generarCodigoMedida(selectedCategoria, existingMeasuresCount);
    form.setValue("codigo", codigoGenerado);
    form.setValue("categoria", selectedCategoria);
    setAutoFilledFields(prev => {
      const newSet = new Set(prev);
      newSet.add('codigo');
      return newSet;
    });
  }, [selectedCategoria, existingMeasuresCount, form]);

  useEffect(() => {
    const userName = user?.fullName || user?.username;
    if (userName && !form.getValues("responsible")) {
      form.setValue("responsible", userName);
      setAutoFilledFields(prev => {
        const newSet = new Set(prev);
        newSet.add('responsible');
        return newSet;
      });
    }
  }, [user, form]);

  const handleTipoMedidaChange = (codigo: string) => {
    const tipo = TIPOS_MEDIDAS_PREVENTIVAS.find(t => t.codigo === codigo);
    if (tipo) {
      setSelectedTipoMedida(tipo);
      form.setValue("tipoMedidaCodigo", codigo);
      form.setValue("title", tipo.nombre);
      form.setValue("description", tipo.descripcionSugerida);
      form.setValue("priority", tipo.prioridadSugerida);
      form.setValue("dueDate", calcularFechaVencimiento(tipo.diasPlazoSugerido));
      
      if (tipo.areasSugeridas.length > 0 && !form.getValues("relatedArea")) {
        form.setValue("relatedArea", tipo.areasSugeridas[0]);
      }
      
      setAutoFilledFields(new Set(['codigo', 'title', 'description', 'priority', 'dueDate', 'relatedArea']));
    }
  };

  const handleCategoriaChange = (categoria: 'preventiva' | 'correctiva' | 'mejora') => {
    setSelectedCategoria(categoria);
    setSelectedTipoMedida(null);
    form.setValue("tipoMedidaCodigo", "");
    form.setValue("title", "");
    form.setValue("description", "");
    form.setValue("priority", "media");
    form.setValue("dueDate", "");
    setAutoFilledFields(new Set(['codigo']));
  };

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case 'preventiva': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'correctiva': return <CheckCircle2 className="h-4 w-4 text-red-500" />;
      case 'mejora': return <TrendingUp className="h-4 w-4 text-green-500" />;
      default: return null;
    }
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'preventiva': return 'border-amber-200 bg-amber-50 dark:bg-amber-950/30';
      case 'correctiva': return 'border-red-200 bg-red-50 dark:bg-red-950/30';
      case 'mejora': return 'border-green-200 bg-green-50 dark:bg-green-950/30';
      default: return '';
    }
  };

  const AutoBadge = ({ fieldName }: { fieldName: string }) => {
    if (!autoFilledFields.has(fieldName)) return null;
    return (
      <Badge variant="secondary" className="ml-2 text-xs bg-primary/10 text-primary">
        <Sparkles className="h-3 w-3 mr-1" />
        Auto
      </Badge>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className={`${getCategoriaColor(selectedCategoria)} transition-colors duration-300`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              {getCategoriaIcon(selectedCategoria)}
              Formulario Inteligente
              <Badge variant="outline" className="ml-auto">
                <Sparkles className="h-3 w-3 mr-1 text-primary" />
                Auto-llenado
              </Badge>
            </CardTitle>
            <CardDescription>
              Seleccione la categoría y tipo para auto-completar el formulario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      Categoría de Acción
                    </FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleCategoriaChange(value as 'preventiva' | 'correctiva' | 'mejora');
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-categoria-medida">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIAS_MEDIDAS.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              {getCategoriaIcon(cat.id)}
                              <span>{cat.nombre}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      Código
                      <AutoBadge fieldName="codigo" />
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        readOnly 
                        className="bg-muted font-mono"
                        data-testid="input-codigo-medida"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tipoMedidaCodigo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Tipo de Medida (Auto-llenado)
                  </FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleTipoMedidaChange(value);
                    }} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-tipo-medida">
                        <SelectValue placeholder="Seleccione para auto-completar campos" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {medidasFiltradas.map((tipo) => (
                        <SelectItem key={tipo.codigo} value={tipo.codigo}>
                          <div className="flex flex-col">
                            <span className="font-medium">{tipo.nombre}</span>
                            <span className="text-xs text-muted-foreground">{tipo.codigo}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedTipoMedida && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Etiquetas:</span>
                {selectedTipoMedida.etiquetas.map((etiqueta, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {etiqueta}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Título
                  <AutoBadge fieldName="title" />
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ej: Capacitación en uso de EPP" 
                    data-testid="input-title-medida"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Descripción
                  <AutoBadge fieldName="description" />
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describa la medida preventiva/correctiva en detalle"
                    data-testid="input-description-medida"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="responsible"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Responsable
                    <AutoBadge fieldName="responsible" />
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-responsible-medida">
                        <SelectValue placeholder="Seleccione un responsable" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {user && (
                        <SelectItem value={user.fullName || user.username}>
                          {user.fullName || user.username} (Yo)
                        </SelectItem>
                      )}
                      {workers.map((worker) => (
                        <SelectItem key={worker.id} value={worker.name}>
                          {worker.name} - {worker.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Fecha de Vencimiento
                    <AutoBadge fieldName="dueDate" />
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      data-testid="input-due-date-medida"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Prioridad
                    <AutoBadge fieldName="priority" />
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-priority-medida">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="baja">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          Baja
                        </div>
                      </SelectItem>
                      <SelectItem value="media">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                          Media
                        </div>
                      </SelectItem>
                      <SelectItem value="alta">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          Alta
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
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
                      <SelectTrigger data-testid="select-status-medida">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="en-progreso">En Progreso</SelectItem>
                      <SelectItem value="completada">Completada</SelectItem>
                      <SelectItem value="vencida">Vencida</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="relatedArea"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Área Relacionada (opcional)
                  <AutoBadge fieldName="relatedArea" />
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ej: Producción, Almacén, etc." 
                    data-testid="input-related-area-medida"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            data-testid="button-cancel-medida"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            data-testid="button-submit-medida"
          >
            {isLoading ? "Guardando..." : "Guardar Medida"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

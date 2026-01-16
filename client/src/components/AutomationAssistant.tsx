import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Bot, Sparkles, FileText, CheckCircle2, Info, Lightbulb, BookOpen, ChevronDown, ChevronUp, Zap, Scale, AlertTriangle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface NormativaInfo {
  codigo: string;
  norma: string;
  articulo?: string;
  descripcion: string;
  requisitos: string[];
  obligatorio: boolean;
}

export interface PlantillaInfo {
  id: string;
  nombre: string;
  descripcion: string;
  campos: Record<string, any>;
  normativaBase: string;
}

export interface AutomationAssistantProps {
  titulo: string;
  estandar: string;
  descripcion?: string;
  normativaAplicable: NormativaInfo[];
  plantillasDisponibles?: PlantillaInfo[];
  camposSugeridos?: {
    campo: string;
    valor: string;
    normativaReferencia?: string;
  }[];
  onAutoFill?: (datos: Record<string, any>) => void;
  onSelectPlantilla?: (plantilla: PlantillaInfo) => void;
  children?: React.ReactNode;
  compact?: boolean;
}

export function AutomationAssistant({
  titulo,
  estandar,
  descripcion,
  normativaAplicable,
  plantillasDisponibles = [],
  camposSugeridos = [],
  onAutoFill,
  onSelectPlantilla,
  children,
  compact = false
}: AutomationAssistantProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [showNormativaDialog, setShowNormativaDialog] = useState(false);
  const [showPlantillasDialog, setShowPlantillasDialog] = useState(false);
  const [selectedPlantilla, setSelectedPlantilla] = useState<PlantillaInfo | null>(null);

  const handleAutoFill = () => {
    if (onAutoFill && camposSugeridos.length > 0) {
      const datos: Record<string, any> = {};
      camposSugeridos.forEach(campo => {
        datos[campo.campo] = campo.valor;
      });
      onAutoFill(datos);
    }
  };

  const handleSelectPlantilla = (plantilla: PlantillaInfo) => {
    setSelectedPlantilla(plantilla);
    if (onSelectPlantilla) {
      onSelectPlantilla(plantilla);
    }
    setShowPlantillasDialog(false);
  };

  const normasObligatorias = normativaAplicable.filter(n => n.obligatorio);
  const normasOpcionales = normativaAplicable.filter(n => !n.obligatorio);

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNormativaDialog(true)}
                className="gap-2"
                data-testid="button-view-normativa"
              >
                <Scale className="h-4 w-4 text-blue-600" />
                <span className="hidden sm:inline">Normativa</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ver normativa aplicable</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {plantillasDisponibles.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPlantillasDialog(true)}
                  className="gap-2"
                  data-testid="button-view-plantillas"
                >
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span className="hidden sm:inline">Plantillas</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ver plantillas predefinidas</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {camposSugeridos.length > 0 && onAutoFill && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleAutoFill}
                  className="gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  data-testid="button-autofill"
                >
                  <Zap className="h-4 w-4" />
                  <span className="hidden sm:inline">Auto-llenar</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Llenar automáticamente con datos normativos</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <NormativaDialog
          open={showNormativaDialog}
          onOpenChange={setShowNormativaDialog}
          titulo={titulo}
          estandar={estandar}
          normativaAplicable={normativaAplicable}
        />

        <PlantillasDialog
          open={showPlantillasDialog}
          onOpenChange={setShowPlantillasDialog}
          titulo={titulo}
          plantillas={plantillasDisponibles}
          onSelect={handleSelectPlantilla}
          selectedPlantilla={selectedPlantilla}
        />
      </div>
    );
  }

  return (
    <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50/50 to-orange-50/30 dark:from-yellow-950/20 dark:to-orange-950/10 mb-6" data-testid="card-automation-assistant">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex-shrink-0">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base sm:text-lg flex flex-wrap items-center gap-2">
                  <span className="truncate">Asistente Inteligente SST</span>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {estandar}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-sm line-clamp-2">
                  {descripcion || `Normativa y plantillas para ${titulo}`}
                </CardDescription>
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="flex-shrink-0" data-testid="button-toggle-assistant">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Scale className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="truncate">Normativa Aplicable</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {normasObligatorias.length > 0 && (
                      <p className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                        {normasObligatorias.length} normas obligatorias
                      </p>
                    )}
                    {normasOpcionales.length > 0 && (
                      <p className="flex items-center gap-1">
                        <Info className="h-3 w-3 text-blue-500" />
                        {normasOpcionales.length} normas complementarias
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => setShowNormativaDialog(true)}
                    data-testid="button-view-all-normativa"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Ver Normativa
                  </Button>
                </CardContent>
              </Card>

              {plantillasDisponibles.length > 0 && (
                <Card className="bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      <span className="truncate">Plantillas Predefinidas</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">
                      {plantillasDisponibles.length} plantillas disponibles según normativa colombiana
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => setShowPlantillasDialog(true)}
                      data-testid="button-view-all-plantillas"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Ver Plantillas
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/20 border-yellow-300 dark:border-yellow-800">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                    <span className="truncate">Autocompletado Inteligente</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    {camposSugeridos.length > 0 
                      ? `${camposSugeridos.length} campos pueden auto-llenarse con datos normativos`
                      : 'Usa las plantillas para pre-cargar datos'}
                  </p>
                  {camposSugeridos.length > 0 && onAutoFill && (
                    <Button
                      size="sm"
                      className="w-full mt-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                      onClick={handleAutoFill}
                      data-testid="button-autofill-full"
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Llenar Automáticamente
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      <NormativaDialog
        open={showNormativaDialog}
        onOpenChange={setShowNormativaDialog}
        titulo={titulo}
        estandar={estandar}
        normativaAplicable={normativaAplicable}
      />

      <PlantillasDialog
        open={showPlantillasDialog}
        onOpenChange={setShowPlantillasDialog}
        titulo={titulo}
        plantillas={plantillasDisponibles}
        onSelect={handleSelectPlantilla}
        selectedPlantilla={selectedPlantilla}
      />
    </Card>
  );
}

interface NormativaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  estandar: string;
  normativaAplicable: NormativaInfo[];
}

function NormativaDialog({ open, onOpenChange, titulo, estandar, normativaAplicable }: NormativaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-blue-600" />
            Normativa Aplicable - {estandar}
          </DialogTitle>
          <DialogDescription>
            {titulo}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4">
            {normativaAplicable.map((norma, index) => (
              <Card key={index} className={norma.obligatorio ? "border-l-4 border-l-red-500" : "border-l-4 border-l-blue-300"}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {norma.norma}
                        {norma.obligatorio && (
                          <Badge variant="destructive" className="text-xs">Obligatorio</Badge>
                        )}
                      </CardTitle>
                      {norma.articulo && (
                        <CardDescription className="text-sm mt-1">
                          {norma.articulo}
                        </CardDescription>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">{norma.codigo}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{norma.descripcion}</p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Requisitos:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {norma.requisitos.map((req, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close-normativa">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface PlantillasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  plantillas: PlantillaInfo[];
  onSelect: (plantilla: PlantillaInfo) => void;
  selectedPlantilla: PlantillaInfo | null;
}

function PlantillasDialog({ open, onOpenChange, titulo, plantillas, onSelect, selectedPlantilla }: PlantillasDialogProps) {
  const [previewPlantilla, setPreviewPlantilla] = useState<PlantillaInfo | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Plantillas Predefinidas
          </DialogTitle>
          <DialogDescription>
            Selecciona una plantilla para pre-cargar los campos del formulario
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid gap-4 md:grid-cols-2">
            {plantillas.map((plantilla) => (
              <Card 
                key={plantilla.id} 
                className={`cursor-pointer transition-all hover:border-purple-400 ${
                  selectedPlantilla?.id === plantilla.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20' : ''
                }`}
                onClick={() => setPreviewPlantilla(plantilla)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{plantilla.nombre}</CardTitle>
                  <CardDescription className="text-xs">{plantilla.descripcion}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">{plantilla.normativaBase}</Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(plantilla);
                      }}
                      data-testid={`button-select-plantilla-${plantilla.id}`}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Usar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {previewPlantilla && (
            <>
              <Separator className="my-4" />
              <Card className="bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Vista Previa: {previewPlantilla.nombre}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {Object.entries(previewPlantilla.campos).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="text-muted-foreground whitespace-pre-wrap">
                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close-plantillas">
            Cerrar
          </Button>
          {previewPlantilla && (
            <Button onClick={() => onSelect(previewPlantilla)} data-testid="button-apply-plantilla">
              <Sparkles className="h-4 w-4 mr-2" />
              Aplicar Plantilla
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function NormativaBadge({ norma, articulo }: { norma: string; articulo?: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="gap-1 cursor-help text-xs">
            <Scale className="h-3 w-3" />
            {norma}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{articulo || norma}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function SugerenciaInteligente({ texto, normativa }: { texto: string; normativa?: string }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800 text-sm">
      <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-muted-foreground">{texto}</p>
        {normativa && (
          <p className="text-xs text-yellow-700 dark:text-yellow-500 mt-1">
            Según: {normativa}
          </p>
        )}
      </div>
    </div>
  );
}

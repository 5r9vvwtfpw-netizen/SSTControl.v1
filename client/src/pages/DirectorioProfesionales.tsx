import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, Phone, Mail, Award, Send, GraduationCap, Building2, CheckCircle, Loader2, Users } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface LicensedProfessional {
  id: string;
  fullName: string;
  sstProfessionType: string | null;
  sstLicenseNumber: string | null;
  sstLicenseIssuer: string | null;
  sstLicenseStatus: string | null;
  sstPhone: string | null;
  email: string | null;
  alreadyAssigned: boolean;
}

const SST_PROFESSION_LABELS: Record<string, string> = {
  licenciado_salud_ocupacional: "Licenciado en Salud Ocupacional",
  medico_ocupacional: "Médico Ocupacional",
  profesional_sst: "Profesional SST",
  tecnologo_sst: "Tecnólogo SST",
  tecnico_sst: "Técnico SST",
  fisioterapeuta: "Fisioterapeuta",
  psicologo_sst: "Psicólogo SST",
  fonoaudiologo: "Fonoaudiólogo",
  ingeniero_sst: "Ingeniero SST",
  enfermero_sst: "Enfermero SST",
  otro: "Otro",
};

const profesionTypes = [
  { value: "all", label: "Todas las especialidades" },
  { value: "licenciado_salud_ocupacional", label: "Licenciado en Salud Ocupacional" },
  { value: "medico_ocupacional", label: "Médico Ocupacional" },
  { value: "profesional_sst", label: "Profesional SST" },
  { value: "tecnologo_sst", label: "Tecnólogo SST" },
  { value: "tecnico_sst", label: "Técnico SST" },
  { value: "fisioterapeuta", label: "Fisioterapeuta" },
  { value: "psicologo_sst", label: "Psicólogo SST" },
  { value: "ingeniero_sst", label: "Ingeniero SST" },
  { value: "enfermero_sst", label: "Enfermero SST" },
];

export default function DirectorioProfesionales() {
  const { toast } = useToast();
  const [busqueda, setBusqueda] = useState("");
  const [especialidadFiltro, setEspecialidadFiltro] = useState("all");
  const [selectedProfessional, setSelectedProfessional] = useState<LicensedProfessional | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: professionals, isLoading, error } = useQuery<LicensedProfessional[]>({
    queryKey: ["/api/directory/licensed-professionals"],
  });

  const requestMutation = useMutation({
    mutationFn: async ({ lsoId, message }: { lsoId: string; message: string }) => {
      const res = await apiRequest("POST", `/api/directory/licensed-professionals/${lsoId}/request`, { message });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Solicitud enviada",
        description: data.message || "El profesional recibirá tu mensaje.",
      });
      setDialogOpen(false);
      setSelectedProfessional(null);
      setRequestMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/directory/licensed-professionals"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la solicitud",
        variant: "destructive",
      });
    },
  });

  const profesionalesFiltrados = (professionals || []).filter((prof) => {
    const coincideBusqueda = 
      prof.fullName?.toLowerCase().includes(busqueda.toLowerCase()) ||
      prof.sstLicenseNumber?.toLowerCase().includes(busqueda.toLowerCase()) ||
      prof.sstLicenseIssuer?.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideEspecialidad = especialidadFiltro === "all" || prof.sstProfessionType === especialidadFiltro;
    
    return coincideBusqueda && coincideEspecialidad;
  });

  const handleRequestContact = (professional: LicensedProfessional) => {
    setSelectedProfessional(professional);
    setRequestMessage(`Estimado/a ${professional.fullName},\n\nNuestra empresa está interesada en sus servicios como Profesional Licenciado en SST. Nos gustaría programar una reunión para discutir la posibilidad de colaboración.\n\nQuedamos atentos a su respuesta.`);
    setDialogOpen(true);
  };

  const handleSendRequest = () => {
    if (!selectedProfessional) return;
    requestMutation.mutate({
      lsoId: selectedProfessional.id,
      message: requestMessage,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    const errorMessage = (error as any)?.message || "Error desconocido";
    return (
      <Card className="p-8 text-center">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold">Error al cargar el directorio</h3>
        <p className="text-muted-foreground text-sm mt-2">
          {errorMessage.includes("Solo administradores") || errorMessage.includes("asociado a una empresa")
            ? errorMessage
            : "Por favor intenta nuevamente más tarde o contacta soporte técnico."}
        </p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
          data-testid="button-retry-directorio"
        >
          Reintentar
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="title-directorio">
            Directorio de Profesionales SST
          </h1>
          <p className="text-muted-foreground mt-2">
            Encuentra profesionales certificados en Seguridad y Salud en el Trabajo con licencia vigente según la Resolución 0312/2019
          </p>
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Award className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-primary">Requisito Legal</p>
                <p className="text-sm text-muted-foreground">
                  Según la Resolución 0312/2019, las empresas con 11 o más trabajadores deben contar con un profesional 
                  en SST con licencia vigente para diseñar, administrar y ejecutar el Sistema de Gestión de SST.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, licencia o entidad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
            data-testid="input-buscar-profesional"
          />
        </div>
        <Select value={especialidadFiltro} onValueChange={setEspecialidadFiltro}>
          <SelectTrigger className="w-full sm:w-[250px]" data-testid="select-especialidad">
            <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filtrar por especialidad" />
          </SelectTrigger>
          <SelectContent>
            {profesionTypes.map((tipo) => (
              <SelectItem key={tipo.value} value={tipo.value} data-testid={`option-especialidad-${tipo.value}`}>
                {tipo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span data-testid="text-count-profesionales">{profesionalesFiltrados.length} profesionales encontrados</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profesionalesFiltrados.map((profesional) => (
          <Card 
            key={profesional.id} 
            className={`hover-elevate ${profesional.alreadyAssigned ? 'border-primary/50 bg-primary/5' : ''}`}
            data-testid={`card-profesional-${profesional.id}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">{profesional.fullName || "Sin nombre"}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <GraduationCap className="h-3 w-3" />
                    {SST_PROFESSION_LABELS[profesional.sstProfessionType || ""] || profesional.sstProfessionType || "Sin especialidad"}
                  </CardDescription>
                </div>
                {profesional.alreadyAssigned && (
                  <Badge variant="default" className="shrink-0 bg-primary">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Asignado
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Award className="h-4 w-4 text-primary" />
                  <span>Licencia: <strong className="text-foreground">{profesional.sstLicenseNumber || "N/A"}</strong></span>
                </div>
                {profesional.sstLicenseIssuer && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="truncate">{profesional.sstLicenseIssuer}</span>
                  </div>
                )}
                {profesional.sstPhone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{profesional.sstPhone}</span>
                  </div>
                )}
                {profesional.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{profesional.email}</span>
                  </div>
                )}
              </div>

              {profesional.alreadyAssigned ? (
                <Button variant="outline" className="w-full" size="sm" disabled>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Ya asignado a tu empresa
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  className="w-full" 
                  size="sm"
                  onClick={() => handleRequestContact(profesional)}
                  data-testid={`btn-contactar-${profesional.id}`}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Solicitar Contacto
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {profesionalesFiltrados.length === 0 && !isLoading && (
        <Card className="p-8 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold">No se encontraron profesionales</h3>
          <p className="text-muted-foreground text-sm mt-2">
            {professionals?.length === 0 
              ? "No hay profesionales licenciados con licencia vigente disponibles en este momento."
              : "Intenta ajustar los filtros de búsqueda"
            }
          </p>
        </Card>
      )}

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Nota:</strong> Este directorio muestra únicamente profesionales con licencia SST vigente registrados en nuestra plataforma. 
            Verifique siempre la vigencia de la licencia del profesional en el Registro Único Nacional del Talento Humano en Salud (ReTHUS) del Ministerio de Salud.
          </p>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Contacto</DialogTitle>
            <DialogDescription>
              Envía un mensaje a {selectedProfessional?.fullName} para solicitar sus servicios SST.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Mensaje</label>
              <Textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={6}
                placeholder="Escribe tu mensaje..."
                data-testid="textarea-mensaje-solicitud"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="btn-cancelar-solicitud">
              Cancelar
            </Button>
            <Button 
              onClick={handleSendRequest}
              disabled={requestMutation.isPending || !requestMessage.trim()}
              data-testid="btn-enviar-solicitud"
            >
              {requestMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Solicitud
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

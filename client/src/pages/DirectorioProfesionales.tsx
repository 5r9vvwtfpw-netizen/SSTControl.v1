import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Phone, Mail, Award, ExternalLink, GraduationCap, Building2 } from "lucide-react";
import { useState } from "react";

const profesionalesSST = [
  {
    id: 1,
    nombre: "Dr. Carlos Andrés Martínez",
    especialidad: "Especialista en Salud Ocupacional",
    licencia: "SO-12345",
    ciudad: "Bogotá D.C.",
    telefono: "+57 310 123 4567",
    email: "carlos.martinez@sst.com",
    experiencia: "15 años",
    servicios: ["Diseño SG-SST", "Auditorías", "Capacitaciones", "Evaluaciones médicas ocupacionales"],
  },
  {
    id: 2,
    nombre: "Dra. María Fernanda López",
    especialidad: "Especialista en Higiene y Seguridad Industrial",
    licencia: "HSI-67890",
    ciudad: "Medellín",
    telefono: "+57 311 234 5678",
    email: "maria.lopez@sst.com",
    experiencia: "12 años",
    servicios: ["Matrices IPERC", "Planes de emergencia", "Mediciones ambientales", "PESV"],
  },
  {
    id: 3,
    nombre: "Ing. Roberto García Pérez",
    especialidad: "Ingeniero en Seguridad y Salud en el Trabajo",
    licencia: "SST-11223",
    ciudad: "Cali",
    telefono: "+57 312 345 6789",
    email: "roberto.garcia@sst.com",
    experiencia: "10 años",
    servicios: ["Implementación SG-SST", "Inspecciones", "Investigación de accidentes", "Capacitaciones"],
  },
  {
    id: 4,
    nombre: "Dra. Ana Patricia Rodríguez",
    especialidad: "Médica Especialista en Salud Ocupacional",
    licencia: "SO-44556",
    ciudad: "Barranquilla",
    telefono: "+57 313 456 7890",
    email: "ana.rodriguez@sst.com",
    experiencia: "18 años",
    servicios: ["Exámenes médicos ocupacionales", "Vigilancia epidemiológica", "Programas de promoción y prevención"],
  },
  {
    id: 5,
    nombre: "Ing. Luis Alberto Sánchez",
    especialidad: "Especialista en Ergonomía",
    licencia: "ERG-78901",
    ciudad: "Bucaramanga",
    telefono: "+57 314 567 8901",
    email: "luis.sanchez@sst.com",
    experiencia: "8 años",
    servicios: ["Análisis ergonómico", "Diseño de puestos de trabajo", "Prevención DME", "Capacitaciones ergonomía"],
  },
  {
    id: 6,
    nombre: "Dra. Carolina Herrera Mejía",
    especialidad: "Psicóloga Especialista en Riesgo Psicosocial",
    licencia: "PSI-23456",
    ciudad: "Bogotá D.C.",
    telefono: "+57 315 678 9012",
    email: "carolina.herrera@sst.com",
    experiencia: "11 años",
    servicios: ["Batería riesgo psicosocial", "Intervención psicosocial", "Programas de bienestar", "Clima organizacional"],
  },
];

const ciudades = ["Todas", "Bogotá D.C.", "Medellín", "Cali", "Barranquilla", "Bucaramanga"];

export default function DirectorioProfesionales() {
  const [busqueda, setBusqueda] = useState("");
  const [ciudadFiltro, setCiudadFiltro] = useState("Todas");

  const profesionalesFiltrados = profesionalesSST.filter((prof) => {
    const coincideBusqueda = 
      prof.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      prof.especialidad.toLowerCase().includes(busqueda.toLowerCase()) ||
      prof.servicios.some(s => s.toLowerCase().includes(busqueda.toLowerCase()));
    
    const coincideCiudad = ciudadFiltro === "Todas" || prof.ciudad === ciudadFiltro;
    
    return coincideBusqueda && coincideCiudad;
  });

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
            placeholder="Buscar por nombre, especialidad o servicio..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
            data-testid="input-buscar-profesional"
          />
        </div>
        <Select value={ciudadFiltro} onValueChange={setCiudadFiltro}>
          <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-ciudad">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filtrar por ciudad" />
          </SelectTrigger>
          <SelectContent>
            {ciudades.map((ciudad) => (
              <SelectItem key={ciudad} value={ciudad}>
                {ciudad}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profesionalesFiltrados.map((profesional) => (
          <Card key={profesional.id} className="hover-elevate" data-testid={`card-profesional-${profesional.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">{profesional.nombre}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <GraduationCap className="h-3 w-3" />
                    {profesional.especialidad}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {profesional.experiencia}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Award className="h-4 w-4 text-primary" />
                  <span>Licencia: <strong className="text-foreground">{profesional.licencia}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{profesional.ciudad}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{profesional.telefono}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{profesional.email}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Servicios:</p>
                <div className="flex flex-wrap gap-1">
                  {profesional.servicios.slice(0, 3).map((servicio) => (
                    <Badge key={servicio} variant="outline" className="text-xs">
                      {servicio}
                    </Badge>
                  ))}
                  {profesional.servicios.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{profesional.servicios.length - 3} más
                    </Badge>
                  )}
                </div>
              </div>

              <Button variant="outline" className="w-full" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Contactar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {profesionalesFiltrados.length === 0 && (
        <Card className="p-8 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold">No se encontraron profesionales</h3>
          <p className="text-muted-foreground text-sm mt-2">
            Intenta ajustar los filtros de búsqueda
          </p>
        </Card>
      )}

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Nota:</strong> Este directorio es solo referencial. Verifique siempre la vigencia de la licencia 
            del profesional en el Registro Único Nacional del Talento Humano en Salud (ReTHUS) del Ministerio de Salud.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

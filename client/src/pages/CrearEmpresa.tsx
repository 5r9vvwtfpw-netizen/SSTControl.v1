import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Building2, CheckCircle2, Loader2, Shield, MapPin, Phone, Mail, Sparkles, Briefcase } from "lucide-react";
import type { User } from "@shared/schema";
import { calculateChapter } from "@shared/utils";
import { CIIU_CODES, CIIU_SECTIONS } from "@/lib/ciiu-codes";

// Información de estándares según Resolución 0312/2019 - basado en trabajadores y riesgo
const chapterInfo: Record<string, { name: string; standards: number; description: string; color: string }> = {
  "1": {
    name: "Estándares Mínimos",
    standards: 7,
    description: "1-10 trabajadores, Riesgo I/II/III",
    color: "bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-300 dark:border-blue-800"
  },
  "2": {
    name: "Estándares Intermedios", 
    standards: 21,
    description: "11-50 trabajadores, Riesgo I/II/III",
    color: "bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-300 dark:border-emerald-800"
  },
  "3": {
    name: "Estándares Completos",
    standards: 61,
    description: ">50 trabajadores o Riesgo IV/V",
    color: "bg-purple-500/10 text-purple-700 border-purple-200 dark:text-purple-300 dark:border-purple-800"
  }
};

// Lista de ciudades principales de Colombia para documentos oficiales
const colombianCities = [
  "Bogotá D.C.", "Medellín", "Cali", "Barranquilla", "Cartagena", "Bucaramanga",
  "Pereira", "Manizales", "Santa Marta", "Ibagué", "Cúcuta", "Villavicencio",
  "Pasto", "Montería", "Neiva", "Armenia", "Popayán", "Sincelejo", "Valledupar",
  "Tunja", "Riohacha", "Florencia", "Quibdó", "Yopal", "Mocoa", "Leticia",
  "San José del Guaviare", "Inírida", "Puerto Carreño", "Mitú", "Arauca",
  "Soacha", "Bello", "Soledad", "Itagüí", "Floridablanca", "Envigado",
  "Palmira", "Dosquebradas", "Rionegro", "Zipaquirá", "Chía", "Facatativá",
  "Girardot", "Barrancabermeja", "Sogamoso", "Duitama", "Tuluá"
];

const createCompanySchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  nit: z.string().min(9, "El NIT debe tener al menos 9 caracteres").max(15, "El NIT no puede tener más de 15 caracteres"),
  city: z.string().min(1, "La ciudad es obligatoria"),
  ciiuCode: z.string().min(1, "El código CIIU es obligatorio"),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  contactPhone: z.string()
    .transform(v => v.replace(/[\s\-.()+]/g, ''))
    .pipe(z.string().regex(
      /^(3\d{9}|[1245678]\d{7})$/,
      "Número inválido. Celular: 10 dígitos comenzando con 3 (ej: 3101234567). Fijo: 8 dígitos con indicativo de ciudad (ej: 6017654321)"
    )),
  contactEmail: z.string().email("Debe ser un correo electrónico válido"),
  numberOfWorkers: z.coerce.number().min(1, "Debe tener al menos 1 trabajador"),
  riskLevel: z.enum(["I", "II", "III", "IV", "V"]).default("I"),
});

type CreateCompanyForm = z.infer<typeof createCompanySchema>;

export default function CrearEmpresa() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Get current user
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  // Leer parámetro workers desde URL, sessionStorage, o datos del quote JWT (landing page)
  const searchParams = new URLSearchParams(window.location.search);
  const urlWorkers = searchParams.get("workers");
  const storedWorkers = typeof window !== 'undefined' ? sessionStorage.getItem('sst_onboarding_workers') : null;
  const quoteDataRaw = typeof window !== 'undefined' ? localStorage.getItem('sst_quote_data') : null;
  const quoteData = quoteDataRaw ? JSON.parse(quoteDataRaw) : null;
  const quoteWorkers = quoteData?.employees ? String(quoteData.employees) : null;
  const workersParam = urlWorkers || storedWorkers || quoteWorkers;
  const initialWorkers = workersParam ? parseInt(workersParam, 10) : 1;

  // Trazabilidad: Leer datos del formulario de registro como fallback
  const registrationCompanyName = typeof window !== 'undefined' ? sessionStorage.getItem('sst_registration_company_name') : null;
  const registrationEmail = typeof window !== 'undefined' ? sessionStorage.getItem('sst_registration_email') : null;

  useEffect(() => {
    sessionStorage.removeItem('sst_new_registration');
  }, []);

  const form = useForm<CreateCompanyForm>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: quoteData?.companyName || registrationCompanyName || "",
      nit: "",
      city: "",
      ciiuCode: "",
      address: "",
      contactPhone: "",
      contactEmail: registrationEmail || user?.email || "",
      numberOfWorkers: isNaN(initialWorkers) || initialWorkers < 1 ? 1 : initialWorkers,
      riskLevel: "I",
    },
  });

  // Watch form values for real-time chapter calculation
  const watchedWorkers = form.watch("numberOfWorkers");
  const watchedRisk = form.watch("riskLevel");
  
  // Calculate chapter dynamically based on current form values (Resolución 0312/2019)
  const currentChapter = calculateChapter(watchedWorkers || 1, watchedRisk || "I");
  const currentChapterInfo = chapterInfo[currentChapter];

  const createCompanyMutation = useMutation({
    mutationFn: async (data: CreateCompanyForm) => {
      const response = await apiRequest("POST", "/api/my-company", data);
      return response.json();
    },
    onSuccess: (data) => {
      // Limpiar sessionStorage del onboarding
      sessionStorage.removeItem('sst_onboarding_workers');
      // Trazabilidad: limpiar datos temporales del registro
      sessionStorage.removeItem('sst_registration_company_name');
      sessionStorage.removeItem('sst_registration_email');
      
      toast({
        title: "¡Bienvenido a SST Colombia!",
        description: data.message || "Tu período de prueba de 7 días ha comenzado. Explora tu panel de control.",
      });
      
      // CRITICAL: Update user cache immediately with the new companyId
      // This prevents ProtectedRoute from redirecting back to /crear-empresa
      if (data.user) {
        queryClient.setQueryData(["/api/user"], data.user);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/company/current"] });
      
      // Navigate to dashboard using window.location for full page reload
      // This ensures all state is fresh
      window.location.href = "/dashboard";
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear empresa",
        description: error.message || "No se pudo crear la empresa. Intenta de nuevo.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateCompanyForm) => {
    createCompanyMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="title-onboarding">
            Configura tu Empresa
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Para comenzar a usar el sistema SST, necesitamos los datos básicos de tu empresa
          </p>
        </div>

        {/* Estándares calculados automáticamente según Resolución 0312/2019 */}
        <Card className={`border-2 ${currentChapterInfo.color}`} data-testid="card-calculated-chapter">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{currentChapterInfo.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {currentChapterInfo.standards} estándares
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      7 días gratis
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{currentChapterInfo.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Se calcula automáticamente según trabajadores y nivel de riesgo
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-create-company">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Datos de la Empresa
            </CardTitle>
            <CardDescription>
              Esta información es necesaria para cumplir con la Resolución 0312/2019
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Nombre de la Empresa *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ej: Constructora ABC S.A.S." 
                            {...field} 
                            data-testid="input-company-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NIT *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ej: 900123456-7" 
                            {...field} 
                            data-testid="input-nit"
                          />
                        </FormControl>
                        <FormDescription>
                          Número de Identificación Tributaria
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numberOfWorkers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Trabajadores *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min={1}
                            placeholder="Ej: 25" 
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                            onBlur={() => { if (field.value === '' || field.value == null) field.onChange(1); }}
                            data-testid="input-num-workers"
                          />
                        </FormControl>
                        <FormDescription>
                          Determina los estándares aplicables Res. 0312
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Ciudad *
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-city">
                              <SelectValue placeholder="Selecciona la ciudad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {colombianCities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Para documentos oficiales del SG-SST
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ciiuCode"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          Actividad Económica (CIIU) *
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-ciiu">
                              <SelectValue placeholder="Selecciona la actividad económica" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-80">
                            {Object.entries(CIIU_SECTIONS).map(([section, sectionName]) => (
                              <div key={section}>
                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted">
                                  {section} - {sectionName}
                                </div>
                                {CIIU_CODES.filter(c => c.section === section).map((ciiu) => (
                                  <SelectItem key={ciiu.code} value={ciiu.code}>
                                    {ciiu.code} - {ciiu.description}
                                  </SelectItem>
                                ))}
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Código CIIU según clasificación DANE
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ej: Calle 100 # 15-20" 
                            {...field} 
                            data-testid="input-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          Teléfono de Contacto *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Celular: 3101234567 · Fijo: 6017654321"
                            inputMode="numeric"
                            {...field} 
                            data-testid="input-contact-phone"
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">Celular: 10 dígitos desde 3 · Fijo: 8 dígitos con indicativo (1-Bogotá, 2-Cali, 4-Medellín, 5-Costa, 6-Eje Cafetero, 7-Bucaramanga, 8-Llanos)</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          Correo de Contacto *
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="Ej: empresa@correo.com" 
                            {...field} 
                            data-testid="input-contact-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="riskLevel"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Nivel de Riesgo *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-risk-level">
                              <SelectValue placeholder="Selecciona nivel de riesgo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="I">Nivel I - Riesgo Mínimo</SelectItem>
                            <SelectItem value="II">Nivel II - Riesgo Bajo</SelectItem>
                            <SelectItem value="III">Nivel III - Riesgo Medio</SelectItem>
                            <SelectItem value="IV">Nivel IV - Riesgo Alto</SelectItem>
                            <SelectItem value="V">Nivel V - Riesgo Máximo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Según clasificación de la ARL
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Tu período de prueba gratuito incluye:
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>7 días de acceso completo a todas las funcionalidades</li>
                    <li>Sin necesidad de tarjeta de crédito</li>
                    <li>Soporte técnico incluido</li>
                  </ul>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="accept-terms" 
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                      data-testid="checkbox-accept-terms"
                      className="mt-0.5"
                    />
                    <Label 
                      htmlFor="accept-terms" 
                      className="text-sm leading-relaxed cursor-pointer"
                    >
                      Acepto los{" "}
                      <a 
                        href="/terminos-servicio" 
                        target="_blank" 
                        className="text-primary underline hover:text-primary/80"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Términos de Servicio
                      </a>{" "}
                      y la{" "}
                      <a 
                        href="/terminos-servicio#propiedad-intelectual" 
                        target="_blank" 
                        className="text-primary underline hover:text-primary/80"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Política de Propiedad Intelectual
                      </a>{" "}
                      <span className="font-semibold">(DNDA 13-197-177)</span>
                    </Label>
                  </div>
                  {!acceptedTerms && (
                    <p className="text-xs text-muted-foreground mt-2 ml-6">
                      Debes aceptar los términos para continuar
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={createCompanyMutation.isPending || !acceptedTerms}
                  data-testid="button-create-company"
                >
                  {createCompanyMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando empresa...
                    </>
                  ) : (
                    <>
                      <Building2 className="mr-2 h-4 w-4" />
                      Crear Empresa y Comenzar Prueba
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>
            Al crear tu empresa, aceptas los{" "}
            <a 
              href="/terminos-servicio" 
              target="_blank"
              className="underline hover:text-foreground font-medium"
              data-testid="link-terms-register"
            >
              Términos de Servicio
            </a>,{" "}
            la{" "}
            <a 
              href="/politica-privacidad" 
              target="_blank"
              className="underline hover:text-foreground"
              data-testid="link-privacy-register"
            >
              Política de Privacidad
            </a>{" "}
            y la{" "}
            <a 
              href="/terminos-servicio#propiedad-intelectual" 
              target="_blank"
              className="underline hover:text-foreground font-medium"
              data-testid="link-ip-register"
            >
              Política de Propiedad Intelectual (DNDA 13-197-177)
            </a>
          </p>
          <p className="text-muted-foreground/70">
            © 2026 SST Colombia | Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
}

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
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Building2, CheckCircle2, Loader2, Shield, MapPin, Phone, Mail, Sparkles, Briefcase, ArrowRight, ArrowLeft, AlertTriangle, Users, Factory } from "lucide-react";
import type { User } from "@shared/schema";
import { calculateChapter } from "@shared/utils";
import { CIIU_CODES, CIIU_SECTIONS } from "@/lib/ciiu-codes";
import { getRiskLevelFromCiiu, getCiiuClassification } from "@shared/ciiu-risk-classification";

const chapterInfo: Record<string, { name: string; standards: number; description: string; color: string; bgColor: string }> = {
  "1": {
    name: "Estándares Mínimos",
    standards: 7,
    description: "Empresas de 1-10 trabajadores con Riesgo I, II o III",
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-500/10 border-blue-200 dark:border-blue-800"
  },
  "2": {
    name: "Estándares Intermedios", 
    standards: 21,
    description: "Empresas de 11-50 trabajadores con Riesgo I, II o III",
    color: "text-emerald-700 dark:text-emerald-300",
    bgColor: "bg-emerald-500/10 border-emerald-200 dark:border-emerald-800"
  },
  "3": {
    name: "Estándares Completos",
    standards: 61,
    description: "Empresas con más de 50 trabajadores o con Riesgo IV/V",
    color: "text-purple-700 dark:text-purple-300",
    bgColor: "bg-purple-500/10 border-purple-200 dark:border-purple-800"
  }
};

const riskLevelInfo: Record<string, { name: string; description: string; color: string }> = {
  "I": { name: "Riesgo Mínimo", description: "Actividades de oficina, comercio menor", color: "text-green-600 dark:text-green-400" },
  "II": { name: "Riesgo Bajo", description: "Servicios, educación, comercio", color: "text-blue-600 dark:text-blue-400" },
  "III": { name: "Riesgo Medio", description: "Manufactura liviana, transporte", color: "text-yellow-600 dark:text-yellow-400" },
  "IV": { name: "Riesgo Alto", description: "Construcción, agricultura, industria", color: "text-orange-600 dark:text-orange-400" },
  "V": { name: "Riesgo Máximo", description: "Minería, trabajo en alturas, explosivos", color: "text-red-600 dark:text-red-400" }
};

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
  contactPhone: z.string().min(7, "El teléfono debe tener al menos 7 dígitos"),
  contactEmail: z.string().email("Debe ser un correo electrónico válido"),
  numberOfWorkers: z.coerce.number().min(1, "Debe tener al menos 1 trabajador"),
  riskLevel: z.enum(["I", "II", "III", "IV", "V"]).default("I"),
});

type CreateCompanyForm = z.infer<typeof createCompanySchema>;

export default function CrearEmpresaCiiuFirst() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const searchParams = new URLSearchParams(window.location.search);
  const urlWorkers = searchParams.get("workers");
  const storedWorkers = typeof window !== 'undefined' ? sessionStorage.getItem('sst_onboarding_workers') : null;
  const workersParam = urlWorkers || storedWorkers;
  const initialWorkers = workersParam ? parseInt(workersParam, 10) : 1;

  // Leer datos del quote JWT desde landing page (si existen)
  const storedQuote = typeof window !== 'undefined' ? sessionStorage.getItem('sst_quote_data') : null;
  const quoteData = storedQuote ? JSON.parse(storedQuote) : null;

  useEffect(() => {
    sessionStorage.removeItem('sst_new_registration');
  }, []);

  const form = useForm<CreateCompanyForm>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      // Pre-llenar nombre de empresa desde quote JWT (Problema 1 del documento)
      name: quoteData?.companyName || "",
      nit: "",
      city: "",
      // Pre-llenar código CIIU si viene del quote
      ciiuCode: quoteData?.ciiuCode || "",
      address: "",
      contactPhone: "",
      // Pre-llenar email de contacto desde el usuario registrado
      contactEmail: "",
      // Pre-llenar número de trabajadores desde quote o URL
      numberOfWorkers: quoteData?.employees || (isNaN(initialWorkers) || initialWorkers < 1 ? 1 : initialWorkers),
      // Pre-llenar nivel de riesgo si viene del quote
      riskLevel: quoteData?.riskLevel || "I",
    },
  });

  // Pre-llenar email de contacto cuando el usuario esté disponible
  useEffect(() => {
    if (user?.email && !form.getValues("contactEmail")) {
      form.setValue("contactEmail", user.email);
    }
  }, [user, form]);

  const watchedWorkers = form.watch("numberOfWorkers");
  const watchedCiiu = form.watch("ciiuCode");
  const watchedRisk = form.watch("riskLevel");

  useEffect(() => {
    if (watchedCiiu) {
      const autoRisk = getRiskLevelFromCiiu(watchedCiiu);
      if (autoRisk) {
        form.setValue("riskLevel", autoRisk);
      }
    }
  }, [watchedCiiu, form]);

  const ciiuClassification = watchedCiiu ? getCiiuClassification(watchedCiiu) : null;
  const currentChapter = calculateChapter(watchedWorkers || 1, watchedRisk || "I");
  const currentChapterInfo = chapterInfo[currentChapter];
  const currentRiskInfo = riskLevelInfo[watchedRisk || "I"];
  const isHighRisk = watchedRisk === "IV" || watchedRisk === "V";
  const step1Valid = watchedCiiu && watchedWorkers && watchedWorkers >= 1;

  const createCompanyMutation = useMutation({
    mutationFn: async (data: CreateCompanyForm) => {
      const response = await apiRequest("POST", "/api/my-company", data);
      return response.json();
    },
    onSuccess: (data) => {
      sessionStorage.removeItem('sst_onboarding_workers');
      toast({
        title: "¡Bienvenido a SST Colombia!",
        description: data.message || "Tu período de prueba de 7 días ha comenzado. Explora tu panel de control.",
      });
      if (data.user) {
        queryClient.setQueryData(["/api/user"], data.user);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/company/current"] });
      window.location.href = "/dashboard";
    },
    onError: (error: Error) => {
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

  const goToStep2 = () => {
    if (step1Valid) {
      setCurrentStep(2);
    }
  };

  const goToStep1 = () => {
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="title-onboarding">
            {currentStep === 1 ? "Identifica tu Actividad Económica" : "Completa los Datos de tu Empresa"}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {currentStep === 1 
              ? "Tu código CIIU determina automáticamente el nivel de riesgo y los estándares que aplican según la Resolución 0312/2019"
              : "Información requerida para cumplir con la normativa colombiana en SST"}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            1
          </div>
          <div className={`w-16 h-1 rounded ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            2
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 1 && (
              <>
                <Card data-testid="card-step1-ciiu">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Factory className="h-5 w-5 text-primary" />
                      Paso 1: Actividad Económica y Trabajadores
                    </CardTitle>
                    <CardDescription>
                      Tu código CIIU determina automáticamente el nivel de riesgo según Decreto 1607/2002
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="ciiuCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1 text-base">
                            <Briefcase className="h-4 w-4" />
                            Actividad Económica (CIIU) *
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-ciiu" className="h-12">
                                <SelectValue placeholder="Selecciona tu actividad económica principal" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-80">
                              {Object.entries(CIIU_SECTIONS).map(([section, sectionName]) => (
                                <SelectGroup key={section}>
                                  <SelectLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted">
                                    {section} - {sectionName}
                                  </SelectLabel>
                                  {CIIU_CODES.filter(c => c.section === section).map((ciiu) => (
                                    <SelectItem key={ciiu.code} value={ciiu.code}>
                                      {ciiu.code} - {ciiu.description}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Código CIIU según clasificación DANE - determina automáticamente tu nivel de riesgo
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
                          <FormLabel className="flex items-center gap-1 text-base">
                            <Users className="h-4 w-4" />
                            Número de Trabajadores *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min={1}
                              placeholder="¿Cuántos trabajadores tiene tu empresa?" 
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value === '' ? 1 : parseInt(e.target.value, 10))}
                              onBlur={() => { if (!field.value || field.value < 1) field.onChange(1); }}
                              data-testid="input-num-workers"
                              className="h-12 text-lg"
                            />
                          </FormControl>
                          <FormDescription>
                            Junto con el nivel de riesgo, determina cuántos estándares aplican (7, 21 o 61)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <input type="hidden" {...form.register("riskLevel")} />

                    {watchedCiiu && ciiuClassification && (
                      <Card className={`border-2 ${isHighRisk ? 'border-orange-400 bg-orange-50/50 dark:bg-orange-950/20' : 'border-green-400 bg-green-50/50 dark:bg-green-950/20'}`} data-testid="card-risk-result">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-full ${isHighRisk ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                                <Shield className={`h-5 w-5 ${isHighRisk ? 'text-orange-600' : 'text-green-600'}`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                  <h3 className="font-semibold">Nivel de Riesgo Calculado:</h3>
                                  <Badge variant="outline" className={`text-sm ${currentRiskInfo.color}`}>
                                    Riesgo {watchedRisk} - {currentRiskInfo.name}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {ciiuClassification.description}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge className={currentChapterInfo.bgColor}>
                                    {currentChapterInfo.name}
                                  </Badge>
                                  <Badge variant="secondary">
                                    {currentChapterInfo.standards} estándares obligatorios
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    7 días gratis
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {isHighRisk && watchedCiiu && (
                      <Alert variant="destructive" className="border-orange-300 bg-orange-50 dark:bg-orange-950/30" data-testid="alert-high-risk">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Actividad de Alto Riesgo Detectada</AlertTitle>
                        <AlertDescription className="text-sm">
                          Las empresas con actividades de Riesgo IV o V deben cumplir con los <strong>61 estándares completos</strong> de la Resolución 0312/2019, independientemente del número de trabajadores. Esto incluye requisitos adicionales de vigilancia epidemiológica, programas de prevención y controles más estrictos.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                <Button 
                  type="button" 
                  className="w-full" 
                  size="lg"
                  onClick={goToStep2}
                  disabled={!step1Valid}
                  data-testid="button-continue-step2"
                >
                  <span>Continuar</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}

            {currentStep === 2 && (
              <>
                <Card className={`border-2 ${currentChapterInfo.bgColor}`} data-testid="card-summary">
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        CIIU: {watchedCiiu}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {watchedWorkers} trabajadores
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${currentRiskInfo.color}`}>
                        Riesgo {watchedRisk}
                      </Badge>
                      <Badge className={currentChapterInfo.bgColor}>
                        {currentChapterInfo.standards} estándares
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        7 días gratis
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card data-testid="card-step2-company">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      Paso 2: Datos de la Empresa
                    </CardTitle>
                    <CardDescription>
                      Información requerida para cumplir con la Resolución 0312/2019
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
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
                                placeholder="Ej: 3001234567" 
                                {...field} 
                                data-testid="input-contact-phone"
                              />
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
                    </div>
                  </CardContent>
                </Card>

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

                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    size="lg"
                    onClick={goToStep1}
                    className="flex-1"
                    data-testid="button-back-step1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-[2]" 
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
                </div>
              </>
            )}
          </form>
        </Form>

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
              className="underline hover:text-foreground"
              data-testid="link-intellectual-property-register"
            >
              Política de Propiedad Intelectual
            </a>
          </p>
          <p className="text-muted-foreground/70">
            SST Colombia - Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
}

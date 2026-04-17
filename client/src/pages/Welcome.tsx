import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Shield, 
  Users, 
  GraduationCap, 
  AlertTriangle, 
  ClipboardCheck, 
  FileText, 
  FileCheck,
  CheckCircle,
  UserCircle,
  ShieldCheck,
  LogIn,
  ExternalLink,
  ArrowRight,
  Play,
  Building2,
  TrendingUp,
  Car,
  Bot,
  Star,
  ChevronRight,
  BarChart3,
  Lock,
  Zap,
} from "lucide-react";
import { ColombianFlag } from "@/components/ColombianFlag";

const features = [
  {
    icon: Users,
    title: "Gestión de trabajadores y contratos",
    description: "Administra información completa de empleados, contratos y afiliaciones a seguridad social."
  },
  {
    icon: GraduationCap,
    title: "Capacitaciones con asistente inteligente",
    description: "50+ temas predefinidos con generación automática de contenido y seguimiento de asistencia."
  },
  {
    icon: AlertTriangle,
    title: "Matriz IPERC con metodología GTC-45",
    description: "Identificación de peligros y evaluación de riesgos siguiendo la guía técnica colombiana."
  },
  {
    icon: ClipboardCheck,
    title: "Inspecciones de seguridad",
    description: "20+ tipos de inspecciones con checklists predefinidos y seguimiento de hallazgos."
  },
  {
    icon: FileText,
    title: "Registro de accidentes e incidentes",
    description: "Investigación completa según metodología FURAT con análisis de causas y medidas correctivas."
  },
  {
    icon: Shield,
    title: "Políticas SST automatizadas",
    description: "Generación automática de políticas de seguridad y salud en el trabajo actualizadas."
  },
  {
    icon: UserCircle,
    title: "Portal de empleados",
    description: "Acceso para trabajadores a sus capacitaciones, documentos y reportes personales."
  },
  {
    icon: Car,
    title: "Plan Estratégico de Seguridad Vial (PESV)",
    description: "Módulo completo PESV según Resolución 40595/2022. Evaluación, seguimiento y reportes."
  },
  {
    icon: Bot,
    title: "Chatbot y asistente SST",
    description: "Asistente inteligente que guía al equipo en cada módulo y responde dudas normativas."
  },
];

const phvaSteps = [
  {
    phase: "P",
    label: "Planear",
    color: "bg-blue-600",
    items: ["Política SST", "Evaluación inicial", "Plan de trabajo anual", "Objetivos medibles"]
  },
  {
    phase: "H",
    label: "Hacer",
    color: "bg-green-600",
    items: ["Capacitaciones", "Inspecciones", "PESV completo", "Control de riesgos"]
  },
  {
    phase: "V",
    label: "Verificar",
    color: "bg-amber-600",
    items: ["Indicadores SST", "Auditorías internas", "Seguimiento de hallazgos"]
  },
  {
    phase: "A",
    label: "Actuar",
    color: "bg-red-600",
    items: ["Acciones de mejora", "Revisión por dirección", "Cierre de brechas"]
  },
];

const stats = [
  { value: "61", label: "Estándares cubiertos", sub: "Res. 0312/2019" },
  { value: "24", label: "Pasos PESV", sub: "Res. 40595/2022" },
  { value: "50+", label: "Temas de capacitación", sub: "Con IA generativa" },
  { value: "100%", label: "Digital y en la nube", sub: "Sin papeles" },
];

export default function Welcome() {
  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/85">
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="container mx-auto px-6 py-8 md:py-16">
            <div className="max-w-4xl mx-auto text-center">

              <div className="flex flex-col items-center gap-2 mb-8">
                <div
                  className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20"
                  data-testid="badge-hero"
                >
                  <ColombianFlag width={28} height={19} className="shadow-sm rounded-sm" />
                  <span className="text-white font-semibold text-lg">Sistema Inteligente SST</span>
                </div>
                <p className="text-white/70 text-sm">
                  Uso autorizado de símbolos patrios - Decreto 1967/1991, Art. 13
                </p>
              </div>

              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
                data-testid="text-hero-title"
              >
                Cumpla su SG-SST sin complicaciones
              </h1>

              <p
                className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto"
                data-testid="text-hero-subtitle"
              >
                La plataforma todo-en-uno para gestionar la Seguridad y Salud en el Trabajo en Colombia. Cumpla la Resolución 0312 de 2019, el PESV y la ISO 45001 desde un solo lugar.
              </p>

              <div className="inline-flex flex-col items-start gap-3 mb-10">
                {[
                  ["Resolución 0312 de 2019", "61 estándares mínimos SST"],
                  ["Decreto 1072 de 2015", "Decreto Único Reglamentario"],
                  ["Resolución 40595/2022", "Plan Estratégico de Seguridad Vial"],
                  ["ISO 45001:2018", "Estándar internacional certificable"],
                  ["Ley 1581 de 2012", "Protección de datos personales"],
                ].map(([bold, rest]) => (
                  <div key={bold} className="flex items-center gap-3 text-white/90">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                    <span className="text-left"><strong>{bold}</strong> <span className="text-white/70">— {rest}</span></span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-bold text-base px-8"
                  data-testid="button-demo-hero"
                >
                  <Link href="/demo">
                    <Play className="w-4 h-4 mr-2" />
                    Ver Demo Gratis
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white font-semibold text-base px-8"
                  data-testid="button-pricing-hero"
                >
                  <Link href="/pricing">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Ver Precios
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
                  data-testid="button-login-hero"
                >
                  <Link href="/login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Iniciar Sesión
                  </Link>
                </Button>
              </div>

            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 50L48 45.7C96 41.3 192 32.7 288 30.8C384 29 480 34 576 41.5C672 49 768 59 864 60.8C960 62.7 1056 56.3 1152 51.7C1248 47 1344 44 1392 42.5L1440 41V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z"
              className="fill-background"
            />
          </svg>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────── */}
      <section className="py-12 bg-background border-b">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((s) => (
              <div key={s.value} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{s.value}</div>
                <div className="font-medium text-sm text-foreground">{s.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEMA / SOLUCIÓN ───────────────────────────────── */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ¿Su empresa está al día con la Res. 0312?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Las multas del Ministerio del Trabajo por incumplimiento del SG-SST pueden llegar a <strong>500 salarios mínimos</strong>. No arriesgue su empresa.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-destructive mb-4">Sin un sistema adecuado</h3>
                <ul className="space-y-3">
                  {[
                    "Documentos en hojas de cálculo desactualizadas",
                    "Sanciones y multas del Ministerio del Trabajo",
                    "Pérdida de contratos por incumplimiento normativo",
                    "Accidentes sin investigación ni seguimiento",
                    "PESV desactualizado o incompleto",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-destructive font-bold mt-0.5">✕</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-primary mb-4">Con SST Colombia</h3>
                <ul className="space-y-3">
                  {[
                    "Toda la documentación centralizada y actualizada",
                    "Cumplimiento verificado con reportes en PDF listos",
                    "Evidencias organizadas para auditorías y contratos",
                    "Investigación de accidentes según metodología FURAT",
                    "PESV completo en 24 pasos con trazabilidad",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── FUNCIONALIDADES ───────────────────────────────────── */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Todo lo que necesita para su SG-SST
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Una plataforma completa que cubre todos los requisitos normativos colombianos en un solo lugar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="hover-elevate">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-md bg-primary/10 flex-shrink-0">
                      <f.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                      <p className="text-sm text-muted-foreground">{f.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CICLO PHVA ────────────────────────────────────────── */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Gestión por Ciclo PHVA
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              La plataforma sigue el ciclo Planear-Hacer-Verificar-Actuar exigido por la normativa colombiana.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {phvaSteps.map((s) => (
              <Card key={s.phase} className="overflow-hidden">
                <div className={`${s.color} p-4 text-white`}>
                  <div className="text-3xl font-black mb-1">{s.phase}</div>
                  <div className="font-bold text-lg">{s.label}</div>
                </div>
                <CardContent className="p-4">
                  <ul className="space-y-2">
                    {s.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="w-3 h-3 text-primary flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIFERENCIADORES ───────────────────────────────────── */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ¿Por qué SST Colombia?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Implementación inmediata",
                description: "Sin instalaciones. Acceda desde cualquier dispositivo desde el primer día. Su equipo listo en horas, no meses."
              },
              {
                icon: Lock,
                title: "100% seguro y en la nube",
                description: "Datos cifrados con AES-256, servidores en AWS. Cumple Ley 1581/2012 de Habeas Data y estándares GDPR."
              },
              {
                icon: TrendingUp,
                title: "Precio según su empresa",
                description: "El precio se calcula automáticamente según su CIIU, número de trabajadores y nivel de riesgo ARL. Sin sorpresas."
              },
              {
                icon: Building2,
                title: "Multi-sede y multi-empresa",
                description: "Gestione varias sedes o empresas desde un solo panel. Ideal para grupos empresariales y consultoras SST."
              },
              {
                icon: Star,
                title: "Firma digital LSO",
                description: "Los Licenciados en SST pueden firmar digitalmente los documentos que exige la normativa colombiana."
              },
              {
                icon: BarChart3,
                title: "Reportes PDF corporativos",
                description: "Genere informes profesionales para auditorías, visitas del Ministerio y certificaciones ISO en un clic."
              },
            ].map((d) => (
              <Card key={d.title} className="hover-elevate">
                <CardContent className="p-6">
                  <d.icon className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-bold text-foreground mb-2">{d.title}</h3>
                  <p className="text-sm text-muted-foreground">{d.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING CTA ───────────────────────────────────────── */}
      <section className="py-16 bg-primary/5 border-y border-primary/10">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Precio personalizado para su empresa
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            No existe un precio único. Su tarifa se calcula automáticamente según el código CIIU, el nivel de riesgo ARL y el número de trabajadores de su empresa. Transparente y justo.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="font-bold px-8" data-testid="button-get-price">
              <Link href="/pricing">
                <BarChart3 className="w-4 h-4 mr-2" />
                Calcular mi precio ahora
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" data-testid="button-demo-pricing">
              <Link href="/demo">
                <Play className="w-4 h-4 mr-2" />
                Probar el sistema gratis
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-white/80" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Empiece hoy a cumplir la normativa
          </h2>
          <p className="text-xl text-white/85 mb-8">
            Más de 61 estándares de la Res. 0312/2019 cubiertos. PESV completo. ISO 45001:2018. Todo en una sola plataforma.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-bold px-8 text-base"
              data-testid="button-demo-final"
            >
              <Link href="/demo">
                <Play className="w-4 h-4 mr-2" />
                Ver Demo Gratis
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 hover:text-white px-8"
              data-testid="button-login-final"
            >
              <Link href="/login">
                <LogIn className="w-4 h-4 mr-2" />
                Iniciar Sesión
              </Link>
            </Button>
          </div>
          <p className="text-white/60 text-sm mt-6">
            SADGI S.A.S. · NIT 902.036.337-4 · Registro DNDA 13-197-177
          </p>
        </div>
      </section>

    </div>
  );
}

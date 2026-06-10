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
  ExternalLink
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
    icon: FileCheck,
    title: "Informes automáticos para Ministerios",
    description: "Generación automática de informes oficiales para el Ministerio de Trabajo y el Ministerio de Transporte."
  }
];

export default function Welcome() {
  return (
    <div className="min-h-screen bg-background">
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
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8"
                data-testid="text-hero-title"
              >
                Sistema de Gestión SG-SST
              </h1>
              
              <p 
                className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto"
                data-testid="text-hero-subtitle"
              >
                Plataforma diseñada para la gestión del Sistema de Seguridad y Salud en el Trabajo (SG-SST)
              </p>

              <div className="inline-flex flex-col items-start gap-3 mb-10">
                <div className="flex items-center gap-3 text-white/90">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="text-left"><strong>Resolución 0312 de 2019</strong> <span className="text-white/70">(Estándares Mínimos SST)</span></span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="text-left"><strong>Decreto 1072 de 2015</strong> <span className="text-white/70">(Decreto Único Reglamentario)</span></span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="text-left"><strong>Ciclo PHVA</strong> <span className="text-white/70">(Planear-Hacer-Verificar-Actuar)</span></span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="text-left"><strong>Resolución 40595 de 2022 — PESV</strong> <span className="text-white/70">(Plan Estratégico de Seguridad Vial)</span></span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="text-left"><strong>Portal de empleados</strong></span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="text-left"><strong>Ley 1581 de 2012</strong> <span className="text-white/70">(Habeas Data) y GDPR</span></span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="text-left"><strong>Informes automáticos</strong> <span className="text-white/70">Ministerio de Trabajo y Ministerio de Transporte</span></span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-12 mb-10">
                <div className="flex flex-col items-center gap-2">
                  <FileCheck className="w-10 h-10 text-white/80" />
                  <span className="text-white font-bold text-xl">100%</span>
                  <span className="text-white/70 text-sm">Cumplimiento</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <ShieldCheck className="w-10 h-10 text-white/80" />
                  <span className="text-white font-bold text-xl">Certificable</span>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-white/70 text-xs">ISO 45001:2018 · Seguridad y Salud</span>
                    <span className="text-white/70 text-xs">ISO 31000:2018 · Gestión de Riesgos</span>
                    <span className="text-white/70 text-xs">ISO 39001:2012 · Seguridad Vial</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  asChild 
                  size="lg"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white"
                  data-testid="button-get-quote"
                >
                  <a href="https://sst-colombia.com.co" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Solicitar Cotización
                  </a>
                </Button>
                <Button 
                  asChild 
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90"
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

    </div>
  );
}

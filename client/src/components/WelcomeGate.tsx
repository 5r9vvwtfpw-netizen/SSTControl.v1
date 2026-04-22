import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Calendar, Phone, Mail, Shield, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type CompanyBasic = {
  id: string;
  name: string;
  nit: string;
  onboardingCompleted: number;
  legalRepName?: string;
};

const WHATSAPP_NUMBER = "573001234567"; // Número de WhatsApp de SADGI — actualizar
const GOOGLE_CALENDAR_URL =
  "https://calendar.google.com/calendar/r/eventedit" +
  "?text=Inducción+SG-SST+Colombia" +
  "&details=Sesión+de+inducción+y+configuración+del+sistema+de+gestión+SG-SST." +
  "&add=soporte@sst-colombia.com.co" +
  "&crm=AVAILABLE_EMAIL_AND_PHONE";

const INCLUDED_FEATURES = [
  "Evaluación inicial Resolución 0312/2019",
  "Gestión de trabajadores y estructura organizacional",
  "COPASST, Brigadas y Comité de Convivencia",
  "Capacitaciones y programa anual",
  "Investigación de accidentes e incidentes",
  "Matriz de peligros y riesgos",
  "Indicadores SST y reportes automáticos",
  "Módulo PESV — Resolución 40595/2022",
  "Documentos legales con firma digital del LSO",
];

interface WelcomeGateProps {
  children: React.ReactNode;
}

export function WelcomeGate({ children }: WelcomeGateProps) {
  const { user } = useAuth();

  const { data: company, isLoading } = useQuery<CompanyBasic>({
    queryKey: ["/api/company/current"],
    enabled: !!user?.companyId,
    staleTime: 30000,
  });

  // Roles que NO deben ver la pantalla de bienvenida
  const bypassRoles = ["superadmin", "soporte", "lso", "lso_externo"];
  if (!user?.companyId || bypassRoles.includes(user.role)) {
    return <>{children}</>;
  }

  if (isLoading) {
    return <>{children}</>;
  }

  // Si la empresa ya completó la inducción → acceso normal
  if (!company || company.onboardingCompleted === 1) {
    return <>{children}</>;
  }

  // Pantalla de bienvenida bloqueante
  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col overflow-y-auto">
      {/* Header institucional */}
      <div className="bg-primary text-primary-foreground py-3 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5" />
          <span className="font-semibold text-sm">SST Colombia — Sistema de Gestión SST</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          <Clock className="h-3 w-3 mr-1" />
          Pendiente de inducción
        </Badge>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl space-y-8">

          {/* Saludo de bienvenida */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              ¡Bienvenido a SST Colombia!
            </h1>
            <p className="text-xl text-muted-foreground">
              {company.name}
            </p>
            {company.legalRepName && (
              <p className="text-sm text-muted-foreground">
                {company.legalRepName}
              </p>
            )}
          </div>

          {/* Mensaje principal */}
          <div className="bg-card border rounded-md p-6 space-y-4">
            <h2 className="font-semibold text-lg">
              Su cuenta está lista — próximo paso: sesión de inducción
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Para garantizar que aproveche al máximo todas las funciones del sistema y cumpla
              correctamente con los requisitos de la <strong>Resolución 0312/2019</strong> e
              <strong> ISO 45001:2018</strong>, nuestro equipo le acompañará en una sesión de
              inducción personalizada antes de que empiece a operar.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Durante la videollamada le explicaremos paso a paso cómo configurar su empresa,
              registrar sus trabajadores, y generar sus primeros informes legales.
            </p>
          </div>

          {/* Lo que incluye su plan */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Su plan incluye
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INCLUDED_FEATURES.map((feature) => (
                <div key={feature} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              size="default"
              className="flex-1"
              onClick={() => window.open(GOOGLE_CALENDAR_URL, "_blank")}
              data-testid="button-schedule-onboarding"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Agendar en Google Calendar
            </Button>
            <Button
              variant="outline"
              size="default"
              onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}`, "_blank")}
              data-testid="button-whatsapp-onboarding"
            >
              <Phone className="h-4 w-4 mr-2" />
              Contactar por WhatsApp
            </Button>
          </div>

          {/* Contacto directo */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>soporte@sst-colombia.com.co</span>
            </div>
            <div className="hidden sm:block text-muted-foreground/40">•</div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>+57 300 123 4567</span>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Una vez realizada la inducción, nuestro equipo activará su acceso completo al sistema.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t py-4 px-6 text-center text-xs text-muted-foreground shrink-0">
        SADGI S.A.S. — NIT 902.036.337-4 · Sistema de Gestión SST Colombia
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { X, PlayCircle, Mail, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

type CompanyBasic = {
  id: string;
  name: string;
  nit: string;
  onboardingCompleted: number;
};

const BYPASS_ROLES = ["superadmin", "soporte", "lso", "lso_externo"];
const INDUCTION_EMAIL = "admin@sst-colombia.com";

// URL del primer video tutorial del panel de control
// Actualizar cuando el video esté disponible
const TUTORIAL_VIDEO_URL = "https://www.youtube.com/@SG-SST";

interface WelcomeGateProps {
  children: React.ReactNode;
}

export function WelcomeGate({ children }: WelcomeGateProps) {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);

  const shouldCheck =
    !!user?.companyId &&
    !BYPASS_ROLES.includes(user.role ?? "") &&
    !user.username?.startsWith("demo_");

  const { data: company } = useQuery<CompanyBasic>({
    queryKey: ["/api/company/current"],
    enabled: shouldCheck,
    staleTime: 60000,
  });

  useEffect(() => {
    if (!company || company.onboardingCompleted === 1) return;
    const key = `sst_welcome_dismissed_${company.id}`;
    if (!localStorage.getItem(key)) {
      setVisible(true);
    }
  }, [company]);

  const dismiss = () => {
    if (company) {
      localStorage.setItem(`sst_welcome_dismissed_${company.id}`, "1");
    }
    setVisible(false);
  };

  return (
    <>
      {children}

      {visible && (
        <div
          className="fixed bottom-6 right-6 z-[9000] w-80 bg-card border rounded-md shadow-lg p-4 space-y-3"
          data-testid="card-welcome-banner"
        >
          {/* Encabezado */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="font-semibold text-sm leading-snug">
                ¡Bienvenido a SST Colombia!
              </p>
            </div>
            <button
              onClick={dismiss}
              className="text-muted-foreground hover:text-foreground shrink-0"
              aria-label="Cerrar"
              data-testid="button-dismiss-welcome"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Cuerpo */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            Para comenzar, te recomendamos ver el video introductorio del panel de control.
            Si prefieres una sesión personalizada con nuestro equipo, escríbenos al correo.
          </p>

          {/* Acciones */}
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => window.open(TUTORIAL_VIDEO_URL, "_blank")}
              data-testid="button-watch-tutorial"
            >
              <PlayCircle className="h-4 w-4" />
              Ver video tutorial
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() =>
                window.open(
                  `mailto:${INDUCTION_EMAIL}?subject=Solicitud%20de%20inducción%20SST%20Colombia&body=Hola,%20me%20gustaría%20agendar%20una%20sesión%20de%20inducción%20personalizada.`,
                  "_blank"
                )
              }
              data-testid="button-request-induction"
            >
              <Mail className="h-4 w-4" />
              Solicitar inducción por correo
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground text-center">
            {INDUCTION_EMAIL}
          </p>
        </div>
      )}
    </>
  );
}

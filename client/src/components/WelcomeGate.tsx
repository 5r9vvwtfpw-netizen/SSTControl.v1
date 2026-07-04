import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useSubscriptionCheck } from "@/hooks/useSubscriptionCheck";
import { X, PlayCircle, Mail, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type CompanyBasic = {
  id: string;
  name: string;
  nit: string;
  onboardingCompleted: number;
};

const BYPASS_ROLES = ["superadmin", "soporte", "lso", "lso_externo"];
const INDUCTION_EMAIL = "admin@sst-colombia.com";

interface WelcomeGateProps {
  children: React.ReactNode;
}

export function WelcomeGate({ children }: WelcomeGateProps) {
  const { user } = useAuth();
  const { shouldBlock } = useSubscriptionCheck();
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
    if (shouldBlock) {
      setVisible(false);
      return;
    }
    const key = `sst_welcome_dismissed_${company.id}`;
    if (!localStorage.getItem(key)) {
      setVisible(true);
    }
  }, [company, shouldBlock]);

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
          className="fixed bottom-6 right-6 z-[9000] w-80 rounded-md shadow-xl overflow-hidden"
          style={{ border: "1.5px solid #2d6a3e" }}
          data-testid="card-welcome-banner"
        >
          {/* Franja superior verde */}
          <div
            className="flex items-center justify-between gap-2 px-4 py-3"
            style={{ background: "#357947" }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-white shrink-0" />
              <p className="font-semibold text-sm text-white leading-snug">
                ¡Bienvenido a SST Colombia!
              </p>
            </div>
            <button
              onClick={dismiss}
              className="text-white/80 hover:text-white shrink-0"
              aria-label="Cerrar aviso de bienvenida"
              data-testid="button-dismiss-welcome"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Cuerpo con fondo ligeramente verde */}
          <div className="bg-[#f0f7f2] dark:bg-[#1a2e20] p-4 space-y-3">
            <div className="space-y-2 text-xs text-[#2d4a35] dark:text-green-200 leading-relaxed">
              <p>
                Para empezar a operar el sistema, haz clic en el botón{" "}
                <span className="font-semibold inline-flex items-center gap-1">
                  <PlayCircle className="h-3 w-3" /> Video de Ayuda
                </span>{" "}
                que encontrarás en este panel de control. Allí te explicamos paso a paso cómo configurar tu empresa.
              </p>
              <p>
                También tienes nuestro{" "}
                <span className="font-semibold inline-flex items-center gap-1">
                  <Bot className="h-3 w-3" /> Asistente Virtual
                </span>{" "}
                disponible en todo momento para responder tus preguntas.
              </p>
            </div>

            <button
              className="w-full flex items-center justify-center gap-2 text-sm font-medium text-white rounded-md py-2 px-3 transition-opacity hover:opacity-90"
              style={{ background: "#357947" }}
              onClick={() =>
                window.open(
                  `mailto:${INDUCTION_EMAIL}?subject=Solicitud%20de%20sesión%20de%20inducción&body=Hola,%20me%20gustaría%20agendar%20una%20sesión%20de%20inducción%20personalizada%20para%20comenzar%20a%20operar%20el%20sistema.`,
                  "_blank"
                )
              }
              data-testid="button-request-induction"
            >
              <Mail className="h-4 w-4" />
              Solicitar inducción personalizada
            </button>

            <p className="text-[11px] text-center" style={{ color: "#4a7a5a" }}>
              {INDUCTION_EMAIL}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

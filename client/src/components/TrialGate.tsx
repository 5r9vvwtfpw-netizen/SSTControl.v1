import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mail, Building2, CheckCircle2, Info } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type SubscriptionResponse = {
  id: string;
  status: string;
  trialEnd: string | null;
  plan: {
    name: string;
    displayName: string;
  };
};

interface TrialGateProps {
  children: React.ReactNode;
}

export function TrialGate({ children }: TrialGateProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const { data: subscription } = useQuery<SubscriptionResponse>({
    queryKey: ['/api/billing/subscription'],
    enabled: !!user?.companyId,
    staleTime: 1000 * 60 * 5,
  });

  if (!user || !subscription) {
    return <>{children}</>;
  }

  const emailVerified = !!(user as any).emailVerified;
  const profileComplete = !!(user as any).profileComplete;

  const isTrial = subscription.status === 'trial';
  const isPaid = subscription.status === 'active';

  if (!isTrial || isPaid) {
    return <>{children}</>;
  }

  const isVerified = emailVerified || profileComplete;

  if (isVerified) {
    return <>{children}</>;
  }

  return (
    <>
      <TrialVerificationBanner
        emailVerified={emailVerified}
        profileComplete={profileComplete}
        onNavigate={navigate}
      />
      {children}
    </>
  );
}

export function TrialVerificationBannerAuto() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const { data: subscription } = useQuery<SubscriptionResponse>({
    queryKey: ['/api/billing/subscription'],
    enabled: !!user?.companyId,
    staleTime: 1000 * 60 * 5,
  });

  if (!user || !subscription) {
    return null;
  }

  const emailVerified = !!(user as any).emailVerified;
  const profileComplete = !!(user as any).profileComplete;

  const isTrial = subscription.status === 'trial';
  const isPaid = subscription.status === 'active';

  if (!isTrial || isPaid) {
    return null;
  }

  const isVerified = emailVerified || profileComplete;

  if (isVerified) {
    return null;
  }

  return (
    <TrialVerificationBanner
      emailVerified={emailVerified}
      profileComplete={profileComplete}
      onNavigate={navigate}
    />
  );
}

interface TrialVerificationBannerProps {
  emailVerified: boolean;
  profileComplete: boolean;
  onNavigate: (path: string) => void;
}

export function TrialVerificationBanner({ 
  emailVerified, 
  profileComplete, 
  onNavigate 
}: TrialVerificationBannerProps) {
  const isVerified = emailVerified || profileComplete;

  if (isVerified) {
    return null;
  }

  return (
    <Alert className="mb-4 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20" data-testid="alert-trial-verification">
      <Info className="h-4 w-4 text-amber-600 dark:text-amber-500" />
      <AlertTitle className="text-amber-800 dark:text-amber-400">
        Completa tu cuenta para acceder a todas las funcionalidades
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-amber-700 dark:text-amber-300 text-sm mb-3">
          Para descargar PDFs y acceder a todas las funciones durante tu período de prueba, 
          necesitas verificar tu correo electrónico o completar el perfil de tu empresa.
        </p>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm">
            {emailVerified ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <Mail className="h-4 w-4 text-amber-600" />
            )}
            <span className={emailVerified ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-300"}>
              {emailVerified ? "Correo verificado" : "Correo pendiente"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {profileComplete ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <Building2 className="h-4 w-4 text-amber-600" />
            )}
            <span className={profileComplete ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-300"}>
              {profileComplete ? "Perfil completo" : "Perfil incompleto"}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {!emailVerified && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onNavigate('/mi-cuenta')}
              className="border-amber-500 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-900/30"
              data-testid="button-verify-email"
            >
              <Mail className="h-4 w-4 mr-2" />
              Verificar correo
            </Button>
          )}
          {!profileComplete && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onNavigate('/configuracion/mi-empresa')}
              className="border-amber-500 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-900/30"
              data-testid="button-complete-profile"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Completar perfil
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

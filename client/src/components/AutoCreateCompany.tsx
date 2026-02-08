import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const REGISTRATION_KEYS = [
  'sst_registration_company_name',
  'sst_registration_email',
  'sst_registration_username',
  'sst_registration_nit',
  'sst_registration_city',
  'sst_registration_ciiu',
  'sst_registration_workers',
  'sst_registration_vehicles',
  'sst_registration_address',
  'sst_registration_phone',
  'sst_registration_risk',
  'sst_quote_data',
  'sst_quote_token',
] as const;

function getStoredRegistrationData() {
  if (typeof window === 'undefined') return null;

  const companyName = localStorage.getItem('sst_registration_company_name');
  const ciiu = localStorage.getItem('sst_registration_ciiu');
  const nit = localStorage.getItem('sst_registration_nit');
  const city = localStorage.getItem('sst_registration_city');
  const address = localStorage.getItem('sst_registration_address');
  const phone = localStorage.getItem('sst_registration_phone');

  if (!companyName || !ciiu || !nit || !city || !address || !phone) {
    return null;
  }

  const workers = parseInt(localStorage.getItem('sst_registration_workers') || '1', 10);
  const vehicles = parseInt(localStorage.getItem('sst_registration_vehicles') || '0', 10);
  const risk = localStorage.getItem('sst_registration_risk') || 'I';
  const email = localStorage.getItem('sst_registration_email') || '';

  return {
    name: companyName,
    nit,
    city,
    ciiuCode: ciiu,
    address,
    contactPhone: phone,
    contactEmail: email,
    numberOfWorkers: isNaN(workers) || workers < 1 ? 1 : workers,
    numberOfVehicles: isNaN(vehicles) ? 0 : vehicles,
    riskLevel: risk as "I" | "II" | "III" | "IV" | "V",
  };
}

function clearStoredRegistrationData() {
  REGISTRATION_KEYS.forEach(key => localStorage.removeItem(key));
  sessionStorage.removeItem('sst_onboarding_workers');
}

export function hasStoredRegistrationData(): boolean {
  if (typeof window === 'undefined') return false;
  const data = getStoredRegistrationData();
  return data !== null;
}

export default function AutoCreateCompany() {
  const { toast } = useToast();
  const [status, setStatus] = useState<'creating' | 'success' | 'error'>('creating');
  const [errorMessage, setErrorMessage] = useState('');
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (attemptedRef.current) return;
    attemptedRef.current = true;

    const createCompany = async () => {
      const data = getStoredRegistrationData();
      if (!data) {
        setStatus('error');
        setErrorMessage('No se encontraron datos de registro.');
        setTimeout(() => { window.location.href = "/crear-empresa"; }, 1500);
        return;
      }

      try {
        const payload: Record<string, any> = { ...data };
        const storedQuote = localStorage.getItem('sst_quote_data');
        if (storedQuote) {
          try {
            const quoteData = JSON.parse(storedQuote);
            if (quoteData.baseMonthlyPrice) payload.quoteBaseMonthlyPrice = quoteData.baseMonthlyPrice;
            if (quoteData.currentPeriodPrice) payload.quoteCurrentPeriodPrice = quoteData.currentPeriodPrice;
            if (quoteData.discountDurationMonths) payload.quoteDiscountDurationMonths = quoteData.discountDurationMonths;
            if (quoteData.couponCode) payload.quoteCouponCode = quoteData.couponCode;
            if (quoteData.referrerId) payload.quoteReferrerId = quoteData.referrerId;
          } catch {}
        }

        const response = await apiRequest("POST", "/api/my-company", payload);
        const result = await response.json();

        clearStoredRegistrationData();

        if (result.user) {
          queryClient.setQueryData(["/api/user"], result.user);
        }
        await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        await queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
        await queryClient.invalidateQueries({ queryKey: ["/api/company/current"] });

        setStatus('success');
        toast({
          title: "Tu empresa ha sido creada",
          description: result.message || "Tu período de prueba de 7 días ha comenzado.",
        });

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 800);
      } catch (err: any) {
        console.error('[AutoCreateCompany] Error:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Error al crear la empresa. Completa el registro manualmente.');
        setTimeout(() => { window.location.href = "/crear-empresa"; }, 2000);
      }
    };

    createCompany();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen" data-testid="auto-create-company-screen">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          {status === 'creating' && (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Configurando tu empresa...</h3>
                <p className="text-sm text-muted-foreground">
                  Estamos creando tu cuenta empresarial y activando tu período de prueba gratuito.
                </p>
              </div>
            </>
          )}
          {status === 'success' && (
            <>
              <Building2 className="h-10 w-10 text-green-600" />
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Empresa creada exitosamente</h3>
                <p className="text-sm text-muted-foreground">Redirigiendo al panel de control...</p>
              </div>
            </>
          )}
          {status === 'error' && (
            <>
              <Building2 className="h-10 w-10 text-destructive" />
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Completar registro</h3>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
                <p className="text-xs text-muted-foreground">Redirigiendo...</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

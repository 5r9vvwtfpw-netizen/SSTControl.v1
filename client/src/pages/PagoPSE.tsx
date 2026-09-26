import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Mail,
  Landmark,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EpaycoBank {
  code: string;
  name: string;
}

interface EpaycoStatus {
  configured: boolean;
  test: boolean;
  method: 'PSE';
}

interface WorkerBillingQuote {
  employeeCount: number;
  baseMonthlyPrice: number;
  currentPeriodPrice: number;
  paymentAmount: number;
  discountDurationMonths: number;
  couponCode: string | null;
  currency: 'COP';
}

interface FormState {
  bankCode: string;
  userType: '0' | '1';
  idType: 'CC' | 'CE' | 'NIT' | 'PP' | 'TI';
  idNumber: string;
  email: string;
  fullName: string;
  cellPhone: string;
}

const initialForm: FormState = {
  bankCode: '',
  userType: '0',
  idType: 'CC',
  idNumber: '',
  email: '',
  fullName: '',
  cellPhone: '',
};

export default function PagoPSE() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(initialForm);
  const searchParams = new URLSearchParams(window.location.search);
  const isExtraSeatPurchase = searchParams.get('purchaseType') === 'extra_seat';
  const extraSeatRole = isExtraSeatPurchase ? searchParams.get('role') : null;
  const returnPath = isExtraSeatPurchase ? '/usuarios' : '/checkout';

  const { data: status, isLoading: loadingStatus } = useQuery<EpaycoStatus>({
    queryKey: ['/api/epayco/estado'],
  });

  const { data: banksData, isLoading: loadingBanks } = useQuery<{ banks: EpaycoBank[] }>({
    queryKey: ['/api/epayco/pse/bancos'],
    enabled: status?.configured === true,
  });

  const quoteQuery = useQuery<WorkerBillingQuote>({
    queryKey: ['/api/epayco/pse/cotizacion'],
    queryFn: async () => {
      const response = await fetch('/api/epayco/pse/cotizacion', { credentials: 'include' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No se pudo verificar la cotización vigente.');
      return result as WorkerBillingQuote;
    },
    enabled: status?.configured === true && !isExtraSeatPurchase,
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: false,
  });

  const startPayment = useMutation({
    mutationFn: async (data: FormState) => {
      if (!isExtraSeatPurchase && !quoteQuery.data) {
        throw new Error('No se pudo verificar la cotización vigente. No se inició ningún cobro.');
      }
      const response = await fetch('/api/epayco/pse/iniciar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          ...(!isExtraSeatPurchase ? {
            expectedAmount: quoteQuery.data!.paymentAmount,
            expectedEmployeeCount: quoteQuery.data!.employeeCount,
          } : {}),
          ...(isExtraSeatPurchase ? { purchaseType: 'extra_seat', role: extraSeatRole } : {}),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 409 && !isExtraSeatPurchase) {
          void queryClient.invalidateQueries({ queryKey: ['/api/epayco/pse/cotizacion'] });
        }
        if (result.redirectTo) {
          navigate(result.redirectTo);
          throw new Error('');
        }
        throw new Error(result.error || result.message || 'No se pudo iniciar el pago PSE');
      }
      return result as { bankRedirectUrl: string };
    },
    onSuccess: (data) => {
      window.location.assign(data.bankRedirectUrl);
    },
    onError: (error: Error) => {
      if (!error.message) return;
      toast({
        title: 'No se pudo iniciar el pago',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const sendPaymentLink = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/epayco/pse/enlace/enviar', {
        method: 'POST',
        credentials: 'include',
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || result.message || 'No se pudo enviar el enlace de pago');
      }
      return result as { message?: string; recipientMasked?: string };
    },
    onSuccess: (result) => {
      toast({
        title: 'Enlace de pago enviado',
        description: result.recipientMasked
          ? `Se envió al correo de contacto registrado ${result.recipientMasked}.`
          : result.message || 'El enlace se envió al correo de contacto registrado.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'No se pudo enviar el enlace',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startPayment.mutate(form);
  };

  if (loadingStatus) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!status?.configured) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Alert>
          <Landmark className="h-4 w-4" />
          <AlertTitle>Transferencia bancaria temporalmente no disponible</AlertTitle>
          <AlertDescription>
            El botón PSE está pendiente de configuración. No se ha iniciado ninguna
            transacción.
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => navigate(returnPath)} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {isExtraSeatPurchase ? 'Volver a usuarios' : 'Volver al checkout'}
        </Button>
      </div>
    );
  }

  const banks = banksData?.banks || [];

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(returnPath)} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {isExtraSeatPurchase ? 'Volver a usuarios' : 'Volver al checkout'}
      </Button>

      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <Landmark className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">
            {isExtraSeatPurchase ? 'Comprar usuario adicional por PSE' : 'Pagar por transferencia bancaria'}
          </h1>
        </div>
        <p className="text-muted-foreground">
          {isExtraSeatPurchase
            ? `Asiento adicional para el rol ${extraSeatRole} por $10.000 COP/mes. Selecciona tu banco para continuar en el portal seguro de ePayco.`
            : 'Selecciona tu banco y continúa en el portal seguro de ePayco. Este botón procesa únicamente pagos PSE.'}
        </p>
      </div>

      {!isExtraSeatPurchase && (
        <Alert
          className="mb-6"
          variant={quoteQuery.isError || !quoteQuery.data ? 'destructive' : 'default'}
          data-testid="alert-pse-billing-quote"
        >
          {quoteQuery.isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertTitle>Verificando cotización</AlertTitle>
              <AlertDescription>Consultando el precio firmado para los trabajadores facturables del próximo ciclo.</AlertDescription>
            </>
          ) : quoteQuery.data ? (
            <>
              <Landmark className="h-4 w-4" />
              <AlertTitle>Importe verificado antes del pago</AlertTitle>
              <AlertDescription>
                {quoteQuery.data.employeeCount} trabajadores facturables ·{' '}
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  maximumFractionDigits: 0,
                }).format(quoteQuery.data.paymentAmount)}
                {quoteQuery.data.paymentAmount === 0 && ' · No se iniciará un cobro para esta cotización.'}
              </AlertDescription>
            </>
          ) : (
            <>
              <Landmark className="h-4 w-4" />
              <AlertTitle>No se pudo verificar la cotización</AlertTitle>
              <AlertDescription>
                {quoteQuery.error instanceof Error
                  ? quoteQuery.error.message
                  : 'No se iniciará ningún cobro mientras no se pueda verificar el precio.'}
              </AlertDescription>
            </>
          )}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            Datos para PSE
          </CardTitle>
          <CardDescription>
            La información se envía cifrada a ePayco para iniciar la transferencia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="bankCode">Banco</Label>
              <select
                id="bankCode"
                value={form.bankCode}
                onChange={(event) => updateField('bankCode', event.target.value)}
                required
                disabled={loadingBanks || startPayment.isPending}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">
                  {loadingBanks ? 'Cargando bancos...' : 'Selecciona tu banco'}
                </option>
                {banks.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="userType">Tipo de persona</Label>
                <select
                  id="userType"
                  value={form.userType}
                  onChange={(event) => updateField('userType', event.target.value)}
                  disabled={startPayment.isPending}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="0">Persona natural</option>
                  <option value="1">Persona jurídica</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="idType">Tipo de documento</Label>
                <select
                  id="idType"
                  value={form.idType}
                  onChange={(event) => updateField('idType', event.target.value)}
                  disabled={startPayment.isPending}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="CC">Cédula de ciudadanía</option>
                  <option value="CE">Cédula de extranjería</option>
                  <option value="NIT">NIT</option>
                  <option value="PP">Pasaporte</option>
                  <option value="TI">Tarjeta de identidad</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="idNumber">Número de documento</Label>
                <Input
                  id="idNumber"
                  value={form.idNumber}
                  onChange={(event) => updateField('idNumber', event.target.value)}
                  required
                  minLength={5}
                  disabled={startPayment.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(event) => updateField('fullName', event.target.value)}
                  required
                  minLength={3}
                  disabled={startPayment.isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                required
                disabled={startPayment.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cellPhone">Celular del pagador</Label>
              <Input
                id="cellPhone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                pattern="[0-9]{10}"
                maxLength={10}
                title="Ingresa un celular colombiano de 10 dígitos"
                placeholder="3001234567"
                value={form.cellPhone}
                onChange={(event) => updateField('cellPhone', event.target.value)}
                required
                disabled={startPayment.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Son 10 dígitos; este dato es independiente del número de documento.
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
              <div className="mb-2 flex items-center gap-2 text-foreground">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <span className="font-medium">Pago único por PSE</span>
              </div>
              <p>
                No se guardan datos bancarios ni se crean cobros recurrentes. La
                confirmación final se valida en el servidor con ePayco.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={
                startPayment.isPending ||
                loadingBanks ||
                (!isExtraSeatPurchase && (!quoteQuery.data || quoteQuery.data.paymentAmount <= 0))
              }
            >
              {startPayment.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Conectando con ePayco...
                </>
              ) : (
                <>
                  <LockKeyhole className="mr-2 h-4 w-4" />
                  Continuar al banco por PSE
                </>
              )}
            </Button>
            {!isExtraSeatPurchase && <div className="border-t pt-5 text-center">
              <p className="mb-3 text-sm text-muted-foreground">
                Para restablecer el acceso al software, el responsable debe pagar por PSE.
                Envía el enlace al correo de contacto registrado en la empresa. El acceso
                se restablecerá cuando ePayco confirme el pago.
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => sendPaymentLink.mutate()}
                disabled={
                  sendPaymentLink.isPending ||
                  startPayment.isPending ||
                  quoteQuery.isLoading ||
                  quoteQuery.isError ||
                  !quoteQuery.data ||
                  quoteQuery.data.paymentAmount <= 0
                }
              >
                {sendPaymentLink.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                {sendPaymentLink.isPending ? 'Enviando enlace...' : 'Enviar enlace de pago'}
              </Button>
            </div>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
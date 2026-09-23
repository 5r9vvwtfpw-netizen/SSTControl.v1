import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Landmark,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
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

interface FormState {
  bankCode: string;
  userType: '0' | '1';
  idType: 'CC' | 'CE' | 'NIT' | 'PP' | 'TI';
  idNumber: string;
  email: string;
  fullName: string;
}

const initialForm: FormState = {
  bankCode: '',
  userType: '0',
  idType: 'CC',
  idNumber: '',
  email: '',
  fullName: '',
};

export default function PagoPSE() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(initialForm);

  const { data: status, isLoading: loadingStatus } = useQuery<EpaycoStatus>({
    queryKey: ['/api/epayco/estado'],
  });

  const { data: banksData, isLoading: loadingBanks } = useQuery<{ banks: EpaycoBank[] }>({
    queryKey: ['/api/epayco/pse/bancos'],
    enabled: status?.configured === true,
  });

  const startPayment = useMutation({
    mutationFn: async (data: FormState) => {
      const response = await apiRequest('POST', '/api/epayco/pse/iniciar', data);
      return response.json() as Promise<{ bankRedirectUrl: string }>;
    },
    onSuccess: (data) => {
      window.location.assign(data.bankRedirectUrl);
    },
    onError: (error: Error) => {
      toast({
        title: 'No se pudo iniciar el pago',
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
        <Button variant="outline" onClick={() => navigate('/checkout')} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al checkout
        </Button>
      </div>
    );
  }

  const banks = banksData?.banks || [];

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/checkout')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al checkout
      </Button>

      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <Landmark className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Pagar por transferencia bancaria</h1>
        </div>
        <p className="text-muted-foreground">
          Selecciona tu banco y continúa en el portal seguro de ePayco. Este botón
          procesa únicamente pagos PSE.
        </p>
      </div>

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

            <Button type="submit" className="w-full" size="lg" disabled={startPayment.isPending || loadingBanks}>
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
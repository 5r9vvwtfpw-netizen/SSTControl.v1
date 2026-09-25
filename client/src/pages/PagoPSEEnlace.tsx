import { useState } from 'react';
import { useSearch } from 'wouter';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, CheckCircle2, Landmark, Loader2, LockKeyhole, ShieldCheck, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EpaycoBank {
  code: string;
  name: string;
}

interface PaymentLink {
  companyName: string;
  amount: number | string;
  currency: string;
  banks: EpaycoBank[];
  status: string;
}

interface LinkPaymentStatus {
  status: string;
  providerStatus: string | null;
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

const PAYMENT_LINK_TOKEN_KEY = 'epayco-pse-payment-link-token';

function storePaymentLinkToken(token: string) {
  try {
    window.sessionStorage.setItem(PAYMENT_LINK_TOKEN_KEY, token);
    return true;
  } catch {
    // Keep the active page usable if browser storage is unavailable.
    return false;
  }
}

function getPaymentLinkToken() {
  if (typeof window === 'undefined') return '';
  const fragment = window.location.hash.slice(1);
  if (fragment) {
    let token = fragment;
    try {
      token = decodeURIComponent(fragment);
    } catch {
      // Treat a malformed fragment as its literal token value.
    }
    if (storePaymentLinkToken(token)) {
      window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}${window.location.search}`,
      );
    }
    return token;
  }
  try {
    return window.sessionStorage.getItem(PAYMENT_LINK_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

class PublicPaymentError extends Error {
  constructor(message: string, readonly statusCode: number) {
    super(message);
  }
}

async function readResponse<T>(response: Response): Promise<T> {
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = result.error || result.message || (
      response.status === 404 ? 'Este enlace no es válido o ya no está disponible.' :
        response.status === 410 ? 'Este enlace de pago ha vencido.' :
          'No se pudo consultar el enlace de pago.'
    );
    throw new PublicPaymentError(message, response.status);
  }
  return result as T;
}

function isTerminalStatus(status?: string | null) {
  return ['APPROVED', 'DECLINED', 'ERROR', 'EXPIRED', 'INVALID', 'CANCELLED'].includes(
    (status || '').toUpperCase(),
  );
}

function formatAmount(amount: number | string, currency: string) {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) return `${amount} ${currency}`;
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(numericAmount);
  } catch {
    return `${numericAmount.toLocaleString('es-CO')} ${currency}`;
  }
}

export default function PagoPSEEnlace() {
  const [token] = useState(getPaymentLinkToken);
  const linkCacheKey = token.slice(-12);
  const search = new URLSearchParams(useSearch());
  const invoice = search.get('invoice');
  const [form, setForm] = useState<FormState>(initialForm);

  const linkQuery = useQuery<PaymentLink>({
    queryKey: ['/api/epayco/pse/enlace/detalle', linkCacheKey],
    enabled: Boolean(token),
    retry: false,
    queryFn: async () => {
      const response = await fetch('/api/epayco/pse/enlace/detalle', {
        headers: { 'X-Payment-Link-Token': token },
        credentials: 'omit',
      });
      return readResponse<PaymentLink>(response);
    },
  });
  const linkStatus = (linkQuery.data?.status || '').toUpperCase();
  const showStatus = Boolean(invoice) || linkStatus === 'USED';

  const statusQuery = useQuery<LinkPaymentStatus>({
    queryKey: ['/api/epayco/pse/enlace/estado', linkCacheKey, invoice || 'latest'],
    enabled: Boolean(token && showStatus),
    retry: false,
    refetchInterval: (query) => {
      const current = query.state.data;
      return query.state.status !== 'error' &&
        (!current || (!isTerminalStatus(current.status) && current.status !== 'APPROVED'))
        ? 15000
        : false;
    },
    queryFn: async () => {
      const invoiceParam = invoice ? `?invoice=${encodeURIComponent(invoice)}` : '';
      const response = await fetch(
        `/api/epayco/pse/enlace/estado${invoiceParam}`,
        {
          headers: { 'X-Payment-Link-Token': token },
          credentials: 'omit',
        },
      );
      return readResponse<LinkPaymentStatus>(response);
    },
  });

  const startPayment = useMutation({
    mutationFn: async (data: FormState) => {
      const response = await fetch('/api/epayco/pse/enlace/iniciar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Payment-Link-Token': token,
        },
        credentials: 'omit',
        body: JSON.stringify(data),
      });
      return readResponse<{ bankRedirectUrl: string; invoice: string }>(response);
    },
    onSuccess: ({ bankRedirectUrl }) => {
      storePaymentLinkToken(token);
      window.location.assign(bankRedirectUrl);
    },
  });

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const paymentStatus = statusQuery.data?.status?.toUpperCase();
  const approved = paymentStatus === 'APPROVED';
  const failedStatus = ['DECLINED', 'ERROR', 'EXPIRED', 'INVALID', 'CANCELLED'].includes(paymentStatus || '');
  const inactiveLink = ['EXPIRED', 'INVALID', 'CANCELLED', 'INACTIVE'].includes(linkStatus);
  const error = linkQuery.error || statusQuery.error;

  if (!token) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <AlertCircle className="h-7 w-7 text-blue-600" />
            </div>
            <CardTitle className="text-center">Abre el enlace de pago de tu correo</CardTitle>
            <CardDescription className="text-center">
              No encontramos el acceso seguro de este enlace en esta sesión. Abre nuevamente el enlace original recibido por correo para consultar el pago.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  if (linkQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Cargando enlace de pago">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (linkQuery.isError || !linkQuery.data || inactiveLink) {
    const expired = linkStatus === 'EXPIRED' ||
      (error instanceof PublicPaymentError && error.statusCode === 410);
    return (
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <XCircle className="h-7 w-7 text-red-600" />
            </div>
            <CardTitle className="text-center">{expired ? 'Enlace de pago vencido' : 'Enlace no disponible'}</CardTitle>
            <CardDescription className="text-center">
              {error?.message || (expired
                ? 'Este enlace seguro de pago ha vencido. Solicita a la empresa que genere uno nuevo.'
                : 'No pudimos validar este enlace de pago. Verifica que la dirección sea correcta o solicita un nuevo enlace.')}
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const link = linkQuery.data;
  const pending = showStatus && !approved && !failedStatus && !statusQuery.isError;

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-start gap-3">
        <div className="mt-1 rounded-full bg-primary/10 p-2">
          <Landmark className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Pago seguro por PSE</h1>
          <p className="mt-1 text-muted-foreground">
            Enlace de pago para <span className="font-medium text-foreground">{link.companyName}</span>
          </p>
        </div>
      </div>

      {showStatus ? (
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
              approved ? 'bg-green-100 dark:bg-green-900/20' :
                failedStatus ? 'bg-red-100 dark:bg-red-900/20' : 'bg-blue-100 dark:bg-blue-900/20'
            }`}>
              {approved ? <CheckCircle2 className="h-7 w-7 text-green-600" /> :
                failedStatus ? <XCircle className="h-7 w-7 text-red-600" /> :
                  statusQuery.isError ? <AlertCircle className="h-7 w-7 text-blue-600" /> :
                    <Loader2 className="h-7 w-7 animate-spin text-blue-600" />}
            </div>
            <CardTitle>
              {approved ? 'Pago confirmado' :
                failedStatus ? 'El pago no fue aprobado' :
                  statusQuery.isError ? 'No pudimos consultar el estado' : 'Pago en verificación'}
            </CardTitle>
            <CardDescription>
              {approved
                ? 'La confirmación del pago fue verificada por el servidor.'
                : failedStatus
                  ? 'Este intento no fue confirmado. Puedes solicitar a la empresa un nuevo enlace de pago.'
                  : statusQuery.isError
                    ? 'No podemos confirmar el resultado en este momento. Intenta consultar de nuevo más tarde.'
                    : 'Estamos esperando la confirmación final de ePayco. No inicies otro pago; esta página se actualizará automáticamente.'}
            </CardDescription>
          </CardHeader>
          {pending && (
            <CardContent className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              El pago solo se considera aprobado después de la validación del servidor.
            </CardContent>
          )}
        </Card>
      ) : (
        <>
          {linkStatus === 'APPROVED' && (
            <Alert className="mb-5">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Este enlace ya fue utilizado</AlertTitle>
              <AlertDescription>Para proteger tu pago, solicita a la empresa la confirmación de la transacción.</AlertDescription>
            </Alert>
          )}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Detalle del pago</CardTitle>
              <CardDescription>Confirma el valor antes de continuar con tu banco.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-muted-foreground">Empresa</span>
              <span className="font-medium">{link.companyName}</span>
              <span className="mt-3 text-muted-foreground sm:ml-auto sm:mt-0 sm:mr-4">Total</span>
              <span className="text-xl font-bold">{formatAmount(link.amount, link.currency)}</span>
            </CardContent>
          </Card>

          {startPayment.error && (
            <Alert variant="destructive" className="mb-5">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No se pudo iniciar el pago</AlertTitle>
              <AlertDescription>{startPayment.error.message}</AlertDescription>
            </Alert>
          )}

          {linkStatus === 'APPROVED' ? null : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Landmark className="h-5 w-5" />
                  Datos del pagador
                </CardTitle>
                <CardDescription>
                  Tus datos se usan para iniciar la transferencia PSE y se envían de forma segura a ePayco.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    storePaymentLinkToken(token);
                    startPayment.mutate(form);
                  }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="bankCode">Banco</Label>
                    <select
                      id="bankCode"
                      value={form.bankCode}
                      onChange={(event) => updateField('bankCode', event.target.value)}
                      required
                      disabled={startPayment.isPending}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Selecciona tu banco</option>
                      {link.banks.map((bank) => (
                        <option key={bank.code} value={bank.code}>{bank.name}</option>
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
                      <Input id="idNumber" value={form.idNumber} onChange={(event) => updateField('idNumber', event.target.value)} required minLength={5} disabled={startPayment.isPending} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nombre completo</Label>
                      <Input id="fullName" value={form.fullName} onChange={(event) => updateField('fullName', event.target.value)} required minLength={3} disabled={startPayment.isPending} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico del pagador</Label>
                    <Input id="email" type="email" autoComplete="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} required disabled={startPayment.isPending} />
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
                    <p className="text-xs text-muted-foreground">Ingresa un celular colombiano de 10 dígitos.</p>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                    <div className="mb-2 flex items-center gap-2 text-foreground">
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Conexión segura</span>
                    </div>
                    No se almacenan datos bancarios. La confirmación final se valida en el servidor.
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={startPayment.isPending}>
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
          )}
        </>
      )}

      {showStatus && statusQuery.isError && (
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => statusQuery.refetch()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Consultar estado nuevamente
          </Button>
        </div>
      )}
    </main>
  );
}
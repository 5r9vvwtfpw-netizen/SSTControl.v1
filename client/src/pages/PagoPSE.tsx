/**
 * Página de Pago PSE — Transferencia Bancaria Colombia
 *
 * Flujo:
 * 1. Usuario selecciona banco, tipo de persona, documento e email
 * 2. Se crea transacción en Wompi → obtenemos URL del banco
 * 3. Redirigimos al banco para que el cliente autorice el débito
 * 4. Banco redirige de vuelta a /pago-pse/retorno?id={transactionId}
 */

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Loader2, Building2, Landmark, AlertCircle, ExternalLink,
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { ColombianFlag } from '@/components/ColombianFlag';

interface FinancialInstitution {
  financial_institution_code: string;
  financial_institution_name: string;
}

interface CompanyData {
  id: string;
  name: string;
  quoteBaseMonthlyPrice: number | null;
  quoteCurrentPeriodPrice: number | null;
  quoteCouponCode: string | null;
}

interface WompiEstado {
  configured: boolean;
  sandbox: boolean;
}

interface IniciarPseResponse {
  transactionId: string;
  reference: string;
  bankRedirectUrl: string;
  amountInCents: number;
  status: string;
}

const ID_TYPES = [
  { value: 'CC', label: 'Cédula de Ciudadanía (CC)' },
  { value: 'CE', label: 'Cédula de Extranjería (CE)' },
  { value: 'NIT', label: 'NIT (empresa)' },
  { value: 'PP', label: 'Pasaporte (PP)' },
  { value: 'TI', label: 'Tarjeta de Identidad (TI)' },
];

function formatCurrency(value: number): string {
  return '$' + new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PagoPSE() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const [bankCode, setBankCode] = useState('');
  const [userType, setUserType] = useState<'0' | '1'>('0'); // 0=natural, 1=jurídica
  const [idType, setIdType] = useState('CC');
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState(user?.email || user?.username || '');
  const [fullName, setFullName] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Verificar si Wompi está configurado
  const { data: wompiEstado, isLoading: loadingEstado } = useQuery<WompiEstado>({
    queryKey: ['/api/wompi/estado'],
    enabled: !!user?.companyId,
  });

  // Datos de la empresa y precio
  const { data: company, isLoading: loadingCompany } = useQuery<CompanyData>({
    queryKey: ['/api/company/current'],
    enabled: !!user?.companyId,
  });

  // Lista de bancos PSE (solo si Wompi está configurado)
  const { data: bancosData, isLoading: loadingBancos } = useQuery<{ banks: FinancialInstitution[] }>({
    queryKey: ['/api/wompi/bancos'],
    enabled: !!wompiEstado?.configured,
  });

  const iniciarPseMutation = useMutation({
    mutationFn: async () => {
      if (!bankCode) throw new Error('Seleccione un banco');
      if (!idNumber.trim()) throw new Error('Ingrese su número de documento');
      if (!fullName.trim()) throw new Error('Ingrese su nombre completo');
      if (!email.trim()) throw new Error('Ingrese su email');

      const res = await apiRequest('POST', '/api/wompi/pse/iniciar', {
        bankCode,
        userType: parseInt(userType),
        idType,
        idNumber: idNumber.trim(),
        email: email.trim(),
        fullName: fullName.trim(),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Error iniciando transacción PSE');
      }

      return (await res.json()) as IniciarPseResponse;
    },
    onSuccess: (data) => {
      setIsRedirecting(true);
      toast({
        title: 'Redirigiendo al banco',
        description: 'Será redirigido a su banco para autorizar el pago. No cierre esta ventana.',
      });
      // Pequeño delay para que el usuario vea el mensaje antes de la redirección
      setTimeout(() => {
        window.location.href = data.bankRedirectUrl;
      }, 1500);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al iniciar PSE',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (loadingEstado || loadingCompany) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!wompiEstado?.configured) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>PSE no disponible</AlertTitle>
          <AlertDescription>
            El pago por transferencia bancaria PSE no está disponible en este momento.
            Por favor use tarjeta de crédito/débito o contacte a soporte.
          </AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => navigate('/checkout')}
          className="mt-4"
          data-testid="button-back-to-checkout"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al pago con tarjeta
        </Button>
      </div>
    );
  }

  const quotePrice = company?.quoteCurrentPeriodPrice != null && (company.quoteCurrentPeriodPrice > 0)
    ? company.quoteCurrentPeriodPrice
    : company?.quoteBaseMonthlyPrice;

  if (isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6">
        <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
          <Landmark className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Conectando con su banco...</h2>
          <p className="text-muted-foreground">Será redirigido al portal de su banco para autorizar el pago.</p>
          <p className="text-sm text-muted-foreground">No cierre ni recargue esta página.</p>
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/checkout')}
        className="mb-6"
        data-testid="button-back"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a métodos de pago
      </Button>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <ColombianFlag width={32} height={22} />
          <h1 className="text-3xl font-bold" data-testid="text-pse-title">
            Pago PSE — Transferencia Bancaria
          </h1>
        </div>
        {wompiEstado.sandbox && (
          <Badge variant="outline" className="mt-2 text-amber-600 border-amber-400">
            Modo Sandbox — Solo para pruebas
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel izquierdo: resumen del precio */}
        <div className="space-y-6">
          {company && quotePrice && (
            <Card data-testid="card-price-summary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {company.name}
                </CardTitle>
                <CardDescription>Resumen del pago mensual</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-muted-foreground">Suscripción SST Colombia</span>
                  <span className="text-2xl font-bold text-primary" data-testid="text-price">
                    {formatCurrency(quotePrice)}
                  </span>
                </div>
                {company.quoteCurrentPeriodPrice != null &&
                  company.quoteBaseMonthlyPrice != null &&
                  company.quoteCurrentPeriodPrice < company.quoteBaseMonthlyPrice && (
                    <div className="p-2 rounded-md bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 text-sm">
                      <span className="text-green-700 dark:text-green-300 font-medium">
                        Precio con descuento{company.quoteCouponCode ? ` (${company.quoteCouponCode})` : ''}
                      </span>
                    </div>
                  )}

              </CardContent>
            </Card>
          )}

        </div>

        {/* Panel derecho: formulario PSE */}
        <div>
          <Card data-testid="card-pse-form">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5" />
                Datos para PSE
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Banco */}
              <div className="space-y-1.5">
                <Label htmlFor="bank-select">Banco <span className="text-destructive">*</span></Label>
                {loadingBancos ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando bancos...
                  </div>
                ) : (
                  <Select
                    value={bankCode}
                    onValueChange={setBankCode}
                  >
                    <SelectTrigger id="bank-select" data-testid="select-bank">
                      <SelectValue placeholder="Seleccione su banco..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {(bancosData?.banks || []).map((bank) => (
                        <SelectItem
                          key={bank.financial_institution_code}
                          value={bank.financial_institution_code}
                          data-testid={`option-bank-${bank.financial_institution_code}`}
                        >
                          {bank.financial_institution_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Tipo de persona */}
              <div className="space-y-1.5">
                <Label htmlFor="user-type-select">Tipo de persona <span className="text-destructive">*</span></Label>
                <Select
                  value={userType}
                  onValueChange={(v) => setUserType(v as '0' | '1')}
                >
                  <SelectTrigger id="user-type-select" data-testid="select-user-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0" data-testid="option-persona-natural">Persona Natural</SelectItem>
                    <SelectItem value="1" data-testid="option-persona-juridica">Persona Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de documento */}
              <div className="space-y-1.5">
                <Label htmlFor="id-type-select">Tipo de documento <span className="text-destructive">*</span></Label>
                <Select value={idType} onValueChange={setIdType}>
                  <SelectTrigger id="id-type-select" data-testid="select-id-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ID_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value} data-testid={`option-id-${t.value}`}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Número de documento */}
              <div className="space-y-1.5">
                <Label htmlFor="id-number">Número de documento <span className="text-destructive">*</span></Label>
                <Input
                  id="id-number"
                  type="text"
                  inputMode="numeric"
                  placeholder="Ej: 900123456"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ''))}
                  data-testid="input-id-number"
                />
              </div>

              {/* Nombre completo */}
              <div className="space-y-1.5">
                <Label htmlFor="full-name">Nombre completo / Razón social <span className="text-destructive">*</span></Label>
                <Input
                  id="full-name"
                  type="text"
                  placeholder="Nombre tal como aparece en su cuenta bancaria"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  data-testid="input-full-name"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email-input">Correo electrónico <span className="text-destructive">*</span></Label>
                <Input
                  id="email-input"
                  type="email"
                  placeholder="correo@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-email"
                />
                <p className="text-xs text-muted-foreground">
                  El comprobante de pago será enviado a este correo
                </p>
              </div>

              <Separator />

              <Button
                className="w-full"
                size="lg"
                onClick={() => iniciarPseMutation.mutate()}
                disabled={iniciarPseMutation.isPending || !bankCode || !idNumber.trim() || !fullName.trim() || !email.trim()}
                data-testid="button-pagar-pse"
              >
                {iniciarPseMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Iniciando...
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ir al banco para pagar
                    {quotePrice ? ` — ${formatCurrency(quotePrice)}` : ''}
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Al continuar, acepta nuestros términos de servicio. Será redirigido
                al portal seguro de su banco. La suscripción se activa al confirmar el pago.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useLocation, useSearch } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Landmark, Loader2, XCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

type PaymentStatus = {
  invoice: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';
  reason: string | null;
  updatedAt: string;
};

export default function PagoPSERetorno() {
  const [, navigate] = useLocation();
  const search = new URLSearchParams(useSearch());
  const invoice = search.get('invoice');
  const { data: payment, isError } = useQuery<PaymentStatus>({
    queryKey: ['/api/epayco/pse/transaccion', invoice || 'latest'],
    queryFn: async () => {
      const url = `/api/epayco/pse/transaccion${invoice ? `?invoice=${encodeURIComponent(invoice)}` : ''}`;
      const response = await apiRequest('GET', url);
      return response.json();
    },
    refetchInterval: (query) =>
      query.state.status !== 'error' && (!query.state.data || query.state.data.status === 'PENDING')
        ? 8_000
        : false,
  });

  const approved = payment?.status === 'APPROVED';
  const declined = payment?.status === 'DECLINED';
  const failed = payment?.status === 'ERROR';
  const pending = !isError && !approved && !declined && !failed;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card className="text-center">
        <CardHeader>
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
            approved ? 'bg-green-100 dark:bg-green-900/20' :
            declined || failed ? 'bg-red-100 dark:bg-red-900/20' :
            'bg-blue-100 dark:bg-blue-900/20'
          }`}>
            {approved ? (
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            ) : declined || failed ? (
              <XCircle className="h-8 w-8 text-red-600" />
            ) : isError ? (
              <AlertCircle className="h-8 w-8 text-blue-600" />
            ) : (
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {approved ? 'Pago confirmado' :
              declined ? 'El pago no fue aprobado' :
              failed ? 'No se pudo iniciar el pago' :
              isError ? 'No pudimos consultar el estado del pago' :
              'Pago en verificación'}
          </CardTitle>
          <CardDescription>
            {approved ? 'ePayco confirmó el pago y la suscripción fue activada.' :
              declined ? 'ePayco comunicó que la transacción fue rechazada. Este intento no activó ni renovó la suscripción.' :
              failed ? 'La transacción no pudo iniciarse. Este intento no activó ni renovó la suscripción.' :
              isError ? 'Vuelve a intentarlo más tarde o revisa el estado de tu suscripción antes de pagar de nuevo.' :
              'Esperando la confirmación final de ePayco. No inicies otro pago mientras tanto.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(declined || failed) && payment?.reason && (
            <p className="text-sm text-muted-foreground">{payment.reason}</p>
          )}
          {pending && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              La suscripción solo se activa después de validar la confirmación del servidor.
            </div>
          )}
          <Button onClick={() => navigate('/checkout')} data-testid="button-return-checkout">
            <Landmark className="mr-2 h-4 w-4" />
            Volver al checkout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
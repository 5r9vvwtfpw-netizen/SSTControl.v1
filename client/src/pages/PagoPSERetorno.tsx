import { useLocation, useSearch } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Landmark, Loader2 } from 'lucide-react';

export default function PagoPSERetorno() {
  const [, navigate] = useLocation();
  const search = new URLSearchParams(useSearch());
  const response = search.get('x_response')?.toLowerCase();
  const isRejected = response === 'rechazada' || response === 'fallida';

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
            {isRejected ? (
              <Landmark className="h-8 w-8 text-blue-600" />
            ) : (
              <CheckCircle2 className="h-8 w-8 text-blue-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isRejected ? 'El pago no fue aprobado' : 'Pago enviado a ePayco'}
          </CardTitle>
          <CardDescription>
            {isRejected
              ? 'Puedes iniciar nuevamente el pago por transferencia bancaria.'
              : 'Estamos esperando la confirmación final de ePayco y del banco.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isRejected && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              La suscripción se activa únicamente después de validar la confirmación del servidor.
            </div>
          )}
          <Button onClick={() => navigate('/checkout')} data-testid="button-return-checkout">
            <Landmark className="mr-2 h-4 w-4" />
            Volver al pago por transferencia
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
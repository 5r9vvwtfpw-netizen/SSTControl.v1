/**
 * Página de Retorno PSE — Resultado del pago bancario
 *
 * El banco redirige aquí con ?id={transactionId}
 * Consultamos el estado y activamos la suscripción si fue aprobada.
 */

import { useLocation } from 'wouter';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Landmark } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PagoPSERetorno() {
  const [, navigate] = useLocation();
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Alert>
        <Landmark className="h-4 w-4" />
        <AlertTitle>Resultado PSE no disponible</AlertTitle>
        <AlertDescription>
          Este retorno pertenece al flujo anterior de Wompi y ya no consulta
          ni procesa transacciones. Para realizar un pago, use tarjeta.
        </AlertDescription>
      </Alert>

      <Button
        onClick={() => navigate('/checkout')}
        className="mt-6"
        data-testid="button-try-card"
      >
        <CreditCard className="h-4 w-4 mr-2" />
        Pagar con tarjeta
      </Button>
    </div>
  );
}

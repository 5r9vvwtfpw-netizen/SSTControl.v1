import { useLocation } from 'wouter';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard, Landmark } from 'lucide-react';

/**
 * Pantalla de compatibilidad para la ruta histórica de PSE.
 *
 * El flujo Wompi se conserva en el backend para la migración, pero esta
 * pantalla no consulta ni inicia transacciones. Se reemplazará por ePayco
 * cuando estén disponibles sus credenciales, API y webhook.
 */
export default function PagoPSE() {
  const [, navigate] = useLocation();

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Alert>
        <Landmark className="h-4 w-4" />
        <AlertTitle>PSE temporalmente no disponible</AlertTitle>
        <AlertDescription>
          El pago por transferencia bancaria está temporalmente deshabilitado
          mientras habilitamos el nuevo proveedor de pagos. No se ha iniciado
          ninguna transacción.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button onClick={() => navigate('/checkout')} data-testid="button-back-to-checkout">
          <CreditCard className="h-4 w-4 mr-2" />
          Pagar con tarjeta
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/planes-suscripcion')}
          data-testid="button-back-to-plans"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a planes
        </Button>
      </div>
    </div>
  );
}
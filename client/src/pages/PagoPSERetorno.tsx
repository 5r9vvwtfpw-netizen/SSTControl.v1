/**
 * Página de Retorno PSE — Resultado del pago bancario
 *
 * El banco redirige aquí con ?id={transactionId}
 * Consultamos el estado y activamos la suscripción si fue aprobada.
 */

import { useEffect, useState } from 'react';
import { useSearch, useLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Clock, ArrowLeft, Home, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TransactionStatus {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';
  reference: string;
  amountInCents: number;
  currency: string;
  paymentMethod: string;
  createdAt: string;
  finalizedAt: string | null;
}

function formatCurrency(cents: number): string {
  return '$' + new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents);
}

const STATUS_MESSAGES: Record<string, { title: string; description: string }> = {
  PENDING: {
    title: 'Pago en proceso',
    description: 'Su pago está siendo procesado por la red bancaria. Esto puede tomar unos minutos.',
  },
  APPROVED: {
    title: '¡Pago aprobado!',
    description: 'Su pago PSE fue confirmado exitosamente. Su suscripción ya está activa.',
  },
  DECLINED: {
    title: 'Pago rechazado',
    description: 'El pago fue rechazado por su banco. Verifique que tenga saldo suficiente o intente con otro medio de pago.',
  },
  VOIDED: {
    title: 'Pago anulado',
    description: 'La transacción fue anulada. No se realizó ningún cargo.',
  },
  ERROR: {
    title: 'Error en el pago',
    description: 'Ocurrió un error al procesar el pago. Puede intentarlo nuevamente.',
  },
};

export default function PagoPSERetorno() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const queryClient = useQueryClient();
  const params = new URLSearchParams(searchString);
  const transactionId = params.get('id');

  const [pollingActive, setPollingActive] = useState(true);
  const [pollCount, setPollCount] = useState(0);
  const MAX_POLLS = 24; // 2 minutos a 5s de intervalo

  const { data: transaction, isLoading, error, refetch } = useQuery<TransactionStatus>({
    queryKey: ['/api/wompi/pse/estado', transactionId],
    queryFn: async () => {
      if (!transactionId) throw new Error('ID de transacción no encontrado');
      const res = await fetch(`/api/wompi/pse/estado/${transactionId}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Error consultando el pago');
      }
      return res.json();
    },
    enabled: !!transactionId,
    refetchInterval: pollingActive ? 5000 : false,
    refetchOnWindowFocus: false,
  });

  // Controlar el polling
  useEffect(() => {
    if (!transaction) return;

    const isTerminal = ['APPROVED', 'DECLINED', 'VOIDED', 'ERROR'].includes(transaction.status);

    if (isTerminal) {
      setPollingActive(false);
      // Invalidar caché de suscripción para que el sistema se actualice
      if (transaction.status === 'APPROVED') {
        queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
        queryClient.invalidateQueries({ queryKey: ['/api/stripe/subscription'] });
        queryClient.invalidateQueries({ queryKey: ['/api/company/current'] });
      }
    } else {
      setPollCount((c) => {
        const next = c + 1;
        if (next >= MAX_POLLS) setPollingActive(false);
        return next;
      });
    }
  }, [transaction, queryClient]);

  if (!transactionId) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            No se encontró el ID de transacción. Si realizó un pago, contacte a soporte con el comprobante del banco.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/')} className="mt-4" variant="outline">
          <Home className="h-4 w-4 mr-2" />
          Ir al inicio
        </Button>
      </div>
    );
  }

  const status = transaction?.status;
  const isApproved = status === 'APPROVED';
  const isDeclined = status === 'DECLINED' || status === 'VOIDED' || status === 'ERROR';
  const isPending = !status || status === 'PENDING';
  const timedOut = !pollingActive && isPending;

  return (
    <div className="container mx-auto py-8 px-4 max-w-xl">
      <Card className="text-center" data-testid="card-pse-result">
        <CardHeader>
          {isLoading && !transaction ? (
            <>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <CardTitle>Verificando pago...</CardTitle>
              <CardDescription>Consultando el estado de su transacción PSE</CardDescription>
            </>
          ) : isApproved ? (
            <>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center" data-testid="icon-approved">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl text-green-700 dark:text-green-400" data-testid="text-status-title">
                {STATUS_MESSAGES.APPROVED.title}
              </CardTitle>
              <CardDescription data-testid="text-status-description">
                {STATUS_MESSAGES.APPROVED.description}
              </CardDescription>
            </>
          ) : isDeclined ? (
            <>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center" data-testid="icon-declined">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl" data-testid="text-status-title">
                {STATUS_MESSAGES[status!]?.title || 'Pago no completado'}
              </CardTitle>
              <CardDescription data-testid="text-status-description">
                {STATUS_MESSAGES[status!]?.description}
              </CardDescription>
            </>
          ) : timedOut ? (
            <>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-2xl" data-testid="text-status-title">
                Pago aún en proceso
              </CardTitle>
              <CardDescription data-testid="text-status-description">
                El banco no ha confirmado el pago todavía. Puede cerrar esta página — le notificaremos cuando se confirme.
              </CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center" data-testid="icon-pending">
                <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-pulse" />
              </div>
              <CardTitle className="text-2xl" data-testid="text-status-title">
                {STATUS_MESSAGES.PENDING.title}
              </CardTitle>
              <CardDescription data-testid="text-status-description">
                {STATUS_MESSAGES.PENDING.description}
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {transaction && (
            <div className="bg-muted/40 rounded-md p-4 text-left text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID Transacción</span>
                <span className="font-mono text-xs" data-testid="text-transaction-id">{transaction.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monto</span>
                <span className="font-semibold" data-testid="text-amount">
                  {formatCurrency(transaction.amountInCents)} COP
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Método</span>
                <span>PSE — Transferencia Bancaria</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado</span>
                <span
                  className={
                    isApproved ? 'text-green-600 font-semibold' :
                    isDeclined ? 'text-red-600 font-semibold' :
                    'text-amber-600 font-semibold'
                  }
                  data-testid="text-status-value"
                >
                  {status === 'APPROVED' ? 'Aprobado' :
                   status === 'DECLINED' ? 'Rechazado' :
                   status === 'VOIDED' ? 'Anulado' :
                   status === 'ERROR' ? 'Error' : 'En proceso'}
                </span>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {(error as Error).message || 'Error consultando el estado del pago'}
              </AlertDescription>
            </Alert>
          )}

          {isPending && !timedOut && pollingActive && (
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" />
              Verificando automáticamente cada 5 segundos...
            </p>
          )}

          <div className="flex flex-col gap-3 pt-2">
            {isApproved && (
              <Button onClick={() => navigate('/')} data-testid="button-go-dashboard">
                <Home className="h-4 w-4 mr-2" />
                Ir al Panel de Control
              </Button>
            )}

            {isDeclined && (
              <>
                <Button onClick={() => navigate('/pago-pse')} data-testid="button-retry-pse">
                  Intentar de nuevo con PSE
                </Button>
                <Button variant="outline" onClick={() => navigate('/checkout')} data-testid="button-try-card">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Pagar con tarjeta de crédito
                </Button>
              </>
            )}

            {(timedOut || (!pollingActive && isPending)) && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPollingActive(true);
                    setPollCount(0);
                    refetch();
                  }}
                  data-testid="button-check-again"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Verificar de nuevo
                </Button>
                <Button onClick={() => navigate('/')} data-testid="button-go-home">
                  <Home className="h-4 w-4 mr-2" />
                  Ir al inicio
                </Button>
              </>
            )}

            {isPending && !timedOut && (
              <Button variant="ghost" onClick={() => navigate('/')} data-testid="button-go-home-pending">
                Volver al inicio (el pago continuará en segundo plano)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

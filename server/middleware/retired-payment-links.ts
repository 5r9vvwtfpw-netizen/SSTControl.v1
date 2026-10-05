import type { Request, Response } from "express";

// Retire initiation only. Existing payment status and signed confirmation
// endpoints must remain available until all previously started payments settle.
export function rejectSharedPaymentLinks(_req: Request, res: Response) {
  return res.status(410).json({
    error: "Los enlaces compartidos de pago ya no están disponibles. Ingrese a la cuenta de la empresa y pague desde Mi Cuenta → Pagar Ahora.",
  });
}

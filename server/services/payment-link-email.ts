import { resend } from "./email";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export async function sendEpaycoPaymentLinkEmail(params: {
  recipient: string;
  companyName: string;
  amount: number;
  currency: string;
  paymentUrl: string;
}): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    throw new Error("Payment-link email is unavailable outside production");
  }

  const companyName = escapeHtml(params.companyName);
  const paymentUrl = escapeHtml(params.paymentUrl);
  const amount = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: params.currency,
    maximumFractionDigits: 0,
  }).format(params.amount);
  const result = await resend.emails.send({
    from: process.env.FROM_EMAIL || "SST Colombia <notificaciones@sst-colombia.com>",
    to: params.recipient,
    subject: "Enlace seguro para pagar su suscripción PSE",
    text: `Hola ${params.companyName}, use este enlace para pagar su suscripción por PSE: ${params.paymentUrl}. El enlace vence en 24 horas.`,
    html: `
      <p>Hola ${companyName},</p>
      <p>Puede pagar su suscripción mensual por PSE. Valor: <strong>${escapeHtml(amount)}</strong>.</p>
      <p><a href="${paymentUrl}">Continuar al pago seguro</a></p>
      <p>Este enlace es de un solo uso y vence en 24 horas. Si no solicitó este correo, puede ignorarlo.</p>
    `,
  });
  if (result.error) {
    throw new Error(result.error.message || "No se pudo enviar el correo del enlace de pago");
  }
}
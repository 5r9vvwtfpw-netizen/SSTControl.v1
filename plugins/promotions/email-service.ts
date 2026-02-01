/**
 * Plugin de Promociones - Servicio de Email
 * 
 * ARQUITECTURA SIDECAR: Servicio de email independiente para invitaciones de referidos.
 * Usa Resend como proveedor de email (igual que el sistema principal).
 */

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@sst-colombia.com";
const COMPANY_NAME = "SST-Colombia";

export interface ReferralInvitationData {
  referrerName: string;
  referrerEmail: string;
  referrerCompany?: string;
  friendName: string;
  friendEmail: string;
  friendCompany?: string;
  referralLink: string;
  benefitDescription: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Envía una invitación de referido al amigo del cliente (Padrino)
 * Incluye copia (CC) al cliente que invita.
 */
export async function sendReferralInvitation(data: ReferralInvitationData): Promise<EmailResult> {
  if (!resend) {
    console.warn("[PromotionsPlugin] Resend not configured - email not sent");
    return { success: false, error: "Servicio de email no configurado" };
  }
  
  const subject = `${data.referrerName} te recomienda ${COMPANY_NAME} para la gestión de SG-SST`;
  
  const htmlBody = generateInvitationEmailHtml(data);
  const textBody = generateInvitationEmailText(data);
  
  try {
    const result = await resend.emails.send({
      from: `${COMPANY_NAME} <${FROM_EMAIL}>`,
      to: data.friendEmail,
      cc: data.referrerEmail, // Copia al cliente que invita
      subject,
      html: htmlBody,
      text: textBody,
      tags: [
        { name: "category", value: "referral_invitation" },
        { name: "referrer", value: data.referrerEmail },
      ],
    });
    
    console.log(`[PromotionsPlugin] Invitation email sent to ${data.friendEmail}, ID: ${result.data?.id}`);
    
    return { 
      success: true, 
      messageId: result.data?.id 
    };
  } catch (error: any) {
    console.error("[PromotionsPlugin] Error sending invitation email:", error);
    return { 
      success: false, 
      error: error.message || "Error enviando email" 
    };
  }
}

function generateInvitationEmailHtml(data: ReferralInvitationData): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitación a ${COMPANY_NAME}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px 40px; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                ${COMPANY_NAME}
              </h1>
              <p style="color: #e2e8f0; margin: 8px 0 0 0; font-size: 14px;">
                Sistema de Gestión de Seguridad y Salud en el Trabajo
              </p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
                Hola ${data.friendName},
              </h2>
              
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                <strong>${data.referrerName}</strong>${data.referrerCompany ? ` de ${data.referrerCompany}` : ''} 
                te invita a optimizar tu gestión de seguridad laboral con ${COMPANY_NAME}.
              </p>
              
              <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
                <p style="color: #166534; margin: 0; font-size: 16px; font-weight: 600;">
                  🎁 Beneficio exclusivo por ser referido
                </p>
                <p style="color: #15803d; margin: 10px 0 0 0; font-size: 18px; font-weight: 700;">
                  ¡Tu ${data.benefitDescription}!
                </p>
              </div>
              
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                ${COMPANY_NAME} te ayuda a cumplir con la Resolución 0312 de 2019 y 
                los estándares mínimos de SG-SST de manera simple y eficiente.
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${data.referralLink}" 
                   style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); 
                          color: #ffffff; text-decoration: none; padding: 16px 40px; 
                          border-radius: 8px; font-size: 16px; font-weight: 600;
                          box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);">
                  Ver mi beneficio
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
              
              <p style="color: #94a3b8; font-size: 14px; line-height: 1.5; margin: 0;">
                Este correo fue enviado porque ${data.referrerName} (${data.referrerEmail}) 
                te recomendó ${COMPANY_NAME}. Si crees que recibiste este correo por error, 
                puedes ignorarlo de forma segura.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="color: #64748b; font-size: 13px; margin: 0;">
                © ${new Date().getFullYear()} ${COMPANY_NAME}. Todos los derechos reservados.
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0 0;">
                Bogotá D.C., Colombia | Cumplimiento Resolución 0312/2019
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function generateInvitationEmailText(data: ReferralInvitationData): string {
  return `
Hola ${data.friendName},

${data.referrerName}${data.referrerCompany ? ` de ${data.referrerCompany}` : ''} te invita a optimizar tu gestión de seguridad laboral con ${COMPANY_NAME}.

🎁 BENEFICIO EXCLUSIVO POR SER REFERIDO
¡Tu ${data.benefitDescription}!

${COMPANY_NAME} te ayuda a cumplir con la Resolución 0312 de 2019 y los estándares mínimos de SG-SST de manera simple y eficiente.

👉 Ver mi beneficio: ${data.referralLink}

---

Este correo fue enviado porque ${data.referrerName} (${data.referrerEmail}) te recomendó ${COMPANY_NAME}. Si crees que recibiste este correo por error, puedes ignorarlo de forma segura.

© ${new Date().getFullYear()} ${COMPANY_NAME}. Todos los derechos reservados.
Bogotá D.C., Colombia | Cumplimiento Resolución 0312/2019
  `.trim();
}

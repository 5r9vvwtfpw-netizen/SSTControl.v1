import cron from 'node-cron';
import { storage } from '../storage';
import { resend } from '../services/email';
import logger from '../lib/logger';

const FROM_EMAIL = process.env.FROM_EMAIL || 'SST Colombia <notificaciones@sst-colombia.com>';
const APP_URL = process.env.VITE_APP_URL || 'http://localhost:5000';

export async function sendNotificationEmail(params: {
  to: string;
  titulo: string;
  mensaje: string;
  tipo: string;
  companyName?: string;
  pdfBuffer?: Buffer;
  pdfFilename?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { to, titulo, mensaje, tipo, companyName, pdfBuffer, pdfFilename } = params;

  const tipoLabel = {
    'recordatorio': 'Recordatorio',
    'alerta': 'Alerta',
    'capacitacion': 'Capacitación',
    'copasst': 'COPASST',
    'mensaje': 'Mensaje',
    'inscripcion': 'Inscripción',
  }[tipo] || 'Notificación';

  const emailHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titulo}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #166534 0%, #15803d 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                SST Colombia
              </h1>
              <p style="margin: 8px 0 0 0; color: #dcfce7; font-size: 14px;">
                Sistema de Salud y Seguridad en el Trabajo
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #166534; padding: 12px 30px; text-align: center;">
              <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                ${tipoLabel}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #166534; font-size: 20px;">
                ${titulo}
              </h2>
              ${companyName ? `<p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px;">Empresa: ${companyName}</p>` : ''}
              <div style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">
                ${mensaje}
              </div>
              <center>
                <a href="${APP_URL}" style="display: inline-block; background: #166534; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                  Acceder a SST Colombia
                </a>
              </center>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 30px; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-align: center;">
                Este es un mensaje automático del Sistema SST Colombia.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px; text-align: center;">
                Para más información, contacte al responsable de SST de su empresa.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const attachments = pdfBuffer
      ? [{ filename: pdfFilename || 'informe-flota.pdf', content: pdfBuffer.toString('base64') }]
      : undefined;

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `[SST Colombia] ${titulo}`,
      html: emailHtml,
      attachments,
    });

    return { success: true };
  } catch (error: any) {
    logger.error({ error: error.message, to, titulo }, 'Error sending notification email');
    return { success: false, error: error.message };
  }
}

export async function processNotifications(): Promise<{ enviadas: number; fallidas: number }> {
  const context = {
    jobName: 'notifications',
    timestamp: new Date().toISOString()
  };

  logger.info({ ...context }, 'Starting notifications job...');

  let enviadas = 0;
  let fallidas = 0;

  try {
    const pendientes = await storage.getNotificacionesPendientes();

    if (pendientes.length === 0) {
      logger.info({ ...context }, 'No pending notifications found');
      return { enviadas: 0, fallidas: 0 };
    }

    logger.info({ ...context, count: pendientes.length }, `Found ${pendientes.length} pending notification(s)`);

    for (const notificacion of pendientes) {
      const notifContext = {
        ...context,
        notificationId: notificacion.id,
        userId: notificacion.userId,
        companyId: notificacion.companyId,
        tipo: notificacion.tipo
      };

      try {
        const user = await storage.getUser(notificacion.userId);
        if (!user || !user.email) {
          logger.warn({ ...notifContext }, 'User not found or no email - skipping');
          await storage.marcarNotificacionEnviada(notificacion.id, false, 'Usuario no encontrado o sin email');
          fallidas++;
          continue;
        }

        let companyName: string | undefined;
        if (notificacion.companyId) {
          const company = await storage.getCompany(notificacion.companyId);
          companyName = company?.name;
        }

        const result = await sendNotificationEmail({
          to: user.email,
          titulo: notificacion.titulo,
          mensaje: notificacion.mensaje,
          tipo: notificacion.tipo,
          companyName
        });

        if (result.success) {
          await storage.marcarNotificacionEnviada(notificacion.id, true);
          enviadas++;
          logger.info({ ...notifContext, email: user.email }, 'Notification email sent successfully');
        } else {
          await storage.marcarNotificacionEnviada(notificacion.id, false, result.error);
          fallidas++;
          logger.error({ ...notifContext, email: user.email, error: result.error }, 'Failed to send notification email');
        }
      } catch (error: any) {
        await storage.marcarNotificacionEnviada(notificacion.id, false, error.message);
        fallidas++;
        logger.error({ ...notifContext, error: error.message }, 'Error processing notification');
      }
    }

    logger.info({ ...context, enviadas, fallidas }, 'Notifications job completed');
  } catch (error: any) {
    logger.error({ ...context, error: error.message }, 'Notifications job failed');
  }

  return { enviadas, fallidas };
}

export function startNotificationsCron() {
  logger.info({ env: process.env.NODE_ENV }, 'Running immediate notifications check on startup...');
  processNotifications();

  cron.schedule('*/15 * * * *', () => {
    processNotifications();
  });

  logger.info({ env: process.env.NODE_ENV }, 'Notifications cron job scheduled (runs every 15 minutes)');
}

import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'SST Colombia <notificaciones@sst-colombia.com>';
const APP_URL = process.env.VITE_APP_URL || 'http://localhost:5000';

export const resend = new Resend(RESEND_API_KEY);

/**
 * Email Service - Transactional emails using Resend
 * Bloque 4 - Tarea 16: Email Templates
 */
export class EmailService {
  /**
   * Send invoice payment confirmation email
   */
  async sendInvoiceEmail(params: {
    to: string;
    invoiceNumber: string;
    amount: number;
    currency: string;
    issuedDate: Date;
    dueDate: Date;
    companyName: string;
    billingPeriodStart?: Date;
    billingPeriodEnd?: Date;
    pdfBuffer?: Buffer;
  }): Promise<void> {
    const { to, invoiceNumber, amount, currency, issuedDate, dueDate, companyName, pdfBuffer } = params;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e7e34; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
    .invoice-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #1e7e34; }
    .invoice-details h3 { margin-top: 0; color: #1e7e34; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .detail-label { font-weight: bold; color: #666; }
    .detail-value { color: #333; }
    .total { font-size: 1.2em; font-weight: bold; color: #1e7e34; }
    .button { display: inline-block; background: #1e7e34; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Factura Pagada - SST Colombia</h1>
    </div>
    <div class="content">
      <p>Estimado cliente de <strong>${companyName}</strong>,</p>
      
      <p>Su pago ha sido procesado exitosamente. A continuación encontrará los detalles de su factura:</p>
      
      <div class="invoice-details">
        <h3>📄 Detalles de Factura</h3>
        <div class="detail-row">
          <span class="detail-label">Número de Factura:</span>
          <span class="detail-value">${invoiceNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fecha de Emisión:</span>
          <span class="detail-value">${issuedDate.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fecha de Vencimiento:</span>
          <span class="detail-value">${dueDate.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Monto Total:</span>
          <span class="detail-value total">${this.formatCurrency(amount, currency)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Estado:</span>
          <span class="detail-value" style="color: #1e7e34; font-weight: bold;">✓ PAGADA</span>
        </div>
      </div>

      <p>La factura PDF se encuentra adjunta a este correo electrónico. También puede descargarla desde su panel de cliente en cualquier momento.</p>

      <center>
        <a href="${APP_URL}/mi-suscripcion" class="button">Ver Mis Facturas</a>
      </center>

      <p style="margin-top: 30px;">Gracias por confiar en SST Colombia para la gestión de seguridad y salud en el trabajo de su empresa.</p>

      <div class="footer">
        <p><strong>SST Colombia</strong><br>
        Sistema Integral de Gestión SST<br>
        www.sst-colombia.com</p>
        <p style="font-size: 0.85em; color: #999;">
          Este es un correo automático, por favor no responder. Si tiene alguna pregunta, contacte a soporte@sst-colombia.com
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const attachments = pdfBuffer ? [{
      filename: `${invoiceNumber}.pdf`,
      content: pdfBuffer.toString('base64') // Resend requires base64 string, not raw Buffer
    }] : [];

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: `Factura ${invoiceNumber} - Pago Confirmado`,
        html: emailHtml,
        attachments
      });

      console.log(`Invoice email sent to ${to} for invoice ${invoiceNumber}`);
    } catch (error) {
      console.error('Error sending invoice email:', error);
      throw new Error(`Failed to send invoice email: ${error}`);
    }
  }

  /**
   * Send payment confirmation email (for subscription upgrades)
   */
  async sendPaymentConfirmationEmail(params: {
    to: string;
    companyName: string;
    planName: string;
    amount: number;
    currency: string;
    transactionId: string;
    nextBillingDate: Date;
  }): Promise<void> {
    const { to, companyName, planName, amount, currency, transactionId, nextBillingDate } = params;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e7e34; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
    .success-box { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .payment-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .button { display: inline-block; background: #1e7e34; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Pago Confirmado</h1>
    </div>
    <div class="content">
      <p>Estimado cliente de <strong>${companyName}</strong>,</p>
      
      <div class="success-box">
        <strong>¡Su pago ha sido procesado exitosamente!</strong><br>
        Su suscripción al plan <strong>${planName}</strong> está ahora activa.
      </div>

      <div class="payment-details">
        <h3>Detalles del Pago</h3>
        <div class="detail-row">
          <span>Plan:</span>
          <strong>${planName}</strong>
        </div>
        <div class="detail-row">
          <span>Monto Pagado:</span>
          <strong>${this.formatCurrency(amount, currency)}</strong>
        </div>
        <div class="detail-row">
          <span>ID de Transacción:</span>
          <span style="font-family: monospace; font-size: 0.9em;">${transactionId}</span>
        </div>
        <div class="detail-row">
          <span>Próxima Renovación:</span>
          <span>${nextBillingDate.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <p>Puede comenzar a disfrutar de todas las funcionalidades de su nuevo plan de inmediato. Acceda a su panel de control para ver los detalles de su suscripción.</p>

      <center>
        <a href="${APP_URL}/mi-suscripcion" class="button">Ver Mi Suscripción</a>
      </center>

      <div class="footer">
        <p><strong>SST Colombia</strong><br>
        Sistema Integral de Gestión SST<br>
        www.sst-colombia.com</p>
        <p style="font-size: 0.85em; color: #999;">
          Si tiene alguna pregunta, contacte a soporte@sst-colombia.com
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: `Confirmación de Pago - Plan ${planName}`,
        html: emailHtml
      });

      console.log(`Payment confirmation email sent to ${to} for plan ${planName}`);
    } catch (error) {
      console.error('Error sending payment confirmation email:', error);
      throw new Error(`Failed to send payment confirmation email: ${error}`);
    }
  }

  /**
   * Send subscription change notification
   */
  async sendSubscriptionChangeEmail(params: {
    to: string;
    companyName: string;
    oldPlanName: string;
    newPlanName: string;
    changeType: 'upgrade' | 'downgrade';
    effectiveDate: Date;
  }): Promise<void> {
    const { to, companyName, oldPlanName, newPlanName, changeType, effectiveDate } = params;

    const emoji = changeType === 'upgrade' ? '⬆️' : '⬇️';
    const actionText = changeType === 'upgrade' ? 'actualización' : 'cambio';
    
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e7e34; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
    .change-box { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #1e7e34; }
    .plan { font-size: 1.1em; padding: 10px; margin: 5px 0; }
    .button { display: inline-block; background: #1e7e34; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${emoji} Cambio de Plan Confirmado</h1>
    </div>
    <div class="content">
      <p>Estimado cliente de <strong>${companyName}</strong>,</p>
      
      <p>Le confirmamos que su ${actionText} de plan se ha completado exitosamente.</p>

      <div class="change-box">
        <div class="plan" style="text-decoration: line-through; color: #999;">
          Plan Anterior: ${oldPlanName}
        </div>
        <div style="text-align: center; margin: 10px 0; font-size: 1.5em; color: #1e7e34;">⬇</div>
        <div class="plan" style="font-weight: bold; color: #1e7e34;">
          Nuevo Plan: ${newPlanName}
        </div>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
          <strong>Fecha de Aplicación:</strong> ${effectiveDate.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <p>Su plan <strong>${newPlanName}</strong> ya está activo y puede comenzar a utilizar sus funcionalidades de inmediato.</p>

      <center>
        <a href="${APP_URL}/mi-suscripcion" class="button">Ver Mi Suscripción</a>
      </center>

      <div class="footer">
        <p><strong>SST Colombia</strong><br>
        Sistema Integral de Gestión SST<br>
        www.sst-colombia.com</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: `Cambio de Plan Confirmado - ${newPlanName}`,
        html: emailHtml
      });

      console.log(`Subscription change email sent to ${to}`);
    } catch (error) {
      console.error('Error sending subscription change email:', error);
      throw new Error(`Failed to send subscription change email: ${error}`);
    }
  }

  /**
   * Send payment failed email
   */
  async sendPaymentFailedEmail(params: {
    to: string;
    companyName: string;
    planName: string;
    amount: number;
    currency: string;
    reason: string;
  }): Promise<void> {
    const { to, companyName, planName, amount, currency, reason } = params;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
    .error-box { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .button { display: inline-block; background: #1e7e34; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠ Pago No Procesado</h1>
    </div>
    <div class="content">
      <p>Estimado cliente de <strong>${companyName}</strong>,</p>
      
      <div class="error-box">
        <strong>Su pago no pudo ser procesado.</strong><br>
        Plan: ${planName} - ${this.formatCurrency(amount, currency)}
      </div>

      <p><strong>Motivo:</strong> ${reason}</p>

      <p>Por favor, verifique los datos de su método de pago e intente nuevamente. Si el problema persiste, contacte a su entidad bancaria o a nuestro equipo de soporte.</p>

      <center>
        <a href="${APP_URL}/planes-suscripcion" class="button">Intentar Nuevamente</a>
      </center>

      <div class="footer">
        <p><strong>SST Colombia</strong><br>
        Soporte: soporte@sst-colombia.com<br>
        www.sst-colombia.com</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: `Pago No Procesado - ${planName}`,
        html: emailHtml
      });

      console.log(`Payment failed email sent to ${to}`);
    } catch (error) {
      console.error('Error sending payment failed email:', error);
      throw new Error(`Failed to send payment failed email: ${error}`);
    }
  }

  /**
   * Send portal access credentials to a worker
   * Used when responsable_sst creates portal access for an employee
   */
  async sendPortalAccessCredentials(params: {
    to: string;
    workerName: string;
    username: string;
    temporaryPassword: string;
    companyName: string;
    loginUrl?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const { to, workerName, username, temporaryPassword, companyName, loginUrl } = params;
    
    const portalUrl = loginUrl || `${APP_URL}/auth`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e7e34; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
    .credentials-box { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #1e7e34; }
    .credentials-box h3 { margin-top: 0; color: #1e7e34; }
    .credential-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
    .credential-label { font-weight: bold; color: #666; }
    .credential-value { color: #333; font-family: 'Courier New', monospace; background: #f0f0f0; padding: 4px 8px; border-radius: 3px; }
    .warning-box { background: #fff3cd; border: 1px solid #ffc107; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .button { display: inline-block; background: #1e7e34; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Acceso al Portal SST</h1>
    </div>
    <div class="content">
      <p>Estimado/a <strong>${workerName}</strong>,</p>
      
      <p>Se ha creado su cuenta de acceso al Portal de Empleados SST de <strong>${companyName}</strong>. A continuacion encontrara sus credenciales de acceso:</p>
      
      <div class="credentials-box">
        <h3>Credenciales de Acceso</h3>
        <div class="credential-row">
          <span class="credential-label">Usuario:</span>
          <span class="credential-value">${username}</span>
        </div>
        <div class="credential-row">
          <span class="credential-label">Contrasena temporal:</span>
          <span class="credential-value">${temporaryPassword}</span>
        </div>
      </div>

      <div class="warning-box">
        <strong>Importante:</strong> Esta es una contrasena temporal. Le recomendamos cambiarla despues de su primer inicio de sesion para mantener la seguridad de su cuenta.
      </div>

      <p>Desde el portal podra:</p>
      <ul>
        <li>Consultar su informacion personal y laboral</li>
        <li>Ver sus capacitaciones completadas</li>
        <li>Reportar incidentes o condiciones inseguras</li>
        <li>Acceder a documentos de seguridad relevantes</li>
      </ul>

      <center>
        <a href="${portalUrl}" class="button">Iniciar Sesion</a>
      </center>

      <div class="footer">
        <p><strong>SST Colombia</strong><br>
        Sistema Integral de Gestion SST<br>
        ${companyName}</p>
        <p style="font-size: 0.85em; color: #999;">
          Este es un correo automatico. Si tiene alguna pregunta, contacte al responsable de SST de su empresa.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: `Acceso al Portal SST - ${companyName}`,
        html: emailHtml
      });

      console.log(`Portal access credentials email sent to ${to} for worker ${workerName}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending portal access credentials email:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Send medical exam reminder email
   */
  async sendMedicalExamReminder(params: {
    to: string;
    workerName: string;
    examType: string;
    scheduledDate: string;
    daysUntil: number;
    medicalCenter?: string;
    companyName: string;
  }): Promise<{ success: boolean; error?: string }> {
    const { to, workerName, examType, scheduledDate, daysUntil, medicalCenter, companyName } = params;

    const urgencyColor = daysUntil <= 3 ? '#dc2626' : daysUntil <= 7 ? '#ea580c' : '#ca8a04';
    const urgencyText = daysUntil === 0 ? '¡HOY!' : daysUntil === 1 ? '¡MAÑANA!' : `en ${daysUntil} días`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${urgencyColor}; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
    .exam-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid ${urgencyColor}; }
    .exam-details h3 { margin-top: 0; color: ${urgencyColor}; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .detail-label { font-weight: bold; color: #666; }
    .detail-value { color: #333; }
    .urgency { font-size: 1.4em; font-weight: bold; color: ${urgencyColor}; text-align: center; padding: 15px; background: #fff; border-radius: 5px; margin: 15px 0; }
    .button { display: inline-block; background: #1e7e34; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏥 Recordatorio de Examen Médico</h1>
    </div>
    <div class="content">
      <p>Estimado/a responsable de SST,</p>
      
      <div class="urgency">⚠️ Examen programado ${urgencyText}</div>
      
      <p>Le recordamos que tiene un examen médico ocupacional próximo a realizarse:</p>
      
      <div class="exam-details">
        <h3>📋 Detalles del Examen</h3>
        <div class="detail-row">
          <span class="detail-label">Trabajador:</span>
          <span class="detail-value"><strong>${workerName}</strong></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Tipo de Examen:</span>
          <span class="detail-value">${examType}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fecha Programada:</span>
          <span class="detail-value"><strong>${scheduledDate}</strong></span>
        </div>
        ${medicalCenter ? `
        <div class="detail-row">
          <span class="detail-label">Centro Médico:</span>
          <span class="detail-value">${medicalCenter}</span>
        </div>
        ` : ''}
        <div class="detail-row">
          <span class="detail-label">Empresa:</span>
          <span class="detail-value">${companyName}</span>
        </div>
      </div>

      <p><strong>Recomendaciones:</strong></p>
      <ul>
        <li>Confirme la cita con el trabajador</li>
        <li>Verifique que el trabajador tenga los documentos requeridos</li>
        <li>Recuerde que es obligatorio según Resolución 2346/2007</li>
      </ul>

      <center>
        <a href="${APP_URL}/examenes-medicos" class="button">Ver Exámenes Programados</a>
      </center>

      <div class="footer">
        <p><strong>SST Colombia</strong><br>
        Sistema Integral de Gestión SST<br>
        ${companyName}</p>
        <p style="font-size: 0.85em; color: #999;">
          Este es un correo automático de recordatorio. Gestione sus exámenes médicos en el sistema.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: `🏥 Recordatorio: Examen Médico ${urgencyText} - ${workerName}`,
        html: emailHtml
      });

      console.log(`Medical exam reminder sent to ${to} for worker ${workerName}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending medical exam reminder:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Format currency for display
   */
  private formatCurrency(amount: number, currency: string): string {
    if (currency === 'COP') {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(amount);
    }
    return `${currency} ${amount.toFixed(2)}`;
  }

  /**
   * Send credentials email to new support staff user
   */
  async sendSupportUserCredentials(params: {
    to: string;
    username: string;
    password: string;
    fullName?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const { to, username, password, fullName } = params;
    const displayName = fullName || username;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
    .credentials-box { background: #e8f4fd; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .credentials-box h3 { margin-top: 0; color: #3b82f6; }
    .credential-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #d0e8f7; }
    .credential-label { font-weight: bold; color: #555; }
    .credential-value { font-family: monospace; font-size: 1.1em; color: #1e40af; font-weight: bold; }
    .warning-box { background: #fff3cd; border: 1px solid #ffc107; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Acceso al Portal de Soporte SST</h1>
    </div>
    <div class="content">
      <p>Estimado/a <strong>${displayName}</strong>,</p>
      
      <p>Se ha creado su cuenta de acceso al <strong>Portal de Soporte de SST Colombia</strong>. A continuacion encontrara sus credenciales de acceso:</p>
      
      <div class="credentials-box">
        <h3>Credenciales de Acceso</h3>
        <div class="credential-row">
          <span class="credential-label">Usuario:</span>
          <span class="credential-value">${username}</span>
        </div>
        <div class="credential-row">
          <span class="credential-label">Contrasena:</span>
          <span class="credential-value">${password}</span>
        </div>
      </div>

      <div class="warning-box">
        <strong>Importante:</strong> Le recomendamos cambiar su contrasena despues de su primer inicio de sesion para mantener la seguridad de su cuenta.
      </div>

      <p>Desde el portal de soporte podra:</p>
      <ul>
        <li>Ver y gestionar tickets de soporte</li>
        <li>Responder consultas de clientes</li>
        <li>Cambiar estados y asignar tickets</li>
      </ul>

      <p><strong>URL de acceso:</strong> <a href="${APP_URL}/soporte/login">${APP_URL}/soporte/login</a></p>

      <div class="footer">
        <p><strong>SST Colombia - Equipo de Soporte</strong></p>
        <p style="font-size: 0.85em; color: #999;">
          Este es un correo automatico. No responder a este mensaje.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: `Credenciales de Acceso - Portal de Soporte SST Colombia`,
        html: emailHtml
      });

      console.log(`Support user credentials email sent to ${to} for user ${username}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending support user credentials email:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Send new support ticket notification to support staff
   */
  async sendNewTicketNotification(params: {
    to: string;
    ticketId: string;
    ticketNumber: string;
    subject: string;
    priority: string;
    companyName: string;
    userName: string;
    createdAt: Date;
  }): Promise<{ success: boolean; error?: string }> {
    const { to, ticketId, ticketNumber, subject, priority, companyName, userName, createdAt } = params;

    const priorityColors: Record<string, string> = {
      alta: '#dc2626',
      media: '#f59e0b',
      baja: '#22c55e'
    };
    const priorityColor = priorityColors[priority] || '#6b7280';
    const priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1);

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
    .ticket-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #3b82f6; }
    .ticket-details h3 { margin-top: 0; color: #3b82f6; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .detail-label { font-weight: bold; color: #666; }
    .detail-value { color: #333; }
    .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; color: white; font-weight: bold; background: ${priorityColor}; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Nuevo Ticket de Soporte</h1>
    </div>
    <div class="content">
      <p>Se ha creado un nuevo ticket de soporte que requiere su atención:</p>
      
      <div class="ticket-details">
        <h3>Detalles del Ticket</h3>
        <div class="detail-row">
          <span class="detail-label">Número:</span>
          <span class="detail-value">${ticketNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Asunto:</span>
          <span class="detail-value">${subject}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Prioridad:</span>
          <span class="priority-badge">${priorityLabel}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Empresa:</span>
          <span class="detail-value">${companyName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Reportado por:</span>
          <span class="detail-value">${userName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fecha:</span>
          <span class="detail-value">${createdAt.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <center>
        <a href="${APP_URL}/soporte/tickets/${ticketId}" class="button">Ver Ticket</a>
      </center>

      <div class="footer">
        <p><strong>SST Colombia - Panel de Soporte</strong></p>
        <p style="font-size: 0.85em; color: #999;">
          Este es un correo automático del sistema de tickets.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: `[${ticketNumber}] Nuevo Ticket: ${subject} - ${priorityLabel}`,
        html: emailHtml
      });

      console.log(`New ticket notification sent to ${to} for ticket ${ticketNumber}`);
      return { success: true };
    } catch (error) {
      console.error('Error sending new ticket notification:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Send admin notification when a new company registers
   */
  async sendAdminNewCompanyNotification(params: {
    companyName: string;
    nit?: string;
    city?: string;
    planName?: string;
    createdAt?: Date;
  }): Promise<void> {
    const ADMIN_EMAIL = 'admin@sst-colombia.com';
    const { companyName, nit, city, planName, createdAt } = params;
    const fecha = (createdAt || new Date()).toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e7e34; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
    .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #1e7e34; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .detail-label { font-weight: bold; color: #666; }
    .button { display: inline-block; background: #1e7e34; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 20px; color: #999; font-size: 0.85em; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Nueva Empresa Registrada</h1>
    </div>
    <div class="content">
      <p>Se ha registrado una nueva empresa en SST Colombia:</p>
      <div class="info-box">
        <div class="detail-row">
          <span class="detail-label">Empresa:</span>
          <span>${companyName}</span>
        </div>
        ${nit ? `<div class="detail-row"><span class="detail-label">NIT:</span><span>${nit}</span></div>` : ''}
        ${city ? `<div class="detail-row"><span class="detail-label">Ciudad:</span><span>${city}</span></div>` : ''}
        ${planName ? `<div class="detail-row"><span class="detail-label">Plan:</span><span>${planName}</span></div>` : ''}
        <div class="detail-row">
          <span class="detail-label">Fecha:</span>
          <span>${fecha}</span>
        </div>
      </div>
      <center>
        <a href="${APP_URL}/admin-portales" class="button">Ver en Panel Admin</a>
      </center>
      <div class="footer">Notificación automática — SST Colombia</div>
    </div>
  </div>
</body>
</html>`;

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `Nueva empresa registrada: ${companyName}`,
        html: emailHtml
      });
      console.log(`[ADMIN-NOTIFY] New company notification sent for: ${companyName}`);
    } catch (error) {
      console.error('[ADMIN-NOTIFY] Error sending new company notification:', error);
    }
  }

  /**
   * Send admin notification when a subscription payment is confirmed
   */
  async sendAdminPaymentNotification(params: {
    companyName: string;
    planName?: string;
    amount?: number;
    currency?: string;
    companyId?: string;
  }): Promise<void> {
    const ADMIN_EMAIL = 'admin@sst-colombia.com';
    const { companyName, planName, amount, currency, companyId } = params;
    const fecha = new Date().toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    const amountStr = amount && currency
      ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: currency === 'COP' ? 'COP' : 'USD', minimumFractionDigits: 0 }).format(amount)
      : 'N/A';

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #155724; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
    .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #28a745; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .detail-label { font-weight: bold; color: #666; }
    .amount { font-size: 1.3em; font-weight: bold; color: #155724; }
    .button { display: inline-block; background: #155724; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 20px; color: #999; font-size: 0.85em; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Pago de Suscripcion Confirmado</h1>
    </div>
    <div class="content">
      <p>Se ha confirmado un pago de suscripcion en SST Colombia:</p>
      <div class="info-box">
        <div class="detail-row">
          <span class="detail-label">Empresa:</span>
          <span><strong>${companyName}</strong></span>
        </div>
        ${planName ? `<div class="detail-row"><span class="detail-label">Plan:</span><span>${planName}</span></div>` : ''}
        <div class="detail-row">
          <span class="detail-label">Monto:</span>
          <span class="amount">${amountStr}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fecha:</span>
          <span>${fecha}</span>
        </div>
      </div>
      <center>
        <a href="${APP_URL}/dashboard-facturacion" class="button">Ver en Facturacion</a>
      </center>
      <div class="footer">Notificacion automatica — SST Colombia</div>
    </div>
  </div>
</body>
</html>`;

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `Pago confirmado: ${companyName}${planName ? ` — Plan ${planName}` : ''}`,
        html: emailHtml
      });
      console.log(`[ADMIN-NOTIFY] Payment notification sent for company: ${companyName}`);
    } catch (error) {
      console.error('[ADMIN-NOTIFY] Error sending payment notification:', error);
    }
  }

  async sendClientWelcomeEmail(params: {
    companyName: string;
    contactEmail: string;
  }) {
    const { companyName, contactEmail } = params;

    const calendarUrl =
      "https://calendar.google.com/calendar/r/eventedit" +
      "?text=Introducción+SG-SST+Colombia" +
      "&details=Sesión+de+introducción+al+sistema+de+gestión+SG-SST+Colombia+(30+min)." +
      "&add=admin@sst-colombia.com" +
      "&dur=30";

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bienvenido a SST Colombia</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#1e7e34;padding:28px 32px;text-align:center;">
      <h1 style="margin:0;color:white;font-size:22px;font-weight:700;">SST Colombia</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Sistema de Gestión SG-SST</p>
    </div>
    <div style="padding:36px 32px;">
      <h2 style="margin:0 0 12px;color:#1a1a1a;font-size:18px;">¡Bienvenido, ${companyName}!</h2>
      <p style="margin:0 0 20px;color:#444;font-size:14px;line-height:1.7;">
        Tu cuenta ha sido creada exitosamente. El siguiente paso es agendar una 
        <strong>sesión de introducción de 30 minutos</strong> con nuestro equipo — una vez 
        completada, activaremos tu acceso completo a la plataforma.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${calendarUrl}"
           style="display:inline-block;background:#1e7e34;color:white;text-decoration:none;
                  padding:14px 32px;border-radius:6px;font-size:15px;font-weight:600;
                  letter-spacing:0.2px;">
          Agendar mi sesión de 30 minutos
        </a>
      </div>
      <p style="margin:0 0 8px;color:#555;font-size:13px;font-weight:600;">En esta sesión te ayudaremos a:</p>
      <ul style="margin:0 0 24px;padding-left:20px;color:#555;font-size:13px;line-height:1.8;">
        <li>Configurar tu perfil de empresa y trabajadores</li>
        <li>Realizar la evaluación inicial Resolución 0312/2019</li>
        <li>Entender los módulos principales del sistema</li>
      </ul>
      <p style="margin:0;color:#777;font-size:13px;">
        ¿Tienes preguntas? Escríbenos a 
        <a href="mailto:admin@sst-colombia.com" style="color:#1e7e34;font-weight:600;">admin@sst-colombia.com</a>
      </p>
    </div>
    <div style="background:#f9f9f9;padding:16px 32px;border-top:1px solid #eee;text-align:center;">
      <p style="margin:0;color:#aaa;font-size:11px;">
        Equipo SST Colombia &nbsp;·&nbsp; SAGDI S.A.S. &nbsp;·&nbsp; NIT 902.036.337-4
      </p>
    </div>
  </div>
</body>
</html>`;

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: contactEmail,
        subject: `¡Bienvenido a SST Colombia! — Agenda tu sesión de introducción`,
        html,
      });
      console.log(`[WELCOME-EMAIL] Sent to ${contactEmail} for company: ${companyName}`);
    } catch (error) {
      console.error('[WELCOME-EMAIL] Error sending welcome email:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();

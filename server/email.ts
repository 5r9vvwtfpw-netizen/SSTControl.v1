import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration - Dominio verificado en Resend
const FROM_EMAIL = process.env.FROM_EMAIL || 'notificaciones@sst-colombia.com';
const FROM_NAME = 'SST Colombia - Sistema de Gestión';

export interface ExamRenewalEmailData {
  workerName: string;
  examType: string;
  scheduledDate: string;
  medicalCenter?: string;
  daysUntilExpiry: number;
}

export interface TrainingRenewalEmailData {
  workerName: string;
  trainingTitle: string;
  completedDate: string;
  expiryDate: string;
  daysUntilExpiry: number;
}

// Interfaces para notificaciones de Gestión de Cambios
export interface CambioSstEmailData {
  codigo: string;
  titulo: string;
  tipo: string;
  categoria: string;
  solicitante: string;
  areaAfectada: string;
  fechaPropuesta: string;
  nivelImpacto?: string;
  estadoActual?: string;
}

export interface AprobacionCambioEmailData {
  cambio: CambioSstEmailData;
  nivelAprobacion: string;
  aprobadorNombre: string;
  decision: 'aprobado' | 'rechazado';
  observaciones?: string;
}

// Plantilla HTML para renovación de examen médico
function getExamRenewalEmailHTML(data: ExamRenewalEmailData): string {
  const urgencyColor = data.daysUntilExpiry <= 7 ? '#dc2626' : data.daysUntilExpiry <= 30 ? '#f59e0b' : '#16a34a';
  const urgencyText = data.daysUntilExpiry <= 7 ? 'URGENTE' : data.daysUntilExpiry <= 30 ? 'PRÓXIMO A VENCER' : 'RECORDATORIO';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Renovación de Examen Médico Ocupacional</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
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

          <!-- Urgency Banner -->
          <tr>
            <td style="background-color: ${urgencyColor}; padding: 12px 30px; text-align: center;">
              <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                ⚠️ ${urgencyText}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #166534; font-size: 20px;">
                Estimado/a ${data.workerName},
              </h2>
              
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Le recordamos que su <strong>examen médico ocupacional</strong> requiere renovación próximamente.
              </p>

              <!-- Info Box -->
              <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #166534;">Tipo de Examen:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.examType}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #166534;">Fecha Programada:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.scheduledDate}</span>
                    </td>
                  </tr>
                  ${data.medicalCenter ? `
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #166534;">Centro Médico:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.medicalCenter}</span>
                    </td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #166534;">Días Restantes:</strong>
                      <span style="color: ${urgencyColor}; font-size: 20px; font-weight: 600; display: block; margin-top: 4px;">
                        ${data.daysUntilExpiry} días
                      </span>
                    </td>
                  </tr>
                </table>
              </div>

              <p style="margin: 24px 0 0 0; color: #374151; font-size: 14px; line-height: 1.6;">
                <strong>Importante:</strong> La realización del examen médico ocupacional es obligatoria según la 
                <em>Resolución 1843 de 2025</em> del Ministerio de Salud. Por favor, coordine con su supervisor 
                o el área de SST para agendar su cita con la mayor brevedad posible.
              </p>
            </td>
          </tr>

          <!-- Footer -->
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
}

// Plantilla HTML para renovación de capacitación
function getTrainingRenewalEmailHTML(data: TrainingRenewalEmailData): string {
  const urgencyColor = data.daysUntilExpiry <= 7 ? '#dc2626' : data.daysUntilExpiry <= 30 ? '#f59e0b' : '#16a34a';
  const urgencyText = data.daysUntilExpiry <= 7 ? 'URGENTE' : data.daysUntilExpiry <= 30 ? 'PRÓXIMO A VENCER' : 'RECORDATORIO';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Renovación de Capacitación SST</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
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

          <!-- Urgency Banner -->
          <tr>
            <td style="background-color: ${urgencyColor}; padding: 12px 30px; text-align: center;">
              <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                📚 ${urgencyText}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #166534; font-size: 20px;">
                Estimado/a ${data.workerName},
              </h2>
              
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Le informamos que su certificación de <strong>capacitación en SST</strong> está próxima a vencer 
                y requiere renovación.
              </p>

              <!-- Info Box -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #92400e;">Capacitación:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.trainingTitle}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #92400e;">Fecha de Realización:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.completedDate}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #92400e;">Fecha de Vencimiento:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.expiryDate}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #92400e;">Días Restantes:</strong>
                      <span style="color: ${urgencyColor}; font-size: 20px; font-weight: 600; display: block; margin-top: 4px;">
                        ${data.daysUntilExpiry} días
                      </span>
                    </td>
                  </tr>
                </table>
              </div>

              <p style="margin: 24px 0 0 0; color: #374151; font-size: 14px; line-height: 1.6;">
                <strong>Acción Requerida:</strong> Para mantener su certificación vigente y cumplir con los 
                requisitos de la <em>Resolución 0312 de 2019</em>, debe completar la renovación de esta 
                capacitación antes de la fecha de vencimiento. Por favor, contacte al área de SST para programar 
                la siguiente sesión.
              </p>
            </td>
          </tr>

          <!-- Footer -->
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
}

// Función principal para enviar email de renovación de examen
export async function sendExamRenewalEmail(
  to: string,
  data: ExamRenewalEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const subject = `⚠️ Renovación de Examen Médico Ocupacional - ${data.daysUntilExpiry} días restantes`;
    
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html: getExamRenewalEmailHTML(data),
    });

    if (result.error) {
      console.error('Error sending exam renewal email:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error('Failed to send exam renewal email:', error);
    return { success: false, error: error.message };
  }
}

// Función principal para enviar email de renovación de capacitación
export async function sendTrainingRenewalEmail(
  to: string,
  data: TrainingRenewalEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const subject = `📚 Renovación de Capacitación SST - ${data.daysUntilExpiry} días restantes`;
    
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html: getTrainingRenewalEmailHTML(data),
    });

    if (result.error) {
      console.error('Error sending training renewal email:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error('Failed to send training renewal email:', error);
    return { success: false, error: error.message };
  }
}

// Función para enviar email de prueba
export async function sendTestEmail(to: string): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject: 'Prueba - Sistema de Notificaciones SST Colombia',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h2 style="color: #166534;">✅ Sistema de Notificaciones Activo</h2>
            <p>Este es un email de prueba del sistema de notificaciones SST Colombia.</p>
            <p>Si recibiste este mensaje, la configuración de email está funcionando correctamente.</p>
          </div>
        </div>
      `,
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ==================== GESTIÓN DE CAMBIOS SST ====================

// Plantilla HTML para notificación de nuevo cambio
function getNuevoCambioEmailHTML(data: CambioSstEmailData): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuevo Cambio SST Registrado</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #166534 0%, #15803d 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                SST Colombia
              </h1>
              <p style="margin: 8px 0 0 0; color: #dcfce7; font-size: 14px;">
                Sistema de Gestión de Cambios SST
              </p>
            </td>
          </tr>

          <!-- Alert Banner -->
          <tr>
            <td style="background-color: #3b82f6; padding: 12px 30px; text-align: center;">
              <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                NUEVO CAMBIO REGISTRADO
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #166534; font-size: 20px;">
                Notificación de Gestión de Cambios
              </h2>
              
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Se ha registrado un nuevo <strong>cambio en el Sistema de Gestión SST</strong> que requiere su atención y revisión.
              </p>

              <!-- Info Box -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #1e40af;">Código:</strong>
                      <span style="color: #374151; font-family: monospace; display: block; margin-top: 4px;">${data.codigo}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #1e40af;">Título:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.titulo}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #1e40af;">Tipo de Cambio:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.tipo}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #1e40af;">Categoría:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.categoria}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #1e40af;">Solicitante:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.solicitante}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #1e40af;">Área Afectada:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.areaAfectada}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #1e40af;">Fecha Propuesta:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.fechaPropuesta}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <p style="margin: 24px 0 0 0; color: #374151; font-size: 14px; line-height: 1.6;">
                <strong>Acción Requerida:</strong> Por favor, ingrese al sistema SST Colombia para revisar los detalles completos del cambio, realizar la evaluación de impacto y proceder con el flujo de aprobación correspondiente según el <em>Decreto 1072 de 2015 - Artículo 2.2.4.6.26</em>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 30px; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-align: center;">
                Este es un mensaje automático del Sistema SST Colombia.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px; text-align: center;">
                Para más información, acceda al módulo de Gestión de Cambios SST.
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
}

// Plantilla HTML para solicitud de aprobación
function getSolicitudAprobacionEmailHTML(data: CambioSstEmailData, nivelAprobacion: string): string {
  const nivelColor = '#f59e0b';
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solicitud de Aprobación - Cambio SST</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #166534 0%, #15803d 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                SST Colombia
              </h1>
              <p style="margin: 8px 0 0 0; color: #dcfce7; font-size: 14px;">
                Sistema de Gestión de Cambios SST
              </p>
            </td>
          </tr>

          <!-- Urgency Banner -->
          <tr>
            <td style="background-color: ${nivelColor}; padding: 12px 30px; text-align: center;">
              <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                APROBACIÓN REQUERIDA - ${nivelAprobacion.toUpperCase()}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #166534; font-size: 20px;">
                Solicitud de Aprobación
              </h2>
              
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Se requiere su <strong>aprobación</strong> para el siguiente cambio en el Sistema de Gestión SST:
              </p>

              <!-- Info Box -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #92400e;">Código:</strong>
                      <span style="color: #374151; font-family: monospace; display: block; margin-top: 4px;">${data.codigo}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #92400e;">Título:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.titulo}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #92400e;">Tipo:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.tipo}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #92400e;">Nivel de Aprobación:</strong>
                      <span style="color: #92400e; font-weight: 600; display: block; margin-top: 4px;">${nivelAprobacion}</span>
                    </td>
                  </tr>
                  ${data.nivelImpacto ? `
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #92400e;">Nivel de Impacto:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.nivelImpacto}</span>
                    </td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #92400e;">Solicitante:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.solicitante}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <p style="margin: 24px 0 0 0; color: #374151; font-size: 14px; line-height: 1.6;">
                <strong>Acción Requerida:</strong> Por favor, ingrese al sistema SST Colombia - módulo de Gestión de Cambios para revisar los detalles completos, la evaluación de impacto y proceder con la aprobación o rechazo del cambio. Su decisión es necesaria para continuar con el proceso según la <em>Resolución 0312 de 2019</em>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 30px; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-align: center;">
                Este es un mensaje automático del Sistema SST Colombia.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px; text-align: center;">
                Para más información, acceda al módulo de Gestión de Cambios SST.
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
}

// Plantilla HTML para notificación de aprobación/rechazo
function getResultadoAprobacionEmailHTML(data: AprobacionCambioEmailData): string {
  const isAprobado = data.decision === 'aprobado';
  const statusColor = isAprobado ? '#16a34a' : '#dc2626';
  const statusText = isAprobado ? 'APROBADO' : 'RECHAZADO';
  const statusIcon = isAprobado ? '✅' : '❌';
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cambio ${statusText}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #166534 0%, #15803d 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                SST Colombia
              </h1>
              <p style="margin: 8px 0 0 0; color: #dcfce7; font-size: 14px;">
                Sistema de Gestión de Cambios SST
              </p>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background-color: ${statusColor}; padding: 12px 30px; text-align: center;">
              <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                CAMBIO ${statusText}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #166534; font-size: 20px;">
                Resultado de Aprobación
              </h2>
              
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                El cambio ha sido <strong>${isAprobado ? 'aprobado' : 'rechazado'}</strong> por ${data.aprobadorNombre} (${data.nivelAprobacion}):
              </p>

              <!-- Info Box -->
              <div style="background-color: ${isAprobado ? '#f0fdf4' : '#fef2f2'}; border-left: 4px solid ${statusColor}; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: ${isAprobado ? '#166534' : '#991b1b'};">Código:</strong>
                      <span style="color: #374151; font-family: monospace; display: block; margin-top: 4px;">${data.cambio.codigo}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: ${isAprobado ? '#166534' : '#991b1b'};">Título:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.cambio.titulo}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: ${isAprobado ? '#166534' : '#991b1b'};">Tipo:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.cambio.tipo}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: ${isAprobado ? '#166534' : '#991b1b'};">Nivel de Aprobación:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.nivelAprobacion}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: ${isAprobado ? '#166534' : '#991b1b'};">Aprobador:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.aprobadorNombre}</span>
                    </td>
                  </tr>
                  ${data.observaciones ? `
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: ${isAprobado ? '#166534' : '#991b1b'};">Observaciones:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.observaciones}</span>
                    </td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              <p style="margin: 24px 0 0 0; color: #374151; font-size: 14px; line-height: 1.6;">
                ${isAprobado 
                  ? '<strong>Próximos Pasos:</strong> El cambio continuará con el proceso de aprobación o implementación según corresponda. Por favor, ingrese al sistema para consultar los detalles y seguimiento.' 
                  : '<strong>Acción Requerida:</strong> El cambio ha sido rechazado. Por favor, revise las observaciones y realice los ajustes necesarios antes de volver a solicitar la aprobación.'
                }
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 30px; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-align: center;">
                Este es un mensaje automático del Sistema SST Colombia.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px; text-align: center;">
                Para más información, acceda al módulo de Gestión de Cambios SST.
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
}

// Función para enviar email de nuevo cambio
export async function sendNuevoCambioEmail(
  to: string,
  data: CambioSstEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const subject = `Nuevo Cambio SST Registrado - ${data.codigo}`;
    
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html: getNuevoCambioEmailHTML(data),
    });

    if (result.error) {
      console.error('Error sending nuevo cambio email:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error('Failed to send nuevo cambio email:', error);
    return { success: false, error: error.message };
  }
}

// Función para enviar email de solicitud de aprobación
export async function sendSolicitudAprobacionEmail(
  to: string,
  data: CambioSstEmailData,
  nivelAprobacion: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const subject = `Aprobación Requerida - Cambio SST ${data.codigo}`;
    
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html: getSolicitudAprobacionEmailHTML(data, nivelAprobacion),
    });

    if (result.error) {
      console.error('Error sending solicitud aprobacion email:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error('Failed to send solicitud aprobacion email:', error);
    return { success: false, error: error.message };
  }
}

// Función para enviar email de resultado de aprobación
export async function sendResultadoAprobacionEmail(
  to: string,
  data: AprobacionCambioEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const statusText = data.decision === 'aprobado' ? 'APROBADO' : 'RECHAZADO';
    const subject = `Cambio ${statusText} - ${data.cambio.codigo}`;
    
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html: getResultadoAprobacionEmailHTML(data),
    });

    if (result.error) {
      console.error('Error sending resultado aprobacion email:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error('Failed to send resultado aprobacion email:', error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// MÓDULO DE COMUNICACIÓN SST
// ==========================================

export interface ComunicacionSstEmailData {
  codigo?: string;
  asunto: string;
  tipo: string;
  contenido: string;
  publicoObjetivo: string;
  fechaEnvio: string;
  enviadoPor: string;
  requiereConfirmacion: boolean;
}

export interface ReporteUrgenteEmailData {
  codigo: string;
  categoria: string;
  prioridad: string;
  asunto: string;
  descripcion: string;
  ubicacion?: string;
  reportante: string;
  fechaReporte: string;
  esAnonimo: boolean;
}

export interface RespuestaReporteEmailData {
  codigo: string;
  asunto: string;
  respuesta: string;
  accionesTomadas?: string;
  respondidoPor: string;
  fechaRespuesta: string;
}

// Plantilla HTML para notificación de nueva comunicación SST
function getNuevaComunicacionEmailHTML(data: ComunicacionSstEmailData): string {
  const tipoLabel = {
    'politica': 'Política SST',
    'procedimiento': 'Procedimiento',
    'alerta': 'Alerta de Seguridad',
    'informativo': 'Comunicado Informativo',
    'formacion': 'Material de Formación',
    'emergencia': 'Comunicado de Emergencia',
    'normativo': 'Cambio Normativo',
    'evento': 'Evento SST'
  }[data.tipo] || data.tipo;

  const tipoColor = data.tipo === 'emergencia' || data.tipo === 'alerta' ? '#dc2626' : '#166534';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Comunicación SST</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #166534 0%, #15803d 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                SST Colombia
              </h1>
              <p style="margin: 8px 0 0 0; color: #dcfce7; font-size: 14px;">
                Sistema de Comunicación SST
              </p>
            </td>
          </tr>

          <!-- Tipo Banner -->
          <tr>
            <td style="background-color: ${tipoColor}; padding: 12px 30px; text-align: center;">
              <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                ${tipoLabel}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #166534; font-size: 20px;">
                Nueva Comunicación SST
              </h2>
              
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Se ha publicado una nueva comunicación de SST que requiere su atención.
              </p>

              <!-- Info Box -->
              <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #166534;">Asunto:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px; font-size: 16px; font-weight: 600;">${data.asunto}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #166534;">Tipo:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${tipoLabel}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #166534;">Dirigido a:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.publicoObjetivo}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #166534;">Enviado por:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.enviadoPor}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #166534;">Fecha de envío:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.fechaEnvio}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Contenido -->
              <div style="background-color: #ffffff; border: 1px solid #e5e7eb; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${data.contenido}</p>
              </div>

              ${data.requiereConfirmacion ? `
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">
                  ⚠️ Esta comunicación requiere confirmación de lectura
                </p>
                <p style="margin: 8px 0 0 0; color: #78350f; font-size: 13px;">
                  Por favor, acceda al Portal de Empleados para confirmar que ha leído esta comunicación.
                </p>
              </div>
              ` : ''}

              <p style="margin: 24px 0 0 0; color: #374151; font-size: 14px; line-height: 1.6;">
                <strong>Acción Requerida:</strong> Por favor, ingrese al Portal de Empleados para leer la comunicación completa y, si es requerido, confirmar su lectura.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 30px; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-align: center;">
                Este es un mensaje automático del Sistema SST Colombia.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px; text-align: center;">
                Para más información, acceda al Portal de Empleados.
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
}

// Plantilla HTML para alerta de reporte urgente
function getReporteUrgenteEmailHTML(data: ReporteUrgenteEmailData): string {
  const categoriaLabel = {
    'peligro': 'Identificación de Peligro',
    'incidente': 'Reporte de Incidente',
    'sugerencia': 'Sugerencia de Mejora',
    'queja': 'Queja o Reclamo',
    'consulta': 'Consulta SST',
    'reconocimiento': 'Reconocimiento'
  }[data.categoria] || data.categoria;

  const prioridadColor = {
    'urgente': '#dc2626',
    'alta': '#f59e0b',
    'media': '#3b82f6',
    'baja': '#6b7280'
  }[data.prioridad] || '#6b7280';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte Urgente - SST</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                ⚠️ ALERTA SST
              </h1>
              <p style="margin: 8px 0 0 0; color: #fecaca; font-size: 14px;">
                Reporte Urgente Recibido
              </p>
            </td>
          </tr>

          <!-- Prioridad Banner -->
          <tr>
            <td style="background-color: ${prioridadColor}; padding: 12px 30px; text-align: center;">
              <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                PRIORIDAD: ${data.prioridad.toUpperCase()}
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #dc2626; font-size: 20px;">
                Nuevo Reporte de Trabajador
              </h2>
              
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Se ha recibido un nuevo reporte ${data.prioridad === 'urgente' ? '<strong style="color: #dc2626;">URGENTE</strong>' : ''} que requiere atención inmediata.
              </p>

              <!-- Info Box -->
              <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #991b1b;">Código:</strong>
                      <span style="color: #374151; font-family: monospace; display: block; margin-top: 4px;">${data.codigo}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #991b1b;">Categoría:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${categoriaLabel}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #991b1b;">Asunto:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px; font-size: 16px; font-weight: 600;">${data.asunto}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #991b1b;">Reportado por:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.esAnonimo ? 'Anónimo' : data.reportante}</span>
                    </td>
                  </tr>
                  ${data.ubicacion ? `
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #991b1b;">Ubicación:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.ubicacion}</span>
                    </td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #991b1b;">Fecha del reporte:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.fechaReporte}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Descripción -->
              <div style="background-color: #ffffff; border: 1px solid #fecaca; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <strong style="color: #991b1b; display: block; margin-bottom: 8px;">Descripción:</strong>
                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${data.descripcion}</p>
              </div>

              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">
                  ⚡ Acción Inmediata Requerida
                </p>
                <p style="margin: 8px 0 0 0; color: #78350f; font-size: 13px;">
                  Por favor, ingrese al sistema para revisar el reporte completo y tomar las acciones necesarias.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 30px; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-align: center;">
                Este es un mensaje automático del Sistema SST Colombia.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px; text-align: center;">
                Para gestionar este reporte, acceda al módulo de Comunicación SST.
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
}

// Plantilla HTML para notificación de respuesta a reporte
function getRespuestaReporteEmailHTML(data: RespuestaReporteEmailData): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Respuesta a su Reporte SST</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #166534 0%, #15803d 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                SST Colombia
              </h1>
              <p style="margin: 8px 0 0 0; color: #dcfce7; font-size: 14px;">
                Respuesta a su Reporte
              </p>
            </td>
          </tr>

          <!-- Status Banner -->
          <tr>
            <td style="background-color: #3b82f6; padding: 12px 30px; text-align: center;">
              <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                Su reporte ha sido atendido
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #166534; font-size: 20px;">
                Hemos revisado su reporte
              </h2>
              
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Gracias por su reporte. El equipo de SST ha revisado su solicitud y le proporcionamos la siguiente respuesta:
              </p>

              <!-- Info Box -->
              <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #166534;">Código del reporte:</strong>
                      <span style="color: #374151; font-family: monospace; display: block; margin-top: 4px;">${data.codigo}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #166534;">Asunto:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.asunto}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #166534;">Respondido por:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.respondidoPor}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #166534;">Fecha de respuesta:</strong>
                      <span style="color: #374151; display: block; margin-top: 4px;">${data.fechaRespuesta}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Respuesta -->
              <div style="background-color: #ffffff; border: 1px solid #e5e7eb; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <strong style="color: #166534; display: block; margin-bottom: 8px;">Respuesta:</strong>
                <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${data.respuesta}</p>
              </div>

              ${data.accionesTomadas ? `
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <strong style="color: #1e40af; display: block; margin-bottom: 8px;">Acciones Tomadas:</strong>
                <p style="margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${data.accionesTomadas}</p>
              </div>
              ` : ''}

              <p style="margin: 24px 0 0 0; color: #374151; font-size: 14px; line-height: 1.6;">
                Si tiene alguna pregunta adicional o requiere más información, no dude en contactar al equipo de SST o enviar un nuevo reporte a través del Portal de Empleados.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 30px; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-align: center;">
                Este es un mensaje automático del Sistema SST Colombia.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px; text-align: center;">
                Para más información, acceda al Portal de Empleados.
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
}

// Función para enviar email de nueva comunicación SST
export async function sendNuevaComunicacionEmail(
  to: string,
  data: ComunicacionSstEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const subject = `Nueva Comunicación SST: ${data.asunto}`;
    
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html: getNuevaComunicacionEmailHTML(data),
    });

    if (result.error) {
      console.error('Error sending nueva comunicación email:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error('Failed to send nueva comunicación email:', error);
    return { success: false, error: error.message };
  }
}

// Función para enviar email de reporte urgente
export async function sendReporteUrgenteEmail(
  to: string,
  data: ReporteUrgenteEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const subject = `URGENTE - Nuevo Reporte SST: ${data.codigo}`;
    
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html: getReporteUrgenteEmailHTML(data),
    });

    if (result.error) {
      console.error('Error sending reporte urgente email:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error('Failed to send reporte urgente email:', error);
    return { success: false, error: error.message };
  }
}

// Función para enviar email de respuesta a reporte
export async function sendRespuestaReporteEmail(
  to: string,
  data: RespuestaReporteEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const subject = `Respuesta a su Reporte SST - ${data.codigo}`;
    
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html: getRespuestaReporteEmailHTML(data),
    });

    if (result.error) {
      console.error('Error sending respuesta reporte email:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error('Failed to send respuesta reporte email:', error);
    return { success: false, error: error.message };
  }
}

// ==================== VERIFICACIÓN DE EMAIL ====================

export interface VerificationEmailData {
  fullName: string;
  verificationUrl: string;
}

// Plantilla HTML para verificación de cuenta
export function getVerificationEmailHTML(data: VerificationEmailData): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifica tu cuenta - SST Colombia</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
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

          <!-- Verification Banner -->
          <tr>
            <td style="background-color: #16a34a; padding: 12px 30px; text-align: center;">
              <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                VERIFICA TU CUENTA
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #166534; font-size: 20px;">
                ¡Bienvenido/a ${data.fullName}!
              </h2>
              
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Gracias por registrarte en <strong>SST Colombia</strong>. Para completar tu registro y activar tu cuenta, 
                por favor verifica tu dirección de correo electrónico haciendo clic en el botón de abajo.
              </p>

              <!-- Verification Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${data.verificationUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #166534 0%, #15803d 100%); 
                          color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; 
                          font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(22, 101, 52, 0.3);">
                  Verificar mi cuenta
                </a>
              </div>

              <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                O copia y pega el siguiente enlace en tu navegador:
              </p>
              
              <div style="background-color: #f3f4f6; padding: 12px 16px; border-radius: 6px; margin: 16px 0; word-break: break-all;">
                <a href="${data.verificationUrl}" style="color: #166534; font-size: 13px; text-decoration: none;">
                  ${data.verificationUrl}
                </a>
              </div>

              <!-- Warning Box -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                  <strong>Importante:</strong> Este enlace de verificación expira en <strong>24 horas</strong>. 
                  Si no verificas tu cuenta dentro de este período, deberás solicitar un nuevo enlace de verificación.
                </p>
              </div>

              <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Si no solicitaste esta cuenta, puedes ignorar este mensaje de forma segura.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 30px; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-align: center;">
                Este es un mensaje automático del Sistema SST Colombia.
              </p>
              <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 11px; text-align: center;">
                Por favor no responda a este correo electrónico.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px; text-align: center;">
                © ${new Date().getFullYear()} SST Colombia - Sistema de Gestión de Seguridad y Salud en el Trabajo
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
}

// Función para enviar email de verificación de cuenta
export async function sendVerificationEmail(
  to: string,
  data: VerificationEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const subject = 'Verifica tu cuenta - SST Colombia';
    
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html: getVerificationEmailHTML(data),
    });

    if (result.error) {
      console.error('Error sending verification email:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error('Failed to send verification email:', error);
    return { success: false, error: error.message };
  }
}

// ==================== RECUPERACIÓN DE CONTRASEÑA ====================

export interface PasswordResetEmailData {
  fullName: string;
  resetUrl: string;
}

function getPasswordResetEmailHTML(data: PasswordResetEmailData): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer Contraseña - SST Colombia</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
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

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #166534; font-size: 20px;">
                Hola ${data.fullName},
              </h2>
              
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en SST Colombia.
              </p>

              <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Haz clic en el siguiente botón para crear una nueva contraseña:
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${data.resetUrl}" 
                   style="display: inline-block; background-color: #166534; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                  Restablecer Contraseña
                </a>
              </div>

              <p style="margin: 24px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña actual seguirá siendo válida.
              </p>

              <p style="margin: 16px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                <strong>Nota:</strong> Este enlace expirará en 1 hora por motivos de seguridad.
              </p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.6;">
                Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
              </p>
              <p style="margin: 8px 0 0 0; word-break: break-all; color: #3b82f6; font-size: 12px;">
                ${data.resetUrl}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 30px; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-align: center;">
                Este es un mensaje automático del Sistema SST Colombia.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px; text-align: center;">
                Por tu seguridad, nunca compartas este enlace con nadie.
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
}

export async function sendPasswordResetEmail(
  to: string,
  data: PasswordResetEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const subject = 'Restablecer contraseña - SST Colombia';
    
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html: getPasswordResetEmailHTML(data),
    });

    if (result.error) {
      console.error('Error sending password reset email:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error('Failed to send password reset email:', error);
    return { success: false, error: error.message };
  }
}

// ==================== CREDENCIALES DE ACCESO AL PORTAL ====================

export interface PortalAccessEmailData {
  workerName: string;
  username: string;
  temporaryPassword: string;
  companyName: string;
  loginUrl: string;
}

function getPortalAccessEmailHTML(data: PortalAccessEmailData): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Credenciales de Acceso - Portal SST Colombia</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #166534 0%, #15803d 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                SST Colombia
              </h1>
              <p style="margin: 8px 0 0 0; color: #dcfce7; font-size: 14px;">
                Portal de Empleados
              </p>
            </td>
          </tr>

          <!-- Welcome Banner -->
          <tr>
            <td style="background-color: #3b82f6; padding: 12px 30px; text-align: center;">
              <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                Bienvenido al Portal de Empleados
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #166534; font-size: 20px;">
                Hola ${data.workerName},
              </h2>
              
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Se ha creado tu cuenta de acceso al <strong>Portal de Empleados SST</strong> de <strong>${data.companyName}</strong>.
              </p>

              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                A continuación encontrarás tus credenciales de acceso:
              </p>

              <!-- Credentials Box -->
              <div style="background-color: #f0fdf4; border: 2px solid #16a34a; padding: 24px; margin: 24px 0; border-radius: 8px;">
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #dcfce7;">
                      <strong style="color: #166534; font-size: 14px;">Usuario:</strong>
                      <div style="color: #1f2937; font-size: 18px; font-family: monospace; margin-top: 4px; background: white; padding: 8px 12px; border-radius: 4px;">
                        ${data.username}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <strong style="color: #166534; font-size: 14px;">Contraseña temporal:</strong>
                      <div style="color: #1f2937; font-size: 18px; font-family: monospace; margin-top: 4px; background: white; padding: 8px 12px; border-radius: 4px;">
                        ${data.temporaryPassword}
                      </div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${data.loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #166534 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                  Ingresar al Portal
                </a>
              </div>

              <!-- Security Notice -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>Importante:</strong> Por seguridad, te recomendamos cambiar tu contraseña despues del primer inicio de sesion. 
                  Esta contraseña es temporal y solo tu debes conocerla.
                </p>
              </div>

              <p style="margin: 24px 0 0 0; color: #374151; font-size: 14px; line-height: 1.6;">
                En el portal podrás:
              </p>
              <ul style="color: #374151; font-size: 14px; line-height: 1.8; padding-left: 20px;">
                <li>Consultar tus capacitaciones y certificados</li>
                <li>Ver tus exámenes médicos ocupacionales</li>
                <li>Acceder a documentos importantes de SST</li>
                <li>Reportar condiciones inseguras</li>
              </ul>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 30px; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; text-align: center;">
                Este es un mensaje automático del Sistema SST Colombia.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px; text-align: center;">
                Si no solicitaste esta cuenta, por favor contacta al área de SST de tu empresa.
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
}

// Función para enviar credenciales de acceso al portal
export async function sendPortalAccessEmail(
  to: string,
  data: PortalAccessEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const subject = 'Tus credenciales de acceso - Portal SST Colombia';
    
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html: getPortalAccessEmailHTML(data),
    });

    if (result.error) {
      console.error('Error sending portal access email:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error('Failed to send portal access email:', error);
    return { success: false, error: error.message };
  }
}

// ==================== NOTIFICACIÓN DE SOLICITUD DE ACCESO DE SOPORTE ====================

export interface SupportAccessRequestEmailData {
  recipientName: string;
  companyName: string;
  supportUserName: string;
  justification: string;
  scope: string;
  durationMinutes: number;
  sessionNumber: string;
  relatedTicket?: string;
}

function getSupportAccessRequestEmailHTML(data: SupportAccessRequestEmailData): string {
  const scopeLabel = data.scope === 'read_write' ? 'Lectura y Escritura' : 'Solo Lectura';
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solicitud de Acceso de Soporte - SST Colombia</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #166534 0%, #15803d 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">SST Colombia</h1>
              <p style="margin: 8px 0 0 0; color: #dcfce7; font-size: 14px;">Sistema de Salud y Seguridad en el Trabajo</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f59e0b; padding: 12px 30px; text-align: center;">
              <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 600;">SOLICITUD DE ACCESO DE SOPORTE</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #166534; font-size: 20px;">Estimado/a ${data.recipientName},</h2>
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                El personal de soporte de SST Colombia ha solicitado acceso temporal a los datos de su empresa <strong>${data.companyName}</strong>.
              </p>
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <table role="presentation" style="width: 100%;">
                  <tr><td style="padding: 8px 0;"><strong style="color: #92400e;">Solicitante:</strong><span style="color: #374151; display: block; margin-top: 4px;">${data.supportUserName}</span></td></tr>
                  <tr><td style="padding: 8px 0;"><strong style="color: #92400e;">No. Sesion:</strong><span style="color: #374151; display: block; margin-top: 4px;">${data.sessionNumber}</span></td></tr>
                  <tr><td style="padding: 8px 0;"><strong style="color: #92400e;">Justificacion:</strong><span style="color: #374151; display: block; margin-top: 4px;">${data.justification}</span></td></tr>
                  <tr><td style="padding: 8px 0;"><strong style="color: #92400e;">Alcance:</strong><span style="color: #374151; display: block; margin-top: 4px;">${scopeLabel}</span></td></tr>
                  <tr><td style="padding: 8px 0;"><strong style="color: #92400e;">Duracion Solicitada:</strong><span style="color: #374151; display: block; margin-top: 4px;">${data.durationMinutes} minutos</span></td></tr>
                  ${data.relatedTicket ? `<tr><td style="padding: 8px 0;"><strong style="color: #92400e;">Ticket Relacionado:</strong><span style="color: #374151; display: block; margin-top: 4px;">${data.relatedTicket}</span></td></tr>` : ''}
                </table>
              </div>
              <p style="margin: 24px 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">Para aprobar o denegar esta solicitud, ingrese a SST Colombia y vaya a <strong>Configuracion &gt; Accesos de Soporte</strong>.</p>
              <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 24px 0; border-radius: 4px;">
                <p style="margin: 0; color: #991b1b; font-size: 14px;"><strong>Importante:</strong> Por su seguridad, no comparta sus credenciales de acceso.</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f3f4f6; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">Este es un correo automatico de SST Colombia. Por favor no responda a este mensaje.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function sendSupportAccessRequestEmail(
  to: string,
  data: SupportAccessRequestEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const subject = `Solicitud de Acceso de Soporte - ${data.sessionNumber}`;
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html: getSupportAccessRequestEmailHTML(data),
    });
    if (result.error) {
      console.error('Error sending support access request email:', result.error);
      return { success: false, error: result.error.message };
    }
    return { success: true, messageId: result.data?.id };
  } catch (error: any) {
    console.error('Failed to send support access request email:', error);
    return { success: false, error: error.message };
  }
}

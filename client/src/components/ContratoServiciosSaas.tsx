import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, FileText, Shield, Scale, CheckCircle2 } from "lucide-react";
import { ColombianFlag } from "./ColombianFlag";

export interface ContractAcceptanceData {
  acceptedTerms: boolean;
  acceptedDataTreatment: boolean;
  acceptedAutoRenewal: boolean;
  acceptedAt: string;
  planName: string;
}

interface ContratoServiciosSaasProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: (data: ContractAcceptanceData) => void;
  planName: string;
  companyName?: string;
  isLoading?: boolean;
}

export function ContratoServiciosSaas({
  open,
  onOpenChange,
  onAccept,
  planName,
  companyName = "[Nombre de la Empresa]",
  isLoading = false
}: ContratoServiciosSaasProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedDataTreatment, setAcceptedDataTreatment] = useState(false);
  const [acceptedAutoRenewal, setAcceptedAutoRenewal] = useState(false);

  const currentDate = new Date().toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const canAccept = acceptedTerms && acceptedDataTreatment && acceptedAutoRenewal;

  const handleAccept = () => {
    if (canAccept) {
      const acceptanceData: ContractAcceptanceData = {
        acceptedTerms,
        acceptedDataTreatment,
        acceptedAutoRenewal,
        acceptedAt: new Date().toISOString(),
        planName
      };
      onAccept(acceptanceData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col" data-testid="dialog-contrato-saas">
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl" data-testid="text-contrato-titulo">
                Contrato de Prestación de Servicios SaaS
              </DialogTitle>
              <DialogDescription>
                Por favor lea y acepte los términos del contrato para continuar
              </DialogDescription>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <ColombianFlag width={16} height={12} showBorder={false} />
              Colombia
            </Badge>
            <Badge variant="secondary">Plan {planName}</Badge>
            <Badge variant="outline">{currentDate}</Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 pr-4" data-testid="scroll-contrato">
          <div className="space-y-6 text-sm py-4">
            {/* Encabezado del contrato */}
            <div className="bg-muted/30 p-4 rounded-lg border">
              <h3 className="font-bold text-center mb-2">
                CONTRATO DE PRESTACIÓN DE SERVICIOS DE SOFTWARE COMO SERVICIO (SaaS)
              </h3>
              <p className="text-center text-muted-foreground text-xs">
                SST COLOMBIA - Sistema de Gestión de Seguridad y Salud en el Trabajo
              </p>
            </div>

            {/* Partes */}
            <section>
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-primary" />
                PARTES CONTRATANTES
              </h4>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong>EL PROVEEDOR:</strong> SST Colombia S.A.S., sociedad comercial constituida bajo las leyes 
                  de la República de Colombia, identificada con NIT [NIT], con domicilio en Bogotá D.C., 
                  representada legalmente por [Representante Legal], en adelante "EL PROVEEDOR".
                </p>
                <p>
                  <strong>EL CLIENTE:</strong> {companyName}, en adelante "EL CLIENTE", quien al aceptar 
                  electrónicamente este contrato manifiesta su consentimiento informado y voluntario.
                </p>
              </div>
            </section>

            <Separator />

            {/* Cláusula 1: Objeto */}
            <section>
              <h4 className="font-semibold mb-2">CLÁUSULA PRIMERA - OBJETO DEL CONTRATO</h4>
              <p className="text-muted-foreground">
                EL PROVEEDOR se obliga a prestar al CLIENTE el servicio de acceso y uso del software 
                "SST Colombia" bajo la modalidad de Software como Servicio (SaaS), consistente en una 
                plataforma digital para la gestión del Sistema de Seguridad y Salud en el Trabajo (SG-SST), 
                conforme a la Resolución 0312 de 2019 y el Decreto 1072 de 2015 del Ministerio del Trabajo 
                de Colombia. El plan contratado corresponde a: <strong>{planName}</strong>.
              </p>
            </section>

            {/* Cláusula 2: Duración */}
            <section>
              <h4 className="font-semibold mb-2">CLÁUSULA SEGUNDA - DURACIÓN Y TERMINACIÓN</h4>
              <div className="text-muted-foreground space-y-2">
                <p>
                  El contrato tendrá una duración inicial de un (1) mes o un (1) año según el período 
                  de facturación seleccionado, contado a partir de la fecha de aceptación electrónica 
                  del presente contrato.
                </p>
                <p>
                  <strong>Renovación automática:</strong> El contrato se renovará automáticamente por 
                  períodos iguales al inicial, salvo notificación de no renovación con al menos quince 
                  (15) días de anticipación a la fecha de vencimiento.
                </p>
                <p>
                  <strong>Terminación anticipada:</strong> Cualquiera de las partes podrá terminar el 
                  contrato notificando por escrito con treinta (30) días de anticipación. EL CLIENTE 
                  podrá cancelar en cualquier momento desde su panel de administración.
                </p>
              </div>
            </section>

            {/* Cláusula 3: Precio y Pago */}
            <section>
              <h4 className="font-semibold mb-2">CLÁUSULA TERCERA - PRECIO Y FORMA DE PAGO</h4>
              <div className="text-muted-foreground space-y-2">
                <p>
                  El precio del servicio se determina según el plan contratado y el número de trabajadores 
                  registrados en el sistema, con un valor de <strong>$26,000 COP por trabajador/mes</strong>, 
                  más el IVA correspondiente (19%).
                </p>
                <p>
                  El pago se realizará de forma anticipada mediante los medios de pago habilitados en la 
                  plataforma (tarjeta de crédito, tarjeta débito, PSE). EL PROVEEDOR emitirá factura 
                  electrónica conforme a la normativa tributaria colombiana.
                </p>
                <p>
                  <strong>Mora:</strong> En caso de mora en el pago, EL PROVEEDOR podrá suspender el 
                  acceso al servicio hasta que se regularice la situación, sin perjuicio del cobro de 
                  intereses moratorios a la tasa máxima legal permitida.
                </p>
              </div>
            </section>

            {/* Cláusula 4: Protección de Datos - Ley 1581/2012 */}
            <section className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-800 dark:text-blue-300">
                <Shield className="w-4 h-4" />
                CLÁUSULA CUARTA - PROTECCIÓN DE DATOS PERSONALES (LEY 1581 DE 2012)
              </h4>
              <div className="text-blue-700 dark:text-blue-400/90 space-y-2">
                <p>
                  En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013, las partes acuerdan:
                </p>
                <p>
                  <strong>4.1 Responsable y Encargado:</strong> EL CLIENTE actúa como Responsable del 
                  tratamiento de los datos personales de sus trabajadores. EL PROVEEDOR actúa como 
                  Encargado del tratamiento, procesando los datos exclusivamente según las instrucciones 
                  del CLIENTE y para los fines del presente contrato.
                </p>
                <p>
                  <strong>4.2 Obligaciones del PROVEEDOR como Encargado:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Implementar medidas técnicas, humanas y administrativas para garantizar la seguridad de los datos</li>
                  <li>Mantener la confidencialidad de los datos durante y después del contrato</li>
                  <li>No transferir datos a terceros sin autorización escrita del CLIENTE</li>
                  <li>Notificar inmediatamente cualquier brecha de seguridad</li>
                  <li>Permitir auditorías del CLIENTE cuando sean requeridas</li>
                  <li>Devolver o eliminar los datos al terminar el contrato, según instrucción del CLIENTE</li>
                </ul>
                <p>
                  <strong>4.3 Derechos de los Titulares:</strong> EL PROVEEDOR facilitará el ejercicio 
                  de los derechos de acceso, actualización, rectificación, supresión y revocación 
                  conforme a la Ley 1581 de 2012.
                </p>
                <p>
                  <strong>4.4 Datos Sensibles:</strong> Los datos de salud ocupacional tratados en la 
                  plataforma se consideran datos sensibles. EL CLIENTE garantiza contar con la 
                  autorización expresa de los titulares para su tratamiento.
                </p>
              </div>
            </section>

            {/* Cláusula 5: Propiedad Intelectual */}
            <section>
              <h4 className="font-semibold mb-2">CLÁUSULA QUINTA - PROPIEDAD INTELECTUAL</h4>
              <div className="text-muted-foreground space-y-2">
                <p>
                  EL PROVEEDOR es titular exclusivo de todos los derechos de propiedad intelectual sobre 
                  el software "SST Colombia", incluyendo código fuente, diseños, marcas y documentación.
                </p>
                <p>
                  EL CLIENTE adquiere únicamente una licencia de uso temporal, no exclusiva e intransferible, 
                  limitada al período de vigencia del contrato. Queda prohibida la reproducción, modificación, 
                  ingeniería inversa o cualquier uso no autorizado del software.
                </p>
                <p>
                  Los datos e información ingresados por EL CLIENTE en la plataforma son y permanecen 
                  de su exclusiva propiedad.
                </p>
              </div>
            </section>

            {/* Cláusula 6: Nivel de Servicio (SLA) */}
            <section className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <Shield className="w-4 h-4" />
                CLÁUSULA SEXTA - NIVEL DE SERVICIO (SLA) Y COMPENSACIÓN
              </h4>
              <div className="text-amber-700 dark:text-amber-400/90 space-y-2">
                <p>
                  <strong>6.1 Niveles de Disponibilidad Garantizada:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Plan Gran Empresa (200+ trabajadores):</strong> 99.9% de disponibilidad mensual</li>
                  <li><strong>Demás planes:</strong> 99.5% de disponibilidad mensual</li>
                </ul>
                <p>
                  <strong>6.2 Exclusiones del SLA:</strong> El cálculo de disponibilidad excluye:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Mantenimientos programados (notificados con 48 horas de anticipación)</li>
                  <li>Causas de fuerza mayor o caso fortuito</li>
                  <li>Fallas en la conectividad de internet del CLIENTE</li>
                  <li>Uso inadecuado o no autorizado de la plataforma</li>
                  <li>Ataques de denegación de servicio (DDoS) u otras amenazas externas</li>
                </ul>
                <p>
                  <strong>6.3 Política de Compensación:</strong> Si la disponibilidad mensual es inferior 
                  al porcentaje garantizado según el plan contratado, EL CLIENTE tendrá derecho a los 
                  siguientes créditos aplicables a su próxima factura:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Por cada 0.1% adicional de indisponibilidad: <strong>10% de crédito</strong> sobre la mensualidad</li>
                  <li>Crédito máximo mensual: <strong>30%</strong> de la mensualidad</li>
                  <li>Indisponibilidad superior al 1%: Extensión gratuita del servicio por el período afectado</li>
                </ul>
                <p>
                  <strong>6.4 Procedimiento de Reclamación:</strong> Para solicitar compensación, EL CLIENTE 
                  deberá notificar por escrito dentro de los diez (10) días siguientes al período afectado, 
                  indicando las fechas y horas de indisponibilidad experimentadas.
                </p>
                <p>
                  <strong>6.5 Monitoreo:</strong> EL PROVEEDOR mantiene sistemas de monitoreo continuo 
                  (24/7) de la disponibilidad del servicio y proporcionará reportes de uptime cuando 
                  sean solicitados por EL CLIENTE.
                </p>
              </div>
            </section>

            {/* Cláusula 7: Confidencialidad */}
            <section>
              <h4 className="font-semibold mb-2">CLÁUSULA SÉPTIMA - CONFIDENCIALIDAD</h4>
              <p className="text-muted-foreground">
                Ambas partes se obligan a mantener en estricta confidencialidad toda la información 
                comercial, técnica y operativa que conozcan con ocasión del presente contrato. Esta 
                obligación permanece vigente durante tres (3) años después de la terminación del contrato. 
                Se exceptúa la información que deba revelarse por mandato legal o requerimiento de 
                autoridad competente.
              </p>
            </section>

            {/* Cláusula 8: Seguridad */}
            <section>
              <h4 className="font-semibold mb-2">CLÁUSULA OCTAVA - SEGURIDAD Y RESPALDOS</h4>
              <div className="text-muted-foreground space-y-2">
                <p>EL PROVEEDOR implementa las siguientes medidas de seguridad:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Encriptación SSL/TLS para todas las comunicaciones</li>
                  <li>Respaldos diarios automáticos de la información</li>
                  <li>Almacenamiento en servidores con certificación de seguridad</li>
                  <li>Control de acceso basado en roles (RBAC)</li>
                  <li>Registro de auditoría de todas las operaciones sensibles</li>
                </ul>
              </div>
            </section>

            {/* Cláusula 9: Soporte */}
            <section>
              <h4 className="font-semibold mb-2">CLÁUSULA NOVENA - SOPORTE TÉCNICO</h4>
              <div className="text-muted-foreground space-y-2">
                <p>
                  EL PROVEEDOR ofrece soporte técnico a través de los siguientes canales:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Correo electrónico: soporte@sstcolombia.com</li>
                  <li>Chat en línea: Lunes a Viernes, 8:00 am - 6:00 pm (hora Colombia)</li>
                  <li>Centro de ayuda con documentación y tutoriales</li>
                </ul>
                <p>
                  Los tiempos de respuesta varían según el plan contratado y la severidad del incidente.
                </p>
              </div>
            </section>

            {/* Cláusula 10: Obligaciones del Cliente */}
            <section>
              <h4 className="font-semibold mb-2">CLÁUSULA DÉCIMA - OBLIGACIONES DEL CLIENTE</h4>
              <div className="text-muted-foreground space-y-2">
                <p>EL CLIENTE se obliga a:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Pagar oportunamente el precio del servicio</li>
                  <li>Mantener la confidencialidad de sus credenciales de acceso</li>
                  <li>Usar el servicio conforme a la ley y las buenas costumbres</li>
                  <li>No compartir su acceso con terceros no autorizados</li>
                  <li>Contar con las autorizaciones necesarias para el tratamiento de datos personales</li>
                  <li>Informar oportunamente cualquier irregularidad o incidente de seguridad</li>
                </ul>
              </div>
            </section>

            {/* Cláusula 11: Responsabilidad */}
            <section>
              <h4 className="font-semibold mb-2">CLÁUSULA DÉCIMA PRIMERA - RESPONSABILIDAD Y LIMITACIONES</h4>
              <div className="text-muted-foreground space-y-2">
                <p>
                  EL PROVEEDOR responderá por los daños directos causados por dolo o culpa grave en la 
                  prestación del servicio. En ningún caso EL PROVEEDOR será responsable por:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Daños indirectos, consecuenciales o lucro cesante</li>
                  <li>Pérdidas derivadas del uso inadecuado del servicio</li>
                  <li>Contenido o exactitud de la información ingresada por EL CLIENTE</li>
                  <li>Incumplimientos normativos del CLIENTE en materia de SST</li>
                </ul>
                <p>
                  La responsabilidad total del PROVEEDOR se limita al valor pagado por el servicio 
                  en los últimos doce (12) meses.
                </p>
              </div>
            </section>

            {/* Cláusula 12: No Contratación */}
            <section>
              <h4 className="font-semibold mb-2">CLÁUSULA DÉCIMA SEGUNDA - NO CONTRATACIÓN DE PERSONAL</h4>
              <p className="text-muted-foreground">
                Durante la vigencia del contrato y hasta veinticuatro (24) meses después de su terminación, 
                ninguna de las partes podrá contratar directa o indirectamente al personal de la otra parte 
                que haya participado en la ejecución del presente contrato, sin previo consentimiento escrito.
              </p>
            </section>

            {/* Cláusula 13: Resolución de Controversias */}
            <section>
              <h4 className="font-semibold mb-2">CLÁUSULA DÉCIMA TERCERA - RESOLUCIÓN DE CONTROVERSIAS</h4>
              <div className="text-muted-foreground space-y-2">
                <p>
                  Las partes acuerdan resolver amigablemente cualquier diferencia derivada del presente 
                  contrato. En caso de no llegar a un acuerdo dentro de los treinta (30) días siguientes 
                  a la primera comunicación, las controversias se someterán a:
                </p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Conciliación ante un Centro de Conciliación autorizado en Bogotá D.C.</li>
                  <li>En caso de fracasar la conciliación, a la jurisdicción ordinaria de Bogotá D.C.</li>
                </ol>
              </div>
            </section>

            {/* Cláusula 14: Ley Aplicable */}
            <section>
              <h4 className="font-semibold mb-2">CLÁUSULA DÉCIMA CUARTA - LEY APLICABLE</h4>
              <p className="text-muted-foreground">
                El presente contrato se rige por las leyes de la República de Colombia. En particular, 
                son aplicables: el Código de Comercio, el Estatuto del Consumidor (Ley 1480 de 2011), 
                la Ley de Protección de Datos Personales (Ley 1581 de 2012), la Ley de Comercio Electrónico 
                (Ley 527 de 1999), y demás normas concordantes.
              </p>
            </section>

            {/* Cláusula 15: Perfeccionamiento */}
            <section className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-800 dark:text-green-300">
                <CheckCircle2 className="w-4 h-4" />
                CLÁUSULA DÉCIMA QUINTA - PERFECCIONAMIENTO Y FIRMA ELECTRÓNICA
              </h4>
              <div className="text-green-700 dark:text-green-400/90 space-y-2">
                <p>
                  Conforme a la Ley 527 de 1999 sobre comercio electrónico y firma digital, el presente 
                  contrato se perfecciona con la aceptación electrónica por parte del CLIENTE mediante 
                  el botón "Aceptar Contrato" dispuesto en la plataforma.
                </p>
                <p>
                  Esta aceptación electrónica tiene la misma validez jurídica que una firma manuscrita 
                  y constituye prueba del consentimiento del CLIENTE a todos los términos del contrato.
                </p>
                <p>
                  <strong>Fecha de aceptación:</strong> {currentDate}
                </p>
              </div>
            </section>

            {/* Notificaciones */}
            <section>
              <h4 className="font-semibold mb-2">NOTIFICACIONES</h4>
              <p className="text-muted-foreground">
                Todas las notificaciones relacionadas con este contrato se realizarán por correo 
                electrónico a las direcciones registradas en la plataforma. EL CLIENTE es responsable 
                de mantener actualizada su información de contacto.
              </p>
            </section>

          </div>
        </ScrollArea>

        <div className="shrink-0 space-y-4 pt-4 border-t">
          {/* Checkboxes de aceptación */}
          <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="terms" 
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                data-testid="checkbox-accept-terms"
              />
              <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
                He leído y acepto todos los términos y condiciones del presente contrato de prestación 
                de servicios SaaS, incluyendo las limitaciones de responsabilidad.
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="data" 
                checked={acceptedDataTreatment}
                onCheckedChange={(checked) => setAcceptedDataTreatment(checked === true)}
                data-testid="checkbox-accept-data"
              />
              <Label htmlFor="data" className="text-sm cursor-pointer leading-relaxed">
                Autorizo el tratamiento de datos personales conforme a la Ley 1581 de 2012 y la 
                política de privacidad de SST Colombia, incluyendo el tratamiento de datos sensibles 
                de salud ocupacional de mis trabajadores.
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="renewal" 
                checked={acceptedAutoRenewal}
                onCheckedChange={(checked) => setAcceptedAutoRenewal(checked === true)}
                data-testid="checkbox-accept-renewal"
              />
              <Label htmlFor="renewal" className="text-sm cursor-pointer leading-relaxed">
                Acepto la renovación automática de mi suscripción y autorizo el cobro recurrente 
                según el período de facturación seleccionado.
              </Label>
            </div>
          </div>

          {!canAccept && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Debe aceptar todos los términos para continuar</span>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-contrato"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAccept}
              disabled={!canAccept || isLoading}
              data-testid="button-accept-contrato"
            >
              {isLoading ? (
                "Procesando..."
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Aceptar Contrato y Continuar
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ContratoServiciosSaas;

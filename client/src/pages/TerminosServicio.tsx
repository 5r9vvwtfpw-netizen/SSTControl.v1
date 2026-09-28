import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FileText } from "lucide-react";
import { PROVIDER_LEGAL_ADDRESS } from "@shared/legal-contact";

export const TERMS_LAST_UPDATED = "28 de septiembre de 2026";

export function TerminosServicioContent() {
  return (
    <div className="space-y-6 text-sm">
                <section>
                  <h2 className="text-xl font-semibold mb-3">1. Aceptación de los Términos</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Al acceder y utilizar la plataforma SST Colombia (en adelante, "la Plataforma"), 
                    el usuario (en adelante, "el Cliente") acepta estar obligado por estos Términos y 
                    Condiciones de Servicio, todas las leyes y regulaciones aplicables, y acepta que es 
                    responsable del cumplimiento de todas las leyes locales aplicables. Si no está de 
                    acuerdo con alguno de estos términos, tiene prohibido usar o acceder a este sitio.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">2. Definiciones</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>2.1 Plataforma:</strong> Sistema web SST Colombia para gestión de Sistemas de Gestión de Seguridad y Salud en el Trabajo (SG-SST).</p>
                    <p><strong>2.2 Cliente:</strong> Empresa o persona jurídica que contrata los servicios de la Plataforma.</p>
                    <p><strong>2.3 Usuario:</strong> Persona autorizada por el Cliente para acceder a la Plataforma.</p>
                    <p><strong>2.4 Datos Personales:</strong> Información de trabajadores y empleados almacenada en la Plataforma según Ley 1581/2012.</p>
                    <p><strong>2.5 SG-SST:</strong> Sistema de Gestión de la Seguridad y Salud en el Trabajo según Decreto 1072/2015.</p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">3. Descripción del Servicio</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p><strong>3.1 Servicios Incluidos:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Gestión de información de trabajadores y datos ocupacionales</li>
                      <li>Registro y seguimiento de accidentes e incidentes laborales (FURAT/FUREL)</li>
                      <li>Matrices de identificación de peligros y evaluación de riesgos (IPERC)</li>
                      <li>Gestión de capacitaciones y exámenes médicos ocupacionales</li>
                      <li>Auditorías internas y revisiones por dirección</li>
                      <li>Dashboards ejecutivos del ciclo PHVA</li>
                      <li>Generación de reportes normativos para autoridades competentes</li>
                      <li>Gestión del Plan Estratégico de Seguridad Vial (PESV), según las funcionalidades contratadas</li>
                      <li>Almacenamiento seguro en la nube con respaldos diarios cifrados y retención de hasta 20 años mientras la suscripción esté activa. Al terminar el servicio, el Cliente dispone de 30 días para exportar informes y datos, tras lo cual se eliminan salvo registros sujetos a conservación legal, conforme al contrato SaaS y al DPA</li>
                    </ul>
                    <p><strong>3.2 Nivel de Servicio:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Disponibilidad mensual: 99.5% (99.9% para planes de grandes empresas), excluyendo mantenimientos programados, según el contrato SaaS</li>
                      <li>Mantenimientos programados: Se notificarán con 48 horas de anticipación</li>
                      <li>Soporte técnico: Horario laboral Colombia (Lunes a Viernes 8:00-17:00)</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">4. Obligaciones del Cliente</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>4.1 Uso Apropiado:</strong> El Cliente se compromete a usar la Plataforma exclusivamente para fines relacionados con la gestión de SST conforme a la legislación colombiana.</p>
                    <p><strong>4.2 Información Veraz:</strong> El Cliente debe suministrar información veraz, actualizada y completa y revisar los resultados según el contexto de su organización. SST Colombia responde por el funcionamiento de la Plataforma y la generación de informes conforme al alcance ofrecido.</p>
                    <p><strong>4.3 Seguridad de Credenciales:</strong> El Cliente debe mantener la confidencialidad de sus credenciales y notificar usos no autorizados; esto no exime a SST Colombia de sus propias obligaciones de seguridad.</p>
                    <p><strong>4.4 Cumplimiento Legal:</strong> El Cliente se compromete a cumplir con toda la normatividad SST colombiana vigente, incluyendo pero no limitado a:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Decreto 1072 de 2015 (Decreto Único Reglamentario del Sector Trabajo)</li>
                      <li>Resolución 0312 de 2019 (Estándares Mínimos SG-SST)</li>
                      <li>Ley 1562 de 2012 (Sistema de Riesgos Laborales)</li>
                      <li>Ley 1581 de 2012 (Protección de Datos Personales)</li>
                    </ul>
                    <p><strong>4.5 Notificación de Brechas:</strong> El Cliente debe notificar inmediatamente cualquier uso no autorizado de su cuenta o brecha de seguridad.</p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">5. Propiedad Intelectual y Protección de Activos Digitales</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                      <p><strong>5.1 PROPIEDAD INTELECTUAL:</strong> El Cliente reconoce y acepta que el Software, incluyendo pero no limitado a su código fuente, arquitectura de datos, interfaces de usuario, diseños, y muy especialmente <strong>la metodología de filtrado lógico de estándares y la curaduría legal de contenidos basada en la Resolución 0312 de 2019</strong>, son propiedad exclusiva de SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.</p>
                    </div>
                    <p><strong>5.2 Registro Legal:</strong> Dichos activos se encuentran protegidos por las leyes de derecho de autor y tratados internacionales, contando con el <strong>registro oficial ante la Dirección Nacional de Derecho de Autor (DNDA) bajo el número 13-197-177</strong>.</p>
                    <p><strong>5.3 Licencia de Uso:</strong> Se otorga al Cliente una licencia no exclusiva, no transferible y revocable para usar la Plataforma durante la vigencia del contrato.</p>
                    <p><strong>5.4 Propiedad de Datos:</strong> Los datos ingresados por el Cliente permanecen bajo su titularidad. Respecto de los datos de trabajadores cargados por el Cliente, SST Colombia actúa como Encargado del Tratamiento conforme a la Ley 1581 de 2012 y al DPA.</p>
                    <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/30 mt-4">
                      <p className="font-semibold text-destructive mb-2">5.5 PROHIBICIÓN DE INGENIERÍA INVERSA:</p>
                      <p className="mb-2">Queda expresamente prohibido al Cliente, a sus empleados, contratistas o cualquier tercero relacionado:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Intentar descompilar, descifrar o realizar ingeniería inversa para extraer la lógica de asignación de estándares.</li>
                        <li>Utilizar scripts, "bots" o técnicas de scraping para la extracción masiva de la base de datos de estándares curados.</li>
                        <li>Duplicar la estructura funcional del software para el desarrollo de productos competidores.</li>
                        <li>Copiar, modificar, distribuir o crear obras derivadas del Software sin autorización expresa.</li>
                      </ul>
                    </div>
                    <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/30">
                      <p><strong>5.6 Consecuencias por Infracción:</strong> Cualquier infracción a esta cláusula dará lugar a las <strong>acciones civiles y penales correspondientes</strong> conforme a la Ley 23 de 1982 (Derechos de Autor) y Código Penal Colombiano, así como a la <strong>terminación inmediata del servicio sin lugar a reembolsos</strong>.</p>
                    </div>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">6. Protección de Datos Personales</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>6.1 Marco Legal:</strong> El tratamiento de datos personales se rige por la Ley 1581 de 2012, Decreto 1377 de 2013 y el Reglamento General de Protección de Datos (GDPR) de la Unión Europea.</p>
                    <p><strong>6.2 Rol del Cliente:</strong> El Cliente actúa como Responsable del Tratamiento de los datos personales de sus trabajadores.</p>
                    <p><strong>6.3 Rol de SST Colombia:</strong> SST Colombia actúa como Encargado del Tratamiento bajo instrucciones documentadas del Cliente.</p>
                    <p><strong>6.4 Consentimiento:</strong> El Cliente garantiza haber obtenido el consentimiento informado de los titulares de datos personales para su tratamiento según Ley 1581/2012 Art. 9.</p>
                    <p><strong>6.5 Derechos ARCO:</strong> Los titulares de datos pueden ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición contactando al Cliente como Responsable del Tratamiento.</p>
                    <p><strong>6.6 Seguridad:</strong> SST Colombia implementa medidas técnicas y organizativas apropiadas para proteger los datos personales, incluyendo:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Cifrado de datos en tránsito (TLS 1.3) y en reposo (AES-256)</li>
                      <li>Control de acceso basado en roles (RBAC) con 6 niveles de autorización</li>
                      <li>Auditoría completa de operaciones CRUD sobre datos regulados</li>
                      <li>Respaldos diarios cifrados con retención de hasta 20 años mientras la suscripción permanezca activa; al terminar el servicio, se eliminan después del plazo de exportación de 30 días, salvo obligación legal de conservación</li>
                       <li>Registro de IP, dispositivo, navegador, sesiones y eventos de acceso para seguridad y prevención de fraude</li>
                    </ul>
                     <div className="bg-primary/5 p-3 rounded-lg border border-primary/20 mt-3">
                       <p><strong>6.7 Monitoreo de acceso y prevención de fraude:</strong> Para proteger las cuentas y los activos digitales del Cliente, SST Colombia registra la dirección IP de origen de cada acceso, el identificador técnico del dispositivo, navegador, fecha y hora, duración y estado de la sesión, eventos de acceso simultáneo, intentos desde IP no autorizadas y decisiones de autorización o bloqueo.</p>
                       <p className="mt-2">Estos registros se utilizan para autenticar accesos, investigar suplantaciones, plagio, uso compartido indebido de credenciales, extracción no autorizada de información y otras conductas fraudulentas o abusivas. Cuando la configuración de seguridad lo requiera, la Plataforma podrá generar alertas, solicitar verificaciones adicionales, cerrar sesiones simultáneas o bloquear temporalmente el acceso. El Cliente y sus Usuarios autorizados aceptan este monitoreo como medida necesaria para proteger la Plataforma y la información gestionada en ella.</p>
                     </div>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">7. Tarifas y Pagos</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>7.1 Modalidad de Pago:</strong> Los servicios se facturan mensualmente o anualmente según el plan contratado.</p>
                    <p><strong>7.2 Métodos de Pago:</strong> Los pagos nuevos se realizan por transferencia bancaria PSE (Pagos Seguros en Línea) a través de ePayco.</p>
                    <p><strong>7.3 Renovación:</strong> La vigencia y renovación se rigen por el plan contratado y las condiciones de pago aceptadas. Los pagos nuevos mediante PSE requieren confirmación y no autorizan por sí solos cobros automáticos.</p>
                    <p><strong>7.4 Mora:</strong> El retraso en el pago generará intereses de mora a la tasa máxima legal vigente en Colombia.</p>
                    <p><strong>7.5 Suspensión por Falta de Pago:</strong> SST Colombia podrá suspender el acceso cuando venza el período de servicio sin que se haya confirmado el pago correspondiente, conforme al contrato SaaS. El acceso se restablecerá al regularizar el pago y los datos se conservarán de forma segura durante la suspensión.</p>
                    <p><strong>7.6 Modificación de Tarifas:</strong> Los cambios de tarifas se notificarán con 30 días de anticipación, conforme al contrato SaaS. El Cliente puede terminar el servicio sin penalización durante este período.</p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">8. Cancelación y Terminación</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>8.1 Cancelación por el Cliente:</strong> El Cliente puede cancelar el servicio con 30 días de anticipación. No se realizarán reembolsos por períodos parciales.</p>
                    <p><strong>8.2 Terminación por SST Colombia:</strong> SST Colombia puede terminar el servicio con 30 días de anticipación o de inmediato ante incumplimiento grave del Cliente, como uso fraudulento o ilegal que ponga en riesgo la Plataforma. La falta de pago se gestiona conforme al apartado 7.5 y al contrato SaaS.</p>
                    <p><strong>8.3 Exportación de Datos:</strong> Tras la terminación, el Cliente dispone de 30 días para exportar sus datos. Después serán eliminados conforme al DPA, sin perjuicio de los registros que deban conservarse por obligación legal.</p>
                    <p><strong>8.4 Retención Legal:</strong> Los registros sujetos a conservación obligatoria se mantendrán por el plazo legal que corresponda, de acuerdo con el DPA y la normativa aplicable.</p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">9. Responsabilidades sobre el servicio</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p><strong>9.1 Alcance:</strong> La Plataforma facilita la gestión del SG-SST y del PESV. Los informes son herramientas de apoyo y no garantizan por sí solos el cumplimiento legal integral; este también depende de la calidad de los datos y de la implementación efectiva en la organización del Cliente.</p>
                    <p><strong>9.2 Responsabilidades del Cliente:</strong> El Cliente suministra información completa y actualizada, revisa los informes según su contexto y decide e implementa las acciones en sus centros de trabajo, con los profesionales habilitados cuando la norma lo exija.</p>
                    <p><strong>9.3 Responsabilidades de SST Colombia:</strong> SST Colombia responde por el funcionamiento de la Plataforma conforme a los niveles de servicio comprometidos, por la protección de datos según el contrato y el DPA, y por la generación de informes conforme a las funcionalidades y al alcance ofrecidos. Las obligaciones del Cliente no excluyen los incumplimientos imputables a SST Colombia.</p>
                    <p><strong>9.4 Cumplimiento:</strong> La asignación de acciones al Cliente no exonera a SST Colombia de sus propias obligaciones ni de las responsabilidades que la ley no permita excluir. Cada parte responde por sus incumplimientos según el contrato SaaS y la ley aplicable.</p>
                    <p><strong>9.5 Fuerza mayor:</strong> Un evento fuera del control razonable de una parte puede afectar el cumplimiento de sus obligaciones en la medida causada por ese evento. La parte afectada deberá informar y adoptar medidas razonables para mitigar sus efectos; esto no cubre fallas propias ajenas al evento.</p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">10. Indemnización</h2>
                  <p className="text-muted-foreground">
                    El Cliente responderá frente a reclamaciones de terceros en la medida en que deriven directamente
                    de datos suministrados sin autorización, uso ilícito de la Plataforma o incumplimientos que le sean
                    imputables. Esta obligación no cubre fallas de la Plataforma, de protección de datos o de generación
                    de informes imputables a SST Colombia, ni traslada responsabilidades que la ley no permita trasladar.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">11. Ley Aplicable y Jurisdicción</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>11.1 Legislación Colombiana:</strong> Estos Términos se rigen por las leyes de la República de Colombia, específicamente:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Código de Comercio (Decreto 410 de 1971)</li>
                      <li>Ley 1480 de 2011 (Estatuto del Consumidor)</li>
                      <li>Ley 527 de 1999 (Comercio Electrónico y Firmas Digitales)</li>
                      <li>Decreto 1072 de 2015 (Sector Trabajo)</li>
                    </ul>
                    <p><strong>11.2 Jurisdicción:</strong> Si no se llega a un acuerdo mediante conciliación, las partes acudirán a los juzgados competentes de Medellín, Colombia.</p>
                    <p><strong>11.3 Resolución de Controversias:</strong> Las partes acudirán inicialmente a conciliación ante el Centro de Conciliación de la Cámara de Comercio de Medellín, conforme al contrato SaaS.</p>
                    <p><strong>11.4 Idioma:</strong> La versión en español de estos Términos prevalecerá en caso de discrepancias con traducciones.</p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">12. Modificaciones a los Términos</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>12.1 Derecho a Modificar:</strong> SST Colombia podrá modificar estos Términos con 30 días de anticipación, de acuerdo con el contrato SaaS.</p>
                    <p><strong>12.2 Notificación:</strong> Los cambios se notificarán por correo electrónico a la dirección registrada y dentro de la Plataforma.</p>
                    <p><strong>12.3 Aceptación de Cambios:</strong> El uso continuado de la Plataforma tras la notificación constituye aceptación de los nuevos términos.</p>
                    <p><strong>12.4 Rechazo de Cambios:</strong> Si el Cliente no acepta los cambios, puede cancelar el servicio sin penalización durante el período de notificación.</p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">13. Disposiciones Generales</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>13.1 Relación entre documentos:</strong> Estos Términos regulan el uso de la Plataforma y se interpretan junto con el contrato SaaS aceptado por el Cliente y el DPA. En caso de contradicción sobre el servicio contratado, prevalece el contrato SaaS aceptado; para el tratamiento de datos, se aplicará el DPA. Estos Términos no modifican retroactivamente documentos ya firmados.</p>
                    <p><strong>13.2 Divisibilidad:</strong> Si alguna disposición es declarada inválida, las demás disposiciones permanecerán en vigor.</p>
                    <p><strong>13.3 No Renuncia:</strong> La falta de ejercicio de un derecho no constituye renuncia al mismo.</p>
                    <p><strong>13.4 Cesión:</strong> El Cliente no puede ceder estos Términos sin consentimiento escrito de SST Colombia.</p>
                    <p><strong>13.5 Notificaciones:</strong> Todas las notificaciones deben enviarse por escrito al correo electrónico registrado o domicilio legal.</p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">14. Información de Contacto</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>Razón Social:</strong> SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.</p>
                    <p><strong>NIT:</strong> 902.036.337-4</p>
                    <p><strong>Representante Legal:</strong> Luz Adriana Díaz Calle</p>
                    <p><strong>Domicilio:</strong> {PROVIDER_LEGAL_ADDRESS}</p>
                    <p><strong>Correo Electrónico:</strong> LADIC2023@ICLOUD.COM | legal@sst-colombia.com</p>
                    <p><strong>Teléfono:</strong> 300 522 0679</p>
                    <p><strong>Soporte Técnico:</strong> soporte@sst-colombia.com</p>
                    <p><strong>Protección de Datos (DPO):</strong> dpo@sst-colombia.com</p>
                  </div>
                </section>

                <Separator />

                <section className="bg-muted/50 p-4 rounded-lg">
                  <h2 className="text-xl font-semibold mb-3">Declaración de Aceptación</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>AL CREAR UNA CUENTA Y UTILIZAR LA PLATAFORMA SST COLOMBIA, USTED RECONOCE HABER LEÍDO, 
                    COMPRENDIDO Y ACEPTADO ESTOS TÉRMINOS Y CONDICIONES DE SERVICIO EN SU TOTALIDAD.</strong>
                  </p>
                  <p className="text-muted-foreground mt-3 text-xs">
                    Si tiene preguntas sobre estos Términos, por favor contacte a legal@sst-colombia.com antes de usar la Plataforma.
                  </p>
                </section>

                <div className="text-center text-xs text-muted-foreground mt-8 pt-4 border-t">
                  <p>Fecha de vigencia: {TERMS_LAST_UPDATED}</p>
                  <p className="mt-1">© 2026 SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S. Todos los derechos reservados.</p>
                </div>
    </div>
  );
}

export default function TerminosServicio() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <CardTitle className="text-3xl">Términos y Condiciones de Servicio</CardTitle>
            </div>
            <CardDescription>
              SST Colombia - Sistema de Gestión de Salud y Seguridad en el Trabajo
            </CardDescription>
            <p className="text-sm text-muted-foreground">
              Última actualización: {TERMS_LAST_UPDATED}
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <TerminosServicioContent />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FileText } from "lucide-react";

export default function TerminosServicio() {
  const lastUpdated = "11 de noviembre de 2025";

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
              Última actualización: {lastUpdated}
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
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
                      <li>Almacenamiento seguro en la nube con respaldos diarios</li>
                    </ul>
                    <p><strong>3.2 Nivel de Servicio:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Disponibilidad objetivo: 99.5% mensual (excluyendo mantenimientos programados)</li>
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
                    <p><strong>4.2 Información Veraz:</strong> El Cliente garantiza que toda la información ingresada en la Plataforma es veraz, actualizada y completa.</p>
                    <p><strong>4.3 Seguridad de Credenciales:</strong> El Cliente es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades que ocurran bajo su cuenta.</p>
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
                      <p><strong>5.1 PROPIEDAD INTELECTUAL:</strong> El Cliente reconoce y acepta que el Software, incluyendo pero no limitado a su código fuente, arquitectura de datos, interfaces de usuario, diseños, y muy especialmente <strong>la metodología de filtrado lógico de estándares y la curaduría legal de contenidos basada en la Resolución 0312 de 2019</strong>, son propiedad exclusiva de SST Colombia S.A.S.</p>
                    </div>
                    <p><strong>5.2 Registro Legal:</strong> Dichos activos se encuentran protegidos por las leyes de derecho de autor y tratados internacionales, contando con el <strong>registro oficial ante la Dirección Nacional de Derecho de Autor (DNDA) bajo el número 13-197-177</strong>.</p>
                    <p><strong>5.3 Licencia de Uso:</strong> Se otorga al Cliente una licencia no exclusiva, no transferible y revocable para usar la Plataforma durante la vigencia del contrato.</p>
                    <p><strong>5.4 Propiedad de Datos:</strong> Los datos ingresados por el Cliente permanecen como propiedad del Cliente. SST Colombia actúa únicamente como procesador de datos según GDPR Art. 28 y Ley 1581/2012.</p>
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
                      <li>Respaldos diarios encriptados con retención de 20 años</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">7. Tarifas y Pagos</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>7.1 Modalidad de Pago:</strong> Los servicios se facturan mensualmente o anualmente según el plan contratado.</p>
                    <p><strong>7.2 Métodos de Pago:</strong> Aceptamos transferencias bancarias, tarjetas de crédito y PSE (Pagos Seguros en Línea).</p>
                    <p><strong>7.3 Renovación Automática:</strong> El servicio se renueva automáticamente al finalizar cada período, salvo notificación de cancelación con 30 días de anticipación.</p>
                    <p><strong>7.4 Mora:</strong> El retraso en el pago generará intereses de mora a la tasa máxima legal vigente en Colombia (1.5% mensual).</p>
                    <p><strong>7.5 Suspensión por Falta de Pago:</strong> SST Colombia se reserva el derecho de suspender el acceso a la Plataforma tras 15 días de mora en el pago.</p>
                    <p><strong>7.6 Modificación de Tarifas:</strong> Los precios pueden modificarse con notificación de 60 días de anticipación. El Cliente puede cancelar sin penalización durante este período.</p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">8. Cancelación y Terminación</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>8.1 Cancelación por el Cliente:</strong> El Cliente puede cancelar el servicio con 30 días de anticipación. No se realizarán reembolsos por períodos parciales.</p>
                    <p><strong>8.2 Terminación por SST Colombia:</strong> SST Colombia puede terminar el servicio inmediatamente en caso de:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Uso fraudulento o ilegal de la Plataforma</li>
                      <li>Violación material de estos Términos</li>
                      <li>Falta de pago superior a 30 días</li>
                      <li>Actividades que pongan en riesgo la seguridad de la Plataforma</li>
                    </ul>
                    <p><strong>8.3 Exportación de Datos:</strong> Tras la terminación, el Cliente tiene 30 días para exportar sus datos. Posterior a este período, los datos serán anonimizados o eliminados.</p>
                    <p><strong>8.4 Retención Legal:</strong> SST Colombia retendrá registros de auditoría durante 20 años según Decreto 1074/2015 Art. 2.2.4.6.13.</p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">9. Limitación de Responsabilidad y Alcance del Servicio</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/30">
                      <p><strong>9.1 ALCANCE DEL SERVICIO:</strong> El Cliente acepta que el Software es una <strong>herramienta digital diseñada para facilitar la autoevaluación y gestión</strong> de los estándares mínimos de la Resolución 0312 de 2019. El uso del Software <strong>no garantiza por sí solo el cumplimiento legal total</strong>, ya que este depende de la ejecución real de las actividades, capacitaciones y medidas de control en los centros de trabajo físicos del Cliente.</p>
                    </div>
                    
                    <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                      <p className="font-semibold mb-2">9.2 RESPONSABILIDAD DEL CLIENTE:</p>
                      <p className="mb-2">Es responsabilidad exclusiva del Cliente:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>La veracidad y exactitud de los datos ingresados (número de trabajadores, nivel de riesgo, NIT, etc.).</li>
                        <li>El cumplimiento de las actividades de campo, inspecciones y mantenimientos que sugiere el sistema.</li>
                        <li>Contar con el acompañamiento de un profesional, tecnólogo o técnico con <strong>licencia vigente en SST</strong> cuando la norma así lo exija para el diseño y firma del sistema.</li>
                      </ul>
                    </div>

                    <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/30">
                      <p className="font-semibold text-destructive mb-2">9.3 LIMITACIÓN DE RESPONSABILIDAD:</p>
                      <p className="mb-2">SST Colombia S.A.S. <strong>NO será responsable</strong> por:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Sanciones o multas impuestas por el Ministerio del Trabajo o cualquier autoridad competente debido a la falta de implementación real del sistema por parte del Cliente.</li>
                        <li>Accidentes de trabajo o enfermedades laborales ocurridas en las instalaciones del Cliente.</li>
                        <li>Pérdida de beneficios o daños indirectos derivados del uso de la plataforma.</li>
                      </ul>
                    </div>

                    <p><strong>9.4 Exclusión de Garantías:</strong> La Plataforma se proporciona "tal cual" y "según disponibilidad". SST Colombia no garantiza que el servicio será ininterrumpido o libre de errores.</p>
                    <p><strong>9.5 Límite Monetario:</strong> En ningún caso SST Colombia será responsable por daños indirectos, incidentales o consecuentes superiores al monto pagado por el Cliente en los últimos 12 meses.</p>
                    <p><strong>9.6 Fuerza Mayor:</strong> SST Colombia no será responsable por incumplimientos causados por eventos fuera de su control razonable (desastres naturales, fallas de infraestructura de terceros, etc.).</p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">10. Indemnización</h2>
                  <p className="text-muted-foreground">
                    El Cliente acuerda indemnizar y eximir de responsabilidad a SST Colombia, sus directores, 
                    empleados y agentes de cualquier reclamo, demanda, daño, costo o gasto (incluyendo honorarios 
                    legales razonables) que surjan de: (a) uso de la Plataforma por el Cliente, (b) violación de 
                    estos Términos, (c) violación de normatividad SST colombiana, o (d) infracción de derechos de 
                    terceros, incluyendo derechos de protección de datos.
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
                    <p><strong>11.2 Jurisdicción:</strong> Cualquier disputa será resuelta por los tribunales competentes de Bogotá D.C., Colombia.</p>
                    <p><strong>11.3 Resolución de Controversias:</strong> Las partes acuerdan intentar resolver cualquier disputa mediante mediación antes de acudir a tribunales.</p>
                    <p><strong>11.4 Idioma:</strong> La versión en español de estos Términos prevalecerá en caso de discrepancias con traducciones.</p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">12. Modificaciones a los Términos</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>12.1 Derecho a Modificar:</strong> SST Colombia se reserva el derecho de modificar estos Términos en cualquier momento.</p>
                    <p><strong>12.2 Notificación:</strong> Los cambios materiales se notificarán por correo electrónico con 30 días de anticipación.</p>
                    <p><strong>12.3 Aceptación de Cambios:</strong> El uso continuado de la Plataforma tras la notificación constituye aceptación de los nuevos términos.</p>
                    <p><strong>12.4 Rechazo de Cambios:</strong> Si el Cliente no acepta los cambios, puede cancelar el servicio sin penalización durante el período de notificación.</p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">13. Disposiciones Generales</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>13.1 Totalidad del Acuerdo:</strong> Estos Términos constituyen el acuerdo completo entre las partes y reemplazan cualquier acuerdo previo.</p>
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
                    <p><strong>Razón Social:</strong> SST Colombia S.A.S.</p>
                    <p><strong>NIT:</strong> 900.XXX.XXX-X (Pendiente de asignación)</p>
                    <p><strong>Domicilio:</strong> Bogotá D.C., Colombia</p>
                    <p><strong>Correo Electrónico:</strong> legal@sst-colombia.com</p>
                    <p><strong>Soporte Técnico:</strong> soporte@sst-colombia.com</p>
                    <p><strong>Protección de Datos (DPO):</strong> dpo@sst-colombia.com</p>
                    <p><strong>Teléfono:</strong> +57 (1) XXX-XXXX</p>
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
                  <p>Documento versión 1.0 | Fecha de vigencia: {lastUpdated}</p>
                  <p className="mt-1">© 2026 SST Colombia S.A.S. Todos los derechos reservados.</p>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

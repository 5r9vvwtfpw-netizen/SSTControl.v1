import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FileSignature } from "lucide-react";
import { SAAS_CONTRACT_EFFECTIVE_DATE } from "@shared/saas-contract";
import { PROVIDER_LEGAL_ADDRESS } from "@shared/legal-contact";

export function ContratoSaaSContent() {
  return (
    <div className="space-y-6 text-sm">
                <section data-testid="section-partes">
                  <h2 className="text-xl font-semibold mb-3">1. Partes del Contrato</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <div className="bg-muted p-3 rounded">
                      <p className="font-semibold">Proveedor:</p>
                      <p><strong>Razón Social:</strong> SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.</p>
                      <p><strong>NIT:</strong> 902.036.337-4</p>
                      <p><strong>Representante Legal:</strong> Luz Adriana Díaz Calle</p>
                      <p><strong>Domicilio:</strong> {PROVIDER_LEGAL_ADDRESS}</p>
                      <p><strong>Actividad:</strong> Prestación de servicios de software para gestión de Seguridad y Salud en el Trabajo</p>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <p className="font-semibold">Cliente:</p>
                      <p>La empresa o persona jurídica que contrata los servicios de la plataforma SST Colombia, identificada al momento de la suscripción del servicio.</p>
                    </div>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-objeto">
                  <h2 className="text-xl font-semibold mb-3">2. Objeto del Contrato</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>El presente contrato tiene por objeto la prestación de servicios de Software como Servicio (SaaS) para la gestión del Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST) y del Plan Estratégico de Seguridad Vial (PESV), conforme a la normatividad colombiana aplicable:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Decreto 1072 de 2015:</strong> Decreto Único Reglamentario del Sector Trabajo</li>
                      <li><strong>Resolución 0312 de 2019:</strong> Estándares Mínimos del SG-SST</li>
                      <li><strong>Resolución 40595 de 2022:</strong> Metodología del PESV</li>
                      <li><strong>ISO 45001:2018:</strong> Sistemas de Gestión de la Seguridad y Salud en el Trabajo</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-alcance">
                  <h2 className="text-xl font-semibold mb-3">3. Alcance de los Servicios</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>El Proveedor se compromete a brindar los siguientes servicios a través de la plataforma:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Gestión integral del SG-SST:</strong> Módulos completos para planear, hacer, verificar y actuar (ciclo PHVA) conforme a Resolución 0312/2019</li>
                      <li><strong>Módulo PESV:</strong> Plan Estratégico de Seguridad Vial conforme a la Resolución 40595 de 2022</li>
                      <li><strong>Gestión de trabajadores y datos ocupacionales:</strong> Registro, seguimiento y administración de información de empleados, contratistas y visitantes</li>
                      <li><strong>Generación de reportes y documentos PDF:</strong> Informes normativos, actas, formatos FURAT/FUREL, matrices y documentos legales</li>
                      <li><strong>Almacenamiento seguro en la nube:</strong> Datos cifrados con respaldos automáticos y retención conforme a normativa</li>
                      <li><strong>Soporte técnico:</strong> Asistencia técnica durante horario laboral colombiano (Lunes a Viernes 8:00-17:00)</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-sla">
                  <h2 className="text-xl font-semibold mb-3">4. Niveles de Servicio (SLA)</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>El Proveedor se compromete a mantener los siguientes niveles de servicio:</p>
                    <div className="bg-muted p-3 rounded overflow-x-auto">
                      <table className="w-full text-xs" data-testid="table-sla">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 pr-4">Métrica</th>
                            <th className="text-left py-2">Nivel de Servicio</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-2 pr-4 font-semibold">Disponibilidad mensual</td>
                            <td className="py-2">99.5% (99.9% para planes de grandes empresas)</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2 pr-4 font-semibold">Tiempo de respuesta soporte</td>
                            <td className="py-2">24 horas hábiles</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2 pr-4 font-semibold">Tiempo de resolución crítico</td>
                            <td className="py-2">4 horas</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-4 font-semibold">Backups</td>
                            <td className="py-2">Respaldos diarios cifrados, con retención de hasta 20 años mientras la suscripción permanezca activa; al terminar el servicio, rige el plazo de exportación y eliminación de la sección 11.4</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs italic mt-2">La disponibilidad se calcula excluyendo ventanas de mantenimiento programado, las cuales serán notificadas con 48 horas de anticipación.</p>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-obligaciones-proveedor">
                  <h2 className="text-xl font-semibold mb-3">5. Obligaciones del Proveedor</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>El Proveedor se obliga a:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Mantener la plataforma disponible conforme a los niveles de servicio establecidos</li>
                      <li>Proteger los datos personales de acuerdo con la Ley 1581 de 2012 y el GDPR</li>
                      <li>Prestar las funcionalidades y generar los informes ofrecidos conforme al alcance contratado y a la normativa aplicable a la Plataforma, sin asumir las obligaciones de implementación que corresponden al Cliente</li>
                      <li>Notificar al Cliente sobre incidentes de seguridad que afecten sus datos dentro de 24 horas</li>
                      <li>Realizar actualizaciones y mejoras continuas a la plataforma</li>
                      <li>Brindar soporte técnico en los tiempos establecidos</li>
                      <li>Mantener respaldos seguros de la información del Cliente</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-obligaciones-cliente">
                  <h2 className="text-xl font-semibold mb-3">6. Obligaciones del Cliente</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>El Cliente se obliga a:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Proveer información veraz, completa y actualizada en la plataforma</li>
                      <li>Mantener la confidencialidad de sus credenciales de acceso (usuario y contraseña)</li>
                      <li>Utilizar la plataforma conforme a la ley y a los fines para los cuales fue diseñada</li>
                      <li>Pagar oportunamente las tarifas correspondientes al plan contratado</li>
                      <li>Notificar inmediatamente cualquier uso no autorizado de su cuenta</li>
                      <li>Obtener el consentimiento de los titulares de datos personales conforme a la Ley 1581/2012</li>
                      <li>No intentar realizar ingeniería inversa, descompilar o copiar el software</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-propiedad-intelectual">
                  <h2 className="text-xl font-semibold mb-3">7. Propiedad Intelectual</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                      <p>El software SST Colombia se encuentra debidamente registrado ante la <strong>Dirección Nacional de Derecho de Autor (DNDA)</strong> bajo el número de registro <strong>13-197-177</strong>.</p>
                    </div>
                    <ul className="list-disc pl-6 space-y-1 mt-3">
                      <li>El Cliente <strong>no adquiere derechos</strong> sobre el código fuente, la arquitectura, los algoritmos ni la propiedad intelectual del software</li>
                      <li>Se otorga una licencia de uso no exclusiva, no transferible y revocable durante la vigencia del contrato</li>
                      <li>La metodología de filtrado de estándares y la curaduría legal de contenidos son propiedad exclusiva del Proveedor</li>
                      <li>Queda prohibida la reproducción, distribución o creación de obras derivadas sin autorización expresa</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-proteccion-datos">
                  <h2 className="text-xl font-semibold mb-3">8. Protección de Datos</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>En relación con el tratamiento de datos personales:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>El Proveedor actúa como <strong>Encargado del Tratamiento</strong> conforme a la Ley 1581 de 2012</li>
                      <li>El Cliente actúa como <strong>Responsable del Tratamiento</strong> de los datos de sus trabajadores</li>
                      <li>Se incluye como parte integral de este contrato el <strong>Acuerdo de Procesamiento de Datos (DPA)</strong> disponible en la plataforma</li>
                      <li>El Proveedor implementa medidas técnicas y organizativas conformes a ISO 27001 y GDPR</li>
                      <li>Los datos se almacenan con cifrado AES-256 en reposo y TLS 1.3 en tránsito</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-confidencialidad">
                  <h2 className="text-xl font-semibold mb-3">9. Confidencialidad</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>Ambas partes se comprometen a mantener la confidencialidad de toda la información intercambiada con motivo de este contrato, incluyendo pero no limitado a:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Datos personales de trabajadores y empleados</li>
                      <li>Información comercial y financiera</li>
                      <li>Documentación técnica y operativa del SG-SST</li>
                      <li>Credenciales de acceso y configuraciones de seguridad</li>
                    </ul>
                    <p className="mt-2">Esta obligación de confidencialidad permanecerá vigente durante la ejecución del contrato y por un período de <strong>5 años</strong> después de su terminación, sin perjuicio de la reserva de los datos personales conservados por obligación legal mientras se mantengan.</p>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-precio-pago">
                  <h2 className="text-xl font-semibold mb-3">10. Precio y Forma de Pago</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>10.1 Precio:</strong> El precio del servicio se determina según el plan contratado por el Cliente, de acuerdo con la tabla de planes y precios vigente en la plataforma.</p>
                    <p><strong>10.2 Modalidad de Pago:</strong> Los pagos pueden realizarse de forma mensual o anual, con descuentos aplicables a planes anuales.</p>
                    <p><strong>10.3 Procesamiento de Pagos:</strong> Los pagos nuevos se procesan mediante transferencia bancaria PSE a través de ePayco.</p>
                    <p><strong>10.4 Facturación:</strong> Se emitirá factura electrónica conforme a la normatividad tributaria colombiana vigente.</p>
                    <p><strong>10.5 Mora:</strong> El retraso en el pago generará intereses de mora a la tasa máxima legal vigente en Colombia.</p>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-duracion">
                  <h2 className="text-xl font-semibold mb-3">11. Duración y Terminación</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>11.1 Duración:</strong> El presente contrato estará vigente mientras dure la suscripción activa del Cliente al servicio.</p>
                    <p><strong>11.2 Terminación por el Cliente:</strong> El Cliente puede terminar el contrato en cualquier momento con <strong>30 días de anticipación</strong>. No se realizarán reembolsos por períodos parciales.</p>
                    <p><strong>11.3 Terminación por el Proveedor:</strong> El Proveedor puede terminar el contrato con 30 días de anticipación o de forma inmediata en caso de incumplimiento grave por parte del Cliente.</p>
                    <p><strong>11.4 Efectos de la Terminación:</strong> Tras la terminación, el Cliente dispondrá de 30 días para descargar y exportar sus informes y datos. Transcurrido este período, se eliminarán sus datos y respaldos conforme al DPA, sin perjuicio de los registros que deban conservarse por obligación legal.</p>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-suspension">
                  <h2 className="text-xl font-semibold mb-3">12. Suspensión del Servicio</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>El Proveedor podrá suspender el acceso a la plataforma en los siguientes casos:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Falta de pago:</strong> Cuando venza el período de servicio sin que se haya confirmado el pago correspondiente</li>
                      <li><strong>Uso indebido:</strong> Cuando se detecte uso fraudulento, ilegal o que ponga en riesgo la seguridad de la plataforma o de otros usuarios</li>
                      <li><strong>Orden judicial:</strong> Cuando medie orden de autoridad judicial o administrativa competente</li>
                    </ul>
                    <p className="mt-2">La suspensión por falta de pago será levantada una vez el Cliente regularice su situación. Durante la suspensión, los datos del Cliente se conservarán de forma segura.</p>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-limitacion-responsabilidad">
                  <h2 className="text-xl font-semibold mb-3">13. Responsabilidades sobre el servicio</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <ul className="list-disc pl-6 space-y-1">
                      <li>El Proveedor responde por el funcionamiento de la Plataforma y por la generación de informes conforme a las funcionalidades y al alcance ofrecidos. El Cliente es responsable de suministrar información completa y actualizada, revisar los informes de acuerdo con el contexto de su organización y decidir e implementar las acciones correspondientes</li>
                      <li>Los informes son una herramienta de apoyo y no garantizan por sí solos el cumplimiento legal integral del SG-SST, que también depende de la calidad de los datos y de la implementación efectiva por parte del Cliente. Esta cláusula no excluye responsabilidades que la ley no permita limitar</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-ley-aplicable">
                  <h2 className="text-xl font-semibold mb-3">14. Ley Aplicable</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>El presente contrato se rige por las <strong>leyes de la República de Colombia</strong>, en particular:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Código de Comercio (Decreto 410 de 1971)</li>
                      <li>Ley 527 de 1999 (Comercio Electrónico)</li>
                      <li>Ley 1480 de 2011 (Estatuto del Consumidor)</li>
                      <li>Ley 1581 de 2012 (Protección de Datos Personales)</li>
                      <li>Decreto 1072 de 2015 (Sector Trabajo)</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-controversias">
                  <h2 className="text-xl font-semibold mb-3">15. Resolución de Controversias</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>15.1 Conciliación:</strong> Cualquier controversia derivada del presente contrato será sometida inicialmente a conciliación ante el <strong>Centro de Conciliación de la Cámara de Comercio de Medellín</strong>.</p>
                    <p><strong>15.2 Jurisdicción:</strong> En caso de no llegar a un acuerdo mediante conciliación, las partes se someterán a la jurisdicción de los <strong>juzgados competentes de Medellín, Colombia</strong>.</p>
                    <p><strong>15.3 Idioma:</strong> La versión en español de este contrato prevalecerá en caso de discrepancias con traducciones a otros idiomas.</p>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-modificaciones">
                  <h2 className="text-xl font-semibold mb-3">16. Modificaciones</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>El Proveedor se reserva el derecho de modificar los términos de este contrato con <strong>30 días de anticipación</strong>. Las modificaciones serán notificadas al Cliente mediante:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Correo electrónico a la dirección registrada</li>
                      <li>Notificación dentro de la plataforma</li>
                    </ul>
                    <p className="mt-2">El uso continuado de la plataforma después del período de notificación constituye aceptación de las modificaciones. Si el Cliente no acepta los cambios, podrá terminar el contrato sin penalización durante el período de notificación.</p>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-contacto">
                  <h2 className="text-xl font-semibold mb-3">17. Contacto</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>Para cualquier consulta relacionada con este contrato, puede contactarnos a través de:</p>
                    <div className="bg-muted p-3 rounded">
                      <p><strong>Asuntos Legales:</strong> <a href="mailto:legal@sst-colombia.com" className="underline hover:text-foreground transition-colors" data-testid="link-email-legal">legal@sst-colombia.com</a></p>
                      <p><strong>Soporte Técnico:</strong> <a href="mailto:soporte@sst-colombia.com" className="underline hover:text-foreground transition-colors" data-testid="link-email-soporte-3">soporte@sst-colombia.com</a></p>
                      <p><strong>Domicilio:</strong> {PROVIDER_LEGAL_ADDRESS}</p>
                    </div>
                  </div>
                </section>

                <div className="text-center text-xs text-muted-foreground mt-8 pt-4 border-t">
                  <p>Fecha de vigencia: {SAAS_CONTRACT_EFFECTIVE_DATE}</p>
                  <p className="mt-1">© 2026 SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S. Todos los derechos reservados.</p>
                </div>
    </div>
  );
}

export default function ContratoSaaS() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <FileSignature className="h-6 w-6 text-foreground" />
              <CardTitle className="text-3xl" data-testid="text-page-title">Contrato de Prestación de Servicios SaaS</CardTitle>
            </div>
            <CardDescription>
              Contrato de Servicios de Software como Servicio (SaaS) - SST Colombia
            </CardDescription>
            <p className="text-sm text-muted-foreground">
              Última actualización: {SAAS_CONTRACT_EFFECTIVE_DATE}
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <ContratoSaaSContent />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
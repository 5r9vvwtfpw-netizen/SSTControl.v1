import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Shield, Building2, Scale, FileText, Users, Clock, Eye, Mail, Phone, MapPin } from "lucide-react";

export default function PoliticaPrivacidadProveedor() {
  const lastUpdated = "27 de noviembre de 2025";
  const policyVersion = "1.0";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card data-testid="card-privacy-policy">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle className="text-3xl" data-testid="text-policy-title">
                Política de Privacidad del Proveedor SaaS
              </CardTitle>
            </div>
            <CardDescription data-testid="text-policy-description">
              Tratamiento de Datos Personales por SST Colombia como Responsable del Tratamiento
            </CardDescription>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span data-testid="text-last-updated">Última actualización: {lastUpdated}</span>
              <span data-testid="text-policy-version">Versión: {policyVersion}</span>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6 text-sm">
                <section className="bg-primary/5 p-4 rounded-lg border border-primary/20" data-testid="section-introduction">
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S. - Responsable del Tratamiento
                  </h2>
                  <p className="text-muted-foreground">
                    SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S. (en adelante "SST Colombia", "nosotros" o "el Proveedor") es una empresa 
                    colombiana dedicada a proporcionar servicios de software como servicio (SaaS) para la gestión 
                    de Sistemas de Seguridad y Salud en el Trabajo (SG-SST). Como Responsable del Tratamiento de 
                    datos personales, nos comprometemos a proteger la privacidad de nuestros clientes, usuarios y 
                    titulares de datos conforme a la legislación colombiana vigente.
                  </p>
                </section>

                <Separator />

                <section data-testid="section-company-info">
                  <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    1. Información de la Empresa
                  </h2>
                  <div className="space-y-3 text-muted-foreground">
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <p><strong>Razón Social:</strong> SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.</p>
                      <p><strong>NIT:</strong> Consultar en sección "Mi Cuenta" del sistema</p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span><strong>Domicilio:</strong> Medellín, Colombia</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span><strong>Correo de Privacidad:</strong> <a href="mailto:privacidad@sst-colombia.com" className="text-primary hover:underline">privacidad@sst-colombia.com</a></span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span><strong>Oficial de Protección de Datos (DPO):</strong> <a href="mailto:dpo@sst-colombia.com" className="text-primary hover:underline">dpo@sst-colombia.com</a></span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span><strong>Canal de Atención:</strong> A través del portal de soporte en el sistema</span>
                      </p>
                    </div>
                    <p>
                      SST Colombia actúa como <strong>Responsable del Tratamiento</strong> cuando recopila y procesa 
                      datos para la prestación del servicio SaaS, y como <strong>Encargado del Tratamiento</strong> 
                      cuando procesa datos de los trabajadores de las empresas clientes bajo sus instrucciones.
                    </p>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-legal-framework">
                  <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Scale className="h-5 w-5" />
                    2. Marco Legal Aplicable
                  </h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p>Esta Política de Privacidad se rige por el siguiente marco normativo colombiano:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>
                        <strong>Ley 1581 de 2012:</strong> Régimen General de Protección de Datos Personales (Habeas Data). 
                        Establece los principios rectores del tratamiento de datos, derechos de los titulares y 
                        obligaciones de responsables y encargados.
                      </li>
                      <li>
                        <strong>Decreto 1377 de 2013:</strong> Reglamenta parcialmente la Ley 1581/2012. Define 
                        procedimientos de autorización, avisos de privacidad y transferencias internacionales.
                      </li>
                      <li>
                        <strong>Decreto 1074 de 2015:</strong> Decreto Único Reglamentario del Sector Comercio, 
                        Industria y Turismo. Consolida las normas de protección de datos.
                      </li>
                      <li>
                        <strong>Circular Externa 002 de 2015 (SIC):</strong> Guía sobre el Registro Nacional de Bases 
                        de Datos y otros aspectos de protección de datos.
                      </li>
                      <li>
                        <strong>Resolución 0312 de 2019:</strong> Estándares Mínimos del Sistema de Gestión de SST. 
                        Establece períodos de conservación de 20 años para documentos SST.
                      </li>
                      <li>
                        <strong>Decreto 1072 de 2015:</strong> Decreto Único Reglamentario del Sector Trabajo. 
                        Regula el tratamiento de datos en el contexto de SST.
                      </li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-data-types">
                  <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    3. Tipos de Datos Personales Recopilados
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <div>
                      <p className="font-semibold text-foreground">3.1 Datos de Empresas Clientes:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>Razón social, NIT, dirección comercial</li>
                        <li>Datos de contacto (teléfono, correo electrónico)</li>
                        <li>Información de facturación y medios de pago</li>
                        <li>Datos de representantes legales</li>
                        <li>Nivel de riesgo laboral (I-V) y número de trabajadores</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">3.2 Datos de Usuarios de la Plataforma:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>Nombre completo, correo electrónico corporativo</li>
                        <li>Rol en la plataforma y permisos de acceso</li>
                        <li>Credenciales de autenticación (contraseñas hasheadas)</li>
                        <li>Historial de acceso y acciones realizadas (logs de auditoría)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-red-600">3.3 Datos Sensibles (procesados como Encargado):</p>
                      <p className="text-xs italic text-red-600">Requieren consentimiento explícito según Ley 1581/2012 Art. 6</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>Datos de salud ocupacional de trabajadores</li>
                        <li>Resultados de exámenes médicos ocupacionales</li>
                        <li>Historial de accidentes y enfermedades laborales</li>
                        <li>Restricciones médicas e incapacidades</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">3.4 Datos Técnicos:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>Dirección IP y geolocalización aproximada</li>
                        <li>Tipo de navegador y sistema operativo</li>
                        <li>Fecha, hora y duración de sesiones</li>
                        <li>Páginas visitadas y funcionalidades utilizadas</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-purposes">
                  <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    4. Finalidades del Tratamiento
                  </h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p>Los datos personales se tratan exclusivamente para las siguientes finalidades legítimas:</p>
                    <div className="space-y-4">
                      <div>
                        <p className="font-semibold text-foreground">4.1 Prestación del Servicio SaaS:</p>
                        <ul className="list-disc pl-6 space-y-1 mt-2">
                          <li>Gestión del Sistema de Seguridad y Salud en el Trabajo (SG-SST)</li>
                          <li>Almacenamiento seguro de documentación SST</li>
                          <li>Generación de reportes normativos y tableros ejecutivos</li>
                          <li>Cumplimiento de estándares mínimos según Resolución 0312/2019</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">4.2 Gestión Comercial:</p>
                        <ul className="list-disc pl-6 space-y-1 mt-2">
                          <li>Facturación y cobro de suscripciones</li>
                          <li>Comunicaciones sobre el servicio contratado</li>
                          <li>Soporte técnico y atención al cliente</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">4.3 Cumplimiento Legal:</p>
                        <ul className="list-disc pl-6 space-y-1 mt-2">
                          <li>Atención de requerimientos de autoridades competentes</li>
                          <li>Conservación de registros según normativa aplicable</li>
                          <li>Auditoría y control interno</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">4.4 Mejora del Servicio:</p>
                        <ul className="list-disc pl-6 space-y-1 mt-2">
                          <li>Análisis estadístico de uso (datos anonimizados)</li>
                          <li>Desarrollo de nuevas funcionalidades</li>
                          <li>Optimización del rendimiento de la plataforma</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-arco-rights">
                  <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    5. Derechos de los Titulares (Derechos ARCO)
                  </h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p>Conforme al Artículo 8 de la Ley 1581 de 2012, los titulares de datos personales tienen los siguientes derechos:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="border p-4 rounded-lg">
                        <p className="font-semibold flex items-center gap-2 text-foreground">
                          <span className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">A</span>
                          Acceso
                        </p>
                        <p className="text-sm mt-2">
                          Conocer qué datos personales suyos están siendo tratados, con qué finalidad, 
                          durante cuánto tiempo y a quiénes se han transferido o transmitido.
                        </p>
                      </div>
                      <div className="border p-4 rounded-lg">
                        <p className="font-semibold flex items-center gap-2 text-foreground">
                          <span className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">R</span>
                          Rectificación
                        </p>
                        <p className="text-sm mt-2">
                          Solicitar la corrección o actualización de datos personales que sean inexactos, 
                          incompletos o desactualizados.
                        </p>
                      </div>
                      <div className="border p-4 rounded-lg">
                        <p className="font-semibold flex items-center gap-2 text-foreground">
                          <span className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">C</span>
                          Cancelación (Supresión)
                        </p>
                        <p className="text-sm mt-2">
                          Solicitar la eliminación de sus datos personales cuando no exista obligación 
                          legal o contractual de conservarlos.
                        </p>
                      </div>
                      <div className="border p-4 rounded-lg">
                        <p className="font-semibold flex items-center gap-2 text-foreground">
                          <span className="bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">O</span>
                          Oposición
                        </p>
                        <p className="text-sm mt-2">
                          Oponerse al tratamiento de sus datos personales por motivos legítimos y fundados, 
                          salvo cuando exista obligación legal o contractual.
                        </p>
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg mt-4">
                      <p className="font-semibold text-foreground">¿Cómo ejercer sus derechos ARCO?</p>
                      <p className="mt-2">
                        Para ejercer sus derechos, envíe una solicitud a <a href="mailto:arco@sst-colombia.com" className="text-primary hover:underline">arco@sst-colombia.com</a> 
                        {" "}o a través del módulo "Solicitudes ARCO" disponible en la plataforma, indicando:
                      </p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>Nombre completo y documento de identidad</li>
                        <li>Descripción clara del derecho que desea ejercer</li>
                        <li>Datos de contacto para respuesta</li>
                        <li>Documentos que soporten la solicitud (si aplica)</li>
                      </ul>
                      <p className="mt-3 text-sm italic">
                        <strong>Plazo de respuesta:</strong> 10 días hábiles, prorrogables por 5 días adicionales 
                        según Decreto 1377/2013 Art. 15.
                      </p>
                    </div>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-retention">
                  <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    6. Períodos de Conservación de Datos
                  </h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p>Los datos personales se conservarán según los siguientes criterios legales:</p>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse mt-3">
                        <thead>
                          <tr className="bg-muted">
                            <th className="border p-2 text-left font-semibold">Tipo de Dato</th>
                            <th className="border p-2 text-left font-semibold">Período de Conservación</th>
                            <th className="border p-2 text-left font-semibold">Base Legal</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border p-2">Documentos SG-SST</td>
                            <td className="border p-2 font-semibold">20 años</td>
                            <td className="border p-2">Resolución 0312/2019 Art. 3</td>
                          </tr>
                          <tr>
                            <td className="border p-2">Historia clínica ocupacional</td>
                            <td className="border p-2 font-semibold">20 años</td>
                            <td className="border p-2">Resolución 2346/2007 Art. 14</td>
                          </tr>
                          <tr>
                            <td className="border p-2">Reportes de accidentes (FURAT)</td>
                            <td className="border p-2 font-semibold">Indefinido</td>
                            <td className="border p-2">Decreto 1072/2015</td>
                          </tr>
                          <tr>
                            <td className="border p-2">Logs de auditoría</td>
                            <td className="border p-2 font-semibold">20 años</td>
                            <td className="border p-2">Ley 1581/2012, Decreto 1074/2015</td>
                          </tr>
                          <tr>
                            <td className="border p-2">Datos de facturación</td>
                            <td className="border p-2 font-semibold">10 años</td>
                            <td className="border p-2">Estatuto Tributario Art. 632</td>
                          </tr>
                          <tr>
                            <td className="border p-2">Datos de usuarios inactivos</td>
                            <td className="border p-2 font-semibold">2 años</td>
                            <td className="border p-2">Política interna</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-3 text-sm">
                      Una vez cumplido el período de retención y sin obligación legal de conservación, 
                      los datos serán eliminados de forma segura mediante borrado criptográfico o 
                      sobrescritura segura de medios.
                    </p>
                  </div>
                </section>

                <Separator />

                <section className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800" data-testid="section-provider-access">
                  <h2 className="text-xl font-semibold mb-3 flex items-center gap-2 text-amber-800 dark:text-amber-200">
                    <Eye className="h-5 w-5" />
                    7. Acceso del Proveedor a Datos del Cliente (Transparencia)
                  </h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p>
                      <strong className="text-foreground">Importante:</strong> Como parte de nuestro compromiso con la 
                      transparencia y el cumplimiento del principio de Acceso Restringido (Ley 1581/2012 Art. 4), 
                      informamos que el personal autorizado de SST Colombia (superadministradores) puede acceder 
                      a los datos de las empresas clientes en los siguientes casos:
                    </p>
                    <div className="space-y-3 mt-4">
                      <div className="border-l-4 border-amber-500 pl-4">
                        <p className="font-semibold text-foreground">7.1 Motivos Legítimos de Acceso:</p>
                        <ul className="list-disc pl-6 space-y-1 mt-2">
                          <li><strong>Soporte Técnico:</strong> Resolución de incidencias reportadas por el cliente</li>
                          <li><strong>Mantenimiento:</strong> Actividades de mantenimiento preventivo o correctivo</li>
                          <li><strong>Auditoría Interna:</strong> Verificación de cumplimiento de políticas de seguridad</li>
                          <li><strong>Verificación de Datos:</strong> Comprobación de integridad de datos</li>
                          <li><strong>Configuración:</strong> Ajustes de configuración solicitados por el cliente</li>
                          <li><strong>Capacitación:</strong> Sesiones de entrenamiento al personal del cliente</li>
                          <li><strong>Migración:</strong> Transferencia de datos entre sistemas</li>
                          <li><strong>Backup:</strong> Respaldo y recuperación de datos</li>
                        </ul>
                      </div>
                      <div className="border-l-4 border-primary pl-4">
                        <p className="font-semibold text-foreground">7.2 Garantías de Transparencia:</p>
                        <ul className="list-disc pl-6 space-y-1 mt-2">
                          <li>
                            <strong>Registro completo:</strong> Cada acceso queda registrado con fecha, hora, 
                            duración, usuario del proveedor, motivo y acciones realizadas.
                          </li>
                          <li>
                            <strong>Visibilidad para el cliente:</strong> Los representantes de las empresas clientes 
                            pueden consultar el registro de accesos del proveedor a sus datos en cualquier momento 
                            a través del módulo "Registro de Accesos del Proveedor".
                          </li>
                          <li>
                            <strong>Mínimo privilegio:</strong> Solo personal autorizado con rol de superadministrador 
                            puede acceder a datos de clientes, y únicamente para los fines documentados.
                          </li>
                          <li>
                            <strong>Base legal:</strong> Ley 1581/2012 Art. 17 - Transmisión de datos para 
                            prestación de servicios contratados.
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-primary/5 p-3 rounded mt-4">
                      <p className="text-sm">
                        <strong>Nota:</strong> El cliente puede solicitar en cualquier momento un reporte detallado 
                        de todos los accesos del proveedor a sus datos enviando una solicitud a 
                        {" "}<a href="mailto:transparencia@sst-colombia.com" className="text-primary hover:underline">transparencia@sst-colombia.com</a>.
                      </p>
                    </div>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-security">
                  <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    8. Medidas de Seguridad
                  </h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p>SST Colombia implementa las siguientes medidas técnicas y organizativas:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div className="border p-3 rounded-lg">
                        <p className="font-semibold text-foreground">Seguridad Técnica:</p>
                        <ul className="list-disc pl-6 space-y-1 mt-2 text-sm">
                          <li>Cifrado TLS 1.3 en tránsito</li>
                          <li>Cifrado AES-256 en reposo</li>
                          <li>Contraseñas hasheadas con scrypt</li>
                          <li>Control de acceso RBAC</li>
                          <li>Firewall y protección WAF</li>
                        </ul>
                      </div>
                      <div className="border p-3 rounded-lg">
                        <p className="font-semibold text-foreground">Seguridad Organizativa:</p>
                        <ul className="list-disc pl-6 space-y-1 mt-2 text-sm">
                          <li>Auditoría completa de operaciones</li>
                          <li>Aislamiento multi-tenant</li>
                          <li>Backups diarios cifrados</li>
                          <li>Plan de Disaster Recovery</li>
                          <li>Capacitación del personal</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-contact">
                  <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    9. Información de Contacto
                  </h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p>Para consultas, quejas o ejercicio de derechos relacionados con esta política:</p>
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <p><strong>Oficial de Protección de Datos (DPO):</strong></p>
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <a href="mailto:dpo@sst-colombia.com" className="text-primary hover:underline">dpo@sst-colombia.com</a>
                      </p>
                      <p><strong>Solicitudes ARCO:</strong></p>
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <a href="mailto:arco@sst-colombia.com" className="text-primary hover:underline">arco@sst-colombia.com</a>
                      </p>
                      <p><strong>Transparencia (Accesos del Proveedor):</strong></p>
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <a href="mailto:transparencia@sst-colombia.com" className="text-primary hover:underline">transparencia@sst-colombia.com</a>
                      </p>
                      <p className="flex items-center gap-2 mt-3">
                        <Phone className="h-4 w-4" />
                        <span>+57 (1) XXX-XXXX</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>Medellín, Colombia</span>
                      </p>
                    </div>
                    <p className="text-sm">
                      Si considera que sus derechos han sido vulnerados, puede presentar una queja ante la 
                      Superintendencia de Industria y Comercio (SIC): <a href="https://www.sic.gov.co" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.sic.gov.co</a>
                    </p>
                  </div>
                </section>

                <Separator />

                <section className="bg-muted/50 p-4 rounded-lg" data-testid="section-updates">
                  <h2 className="text-xl font-semibold mb-3">10. Actualizaciones de esta Política</h2>
                  <p className="text-muted-foreground">
                    SST Colombia se reserva el derecho de actualizar esta Política de Privacidad cuando sea necesario 
                    para reflejar cambios en nuestras prácticas de tratamiento de datos o en la legislación aplicable. 
                    Las actualizaciones significativas serán notificadas a través de la plataforma y/o por correo 
                    electrónico con al menos 30 días de anticipación.
                  </p>
                </section>

                <div className="text-center text-xs text-muted-foreground mt-8 pt-4 border-t">
                  <p data-testid="text-version-info">Documento versión {policyVersion} | Fecha de vigencia: {lastUpdated}</p>
                  <p className="mt-1">© 2026 SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S. Todos los derechos reservados.</p>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

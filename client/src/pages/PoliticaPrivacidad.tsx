import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Shield } from "lucide-react";

export default function PoliticaPrivacidad() {
  const lastUpdated = "11 de noviembre de 2025";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle className="text-3xl">Política de Privacidad y Protección de Datos</CardTitle>
            </div>
            <CardDescription>
              Tratamiento de Datos Personales - Ley 1581/2012 (Habeas Data) y GDPR
            </CardDescription>
            <p className="text-sm text-muted-foreground">
              Última actualización: {lastUpdated}
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6 text-sm">
                <section className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <h2 className="text-lg font-semibold mb-2">Compromiso con la Privacidad</h2>
                  <p className="text-muted-foreground">
                    En SST Colombia nos comprometemos a proteger la privacidad y los datos personales de nuestros 
                    usuarios, cumpliendo con los más altos estándares internacionales y la legislación colombiana 
                    vigente. Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos y protegemos 
                    su información personal.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">1. Marco Legal Aplicable</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>Esta Política de Privacidad se rige por las siguientes normativas:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Ley 1581 de 2012:</strong> Por la cual se dictan disposiciones generales para la protección de datos personales (Habeas Data) en Colombia</li>
                      <li><strong>Decreto 1377 de 2013:</strong> Reglamenta parcialmente la Ley 1581 de 2012</li>
                      <li><strong>Decreto 1074 de 2015:</strong> Decreto Único Reglamentario del Sector Trabajo (tratamiento de datos SST)</li>
                      <li><strong>GDPR (Reglamento UE 2016/679):</strong> Reglamento General de Protección de Datos de la Unión Europea</li>
                      <li><strong>Resolución 2346 de 2007:</strong> Regula la práctica de evaluaciones médicas ocupacionales (historia clínica)</li>
                      <li><strong>Sentencia C-748/11:</strong> Jurisprudencia constitucional sobre Habeas Data</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">2. Responsable y Encargado del Tratamiento</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <div>
                      <p className="font-semibold">Responsable del Tratamiento (su empresa):</p>
                      <p>Cuando usted utiliza SST Colombia, <strong>su empresa actúa como Responsable del Tratamiento</strong> de los datos personales de sus trabajadores. Esto significa que su empresa:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>Decide qué datos personales se recopilan y con qué finalidad</li>
                        <li>Debe obtener el consentimiento de los titulares de datos</li>
                        <li>Es responsable de responder solicitudes de derechos ARCO</li>
                        <li>Debe garantizar el uso legítimo de la información</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">Encargado del Tratamiento (SST Colombia):</p>
                      <p><strong>SST Colombia S.A.S.</strong> actúa como Encargado del Tratamiento, lo que significa que:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>Procesamos datos bajo instrucciones documentadas del Responsable (su empresa)</li>
                        <li>Implementamos medidas técnicas y organizativas de seguridad</li>
                        <li>No utilizamos los datos para fines propios o comerciales</li>
                        <li>Asistimos al Responsable en cumplir obligaciones de protección de datos</li>
                      </ul>
                    </div>
                    <div className="bg-muted p-3 rounded">
                      <p className="font-semibold">Datos de Contacto del DPO (Data Protection Officer):</p>
                      <p className="mt-1">Oficial de Protección de Datos: <a href="mailto:dpo@sstcolombia.com" className="text-primary hover:underline">dpo@sstcolombia.com</a></p>
                      <p>Dirección: Bogotá D.C., Colombia</p>
                      <p>Teléfono: +57 (1) XXX-XXXX</p>
                    </div>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">3. Tipos de Datos Personales Recopilados</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <div>
                      <p className="font-semibold">3.1 Datos de Identificación:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Nombre completo, documento de identidad (CC, CE, pasaporte)</li>
                        <li>Fecha y lugar de nacimiento, nacionalidad</li>
                        <li>Género, estado civil</li>
                        <li>Fotografía (opcional)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">3.2 Datos de Contacto:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Dirección de residencia</li>
                        <li>Número de teléfono (fijo y móvil)</li>
                        <li>Correo electrónico personal y corporativo</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">3.3 Datos Laborales:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Cargo, departamento, fecha de ingreso</li>
                        <li>Tipo de contrato, salario (solo para cálculos SST)</li>
                        <li>Jornada laboral, centro de trabajo</li>
                        <li>Datos de afiliación a seguridad social (EPS, AFP, ARL)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-red-600">3.4 Datos Sensibles (Categorías Especiales):</p>
                      <p className="text-red-600 text-xs italic">Estos datos requieren consentimiento explícito e informado según Ley 1581/2012 Art. 5 y 6</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li><strong>Datos de salud ocupacional:</strong> Resultados de exámenes médicos (ingreso, periódicos, egreso), diagnósticos médicos, aptitud laboral, restricciones médicas</li>
                        <li><strong>Datos biométricos:</strong> Huella dactilar (si se usa para control de acceso)</li>
                        <li><strong>Historial de accidentes:</strong> Lesiones, enfermedades laborales, incapacidades</li>
                        <li><strong>Datos sindicales:</strong> Afiliación a organizaciones sindicales (si aplica)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">3.5 Datos Técnicos (Logs):</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Dirección IP, navegador, sistema operativo</li>
                        <li>Fecha y hora de acceso a la plataforma</li>
                        <li>Acciones realizadas (audit logs para cumplimiento legal)</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">4. Finalidades del Tratamiento</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>Los datos personales se tratan exclusivamente para las siguientes finalidades legítimas:</p>
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold">4.1 Gestión del Sistema de Seguridad y Salud en el Trabajo (SG-SST):</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Cumplimiento del Decreto 1072/2015 y Resolución 0312/2019</li>
                          <li>Identificación de peligros y evaluación de riesgos (IPERC)</li>
                          <li>Asignación de elementos de protección personal (EPP)</li>
                          <li>Programación de capacitaciones en SST</li>
                          <li>Auditorías internas y revisiones por dirección</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold">4.2 Vigilancia Epidemiológica y Medicina Ocupacional:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Programación y registro de exámenes médicos ocupacionales</li>
                          <li>Seguimiento de restricciones médicas y reubicaciones</li>
                          <li>Detección temprana de enfermedades laborales</li>
                          <li>Elaboración de perfiles epidemiológicos</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold">4.3 Investigación y Reporte de Accidentes de Trabajo:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Registro y análisis de accidentes e incidentes laborales</li>
                          <li>Generación de formatos FURAT/FUREL para ARL</li>
                          <li>Implementación de acciones correctivas y preventivas</li>
                          <li>Cálculo de indicadores de accidentalidad (IF, ILI, IFL)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold">4.4 Obligaciones Legales:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Reportes a Ministerio del Trabajo, ARL, EPS</li>
                          <li>Atención de requerimientos de autoridades competentes</li>
                          <li>Conservación de registros (20 años según normativa)</li>
                          <li>Auditorías de cumplimiento legal</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold">4.5 Mejora del Servicio:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Análisis de uso de la plataforma (datos anonimizados)</li>
                          <li>Soporte técnico y atención al cliente</li>
                          <li>Desarrollo de nuevas funcionalidades</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">5. Base Legal del Tratamiento</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>El tratamiento de datos personales se fundamenta en:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Consentimiento informado del titular</strong> (Ley 1581/2012 Art. 9): Para datos sensibles (salud ocupacional)</li>
                      <li><strong>Obligación legal</strong> (GDPR Art. 6.1.c): Cumplimiento de normativa SST colombiana</li>
                      <li><strong>Ejecución de contrato laboral</strong> (GDPR Art. 6.1.b): Gestión de la relación laboral</li>
                      <li><strong>Interés legítimo del responsable</strong> (GDPR Art. 6.1.f): Seguridad y salud de los trabajadores</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">6. Consentimiento y Autorización</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <div>
                      <p className="font-semibold">6.1 Consentimiento Previo, Expreso e Informado:</p>
                      <p>El Responsable del Tratamiento (su empresa) debe obtener autorización de los titulares antes de recopilar datos, especialmente datos sensibles. El consentimiento debe:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>Ser previo a la recopilación de datos</li>
                        <li>Ser libre y voluntario (sin coacción)</li>
                        <li>Ser específico e informado (finalidades claras)</li>
                        <li>Ser demostrable (registro escrito o digital)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">6.2 Excepciones al Consentimiento (Ley 1581/2012 Art. 10):</p>
                      <p>No se requiere autorización cuando:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>Los datos son de naturaleza pública (registro civil, sentencias judiciales)</li>
                        <li>Se trata de emergencia médica o sanitaria</li>
                        <li>Es ordenado por autoridad judicial o administrativa</li>
                        <li>Son datos históricos, estadísticos o científicos (anonimizados)</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded border border-blue-200 dark:border-blue-800">
                      <p className="font-semibold">6.3 Derecho a Revocar el Consentimiento:</p>
                      <p className="mt-1">Los titulares pueden revocar su consentimiento en cualquier momento, siempre que no exista obligación legal o contractual que requiera el tratamiento. La revocación no afecta el tratamiento realizado previamente de forma legítima.</p>
                    </div>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">7. Derechos de los Titulares (Derechos ARCO)</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p>Como titular de datos personales, usted tiene los siguientes derechos según Ley 1581/2012 Art. 8:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border p-3 rounded">
                        <p className="font-semibold flex items-center gap-2">
                          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">A</span>
                          Acceso
                        </p>
                        <p className="text-xs mt-2">Conocer qué datos personales suyos están siendo tratados, con qué finalidad y a quiénes se han compartido.</p>
                      </div>
                      <div className="border p-3 rounded">
                        <p className="font-semibold flex items-center gap-2">
                          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">R</span>
                          Rectificación
                        </p>
                        <p className="text-xs mt-2">Solicitar la corrección de datos inexactos, incompletos o desactualizados.</p>
                      </div>
                      <div className="border p-3 rounded">
                        <p className="font-semibold flex items-center gap-2">
                          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">C</span>
                          Cancelación
                        </p>
                        <p className="text-xs mt-2">Solicitar la eliminación de sus datos cuando no exista obligación legal de conservarlos.</p>
                      </div>
                      <div className="border p-3 rounded">
                        <p className="font-semibold flex items-center gap-2">
                          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">O</span>
                          Oposición
                        </p>
                        <p className="text-xs mt-2">Oponerse al tratamiento de sus datos por motivos legítimos (salvo obligación legal).</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="font-semibold">Derechos GDPR Adicionales:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado y transferirlos a otro responsable</li>
                        <li><strong>Limitación del tratamiento:</strong> Solicitar que se suspendan ciertos procesamientos</li>
                        <li><strong>No ser objeto de decisiones automatizadas:</strong> No estar sujeto a decisiones basadas únicamente en procesamiento automatizado</li>
                      </ul>
                    </div>
                    <div className="mt-4 bg-muted p-3 rounded">
                      <p className="font-semibold">¿Cómo ejercer sus derechos ARCO?</p>
                      <p className="mt-2">Para ejercer sus derechos, debe contactar al <strong>Responsable del Tratamiento (su empresa empleadora)</strong> mediante:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>Correo electrónico al área de Recursos Humanos o DPO de su empresa</li>
                        <li>Comunicación escrita dirigida al domicilio legal de su empresa</li>
                        <li>Formulario de derechos ARCO disponible en la plataforma (próximamente)</li>
                      </ul>
                      <p className="mt-2 text-xs italic">Plazo de respuesta: 10 días hábiles según Decreto 1377/2013 Art. 15</p>
                    </div>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">8. Medidas de Seguridad</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p>SST Colombia implementa las siguientes medidas técnicas y organizativas para garantizar la seguridad de los datos personales:</p>
                    <div>
                      <p className="font-semibold">8.1 Seguridad Técnica:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>Cifrado en tránsito:</strong> TLS 1.3 para todas las comunicaciones HTTPS</li>
                        <li><strong>Cifrado en reposo:</strong> AES-256 para base de datos y backups</li>
                        <li><strong>Autenticación fuerte:</strong> Contraseñas hasheadas con scrypt (no reversible)</li>
                        <li><strong>Control de acceso:</strong> RBAC con 6 niveles de autorización (super_admin a trabajador)</li>
                        <li><strong>Firewall y WAF:</strong> Protección contra ataques DDoS, SQL injection, XSS</li>
                        <li><strong>Monitoreo continuo:</strong> Detección de accesos no autorizados 24/7</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">8.2 Seguridad Organizativa:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>Trazabilidad completa:</strong> Audit logs de todas las operaciones sobre datos regulados</li>
                        <li><strong>Segregación de datos:</strong> Aislamiento multi-tenant (cada empresa ve solo sus datos)</li>
                        <li><strong>Backups diarios:</strong> Respaldos automáticos cifrados con retención de 20 años</li>
                        <li><strong>Plan de Disaster Recovery:</strong> RTO ≤ 4 horas, RPO ≤ 24 horas</li>
                        <li><strong>Capacitación del personal:</strong> Todo el equipo recibe formación en protección de datos</li>
                        <li><strong>Acuerdos de confidencialidad:</strong> Contratos NDA con empleados y proveedores</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">8.3 Certificaciones y Cumplimiento:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Cumplimiento ISO 27001:2013 (Seguridad de la Información)</li>
                        <li>Cumplimiento ISO 45001:2018 (Gestión de SST)</li>
                        <li>Infraestructura en Neon (PostgreSQL cloud certificado SOC 2 Type II)</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">9. Conservación y Eliminación de Datos</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p className="font-semibold">9.1 Períodos de Retención:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Datos SST:</strong> 20 años desde finalización de relación laboral (Decreto 1074/2015 Art. 2.2.4.6.13)</li>
                      <li><strong>Historia clínica ocupacional:</strong> 20 años (Resolución 2346/2007 Art. 14)</li>
                      <li><strong>Reportes de accidentes (FURAT):</strong> Indefinido (evidencia legal)</li>
                      <li><strong>Audit logs:</strong> 20 años (cumplimiento Ley 1581/2012)</li>
                      <li><strong>Datos de usuarios inactivos:</strong> 2 años desde último acceso</li>
                    </ul>
                    <p className="font-semibold mt-4">9.2 Eliminación Segura:</p>
                    <p>Cumplido el período de retención y sin obligación legal de conservación, los datos serán eliminados mediante:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Borrado criptográfico (destrucción de claves de cifrado)</li>
                      <li>Sobrescritura segura de medios físicos</li>
                      <li>Certificado de destrucción de datos en formatos físicos</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">10. Transferencias Internacionales</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>10.1 Ubicación de Servidores:</strong></p>
                    <p>Los datos se almacenan en infraestructura cloud de Neon (PostgreSQL) con servidores ubicados en:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Región primaria: AWS US-East-1 (Virginia, EE.UU.)</li>
                      <li>Respaldos: Región secundaria en AWS (cifrados AES-256)</li>
                    </ul>
                    <p className="mt-3"><strong>10.2 Transferencia Internacional:</strong></p>
                    <p>La transferencia de datos a EE.UU. se realiza bajo las siguientes salvaguardas legales:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Cláusulas Contractuales Tipo (SCCs):</strong> Aprobadas por Comisión Europea (Decisión 2021/914)</li>
                      <li><strong>Certificación SOC 2 Type II</strong> del proveedor de infraestructura</li>
                      <li><strong>Cifrado end-to-end:</strong> Los datos viajan y se almacenan cifrados</li>
                      <li><strong>Derechos de los titulares preservados:</strong> Mecanismos ARCO disponibles independientemente de ubicación física</li>
                    </ul>
                    <p className="mt-3 text-xs italic">Nota: Ningún dato personal se transfiere a terceros comerciales. La transferencia es únicamente a proveedores de infraestructura bajo contrato de procesamiento de datos (DPA).</p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">11. Compartición de Datos con Terceros</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>11.1 Sub-encargados del Tratamiento:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Neon (PostgreSQL Cloud):</strong> Almacenamiento de base de datos - <a href="https://neon.tech/privacy-policy" target="_blank" rel="noopener" className="text-primary hover:underline">Privacy Policy</a></li>
                      <li><strong>Resend (Email Service):</strong> Envío de notificaciones SST - <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener" className="text-primary hover:underline">Privacy Policy</a></li>
                    </ul>
                    <p className="mt-3"><strong>11.2 Compartición Obligatoria (Base Legal):</strong></p>
                    <p>Podemos compartir datos con autoridades cuando sea legalmente requerido:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Ministerio del Trabajo:</strong> Reportes de cumplimiento SG-SST</li>
                      <li><strong>ARL (Administradoras de Riesgos Laborales):</strong> FURAT/FUREL dentro de 48 horas</li>
                      <li><strong>Superintendencia de Industria y Comercio:</strong> Investigaciones de protección de datos</li>
                      <li><strong>Autoridades judiciales:</strong> Órdenes judiciales o requerimientos fiscales</li>
                    </ul>
                    <p className="mt-3 text-xs italic"><strong>No vendemos, alquilamos ni compartimos datos personales con terceros para fines comerciales o publicitarios.</strong></p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">12. Cookies y Tecnologías Similares</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>12.1 Uso de Cookies:</strong></p>
                    <p>La plataforma utiliza cookies y tecnologías similares para:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Cookies estrictamente necesarias:</strong> Autenticación de sesión, seguridad</li>
                      <li><strong>Cookies de funcionalidad:</strong> Preferencias de idioma, configuración de interfaz</li>
                      <li><strong>Cookies analíticas:</strong> Análisis de uso (datos anonimizados)</li>
                    </ul>
                    <p className="mt-3"><strong>12.2 Control de Cookies:</strong></p>
                    <p>Puede gestionar cookies desde la configuración de su navegador. Tenga en cuenta que deshabilitar cookies esenciales puede afectar la funcionalidad de la plataforma.</p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">13. Notificación de Brechas de Seguridad</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>13.1 Compromiso de Notificación:</strong></p>
                    <p>En caso de una brecha de seguridad que pueda afectar datos personales, nos comprometemos a:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Notificar a la Superintendencia de Industria y Comercio (SIC) dentro de 72 horas (GDPR Art. 33)</li>
                      <li>Informar a los titulares afectados sin demora indebida si existe alto riesgo (GDPR Art. 34)</li>
                      <li>Documentar la brecha, sus efectos y medidas correctivas tomadas</li>
                      <li>Implementar acciones para mitigar el daño</li>
                    </ul>
                    <p className="mt-3"><strong>13.2 Canal de Reporte:</strong></p>
                    <p>Si detecta una posible brecha de seguridad, repórtela inmediatamente a: <a href="mailto:security@sstcolombia.com" className="text-primary hover:underline">security@sstcolombia.com</a></p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">14. Derechos de Menores de Edad</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>La plataforma SST Colombia está diseñada para uso empresarial y gestión de trabajadores. <strong>No está dirigida a menores de 18 años</strong> y no recopilamos intencionalmente datos de menores.</p>
                    <p className="mt-2">Si un menor de 18 años requiere tratamiento de datos SST (trabajador menor legalmente autorizado), se debe:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Obtener consentimiento del representante legal (padre/tutor)</li>
                      <li>Cumplir Código de la Infancia y Adolescencia (Ley 1098/2006)</li>
                      <li>Garantizar protección reforzada de datos sensibles</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">15. Actualizaciones a esta Política</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>SST Colombia se reserva el derecho de modificar esta Política de Privacidad en cualquier momento para reflejar cambios normativos o en nuestras prácticas.</p>
                    <p className="mt-2"><strong>Notificación de Cambios:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Cambios menores: Publicación en la plataforma con fecha de actualización</li>
                      <li>Cambios materiales: Notificación por correo electrónico con 30 días de anticipación</li>
                      <li>Versión actual siempre disponible en: <a href="/politica-privacidad" className="text-primary hover:underline">/politica-privacidad</a></li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">16. Consultas y Reclamos</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>16.1 Canales de Contacto:</strong></p>
                    <div className="bg-muted p-3 rounded">
                      <p><strong>Oficial de Protección de Datos (DPO):</strong></p>
                      <p className="mt-1">Email: <a href="mailto:dpo@sstcolombia.com" className="text-primary hover:underline">dpo@sstcolombia.com</a></p>
                      <p>Teléfono: +57 (1) XXX-XXXX</p>
                      <p>Dirección: Bogotá D.C., Colombia</p>
                      <p>Horario de atención: Lunes a Viernes 8:00-17:00</p>
                    </div>
                    <p className="mt-3"><strong>16.2 Autoridad de Control:</strong></p>
                    <p>Si no está satisfecho con nuestra respuesta, puede presentar una queja ante:</p>
                    <div className="bg-muted p-3 rounded">
                      <p><strong>Superintendencia de Industria y Comercio (SIC)</strong></p>
                      <p className="mt-1">Delegatura de Protección de Datos Personales</p>
                      <p>Carrera 13 No. 27-00, Bogotá D.C.</p>
                      <p>Línea gratuita: 018000 910165</p>
                      <p>Web: <a href="https://www.sic.gov.co" target="_blank" rel="noopener" className="text-primary hover:underline">www.sic.gov.co</a></p>
                    </div>
                  </div>
                </section>

                <Separator />

                <section className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <h2 className="text-xl font-semibold mb-3">Declaración de Aceptación</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>AL UTILIZAR LA PLATAFORMA SST COLOMBIA, USTED RECONOCE HABER LEÍDO Y COMPRENDIDO ESTA 
                    POLÍTICA DE PRIVACIDAD Y ACEPTA EL TRATAMIENTO DE SUS DATOS PERSONALES SEGÚN LO DESCRITO.</strong>
                  </p>
                  <p className="text-muted-foreground mt-3">
                    Si no acepta esta Política, por favor no utilice la plataforma y contacte a su empleador para 
                    ejercer sus derechos ARCO.
                  </p>
                </section>

                <div className="text-center text-xs text-muted-foreground mt-8 pt-4 border-t">
                  <p>Política de Privacidad versión 1.0 | Fecha de vigencia: {lastUpdated}</p>
                  <p className="mt-1">Cumple con Ley 1581/2012, Decreto 1377/2013 y GDPR (UE) 2016/679</p>
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

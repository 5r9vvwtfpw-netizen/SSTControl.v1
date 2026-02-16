import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Eye } from "lucide-react";
import { Link } from "wouter";

export default function AvisoPrivacidad() {
  const lastUpdated = "16 de febrero de 2026";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <Eye className="h-6 w-6 text-foreground" />
              <CardTitle className="text-3xl" data-testid="text-page-title">Aviso de Privacidad</CardTitle>
            </div>
            <CardDescription>
              Aviso de Privacidad - Ley 1581 de 2012 y Decreto 1377 de 2013
            </CardDescription>
            <p className="text-sm text-muted-foreground">
              Última actualización: {lastUpdated}
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6 text-sm">
                <section data-testid="section-responsable">
                  <h2 className="text-xl font-semibold mb-3">1. Responsable del Tratamiento</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>En cumplimiento de lo dispuesto en la Ley 1581 de 2012 y el Decreto 1377 de 2013, le informamos que el responsable del tratamiento de sus datos personales es:</p>
                    <div className="bg-muted p-3 rounded">
                      <p><strong>Razón Social:</strong> SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.</p>
                      <p><strong>NIT:</strong> (Pendiente de asignación)</p>
                      <p><strong>Domicilio:</strong> Medellín, Colombia</p>
                      <p><strong>Correo electrónico:</strong> <a href="mailto:privacidad@sst-colombia.com" className="underline hover:text-foreground transition-colors" data-testid="link-email-privacidad-1">privacidad@sst-colombia.com</a></p>
                    </div>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-finalidad">
                  <h2 className="text-xl font-semibold mb-3">2. Finalidad del Tratamiento</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>Los datos personales que recopilamos serán utilizados para las siguientes finalidades:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Gestión del Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST)</li>
                      <li>Cumplimiento del Decreto 1072 de 2015 y la Resolución 0312 de 2019</li>
                      <li>Gestión de datos de salud ocupacional y vigilancia epidemiológica</li>
                      <li>Programación y seguimiento de capacitaciones en SST</li>
                      <li>Registro, investigación y seguimiento de accidentes e incidentes laborales</li>
                      <li>Identificación de peligros y evaluación de riesgos (IPERC)</li>
                      <li>Generación de reportes normativos para autoridades competentes</li>
                      <li>Gestión de exámenes médicos ocupacionales</li>
                      <li>Auditorías internas y revisiones por la dirección</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-datos-recopilados">
                  <h2 className="text-xl font-semibold mb-3">3. Datos que Recopilamos</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <div>
                      <p className="font-semibold">3.1 Datos de Identificación:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Nombre completo, documento de identidad (CC, CE, pasaporte)</li>
                        <li>Fecha y lugar de nacimiento, género, estado civil</li>
                        <li>Dirección de residencia, teléfono, correo electrónico</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">3.2 Datos Laborales:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Cargo, departamento, fecha de ingreso, tipo de contrato</li>
                        <li>Jornada laboral, centro de trabajo</li>
                        <li>Datos de afiliación a seguridad social (EPS, AFP, ARL)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-red-600">3.3 Datos de Salud Ocupacional (Sensibles):</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Resultados de exámenes médicos ocupacionales</li>
                        <li>Aptitud laboral, restricciones médicas</li>
                        <li>Diagnósticos relacionados con enfermedades laborales</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">3.4 Datos de Accidentes e Incidentes:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Registro de accidentes de trabajo e incidentes laborales</li>
                        <li>Reportes FURAT/FUREL</li>
                        <li>Investigaciones y análisis de causalidad</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">3.5 Datos de Capacitación:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Registro de capacitaciones realizadas y programadas</li>
                        <li>Evaluaciones de conocimiento</li>
                        <li>Certificaciones y constancias de asistencia</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-derechos">
                  <h2 className="text-xl font-semibold mb-3">4. Derechos del Titular</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p>Como titular de datos personales, usted tiene los siguientes derechos (Derechos ARCO) conforme a la Ley 1581 de 2012, Artículo 8:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border p-3 rounded">
                        <p className="font-semibold flex items-center gap-2">
                          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">A</span>
                          Acceso
                        </p>
                        <p className="text-xs mt-2">Conocer qué datos personales suyos están siendo tratados y con qué finalidad.</p>
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
                        <p className="text-xs mt-2">Oponerse al tratamiento de sus datos por motivos legítimos y fundados.</p>
                      </div>
                    </div>
                    <div className="bg-muted p-3 rounded mt-4">
                      <p className="font-semibold">¿Cómo ejercer sus derechos ARCO?</p>
                      <p className="mt-2">Puede presentar su solicitud a través de:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>Correo electrónico: <a href="mailto:privacidad@sst-colombia.com" className="underline hover:text-foreground transition-colors" data-testid="link-email-privacidad-2">privacidad@sst-colombia.com</a></li>
                        <li>Formulario en línea: <Link href="/solicitudes-arco" className="underline hover:text-foreground transition-colors" data-testid="link-solicitudes-arco">Solicitudes ARCO</Link></li>
                      </ul>
                      <p className="mt-2 text-xs italic">Plazo de respuesta: 10 días hábiles según Decreto 1377 de 2013, Artículo 15.</p>
                    </div>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-datos-sensibles">
                  <h2 className="text-xl font-semibold mb-3">5. Tratamiento de Datos Sensibles</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/30">
                      <p className="font-semibold mb-2">Consentimiento Explícito Requerido</p>
                      <p>De conformidad con el Artículo 6 de la Ley 1581 de 2012, el tratamiento de datos sensibles requiere autorización previa, expresa e informada del titular. En particular:</p>
                    </div>
                    <ul className="list-disc pl-6 space-y-1 mt-3">
                      <li>Los datos de salud ocupacional son considerados datos sensibles y su tratamiento se realiza exclusivamente con finalidades legales vinculadas a la gestión del SG-SST.</li>
                      <li>No se condiciona ninguna actividad al suministro de datos sensibles, salvo cuando sean estrictamente necesarios para el cumplimiento de obligaciones legales.</li>
                      <li>Se implementan medidas reforzadas de seguridad para la protección de datos sensibles, incluyendo cifrado AES-256 y control de acceso restringido.</li>
                      <li>El titular puede revocar en cualquier momento su consentimiento para el tratamiento de datos sensibles, sin que ello afecte la licitud del tratamiento previo.</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-transferencia">
                  <h2 className="text-xl font-semibold mb-3">6. Transferencia de Datos</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>SST Colombia <strong>no transfiere datos personales a terceros</strong> sin el consentimiento previo y expreso del titular, salvo en los siguientes casos previstos por la ley:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Administradoras de Riesgos Laborales (ARL):</strong> Para el reporte de accidentes de trabajo y enfermedades laborales (FURAT/FUREL)</li>
                      <li><strong>Entidades Promotoras de Salud (EPS):</strong> Para la gestión de incapacidades y atención médica</li>
                      <li><strong>Superintendencia de Industria y Comercio (SIC):</strong> En cumplimiento de requerimientos administrativos o judiciales</li>
                      <li><strong>Ministerio del Trabajo:</strong> Para reportes normativos obligatorios</li>
                      <li><strong>Autoridades judiciales:</strong> Cuando medie orden judicial debidamente notificada</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-vigencia">
                  <h2 className="text-xl font-semibold mb-3">7. Vigencia</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>Este Aviso de Privacidad tiene vigencia desde la fecha de su publicación y podrá ser modificado en cualquier momento por SST Colombia para adaptarlo a nuevos requerimientos legales, jurisprudenciales o técnicos.</p>
                    <p>Cualquier modificación sustancial será comunicada oportunamente a los titulares de datos a través de los canales habilitados en la plataforma y por correo electrónico.</p>
                    <p>El uso continuado de la plataforma después de la notificación de cambios constituye aceptación de las modificaciones realizadas.</p>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-contacto">
                  <h2 className="text-xl font-semibold mb-3">8. Contacto</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>Para cualquier consulta, solicitud o reclamo relacionado con el tratamiento de sus datos personales, puede contactarnos a través de:</p>
                    <div className="bg-muted p-3 rounded">
                      <p><strong>Protección de Datos:</strong> <a href="mailto:privacidad@sst-colombia.com" className="underline hover:text-foreground transition-colors" data-testid="link-email-privacidad-3">privacidad@sst-colombia.com</a></p>
                      <p><strong>Soporte Técnico:</strong> <a href="mailto:soporte@sst-colombia.com" className="underline hover:text-foreground transition-colors" data-testid="link-email-soporte-1">soporte@sst-colombia.com</a></p>
                      <p><strong>Domicilio:</strong> Medellín, Colombia</p>
                    </div>
                  </div>
                </section>

                <div className="text-center text-xs text-muted-foreground mt-8 pt-4 border-t">
                  <p>Documento versión 1.0 | Fecha de vigencia: {lastUpdated}</p>
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
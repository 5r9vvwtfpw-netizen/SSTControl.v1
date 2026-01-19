import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FileSignature } from "lucide-react";

export default function AcuerdoProcesamientoDatos() {
  const lastUpdated = "11 de noviembre de 2025";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <FileSignature className="h-6 w-6 text-primary" />
              <CardTitle className="text-3xl">Acuerdo de Procesamiento de Datos (DPA)</CardTitle>
            </div>
            <CardDescription>
              Data Processing Agreement - GDPR Art. 28 y Ley 1581/2012
            </CardDescription>
            <p className="text-sm text-muted-foreground">
              Última actualización: {lastUpdated}
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6 text-sm">
                <section className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h2 className="text-lg font-semibold mb-2">Propósito del Acuerdo</h2>
                  <p className="text-muted-foreground">
                    Este Acuerdo de Procesamiento de Datos (DPA) establece las obligaciones y responsabilidades entre 
                    el <strong>Responsable del Tratamiento</strong> (su empresa) y el <strong>Encargado del Tratamiento</strong> 
                    (SST Colombia S.A.S.) en relación con el procesamiento de datos personales, cumpliendo con el Artículo 
                    28 del GDPR y la Ley 1581 de 2012 de Colombia.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">1. Definiciones</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>1.1 Responsable del Tratamiento (Data Controller):</strong> La empresa cliente que utiliza la plataforma SST Colombia y que determina los fines y medios del tratamiento de datos personales.</p>
                    <p><strong>1.2 Encargado del Tratamiento (Data Processor):</strong> SST Colombia S.A.S., que trata datos personales en nombre del Responsable según sus instrucciones documentadas.</p>
                    <p><strong>1.3 Datos Personales:</strong> Toda información relacionada con personas físicas identificadas o identificables (trabajadores, empleados).</p>
                    <p><strong>1.4 Tratamiento:</strong> Cualquier operación sobre datos personales: recopilación, registro, organización, estructuración, conservación, adaptación, modificación, consulta, uso, comunicación, supresión o destrucción.</p>
                    <p><strong>1.5 Subencargado (Sub-processor):</strong> Tercero contratado por el Encargado para realizar actividades específicas de procesamiento.</p>
                    <p><strong>1.6 Brecha de Datos Personales:</strong> Violación de seguridad que ocasiona destrucción, pérdida, alteración, divulgación o acceso no autorizado a datos personales.</p>
                    <p><strong>1.7 Titular de Datos:</strong> Persona física a quien se refieren los datos personales (trabajadores).</p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">2. Objeto y Alcance</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>2.1 Objeto:</strong> Este DPA regula el tratamiento de datos personales que el Encargado realiza en nombre del Responsable mediante la plataforma SST Colombia.</p>
                    <p><strong>2.2 Alcance Territorial:</strong> Este acuerdo aplica al tratamiento de datos de titulares ubicados en Colombia y la Unión Europea.</p>
                    <p><strong>2.3 Categorías de Datos:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Datos de identificación: Nombre, documento de identidad, fecha de nacimiento</li>
                      <li>Datos de contacto: Dirección, teléfono, correo electrónico</li>
                      <li>Datos laborales: Cargo, departamento, salario, afiliaciones SSSS</li>
                      <li>Datos sensibles de salud: Exámenes médicos, aptitud laboral, restricciones, historial de accidentes</li>
                    </ul>
                    <p><strong>2.4 Titulares de Datos:</strong> Trabajadores, empleados, contratistas, aprendices y visitantes registrados en el sistema SG-SST del Responsable.</p>
                    <p><strong>2.5 Finalidades del Tratamiento:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Gestión del Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST)</li>
                      <li>Identificación de peligros y evaluación de riesgos (IPERC)</li>
                      <li>Vigilancia epidemiológica y medicina ocupacional</li>
                      <li>Registro y reporte de accidentes laborales (FURAT/FUREL)</li>
                      <li>Auditorías internas y cumplimiento legal SST</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">3. Obligaciones del Responsable (Cliente)</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>El Responsable del Tratamiento se compromete a:</p>
                    <p><strong>3.1 Base Legal del Tratamiento:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Garantizar que existe base legal para el tratamiento de datos (consentimiento, contrato laboral, obligación legal)</li>
                      <li>Obtener consentimiento informado de los titulares para datos sensibles (Ley 1581/2012 Art. 5-6)</li>
                      <li>Mantener evidencia documental de las autorizaciones otorgadas</li>
                    </ul>
                    <p><strong>3.2 Instrucciones de Tratamiento:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Proporcionar instrucciones claras y documentadas sobre el tratamiento de datos</li>
                      <li>Notificar al Encargado si considera que alguna instrucción viola normativa aplicable</li>
                      <li>Actualizar instrucciones cuando cambien finalidades o bases legales</li>
                    </ul>
                    <p><strong>3.3 Derechos de los Titulares:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Gestionar solicitudes de derechos ARCO de los titulares</li>
                      <li>Informar al Encargado sobre solicitudes que requieran acciones técnicas</li>
                      <li>Responder a titulares dentro de plazos legales (10 días hábiles Ley 1581/2012)</li>
                    </ul>
                    <p><strong>3.4 Veracidad de Datos:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Garantizar que los datos ingresados son veraces, completos y actualizados</li>
                      <li>Actualizar datos cuando el titular lo solicite o cuando se detecten inexactitudes</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">4. Obligaciones del Encargado (SST Colombia)</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p>El Encargado del Tratamiento se compromete a:</p>
                    <div>
                      <p className="font-semibold">4.1 Tratamiento Conforme a Instrucciones:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Tratar datos personales únicamente según instrucciones documentadas del Responsable</li>
                        <li>No utilizar datos para fines propios, comerciales o de marketing</li>
                        <li>Notificar al Responsable si considera que una instrucción viola GDPR o Ley 1581/2012</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">4.2 Confidencialidad:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Garantizar que todo el personal autorizado a procesar datos está sujeto a obligación de confidencialidad</li>
                        <li>Firmar acuerdos de no divulgación (NDA) con empleados y colaboradores</li>
                        <li>Limitar el acceso a datos solo al personal que estrictamente lo necesite</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">4.3 Seguridad Técnica y Organizativa:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li><strong>Cifrado:</strong> TLS 1.3 en tránsito, AES-256 en reposo</li>
                        <li><strong>Control de Acceso:</strong> RBAC con 6 niveles de autorización, autenticación multi-factor opcional</li>
                        <li><strong>Trazabilidad:</strong> Audit logs completos de todas las operaciones CRUD</li>
                        <li><strong>Backups:</strong> Respaldos diarios cifrados con retención de 20 años</li>
                        <li><strong>Disaster Recovery:</strong> Plan documentado con RTO ≤ 4h, RPO ≤ 24h</li>
                        <li><strong>Monitoreo:</strong> Detección de accesos no autorizados 24/7</li>
                        <li><strong>Segregación:</strong> Aislamiento multi-tenant (cada empresa ve solo sus datos)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">4.4 Asistencia al Responsable:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Asistir al Responsable en responder solicitudes de derechos ARCO de titulares</li>
                        <li>Notificar brechas de seguridad dentro de 24 horas de conocimiento</li>
                        <li>Proporcionar información necesaria para evaluaciones de impacto (DPIA)</li>
                        <li>Permitir auditorías e inspecciones del Responsable o autoridades</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">4.5 Brechas de Datos Personales:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Notificar al Responsable dentro de <strong>24 horas</strong> de detectar una brecha</li>
                        <li>Documentar: naturaleza de la brecha, datos afectados, consecuencias, medidas adoptadas</li>
                        <li>Cooperar en la investigación y mitigación del incidente</li>
                        <li>Implementar medidas correctivas para prevenir recurrencia</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">4.6 Devolución o Eliminación de Datos:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Al finalizar el contrato, eliminar o devolver todos los datos personales</li>
                        <li>Proporcionar 30 días para exportación de datos por el Responsable</li>
                        <li>Eliminar copias existentes salvo obligación legal de conservación</li>
                        <li>Certificar la eliminación mediante declaración escrita</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">5. Subencargados del Tratamiento</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>5.1 Autorización General:</strong> El Responsable autoriza al Encargado a contratar subencargados para servicios específicos de procesamiento, sujeto a las condiciones de este DPA.</p>
                    <p><strong>5.2 Subencargados Actuales:</strong></p>
                    <div className="bg-muted p-3 rounded">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Subencargado</th>
                            <th className="text-left py-2">Servicio</th>
                            <th className="text-left py-2">Ubicación</th>
                            <th className="text-left py-2">Salvaguardas</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-2">Neon</td>
                            <td>Base de datos PostgreSQL Cloud</td>
                            <td>EE.UU. (AWS)</td>
                            <td>SCCs, SOC 2 Type II, cifrado AES-256</td>
                          </tr>
                          <tr>
                            <td className="py-2">Resend</td>
                            <td>Envío de emails transaccionales</td>
                            <td>EE.UU.</td>
                            <td>SCCs, TLS 1.3, datos mínimos</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-3"><strong>5.3 Cambios en Subencargados:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>El Encargado notificará al Responsable con 30 días de anticipación sobre nuevos subencargados</li>
                      <li>El Responsable puede objetar por motivos razonables de protección de datos</li>
                      <li>Si el Responsable objeta y no se resuelve, puede terminar el servicio sin penalización</li>
                    </ul>
                    <p><strong>5.4 Responsabilidad por Subencargados:</strong></p>
                    <p>El Encargado es plenamente responsable ante el Responsable por las obligaciones de protección de datos de sus subencargados (GDPR Art. 28.4).</p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">6. Transferencias Internacionales</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>6.1 Autorización de Transferencia:</strong> El Responsable autoriza al Encargado a transferir datos personales a EE.UU. para almacenamiento en infraestructura cloud.</p>
                    <p><strong>6.2 Mecanismos de Transferencia:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Cláusulas Contractuales Tipo (SCCs):</strong> Aprobadas por Comisión Europea (Decisión 2021/914)</li>
                      <li><strong>Medidas Técnicas Suplementarias:</strong> Cifrado end-to-end, pseudonimización cuando sea posible</li>
                      <li><strong>Evaluación de Impacto:</strong> Transfer Impact Assessment (TIA) realizada según Schrems II</li>
                    </ul>
                    <p><strong>6.3 Garantías al Titular:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Los titulares conservan todos sus derechos ARCO independientemente de ubicación de datos</li>
                      <li>No se realizarán transferencias a países sin nivel adecuado de protección sin salvaguardas</li>
                      <li>El Encargado resistirá solicitudes de acceso por gobiernos extranjeros contrarias a GDPR/Ley 1581</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">7. Derechos de los Titulares</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>7.1 Facilitación de Derechos ARCO:</strong> El Encargado proporcionará asistencia técnica razonable al Responsable para atender solicitudes de:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Acceso:</strong> Exportación de datos del titular en formato estructurado (JSON/CSV)</li>
                      <li><strong>Rectificación:</strong> Interfaces de edición para corregir datos inexactos</li>
                      <li><strong>Cancelación:</strong> Funcionalidad de eliminación permanente con confirmación</li>
                      <li><strong>Oposición:</strong> Bloqueo temporal de procesamiento cuando sea aplicable</li>
                      <li><strong>Portabilidad:</strong> Exportación en formato interoperable (CSV, JSON)</li>
                    </ul>
                    <p><strong>7.2 Plazos de Respuesta:</strong></p>
                    <p>El Encargado responderá solicitudes del Responsable relacionadas con derechos ARCO dentro de <strong>5 días hábiles</strong>.</p>
                    <p><strong>7.3 Costos:</strong></p>
                    <p>La asistencia en derechos ARCO está incluida en el servicio. Solicitudes excesivas o repetitivas pueden generar costos razonables.</p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">8. Auditorías e Inspecciones</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>8.1 Derecho de Auditoría:</strong> El Responsable tiene derecho a auditar el cumplimiento del Encargado con este DPA mediante:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Revisión de documentación de seguridad y políticas</li>
                      <li>Cuestionarios de due diligence</li>
                      <li>Inspecciones in-situ con notificación previa de 30 días</li>
                      <li>Auditorías por terceros independientes (costo compartido)</li>
                    </ul>
                    <p><strong>8.2 Frecuencia:</strong> Máximo una auditoría anual, salvo causa razonable (brecha de seguridad, cambio regulatorio).</p>
                    <p><strong>8.3 Certificaciones:</strong> El Encargado proporcionará copia de certificaciones vigentes (ISO 27001, SOC 2, etc.) como evidencia de cumplimiento.</p>
                    <p><strong>8.4 Autoridades de Protección de Datos:</strong> El Encargado cooperará con inspecciones de la Superintendencia de Industria y Comercio (SIC) o autoridades europeas.</p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">9. Notificación de Brechas de Seguridad</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>9.1 Obligación de Notificación:</strong> El Encargado notificará al Responsable dentro de <strong>24 horas</strong> de conocer una brecha de datos personales.</p>
                    <p><strong>9.2 Contenido de Notificación:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Descripción de la naturaleza de la brecha (acceso no autorizado, pérdida, alteración, etc.)</li>
                      <li>Categorías y número aproximado de titulares afectados</li>
                      <li>Categorías y número aproximado de registros de datos afectados</li>
                      <li>Consecuencias probables de la brecha</li>
                      <li>Medidas adoptadas o propuestas para mitigar efectos adversos</li>
                      <li>Datos de contacto del DPO para más información</li>
                    </ul>
                    <p><strong>9.3 Asistencia al Responsable:</strong> El Encargado asistirá al Responsable en:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Notificar a la SIC dentro de 72 horas (si aplica GDPR Art. 33)</li>
                      <li>Comunicar a titulares afectados si existe alto riesgo (GDPR Art. 34)</li>
                      <li>Documentar el incidente según requisitos legales</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">10. Retorno y Eliminación de Datos</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>10.1 Al Finalizar el Servicio:</strong> Dentro de 30 días de terminación del contrato, el Encargado deberá:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Proporcionar al Responsable copia completa de todos los datos personales en formato estructurado (JSON/CSV)</li>
                      <li>Eliminar todos los datos personales de sistemas de producción</li>
                      <li>Eliminar copias de backups salvo obligación legal de conservación</li>
                    </ul>
                    <p><strong>10.2 Conservación Legal:</strong> El Encargado podrá conservar:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Audit logs:</strong> 20 años (Decreto 1074/2015 Art. 2.2.4.6.13)</li>
                      <li><strong>Datos anonimizados:</strong> Sin límite temporal (no son datos personales)</li>
                      <li><strong>Datos requeridos por autoridades:</strong> Según orden judicial/administrativa</li>
                    </ul>
                    <p><strong>10.3 Certificación de Eliminación:</strong> El Encargado emitirá certificado escrito confirmando eliminación de datos dentro de 15 días de completar el proceso.</p>
                    <p><strong>10.4 Método de Eliminación:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Borrado criptográfico (destrucción de claves de cifrado)</li>
                      <li>Sobrescritura segura de medios físicos (método DoD 5220.22-M)</li>
                      <li>Destrucción física de hardware cuando aplique</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">11. Responsabilidad y Limitaciones</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>11.1 Responsabilidad Solidaria (GDPR Art. 82):</strong> Responsable y Encargado pueden ser responsables solidariamente por daños causados por tratamiento ilegal.</p>
                    <p><strong>11.2 Exención de Responsabilidad del Encargado:</strong> El Encargado solo será responsable si:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>No cumplió obligaciones del GDPR dirigidas específicamente a encargados, o</li>
                      <li>Actuó fuera o en contra de instrucciones legales del Responsable</li>
                    </ul>
                    <p><strong>11.3 Límite de Responsabilidad:</strong> Según Términos de Servicio, limitada a 12 meses de tarifas pagadas, excepto:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Violaciones dolosas o culpa grave</li>
                      <li>Daños causados por incumplimiento de obligaciones de confidencialidad</li>
                      <li>Multas impuestas por autoridades de protección de datos</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">12. Duración y Terminación</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>12.1 Duración:</strong> Este DPA entra en vigor con la aceptación de Términos de Servicio y permanece vigente mientras dure el contrato de servicio.</p>
                    <p><strong>12.2 Supervivencia de Obligaciones:</strong> Las siguientes obligaciones sobreviven a la terminación:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Confidencialidad (indefinidamente)</li>
                      <li>Retorno/eliminación de datos (30 días post-terminación)</li>
                      <li>Conservación de audit logs (20 años según ley colombiana)</li>
                      <li>Cooperación en investigaciones de autoridades (indefinidamente)</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">13. Modificaciones al DPA</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>13.1 Cambios Normativos:</strong> El Encargado puede modificar este DPA para cumplir con cambios en GDPR, Ley 1581/2012 o nueva regulación aplicable.</p>
                    <p><strong>13.2 Notificación:</strong> Cambios materiales se notificarán con 60 días de anticipación por correo electrónico.</p>
                    <p><strong>13.3 Objeción:</strong> El Responsable puede objetar cambios y terminar el servicio sin penalización durante el período de notificación.</p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">14. Ley Aplicable y Jurisdicción</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>14.1 Ley Aplicable:</strong> Este DPA se rige por las leyes de Colombia y el GDPR (UE) 2016/679 cuando aplique.</p>
                    <p><strong>14.2 Jurisdicción:</strong> Tribunales competentes de Bogotá D.C., Colombia, sin perjuicio de derechos de titulares europeos ante autoridades de la UE.</p>
                    <p><strong>14.3 Resolución de Disputas:</strong> Las partes intentarán resolver disputas mediante mediación antes de acudir a tribunales.</p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3">15. Información de Contacto</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <div className="bg-muted p-3 rounded">
                      <p><strong>Encargado del Tratamiento:</strong></p>
                      <p className="mt-1">SST Colombia S.A.S.</p>
                      <p>NIT: 900.XXX.XXX-X</p>
                      <p>Domicilio: Medellín, Colombia</p>
                      <p>DPO Email: <a href="mailto:dpo@sst-colombia.com" className="text-primary hover:underline">dpo@sst-colombia.com</a></p>
                      <p>Legal Email: <a href="mailto:legal@sst-colombia.com" className="text-primary hover:underline">legal@sst-colombia.com</a></p>
                      <p>Teléfono: +57 (1) XXX-XXXX</p>
                    </div>
                  </div>
                </section>

                <Separator />

                <section className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <h2 className="text-xl font-semibold mb-3">Declaración de Aceptación</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong>AL UTILIZAR LA PLATAFORMA SST COLOMBIA, EL RESPONSABLE DEL TRATAMIENTO (SU EMPRESA) 
                    ACEPTA LOS TÉRMINOS DE ESTE ACUERDO DE PROCESAMIENTO DE DATOS Y RECONOCE QUE HA LEÍDO Y 
                    COMPRENDIDO SUS OBLIGACIONES BAJO LA LEY 1581/2012 Y EL GDPR.</strong>
                  </p>
                  <p className="text-muted-foreground mt-3">
                    Este DPA forma parte integral de los Términos de Servicio y tiene igual fuerza vinculante.
                  </p>
                </section>

                <div className="text-center text-xs text-muted-foreground mt-8 pt-4 border-t">
                  <p>Acuerdo de Procesamiento de Datos versión 1.0 | Fecha de vigencia: {lastUpdated}</p>
                  <p className="mt-1">Cumple con GDPR Art. 28, Ley 1581/2012, Decreto 1377/2013</p>
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

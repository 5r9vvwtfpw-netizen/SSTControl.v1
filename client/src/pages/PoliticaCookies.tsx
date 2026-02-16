import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Cookie } from "lucide-react";

export default function PoliticaCookies() {
  const lastUpdated = "16 de febrero de 2026";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <Cookie className="h-6 w-6 text-primary" />
              <CardTitle className="text-3xl" data-testid="text-page-title">Política de Cookies</CardTitle>
            </div>
            <CardDescription>
              Uso de Cookies y Tecnologías de Seguimiento
            </CardDescription>
            <p className="text-sm text-muted-foreground">
              Última actualización: {lastUpdated}
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6 text-sm">
                <section data-testid="section-que-son-cookies">
                  <h2 className="text-xl font-semibold mb-3">1. ¿Qué son las Cookies?</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>Las cookies son pequeños archivos de texto que se almacenan en su dispositivo (computador, tablet o teléfono móvil) cuando usted visita un sitio web. Las cookies permiten que el sitio web recuerde sus acciones y preferencias durante un período de tiempo, de modo que no tenga que volver a configurarlas cada vez que visite el sitio o navegue entre sus páginas.</p>
                    <p>En SST Colombia utilizamos cookies estrictamente necesarias para garantizar el correcto funcionamiento de la plataforma y brindarle una experiencia segura de uso.</p>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-cookies-utilizamos">
                  <h2 className="text-xl font-semibold mb-3">2. Cookies que Utilizamos</h2>
                  <div className="text-muted-foreground">
                    <p className="mb-3">A continuación se detallan las cookies que utiliza nuestra plataforma:</p>
                    <div className="bg-muted p-3 rounded overflow-x-auto">
                      <table className="w-full text-xs" data-testid="table-cookies">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 pr-4">Nombre</th>
                            <th className="text-left py-2 pr-4">Tipo</th>
                            <th className="text-left py-2 pr-4">Finalidad</th>
                            <th className="text-left py-2">Duración</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-2 pr-4 font-mono">connect.sid</td>
                            <td className="py-2 pr-4">Esenciales</td>
                            <td className="py-2 pr-4">Gestión de sesión de usuario</td>
                            <td className="py-2">12 horas</td>
                          </tr>
                          <tr>
                            <td className="py-2 pr-4 font-mono">cookie_consent</td>
                            <td className="py-2 pr-4">Preferencias</td>
                            <td className="py-2 pr-4">Registro de preferencias de cookies</td>
                            <td className="py-2">1 año</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-categorias">
                  <h2 className="text-xl font-semibold mb-3">3. Categorías de Cookies</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                      <p className="font-semibold mb-2">3.1 Cookies Esenciales (Obligatorias)</p>
                      <p>Son cookies estrictamente necesarias para el funcionamiento de la plataforma. Sin estas cookies, el sistema no puede operar correctamente. Incluyen la cookie de sesión que permite mantener su autenticación mientras navega por las diferentes secciones de la plataforma.</p>
                      <p className="mt-2 text-xs italic">Estas cookies no requieren consentimiento del usuario ya que son indispensables para la prestación del servicio solicitado.</p>
                    </div>
                    <div>
                      <p className="font-semibold mb-2">3.2 Cookies de Preferencias</p>
                      <p>Son cookies que permiten guardar las configuraciones y preferencias del usuario, como el idioma seleccionado, las preferencias de visualización o la aceptación de cookies. Mejoran la experiencia de usuario pero no son indispensables para el funcionamiento básico del sistema.</p>
                    </div>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-base-legal">
                  <h2 className="text-xl font-semibold mb-3">4. Base Legal</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>El uso de cookies en nuestra plataforma se fundamenta en las siguientes bases legales:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong>Artículo 15, Constitución Política de Colombia:</strong> Derecho a la intimidad personal y familiar, y al buen nombre. Todas las personas tienen derecho a conocer, actualizar y rectificar la información que se haya recogido sobre ellas.</li>
                      <li><strong>Ley 1581 de 2012 (Habeas Data):</strong> Disposiciones generales para la protección de datos personales en Colombia. Las cookies que recopilan información personal se rigen por esta ley.</li>
                      <li><strong>Decreto 1377 de 2013:</strong> Reglamentación parcial de la Ley 1581 de 2012 sobre mecanismos de autorización y tratamiento de datos.</li>
                      <li><strong>GDPR, Artículo 6:</strong> Bases legales para el tratamiento de datos personales, incluyendo el consentimiento del interesado y la necesidad para la ejecución de un contrato.</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-gestion-cookies">
                  <h2 className="text-xl font-semibold mb-3">5. Gestión de Cookies</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <p>Usted puede configurar su navegador para aceptar o rechazar cookies. A continuación le indicamos cómo gestionar las cookies en los principales navegadores:</p>
                    <div className="space-y-2">
                      <div className="border p-3 rounded">
                        <p className="font-semibold">Google Chrome</p>
                        <p className="text-xs mt-1">Configuración → Privacidad y seguridad → Cookies y otros datos de sitios → Gestionar cookies de terceros</p>
                      </div>
                      <div className="border p-3 rounded">
                        <p className="font-semibold">Mozilla Firefox</p>
                        <p className="text-xs mt-1">Opciones → Privacidad y seguridad → Cookies y datos del sitio → Gestionar excepciones</p>
                      </div>
                      <div className="border p-3 rounded">
                        <p className="font-semibold">Safari</p>
                        <p className="text-xs mt-1">Preferencias → Privacidad → Gestión de datos del sitio web → Eliminar todos/seleccionados</p>
                      </div>
                      <div className="border p-3 rounded">
                        <p className="font-semibold">Microsoft Edge</p>
                        <p className="text-xs mt-1">Configuración → Privacidad, búsqueda y servicios → Cookies y permisos del sitio → Administrar y eliminar cookies</p>
                      </div>
                    </div>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-consecuencias">
                  <h2 className="text-xl font-semibold mb-3">6. Consecuencias de Desactivar Cookies</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/30">
                      <p className="font-semibold mb-2">Importante</p>
                      <p>El sistema SST Colombia requiere cookies de sesión (<strong>connect.sid</strong>) para funcionar correctamente. Si desactiva las cookies esenciales:</p>
                      <ul className="list-disc pl-6 space-y-1 mt-2">
                        <li>No podrá iniciar sesión en la plataforma</li>
                        <li>No podrá acceder a las funcionalidades del SG-SST</li>
                        <li>La navegación entre páginas no mantendrá su estado de autenticación</li>
                        <li>No se podrán guardar sus preferencias de uso</li>
                      </ul>
                    </div>
                    <p className="mt-3">Le recomendamos mantener habilitadas al menos las cookies esenciales para garantizar el correcto funcionamiento de la plataforma y la seguridad de su información.</p>
                  </div>
                </section>

                <Separator />

                <section data-testid="section-contacto">
                  <h2 className="text-xl font-semibold mb-3">7. Contacto</h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>Si tiene preguntas sobre nuestra Política de Cookies o sobre el uso de tecnologías de seguimiento en nuestra plataforma, puede contactarnos a través de:</p>
                    <div className="bg-muted p-3 rounded">
                      <p><strong>Soporte Técnico:</strong> <a href="mailto:soporte@sst-colombia.com" className="text-primary hover:underline">soporte@sst-colombia.com</a></p>
                      <p><strong>Domicilio:</strong> Medellín, Colombia</p>
                    </div>
                  </div>
                </section>

                <div className="text-center text-xs text-muted-foreground mt-8 pt-4 border-t">
                  <p>Documento versión 1.0 | Fecha de vigencia: {lastUpdated}</p>
                  <p className="mt-1">© 2026 SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL SAS. Todos los derechos reservados.</p>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
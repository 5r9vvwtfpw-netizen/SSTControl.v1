import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Shield, TrendingUp, Building2, Users, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { ColombianFlag } from "@/components/ColombianFlag";
import { MinisterioFechasCard } from "@/components/MinisterioFechasCard";

function QuoteCTA() {
  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg">
        <div className="flex justify-center mb-2">
          <ExternalLink className="w-10 h-10 text-primary" />
        </div>
        <CardTitle className="text-2xl">Cotiza tu Precio Personalizado</CardTitle>
        <CardDescription className="text-base">
          Tu precio se calcula segun el perfil unico de tu empresa: numero de trabajadores, 
          codigo CIIU, nivel de riesgo ARL y vehiculos.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-3xl font-bold text-primary mb-1">1</div>
            <p className="font-semibold text-sm">Ingresa tus datos</p>
            <p className="text-xs text-muted-foreground mt-1">
              Trabajadores, CIIU, vehiculos
            </p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-3xl font-bold text-primary mb-1">2</div>
            <p className="font-semibold text-sm">Recibe tu cotizacion</p>
            <p className="text-xs text-muted-foreground mt-1">
              Precio calculado a tu medida
            </p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-3xl font-bold text-primary mb-1">3</div>
            <p className="font-semibold text-sm">Registrate y activa</p>
            <p className="text-xs text-muted-foreground mt-1">
              7 dias de prueba gratis
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Button asChild size="lg" data-testid="button-get-quote-calc">
            <a href="https://sst-colombia.com.co" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Obtener Mi Cotizacion
            </a>
          </Button>
          <p className="text-xs text-muted-foreground text-center max-w-md">
            Seras redirigido a sst-colombia.com.co donde podras ingresar los datos de tu empresa 
            y recibir un precio personalizado al instante.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="inline-flex items-center gap-3 bg-primary px-6 py-3 rounded-full">
              <ColombianFlag width={28} height={19} className="shadow-sm rounded-sm" />
              <span className="text-white font-semibold text-lg">Sistema Inteligente SST</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Uso autorizado de símbolos patrios - Decreto 1967/1991, Art. 13
            </p>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Precio Personalizado SG-SST
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            Solucion completa de SG-SST para empresas colombianas.
            Cumplimiento garantizado de Resolucion 0312/2019, Decreto 1072/2015 e ISO 45001:2018.
          </p>
          <div className="inline-flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-full">
            <span className="text-xl font-bold text-primary">Precio calculado a tu medida</span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mb-16">
          <QuoteCTA />
        </div>

        <div className="max-w-4xl mx-auto" id="planes-precios">
          <Card className="border-primary/30 shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <Shield className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">Plan Unico - Precio Personalizado</CardTitle>
              <CardDescription className="text-base max-w-2xl mx-auto">
                Tu precio se calcula automaticamente segun el perfil de tu empresa: codigo CIIU, nivel de riesgo ARL, 
                numero de trabajadores y vehiculos. Obtiene tu cotizacion personalizada desde nuestra pagina.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Building2 className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="font-semibold">Todas las funcionalidades</p>
                  <p className="text-sm text-muted-foreground">SST + PESV completo incluido</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="font-semibold">Sin limites de usuarios</p>
                  <p className="text-sm text-muted-foreground">Trabajadores y sedes ilimitados</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="font-semibold">Cumplimiento total</p>
                  <p className="text-sm text-muted-foreground">Res. 0312/2019 + ISO 45001</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {[
                  "Gestion completa de trabajadores y contratos",
                  "Registro de accidentes e incidentes",
                  "Capacitaciones SST con asistente IA",
                  "IPERC completo con GTC-45",
                  "Modulo PESV completo (Res. 40595/2022)",
                  "Matriz legal actualizada",
                  "Objetivos e indicadores SST",
                  "Auditorias internas SST",
                  "Revision por Direccion ISO 45001",
                  "Portal del Trabajador incluido",
                  "Generacion automatica de PDFs normativos",
                  "Tableros ejecutivos PHVA"
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2" data-testid={`feature-dynamic-${idx}`}>
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center gap-3">
                <Button asChild size="lg" data-testid="button-get-quote">
                  <a href="https://sst-colombia.com.co" target="_blank" rel="noopener noreferrer">
                    Obtener Cotizacion Personalizada
                  </a>
                </Button>
                <Button asChild variant="outline" data-testid="button-start-trial">
                  <Link href="/auth?mode=register">
                    Comenzar Prueba Gratis de 7 Dias
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground">Sin tarjeta de credito requerida</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <MinisterioFechasCard compact />
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">¿Por qué elegir SST Colombia?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">70%</div>
                  <p className="text-sm text-muted-foreground">
                    Más económico que consultores tradicionales
                  </p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">20h</div>
                  <p className="text-sm text-muted-foreground">
                    Ahorro mensual en documentación
                  </p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">100%</div>
                  <p className="text-sm text-muted-foreground">
                    Cumplimiento normativa colombiana
                  </p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">7</div>
                  <p className="text-sm text-muted-foreground">
                    Alertas automáticas Ministerio
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 max-w-5xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center items-center gap-2 mb-2">
                <Shield className="w-6 h-6 text-primary" />
                <ColombianFlag width={24} height={16} />
              </div>
              <CardTitle className="text-xl">Clasificacion segun Resolucion 0312/2019</CardTitle>
              <CardDescription>
                Tu empresa se clasifica automaticamente segun su codigo CIIU y nivel de riesgo ARL.
                El precio se calcula en funcion de esta clasificacion.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Clasificacion</th>
                      <th className="text-center py-3 px-2">Trabajadores</th>
                      <th className="text-center py-3 px-2">Nivel de Riesgo</th>
                      <th className="text-center py-3 px-2">Estandares Res. 0312</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-2 font-medium">Microempresa</td>
                      <td className="text-center py-3 px-2">1 - 10</td>
                      <td className="text-center py-3 px-2">I, II, III</td>
                      <td className="text-center py-3 px-2">7 estandares minimos</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-2 font-medium">Pequena Empresa</td>
                      <td className="text-center py-3 px-2">11 - 50</td>
                      <td className="text-center py-3 px-2">I, II, III</td>
                      <td className="text-center py-3 px-2">21 estandares</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-2 font-medium">Mediana / Grande</td>
                      <td className="text-center py-3 px-2">51+</td>
                      <td className="text-center py-3 px-2">I - V</td>
                      <td className="text-center py-3 px-2">61 estandares completos</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2 font-medium">Cualquier tamano</td>
                      <td className="text-center py-3 px-2">Cualquiera</td>
                      <td className="text-center py-3 px-2">IV, V</td>
                      <td className="text-center py-3 px-2">61 estandares completos</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                El sistema detecta automaticamente tu clasificacion al ingresar el codigo CIIU de tu empresa.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">¿Tienes preguntas?</h2>
          <p className="text-muted-foreground mb-6">
            Tu suscripcion incluye soporte, actualizaciones normativas automaticas,
            alertas del Ministerio de Trabajo, y acceso completo durante el periodo de prueba gratuita.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="outline">
              <Link href="/auth?mode=register">
                Comenzar Prueba Gratis
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/terminos-servicio">
                Ver Términos de Servicio
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

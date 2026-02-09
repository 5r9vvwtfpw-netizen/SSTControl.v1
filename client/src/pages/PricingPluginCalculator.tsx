import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Info } from "lucide-react";

export default function PricingPluginCalculator() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground" data-testid="text-page-title">Cotización Personalizada</h1>
          <p className="text-xl text-muted-foreground">
            Obtén tu precio personalizado según el perfil de tu empresa
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Precio Dinámico
            </CardTitle>
            <CardDescription>
              Tu precio se calcula según el perfil único de tu empresa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                El precio de tu suscripción se determina de forma personalizada según:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Número de trabajadores</li>
                <li>Actividad económica (código CIIU)</li>
                <li>Nivel de riesgo ARL</li>
                <li>Número de vehículos (si aplica PESV)</li>
              </ul>
              <p>
                Para obtener tu cotización personalizada, visita nuestra página principal donde podrás simular el precio según los datos de tu empresa.
              </p>
            </div>
            <Button 
              asChild 
              className="w-full" 
              size="lg"
              data-testid="button-go-landing"
            >
              <a href="https://sst-colombia.com.co" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Solicitar Cotización en sst-colombia.com.co
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

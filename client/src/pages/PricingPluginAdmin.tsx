import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Info, ShieldCheck } from "lucide-react";

export default function PricingPluginAdmin() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Gestión de Precios</h1>
          <p className="text-muted-foreground">
            Los precios se gestionan desde la landing page
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Modelo de Precios Dinámicos
            </CardTitle>
            <CardDescription>
              Los precios se calculan exclusivamente desde la landing page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">
                  Todos los precios del sistema provienen del JWT firmado de la landing page 
                  (<strong>sst-colombia.com.co</strong>). No se realizan cálculos de precios internamente.
                </p>
              </div>
              <div className="space-y-2 text-muted-foreground">
                <p className="font-medium text-foreground">Flujo de precios:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>La empresa solicita cotización en la landing page</li>
                  <li>La landing page calcula el precio según el perfil de la empresa</li>
                  <li>Se genera un JWT firmado con el precio</li>
                  <li>El precio se guarda en la base de datos al registrarse</li>
                  <li>Si la empresa cambia datos que afectan el precio, se recalcula automáticamente desde la landing page</li>
                </ol>
              </div>
            </div>
            <Button 
              asChild 
              className="w-full"
              data-testid="button-go-landing"
            >
              <a href="https://sst-colombia.com.co" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ir a la Landing Page
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Shield, 
  Lock, 
  Download, 
  ArrowLeft, 
  Building2, 
  Scale,
  CheckCircle,
  Loader2 
} from "lucide-react";
import { formatReportError } from "@/lib/report-error-messages";

interface DocumentDownload {
  id: string;
  title: string;
  description: string;
  endpoint: string;
  icon: React.ReactNode;
  filename: string;
}

export default function DocumentosLegalesPdf() {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState<string | null>(null);

  const documents: DocumentDownload[] = [
    {
      id: "protecciones-legales",
      title: "Protecciones Legales Completas",
      description: "Documento integral con las 26 categorías de protecciones legales incluyendo propiedad intelectual (DNDA 13-197-177), protección de datos, auditoría, y cumplimiento normativo.",
      endpoint: "/api/legal-docs/protecciones-legales/pdf",
      icon: <Scale className="h-8 w-8" />,
      filename: "Protecciones-Legales-SST-Colombia.pdf"
    },
    {
      id: "proteccion-datos",
      title: "Protección de Datos Personales",
      description: "Resumen de cumplimiento con Ley 1581/2012 (Habeas Data Colombia) y GDPR europeo. Incluye derechos ARCO, bases legales de tratamiento, y políticas de retención.",
      endpoint: "/api/legal-docs/proteccion-datos/pdf",
      icon: <Shield className="h-8 w-8" />,
      filename: "Proteccion-Datos-SST-Colombia.pdf"
    },
    {
      id: "medidas-seguridad",
      title: "Medidas de Seguridad Técnica",
      description: "Documentación de controles técnicos: cifrado AES-256, TLS 1.3, rate limiting, logging de auditoría, autenticación segura, y protección de infraestructura.",
      endpoint: "/api/legal-docs/medidas-seguridad/pdf",
      icon: <Lock className="h-8 w-8" />,
      filename: "Medidas-Seguridad-SST-Colombia.pdf"
    }
  ];

  const handleDownload = async (doc: DocumentDownload) => {
    setDownloading(doc.id);
    
    try {
      const response = await fetch(doc.endpoint);
      
      if (!response.ok) {
        // Try to parse JSON for specific error information
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            const error = new Error(errorData.message || `Error al generar el documento: ${response.statusText}`) as any;
            error.response = { data: errorData };
            error.statusCode = response.status;
            throw error;
          } catch (parseError) {
            // If JSON parsing fails, use generic message
            throw new Error(`Error al generar el documento: ${response.statusText}`);
          }
        }
        
        // Handle specific HTTP status codes
        let statusMessage = response.statusText;
        if (response.status === 403) statusMessage = "Acceso denegado";
        if (response.status === 404) statusMessage = "Documento no encontrado";
        if (response.status === 500) statusMessage = "Error interno del servidor";
        
        const error = new Error(`Error al generar el documento: ${statusMessage}`) as any;
        error.statusCode = response.status;
        throw error;
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Documento descargado",
        description: `${doc.title} se ha descargado correctamente.`,
      });
    } catch (error: any) {
      const { title, description } = formatReportError(error);
      toast({
        title,
        description,
        variant: "destructive"
      });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="link-back-home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-page-title">
                Documentos Legales
              </h1>
              <p className="text-muted-foreground">
                Descargue la documentación legal de SST Colombia
              </p>
            </div>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Registro de Propiedad Intelectual</CardTitle>
            </div>
            <CardDescription>
              Software registrado ante la Dirección Nacional de Derechos de Autor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold">DNDA 13-197-177</p>
                <p className="text-sm text-muted-foreground">
                  Protección legal bajo Ley 23/1982 y Decisión Andina 351
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover-elevate">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                    {doc.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2" data-testid={`text-doc-title-${doc.id}`}>
                      {doc.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {doc.description}
                    </p>
                    <Button
                      onClick={() => handleDownload(doc)}
                      disabled={downloading !== null}
                      data-testid={`button-download-${doc.id}`}
                    >
                      {downloading === doc.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generando PDF...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Descargar PDF
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 bg-muted/30">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Documentos Legales Adicionales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/terminos-servicio">
                <Button variant="outline" className="w-full justify-start" data-testid="link-terminos">
                  <FileText className="h-4 w-4 mr-2" />
                  Términos de Servicio
                </Button>
              </Link>
              <Link href="/politica-privacidad">
                <Button variant="outline" className="w-full justify-start" data-testid="link-privacidad">
                  <Shield className="h-4 w-4 mr-2" />
                  Política de Privacidad
                </Button>
              </Link>
              <Link href="/acuerdo-procesamiento-datos">
                <Button variant="outline" className="w-full justify-start" data-testid="link-dpa">
                  <Lock className="h-4 w-4 mr-2" />
                  Acuerdo de Procesamiento (DPA)
                </Button>
              </Link>
              <Link href="/solicitudes-arco">
                <Button variant="outline" className="w-full justify-start" data-testid="link-arco">
                  <Scale className="h-4 w-4 mr-2" />
                  Solicitudes ARCO
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <footer className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>
            SST Colombia - Sistema de Gestión de Seguridad y Salud en el Trabajo
          </p>
          <p className="mt-1">
            Registro DNDA 13-197-177 | Ley 1581/2012 | GDPR Compliant
          </p>
        </footer>
      </div>
    </div>
  );
}

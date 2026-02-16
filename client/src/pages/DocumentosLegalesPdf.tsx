import { useState, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { hasCompanyAdminAccess } from "@shared/permissions";
import type { CertificacionProfesional } from "@shared/schema";
import { 
  FileText, 
  Shield, 
  Lock, 
  Download, 
  ArrowLeft, 
  Building2, 
  Scale,
  CheckCircle,
  Loader2,
  Award,
  Upload,
  Trash2,
  UserCheck,
  BadgeCheck
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
  const { user } = useAuth();
  const [downloading, setDownloading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;

  const { data: certificaciones = [], isLoading: loadingCerts } = useQuery<CertificacionProfesional[]>({
    queryKey: ["/api/certificaciones-profesionales"],
    enabled: !!user,
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/certificaciones-profesionales", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Error al subir certificación");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/certificaciones-profesionales"] });
      toast({ title: "Certificación subida", description: "El documento se ha subido correctamente." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/certificaciones-profesionales/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/certificaciones-profesionales"] });
      toast({ title: "Certificación eliminada", description: "El documento se ha eliminado correctamente." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("archivo", file);
    formData.append("titulo", file.name.replace(/\.pdf$/i, ""));
    formData.append("profesionalNombre", "Hernán Valencia Gil");
    formData.append("profesionalCredenciales", "Consultor Profesional en Prevención de Riesgos Laborales");
    formData.append("profesionalLicencia", "S2019060049528");
    uploadMutation.mutate(formData);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCertDownload = async (cert: CertificacionProfesional) => {
    try {
      const response = await fetch(`/api/certificaciones-profesionales/${cert.id}/download`, { credentials: "include" });
      if (!response.ok) throw new Error("Error al descargar");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = cert.archivoNombre;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({ title: "Error", description: "No se pudo descargar el archivo", variant: "destructive" });
    }
  };

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

        <Card className="mt-8" data-testid="card-certificaciones">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Certificaciones y Avales Profesionales</CardTitle>
            </div>
            <CardDescription>
              Documentos de auditoría y aval emitidos por profesionales externos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/50 rounded-lg mb-4">
              <div className="flex items-start gap-3">
                <UserCheck className="h-6 w-6 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold" data-testid="text-auditor-label">Auditor Externo</p>
                  <p className="text-sm font-medium" data-testid="text-auditor-nombre">Hernán Valencia Gil</p>
                  <p className="text-sm text-muted-foreground" data-testid="text-auditor-titulo">Consultor Profesional en Prevención de Riesgos Laborales</p>
                  <p className="text-sm text-muted-foreground" data-testid="text-auditor-licencia">Licencia Profesional N° S2019060049528 - DSSA</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary" data-testid="badge-iso-9001">ISO 9001</Badge>
                    <Badge variant="secondary" data-testid="badge-iso-14001">ISO 14001</Badge>
                    <Badge variant="secondary" data-testid="badge-iso-45001">ISO 45001</Badge>
                  </div>
                </div>
              </div>
            </div>

            {loadingCerts ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : certificaciones.length > 0 ? (
              <div className="space-y-3 mb-4">
                {certificaciones.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between gap-3 p-3 bg-muted/30 rounded-lg" data-testid={`card-cert-${cert.id}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <BadgeCheck className="h-5 w-5 text-green-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate" data-testid={`text-cert-titulo-${cert.id}`}>{cert.titulo}</p>
                        <p className="text-xs text-muted-foreground truncate">{cert.archivoNombre}</p>
                        {cert.fechaEmision && (
                          <p className="text-xs text-muted-foreground">Emitido: {new Date(cert.fechaEmision).toLocaleDateString("es-CO")}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleCertDownload(cert)}
                        data-testid={`button-download-cert-${cert.id}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(cert.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-cert-${cert.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-4" data-testid="text-no-certs">No hay certificaciones subidas aún.</p>
            )}

            {isAdmin && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  data-testid="input-cert-file"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadMutation.isPending}
                  data-testid="button-upload-cert"
                >
                  {uploadMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Subir Certificación PDF
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

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
              <Link href="/aviso-privacidad">
                <Button variant="outline" className="w-full justify-start" data-testid="link-aviso-privacidad">
                  <FileText className="h-4 w-4 mr-2" />
                  Aviso de Privacidad
                </Button>
              </Link>
              <Link href="/politica-cookies">
                <Button variant="outline" className="w-full justify-start" data-testid="link-politica-cookies">
                  <FileText className="h-4 w-4 mr-2" />
                  Politica de Cookies
                </Button>
              </Link>
              <Link href="/contrato-saas">
                <Button variant="outline" className="w-full justify-start" data-testid="link-contrato-saas">
                  <FileText className="h-4 w-4 mr-2" />
                  Contrato SaaS
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

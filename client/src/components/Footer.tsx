import { Link } from "wouter";
import { Shield, FileText, Scale, Lock, Cookie, FileSignature } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t py-3 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>© 2026 SST Colombia | Registro DNDA 13-197-177 | v4.0.0</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <Link 
              href="/terminos-servicio" 
              className="flex items-center gap-1 hover:text-foreground transition-colors"
              data-testid="link-terms-footer"
            >
              <FileText className="h-3 w-3" />
              <span>Términos de Servicio</span>
            </Link>
            <Link 
              href="/politica-privacidad" 
              className="flex items-center gap-1 hover:text-foreground transition-colors"
              data-testid="link-privacy-footer"
            >
              <Lock className="h-3 w-3" />
              <span>Política de Privacidad</span>
            </Link>
            <Link 
              href="/politica-cookies" 
              className="flex items-center gap-1 hover:text-foreground transition-colors"
              data-testid="link-cookies-footer"
            >
              <Cookie className="h-3 w-3" />
              <span>Cookies</span>
            </Link>
            <Link 
              href="/contrato-saas" 
              className="flex items-center gap-1 hover:text-foreground transition-colors"
              data-testid="link-contrato-footer"
            >
              <FileSignature className="h-3 w-3" />
              <span>Contrato SaaS</span>
            </Link>
            <Link 
              href="/terminos-servicio#propiedad-intelectual" 
              className="flex items-center gap-1 hover:text-foreground transition-colors"
              data-testid="link-ip-footer"
            >
              <Scale className="h-3 w-3" />
              <span>Propiedad Intelectual</span>
            </Link>
          </div>
          
          <div className="text-center md:text-right">
            <span>Todos los derechos reservados</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function FooterMinimal() {
  return (
    <footer className="bg-muted/50 border-t py-2 px-4 text-center text-xs text-muted-foreground">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span>© 2026 SST Colombia | DNDA 13-197-177 | v4.0.0</span>
        <span className="hidden sm:inline">|</span>
        <div className="flex items-center gap-2">
          <Link 
            href="/terminos-servicio" 
            className="hover:text-foreground transition-colors underline"
            data-testid="link-terms-minimal"
          >
            Términos
          </Link>
          <span>·</span>
          <Link 
            href="/politica-privacidad" 
            className="hover:text-foreground transition-colors underline"
            data-testid="link-privacy-minimal"
          >
            Privacidad
          </Link>
          <span>·</span>
          <Link 
            href="/politica-cookies" 
            className="hover:text-foreground transition-colors underline"
            data-testid="link-cookies-minimal"
          >
            Cookies
          </Link>
          <span>·</span>
          <Link 
            href="/contrato-saas" 
            className="hover:text-foreground transition-colors underline"
            data-testid="link-contrato-minimal"
          >
            Contrato SaaS
          </Link>
        </div>
      </div>
    </footer>
  );
}

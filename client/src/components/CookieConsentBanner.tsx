import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Cookie, X } from "lucide-react";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = document.cookie
      .split("; ")
      .find((row) => row.startsWith("cookie_consent="));
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `cookie_consent=accepted; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    setVisible(false);
  };

  const rejectOptional = () => {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `cookie_consent=essential_only; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card border-t shadow-lg"
      data-testid="banner-cookie-consent"
    >
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1" data-testid="text-cookie-title">
                Uso de Cookies
              </p>
              <p className="text-muted-foreground" data-testid="text-cookie-description">
                Utilizamos cookies esenciales para el funcionamiento del sistema y cookies de preferencias
                para mejorar su experiencia. Consulte nuestra{" "}
                <Link
                  href="/politica-cookies"
                  className="underline hover:text-foreground transition-colors"
                  data-testid="link-cookie-policy"
                >
                  Politica de Cookies
                </Link>{" "}
                para mas informacion.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={rejectOptional}
              data-testid="button-reject-cookies"
            >
              Solo esenciales
            </Button>
            <Button
              size="sm"
              onClick={acceptCookies}
              data-testid="button-accept-cookies"
            >
              Aceptar todas
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={rejectOptional}
              data-testid="button-close-cookies"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

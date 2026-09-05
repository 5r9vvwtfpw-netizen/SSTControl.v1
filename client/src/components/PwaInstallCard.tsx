import { useEffect, useState } from "react";
import { Download, Share, Smartphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void> | void;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type PwaWindow = Window & {
  __pwaInstallPrompt?: InstallPromptEvent | null;
};

function isInstalled(): boolean {
  const standalone = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return standalone || iosStandalone;
}

function isIosDevice(): boolean {
  const classicIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const modernIpad = /macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1;
  return classicIos || modernIpad;
}

function isAndroidDevice(): boolean {
  return /android/i.test(navigator.userAgent);
}

export function PwaInstallCard() {
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isInstalled);
  const [isIos] = useState(isIosDevice);
  const [isAndroid] = useState(isAndroidDevice);
  const [shareUnavailable, setShareUnavailable] = useState(false);

  useEffect(() => {
    const pwaWindow = window as PwaWindow;
    const savedPrompt = pwaWindow.__pwaInstallPrompt;
    if (savedPrompt) setDeferredPrompt(savedPrompt);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const installEvent = event as InstallPromptEvent;
      setDeferredPrompt(installEvent);
      pwaWindow.__pwaInstallPrompt = installEvent;
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      pwaWindow.__pwaInstallPrompt = null;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      setDeferredPrompt(null);
      (window as PwaWindow).__pwaInstallPrompt = null;
    }
  };

  const handleIosShare = async () => {
    if (!navigator.share) {
      setShareUnavailable(true);
      return;
    }

    try {
      await navigator.share({
        title: "Portal de Empleados SST",
        text: "Acceso al Portal de Empleados SST",
        url: window.location.href,
      });
    } catch (error) {
      if (!(error instanceof DOMException) || error.name !== "AbortError") {
        setShareUnavailable(true);
      }
    }
  };

  if (installed) return null;

  return (
    <Card className="border-green-200 bg-green-50/70 dark:border-green-900 dark:bg-green-950/20" data-testid="card-pwa-install">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-green-600 p-2 text-white dark:bg-green-700">
            <Smartphone className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-green-900 dark:text-green-100">
              Instala el Portal en tu celular
            </p>
            {isIos ? (
              <>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Abre el menú y elige <strong>Agregar a pantalla de inicio</strong>.
                </p>
                {shareUnavailable && (
                  <p className="text-xs text-green-700 dark:text-green-300" role="status">
                    Si el menú no se abre, usa el botón Compartir de la barra de Safari.
                  </p>
                )}
              </>
            ) : deferredPrompt ? (
              <p className="text-sm text-green-800 dark:text-green-200">
                Accede más rápido desde un ícono en la pantalla principal.
              </p>
            ) : isAndroid ? (
              <p className="text-sm text-green-800 dark:text-green-200">
                En Chrome, abre el menú <strong>⋮</strong> y elige <strong>Instalar aplicación</strong> o{" "}
                <strong>Agregar a pantalla de inicio</strong>.
              </p>
            ) : (
              <p className="text-sm text-green-800 dark:text-green-200">
                Abre el portal desde tu celular y agrégalo a la pantalla principal.
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          {deferredPrompt ? (
            <Button
              onClick={handleInstall}
              className="bg-green-700 hover:bg-green-800"
              data-testid="button-install-pwa"
            >
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Instalar ahora
            </Button>
          ) : isIos ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleIosShare}
              className="border-green-300 bg-white text-green-900 hover:bg-green-100"
              data-testid="button-share-ios-pwa"
            >
              <Share className="mr-2 h-4 w-4" aria-hidden="true" />
              Abrir menú Compartir
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
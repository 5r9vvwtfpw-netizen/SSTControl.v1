import { useEffect, useState } from "react";
import { Bell, BellOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

type PushStatus = "loading" | "enabled" | "disabled" | "denied" | "unsupported";

function base64UrlToUint8Array(value: string): Uint8Array {
  const padded = value + "=".repeat((4 - value.length % 4) % 4);
  const raw = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

export function WebPushControl() {
  const [status, setStatus] = useState<PushStatus>("loading");
  const [message, setMessage] = useState("");
  const [testPending, setTestPending] = useState(false);
  const isiOS = /iPad|iPhone|iPod/i.test(navigator.userAgent)
    || (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  const isInstalled = window.matchMedia("(display-mode: standalone)").matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true;

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setStatus("unsupported");
      return;
    }
    navigator.serviceWorker.ready.then(async (registration) => {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) setStatus("enabled");
      else if (Notification.permission === "denied") setStatus("denied");
      else setStatus("disabled");
    }).catch(() => setStatus("unsupported"));
  }, []);

  const activate = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }
      const keyResponse = await fetch("/api/web-push/public-key", { credentials: "include" });
      const config = await keyResponse.json() as { enabled: boolean; publicKey?: string };
      if (!keyResponse.ok || !config.enabled || !config.publicKey) throw new Error("El servicio de notificaciones no está disponible.");
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToUint8Array(config.publicKey),
      });
      await apiRequest("POST", "/api/web-push/subscriptions", subscription.toJSON());
      setStatus("enabled");
      setMessage("Notificaciones activadas en este dispositivo.");
    } catch (error: any) {
      setMessage(error?.message || "No fue posible activar las notificaciones.");
      setStatus("disabled");
    }
  };

  const deactivate = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await apiRequest("DELETE", "/api/web-push/subscriptions", { endpoint: subscription.endpoint });
        await subscription.unsubscribe();
      }
      setStatus("disabled");
      setMessage("Notificaciones desactivadas en este dispositivo.");
    } catch {
      setMessage("No fue posible desactivar las notificaciones.");
    }
  };

  const testNotification = async () => {
    try {
      setTestPending(true);
      const response = await apiRequest("POST", "/api/web-push/test");
      const data = await response.json() as { message?: string };
      setMessage(data.message || "Cierra el portal; la notificación llegará en unos segundos.");
    } catch (error: any) {
      setMessage(error?.message || "No fue posible programar la notificación de prueba.");
    } finally {
      setTestPending(false);
    }
  };

  if (status === "unsupported") return (
    <p className="text-xs text-muted-foreground" data-testid="web-push-unsupported">
      Este navegador no admite notificaciones. {isiOS && !isInstalled ? "En iPhone/iPad debes instalar primero esta app en la pantalla de inicio." : ""}
    </p>
  );

  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="web-push-control">
      {status === "enabled" ? (
        <>
          <Button size="sm" onClick={testNotification} disabled={testPending} data-testid="button-test-notification">
            <Send className="mr-2 h-4 w-4" /> {testPending ? "Programando..." : "Probar en 10 segundos"}
          </Button>
          <Button variant="outline" size="sm" onClick={deactivate} data-testid="button-disable-notifications">
            <BellOff className="mr-2 h-4 w-4" /> Desactivar
          </Button>
        </>
      ) : (
        <Button variant="outline" size="sm" onClick={activate} disabled={status === "loading" || status === "denied"} data-testid="button-enable-notifications">
          <Bell className="mr-2 h-4 w-4" /> Activar notificaciones
        </Button>
      )}
      <span className="text-xs text-muted-foreground" data-testid="web-push-status">
        {status === "denied" ? "Las notificaciones fueron bloqueadas; habilítalas en los ajustes del navegador." :
          message || "Recibe mensajes, capacitaciones y exámenes incluso cuando el portal esté cerrado."}
      </span>
    </div>
  );
}
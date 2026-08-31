import { useCallback, useEffect, useRef, useState } from "react";
import { Clock3 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const WARNING_BEFORE_MS = 2 * 60 * 1000;
const HEARTBEAT_INTERVAL_MS = 60 * 1000;
const AUTH_CHANNEL_NAME = "sst-auth-channel";

export function SessionTimeoutGuard() {
  const { user } = useAuth();
  const [warningOpen, setWarningOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(WARNING_BEFORE_MS / 1000);
  const lastActivityRef = useRef(Date.now());
  const activityPendingRef = useRef(false);
  const expiredRef = useRef(false);

  const redirectAfterExpiry = useCallback((reason: "idle" | "absolute" = "idle") => {
    if (expiredRef.current) return;
    expiredRef.current = true;
    queryClient.setQueryData(["/api/user"], null);

    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel(AUTH_CHANNEL_NAME);
      channel.postMessage({ type: "LOGOUT" });
      channel.close();
    }

    const message = reason === "absolute" ? "tiempo-maximo" : "inactividad";
    window.location.href = `/login?sesion=${message}`;
  }, []);

  const reportActivity = useCallback(async () => {
    try {
      const response = await fetch("/api/session/activity", {
        method: "POST",
        credentials: "include",
      });
      if (response.status === 401) {
        const body = await response.json().catch(() => null);
        redirectAfterExpiry(body?.code === "SESSION_ABSOLUTE_TIMEOUT" ? "absolute" : "idle");
        return false;
      }
      return response.ok;
    } catch {
      return false;
    }
  }, [redirectAfterExpiry]);

  const continueSession = useCallback(async () => {
    const active = await reportActivity();
    if (!active) return;
    lastActivityRef.current = Date.now();
    activityPendingRef.current = false;
    setWarningOpen(false);
    setSecondsRemaining(WARNING_BEFORE_MS / 1000);
  }, [reportActivity]);

  useEffect(() => {
    if (!user) {
      setWarningOpen(false);
      return;
    }

    expiredRef.current = false;
    lastActivityRef.current = Date.now();
    activityPendingRef.current = true;

    const recordActivity = () => {
      lastActivityRef.current = Date.now();
      activityPendingRef.current = true;
      setWarningOpen(false);
    };

    const activityEvents: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "scroll",
      "touchstart",
    ];
    activityEvents.forEach((eventName) =>
      window.addEventListener(eventName, recordActivity, { passive: true }),
    );

    const heartbeat = window.setInterval(() => {
      if (!activityPendingRef.current || document.visibilityState !== "visible") return;
      activityPendingRef.current = false;
      void reportActivity().then((active) => {
        if (!active) activityPendingRef.current = true;
      });
    }, HEARTBEAT_INTERVAL_MS);

    const timer = window.setInterval(() => {
      const idleFor = Date.now() - lastActivityRef.current;
      const remaining = Math.max(0, IDLE_TIMEOUT_MS - idleFor);

      if (remaining <= 0) {
        void fetch("/api/logout", { method: "POST", credentials: "include" })
          .finally(() => redirectAfterExpiry("idle"));
        return;
      }

      if (remaining <= WARNING_BEFORE_MS) {
        setSecondsRemaining(Math.ceil(remaining / 1000));
        setWarningOpen(true);
      }
    }, 1000);

    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      const idleFor = Date.now() - lastActivityRef.current;
      if (idleFor >= IDLE_TIMEOUT_MS) {
        void reportActivity();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, recordActivity));
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearInterval(heartbeat);
      window.clearInterval(timer);
    };
  }, [redirectAfterExpiry, reportActivity, user]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  return (
    <AlertDialog open={warningOpen}>
      <AlertDialogContent data-testid="dialog-session-timeout-warning">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-amber-600" />
            Tu sesión está por cerrarse
          </AlertDialogTitle>
          <AlertDialogDescription>
            Por seguridad, cerraremos tu sesión por inactividad en{" "}
            <strong className="text-foreground">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </strong>
            . Si continúas trabajando, confirma para mantenerla activa.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={continueSession} data-testid="button-continue-session">
            Continuar trabajando
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
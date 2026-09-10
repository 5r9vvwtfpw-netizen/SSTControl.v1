import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";

const SESSION_IDLE_MINUTES = 20;
const SESSION_IDLE_MS = SESSION_IDLE_MINUTES * 60 * 1000;
const ACTIVITY_SYNC_INTERVAL_MS = 60 * 1000;

export function SessionTimeoutGuard() {
  const { user, logoutMutation } = useAuth();
  const lastInteractionAtRef = useRef(Date.now());
  const lastServerSyncAtRef = useRef(0);
  const idleCheckTimeoutRef = useRef<number | null>(null);
  const checkingIdleRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    let disposed = false;
    lastInteractionAtRef.current = Date.now();
    lastServerSyncAtRef.current = 0;
    checkingIdleRef.current = false;

    const redirectAfterExpiredSession = () => {
      if (disposed || checkingIdleRef.current) return;
      checkingIdleRef.current = true;
      logoutMutation.mutate();
    };

    const syncActivity = () => {
      const now = Date.now();
      if (now - lastInteractionAtRef.current >= SESSION_IDLE_MS) {
        redirectAfterExpiredSession();
        return;
      }

      if (now - lastServerSyncAtRef.current < ACTIVITY_SYNC_INTERVAL_MS) return;
      lastServerSyncAtRef.current = now;

      void fetch("/api/session/activity", {
        method: "POST",
        credentials: "include",
      }).then((response) => {
        if (!response.ok && response.status === 401) {
          redirectAfterExpiredSession();
        }
      }).catch(() => {
        // A transient network failure must not log the user out.
      });
    };

    const scheduleIdleCheck = () => {
      if (idleCheckTimeoutRef.current !== null) {
        window.clearTimeout(idleCheckTimeoutRef.current);
      }
      const remaining = Math.max(
        0,
        SESSION_IDLE_MS - (Date.now() - lastInteractionAtRef.current),
      );
      idleCheckTimeoutRef.current = window.setTimeout(() => {
        syncActivity();
        if (!disposed && !checkingIdleRef.current) {
          scheduleIdleCheck();
        }
      }, remaining);
    };

    const handleInteraction = () => {
      const now = Date.now();
      if (now - lastInteractionAtRef.current >= SESSION_IDLE_MS) {
        redirectAfterExpiredSession();
        return;
      }
      lastInteractionAtRef.current = now;
      syncActivity();
      scheduleIdleCheck();
    };

    const events: Array<[keyof DocumentEventMap, AddEventListenerOptions | undefined]> = [
      ["pointerdown", undefined],
      ["keydown", undefined],
      ["touchstart", { passive: true }],
      ["scroll", { passive: true }],
    ];
    events.forEach(([event, options]) => document.addEventListener(event, handleInteraction, options));
    scheduleIdleCheck();

    return () => {
      disposed = true;
      if (idleCheckTimeoutRef.current !== null) {
        window.clearTimeout(idleCheckTimeoutRef.current);
      }
      events.forEach(([event, options]) => document.removeEventListener(event, handleInteraction, options));
    };
  }, [user, logoutMutation]);

  return null;
}
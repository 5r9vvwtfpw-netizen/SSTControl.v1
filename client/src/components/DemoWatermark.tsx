import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function DiagonalOverlay({ lines, color }: { lines: string[]; color: string }) {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9997] overflow-hidden"
      aria-hidden="true"
      data-testid="watermark-overlay"
    >
      <div className="absolute inset-0" style={{ transform: "rotate(-35deg)", transformOrigin: "center center" }}>
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="whitespace-nowrap text-center"
            style={{
              fontSize: "26px",
              fontWeight: 800,
              color,
              lineHeight: "140px",
              letterSpacing: "6px",
              userSelect: "none",
            }}
          >
            {lines.map((line, j) => (
              <span key={j}>{line} &nbsp;&nbsp;&nbsp; </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DemoWatermark() {
  const { user } = useAuth();
  const now = useNow(60_000);

  if (!user) return null;

  const isDemoSession = !!(user as any).isDemoSession;
  const subscriptionStatus = (user as any).subscriptionStatus;
  const isTrial = !isDemoSession && subscriptionStatus?.isTrial === true;

  if (!isDemoSession && !isTrial) {
    return null;
  }

  if (isDemoSession) {
    return (
      <>
        <DiagonalOverlay lines={["DEMO"]} color="rgba(220, 38, 38, 0.08)" />
        <div
          className="sticky top-0 left-0 right-0 z-[9998] bg-red-600 text-white text-center py-1.5 pointer-events-none w-full"
          data-testid="demo-watermark-banner"
          style={{ marginBottom: 0 }}
        >
          <span className="text-sm font-bold tracking-wide">
            MODO DEMOSTRACIÓN — Los datos se eliminarán automáticamente — sst-colombia.com.co
          </span>
        </div>
        <div
          className="fixed bottom-0 left-0 right-0 z-[9998] bg-red-600 text-white text-center py-1.5 pointer-events-none"
          data-testid="demo-watermark-banner-bottom"
        >
          <span className="text-sm font-bold tracking-wide">
            VERSIÓN DEMO — NO VÁLIDO PARA USO OFICIAL — Adquiera su licencia en sst-colombia.com.co
          </span>
        </div>
      </>
    );
  }

  // Trial real: marca de agua con la identidad del usuario/empresa para disuadir capturas de pantalla
  const companyName = (user as any).companyName || "";
  const identity = [companyName, user.email].filter(Boolean).join(" · ");
  const stamp = now.toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const daysRemaining = subscriptionStatus?.daysRemaining;

  return (
    <>
      <DiagonalOverlay
        lines={[identity || "PERIODO DE PRUEBA", stamp]}
        color="rgba(15, 23, 42, 0.06)"
      />
      <div
        className="sticky top-0 left-0 right-0 z-[9998] bg-amber-500 text-slate-900 text-center py-1.5 pointer-events-none w-full"
        data-testid="trial-watermark-banner"
        style={{ marginBottom: 0 }}
      >
        <span className="text-sm font-bold tracking-wide">
          PERIODO DE PRUEBA{typeof daysRemaining === "number" ? ` — ${daysRemaining} día(s) restantes` : ""} — Contenido confidencial, uso exclusivo de {companyName || "su empresa"}
        </span>
      </div>
    </>
  );
}

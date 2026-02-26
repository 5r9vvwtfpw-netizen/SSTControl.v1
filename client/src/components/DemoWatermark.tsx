import { useAuth } from "@/hooks/use-auth";

export function DemoWatermark() {
  const { user } = useAuth();

  if (!user || !(user as any).isDemoSession) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
        aria-hidden="true"
        data-testid="demo-watermark-overlay"
      >
        <div className="absolute inset-0" style={{ transform: "rotate(-35deg)", transformOrigin: "center center" }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="whitespace-nowrap text-center"
              style={{
                fontSize: "48px",
                fontWeight: 900,
                color: "rgba(220, 38, 38, 0.08)",
                lineHeight: "200px",
                letterSpacing: "20px",
                userSelect: "none",
              }}
            >
              DEMO &nbsp; DEMO &nbsp; DEMO &nbsp; DEMO &nbsp; DEMO &nbsp; DEMO
            </div>
          ))}
        </div>
      </div>

      <div
        className="fixed top-0 left-0 right-0 z-[9998] bg-red-600 text-white text-center py-1.5 pointer-events-none"
        data-testid="demo-watermark-banner"
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

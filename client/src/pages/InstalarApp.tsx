import { useEffect, useState } from "react";
import { useLocation } from "wouter";

type Platform = "android" | "ios" | "other";

function detectPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "other";
}

export default function InstalarApp() {
  const [platform] = useState<Platform>(detectPlatform);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const stored = (window as any).__pwaInstallPrompt;
    if (stored) setDeferredPrompt(stored);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).__pwaInstallPrompt = e;
    };
    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setTimeout(() => navigate("/login"), 2000);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [navigate]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      (window as any).__pwaInstallPrompt = null;
    }
  };

  if (installed) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.checkCircle}>✓</div>
          <h2 style={styles.title}>App instalada</h2>
          <p style={styles.subtitle}>Redirigiendo al portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="#166534"/>
            <path d="M24 10C16.268 10 10 16.268 10 24s6.268 14 14 14 14-6.268 14-14S31.732 10 24 10zm0 4a4 4 0 110 8 4 4 0 010-8zm0 20c-4.418 0-8-2-8-4.5V28c0-2.5 3.582-4.5 8-4.5s8 2 8 4.5v1.5c0 2.5-3.582 4.5-8 4.5z" fill="white"/>
          </svg>
        </div>

        <h1 style={styles.appName}>SST Colombia</h1>
        <p style={styles.subtitle}>Portal de Empleados</p>

        {platform === "android" && (
          <div style={styles.content}>
            {deferredPrompt ? (
              <>
                <p style={styles.instruction}>Toca el botón para instalar la app en tu celular</p>
                <button style={styles.installBtn} onClick={handleInstall}>
                  Instalar App
                </button>
              </>
            ) : (
              <>
                <p style={styles.instruction}>Para instalar la app en Android:</p>
                <div style={styles.step}>
                  <span style={styles.stepNum}>1</span>
                  <span>Toca los <strong>3 puntos</strong> del menú del navegador (esquina superior derecha)</span>
                </div>
                <div style={styles.step}>
                  <span style={styles.stepNum}>2</span>
                  <span>Selecciona <strong>"Instalar app"</strong> o <strong>"Agregar a pantalla de inicio"</strong></span>
                </div>
                <div style={styles.step}>
                  <span style={styles.stepNum}>3</span>
                  <span>Toca <strong>"Instalar"</strong> en el mensaje que aparece</span>
                </div>
              </>
            )}
          </div>
        )}

        {platform === "ios" && (
          <div style={styles.content}>
            <p style={styles.instruction}>Para instalar la app en iPhone:</p>
            <div style={styles.step}>
              <span style={styles.stepNum}>1</span>
              <span>Abre esta página en <strong>Safari</strong> (no Chrome)</span>
            </div>
            <div style={styles.step}>
              <span style={styles.stepNum}>2</span>
              <span>Toca el botón de <strong>Compartir</strong> <span style={{fontSize: 18}}>⬆</span> en la barra inferior</span>
            </div>
            <div style={styles.step}>
              <span style={styles.stepNum}>3</span>
              <span>Selecciona <strong>"Agregar a pantalla de inicio"</strong></span>
            </div>
            <div style={styles.step}>
              <span style={styles.stepNum}>4</span>
              <span>Toca <strong>"Agregar"</strong></span>
            </div>
          </div>
        )}

        {platform === "other" && (
          <div style={styles.content}>
            <p style={styles.instruction}>Abre este enlace desde tu celular para instalar la app.</p>
          </div>
        )}

        <a href="/login" style={styles.loginLink}>
          Ir al Portal sin instalar →
        </a>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    background: "#ffffff",
    borderRadius: 16,
    padding: "40px 32px",
    maxWidth: 400,
    width: "100%",
    textAlign: "center",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  logo: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 16,
  },
  appName: {
    margin: "0 0 4px 0",
    fontSize: 24,
    fontWeight: 700,
    color: "#166534",
  },
  subtitle: {
    margin: "0 0 28px 0",
    fontSize: 14,
    color: "#6b7280",
  },
  content: {
    textAlign: "left",
    marginBottom: 28,
  },
  instruction: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 16,
    textAlign: "center",
  },
  step: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
    fontSize: 14,
    color: "#374151",
    lineHeight: 1.5,
  },
  stepNum: {
    minWidth: 28,
    height: 28,
    background: "#166534",
    color: "#ffffff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
  },
  installBtn: {
    width: "100%",
    background: "#166534",
    color: "#ffffff",
    border: "none",
    borderRadius: 10,
    padding: "16px 0",
    fontSize: 17,
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: 16,
  },
  loginLink: {
    display: "block",
    marginTop: 8,
    color: "#2563eb",
    fontSize: 14,
    textDecoration: "none",
  },
  checkCircle: {
    width: 64,
    height: 64,
    background: "#166534",
    color: "#ffffff",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    fontWeight: 700,
    margin: "0 auto 16px",
  },
  title: {
    margin: "0 0 8px 0",
    fontSize: 20,
    fontWeight: 700,
    color: "#166534",
  },
};

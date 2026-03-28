# CAPTCHA Interactivo de Arrastrar y Soltar - Guía para Cloud Books

## Instrucciones para el Agente de Replit

Este es un sistema de CAPTCHA interactivo con temática educativa que se muestra en el login. Cada día del año muestra un reto diferente que el usuario debe completar arrastrando un emoji hasta su destino. Al completarlo, se muestra confetti, un sonido de éxito, y una frase motivacional del día.

**NECESITO que adaptes este código para mi software contable Cloud Books.** Los 3 archivos van abajo. Lo que debes hacer:

1. **CaptchaContable.tsx** — Copia el componente tal cual, solo cambia el nombre del componente de `CaptchaSST` a `CaptchaContable` y los colores azules por los colores de tu tema. El resto de la lógica NO se toca.

2. **captcha-misiones.ts** — **REEMPLAZA los 365 retos de SST por 365 retos de contabilidad colombiana.** Temas que deben incluir: PUC, NIIF, facturación electrónica DIAN, retención en la fuente, ICA, IVA, declaraciones tributarias, libros contables, estados financieros, conciliaciones bancarias, nómina electrónica, impuesto de renta, medios magnéticos, certificados de retención, balance general, estado de resultados, flujo de caja, cuentas por cobrar, cuentas por pagar, activos fijos, depreciación, amortización, provisiones, notas contables, causaciones, comprobantes de egreso, recibos de caja, notas crédito, notas débito, ajustes contables, cierre contable, reportes a SuperSociedades, información exógena, libros oficiales, etc.

3. **captcha-motivacion.ts** — **REEMPLAZA las 266 frases motivacionales de SST por 365 frases de contabilidad y finanzas.** Ejemplos: "Las cuentas claras hacen empresas exitosas", "Un buen contador es el guardián de la empresa", "La contabilidad es el idioma de los negocios", etc.

4. **Instala la dependencia `canvas-confetti`** con: `npm install canvas-confetti`

5. **Úsalo en tu página de login** así:
```tsx
import CaptchaContable from "./components/CaptchaContable";

// En tu formulario de login:
const [captchaVerified, setCaptchaVerified] = useState(false);

// Después del campo de contraseña:
<CaptchaContable onVerified={() => setCaptchaVerified(true)} />

// El botón de login debe estar deshabilitado hasta que captchaVerified sea true:
<Button disabled={!captchaVerified}>Iniciar Sesión</Button>
```

---

## ARCHIVO 1: CaptchaSST.tsx (renombrar a CaptchaContable.tsx)

```tsx
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { ALL_CHALLENGES, type DailyChallenge } from "./captcha-misiones";
import { getFraseDelDia } from "./captcha-motivacion";

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getDailyChallenge(): DailyChallenge {
  const dayOfYear = getDayOfYear();
  const index = dayOfYear % ALL_CHALLENGES.length;
  return ALL_CHALLENGES[index];
}

const SUCCESS_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3";

function playSuccessSound() {
  try {
    const audio = new Audio(SUCCESS_SOUND_URL);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch {}
}

function launchConfetti() {
  const duration = 2000;
  const end = Date.now() + duration;

  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#1A237E", "#FBC02D", "#FFFFFF"],
  });

  const interval = setInterval(() => {
    if (Date.now() > end) {
      clearInterval(interval);
      return;
    }
    confetti({
      particleCount: 30,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#1A237E", "#FBC02D", "#FFFFFF"],
    });
    confetti({
      particleCount: 30,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#1A237E", "#FBC02D", "#FFFFFF"],
    });
  }, 250);
}

const CAPTCHA_STYLE_ID = "captcha-contable-styles";

const captchaStyles = `
#captcha-contable-wrapper {
  --cap-blue: #1A237E;
  --cap-accent: #FBC02D;
  --cap-success: #43A047;
  --cap-bg: #F0F2F5;
}

#captcha-contable-wrapper .captcha-container {
  font-family: 'Inter', -apple-system, sans-serif;
  background: #ffffff;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(26, 35, 126, 0.1);
  max-width: 380px;
  text-align: center;
  border-top: 5px solid var(--cap-blue);
  margin: 0 auto;
}

#captcha-contable-wrapper .captcha-hint {
  font-size: 0.95rem;
  color: #455A64;
  line-height: 1.4;
  margin-bottom: 25px;
}

#captcha-contable-wrapper .captcha-hint strong {
  color: var(--cap-blue);
}

#captcha-contable-wrapper .captcha-track {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--cap-bg);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 2px solid #E0E0E0;
  position: relative;
}

#captcha-contable-wrapper .emoji-item {
  font-size: 2.5rem;
  cursor: grab;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
  z-index: 2;
  transition: transform 0.2s ease;
}

#captcha-contable-wrapper .emoji-item:active {
  cursor: grabbing;
  transform: scale(1.1);
}

#captcha-contable-wrapper .drop-target {
  width: 65px;
  height: 65px;
  border-radius: 12px;
  border: 2px dashed var(--cap-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: rgba(26, 35, 126, 0.05);
  transition: all 0.3s ease;
}

#captcha-contable-wrapper .drop-target.hovered {
  background: var(--cap-accent) !important;
  border-color: var(--cap-blue) !important;
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(251, 192, 45, 0.5);
}

#captcha-contable-wrapper .captcha-status {
  font-size: 0.85rem;
  font-weight: 600;
  color: #78909C;
  min-height: 20px;
}

#captcha-contable-wrapper .captcha-success {
  color: #2E7D32 !important;
  font-size: 1.1rem;
  font-weight: 700;
  margin-top: 14px;
  padding: 10px 14px;
  display: block;
  background: linear-gradient(135deg, rgba(67, 160, 71, 0.12), rgba(46, 125, 50, 0.08));
  border-radius: 10px;
  border: 2px solid rgba(67, 160, 71, 0.4);
  animation: captchaFadeIn 0.6s ease;
  text-align: center;
  letter-spacing: 0.3px;
  line-height: 1.5;
}

@keyframes captchaFadeIn {
  0% { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes captchaBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

#captcha-contable-wrapper .captcha-motivacion {
  color: var(--cap-blue) !important;
  font-size: 0.85rem;
  font-style: italic;
  font-weight: 500;
  margin-top: 10px;
  padding: 8px 12px;
  display: block;
  background: linear-gradient(135deg, rgba(26, 35, 126, 0.06), rgba(26, 35, 126, 0.03));
  border-radius: 8px;
  border-left: 3px solid var(--cap-blue);
  text-align: left;
  line-height: 1.5;
  animation: captchaFadeIn 1s ease 0.4s both;
}
`;

interface CaptchaContableProps {
  onVerified: () => void;
}

export default function CaptchaContable({ onVerified }: CaptchaContableProps) {
  const challenge = useMemo(() => getDailyChallenge(), []);
  const [status, setStatus] = useState("Estado: Esperando validacion...");
  const [verified, setVerified] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [itemVisible, setItemVisible] = useState(true);
  const [dropSuccess, setDropSuccess] = useState(false);
  const styleInjected = useRef(false);

  useEffect(() => {
    if (styleInjected.current) return;
    if (!document.getElementById(CAPTCHA_STYLE_ID)) {
      const style = document.createElement("style");
      style.id = CAPTCHA_STYLE_ID;
      style.textContent = captchaStyles;
      document.head.appendChild(style);
    }
    styleInjected.current = true;
  }, []);

  const hintText = useMemo(() => {
    return `Arrastra ${challenge.article} <strong>${challenge.dragName}</strong> ${challenge.dragEmoji} hasta su destino ${challenge.dropEmoji}`;
  }, [challenge]);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData("text", "valid");
    setDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setHovered(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setHovered(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text");
    if (data === "valid") {
      setHovered(false);
      setDragging(false);
      setDropSuccess(true);
      setStatus(`${challenge.successEmoji} ${challenge.successMessage}`);
      setVerified(true);
      setItemVisible(false);
      launchConfetti();
      playSuccessSound();
      onVerified();
    }
  }, [onVerified, challenge]);

  return (
    <div id="captcha-contable-wrapper" data-testid="captcha-wrapper">
      <div className="captcha-container" data-testid="captcha-container">
        <p
          className="captcha-hint"
          dangerouslySetInnerHTML={{ __html: hintText }}
          data-testid="captcha-text"
        />

        <div className="captcha-track">
          <div
            className="emoji-item"
            draggable={!verified}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={{
              opacity: dragging ? 0.5 : 1,
              display: itemVisible ? "block" : "none",
            }}
            data-testid="captcha-drag-item"
          >
            {challenge.dragEmoji}
          </div>
          <div
            className={`drop-target${hovered ? " hovered" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={dropSuccess ? {
              background: "var(--cap-success)",
              borderColor: "var(--cap-success)",
              color: "white",
            } : undefined}
            data-testid="captcha-drop-zone"
          >
            {dropSuccess ? challenge.dropEmoji : "?"}
          </div>
        </div>

        <p
          className={verified ? "captcha-success" : "captcha-status"}
          data-testid="captcha-status"
        >
          {status}
        </p>

        {verified && (
          <p
            className="captcha-motivacion"
            data-testid="captcha-motivacion"
          >
            {getFraseDelDia()}
          </p>
        )}
      </div>
    </div>
  );
}
```

---

## ARCHIVO 2: captcha-misiones.ts (REEMPLAZAR contenido por temas contables)

**IMPORTANTE: Debes generar 365 retos con temas contables colombianos. Abajo van los primeros 10 como ejemplo del formato. Genera los 365 completos.**

```ts
export interface DailyChallenge {
  dragEmoji: string;
  dropEmoji: string;
  dragName: string;
  article: string;
  successEmoji: string;
  successMessage: string;
}

export const ALL_CHALLENGES: DailyChallenge[] = [
  { dragEmoji: "🧾", dropEmoji: "📊", dragName: "Factura Electrónica", article: "la", successEmoji: "✅", successMessage: "Factura validada por DIAN!" },
  { dragEmoji: "📒", dropEmoji: "📚", dragName: "Libro Diario", article: "el", successEmoji: "📖", successMessage: "Asiento contable registrado!" },
  { dragEmoji: "💰", dropEmoji: "🏦", dragName: "Conciliación Bancaria", article: "la", successEmoji: "✅", successMessage: "Banco conciliado!" },
  { dragEmoji: "📋", dropEmoji: "🏛️", dragName: "Declaración de Renta", article: "la", successEmoji: "⚖️", successMessage: "Declaración presentada!" },
  { dragEmoji: "🧮", dropEmoji: "📊", dragName: "Balance General", article: "el", successEmoji: "📈", successMessage: "Balance cuadrado!" },
  { dragEmoji: "💳", dropEmoji: "📝", dragName: "Retención en la Fuente", article: "la", successEmoji: "🏛️", successMessage: "Retención aplicada!" },
  { dragEmoji: "📄", dropEmoji: "🗂️", dragName: "Nota Crédito", article: "la", successEmoji: "✅", successMessage: "Nota crédito emitida!" },
  { dragEmoji: "🏢", dropEmoji: "📊", dragName: "Estados Financieros", article: "los", successEmoji: "📈", successMessage: "EEFF presentados!" },
  { dragEmoji: "💵", dropEmoji: "📋", dragName: "Nómina Electrónica", article: "la", successEmoji: "👥", successMessage: "Nómina transmitida!" },
  { dragEmoji: "📊", dropEmoji: "🏛️", dragName: "Información Exógena", article: "la", successEmoji: "📡", successMessage: "Medios magnéticos enviados!" },
  // ... GENERA LOS 355 RESTANTES con temas como:
  // PUC, NIIF, IVA, ICA, Impuesto al consumo, Cuentas por cobrar,
  // Cuentas por pagar, Activos fijos, Depreciación, Amortización,
  // Provisiones, Comprobantes de egreso, Recibos de caja, Notas débito,
  // Ajustes contables, Cierre contable, SuperSociedades, Libros oficiales,
  // Certificados de retención, Flujo de caja, Estado de resultados,
  // Causaciones, Anticipos, Caja menor, Inventarios, Kardex,
  // Costos de producción, Punto de equilibrio, Presupuesto, Auditoría,
  // DIAN, RUT, NIT, Cámara de Comercio, Registro mercantil, etc.
];
```

---

## ARCHIVO 3: captcha-motivacion.ts (REEMPLAZAR contenido por frases contables)

**IMPORTANTE: Debes generar 365 frases motivacionales para contadores y profesionales financieros. Abajo van las primeras 10 como ejemplo. Genera las 365 completas.**

```ts
export const FRASES_MOTIVACIONALES: string[] = [
  "Las cuentas claras hacen empresas exitosas.",
  "Un buen contador es el guardian de la empresa.",
  "La contabilidad es el idioma de los negocios.",
  "Cada asiento contable cuenta una historia de tu empresa.",
  "Un balance cuadrado es la mejor recompensa del dia.",
  "La precision en los numeros refleja la excelencia profesional.",
  "Detras de cada estado financiero hay un contador comprometido.",
  "Las NIIF no son solo normas, son el lenguaje global de los negocios.",
  "Un cierre contable exitoso es fruto de la disciplina diaria.",
  "La transparencia financiera construye confianza empresarial.",
  // ... GENERA LAS 355 RESTANTES
];

export function getFraseDelDia(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return FRASES_MOTIVACIONALES[dayOfYear % FRASES_MOTIVACIONALES.length];
}
```

---

## Resumen

| Archivo | Accion |
|---------|--------|
| `CaptchaContable.tsx` | Copiar tal cual, solo cambiar nombre del componente y colores si quieres |
| `captcha-misiones.ts` | Generar 365 retos con temas contables colombianos |
| `captcha-motivacion.ts` | Generar 365 frases motivacionales para contadores |
| `canvas-confetti` | Instalar con `npm install canvas-confetti` |

El CAPTCHA rota automaticamente cada dia del año usando el dia del año como indice.

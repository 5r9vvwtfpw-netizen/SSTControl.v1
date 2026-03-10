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

const CAPTCHA_STYLE_ID = "captcha-sst-styles";

const captchaStyles = `
#captcha-sst-wrapper {
  --sst-cap-blue: #1A237E;
  --sst-cap-accent: #FBC02D;
  --sst-cap-success: #43A047;
  --sst-cap-bg: #F0F2F5;
}

#captcha-sst-wrapper .captcha-container {
  font-family: 'Inter', -apple-system, sans-serif;
  background: #ffffff;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(26, 35, 126, 0.1);
  max-width: 380px;
  text-align: center;
  border-top: 5px solid var(--sst-cap-blue);
  margin: 0 auto;
}

#captcha-sst-wrapper .captcha-hint {
  font-size: 0.95rem;
  color: #455A64;
  line-height: 1.4;
  margin-bottom: 25px;
}

#captcha-sst-wrapper .captcha-hint strong {
  color: var(--sst-cap-blue);
}

#captcha-sst-wrapper .captcha-track {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--sst-cap-bg);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 2px solid #E0E0E0;
  position: relative;
}

#captcha-sst-wrapper .emoji-item {
  font-size: 2.5rem;
  cursor: grab;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
  z-index: 2;
  transition: transform 0.2s ease;
}

#captcha-sst-wrapper .emoji-item:active {
  cursor: grabbing;
  transform: scale(1.1);
}

#captcha-sst-wrapper .drop-target {
  width: 65px;
  height: 65px;
  border-radius: 12px;
  border: 2px dashed var(--sst-cap-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: rgba(26, 35, 126, 0.05);
  transition: all 0.3s ease;
}

#captcha-sst-wrapper .drop-target.hovered {
  background: var(--sst-cap-accent) !important;
  border-color: var(--sst-cap-blue) !important;
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(251, 192, 45, 0.5);
}

#captcha-sst-wrapper .captcha-status {
  font-size: 0.85rem;
  font-weight: 600;
  color: #78909C;
  min-height: 20px;
}

#captcha-sst-wrapper .captcha-success {
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

#captcha-sst-wrapper .captcha-motivacion {
  color: var(--sst-cap-blue) !important;
  font-size: 0.85rem;
  font-style: italic;
  font-weight: 500;
  margin-top: 10px;
  padding: 8px 12px;
  display: block;
  background: linear-gradient(135deg, rgba(26, 35, 126, 0.06), rgba(26, 35, 126, 0.03));
  border-radius: 8px;
  border-left: 3px solid var(--sst-cap-blue);
  text-align: left;
  line-height: 1.5;
  animation: captchaFadeIn 1s ease 0.4s both;
}
`;

interface CaptchaSSTProps {
  onVerified: () => void;
}

export default function CaptchaSST({ onVerified }: CaptchaSSTProps) {
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
    return `Arrastra el <strong>${challenge.dragName}</strong> ${challenge.dragEmoji} hasta su destino ${challenge.dropEmoji}`;
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
    <div id="captcha-sst-wrapper" data-testid="captcha-wrapper">
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
              background: "var(--sst-cap-success)",
              borderColor: "var(--sst-cap-success)",
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

import { useState, useCallback, useMemo } from "react";

interface DailyChallenge {
  dragEmoji: string;
  dropEmoji: string;
  dragName: string;
  successEmoji: string;
  successMessage: string;
}

function getDailyChallenge(): DailyChallenge {
  const day = new Date().getDay();
  const challenges: Record<number, DailyChallenge> = {
    1: {
      dragEmoji: "⛑️",
      dropEmoji: "👷",
      dragName: "Casco de Seguridad",
      successEmoji: "👷‍♂️",
      successMessage: "EPP listo. A trabajar seguro!",
    },
    2: {
      dragEmoji: "🍎",
      dropEmoji: "❤️",
      dragName: "Manzana Saludable",
      successEmoji: "💪",
      successMessage: "Salud ocupacional al dia!",
    },
    3: {
      dragEmoji: "🧯",
      dropEmoji: "🔥",
      dragName: "Extintor",
      successEmoji: "✅",
      successMessage: "Emergencia controlada!",
    },
    4: {
      dragEmoji: "📋",
      dropEmoji: "🎓",
      dragName: "Plan de Capacitacion",
      successEmoji: "🏆",
      successMessage: "Capacitacion registrada!",
    },
    5: {
      dragEmoji: "🛡️",
      dropEmoji: "⚠️",
      dragName: "Escudo de Prevencion",
      successEmoji: "🦺",
      successMessage: "Riesgos bajo control!",
    },
    6: {
      dragEmoji: "📊",
      dropEmoji: "📈",
      dragName: "Informe de Gestion",
      successEmoji: "💯",
      successMessage: "Indicadores al dia!",
    },
    0: {
      dragEmoji: "🚗",
      dropEmoji: "🛣️",
      dragName: "Vehiculo Seguro",
      successEmoji: "🏁",
      successMessage: "PESV: Seguridad vial activa!",
    },
  };
  return challenges[day];
}

const captchaStyles = `
:root {
  --sst-blue: #1A237E;
  --sst-accent: #FBC02D;
  --sst-success: #43A047;
  --bg-soft: #F0F2F5;
}

.captcha-container {
  font-family: 'Inter', -apple-system, sans-serif;
  background: #ffffff;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(26, 35, 126, 0.1);
  max-width: 380px;
  text-align: center;
  border-top: 5px solid var(--sst-blue);
  margin: 0 auto;
}

.captcha-hint {
  font-size: 0.95rem;
  color: #455A64;
  line-height: 1.4;
  margin-bottom: 25px;
}

.captcha-hint strong {
  color: var(--sst-blue);
}

.captcha-track {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-soft);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 2px solid #E0E0E0;
  position: relative;
  overflow: hidden;
}

.emoji-item {
  font-size: 2.5rem;
  cursor: grab;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
  z-index: 2;
  transition: transform 0.2s ease;
}

.emoji-item:active {
  cursor: grabbing;
  transform: scale(1.1);
}

.drop-target {
  width: 65px;
  height: 65px;
  border-radius: 12px;
  border: 2px dashed var(--sst-blue);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: rgba(26, 35, 126, 0.05);
  transition: all 0.3s ease;
}

.drop-target.hovered {
  background: var(--sst-accent);
  border-style: solid;
  transform: scale(1.05);
}

#captcha-status {
  font-size: 0.85rem;
  font-weight: 600;
  color: #78909C;
  min-height: 20px;
}

.success-message {
  color: var(--sst-success) !important;
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
`;

interface CaptchaSSTProps {
  onVerified: () => void;
}

export default function CaptchaSST({ onVerified }: CaptchaSSTProps) {
  const challenge = useMemo(() => getDailyChallenge(), []);
  const [status, setStatus] = useState("Estado: Esperando seguridad...");
  const [verified, setVerified] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [itemVisible, setItemVisible] = useState(true);
  const [dropContent, setDropContent] = useState(challenge.dropEmoji);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData("text", "secured");
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
    setHovered(false);
    setStatus(`✅ ${challenge.successMessage}`);
    setVerified(true);
    setDropContent(challenge.successEmoji);
    setItemVisible(false);
    onVerified();
  }, [onVerified, challenge]);

  return (
    <>
      <style>{captchaStyles}</style>
      <div className="captcha-container" data-testid="captcha-container">
        <p className="captcha-hint">
          ¡Hola! Para empezar bien, arrastra el <strong>{challenge.dragName}</strong> a su destino.
        </p>

        <div className="captcha-track">
          {itemVisible && (
            <div
              id="drag-item"
              className="emoji-item"
              draggable="true"
              onDragStart={handleDragStart}
              data-testid="captcha-drag-item"
            >
              {challenge.dragEmoji}
            </div>
          )}
          <div
            id="drop-zone"
            className={`drop-target${hovered ? " hovered" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            data-testid="captcha-drop-zone"
          >
            {dropContent}
          </div>
        </div>

        <p
          id="captcha-status"
          className={verified ? "success-message" : ""}
          data-testid="captcha-status"
        >
          {status}
        </p>
      </div>
    </>
  );
}

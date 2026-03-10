import { useState } from "react";

interface CaptchaSSTProps {
  onVerified: () => void;
}

export default function CaptchaSST({ onVerified }: CaptchaSSTProps) {
  const [status, setStatus] = useState("Estado: Esperando seguridad...");
  const [verified, setVerified] = useState(false);

  return (
    <div className="captcha-container" data-testid="captcha-container">
      <p className="captcha-hint">
        ¡Hola! Para empezar bien, arrastra el <strong>Casco de Seguridad</strong> al círculo.
      </p>

      <div className="captcha-track">
        <div
          id="drag-item"
          className="emoji-item"
          draggable="true"
          data-testid="captcha-drag-item"
        >
          🦺
        </div>
        <div
          id="drop-zone"
          className="drop-target"
          data-testid="captcha-drop-zone"
        >
          🎯
        </div>
      </div>

      <p id="captcha-status" data-testid="captcha-status">{status}</p>
    </div>
  );
}

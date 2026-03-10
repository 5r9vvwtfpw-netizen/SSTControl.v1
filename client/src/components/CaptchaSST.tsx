import { useState } from "react";

const captchaStyles = `
.captcha-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  max-width: 350px;
  text-align: center;
  border: 1px solid #e0e0e0;
  margin: 0 auto;
}

.captcha-hint {
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 20px;
}

.captcha-track {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f4f7f6;
  padding: 15px;
  border-radius: 50px;
  margin-bottom: 15px;
  border: 2px dashed #ccc;
}

.emoji-item {
  font-size: 2rem;
  cursor: grab;
  transition: transform 0.2s;
}

.emoji-item:active {
  transform: scale(1.2);
}

.drop-target {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #0056b3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  background: white;
  transition: all 0.3s ease;
}

.drop-target.hovered {
  background: #e3f2fd;
  border-style: solid;
}

#captcha-status {
  font-size: 0.8rem;
  font-weight: bold;
  color: #666;
}
`;

interface CaptchaSSTProps {
  onVerified: () => void;
}

export default function CaptchaSST({ onVerified }: CaptchaSSTProps) {
  const [status, setStatus] = useState("Estado: Esperando seguridad...");
  const [verified, setVerified] = useState(false);

  return (
    <>
      <style>{captchaStyles}</style>
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
    </>
  );
}

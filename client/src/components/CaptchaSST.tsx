import { useState, useCallback, useMemo } from "react";

interface DailyChallenge {
  dragEmoji: string;
  dropEmoji: string;
  dragName: string;
  successEmoji: string;
  successMessage: string;
}

const ALL_CHALLENGES: DailyChallenge[] = [
  { dragEmoji: "⛑️", dropEmoji: "👷", dragName: "Casco de Seguridad", successEmoji: "👷‍♂️", successMessage: "EPP listo. A trabajar seguro!" },
  { dragEmoji: "🍎", dropEmoji: "❤️", dragName: "Manzana Saludable", successEmoji: "💪", successMessage: "Salud ocupacional al dia!" },
  { dragEmoji: "🧯", dropEmoji: "🔥", dragName: "Extintor", successEmoji: "✅", successMessage: "Emergencia controlada!" },
  { dragEmoji: "📋", dropEmoji: "🎓", dragName: "Plan de Capacitacion", successEmoji: "🏆", successMessage: "Capacitacion registrada!" },
  { dragEmoji: "🛡️", dropEmoji: "⚠️", dragName: "Escudo de Prevencion", successEmoji: "🦺", successMessage: "Riesgos bajo control!" },
  { dragEmoji: "📊", dropEmoji: "📈", dragName: "Informe de Gestion", successEmoji: "💯", successMessage: "Indicadores al dia!" },
  { dragEmoji: "🚗", dropEmoji: "🛣️", dragName: "Vehiculo Seguro", successEmoji: "🏁", successMessage: "PESV: Seguridad vial activa!" },
  { dragEmoji: "🥾", dropEmoji: "🦶", dragName: "Bota de Seguridad", successEmoji: "🚶", successMessage: "Pisando firme y seguro!" },
  { dragEmoji: "🧤", dropEmoji: "🤚", dragName: "Guantes de Proteccion", successEmoji: "👐", successMessage: "Manos protegidas!" },
  { dragEmoji: "🥽", dropEmoji: "👀", dragName: "Gafas de Seguridad", successEmoji: "👓", successMessage: "Vision protegida!" },
  { dragEmoji: "🔔", dropEmoji: "📢", dragName: "Alarma de Emergencia", successEmoji: "🔊", successMessage: "Alerta activada!" },
  { dragEmoji: "💉", dropEmoji: "🏥", dragName: "Vacuna Ocupacional", successEmoji: "💊", successMessage: "Salud preventiva al dia!" },
  { dragEmoji: "🩺", dropEmoji: "👨‍⚕️", dragName: "Estetoscopio Medico", successEmoji: "🏥", successMessage: "Examen medico completado!" },
  { dragEmoji: "📝", dropEmoji: "📂", dragName: "Acta de Reunion", successEmoji: "✅", successMessage: "Acta del COPASST archivada!" },
  { dragEmoji: "🔧", dropEmoji: "⚙️", dragName: "Herramienta Segura", successEmoji: "🛠️", successMessage: "Mantenimiento preventivo OK!" },
  { dragEmoji: "🪜", dropEmoji: "🏗️", dragName: "Escalera Certificada", successEmoji: "🏢", successMessage: "Trabajo en alturas seguro!" },
  { dragEmoji: "🎒", dropEmoji: "🧰", dragName: "Kit de Emergencia", successEmoji: "🆘", successMessage: "Brigada preparada!" },
  { dragEmoji: "📖", dropEmoji: "👨‍🏫", dragName: "Manual de SST", successEmoji: "📚", successMessage: "Conocimiento es prevencion!" },
  { dragEmoji: "🔦", dropEmoji: "🌑", dragName: "Linterna de Emergencia", successEmoji: "💡", successMessage: "Ruta de evacuacion iluminada!" },
  { dragEmoji: "🪪", dropEmoji: "🏢", dragName: "Carnet de Seguridad", successEmoji: "🎫", successMessage: "Acceso autorizado!" },
  { dragEmoji: "🧹", dropEmoji: "🏭", dragName: "Limpieza Industrial", successEmoji: "✨", successMessage: "Orden y aseo impecable!" },
  { dragEmoji: "🗺️", dropEmoji: "🚪", dragName: "Plano de Evacuacion", successEmoji: "🏃", successMessage: "Ruta de evacuacion lista!" },
  { dragEmoji: "📻", dropEmoji: "🎙️", dragName: "Radio de Emergencia", successEmoji: "📡", successMessage: "Comunicacion de crisis activa!" },
  { dragEmoji: "🧲", dropEmoji: "⚡", dragName: "Proteccion Electrica", successEmoji: "🔌", successMessage: "Riesgo electrico controlado!" },
  { dragEmoji: "🌡️", dropEmoji: "🥵", dragName: "Monitor de Temperatura", successEmoji: "❄️", successMessage: "Estres termico bajo control!" },
  { dragEmoji: "🫁", dropEmoji: "😷", dragName: "Respirador N95", successEmoji: "🌬️", successMessage: "Aire limpio garantizado!" },
  { dragEmoji: "🎯", dropEmoji: "📌", dragName: "Meta de Seguridad", successEmoji: "🏅", successMessage: "Objetivo SST cumplido!" },
  { dragEmoji: "📐", dropEmoji: "🪑", dragName: "Evaluacion Ergonomica", successEmoji: "💺", successMessage: "Puesto de trabajo ajustado!" },
  { dragEmoji: "🔒", dropEmoji: "🚧", dragName: "Candado de Bloqueo", successEmoji: "🔐", successMessage: "LOTO aplicado correctamente!" },
  { dragEmoji: "🩹", dropEmoji: "🤕", dragName: "Botiquin de Primeros Auxilios", successEmoji: "🏥", successMessage: "Primeros auxilios listos!" },
  { dragEmoji: "📣", dropEmoji: "👥", dragName: "Charla de Seguridad", successEmoji: "🗣️", successMessage: "Charla de 5 minutos completada!" },
  { dragEmoji: "🪧", dropEmoji: "🚫", dragName: "Senal de Prohibicion", successEmoji: "🚷", successMessage: "Zona restringida senalizada!" },
  { dragEmoji: "🔬", dropEmoji: "🧪", dragName: "Muestra de Laboratorio", successEmoji: "🧫", successMessage: "Monitoreo ambiental OK!" },
  { dragEmoji: "🎓", dropEmoji: "📜", dragName: "Certificacion SST", successEmoji: "🏆", successMessage: "Profesional certificado!" },
  { dragEmoji: "🚑", dropEmoji: "🏨", dragName: "Ambulancia", successEmoji: "⛑️", successMessage: "Plan de emergencia activo!" },
  { dragEmoji: "🗂️", dropEmoji: "🗄️", dragName: "Expediente del Trabajador", successEmoji: "📁", successMessage: "Documentacion completa!" },
  { dragEmoji: "📅", dropEmoji: "✏️", dragName: "Cronograma de Actividades", successEmoji: "📆", successMessage: "Plan anual actualizado!" },
  { dragEmoji: "🔊", dropEmoji: "👂", dragName: "Proteccion Auditiva", successEmoji: "🎧", successMessage: "Audiometria al dia!" },
  { dragEmoji: "🧴", dropEmoji: "☀️", dragName: "Protector Solar", successEmoji: "🌤️", successMessage: "Piel protegida del sol!" },
  { dragEmoji: "💧", dropEmoji: "🚰", dragName: "Agua Potable", successEmoji: "🥤", successMessage: "Hidratacion garantizada!" },
  { dragEmoji: "🪣", dropEmoji: "☣️", dragName: "Kit Antiderrames", successEmoji: "🧽", successMessage: "Derrame contenido!" },
  { dragEmoji: "📷", dropEmoji: "🔍", dragName: "Inspeccion Fotografica", successEmoji: "📸", successMessage: "Evidencia registrada!" },
  { dragEmoji: "🧯", dropEmoji: "🏢", dragName: "Recarga del Extintor", successEmoji: "✅", successMessage: "Extintor vigente!" },
  { dragEmoji: "🪖", dropEmoji: "🏗️", dragName: "Casco para Alturas", successEmoji: "⛑️", successMessage: "Trabajo en alturas aprobado!" },
  { dragEmoji: "📱", dropEmoji: "🆘", dragName: "App de Emergencia", successEmoji: "📲", successMessage: "Reporte inmediato enviado!" },
  { dragEmoji: "🧪", dropEmoji: "💨", dragName: "Medicion de Gases", successEmoji: "🌿", successMessage: "Atmosfera segura!" },
  { dragEmoji: "🪢", dropEmoji: "🧗", dragName: "Arnes de Seguridad", successEmoji: "🦺", successMessage: "Anclaje verificado!" },
  { dragEmoji: "🔋", dropEmoji: "💡", dragName: "Luz de Emergencia", successEmoji: "🔦", successMessage: "Iluminacion de respaldo OK!" },
  { dragEmoji: "🗓️", dropEmoji: "🩺", dragName: "Cita Medica Ocupacional", successEmoji: "👨‍⚕️", successMessage: "Control medico programado!" },
  { dragEmoji: "🚿", dropEmoji: "👁️", dragName: "Ducha Lavaojos", successEmoji: "💧", successMessage: "Estacion de emergencia lista!" },
  { dragEmoji: "📦", dropEmoji: "🏷️", dragName: "Etiqueta SGA", successEmoji: "⚗️", successMessage: "Quimico identificado!" },
  { dragEmoji: "🚜", dropEmoji: "🅿️", dragName: "Vehiculo Industrial", successEmoji: "🏁", successMessage: "Operador certificado!" },
];

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

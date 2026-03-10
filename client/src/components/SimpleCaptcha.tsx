import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCw, ShieldCheck } from "lucide-react";

interface SimpleCaptchaProps {
  onVerified: (token: string, answer: number) => void;
  onReset: () => void;
  variant?: "default" | "blue";
}

export default function SimpleCaptcha({ onVerified, onReset, variant = "default" }: SimpleCaptchaProps) {
  const [question, setQuestion] = useState("");
  const [token, setToken] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchChallenge = useCallback(async () => {
    setIsLoading(true);
    setAnswer("");
    onReset();
    try {
      const res = await fetch("/api/captcha");
      if (res.ok) {
        const data = await res.json();
        setQuestion(data.question);
        setToken(data.token);
      }
    } catch (err) {
      setQuestion("Error al cargar");
    } finally {
      setIsLoading(false);
    }
  }, [onReset]);

  useEffect(() => {
    fetchChallenge();
  }, []);

  const handleAnswerChange = (value: string) => {
    setAnswer(value);
    const num = parseInt(value, 10);
    if (!isNaN(num) && value.trim() !== "") {
      onVerified(token, num);
    } else {
      onReset();
    }
  };

  const iconColor = variant === "blue" ? "text-blue-600" : "text-primary";
  const questionBg = variant === "blue" 
    ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800" 
    : "bg-primary/5 border-primary/20";

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5 text-sm">
        <ShieldCheck className={`h-4 w-4 ${iconColor}`} />
        Verificación de seguridad
      </Label>
      <div className={`flex items-center gap-3 p-3 rounded-md border ${questionBg}`}>
        <span className="font-mono font-bold text-lg select-none flex-shrink-0" data-testid="text-captcha-question">
          {isLoading ? "..." : question}
        </span>
        <Input
          type="number"
          placeholder="?"
          value={answer}
          onChange={(e) => handleAnswerChange(e.target.value)}
          className="w-20 text-center font-mono font-bold"
          data-testid="input-captcha-answer"
          disabled={isLoading}
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={fetchChallenge}
          disabled={isLoading}
          data-testid="button-captcha-refresh"
          aria-label="Nueva pregunta"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </div>
  );
}

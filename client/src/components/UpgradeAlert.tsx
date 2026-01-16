import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, TrendingUp, Crown, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

type UpgradeAlertProps = {
  feature: string;
  description?: string;
  requiredPlan: "profesional" | "empresarial" | "corporativo";
  variant?: "inline" | "banner" | "card";
  className?: string;
};

const planInfo = {
  profesional: {
    displayName: "Plan Profesional",
    icon: Sparkles,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-900",
  },
  empresarial: {
    displayName: "Plan Empresarial",
    icon: TrendingUp,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    borderColor: "border-purple-200 dark:border-purple-900",
  },
  corporativo: {
    displayName: "Plan Corporativo",
    icon: Crown,
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    borderColor: "border-amber-200 dark:border-amber-900",
  },
};

export default function UpgradeAlert({
  feature,
  description,
  requiredPlan,
  variant = "banner",
  className = "",
}: UpgradeAlertProps) {
  const [, navigate] = useLocation();
  const planDetails = planInfo[requiredPlan];
  const Icon = planDetails.icon;

  if (variant === "inline") {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <Badge variant="secondary" className="gap-1">
          <Lock className="h-3 w-3" />
          {feature}
        </Badge>
        <Button
          variant="link"
          size="sm"
          onClick={() => navigate("/mi-cuenta")}
          className="h-auto p-0 text-sm"
          data-testid="button-upgrade-inline"
        >
          Actualizar a {planDetails.displayName}
        </Button>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg ${planDetails.bgColor} ${planDetails.borderColor} ${className}`}
        data-testid="alert-upgrade-card"
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-background mb-4">
          <Lock className={`h-8 w-8 ${planDetails.color}`} />
        </div>
        <h3 className="text-lg font-semibold mb-2">{feature}</h3>
        {description && (
          <p className="text-sm text-muted-foreground text-center mb-4 max-w-md">
            {description}
          </p>
        )}
        <div className="flex items-center gap-2 mb-4">
          <Icon className={`h-4 w-4 ${planDetails.color}`} />
          <span className="text-sm font-medium">
            Disponible en {planDetails.displayName}
          </span>
        </div>
        <Button onClick={() => navigate("/mi-cuenta")} data-testid="button-upgrade-card">
          <TrendingUp className="h-4 w-4 mr-2" />
          Ver planes y actualizar
        </Button>
      </div>
    );
  }

  // Default: banner variant
  return (
    <Alert className={`${planDetails.bgColor} ${planDetails.borderColor} border-2 ${className}`} data-testid="alert-upgrade-banner">
      <Lock className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        {feature}
        <Badge variant="outline" className="ml-auto">
          <Icon className="h-3 w-3 mr-1" />
          {planDetails.displayName}
        </Badge>
      </AlertTitle>
      <AlertDescription className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {description || `Esta funcionalidad requiere ${planDetails.displayName} o superior.`}
        </div>
        <Button
          size="sm"
          onClick={() => navigate("/mi-cuenta")}
          data-testid="button-upgrade-banner"
        >
          <TrendingUp className="h-3 w-3 mr-2" />
          Actualizar plan
        </Button>
      </AlertDescription>
    </Alert>
  );
}

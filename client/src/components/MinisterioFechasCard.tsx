import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle, Bell, Building2, Users, Clock, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FechaInforme {
  fecha: string;
  titulo: string;
  descripcion: string;
  aplica: string;
  icono: typeof Calendar;
  urgente?: boolean;
}

const fechasMinisterio: FechaInforme[] = [
  {
    fecha: "3 Feb - 28 Mar",
    titulo: "Autoevaluación Estándares Mínimos SG-SST",
    descripcion: "Reporte anual obligatorio en plataforma SGRL del Ministerio de Trabajo (Circular 009/2025)",
    aplica: "Todas las empresas",
    icono: Calendar,
    urgente: true
  },
  {
    fecha: "Diciembre",
    titulo: "Autoevaluación Interna SG-SST",
    descripcion: "Aplicar autoevaluación conforme a Tabla de Valores (Art. 27 Res. 0312/2019)",
    aplica: "Todas las empresas",
    icono: Clock,
    urgente: false
  },
  {
    fecha: "Diciembre",
    titulo: "Plan de Mejoramiento y Plan Anual",
    descripcion: "Elaborar plan de mejora y formular Plan Anual SG-SST para el año siguiente",
    aplica: "Todas las empresas",
    icono: AlertCircle,
    urgente: false
  },
  {
    fecha: "Julio",
    titulo: "Seguimiento Plan de Mejora a ARL",
    descripcion: "Informe de avances del plan de mejoramiento incluyendo recomendaciones de la ARL",
    aplica: "Todas las empresas",
    icono: Building2,
    urgente: true
  },
  {
    fecha: "Mensual",
    titulo: "PILA - Planilla Integrada",
    descripcion: "Pago de aportes a seguridad social incluyendo ARL",
    aplica: "Todas las empresas",
    icono: Users,
    urgente: false
  },
  {
    fecha: "Según resultado",
    titulo: "Plan de Mejora (Crítico <60%)",
    descripcion: "Si el puntaje es crítico (<60%), enviar plan de mejora inmediato - plazo máximo 3 meses",
    aplica: "Empresas con resultado crítico",
    icono: AlertCircle,
    urgente: true
  },
  {
    fecha: "Según resultado",
    titulo: "Plan de Mejora (Moderado 60-85%)",
    descripcion: "Si el puntaje es moderado (60-85%), enviar plan de mejora - plazo máximo 6 meses",
    aplica: "Empresas con resultado moderado",
    icono: Clock,
    urgente: false
  }
];

// Función para verificar si estamos dentro del periodo de alerta
function getActiveAlerts(): FechaInforme[] {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const day = now.getDate();
  
  const activeAlerts: FechaInforme[] = [];
  
  // Verificar cada fecha
  fechasMinisterio.forEach(fecha => {
    let isActive = false;
    
    // 3 Feb - 28 Mar (Enero para recordatorio anticipado, Feb-Mar para periodo activo)
    if (fecha.fecha === "3 Feb - 28 Mar") {
      if ((month === 0 && day >= 15) || month === 1 || (month === 2 && day <= 28)) {
        isActive = true;
      }
    }
    
    // Diciembre (Noviembre para recordatorio anticipado)
    if (fecha.fecha === "Diciembre") {
      if (month === 10 || month === 11) { // Noviembre o Diciembre
        isActive = true;
      }
    }
    
    // Julio (Junio para recordatorio anticipado)
    if (fecha.fecha === "Julio") {
      if (month === 5 || month === 6) { // Junio o Julio
        isActive = true;
      }
    }
    
    if (isActive) {
      activeAlerts.push(fecha);
    }
  });
  
  return activeAlerts;
}

// Componente de Alerta Emergente
export function ComplianceAlertPopup() {
  const [open, setOpen] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState<FechaInforme[]>([]);
  const [dismissed, setDismissed] = useState(false);
  
  useEffect(() => {
    // Verificar si ya se descartó la alerta hoy
    const dismissedDate = localStorage.getItem('compliance_alert_dismissed');
    const today = new Date().toDateString();
    
    if (dismissedDate === today) {
      setDismissed(true);
      return;
    }
    
    const alerts = getActiveAlerts();
    if (alerts.length > 0 && !dismissed) {
      setActiveAlerts(alerts);
      setOpen(true);
    }
  }, [dismissed]);
  
  const handleDismiss = () => {
    setOpen(false);
    localStorage.setItem('compliance_alert_dismissed', new Date().toDateString());
    setDismissed(true);
  };
  
  if (activeAlerts.length === 0) return null;
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg" data-testid="dialog-compliance-alert">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-xl text-amber-700 dark:text-amber-400">
                ¡Alerta de Cumplimiento!
              </DialogTitle>
              <DialogDescription>
                Tienes fechas límite próximas del Ministerio de Trabajo
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-3 my-4">
          {activeAlerts.map((alert, index) => {
            const Icon = alert.icono;
            return (
              <div 
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800"
                data-testid={`alert-item-${index}`}
              >
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="destructive" className="bg-amber-600">
                      {alert.fecha}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-300">
                    {alert.titulo}
                  </h4>
                  <p className="text-sm text-amber-700/80 dark:text-amber-400/70">
                    {alert.descripcion}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleDismiss} data-testid="button-dismiss-alert">
            Recordarme mañana
          </Button>
          <Button onClick={() => setOpen(false)} className="bg-amber-600 hover:bg-amber-700" data-testid="button-acknowledge-alert">
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MinisterioFechasCard({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent" data-testid="card-ministerio-fechas-compact">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Alertas de Cumplimiento</CardTitle>
              <CardDescription className="text-xs">
                Fechas clave del Ministerio de Trabajo
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {fechasMinisterio.slice(0, 4).map((fecha, index) => (
              <div 
                key={index}
                className="p-3 rounded-lg bg-background border text-center"
                data-testid={`fecha-compacta-${index}`}
              >
                <div className="text-sm font-semibold text-primary">{fecha.fecha}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">{fecha.titulo}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Recibe recordatorios automáticos antes de cada fecha límite
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20" data-testid="card-ministerio-fechas">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <Bell className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <Badge variant="secondary" className="mb-1">
              <Calendar className="w-3 h-3 mr-1" />
              Valor Agregado Exclusivo
            </Badge>
            <CardTitle className="text-xl">
              Calendario de Informes - Ministerio de Trabajo
            </CardTitle>
            <CardDescription>
              Nunca pierdas una fecha límite. Nuestro sistema te alerta automáticamente.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fechasMinisterio.map((fecha, index) => {
            const Icon = fecha.icono;
            return (
              <div 
                key={index}
                className={`flex items-start gap-4 p-4 rounded-lg border ${
                  fecha.urgente 
                    ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800' 
                    : 'bg-muted/30'
                }`}
                data-testid={`fecha-ministerio-${index}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  fecha.urgente 
                    ? 'bg-amber-100 dark:bg-amber-900/30' 
                    : 'bg-primary/10'
                }`}>
                  <Icon className={`w-5 h-5 ${fecha.urgente ? 'text-amber-600' : 'text-primary'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`font-semibold ${fecha.urgente ? 'text-amber-700 dark:text-amber-400' : 'text-foreground'}`}>
                      {fecha.fecha}
                    </span>
                    {fecha.urgente && (
                      <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700">
                        Todas las empresas
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-medium text-foreground">{fecha.titulo}</h4>
                  <p className="text-sm text-muted-foreground">{fecha.descripcion}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{fecha.aplica}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold text-green-800 dark:text-green-300 text-sm">
                Sistema de Alertas Automáticas
              </h4>
              <p className="text-sm text-green-700 dark:text-green-400/80">
                Recibe notificaciones por correo electrónico 30, 15 y 7 días antes de cada fecha límite. 
                Genera automáticamente los informes requeridos con un solo clic.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MinisterioFechasBanner() {
  return (
    <div 
      className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-200/50 dark:border-amber-800/50 rounded-lg p-4"
      data-testid="banner-ministerio-fechas"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
          <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-amber-800 dark:text-amber-300 text-sm">
            Fechas clave SG-SST - Circular 009/2025
          </p>
          <p className="text-xs text-amber-700/80 dark:text-amber-400/70">
            Alertas automáticas incluidas en todos nuestros planes
          </p>
        </div>
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400">
          Incluido
        </Badge>
      </div>
    </div>
  );
}

export default MinisterioFechasCard;

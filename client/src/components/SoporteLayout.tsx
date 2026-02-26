import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Headset, LogOut, Ticket, Key } from "lucide-react";
import { Link, Redirect, useLocation } from "wouter";
import { NotificationBell } from "@/components/NotificationBell";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function SoporteLayout({ children }: { children: React.ReactNode }) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await apiRequest("POST", "/api/change-password", data);
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Error al cambiar la contraseña");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Contraseña actualizada", description: "Su contraseña ha sido cambiada exitosamente." });
      setShowPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (!user) {
    return <Redirect to="/soporte/login" />;
  }

  if (user.role !== "soporte" && user.role !== "superadmin") {
    return <Redirect to="/" />;
  }

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "Error", description: "Todos los campos son requeridos", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Error", description: "La nueva contraseña debe tener al menos 8 caracteres", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas no coinciden", variant: "destructive" });
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/20">
                  <Headset className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Centro de Soporte</h1>
                  <p className="text-sm opacity-80">SST Colombia</p>
                </div>
              </div>
              
              <nav className="hidden md:flex items-center gap-2 ml-8">
                <Link href="/soporte/tickets">
                  <Button 
                    variant="ghost" 
                    className={`text-white ${location === '/soporte/tickets' ? 'bg-white/20' : ''}`}
                    data-testid="nav-soporte-tickets"
                  >
                    <Ticket className="h-4 w-4 mr-2" />
                    Tickets
                  </Button>
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <NotificationBell />
              <span className="text-sm hidden sm:inline-block">
                {user.fullName || user.username}
              </span>
              <Button
                variant="ghost"
                onClick={() => setShowPasswordDialog(true)}
                className="text-white"
                data-testid="button-soporte-change-password"
              >
                <Key className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Cambiar Contraseña</span>
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-white"
                data-testid="button-soporte-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-6">
        {children}
      </main>

      <footer className="bg-muted/50 border-t py-4">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          SST Colombia - Centro de Soporte Técnico
        </div>
      </footer>

      <Dialog open={showPasswordDialog} onOpenChange={(open) => {
        setShowPasswordDialog(open);
        if (!open) {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>
              Ingrese su contraseña actual y la nueva contraseña.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Contraseña Actual</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Ingrese su contraseña actual"
                data-testid="input-current-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva Contraseña</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                data-testid="input-new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita la nueva contraseña"
                data-testid="input-confirm-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
              data-testid="button-cancel-password"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={changePasswordMutation.isPending}
              data-testid="button-save-password"
            >
              {changePasswordMutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

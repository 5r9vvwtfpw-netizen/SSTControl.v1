import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Headset, LogOut, Ticket, Key } from "lucide-react";
import { Link, Redirect, useLocation } from "wouter";
import { ActiveAccessIndicator } from "@/components/SupportAccessRequestDialog";
import { NotificationBell } from "@/components/NotificationBell";

export default function SoporteLayout({ children }: { children: React.ReactNode }) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  if (!user) {
    return <Redirect to="/soporte/login" />;
  }

  if (user.role !== "soporte" && user.role !== "superadmin") {
    return <Redirect to="/" />;
  }

  const handleLogout = () => {
    logoutMutation.mutate();
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
                    className={`text-white hover:bg-white/20 ${location === '/soporte/tickets' ? 'bg-white/20' : ''}`}
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
              <ActiveAccessIndicator />
              <span className="text-sm hidden sm:inline-block">
                {user.fullName || user.username}
              </span>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-white hover:bg-white/20"
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
    </div>
  );
}

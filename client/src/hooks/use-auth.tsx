import { createContext, ReactNode, useContext, useEffect, useRef, useMemo } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { toast } from "@/hooks/use-toast";

const AUTH_CHANNEL_NAME = "sst-auth-channel";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, RegisterData>;
};

type LoginData = Pick<InsertUser, "username" | "password">;
type RegisterData = {
  username: string;
  password: string;
  fullName?: string;
  email: string;
  plan?: string;
  quoteToken?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const authChannelRef = useRef<BroadcastChannel | null>(null);
  const licenseAlertShownRef = useRef(false);
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  useEffect(() => {
    if (typeof BroadcastChannel !== "undefined") {
      authChannelRef.current = new BroadcastChannel(AUTH_CHANNEL_NAME);
      
      authChannelRef.current.onmessage = (event) => {
        if (event.data?.type === "LOGOUT") {
          queryClient.setQueryData(["/api/user"], null);
          window.location.href = "/login";
        }
      };
    }

    return () => {
      authChannelRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (!user?.sstLicenseExpiresAt || licenseAlertShownRef.current) return;
    
    const expiryDate = new Date(user.sstLicenseExpiresAt);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 0 && user.sstLicenseStatus === 'vigente') {
      licenseAlertShownRef.current = true;
      toast({
        title: "Licencia SST Vencida",
        description: "Su licencia SST ha vencido. Por favor renuévela para continuar gestionando programas de vigilancia epidemiológica.",
        variant: "destructive",
      });
    } else if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
      licenseAlertShownRef.current = true;
      toast({
        title: "Licencia SST por Vencer",
        description: `Su licencia SST vence en ${daysUntilExpiry} día${daysUntilExpiry !== 1 ? 's' : ''}. Recuerde renovarla para mantener sus credenciales vigentes.`,
        variant: "default",
      });
    }
  }, [user?.sstLicenseExpiresAt, user?.sstLicenseStatus]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        const error = new Error(data.error || "Error de inicio de sesión") as Error & { code?: string; canResend?: boolean; email?: string };
        (error as any).code = data.code;
        (error as any).canResend = data.canResend;
        (error as any).email = data.email;
        throw error;
      }
      return data;
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      let destination: string;
      
      if (user.role === "trabajador") {
        destination = "/portal-empleados";
      } else if (user.role === "superusuario" && !user.companyId) {
        destination = "/crear-empresa";
      } else {
        destination = "/dashboard";
      }
      
      window.location.href = destination;
    },
    onError: (error: Error & { code?: string; canResend?: boolean; email?: string }) => {
      if ((error as any).code === "EMAIL_NOT_VERIFIED") {
        toast({
          title: "Verificación de correo pendiente",
          description: error.message,
          variant: "destructive",
          duration: 10000,
        });
      } else {
        toast({
          title: "Error de inicio de sesión",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      const data = await res.json();
      // Pass through the full response including error codes
      if (!res.ok) {
        const error = new Error(data.error || "Error de registro") as Error & { code?: string; canLogin?: boolean; canResend?: boolean };
        (error as any).code = data.code;
        (error as any).canLogin = data.canLogin;
        (error as any).canResend = data.canResend;
        throw error;
      }
      return data;
    },
    onSuccess: (data: any) => {
      // No auto-login, user must login manually
      toast({
        title: "Registro exitoso",
        description: data.message || "Por favor inicie sesión con sus credenciales",
      });
    },
    onError: (error: Error & { code?: string; canLogin?: boolean; canResend?: boolean }) => {
      // Handle specific error codes with more helpful messages
      let title = "Error de registro";
      let description = error.message;
      
      if ((error as any).canLogin) {
        title = "Cuenta existente";
        description = `${error.message} Usa la pestaña "Iniciar Sesión".`;
      } else if ((error as any).canResend) {
        title = "Verificación pendiente";
      }
      
      toast({
        title,
        description,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      
      // Broadcast logout to all other tabs/windows
      if (authChannelRef.current) {
        authChannelRef.current.postMessage({ type: "LOGOUT" });
      }
      
      // Redirect to login page (without registration option)
      window.location.href = "/login";
    },
    onError: (error: Error) => {
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const contextValue = useMemo(() => ({
    user: user ?? null,
    isLoading,
    error,
    loginMutation,
    logoutMutation,
    registerMutation,
  }), [user, isLoading, error, loginMutation, logoutMutation, registerMutation]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

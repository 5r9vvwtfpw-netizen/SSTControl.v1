/**
 * Página de Invitación de Referidos - /recomendar
 * 
 * Permite a clientes actuales (Padrinos) invitar a otras empresas.
 * Recibe source_id y source_email como parámetros de URL para evitar login.
 * 
 * ARQUITECTURA SIDECAR: Página independiente para el plugin de referidos.
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Building2, Mail, User, Gift, CheckCircle2, ArrowLeft, Send, Users } from "lucide-react";

const inviteFormSchema = z.object({
  friendName: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  friendEmail: z.string().email("Email inválido"),
  friendCompany: z.string().optional(),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

export default function Recomendar() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [sourceData, setSourceData] = useState<{
    sourceId: string;
    sourceEmail: string;
    sourceName?: string;
    sourceCompany?: string;
  } | null>(null);
  const [sent, setSent] = useState(false);
  const [referralLink, setReferralLink] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sourceId = params.get("source_id") || params.get("sourceId");
    const sourceEmail = params.get("source_email") || params.get("sourceEmail");
    const sourceName = params.get("source_name") || params.get("sourceName");
    const sourceCompany = params.get("source_company") || params.get("sourceCompany");
    
    if (sourceId && sourceEmail) {
      setSourceData({
        sourceId,
        sourceEmail,
        sourceName: sourceName || undefined,
        sourceCompany: sourceCompany || undefined,
      });
    }
  }, []);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      friendName: "",
      friendEmail: "",
      friendCompany: "",
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: InviteFormValues) => {
      if (!sourceData) throw new Error("Datos de origen no disponibles");
      
      const response = await apiRequest("POST", "/api/plugins/promotions/invite", {
        sourceId: sourceData.sourceId,
        sourceEmail: sourceData.sourceEmail,
        sourceName: sourceData.sourceName,
        sourceCompany: sourceData.sourceCompany,
        ...data,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSent(true);
      setReferralLink(data.referralLink);
      toast({
        title: "¡Invitación enviada!",
        description: `Se ha enviado la invitación a ${form.getValues("friendEmail")}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la invitación",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InviteFormValues) => {
    inviteMutation.mutate(data);
  };

  const resetForm = () => {
    setSent(false);
    setReferralLink(null);
    form.reset();
  };

  if (!sourceData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <CardTitle>Acceso al Programa de Referidos</CardTitle>
            <CardDescription>
              Para invitar a otras empresas, necesitas acceder desde el enlace proporcionado 
              por SST-Colombia con tus datos de empresa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTitle>¿Cómo obtener el enlace?</AlertTitle>
              <AlertDescription>
                Si eres cliente de SST-Colombia, ingresa a tu cuenta y busca la sección 
                "Recomendar Empresa" en el menú principal para obtener tu enlace personalizado.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate("/login")}
              data-testid="button-go-login"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ir a Iniciar Sesión
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-green-700 dark:text-green-400">
              ¡Invitación Enviada!
            </CardTitle>
            <CardDescription>
              Se ha enviado un correo a <strong>{form.getValues("friendEmail")}</strong> 
              con la invitación y los beneficios del programa de referidos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
              <Gift className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-700 dark:text-blue-400">Beneficios del Programa</AlertTitle>
              <AlertDescription className="text-blue-600 dark:text-blue-300">
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Tu referido obtiene su <strong>segundo mes gratis</strong></li>
                  <li>Tú recibes un <strong>crédito equivalente</strong> a 1 mes de su plan</li>
                  <li>El crédito es válido por <strong>12 meses</strong></li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <p className="text-sm text-muted-foreground text-center">
              También se envió una copia del correo a <strong>{sourceData.sourceEmail}</strong>
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button 
              onClick={resetForm} 
              className="w-full"
              data-testid="button-invite-another"
            >
              <Send className="w-4 h-4 mr-2" />
              Invitar a Otra Empresa
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate("/")}
              data-testid="button-go-home"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Inicio
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
            <Gift className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle>Programa de Referidos SST-Colombia</CardTitle>
          <CardDescription>
            Invita a empresas a usar SST-Colombia y ambos obtienen beneficios
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800">
            <Gift className="w-4 h-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-700 dark:text-green-400">Beneficio Net-Zero Risk</AlertTitle>
            <AlertDescription className="text-green-600 dark:text-green-300">
              Tu referido obtiene su <strong>segundo mes gratis</strong>, y tú recibes un 
              <strong> crédito equivalente</strong> a 1 mes de su plan para aplicar en tus próximas facturas.
            </AlertDescription>
          </Alert>

          {sourceData.sourceName && (
            <div className="text-sm text-muted-foreground text-center pb-2 border-b">
              Enviando invitación como: <strong>{sourceData.sourceName}</strong>
              {sourceData.sourceCompany && <span> de {sourceData.sourceCompany}</span>}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="friendName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del contacto</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Juan Pérez" 
                          className="pl-9" 
                          data-testid="input-friend-name"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="friendEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email del contacto</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          type="email" 
                          placeholder="juan@empresa.com" 
                          className="pl-9" 
                          data-testid="input-friend-email"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="friendCompany"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la empresa (opcional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Empresa ABC S.A.S." 
                          className="pl-9" 
                          data-testid="input-friend-company"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={inviteMutation.isPending}
                data-testid="button-send-invitation"
              >
                {inviteMutation.isPending ? (
                  <>Enviando...</>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Invitación
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          <p>
            Se enviará una copia del correo a {sourceData.sourceEmail}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

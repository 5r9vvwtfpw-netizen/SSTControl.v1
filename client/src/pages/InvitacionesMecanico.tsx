import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type Invitation = {
  id: string;
  companyName: string;
  scope: string[];
  startDate: string;
  endDate: string | null;
  invitedAt: string;
};

const scopeLabels: Record<string, string> = { maintenance: "Mantenimientos", vehicles: "Vehículos", inspections: "Inspecciones" };

export default function InvitacionesMecanico() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: invitations = [], isLoading } = useQuery<Invitation[]>({ queryKey: ["/api/mechanic-access/invitations"] });
  const respond = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "accept" | "reject" }) =>
      apiRequest("POST", `/api/mechanic-access/${id}/${action}`, action === "reject" ? {} : undefined),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/mechanic-access/invitations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/mechanic-access/companies"] });
      toast({ title: variables.action === "accept" ? "Invitación aceptada" : "Invitación rechazada" });
    },
    onError: (error: Error) => toast({ title: "No se pudo responder la invitación", description: error.message, variant: "destructive" }),
  });

  if (user?.role !== "tecnico_mecanico") return <p className="p-6">Esta página es exclusiva para Técnicos Mecánicos.</p>;
  return <div className="mx-auto max-w-3xl space-y-6 p-6">
    <div><h1 className="text-3xl font-bold">Invitaciones de empresas</h1><p className="text-muted-foreground">Acepta únicamente los accesos operativos que reconoces.</p></div>
    {isLoading ? <p className="text-muted-foreground">Cargando invitaciones…</p> : invitations.length === 0 ? <Card><CardContent className="p-6 text-muted-foreground">No tienes invitaciones pendientes.</CardContent></Card> :
      invitations.map(invitation => <Card key={invitation.id} data-testid={`mechanic-invitation-${invitation.id}`}>
        <CardHeader><CardTitle className="flex items-center justify-between">{invitation.companyName}<Badge>Pendiente</Badge></CardTitle><CardDescription>Invitada el {new Date(invitation.invitedAt).toLocaleDateString()}</CardDescription></CardHeader>
        <CardContent className="space-y-4"><div className="text-sm"><p><b>Vigencia:</b> {invitation.startDate} {invitation.endDate ? `— ${invitation.endDate}` : "— sin vencimiento"}</p><p><b>Alcance:</b> {invitation.scope.map(scope => scopeLabels[scope] || scope).join(", ")}</p></div>
          <div className="flex gap-2"><Button onClick={() => respond.mutate({ id: invitation.id, action: "accept" })} disabled={respond.isPending} data-testid={`accept-mechanic-invitation-${invitation.id}`}>Aceptar</Button><Button variant="outline" onClick={() => respond.mutate({ id: invitation.id, action: "reject" })} disabled={respond.isPending}>Rechazar</Button></div>
        </CardContent>
      </Card>)}
  </div>;
}
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Briefcase, Calendar, Pencil, Trash2, UserPlus, Mail, FileText } from "lucide-react";

interface WorkerCardProps {
  id: string;
  name: string;
  position: string;
  department: string;
  contract: string;
  startDate: string;
  status: "activo" | "inactivo" | "retirado";
  email?: string;
  photoUrl?: string | null;
  hasUserAccount?: boolean;
  contractStatus?: "activo" | "vencido" | "sin_contrato";
  onEdit?: () => void;
  onDelete?: () => void;
  onCreatePortalAccess?: () => void;
}

export function WorkerCard({ id, name, position, department, contract, startDate, status, email, photoUrl, hasUserAccount, contractStatus, onEdit, onDelete, onCreatePortalAccess }: WorkerCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <Card data-testid={`card-worker-${id}`} className="hover-elevate">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Avatar>
            {photoUrl && (
              <AvatarImage 
                src={photoUrl} 
                alt={name}
                className="object-cover"
              />
            )}
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight" data-testid={`text-worker-name-${id}`}>{name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{position}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 flex-wrap">
            {onCreatePortalAccess && !hasUserAccount && email && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={onCreatePortalAccess}
                    data-testid={`button-create-portal-access-${id}`}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Crear acceso al portal</p>
                </TooltipContent>
              </Tooltip>
            )}
            {hasUserAccount && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-xs" data-testid={`badge-has-portal-${id}`}>
                    <Mail className="h-3 w-3 mr-1" />
                    Portal
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tiene acceso al portal de empleados</p>
                </TooltipContent>
              </Tooltip>
            )}
            {onEdit && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onEdit}
                data-testid={`button-edit-worker-${id}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onDelete}
                data-testid={`button-delete-worker-${id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Briefcase className="h-4 w-4 flex-shrink-0" />
          <span>{department}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span>Ingreso: {startDate}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Contrato: {contract}
        </div>
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <Badge variant={status === "activo" ? "default" : "secondary"} data-testid={`badge-status-${id}`}>
            {status === "activo" ? "Activo" : "Inactivo"}
          </Badge>
          {contractStatus && (
            <Badge 
              variant={contractStatus === "activo" ? "default" : contractStatus === "vencido" ? "outline" : "secondary"}
              className={
                contractStatus === "activo" 
                  ? "bg-green-600 text-white" 
                  : contractStatus === "vencido" 
                  ? "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700" 
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }
              data-testid={`badge-contract-status-${id}`}
            >
              <FileText className="h-3 w-3 mr-1" />
              {contractStatus === "activo" ? "Contrato" : contractStatus === "vencido" ? "Contrato Vencido" : "Sin Contrato"}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload, Trash2, Download, Loader2 } from "lucide-react";
import type { SstEvidence } from "@shared/schema";

interface EvidenceManagerProps {
  evaluationItemId: string;
  isAdmin: boolean;
}

export function EvidenceManager({ evaluationItemId, isAdmin }: EvidenceManagerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const { data: evidences, isLoading } = useQuery<SstEvidence[]>({
    queryKey: ['/api/sst-evaluation-items', evaluationItemId, 'evidence'],
    enabled: !!evaluationItemId,
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/sst-evidence/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/sst-evaluation-items', evaluationItemId, 'evidence'] 
      });
      setFile(null);
      setDescription("");
      toast({
        title: "Evidencia subida",
        description: "El archivo se ha subido correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al subir archivo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (evidenceId: string) => {
      return apiRequest("DELETE", `/api/sst-evidence/${evidenceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/sst-evaluation-items', evaluationItemId, 'evidence'] 
      });
      toast({
        title: "Evidencia eliminada",
        description: "El archivo se ha eliminado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar la evidencia",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast({
        title: "No hay archivo",
        description: "Por favor selecciona un archivo",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('evaluationItemId', evaluationItemId);
    if (description) {
      formData.append('description', description);
    }

    uploadMutation.mutate(formData);
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileText className="h-5 w-5" />;
    
    if (fileType.includes('image')) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="h-5 w-5 text-blue-600" />;
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return <FileText className="h-5 w-5 text-green-600" />;
    }
    return <FileText className="h-5 w-5" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subir Evidencia</CardTitle>
            <CardDescription>
              Formatos permitidos: JPG, PNG, PDF, DOC, DOCX, XLS, XLSX (máx. 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Archivo</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileChange}
                data-testid="input-evidence-file"
              />
              {file && (
                <p className="text-sm text-muted-foreground">
                  Archivo seleccionado: {file.name}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Describe el contenido de la evidencia"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                data-testid="input-evidence-description"
              />
            </div>

            <Button 
              onClick={handleUpload} 
              disabled={!file || uploadMutation.isPending}
              data-testid="button-upload-evidence"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Evidencia
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Evidencias ({evidences?.length || 0})</h3>
        
        {evidences && evidences.length > 0 ? (
          <div className="space-y-2">
            {evidences.map((evidence) => (
              <Card key={evidence.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 flex-1">
                    {getFileIcon(evidence.fileType)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" data-testid={`text-evidence-name-${evidence.id}`}>
                        {evidence.fileName}
                      </p>
                      {evidence.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {evidence.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(evidence.uploadDate).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      asChild
                      data-testid={`button-download-evidence-${evidence.id}`}
                    >
                      <a href={evidence.fileUrl} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    
                    {isAdmin && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(evidence.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-evidence-${evidence.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8" data-testid="text-no-evidence">
            No hay evidencias cargadas para este ítem
          </p>
        )}
      </div>
    </div>
  );
}

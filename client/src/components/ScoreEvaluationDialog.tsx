import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SstStandard, SstItem, SstEvaluationItem } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface ScoreEvaluationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluationId: string;
  standardType?: "RES_0312" | "ISO_45001";
}

export function ScoreEvaluationDialog({ open, onOpenChange, evaluationId, standardType }: ScoreEvaluationDialogProps) {
  const { toast } = useToast();
  const [scores, setScores] = useState<Record<string, { score: number; observations: string }>>({});

  const { data: standards = [] } = useQuery<SstStandard[]>({
    queryKey: ["/api/sst-standards", standardType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (standardType) {
        params.set('standardType', standardType);
      }
      const response = await fetch(`/api/sst-standards?${params.toString()}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Error al cargar los estándares');
      }
      return response.json();
    },
  });

  const { data: allItems = [] } = useQuery<SstItem[]>({
    queryKey: ["/api/sst-items", standardType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (standardType) {
        params.set('standardType', standardType);
      }
      const response = await fetch(`/api/sst-items?${params.toString()}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Error al cargar los ítems');
      }
      return response.json();
    },
  });

  const { data: evaluationItems = [] } = useQuery<SstEvaluationItem[]>({
    queryKey: [`/api/sst-evaluations/${evaluationId}/items`],
    enabled: !!evaluationId,
  });

  const saveMutation = useMutation({
    mutationFn: async (itemData: { itemId: string; score: number; observations: string }) => {
      const existingItem = evaluationItems.find(ei => ei.itemId === itemData.itemId);
      
      if (existingItem) {
        return apiRequest("PATCH", `/api/sst-evaluation-items/${existingItem.id}`, {
          score: itemData.score,
          observations: itemData.observations,
        });
      } else {
        return apiRequest("POST", "/api/sst-evaluation-items", {
          evaluationId,
          itemId: itemData.itemId,
          score: itemData.score,
          observations: itemData.observations,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/sst-evaluations/${evaluationId}/items`] });
      queryClient.invalidateQueries({ queryKey: [`/api/sst-evaluations/${evaluationId}`] });
    },
  });

  const handleScoreChange = (itemId: string, field: "score" | "observations", value: string | number) => {
    setScores(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      }
    }));
  };

  const handleSaveItem = async (itemId: string, maxScore: number) => {
    const itemScore = scores[itemId];
    if (!itemScore) {
      toast({
        title: "Error",
        description: "Ingrese una puntuación antes de guardar",
        variant: "destructive",
      });
      return;
    }

    if (itemScore.score < 0 || itemScore.score > maxScore) {
      toast({
        title: "Error",
        description: `La puntuación debe estar entre 0 y ${maxScore}`,
        variant: "destructive",
      });
      return;
    }

    try {
      await saveMutation.mutateAsync({
        itemId,
        score: itemScore.score,
        observations: itemScore.observations || "",
      });
      
      toast({
        title: "Guardado",
        description: "Calificación guardada exitosamente",
      });
      
      setScores(prev => {
        const newScores = { ...prev };
        delete newScores[itemId];
        return newScores;
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la calificación",
        variant: "destructive",
      });
    }
  };

  const getItemScore = (itemId: string) => {
    const existingItem = evaluationItems.find(ei => ei.itemId === itemId);
    return existingItem?.score;
  };

  const getItemStatus = (itemId: string) => {
    const existingScore = getItemScore(itemId);
    if (existingScore !== undefined) {
      return "scored";
    }
    return scores[itemId] ? "editing" : "pending";
  };

  const getStatusBadge = (status: string) => {
    if (status === "scored") {
      return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400"><CheckCircle2 className="h-3 w-3 mr-1" />Calificado</Badge>;
    }
    if (status === "editing") {
      return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400"><Clock className="h-3 w-3 mr-1" />Editando</Badge>;
    }
    return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Pendiente</Badge>;
  };

  const sortedStandards = [...standards].sort((a, b) => a.order - b.order);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Calificar Evaluación SST</DialogTitle>
          <DialogDescription>
            Califique cada ítem de los estándares según los criterios de evaluación
          </DialogDescription>
        </DialogHeader>

        <Accordion type="single" collapsible className="w-full">
          {sortedStandards.map((standard) => {
            const standardItems = allItems
              .filter(item => item.standardId === standard.id)
              .sort((a, b) => a.order - b.order);
            
            const scoredCount = standardItems.filter(item => getItemStatus(item.id) === "scored").length;
            
            return (
              <AccordionItem key={standard.id} value={standard.id} data-testid={`accordion-standard-${standard.id}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between flex-1 pr-4">
                    <div className="text-left">
                      <div className="font-semibold">{standard.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {standard.description}
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-4">
                      {scoredCount}/{standardItems.length} ítems
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6 pt-4">
                    {standardItems.map((item) => {
                      const status = getItemStatus(item.id);
                      const currentScore = getItemScore(item.id);
                      const editingScore = scores[item.id];
                      
                      return (
                        <div key={item.id} className="border rounded-lg p-4 space-y-3" data-testid={`item-${item.id}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{item.itemNumber}</Badge>
                                {getStatusBadge(status)}
                              </div>
                              <h4 className="font-medium mb-1">{item.description}</h4>
                              <p className="text-sm text-muted-foreground">
                                Criterio: {item.evaluationCriteria}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Puntuación máxima: {item.maxScore}
                              </p>
                            </div>
                          </div>

                          {status === "scored" && !editingScore ? (
                            <div className="bg-muted/50 p-3 rounded-md">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-medium">Puntuación: {currentScore}/{item.maxScore}</div>
                                  {evaluationItems.find(ei => ei.itemId === item.id)?.observations && (
                                    <div className="text-sm text-muted-foreground mt-1">
                                      {evaluationItems.find(ei => ei.itemId === item.id)?.observations}
                                    </div>
                                  )}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const existingItem = evaluationItems.find(ei => ei.itemId === item.id);
                                    setScores(prev => ({
                                      ...prev,
                                      [item.id]: {
                                        score: existingItem?.score || 0,
                                        observations: existingItem?.observations || "",
                                      }
                                    }));
                                  }}
                                  data-testid={`button-edit-${item.id}`}
                                >
                                  Editar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor={`score-${item.id}`}>Puntuación (0-{item.maxScore})</Label>
                                <Input
                                  id={`score-${item.id}`}
                                  type="number"
                                  min={0}
                                  max={item.maxScore}
                                  value={editingScore?.score ?? ""}
                                  onChange={(e) => handleScoreChange(item.id, "score", e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                                  onBlur={(e) => { if (e.target.value === '') handleScoreChange(item.id, "score", 0); }}
                                  placeholder={`0-${item.maxScore}`}
                                  data-testid={`input-score-${item.id}`}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`obs-${item.id}`}>Observaciones (opcional)</Label>
                                <Textarea
                                  id={`obs-${item.id}`}
                                  value={editingScore?.observations ?? ""}
                                  onChange={(e) => handleScoreChange(item.id, "observations", e.target.value)}
                                  placeholder="Observaciones sobre la calificación..."
                                  rows={2}
                                  data-testid={`textarea-observations-${item.id}`}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleSaveItem(item.id, item.maxScore)}
                                  disabled={saveMutation.isPending}
                                  data-testid={`button-save-${item.id}`}
                                >
                                  {saveMutation.isPending ? "Guardando..." : "Guardar"}
                                </Button>
                                {editingScore && (
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setScores(prev => {
                                        const newScores = { ...prev };
                                        delete newScores[item.id];
                                        return newScores;
                                      });
                                    }}
                                    data-testid={`button-cancel-${item.id}`}
                                  >
                                    Cancelar
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}

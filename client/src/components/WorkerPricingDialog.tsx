import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

type PricingMode = "standard" | "fixed" | "percentage";

type CompanyPricing = {
  mode: PricingMode;
  unitPriceCop: number | null;
  discountPercent: number | null;
  updatedAt: string | null;
};

type CompanySummary = { id: string; name: string };

export function WorkerPricingDialog({
  company,
  onClose,
}: {
  company: CompanySummary | null;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [mode, setMode] = useState<PricingMode>("standard");
  const [unitPrice, setUnitPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const endpoint = company ? `/api/admin/companies/${company.id}/worker-pricing` : "";

  const { data: pricing, isLoading, isError, error } = useQuery<CompanyPricing>({
    queryKey: [endpoint],
    enabled: !!company,
    queryFn: async () => {
      const response = await apiRequest("GET", endpoint);
      return response.json();
    },
  });

  useEffect(() => {
    setMode("standard");
    setUnitPrice("");
    setDiscountPercent("");
  }, [company?.id]);

  useEffect(() => {
    if (!pricing) return;
    setMode(pricing.mode);
    setUnitPrice(pricing.unitPriceCop == null ? "" : String(pricing.unitPriceCop));
    setDiscountPercent(pricing.discountPercent == null ? "" : String(pricing.discountPercent));
  }, [pricing]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!company) throw new Error("Seleccione una empresa.");
      const payload =
        mode === "fixed"
          ? { mode, unitPriceCop: Number(unitPrice) }
          : mode === "percentage"
            ? { mode, discountPercent: Number(discountPercent) }
            : { mode };
      const response = await apiRequest("PUT", endpoint, payload);
      return (await response.json()) as CompanyPricing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/company/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/billing"] });
      toast({
        title: "Tarifa actualizada",
        description: "El acuerdo se aplicará a los próximos cobros de esta empresa. Los pagos anteriores no cambian.",
      });
      onClose();
    },
    onError: (cause: Error) => {
      toast({ title: "No se pudo guardar la tarifa", description: cause.message, variant: "destructive" });
    },
  });

  const fixedValue = Number(unitPrice);
  const percentValue = Number(discountPercent);
  const valid =
    mode === "standard" ||
    (mode === "fixed" && unitPrice.trim() !== "" && Number.isSafeInteger(fixedValue) && fixedValue > 0 && fixedValue <= 2147483647) ||
    (mode === "percentage" && discountPercent.trim() !== "" && Number.isInteger(percentValue) && percentValue >= 1 && percentValue <= 99);

  return (
    <Dialog open={!!company} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tarifa por trabajador</DialogTitle>
          <DialogDescription>
            Configure el acuerdo de {company?.name}. Solo el superadmin puede modificarlo.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando tarifa...</p>
        ) : isError ? (
          <p role="alert" className="text-sm text-destructive">
            No se pudo consultar la tarifa: {(error as Error)?.message}
          </p>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="worker-pricing-mode">Tipo de tarifa</Label>
              <Select value={mode} onValueChange={(value) => setMode(value as PricingMode)}>
                <SelectTrigger id="worker-pricing-mode" data-testid="worker-pricing-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Tarifa general</SelectItem>
                  <SelectItem value="fixed">Valor fijo por trabajador</SelectItem>
                  <SelectItem value="percentage">Descuento porcentual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {mode === "fixed" && (
              <div className="space-y-2">
                <Label htmlFor="worker-unit-price">Precio acordado por trabajador (COP)</Label>
                <Input
                  id="worker-unit-price"
                  data-testid="worker-unit-price"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={2147483647}
                  step={1}
                  value={unitPrice}
                  onChange={(event) => setUnitPrice(event.target.value)}
                  placeholder="Ejemplo: 8000"
                />
                <p className="text-xs text-muted-foreground">Se multiplica por los trabajadores facturables del período.</p>
              </div>
            )}
            {mode === "percentage" && (
              <div className="space-y-2">
                <Label htmlFor="worker-discount-percent">Descuento sobre la tarifa general (%)</Label>
                <Input
                  id="worker-discount-percent"
                  data-testid="worker-discount-percent"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={99}
                  step={1}
                  value={discountPercent}
                  onChange={(event) => setDiscountPercent(event.target.value)}
                  placeholder="Ejemplo: 20"
                />
                <p className="text-xs text-muted-foreground">
                  Cambiará si cambia la tarifa general. No se acumula con cupones promocionales.
                </p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Solo afecta cobros futuros. Los pagos iniciados, facturas y períodos anteriores conservan su importe.
            </p>
            {pricing?.updatedAt && (
              <p className="text-xs text-muted-foreground">
                Último cambio: {new Date(pricing.updatedAt).toLocaleString("es-CO")}
              </p>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={isLoading || isError || !valid || saveMutation.isPending}
            data-testid="save-worker-pricing"
          >
            {saveMutation.isPending ? "Guardando..." : "Guardar tarifa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
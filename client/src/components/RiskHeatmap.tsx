import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info } from "lucide-react";

interface RiskData {
  probabilidad: number; // 1-4
  severidad: number; // 1-4
  nivelRiesgo: string;
  descripcionPeligro: string;
  actividadProceso: string;
}

interface RiskHeatmapProps {
  riesgos: RiskData[];
}

export function RiskHeatmap({ riesgos }: RiskHeatmapProps) {
  // Crear matriz 4x4 para el heatmap
  const matrixData: Record<string, RiskData[]> = {};
  
  riesgos.forEach((riesgo) => {
    const key = `${riesgo.probabilidad}-${riesgo.severidad}`;
    if (!matrixData[key]) {
      matrixData[key] = [];
    }
    matrixData[key].push(riesgo);
  });

  const getRiskColor = (prob: number, sev: number): string => {
    const valor = prob * sev;
    if (valor === 1) return "hover-elevate"; // Trivial - Verde #4CAF50
    if (valor <= 3) return "hover-elevate"; // Tolerable - Verde claro
    if (valor <= 6) return "hover-elevate"; // Moderado - Amarillo #FFEB3B
    if (valor <= 9) return "hover-elevate"; // Importante - Naranja #FF9800
    return "hover-elevate"; // Intolerable (≥10) - Rojo #D32F2F
  };

  const getRiskStyle = (prob: number, sev: number): React.CSSProperties => {
    const valor = prob * sev;
    if (valor === 1) return { backgroundColor: "rgba(76, 175, 80, 0.7)" }; // Trivial - Verde #4CAF50
    if (valor <= 3) return { backgroundColor: "rgba(76, 175, 80, 0.5)" }; // Tolerable - Verde claro
    if (valor <= 6) return { backgroundColor: "rgba(255, 235, 59, 0.75)" }; // Moderado - Amarillo #FFEB3B
    if (valor <= 9) return { backgroundColor: "rgba(255, 152, 0, 0.7)" }; // Importante - Naranja #FF9800
    return { backgroundColor: "rgba(211, 47, 47, 0.7)" }; // Intolerable (≥10) - Rojo #D32F2F
  };

  const getRiskLabel = (valor: number): string => {
    if (valor === 1) return "Trivial";
    if (valor <= 3) return "Tolerable";
    if (valor <= 6) return "Moderado";
    if (valor <= 9) return "Importante";
    return "Intolerable";
  };

  const severityLabels = [
    { value: 4, label: "Mortal" },
    { value: 3, label: "Grave" },
    { value: 2, label: "Moderado" },
    { value: 1, label: "Leve" }
  ];

  const probabilityLabels = [
    { value: 1, label: "Baja" },
    { value: 2, label: "Media" },
    { value: 3, label: "Alta" },
    { value: 4, label: "Muy Alta" }
  ];

  const totalRiesgos = riesgos.length;
  const riesgosPorNivel = {
    trivial: riesgos.filter(r => r.probabilidad * r.severidad === 1).length,
    tolerable: riesgos.filter(r => {
      const valor = r.probabilidad * r.severidad;
      return valor >= 2 && valor <= 3;
    }).length,
    moderado: riesgos.filter(r => {
      const valor = r.probabilidad * r.severidad;
      return valor >= 4 && valor <= 6;
    }).length,
    importante: riesgos.filter(r => {
      const valor = r.probabilidad * r.severidad;
      return valor >= 7 && valor <= 9;
    }).length,
    intolerable: riesgos.filter(r => {
      const valor = r.probabilidad * r.severidad;
      return valor >= 10;
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Resumen estadístico */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Riesgos</CardDescription>
            <CardTitle className="text-3xl">{totalRiesgos}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Trivial</CardDescription>
            <CardTitle className="text-3xl" style={{ color: "#4CAF50" }}>{riesgosPorNivel.trivial}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tolerable</CardDescription>
            <CardTitle className="text-3xl" style={{ color: "#4CAF50" }}>{riesgosPorNivel.tolerable}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Moderado</CardDescription>
            <CardTitle className="text-3xl" style={{ color: "#FFEB3B" }}>{riesgosPorNivel.moderado}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Importante</CardDescription>
            <CardTitle className="text-3xl" style={{ color: "#FF9800" }}>{riesgosPorNivel.importante}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Intolerable</CardDescription>
            <CardTitle className="text-3xl" style={{ color: "#D32F2F" }}>{riesgosPorNivel.intolerable}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Matriz de riesgos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Mapa de Calor de Riesgos - Metodología GTC-45
          </CardTitle>
          <CardDescription>
            Distribución de peligros según probabilidad de ocurrencia y severidad del daño
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Leyenda superior */}
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgba(76, 175, 80, 0.5)" }}></div>
                  <span className="text-sm">Trivial (1)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgba(76, 175, 80, 0.3)" }}></div>
                  <span className="text-sm">Tolerable (2-3)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgba(255, 235, 59, 0.6)" }}></div>
                  <span className="text-sm">Moderado (4-6)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgba(255, 152, 0, 0.6)" }}></div>
                  <span className="text-sm">Importante (7-9)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgba(211, 47, 47, 0.6)" }}></div>
                  <span className="text-sm">Intolerable (10-16)</span>
                </div>
              </div>

              <div className="grid grid-cols-[100px_repeat(4,1fr)] gap-2">
                {/* Encabezado - Probabilidad */}
                <div></div>
                {probabilityLabels.map((prob) => (
                  <div key={prob.value} className="text-center font-semibold p-2 bg-muted rounded">
                    {prob.label}
                    <div className="text-xs text-muted-foreground">P={prob.value}</div>
                  </div>
                ))}

                {/* Filas - Severidad */}
                {severityLabels.map((sev) => (
                  <div key={sev.value} className="contents">
                    {/* Etiqueta de severidad */}
                    <div className="flex items-center justify-end font-semibold p-2 bg-muted rounded">
                      <div className="text-right">
                        {sev.label}
                        <div className="text-xs text-muted-foreground">S={sev.value}</div>
                      </div>
                    </div>

                    {/* Celdas de la matriz */}
                    {probabilityLabels.map((prob) => {
                      const key = `${prob.value}-${sev.value}`;
                      const cellRisks = matrixData[key] || [];
                      const valor = prob.value * sev.value;
                      const riskLabel = getRiskLabel(valor);
                      
                      return (
                        <div
                          key={key}
                          className={`p-4 rounded-lg border-2 ${getRiskColor(prob.value, sev.value)} min-h-[100px] flex flex-col gap-2`}
                          style={getRiskStyle(prob.value, sev.value)}
                          data-testid={`heatmap-cell-${prob.value}-${sev.value}`}
                        >
                          <div className="text-center">
                            <div className="font-bold text-lg">{valor}</div>
                            <div className="text-xs text-muted-foreground">{riskLabel}</div>
                          </div>
                          
                          {cellRisks.length > 0 && (
                            <div className="flex flex-col gap-1">
                              <Badge variant="secondary" className="text-xs">
                                {cellRisks.length} {cellRisks.length === 1 ? 'peligro' : 'peligros'}
                              </Badge>
                              <div className="text-xs space-y-1">
                                {cellRisks.slice(0, 2).map((risk, idx) => (
                                  <div key={idx} className="truncate" title={risk.descripcionPeligro}>
                                    • {risk.descripcionPeligro.substring(0, 30)}...
                                  </div>
                                ))}
                                {cellRisks.length > 2 && (
                                  <div className="text-muted-foreground">
                                    +{cellRisks.length - 2} más
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Etiquetas de ejes */}
              <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span>Valor de Riesgo = Probabilidad × Severidad</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

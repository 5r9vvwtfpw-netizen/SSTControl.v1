import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, FileCheck2, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { apiRequest, buildHeaders, getSelectedCompanyId } from "@/lib/queryClient";
import { useCompanyContext } from "@/hooks/use-company-context";
import { useToast } from "@/hooks/use-toast";

type ReportCode = "resolucion-1565-2014" | "resolucion-40595-2022";
type Answer = "implemented" | "not-implemented" | "in-development";
type ReportState = {
  title: string;
  question: string;
  resolution: string;
  answers: Answer[];
  companyName: string;
  companyNit: string;
  representativeName: string | null;
  representativeId: string | null;
  hasSignature: boolean;
  latestEvaluation: { year: number; status: string; completion: string | null } | null;
  missing: string[];
};

const reportConfigs: Record<ReportCode, {
  answerLabels: Partial<Record<Answer, string>>;
  reportRoute: string;
  note: string;
}> = {
  "resolucion-1565-2014": {
    answerLabels: {
      implemented: "Sí, la empresa cuenta con un PESV implementado conforme a la Resolución 1565 de 2014.",
      "not-implemented": "No, la empresa no cuenta con un PESV implementado conforme a la Resolución 1565 de 2014.",
    },
    reportRoute: "/pesv/informes-anuales/resolucion-1565-2014",
    note: "Esta certificación mantiene la referencia de 2014 que solicita este punto. La evaluación del sistema bajo la metodología de 2022 no se usa para inferir ni reemplazar esta declaración.",
  },
  "resolucion-40595-2022": {
    answerLabels: {
      implemented: "La empresa cuenta con un PESV implementado conforme a la Resolución 40595 de 2022.",
      "in-development": "La empresa está desarrollando su PESV conforme a la Resolución 40595 de 2022.",
    },
    reportRoute: "/pesv/informes-anuales/resolucion-40595-2022",
    note: "La evaluación PESV registrada se muestra como información de consulta. La condición del informe la confirma expresamente el Representante Legal.",
  },
};

export default function PesvInformeAnualCertificacion({ reportCode }: { reportCode: ReportCode }) {
  const config = reportConfigs[reportCode];
  const { selectedCompany } = useCompanyContext();
  const { toast } = useToast();
  const [answer, setAnswer] = useState<Answer | "">("");
  const [confirmed, setConfirmed] = useState(false);
  const companyKey = selectedCompany?.id || getSelectedCompanyId() || "empresa-activa";
  const { data, isLoading, isError, refetch } = useQuery<ReportState>({
    queryKey: ["/api/pesv/informes-anuales", reportCode, companyKey],
    queryFn: async () => (await apiRequest("GET", `/api/pesv/informes-anuales/${reportCode}/estado`)).json(),
  });

  const download = async () => {
    if (!answer || !confirmed) return;
    try {
      const params = new URLSearchParams({ answer, confirm: "1" });
      const response = await fetch(`/api/pesv/informes-anuales/${reportCode}.pdf?${params}`, {
        credentials: "include",
        headers: buildHeaders(),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || "No fue posible generar la certificación.");
      }
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `certificacion_pesv_${reportCode}_${(data?.companyName || "empresa").replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast({ title: "Certificación descargada", description: "El PDF contiene únicamente la declaración confirmada para esta normatividad." });
    } catch (error) {
      toast({ title: "No se pudo generar el PDF", description: error instanceof Error ? error.message : "Error inesperado.", variant: "destructive" });
    }
  };

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-6" data-testid={`pesv-annual-certification-${reportCode}`}>
      <header>
        <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2">
          <Link href="/pesv/informes-anuales"><ArrowLeft className="mr-2 h-4 w-4" />Volver a informes anuales</Link>
        </Button>
        <p className="text-sm font-medium text-primary">PESV · Informe anual SISI/PESV</p>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl">{config.reportRoute.endsWith("1565-2014") ? "Certificación conforme a la Resolución 1565 de 2014" : "Certificación conforme a la Resolución 40595 de 2022"}</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">{config.note}</p>
      </header>

      {isLoading && <p className="text-sm text-muted-foreground">Consultando la empresa y sus datos de firma…</p>}
      {isError && <Alert variant="destructive"><AlertTitle>No se pudo consultar</AlertTitle><AlertDescription><Button variant="outline" size="sm" onClick={() => refetch()}>Reintentar</Button></AlertDescription></Alert>}
      {data && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{data.title}</CardTitle>
              <CardDescription>{data.companyName} · NIT {data.companyNit}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-md border bg-muted/20 p-4">
                <p className="font-medium">{data.question}</p>
                <p className="mt-1 text-sm text-muted-foreground">Normatividad de este punto: {data.resolution}. Se descarga un PDF independiente por certificación; no se genera Excel ni anexo.</p>
              </div>

              {reportCode === "resolucion-40595-2022" && (
                <Card className="bg-muted/20">
                  <CardHeader className="pb-2"><CardTitle className="text-base">Evaluación PESV existente</CardTitle></CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {data.latestEvaluation ? (
                      <>
                        <p>Última evaluación: {data.latestEvaluation.year} · Estado: {data.latestEvaluation.status}{data.latestEvaluation.completion ? ` · ${data.latestEvaluation.completion}%` : ""}</p>
                        <Button variant="outline" size="sm" asChild><Link href="/pesv/evaluaciones">Abrir Evaluaciones PESV</Link></Button>
                      </>
                    ) : (
                      <>
                        <p>No se encontró una evaluación PESV registrada para esta empresa. Puedes declararla “en desarrollo” si esa es la situación real.</p>
                        <Button variant="outline" size="sm" asChild><Link href="/pesv/evaluaciones">Abrir Evaluaciones PESV</Link></Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                <p className="font-semibold">Declaración del Representante Legal</p>
                {data.answers.map((value) => (
                  <label key={value} className="flex cursor-pointer items-start gap-3 rounded-md border p-3">
                    <input
                      type="radio"
                      name={`answer-${reportCode}`}
                      value={value}
                      checked={answer === value}
                      onChange={() => { setAnswer(value); setConfirmed(false); }}
                      className="mt-1"
                    />
                    <span className="text-sm leading-5">{config.answerLabels[value]}</span>
                  </label>
                ))}
              </div>

              <Card className="bg-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Datos del Representante Legal</CardTitle>
                  <CardDescription>Se toman de la ficha de la empresa y se incluyen en el PDF firmado.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p><strong>Nombre:</strong> {data.representativeName || "Pendiente de registro"}</p>
                  <p><strong>Identificación:</strong> {data.representativeId || "Pendiente de registro"}</p>
                  <p><strong>Firma registrada:</strong> {data.hasSignature ? "Sí" : "Pendiente de cargar"}</p>
                  <p className="text-muted-foreground">Ruta: Administración Global &gt; Empresas &gt; Editar empresa &gt; Representante Legal.</p>
                  <Button variant="outline" size="sm" asChild className="mt-2"><Link href="/empresas">Abrir Empresas</Link></Button>
                </CardContent>
              </Card>

              {data.missing.length > 0 && (
                <Alert>
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle>Completa los datos requeridos antes de descargar.</AlertTitle>
                  <AlertDescription>{data.missing.map((item) => <p key={item}>{item}</p>)}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-start gap-3 rounded-md border p-3">
                <Checkbox id={`annual-cert-confirm-${reportCode}`} checked={confirmed} onCheckedChange={(value) => setConfirmed(value === true)} disabled={!answer} />
                <Label htmlFor={`annual-cert-confirm-${reportCode}`} className="leading-5">
                  Confirmo que la respuesta seleccionada corresponde a la situación de la empresa y autorizo incluir la firma registrada del Representante Legal en esta certificación.
                </Label>
              </div>
              <Button onClick={download} disabled={!answer || !confirmed || data.missing.length > 0}>
                <FileCheck2 className="mr-2 h-4 w-4" /><Download className="mr-2 h-4 w-4" />Descargar certificación PDF
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}

export function PesvInformeAnual1565() {
  return <PesvInformeAnualCertificacion reportCode="resolucion-1565-2014" />;
}

export function PesvInformeAnual40595() {
  return <PesvInformeAnualCertificacion reportCode="resolucion-40595-2022" />;
}

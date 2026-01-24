import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { type Curso50Horas } from "@shared/schema";
import { FileText, Upload, Download, AlertCircle, ArrowLeft, CalendarDays } from "lucide-react";
import { Link } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AutomationAssistant, type PlantillaInfo } from "@/components/AutomationAssistant";
import { getEstandarByCodigo } from "@/data/planear-normativa";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

export default function Curso50HorasPage() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: curso, isLoading } = useQuery<Curso50Horas | null>({
    queryKey: ["/api/curso-50-horas"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('archivo', file);

      const res = await fetch('/api/curso-50-horas', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/curso-50-horas"] });
      toast({
        title: "Curso actualizado",
        description: "El certificado del curso de 50 horas ha sido actualizado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Error",
          description: "Solo se permiten archivos PDF",
          variant: "destructive",
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">Curso de 50 Horas</h1>
          <p className="text-muted-foreground">
            Cargando información del curso...
          </p>
        </div>
      </div>
    );
  }

  const estandar123 = getEstandarByCodigo('1.2.3');

  const normativaCurso50h = estandar123?.normativaAplicable || [
    {
      codigo: 'RES-4927-2016',
      norma: 'Resolución 4927 de 2016',
      descripcion: 'Parámetros y requisitos del curso de capacitación virtual de 50 horas',
      requisitos: [
        'Obligatorio para responsables del SG-SST',
        'Curso certificado por el SENA o instituciones autorizadas',
        'Contenido según plan de estudios establecido',
        'Evaluación final aprobada'
      ],
      obligatorio: true
    }
  ];

  const plantillasCurso50h: PlantillaInfo[] = estandar123?.plantillas?.map(p => ({
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion,
    campos: p.campos,
    normativaBase: p.normativaBase
  })) || [
    {
      id: 'curso-50h-temario',
      nombre: 'Temario Oficial del Curso 50 Horas SST',
      descripcion: 'Contenido completo del curso según Resolución 4927/2016',
      campos: {
        modulos: [
          'Módulo 1: Normatividad del SG-SST (10 horas)',
          'Módulo 2: Marco conceptual del SG-SST (8 horas)',
          'Módulo 3: Planificación del SG-SST (10 horas)',
          'Módulo 4: Aplicación del SG-SST (10 horas)',
          'Módulo 5: Verificación del SG-SST (6 horas)',
          'Módulo 6: Mejora del SG-SST (6 horas)'
        ],
        duracionTotal: '50 horas',
        metodologia: 'Virtual - Presencial o combinada',
        evaluacion: 'Evaluación final con mínimo 70% de aprobación'
      },
      normativaBase: 'RES-4927-2016'
    },
    {
      id: 'curso-50h-requisitos-certificado',
      nombre: 'Requisitos del Certificado',
      descripcion: 'Información que debe contener el certificado para ser válido',
      campos: {
        datosObligatorios: [
          'Nombre completo del participante',
          'Número de identificación',
          'Nombre del curso: "Curso Virtual de 50 horas en SST"',
          'Fecha de inicio y finalización',
          'Intensidad horaria (50 horas)',
          'Nombre de la institución certificadora',
          'Número de registro o código del certificado',
          'Firma del representante legal o director académico'
        ],
        institucionesAutorizadas: [
          'SENA (Servicio Nacional de Aprendizaje)',
          'Universidades con programas acreditados en SST',
          'Instituciones de educación para el trabajo autorizadas por el Ministerio de Trabajo',
          'ARL con programas de formación autorizados'
        ],
        validez: 'El certificado no tiene fecha de vencimiento, pero se recomienda actualización cada 3 años'
      },
      normativaBase: 'RES-4927-2016'
    },
    {
      id: 'curso-50h-quien-debe-tomar',
      nombre: '¿Quién debe tomar el curso?',
      descripcion: 'Personas obligadas a realizar el curso según la normativa',
      campos: {
        obligados: [
          'Responsable del diseño e implementación del SG-SST',
          'Personas que lideran el SG-SST en la empresa',
          'Coordinadores de SST sin formación profesional en el área',
          'Vigías de SST en empresas de menos de 10 trabajadores'
        ],
        excepciones: [
          'Profesionales en SST con licencia vigente',
          'Tecnólogos en SST con tarjeta profesional',
          'Profesionales con posgrado en SST',
          'Médicos especialistas en medicina del trabajo'
        ],
        nota: 'Los profesionales con formación en SST están exentos pero pueden tomarlo como actualización'
      },
      normativaBase: 'RES-0312-2019'
    }
  ];

  const handleSelectPlantilla = (plantilla: PlantillaInfo) => {
    let descripcionDetallada = '';
    
    if (plantilla.id === 'curso-50h-temario') {
      const modulos = plantilla.campos.modulos as string[];
      descripcionDetallada = `El curso de 50 horas debe cubrir los siguientes módulos:\n\n${modulos.map((m, i) => `${i + 1}. ${m}`).join('\n')}\n\nDuración total: ${plantilla.campos.duracionTotal}\nMetodología: ${plantilla.campos.metodologia}\nEvaluación: ${plantilla.campos.evaluacion}`;
    } else if (plantilla.id === 'curso-50h-requisitos-certificado') {
      const datos = plantilla.campos.datosObligatorios as string[];
      const instituciones = plantilla.campos.institucionesAutorizadas as string[];
      descripcionDetallada = `Su certificado debe incluir:\n\n${datos.map(d => `• ${d}`).join('\n')}\n\nInstituciones autorizadas:\n${instituciones.map(i => `• ${i}`).join('\n')}\n\n${plantilla.campos.validez}`;
    } else if (plantilla.id === 'curso-50h-quien-debe-tomar') {
      const obligados = plantilla.campos.obligados as string[];
      const excepciones = plantilla.campos.excepciones as string[];
      descripcionDetallada = `Personas obligadas a tomar el curso:\n\n${obligados.map(o => `• ${o}`).join('\n')}\n\nExcepciones (no requieren el curso):\n${excepciones.map(e => `• ${e}`).join('\n')}\n\nNota: ${plantilla.campos.nota}`;
    }

    toast({
      title: plantilla.nombre,
      description: descripcionDetallada,
      duration: 15000,
      className: "bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800 max-w-lg whitespace-pre-line",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/evaluaciones-sst">
            <Button variant="ghost" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Curso de 50 Horas</h1>
            <p className="text-muted-foreground">
              Gestión del certificado del curso de capacitación virtual de 50 horas en SST
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <BackToEvaluationButton />
          <BackToCronogramaButton />
        </div>
      </div>

      <AutomationAssistant
        titulo="Curso Virtual de 50 Horas en SST"
        estandar="1.2.3"
        descripcion={estandar123?.nombre || "Curso virtual de capacitación de 50 horas en SST"}
        normativaAplicable={normativaCurso50h}
        compact={true}
      />

      <Alert data-testid="alert-info">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          El curso de capacitación virtual de 50 horas en el Sistema de Gestión de Seguridad y Salud en el Trabajo 
          es un requisito para el responsable del SG-SST según la Resolución 0312 de 2019.
        </AlertDescription>
      </Alert>

      <Card data-testid="card-curso-50-horas">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Certificado del Curso
          </CardTitle>
          <CardDescription>
            Suba el certificado del curso de 50 horas en formato PDF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {curso && curso.archivoUrl && (
            <div className="p-4 border rounded-lg bg-muted/50" data-testid="current-file">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-medium" data-testid="text-filename">{curso.archivoNombre}</p>
                    <p className="text-sm text-muted-foreground">
                      Subido el {new Date(curso.updatedAt).toLocaleDateString('es-CO')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  data-testid="button-download"
                >
                  <a href={curso.archivoUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </a>
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="flex-1"
                data-testid="input-file"
              />
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploadMutation.isPending}
                data-testid="button-upload"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadMutation.isPending ? "Subiendo..." : curso ? "Actualizar" : "Subir"}
              </Button>
            </div>
            {selectedFile && (
              <p className="text-sm text-muted-foreground" data-testid="text-selected-file">
                Archivo seleccionado: {selectedFile.name}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

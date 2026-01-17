// Componente de sugerencias de peligros específicos según código CIIU de la empresa
// Solo agregar código nuevo - no modifica componentes existentes

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertTriangle, Factory, Shield, BookOpen, HardHat, FileText, ChevronRight, Lightbulb, Check, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPeligrosPorCIIU, buscarCIIUSimilar, PeligroPorCIIU, PeligroEspecificoSector } from "@/data/peligros-por-ciiu";
import { peligrosGTC45Predefinidos, clasificacionPeligroLabels } from "@/data/peligros-gtc45-predefinidos";
import { Company } from "@shared/schema";

interface SugerenciaPeligrosCIIUProps {
  onSelectPeligroGTC45: (codigo: string) => void;
  onSelectPeligroEspecifico: (peligro: PeligroEspecificoSector) => void;
  selectedCodigos?: string[];
}

export function SugerenciaPeligrosCIIU({ 
  onSelectPeligroGTC45, 
  onSelectPeligroEspecifico,
  selectedCodigos = []
}: SugerenciaPeligrosCIIUProps) {
  // Obtener datos de la empresa actual
  const { data: company, isLoading } = useQuery<Company>({
    queryKey: ['/api/company/current'],
  });

  if (isLoading) {
    return (
      <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <CardContent className="p-4">
          <div className="animate-pulse flex items-center gap-2">
            <Factory className="h-5 w-5 text-amber-600" />
            <span className="text-amber-700 dark:text-amber-300">Cargando sugerencias...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const ciiuCode = company?.ciiuCode;
  
  if (!ciiuCode) {
    return (
      <Card className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sin código CIIU registrado
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Configure el código CIIU en los datos de la empresa para recibir sugerencias de peligros específicos de su actividad económica.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Buscar peligros específicos para este CIIU
  let peligrosCIIU = getPeligrosPorCIIU(ciiuCode);
  
  // Si no hay coincidencia exacta, buscar similar
  if (!peligrosCIIU) {
    peligrosCIIU = buscarCIIUSimilar(ciiuCode);
  }

  if (!peligrosCIIU) {
    return (
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Factory className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                CIIU: {ciiuCode}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Aún no tenemos peligros específicos mapeados para esta actividad económica. 
                Use el catálogo GTC-45 general.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Obtener los peligros GTC-45 prioritarios
  const peligrosPrioritarios = peligrosCIIU.peligrosPrioritarios
    .map(codigo => peligrosGTC45Predefinidos.find(p => p.codigo === codigo))
    .filter(Boolean);

  const getRiesgoBadgeColor = (nivel: string) => {
    switch (nivel) {
      case 'I': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'II': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'III': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'IV': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
      case 'V': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClasificacionIcon = (clasificacion: string) => {
    switch (clasificacion) {
      case 'biologico': return '🦠';
      case 'fisico': return '⚡';
      case 'quimico': return '🧪';
      case 'psicosocial': return '🧠';
      case 'biomecanico': return '💪';
      case 'condiciones_seguridad': return '🛡️';
      case 'fenomenos_naturales': return '🌪️';
      default: return '⚠️';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-700">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
              <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-base text-amber-900 dark:text-amber-100">
                Peligros Sugeridos para su Actividad
              </CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-300 mt-1">
                <span className="font-medium">CIIU {peligrosCIIU.codigoCIIU}</span> - {peligrosCIIU.descripcionCIIU}
              </CardDescription>
            </div>
          </div>
          <Badge className={getRiesgoBadgeColor(peligrosCIIU.nivelRiesgo)}>
            Riesgo {peligrosCIIU.nivelRiesgo}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ScrollArea className="h-[300px] pr-4">
          <Accordion type="multiple" className="space-y-2">
            {/* Peligros Específicos del Sector */}
            <AccordionItem value="especificos" className="border rounded-lg bg-white/80 dark:bg-gray-900/50">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  <span className="font-medium text-amber-900 dark:text-amber-100">
                    Peligros Específicos del Sector ({peligrosCIIU.peligrosEspecificos.length})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-2">
                  {peligrosCIIU.peligrosEspecificos.map((peligro) => (
                    <div 
                      key={peligro.codigo}
                      className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span>{getClasificacionIcon(peligro.clasificacion)}</span>
                            <span className="font-medium text-sm text-amber-900 dark:text-amber-100">
                              {peligro.peligro}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {clasificacionPeligroLabels[peligro.clasificacion as keyof typeof clasificacionPeligroLabels]}
                            </Badge>
                          </div>
                          <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">
                            {peligro.descripcion}
                          </p>
                          <div className="text-xs text-amber-600 dark:text-amber-400">
                            <strong>Efectos:</strong> {peligro.efectosPosibles}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="shrink-0 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/50 dark:hover:bg-amber-800/50 border-amber-300"
                          onClick={() => onSelectPeligroEspecifico(peligro)}
                          data-testid={`btn-agregar-especifico-${peligro.codigo}`}
                        >
                          <ChevronRight className="h-4 w-4" />
                          Agregar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Peligros GTC-45 Prioritarios */}
            <AccordionItem value="prioritarios" className="border rounded-lg bg-white/80 dark:bg-gray-900/50">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="font-medium text-orange-900 dark:text-orange-100">
                    Peligros GTC-45 Prioritarios ({peligrosPrioritarios.length})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-2">
                  {peligrosPrioritarios.map((peligro) => peligro && (
                    <Button
                      key={peligro.codigo}
                      variant="outline"
                      size="sm"
                      className={`justify-start h-auto py-2 text-left ${
                        selectedCodigos.includes(peligro.codigo) 
                          ? 'bg-green-100 border-green-300 dark:bg-green-900/30' 
                          : 'bg-white dark:bg-gray-800'
                      }`}
                      onClick={() => onSelectPeligroGTC45(peligro.codigo)}
                      data-testid={`btn-agregar-gtc45-${peligro.codigo}`}
                    >
                      <span className="mr-2">{getClasificacionIcon(peligro.clasificacion)}</span>
                      <span className="truncate">{peligro.codigo} - {peligro.peligro}</span>
                      {selectedCodigos.includes(peligro.codigo) && (
                        <Check className="h-4 w-4 ml-auto text-green-600" />
                      )}
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* EPP Recomendado */}
            <AccordionItem value="epp" className="border rounded-lg bg-white/80 dark:bg-gray-900/50">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <HardHat className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    EPP Recomendado ({peligrosCIIU.eppRecomendado.length})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="flex flex-wrap gap-2">
                  {peligrosCIIU.eppRecomendado.map((epp, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                      {epp}
                    </Badge>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Normativa Específica */}
            <AccordionItem value="normativa" className="border rounded-lg bg-white/80 dark:bg-gray-900/50">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-500" />
                  <span className="font-medium text-purple-900 dark:text-purple-100">
                    Normativa Aplicable ({peligrosCIIU.normativaEspecifica.length})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-2">
                  {peligrosCIIU.normativaEspecifica.map((norma) => (
                    <div key={norma.codigo} className="flex items-start gap-2 text-sm">
                      <Shield className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-medium text-purple-800 dark:text-purple-200">{norma.norma}</span>
                        <span className="text-purple-600 dark:text-purple-400"> - {norma.descripcion}</span>
                        {norma.obligatorio && (
                          <Badge variant="destructive" className="ml-2 text-xs">Obligatorio</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Capacitaciones Obligatorias */}
            <AccordionItem value="capacitaciones" className="border rounded-lg bg-white/80 dark:bg-gray-900/50">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-green-900 dark:text-green-100">
                    Capacitaciones Obligatorias ({peligrosCIIU.capacitacionesObligatorias.length})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="flex flex-wrap gap-2">
                  {peligrosCIIU.capacitacionesObligatorias.map((cap, idx) => (
                    <Badge key={idx} variant="outline" className="bg-green-50 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
                      {cap}
                    </Badge>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default SugerenciaPeligrosCIIU;

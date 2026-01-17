import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Search, Filter, FlaskConical, AlertTriangle, Flame, Skull, Droplet as DropletIcon, Printer, ArrowLeft, Check, ChevronsUpDown, CalendarDays } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { HazardousSubstance, insertHazardousSubstanceSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { AutomationAssistant } from "@/components/AutomationAssistant";
import { cn } from "@/lib/utils";

const normativaSustanciasQuimicas = [
  {
    codigo: 'DEC-1496-2018',
    norma: 'Decreto 1496/2018',
    articulo: 'Sistema Globalmente Armonizado (SGA)',
    descripcion: 'Adopción del Sistema Globalmente Armonizado de Clasificación y Etiquetado de Productos Químicos',
    requisitos: [
      'Clasificación de sustancias según SGA',
      'Etiquetado con pictogramas de peligro',
      'Fichas de Datos de Seguridad (FDS)',
      'Capacitación en SGA a trabajadores'
    ],
    obligatorio: true
  },
  {
    codigo: 'GHS-SGA',
    norma: 'Sistema Globalmente Armonizado (GHS)',
    articulo: 'Naciones Unidas',
    descripcion: 'Clasificación y comunicación de peligros químicos',
    requisitos: [
      'Identificación de peligros físicos, para la salud y ambientales',
      'Pictogramas de peligro normalizados',
      'Palabras de advertencia',
      'Indicaciones de peligro y consejos de prudencia'
    ],
    obligatorio: true
  }
];

const hazardClassIcons: Record<string, typeof AlertTriangle> = {
  "cancerígena": Skull,
  "toxicidad_aguda": Skull,
  "corrosiva": DropletIcon,
  "inflamable": Flame,
  "explosiva": AlertTriangle,
  "oxidante": AlertTriangle,
  "irritante": AlertTriangle,
  "sensibilizante": AlertTriangle,
  "mutagena": Skull,
  "teratogenica": Skull,
};

const hazardClassLabels: Record<string, string> = {
  "cancerígena": "Cancerígena",
  "toxicidad_aguda": "Toxicidad Aguda",
  "corrosiva": "Corrosiva",
  "inflamable": "Inflamable",
  "explosiva": "Explosiva",
  "oxidante": "Oxidante",
  "irritante": "Irritante",
  "sensibilizante": "Sensibilizante",
  "mutagena": "Mutagénica",
  "teratogenica": "Teratogénica",
};

const hazardClassColors: Record<string, string> = {
  "cancerígena": "bg-pink-500/10 text-pink-700 dark:text-pink-300",
  "toxicidad_aguda": "bg-purple-500/10 text-purple-700 dark:text-purple-300",
  "corrosiva": "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  "inflamable": "bg-red-500/10 text-red-700 dark:text-red-300",
  "explosiva": "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  "oxidante": "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
  "irritante": "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  "sensibilizante": "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  "mutagena": "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
  "teratogenica": "bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

type SubstanceCategory = "acidos" | "bases" | "solventes" | "combustibles" | "gases" | "metales" | "carcinogenos" | "explosivos" | "oxidantes" | "otros";

const categoryLabels: Record<SubstanceCategory, string> = {
  acidos: "Ácidos",
  bases: "Bases y Álcalis", 
  solventes: "Solventes Orgánicos",
  combustibles: "Combustibles",
  gases: "Gases",
  metales: "Metales Pesados",
  carcinogenos: "Carcinógenos",
  explosivos: "Explosivos",
  oxidantes: "Oxidantes",
  otros: "Otras Sustancias",
};

const categoryOrder: SubstanceCategory[] = ["acidos", "bases", "solventes", "combustibles", "gases", "metales", "carcinogenos", "oxidantes", "explosivos", "otros"];

const sustanciasQuimicasPredefinidas = [
  { commercialName: "Ácido Sulfúrico", chemicalName: "H₂SO₄", casNumber: "7664-93-9", hazardClass: ["corrosiva", "toxicidad_aguda"], unit: "L", controlMeasures: "EPP: Guantes de nitrilo, gafas de seguridad, delantal químico, careta facial. Ventilación local exhaustiva. Ducha y lavaojos de emergencia. Almacenar separado de bases y materiales combustibles.", category: "acidos" as SubstanceCategory },
  { commercialName: "Ácido Clorhídrico", chemicalName: "HCl", casNumber: "7647-01-0", hazardClass: ["corrosiva", "toxicidad_aguda"], unit: "L", controlMeasures: "EPP: Guantes de PVC, gafas de seguridad, respirador con filtro para vapores ácidos. Ventilación adecuada. Ducha y lavaojos de emergencia. No mezclar con lejía o amoníaco.", category: "acidos" as SubstanceCategory },
  { commercialName: "Ácido Nítrico", chemicalName: "HNO₃", casNumber: "7697-37-2", hazardClass: ["corrosiva", "oxidante", "toxicidad_aguda"], unit: "L", controlMeasures: "EPP: Guantes de neopreno, gafas herméticas, traje químico. Ventilación local exhaustiva. Almacenar separado de materiales orgánicos y combustibles. Contenedores secundarios.", category: "acidos" as SubstanceCategory },
  { commercialName: "Ácido Fluorhídrico", chemicalName: "HF", casNumber: "7664-39-3", hazardClass: ["corrosiva", "toxicidad_aguda"], unit: "L", controlMeasures: "EPP ESPECIAL: Guantes de neopreno grueso, traje encapsulado, SCBA. Gel de gluconato de calcio disponible. Personal capacitado únicamente. Ducha de emergencia obligatoria.", category: "acidos" as SubstanceCategory },
  { commercialName: "Ácido Fosfórico", chemicalName: "H₃PO₄", casNumber: "7664-38-2", hazardClass: ["corrosiva", "irritante"], unit: "L", controlMeasures: "EPP: Guantes de caucho, gafas de seguridad, delantal. Ventilación adecuada. Ducha y lavaojos disponibles. Almacenar en área seca y ventilada.", category: "acidos" as SubstanceCategory },
  { commercialName: "Ácido Acético Glacial", chemicalName: "CH₃COOH", casNumber: "64-19-7", hazardClass: ["corrosiva", "inflamable"], unit: "L", controlMeasures: "EPP: Guantes de nitrilo, gafas de seguridad, delantal químico. Ventilación local exhaustiva. Alejado de fuentes de ignición. Extintores clase B disponibles.", category: "acidos" as SubstanceCategory },
  { commercialName: "Ácido Crómico", chemicalName: "H₂CrO₄", casNumber: "7738-94-5", hazardClass: ["cancerígena", "corrosiva", "oxidante"], unit: "kg", controlMeasures: "CARCINÓGENO. EPP: Respirador con filtro P100, gafas herméticas, guantes de neopreno, delantal. Ventilación local exhaustiva. Vigilancia médica.", category: "acidos" as SubstanceCategory },
  { commercialName: "Hidróxido de Sodio (Soda Cáustica)", chemicalName: "NaOH", casNumber: "1310-73-2", hazardClass: ["corrosiva"], unit: "kg", controlMeasures: "EPP: Guantes de caucho, gafas herméticas, delantal, botas. Ducha y lavaojos de emergencia. Almacenar separado de ácidos. Evitar contacto con aluminio.", category: "bases" as SubstanceCategory },
  { commercialName: "Hidróxido de Potasio", chemicalName: "KOH", casNumber: "1310-58-3", hazardClass: ["corrosiva"], unit: "kg", controlMeasures: "EPP: Guantes de neopreno, gafas herméticas, delantal impermeable. Ducha y lavaojos disponibles. Almacenar en lugar seco, separado de ácidos.", category: "bases" as SubstanceCategory },
  { commercialName: "Amoníaco", chemicalName: "NH₃", casNumber: "7664-41-7", hazardClass: ["toxicidad_aguda", "corrosiva"], unit: "L", controlMeasures: "EPP: Respirador con cartucho para amoníaco, gafas herméticas, guantes de caucho. Ventilación forzada. Detectores de gas. Prohibido mezclar con cloro o lejía.", category: "bases" as SubstanceCategory },
  { commercialName: "Hipoclorito de Sodio (Cloro)", chemicalName: "NaClO", casNumber: "7681-52-9", hazardClass: ["corrosiva", "oxidante", "irritante"], unit: "L", controlMeasures: "EPP: Gafas de seguridad, guantes de caucho. Ventilación adecuada. NUNCA mezclar con ácidos o amoníaco (genera gases tóxicos). Almacenar en lugar fresco.", category: "bases" as SubstanceCategory },
  { commercialName: "Metanol", chemicalName: "CH₃OH", casNumber: "67-56-1", hazardClass: ["toxicidad_aguda", "inflamable"], unit: "L", controlMeasures: "EPP: Respirador con cartucho orgánico, gafas herméticas, guantes de butilo. ALTAMENTE TÓXICO por ingestión. Ventilación forzada. Alejado de ignición.", category: "solventes" as SubstanceCategory },
  { commercialName: "Etanol", chemicalName: "C₂H₅OH", casNumber: "64-17-5", hazardClass: ["inflamable"], unit: "L", controlMeasures: "EPP: Gafas de seguridad, guantes de nitrilo. Almacenar alejado de fuentes de ignición. Ventilación adecuada. Extintores clase B disponibles.", category: "solventes" as SubstanceCategory },
  { commercialName: "Acetona", chemicalName: "(CH₃)₂CO", casNumber: "67-64-1", hazardClass: ["inflamable", "irritante"], unit: "L", controlMeasures: "EPP: Gafas de seguridad, guantes de nitrilo. Ventilación adecuada. Almacenar alejado de fuentes de calor e ignición. Recipientes cerrados.", category: "solventes" as SubstanceCategory },
  { commercialName: "Isopropanol", chemicalName: "(CH₃)₂CHOH", casNumber: "67-63-0", hazardClass: ["inflamable", "irritante"], unit: "L", controlMeasures: "EPP: Gafas de seguridad, guantes de nitrilo. Ventilación adecuada. Almacenar alejado de fuentes de ignición. Extintores clase B.", category: "solventes" as SubstanceCategory },
  { commercialName: "Tolueno", chemicalName: "C₆H₅CH₃", casNumber: "108-88-3", hazardClass: ["inflamable", "irritante", "teratogenica"], unit: "L", controlMeasures: "EPP: Respirador con cartucho orgánico, gafas de seguridad, guantes de nitrilo. Ventilación local exhaustiva. Alejado de fuentes de ignición. Prohibido para mujeres embarazadas.", category: "solventes" as SubstanceCategory },
  { commercialName: "Xileno", chemicalName: "C₆H₄(CH₃)₂", casNumber: "1330-20-7", hazardClass: ["inflamable", "irritante"], unit: "L", controlMeasures: "EPP: Respirador con cartucho orgánico, gafas, guantes de nitrilo. Ventilación adecuada. Almacenar alejado de fuentes de calor. Extintores clase B disponibles.", category: "solventes" as SubstanceCategory },
  { commercialName: "Thinner", chemicalName: "Mezcla de solventes", casNumber: "8052-41-3", hazardClass: ["inflamable", "irritante"], unit: "gal", controlMeasures: "EPP: Respirador con cartucho orgánico, gafas, guantes de nitrilo. Ventilación forzada. Alejado de fuentes de ignición. Recipientes cerrados.", category: "solventes" as SubstanceCategory },
  { commercialName: "Tricloroetileno", chemicalName: "C₂HCl₃", casNumber: "79-01-6", hazardClass: ["cancerígena", "mutagena", "irritante"], unit: "L", controlMeasures: "CARCINÓGENO. EPP: Respirador con cartucho orgánico, gafas herméticas, guantes de Viton. Sistema cerrado. Ventilación local exhaustiva. Vigilancia médica.", category: "solventes" as SubstanceCategory },
  { commercialName: "Tetracloruro de Carbono", chemicalName: "CCl₄", casNumber: "56-23-5", hazardClass: ["cancerígena", "toxicidad_aguda"], unit: "L", controlMeasures: "CARCINÓGENO. EPP: SCBA o respirador con cartucho orgánico, guantes de Viton. Sistema cerrado. Prohibido calentar. Vigilancia médica hepática.", category: "solventes" as SubstanceCategory },
  { commercialName: "Diclorometano", chemicalName: "CH₂Cl₂", casNumber: "75-09-2", hazardClass: ["cancerígena", "irritante"], unit: "L", controlMeasures: "CARCINÓGENO. EPP: Respirador con cartucho orgánico, gafas, guantes de Viton. Ventilación local exhaustiva. Monitoreo de exposición. Vigilancia médica.", category: "solventes" as SubstanceCategory },
  { commercialName: "Gasolina", chemicalName: "Mezcla de hidrocarburos", casNumber: "86290-81-5", hazardClass: ["inflamable", "cancerígena", "mutagena"], unit: "gal", controlMeasures: "EPP: Guantes de nitrilo, gafas. Prohibido fumar. Conexión a tierra para trasvase. Almacenamiento en tanques homologados. Extintores clase B. Vigilancia médica.", category: "combustibles" as SubstanceCategory },
  { commercialName: "Diésel", chemicalName: "Mezcla de hidrocarburos", casNumber: "68476-34-6", hazardClass: ["inflamable", "cancerígena"], unit: "gal", controlMeasures: "EPP: Guantes de nitrilo, gafas. Almacenamiento en tanques homologados. Conexión a tierra. Extintores clase B. Prohibido fumar en área de almacenamiento.", category: "combustibles" as SubstanceCategory },
  { commercialName: "Cloro", chemicalName: "Cl₂", casNumber: "7782-50-5", hazardClass: ["toxicidad_aguda", "oxidante", "corrosiva"], unit: "cilindros", controlMeasures: "EPP: SCBA o respirador con cartucho para cloro, traje químico completo. Detectores de cloro. Almacenamiento ventilado, separado de inflamables. Kit de emergencia para fugas.", category: "gases" as SubstanceCategory },
  { commercialName: "GLP (Gas Licuado de Petróleo)", chemicalName: "Propano/Butano", casNumber: "68476-85-7", hazardClass: ["inflamable", "explosiva"], unit: "cilindros", controlMeasures: "Almacenamiento al aire libre. Alejado de fuentes de ignición. Detectores de gas. Válvulas antiretorno. Conexiones verificadas. Extintores de polvo químico.", category: "gases" as SubstanceCategory },
  { commercialName: "Acetileno", chemicalName: "C₂H₂", casNumber: "74-86-2", hazardClass: ["inflamable", "explosiva"], unit: "cilindros", controlMeasures: "Cilindros en posición vertical. Alejado de oxígeno y fuentes de ignición. Válvulas antiretroceso. Almacenamiento ventilado. Extintores de polvo químico.", category: "gases" as SubstanceCategory },
  { commercialName: "Propano", chemicalName: "C₃H₈", casNumber: "74-98-6", hazardClass: ["inflamable", "explosiva"], unit: "cilindros", controlMeasures: "Almacenamiento al aire libre. Alejado de fuentes de ignición. Detectores de gas. Válvulas de seguridad. Conexiones verificadas. Extintores de polvo químico.", category: "gases" as SubstanceCategory },
  { commercialName: "Butano", chemicalName: "C₄H₁₀", casNumber: "106-97-8", hazardClass: ["inflamable", "explosiva"], unit: "cilindros", controlMeasures: "Almacenamiento al aire libre ventilado. Alejado de fuentes de ignición. Detectores de gas. Válvulas de seguridad. Extintores de polvo químico.", category: "gases" as SubstanceCategory },
  { commercialName: "Monóxido de Carbono", chemicalName: "CO", casNumber: "630-08-0", hazardClass: ["toxicidad_aguda", "inflamable"], unit: "cilindros", controlMeasures: "ASFIXIANTE. EPP: SCBA o suministro de aire. Detectores de CO obligatorios. Ventilación forzada. Sistema de alarma. Trabajo en parejas.", category: "gases" as SubstanceCategory },
  { commercialName: "Dióxido de Azufre", chemicalName: "SO₂", casNumber: "7446-09-5", hazardClass: ["toxicidad_aguda", "corrosiva"], unit: "cilindros", controlMeasures: "EPP: Respirador con cartucho para gases ácidos, gafas herméticas. Detectores de SO₂. Ventilación local exhaustiva. Neutralización de derrames.", category: "gases" as SubstanceCategory },
  { commercialName: "Sulfuro de Hidrógeno", chemicalName: "H₂S", casNumber: "7783-06-4", hazardClass: ["toxicidad_aguda", "inflamable"], unit: "cilindros", controlMeasures: "EXTREMADAMENTE TÓXICO. EPP: SCBA. Detectores de H₂S obligatorios. Ventilación forzada. Plan de rescate. Trabajo en parejas. Alejado de ignición.", category: "gases" as SubstanceCategory },
  { commercialName: "Fosgeno", chemicalName: "COCl₂", casNumber: "75-44-5", hazardClass: ["toxicidad_aguda", "corrosiva"], unit: "cilindros", controlMeasures: "EXTREMADAMENTE TÓXICO. EPP: SCBA, traje encapsulado. Sistema cerrado. Detectores de gas. Personal altamente capacitado. Plan de emergencia específico.", category: "gases" as SubstanceCategory },
  { commercialName: "Cloruro de Vinilo", chemicalName: "C₂H₃Cl", casNumber: "75-01-4", hazardClass: ["cancerígena", "inflamable", "mutagena"], unit: "cilindros", controlMeasures: "CARCINÓGENO. Sistema totalmente cerrado. EPP: SCBA. Detectores de gas. Alejado de fuentes de ignición. Monitoreo continuo. Vigilancia médica hepática.", category: "gases" as SubstanceCategory },
  { commercialName: "Óxido de Etileno", chemicalName: "C₂H₄O", casNumber: "75-21-8", hazardClass: ["cancerígena", "inflamable", "mutagena", "explosiva"], unit: "cilindros", controlMeasures: "CARCINÓGENO EXPLOSIVO. Sistema cerrado. EPP: SCBA. Detectores de gas. Alejado de ignición. Personal capacitado únicamente. Vigilancia médica.", category: "gases" as SubstanceCategory },
  { commercialName: "Plomo", chemicalName: "Pb", casNumber: "7439-92-1", hazardClass: ["cancerígena", "toxicidad_aguda", "teratogenica"], unit: "kg", controlMeasures: "CARCINÓGENO. EPP: Respirador con filtro P100, guantes, overol. Ventilación local exhaustiva. Monitoreo de plomo en sangre. Prohibido para mujeres embarazadas.", category: "metales" as SubstanceCategory },
  { commercialName: "Mercurio", chemicalName: "Hg", casNumber: "7439-97-6", hazardClass: ["toxicidad_aguda", "teratogenica"], unit: "kg", controlMeasures: "EPP: Respirador con cartucho para mercurio, guantes de nitrilo. Sistema cerrado. Kit de derrames. Monitoreo de mercurio en orina. Prohibido para mujeres embarazadas.", category: "metales" as SubstanceCategory },
  { commercialName: "Cadmio", chemicalName: "Cd", casNumber: "7440-43-9", hazardClass: ["cancerígena", "toxicidad_aguda", "mutagena"], unit: "kg", controlMeasures: "CARCINÓGENO. EPP: Respirador con filtro P100, traje protector. Ventilación local exhaustiva. Monitoreo biológico. Vigilancia médica periódica.", category: "metales" as SubstanceCategory },
  { commercialName: "Arsénico", chemicalName: "As", casNumber: "7440-38-2", hazardClass: ["cancerígena", "toxicidad_aguda", "mutagena"], unit: "kg", controlMeasures: "CARCINÓGENO. EPP: Respirador con filtro P100, traje Tyvek, guantes dobles. Sistema cerrado. Monitoreo biológico. Vigilancia médica. Área restringida.", category: "metales" as SubstanceCategory },
  { commercialName: "Cromo Hexavalente", chemicalName: "Cr(VI)", casNumber: "18540-29-9", hazardClass: ["cancerígena", "mutagena", "sensibilizante"], unit: "kg", controlMeasures: "CARCINÓGENO. EPP: Respirador con filtro P100, guantes de nitrilo, traje Tyvek. Ventilación local exhaustiva. Monitoreo biológico. Vigilancia médica.", category: "metales" as SubstanceCategory },
  { commercialName: "Níquel", chemicalName: "Ni", casNumber: "7440-02-0", hazardClass: ["cancerígena", "sensibilizante"], unit: "kg", controlMeasures: "CARCINÓGENO. EPP: Respirador con filtro P100, guantes. Ventilación local exhaustiva. Control de alergias. Vigilancia médica periódica.", category: "metales" as SubstanceCategory },
  { commercialName: "Formaldehído", chemicalName: "HCHO", casNumber: "50-00-0", hazardClass: ["cancerígena", "toxicidad_aguda", "sensibilizante"], unit: "L", controlMeasures: "EPP: Respirador con filtro para formaldehído, gafas herméticas, guantes de nitrilo. Cabina de extracción. Monitoreo de exposición ocupacional. Exámenes médicos periódicos.", category: "carcinogenos" as SubstanceCategory },
  { commercialName: "Benceno", chemicalName: "C₆H₆", casNumber: "71-43-2", hazardClass: ["cancerígena", "inflamable", "mutagena"], unit: "L", controlMeasures: "CARCINÓGENO: Minimizar exposición. Respirador con filtro orgánico, guantes de Viton. Sistema cerrado preferido. Monitoreo biológico. Vigilancia médica. Alejado de ignición.", category: "carcinogenos" as SubstanceCategory },
  { commercialName: "Asbesto/Amianto", chemicalName: "Silicatos fibrosos", casNumber: "1332-21-4", hazardClass: ["cancerígena"], unit: "kg", controlMeasures: "CARCINÓGENO PROHIBIDO. Solo personal certificado. EPP: Respirador con filtro P100, traje Tyvek desechable. Encapsulamiento húmedo. Disposición especial de residuos.", category: "carcinogenos" as SubstanceCategory },
  { commercialName: "Sílice Cristalina", chemicalName: "SiO₂", casNumber: "14808-60-7", hazardClass: ["cancerígena"], unit: "kg", controlMeasures: "CARCINÓGENO. EPP: Respirador con filtro P100. Métodos húmedos para reducir polvo. Ventilación local exhaustiva. Monitoreo de exposición. Vigilancia médica.", category: "carcinogenos" as SubstanceCategory },
  { commercialName: "Peróxido de Hidrógeno", chemicalName: "H₂O₂", casNumber: "7722-84-1", hazardClass: ["oxidante", "corrosiva", "irritante"], unit: "L", controlMeasures: "EPP: Gafas herméticas, guantes de PVC, delantal. Almacenar separado de combustibles y reductores. Recipientes ventilados. Evitar contaminación.", category: "oxidantes" as SubstanceCategory },
  { commercialName: "Nitrato de Amonio", chemicalName: "NH₄NO₃", casNumber: "6484-52-2", hazardClass: ["oxidante", "explosiva"], unit: "kg", controlMeasures: "Almacenar separado de combustibles y aceites. Lugar fresco y seco. Evitar contaminación. Cantidades mínimas. Alejado de fuentes de calor.", category: "explosivos" as SubstanceCategory },
  { commercialName: "Ácido Pícrico", chemicalName: "C₆H₃N₃O₇", casNumber: "88-89-1", hazardClass: ["explosiva", "toxicidad_aguda"], unit: "kg", controlMeasures: "EXPLOSIVO cuando seco. Mantener húmedo. Cantidades mínimas. Alejado de calor y fricción. Personal capacitado únicamente. Almacenamiento especial.", category: "explosivos" as SubstanceCategory },
  { commercialName: "Nitroglicerina", chemicalName: "C₃H₅N₃O₉", casNumber: "55-63-0", hazardClass: ["explosiva", "toxicidad_aguda"], unit: "kg", controlMeasures: "EXPLOSIVO SENSIBLE. Solo personal certificado. Cantidades mínimas. Almacenamiento especial refrigerado. Evitar golpes, fricción y calor.", category: "explosivos" as SubstanceCategory },
  { commercialName: "Cianuro de Sodio", chemicalName: "NaCN", casNumber: "143-33-9", hazardClass: ["toxicidad_aguda"], unit: "kg", controlMeasures: "EXTREMADAMENTE TÓXICO. EPP: SCBA, traje encapsulado. Antídoto disponible. Personal capacitado únicamente. NUNCA contacto con ácidos. Ducha de emergencia. Vigilancia médica estricta.", category: "otros" as SubstanceCategory },
  { commercialName: "Cianuro de Potasio", chemicalName: "KCN", casNumber: "151-50-8", hazardClass: ["toxicidad_aguda"], unit: "kg", controlMeasures: "EXTREMADAMENTE TÓXICO. EPP: SCBA, traje encapsulado. Antídoto disponible. Personal capacitado únicamente. NUNCA contacto con ácidos. Vigilancia médica estricta.", category: "otros" as SubstanceCategory },
  { commercialName: "Otra sustancia (especificar)", chemicalName: "", casNumber: "", hazardClass: [], unit: "", controlMeasures: "", category: "otros" as SubstanceCategory },
];

export default function SustanciasQuimicas() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [lastPlanTrabajoId, setLastPlanTrabajoId] = useState<string | null>(null);
  const [lastCronogramaMes, setLastCronogramaMes] = useState<string | null>(null);

  useEffect(() => {
    const savedId = localStorage.getItem("lastPlanTrabajoId");
    const savedMes = localStorage.getItem("lastCronogramaMes");
    if (savedId) {
      setLastPlanTrabajoId(savedId);
    }
    if (savedMes) {
      setLastCronogramaMes(savedMes);
    }
  }, []);
  const [classFilter, setClassFilter] = useState<string>("todas");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [substanceComboboxOpen, setSubstanceComboboxOpen] = useState(false);
  const [substanceSearchTerm, setSubstanceSearchTerm] = useState("");
  const [showIpercSuggestion, setShowIpercSuggestion] = useState(false);
  const [lastCreatedSubstance, setLastCreatedSubstance] = useState<{
    commercialName: string;
    chemicalName: string;
    hazardClass: string[];
    controlMeasures: string;
    storageLocation: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    commercialName: "",
    chemicalName: "",
    casNumber: "",
    hazardClass: [] as string[],
    quantity: "",
    unit: "",
    storageLocation: "",
    sdsUrl: "",
    controlMeasures: "",
    observations: "",
  });

  const filteredGroupedSubstances = useMemo(() => {
    const search = substanceSearchTerm.toLowerCase().trim();
    const filtered = sustanciasQuimicasPredefinidas.filter(s => {
      if (!search) return true;
      return (
        s.commercialName.toLowerCase().includes(search) ||
        s.chemicalName.toLowerCase().includes(search) ||
        s.casNumber.toLowerCase().includes(search)
      );
    });
    
    const grouped: Record<SubstanceCategory, typeof sustanciasQuimicasPredefinidas> = {
      acidos: [], bases: [], solventes: [], combustibles: [], gases: [],
      metales: [], carcinogenos: [], explosivos: [], oxidantes: [], otros: []
    };
    
    filtered.forEach(s => {
      if (grouped[s.category]) {
        grouped[s.category].push(s);
      }
    });
    
    return grouped;
  }, [substanceSearchTerm]);

  const { data: substances = [], isLoading: substancesLoading } = useQuery<HazardousSubstance[]>({
    queryKey: ["/api/hazardous-substances"],
  });

  const createSubstanceMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertHazardousSubstanceSchema>) => {
      const res = await apiRequest("POST", "/api/hazardous-substances", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hazardous-substances"] });
      
      const hasHighRiskClass = formData.hazardClass.some(hc => 
        ["cancerígena", "toxicidad_aguda", "mutagena", "teratogenica", "explosiva"].includes(hc)
      );
      
      if (hasHighRiskClass) {
        setLastCreatedSubstance({
          commercialName: formData.commercialName,
          chemicalName: formData.chemicalName,
          hazardClass: formData.hazardClass,
          controlMeasures: formData.controlMeasures,
          storageLocation: formData.storageLocation,
        });
        setShowIpercSuggestion(true);
      }
      
      setDialogOpen(false);
      setFormData({
        commercialName: "",
        chemicalName: "",
        casNumber: "",
        hazardClass: [],
        quantity: "",
        unit: "",
        storageLocation: "",
        sdsUrl: "",
        controlMeasures: "",
        observations: "",
      });
      toast({
        title: "Sustancia registrada",
        description: "La sustancia química se ha registrado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteSubstanceMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/hazardous-substances/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hazardous-substances"] });
      toast({
        title: "Sustancia eliminada",
        description: "La sustancia se ha eliminado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createSubstanceMutation.mutate({
      ...formData,
      chemicalName: formData.chemicalName || undefined,
      casNumber: formData.casNumber || undefined,
      sdsUrl: formData.sdsUrl || undefined,
      observations: formData.observations || undefined,
    });
  };

  const handlePrintInventory = async () => {
    try {
      const response = await fetch('/api/hazardous-substances-inventory/pdf', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error('Error al generar el PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      
      toast({
        title: "PDF generado",
        description: "El inventario de sustancias químicas se ha generado correctamente.",
        className: "bg-yellow-50 border-yellow-200",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo generar el PDF",
        variant: "destructive",
      });
    }
  };

  const filteredSubstances = substances.filter((substance) => {
    const matchesSearch = 
      (substance.commercialName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (substance.chemicalName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (substance.casNumber || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === "todas" || substance.hazardClass.includes(classFilter as any);
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {lastPlanTrabajoId ? (
          <Link 
            href={`/planes-trabajo-anual/${lastPlanTrabajoId}?tab=mensual${lastCronogramaMes ? `&mes=${lastCronogramaMes}` : ''}`} 
            className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm" 
            data-testid="link-volver-cronograma"
          >
            Volver al cronograma
            <CalendarDays className="h-4 w-4" />
          </Link>
        ) : (
          <Link 
            href="/planes-trabajo-anual" 
            className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm" 
            data-testid="link-volver-cronograma"
          >
            Volver al Plan Anual
            <CalendarDays className="h-4 w-4" />
          </Link>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/evaluaciones-sst")}
            title="Volver a Evaluaciones SST"
            data-testid="button-back-evaluaciones"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-page-title">Inventario de Sustancias Químicas Peligrosas</h1>
            <p className="text-muted-foreground">Gestión de agentes químicos y fichas de seguridad (SDS)</p>
          </div>
        </div>
        <AutomationAssistant
          titulo="Sustancias Químicas Peligrosas"
          estandar="2.7.1"
          descripcion="Gestión de agentes químicos según SGA (Decreto 1496/2018) y GHS"
          normativaAplicable={normativaSustanciasQuimicas}
          compact={true}
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePrintInventory}
            data-testid="button-print-inventory"
            title="Imprimir inventario completo"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir Inventario
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-substance">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Sustancia
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Sustancia Química Peligrosa</DialogTitle>
              <DialogDescription>Complete los datos de la sustancia química</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="commercialName">Sustancia Química</Label>
                  <Popover open={substanceComboboxOpen} onOpenChange={setSubstanceComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={substanceComboboxOpen}
                        className="w-full justify-between font-normal"
                        data-testid="select-commercial-name"
                      >
                        {formData.commercialName || "Buscar por nombre, fórmula o CAS..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[500px] p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput 
                          placeholder="Escriba nombre comercial, fórmula o número CAS..." 
                          value={substanceSearchTerm}
                          onValueChange={setSubstanceSearchTerm}
                          data-testid="input-substance-search"
                        />
                        <CommandList className="max-h-[400px]">
                          <CommandEmpty>
                            <div className="py-6 text-center text-sm">
                              <p className="text-muted-foreground">No se encontraron sustancias</p>
                              <p className="text-xs text-muted-foreground mt-1">Intente con otro término o seleccione "Otra sustancia"</p>
                            </div>
                          </CommandEmpty>
                          {categoryOrder.map((category) => {
                            const items = filteredGroupedSubstances[category];
                            if (items.length === 0) return null;
                            return (
                              <CommandGroup key={category} heading={categoryLabels[category]}>
                                {items.map((sustancia) => (
                                  <CommandItem
                                    key={sustancia.commercialName}
                                    value={sustancia.commercialName}
                                    onSelect={() => {
                                      setFormData({
                                        ...formData,
                                        commercialName: sustancia.commercialName,
                                        chemicalName: sustancia.chemicalName,
                                        casNumber: sustancia.casNumber,
                                        hazardClass: sustancia.hazardClass,
                                        unit: sustancia.unit,
                                        controlMeasures: sustancia.controlMeasures,
                                      });
                                      setSubstanceComboboxOpen(false);
                                      setSubstanceSearchTerm("");
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex items-center justify-between w-full gap-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <Check
                                            className={cn(
                                              "h-4 w-4 shrink-0",
                                              formData.commercialName === sustancia.commercialName ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          <span className="font-medium truncate">{sustancia.commercialName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground ml-6">
                                          <span>{sustancia.chemicalName}</span>
                                          {sustancia.casNumber && (
                                            <>
                                              <span>•</span>
                                              <span>CAS: {sustancia.casNumber}</span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex gap-1 shrink-0">
                                        {sustancia.hazardClass.slice(0, 2).map((hc) => {
                                          const Icon = hazardClassIcons[hc] || AlertTriangle;
                                          return (
                                            <div 
                                              key={hc} 
                                              className={cn("p-1 rounded", hazardClassColors[hc])}
                                              title={hazardClassLabels[hc]}
                                            >
                                              <Icon className="h-3 w-3" />
                                            </div>
                                          );
                                        })}
                                        {sustancia.hazardClass.length > 2 && (
                                          <span className="text-xs text-muted-foreground">+{sustancia.hazardClass.length - 2}</span>
                                        )}
                                      </div>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            );
                          })}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chemicalName">Nombre Químico</Label>
                  <Input
                    id="chemicalName"
                    value={formData.chemicalName}
                    onChange={(e) => setFormData({ ...formData, chemicalName: e.target.value })}
                    placeholder="Se llena automáticamente"
                    data-testid="input-chemical-name"
                    readOnly={formData.commercialName !== "Otra sustancia (especificar)"}
                    className={formData.commercialName !== "Otra sustancia (especificar)" ? "bg-muted" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="casNumber">Número CAS</Label>
                  <Input
                    id="casNumber"
                    value={formData.casNumber}
                    onChange={(e) => setFormData({ ...formData, casNumber: e.target.value })}
                    placeholder="Se llena automáticamente"
                    data-testid="input-cas-number"
                    readOnly={formData.commercialName !== "Otra sustancia (especificar)"}
                    className={formData.commercialName !== "Otra sustancia (especificar)" ? "bg-muted" : ""}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Clasificaciones de Peligro (seleccione todas las aplicables)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      { value: "cancerígena", label: "Cancerígena" },
                      { value: "toxicidad_aguda", label: "Toxicidad Aguda" },
                      { value: "corrosiva", label: "Corrosiva" },
                      { value: "inflamable", label: "Inflamable" },
                      { value: "explosiva", label: "Explosiva" },
                      { value: "oxidante", label: "Oxidante" },
                      { value: "irritante", label: "Irritante" },
                      { value: "sensibilizante", label: "Sensibilizante" },
                      { value: "mutagena", label: "Mutagénica" },
                      { value: "teratogenica", label: "Teratogénica" },
                    ].map((hazard) => (
                      <div key={hazard.value} className="flex items-center gap-2">
                        <input
                          id={`hazard-${hazard.value}`}
                          type="checkbox"
                          checked={formData.hazardClass.includes(hazard.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, hazardClass: [...formData.hazardClass, hazard.value] });
                            } else {
                              setFormData({ ...formData, hazardClass: formData.hazardClass.filter(h => h !== hazard.value) });
                            }
                          }}
                          className="h-4 w-4"
                          data-testid={`checkbox-hazard-${hazard.value}`}
                        />
                        <Label htmlFor={`hazard-${hazard.value}`} className="cursor-pointer text-sm">
                          {hazard.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storageLocation">Ubicación de Almacenamiento</Label>
                  <Input
                    id="storageLocation"
                    value={formData.storageLocation}
                    onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                    required
                    placeholder="Ej: Bodega A - Estante 3"
                    data-testid="input-storage-location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input
                    id="quantity"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="Ej: 50"
                    data-testid="input-quantity"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unidad</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  >
                    <SelectTrigger 
                      data-testid="select-unit"
                      className={formData.commercialName && formData.commercialName !== "Otra sustancia (especificar)" ? "bg-muted" : ""}
                    >
                      <SelectValue placeholder="Se llena automáticamente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilogramos (kg)</SelectItem>
                      <SelectItem value="g">Gramos (g)</SelectItem>
                      <SelectItem value="lb">Libras (lb)</SelectItem>
                      <SelectItem value="L">Litros (L)</SelectItem>
                      <SelectItem value="mL">Mililitros (mL)</SelectItem>
                      <SelectItem value="gal">Galones (gal)</SelectItem>
                      <SelectItem value="m³">Metros cúbicos (m³)</SelectItem>
                      <SelectItem value="ton">Toneladas (ton)</SelectItem>
                      <SelectItem value="unidades">Unidades</SelectItem>
                      <SelectItem value="cilindros">Cilindros</SelectItem>
                      <SelectItem value="tambores">Tambores</SelectItem>
                      <SelectItem value="canecas">Canecas</SelectItem>
                      <SelectItem value="bolsas">Bolsas</SelectItem>
                      <SelectItem value="sacos">Sacos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="sdsUrl">Enlace a Ficha de Seguridad (SDS) - Opcional</Label>
                  <Input
                    id="sdsUrl"
                    type="url"
                    value={formData.sdsUrl}
                    onChange={(e) => setFormData({ ...formData, sdsUrl: e.target.value })}
                    placeholder="https://ejemplo.com/sds/acido-sulfurico.pdf"
                    data-testid="input-sds-url"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="controlMeasures">Medidas de Control</Label>
                  <Textarea
                    id="controlMeasures"
                    value={formData.controlMeasures}
                    onChange={(e) => setFormData({ ...formData, controlMeasures: e.target.value })}
                    placeholder="Se llenan automáticamente al seleccionar sustancia"
                    className={formData.commercialName && formData.commercialName !== "Otra sustancia (especificar)" ? "bg-muted" : ""}
                    data-testid="input-control-measures"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="observations">Observaciones (opcional)</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    placeholder="Información adicional"
                    data-testid="input-observations"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createSubstanceMutation.isPending} data-testid="button-submit-substance">
                  {createSubstanceMutation.isPending ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o CAS..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search-substances"
          />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-[220px]" data-testid="select-class-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Clasificación" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las clasificaciones</SelectItem>
            <SelectItem value="toxico">Tóxico</SelectItem>
            <SelectItem value="corrosivo">Corrosivo</SelectItem>
            <SelectItem value="inflamable">Inflamable</SelectItem>
            <SelectItem value="explosivo">Explosivo</SelectItem>
            <SelectItem value="irritante">Irritante</SelectItem>
            <SelectItem value="cancerigeno">Cancerígeno</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {substancesLoading ? (
          <div className="col-span-full text-center text-muted-foreground">Cargando sustancias...</div>
        ) : filteredSubstances.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground" data-testid="text-no-substances">
            No se encontraron sustancias químicas
          </div>
        ) : (
          filteredSubstances.map((substance) => {
            const primaryHazard = substance.hazardClass[0];
            const Icon = hazardClassIcons[primaryHazard] || AlertTriangle;
            return (
              <Card key={substance.id} data-testid={`card-substance-${substance.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${hazardClassColors[primaryHazard] || "bg-gray-500/10 text-gray-700"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{substance.commercialName || substance.chemicalName || "Sin nombre"}</CardTitle>
                        {substance.chemicalName && substance.commercialName !== substance.chemicalName && (
                          <CardDescription className="text-xs">{substance.chemicalName}</CardDescription>
                        )}
                        {substance.casNumber && (
                          <CardDescription className="text-xs">CAS: {substance.casNumber}</CardDescription>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-1 flex-wrap">
                    {substance.hazardClass.map((hazard, idx) => (
                      <Badge key={idx} className={hazardClassColors[hazard] || "bg-gray-500/10"}>
                        {hazardClassLabels[hazard] || hazard}
                      </Badge>
                    ))}
                  </div>
                  <div className="space-y-2 text-sm">
                    {substance.quantity && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cantidad:</span>
                        <span className="font-medium">{substance.quantity} {substance.unit || ""}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ubicación:</span>
                      <span className="text-xs">{substance.storageLocation}</span>
                    </div>
                  </div>
                  {substance.sdsUrl && (
                    <a 
                      href={substance.sdsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-xs text-primary hover:underline"
                      data-testid={`link-sds-${substance.id}`}
                    >
                      📄 Ver Ficha de Seguridad (SDS)
                    </a>
                  )}
                  {substance.controlMeasures && (
                    <div className="border-t pt-2 mt-2">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Medidas de control:</p>
                      <p className="text-xs">{substance.controlMeasures}</p>
                    </div>
                  )}
                  {substance.observations && (
                    <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
                      {substance.observations}
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => deleteSubstanceMutation.mutate(substance.id)}
                    disabled={deleteSubstanceMutation.isPending}
                    data-testid={`button-delete-${substance.id}`}
                  >
                    Eliminar
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Diálogo de sugerencia para crear riesgo en IPERC */}
      <Dialog open={showIpercSuggestion} onOpenChange={setShowIpercSuggestion}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Sustancia de Alto Riesgo Detectada
            </DialogTitle>
            <DialogDescription>
              La sustancia <strong>{lastCreatedSubstance?.commercialName}</strong> tiene clasificaciones de alto riesgo que requieren evaluación en la matriz IPERC.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                Clasificaciones detectadas:
              </p>
              <div className="flex flex-wrap gap-1">
                {lastCreatedSubstance?.hazardClass.map((hc) => (
                  <Badge 
                    key={hc} 
                    variant="secondary" 
                    className={cn("text-xs", hazardClassColors[hc])}
                  >
                    {hazardClassLabels[hc] || hc}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Datos que se pre-llenarán en IPERC:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <strong>Clasificación:</strong> Peligro Químico</li>
                <li>• <strong>Descripción:</strong> Exposición a {lastCreatedSubstance?.commercialName} ({lastCreatedSubstance?.chemicalName})</li>
                <li>• <strong>Fuente generadora:</strong> Almacenamiento/uso de sustancia química</li>
                <li>• <strong>Controles propuestos:</strong> {lastCreatedSubstance?.controlMeasures?.substring(0, 80)}...</li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground">
              ¿Desea crear el riesgo correspondiente en la matriz IPERC?
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowIpercSuggestion(false)}
              data-testid="button-skip-iperc"
            >
              Omitir por ahora
            </Button>
            <Button
              onClick={() => {
                const params = new URLSearchParams({
                  fromSubstance: "true",
                  commercialName: lastCreatedSubstance?.commercialName || "",
                  chemicalName: lastCreatedSubstance?.chemicalName || "",
                  hazardClass: lastCreatedSubstance?.hazardClass.join(",") || "",
                  controlMeasures: lastCreatedSubstance?.controlMeasures || "",
                  storageLocation: lastCreatedSubstance?.storageLocation || "",
                });
                setShowIpercSuggestion(false);
                setLocation(`/iperc?${params.toString()}`);
              }}
              className="bg-amber-600 hover:bg-amber-700"
              data-testid="button-go-to-iperc"
            >
              <FlaskConical className="mr-2 h-4 w-4" />
              Ir a IPERC y crear riesgo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

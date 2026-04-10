import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Pencil, Trash2, ArrowLeft, Route, Zap, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SafeRoute, insertSafeRouteSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useCompanyContext } from "@/hooks/use-company-context";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { hasCompanyAdminAccess } from "@shared/permissions";
import { BackToPesvEvaluationButton } from "@/components/BackToPesvEvaluationButton";
import { Link } from "wouter";
import { TrazabilidadPesvBanner } from "@/components/pesv/TrazabilidadPesvBanner";

interface RutaPredefinida {
  routeName: string;
  origin: string;
  destination: string;
  distance: number;
  estimatedTime: number;
  routeType: "urbana" | "rural" | "mixta" | "autopista";
  riskLevel: "bajo" | "medio" | "alto" | "muy_alto";
  criticalPoints: string;
  speedLimits: string;
  restStops: string;
  emergencyContacts: string;
  restrictions: string;
  observations: string;
}

const RUTAS_PREDEFINIDAS: RutaPredefinida[] = [
  {
    routeName: "Bogotá - Medellín (Autopista del Magdalena Medio)",
    origin: "Bogotá D.C.",
    destination: "Medellín, Antioquia",
    distance: 415,
    estimatedTime: 480,
    routeType: "autopista",
    riskLevel: "alto",
    criticalPoints: "Alto de La Línea (descenso prolongado), Puente sobre Río Magdalena, curvas cerradas sector Cocorná-Santuario, zona de niebla Guarne-Medellín",
    speedLimits: "Km 0-30 Bogotá: 60km/h, Km 30-100 Honda: 80km/h, Km 100-300 Autopista: 100km/h, Km 300-415 ingreso Medellín: 60km/h",
    restStops: "Peaje Fontibón, Estación de servicio Guaduas, Peaje Puerto Triunfo, Estación Doradal, Peaje Cisneros",
    emergencyContacts: "Línea 123, Hospital San Juan de Dios (Honda): (1) 854-3000, Hospital Pablo Tobón Uribe (Medellín): (4) 445-9000, Bomberos Medellín: (4) 444-4444",
    restrictions: "Restricción de carga pesada en horario nocturno sector montañoso. Precaución por lluvias en temporada abril-mayo y octubre-noviembre",
    observations: "Ruta principal entre las dos ciudades más grandes. Peajes electrónicos disponibles. Señalización reflectiva en buen estado",
  },
  {
    routeName: "Bogotá - Cali (Vía Ibagué - Armenia)",
    origin: "Bogotá D.C.",
    destination: "Cali, Valle del Cauca",
    distance: 460,
    estimatedTime: 540,
    routeType: "autopista",
    riskLevel: "alto",
    criticalPoints: "Alto de La Línea (túnel y descensos), curvas sector Calarcá, paso por Buga, zona de neblina en páramo",
    speedLimits: "Km 0-40 salida Bogotá: 60km/h, Km 40-130 autopista: 100km/h, Km 130-200 montaña: 40km/h, Km 200-350: 80km/h, Km 350-460 ingreso Cali: 60km/h",
    restStops: "Peaje Chipaque, Estación Melgar, Peaje Gualanday, Estación Calarcá, Peaje Buga, Estación Palmira",
    emergencyContacts: "Línea 123, Hospital Federico Lleras (Ibagué): (8) 264-0444, Hospital San Juan de Dios (Armenia): (6) 744-0044, Clínica Valle del Lili (Cali): (2) 331-9090",
    restrictions: "Restricción vehicular Túnel de La Línea para carga sobredimensionada. Requiere permisos especiales",
    observations: "Túnel de La Línea (8.65 km) reduce tiempo significativamente. Precaución zona de derrumbes en temporada de lluvias",
  },
  {
    routeName: "Bogotá - Bucaramanga",
    origin: "Bogotá D.C.",
    destination: "Bucaramanga, Santander",
    distance: 420,
    estimatedTime: 480,
    routeType: "mixta",
    riskLevel: "alto",
    criticalPoints: "Curvas del sector Oiba-Socorro, descenso a Chicamocha, zona de derrumbes Barbosa-Oiba, puente sobre cañón del Chicamocha",
    speedLimits: "Km 0-40 Bogotá: 60km/h, Km 40-150 Tunja: 80km/h, Km 150-300 montaña: 60km/h, Km 300-420 Bucaramanga: 60km/h",
    restStops: "Peaje Albarracín, Estación Tunja, Peaje Oiba, Estación Socorro, Peaje Pescadero, Peaje Piedecuesta",
    emergencyContacts: "Línea 123, Hospital San Rafael (Tunja): (8) 740-5858, Hospital Universitario Santander (Bucaramanga): (7) 634-6110",
    restrictions: "Vía de montaña con tramos de un solo carril. Precaución con vehículos de carga pesada en pendientes",
    observations: "Paisaje espectacular del Cañón del Chicamocha. Vía en proceso de doble calzada en varios tramos",
  },
  {
    routeName: "Bogotá - Tunja",
    origin: "Bogotá D.C.",
    destination: "Tunja, Boyacá",
    distance: 130,
    estimatedTime: 150,
    routeType: "autopista",
    riskLevel: "medio",
    criticalPoints: "Peaje Albarracín (congestión), curvas sector Ventaquemada, zona de neblina páramo Boyacá",
    speedLimits: "Km 0-20 salida Bogotá: 60km/h, Km 20-110 autopista: 100km/h, Km 110-130 ingreso Tunja: 60km/h",
    restStops: "Peaje Albarracín, Estación Ventaquemada, Estación de servicio km 80",
    emergencyContacts: "Línea 123, Hospital San Rafael (Tunja): (8) 740-5858, Cruz Roja Boyacá: (8) 742-3839",
    restrictions: "Congestión frecuente en puentes festivos y fines de semana",
    observations: "Doble calzada completa. Alta frecuencia de tráfico pesado",
  },
  {
    routeName: "Bogotá - Villavicencio",
    origin: "Bogotá D.C.",
    destination: "Villavicencio, Meta",
    distance: 120,
    estimatedTime: 150,
    routeType: "mixta",
    riskLevel: "alto",
    criticalPoints: "Descenso de Chipaque (curvas cerradas y pendientes pronunciadas), zona de neblina páramo, sector Guayabetal-Villavicencio (derrumbes frecuentes)",
    speedLimits: "Km 0-20 Bogotá: 60km/h, Km 20-50 montaña: 40km/h, Km 50-90 descenso: 30km/h, Km 90-120 llano: 80km/h",
    restStops: "Peaje Boquerón, Estación Chipaque, Peaje Naranjal, Estación Guayabetal, Peaje Pipiral",
    emergencyContacts: "Línea 123, Hospital Departamental Villavicencio: (8) 664-7777, Bomberos Villavicencio: (8) 662-2222",
    restrictions: "Restricción de carga pesada en horarios pico. Cierre frecuente por derrumbes en temporada de lluvias",
    observations: "Vía de alta accidentalidad. Túneles de Bijagual y Buenavista. Usar baja velocidad en descensos",
  },
  {
    routeName: "Bogotá - Girardot",
    origin: "Bogotá D.C.",
    destination: "Girardot, Cundinamarca",
    distance: 134,
    estimatedTime: 150,
    routeType: "autopista",
    riskLevel: "medio",
    criticalPoints: "Curvas sector Silvania-Fusagasugá, descenso a tierra caliente, peaje El Roble (congestión fines de semana)",
    speedLimits: "Km 0-30 Bogotá: 60km/h, Km 30-80 autopista: 80km/h, Km 80-110 descenso: 60km/h, Km 110-134 Girardot: 60km/h",
    restStops: "Peaje Chusacá, Estación Silvania, Peaje Chinauta, Estación Melgar km 100",
    emergencyContacts: "Línea 123, Hospital San Rafael (Fusagasugá): (1) 867-1600, Hospital de Girardot: (1) 833-0210",
    restrictions: "Alta congestión en puentes festivos. Restricción pico y placa regional ocasional",
    observations: "Ruta turística de alto tráfico. Doble calzada en gran parte del trayecto",
  },
  {
    routeName: "Medellín - Cali",
    origin: "Medellín, Antioquia",
    destination: "Cali, Valle del Cauca",
    distance: 415,
    estimatedTime: 510,
    routeType: "mixta",
    riskLevel: "alto",
    criticalPoints: "Paso por La Pintada (curvas), sector La Virginia-Pereira, descenso La Paila, cruce por ciudades intermedias",
    speedLimits: "Km 0-30 Medellín: 60km/h, Km 30-150 montaña: 60km/h, Km 150-300 eje cafetero: 80km/h, Km 300-415 Valle: 80km/h",
    restStops: "Peaje Amagá, Estación La Pintada, Peaje La Virginia, Estación Pereira, Peaje La Paila, Estación Tuluá",
    emergencyContacts: "Línea 123, Hospital San Vicente (Medellín): (4) 444-1333, Hospital San Jorge (Pereira): (6) 335-8199, Clínica Valle del Lili (Cali): (2) 331-9090",
    restrictions: "Tramos de una sola vía en sectores montañosos. Carga pesada restringida en horarios pico",
    observations: "Ruta atraviesa el Eje Cafetero con paisaje cultural cafetero (Patrimonio UNESCO)",
  },
  {
    routeName: "Medellín - Cartagena",
    origin: "Medellín, Antioquia",
    destination: "Cartagena, Bolívar",
    distance: 635,
    estimatedTime: 660,
    routeType: "autopista",
    riskLevel: "medio",
    criticalPoints: "Sector Don Matías-Caucasia (curvas montañosas), cruce Sincelejo (tráfico urbano), puente sobre Río Sinú",
    speedLimits: "Km 0-40 Medellín: 60km/h, Km 40-200 montaña: 80km/h, Km 200-500 planicie: 100km/h, Km 500-635 costa: 80km/h",
    restStops: "Peaje Don Matías, Estación Caucasia, Peaje Sincelejo, Estación Toluviejo, Peaje Turbaco",
    emergencyContacts: "Línea 123, Hospital Caucasia: (4) 839-2020, Hospital Universitario Cartagena: (5) 669-8585, Bomberos Cartagena: (5) 664-3333",
    restrictions: "Zona de alta temperatura. Hidratación obligatoria para conductores. Precaución con ganado en vía sector Córdoba",
    observations: "Ruta larga pero en buen estado. Llevar suficiente agua y combustible para tramos largos sin servicios",
  },
  {
    routeName: "Medellín - Bogotá (Vía Autopista Medellín-Bogotá)",
    origin: "Medellín, Antioquia",
    destination: "Bogotá D.C.",
    distance: 415,
    estimatedTime: 480,
    routeType: "autopista",
    riskLevel: "alto",
    criticalPoints: "Túnel de Occidente, sector Cocorná (neblina), Alto de Las Palmas, zona de derrumbes sector Guarne",
    speedLimits: "Km 0-30 Medellín: 60km/h, Km 30-200 autopista: 80km/h, Km 200-380 autopista: 100km/h, Km 380-415 Bogotá: 60km/h",
    restStops: "Peaje Las Palmas, Estación Santuario, Peaje Cocorná, Estación Puerto Triunfo, Peaje Doradal, Estación Honda",
    emergencyContacts: "Línea 123, Hospital Pablo Tobón Uribe (Medellín): (4) 445-9000, Hospital Cocorná: (4) 855-6016, Clínica Shaio (Bogotá): (1) 593-8210",
    restrictions: "Precaución en temporada de lluvias por derrumbes. Túnel de Occidente con restricción para mercancías peligrosas",
    observations: "Ruta troncal principal del país. Vía 4G con mejoras significativas. Tiempo estimado puede variar por condiciones climáticas",
  },
  {
    routeName: "Cali - Buenaventura",
    origin: "Cali, Valle del Cauca",
    destination: "Buenaventura, Valle del Cauca",
    distance: 142,
    estimatedTime: 210,
    routeType: "mixta",
    riskLevel: "muy_alto",
    criticalPoints: "Sector Loboguerrero (derrumbes frecuentes), curvas cerradas sector Cisneros, zona de niebla densa, tramos sin berma",
    speedLimits: "Km 0-20 Cali: 60km/h, Km 20-80 montaña: 40km/h, Km 80-120 descenso: 30km/h, Km 120-142 Buenaventura: 50km/h",
    restStops: "Peaje Mediacanoa, Estación Loboguerrero, Peaje Cisneros, Estación km 100",
    emergencyContacts: "Línea 123, Clínica Valle del Lili (Cali): (2) 331-9090, Hospital Distrital Buenaventura: (2) 243-6900, Bomberos: 119",
    restrictions: "Vía de alto riesgo por derrumbes. Cierre frecuente por condiciones climáticas. Prohibido vehículos sobredimensionados sin escolta",
    observations: "Puerto más importante del Pacífico colombiano. Ruta de carga pesada con alta accidentalidad. Conducir solo en horario diurno recomendado",
  },
  {
    routeName: "Cali - Popayán",
    origin: "Cali, Valle del Cauca",
    destination: "Popayán, Cauca",
    distance: 140,
    estimatedTime: 180,
    routeType: "autopista",
    riskLevel: "medio",
    criticalPoints: "Sector Piendamó (curvas), cruce urbano Santander de Quilichao, zona de protestas sociales ocasionales",
    speedLimits: "Km 0-20 Cali: 60km/h, Km 20-100 Panamericana: 80km/h, Km 100-140 ingreso Popayán: 60km/h",
    restStops: "Peaje Villarrica, Estación Santander de Quilichao, Peaje Piendamó, Estación km 110",
    emergencyContacts: "Línea 123, Hospital Universitario del Valle (Cali): (2) 620-6868, Hospital San José (Popayán): (2) 824-1790",
    restrictions: "Vía Panamericana con alto tráfico de carga. Bloqueos ocasionales por manifestaciones",
    observations: "Corredor de la Panamericana. Doble calzada en gran parte. Popayán es Patrimonio UNESCO",
  },
  {
    routeName: "Cali - Pasto (Panamericana Sur)",
    origin: "Cali, Valle del Cauca",
    destination: "Pasto, Nariño",
    distance: 430,
    estimatedTime: 540,
    routeType: "mixta",
    riskLevel: "muy_alto",
    criticalPoints: "Sector El Bordo-Mojarras (curvas extremas y precipicios), zona volcánica Galeras, descenso a Pasto, tramos sin protección lateral",
    speedLimits: "Km 0-140 Cali-Popayán: 80km/h, Km 140-300 montaña: 40km/h, Km 300-400 altiplano: 60km/h, Km 400-430 Pasto: 50km/h",
    restStops: "Estación Popayán, Peaje El Bordo, Estación Mercaderes, Peaje Chachagüí, Estación km 380",
    emergencyContacts: "Línea 123, Hospital San José (Popayán): (2) 824-1790, Hospital Universitario Departamental (Pasto): (2) 723-3710",
    restrictions: "Vía de alta montaña con peligro permanente de derrumbes. Niebla densa frecuente. Restricción nocturna recomendada",
    observations: "Ruta hacia frontera con Ecuador. Alta accidentalidad histórica. Volcán Galeras activo cerca de la ruta",
  },
  {
    routeName: "Barranquilla - Cartagena",
    origin: "Barranquilla, Atlántico",
    destination: "Cartagena, Bolívar",
    distance: 120,
    estimatedTime: 120,
    routeType: "autopista",
    riskLevel: "bajo",
    criticalPoints: "Peaje Galapa (congestión), cruce urbano en Luruaco, zona de vientos fuertes sector costero",
    speedLimits: "Km 0-15 Barranquilla: 60km/h, Km 15-100 autopista: 100km/h, Km 100-120 Cartagena: 60km/h",
    restStops: "Peaje Galapa, Estación Luruaco, Peaje Bayunca, Estación Turbaco",
    emergencyContacts: "Línea 123, Hospital General Barranquilla: (5) 340-1040, Hospital Universitario Cartagena: (5) 669-8585",
    restrictions: "Doble calzada completa. Precaución con peatones en zonas urbanas intermedias",
    observations: "Corredor entre las dos principales ciudades de la Costa Caribe. Autopista en excelente estado",
  },
  {
    routeName: "Barranquilla - Santa Marta",
    origin: "Barranquilla, Atlántico",
    destination: "Santa Marta, Magdalena",
    distance: 100,
    estimatedTime: 90,
    routeType: "autopista",
    riskLevel: "bajo",
    criticalPoints: "Vía al mar con vientos cruzados, sector Ciénaga (zona urbana), puente sobre Río Magdalena",
    speedLimits: "Km 0-15 Barranquilla: 60km/h, Km 15-80 autopista: 100km/h, Km 80-100 Santa Marta: 60km/h",
    restStops: "Peaje Tasajera, Estación Ciénaga km 50, Estación Gaira km 90",
    emergencyContacts: "Línea 123, Hospital General Barranquilla: (5) 340-1040, Hospital Julio Méndez (Santa Marta): (5) 438-0400",
    restrictions: "Alta temperatura. Hidratación obligatoria. Precaución con ciclistas en zonas rurales",
    observations: "Ruta costera con vista al mar Caribe. Doble calzada. Acceso a parques naturales",
  },
  {
    routeName: "Bogotá - Cartagena (Ruta del Sol)",
    origin: "Bogotá D.C.",
    destination: "Cartagena, Bolívar",
    distance: 1050,
    estimatedTime: 960,
    routeType: "autopista",
    riskLevel: "alto",
    criticalPoints: "Sector Villeta-Honda (curvas montañosas), paso por Aguachica (zona urbana densa), cruce río Magdalena, zona de alta temperatura Cesar-Bolívar",
    speedLimits: "Km 0-40 Bogotá: 60km/h, Km 40-200 montaña: 80km/h, Km 200-800 Ruta del Sol: 100km/h, Km 800-1050 costa: 80km/h",
    restStops: "Estación Villeta, Peaje Honda, Estación Aguachica, Peaje Bosconia, Estación El Carmen, Peaje Turbaco",
    emergencyContacts: "Línea 123, Hospitales en ruta cada 100km aprox., Hospital Universitario Cartagena: (5) 669-8585",
    restrictions: "Ruta larga. Paradas obligatorias cada 4 horas para descanso del conductor según Resolución 1565/2014",
    observations: "Principal corredor terrestre Bogotá-Costa. Combinar con estadías nocturnas para viajes seguros",
  },
  {
    routeName: "Pereira - Armenia",
    origin: "Pereira, Risaralda",
    destination: "Armenia, Quindío",
    distance: 47,
    estimatedTime: 50,
    routeType: "autopista",
    riskLevel: "bajo",
    criticalPoints: "Autopista del Café con tráfico denso en horas pico, peaje Circasia (congestión), zona cafetera con neblina matutina",
    speedLimits: "Km 0-10 Pereira: 60km/h, Km 10-40 autopista: 80km/h, Km 40-47 Armenia: 60km/h",
    restStops: "Peaje Circasia, Estación de servicio km 25, Estación Montenegro",
    emergencyContacts: "Línea 123, Hospital San Jorge (Pereira): (6) 335-8199, Hospital San Juan de Dios (Armenia): (6) 744-0044",
    restrictions: "Alto tráfico en fines de semana y festivos por turismo cafetero",
    observations: "Corredor del Paisaje Cultural Cafetero. Autopista en buen estado con doble calzada",
  },
  {
    routeName: "Pereira - Manizales",
    origin: "Pereira, Risaralda",
    destination: "Manizales, Caldas",
    distance: 53,
    estimatedTime: 60,
    routeType: "autopista",
    riskLevel: "bajo",
    criticalPoints: "Sector Chinchiná con tráfico pesado, curvas de ascenso a Manizales, zona de neblina frecuente",
    speedLimits: "Km 0-15 Pereira: 60km/h, Km 15-40 autopista: 80km/h, Km 40-53 Manizales: 50km/h",
    restStops: "Peaje Chinchiná, Estación de servicio km 30, Estación Villamaría",
    emergencyContacts: "Línea 123, Hospital San Jorge (Pereira): (6) 335-8199, Hospital de Caldas (Manizales): (6) 887-7920",
    restrictions: "Precaución por ceniza volcánica del Nevado del Ruiz en temporadas de actividad",
    observations: "Corredor cafetero. Manizales a 2.150 msnm, cambio de temperatura significativo",
  },
  {
    routeName: "Bucaramanga - Cúcuta",
    origin: "Bucaramanga, Santander",
    destination: "Cúcuta, Norte de Santander",
    distance: 195,
    estimatedTime: 240,
    routeType: "mixta",
    riskLevel: "alto",
    criticalPoints: "Sector Berlín (páramo a 3.400 msnm con niebla y heladas), curvas pronunciadas sector Pamplona, descenso a Cúcuta con pendientes extremas",
    speedLimits: "Km 0-30 Bucaramanga: 60km/h, Km 30-100 montaña: 40km/h, Km 100-150 Pamplona: 50km/h, Km 150-195 Cúcuta: 60km/h",
    restStops: "Peaje Berlín, Estación Pamplona, Peaje Los Acacios, Estación Chinácota",
    emergencyContacts: "Línea 123, Hospital Universitario Santander (Bucaramanga): (7) 634-6110, Hospital Erasmo Meoz (Cúcuta): (7) 574-6888",
    restrictions: "Vía de alta montaña. Cadenas para llantas recomendadas en temporada de heladas. Frontera con Venezuela",
    observations: "Ruta fronteriza. Cambio de clima extremo (de 30°C a 3°C). Precaución con vehículos de carga en descensos",
  },
  {
    routeName: "Santa Marta - Riohacha",
    origin: "Santa Marta, Magdalena",
    destination: "Riohacha, La Guajira",
    distance: 166,
    estimatedTime: 150,
    routeType: "mixta",
    riskLevel: "medio",
    criticalPoints: "Sector Palomino (cruce de ríos en invierno), zona de vientos extremos Guajira, tramos sin iluminación nocturna",
    speedLimits: "Km 0-20 Santa Marta: 60km/h, Km 20-130 costera: 80km/h, Km 130-166 Riohacha: 60km/h",
    restStops: "Estación Palomino, Peaje Dibulla km 80, Estación Camarones km 140",
    emergencyContacts: "Línea 123, Hospital Julio Méndez (Santa Marta): (5) 438-0400, Hospital Nuestra Señora de los Remedios (Riohacha): (5) 727-3095",
    restrictions: "Alta temperatura (35-42°C). Hidratación frecuente obligatoria. Precaución con animales en la vía",
    observations: "Ruta costera con paisajes desérticos. Llevar agua extra y combustible suficiente",
  },
  {
    routeName: "Bogotá - Neiva",
    origin: "Bogotá D.C.",
    destination: "Neiva, Huila",
    distance: 305,
    estimatedTime: 360,
    routeType: "mixta",
    riskLevel: "medio",
    criticalPoints: "Descenso de Fusagasugá, sector Espinal-Natagaima (alta temperatura), cruce urbano Ibagué",
    speedLimits: "Km 0-40 Bogotá: 60km/h, Km 40-130 Girardot: 80km/h, Km 130-250 autopista: 80km/h, Km 250-305 Neiva: 60km/h",
    restStops: "Peaje Chipaque, Estación Girardot, Peaje Espinal, Estación Natagaima, Peaje Aipe",
    emergencyContacts: "Línea 123, Hospital de Girardot: (1) 833-0210, Hospital Universitario Neiva: (8) 871-5940",
    restrictions: "Zona de alta temperatura (35-40°C) en el valle del Magdalena. Descansos obligatorios por calor",
    observations: "Corredor hacia el sur del país. Doble calzada hasta Girardot, luego vía nacional",
  },
  {
    routeName: "Popayán - Pasto",
    origin: "Popayán, Cauca",
    destination: "Pasto, Nariño",
    distance: 285,
    estimatedTime: 360,
    routeType: "mixta",
    riskLevel: "muy_alto",
    criticalPoints: "Sector El Bordo (precipicios sin baranda), curvas de Mojarras, zona de derrumbes permanentes, paso por Chachagüí (niebla)",
    speedLimits: "Km 0-20 Popayán: 60km/h, Km 20-200 montaña: 40km/h, Km 200-260 altiplano: 60km/h, Km 260-285 Pasto: 50km/h",
    restStops: "Peaje Timbío, Estación El Bordo, Peaje Mojarras, Estación Mercaderes, Peaje Chachagüí",
    emergencyContacts: "Línea 123, Hospital San José (Popayán): (2) 824-1790, Hospital Universitario (Pasto): (2) 723-3710",
    restrictions: "Una de las vías más peligrosas de Colombia. Restricción nocturna altamente recomendada. No sobrepasar en curvas",
    observations: "Ruta de alta accidentalidad. Conducir solo en horario diurno. Revisar frenos antes de iniciar recorrido",
  },
  {
    routeName: "Bogotá - Sogamoso",
    origin: "Bogotá D.C.",
    destination: "Sogamoso, Boyacá",
    distance: 210,
    estimatedTime: 240,
    routeType: "mixta",
    riskLevel: "medio",
    criticalPoints: "Peaje Albarracín (congestión), sector Tunja-Paipa (vía estrecha), zona industrial Sogamoso",
    speedLimits: "Km 0-20 Bogotá: 60km/h, Km 20-130 autopista Tunja: 100km/h, Km 130-180 Paipa: 60km/h, Km 180-210 Sogamoso: 60km/h",
    restStops: "Peaje Albarracín, Estación Tunja, Peaje Tuta, Estación Paipa (termalismo), Peaje Tibasosa",
    emergencyContacts: "Línea 123, Hospital San Rafael (Tunja): (8) 740-5858, Hospital Regional Sogamoso: (8) 770-5025",
    restrictions: "Tráfico pesado por zona industrial y minera de Sogamoso",
    observations: "Ruta turística hacia el Lago de Tota. Paipa ofrece servicios termales para descanso",
  },
  {
    routeName: "Cúcuta - Bucaramanga",
    origin: "Cúcuta, Norte de Santander",
    destination: "Bucaramanga, Santander",
    distance: 195,
    estimatedTime: 240,
    routeType: "mixta",
    riskLevel: "alto",
    criticalPoints: "Ascenso desde Cúcuta (pendientes extremas), páramo de Berlín (heladas y niebla), curvas cerradas sector Chinácota-Pamplona",
    speedLimits: "Km 0-20 Cúcuta: 60km/h, Km 20-80 ascenso: 40km/h, Km 80-140 Pamplona: 50km/h, Km 140-195 Bucaramanga: 60km/h",
    restStops: "Peaje Los Acacios, Estación Chinácota, Peaje Pamplona, Estación Berlín, Peaje Piedecuesta",
    emergencyContacts: "Línea 123, Hospital Erasmo Meoz (Cúcuta): (7) 574-6888, Hospital Universitario (Bucaramanga): (7) 634-6110",
    restrictions: "Ascenso de 300 msnm a 3.400 msnm. Verificar sistema de enfriamiento del motor antes de iniciar",
    observations: "Ruta inversa con ascenso pronunciado. Mayor exigencia mecánica para vehículos. Temperaturas bajo cero en Berlín",
  },
  {
    routeName: "Ibagué - Armenia (Túnel de La Línea)",
    origin: "Ibagué, Tolima",
    destination: "Armenia, Quindío",
    distance: 92,
    estimatedTime: 120,
    routeType: "mixta",
    riskLevel: "alto",
    criticalPoints: "Túnel de La Línea (8.65 km, ventilación limitada), zona de derrumbes sector Cajamarca, descenso pronunciado hacia Armenia",
    speedLimits: "Km 0-20 Ibagué: 60km/h, Km 20-50 ascenso: 40km/h, Km 50-60 túnel: 60km/h, Km 60-92 descenso: 40km/h",
    restStops: "Peaje Cajamarca, Estación antes del túnel, Peaje Calarcá, Estación Montenegro",
    emergencyContacts: "Línea 123, Hospital Federico Lleras (Ibagué): (8) 264-0444, Hospital San Juan de Dios (Armenia): (6) 744-0044, Control túnel: 018000-123456",
    restrictions: "Prohibido detenerse dentro del túnel. Luces encendidas obligatorias. Mercancías peligrosas con escolta",
    observations: "Túnel más largo de Latinoamérica. Reduce tiempo de cruce de la cordillera significativamente",
  },
  {
    routeName: "Bogotá - Ibagué",
    origin: "Bogotá D.C.",
    destination: "Ibagué, Tolima",
    distance: 200,
    estimatedTime: 210,
    routeType: "autopista",
    riskLevel: "medio",
    criticalPoints: "Descenso de Chipaque hacia Girardot, peajes con congestión en festivos, cruce urbano Espinal",
    speedLimits: "Km 0-40 Bogotá: 60km/h, Km 40-130 Girardot: 80km/h, Km 130-180 autopista: 80km/h, Km 180-200 Ibagué: 60km/h",
    restStops: "Peaje Chipaque, Estación Silvania, Peaje Gualanday, Estación Espinal, Peaje Chicoral",
    emergencyContacts: "Línea 123, Hospital de Girardot: (1) 833-0210, Hospital Federico Lleras (Ibagué): (8) 264-0444",
    restrictions: "Doble calzada en buen estado. Congestión en festivos y temporada alta",
    observations: "Corredor central del país. Ibagué es la ciudad musical de Colombia y punto estratégico para conexión al Eje Cafetero",
  },
  {
    routeName: "Cartagena - Sincelejo",
    origin: "Cartagena, Bolívar",
    destination: "Sincelejo, Sucre",
    distance: 195,
    estimatedTime: 180,
    routeType: "autopista",
    riskLevel: "bajo",
    criticalPoints: "Peaje Turbaco (congestión), cruce urbano San Onofre, zona ganadera con animales en vía",
    speedLimits: "Km 0-20 Cartagena: 60km/h, Km 20-170 Troncal: 80km/h, Km 170-195 Sincelejo: 60km/h",
    restStops: "Peaje Turbaco, Estación San Onofre, Peaje Toluviejo, Estación km 150",
    emergencyContacts: "Línea 123, Hospital Universitario Cartagena: (5) 669-8585, Hospital Universitario Sincelejo: (5) 282-0050",
    restrictions: "Precaución con ganado en la vía. Zona de alta temperatura",
    observations: "Vía en buen estado. Conecta la costa con el interior de Sucre y Córdoba",
  },
  {
    routeName: "Sincelejo - Montería",
    origin: "Sincelejo, Sucre",
    destination: "Montería, Córdoba",
    distance: 115,
    estimatedTime: 120,
    routeType: "autopista",
    riskLevel: "bajo",
    criticalPoints: "Cruce urbano Sahagún, zona ganadera con animales cruzando, sector Cereté (tráfico agrícola)",
    speedLimits: "Km 0-15 Sincelejo: 60km/h, Km 15-95 Troncal: 80km/h, Km 95-115 Montería: 60km/h",
    restStops: "Peaje Sahagún, Estación Chinú, Peaje Cereté, Estación km 90",
    emergencyContacts: "Línea 123, Hospital Universitario Sincelejo: (5) 282-0050, Hospital San Jerónimo (Montería): (4) 789-0010",
    restrictions: "Zona ganadera con presencia frecuente de animales en la vía. Conducir con precaución",
    observations: "Corredor ganadero del Sinú. Vía plana y en buen estado general",
  },
  {
    routeName: "Villavicencio - Yopal",
    origin: "Villavicencio, Meta",
    destination: "Yopal, Casanare",
    distance: 335,
    estimatedTime: 360,
    routeType: "mixta",
    riskLevel: "alto",
    criticalPoints: "Sector Aguazul (zona petrolera con tráfico pesado), cruce ríos Upía y Cusiana (inundaciones), tramos sin pavimentar en épocas de lluvia",
    speedLimits: "Km 0-20 Villavicencio: 60km/h, Km 20-200 llano: 80km/h, Km 200-300 zona petrolera: 60km/h, Km 300-335 Yopal: 60km/h",
    restStops: "Peaje Restrepo, Estación Cumaral, Peaje Aguaclara, Estación Aguazul, Peaje Morichal",
    emergencyContacts: "Línea 123, Hospital Departamental Villavicencio: (8) 664-7777, Hospital de Yopal: (8) 635-4444",
    restrictions: "Zona petrolera con tránsito de tractomulas. Inundaciones frecuentes en temporada de lluvias mayo-julio",
    observations: "Corredor petrolero de los Llanos Orientales. Verificar estado de vía antes de iniciar viaje en temporada de lluvias",
  },
  {
    routeName: "Neiva - Florencia",
    origin: "Neiva, Huila",
    destination: "Florencia, Caquetá",
    distance: 260,
    estimatedTime: 360,
    routeType: "mixta",
    riskLevel: "muy_alto",
    criticalPoints: "Paso por cordillera oriental (curvas extremas), sector Altamira-Florencia (derrumbes), zona de conflicto histórico, tramos sin pavimentar",
    speedLimits: "Km 0-20 Neiva: 60km/h, Km 20-150 montaña: 40km/h, Km 150-230 selva: 50km/h, Km 230-260 Florencia: 50km/h",
    restStops: "Peaje Altamira, Estación San José del Fragua, Peaje Florencia km 220",
    emergencyContacts: "Línea 123, Hospital Universitario Neiva: (8) 871-5940, Hospital María Inmaculada (Florencia): (8) 435-0017",
    restrictions: "Vía de montaña con condiciones difíciles. Solo vehículos 4x4 recomendados en temporada de lluvias. Verificar seguridad de la zona",
    observations: "Ruta hacia la Amazonía colombiana. Preparar vehículo para condiciones extremas. Llevar kit de emergencia completo",
  },
  {
    routeName: "Manizales - Bogotá (Vía Honda)",
    origin: "Manizales, Caldas",
    destination: "Bogotá D.C.",
    distance: 290,
    estimatedTime: 360,
    routeType: "mixta",
    riskLevel: "medio",
    criticalPoints: "Descenso a Honda (curvas pronunciadas), zona de alta temperatura valle del Magdalena, peaje Honda (congestión)",
    speedLimits: "Km 0-30 Manizales: 50km/h, Km 30-100 descenso: 40km/h, Km 100-200 Honda-Guaduas: 80km/h, Km 200-290 Bogotá: 60km/h",
    restStops: "Peaje Chinchiná, Estación Mariquita, Peaje Honda, Estación Guaduas, Peaje Villeta",
    emergencyContacts: "Línea 123, Hospital de Caldas (Manizales): (6) 887-7920, Hospital San Juan de Dios (Honda): (1) 854-3000",
    restrictions: "Descenso prolongado desde 2.150 msnm a 250 msnm. Verificar sistema de frenos. Usar motor como freno",
    observations: "Ruta alterna que evita el paso por La Línea. Más larga pero menos montañosa después de Honda",
  },
  {
    routeName: "Bogotá - Zipaquirá",
    origin: "Bogotá D.C.",
    destination: "Zipaquirá, Cundinamarca",
    distance: 49,
    estimatedTime: 60,
    routeType: "autopista",
    riskLevel: "bajo",
    criticalPoints: "Peaje Chia (congestión en horas pico y fines de semana), rotonda de Cajicá",
    speedLimits: "Km 0-15 Bogotá: 60km/h, Km 15-40 autopista: 80km/h, Km 40-49 Zipaquirá: 60km/h",
    restStops: "Peaje Chía, Estación Cajicá, Estación de servicio km 35",
    emergencyContacts: "Línea 123, Hospital El Salvador (Zipaquirá): (1) 852-2050, Bomberos Zipaquirá: (1) 852-3838",
    restrictions: "Alta congestión en fines de semana por turismo a Catedral de Sal. Pico y placa regional",
    observations: "Ruta turística hacia la Catedral de Sal de Zipaquirá. Doble calzada completa",
  },
  {
    routeName: "Bogotá - Chía - Cajicá",
    origin: "Bogotá D.C.",
    destination: "Cajicá, Cundinamarca",
    distance: 35,
    estimatedTime: 45,
    routeType: "urbana",
    riskLevel: "bajo",
    criticalPoints: "Autopista Norte (congestión permanente horas pico), peaje Chia, semáforos Chía centro",
    speedLimits: "Km 0-15 Bogotá Autopista Norte: 60km/h, Km 15-25 Chía: 50km/h, Km 25-35 Cajicá: 50km/h",
    restStops: "Peaje Chía, Centro Comercial Fontanar, Estación de servicio Cajicá",
    emergencyContacts: "Línea 123, Hospital de Chía: (1) 863-0300, Hospital de Cajicá: (1) 866-2020",
    restrictions: "Congestión severa en horas pico (7-9am, 5-8pm). Pico y placa regional aplicable",
    observations: "Corredor suburbano de alta densidad. Zona de expansión urbana de Bogotá",
  },
  {
    routeName: "Montería - Medellín",
    origin: "Montería, Córdoba",
    destination: "Medellín, Antioquia",
    distance: 340,
    estimatedTime: 420,
    routeType: "mixta",
    riskLevel: "alto",
    criticalPoints: "Sector Dabeiba-Mutatá (curvas cerradas y derrumbes), zona de alta humedad, puente sobre Río Sinú, tramos sin pavimentar",
    speedLimits: "Km 0-20 Montería: 60km/h, Km 20-200 planicie: 80km/h, Km 200-300 montaña: 40km/h, Km 300-340 Medellín: 60km/h",
    restStops: "Peaje Cereté, Estación Tierralta, Peaje Dabeiba, Estación Santa Fe de Antioquia, Peaje San Jerónimo",
    emergencyContacts: "Línea 123, Hospital San Jerónimo (Montería): (4) 789-0010, Hospital San Vicente (Medellín): (4) 444-1333",
    restrictions: "Vía con tramos en construcción. Verificar estado antes de viajar. Derrumbes frecuentes en temporada de lluvias",
    observations: "Ruta alterna entre costa y Medellín. Paisaje diverso de sabana a montaña. Proyecto vial 4G en desarrollo",
  },
  {
    routeName: "Pasto - Ipiales (Frontera Ecuador)",
    origin: "Pasto, Nariño",
    destination: "Ipiales, Nariño",
    distance: 82,
    estimatedTime: 90,
    routeType: "mixta",
    riskLevel: "medio",
    criticalPoints: "Curvas sector El Pedregal, zona de heladas matutinas, cruce urbano Túquerres, zona fronteriza con alta circulación",
    speedLimits: "Km 0-15 Pasto: 60km/h, Km 15-65 altiplano: 60km/h, Km 65-82 Ipiales: 50km/h",
    restStops: "Peaje El Pedregal, Estación Túquerres, Peaje Ipiales km 70",
    emergencyContacts: "Línea 123, Hospital Universitario (Pasto): (2) 723-3710, Hospital Civil (Ipiales): (2) 773-1600, Migración Colombia Rumichaca",
    restrictions: "Zona fronteriza con control migratorio. Documentación vehicular al día obligatoria. Posibles cierres por protestas fronterizas",
    observations: "Ruta hacia frontera con Ecuador por puente de Rumichaca. Santuario Las Lajas en cercanías de Ipiales",
  },
  {
    routeName: "Santa Marta - Valledupar",
    origin: "Santa Marta, Magdalena",
    destination: "Valledupar, Cesar",
    distance: 250,
    estimatedTime: 270,
    routeType: "mixta",
    riskLevel: "medio",
    criticalPoints: "Sector Bosconia (cruce de vías principales), zona de alta temperatura, presencia de animales en vía sector rural",
    speedLimits: "Km 0-20 Santa Marta: 60km/h, Km 20-180 troncal: 80km/h, Km 180-250 Valledupar: 60km/h",
    restStops: "Peaje Ciénaga, Estación Bosconia, Peaje San Diego, Estación km 200",
    emergencyContacts: "Línea 123, Hospital Julio Méndez (Santa Marta): (5) 438-0400, Hospital Rosario Pumarejo (Valledupar): (5) 574-0300",
    restrictions: "Alta temperatura (35-40°C). Hidratación frecuente obligatoria para conductores",
    observations: "Corredor hacia la capital del vallenato. Sierra Nevada de Santa Marta visible durante el recorrido",
  },
  {
    routeName: "Cali - Palmira - Buga",
    origin: "Cali, Valle del Cauca",
    destination: "Buga, Valle del Cauca",
    distance: 74,
    estimatedTime: 60,
    routeType: "autopista",
    riskLevel: "bajo",
    criticalPoints: "Recta Cali-Palmira (exceso de velocidad frecuente), peaje Rozo (congestión), cruce urbano Palmira",
    speedLimits: "Km 0-15 Cali: 60km/h, Km 15-55 autopista: 100km/h, Km 55-74 Buga: 60km/h",
    restStops: "Peaje Rozo, Estación Palmira, Peaje Cerrito, Estación Guacarí",
    emergencyContacts: "Línea 123, Clínica Valle del Lili (Cali): (2) 331-9090, Hospital San José (Buga): (2) 228-0300",
    restrictions: "Doble calzada con alta velocidad. Radares de velocidad activos. Zona de caña de azúcar con maquinaria agrícola",
    observations: "Corredor del Valle del Cauca. Autopista plana en excelente estado. Basílica del Señor de los Milagros en Buga",
  },
  {
    routeName: "Tunja - Duitama - Sogamoso",
    origin: "Tunja, Boyacá",
    destination: "Sogamoso, Boyacá",
    distance: 80,
    estimatedTime: 90,
    routeType: "autopista",
    riskLevel: "bajo",
    criticalPoints: "Cruce urbano Paipa, zona industrial Duitama-Sogamoso con tráfico pesado, rotondas de acceso",
    speedLimits: "Km 0-10 Tunja: 60km/h, Km 10-50 autopista: 80km/h, Km 50-70 Duitama: 60km/h, Km 70-80 Sogamoso: 60km/h",
    restStops: "Peaje Tuta, Estación Paipa, Peaje Duitama, Estación Tibasosa",
    emergencyContacts: "Línea 123, Hospital San Rafael (Tunja): (8) 740-5858, Hospital Regional Duitama: (8) 762-6100, Hospital Regional Sogamoso: (8) 770-5025",
    restrictions: "Zona industrial con tráfico pesado de carbón y acero. Precaución con camiones cargados",
    observations: "Corredor industrial de Boyacá. Paipa tiene aguas termales. Lago de Tota accesible desde Sogamoso",
  },
  {
    routeName: "Medellín - Turbo (Urabá)",
    origin: "Medellín, Antioquia",
    destination: "Turbo, Antioquia",
    distance: 340,
    estimatedTime: 420,
    routeType: "mixta",
    riskLevel: "alto",
    criticalPoints: "Sector Santafé de Antioquia-Cañasgordas (curvas pronunciadas), zona selvática Dabeiba-Mutatá, puentes estrechos sobre ríos",
    speedLimits: "Km 0-40 Medellín: 60km/h, Km 40-150 montaña: 40km/h, Km 150-280 selva: 60km/h, Km 280-340 Urabá: 70km/h",
    restStops: "Peaje San Jerónimo, Estación Santa Fe de Antioquia, Peaje Cañasgordas, Estación Dabeiba, Peaje Mutatá",
    emergencyContacts: "Línea 123, Hospital San Vicente (Medellín): (4) 444-1333, Hospital Francisco Valderrama (Turbo): (4) 827-3333",
    restrictions: "Zona de alta humedad y lluvias. Derrumbes frecuentes. Vehículos deben tener tracción adecuada",
    observations: "Ruta hacia el Golfo de Urabá y zona bananera. Proyecto Mar 1 (autopista 4G) en construcción parcial",
  },
  {
    routeName: "Bogotá - Leticia (Multimodal Aéreo)",
    origin: "Bogotá D.C.",
    destination: "Leticia, Amazonas",
    distance: 0,
    estimatedTime: 120,
    routeType: "mixta",
    riskLevel: "bajo",
    criticalPoints: "Traslado terrestre aeropuerto El Dorado, logística de carga en aeropuerto Vásquez Cobo (Leticia), transporte fluvial local",
    speedLimits: "Transporte aéreo - No aplica velocidad terrestre. Desplazamiento local en Leticia: 30km/h",
    restStops: "Aeropuerto El Dorado (Bogotá), Aeropuerto Alfredo Vásquez Cobo (Leticia)",
    emergencyContacts: "Línea 123, Aeropuerto El Dorado emergencias: (1) 266-2000, Hospital San Rafael (Leticia): (8) 592-7371",
    restrictions: "Solo acceso aéreo o fluvial. No hay carretera. Frontera tripartita Colombia-Brasil-Perú. Documentación al día",
    observations: "Leticia no tiene conexión terrestre con el resto de Colombia. Todo transporte es aéreo o fluvial por el río Amazonas",
  },
  {
    routeName: "Bucaramanga - Barrancabermeja",
    origin: "Bucaramanga, Santander",
    destination: "Barrancabermeja, Santander",
    distance: 115,
    estimatedTime: 150,
    routeType: "mixta",
    riskLevel: "medio",
    criticalPoints: "Descenso pronunciado Bucaramanga-Lebrija, sector petrolero con tráfico pesado, cruce sobre Río Magdalena",
    speedLimits: "Km 0-20 Bucaramanga: 60km/h, Km 20-60 descenso: 40km/h, Km 60-100 planicie: 80km/h, Km 100-115 Barranca: 60km/h",
    restStops: "Peaje Lebrija, Estación San Vicente de Chucurí, Peaje km 90",
    emergencyContacts: "Línea 123, Hospital Universitario (Bucaramanga): (7) 634-6110, Hospital San Rafael (Barrancabermeja): (7) 602-5500",
    restrictions: "Zona petrolera con tráfico de tractomulas. Olores de refinería cerca de Barrancabermeja. Alta temperatura",
    observations: "Corredor petrolero hacia la refinería de Ecopetrol más grande del país",
  },
  {
    routeName: "Armenia - Ibagué",
    origin: "Armenia, Quindío",
    destination: "Ibagué, Tolima",
    distance: 92,
    estimatedTime: 120,
    routeType: "mixta",
    riskLevel: "alto",
    criticalPoints: "Ascenso a La Línea, Túnel de La Línea (8.65 km), zona de derrumbes sector Cajamarca, neblina en la cordillera",
    speedLimits: "Km 0-15 Armenia: 60km/h, Km 15-45 ascenso: 40km/h, Km 45-55 túnel: 60km/h, Km 55-92 Ibagué: 60km/h",
    restStops: "Peaje Calarcá, Estación antes del túnel, Peaje Cajamarca, Estación Ibagué km 85",
    emergencyContacts: "Línea 123, Hospital San Juan de Dios (Armenia): (6) 744-0044, Hospital Federico Lleras (Ibagué): (8) 264-0444",
    restrictions: "Mercancías peligrosas requieren escolta para cruzar el túnel. Luces encendidas obligatorias en todo el trayecto",
    observations: "Cruce de la Cordillera Central por el Túnel de La Línea. Punto más alto a 3.350 msnm antes del túnel",
  },
  {
    routeName: "Bogotá - San Gil",
    origin: "Bogotá D.C.",
    destination: "San Gil, Santander",
    distance: 310,
    estimatedTime: 360,
    routeType: "mixta",
    riskLevel: "medio",
    criticalPoints: "Sector Oiba-Charalá (curvas de montaña), zona de neblina páramo boyacense, puentes estrechos sobre quebradas",
    speedLimits: "Km 0-130 Bogotá-Tunja: 100km/h, Km 130-250 montaña: 60km/h, Km 250-310 San Gil: 50km/h",
    restStops: "Peaje Albarracín, Estación Tunja, Peaje Oiba, Estación Charalá",
    emergencyContacts: "Línea 123, Hospital San Rafael (Tunja): (8) 740-5858, Hospital Regional San Gil: (7) 724-0000",
    restrictions: "Vía de montaña con tramos de una sola calzada. Precaución con vehículos en contravía en curvas",
    observations: "San Gil es capital del turismo de aventura en Colombia. Ruta escénica por el cañón del Chicamocha",
  },
  {
    routeName: "Medellín - Santa Fe de Antioquia",
    origin: "Medellín, Antioquia",
    destination: "Santa Fe de Antioquia, Antioquia",
    distance: 80,
    estimatedTime: 60,
    routeType: "autopista",
    riskLevel: "bajo",
    criticalPoints: "Túnel de Occidente (4.6 km), peaje San Jerónimo (congestión fines de semana), descenso a tierra caliente",
    speedLimits: "Km 0-20 Medellín: 60km/h, Km 20-60 autopista: 80km/h, Km 60-80 Santa Fe: 50km/h",
    restStops: "Peaje San Jerónimo, Estación de servicio km 50, Estación Santa Fe de Antioquia",
    emergencyContacts: "Línea 123, Hospital Pablo Tobón Uribe (Medellín): (4) 445-9000, Hospital San Juan de Dios (Santa Fe): (4) 853-1006",
    restrictions: "Túnel de Occidente con restricción para mercancías peligrosas. Congestión severa en fines de semana y festivos",
    observations: "Ruta turística hacia pueblo patrimonio. Puente de Occidente (monumento nacional). Cambio térmico de 22°C a 35°C",
  },
  {
    routeName: "Riohacha - Uribia - Cabo de la Vela",
    origin: "Riohacha, La Guajira",
    destination: "Cabo de la Vela, La Guajira",
    distance: 160,
    estimatedTime: 240,
    routeType: "rural",
    riskLevel: "alto",
    criticalPoints: "Tramos sin pavimentar después de Uribia, zona desértica sin señalización, arena en la vía, falta de servicios mecánicos",
    speedLimits: "Km 0-15 Riohacha: 60km/h, Km 15-80 troncal: 80km/h, Km 80-110 Uribia: 50km/h, Km 110-160 destapado: 30km/h",
    restStops: "Estación Riohacha, Uribia (última estación de servicio), no hay servicios después de Uribia",
    emergencyContacts: "Línea 123, Hospital Nuestra Señora de los Remedios (Riohacha): (5) 727-3095, Centro de salud Uribia: (5) 717-7001",
    restrictions: "Vehículo 4x4 obligatorio después de Uribia. Llevar combustible extra, agua (mínimo 10L por persona), llanta de repuesto. Sin cobertura celular",
    observations: "Zona desértica de la Alta Guajira. Solo viajar con guía local wayúu. Protección solar extrema obligatoria. Sin infraestructura vial después de Uribia",
  },
  {
    routeName: "Bogotá - Honda",
    origin: "Bogotá D.C.",
    destination: "Honda, Tolima",
    distance: 150,
    estimatedTime: 180,
    routeType: "mixta",
    riskLevel: "medio",
    criticalPoints: "Descenso de Villeta (curvas pronunciadas), zona de alta temperatura, cruce sobre Río Magdalena, sector La Vega-Villeta congestionado en festivos",
    speedLimits: "Km 0-30 Bogotá: 60km/h, Km 30-80 La Vega: 60km/h, Km 80-120 Villeta: 40km/h, Km 120-150 Honda: 60km/h",
    restStops: "Peaje La Vega, Estación Villeta, Peaje Guaduas, Estación Honda",
    emergencyContacts: "Línea 123, Hospital de Villeta: (1) 844-6088, Hospital San Juan de Dios (Honda): (1) 854-3000",
    restrictions: "Vía de dos carriles con alto tráfico de carga. Congestión severa en puentes festivos",
    observations: "Ruta histórica hacia el río Magdalena. Honda fue principal puerto fluvial de Colombia. Zona turística de piscinas naturales",
  },
  {
    routeName: "Cali - Cartago - Pereira",
    origin: "Cali, Valle del Cauca",
    destination: "Pereira, Risaralda",
    distance: 210,
    estimatedTime: 210,
    routeType: "autopista",
    riskLevel: "bajo",
    criticalPoints: "Recta Cali-Buga (exceso de velocidad), cruce urbano Cartago, peajes con congestión",
    speedLimits: "Km 0-15 Cali: 60km/h, Km 15-110 autopista Valle: 100km/h, Km 110-170 Cartago: 80km/h, Km 170-210 Pereira: 60km/h",
    restStops: "Peaje Rozo, Estación Buga, Peaje La Paila, Estación Cartago, Peaje Cerritos",
    emergencyContacts: "Línea 123, Clínica Valle del Lili (Cali): (2) 331-9090, Hospital San Jorge (Pereira): (6) 335-8199",
    restrictions: "Doble calzada con radares de velocidad. Zona cañera con maquinaria agrícola en vía",
    observations: "Corredor plano del Valle del Cauca hasta Cartago, luego ascenso leve a Pereira. Autopista en excelente estado",
  },
  {
    routeName: "Quibdó - Medellín",
    origin: "Quibdó, Chocó",
    destination: "Medellín, Antioquia",
    distance: 230,
    estimatedTime: 480,
    routeType: "rural",
    riskLevel: "muy_alto",
    criticalPoints: "Vía sin pavimentar en gran parte del trayecto, zona de derrumbes permanentes, cruces de ríos sin puentes adecuados, selva chocoana con lluvias extremas",
    speedLimits: "Km 0-15 Quibdó: 40km/h, Km 15-180 selva/montaña: 20km/h, Km 180-230 Medellín: 60km/h",
    restStops: "Estación Quibdó (última con servicios completos), Carmen de Atrato (servicios básicos)",
    emergencyContacts: "Línea 123, Hospital San Francisco de Asís (Quibdó): (4) 671-1300, Hospital San Vicente (Medellín): (4) 444-1333",
    restrictions: "Vehículo 4x4 obligatorio. Vía frecuentemente cerrada por derrumbes. Verificar estado antes de viajar. Una de las vías más peligrosas del país",
    observations: "Ruta entre Pacífico y Andes. Zona de mayor pluviosidad del mundo (12.000mm/año). Solo viajar en condiciones óptimas y horario diurno",
  },
  {
    routeName: "Bogotá - Yopal",
    origin: "Bogotá D.C.",
    destination: "Yopal, Casanare",
    distance: 370,
    estimatedTime: 480,
    routeType: "mixta",
    riskLevel: "alto",
    criticalPoints: "Sector Sogamoso-Aguazul (paso cordillera oriental con curvas extremas y precipicios), zona de páramo, descenso pronunciado a los llanos",
    speedLimits: "Km 0-130 Bogotá-Tunja: 100km/h, Km 130-210 Sogamoso: 60km/h, Km 210-300 montaña: 30km/h, Km 300-370 llano: 80km/h",
    restStops: "Peaje Albarracín, Estación Tunja, Estación Sogamoso, Peaje Pajarito, Estación Aguazul",
    emergencyContacts: "Línea 123, Hospital Regional Sogamoso: (8) 770-5025, Hospital de Yopal: (8) 635-4444",
    restrictions: "Paso de montaña con niebla frecuente y precipicios sin baranda. Restricción nocturna altamente recomendada sector Sogamoso-Aguazul",
    observations: "Ruta alterna a los Llanos por Boyacá. Paisaje espectacular de páramo a sabana llanera. Sector Pajarito-Aguazul en mejora vial",
  },
  {
    routeName: "Tunja - Villa de Leyva",
    origin: "Tunja, Boyacá",
    destination: "Villa de Leyva, Boyacá",
    distance: 40,
    estimatedTime: 45,
    routeType: "rural",
    riskLevel: "bajo",
    criticalPoints: "Curvas sector Sáchica, vía estrecha en tramos, zona de polvo en verano, congestión en festivos",
    speedLimits: "Km 0-10 Tunja: 60km/h, Km 10-35 rural: 60km/h, Km 35-40 Villa de Leyva: 30km/h",
    restStops: "Estación Sáchica, Estación de servicio Villa de Leyva entrada",
    emergencyContacts: "Línea 123, Hospital San Rafael (Tunja): (8) 740-5858, Centro de salud Villa de Leyva: (8) 732-0035",
    restrictions: "Vehículos de gran tamaño restringidos en centro histórico de Villa de Leyva. Congestión severa en festivales y fines de semana",
    observations: "Ruta turística hacia pueblo patrimonio. Plaza mayor más grande de Colombia. Zona paleontológica y turismo rural",
  },
  {
    routeName: "Valledupar - Barranquilla",
    origin: "Valledupar, Cesar",
    destination: "Barranquilla, Atlántico",
    distance: 310,
    estimatedTime: 300,
    routeType: "autopista",
    riskLevel: "medio",
    criticalPoints: "Cruce Bosconia (intersección de troncales), zona ganadera con animales en vía, alta temperatura permanente",
    speedLimits: "Km 0-20 Valledupar: 60km/h, Km 20-250 troncal: 80km/h, Km 250-310 Barranquilla: 60km/h",
    restStops: "Peaje San Diego, Estación Bosconia, Peaje Ciénaga, Estación km 250",
    emergencyContacts: "Línea 123, Hospital Rosario Pumarejo (Valledupar): (5) 574-0300, Hospital General Barranquilla: (5) 340-1040",
    restrictions: "Zona de alta temperatura (35-42°C). Paradas cada 2 horas para hidratación. Precaución con animales en zona ganadera",
    observations: "Corredor Costa Norte. Paisaje de sabana y ganadería. Festival Vallenato en abril-mayo genera alto tráfico",
  },
];

export default function PesvRutasSeguras() {
  const { user } = useAuth();
  const { selectedCompany: currentCompany } = useCompanyContext();
  const { toast } = useToast();
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<SafeRoute | null>(null);
  const [confirmGenerateDialogOpen, setConfirmGenerateDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    companyId: "",
    routeName: "",
    origin: "",
    destination: "",
    distance: "" as number | string,
    estimatedTime: "" as number | string,
    routeType: "urbana" as "urbana" | "rural" | "mixta" | "autopista",
    riskLevel: "bajo" as "bajo" | "medio" | "alto" | "muy_alto",
    criticalPoints: "",
    speedLimits: "",
    restStops: "",
    emergencyContacts: "",
    restrictions: "",
    mapUrl: "",
    isActive: 1 as number,
    observations: "",
  });

  const { data: safeRoutes = [], isLoading: routesLoading } = useQuery<SafeRoute[]>({
    queryKey: ["/api/safe-routes"],
  });

  const createRouteMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertSafeRouteSchema>) => {
      const payload = isAdmin && formData.companyId 
        ? { ...data, companyId: formData.companyId }
        : data;
      const res = await apiRequest("POST", "/api/safe-routes", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/safe-routes"] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Ruta creada",
        description: "La ruta segura se ha registrado exitosamente",
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

  const updateRouteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof insertSafeRouteSchema> }) => {
      const res = await apiRequest("PATCH", `/api/safe-routes/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/safe-routes"] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Ruta actualizada",
        description: "Los datos de la ruta se han actualizado exitosamente",
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

  const deleteRouteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/safe-routes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/safe-routes"] });
      toast({
        title: "Ruta eliminada",
        description: "La ruta se ha eliminado exitosamente",
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

  const getAvailablePredefinidas = () => {
    const existingNames = safeRoutes.map(r => r.routeName.toLowerCase());
    return RUTAS_PREDEFINIDAS.filter(r => !existingNames.includes(r.routeName.toLowerCase()));
  };

  const handleGenerateAll = async () => {
    setConfirmGenerateDialogOpen(false);
    const available = getAvailablePredefinidas();
    if (available.length === 0) {
      toast({
        title: "Todas las rutas ya existen",
        description: "Todas las rutas predefinidas del catálogo colombiano ya están registradas.",
        className: "bg-yellow-50 border-yellow-200",
      });
      return;
    }

    setIsGenerating(true);
    let created = 0;
    let errors = 0;

    for (const ruta of available) {
      try {
        await apiRequest("POST", "/api/safe-routes", {
          routeName: ruta.routeName,
          origin: ruta.origin,
          destination: ruta.destination,
          distance: ruta.distance || undefined,
          estimatedTime: ruta.estimatedTime || undefined,
          routeType: ruta.routeType,
          riskLevel: ruta.riskLevel,
          criticalPoints: ruta.criticalPoints || undefined,
          speedLimits: ruta.speedLimits || undefined,
          restStops: ruta.restStops || undefined,
          emergencyContacts: ruta.emergencyContacts || undefined,
          restrictions: ruta.restrictions || undefined,
          observations: ruta.observations || undefined,
          isActive: 1,
        });
        created++;
      } catch (e) {
        errors++;
        console.error(`Error creando ruta ${ruta.routeName}:`, e);
      }
    }

    setIsGenerating(false);
    queryClient.invalidateQueries({ queryKey: ["/api/safe-routes"] });

    if (errors > 0) {
      toast({
        title: "Generación parcial",
        description: `Se crearon ${created} rutas. ${errors} rutas no se pudieron crear.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Rutas generadas exitosamente",
        description: `Se crearon ${created} rutas seguras del catálogo colombiano.`,
        className: "bg-yellow-50 border-yellow-200",
      });
    }
  };

  const handleAutoFill = (routeName: string) => {
    const ruta = RUTAS_PREDEFINIDAS.find(r => r.routeName === routeName);
    if (ruta) {
      setFormData({
        ...formData,
        routeName: ruta.routeName,
        origin: ruta.origin,
        destination: ruta.destination,
        distance: ruta.distance,
        estimatedTime: ruta.estimatedTime,
        routeType: ruta.routeType,
        riskLevel: ruta.riskLevel,
        criticalPoints: ruta.criticalPoints,
        speedLimits: ruta.speedLimits,
        restStops: ruta.restStops,
        emergencyContacts: ruta.emergencyContacts,
        restrictions: ruta.restrictions,
        observations: ruta.observations,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const distanceValue = formData.distance === '' ? undefined : Number(formData.distance);
    const estimatedTimeValue = formData.estimatedTime === '' ? undefined : Number(formData.estimatedTime);
    const data = {
      ...formData,
      distance: distanceValue,
      estimatedTime: estimatedTimeValue,
      criticalPoints: formData.criticalPoints || undefined,
      speedLimits: formData.speedLimits || undefined,
      restStops: formData.restStops || undefined,
      emergencyContacts: formData.emergencyContacts || undefined,
      restrictions: formData.restrictions || undefined,
      mapUrl: formData.mapUrl || undefined,
      observations: formData.observations || undefined,
    };

    if (editingRoute) {
      updateRouteMutation.mutate({ id: editingRoute.id, data });
    } else {
      createRouteMutation.mutate(data);
    }
  };

  const handleEdit = (route: SafeRoute) => {
    setEditingRoute(route);
    setFormData({
      companyId: route.companyId || "",
      routeName: route.routeName,
      origin: route.origin,
      destination: route.destination,
      distance: route.distance ?? "",
      estimatedTime: route.estimatedTime ?? "",
      routeType: route.routeType,
      riskLevel: route.riskLevel,
      criticalPoints: route.criticalPoints || "",
      speedLimits: route.speedLimits || "",
      restStops: route.restStops || "",
      emergencyContacts: route.emergencyContacts || "",
      restrictions: route.restrictions || "",
      mapUrl: route.mapUrl || "",
      isActive: route.isActive,
      observations: route.observations || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Está seguro de eliminar esta ruta?")) {
      deleteRouteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setEditingRoute(null);
    setFormData({
      companyId: "",
      routeName: "",
      origin: "",
      destination: "",
      distance: "",
      estimatedTime: "",
      routeType: "urbana",
      riskLevel: "bajo",
      criticalPoints: "",
      speedLimits: "",
      restStops: "",
      emergencyContacts: "",
      restrictions: "",
      mapUrl: "",
      isActive: 1,
      observations: "",
    });
  };

  const filteredRoutes = safeRoutes.filter((route) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      route.routeName.toLowerCase().includes(searchLower) ||
      route.origin.toLowerCase().includes(searchLower) ||
      route.destination.toLowerCase().includes(searchLower)
    );
  });

  const getRouteTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      urbana: "Urbana",
      rural: "Rural",
      mixta: "Mixta",
      autopista: "Autopista",
    };
    return labels[type] || type;
  };

  const getRiskLevelBadge = (level: string) => {
    const config: Record<string, { label: string; className: string }> = {
      bajo: { label: "Bajo", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
      medio: { label: "Medio", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
      alto: { label: "Alto", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
      muy_alto: { label: "Muy Alto", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
    };
    const { label, className } = config[level] || { label: level, className: "" };
    return <Badge className={className} data-testid={`badge-risk-${level}`}>{label}</Badge>;
  };

  const getStatusLabel = (isActive: number) => {
    return isActive === 1 ? "Activo" : "Inactivo";
  };

  const formatDistance = (distance: number | null | undefined) => {
    if (distance === null || distance === undefined) return "-";
    return `${distance} km`;
  };

  const formatTime = (minutes: number | null | undefined) => {
    if (minutes === null || minutes === undefined) return "-";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const availableCount = getAvailablePredefinidas().length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <Link href="/pesv">
          <Button variant="outline" size="sm" data-testid="button-back-pesv">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Plan Estratégico de Seguridad Vial
          </Button>
        </Link>
        <BackToPesvEvaluationButton />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Rutas Seguras PESV</h1>
          <p className="text-muted-foreground">
            Resolución 40595/2022 - Definición y gestión de rutas seguras para desplazamientos
          </p>
        </div>
      </div>
      
      <TrazabilidadPesvBanner codigoPaso="H06" compacto />
      
      <div className="flex flex-wrap items-center gap-4">
        {user?.role && hasCompanyAdminAccess(user.role) && (
          <>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-route">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Ruta Segura
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-route">
                <DialogHeader>
                  <DialogTitle>{editingRoute ? "Editar Ruta Segura" : "Registrar Nueva Ruta Segura"}</DialogTitle>
                  <DialogDescription>
                    {editingRoute
                      ? "Modifique los datos de la ruta segura"
                      : "Complete los datos o seleccione una ruta del catálogo colombiano para auto-completar"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-route">
                  {!editingRoute && (
                    <Card className="border-dashed">
                      <CardContent className="pt-4 pb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Route className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Auto-completar desde catálogo colombiano</span>
                        </div>
                        <Select onValueChange={handleAutoFill}>
                          <SelectTrigger data-testid="select-auto-fill">
                            <SelectValue placeholder="Seleccione una ruta predefinida para auto-completar..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-80">
                            {RUTAS_PREDEFINIDAS.map((ruta) => (
                              <SelectItem key={ruta.routeName} value={ruta.routeName}>
                                {ruta.routeName} ({ruta.distance > 0 ? `${ruta.distance} km` : "Aéreo"})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </CardContent>
                    </Card>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    {currentCompany && (
                      <div className="space-y-2 col-span-2">
                        <Label>Empresa</Label>
                        <div className="flex items-center h-10 px-3 rounded-md border bg-muted text-muted-foreground">
                          {currentCompany.name}
                        </div>
                      </div>
                    )}
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="routeName">Nombre de la Ruta *</Label>
                      <Input
                        id="routeName"
                        value={formData.routeName}
                        onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                        required
                        placeholder="Ej: Ruta Bogotá - Medellín"
                        data-testid="input-route-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="origin">Origen *</Label>
                      <Input
                        id="origin"
                        value={formData.origin}
                        onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                        required
                        placeholder="Ciudad o punto de origen"
                        data-testid="input-origin"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destination">Destino *</Label>
                      <Input
                        id="destination"
                        value={formData.destination}
                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                        required
                        placeholder="Ciudad o punto de destino"
                        data-testid="input-destination"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="distance">Distancia (km)</Label>
                      <Input
                        id="distance"
                        type="number"
                        min="0"
                        value={formData.distance}
                        onChange={(e) => setFormData({ ...formData, distance: e.target.value === '' ? '' : e.target.value })}
                        placeholder="Ej: 450"
                        data-testid="input-distance"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedTime">Tiempo Estimado (minutos)</Label>
                      <Input
                        id="estimatedTime"
                        type="number"
                        min="0"
                        value={formData.estimatedTime}
                        onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value === '' ? '' : e.target.value })}
                        placeholder="Ej: 480 (8 horas)"
                        data-testid="input-estimated-time"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="routeType">Tipo de Ruta *</Label>
                      <Select
                        value={formData.routeType}
                        onValueChange={(value: any) => setFormData({ ...formData, routeType: value })}
                      >
                        <SelectTrigger id="routeType" data-testid="select-route-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="urbana">Urbana</SelectItem>
                          <SelectItem value="rural">Rural</SelectItem>
                          <SelectItem value="mixta">Mixta</SelectItem>
                          <SelectItem value="autopista">Autopista</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="riskLevel">Nivel de Riesgo *</Label>
                      <Select
                        value={formData.riskLevel}
                        onValueChange={(value: any) => setFormData({ ...formData, riskLevel: value })}
                      >
                        <SelectTrigger id="riskLevel" data-testid="select-risk-level">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bajo">Bajo</SelectItem>
                          <SelectItem value="medio">Medio</SelectItem>
                          <SelectItem value="alto">Alto</SelectItem>
                          <SelectItem value="muy_alto">Muy Alto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="criticalPoints">Puntos Críticos</Label>
                      <Textarea
                        id="criticalPoints"
                        value={formData.criticalPoints}
                        onChange={(e) => setFormData({ ...formData, criticalPoints: e.target.value })}
                        placeholder="Puntos de alto riesgo en la ruta (curvas peligrosas, zonas de derrumbe, etc.)"
                        data-testid="input-critical-points"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="speedLimits">Límites de Velocidad</Label>
                      <Textarea
                        id="speedLimits"
                        value={formData.speedLimits}
                        onChange={(e) => setFormData({ ...formData, speedLimits: e.target.value })}
                        placeholder="Límites de velocidad por tramo (ej: Km 0-50: 80km/h, Km 50-100: 60km/h)"
                        data-testid="input-speed-limits"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="restStops">Lugares de Descanso</Label>
                      <Textarea
                        id="restStops"
                        value={formData.restStops}
                        onChange={(e) => setFormData({ ...formData, restStops: e.target.value })}
                        placeholder="Estaciones de servicio, paraderos autorizados"
                        data-testid="input-rest-stops"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContacts">Contactos de Emergencia</Label>
                      <Textarea
                        id="emergencyContacts"
                        value={formData.emergencyContacts}
                        onChange={(e) => setFormData({ ...formData, emergencyContacts: e.target.value })}
                        placeholder="Números de emergencia, hospitales en ruta, etc."
                        data-testid="input-emergency-contacts"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="restrictions">Restricciones</Label>
                      <Textarea
                        id="restrictions"
                        value={formData.restrictions}
                        onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
                        placeholder="Restricciones de tránsito, horarios, tipos de vehículos, etc."
                        data-testid="input-restrictions"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="mapUrl">URL del Mapa</Label>
                      <Input
                        id="mapUrl"
                        type="url"
                        value={formData.mapUrl}
                        onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                        placeholder="https://maps.google.com/..."
                        data-testid="input-map-url"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isActive"
                          checked={formData.isActive === 1}
                          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked ? 1 : 0 })}
                          data-testid="checkbox-is-active"
                        />
                        <Label htmlFor="isActive" className="cursor-pointer">Ruta Activa</Label>
                      </div>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="observations">Observaciones</Label>
                      <Textarea
                        id="observations"
                        value={formData.observations}
                        onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                        placeholder="Notas adicionales sobre la ruta"
                        data-testid="input-observations"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={createRouteMutation.isPending || updateRouteMutation.isPending} 
                      data-testid="button-submit-route"
                    >
                      {createRouteMutation.isPending || updateRouteMutation.isPending ? "Guardando..." : "Guardar"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, origen o destino..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead data-testid="header-route-name">Nombre Ruta</TableHead>
              <TableHead data-testid="header-origin-destination">Origen - Destino</TableHead>
              <TableHead data-testid="header-distance">Distancia</TableHead>
              <TableHead data-testid="header-time">Tiempo Est.</TableHead>
              <TableHead data-testid="header-type">Tipo</TableHead>
              <TableHead data-testid="header-risk-level">Nivel Riesgo</TableHead>
              <TableHead data-testid="header-status">Estado</TableHead>
              {user?.role && hasCompanyAdminAccess(user.role) && <TableHead data-testid="header-actions">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {routesLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center" data-testid="text-loading">
                  Cargando rutas...
                </TableCell>
              </TableRow>
            ) : filteredRoutes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center" data-testid="text-no-routes">
                  No se encontraron rutas seguras. Use el botón "Nueva Ruta Segura" para agregar rutas desde el catálogo colombiano.
                </TableCell>
              </TableRow>
            ) : (
              filteredRoutes.map((route) => (
                <TableRow key={route.id} data-testid={`row-route-${route.id}`}>
                  <TableCell className="max-w-[200px]" data-testid={`text-route-name-${route.id}`}>
                    <span className="font-medium">{route.routeName}</span>
                  </TableCell>
                  <TableCell data-testid={`text-origin-destination-${route.id}`}>
                    {route.origin} - {route.destination}
                  </TableCell>
                  <TableCell data-testid={`text-distance-${route.id}`}>{formatDistance(route.distance)}</TableCell>
                  <TableCell data-testid={`text-time-${route.id}`}>{formatTime(route.estimatedTime)}</TableCell>
                  <TableCell data-testid={`text-type-${route.id}`}>{getRouteTypeLabel(route.routeType)}</TableCell>
                  <TableCell data-testid={`text-risk-level-${route.id}`}>{getRiskLevelBadge(route.riskLevel)}</TableCell>
                  <TableCell data-testid={`text-status-${route.id}`}>{getStatusLabel(route.isActive)}</TableCell>
                  {user?.role && hasCompanyAdminAccess(user.role) && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(route)} data-testid={`button-edit-${route.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(route.id)} data-testid={`button-delete-${route.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={confirmGenerateDialogOpen} onOpenChange={setConfirmGenerateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generar rutas seguras de Colombia</AlertDialogTitle>
            <AlertDialogDescription>
              Se crearán automáticamente <strong>{availableCount} rutas seguras</strong> con información detallada de las principales vías del país, incluyendo:
              puntos críticos, límites de velocidad, lugares de descanso, contactos de emergencia y restricciones.
              <br /><br />
              Las rutas que ya existan no se duplicarán. Puede editar o eliminar cualquier ruta después de crearla.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-generate">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleGenerateAll} data-testid="button-confirm-generate">
              Generar {availableCount} Rutas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { getCiiuRiskClassification } from "../../../shared/ciiu-unified-classification";
import { PREDEFINED_PROFILES } from "./perfiles-cargo-predefinidos";

// CIIU clasifica la actividad de la empresa, no los oficios de sus trabajadores.
// Estas coincidencias por división sirven solo para sugerir plantillas editables.
const BY_DIVISION: Record<string, string[]> = {
  "01": ["Operario Agrícola", "Ingeniero Agrónomo", "Operador de Maquinaria Agrícola"],
  "02": ["Trabajador Forestal", "Ingeniero Ambiental"],
  "03": ["Pescador", "Capitán de Barco"],
  "05": ["Minero", "Operador de Planta de Beneficio Minero"],
  "06": ["Operador de Plataforma Petrolera", "Técnico de Mantenimiento"],
  "07": ["Minero", "Operador de Planta de Beneficio Minero"],
  "08": ["Minero", "Operador de Planta de Beneficio Minero"],
  "09": ["Operador de Plataforma Petrolera", "Técnico de Mantenimiento"],
  "10": ["Operario de Planta de Alimentos", "Operario de Producción", "Inspector de Calidad"],
  "11": ["Operario de Producción", "Inspector de Calidad"],
  "12": ["Operario de Producción", "Inspector de Calidad"],
  "13": ["Operario Textil", "Operario de Producción"],
  "14": ["Operario de Confección", "Inspector de Calidad"],
  "15": ["Operario de Confección", "Operario de Producción"],
  "35": ["Técnico de Redes Eléctricas", "Ingeniero Eléctrico"],
  "36": ["Operario de Acueducto", "Ingeniero Ambiental"],
  "37": ["Operario de Acueducto", "Ingeniero Ambiental"],
  "38": ["Recolector de Residuos", "Ingeniero Ambiental", "Manipulador de Carga"],
  "39": ["Recolector de Residuos", "Ingeniero Ambiental"],
  "41": ["Maestro de Obra", "Topógrafo", "Ayudante de Construcción", "Manipulador de Carga"],
  "42": ["Ingeniero Civil", "Topógrafo", "Operadores de maquinaria amarilla"],
  "43": ["Oficial de Construcción", "Electricista", "Plomero", "Manipulador de Carga"],
  "45": ["Vendedor", "Técnico de Mantenimiento"],
  "46": ["Asesor Comercial", "Auxiliar de Bodega", "Manipulador de Carga"],
  "47": ["Vendedor", "Cajero", "Mercaderista", "Auxiliar de Bodega"],
  "49": ["Conductor de Carga Pesada", "Auxiliar de Distribución", "Manipulador de Carga"],
  "50": ["Capitán de Barco", "Estibador Portuario", "Manipulador de Carga"],
  "51": ["Piloto Comercial", "Auxiliar de Vuelo", "Manipulador de Carga"],
  "52": ["Almacenista", "Operador de Montacargas", "Estibador Portuario", "Manipulador de Carga"],
  "53": ["Motociclista Mensajero", "Auxiliar de Distribución", "Manipulador de Carga"],
  "55": ["Recepcionista de Hotel", "Camarera de Hotel"],
  "56": ["Chef / Cocinero", "Auxiliar de Cocina", "Mesero"],
  "61": ["Técnico en Telecomunicaciones", "Ingeniero de Sistemas"],
  "62": ["Desarrollador de Software", "Analista de Sistemas", "Soporte Técnico"],
  "63": ["Analista de Sistemas", "Administrador de Redes"],
  "64": ["Asesor Bancario", "Cajero Bancario"],
  "65": ["Analista Financiero", "Asesor Comercial"],
  "66": ["Analista Financiero", "Asesor Bancario"],
  "68": ["Asesor Inmobiliario", "Asistente Administrativo"],
  "69": ["Abogado", "Contador", "Auxiliar Jurídico"],
  "70": ["Director Administrativo", "Asistente Administrativo"],
  "71": ["Ingeniero Civil", "Arquitecto", "Topógrafo"],
  "72": ["Químico", "Laboratorista"],
  "73": ["Community Manager", "Diseñador Gráfico"],
  "74": ["Diseñador Gráfico", "Ingeniero Ambiental"],
  "75": ["Veterinario", "Auxiliar de Servicios Generales"],
  "80": ["Vigilante", "Supervisor de Seguridad", "Escolta"],
  "81": ["Aseador", "Jardinero", "Auxiliar de Servicios Generales"],
  "82": ["Agente de Call Center", "Supervisor de Call Center"],
  "84": ["Asistente Administrativo", "Archivista"],
  "85": ["Docente", "Docente Universitario", "Auxiliar de Preescolar"],
  "86": ["Médico General", "Auxiliar de Enfermería", "Enfermero/a Jefe"],
  "87": ["Cuidador Domiciliario", "Auxiliar de Enfermería"],
  "88": ["Cuidador Domiciliario", "Psicólogo Organizacional"],
  "90": ["Diseñador Gráfico", "Community Manager"],
  "91": ["Archivista", "Asistente Administrativo"],
  "92": ["Cajero", "Asistente Administrativo"],
  "93": ["Instructor Deportivo", "Auxiliar de Servicios Generales"],
  "94": ["Director Ejecutivo", "Asistente Administrativo"],
  "95": ["Técnico de Mantenimiento", "Soporte Técnico"],
  "96": ["Estilista", "Aseador"],
};

const MANUFACTURING_PROFILES = ["Operario de Producción", "Técnico de Mantenimiento", "Inspector de Calidad"];

export function getSuggestedProfileNamesForCiiu(codes: (string | null | undefined)[]): string[] {
  const names = new Set<string>();
  for (const code of codes) {
    const normalized = code?.trim();
    if (!normalized || !/^\d{4}$/.test(normalized) || !getCiiuRiskClassification(normalized).found) continue;
    const division = normalized.slice(0, 2);
    const candidates = BY_DIVISION[division] ??
      (Number(division) >= 16 && Number(division) <= 33 ? MANUFACTURING_PROFILES : []);
    for (const name of candidates) {
      if (Object.hasOwn(PREDEFINED_PROFILES, name)) names.add(name);
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b, "es"));
}
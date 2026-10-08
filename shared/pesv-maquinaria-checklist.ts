export const MAQUINARIA_CHECKLIST = [
  ["identificacion_documentacion", "Identificación y documentación"],
  ["aceites_refrigerante_combustible", "Aceites, refrigerante y combustible"],
  ["fugas", "Fugas"],
  ["sistema_hidraulico", "Sistema hidráulico"],
  ["mangueras_conexiones", "Mangueras y conexiones"],
  ["tren_rodaje_llantas", "Tren de rodaje o llantas"],
  ["balde_implementos", "Balde e implementos"],
  ["pasadores_seguros", "Pasadores y seguros"],
  ["luces_alarma_pito", "Luces, alarma y pito"],
  ["extintor", "Extintor"],
  ["cabina_cinturon_controles", "Cabina, cinturón y controles"],
  ["estado_general_limpieza", "Estado general y limpieza"],
] as const;

export type MaquinariaChecklistKey = (typeof MAQUINARIA_CHECKLIST)[number][0];
export type MaquinariaInspectionAnswer = {
  value: "conforme" | "falla" | "no_aplica";
  comment?: string;
};

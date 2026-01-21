/**
 * Rutas adicionales para informes ejecutivos
 * Archivo creado siguiendo principio "solo agregar código"
 */

import type { Express } from "express";
import { generateInformePreciosEjecutivo } from "./reports/informe-precios-ejecutivo";

export function registerInformesEjecutivosRoutes(app: Express) {
  app.get("/api/informes/precios-ejecutivo", (req, res) => {
    try {
      generateInformePreciosEjecutivo(res);
    } catch (error: any) {
      console.error("Error generando informe de precios:", error);
      res.status(500).json({ 
        error: "Error generando PDF", 
        message: error.message 
      });
    }
  });
}

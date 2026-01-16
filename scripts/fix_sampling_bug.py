
import os

file_path = 'server/routes.ts'
with open(file_path, 'r') as f:
    content = f.read()

old_code = """  app.post("/api/verificaciones-muestreo-sgss", requirePermission("companies:edit"), async (req, res) => {
    try {
      const companyId = req.user!.companyId;
      if (!companyId) {
        return res.status(403).send("Usuario no asociado a una empresa");
      }
      const parsed = schema.insertVerificacionMuestreoSgssSchema.parse(req.body);
      
      // Create the verification first
      const verificacion = await storage.createVerificacionMuestreoSgss(parsed, companyId);
      
      // Get all active workers for the company
      const allWorkers = await storage.getWorkers(companyId);
      const activeWorkers = allWorkers.filter(w => w.status === 'activo');
      
      // Calculate sample size according to Resolución 0312/2019
      const totalTrabajadores = activeWorkers.length;
      let muestraRequerida: number;
      if (totalTrabajadores <= 50) {
        muestraRequerida = totalTrabajadores; // 100% of population
      } else if (totalTrabajadores <= 200) {
        muestraRequerida = Math.ceil(totalTrabajadores * 0.10); // 10% of population
      } else {
        muestraRequerida = 30; // Fixed 30 workers
      }
      
      // Randomly select workers for the sample
      const shuffled = [...activeWorkers].sort(() => 0.5 - Math.random());
      const selectedWorkers = shuffled.slice(0, muestraRequerida);
      
      // Get all affiliations for the company
      const allAfiliaciones = await storage.getAfiliacionesSsss(companyId);
      
      // Create a map of worker affiliations
      const afiliacionesMap = new Map<string, typeof allAfiliaciones[0]>();
      for (const afil of allAfiliaciones) {
        afiliacionesMap.set(afil.workerId, afil);
      }
      
      // Create detail records for each selected worker
      let cumplenCount = 0;
      for (const worker of selectedWorkers) {
        const afiliacion = afiliacionesMap.get(worker.id);
        
        // Determine verification status based on affiliation data
        const verificadoEps = !!(afiliacion?.epsNombre);
        const verificadoArl = !!(afiliacion?.arlNombre);
        const verificadoAfp = !!(afiliacion?.afpNombre);
        const verificadoCcf = !!(afiliacion?.ccfNombre);
        
        // Worker complies if has EPS, ARL and AFP (CCF is optional for some workers)
        const cumple = verificadoEps && verificadoArl && verificadoAfp;
        if (cumple) cumplenCount++;
        
        // Create detail record
        await storage.createDetalleVerificacionSgss({
          verificacionId: verificacion.id,
          workerId: worker.id,
          tipoTrabajador: 'empleado',
          verificadoEps,
          verificadoArl,
          verificadoAfp,
          verificadoCcf,
          cumple,
          observaciones: afiliacion 
            ? null 
            : 'Trabajador sin afiliación SGSS registrada en el sistema'
        });
      }
      
      // Calculate compliance percentage
      const muestraVerificada = selectedWorkers.length;
      const porcentajeCumplimiento = muestraVerificada > 0 
        ? Math.round((cumplenCount / muestraVerificada) * 100) 
        : 0;
      
      // Update the verification with calculated values
      const updatedVerificacion = await storage.updateVerificacionMuestreoSgss(
        verificacion.id, 
        {
          totalTrabajadores,
          muestraRequerida,
          muestraVerificada,
          porcentajeCumplimiento,
          estado: 'completada'
        },
        companyId
      );
      
      res.status(201).json(updatedVerificacion || verificacion);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });"""

new_code = """  app.post("/api/verificaciones-muestreo-sgss", requirePermission("companies:edit"), async (req, res) => {
    try {
      const companyId = req.user!.companyId;
      if (!companyId) {
        return res.status(403).send("Usuario no asociado a una empresa");
      }
      
      // Validate base verification data
      const baseParsed = schema.insertVerificacionMuestreoSgssSchema.parse(req.body);
      
      // Extract workerIds if provided manually from client
      const manualWorkerIds = req.body.workerIds as string[] | undefined;
      
      // Create the verification first
      const verificacion = await storage.createVerificacionMuestreoSgss(baseParsed, companyId);
      
      // Get all active workers for the company
      const allWorkers = await storage.getWorkers(companyId);
      const activeWorkers = allWorkers.filter(w => w.status === 'activo');
      
      let selectedWorkers: typeof activeWorkers = [];
      let muestraRequerida: number;

      if (manualWorkerIds && manualWorkerIds.length > 0) {
        // Use manual selection if provided
        selectedWorkers = activeWorkers.filter(w => manualWorkerIds.includes(w.id));
        muestraRequerida = selectedWorkers.length;
      } else {
        // Calculate sample size according to Resolución 0312/2019
        const totalTrabajadores = activeWorkers.length;
        if (totalTrabajadores <= 50) {
          muestraRequerida = totalTrabajadores; // 100% of population
        } else if (totalTrabajadores <= 200) {
          muestraRequerida = Math.ceil(totalTrabajadores * 0.10); // 10% of population
        } else {
          muestraRequerida = 30; // Fixed 30 workers
        }
        
        // Randomly select workers for the sample
        const shuffled = [...activeWorkers].sort(() => 0.5 - Math.random());
        selectedWorkers = shuffled.slice(0, muestraRequerida);
      }
      
      // Get all affiliations for the company
      const allAfiliaciones = await storage.getAfiliacionesSsss(companyId);
      
      // Create a map of worker affiliations
      const afiliacionesMap = new Map<string, typeof allAfiliaciones[0]>();
      for (const afil of allAfiliaciones) {
        afiliacionesMap.set(afil.workerId, afil);
      }
      
      // Create detail records for each selected worker
      let cumplenCount = 0;
      for (const worker of selectedWorkers) {
        const afiliacion = afiliacionesMap.get(worker.id);
        
        // Determine verification status based on affiliation data
        const verificadoEps = !!(afiliacion?.epsNombre);
        const verificadoArl = !!(afiliacion?.arlNombre);
        const verificadoAfp = !!(afiliacion?.afpNombre);
        const verificadoCcf = !!(afiliacion?.ccfNombre);
        
        // Worker complies if has EPS, ARL and AFP (CCF is optional for some workers)
        const cumple = verificadoEps && verificadoArl && verificadoAfp;
        if (cumple) cumplenCount++;
        
        // Create detail record
        await storage.createDetalleVerificacionSgss({
          verificacionId: verificacion.id,
          workerId: worker.id,
          tipoTrabajador: 'empleado',
          verificadoEps,
          verificadoArl,
          verificadoAfp,
          verificadoCcf,
          cumple,
          observaciones: afiliacion 
            ? null 
            : 'Trabajador sin afiliación SGSS registrada en el sistema'
        });
      }
      
      // Calculate compliance percentage
      const muestraVerificada = selectedWorkers.length;
      const porcentajeCumplimiento = muestraVerificada > 0 
        ? Math.round((cumplenCount / muestraVerificada) * 100) 
        : 0;
      
      // Update the verification with calculated values
      const updatedVerificacion = await storage.updateVerificacionMuestreoSgss(
        verificacion.id, 
        {
          totalTrabajadores: activeWorkers.length,
          muestraRequerida,
          muestraVerificada,
          porcentajeCumplimiento,
          estado: 'completada'
        },
        companyId
      );
      
      res.status(201).json(updatedVerificacion || verificacion);
    } catch (error: any) {
      res.status(400).send(error.message);
    }
  });"""

if old_code in content:
    new_content = content.replace(old_code, new_code)
    with open(file_path, 'w') as f:
        f.write(new_content)
    print("Successfully updated server/routes.ts")
else:
    print("Could not find the old code block in server/routes.ts")
    # Output part of the content to debug
    print("File content length:", len(content))

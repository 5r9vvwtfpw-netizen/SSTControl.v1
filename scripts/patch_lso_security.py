import sys

with open('server/routes.ts', 'r') as f:
    content = f.read()

print(f"File loaded: {len(content)} chars")
count = 0

# ── 1. SST GET list: LSO branch ──
old = """      } else if (userRole === 'lso') {
        // LSO: can query evaluaciones for a specific company via ?companyId param
        const companyId = req.query.companyId as string;
        if (!companyId) {
          return res.json([]);
        }
        evaluaciones = await storage.getEvaluacionesSst(companyId);"""
new = """      } else if (userRole === 'lso') {
        // LSO: can query evaluaciones for a specific company via ?companyId param
        const companyId = req.query.companyId as string;
        if (!companyId) {
          return res.json([]);
        }
        const lsoChk1 = await assertLsoAssignedToCompany(req.user!.id, companyId);
        if (!lsoChk1) return res.status(403).send("No tienes acceso a esta empresa");
        evaluaciones = await storage.getEvaluacionesSst(companyId);"""
if old in content:
    content = content.replace(old, new, 1); count += 1; print("OK 1: SST GET list")
else:
    print("MISS 1: SST GET list")

# ── 2. SST GET by ID ──
old = """      if (!evaluacion) {
        return res.status(404).send('Evaluación no encontrada');
      }
      
      res.json(evaluacion);
    } catch (error: any) {
      console.error('Error fetching evaluación SST:', error);"""
new = """      if (!evaluacion) {
        return res.status(404).send('Evaluación no encontrada');
      }
      if (userRole === 'lso') {
        const lsoChk2 = await assertLsoAssignedToCompany(req.user!.id, evaluacion.companyId);
        if (!lsoChk2) return res.status(403).send("No tienes acceso a esta empresa");
      }
      res.json(evaluacion);
    } catch (error: any) {
      console.error('Error fetching evaluación SST:', error);"""
if old in content:
    content = content.replace(old, new, 1); count += 1; print("OK 2: SST GET by ID")
else:
    print("MISS 2: SST GET by ID")

# ── 3. SST POST create ──
old = """        companyId = requestedCompanyId as string;
      } else {
        // Non-admin: use their own companyId
        companyId = req.user!.companyId || "";
        if (!companyId) {
          return res.status(403).send("Esta operación requiere pertenecer a una empresa");
        }
      }
      
      // Verificar que la empresa existe"""
new = """        companyId = requestedCompanyId as string;
        if (userRole === 'lso') {
          const lsoChk3 = await assertLsoAssignedToCompany(req.user!.id, companyId);
          if (!lsoChk3) return res.status(403).send("No tienes acceso a esta empresa");
        }
      } else {
        // Non-admin: use their own companyId
        companyId = req.user!.companyId || "";
        if (!companyId) {
          return res.status(403).send("Esta operación requiere pertenecer a una empresa");
        }
      }
      
      // Verificar que la empresa existe"""
if old in content:
    content = content.replace(old, new, 1); count += 1; print("OK 3: SST POST create")
else:
    print("MISS 3: SST POST create")

# ── 4. SST sub-endpoints access check ──
old4 = """      if (!isAdmin) {
        if (!req.user!.companyId || req.user!.companyId !== evaluacion.companyId) {
          return res.status(403).send("No tienes acceso a esta evaluación");
        }
      }"""
new4 = """      if (!isAdmin) {
        if (!req.user!.companyId || req.user!.companyId !== evaluacion.companyId) {
          return res.status(403).send("No tienes acceso a esta evaluación");
        }
      } else if (userRole === 'lso') {
        const lsoChk4 = await assertLsoAssignedToCompany(req.user!.id, evaluacion.companyId);
        if (!lsoChk4) return res.status(403).send("No tienes acceso a esta empresa");
      }"""
occ = content.count(old4)
if occ > 0:
    content = content.replace(old4, new4); count += occ; print(f"OK 4: SST sub-endpoint check ({occ}x)")
else:
    print("MISS 4: SST sub-endpoint check")

# ── 5. PESV GET list ──
old5 = """        companyId = requestedCompanyId;
      } else {
        companyId = req.user!.companyId || "";
        if (!companyId) {
          return res.status(403).send("Usuario no asociado a una empresa");
        }
      }
      
      const evaluaciones = await db.select()
        .from(evaluacionesPesv)"""
new5 = """        companyId = requestedCompanyId;
        if (userRole === 'lso') {
          const lsoChk5 = await assertLsoAssignedToCompany(req.user!.id, companyId);
          if (!lsoChk5) return res.status(403).send("No tienes acceso a esta empresa");
        }
      } else {
        companyId = req.user!.companyId || "";
        if (!companyId) {
          return res.status(403).send("Usuario no asociado a una empresa");
        }
      }
      
      const evaluaciones = await db.select()
        .from(evaluacionesPesv)"""
if old5 in content:
    content = content.replace(old5, new5, 1); count += 1; print("OK 5: PESV GET list")
else:
    print("MISS 5: PESV GET list")

# ── 6. PESV evaluacion access check (GET by ID, GET respuestas, GET acciones, etc.) ──
old6 = """      if (!isAdmin && req.user!.companyId !== evaluacion.companyId) {
        return res.status(403).send("No tienes acceso a esta evaluación");
      }"""
new6 = """      if (!isAdmin) {
        if (req.user!.companyId !== evaluacion.companyId) {
          return res.status(403).send("No tienes acceso a esta evaluación");
        }
      } else if (userRole === 'lso') {
        const lsoChk6 = await assertLsoAssignedToCompany(req.user!.id, evaluacion.companyId);
        if (!lsoChk6) return res.status(403).send("No tienes acceso a esta empresa");
      }"""
occ6 = content.count(old6)
if occ6 > 0:
    content = content.replace(old6, new6); count += occ6; print(f"OK 6: PESV evaluacion check ({occ6}x)")
else:
    print("MISS 6: PESV evaluacion check")

# ── 7. PESV POST create ──
old7 = """        companyId = requestedCompanyId as string;
      } else {
        companyId = req.user!.companyId || "";
        if (!companyId) {
          return res.status(403).send("Usuario no asociado a una empresa");
        }
      }
      
      // Auto-calcular nivel PESV"""
new7 = """        companyId = requestedCompanyId as string;
        if (userRole === 'lso') {
          const lsoChk7 = await assertLsoAssignedToCompany(req.user!.id, companyId);
          if (!lsoChk7) return res.status(403).send("No tienes acceso a esta empresa");
        }
      } else {
        companyId = req.user!.companyId || "";
        if (!companyId) {
          return res.status(403).send("Usuario no asociado a una empresa");
        }
      }
      
      // Auto-calcular nivel PESV"""
if old7 in content:
    content = content.replace(old7, new7, 1); count += 1; print("OK 7: PESV POST create")
else:
    print("MISS 7: PESV POST create")

# ── 8. PESV PATCH ──
old8 = """      if (!isAdmin && req.user!.companyId !== existing.companyId) {
        return res.status(403).send("No tienes acceso a esta evaluación");
      }"""
new8 = """      if (!isAdmin) {
        if (req.user!.companyId !== existing.companyId) {
          return res.status(403).send("No tienes acceso a esta evaluación");
        }
      } else if (userRole === 'lso') {
        const lsoChk8 = await assertLsoAssignedToCompany(req.user!.id, existing.companyId);
        if (!lsoChk8) return res.status(403).send("No tienes acceso a esta empresa");
      }"""
occ8 = content.count(old8)
if occ8 > 0:
    content = content.replace(old8, new8); count += occ8; print(f"OK 8: PESV PATCH check ({occ8}x)")
else:
    print("MISS 8: PESV PATCH check")

# ── 9. PATCH respuestas-estandares LSO branch ──
old9 = """        const evaluacionLso = await storage.getEvaluacionSstById(respuestaLso.evaluacionId);
        if (!evaluacionLso) return res.status(404).send("Evaluación no encontrada");
        companyId = evaluacionLso.companyId;"""
new9 = """        const evaluacionLso = await storage.getEvaluacionSstById(respuestaLso.evaluacionId);
        if (!evaluacionLso) return res.status(404).send("Evaluación no encontrada");
        companyId = evaluacionLso.companyId;
        const lsoChk9 = await assertLsoAssignedToCompany(req.user!.id, companyId);
        if (!lsoChk9) return res.status(403).send("No tienes acceso a esta empresa");"""
if old9 in content:
    content = content.replace(old9, new9, 1); count += 1; print("OK 9: PATCH respuestas-estandares")
else:
    print("MISS 9: PATCH respuestas-estandares")

with open('server/routes.ts', 'w') as f:
    f.write(content)

print(f"\nDONE — Total patches: {count}")
print(f"assertLsoAssignedToCompany calls in file: {content.count('assertLsoAssignedToCompany')}")

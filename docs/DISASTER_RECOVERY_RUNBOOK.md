# 🚨 DISASTER RECOVERY RUNBOOK

**Sistema:** SST Colombia  
**Versión:** 1.0  
**Última Actualización:** 11 de noviembre de 2025

---

## 📋 OBJETIVOS DE RECUPERACIÓN (SLA)

**Recovery Time Objective (RTO):** ≤ 4 horas  
**Recovery Point Objective (RPO):** ≤ 24 horas

- **RTO:** Tiempo máximo permitido para restaurar el servicio completo
- **RPO:** Máxima pérdida de datos aceptable (backups diarios nocturnos)

---

## 🎯 ESCENARIOS DE DESASTRE

### Escenario 1: Pérdida Total de Base de Datos
**Causas:** Corrupción de datos, error de operador, fallo de hardware

**Impacto:** Alto - Sistema completamente inoperante  
**Frecuencia Estimada:** 1 vez cada 2-5 años

**Procedimiento de Recuperación:**
1. ✅ Verificar que el backup más reciente esté disponible
2. ✅ Crear nueva instancia de base de datos (Neon)
3. ✅ Restaurar desde backup encriptado
4. ✅ Actualizar DATABASE_URL en variables de entorno
5. ✅ Reiniciar aplicación
6. ✅ Verificar funcionalidad crítica

**Comandos:**
```bash
# 1. Listar backups disponibles
ls -lh /tmp/db-backups/*.sql.enc

# 2. Restaurar backup más reciente
tsx server/scripts/restore-database.ts /tmp/db-backups/sst-colombia-backup-YYYY-MM-DD.sql.enc

# 3. Verificar restauración
curl http://localhost:5000/health
```

**Tiempo Estimado:** 2-3 horas

---

### Escenario 2: Corrupción Parcial de Datos
**Causas:** Bug en código, error de migración, ataque

**Impacto:** Medio - Sistema funciona pero datos incorrectos  
**Frecuencia Estimada:** 1 vez cada 6-12 meses

**Procedimiento de Recuperación:**
1. ✅ Identificar alcance de la corrupción (qué tablas/registros)
2. ✅ Detener aplicación para prevenir más daño
3. ✅ Restaurar backup en base de datos temporal
4. ✅ Exportar datos correctos de tabla afectada
5. ✅ Importar datos correctos a base de datos principal
6. ✅ Verificar integridad
7. ✅ Reiniciar aplicación

**Comandos:**
```bash
# 1. Detener aplicación (si es necesario)
# (Replit maneja esto automáticamente)

# 2. Restaurar en DB temporal para análisis
# (Requiere crear branch en Neon o DB local)

# 3. Exportar tabla específica
pg_dump -t workers "${DATABASE_URL}" > workers_backup.sql

# 4. Importar en DB principal
psql "${DATABASE_URL}" < workers_backup.sql
```

**Tiempo Estimado:** 1-2 horas

---

### Escenario 3: Fallo de Infraestructura Replit
**Causas:** Outage de Replit, problemas de red

**Impacto:** Alto - Sistema inaccesible pero datos intactos  
**Frecuencia Estimada:** 1 vez cada 12-24 meses

**Procedimiento de Recuperación:**
1. ✅ Verificar status de Replit (https://status.replit.com)
2. ✅ Si outage prolongado (>1 hora), considerar failover
3. ✅ Opcional: Deploy en infraestructura alternativa (Vercel, Railway)
4. ✅ Actualizar DNS si es necesario
5. ✅ Comunicar a usuarios vía email

**Tiempo Estimado:** 30 minutos - 2 horas (dependiendo de failover)

---

### Escenario 4: Eliminación Accidental de Datos
**Causas:** Error humano, bug en DELETE query

**Impacto:** Medio - Pérdida de subset de datos  
**Frecuencia Estimada:** 1 vez cada 3-6 meses

**Procedimiento de Recuperación:**
1. ✅ Identificar timestamp de eliminación (audit logs)
2. ✅ Seleccionar backup anterior al incidente
3. ✅ Restaurar en DB temporal
4. ✅ Exportar registros eliminados
5. ✅ Re-insertar en DB principal
6. ✅ Validar con audit logs

**Comandos:**
```bash
# 1. Buscar en audit logs cuándo se eliminó
psql "${DATABASE_URL}" -c "SELECT * FROM audit_logs WHERE action='delete' AND entity_type='worker' ORDER BY timestamp DESC LIMIT 10;"

# 2. Restaurar backup anterior al incidente
# 3. Exportar registros específicos
# 4. Re-insertar
```

**Tiempo Estimado:** 1-3 horas

---

## 🔧 HERRAMIENTAS Y ACCESOS

### Herramientas Requeridas
- [x] Acceso a Replit Dashboard
- [x] Acceso a Neon Database Console
- [x] Variables de entorno (DATABASE_URL, BACKUP_ENCRYPTION_PASSWORD)
- [x] Scripts de backup/restore (`server/scripts/`)
- [x] Acceso a email para notificaciones

### Credenciales Críticas (Almacenar en 1Password/Vault)
- ✅ Replit account credentials
- ✅ Neon database credentials
- ✅ BACKUP_ENCRYPTION_PASSWORD
- ✅ DNS provider credentials (si dominio custom)

---

## 📊 CHECKLIST POST-RECUPERACIÓN

Después de cualquier procedimiento de DR, verificar:

### 1. Funcionalidad Básica
- [ ] Endpoint `/health` retorna 200 OK
- [ ] Login de usuarios funciona
- [ ] Dashboard carga correctamente
- [ ] Datos visibles en tablas principales

### 2. Integridad de Datos
- [ ] Contar registros en tablas críticas (workers, accidents, trainings)
- [ ] Verificar datos de últimas 24h están presentes
- [ ] Audit logs muestran actividad reciente

### 3. Configuración
- [ ] DATABASE_URL apunta a DB correcta
- [ ] Variables de entorno configuradas
- [ ] Backups nocturnos programados

### 4. Comunicación
- [ ] Notificar a stakeholders que sistema está restaurado
- [ ] Documentar incidente en postmortem
- [ ] Actualizar runbook si se encontraron gaps

---

## 🔄 PROCEDIMIENTOS DE BACKUP

### Backup Manual (Ad-hoc)
```bash
tsx server/scripts/backup-database.ts
```

### Backup Programado (Cron)
```bash
# Agregar a crontab (producción)
0 2 * * * cd /app && tsx server/scripts/backup-database.ts >> /var/log/backups.log 2>&1
```

### Verificar Backups
```bash
# Listar backups
ls -lh /tmp/db-backups/

# Ver último backup
ls -lt /tmp/db-backups/ | head -n 2

# Verificar tamaño (debe ser >1MB para DB con datos)
du -h /tmp/db-backups/*.enc | tail -n 1
```

---

## 🧪 DRILL DE DISASTER RECOVERY (Quarterly)

**Objetivo:** Validar que el procedimiento de DR funciona y el equipo está preparado

**Frecuencia:** Cada 3 meses

**Procedimiento:**
1. ✅ Programar drill con 1 semana de anticipación
2. ✅ Crear backup de producción
3. ✅ Restaurar backup en ambiente de staging
4. ✅ Verificar integridad de datos restaurados
5. ✅ Medir tiempos (¿RTO/RPO cumplidos?)
6. ✅ Documentar lecciones aprendidas
7. ✅ Actualizar runbook si es necesario

**Métricas a Validar:**
- Tiempo total de restauración (target: ≤4h)
- Pérdida de datos (target: ≤24h)
- % de funcionalidad restaurada (target: 100%)

---

## 📞 CONTACTOS DE EMERGENCIA

### Equipo Técnico
- **Desarrollador Principal:** [Nombre] - [Email] - [Teléfono]
- **DBA:** [Nombre] - [Email] - [Teléfono]
- **DevOps:** [Nombre] - [Email] - [Teléfono]

### Proveedores
- **Replit Support:** support@replit.com
- **Neon Support:** https://neon.tech/support

### Escalación
1. Desarrollador Principal (0-1 hora)
2. DBA + DevOps (1-2 horas)
3. CTO/Management (>2 horas)

---

## 📝 REGISTRO DE INCIDENTES

| Fecha | Tipo Desastre | Causa | RTO Real | RPO Real | Lecciones Aprendidas |
|-------|---------------|-------|----------|----------|---------------------|
| - | - | - | - | - | Sin incidentes registrados |

---

## 🔐 REQUISITOS DE CUMPLIMIENTO

### Legal Colombiano
- **Decreto 1074/2015:** Registros SST deben conservarse 20 años
- **Ley 1581/2012:** Backups deben proteger datos personales (encriptación)
- **Resolución 2346/2007:** Historia clínica ocupacional requiere backup inmutable

### Retención de Backups
- **Diarios:** 30 días (hot storage)
- **Mensuales:** 12 meses (warm storage)
- **Anuales:** 20 años (cold storage / archival)

---

## 🎯 MEJORAS FUTURAS (Post-Lanzamiento)

**Prioridad Alta:**
- [ ] Implementar backup automático a object storage externo (R2/S3)
- [ ] Configurar alertas de backup fallidos (email/Slack)
- [ ] Agregar backup verification automático (restore test)

**Prioridad Media:**
- [ ] Implementar point-in-time recovery (Neon branches)
- [ ] Documentar procedimiento de failover multi-región
- [ ] Crear dashboard de monitoreo de backups

**Prioridad Baja:**
- [ ] Automatizar restore con scripts CI/CD
- [ ] Implementar backup incremental (reducir storage)

---

**Versión:** 1.0  
**Próxima Revisión:** Febrero 2026  
**Owner:** Equipo DevOps SST Colombia

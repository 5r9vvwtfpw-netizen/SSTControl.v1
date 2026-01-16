# 📊 NEON DATABASE MONITORING GUIDE

**Sistema:** SST Colombia  
**Base de Datos:** PostgreSQL 15 (Neon)  
**Versión:** 1.0  
**Última Actualización:** 11 de noviembre de 2025

---

## 🎯 OBJETIVO

Esta guía describe cómo monitorear la base de datos Neon PostgreSQL para garantizar:
- **Disponibilidad:** Uptime >99.9%
- **Performance:** Query response time <200ms (p95)
- **Capacidad:** Storage utilization <80%
- **Seguridad:** Conexiones autorizadas únicamente

---

## 🔍 MÉTRICAS CLAVE

### 1. Health Check Endpoint

**URL:** `GET /health`

**Respuesta Exitosa (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-11-11T10:30:00.000Z",
  "database": "connected",
  "uptime": 86400
}
```

**Respuesta Fallo (503):**
```json
{
  "status": "error",
  "timestamp": "2025-11-11T10:30:00.000Z",
  "database": "disconnected",
  "error": "Connection timeout"
}
```

**Monitoreo:**
- Verificar cada 60 segundos
- Alertar si 3 fallos consecutivos
- Configurar en UptimeRobot, Pingdom o similar

---

### 2. Neon Console Metrics

**Acceso:** https://console.neon.tech/

**Métricas Disponibles:**

#### A. Connection Pool
- **Active Connections:** Conexiones activas en uso
- **Idle Connections:** Conexiones abiertas pero inactivas
- **Waiting Connections:** Queries esperando conexión

**Valores Normales:**
- Active: 5-20 conexiones (depende de tráfico)
- Idle: <10 conexiones
- Waiting: 0 conexiones

**Alertas:**
- Warning: Waiting >5
- Critical: Waiting >20

#### B. Storage Usage
- **Total Storage:** Espacio total usado
- **Growth Rate:** Crecimiento diario

**Valores Normales:**
- SST pequeño (<100 workers): 50-100 MB
- SST mediano (100-500 workers): 100-500 MB
- SST grande (>500 workers): 500 MB - 2 GB

**Alertas:**
- Warning: >80% de cuota
- Critical: >95% de cuota

#### C. Query Performance
- **Average Query Time:** Tiempo promedio de queries
- **Slow Queries:** Queries >1 segundo
- **Failed Queries:** Queries con error

**Valores Normales:**
- Average: <100ms
- Slow Queries: <1% del total
- Failed Queries: <0.1%

**Alertas:**
- Warning: Average >200ms
- Critical: Slow Queries >5%

---

### 3. Application Logs (Pino)

**Ubicación:** Consola de Replit o archivo de logs

**Queries a Monitorear:**

```bash
# Errores de conexión a DB (últimas 24h)
grep "database connection error" /var/log/app.log | tail -n 50

# Queries lentas (>500ms)
grep "slow query" /var/log/app.log | tail -n 20

# Errores de transacción
grep "transaction failed" /var/log/app.log | tail -n 10
```

---

### 4. Audit Logs

**Query:**
```sql
-- Actividad reciente de auditoría
SELECT 
  entity_type,
  action,
  COUNT(*) as operations,
  MAX(timestamp) as last_operation
FROM audit_logs
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY entity_type, action
ORDER BY operations DESC;
```

**Valores Esperados:**
- 10-100 operaciones/día (depende de actividad)
- No debería haber `delete` en producción sin justificación
- `view` debería ser la acción más común

---

## 🚨 ALERTAS RECOMENDADAS

### Alert 1: Database Down
**Condición:** Health check falla 3 veces consecutivas  
**Severidad:** Critical  
**Acción:** Página inmediata a equipo DevOps  

### Alert 2: High Connection Usage
**Condición:** Active connections >50  
**Severidad:** Warning  
**Acción:** Investigar queries lentas, considerar aumentar pool  

### Alert 3: Storage Critical
**Condición:** Storage usage >95%  
**Severidad:** Critical  
**Acción:** Cleanup de datos antiguos o upgrade de plan  

### Alert 4: Slow Query Spike
**Condición:** Slow queries >10% del total en 5 minutos  
**Severidad:** Warning  
**Acción:** Analizar query patterns, agregar índices  

### Alert 5: Backup Failed
**Condición:** Backup script retorna exit code 1  
**Severidad:** High  
**Acción:** Validar credentials, espacio en disco  

---

## 📈 DASHBOARDS RECOMENDADOS

### Dashboard 1: Real-Time Health (Neon Console)
- Active Connections (line chart)
- Storage Usage (gauge)
- Query Latency (p50, p95, p99)
- Error Rate (%)

**Refresh:** 1 minuto  
**Audience:** DevOps team

### Dashboard 2: Business Metrics (Custom)
**Queries:**
```sql
-- Trabajadores activos por empresa
SELECT 
  c.name,
  COUNT(w.id) as active_workers
FROM companies c
LEFT JOIN workers w ON w.company_id = c.id AND w.status = 'activo'
GROUP BY c.id, c.name
ORDER BY active_workers DESC;

-- Accidentes reportados (últimos 30 días)
SELECT 
  DATE(date) as report_date,
  severity,
  COUNT(*) as incidents
FROM accidents
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY report_date, severity
ORDER BY report_date DESC;

-- Capacitaciones completadas (mes actual)
SELECT 
  status,
  COUNT(*) as trainings
FROM trainings
WHERE DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY status;
```

**Refresh:** 1 hora  
**Audience:** Management

---

## 🔧 TROUBLESHOOTING

### Problema 1: "Too many connections"
**Síntomas:** Error `FATAL: too many connections for role`  
**Causa:** Connection pool agotado  
**Solución:**
1. Verificar conexiones activas: `SELECT count(*) FROM pg_stat_activity;`
2. Matar conexiones idle: `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle';`
3. Aumentar max_connections en Neon (upgrade plan)

### Problema 2: Queries lentas persistentes
**Síntomas:** Average query time >500ms  
**Causa:** Falta de índices o query mal optimizada  
**Solución:**
1. Identificar query lenta: `SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;`
2. Analizar plan de ejecución: `EXPLAIN ANALYZE <query>;`
3. Agregar índices necesarios
4. Optimizar query

### Problema 3: Storage creciendo inesperadamente
**Síntomas:** Storage usage aumenta >10% diario  
**Causa:** Datos no archivados, falta de cleanup  
**Solución:**
1. Identificar tablas grandes: `SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) FROM pg_tables ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;`
2. Archivar audit logs antiguos (>1 año)
3. Implementar retention policies

---

## 📊 QUERIES ÚTILES

### Query 1: Database Size
```sql
SELECT pg_size_pretty(pg_database_size(current_database()));
```

### Query 2: Table Sizes
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
```

### Query 3: Active Connections
```sql
SELECT 
  datname,
  usename,
  application_name,
  client_addr,
  state,
  query_start,
  NOW() - query_start AS duration
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY duration DESC;
```

### Query 4: Index Usage
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan AS index_scans,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC
LIMIT 10;
```

### Query 5: Audit Log Statistics
```sql
-- Operaciones por tipo y entidad (última semana)
SELECT 
  entity_type,
  action,
  COUNT(*) as operations,
  COUNT(DISTINCT user_id) as unique_users
FROM audit_logs
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY entity_type, action
ORDER BY operations DESC;
```

---

## 🔐 SEGURIDAD

### Conexiones Autorizadas
**Verificar IPs permitidas:**
1. Acceder a Neon Console
2. Settings > Security
3. Verificar IP Whitelist

**Solo permitir:**
- Replit IP ranges
- VPN empresarial
- IPs de desarrolladores autorizados

### Credenciales
**Rotación:**
- Cambiar PASSWORD cada 90 días (opcional en Neon)
- Rotar DATABASE_URL si hay exposición

**Almacenamiento:**
- DATABASE_URL en Secrets de Replit (encrypted)
- Nunca en código fuente
- Nunca en logs

---

## 📅 RUTINAS DE MANTENIMIENTO

### Diaria
- ✅ Verificar health check endpoint
- ✅ Revisar backup nocturno exitoso
- ✅ Monitorear storage usage

### Semanal
- ✅ Analizar slow queries y optimizar
- ✅ Verificar crecimiento de audit logs
- ✅ Revisar errores en logs de aplicación

### Mensual
- ✅ Ejecutar drill de disaster recovery
- ✅ Analizar índices no utilizados (cleanup)
- ✅ Revisar performance metrics y ajustar plan

### Trimestral
- ✅ Audit de seguridad (conexiones, permisos)
- ✅ Actualizar documentación de monitoreo
- ✅ Revisar retention policies

---

## 🎯 SLAs Y OBJETIVOS

| Métrica | Target | Actual | Status |
|---------|--------|--------|--------|
| Uptime | >99.9% | TBD | 🟢 |
| Avg Query Time (p95) | <200ms | TBD | 🟢 |
| Storage Usage | <80% | TBD | 🟢 |
| Backup Success Rate | 100% | TBD | 🟢 |
| Health Check Failures | 0/day | TBD | 🟢 |

---

## 📞 ESCALACIÓN

**Nivel 1 (0-30 min):** DevOps Team  
**Nivel 2 (30-60 min):** DBA + Tech Lead  
**Nivel 3 (>60 min):** CTO + Neon Support

**Contactos:**
- Neon Support: https://neon.tech/support
- Replit Support: support@replit.com

---

**Versión:** 1.0  
**Próxima Revisión:** Febrero 2026  
**Owner:** Equipo DevOps SST Colombia

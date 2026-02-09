# INFORME: Viabilidad de Expansión Internacional del Sistema SST
**Fecha:** Febrero 9, 2026
**Estado:** Investigación completada — Pendiente de decisión

---

## 1. RESUMEN EJECUTIVO

El sistema SST Colombia se puede clonar y adaptar a otros países de Latinoamérica. Es una oportunidad real de negocio con un mercado estimado de $105-210 millones USD en la región. La arquitectura actual (multi-tenencia, RBAC, PHVA, motor de precios dinámico) facilita la expansión.

**Estrategia recomendada:** Clonar para los primeros 2-3 países, unificar en arquitectura multi-país cuando haya volumen suficiente (3+ países con clientes pagando).

---

## 2. TAMAÑO DEL MERCADO

| Dato | Valor |
|------|-------|
| Mercado global software SST | **$2,100 millones USD (2024)** |
| Crecimiento anual (CAGR) | **11.3% hasta 2033** |
| Latinoamérica | **$105-210 millones USD** (5-10% del global) |
| Principales mercados LATAM | Brasil, México, Colombia, Chile, Perú, Argentina |

---

## 3. PAÍSES CON MAYOR OPORTUNIDAD

### Tier 1 — Alta prioridad (regulación madura + Stripe disponible)

| País | Regulación principal | Stripe | Moneda | Dificultad de adaptación |
|------|---------------------|--------|--------|--------------------------|
| **Perú** | Ley 29783 + DS 005-2012 | Sí | PEN | **Media** — Estructura similar (PHVA, comités, indicadores) |
| **Chile** | Ley 16.744 + DS 40 | Sí | CLP | **Media** — Enfoque ISO 45001, riesgos psicosociales |
| **México** | Ley Federal del Trabajo + NOM-030 | Sí | MXN | **Media-Alta** — NOMs específicas, sistema diferente |
| **Ecuador** | Código Trabajo + Decreto 255/2024 | No* | USD | **Baja** — Comunidad Andina (CAN), normativa similar a Colombia |

### Tier 2 — Oportunidad media

| País | Regulación | Stripe | Dificultad |
|------|-----------|--------|------------|
| **Panamá** | Código de Trabajo | Sí | Media |
| **Costa Rica** | Código de Trabajo | Sí | Media |
| **Brasil** | CLT + NRs (37 normas) | Sí | **Alta** — Portugués, sistema muy diferente |

### Tier 3 — Complejo

| País | Problema principal |
|------|-------------------|
| **Argentina** | Stripe NO disponible, control de cambios, inestabilidad económica |
| **Venezuela** | Stripe NO disponible, restricciones de pagos |

*Ecuador no tiene Stripe directo pero usa USD, se puede cobrar con pasarela alternativa (Kushki, dLocal, Mercado Pago).

---

## 4. NORMATIVA SST POR PAÍS

### Colombia (actual)
- Decreto 1072 de 2015 (SG-SST)
- Resolución 0312 de 2019 (Estándares mínimos)
- Resolución 40595 de 2022 (PESV)
- Resolución 2607/2024 (Peligros y riesgos)
- Entidad: Ministerio del Trabajo + ARL

### Perú
- Ley 29783 (Ley de SST)
- DS 005-2012-TR (Reglamento)
- Entidad: SUNAFIL
- **Similitud con Colombia:** Alta (ciclo PHVA, comités, indicadores)

### Chile
- Ley 16.744 (Seguro de accidentes)
- DS 40/1969
- Plan Nacional SST 2024
- Entidad: ISL + Superintendencia de Seguridad Social
- **Diferencia clave:** Riesgos psicosociales (cuestionario CEAL-SM/SUSESO)

### México
- Ley Federal del Trabajo
- Reglamento Federal de SST
- NOM-030-STPS-2009 (preventivos)
- NOM-035 (riesgos psicosociales)
- Entidad: STPS

### Ecuador
- Código del Trabajo
- Decreto 255 (mayo 2024) - Nuevo Reglamento SST
- Decisión 584 CAN (misma que Colombia)
- Entidad: Ministerio del Trabajo + IESS

### Brasil
- CLT (Consolidação das Leis do Trabalho)
- NR 1-37 (Normas Regulamentadoras)
- Entidad: Ministério do Trabalho e Emprego
- **Diferencia clave:** Idioma portugués, 37 normas reguladoras

### Argentina
- Ley 24.557 (Riesgos del Trabajo)
- Decreto 351/79 (Higiene y Seguridad)
- Entidad: SRT

### Elementos comunes en toda la región
1. Sistema de Gestión basado en ciclo PHVA
2. Matrices de identificación de peligros
3. Comités de SST obligatorios
4. Capacitación continua obligatoria
5. Vigilancia de salud (exámenes médicos)
6. Indicadores de gestión (estructura, proceso, resultado)
7. Plan de emergencias

---

## 5. ANÁLISIS DE REUTILIZACIÓN DEL CÓDIGO

### Componentes reutilizables sin cambios (~70-75%)

| Componente | % Reutilizable |
|-----------|---------------|
| Gestión de trabajadores | 100% |
| Registro de accidentes/incidentes | 95% |
| Sistema de capacitaciones | 90% |
| Ciclo PHVA (Plan-Do-Check-Act) | 100% |
| Dashboard y reportes | 90% |
| Sistema de roles y permisos (RBAC) | 100% |
| Multi-tenencia | 100% |
| Sistema de suscripciones y pagos | 85% |
| Motor de precios V2 | 80% |
| Generación de PDFs | 90% |
| Cifrado de datos (AES-256-GCM) | 100% |
| Auditorías internas | 85% |
| Plan de emergencias | 90% |
| Exámenes médicos | 85% |
| Sistema de notificaciones | 100% |

### Componentes que requieren adaptación por país (~25-30%)

| Componente Colombia | Líneas de código | Adaptación necesaria |
|---------------------|-----------------|---------------------|
| Clasificación CIIU a Riesgo ARL | ~1,700 | Sistema de riesgo laboral del nuevo país |
| Estándares Resolución 0312/2019 | ~1,300 | Estándares regulatorios locales |
| Normativa colombiana (catálogos) | ~1,860 | Leyes y decretos del nuevo país |
| Módulo PESV completo | ~1,500 | Equivalente de seguridad vial del país (si existe) |
| Tarifas ARL | ~135 | Tarifas de seguro laboral local |
| Planes de suscripción (seed) | ~500+ | Precios adaptados al mercado local |
| **Total código específico** | **~7,000 líneas** | |

### Archivos principales específicos de Colombia
```
shared/ciiu-risk-classification.ts     (1,043 líneas)
shared/ciiu-decreto-768-2022.ts        (656 líneas)
shared/ciiu-unified-classification.ts  (171 líneas)
shared/ciiu-company-automation.ts      (281 líneas)
shared/arl-rates.ts                    (135 líneas)
shared/pasos-pesv.ts                   (632 líneas)
client/src/data/normas-colombianas-sst.ts  (558 líneas)
client/src/data/planear-normativa.ts   (1,306 líneas)
client/src/data/pasos-pesv.ts          (866 líneas)
server/sst-seed.ts                     (1,316 líneas)
```

---

## 6. PASARELA DE PAGOS POR PAÍS

| País | Stripe | Moneda | Multiplicador | Métodos locales |
|------|--------|--------|---------------|-----------------|
| Colombia | Sí | COP | x100 | Tarjetas |
| Perú | Sí | PEN | x100 | Tarjetas |
| Chile | Sí | CLP | x1 (zero-decimal) | Tarjetas |
| México | Sí | MXN | x100 | Tarjetas, OXXO (cash) |
| Brasil | Sí | BRL | x100 | Tarjetas, Pix, Boleto |
| Costa Rica | Sí | CRC | x100 | Tarjetas |
| Panamá | Sí | USD | x100 | Tarjetas |
| Ecuador | No | USD | — | Kushki, Mercado Pago, dLocal |
| Argentina | No | ARS | — | Mercado Pago, dLocal |

**Nota importante:** CLP (peso chileno) es zero-decimal en Stripe. El multiplicador debe ser x1, no x100.

---

## 7. COMPETENCIA EN LATINOAMÉRICA

| Competidor | País base | Fortaleza | Debilidad vs. nuestro sistema |
|-----------|-----------|-----------|-------------------------------|
| **Pensemos** | Colombia | SGSST Colombia completo | Solo Colombia, no multi-país |
| **Kawak** | Chile | ISO multi-norma, +900 empresas | No específico SST, más genérico |
| **ORPHEUS** | Ecuador | SSO Ecuador, app móvil | Solo Ecuador |
| **SYSOTools** | Costa Rica | Centroamérica, expediente médico | Limitado a una región |
| **Prevengos** | España | Multi-empresa, Europa+LATAM | No adaptado a regulaciones LATAM específicas |
| **Cority** | Global | Enterprise, IA | Muy costoso para PyMEs |
| **Enablon** | Global | Enterprise, ISO 45001 | Muy costoso, no hablan español nativo |
| **SafetyCulture** | Global | Mobile-first, inspecciones | No cumplimiento regulatorio local |

### Nuestras ventajas competitivas
1. Sistema completo SST + PESV integrado (nadie más lo tiene)
2. Pricing dinámico basado en riesgo real (único en el mercado)
3. Precios accesibles para PyMEs latinoamericanas
4. Cumplimiento regulatorio específico por país
5. Ciclo PHVA automatizado con trazabilidad completa
6. Pagos con Stripe funcionando

---

## 8. ESFUERZO ESTIMADO POR PAÍS

| Actividad | Tiempo estimado |
|-----------|----------------|
| Investigación regulatoria del país | 2-3 semanas |
| Adaptar clasificación de riesgo | 1-2 semanas |
| Crear estándares del país | 2-3 semanas |
| Adaptar motor de precios | 1 semana |
| Adaptar moneda/pagos | 2-3 días |
| Traducir/adaptar interfaz | 1 semana (solo Brasil) |
| Pruebas y ajustes | 2 semanas |
| **Total primer país adicional** | **8-12 semanas** |
| **Países subsiguientes** | **4-6 semanas** |

---

## 9. REQUISITOS LEGALES PARA VENDER SaaS INTERNACIONALMENTE

### IVA Digital
- Colombia, Chile, México y Argentina cobran IVA a servicios digitales
- Necesario registrarse como contribuyente en cada país donde se venda

### Protección de datos por país
| País | Ley |
|------|-----|
| Colombia | Ley 1581 de 2012 |
| Perú | Ley 29733 |
| Chile | Ley 19.628 |
| México | LFPDPPP |
| Brasil | LGPD |
| Ecuador | Ley Orgánica de Protección de Datos 2021 |

Nuestro cifrado AES-256-GCM cumple técnicamente con todas estas leyes.

### Facturación electrónica
Casi todos los países LATAM exigen facturación electrónica. Se necesitaría un proveedor como EDICOM o SERES para multi-país.

### Opciones de domicilio fiscal
- Operar como empresa colombiana vendiendo al exterior
- Crear subsidiarias locales en cada país
- Usar socios comerciales locales (distribuidores)

---

## 10. ESTRATEGIA DE EXPANSIÓN RECOMENDADA

### Enfoque: Clonar primero, unificar después

| Fase | Acción | Cuándo |
|------|--------|--------|
| **Fase 1** | Colombia funcionando y generando ingresos | Ahora (completado) |
| **Fase 2** | Clonar para **1 país** (Perú o Ecuador) | Cuando Colombia tenga clientes estables |
| **Fase 3** | Validar ventas en ese segundo país | 3-6 meses después del lanzamiento |
| **Fase 4** | Si funciona, clonar un tercer país | Cuando el segundo país sea rentable |
| **Fase 5** | Con 3+ países exitosos, unificar en multi-país | Cuando se tenga equipo y recursos |

### Orden sugerido de expansión
1. **Perú** — Regulación similar (Comunidad Andina), Stripe disponible
2. **Ecuador** — Normativa CAN muy parecida, usa USD
3. **Chile** — Mercado maduro, empresas dispuestas a pagar
4. **México** — Mercado más grande hispanohablante, regulación más diferente
5. **Brasil** — Mercado más grande total, requiere portugués

### Razones para clonar en lugar de multi-país (al inicio)
- Más rápido para validar el mercado
- Independencia entre países (un error no afecta a otros)
- Equipos separados sin pisarse
- Se puede vender cada sistema como producto separado
- 2-3 clones se manejan bien; el caos empieza con 5+

### Cuándo migrar a multi-país
- Cuando haya 3+ países con clientes pagando
- Cuando el costo de mantener clones separados supere el de unificar
- Cuando se tenga un equipo técnico más grande

---

## 11. CONCLUSIÓN

El proyecto de expansión internacional es **viable y tiene potencial alto**. El sistema actual tiene la base técnica correcta (multi-tenencia, RBAC, PHVA, motor de precios dinámico, cifrado). La clave es:

1. Validar primero en Colombia con clientes reales
2. Clonar para un segundo país (Perú recomendado) cuando haya estabilidad
3. No sobre-ingenierizar la arquitectura antes de validar el mercado
4. Unificar cuando el volumen lo justifique

**Fuentes consultadas:** OIT, Ministerios de Trabajo de cada país, SUNAFIL (Perú), ISL (Chile), STPS (México), SRT (Argentina), Stripe Global, G2, Capterra, Gartner, Growth Market Reports, EDICOM, GroupSERES.

---

*Documento generado para análisis interno. Pendiente de decisión del propietario.*

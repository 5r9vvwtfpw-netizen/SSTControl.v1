# Tutoriales SG-SST Colombia

Esta carpeta contiene tutoriales paso a paso para aprender a usar el sistema.

## Estructura Sugerida

Cada tutorial debe incluir:
- Título claro y descriptivo
- Objetivo del tutorial
- Requisitos previos
- Pasos numerados con capturas de pantalla
- Tips y mejores prácticas
- Posibles errores y soluciones

## Tutoriales Recomendados

### Básicos (Prioridad Alta)
1. `01-configuracion-inicial.md` - Primer acceso y configuración
2. `02-crear-empresa.md` - Cómo crear y configurar una empresa
3. `03-gestion-trabajadores.md` - Registro y gestión de trabajadores
4. `04-crear-contratos.md` - Cómo crear contratos laborales

### Intermedios
5. `05-perfiles-cargo.md` - Creación de perfiles de cargo
6. `06-registro-accidentes.md` - Cómo registrar un accidente laboral
7. `07-evaluaciones-sst.md` - Realizar evaluación de estándares mínimos
8. `08-portal-empleados.md` - Uso del portal de empleados

### Avanzados
9. `09-pesv-completo.md` - Implementación completa de PESV
10. `10-generacion-informes.md` - Generación de reportes PDF
11. `11-gestion-cambios.md` - Uso del módulo de Gestión de Cambios
12. `12-comunicaciones-sst.md` - Sistema de comunicación SST

## Formato Recomendado

```markdown
# Tutorial: [Título]

**Objetivo:** [Qué aprenderá el usuario]  
**Tiempo estimado:** [15-30 minutos]  
**Requisitos previos:** [Qué debe saber antes]

## Paso 1: [Título del paso]

[Descripción detallada]

![Captura de pantalla](../imagenes/tutorial-01-paso-01.png)

> 💡 **Tip:** [Consejo útil]

## Paso 2: [Título del paso]

...

## Resultado Final

[Qué logró el usuario]

## Problemas Comunes

### Error: [Descripción del error]
**Solución:** [Cómo resolverlo]

## Siguientes Pasos

- [Enlace a tutorial relacionado]
- [Enlace a documentación adicional]
```

## Agregar Imágenes

1. Crear carpeta `docs/imagenes/` para capturas de pantalla
2. Nombrar imágenes descriptivamente: `tutorial-01-paso-01.png`
3. Referenciar en Markdown: `![Descripción](../imagenes/imagen.png)`

## Convertir a HTML

Para publicar tutoriales en HTML, usa herramientas como:
- Markdown → HTML: `marked` (ya instalado en el proyecto)
- Generadores de sitios estáticos: `mkdocs`, `docsify`, `vuepress`

## Convertir a PDF

Para generar PDFs de tutoriales:

```bash
# Usando md-to-pdf (ya instalado)
npx md-to-pdf tutorial.md --output tutorial.pdf
```

## Próximos Tutoriales

- [ ] Tutorial 01: Configuración Inicial
- [ ] Tutorial 02: Crear Primera Empresa
- [ ] Tutorial 03: Gestión de Trabajadores
- [ ] Tutorial 04: Crear Contratos
- [ ] Tutorial 05: Perfiles de Cargo
- [ ] Tutorial 06: Registro de Accidentes
- [ ] Tutorial 07: Evaluaciones SST
- [ ] Tutorial 08: Portal de Empleados

---

**Nota:** Estos tutoriales complementan el Manual de Usuario completo ubicado en `docs/manual/`

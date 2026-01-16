# Manual de Usuario - SG-SST Colombia

Esta carpeta contiene el manual completo de usuario del sistema.

## Archivos Disponibles

### 📄 PLANTILLA-MANUAL.md
Plantilla completa en Markdown del manual de usuario. Puedes:
1. Editar este archivo para completar con tus datos
2. Agregar capturas de pantalla
3. Convertir a PDF usando herramientas como:
   - `md-to-pdf` (ya instalado en el proyecto)
   - Pandoc
   - Typora
   - Exportar desde VSCode

### Convertir Markdown a PDF

```bash
# Opción 1: Usando md-to-pdf (instalado en el proyecto)
npx md-to-pdf PLANTILLA-MANUAL.md --output manual-usuario-completo.pdf

# Opción 2: Usando pandoc (si lo tienes instalado)
pandoc PLANTILLA-MANUAL.md -o manual-usuario-completo.pdf --pdf-engine=xelatex

# Opción 3: Exportar desde VSCode con extensión Markdown PDF
# 1. Instalar extensión "Markdown PDF"
# 2. Abrir PLANTILLA-MANUAL.md
# 3. Ctrl+Shift+P → "Markdown PDF: Export (pdf)"
```

## Estructura del Manual

El manual está organizado siguiendo el ciclo PHVA:

1. **Introducción** - Qué es el sistema, marco normativo
2. **Primeros Pasos** - Acceso, navegación básica
3. **Configuración** - Empresas, usuarios, portal empleados
4. **Planear** - Trabajadores, contratos, perfiles, evaluaciones
5. **Hacer** - Exámenes, capacitaciones, inspecciones, PESV
6. **Verificar** - Accidentes, estándares, evaluaciones, informes
7. **Actuar** - Medidas preventivas, salud ocupacional
8. **Portal de Empleados** - Guía para trabajadores
9. **Roles y Permisos** - Matriz de accesos
10. **Preguntas Frecuentes** - Dudas comunes

## Próximos Archivos

Puedes crear estos PDFs adicionales:

- [ ] `guia-rapida.pdf` - Guía de inicio rápido (2-3 páginas)
- [ ] `marco-legal.pdf` - Normatividad aplicable en detalle
- [ ] `manual-administrador.pdf` - Manual específico para administradores
- [ ] `manual-coordinador-sst.pdf` - Manual para coordinadores SST
- [ ] `manual-trabajador.pdf` - Manual simplificado para trabajadores

## Tips para el Manual

### Agregar Capturas de Pantalla

1. Toma capturas en alta calidad (1920x1080 recomendado)
2. Guárdalas en `docs/imagenes/` con nombres descriptivos
3. Referenciar en Markdown:
   ```markdown
   ![Crear empresa](../imagenes/crear-empresa-01.png)
   ```

### Mejorar el PDF Final

- **Portada profesional:** Incluye logo, título, versión
- **Tabla de contenidos:** Automática con `md-to-pdf` o Pandoc
- **Encabezados y pies de página:** Con número de página
- **Formato consistente:** Usa estilos de heading apropiados
- **Enlaces internos:** Referencias a secciones del manual

### Herramientas Recomendadas

- **Canva:** Para diseñar una portada profesional
- **Typora:** Editor Markdown con exportación PDF elegante
- **LaTeX/Pandoc:** Para PDFs de nivel profesional
- **Markdown PDF (VSCode):** Rápido y simple

## Actualización del Manual

Cada vez que agregues funcionalidades al sistema:
1. Actualiza `PLANTILLA-MANUAL.md`
2. Regenera el PDF
3. Actualiza la fecha de versión
4. Notifica a los usuarios del sistema

---

**Versión actual:** 1.0  
**Última actualización:** Enero 2025

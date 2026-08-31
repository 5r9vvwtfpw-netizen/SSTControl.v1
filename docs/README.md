# Centro de Ayuda - SG-SST Colombia

Bienvenido al sistema de documentación y ayuda del Sistema de Gestión de Seguridad y Salud en el Trabajo.

## 📚 Acceso al Centro de Ayuda

### Desde la Aplicación
Haz clic en el ícono de **libro 📖** en el header (esquina superior derecha) para acceder al menú de ayuda con:
- Manual de Usuario
- Preguntas Frecuentes
- Contacto de Soporte

### Acceso Directo
- **Centro de Ayuda Principal:** [/docs/index.html](/docs/index.html)
- **Preguntas Frecuentes:** [/docs/faq/preguntas-frecuentes.html](/docs/faq/preguntas-frecuentes.html)

---

## 📁 Estructura de Carpetas

```
docs/
├── index.html              # Página principal del centro de ayuda
├── manual/                 # Manuales de usuario
│   ├── PLANTILLA-MANUAL.md # Plantilla completa para editar
│   └── README.md           # Instrucciones para crear PDFs
├── tutoriales/             # Tutoriales paso a paso
│   └── README.md           # Guía para crear tutoriales
└── faq/                    # Preguntas frecuentes
    └── preguntas-frecuentes.html
```

---

## ✅ Sistema de Ayuda Implementado

### ✨ Características Activas

1. **Botón de Ayuda en Header** 📖
   - Ubicado en la esquina superior derecha
   - Dropdown con 3 opciones:
     - Manual de Usuario → Abre centro de ayuda
     - Preguntas Frecuentes → Página de FAQ
     - Contactar Soporte → Email directo

2. **Centro de Ayuda Principal** (`/docs/index.html`)
   - Página HTML profesional con diseño verde corporativo
   - 6 secciones principales:
     - Manual de Usuario
     - Tutoriales
     - Preguntas Frecuentes
     - Guías Rápidas
     - Marco Legal
     - Soporte Técnico
   - Búsqueda de documentación (preparada para implementar)
   - Enlaces rápidos a recursos

3. **Preguntas Frecuentes** (`/docs/faq/preguntas-frecuentes.html`)
   - 30+ preguntas organizadas por categorías:
     - Configuración Inicial
     - Gestión de Trabajadores
     - Contratos y Perfiles de Cargo
     - Estándares SST y Evaluaciones
     - PESV
     - Portal de Empleados
     - Problemas Comunes
   - Respuestas detalladas con ejemplos
   - Tips y advertencias resaltadas

4. **Plantilla de Manual** (`/docs/manual/PLANTILLA-MANUAL.md`)
   - Manual completo de 10 secciones en Markdown
   - Listo para editar y personalizar
   - Incluye toda la funcionalidad del sistema
   - Se puede convertir a PDF

---

## 🎯 Próximos Pasos Recomendados

### 1. Completar el Manual de Usuario

**Opción A: Editar la Plantilla Markdown**
```bash
# Edita el archivo
nano docs/manual/PLANTILLA-MANUAL.md

# Convierte a PDF usando md-to-pdf (ya instalado)
npx md-to-pdf docs/manual/PLANTILLA-MANUAL.md --output docs/manual/manual-usuario-completo.pdf
```

**Opción B: Usar Herramientas Externas**
- **Canva:** Crear un PDF profesional desde cero
- **Google Docs:** Escribir y exportar a PDF
- **Typora:** Editor Markdown con exportación PDF elegante
- **Pandoc:** Conversión avanzada Markdown → PDF

### 2. Agregar Capturas de Pantalla

1. Crear carpeta `docs/imagenes/`
2. Tomar capturas de cada módulo
3. Referenciar en Markdown: `![Descripción](../imagenes/nombre.png)`

### 3. Crear Tutoriales en Video

- Grabar videos cortos (3-5 minutos) de tareas comunes
- Subirlos a YouTube o Vimeo
- Agregar enlaces en `/docs/index.html`

### 4. Actualizar Información de Contacto

En `/docs/index.html` y `/docs/faq/preguntas-frecuentes.html`, actualiza:
- Email de soporte: `soporte@sst.com.co`
- WhatsApp: `+57 300 123 4567`
- Horarios de atención

---

## 🛠️ Personalización

### Cambiar Colores

Los archivos HTML usan variables CSS que puedes modificar:

```css
:root {
    --primary: hsl(145, 63%, 25%);        /* Verde oscuro */
    --primary-light: hsl(145, 63%, 35%);  /* Verde claro */
    --primary-dark: hsl(145, 63%, 15%);   /* Verde oscuro */
}
```

### Agregar Nuevo Contenido

1. **Nueva página HTML:** Crear en `/docs/`
2. **Nuevo tutorial:** Crear en `/docs/tutoriales/`
3. **Actualizar enlaces:** Editar `/docs/index.html`

---

## 📞 Soporte para Desarrollo

Si necesitas ayuda para:
- Convertir Markdown a PDF
- Crear videos tutoriales
- Diseñar documentos profesionales
- Implementar búsqueda en documentación

Puedes contactar al equipo de desarrollo o consultar:
- [md-to-pdf documentation](https://github.com/simonhaenisch/md-to-pdf)
- [Pandoc User Guide](https://pandoc.org/MANUAL.html)

---

## ✨ Características Futuras Sugeridas

- [ ] Sistema de búsqueda en la documentación
- [ ] Videos tutoriales embebidos
- [ ] Chatbot de ayuda con IA
- [ ] Manual interactivo con demos en vivo
- [ ] Versiones del manual por rol (Admin, Coordinador, Trabajador)
- [ ] Traducción a inglés
- [ ] Changelog de actualizaciones del sistema

---

**Versión:** 4.1.0  
**Última actualización:** 31 de agosto de 2026  
**Estado:** ✅ Sistema de ayuda completamente funcional

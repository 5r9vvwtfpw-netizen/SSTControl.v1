# Tarea: automatizar el registro de actividades del estándar 1.2.1

## Objetivo

Reducir la digitación y los errores al programar actividades del Programa de Capacitación Anual en SST. El sistema debe proponer y precargar datos confiables, permitir que la persona los revise y confirme, y separar la programación de la evidencia de ejecución.

## Alcance

- Formulario «Programar actividad» del cronograma asociado al Programa de Capacitación Anual.
- Estándar 1.2.1.
- Integración con el catálogo de capacitaciones, los datos disponibles de la empresa y, en una fase posterior, un asistente que prepare borradores.
- Registro de ejecución y evidencia después de realizar la actividad.

No se debe guardar una propuesta del asistente sin confirmación. El asistente no debe inventar fechas, instructores, asistentes, evaluaciones ni evidencias, ni reemplazar la revisión profesional del fundamento normativo.

## Estado previo a la implementación

- El formulario usa principalmente campos de texto libre.
- La categoría es texto libre, aunque tiene que diligenciarse.
- Al crear una actividad se propone el 15 de enero del año del programa, incluso si esa fecha ya pasó.
- La asistencia real aparece inicialmente como cero aunque la actividad aún no haya ocurrido.
- El esquema ya contiene datos de frecuencia, población objetivo, duración, fundamento legal, modalidad, materiales, evaluación y asistencia individual.
- El catálogo SST ya contiene plantillas con nombre, duración, frecuencia, población destinataria, contenido mínimo, fundamento normativo, obligatoriedad y modalidades.
- El asistente de normativa que aparece en la página del programa no está conectado al formulario de esta actividad ni precarga sus campos.

## Avance de implementación

### Implementado

- Se conectó el catálogo de capacitaciones al formulario; seleccionar una plantilla precarga sus datos disponibles.
- La categoría se convirtió en una selección controlada y se conservan valores históricos al editar.
- Se eliminó la fecha fija del 15 de enero.
- Se separó la programación del registro de ejecución; los asistentes reales quedan pendientes hasta registrar la ejecución.
- Se añadió una propuesta generada por IA que solo se aplica al formulario cuando la persona la acepta.
- La propuesta no genera fundamento legal, instructor, fecha, asistencia, evaluación ni evidencias.
- El endpoint del asistente requiere permiso de creación y contexto de empresa.
- Se calcula el estimado de asistentes únicamente para poblaciones que corresponden a toda la plantilla activa de la empresa, y se muestra su fuente; los demás grupos se ingresan manualmente.
- La fecha sugerida depende de la frecuencia y el año del programa; se aplica solo cuando la persona pulsa el botón y puede revisarse.
- La ejecución admite asistencia por trabajador, total derivado de la lista y total manual para registros sin detalle individual.
- El servidor valida empresa, trabajador, permisos y rangos; el guardado de asistencia se realiza en transacción y no acepta trabajadores ajenos ni duplicados.
- La pantalla muestra que la asistencia no registrada está pendiente, no como cero; editar la actividad conserva los datos de ejecución.
- Se completó una prueba autenticada de la API y de la interfaz con una cuenta técnica de desarrollo y la empresa DEMO-PRUEBA. Verifica aislamiento, asistencia, edición, selección de plantilla, propuesta confirmada, continuidad cuando falla el asistente y PDF.
- La prueba temporal limpia el programa creado y degrada la cuenta técnica; no agrega registros de validación a producción.

## Secuencia de implementación

### Paso 1. Confirmar fuentes y reglas

- Revisar el catálogo vigente y determinar cómo cada capacitación se relaciona con los campos del registro.
- Confirmar qué datos de la empresa están disponibles para sugerir responsable, población destinataria y cantidad estimada.
- Revisar cómo se registran actualmente la asistencia individual, la evaluación y los archivos de evidencia.
- Mantener el aislamiento por empresa y los permisos existentes de creación y edición.
- No crear una segunda fuente de verdad para las capacitaciones obligatorias ni duplicar registros entre el Programa Anual y otros módulos.

**Resultado:** tabla de correspondencia entre fuente confiable y campo que se puede sugerir o completar.

### Paso 2. Dividir el flujo en programación y ejecución

Separar visualmente el formulario en dos momentos:

1. **Programar actividad:** preparar tema, categoría, fecha prevista, duración, población, modalidad, instructor y recursos planeados.
2. **Registrar ejecución:** después de realizar la actividad, completar fecha real, asistencia, evaluación, observaciones y evidencias.

Al crear una actividad, conservar el estado «Programada». No presentar como resultado real ningún dato que todavía no se haya medido.

**Resultado:** no se solicitan datos de ejecución para guardar una actividad futura.

### Paso 3. Conectar las plantillas del catálogo

Permitir comenzar con una capacitación del catálogo. Al seleccionarla, precargar, cuando exista correspondencia:

- tema;
- categoría y obligatoriedad, según reglas aprobadas;
- duración y frecuencia;
- población destinataria;
- fundamento normativo;
- descripción o contenido mínimo;
- modalidades permitidas.

La persona debe poder revisar y editar las propuestas antes de guardar. El catálogo define el fundamento legal; no se debe pedir al modelo de IA que lo invente.

**Resultado:** una capacitación seleccionada desde el catálogo no requiere volver a escribir los datos que ya están registrados en él.

### Paso 4. Sustituir la categoría de texto libre por una selección controlada

- Definir las categorías válidas a partir de los valores ya usados y de las plantillas.
- Conservar las categorías de registros históricos al editarlos.
- Permitir una categoría «Otra» con un campo de detalle solo si el negocio necesita registrar actividades que no cubre el catálogo.
- Validar la selección en el servidor, no únicamente en la interfaz.

**Resultado:** menos variaciones de escritura y mejores filtros e informes.

### Paso 5. Mejorar fecha, frecuencia y conteos

- Eliminar la fecha fija del 15 de enero como valor inicial.
- Mostrar la fecha sugerida según el año del programa y la frecuencia de la actividad, sin guardarla hasta que la persona la confirme.
- Permitir revisar y cambiar la fecha propuesta.
- No bloquear la edición de actividades históricas ni la carga de datos reales por el hecho de que la fecha ya haya pasado.
- Calcular asistentes estimados desde la población seleccionada solo si el registro de trabajadores ofrece datos suficientes; mostrar la cifra y su origen para confirmación.
- Tratar los asistentes reales como «Pendiente» hasta registrar la ejecución. Diferenciar una cifra no registrada de una actividad realizada con cero asistentes.

**Resultado:** se eliminan valores arbitrarios y se distingue lo planeado de lo realmente ocurrido.

### Paso 6. Añadir el asistente de preparación de borradores

Ubicarlo dentro de «Programar actividad», con dos entradas:

- seleccionar una plantilla del catálogo; o
- describir en lenguaje sencillo la actividad que se necesita.

El asistente podrá proponer tema, categoría permitida, descripción, contenido, población, duración y modalidad usando el catálogo y el contexto autorizado de la empresa. Podrá recomendar una fecha, pero la persona la debe confirmar.

Reglas del asistente:

- mostrar los datos propuestos antes de aplicarlos;
- identificar los campos completados desde el catálogo y los campos redactados como sugerencia;
- no guardar automáticamente;
- no crear fechas reales, asistencia, calificaciones, instructores ni enlaces de evidencia;
- usar únicamente fundamentos legales del catálogo aprobado;
- no incluir datos de otra empresa;
- si no encuentra una fuente confiable, dejar el campo sin completar y explicarlo.

**Resultado:** la persona puede solicitar un borrador y decidir qué propuestas aplicar, sin perder control del registro.

### Paso 7. Completar el registro de ejecución

Después de guardar la programación, ofrecer la acción «Registrar ejecución». En esa etapa:

- introducir la fecha real y la asistencia;
- reutilizar o completar la asistencia individual por trabajador, si el flujo de lista de asistencia está disponible;
- calcular el total de asistentes desde la lista cuando corresponda, evitando cifras contradictorias;
- capturar la evaluación y las observaciones;
- adjuntar o vincular la evidencia y el material realmente usados;
- cambiar el estado a «Completada» únicamente cuando se cumplan las condiciones definidas para el registro.

**Resultado:** los indicadores del cronograma reflejan actividades y participantes reales, no valores supuestos.

### Paso 8. Validar seguridad, datos y regresiones

- Validar los campos obligatorios y rangos numéricos en cliente y servidor.
- Comprobar permisos y aislamiento por empresa en creación, edición, asistencia y evidencias.
- Verificar que editar una actividad no borre datos de ejecución ya registrados.
- Verificar que no se dupliquen actividades por aplicar más de una vez una sugerencia.
- Probar actividades con plantilla, actividad libre, fechas pasadas, población sin datos suficientes, actividad cancelada y actividad completada.
- Probar que el asistente no exponga información de otras empresas y que los datos no respaldados queden pendientes de confirmación.

### Paso 9. Verificar el flujo completo antes de publicar

Verificación completada en desarrollo como usuario autorizado:

1. Se creó un programa anual y una actividad de prueba mediante la API autenticada.
2. Se comprobó en navegador la carga del cronograma, la asistencia pendiente y el registro de ejecución con selección de trabajadores.
3. Se seleccionó una plantilla, se verificaron los campos precargados y que no asigna fecha, y se completó el flujo del asistente: revisar, aplicar y guardar la propuesta; además, se comprobó que un error del servicio muestra un aviso y permite continuar con el formulario.
4. Se estimó la población objetivo, se guardó una lista individual de asistencia y se completó la ejecución.
5. Se comprobó que editar la actividad conserva fecha real, asistencia y estado.
6. Se generó el PDF autenticado del cronograma y se confirmó que incluye la actividad guardada.
7. Se verificó el registro de una actividad con fecha pasada y estado cancelado, el rechazo de un trabajador de otra empresa y la limpieza de los datos temporales.
8. TypeScript, compilación de producción y `git diff --check` finalizaron correctamente.

La verificación se hizo en desarrollo y no publica ni altera datos de producción.

### Resultado de la validación

- `npm run check`: correcto.
- `npm run build`: correcto; permanecen advertencias preexistentes sobre tamaño de bundle y configuración PostCSS/Browserslist.
- `RUN_PROGRAM_TRAINING_WORKFLOW_DEMO=1 node --import tsx --test tests/program-training-workflow-demo.test.ts`: correcto; el caso autenticado cubre API, plantilla, asistente y su error, estimado, ejecución, aislamiento, pantalla del cronograma y PDF.
- `git diff --check`: correcto.

## Criterios de aceptación

- No aparece una fecha inventada como valor preseleccionado al abrir el formulario.
- La plantilla seleccionada precarga los datos disponibles del catálogo y permite revisarlos antes de guardar.
- La categoría se selecciona de opciones controladas.
- El asistente prepara borradores dentro del formulario y requiere confirmación antes de aplicar o guardar.
- Ningún dato de ejecución se presenta como real antes de registrar la actividad.
- La asistencia real pendiente no aparece como cero.
- Las fechas, los asistentes y las evidencias reales son ingresados o confirmados por una persona o por registros verificables.
- Las rutas y consultas respetan los permisos y el contexto de empresa.
- Las pruebas confirman que el cronograma y sus informes conservan los datos guardados.

## Orden ejecutado

Se completaron los pasos 1 a 9 en el orden previsto: primero fuentes y reglas, luego programación y catálogo, después sugerencias del asistente y finalmente ejecución, seguridad y verificación. No se ha publicado el cambio.

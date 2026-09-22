import PDFDocument from "pdfkit";

export interface ConfidencialidadProfesionalSstData {
  nombreProfesional?: string;
  identificacionProfesional?: string;
  profesion?: string;
  licenciaSst?: string;
  correoProfesional?: string;
  fechaAcuerdo?: string;
}

const MARGIN = 50;
const C = {
  green: "#2D6A4F",
  greenDark: "#1B4332",
  white: "#FFFFFF",
  black: "#111111",
  gray: "#333333",
  graySoft: "#777777",
  gold: "#D4A017",
};
const YEAR = new Date().getFullYear();

export async function generateConfidencialidadProfesionalSstPdf(
  data: ConfidencialidadProfesionalSstData,
): Promise<Buffer> {
  const nombre = data.nombreProfesional?.trim() || "___________________________";
  const identificacion = data.identificacionProfesional?.trim() || "_______________";
  const profesion = data.profesion?.trim() || "Profesional en Seguridad y Salud en el Trabajo";
  const licencia = data.licenciaSst?.trim() || "No indicada";
  const correo = data.correoProfesional?.trim() || "___________________________";
  const fecha = data.fechaAcuerdo?.trim() || "___________________________";

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: "LETTER",
      margin: MARGIN,
      info: {
        Title: "Acuerdo de Confidencialidad para Profesionales en SST",
        Author: "SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.",
         Subject: "Confidencialidad, propiedad intelectual y uso restringido del software SST-Colombia",
      },
    });
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    let pageNumber = 0;
    const contentWidth = () => doc.page.width - MARGIN * 2;

    const footer = () => {
      const savedY = doc.y;
      const bottom = doc.page.height - MARGIN - 14;
      doc.moveTo(MARGIN, bottom).lineTo(doc.page.width - MARGIN, bottom)
        .strokeColor(C.graySoft).lineWidth(0.5).stroke();
      doc.font("Helvetica").fontSize(7).fillColor(C.graySoft)
        .text(`Página ${pageNumber}  |  DOCUMENTO CONFIDENCIAL  |  © ${YEAR} SST Colombia`, MARGIN, bottom + 5, {
          width: contentWidth(), align: "center", lineBreak: false,
        });
      doc.y = savedY;
    };

    const header = () => {
      pageNumber++;
      doc.rect(MARGIN, MARGIN, contentWidth(), 3).fill(C.green);
      doc.font("Helvetica").fontSize(7).fillColor(C.graySoft)
        .text("SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.  |  NIT 902.036.337-4  |  DOCUMENTO CONFIDENCIAL", MARGIN, MARGIN + 8, {
          width: contentWidth(), align: "center", lineBreak: false,
        });
      doc.moveTo(MARGIN, MARGIN + 22).lineTo(doc.page.width - MARGIN, MARGIN + 22)
        .strokeColor(C.graySoft).lineWidth(0.5).stroke();
      footer();
      doc.y = MARGIN + 40;
    };

    const ensureSpace = (needed = 60) => {
      if (doc.y + needed > doc.page.height - MARGIN - 30) {
        doc.addPage();
        header();
      }
    };

    const paragraph = (text: string) => {
      ensureSpace(36);
      doc.font("Helvetica").fontSize(9).fillColor(C.gray)
        .text(text, MARGIN, doc.y, { width: contentWidth(), align: "justify" });
      doc.moveDown(0.6);
    };

    const subtitle = (text: string) => {
      ensureSpace(30);
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor(C.green)
        .text(text, MARGIN, doc.y + 4, { width: contentWidth() });
      doc.moveDown(0.3);
    };

    const bullet = (label: string, text: string) => {
      ensureSpace(25);
      const indent = label ? 0 : 10;
      const y = doc.y;
      if (label) {
        doc.font("Helvetica-Bold").fontSize(8.5).fillColor(C.green)
          .text(`${label}  `, MARGIN + indent, y, { continued: true, width: contentWidth() - indent });
        doc.font("Helvetica").fillColor(C.gray).text(text, { align: "justify" });
      } else {
        doc.font("Helvetica").fontSize(9).fillColor(C.gray)
          .text(`•  ${text}`, MARGIN + indent, y, { width: contentWidth() - indent, align: "justify" });
      }
      doc.moveDown(0.4);
    };

    const clause = (number: string, title: string) => {
      ensureSpace(50);
      const y = doc.y + 8;
      doc.rect(MARGIN, y, contentWidth(), 22).fill(C.green);
      doc.font("Helvetica-Bold").fontSize(9.5).fillColor(C.white)
        .text(`CLÁUSULA ${number}: ${title.toUpperCase()}`, MARGIN + 8, y + 6, { width: contentWidth() - 16 });
      doc.fillColor(C.black);
      doc.moveDown(0.4);
    };

    // Portada
    pageNumber = 1;
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.greenDark);
    doc.font("Helvetica-Bold").fontSize(21).fillColor(C.white)
       .text("ACUERDO DE CONFIDENCIALIDAD", MARGIN, 185, { width: contentWidth(), align: "center" });
     doc.text("PROPIEDAD INTELECTUAL Y USO RESTRINGIDO DEL SOFTWARE", { width: contentWidth(), align: "center" });
    doc.moveDown(0.8);
    doc.font("Helvetica").fontSize(12).fillColor(C.gold)
      .text("PROFESIONALES EN SEGURIDAD Y SALUD EN EL TRABAJO", { width: contentWidth(), align: "center" });
    doc.moveDown(2);
    doc.rect(MARGIN + 60, doc.y, doc.page.width - (MARGIN + 60) * 2, 0.5).fill(C.gold);
    doc.moveDown(1);
    doc.font("Helvetica").fontSize(10).fillColor(C.white)
      .text("ENTRE:", { width: contentWidth(), align: "center" });
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").text("EL PROVEEDOR", { width: contentWidth(), align: "center" });
    doc.font("Helvetica").text("SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.", { width: contentWidth(), align: "center" });
    doc.text("NIT 902.036.337-4", { width: contentWidth(), align: "center" });
    doc.moveDown(0.5);
    doc.text("Y", { width: contentWidth(), align: "center" });
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").text("EL PROFESIONAL", { width: contentWidth(), align: "center" });
    doc.font("Helvetica").text(nombre.toUpperCase(), { width: contentWidth(), align: "center" });
    doc.text(`C.C. ${identificacion}  •  ${profesion}`, { width: contentWidth(), align: "center" });
    doc.moveDown(2.5);
    doc.fontSize(8).text(`Generado: ${fecha}`, { width: contentWidth(), align: "center" });
    doc.text("Ley 1581 de 2012  •  Decreto 1074 de 2015  •  Ley 527 de 1999", { width: contentWidth(), align: "center" });

    // Contenido
    doc.addPage();
    header();
      paragraph(`Consta por el presente documento el ACUERDO DE CONFIDENCIALIDAD, PROPIEDAD INTELECTUAL Y USO RESTRINGIDO DEL SOFTWARE, celebrado en Medellín, Antioquia, el ${fecha}, entre SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S., identificada con NIT 902.036.337-4 y representada legalmente por LUZ ADRIANA DIAZ CALLE, identificada con C.C. No. 52.223.631 (en adelante "EL PROVEEDOR"), y ${nombre}, identificado(a) con C.C. No. ${identificacion}, quien se identifica como ${profesion}, con licencia SST ${licencia} y correo ${correo} (en adelante "EL PROFESIONAL").`);
      paragraph("Este acuerdo es autónomo y tiene como finalidad principal proteger el software SST-Colombia, su propiedad intelectual, su información técnica y comercial, sus secretos empresariales y el conocimiento reservado al que EL PROFESIONAL pueda acceder. También establece reglas complementarias de seguridad y protección de los datos que eventualmente se encuentren dentro de la Plataforma. No constituye una alianza comercial, contrato de prestación de servicios, contrato laboral, sociedad, agencia, representación ni ninguna otra relación de trabajo o colaboración entre las partes.");
      paragraph("EL PROFESIONAL recibe únicamente una autorización personal, limitada, no exclusiva, intransferible y revocable para usar la Plataforma en el alcance que EL PROVEEDOR autorice. Esta autorización no transfiere la propiedad, licencia comercial, código, arquitectura, metodología, información técnica, información comercial ni derechos sobre la Plataforma.");

     clause("PRIMERA", "Objeto y partes");
      paragraph("El objeto principal es proteger la Plataforma SST-Colombia y toda la información confidencial relacionada con su creación, funcionamiento, operación, seguridad, comercialización y evolución. El acuerdo regula la autorización limitada de uso concedida a EL PROFESIONAL y establece obligaciones de reserva, no apropiación, no reproducción, seguridad, reporte de incidentes, devolución y eliminación de información.");

    clause("SEGUNDA", "Definiciones reforzadas");
    bullet("La Plataforma:", "El sistema SST-Colombia, sus módulos, código, interfaces, bases de datos, documentación, flujos, reportes, actualizaciones y controles de seguridad.");
     bullet("Información Confidencial del Software:", "Código fuente u objeto, arquitectura, estructura de bases de datos, interfaces, diseños, módulos, flujos, formularios, automatizaciones, algoritmos, lógica de negocio, documentación, integraciones, controles, reportes, metodologías, precios, planes, estrategias, procesos internos y cualquier conocimiento técnico o comercial no público de SST-Colombia.");
     bullet("Información Confidencial:", "La Información Confidencial del Software y cualquier información técnica, comercial, financiera, operativa, estratégica o de empresas a la que EL PROFESIONAL acceda por medio de la Plataforma, aunque no tenga una marca de confidencialidad.");
    bullet("Datos Personales:", "Cualquier información que permita identificar o hacer identificable a una persona natural.");
    bullet("Datos Sensibles:", "Datos de salud, historia de accidentes, incapacidades, condiciones médicas, biometría, vida privada y demás información protegida por la normativa colombiana.");
     bullet("Incidente:", "Pérdida, acceso no autorizado, divulgación, alteración, destrucción, envío equivocado, captura, descarga, extracción o uso indebido de información.");
     bullet("Credencial:", "Usuario, contraseña, token, sesión o cualquier mecanismo que permita entrar a La Plataforma.");
     bullet("Registro de Acceso:", "Log, alerta, correo, dirección IP, marca de tiempo, dispositivo, sesión, módulo consultado o evidencia técnica relacionada con el uso.");

    clause("TERCERA", "Acceso autorizado y mínimo privilegio");
     paragraph("La autorización de uso será personal, nominal, no exclusiva, intransferible, limitada y revocable. EL PROFESIONAL solo podrá consultar o registrar información en empresas, módulos y procesos expresamente autorizados, durante el tiempo necesario para la finalidad permitida y sin intentar ampliar sus permisos. La autorización quedará condicionada a la aceptación íntegra de este acuerdo y podrá suspenderse preventivamente ante actividad sospechosa.");
     subtitle("EL PROFESIONAL solo podrá:");
     bullet("", "Usar la Plataforma para la finalidad expresamente autorizada y dentro de las empresas, módulos y registros habilitados.");
     bullet("", "Acceder desde dispositivos, ubicaciones y conexiones autorizados por EL PROVEEDOR.");
     bullet("", "Mantener bajo control exclusivo su Credencial y cerrar la sesión al terminar o ausentarse.");
    bullet("", "No podrá compartir credenciales, permitir sesiones de terceros ni usar cuentas ajenas.");
    bullet("", "No podrá acceder a empresas, expedientes, reportes o módulos distintos de los autorizados.");
    bullet("", "No podrá usar la plataforma para una finalidad propia, distinta o incompatible con la instrucción recibida.");

     clause("CUARTA", "Información protegida");
     paragraph("La protección recae principalmente sobre la Información Confidencial del Software: código, arquitectura, estructura de datos, interfaces, diseño, módulos, flujos, automatizaciones, integraciones, lógica de negocio, documentación, metodologías, controles de seguridad, reportes, precios, planes y estrategias de SST-Colombia, así como cualquier mejora, desarrollo o conocimiento derivado de estos elementos.");
     paragraph("De manera complementaria, también queda protegida la información de empresas, trabajadores, usuarios, matrices, evaluaciones, evidencias, informes y datos personales que EL PROFESIONAL pueda visualizar o manejar dentro de la Plataforma. Esta protección adicional no cambia el objeto principal del acuerdo ni convierte a EL PROFESIONAL en encargado, contratista o representante de EL PROVEEDOR.");

     clause("QUINTA", "Confidencialidad reforzada");
      paragraph("EL PROFESIONAL guardará reserva absoluta y no divulgará, venderá, transferirá, publicará, reproducirá ni permitirá el acceso a la Información Confidencial. La obligación será indefinida respecto de la Información Confidencial del Software, código, arquitectura, lógica de negocio, controles de seguridad, credenciales, secretos empresariales y cualquier información que por su naturaleza deba permanecer reservada. Para la demás Información Confidencial, permanecerá durante diez (10) años después de terminar el acceso.");
     paragraph("Solo quedan excluidas las informaciones que EL PROFESIONAL demuestre fehacientemente que eran públicas sin incumplir este acuerdo, fueron recibidas legítimamente de un tercero sin restricción o deban revelarse por obligación legal, caso en el cual deberá informar previamente cuando la ley lo permita. La carga de probar la excepción corresponde a EL PROFESIONAL.");

     clause("SEXTA", "Finalidad, uso permitido y protección frente a competencia");
      paragraph("EL PROFESIONAL utilizará la Plataforma únicamente para la finalidad, empresas, módulos y procesos expresamente autorizados por EL PROVEEDOR. No podrá reutilizar, extraer, reconstruir, transformar, comparar, enseñar, divulgar ni aprovechar la Información Confidencial del Software para beneficio propio o de terceros.");
      paragraph("EL PROFESIONAL no podrá utilizar la Información Confidencial del Software para desarrollar, encargar, asesorar, entrenar, mejorar, probar, comercializar o poner a disposición un software, plataforma, módulo o servicio que reproduzca, sustituya o compita con funcionalidades o procesos propios de SST-Colombia. Esta obligación se refiere exclusivamente al uso de información confidencial de EL PROVEEDOR y no impide que EL PROFESIONAL ejerza su profesión, preste servicios de SST ni utilice conocimientos generales que no sean reservados.");
      subtitle("Estas obligaciones continúan después de la terminación o revocatoria del acceso.");

     clause("SÉPTIMA", "Protección complementaria de datos personales");
      paragraph("Cuando EL PROFESIONAL acceda a Datos Personales dentro de la Plataforma, reconoce que dicho acceso no implica cesión de propiedad ni autorización general para usarlos. Deberá cumplir la Ley 1581 de 2012, el Decreto 1074 de 2015 y las instrucciones aplicables, tratar los datos únicamente dentro de la finalidad autorizada y aplicar especial cuidado a los Datos Sensibles. No podrá ceder, vender, transferir, consultar por curiosidad ni conservar datos más allá de lo estrictamente necesario.");
    bullet("", "No podrá consultar datos por curiosidad, conveniencia personal o interés de terceros.");
    bullet("", "No podrá alterar, ocultar o eliminar registros sin autorización y trazabilidad.");
    bullet("", "Deberá mantener reserva profesional sobre la información que conozca por su ejercicio.");
     paragraph("EL PROFESIONAL acepta que una infracción de esta cláusula puede generar investigaciones y sanciones administrativas de la Superintendencia de Industria y Comercio, responsabilidad civil y, cuando corresponda, responsabilidad penal por violación de datos personales.");

     clause("OCTAVA", "Protección del software y prohibiciones de extracción");
     bullet("a)", "Copiar, fotografiar, grabar, transcribir o reproducir interfaces, pantallas, formularios, reportes, flujos, documentación, código o cualquier elemento de la Plataforma, salvo autorización escrita o necesidad operativa expresamente autorizada.");
     bullet("b)", "Descargar, exportar o extraer masivamente información, listados, reportes, evidencias, estructuras, configuraciones o datos de la Plataforma.");
     bullet("c)", "Enviar Información Confidencial a correos personales, mensajería, nubes, memorias USB, dispositivos o servicios no autorizados.");
     bullet("d)", "Introducir código, información técnica, documentación, datos o contenidos de la Plataforma en herramientas de IA, traductores, asistentes, servicios de analítica o aplicaciones externas no aprobadas.");
     bullet("e)", "Realizar scraping, consultas automatizadas, extracción por API, ingeniería inversa, descompilación, pruebas de vulnerabilidad, elusión de controles o inspección técnica sin autorización escrita.");
     bullet("f)", "Usar la Información Confidencial del Software, credenciales, estructura, flujos, metodologías o conocimiento reservado para desarrollar, entrenar, mejorar, probar o comercializar productos o servicios propios o de terceros.");
     bullet("g)", "Conservar copias, capturas, notas, transcripciones, archivos, documentación o cualquier reproducción de la Plataforma después de terminada o revocada la autorización de uso.");
     bullet("h)", "Alterar, ocultar, eliminar o manipular registros, configuraciones, evidencias o contenidos de la Plataforma sin autorización y trazabilidad.");

     clause("NOVENA", "Seguridad de acceso, monitoreo y evidencia digital");
      paragraph("EL PROFESIONAL mantendrá una (1) Credencial bajo control exclusivo, utilizará dispositivos protegidos y cerrará la sesión al finalizar la actividad o al alejarse del dispositivo. No podrá permitir sesiones simultáneas, prestar el dispositivo, guardar contraseñas en medios inseguros ni usar ubicaciones no autorizadas. Acepta que EL PROVEEDOR registre IP, fecha, hora, dispositivo, duración, módulos consultados, cambios, descargas y eventos de seguridad para proteger la Plataforma, prevenir abusos, investigar incidentes y atender obligaciones legales.");
    bullet("", "No podrá eludir controles, probar vulnerabilidades sin autorización ni instalar extensiones que intercepten información.");
    bullet("", "Deberá atender las medidas de seguridad y cambios de acceso que comunique EL PROVEEDOR.");
     subtitle("Los Registros de Acceso, logs, alertas, correos con marca de tiempo y demás evidencia digital podrán conservarse durante cinco (5) años y utilizarse para auditoría, investigación y defensa de derechos conforme a la Ley 527 de 1999.");

     clause("DÉCIMA", "Reporte de incidentes");
      paragraph("EL PROFESIONAL reportará de inmediato y, en ningún caso, después de doce (12) horas de conocerlo, cualquier pérdida, robo, acceso sospechoso, credencial expuesta, extracción, copia, reproducción, envío equivocado, divulgación o exposición de la Plataforma o de su Información Confidencial. El reporte se enviará a EL PROVEEDOR al correo admin@sst-colombia.com, con fecha, hora, información comprometida, personas involucradas y medidas adoptadas. La falta de reporte oportuno, la ocultación o la demora injustificada constituirán un incumplimiento adicional y agravarán la responsabilidad por las consecuencias del incidente.");

     clause("DÉCIMA PRIMERA", "Deberes de uso e integridad");
      paragraph("EL PROFESIONAL conservará la integridad de la Plataforma y sus evidencias, no presentará como propios sus contenidos, metodologías, diseños, informes, flujos o desarrollos, atenderá las solicitudes de auditoría relacionadas con su acceso y colaborará de buena fe en la investigación de incidentes. Este acuerdo no sustituye los requisitos profesionales, académicos, de licencia o de independencia que resulten aplicables ni crea una relación de trabajo o prestación de servicios.");

     clause("DÉCIMA SEGUNDA", "Devolución, eliminación y revocatoria");
      paragraph("Cuando termine o se revoque la autorización de uso, o EL PROVEEDOR lo solicite, EL PROFESIONAL deberá cesar inmediatamente el acceso, devolver o eliminar copias y archivos de la Plataforma y de su Información Confidencial dentro de cuarenta y ocho (48) horas, desinstalar herramientas no autorizadas y entregar una declaración escrita, firmada y verificable de cumplimiento. La obligación incluye dispositivos personales, nubes, correos, respaldos, notas, capturas, fotografías, documentación y medios extraíbles. Las obligaciones de conservación legal prevalecen únicamente en lo estrictamente necesario y bajo reserva.");

     clause("DÉCIMA TERCERA", "Propiedad intelectual y no apropiación");
     paragraph("La Plataforma, su código, componentes, arquitectura, estructura de datos, interfaces, metodologías, documentación, diseños, contenidos base, flujos, automatizaciones, reportes, integraciones y desarrollos permanecen bajo la titularidad de EL PROVEEDOR o de sus legítimos titulares. La autorización de uso no concede licencia de explotación, reproducción, modificación, distribución ni creación de productos derivados.");
     paragraph("Queda prohibido copiar, descompilar, realizar ingeniería inversa, reconstruir, entrenar modelos, reutilizar la arquitectura o los flujos, o utilizar la Información Confidencial del Software para crear, apoyar o mejorar productos o servicios que reproduzcan o compitan con la Plataforma.");

     clause("DÉCIMA CUARTA", "Cláusula Penal");
      paragraph("Las partes acuerdan, conforme al artículo 1592 del Código Civil colombiano, una CLÁUSULA PENAL como estimación anticipada y definitiva de los perjuicios derivados del incumplimiento de las obligaciones de confidencialidad (Cláusula Quinta), finalidad y uso autorizado (Cláusula Sexta), protección del software y prohibiciones de extracción (Cláusula Octava), seguridad y monitoreo (Cláusula Novena), reporte de incidentes (Cláusula Décima), devolución y eliminación de información (Cláusula Décima Segunda) o propiedad intelectual y no apropiación (Cláusula Décima Tercera), por un valor equivalente a CIEN MILLONES DE PESOS ($100.000.000) MONEDA CORRIENTE.");
     paragraph("El pago de esta cláusula penal no extingue la obligación de reparar el daño adicional que EL PROVEEDOR pueda demostrar, ni la revocatoria de la autorización de uso, ni el cese de las actividades que originaron el incumplimiento. EL PROVEEDOR podrá exigir el cumplimiento de la obligación o la cláusula penal, pero no ambas simultáneamente, salvo que la pena se haya estipulado por el simple retardo.");

    clause("DÉCIMA QUINTA", "Vigencia, supervivencia y jurisdicción");
      paragraph(`El acuerdo rige desde el ${fecha} mientras esté vigente la autorización de uso o EL PROFESIONAL conserve información derivada de ella. Sobreviven indefinidamente las obligaciones sobre la Información Confidencial del Software, código, arquitectura, lógica de negocio, secretos empresariales, Credenciales, propiedad intelectual y no apropiación; la demás Información Confidencial queda protegida durante diez (10) años. La protección de Datos Personales continuará durante el tiempo que exija la normativa aplicable. Se aplican las leyes de Colombia, incluyendo la Ley 1581 de 2012, el Decreto 1074 de 2015, la Ley 527 de 1999, el artículo 269F del Código Penal y las normas civiles, comerciales y penales que resulten pertinentes. Las partes intentarán arreglo directo durante quince (15) días hábiles y, si no hay acuerdo, conciliación ante un centro autorizado en Medellín durante treinta (30) días hábiles, sin perjuicio de acudir a los jueces civiles del circuito de Medellín, Antioquia.`);

    ensureSpace(180);
    doc.moveDown(1);
    paragraph(`En señal de aceptación, las partes suscriben el presente acuerdo en Medellín, Antioquia, el ${fecha}.`);
    const column = contentWidth() / 2;
    const signatureWidth = column - 30;
    const signatureY = doc.y + 28;
    doc.rect(MARGIN + 10, signatureY, signatureWidth, 0.5).fill(C.black);
    doc.rect(MARGIN + column + 10, signatureY, signatureWidth, 0.5).fill(C.black);

    let providerY = signatureY + 8;
    doc.font("Helvetica-Bold").fontSize(9).fillColor(C.black)
      .text("EL PROVEEDOR", MARGIN + 10, providerY, { width: signatureWidth, align: "center" });
    providerY += 16;
    doc.fontSize(8).text("LUZ ADRIANA DIAZ CALLE", MARGIN + 10, providerY, { width: signatureWidth, align: "center" });
    providerY += 14;
    doc.font("Helvetica").fillColor(C.graySoft).text("C.C. 52.223.631 · Representante Legal", MARGIN + 10, providerY, { width: signatureWidth, align: "center" });
    providerY += 14;
    doc.text("SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.", MARGIN + 10, providerY, { width: signatureWidth, align: "center" });

    let professionalY = signatureY + 8;
    doc.font("Helvetica-Bold").fontSize(9).fillColor(C.black)
      .text("EL PROFESIONAL", MARGIN + column + 10, professionalY, { width: signatureWidth, align: "center" });
    professionalY += 16;
    doc.fontSize(8).text(nombre.toUpperCase(), MARGIN + column + 10, professionalY, { width: signatureWidth, align: "center" });
    professionalY += 14;
    doc.font("Helvetica").fillColor(C.graySoft).text(`C.C. ${identificacion}`, MARGIN + column + 10, professionalY, { width: signatureWidth, align: "center" });
    professionalY += 14;
    doc.text(`${profesion} · ${correo}`, MARGIN + column + 10, professionalY, { width: signatureWidth, align: "center" });

    footer();
    doc.end();
  });
}
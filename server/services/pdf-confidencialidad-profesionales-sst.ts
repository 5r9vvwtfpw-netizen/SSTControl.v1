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
        Subject: "Confidencialidad reforzada, privacidad y uso restringido de información SST",
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
    doc.text("Y PRIVACIDAD DE LA INFORMACIÓN", { width: contentWidth(), align: "center" });
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
     paragraph(`Consta por el presente documento el ACUERDO DE CONFIDENCIALIDAD Y PRIVACIDAD DE LA INFORMACIÓN, celebrado en Medellín, Antioquia, el ${fecha}, entre SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S., identificada con NIT 902.036.337-4 y representada legalmente por LUZ ADRIANA DIAZ CALLE, identificada con C.C. No. 52.223.631 (en adelante "EL PROVEEDOR"), y ${nombre}, identificado(a) con C.C. No. ${identificacion}, quien se identifica como ${profesion}, con licencia SST ${licencia} y correo ${correo} (en adelante "EL PROFESIONAL").`);
     paragraph("Este acuerdo es autónomo y tiene exclusivamente finalidad de confidencialidad, privacidad, seguridad de la información y uso restringido. No constituye una alianza comercial, contrato de prestación de servicios, contrato laboral, sociedad, agencia, representación ni ninguna otra relación de trabajo o colaboración entre las partes.");
     paragraph("EL PROFESIONAL recibe únicamente una autorización personal, limitada, no exclusiva, intransferible y revocable para usar la plataforma SST-Colombia en el alcance que EL PROVEEDOR autorice. Esta autorización no transfiere la propiedad de la plataforma, la información de las empresas ni los derechos sobre sus documentos.");

    clause("PRIMERA", "Objeto y partes");
     paragraph("El objeto es proteger toda información a la que EL PROFESIONAL acceda al utilizar el software, regular la autorización limitada de uso, imponer reglas de privacidad y seguridad, y establecer obligaciones de reserva, uso restringido, reporte de incidentes, devolución y eliminación de información.");

    clause("SEGUNDA", "Definiciones reforzadas");
    bullet("La Plataforma:", "El sistema SST-Colombia, sus módulos, código, interfaces, bases de datos, documentación, flujos, reportes, actualizaciones y controles de seguridad.");
    bullet("Información Confidencial:", "Toda información técnica, comercial, financiera, operativa, estratégica o de clientes, aunque no tenga una marca de confidencialidad.");
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
    paragraph("La protección comprende, entre otros, datos de trabajadores, información de salud ocupacional, accidentes e incidentes, incapacidades, exámenes y restricciones médicas cuando estén disponibles; matrices de peligros, evaluaciones, evidencias, planes de trabajo, informes, usuarios, credenciales, tarifas, clientes, metodologías, diseños, arquitectura y lógica de negocio.");

    clause("QUINTA", "Confidencialidad reforzada");
     paragraph("EL PROFESIONAL guardará reserva absoluta y no divulgará, venderá, transferirá, publicará, reproducirá ni permitirá el acceso a la Información Confidencial. La obligación será indefinida respecto de Datos Sensibles, Información de Salud, secretos empresariales, credenciales y cualquier información que por su naturaleza deba permanecer reservada. Para la demás Información Confidencial, permanecerá durante diez (10) años después de terminar el acceso.");
     paragraph("Solo quedan excluidas las informaciones que EL PROFESIONAL demuestre fehacientemente que eran públicas sin incumplir este acuerdo, fueron recibidas legítimamente de un tercero sin restricción o deban revelarse por obligación legal, caso en el cual deberá informar previamente cuando la ley lo permita. La carga de probar la excepción corresponde a EL PROFESIONAL.");

    clause("SEXTA", "Finalidad y deber de reserva");
     paragraph("EL PROFESIONAL tratará la información únicamente para la finalidad autorizada y conforme a las instrucciones recibidas de EL PROVEEDOR. No podrá reutilizarla para elaborar bases de datos propias, captar oportunidades, contactar personas por fuera del proceso, alimentar modelos o herramientas, comparar empresas, crear perfiles, obtener ventajas, ni beneficiar a terceros. Estas prohibiciones continúan después de la terminación del acceso.");
     subtitle("Toda copia, anotación, exportación o uso fuera de la finalidad autorizada se considera incumplimiento independiente.");

    clause("SÉPTIMA", "Tratamiento de datos personales");
     paragraph("EL PROFESIONAL reconoce que el acceso a Datos Personales no implica cesión de propiedad ni autorización general. Deberá cumplir la Ley 1581 de 2012, el Decreto 1074 de 2015 y las instrucciones documentadas aplicables, tratar los datos bajo necesidad y proporcionalidad, respetar las finalidades informadas y aplicar especial cuidado a los Datos Sensibles. No podrá ceder, vender, transferir, consultar por curiosidad ni conservar datos más allá de lo estrictamente necesario.");
    bullet("", "No podrá consultar datos por curiosidad, conveniencia personal o interés de terceros.");
    bullet("", "No podrá alterar, ocultar o eliminar registros sin autorización y trazabilidad.");
    bullet("", "Deberá mantener reserva profesional sobre la información que conozca por su ejercicio.");
     paragraph("EL PROFESIONAL acepta que una infracción de esta cláusula puede generar investigaciones y sanciones administrativas de la Superintendencia de Industria y Comercio, responsabilidad civil y, cuando corresponda, responsabilidad penal por violación de datos personales.");

    clause("OCTAVA", "Prohibiciones de privacidad y extracción");
    bullet("a)", "Tomar capturas, fotografías, grabaciones o transcripciones de datos personales o reportes, salvo autorización documentada.");
    bullet("b)", "Descargar o exportar masivamente información, listados, historias, reportes o evidencias.");
    bullet("c)", "Enviar información a correos personales, mensajería, nubes, memorias USB o dispositivos no autorizados.");
    bullet("d)", "Introducir información de la plataforma en herramientas de IA, traductores, asistentes, servicios de analítica o aplicaciones externas no aprobadas.");
    bullet("e)", "Imprimir documentos con datos personales fuera de una necesidad autorizada y controlada.");
     bullet("f)", "Realizar scraping, consultas automatizadas, extracción por API, ingeniería inversa, descompilación, pruebas de vulnerabilidad o elusión de controles sin autorización escrita.");
     bullet("g)", "Usar información, credenciales, estructura, flujos o conocimiento de la Plataforma para desarrollar, entrenar o mejorar productos, modelos o servicios propios o de terceros.");
     bullet("h)", "Conservar copias, fotografías, notas, transcripciones o archivos en cualquier medio una vez revocada o terminada la autorización de uso.");

    clause("NOVENA", "Seguridad de credenciales y monitoreo");
     paragraph("EL PROFESIONAL mantendrá una (1) Credencial bajo control exclusivo, utilizará dispositivos protegidos y cerrará la sesión al finalizar la actividad o al alejarse del dispositivo. No podrá permitir sesiones simultáneas, prestar el dispositivo, guardar contraseñas en medios inseguros ni usar ubicaciones no autorizadas. Acepta que EL PROVEEDOR registre IP, fecha, hora, dispositivo, duración, módulos consultados, cambios, descargas y eventos de seguridad para prevenir abusos, investigar incidentes y atender obligaciones legales.");
    bullet("", "No podrá eludir controles, probar vulnerabilidades sin autorización ni instalar extensiones que intercepten información.");
    bullet("", "Deberá atender las medidas de seguridad y cambios de acceso que comunique EL PROVEEDOR.");
     subtitle("Los Registros de Acceso, logs, alertas, correos con marca de tiempo y demás evidencia digital podrán conservarse durante cinco (5) años y utilizarse para auditoría, investigación y defensa de derechos conforme a la Ley 527 de 1999.");

    clause("DÉCIMA", "Reporte de incidentes");
     paragraph("EL PROFESIONAL reportará de inmediato y, en ningún caso, después de doce (12) horas de conocerlo, cualquier pérdida, robo, acceso sospechoso, credencial expuesta, envío equivocado, captura, descarga indebida o divulgación. El reporte se enviará a EL PROVEEDOR al correo admin@sst-colombia.com, con fecha, hora, información comprometida, personas involucradas y medidas adoptadas. La falta de reporte oportuno, la ocultación o la demora injustificada constituirán un incumplimiento adicional y agravarán la responsabilidad por las consecuencias del incidente.");

    clause("DÉCIMA PRIMERA", "Deberes profesionales");
     paragraph("EL PROFESIONAL conservará la integridad de las evidencias, no presentará como propios los contenidos, metodologías, informes o datos de terceros, atenderá las solicitudes de auditoría relacionadas con su acceso y colaborará de buena fe en la investigación de incidentes. Este acuerdo no sustituye los requisitos profesionales, académicos, de licencia o de independencia que resulten aplicables ni crea una relación de trabajo o prestación de servicios.");

    clause("DÉCIMA SEGUNDA", "Devolución, eliminación y revocatoria");
     paragraph("Cuando termine o se revoque la autorización de uso, o EL PROVEEDOR lo solicite, EL PROFESIONAL deberá cesar inmediatamente el acceso, devolver o eliminar copias y archivos de la información dentro de cuarenta y ocho (48) horas, desinstalar herramientas no autorizadas y entregar una declaración escrita, firmada y verificable de cumplimiento. La obligación incluye dispositivos personales, nubes, correos, respaldos, notas, fotografías y medios extraíbles. Las obligaciones de conservación legal prevalecen únicamente en lo estrictamente necesario y bajo reserva.");

    clause("DÉCIMA TERCERA", "Propiedad intelectual y no apropiación");
    paragraph("La Plataforma, sus componentes, metodologías, documentación, diseños y contenidos base permanecen bajo la titularidad de sus respectivos propietarios. Queda prohibido copiar, descompilar, realizar ingeniería inversa, crear productos derivados, entrenar modelos con la información o reutilizar la arquitectura y los flujos fuera del alcance autorizado.");

    clause("DÉCIMA CUARTA", "Responsabilidad y cláusula penal");
     paragraph("Las partes acuerdan, conforme al artículo 1592 del Código Civil colombiano, una CLÁUSULA PENAL PECUNIARIA de CIEN MILLONES DE PESOS ($100.000.000) MONEDA CORRIENTE por cada incidente o infracción comprobada de las obligaciones de confidencialidad, privacidad, seguridad, reporte, devolución, propiedad intelectual, no apropiación o condiciones de uso. Cada acto, acceso, copia, extracción, divulgación, uso no autorizado u omisión de reporte podrá considerarse un incidente independiente cuando afecte información, sesión, empresa, persona o conjunto de datos distinto.");
     paragraph("La cláusula penal será exigible sin necesidad de demostrar el monto exacto del perjuicio, sin perjuicio de la suspensión o revocatoria inmediata del acceso, el cese de la conducta, la devolución o eliminación de la información, la reparación de daños adicionales que legalmente procedan y las acciones civiles, comerciales, administrativas o penales correspondientes.");

    clause("DÉCIMA QUINTA", "Vigencia, supervivencia y jurisdicción");
     paragraph(`El acuerdo rige desde el ${fecha} mientras esté vigente la autorización de uso o EL PROFESIONAL conserve información derivada de ella. Sobreviven indefinidamente las obligaciones sobre Datos Sensibles, Información de Salud, secretos empresariales, Credenciales y no apropiación; la demás Información Confidencial queda protegida durante diez (10) años. Se aplican las leyes de Colombia, incluyendo la Ley 1581 de 2012, el Decreto 1074 de 2015, la Ley 527 de 1999, el artículo 269F del Código Penal y las normas civiles, comerciales y penales que resulten pertinentes. Las partes intentarán arreglo directo durante quince (15) días hábiles y, si no hay acuerdo, conciliación ante un centro autorizado en Medellín durante treinta (30) días hábiles, sin perjuicio de acudir a los jueces civiles del circuito de Medellín, Antioquia.`);

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
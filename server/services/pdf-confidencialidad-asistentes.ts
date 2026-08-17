/**
 * Acuerdo de Confidencialidad para Asistentes de Consultores SST
 * 13 cláusulas · Máximo rigor · Mismo estilo visual que Alianza Consultores
 */
import PDFDocument from "pdfkit";

export interface ConfidencialidadAsistenteData {
  nombreAsistente?: string;
  ccAsistente?: string;
  cargoAsistente?: string;
  nombreConsultor?: string;
  identificacionConsultor?: string; // C.C. o NIT
  fechaAcuerdo?: string;
}

const MARGIN = 50;
const C = {
  GREEN:      "#2D6A4F",
  GREEN_DARK: "#1B4332",
  WHITE:      "#FFFFFF",
  BLACK:      "#111111",
  GRAY:       "#333333",
  GRAY_SOFT:  "#777777",
  GOLD:       "#D4A017",
};
const LH = 14;
const CONTENT_TOP = MARGIN + 40;
const YEAR = new Date().getFullYear();

export async function generateConfidencialidadAsistentePdf(
  data: ConfidencialidadAsistenteData
): Promise<Buffer> {
  const fechaAcuerdo   = data.fechaAcuerdo   || "15 de agosto de 2026";
  const nombreAsistente     = data.nombreAsistente     || "___________________________";
  const ccAsistente         = data.ccAsistente         || "_______________";
  const cargoAsistente      = data.cargoAsistente      || "Asistente de Gestión SST";
  const nombreConsultor     = data.nombreConsultor     || "___________________________";
  const idConsultor         = data.identificacionConsultor || "_______________";

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: "LETTER",
      margin: MARGIN,
      info: {
        Title: "Acuerdo de Confidencialidad para Asistentes — SST Colombia",
        Author: "SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.",
        Subject: "Confidencialidad y No Captación — Asistentes de Consultores SST",
      },
    });

    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    let pageNum = 0;

    // ── Helpers ──────────────────────────────────────────────────────────────
    function stampHeader() {
      pageNum++;
      const pw = doc.page.width;
      doc.rect(MARGIN, MARGIN, pw - MARGIN * 2, 3).fill(C.GREEN);
      doc.fillColor(C.GRAY_SOFT).fontSize(7).font("Helvetica")
         .text(
           "SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.  |  NIT 902.036.337-4  |  DOCUMENTO CONFIDENCIAL",
           MARGIN, MARGIN + 8,
           { width: pw - MARGIN * 2, align: "center", lineBreak: false }
         );
      doc.moveTo(MARGIN, MARGIN + 22).lineTo(pw - MARGIN, MARGIN + 22)
         .strokeColor(C.GRAY_SOFT).lineWidth(0.5).stroke();
      stampFooter();
      doc.y = CONTENT_TOP;
    }

    function stampFooter() {
      const savedY = doc.y;
      const pw = doc.page.width;
      const ph = doc.page.height;
      doc.moveTo(MARGIN, ph - MARGIN - 14).lineTo(pw - MARGIN, ph - MARGIN - 14)
         .strokeColor(C.GRAY_SOFT).lineWidth(0.5).stroke();
      doc.fillColor(C.GRAY_SOFT).fontSize(7).font("Helvetica")
         .text(
           `Página ${pageNum}  |  DOCUMENTO CONFIDENCIAL  |  © ${YEAR} SST Colombia`,
           MARGIN, ph - MARGIN - 9,
           { width: pw - MARGIN * 2, align: "center", lineBreak: false }
         );
      doc.y = savedY;
    }

    function checkPage(needed = 60) {
      if (doc.y + needed > doc.page.height - MARGIN - 30) {
        doc.addPage();
        stampHeader();
        return true;
      }
      return false;
    }

    function clauseTitle(num: string, title: string) {
      checkPage(50);
      const pw = doc.page.width;
      const y = doc.y + 8;
      doc.rect(MARGIN, y, pw - MARGIN * 2, 22).fill(C.GREEN);
      doc.fontSize(9.5).font("Helvetica-Bold").fillColor(C.WHITE)
         .text(`CLÁUSULA ${num}: ${title.toUpperCase()}`, MARGIN + 8, y + 6,
               { width: pw - MARGIN * 2 - 16 });
      doc.fillColor(C.BLACK);
      doc.moveDown(0.4);
    }

    function subTitle(text: string) {
      checkPage(30);
      doc.fontSize(8.5).font("Helvetica-Bold").fillColor(C.GREEN)
         .text(text, MARGIN, doc.y + 4, { width: doc.page.width - MARGIN * 2 });
      doc.moveDown(0.3);
    }

    function para(text: string) {
      checkPage(30);
      doc.fontSize(9).font("Helvetica").fillColor(C.GRAY)
         .text(text, MARGIN, doc.y, { width: doc.page.width - MARGIN * 2, align: "justify" });
      doc.moveDown(0.6);
    }

    function bullet(label: string, text: string) {
      checkPage(25);
      const pw = doc.page.width;
      const indent = label ? 0 : 10;
      const y = doc.y;
      if (label) {
        doc.fontSize(8.5).font("Helvetica-Bold").fillColor(C.GREEN)
           .text(`${label}  `, MARGIN + indent, y, { continued: true, width: pw - MARGIN * 2 - indent });
        doc.font("Helvetica").fillColor(C.GRAY).text(text, { align: "justify" });
      } else {
        doc.fontSize(9).font("Helvetica").fillColor(C.GRAY)
           .text(`•  ${text}`, MARGIN + indent, y, { width: pw - MARGIN * 2 - indent, align: "justify" });
      }
      doc.moveDown(0.4);
    }

    // ════════════════════════════════════════════════════════════════════════
    // PORTADA
    // ════════════════════════════════════════════════════════════════════════
    pageNum = 1;
    const pw = doc.page.width;
    const ph = doc.page.height;

    doc.rect(0, 0, pw, ph).fill(C.GREEN_DARK);

    doc.fontSize(22).font("Helvetica-Bold").fillColor(C.WHITE)
       .text("ACUERDO DE CONFIDENCIALIDAD", MARGIN, 190, { width: pw - MARGIN * 2, align: "center" });
    doc.text("Y NO CAPTACIÓN DE CLIENTES", { width: pw - MARGIN * 2, align: "center" });

    doc.moveDown(0.8);
    doc.fontSize(13).font("Helvetica").fillColor(C.GOLD)
       .text("ASISTENTES DE CONSULTORES SST", { width: pw - MARGIN * 2, align: "center" });

    doc.moveDown(2);
    doc.rect(MARGIN + 60, doc.y, pw - (MARGIN + 60) * 2, 0.5).fill(C.GOLD);
    doc.moveDown(1);

    doc.fontSize(10).fillColor(C.WHITE);
    doc.text("ENTRE:", MARGIN, doc.y, { width: pw - MARGIN * 2, align: "center" });
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").text("EL CONSULTOR", { width: pw - MARGIN * 2, align: "center" });
    doc.font("Helvetica").text(`${nombreConsultor.toUpperCase()}`, { width: pw - MARGIN * 2, align: "center" });
    doc.text(`C.C. / NIT ${idConsultor}`, { width: pw - MARGIN * 2, align: "center" });
    doc.moveDown(0.5);
    doc.text("Y", { width: pw - MARGIN * 2, align: "center" });
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").text("EL ASISTENTE", { width: pw - MARGIN * 2, align: "center" });
    doc.font("Helvetica").text(nombreAsistente.toUpperCase(), { width: pw - MARGIN * 2, align: "center" });
    doc.text(`C.C. ${ccAsistente}  •  ${cargoAsistente}`, { width: pw - MARGIN * 2, align: "center" });

    doc.moveDown(1.5);
    doc.rect(MARGIN + 60, doc.y, pw - (MARGIN + 60) * 2, 0.5).fill(C.GOLD);
    doc.moveDown(1);

    doc.fontSize(9).fillColor(C.GOLD).font("Helvetica-Bold")
       .text("CON LA PARTICIPACIÓN HABILITANTE DE:", { width: pw - MARGIN * 2, align: "center" });
    doc.moveDown(0.4);
    doc.font("Helvetica").fillColor(C.WHITE)
       .text("SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.", { width: pw - MARGIN * 2, align: "center" });
    doc.text("NIT 902.036.337-4  •  EL PROVEEDOR", { width: pw - MARGIN * 2, align: "center" });

    doc.moveDown(3);
    doc.fillColor(C.WHITE).fontSize(8)
       .text(`Generado: ${fechaAcuerdo}`, { width: pw - MARGIN * 2, align: "center" });
    doc.text("Ley 1581 de 2012  •  Ley 23 de 1982  •  Ley 527 de 1999  •  Código General del Proceso",
             { width: pw - MARGIN * 2, align: "center" });

    // ════════════════════════════════════════════════════════════════════════
    // CONTENIDO
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    stampHeader();

    para(`Consta por el presente documento el ACUERDO DE CONFIDENCIALIDAD Y NO CAPTACIÓN DE CLIENTES, celebrado en la ciudad de Medellín, Antioquia, el ${fechaAcuerdo}, entre: (i) EL CONSULTOR: ${nombreConsultor}, identificado(a) con C.C. / NIT ${idConsultor}, quien actúa en virtud de la Alianza de Prestación de Servicios y Licenciamiento de Software suscrita con SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S. (en adelante "EL PROVEEDOR"); y (ii) EL ASISTENTE: ${nombreAsistente}, identificado(a) con C.C. No. ${ccAsistente}, quien desempeñará funciones como ${cargoAsistente} y a quien EL CONSULTOR autorizará el acceso operativo a la plataforma denominada "SST Colombia" (en adelante "La Plataforma"), de propiedad de EL PROVEEDOR.`);

    para(`EL PROVEEDOR suscribe el presente documento únicamente en su calidad de titular de La Plataforma, para reconocer a EL ASISTENTE como usuario autorizado bajo las condiciones aquí establecidas. Las obligaciones derivadas del incumplimiento de EL ASISTENTE recaen solidariamente sobre EL CONSULTOR en virtud de la Alianza Principal.`);

    // ── CLÁUSULAS ─────────────────────────────────────────────────────────

    clauseTitle("PRIMERA", "Objeto y Partes");
    para(`El presente acuerdo tiene por objeto establecer las condiciones de confidencialidad, restricción de uso de información, no captación de clientes y uso aceptable de La Plataforma, bajo las cuales EL ASISTENTE accederá al sistema "SST Colombia" para apoyar las actividades de consultoría en Seguridad y Salud en el Trabajo que EL CONSULTOR presta a sus propios clientes empresariales. EL ASISTENTE reconoce que su acceso es estrictamente instrumental, derivado y condicionado a la Alianza Principal que EL CONSULTOR mantiene con EL PROVEEDOR, y que no le confiere ningún derecho autónomo sobre La Plataforma ni sobre los clientes atendidos.`);

    clauseTitle("SEGUNDA", "Definiciones");
    bullet("La Plataforma:", 'El sistema SaaS de gestión SST denominado "SST Colombia", incluyendo su código fuente, código objeto, interfaces, bases de datos, documentación, flujos de trabajo, actualizaciones y toda la información contenida en ella.');
    bullet("Datos Sensibles:", "Los datos de salud, accidentalidad, morbilidad, incapacidades, matrices de peligro, evaluaciones de riesgo e incidentes de los trabajadores de los clientes del Consultor, los cuales tienen el carácter de datos sensibles conforme al artículo 5 de la Ley 1581 de 2012.");
    bullet("Información Confidencial:", "Toda información técnica, comercial, financiera, de clientes o estratégica de EL PROVEEDOR y/o EL CONSULTOR a la que EL ASISTENTE tenga acceso con ocasión de este acuerdo, incluyendo sin limitación: Datos Sensibles, metodologías, tarifas, estructura de La Plataforma y lógica de negocio.");
    bullet("Incidente de Seguridad:", "Cualquier acceso no autorizado, pérdida, robo, divulgación o uso indebido de Información Confidencial, incluyendo la pérdida o sustracción del dispositivo desde el cual se accede a La Plataforma.");
    bullet("Cliente del Consultor:", "Toda persona natural o jurídica cuya información esté gestionada en La Plataforma bajo la cuenta de EL CONSULTOR, independientemente del período durante el cual EL ASISTENTE haya tenido acceso a dicha información.");

    clauseTitle("TERCERA", "Alcance del Acceso Autorizado");
    para("EL PROVEEDOR, a través de EL CONSULTOR, autoriza a EL ASISTENTE un acceso limitado, personal, intransferible y revocable a La Plataforma, exclusivamente para apoyar las funciones que EL CONSULTOR le asigne. Este acceso no constituye licencia de uso independiente ni confiere derecho alguno sobre La Plataforma.");
    subTitle("EL ASISTENTE solo podrá:");
    bullet("", "Acceder a las empresas cliente y módulos que EL CONSULTOR autorice expresamente y por escrito.");
    bullet("", "Operar La Plataforma desde dispositivos y ubicaciones autorizadas.");
    bullet("", "Gestionar la información para el fin exclusivo de apoyar la labor consultiva de EL CONSULTOR.");
    subTitle("Le está estrictamente prohibido:");
    bullet("a)", "Acceder a módulos, empresas o información para los que no haya sido autorizado expresamente.");
    bullet("b)", "Usar las credenciales asignadas fuera del horario laboral sin autorización escrita previa de EL CONSULTOR.");
    bullet("c)", "Compartir, ceder o prestar sus credenciales de acceso a cualquier persona, incluyendo otros empleados de EL CONSULTOR.");

    clauseTitle("CUARTA", "Confidencialidad Reforzada");
    para("EL ASISTENTE se compromete a guardar absoluta reserva sobre toda la Información Confidencial a la que tenga acceso con ocasión del presente acuerdo. Esta obligación tendrá una duración de CINCO (5) AÑOS contados a partir de la terminación del acuerdo, independientemente de la causa que la origine.");
    subTitle("La obligación de confidencialidad comprende expresamente:");
    bullet("", "Los Datos Sensibles de los trabajadores de los clientes del Consultor.");
    bullet("", "Las metodologías, lógica de negocio, algoritmos y estructura técnica de La Plataforma.");
    bullet("", "La lista de clientes del Consultor, sus tarifas, condiciones comerciales y estado de cumplimiento SST.");
    bullet("", "Los planes de trabajo, matrices de peligro, evaluaciones de estándares mínimos y documentos generados.");
    bullet("", 'Cualquier información identificada como "CONFIDENCIAL" o que por su naturaleza deba entenderse como reservada.');
    para("Quedan exceptuadas únicamente las informaciones que EL ASISTENTE pueda demostrar fehacientemente que: (a) eran de dominio público al momento de su divulgación; (b) fueron recibidas legítimamente de un tercero sin restricción de confidencialidad; o (c) deba revelar por mandato judicial o legal, previa notificación escrita a EL CONSULTOR y EL PROVEEDOR.");

    clauseTitle("QUINTA", "Exclusividad de Clientes y No Captación");
    para(`Los clientes empresariales atendidos a través de La Plataforma son y seguirán siendo clientes exclusivos de EL CONSULTOR en todo momento. EL ASISTENTE reconoce expresamente que su acceso a la información de dichos clientes —incluyendo Datos Sensibles de trabajadores, matrices de peligro, evaluaciones SST, planes de trabajo, historial de cumplimiento normativo y cualquier otro documento gestionado— es estrictamente instrumental y no le confiere ningún derecho comercial ni relación autónoma con ellos.`);
    para(`En consecuencia, EL ASISTENTE se obliga a no contactar, visitar, cotizar, ofrecer, asesorar, prestar servicios de consultoría SST, ni establecer cualquier relación comercial directa o indirecta con los clientes a los que haya tenido acceso en ejercicio de sus funciones, durante la vigencia del presente acuerdo y por un período de TRES (3) AÑOS contados desde su terminación, independientemente de la causa.`);
    subTitle("Esta prohibición aplica en todos los casos:");
    bullet("", "Si EL ASISTENTE actúa de forma independiente, ofreciendo servicios propios de consultoría SST.");
    bullet("", "Si lo hace en nombre de un empleador, consultor, plataforma tecnológica o empresa diferente a EL CONSULTOR.");
    bullet("", "Si utiliza el conocimiento adquirido sobre esos clientes (CIIU, número de trabajadores, riesgos identificados, nivel de cumplimiento, estructura del SG-SST) para beneficio propio o de terceros.");
    bullet("", "Si lo hace de manera directa o a través de intermediarios, familiares, socios o personas jurídicas vinculadas.");
    para("La violación de esta cláusula, por ser de naturaleza grave, activa automáticamente la cláusula penal establecida en la Cláusula Décima Segunda, sin perjuicio de las acciones civiles y penales a que haya lugar.");

    clauseTitle("SEXTA", "Prohibiciones Expresas de Manejo de Datos");
    para("En atención al carácter sensible de la información gestionada en La Plataforma y al deber de protección de datos personales, EL ASISTENTE tiene estrictamente prohibido:");
    bullet("a)", "Descargar, exportar o extraer de manera masiva bases de datos, listados de trabajadores, reportes de evaluación, o cualquier conjunto de información de los clientes del Consultor.");
    bullet("b)", "Tomar capturas de pantalla, fotografías o cualquier registro visual de información personal de trabajadores o de datos empresariales confidenciales, salvo autorización expresa y documentada de EL CONSULTOR.");
    bullet("c)", "Reenviar información confidencial o Datos Sensibles a cuentas de correo electrónico personales, servicios de mensajería instantánea, plataformas de almacenamiento en la nube no autorizadas (Google Drive personal, Dropbox personal, etc.) o cualquier destinatario no autorizado.");
    bullet("d)", "Almacenar información de La Plataforma en dispositivos de almacenamiento externo (memorias USB, discos duros externos) sin autorización escrita previa de EL CONSULTOR.");
    bullet("e)", "Imprimir documentos con datos personales de trabajadores para uso distinto al expresamente autorizado por EL CONSULTOR para cada caso concreto.");
    bullet("f)", "Utilizar la información a la que acceda para finalidades distintas al apoyo de la labor consultiva de EL CONSULTOR.");

    clauseTitle("SÉPTIMA", "Uso Aceptable del Sistema");
    para("EL ASISTENTE se compromete a hacer uso de La Plataforma exclusivamente para los fines laborales asignados por EL CONSULTOR, conforme a las siguientes condiciones:");
    bullet("", "Solo utilizará dispositivos autorizados por EL CONSULTOR para acceder a La Plataforma. Queda prohibido el acceso desde dispositivos personales no registrados ante EL PROVEEDOR.");
    bullet("", "No accederá a La Plataforma fuera del horario laboral acordado con EL CONSULTOR, salvo autorización escrita previa y expresa para un caso específico.");
    bullet("", "No intentará acceder a funcionalidades, módulos o información para los que no tenga autorización, ni realizará pruebas de seguridad, ataques de fuerza bruta o cualquier intento de eludir los controles de acceso.");
    bullet("", "No instalará software no autorizado ni extensiones de navegador que puedan interceptar, registrar o transmitir información de La Plataforma a terceros.");
    bullet("", "Cerrará la sesión de La Plataforma al concluir cada jornada de trabajo o cuando se ausente del dispositivo por más de quince (15) minutos.");
    bullet("", "Reportará de inmediato a EL CONSULTOR cualquier comportamiento anómalo, acceso no solicitado o vulnerabilidad que detecte en La Plataforma.");

    clauseTitle("OCTAVA", "Deber de Reporte de Incidentes de Seguridad");
    para("EL ASISTENTE está obligado a notificar de manera inmediata, y en ningún caso después de DOCE (12) HORAS de conocido el hecho, cualquier Incidente de Seguridad que se presente, incluyendo:");
    bullet("", "Pérdida, robo o sustracción del dispositivo desde el cual accede a La Plataforma.");
    bullet("", "Acceso sospechoso o no autorizado a su cuenta de usuario.");
    bullet("", "Divulgación accidental de Información Confidencial a personas no autorizadas.");
    bullet("", "Recepción de solicitudes de terceros orientadas a obtener información de La Plataforma o de los clientes del Consultor.");
    bullet("", "Cualquier situación que comprometa o pueda comprometer la integridad, confidencialidad o disponibilidad de la información gestionada.");
    para("La notificación deberá realizarse simultáneamente a EL CONSULTOR y a EL PROVEEDOR al correo admin@sst-colombia.com, con descripción del hecho, fecha, hora y medidas inmediatas adoptadas. El incumplimiento de este deber de reporte agravará la responsabilidad de EL ASISTENTE frente a cualquier daño que se derive de la demora en la notificación.");

    clauseTitle("NOVENA", "Protección de Datos Personales");
    para("EL ASISTENTE reconoce que, en ejercicio de sus funciones, accederá a datos personales de trabajadores de los clientes del Consultor, los cuales incluyen datos de salud, accidentalidad, morbilidad e incapacidades que tienen el carácter de datos sensibles conforme al artículo 5 de la Ley 1581 de 2012 y el Decreto 1377 de 2013.");
    subTitle("En consecuencia, EL ASISTENTE se compromete a:");
    bullet("", "Tratar los datos personales únicamente para las finalidades autorizadas por el titular y dentro del alcance definido en la Cláusula Tercera.");
    bullet("", "No ceder, transferir, vender ni compartir datos personales con terceros bajo ninguna circunstancia, ni durante ni después de la vigencia del presente acuerdo.");
    bullet("", "Adoptar las medidas técnicas y organizativas necesarias para evitar la pérdida, acceso no autorizado, uso indebido o alteración de los datos personales.");
    bullet("", "Cumplir con los protocolos de seguridad de la información que EL CONSULTOR y EL PROVEEDOR establezcan.");
    para("EL ASISTENTE conoce y acepta que el incumplimiento de las disposiciones de la Ley 1581 de 2012 puede generar, además de las consecuencias previstas en este acuerdo, sanciones administrativas por parte de la Superintendencia de Industria y Comercio (SIC), y responsabilidad penal conforme al artículo 269F del Código Penal colombiano (violación de datos personales).");

    clauseTitle("DÉCIMA", "Monitoreo, Evidencia Digital y Registro de Accesos");
    para("En virtud de la protección de la propiedad intelectual de EL PROVEEDOR y la seguridad de la información de los clientes del Consultor, EL ASISTENTE acepta expresamente las siguientes condiciones de monitoreo, conforme a la Ley 527 de 1999 y el Código General del Proceso:");
    subTitle("1. Credenciales y Control de Acceso");
    bullet("", "EL ASISTENTE recibirá una (1) credencial de acceso nominal e intransferible. No se autoriza el uso simultáneo desde múltiples dispositivos o ubicaciones.");
    bullet("", "EL CONSULTOR deberá registrar ante EL PROVEEDOR los dispositivos y direcciones IP autorizados para el acceso de EL ASISTENTE.");
    subTitle("2. Registro de Sesiones y Alertas");
    bullet("", "EL PROVEEDOR registrará automáticamente la dirección IP, fecha, hora, dispositivo y duración de cada sesión de EL ASISTENTE.");
    bullet("", "El ingreso desde una dirección IP no registrada generará una alerta automática y podrá ser causal de suspensión preventiva inmediata de las credenciales.");
    bullet("", "Múltiples sesiones simultáneas con las mismas credenciales serán tratadas como actividad sospechosa y habilitarán la suspensión inmediata del acceso.");
    subTitle("3. Límite de Sesión");
    bullet("", "Una sesión activa continua no debería superar OCHO (8) HORAS diarias. El exceso habitual será registrado como actividad anómala.");
    subTitle("4. Valor Probatorio");
    para("Los registros de acceso (logs de servidor), las alertas generadas, los correos con marca de tiempo y cualquier evidencia digital preservada conforme al estándar ISO/IEC 27037 tendrán pleno valor probatorio conforme a la Ley 527 de 1999. EL PROVEEDOR conservará estos registros por CINCO (5) AÑOS con fines probatorios conforme al Decreto 1074 de 2015.");

    clauseTitle("DÉCIMA PRIMERA", "Devolución y Eliminación de Información");
    para("A la terminación del presente acuerdo por cualquier causa, EL ASISTENTE deberá, dentro de las CUARENTA Y OCHO (48) HORAS siguientes:");
    bullet("", "Eliminar de todos sus dispositivos personales y laborales cualquier archivo, documento, reporte, base de datos o información descargada de La Plataforma o relacionada con los clientes del Consultor.");
    bullet("", "Desinstalar cualquier aplicación o extensión utilizada para acceder a La Plataforma.");
    bullet("", "Remitir a EL CONSULTOR una declaración escrita, firmada, confirmando el cumplimiento de las obligaciones de eliminación y devolución de información.");
    para("El incumplimiento de esta obligación dentro del término establecido constituirá un incumplimiento grave que activará la cláusula penal establecida en la Cláusula Décima Segunda, además de las acciones legales civiles y penales que correspondan.");

    clauseTitle("DÉCIMA SEGUNDA", "Cláusula Penal y Responsabilidad Solidaria");
    para("Las partes acuerdan, conforme al artículo 1592 del Código Civil colombiano, una CLÁUSULA PENAL como estimación anticipada y definitiva de los perjuicios derivados del incumplimiento de las obligaciones de confidencialidad (Cláusula Cuarta), no captación de clientes (Cláusula Quinta), prohibiciones de manejo de datos (Cláusula Sexta), uso aceptable (Cláusula Séptima), reporte de incidentes (Cláusula Octava), protección de datos personales (Cláusula Novena) o devolución de información (Cláusula Décima Primera), por un valor de CINCUENTA MILLONES DE PESOS ($50.000.000) MONEDA CORRIENTE por cada incidente o infracción comprobada.");
    para("EL CONSULTOR responderá de manera SOLIDARIA ante EL PROVEEDOR por el pago de la cláusula penal y la totalidad de los daños causados por el incumplimiento de EL ASISTENTE, en virtud de la Alianza Principal que los vincula. EL PROVEEDOR podrá dirigir sus acciones indistintamente contra EL ASISTENTE, contra EL CONSULTOR, o contra ambos simultáneamente.");
    para("El pago de esta cláusula penal no extingue la obligación de reparar el daño adicional que pueda demostrarse, ni la terminación del acceso a La Plataforma, ni el cese de las actividades que la originaron. La parte afectada podrá exigir el cumplimiento de la obligación o la cláusula penal, pero no ambas simultáneamente, salvo que la pena se haya estipulado por el simple retardo.");

    clauseTitle("DÉCIMA TERCERA", "Vigencia, Ley Aplicable y Jurisdicción");
    para(`El presente acuerdo tendrá vigencia a partir del ${fechaAcuerdo} y se mantendrá vigente durante todo el tiempo en que EL ASISTENTE acceda a La Plataforma en nombre de EL CONSULTOR. La terminación de la relación laboral o contractual entre EL ASISTENTE y EL CONSULTOR producirá automáticamente la terminación del presente acuerdo, sin perjuicio de las obligaciones que por su naturaleza sobreviven a dicha terminación, en especial las de confidencialidad (Cláusula Cuarta), no captación de clientes (Cláusula Quinta) y cláusula penal (Cláusula Décima Segunda).`);
    para(`La presente alianza se regirá e interpretará conforme a las leyes de Colombia, en particular: la Ley 1581 de 2012 y Decreto 1377 de 2013 (Protección de Datos Personales), la Ley 527 de 1999 (Comercio Electrónico y Evidencia Digital), la Ley 23 de 1982 y Ley 1915 de 2018 (Derechos de Autor), el artículo 269F del Código Penal (Violación de Datos Personales), el Código Civil y el Código de Comercio colombiano.`);
    para("Toda controversia que surja con ocasión del presente acuerdo será resuelta mediante: (1) Arreglo directo dentro de los QUINCE (15) días hábiles siguientes a la notificación escrita del conflicto; (2) Conciliación ante un Centro de Conciliación acreditado en Medellín, con un plazo máximo de TREINTA (30) días hábiles; y (3) en caso de fracaso, los Jueces Civiles del Circuito de la ciudad de Medellín, Departamento de Antioquia, Colombia, a cuya jurisdicción las partes se someten expresamente, renunciando a cualquier otro fuero.");

    // ── Párrafo de firma ──────────────────────────────────────────────────
    checkPage(180);
    doc.moveDown(1);
    para(`En señal de conformidad con todas y cada una de las cláusulas anteriores, las partes suscriben el presente acuerdo en la ciudad de Medellín, Antioquia, el día ${fechaAcuerdo}.`);

    // ── Bloque de firmas ─────────────────────────────────────────────────
    const pw2 = doc.page.width;
    const col  = (pw2 - MARGIN * 2) / 2;
    const w    = col - 30;
    const sigY = doc.y + 30;

    // Líneas de firma
    doc.rect(MARGIN + 10,       sigY, w, 0.5).fill(C.BLACK);
    doc.rect(MARGIN + col + 10, sigY, w, 0.5).fill(C.BLACK);

    // Bloque EL CONSULTOR
    let py = sigY + 8;
    doc.fontSize(9).font("Helvetica-Bold").fillColor(C.BLACK)
       .text("EL CONSULTOR", MARGIN + 10, py, { width: w, align: "center" });
    py += LH + 2;
    doc.fontSize(8).font("Helvetica-Bold").fillColor(C.BLACK)
       .text(nombreConsultor.toUpperCase(), MARGIN + 10, py, { width: w, align: "center" });
    py += LH;
    doc.fontSize(8).font("Helvetica").fillColor(C.GRAY_SOFT)
       .text(`C.C. / NIT ${idConsultor}`, MARGIN + 10, py, { width: w, align: "center" });
    py += LH;
    doc.text("Consultor SST Aliado", MARGIN + 10, py, { width: w, align: "center" });

    // Bloque EL ASISTENTE
    let cy = sigY + 8;
    doc.fontSize(9).font("Helvetica-Bold").fillColor(C.BLACK)
       .text("EL ASISTENTE", MARGIN + col + 10, cy, { width: w, align: "center" });
    cy += LH + 2;
    doc.fontSize(8).font("Helvetica-Bold").fillColor(C.BLACK)
       .text(nombreAsistente.toUpperCase(), MARGIN + col + 10, cy, { width: w, align: "center" });
    cy += LH;
    doc.fontSize(8).font("Helvetica").fillColor(C.GRAY_SOFT)
       .text(`C.C. ${ccAsistente}`, MARGIN + col + 10, cy, { width: w, align: "center" });
    cy += LH;
    doc.text(cargoAsistente, MARGIN + col + 10, cy, { width: w, align: "center" });

    // Nota solidaridad
    const notaY = Math.max(py, cy) + LH * 3 + 20;
    checkPage(60);
    doc.fontSize(7.5).font("Helvetica-Oblique").fillColor(C.GRAY_SOFT)
       .text(
         `Nota: EL CONSULTOR reconoce su responsabilidad solidaria ante EL PROVEEDOR (SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S. — NIT 902.036.337-4) por el cumplimiento íntegro de las obligaciones de EL ASISTENTE establecidas en el presente acuerdo, conforme a la Alianza de Prestación de Servicios y Licenciamiento de Software suscrita entre ambas partes.`,
         MARGIN, notaY,
         { width: pw2 - MARGIN * 2, align: "justify" }
       );

    doc.end();
  });
}

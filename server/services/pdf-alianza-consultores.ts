/**
 * Alianza Consultores SST — Generador de PDF
 *
 * Cláusulas fijas. Datos editables: nombre, C.C. y fecha del aliado.
 */
import PDFDocument from "pdfkit";

export interface AlianzaData {
  tipoAliado?: "natural" | "juridica";
  // Persona natural
  nombreConsultor?: string;
  ccConsultor?: string;
  // Persona jurídica
  razonSocial?: string;
  nitEmpresa?: string;
  repLegal?: string;
  ccRepLegal?: string;
  // Común
  fechaAlianza?: string;
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

export async function generateAlianzaConsultoresPdf(data: AlianzaData): Promise<Buffer> {
  const tipo = data.tipoAliado ?? "natural";
  const esJuridica = tipo === "juridica";

  // Campos resueltos según tipo
  const fechaAlianza = data.fechaAlianza || "15 de agosto de 2026";

  // Línea 1 de portada / cuerpo: nombre o razón social
  const alinadoNombre = esJuridica
    ? (data.razonSocial || "___________________________")
    : (data.nombreConsultor || "___________________________");

  // Línea 2 de portada: identificación
  const alinadoId = esJuridica
    ? `NIT ${data.nitEmpresa || "_______________"}  •  EL CONSULTOR`
    : `C.C. ${data.ccConsultor || "_______________"}  •  EL CONSULTOR`;

  // Texto de identificación para el cuerpo del documento
  const alinadoIdentificacion = esJuridica
    ? `${data.razonSocial || "___________________________"}, sociedad colombiana identificada con NIT ${data.nitEmpresa || "_______________"}, actuando a través de su Representante Legal ${data.repLegal || "___________________________"}, identificado(a) con C.C. No. ${data.ccRepLegal || "_______________"}`
    : `${data.nombreConsultor || "___________________________"}, identificado con C.C. No. ${data.ccConsultor || "_______________"}`;

  // Bloque de firma del consultor
  const firmaLinea1 = esJuridica ? (data.repLegal || "___________________________") : (data.nombreConsultor || "___________________________");
  const firmaLinea2 = esJuridica ? `C.C. ${data.ccRepLegal || "_______________"}` : `C.C. ${data.ccConsultor || "_______________"}`;
  const firmaLinea3 = esJuridica ? "Representante Legal" : null;
  const firmaLinea4 = esJuridica ? (data.razonSocial || "___________________________") : null;
  const firmaLinea5 = esJuridica ? `NIT ${data.nitEmpresa || "_______________"}` : null;

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      size: "LETTER",
      margin: MARGIN,
      info: {
        Title: "Alianza de Prestación de Servicios y Licenciamiento de Software — SST Colombia",
        Author: "SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.",
        Subject: "Alianza Estratégica con Consultores SST",
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
         .text("SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.  |  NIT 902.036.337-4  |  CONFIDENCIAL",
               MARGIN, MARGIN + 8, { width: pw - MARGIN * 2, align: "center", lineBreak: false });
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
         .text(`Página ${pageNum}  |  DOCUMENTO CONFIDENCIAL  |  © ${YEAR} SST Colombia`,
               MARGIN, ph - MARGIN - 9,
               { width: pw - MARGIN * 2, align: "center", lineBreak: false });
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
       .text("ALIANZA DE PRESTACIÓN DE", MARGIN, 200, { width: pw - MARGIN * 2, align: "center" });
    doc.text("SERVICIOS Y LICENCIAMIENTO", { width: pw - MARGIN * 2, align: "center" });
    doc.text("DE SOFTWARE", { width: pw - MARGIN * 2, align: "center" });

    doc.moveDown(0.8);
    doc.fontSize(13).font("Helvetica").fillColor(C.GOLD)
       .text("ALIANZA ESTRATÉGICA CON CONSULTORES SST", { width: pw - MARGIN * 2, align: "center" });

    doc.moveDown(2);
    doc.rect(MARGIN + 60, doc.y, pw - (MARGIN + 60) * 2, 0.5).fill(C.GOLD);
    doc.moveDown(1);

    doc.fontSize(10).fillColor(C.WHITE);
    doc.text("ENTRE:", MARGIN, doc.y, { width: pw - MARGIN * 2, align: "center" });
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").text("SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.", { width: pw - MARGIN * 2, align: "center" });
    doc.font("Helvetica").text("NIT 902.036.337-4  •  EL PROVEEDOR", { width: pw - MARGIN * 2, align: "center" });
    doc.moveDown(0.5);
    doc.text("Y", { width: pw - MARGIN * 2, align: "center" });
    doc.moveDown(0.5);
    doc.font("Helvetica-Bold").text(alinadoNombre.toUpperCase(), { width: pw - MARGIN * 2, align: "center" });
    doc.font("Helvetica").text(alinadoId, { width: pw - MARGIN * 2, align: "center" });

    doc.moveDown(3);
    doc.fillColor(C.WHITE).fontSize(8)
       .text(`Generado: ${fechaAlianza}`, { width: pw - MARGIN * 2, align: "center" });
    doc.text("Registro DNDA: 13-197-177  •  Ley 23 de 1982  •  Decisión Andina 351", { width: pw - MARGIN * 2, align: "center" });

    // ════════════════════════════════════════════════════════════════════════
    // CONTENIDO
    // ════════════════════════════════════════════════════════════════════════
    doc.addPage();
    stampHeader();

    para(`Consta por el presente documento la ALIANZA DE PRESTACIÓN DE SERVICIOS Y LICENCIAMIENTO DE SOFTWARE, que se celebra entre las partes identificadas a continuación, sujeta a las siguientes cláusulas. Ciudad y fecha: Medellín, Antioquia, ${fechaAlianza}.`);
    para(`Las partes de la presente alianza son: (i) SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S., sociedad colombiana identificada con NIT 902.036.337-4, inscrita en la Cámara de Comercio de Medellín para Antioquia, que actúa a través de su Representante Legal LUZ ADRIANA DIAZ CALLE, identificada con C.C. No. 52.223.631 (en adelante "EL PROVEEDOR"); y (ii) ${alinadoIdentificacion} (en adelante "EL CONSULTOR"). El rol de EL PROVEEDOR se limita exclusivamente a suministrar la plataforma tecnológica como herramienta de trabajo. Los clientes atendidos son propios de EL CONSULTOR, quien actúa de manera autónoma e independiente en la prestación de sus servicios de consultoría en Seguridad y Salud en el Trabajo.`);

    clauseTitle("PRIMERA", "Objeto de la Alianza");
    para(`La presente alianza tiene por objeto establecer los términos y condiciones bajo los cuales EL CONSULTOR prestará servicios de consultoría en Seguridad y Salud en el Trabajo (SST) a sus propios clientes, utilizando la plataforma tecnológica denominada "SST Colombia" de propiedad de EL PROVEEDOR (en adelante "la Plataforma"). EL PROVEEDOR no tiene ni tendrá relación comercial directa con los clientes de EL CONSULTOR; su aporte se limita al suministro, mantenimiento y licenciamiento de La Plataforma. La presente alianza regula además los compromisos de confidencialidad, no competencia y protección de la propiedad intelectual que rigen dicha relación.`);

    clauseTitle("SEGUNDA", "Definiciones");
    bullet("La Plataforma:", 'El sistema SaaS de gestión SST denominado "SST Colombia", incluyendo su código fuente, código objeto, interfaces de usuario, bases de datos, documentación, flujos de trabajo y actualizaciones.');
    bullet("Lógica de Negocio:", "Los flujos de trabajo automatizados, algoritmos de cálculo de riesgo laboral y ARL, estructuras de evaluación SST conforme a la Resolución 0312/2019, criterios de calificación de estándares mínimos, metodologías de generación automática de documentos (matrices de peligros, planes de trabajo, indicadores, cronogramas), y cualquier proceso de decisión o regla de negocio implementada en La Plataforma.");
    bullet("Información Confidencial:", "Toda información técnica, comercial, financiera, de clientes o estratégica de EL PROVEEDOR a la que EL CONSULTOR tenga acceso con ocasión de esta alianza, incluyendo sin limitación: datos de clientes, metodologías, precios, estructura de La Plataforma y la Lógica de Negocio.");
    bullet("Obra Derivada:", "Cualquier software, sistema, herramienta o producto que incorpore, replique o esté basado en la Lógica de Negocio, arquitectura funcional o interfaz de La Plataforma.");

    clauseTitle("TERCERA", "Licenciamiento de la Plataforma");
    para(`En virtud de la presente alianza, EL PROVEEDOR otorga a EL CONSULTOR una licencia de uso limitada, personal, revocable, no exclusiva y no transferible de La Plataforma, exclusivamente para que EL CONSULTOR preste servicios de consultoría SST a sus propios clientes. Los clientes vinculados son y seguirán siendo clientes de EL CONSULTOR en todo momento. Esta licencia no confiere ningún derecho de propiedad sobre La Plataforma ni sobre la Lógica de Negocio.`);
    subTitle("Está estrictamente prohibido a EL CONSULTOR:");
    bullet("a)", "Descompilar, realizar ingeniería inversa, desensamblar, extraer el código fuente, o intentar derivar la Lógica de Negocio o la estructura técnica de La Plataforma por cualquier medio.");
    bullet("b)", "Plagiar, reproducir, copiar, distribuir, comercializar, alquilar o imitar total o parcialmente la estructura, funcionalidades, Lógica de Negocio o interfaz gráfica de La Plataforma.");
    bullet("c)", "Utilizar la Información Confidencial o los conocimientos técnicos adquiridos sobre La Plataforma para desarrollar, asesorar o crear un software, producto o servicio competidor, directa o indirectamente.");
    bullet("d)", "Otorgar acceso a La Plataforma a terceros no autorizados expresamente por EL PROVEEDOR.");

    clauseTitle("CUARTA", "Obligaciones de EL CONSULTOR");
    bullet("", "Prestar los servicios de consultoría SST con idoneidad, diligencia y conforme a la normativa colombiana vigente.");
    bullet("", "Mantener la Información Confidencial en reserva estricta durante la vigencia de la alianza y por cinco (5) años adicionales contados desde su terminación.");
    bullet("", "Informar a EL PROVEEDOR de cualquier solicitud de terceros sobre Información Confidencial dentro de las 24 horas siguientes.");
    bullet("", "No subcontratar ni delegar las obligaciones derivadas de esta alianza sin autorización escrita previa de EL PROVEEDOR.");
    bullet("", "Cumplir con la normativa de protección de datos personales (Ley 1581 de 2012 y Decreto 1377 de 2013).");

    clauseTitle("QUINTA", "Propiedad Intelectual, Derechos de Autor y Protección Anti-Plagio");
    para("Toda La Plataforma, su código fuente, código objeto, arquitectura de software, estructuras de datos, interfaces de usuario, documentación técnica, marcas, logos, desarrollos, actualizaciones y mejoras asociadas, así como la Lógica de Negocio descrita en la Cláusula Segunda, son propiedad exclusiva e inalienable de EL PROVEEDOR, encontrándose plenamente protegidos bajo el régimen de Derechos de Autor (Ley 23 de 1982 y Ley 1915 de 2018, Decisión Andina 351 de la Comunidad Andina) y Propiedad Industrial. Registro DNDA: 13-197-177.");
    para("La violación de cualquiera de las prohibiciones establecidas en la Cláusula Tercera dará lugar a: (i) la terminación inmediata de la alianza por justa causa; (ii) el cobro de la cláusula penal establecida en la Cláusula Novena; y (iii) la obligación de indemnizar la totalidad de los daños y perjuicios materiales y morales causados, sin que el pago de la cláusula penal extinga dicha obligación.");

    clauseTitle("SEXTA", "No Competencia");
    para(`EL CONSULTOR se obliga a no participar, desarrollar, financiar, asesorar, ni prestar servicios directamente a plataformas tecnológicas de gestión SST que compitan directa o indirectamente con La Plataforma de EL PROVEEDOR, durante la vigencia de esta alianza y por un período de CUATRO (4) AÑOS contados desde la fecha de su terminación, en el territorio colombiano.`);
    para("Para efectos de esta cláusula, se entiende como competidora toda plataforma, software, aplicación o sistema que tenga por objeto la gestión automatizada de Sistemas de Gestión de Seguridad y Salud en el Trabajo (SG-SST), conforme a la Resolución 0312/2019 del Ministerio de Trabajo, o normas que la modifiquen o sustituyan.");
    para("Esta obligación de no competencia es razonable en su alcance territorial y temporal conforme al artículo 333 de la Constitución Política de Colombia y la jurisprudencia de la Corte Suprema de Justicia sobre libertad de empresa y competencia leal.");

    clauseTitle("SÉPTIMA", "Confidencialidad Reforzada");
    para("EL CONSULTOR se compromete a guardar absoluta reserva sobre toda la Información Confidencial a la que tenga acceso con ocasión de la presente alianza. Esta obligación de confidencialidad tendrá una duración de CINCO (5) AÑOS contados a partir de la terminación de la alianza, independientemente de la causa que la origine.");
    subTitle("La obligación de confidencialidad comprende expresamente:");
    bullet("", "La Lógica de Negocio y metodologías de EL PROVEEDOR.");
    bullet("", "La lista de clientes, tarifas, condiciones comerciales y estrategia de mercado.");
    bullet("", "Las tecnologías, integraciones y arquitectura técnica de La Plataforma.");
    bullet("", "Los datos personales de trabajadores y empleadores a los que acceda en ejercicio de su labor.");
    bullet("", 'Cualquier información identificada como "CONFIDENCIAL" o que por su naturaleza deba entenderse como reservada.');
    para("Quedan exceptuadas de esta obligación únicamente las informaciones que EL CONSULTOR pueda demostrar fehacientemente que: (a) eran de dominio público al momento de su divulgación; (b) fueron recibidas legítimamente de un tercero sin restricción de confidencialidad; o (c) deba revelar por mandato judicial o legal, previa notificación escrita a EL PROVEEDOR.");

    clauseTitle("OCTAVA", "No Solicitud de Clientes ni Personal");
    para(`Todos los clientes que EL CONSULTOR vincule a La Plataforma son y seguirán siendo clientes exclusivos de EL CONSULTOR. EL PROVEEDOR no podrá contactar, captar ni prestar servicios directamente a dichos clientes durante la vigencia de la alianza ni con posterioridad a su terminación. No obstante, EL CONSULTOR se obliga a no contactar, asesorar ni prestar servicios de consultoría SST a los clientes que EL PROVEEDOR tuviera vinculados a La Plataforma con anterioridad al inicio de esta alianza (${fechaAlianza}), por un período de DOS (2) AÑOS posteriores a la terminación de la misma, salvo autorización escrita previa de EL PROVEEDOR.`);
    para("Igualmente, EL CONSULTOR se abstiene de solicitar, inducir o contratar, directa o indirectamente, a los empleados, colaboradores o contratistas de EL PROVEEDOR durante la vigencia de la alianza y por DOS (2) AÑOS adicionales a su terminación.");

    clauseTitle("NOVENA", "Cláusula Penal");
    para("Las partes acuerdan, conforme al artículo 1592 del Código Civil colombiano, una CLÁUSULA PENAL como estimación anticipada y definitiva de los perjuicios derivados del incumplimiento de las obligaciones de confidencialidad (Cláusula Séptima), no competencia (Cláusula Sexta), no solicitud (Cláusula Octava) o propiedad intelectual (Cláusula Quinta), por un valor equivalente a CIEN MILLONES DE PESOS ($100.000.000) MONEDA CORRIENTE.");
    para("El pago de esta cláusula penal no extingue la obligación de reparar el daño adicional que EL PROVEEDOR pueda demostrar, ni la terminación de la alianza, ni el cese de las actividades que la originaron. La parte afectada podrá exigir el cumplimiento de la obligación o la cláusula penal, pero no ambas simultáneamente, salvo que la pena se haya estipulado por el simple retardo.");

    clauseTitle("DÉCIMA", "Evidencia Digital, Monitoreo de Acceso y Registro de Sesiones");
    para("Con el fin de proteger la propiedad intelectual de EL PROVEEDOR y garantizar el uso adecuado de La Plataforma, las partes acuerdan las siguientes condiciones de acceso y monitoreo, conforme a la Ley 527 de 1999 y el Código General del Proceso:");
    subTitle("1. Credenciales de Acceso");
    bullet("", "EL PROVEEDOR asignará a EL CONSULTOR un máximo de DOS (2) credenciales de acceso nominales e intransferibles a La Plataforma. Dichas credenciales son de uso exclusivo de EL CONSULTOR y no podrán ser compartidas, cedidas ni utilizadas por terceros, desarrolladores, competidores o personas ajenas a la relación de alianza.");
    bullet("", "Cada credencial corresponde a un único perfil de usuario. No se autoriza el uso simultáneo de una misma credencial desde múltiples dispositivos o ubicaciones.");
    subTitle("2. Registro y Monitoreo de Direcciones IP");
    bullet("", "EL PROVEEDOR registrará automáticamente la dirección IP desde la cual se realiza cada ingreso a La Plataforma, junto con la fecha, hora, dispositivo y duración de la sesión.");
    bullet("", "EL CONSULTOR deberá registrar ante EL PROVEEDOR las direcciones IP autorizadas para su acceso (domicilio y lugar de trabajo). El ingreso desde una dirección IP no registrada generará una alerta automática y podrá ser causal de suspensión preventiva de las credenciales.");
    bullet("", "Si se detectan ingresos reiterados desde IPs no autorizadas, ubicaciones geográficas inusuales o múltiples sesiones simultáneas con las mismas credenciales, EL PROVEEDOR podrá suspender el acceso de manera inmediata y unilateral, sin perjuicio de las acciones legales a que haya lugar.");
    subTitle("3. Control de Duración de Sesiones");
    bullet("", "Dado que el rol de EL CONSULTOR corresponde a la prestación de servicios de consultoría SST, se establece que una sesión activa continua no debería superar OCHO (8) HORAS diarias. Una duración de sesión que exceda dicho límite de forma habitual será registrada como actividad sospechosa y generará una alerta interna para EL PROVEEDOR.");
    bullet("", "EL PROVEEDOR se reserva el derecho de cerrar sesiones automáticamente que superen el límite acordado, previo aviso por correo electrónico a EL CONSULTOR.");
    subTitle("4. Valor Probatorio de los Registros");
    para("Los siguientes elementos tendrán pleno valor probatorio en caso de controversia, conforme a la Ley 527 de 1999 y el Código General del Proceso:");
    bullet("", "Los registros de acceso (logs de servidor) con indicación de usuario, dirección IP, fecha, hora y duración de sesión.");
    bullet("", "Las alertas generadas por el sistema ante accesos desde IPs no autorizadas o sesiones simultáneas.");
    bullet("", "Los correos electrónicos e intercambios digitales con marcas de tiempo verificables.");
    bullet("", "Cualquier evidencia digital preservada conforme al estándar ISO/IEC 27037.");
    para("EL PROVEEDOR conservará estos registros por un período mínimo de CINCO (5) AÑOS con fines probatorios, conforme al Decreto 1074 de 2015. La existencia de registros de acceso anómalos constituirá indicio grave de incumplimiento de la presente alianza y habilitará el cobro de la cláusula penal establecida en la Cláusula Novena.");

    clauseTitle("DÉCIMA PRIMERA", "Vigencia y Terminación");
    para(`La presente alianza tendrá vigencia a partir del ${fechaAlianza} y una duración de UN (1) AÑO, prorrogable automáticamente por períodos iguales salvo que cualquiera de las partes notifique por escrito su intención de no renovar con al menos TREINTA (30) días de antelación.`);
    subTitle("Son causales de terminación por justa causa:");
    bullet("", "El incumplimiento grave de cualquier obligación establecida en esta alianza.");
    bullet("", "La violación de las prohibiciones de la Cláusula Tercera.");
    bullet("", "La insolvencia, disolución o liquidación de cualquiera de las partes.");
    bullet("", "La inhabilitación profesional de EL CONSULTOR para ejercer actividades de SST.");
    para("La terminación de la alianza no extingue las obligaciones de confidencialidad, no competencia, no solicitud y cláusula penal, las cuales permanecen vigentes por los términos establecidos en cada cláusula respectiva.");

    clauseTitle("DÉCIMA SEGUNDA", "Solución de Controversias y Jurisdicción");
    para("Toda controversia, diferencia, conflicto o reclamo que surja entre las partes con ocasión de la firma, ejecución, interpretación, terminación o incumplimiento de la presente alianza, y en especial las disputas relacionadas con la titularidad, licenciamiento, secreto industrial, uso indebido o alegaciones de copia o plagio de software, se sujetará al siguiente procedimiento:");
    bullet("1. Arreglo Directo:", "Las partes intentarán resolver el conflicto de manera amigable mediante negociación directa dentro de un término máximo e improrrogable de QUINCE (15) días hábiles contados desde la notificación escrita del conflicto.");
    bullet("2. Conciliación:", "Si transcurridos los quince (15) días hábiles no se ha llegado a un acuerdo, las partes acudirán a conciliación ante un Centro de Conciliación debidamente acreditado con sede en la ciudad de Medellín, Departamento de Antioquia, de conformidad con la Ley 640 de 2001. El término para la conciliación no podrá exceder de TREINTA (30) días hábiles.");
    bullet("3. Jurisdicción Ordinaria:", "En caso de que la conciliación fracase, las partes se someten expresamente a la jurisdicción y competencia de los Jueces Civiles del Circuito de la ciudad de Medellín, Departamento de Antioquia, Colombia, renunciando a cualquier otro fuero que por razón de su domicilio o de la naturaleza del asunto pudiera corresponderles.");

    clauseTitle("DÉCIMA TERCERA", "Ley Aplicable");
    para(`La presente alianza se regirá e interpretará conforme a las leyes de Colombia, en particular: el Código de Comercio, el Código Civil, la Ley 23 de 1982 y sus modificaciones, en especial la Ley 1915 de 2018 (Derechos de Autor), la Decisión Andina 351 de la Comunidad Andina, la Ley 1581 de 2012 (Protección de Datos Personales), la Ley 527 de 1999 (Comercio Electrónico), y las disposiciones de Propiedad Industrial contenidas en la Decisión Andina 486.`);

    clauseTitle("DÉCIMA CUARTA", "Disposiciones Generales");
    bullet("Integralidad:", "Esta alianza constituye el acuerdo completo entre las partes respecto a su objeto y reemplaza cualquier acuerdo previo, verbal o escrito, sobre la misma materia.");
    bullet("Modificaciones:", "Cualquier modificación a esta alianza deberá constar por escrito y ser suscrita por los representantes autorizados de ambas partes.");
    bullet("Nulidad parcial:", "Si alguna cláusula de esta alianza fuere declarada nula o inaplicable, las demás cláusulas permanecerán vigentes en su totalidad.");
    bullet("Independencia:", "EL CONSULTOR actúa como contratista independiente. Nada en esta alianza crea una relación laboral, sociedad, joint venture o agencia entre las partes.");
    bullet("Notificaciones:", "Todas las comunicaciones deberán realizarse por escrito. EL PROVEEDOR recibirá notificaciones al correo electrónico admin@sst-colombia.com. EL CONSULTOR recibirá notificaciones al correo electrónico indicado al momento de la suscripción. Toda comunicación se entenderá recibida dentro de las 24 horas siguientes a su envío, con acuse de recibo.");

    // ── Párrafo de firma ──────────────────────────────────────────────────
    checkPage(160);
    doc.moveDown(1);
    para(`En señal de conformidad con todas y cada una de las cláusulas anteriores, las partes suscriben la presente alianza en la ciudad de Medellín, Antioquia, el día ${fechaAlianza}.`);

    // ── Bloque de firmas ─────────────────────────────────────────────────
    const pw2 = doc.page.width;
    const col = (pw2 - MARGIN * 2) / 2;
    const w   = col - 30;
    const sigY = doc.y + 30;

    doc.rect(MARGIN + 10,       sigY, w, 0.5).fill(C.BLACK);
    doc.rect(MARGIN + col + 10, sigY, w, 0.5).fill(C.BLACK);

    // Proveedor
    let py = sigY + 8;
    doc.fontSize(9).font("Helvetica-Bold").fillColor(C.BLACK)
       .text("EL PROVEEDOR", MARGIN + 10, py, { width: w, align: "center" });
    py += LH + 2;
    doc.fontSize(8).font("Helvetica-Bold").fillColor(C.BLACK)
       .text("LUZ ADRIANA DIAZ CALLE", MARGIN + 10, py, { width: w, align: "center" });
    py += LH;
    doc.fontSize(8).font("Helvetica").fillColor(C.GRAY_SOFT)
       .text("C.C. 52.223.631", MARGIN + 10, py, { width: w, align: "center" });
    py += LH;
    doc.text("Representante Legal", MARGIN + 10, py, { width: w, align: "center" });
    py += LH;
    doc.font("Helvetica-Bold").fillColor(C.BLACK)
       .text("SISTEMA AUTOMATIZADO DE", MARGIN + 10, py, { width: w, align: "center" });
    py += LH;
    doc.text("GESTIÓN INTEGRAL S.A.S.", MARGIN + 10, py, { width: w, align: "center" });
    py += LH;
    doc.fontSize(7).font("Helvetica").fillColor(C.GRAY_SOFT)
       .text("NIT 902.036.337-4", MARGIN + 10, py, { width: w, align: "center" });

    // Consultor
    let cy = sigY + 8;
    doc.fontSize(9).font("Helvetica-Bold").fillColor(C.BLACK)
       .text("EL CONSULTOR", MARGIN + col + 10, cy, { width: w, align: "center" });
    cy += LH + 2;
    doc.fontSize(8).font("Helvetica-Bold").fillColor(C.BLACK)
       .text(firmaLinea1.toUpperCase(), MARGIN + col + 10, cy, { width: w, align: "center" });
    cy += LH;
    doc.fontSize(8).font("Helvetica").fillColor(C.GRAY_SOFT)
       .text(firmaLinea2, MARGIN + col + 10, cy, { width: w, align: "center" });
    if (firmaLinea3) {
      cy += LH;
      doc.text(firmaLinea3, MARGIN + col + 10, cy, { width: w, align: "center" });
    }
    if (firmaLinea4) {
      cy += LH;
      doc.font("Helvetica-Bold").fillColor(C.BLACK)
         .text(firmaLinea4.toUpperCase(), MARGIN + col + 10, cy, { width: w, align: "center" });
    }
    if (firmaLinea5) {
      cy += LH;
      doc.fontSize(7).font("Helvetica").fillColor(C.GRAY_SOFT)
         .text(firmaLinea5, MARGIN + col + 10, cy, { width: w, align: "center" });
    }

    doc.end();
  });
}

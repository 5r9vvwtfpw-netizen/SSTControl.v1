/**
 * GENERADOR DE CONTRATO DE ALIANZA — SST Colombia
 * 
 * Uso: node generar-contrato-alianza.js
 * Salida: contrato-alianza.pdf (en la raíz del proyecto)
 * 
 * NOTA LEGAL: Este documento es un BORRADOR para revisión por abogado.
 * No constituye asesoría jurídica.
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// ── Colores corporativos ──────────────────────────────────────────────────────
const C = {
  GREEN:      '#1e7e34',
  GREEN_DARK: '#155724',
  GREEN_LITE: '#e8f5e9',
  BLACK:      '#111111',
  GRAY:       '#444444',
  GRAY_SOFT:  '#888888',
  WHITE:      '#ffffff',
  GOLD:       '#c9a84c',
};

const MARGIN = 50;
const OUTPUT = path.join(__dirname, 'contrato-alianza.pdf');

// ── Helpers ───────────────────────────────────────────────────────────────────

function checkPage(doc, needed = 60) {
  if (doc.y + needed > doc.page.height - MARGIN - 40) {
    doc.addPage();
    addPageHeader(doc);
    return true;
  }
  return false;
}

function addPageHeader(doc) {
  const pw = doc.page.width;
  doc.rect(MARGIN, MARGIN, pw - MARGIN * 2, 3).fill(C.GREEN);
  doc.fontSize(7).font('Helvetica').fillColor(C.GRAY_SOFT)
     .text('SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.  |  NIT 902.036.337-4  |  CONFIDENCIAL',
           MARGIN, MARGIN + 8, { width: pw - MARGIN * 2, align: 'center' });
  doc.rect(MARGIN, MARGIN + 20, pw - MARGIN * 2, 0.5).fill(C.GRAY_SOFT);
  doc.moveDown(3.5);
}

function addPageFooter(doc, pageNum) {
  const pw = doc.page.width;
  const ph = doc.page.height;
  doc.save();
  doc.rect(MARGIN, ph - MARGIN - 12, pw - MARGIN * 2, 0.5).fill(C.GRAY_SOFT);
  doc.fontSize(7).font('Helvetica').fillColor(C.GRAY_SOFT)
     .text(`Página ${pageNum}  |  DOCUMENTO CONFIDENCIAL  |  © ${new Date().getFullYear()} SST Colombia`,
           MARGIN, ph - MARGIN, { width: pw - MARGIN * 2, align: 'center' });
  doc.restore();
}

function clauseTitle(doc, num, title) {
  checkPage(doc, 50);
  const pw = doc.page.width;
  const y  = doc.y + 8;
  doc.rect(MARGIN, y, pw - MARGIN * 2, 22).fill(C.GREEN);
  doc.fontSize(10).font('Helvetica-Bold').fillColor(C.WHITE)
     .text(`CLÁUSULA ${num}: ${title.toUpperCase()}`, MARGIN + 8, y + 6,
           { width: pw - MARGIN * 2 - 16 });
  doc.fillColor(C.BLACK);
  doc.moveDown(0.3);
}

function para(doc, text, opts = {}) {
  checkPage(doc, 30);
  doc.fontSize(9.5).font('Helvetica').fillColor(C.GRAY)
     .text(text, MARGIN + (opts.indent || 0), doc.y,
           { width: doc.page.width - MARGIN * 2 - (opts.indent || 0), align: 'justify', ...opts });
  doc.moveDown(0.6);
}

function bullet(doc, label, text) {
  checkPage(doc, 25);
  const pw = doc.page.width;
  const x  = MARGIN + 12;
  const w  = pw - MARGIN * 2 - 12;
  const y  = doc.y;
  doc.fontSize(9.5).font('Helvetica-Bold').fillColor(C.GREEN).text('•', MARGIN, y);
  if (label) {
    doc.font('Helvetica-Bold').fillColor(C.BLACK).text(label + ': ', x, y, { continued: true, width: w });
    doc.font('Helvetica').fillColor(C.GRAY).text(text, { width: w, align: 'justify' });
  } else {
    doc.font('Helvetica').fillColor(C.GRAY).text(text, x, y, { width: w, align: 'justify' });
  }
  doc.moveDown(0.5);
}

function subTitle(doc, text) {
  checkPage(doc, 30);
  doc.moveDown(0.4);
  doc.fontSize(9.5).font('Helvetica-Bold').fillColor(C.BLACK)
     .text(text.toUpperCase(), MARGIN, doc.y);
  doc.moveDown(0.3);
}

function signatureBlock(doc) {
  const pw = doc.page.width;
  const y  = doc.y + 20;
  const col = (pw - MARGIN * 2) / 2;

  ['EL PROVEEDOR', 'EL CONSULTOR / ALIADO'].forEach((label, i) => {
    const x = MARGIN + i * col;
    doc.rect(x, y + 40, col - 20, 0.5).fill(C.BLACK);
    doc.fontSize(9).font('Helvetica-Bold').fillColor(C.BLACK)
       .text(label, x, y + 46, { width: col - 20, align: 'center' });
    doc.fontSize(8).font('Helvetica').fillColor(C.GRAY_SOFT);
    if (i === 0) {
      doc.text('LUZ ADRIANA DIAZ CALLE', x, y + 58, { width: col - 20, align: 'center' });
      doc.text('C.C. 52.223.631', x, y + 68, { width: col - 20, align: 'center' });
      doc.text('Representante Legal — NIT 902.036.337-4', x, y + 78, { width: col - 20, align: 'center' });
    } else {
      doc.text('MARA ALEJANDRA LOPEZ CORDOBA', x, y + 52, { width: col - 20, align: 'center' });
      doc.text('C.C. 1.003.076.944  —  NIT 902.029.648-0', x, y + 63, { width: col - 20, align: 'center' });
      doc.text('Representante Legal', x, y + 74, { width: col - 20, align: 'center' });
      doc.text('VERTEX GROUP CORPORATION S.A.S.', x, y + 83, { width: col - 20, align: 'center' });
    }
  });

  doc.rect(MARGIN, y, pw - MARGIN * 2, 0.5).fill(C.GREEN);
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(C.GREEN)
     .text('FIRMAS', MARGIN, y + 6, { width: pw - MARGIN * 2, align: 'center' });
}

// ── GENERACIÓN DEL DOCUMENTO ──────────────────────────────────────────────────

const doc = new PDFDocument({
  size: 'LETTER',
  margin: MARGIN,
  bufferPages: true,
  info: {
    Title: 'Contrato de Alianza y Licenciamiento de Software — SST Colombia',
    Author: 'SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.',
    Subject: 'Contrato de Prestación de Servicios y Licenciamiento',
    Keywords: 'SST Colombia, Alianza, Licenciamiento, Propiedad Intelectual',
    CreationDate: new Date(),
  },
});

const stream = fs.createWriteStream(OUTPUT);
doc.pipe(stream);

const pw = doc.page.width;

// ════════════════════════════════════════════════════════════════════════════════
// PORTADA
// ════════════════════════════════════════════════════════════════════════════════

doc.rect(0, 0, pw, doc.page.height).fill(C.GREEN_DARK);

const logoPath = path.join(__dirname, 'server', 'assets', 'sst-colombia-logo.png');
if (fs.existsSync(logoPath)) {
  doc.image(logoPath, (pw - 120) / 2, 80, { width: 120 });
}

doc.fontSize(22).font('Helvetica-Bold').fillColor(C.WHITE)
   .text('CONTRATO DE PRESTACIÓN DE', MARGIN, 220, { width: pw - MARGIN * 2, align: 'center' });
doc.text('SERVICIOS Y LICENCIAMIENTO', { width: pw - MARGIN * 2, align: 'center' });
doc.text('DE SOFTWARE', { width: pw - MARGIN * 2, align: 'center' });

doc.moveDown(0.8);
doc.fontSize(13).font('Helvetica').fillColor(C.GOLD)
   .text('ALIANZA ESTRATÉGICA CON CONSULTORES SST', { width: pw - MARGIN * 2, align: 'center' });

doc.moveDown(2);
doc.rect(MARGIN + 60, doc.y, pw - (MARGIN + 60) * 2, 0.5).fill(C.GOLD);
doc.moveDown(1);

doc.fontSize(10).fillColor(C.WHITE);
doc.text('ENTRE:', MARGIN, doc.y, { width: pw - MARGIN * 2, align: 'center' });
doc.moveDown(0.5);
doc.font('Helvetica-Bold').text('SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.', { width: pw - MARGIN * 2, align: 'center' });
doc.font('Helvetica').text('NIT 902.036.337-4  •  EL PROVEEDOR', { width: pw - MARGIN * 2, align: 'center' });
doc.moveDown(0.5);
doc.text('Y', { width: pw - MARGIN * 2, align: 'center' });
doc.moveDown(0.5);
doc.font('Helvetica-Bold').text('VERTEX GROUP CORPORATION S.A.S.', { width: pw - MARGIN * 2, align: 'center' });
doc.font('Helvetica').text('NIT 902.029.648-0  •  EL CONSULTOR', { width: pw - MARGIN * 2, align: 'center' });

doc.moveDown(3);
doc.fillColor(C.WHITE).fontSize(8)
   .text(`Generado: ${new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}`, { width: pw - MARGIN * 2, align: 'center' });
doc.text('Registro DNDA: 13-197-177  •  Ley 23 de 1982  •  Decisión Andina 351', { width: pw - MARGIN * 2, align: 'center' });

// ════════════════════════════════════════════════════════════════════════════════
// PÁGINAS DE CONTENIDO
// ════════════════════════════════════════════════════════════════════════════════

doc.addPage();
addPageHeader(doc);

// ── Encabezado de sección ──────────────────────────────────────────────────────
const today = '15 de agosto de 2026';

para(doc, `Consta por el presente documento el CONTRATO DE PRESTACIÓN DE SERVICIOS Y LICENCIAMIENTO DE SOFTWARE, que se celebra entre las partes identificadas a continuación, sujeto a las siguientes cláusulas. Ciudad y fecha: Medellín, Antioquia, ${today}.`);

para(doc, `Las partes del presente contrato son: (i) SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S., sociedad Colombiana identificada con NIT 902.036.337-4, inscrita en la Cámara de Comercio de Medellín para Antioquia, actuando a través de su Representante Legal LUZ ADRIANA DIAZ CALLE, identificada con C.C. No. 52.223.631 (en adelante "EL PROVEEDOR"); y (ii) VERTEX GROUP CORPORATION S.A.S., sociedad Colombiana identificada con NIT 902.029.648-0, Matrícula Mercantil No. 83616912, inscrita en la Cámara de Comercio de Medellín para Antioquia, actuando a través de su Representante Legal MARA ALEJANDRA LOPEZ CORDOBA, identificada con C.C. No. 1.003.076.944 (en adelante "EL CONSULTOR").`);

// ── CLÁUSULA PRIMERA ──────────────────────────────────────────────────────────
clauseTitle(doc, 'PRIMERA', 'Objeto del Contrato');
para(doc, `El presente contrato tiene por objeto establecer los términos y condiciones bajo los cuales EL CONSULTOR prestará servicios de consultoría en Seguridad y Salud en el Trabajo (SST) a los clientes de EL PROVEEDOR, utilizando la plataforma tecnológica denominada "SST Colombia" (en adelante "la Plataforma"), y los compromisos de confidencialidad, no competencia y protección de la propiedad intelectual que regulan dicha relación de alianza.`);

// ── CLÁUSULA SEGUNDA ─────────────────────────────────────────────────────────
clauseTitle(doc, 'SEGUNDA', 'Definiciones');
bullet(doc, 'La Plataforma', 'El sistema SaaS de gestión SST denominado "SST Colombia", incluyendo su código fuente, código objeto, interfaces de usuario, bases de datos, documentación, flujos de trabajo y actualizaciones.');
bullet(doc, 'Lógica de Negocio', 'Los flujos de trabajo automatizados, algoritmos de cálculo de riesgo laboral y ARL, estructuras de evaluación SST conforme a la Resolución 0312/2019, criterios de calificación de estándares mínimos, metodologías de generación automática de documentos (matrices de peligros, planes de trabajo, indicadores, cronogramas), y cualquier proceso de decisión o regla de negocio implementada en La Plataforma.');
bullet(doc, 'Información Confidencial', 'Toda información técnica, comercial, financiera, de clientes o estratégica de EL PROVEEDOR a la que EL CONSULTOR tenga acceso con ocasión de este contrato, incluyendo sin limitación: datos de clientes, metodologías, precios, estructura de La Plataforma y la Lógica de Negocio.');
bullet(doc, 'Obra Derivada', 'Cualquier software, sistema, herramienta o producto que incorpore, replique o esté basado en la Lógica de Negocio, arquitectura funcional o interfaz de La Plataforma.');

// ── CLÁUSULA TERCERA ──────────────────────────────────────────────────────────
clauseTitle(doc, 'TERCERA', 'Licenciamiento de la Plataforma');
para(doc, `En virtud del presente contrato, EL PROVEEDOR otorga a EL CONSULTOR una licencia de uso limitada, personal, revocable, no exclusiva y no transferible de La Plataforma, exclusivamente para prestar los servicios de consultoría SST a los clientes que EL CONSULTOR vincule a La Plataforma en el marco de esta alianza, durante la vigencia de este contrato. Esta licencia no confiere ningún derecho de propiedad sobre La Plataforma ni sobre la Lógica de Negocio.`);
subTitle(doc, 'Está estrictamente prohibido a EL CONSULTOR:');
bullet(doc, 'a)', 'Descompilar, realizar ingeniería inversa, desensamblar, extraer el código fuente, o intentar derivar la Lógica de Negocio o la estructura técnica de La Plataforma por cualquier medio.');
bullet(doc, 'b)', 'Plagiar, reproducir, copiar, distribuir, comercializar, alquilar o imitar total o parcialmente la estructura, funcionalidades, Lógica de Negocio o interfaz gráfica de La Plataforma.');
bullet(doc, 'c)', 'Utilizar la Información Confidencial o los conocimientos técnicos adquiridos sobre La Plataforma para desarrollar, asesorar o crear un software, producto o servicio competidor, directa o indirectamente.');
bullet(doc, 'd)', 'Otorgar acceso a La Plataforma a terceros no autorizados expresamente por EL PROVEEDOR.');

// ── CLÁUSULA CUARTA ───────────────────────────────────────────────────────────
clauseTitle(doc, 'CUARTA', 'Obligaciones de EL CONSULTOR');
bullet(doc, '', 'Prestar los servicios de consultoría SST con idoneidad, diligencia y conforme a la normativa Colombiana vigente.');
bullet(doc, '', 'Mantener la Información Confidencial en reserva estricta durante la vigencia del contrato y por cinco (5) años adicionales contados desde su terminación.');
bullet(doc, '', 'Informar a EL PROVEEDOR de cualquier solicitud de terceros sobre Información Confidencial dentro de las 24 horas siguientes.');
bullet(doc, '', 'No subcontratar ni delegar las obligaciones derivadas de este contrato sin autorización escrita previa de EL PROVEEDOR.');
bullet(doc, '', 'Cumplir con la normativa de protección de datos personales (Ley 1581 de 2012 y Decreto 1377 de 2013).');

// ── CLÁUSULA QUINTA ───────────────────────────────────────────────────────────
clauseTitle(doc, 'QUINTA', 'Propiedad Intelectual, Derechos de Autor y Protección Anti-Plagio');
para(doc, `Toda La Plataforma, su código fuente, código objeto, arquitectura de software, estructuras de datos, interfaces de usuario, documentación técnica, marcas, logos, desarrollos, actualizaciones y mejoras asociadas, así como la Lógica de Negocio descrita en la Cláusula Segunda, son propiedad exclusiva e inalienable de EL PROVEEDOR, encontrándose plenamente protegidos bajo el régimen de Derechos de Autor (Ley 23 de 1982 y Ley 1915 de 2018, Decisión Andina 351 de la Comunidad Andina) y Propiedad Industrial. Registro DNDA: 13-197-177.`);
para(doc, `La violación de cualquiera de las prohibiciones establecidas en la Cláusula Tercera dará lugar a: (i) la terminación inmediata del contrato por justa causa; (ii) el cobro de la cláusula penal establecida en la Cláusula Novena; y (iii) la obligación de indemnizar la totalidad de los daños y perjuicios materiales y morales causados, sin que el pago de la cláusula penal extinga dicha obligación.`);

doc.addPage();
addPageHeader(doc);

// ── CLÁUSULA SEXTA ────────────────────────────────────────────────────────────
clauseTitle(doc, 'SEXTA', 'No Competencia');
para(doc, `EL CONSULTOR se obliga a no participar, desarrollar, financiar, asesorar, ni prestar servicios directamente a plataformas tecnológicas de gestión SST que compitan directa o indirectamente con La Plataforma de EL PROVEEDOR, durante la vigencia de este contrato y por un período de CUATRO (4) AÑOS contados desde la fecha de su terminación, en el territorio Colombiano.`);
para(doc, `Para efectos de esta cláusula, se entiende como competidora toda plataforma, software, aplicación o sistema que tenga por objeto la gestión automatizada de Sistemas de Gestión de Seguridad y Salud en el Trabajo (SG-SST), conforme a la Resolución 0312/2019 del Ministerio de Trabajo, o normas que la modifiquen o sustituyan.`);
para(doc, `Esta obligación de no competencia es razonable en su alcance territorial y temporal conforme al artículo 333 de la Constitución Política de Colombia y la jurisprudencia de la Corte Suprema de Justicia sobre libertad de empresa y competencia leal.`);

// ── CLÁUSULA SÉPTIMA ──────────────────────────────────────────────────────────
clauseTitle(doc, 'SÉPTIMA', 'Confidencialidad Reforzada');
para(doc, `EL CONSULTOR se compromete a guardar absoluta reserva sobre toda la Información Confidencial a la que tenga acceso con ocasión del presente contrato. Esta obligación de confidencialidad tiene una duración de CINCO (5) AÑOS contados desde la terminación del contrato, independientemente de la causa de terminación.`);
subTitle(doc, 'La obligación de confidencialidad comprende expresamente:');
bullet(doc, '', 'La Lógica de Negocio y metodologías de EL PROVEEDOR.');
bullet(doc, '', 'La lista de clientes, tarifas, condiciones comerciales y estrategia de mercado.');
bullet(doc, '', 'Las tecnologías, integraciones y arquitectura técnica de La Plataforma.');
bullet(doc, '', 'Los datos personales de trabajadores y empleadores a los que acceda en ejercicio de su labor.');
bullet(doc, '', 'Cualquier información identificada como "CONFIDENCIAL" o que por su naturaleza deba entenderse como reservada.');
para(doc, `Quedan exceptuadas de esta obligación únicamente las informaciones que EL CONSULTOR pueda demostrar fehacientemente que: (a) eran de dominio público al momento de su divulgación; (b) fueron recibidas legítimamente de un tercero sin restricción de confidencialidad; o (c) deba revelar por mandato judicial o legal, previa notificación escrita a EL PROVEEDOR.`);

// ── CLÁUSULA OCTAVA ───────────────────────────────────────────────────────────
clauseTitle(doc, 'OCTAVA', 'No Solicitud de Clientes ni Personal');
para(doc, `EL CONSULTOR se obliga a no contactar, asesorar, captar ni prestar servicios de consultoría SST directamente a los clientes empresariales de EL PROVEEDOR a los que haya tenido acceso durante la vigencia de este contrato, por un período de DOS (2) AÑOS posteriores a la terminación del mismo, salvo autorización escrita previa de EL PROVEEDOR.`);
para(doc, `Igualmente, EL CONSULTOR se abstiene de solicitar, inducir o contratar, directa o indirectamente, a los empleados, colaboradores o contratistas de EL PROVEEDOR durante la vigencia del contrato y por DOS (2) AÑOS adicionales a su terminación.`);

// ── CLÁUSULA NOVENA ───────────────────────────────────────────────────────────
clauseTitle(doc, 'NOVENA', 'Cláusula Penal');
para(doc, `Las partes acuerdan, conforme al artículo 1592 del Código Civil Colombiano, una CLÁUSULA PENAL como estimación anticipada y definitiva de los perjuicios derivados del incumplimiento de las obligaciones de confidencialidad (Cláusula Séptima), no competencia (Cláusula Sexta), no solicitud (Cláusula Octava) o propiedad intelectual (Cláusula Quinta), por un valor equivalente a CIEN MILLONES DE PESOS ($100.000.000) MONEDA CORRIENTE.`);
para(doc, `El pago de esta cláusula penal no extingue la obligación de reparar el daño adicional que EL PROVEEDOR pueda demostrar, ni la terminación del contrato, ni el cese de las actividades que la originaron. La parte afectada podrá exigir el cumplimiento de la obligación o la cláusula penal, pero no ambas simultáneamente, salvo que la pena se haya estipulado por el simple retardo.`);

doc.addPage();
addPageHeader(doc);

// ── CLÁUSULA DÉCIMA ───────────────────────────────────────────────────────────
clauseTitle(doc, 'DÉCIMA', 'Evidencia Digital y Prueba Electrónica');
para(doc, `Las partes aceptan expresamente que los siguientes elementos tendrán pleno valor probatorio en caso de controversia relacionada con el incumplimiento de las obligaciones de este contrato, conforme a la Ley 527 de 1999 (Comercio Electrónico) y el Código General del Proceso:`);
bullet(doc, '', 'Los registros de acceso y sesiones en La Plataforma (logs de servidor), con indicación de usuario, fecha, hora e IP.');
bullet(doc, '', 'Los correos electrónicos y mensajes intercambiados a través de canales digitales, con marcas de tiempo verificables.');
bullet(doc, '', 'Las capturas de pantalla certificadas mediante firma digital o notaría.');
bullet(doc, '', 'Los repositorios de código con marcas de tiempo (timestamps) de sistemas de control de versiones.');
bullet(doc, '', 'Cualquier evidencia digital preservada mediante protocolo forense conforme al estándar ISO/IEC 27037.');
para(doc, `EL PROVEEDOR podrá retener y conservar los registros de actividad de EL CONSULTOR en La Plataforma por un período mínimo de CINCO (5) AÑOS con fines probatorios, conforme al Decreto 1074 de 2015.`);

// ── CLÁUSULA DÉCIMA PRIMERA ──────────────────────────────────────────────────
clauseTitle(doc, 'DÉCIMA PRIMERA', 'Vigencia y Terminación');
para(doc, `El presente contrato tendrá vigencia a partir del 15 DE AGOSTO DE 2026 y una duración de UN (1) AÑO, prorrogable automáticamente por períodos iguales salvo que cualquiera de las partes notifique por escrito su intención de no renovar con al menos TREINTA (30) días de antelación.`);
subTitle(doc, 'Son causales de terminación por justa causa:');
bullet(doc, '', 'El incumplimiento grave de cualquier obligación establecida en este contrato.');
bullet(doc, '', 'La violación de las prohibiciones de la Cláusula Tercera.');
bullet(doc, '', 'La insolvencia, disolución o liquidación de cualquiera de las partes.');
bullet(doc, '', 'La inhabilitación profesional de EL CONSULTOR para ejercer actividades de SST.');
para(doc, `La terminación del contrato no extingue las obligaciones de confidencialidad, no competencia, no solicitud y cláusula penal, las cuales permanecen vigentes por los términos establecidos en cada cláusula respectiva.`);

// ── CLÁUSULA DÉCIMA SEGUNDA ──────────────────────────────────────────────────
clauseTitle(doc, 'DÉCIMA SEGUNDA', 'Solución de Controversias y Jurisdicción');
para(doc, `Toda controversia, diferencia, conflicto o reclamo que surja entre las partes con ocasión de la firma, ejecución, interpretación, terminación o incumplimiento del presente contrato, y en especial las disputas relacionadas con la titularidad, licenciamiento, secreto industrial, uso indebido o alegaciones de copia/plagio de software, se sujetará al siguiente procedimiento:`);
bullet(doc, '1. Arreglo Directo', 'Las partes intentarán resolver el conflicto de manera amigable mediante negociación directa dentro de un término máximo e improrrogable de QUINCE (15) días hábiles contados desde la notificación escrita del conflicto.');
bullet(doc, '2. Conciliación', 'Si transcurridos los quince (15) días hábiles no se ha llegado a un acuerdo, las partes acudirán a conciliación ante un Centro de Conciliación debidamente acreditado con sede en la ciudad de Medellín, Departamento de Antioquia, de conformidad con la Ley 640 de 2001. El término para la conciliación no podrá exceder de TREINTA (30) días hábiles.');
bullet(doc, '3. Jurisdicción Ordinaria', 'En caso de que la conciliación fracase, las partes se someten expresamente a la jurisdicción y competencia de los Jueces Civiles del Circuito de la ciudad de Medellín, Departamento de Antioquia, Colombia, renunciando a cualquier otro fuero que por razón de su domicilio o de la naturaleza del asunto pudiera corresponderles.');

// ── CLÁUSULA DÉCIMA TERCERA ──────────────────────────────────────────────────
clauseTitle(doc, 'DÉCIMA TERCERA', 'Ley Aplicable');
para(doc, `El presente contrato se regirá e interpretará conforme a las leyes de Colombia, en particular: el Código de Comercio, el Código Civil, la Ley 23 de 1982 y sus modificaciones, en especial la Ley 1915 de 2018 (Derechos de Autor), la Decisión Andina 351 de la Comunidad Andina, la Ley 1581 de 2012 (Protección de Datos Personales), la Ley 527 de 1999 (Comercio Electrónico), y las disposiciones de Propiedad Industrial contenidas en la Decisión Andina 486.`);

// ── CLÁUSULA DÉCIMA CUARTA ───────────────────────────────────────────────────
clauseTitle(doc, 'DÉCIMA CUARTA', 'Disposiciones Generales');
bullet(doc, 'Integralidad', 'Este contrato constituye el acuerdo completo entre las partes respecto a su objeto y reemplaza cualquier acuerdo previo, verbal o escrito, sobre la misma materia.');
bullet(doc, 'Modificaciones', 'Cualquier modificación a este contrato deberá constar por escrito y ser suscrita por los representantes autorizados de ambas partes.');
bullet(doc, 'Nulidad parcial', 'Si alguna cláusula de este contrato fuere declarada nula o inaplicable, las demás cláusulas permanecerán vigentes en su totalidad.');
bullet(doc, 'Independencia', 'EL CONSULTOR actúa como contratista independiente. Nada en este contrato crea una relación laboral, sociedad, joint venture o agencia entre las partes.');
bullet(doc, 'Notificaciones', 'Todas las comunicaciones deberán realizarse por escrito al correo electrónico o dirección postal indicados por las partes al momento de la suscripción, con acuse de recibo.');

// ── FIRMAS ────────────────────────────────────────────────────────────────────
checkPage(doc, 160);
doc.moveDown(1);
para(doc, `En señal de conformidad con todas y cada una de las cláusulas anteriores, las partes suscriben el presente contrato en la ciudad de Medellín, Antioquia, el día 15 del mes de agosto de 2026.`);

signatureBlock(doc);

// ── Numeración de páginas ─────────────────────────────────────────────────────
const range = doc.bufferedPageRange();
for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i);
  if (i > range.start) { // No footer en portada
    addPageFooter(doc, i);
  }
}

doc.flushPages();
doc.end();

stream.on('finish', () => {
  console.log(`\n✅ PDF generado exitosamente: ${OUTPUT}`);
  console.log('   Ábralo en su visor de PDF e imprímalo.\n');
  console.log('⚠️  RECUERDE: Este es un borrador. Revíselo con un abogado antes de firmarlo.\n');
});

stream.on('error', (err) => {
  console.error('❌ Error generando PDF:', err);
  process.exit(1);
});

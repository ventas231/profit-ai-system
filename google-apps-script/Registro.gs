/**
 * Profit AI System · registro de correos y palomitas en la hoja.
 * Se instala DENTRO de la hoja: Extensiones › Apps Script › pega este código.
 *
 * Columnas que lee (fila 1, sin importar mayúsculas ni acentos):
 *   CORREO | DÍA Y HORA | DESCARGO LA SKILL | CHECK OUT
 * Columnas opcionales: si las agregas en la fila 1, también se llenan solas:
 *   VIO NIVELES | WHATSAPP | VIO VIDEO | PAGÓ | AGENDÓ CITA | ACCESO ENVIADO | ORIGEN
 *
 * Correo de bienvenida del Nivel 1: al llegar el evento "pago" con su número de
 * pedido, el script confirma con PayPal que el pedido está cobrado por el monto
 * correcto y manda el correo (archivo Correo.html de este mismo proyecto).
 * Sin las llaves de PayPal en Propiedades del script NO manda nada: así nadie
 * recibe los agentes solo por abrir la página de gracias.
 */
const TOKEN = 'pais-12d1daaf47289fbf';          // la misma clave que HOJA_TOKEN en config.js
const ZONA = 'America/Mexico_City';
const FORMATO = 'dd/MM/yyyy HH:mm';

// evento que manda la página → encabezado de la columna
const COLUMNAS = {
  descargo_skill: 'DESCARGO LA SKILL',
  checkout: 'CHECK OUT',
  vio_niveles: 'VIO NIVELES',
  whatsapp: 'WHATSAPP',
  vio_video: 'VIO VIDEO',
  pago: 'PAGO',
  agendo_cita: 'AGENDO CITA',
};

// ---- Correo de bienvenida del Nivel 1 ----
// Enlaces que van en los botones del correo.
const ACCESO = {
  LINK_AGENTES: '',   // descarga de los 5 agentes
  LINK_GUIA: '',      // guía de instalación
  LINK_CITA: 'https://calendly.com/cursos-summaproducts/profit-ai-system',
  WHATSAPP: 'https://wa.me/522223288421',
};
const NIVEL1 = { monto: '497.00', moneda: 'USD' };
const REMITENTE = 'Profit AI System';
// El correo sale de la cuenta que instala este script (Ejecutar como: Yo).
// Instálalo con cursos@summaproducts.com para que salga de ahí y quede en sus Enviados.
const RESPONDER_A = 'cursos@summaproducts.com';
// Llaves de PayPal: NO van aquí (este archivo es público en GitHub).
// Apps Script › Configuración del proyecto › Propiedades del script:
//   PAYPAL_CLIENT_ID, PAYPAL_SECRET y PAYPAL_MODO ("live" o "sandbox").

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents || '{}');
    if (d.token !== TOKEN) return salida({ ok: false, error: 'token' });
    const email = String(d.email || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return salida({ ok: false, error: 'correo' });

    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    const enc = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].map(normaliza);
    const col = (nombre) => enc.indexOf(normaliza(nombre)) + 1;
    const cCorreo = col('CORREO');
    if (!cCorreo) return salida({ ok: false, error: 'falta columna CORREO' });

    const ahora = Utilities.formatDate(new Date(), ZONA, FORMATO);
    let fila = buscarFila(hoja, cCorreo, email);

    if (!fila) {                       // primera vez: se crea la fila con día y hora
      fila = hoja.getLastRow() + 1;
      hoja.getRange(fila, cCorreo).setValue(email);
      if (col('DIA Y HORA')) hoja.getRange(fila, col('DIA Y HORA')).setValue(ahora);
      const origen = [d.utm_source, d.utm_campaign, d.utm_content].filter(String).join(' · ');
      if (col('ORIGEN') && origen) hoja.getRange(fila, col('ORIGEN')).setValue(origen);
    }

    if (d.accion === 'evento' && COLUMNAS[d.evento] && col(COLUMNAS[d.evento])) {
      const celda = hoja.getRange(fila, col(COLUMNAS[d.evento]));
      if (!celda.getValue()) {         // la palomita se pone una sola vez, con su fecha en la nota
        celda.setValue('✔').setNote(ahora);
      }
    }
    if (d.accion === 'evento' && d.evento === 'pago' && d.pedido) {
      const envio = enviarAcceso(email, String(d.pedido));
      if (envio === 'enviado') {
        const nota = 'Acceso enviado ' + ahora + ' · pedido ' + d.pedido;
        if (col('ACCESO ENVIADO')) hoja.getRange(fila, col('ACCESO ENVIADO')).setValue('✔').setNote(nota);
        else if (col('PAGO')) hoja.getRange(fila, col('PAGO')).setValue('✔').setNote(nota);   // sin esa columna, queda en la nota de PAGO
      }
      return salida({ ok: true, fila: fila, acceso: envio });
    }
    return salida({ ok: true, fila: fila });
  } catch (err) {
    return salida({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Confirma el pedido con PayPal y manda el correo una sola vez por pedido.
// Devuelve: enviado | ya_enviado | sin_llaves | sin_enlaces | no_cobrado | error_paypal
function enviarAcceso(email, pedido) {
  const props = PropertiesService.getScriptProperties();
  const clave = 'acceso_' + pedido;
  if (props.getProperty(clave)) return 'ya_enviado';
  if (!props.getProperty('PAYPAL_CLIENT_ID') || !props.getProperty('PAYPAL_SECRET')) return 'sin_llaves';
  if (!ACCESO.LINK_AGENTES || !ACCESO.LINK_GUIA || !ACCESO.LINK_CITA) return 'sin_enlaces';

  const orden = ordenPayPal(pedido, props);
  if (!orden) return 'error_paypal';
  const unidad = (orden.purchase_units || [])[0] || {};
  const cobro = ((unidad.payments || {}).captures || [])[0] || {};
  const monto = cobro.amount || unidad.amount || {};
  const cobrado = orden.status === 'COMPLETED' && cobro.status === 'COMPLETED'
    && monto.value === NIVEL1.monto && monto.currency_code === NIVEL1.moneda;
  if (!cobrado) return 'no_cobrado';

  const html = HtmlService.createHtmlOutputFromFile('Correo').getContent()
    .replace(/{{CORREO}}/g, email)
    .replace(/{{PEDIDO}}/g, pedido)
    .replace(/{{LINK_AGENTES}}/g, ACCESO.LINK_AGENTES)
    .replace(/{{LINK_GUIA}}/g, ACCESO.LINK_GUIA)
    .replace(/{{LINK_CITA}}/g, ACCESO.LINK_CITA)
    .replace(/{{WHATSAPP}}/g, ACCESO.WHATSAPP);
  const pagador = ((orden.payer || {}).email_address || '').toLowerCase();
  const para = pagador && pagador !== email ? email + ',' + pagador : email;
  MailApp.sendEmail({ to: para, name: REMITENTE, replyTo: RESPONDER_A, subject: 'Tu acceso a Profit AI System · Nivel 1', htmlBody: html,
    body: 'Tu acceso a Profit AI System. Descarga tus agentes: ' + ACCESO.LINK_AGENTES + ' · Guía: ' + ACCESO.LINK_GUIA + ' · Agenda tu sesión: ' + ACCESO.LINK_CITA });
  props.setProperty(clave, new Date().toISOString());
  return 'enviado';
}

function ordenPayPal(pedido, props) {
  const base = props.getProperty('PAYPAL_MODO') === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
  const auth = Utilities.base64Encode(props.getProperty('PAYPAL_CLIENT_ID') + ':' + props.getProperty('PAYPAL_SECRET'));
  const t = UrlFetchApp.fetch(base + '/v1/oauth2/token', {
    method: 'post', headers: { Authorization: 'Basic ' + auth }, payload: { grant_type: 'client_credentials' }, muteHttpExceptions: true });
  if (t.getResponseCode() !== 200) return null;
  const token = JSON.parse(t.getContentText()).access_token;
  const r = UrlFetchApp.fetch(base + '/v2/checkout/orders/' + encodeURIComponent(pedido), {
    headers: { Authorization: 'Bearer ' + token }, muteHttpExceptions: true });
  return r.getResponseCode() === 200 ? JSON.parse(r.getContentText()) : null;
}

/** Prueba del correo: en el editor elige "pruebaCorreo" y dale Ejecutar. Te llega a ti, sin pasar por PayPal. */
function pruebaCorreo() {
  const yo = Session.getActiveUser().getEmail();
  const html = HtmlService.createHtmlOutputFromFile('Correo').getContent()
    .replace(/{{CORREO}}/g, yo).replace(/{{PEDIDO}}/g, 'PRUEBA-0000')
    .replace(/{{LINK_AGENTES}}/g, ACCESO.LINK_AGENTES || '#').replace(/{{LINK_GUIA}}/g, ACCESO.LINK_GUIA || '#')
    .replace(/{{LINK_CITA}}/g, ACCESO.LINK_CITA || '#').replace(/{{WHATSAPP}}/g, ACCESO.WHATSAPP);
  MailApp.sendEmail({ to: yo, name: REMITENTE, subject: '[PRUEBA] Tu acceso a Profit AI System · Nivel 1', htmlBody: html });
  Logger.log('Correo de prueba enviado a ' + yo);
}

function buscarFila(hoja, columna, email) {
  const n = hoja.getLastRow();
  if (n < 2) return 0;
  const valores = hoja.getRange(2, columna, n - 1, 1).getValues();
  for (let i = 0; i < valores.length; i++) {
    if (String(valores[i][0]).trim().toLowerCase() === email) return i + 2;
  }
  return 0;
}

function normaliza(t) {
  return String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toUpperCase();
}

function salida(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Prueba manual: en el editor de Apps Script elige "prueba" y dale Ejecutar. */
function prueba() {
  const r = doPost({ postData: { contents: JSON.stringify({ token: TOKEN, accion: 'registro', email: 'prueba@example.com' }) } });
  Logger.log(r.getContent());
  const r2 = doPost({ postData: { contents: JSON.stringify({ token: TOKEN, accion: 'evento', evento: 'descargo_skill', email: 'prueba@example.com' }) } });
  Logger.log(r2.getContent());
}

/**
 * Profit AI System · registro de correos y palomitas en la hoja.
 * Se instala DENTRO de la hoja: Extensiones › Apps Script › pega este código.
 *
 * Columnas que lee (fila 1, sin importar mayúsculas ni acentos):
 *   CORREO | DÍA Y HORA | DESCARGO LA SKILL | CHECK OUT
 * Columnas opcionales: si las agregas en la fila 1, también se llenan solas:
 *   VIO NIVELES | WHATSAPP | VIO VIDEO | PAGÓ | ORIGEN
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
};

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
    return salida({ ok: true, fila: fila });
  } catch (err) {
    return salida({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
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

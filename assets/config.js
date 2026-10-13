/* ==================================================================
   PROFIT AI SYSTEM — CONFIGURACIÓN DEL SITIO
   Este es el archivo que se edita para cambiar precios, enlaces,
   videos, WhatsApp y conexiones. Los textos largos están en cada
   página (index.html, acceso.html, sistema.html).
   ================================================================== */
window.CONFIG = {
  // true mientras se prueba: si la hoja de Google no está conectada, el formulario
  // deja pasar a la página de acceso sin guardar el correo.
  // En producción va en false: si no se guarda el correo, la persona ve
  // un error y el correo de contacto (nunca se pierde un lead en silencio).
  MODO_PRUEBA: true,

  // ---- Contacto ----
  WHATSAPP_URL: "https://wa.me/522223288421",
  CORREO: "cursos@summaproducts.com",

  // ---- Agendar cita (Calendly) ----
  CITA_URL: "https://calendly.com/cursos-summaproducts/profit-ai-system",

  // ---- Precios ----
  // Todo en dólares (USD).
  PRECIO_N1: "US$497",
  PRECIO_N2: "US$2,444",

  // ---- Hoja de Google donde se registran los correos y las palomitas ----
  // URL de la "aplicación web" de Apps Script instalada en la hoja (ver README).
  HOJA_URL: "https://script.google.com/macros/s/AKfycbxiocHNPH0z3zHyZ8ZdFhbAc9w9jLOph80ALhabmVBC8XCBgLCW0uOo-K74aFIKok9Y/exec",
  HOJA_TOKEN: "pais-12d1daaf47289fbf",   // la misma clave que pusiste en el Apps Script

  // ---- Pago con PayPal (página pago.html) ----
  // Cuenta PayPal de Estados Unidos: se cobra en dólares.
  // Opción recomendada: botón alojado de PayPal Business (el precio vive en PayPal).
  PAYPAL_CLIENT_ID: "",            // Client ID (sandbox para pruebas, live para cobrar)
  PAYPAL_HOSTED_BUTTON_ID: "",     // Dejar vacío: el correo automático de bienvenida necesita el botón normal (con número de pedido)
  PAYPAL_MODO: "sandbox",          // "sandbox" o "live" (live solo con precio aprobado)
  N1_MONTO: "497.00",              // usado solo si no hay botón alojado
  MONEDA: "USD",

  // ---- Videos: enlace para insertar (YouTube no listado o Vimeo) ----
  VIDEO_DIAGNOSTICO_URL: "",   // Video 1 · Cómo correr tu diagnóstico
  VIDEO_PRIORIDADES_URL: "",   // Video 2 · De tus prioridades a los cambios

  // ---- Descargas del diagnóstico ----
  // Un solo .zip con la skill del diagnóstico y la guía de reportes en PDF.
  // Va en la carpeta descargas/ del sitio, por ejemplo "descargas/kit-diagnostico.zip".
  DESCARGA_SKILL_URL: ""
};

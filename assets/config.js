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
  CITA_URL: "",

  // ---- Precios ----
  // Se muestran en dólares. Equivalencia de los precios de trabajo en MXN
  // con el FIX Banxico del 9/oct/2026 (18.4163). Precio final en USD pendiente de Gerardo.
  PRECIO_N1: "US$489",
  PRECIO_N2: "US$2,444",
  PRECIO_N1_MXN: "$9,000 MXN",
  PRECIO_N2_MXN: "$45,000 MXN",

  // ---- Hoja de Google donde se registran los correos y las palomitas ----
  // URL de la "aplicación web" de Apps Script instalada en la hoja (ver README).
  HOJA_URL: "",
  HOJA_TOKEN: "pais-12d1daaf47289fbf",   // la misma clave que pusiste en el Apps Script

  // ---- Pago con PayPal (página pago.html) ----
  // Cuenta PayPal de Estados Unidos: se cobra en dólares.
  // Opción recomendada: botón alojado de PayPal Business (el precio vive en PayPal).
  PAYPAL_CLIENT_ID: "",            // Client ID (sandbox para pruebas, live para cobrar)
  PAYPAL_HOSTED_BUTTON_ID: "",     // ID del botón alojado del Nivel 1
  PAYPAL_MODO: "sandbox",          // "sandbox" o "live" (live solo con precio aprobado)
  N1_MONTO: "489.00",              // usado solo si no hay botón alojado
  MONEDA: "USD",

  // ---- Videos: enlace para insertar (YouTube no listado o Vimeo) ----
  VIDEO_DIAGNOSTICO_URL: "",   // Video 1 · Cómo correr tu diagnóstico
  VIDEO_PRIORIDADES_URL: "",   // Video 2 · De tus prioridades a los cambios

  // ---- Descargas del diagnóstico ----
  // Los archivos van en la carpeta descargas/ del sitio, por ejemplo "descargas/skill-diagnostico.zip".
  DESCARGA_SKILL_URL: "",
  GUIA_REPORTES_URL: ""
};

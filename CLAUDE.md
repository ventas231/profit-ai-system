# Cómo se trabaja este sitio (Profit AI System → gerardovilla.mx)

Claude es el editor y quien publica este sitio. El dueño no usa otro editor:
pide los cambios en el chat y Claude los hace y los publica.

## Flujo para cada cambio

1. Una rama nueva por cambio, con su pull request. Nunca editar `main` directo.
2. Antes de publicar, mandar al dueño una vista previa: capturas del sitio
   corriendo localmente con el cambio (no solo el código).
3. Publicar (fusionar el pull request a `main`) **solo** con confirmación
   explícita del dueño ("publícalo" o equivalente).
4. Después de publicar, releer `main` desde GitHub y verificar en la página en
   vivo que el cambio aparece. Si no se pudo verificar en vivo, decirlo.
5. No reescribir historial publicado (sin force push, rebase ni amend de
   commits ya subidos).

## Cómo está hecho

- HTML, CSS y JS estáticos, sin compilar. Se publica en GitHub Pages con
  `.github/workflows/publicar.yml` al fusionar a `main`.
- Precios, PayPal (cuenta de EE. UU., cobra en USD), videos, descargas y hoja:
  `assets/config.js`.
- Archivos que se descargan (skill, guía): carpeta `descargas/`.
- Registro de correos y palomitas en la hoja "CORREOS YA VENDEN EN AMAZON"
  (cuenta de cursos) vía Google Apps Script: `google-apps-script/Registro.gs`.

## Decisiones tomadas

- Entrega después del pago (acordado 2026-10-13): correo automático en cuanto
  PayPal confirma el pago, con la descarga de los 5 agentes, la guía de
  instalación y un botón de WhatsApp para agendar la sesión 1 a 1 (sin Calendly). Se arma con el Apps
  Script de la hoja. Se construye cuando existan los archivos de los 5 agentes.
  Recordárselo al dueño en cuanto los mande.

# Profit AI System · sitio web

Sitio de 3 páginas para Profit AI System by Gerardo Villa. Es estático (HTML, CSS y JS sin compilar) y se publica en GitHub Pages en gerardovilla.mx.

| Página | Archivo | Qué hace |
|---|---|---|
| Inicio | `index.html` | Pide el correo y lo guarda en la hoja de Google. Después lleva a acceso. |
| Acceso | `acceso.html` | Video 1, descarga de la skill y de la guía, lista de reportes y Video 2. |
| Sistema y niveles | `sistema.html` | Las 5 skills, los 3 niveles, la tabla comparativa, la garantía y las preguntas. El botón "Lo quiero" lleva a pago. |
| Pago | `pago.html` | Resumen del Nivel 1 y botón de PayPal. |
| Gracias | `gracias.html` | A donde regresa PayPal después del pago. |
| Aviso de privacidad | `aviso-de-privacidad.html` | Pendiente de Legal. |

## Qué archivo edito
- **Precios, WhatsApp, correo, videos, descargas, PayPal, hoja de Google:** `assets/config.js`.
- **Archivos que se descargan (skill, guía):** carpeta `descargas/`; en `config.js` se pone la ruta, por ejemplo `descargas/skill-diagnostico.zip`.
- **Textos de cada sección:** el `.html` de la página correspondiente.
- **Colores y letras:** `assets/styles.css` (los colores están arriba, en `:root`).
- **Foto de Gerardo:** reemplaza `assets/gerardo.jpg` con el mismo nombre. Mínimo 1200 px de ancho.

Con Claude Code basta con pedirlo en español, por ejemplo: "cambia el precio del nivel 1 a US$497 en config.js" o "cambia el titular de index.html".

## Publicar (GitHub Pages)
Cada cambio que se fusiona a `main` se publica solo en 1 o 2 minutos con `.github/workflows/publicar.yml`.
Configuración única: Settings › Pages › Source: **GitHub Actions**; Custom domain: `gerardovilla.mx`.
DNS en GoDaddy: 4 registros A para `@` (185.199.108.153, .109, .110, .111) y CNAME `www` → `ventas231.github.io`.

## Registro de correos y palomitas en la hoja de Google (obligatorio)
Hoja: "CORREOS YA VENDEN EN AMAZON". Columnas en la fila 1: `CORREO | DÍA Y HORA | DESCARGO LA SKILL | CHECK OUT`.
Si agregas `VIO NIVELES`, `WHATSAPP`, `VIO VIDEO`, `PAGÓ` u `ORIGEN` en la fila 1, también se llenan solas.

| Qué hace la persona | Qué se registra en la hoja |
|---|---|
| Deja su correo | Fila nueva con CORREO y DÍA Y HORA (hora de México) |
| Clic en "Descargar la skill" | ✔ en DESCARGO LA SKILL (la fecha queda en la nota de la celda) |
| Clic en "Lo quiero" | ✔ en CHECK OUT |
| Llega a los niveles / WhatsApp / video / paga | ✔ en la columna correspondiente, si existe |

### Instalarlo (10 minutos, una sola vez)
1. Abre la hoja › **Extensiones › Apps Script**. Borra lo que haya y pega `google-apps-script/Registro.gs`.
2. Cambia `TOKEN` por una clave tuya y pon **la misma** clave en `HOJA_TOKEN` de `config.js`.
3. Pruébalo: arriba elige la función `prueba` y dale **Ejecutar**. Autoriza los permisos con la cuenta dueña de la hoja. En la hoja debe aparecer `prueba@example.com` con fecha y la palomita en DESCARGO LA SKILL. Borra esa fila.
4. **Implementar › Nueva implementación › Aplicación web.** Ejecutar como: **Yo**. Quién tiene acceso: **Cualquier usuario**. Copia la URL que termina en `/exec`.
5. Pega esa URL en `HOJA_URL` de `config.js`.
6. Prueba en el sitio real con tu correo: deja el correo, descarga la skill y dale clic en "Lo quiero". Revisa que se llene la fila.

Si cambias el código del Apps Script, haz **Implementar › Administrar implementaciones › Editar › Nueva versión** para que la URL siga funcionando.

El formulario solo deja pasar a la página de acceso cuando la hoja confirma que guardó el correo. Si la hoja no responde, lo reintenta. Si vuelve a fallar, la persona ve un error y el correo de contacto. En `MODO_PRUEBA: true` deja pasar de todos modos y lo avisa en la consola.

## Antes de salir en vivo
- [ ] Skill gratis del diagnóstico (nombre exacto con Gerardo) + guía de reportes en PDF → un solo .zip en `descargas/` y `DESCARGA_SKILL_URL`.
- [ ] Los 5 agentes y la guía de instalación → `LINK_AGENTES` y `LINK_GUIA` en `Registro.gs`.
- [x] Link de Calendly → `CITA_URL` en `config.js` (botón de la página 3). El correo de bienvenida agenda por WhatsApp.
- [ ] Videos 1 y 2 → `VIDEO_DIAGNOSTICO_URL` y `VIDEO_PRIORIDADES_URL`.
- [ ] PayPal: Client ID en `config.js`; Client ID y Secret en Propiedades del script de la hoja.
- [x] Registro instalado en la hoja con cursos@ (prueba y pruebaCorreo OK, 13/10/2026). Falta llenar LINK_AGENTES y LINK_GUIA y actualizar la implementación existente (misma URL).
- [ ] Prueba completa con un correo de prueba: registro, descarga, niveles, checkout, pago y correo de bienvenida.
- [ ] Poner `MODO_PRUEBA: false`.
- [ ] Aviso de privacidad revisado por Legal.
- [ ] Mover la página de vender en Amazon a otra dirección y conectar gerardovilla.mx.

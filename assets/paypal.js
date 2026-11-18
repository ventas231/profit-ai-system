// Botón de PayPal de pago.html (Nivel 1 o Nivel 2, según ?nivel=). Lee todo de config.js y app.js.
(function () {
  var C = window.CONFIG || {};
  var box = document.getElementById("paypal-n1");
  var aviso = document.getElementById("pago-aviso");
  if (!box) return;
  var msg = function (t) { aviso.textContent = t; aviso.hidden = false; };
  var gracias = function (id) {
    if (window.ProfitAI) window.ProfitAI.palomita("pago", id);
    try { if (window.fbq && id) fbq("track", "Purchase", { value: parseFloat(C.MONTO_PAGO) || 0, currency: "USD", content_name: C.PRODUCTO_PAGO }, { eventID: id }); } catch (e) {}
    setTimeout(function () { location.href = "gracias.html?nivel=" + (C.NIVEL_PAGO || "2") + (id ? "&pedido=" + encodeURIComponent(id) : ""); }, 600);
  };
  var load = function (src, done) {
    var s = document.createElement("script"); s.src = src; s.onload = done;
    s.onerror = function () { msg("No se pudo cargar PayPal. Recarga la página o escríbenos por WhatsApp."); };
    document.head.appendChild(s);
  };

  if (!C.MONTO_PAGO) { msg("No encontramos el precio de este nivel. Escríbenos por WhatsApp."); return; }
  if (!C.PAYPAL_CLIENT_ID) { msg("El pago estará disponible muy pronto. Escríbenos por WhatsApp para apartar tu lugar."); return; }
  if (C.MODO_PRUEBA && C.PAYPAL_MODO === "live") { msg("Pago en vivo bloqueado mientras el sitio esté en modo prueba."); return; }

  if (C.PAYPAL_HOSTED_BUTTON_ID) {
    load("https://www.paypal.com/sdk/js?client-id=" + encodeURIComponent(C.PAYPAL_CLIENT_ID) + "&components=hosted-buttons&disable-funding=venmo&currency=" + C.MONEDA, function () {
      paypal.HostedButtons({ hostedButtonId: C.PAYPAL_HOSTED_BUTTON_ID }).render("#paypal-n1");
    });
    return;
  }
  load("https://www.paypal.com/sdk/js?client-id=" + encodeURIComponent(C.PAYPAL_CLIENT_ID) + "&currency=" + C.MONEDA + "&intent=capture&components=buttons", function () {
    paypal.Buttons({
      style: { layout: "vertical", color: "gold", shape: "rect", label: "pay" },
      createOrder: function (d, actions) {
        return actions.order.create({ purchase_units: [{ description: C.PRODUCTO_PAGO || "Profit AI System", custom_id: (window.ProfitAI && ProfitAI.correo()) || "", amount: { currency_code: C.MONEDA, value: C.MONTO_PAGO } }] });
      },
      onApprove: function (d, actions) { return actions.order.capture().then(function (o) { gracias(o && o.id); }); },
      onError: function () { msg("El pago no se completó y no se hizo ningún cargo. Intenta de nuevo o escríbenos por WhatsApp."); }
    }).render("#paypal-n1");
  });
})();

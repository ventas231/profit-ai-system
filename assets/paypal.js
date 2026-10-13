// Botón de PayPal del Nivel 1 (pago.html). Lee todo de config.js.
(function () {
  var C = window.CONFIG || {};
  var box = document.getElementById("paypal-n1");
  var aviso = document.getElementById("pago-aviso");
  if (!box) return;
  var msg = function (t) { aviso.textContent = t; aviso.hidden = false; };
  var gracias = function (id) {
    if (window.ProfitAI) window.ProfitAI.palomita("pago", id);
    setTimeout(function () { location.href = "gracias.html" + (id ? "?pedido=" + encodeURIComponent(id) : ""); }, 600);
  };
  var load = function (src, done) {
    var s = document.createElement("script"); s.src = src; s.onload = done;
    s.onerror = function () { msg("No se pudo cargar PayPal. Recarga la página o escríbenos por WhatsApp."); };
    document.head.appendChild(s);
  };

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
        return actions.order.create({ purchase_units: [{ description: "Profit AI System · Nivel 1", amount: { currency_code: C.MONEDA, value: C.N1_MONTO } }] });
      },
      onApprove: function (d, actions) { return actions.order.capture().then(function (o) { gracias(o && o.id); }); },
      onError: function () { msg("El pago no se completó y no se hizo ningún cargo. Intenta de nuevo o escríbenos por WhatsApp."); }
    }).render("#paypal-n1");
  });
})();

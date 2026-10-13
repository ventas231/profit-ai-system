(function () {
  var C = window.CONFIG || {};
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var ls = {
    get: function (k) { try { return localStorage.getItem("pais_" + k) || ""; } catch (e) { return ""; } },
    set: function (k, v) { try { localStorage.setItem("pais_" + k, v); } catch (e) {} }
  };
  var correo = function () { return ls.get("correo"); };
  var pagina = document.body.dataset.pagina || "";

  // ---- UTM de la primera visita ----
  try {
    var q = new URLSearchParams(location.search);
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "fbclid"].forEach(function (k) { if (q.get(k)) ls.set(k, q.get(k)); });
  } catch (e) {}

  // ---- Textos y enlaces desde config.js ----
  $$("[data-cfg]").forEach(function (el) { var v = C[el.dataset.cfg]; if (v) el.textContent = v; });
  $$("[data-href]").forEach(function (el) {
    var k = el.dataset.href;
    var v = k === "CORREO_MAILTO" ? "mailto:" + C.CORREO : C[k];
    if (v) {
      el.href = v;
      if (/^https?:/.test(v)) { el.target = "_blank"; el.rel = "noopener"; }
      else if (/^descargas\//.test(v)) el.setAttribute("download", v.split("/").pop());
    }
    else { el.addEventListener("click", function (e) { e.preventDefault(); }); el.setAttribute("aria-disabled", "true"); el.title = "Disponible muy pronto"; }
  });

  // ---- Registro en la hoja de Google (CORREOS YA VENDEN EN AMAZON) ----
  // Devuelve una promesa que se cumple solo si la hoja confirmó { ok: true }.
  function hoja(accion, email, evento, pedido) {
    if (!C.HOJA_URL) return Promise.reject(new Error("HOJA_URL vacía"));
    var payload = JSON.stringify({
      token: C.HOJA_TOKEN, accion: accion, email: email, evento: evento || "", pedido: pedido || "",
      pagina: pagina, utm_source: ls.get("utm_source"), utm_campaign: ls.get("utm_campaign"), utm_content: ls.get("utm_content")
    });
    return fetch(C.HOJA_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: payload, keepalive: true })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j || !j.ok) throw new Error((j && j.error) || "sin ok"); return j; });
  }
  // Palomita: se intenta dos veces; no detiene la navegación.
  // "pedido" solo viaja con el evento de pago: con él la hoja confirma el cobro en PayPal y manda el correo de bienvenida.
  function palomita(evento, pedido) {
    var email = correo();
    if (!email) return;
    hoja("evento", email, evento, pedido).catch(function () { setTimeout(function () { hoja("evento", email, evento, pedido).catch(function () {}); }, 1500); });
  }
  window.ProfitAI = { palomita: palomita, correo: correo };

  // ---- Pago: muestra a qué correo le llega su acceso ----
  var destino = document.getElementById("correo-destino");
  if (destino && correo()) destino.textContent = "a " + correo() + ", el correo que pusiste al registrarte";

  // ---- Eventos de cada página ----
  if (pagina === "sistema") {
    var niveles = document.getElementById("niveles");
    if (niveles && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { palomita("vio_niveles"); io.disconnect(); } }, { threshold: 0.2 });
      io.observe(niveles);
    }
  }
  $$("[data-evento]").forEach(function (el) { el.addEventListener("click", function () { palomita(el.dataset.evento); }); });
  $$('[data-href="WHATSAPP_URL"]').forEach(function (el) { el.addEventListener("click", function () { palomita("whatsapp"); }); });

  // ---- Videos ----
  $$("[data-video]").forEach(function (v) {
    var url = C[v.dataset.video];
    if (!url) return;
    v.innerHTML = '<iframe src="' + encodeURI(url) + '" style="width:100%;height:100%;border:0;border-radius:inherit" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="' + (v.getAttribute("aria-label") || "Video") + '"></iframe>';
    v.style.padding = "0";
    if (v.dataset.eventoVideo) {
      window.addEventListener("blur", function marca() {
        if (document.activeElement && document.activeElement.tagName === "IFRAME") { palomita(v.dataset.eventoVideo); window.removeEventListener("blur", marca); }
      });
    }
  });

  // ---- Formulario de correo: se guarda en la hoja (obligatorio) ----
  $$("[data-capture]").forEach(function (f) {
    var aviso = document.createElement("p");
    aviso.className = "ok"; aviso.hidden = true; aviso.setAttribute("role", "status");
    f.appendChild(aviso);
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = f.querySelector("input[type=email]").value.trim().toLowerCase();
      var btn = f.querySelector("button");
      var texto = btn.textContent;
      btn.disabled = true; btn.textContent = "Guardando…";
      var irAcceso = function () { ls.set("correo", email); location.href = "acceso.html"; };
      var error = function () {
        btn.disabled = false; btn.textContent = texto;
        aviso.textContent = "No pudimos registrar tu correo. Revisa tu conexión e intenta de nuevo, o escríbenos a " + C.CORREO + ".";
        aviso.hidden = false;
      };
      // La hoja es obligatoria: un intento y un reintento.
      var registro = hoja("registro", email).catch(function () {
        return new Promise(function (ok) { setTimeout(ok, 1200); }).then(function () { return hoja("registro", email); });
      });
      registro.then(irAcceso).catch(function () {
        if (C.MODO_PRUEBA) { console.warn("[Profit AI] La hoja no respondió (modo prueba): el correo NO se guardó."); irAcceso(); }
        else error();
      });
    });
  });
})();

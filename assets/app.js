(function () {
  var C = window.CONFIG || {};
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var ls = {
    get: function (k) { try { return localStorage.getItem("pais_" + k) || ""; } catch (e) { return ""; } },
    set: function (k, v) { try { localStorage.setItem("pais_" + k, v); } catch (e) {} }
  };
  var correo = function () { return ls.get("correo"); };
  var pagina = document.body.dataset.pagina || "";
  // ---- Promocion del Nivel 1 (config.js, PROMO_N1): solo entre inicio y fin ----
  var P = C.PROMO_N1, ahoraMs = Date.now();
  var promo = !!(P && P.monto && ahoraMs >= Date.parse(P.inicio) && ahoraMs < Date.parse(P.fin));
  var precioLista = C.PRECIO_N1;
  if (promo) { C.PRECIO_N1 = P.precio; C.N1_MONTO = P.monto; }   // paypal.js lee N1_MONTO despues de este archivo
  var valorN1 = parseFloat(C.N1_MONTO) || 497;
  // Meta Pixel: eventos de conversión (si el píxel cargó)
  // La copia de servidor la hace "API de conversiones con Meta" y Meta ya la deduplica (100% con identificador de evento).
  var meta = function (ev, datos, opciones) { try { if (window.fbq) fbq("track", ev, datos || {}, opciones || {}); } catch (e) {} };
  if (pagina === "sistema") meta("ViewContent", { content_name: "Niveles Profit AI System" });
  if (pagina === "pago") meta("InitiateCheckout", { value: valorN1, currency: "USD", content_name: "Profit AI System Nivel 1" });
  if (pagina === "gracias") { var ped = new URLSearchParams(location.search).get("pedido"); if (ped) meta("Purchase", { value: valorN1, currency: "USD", content_name: "Profit AI System Nivel 1" }, { eventID: ped }); }

  // Lead una sola vez por correo en este navegador (corrección 2026-11-09, pendiente #135):
  // si la persona vuelve a meter el mismo correo, la hoja no crea fila nueva y Meta tampoco debe contar otro Lead.
  // Quien se registró antes de este cambio ya tiene su correo guardado: ese Lead ya se mandó.
  var leadYaEnviado = function (email) { return correo() === email || ("|" + ls.get("leads") + "|").indexOf("|" + email + "|") >= 0; };
  var marcarLead = function (email) { var l = ls.get("leads"); ls.set("leads", l ? l + "|" + email : email); };

  // ChatGPT Ads: "lead_created" solo cuando la hoja confirmó que guardó el correo y solo para registros nuevos.
  // Si la hoja dice nuevo:false (el correo ya existía), no se manda. Si no lo dice, se evita repetir por navegador.
  // oai() devuelve true solo si el píxel existe y la llamada no lanzó error (antes las excepciones se ocultaban y se marcaba igual).
  var oai = function () { try { if (!window.oaiq) return false; window.oaiq.apply(window, arguments); return true; } catch (e) { return false; } };
  var oaiYaEnviado = function (email) { return ("|" + ls.get("oai_leads") + "|").indexOf("|" + email + "|") >= 0; };
  var oaiMarcar = function (email) { var l = ls.get("oai_leads"); ls.set("oai_leads", l ? l + "|" + email : email); };
  // Espera la solicitud a openai.com que trae "lead_created" (la anota el vigía del <head>), iniciada después de "desde".
  // Ignora cualquier otra solicitud a OpenAI (sdk_init, diagnostic...). listo(e): e = { via, t, estado } o null si no la vio en "limite" ms.
  var esperarLeadOAI = function (desde, limite, listo) {
    var hecho = false;
    var buscar = function () { var l = window.__oaiEnvios || []; for (var i = 0; i < l.length; i++) if (l[i].t >= desde) return l[i]; return null; };
    var fin = function (e) { if (hecho) return; hecho = true; window.removeEventListener("oai-lead-solicitud", ver); listo(e); };
    var ver = function () { var e = buscar(); if (e) setTimeout(function () { fin(e); }, 150); };   // un respiro para que la solicitud quede en camino
    window.addEventListener("oai-lead-solicitud", ver);
    ver();
    setTimeout(function () { fin(buscar()); }, limite);
  };
  // Parámetros de atribución que viajan al siguiente paso (UTM, oppref de ChatGPT, fbclid, gclid).
  var ATRIB = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "oppref", "fbclid", "gclid"];
  var conAtribucion = function (destino) {
    try {
      var q = new URLSearchParams(location.search), out = new URLSearchParams();
      ATRIB.forEach(function (k) { if (q.get(k)) out.set(k, q.get(k)); });
      var t = out.toString();
      return t ? destino + (destino.indexOf("?") < 0 ? "?" : "&") + t : destino;
    } catch (e) { return destino; }
  };

  // ---- UTM de la primera visita ----
  try {
    var q = new URLSearchParams(location.search);
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "fbclid", "oppref"].forEach(function (k) { if (q.get(k)) ls.set(k, q.get(k)); });
  } catch (e) {}

  // ---- Textos y enlaces desde config.js ----
  $$("[data-cfg]").forEach(function (el) { var v = C[el.dataset.cfg]; if (v) el.textContent = v; });
  if (promo) {
    var cuentas = [];
    $$('[data-cfg="PRECIO_N1"]').forEach(function (el) {
      var tag = document.createElement("span"); tag.className = "promo-precio";
      tag.innerHTML = '<b class="promo-pill">\ud83d\udd25 ' + P.nombre + ' \u00b7 -' + P.descuento + '</b> <s>' + precioLista + '</s>';
      el.parentNode.insertBefore(tag, el);
      var c = document.createElement("span"); c.className = "promo-cuenta";
      c.innerHTML = (P.cierre || "Termina pronto") + ' \u00b7 quedan <b></b>';
      el.parentNode.insertBefore(c, el.nextSibling);
      cuentas.push(c.querySelector("b"));
    });
    // Sticker en la tarjeta del Nivel 1 (y en la caja de pago)
    $$(".pack.hl, .pago-promo").forEach(function (box) {
      var st = document.createElement("div"); st.className = "promo-sticker"; st.setAttribute("aria-hidden", "true");
      st.innerHTML = P.logo ? '<img src="' + encodeURI(P.logo) + '" alt="">' : '<span>Buen<br>Fin</span><b>-' + P.descuento + '</b>';
      box.appendChild(st);
    });
    var finMs = Date.parse(P.fin), dos = function (n) { return (n < 10 ? "0" : "") + n; };
    var tic = function () {
      var r = Math.max(0, Math.floor((finMs - Date.now()) / 1000));
      var t = Math.floor(r / 86400) + "d " + dos(Math.floor(r % 86400 / 3600)) + "h " + dos(Math.floor(r % 3600 / 60)) + "m " + dos(r % 60) + "s";
      cuentas.forEach(function (b) { b.textContent = t; });
      if (r === 0) location.reload();   // al terminar, la página vuelve al precio normal
    };
    tic(); setInterval(tic, 1000);
  }
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

  // ---- Cada visita cuenta: si ya dejó su correo antes, se registra cada vez que regresa (una vez por visita) ----
  var ss = {
    get: function (k) { try { return sessionStorage.getItem("pais_" + k) || ""; } catch (e) { return ""; } },
    set: function (k, v) { try { sessionStorage.setItem("pais_" + k, v); } catch (e) {} }
  };
  if (correo() && !ss.get("visita")) { ss.set("visita", "1"); hoja("visita", correo()).catch(function () {}); }

  // ---- Pago: muestra a qué correo le llega su acceso ----
  var destino = document.getElementById("correo-destino");
  if (destino && correo()) {
    var nota = destino.closest(".kit-nota");
    destino.textContent = nota ? "a " + correo() : "a " + correo() + ", el correo que pusiste al registrarte";
    if (nota) nota.hidden = false;
  }

  // ---- Eventos de cada página ----
  if (pagina === "sistema") {
    var niveles = document.getElementById("niveles");
    if (niveles && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { palomita("vio_niveles"); io.disconnect(); } }, { threshold: 0.2 });
      io.observe(niveles);
    }
  }
  $$("[data-evento]").forEach(function (el) { el.addEventListener("click", function () { palomita(el.dataset.evento); }); });
  // Después de descargar, lleva al siguiente paso (deja que la descarga arranque primero).
  $$("[data-siguiente]").forEach(function (el) {
    el.addEventListener("click", function () {
      if (el.getAttribute("aria-disabled") === "true") return;
      setTimeout(function () { location.href = el.dataset.siguiente; }, 1500);
    });
  });
  // Al descargar el kit, baja al video y lo reproduce (la descarga sigue sola).
  $$("[data-ir-video]").forEach(function (el) {
    el.addEventListener("click", function () {
      if (el.getAttribute("aria-disabled") === "true") return;
      setTimeout(function () {
        var destino = document.querySelector(el.dataset.irVideo);
        if (destino) destino.scrollIntoView({ behavior: "smooth", block: "start" });
        var vid = document.querySelector(".video video");
        if (vid) { vid.muted = false; vid.play().catch(function () { vid.muted = true; vid.play().catch(function () {}); }); }
      }, 600);
    });
  });
  $$('[data-href="WHATSAPP_URL"]').forEach(function (el) { el.addEventListener("click", function () { palomita("whatsapp"); }); });

  // ---- Videos ----
  $$("[data-video]").forEach(function (v) {
    var url = C[v.dataset.video];
    if (!url) return;
    if (/\.mp4$/i.test(url)) {   // video propio: arranca solo y con sonido (voz de Gerardo)
      v.innerHTML = '<video src="' + encodeURI(url) + '" poster="' + encodeURI(url.replace(/\.mp4$/i, ".jpg")) + '" autoplay playsinline controls preload="auto" style="width:100%;height:100%;border-radius:inherit;background:#000" aria-label="' + (v.getAttribute("aria-label") || "Video") + '"></video>' +
        '<button type="button" class="sonido" hidden>🔊 Activar sonido</button>';
      v.style.padding = "0";
      var vid = v.querySelector("video"), btnSon = v.querySelector(".sonido");
      var conSonido = function () { vid.muted = false; vid.volume = 1; btnSon.hidden = true; vid.play().catch(function () {}); quitar(); };
      var quitar = function () { ["pointerdown", "keydown", "touchstart"].forEach(function (t) { document.removeEventListener(t, conSonido, true); }); };
      btnSon.addEventListener("click", function (e) { e.stopPropagation(); conSonido(); });
      vid.muted = false;
      vid.play().catch(function () {
        // El navegador no deja arrancar con sonido sin un toque: arranca sin sonido y el primer toque en la página lo activa.
        vid.muted = true; btnSon.hidden = false;
        vid.play().catch(function () {});
        ["pointerdown", "keydown", "touchstart"].forEach(function (t) { document.addEventListener(t, conSonido, true); });
      });
      vid.addEventListener("volumechange", function () { if (!vid.muted) btnSon.hidden = true; });
      return;
    }
    if (/youtube|youtu\.be|vimeo/.test(url) && !/autoplay=/.test(url)) url += (url.indexOf("?") < 0 ? "?" : "&") + "autoplay=1";   // que arranque solo
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
    var enviando = false;   // evita dobles envíos (doble clic o Enter repetido)
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (enviando) return;
      enviando = true;
      var email = f.querySelector("input[type=email]").value.trim().toLowerCase();
      var btn = f.querySelector("button");
      var texto = btn.textContent;
      btn.disabled = true; btn.textContent = "Guardando…";
      var irAcceso = function (respuesta) {   // respuesta = lo que confirmó la hoja; vacío si no se guardó (modo prueba)
        if (!leadYaEnviado(email)) { meta("Lead", { content_name: "Kit de diagnóstico" }); marcarLead(email); }
        ls.set("correo", email); ss.set("visita", "1");
        var ir = function () { location.href = conAtribucion("sistema.html"); };
        // lead_created: solo si la hoja confirmó el guardado, el correo no existía y este navegador no lo midió ya.
        if (!(respuesta && respuesta.ok && respuesta.nuevo !== false && !oaiYaEnviado(email))) { ir(); return; }
        var desde = Date.now();
        if (!oai("measure", "lead_created", { type: "customer_action" })) { ir(); return; }   // el píxel falló: no se marca como medido
        oaiMarcar(email);   // la llamada se ejecutó sin error; la marca evita repetirla en este navegador
        // No cambiar de página hasta ver salir la solicitud que trae lead_created (máx. 4 s).
        esperarLeadOAI(desde, 4000, function () { ir(); });
      };   // mientras no esté el video VSL va directo a los niveles; con el video, regresar a "acceso.html"
      var error = function () {
        enviando = false;
        btn.disabled = false; btn.textContent = texto;
        aviso.textContent = "No pudimos registrar tu correo. Revisa tu conexión e intenta de nuevo, o escríbenos a " + C.CORREO + ".";
        aviso.hidden = false;
      };
      // La hoja es obligatoria: un intento y un reintento.
      var registro = hoja("registro", email).catch(function () {
        return new Promise(function (ok) { setTimeout(ok, 1200); }).then(function () { return hoja("registro", email); });
      });
      registro.then(irAcceso).catch(function () {
        if (C.MODO_PRUEBA) { console.warn("[Profit AI] La hoja no respondió (modo prueba): el correo NO se guardó."); irAcceso(null); }
        else error();
      });
    });
  });
})();

/* =========================================================
   PETUNIA · REFUGIO DE LAGO — main.js
   Vanilla JS, IIFE pattern, no build step, no modules.
   ========================================================= */
(function () {
  "use strict";

  var WA_NUMBER = "5492944138283";

  var WA_DEFAULT_MSG = {
    es: "Hola! Quiero consultar disponibilidad en Petunia Refugio de Lago.",
    en: "Hi! I'd like to ask about availability at Petunia Refugio de Lago."
  };

  function safe(fn, name) {
    try { fn(); }
    catch (e) { console.warn("[petunia] init failed:", name, e); }
  }

  function waUrl(message) {
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(message);
  }

  function getLang() {
    try {
      var stored = localStorage.getItem("petunia_lang");
      if (stored === "es" || stored === "en") return stored;
    } catch (e) {}
    return "es";
  }

  function setLang(lang) {
    document.documentElement.setAttribute("lang", lang === "en" ? "en" : "es");

    var esNodes = document.querySelectorAll("[data-lang='es']");
    var enNodes = document.querySelectorAll("[data-lang='en']");
    for (var i = 0; i < esNodes.length; i++) { esNodes[i].hidden = (lang === "en"); }
    for (var j = 0; j < enNodes.length; j++) { enNodes[j].hidden = (lang !== "en"); }

    var toggles = document.querySelectorAll(".lang-toggle button");
    for (var k = 0; k < toggles.length; k++) {
      var btn = toggles[k];
      btn.classList.toggle("active", btn.getAttribute("data-set-lang") === lang);
    }

    // bilingual alt text on images that opted in
    var imgs = document.querySelectorAll("img[data-alt-es]");
    for (var m = 0; m < imgs.length; m++) {
      var img = imgs[m];
      var altKey = lang === "en" ? "data-alt-en" : "data-alt-es";
      var val = img.getAttribute(altKey);
      if (val) img.alt = val;
    }

    // whatsapp CTAs pick up the right default message
    var waLinks = document.querySelectorAll("[data-wa-cta]");
    for (var n = 0; n < waLinks.length; n++) {
      waLinks[n].setAttribute("href", waUrl(WA_DEFAULT_MSG[lang] || WA_DEFAULT_MSG.es));
    }

    try { localStorage.setItem("petunia_lang", lang); } catch (e) {}
  }

  function initLangToggle() {
    var lang = getLang();
    setLang(lang);
    var buttons = document.querySelectorAll("[data-set-lang]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function () {
        setLang(this.getAttribute("data-set-lang"));
      });
    }
  }

  function initHeaderScroll() {
    var header = document.getElementById("siteHeader");
    if (!header) return;
    function onScroll() {
      header.classList.toggle("scrolled", window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initMobileNav() {
    var toggle = document.getElementById("navToggle");
    var closeBtn = document.getElementById("mobileNavClose");
    var nav = document.getElementById("mobileNav");
    if (!toggle || !nav) return;

    function open() {
      nav.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }
    function close() {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
    toggle.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);

    var links = nav.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", close);
    }
  }

  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      for (var i = 0; i < items.length; i++) items[i].classList.add("is-visible");
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -40px 0px" });

    for (var j = 0; j < items.length; j++) observer.observe(items[j]);

    // safety net: nothing stays invisible for more than 6s
    setTimeout(function () {
      var remaining = document.querySelectorAll(".reveal:not(.is-visible)");
      for (var k = 0; k < remaining.length; k++) remaining[k].classList.add("is-visible");
    }, 6000);
  }

  function formatDateForMsg(iso, lang) {
    if (!iso) return "";
    var parts = iso.split("-");
    if (parts.length !== 3) return iso;
    var y = parts[0], m = parts[1], d = parts[2];
    return lang === "en" ? (m + "/" + d + "/" + y) : (d + "/" + m + "/" + y);
  }

  function initContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;
    if (form.getAttribute("data-bound") === "true") return; // idempotent
    form.setAttribute("data-bound", "true");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var lang = document.documentElement.getAttribute("lang") === "en" ? "en" : "es";
      var v = function (id) {
        var el = document.getElementById(id);
        return el && el.value ? el.value.trim() : "";
      };
      var nombre = v("fName");
      var wa = v("fWa");
      var email = v("fEmail");
      var tipo = v("fTipo");
      var checkin = formatDateForMsg(v("fCheckin"), lang);
      var checkout = formatDateForMsg(v("fCheckout"), lang);
      var fechas = checkin && checkout ? (checkin + " - " + checkout)
                 : checkin ? checkin
                 : checkout ? checkout
                 : "";
      var mensaje = v("fMsg");

      var lines = lang === "en"
        ? [
            "Hi! I'd like to book at Petunia Refugio de Lago.",
            nombre ? "Name: " + nombre : "",
            tipo ? "Type of stay: " + tipo : "",
            fechas ? "Dates: " + fechas : "",
            email ? "Email: " + email : "",
            wa ? "Contact phone: " + wa : "",
            mensaje ? "Message: " + mensaje : ""
          ]
        : [
            "Hola! Quiero reservar en Petunia Refugio de Lago.",
            nombre ? "Nombre: " + nombre : "",
            tipo ? "Tipo de alojamiento: " + tipo : "",
            fechas ? "Fechas: " + fechas : "",
            email ? "Email: " + email : "",
            wa ? "Teléfono de contacto: " + wa : "",
            mensaje ? "Mensaje: " + mensaje : ""
          ];

      var text = lines.filter(Boolean).join("\n");
      window.open(waUrl(text), "_blank", "noopener");
    });
  }

  function initStatCounters() {
    var nums = document.querySelectorAll(".stat-num");
    if (!nums.length) return;

    function animate(el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      if (isNaN(target)) return;
      var prefix = el.hasAttribute("data-prefix") ? el.getAttribute("data-prefix") : "+";
      var duration = 1400;
      var start = null;

      function ease(t) { return 1 - Math.pow(1 - t, 3); }

      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var value = Math.round(ease(progress) * target);
        el.textContent = prefix + value;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = prefix + target;
        }
      }
      requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      for (var i = 0; i < nums.length; i++) animate(nums[i]);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    for (var j = 0; j < nums.length; j++) observer.observe(nums[j]);

    // safety net: if the strip never intersects (rare), still show final numbers after 6s
    setTimeout(function () {
      var remaining = document.querySelectorAll(".stat-num[data-count]");
      for (var k = 0; k < remaining.length; k++) {
        var el = remaining[k];
        if (el.textContent === "0") {
          var prefix = el.hasAttribute("data-prefix") ? el.getAttribute("data-prefix") : "+";
          el.textContent = prefix + el.getAttribute("data-count");
        }
      }
    }, 6000);
  }

  function initBgVideos() {
    var videos = document.querySelectorAll("#heroVideo, #puertoVideo");
    if (!videos.length) return;

    var reduced = false;
    try {
      reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {}

    for (var i = 0; i < videos.length; i++) {
      var video = videos[i];
      if (reduced) {
        video.removeAttribute("autoplay");
        video.pause();
        continue;
      }
      // some mobile browsers need an explicit play() call even with autoplay set
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () { /* autoplay blocked; poster stays visible */ });
      }
    }
  }

  function initFooterYear() {
    var el = document.getElementById("footerYear");
    if (!el) return;
    var y = new Date().getFullYear();
    if (y && y > 2020) el.textContent = String(y);
  }

  document.addEventListener("DOMContentLoaded", function () {
    safe(initLangToggle, "initLangToggle");
    safe(initHeaderScroll, "initHeaderScroll");
    safe(initMobileNav, "initMobileNav");
    safe(initReveal, "initReveal");
    safe(initContactForm, "initContactForm");
    safe(initFooterYear, "initFooterYear");
    safe(initStatCounters, "initStatCounters");
    safe(initBgVideos, "initBgVideos");
  });
})();

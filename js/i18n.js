/* Language switcher — PHASE 1: machine translation via Google's website translator.
   - Vietnamese is the source language; nothing extra loads for VI visitors.
   - Picking EN / 日本語 sets the "googtrans" cookie (/vi/<code>) and reloads; on
     load, if a non-VI language is active, Google's translate script is injected
     and translates the page (including content rendered later by JS).
   - Mark text that must stay untranslated with translate="no" + class "notranslate".
   PHASE 2: replace the body of setLang()/loadTranslator() with real i18n
   (lang/*.json + per-language URLs); the switcher UI can stay as is.
   Note: cookies don't work on file:// pages — test over http(s) (e.g. GitHub Pages). */
(function () {
  var HM = window.HM;
  var LANGS = HM.site.languages;
  var SOURCE = "vi";
  // Shown under the switcher while a machine translation is active (kept untranslated)
  var NOTE = { en: "Machine translated", ja: "機械翻訳" };

  function readCookieLang() {
    var m = document.cookie.match(/(?:^|;\s*)googtrans=\/[a-z-]+\/([a-zA-Z-]+)/);
    return m ? m[1] : null;
  }
  function current() {
    var c = readCookieLang();
    for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === c) return c;
    return SOURCE;
  }

  function writeCookie(value, maxAge) {
    var base = "googtrans=" + value + "; path=/; max-age=" + maxAge + "; SameSite=Lax";
    document.cookie = base;
    // Google may also read/write the cookie on the parent domain; keep both in sync.
    var host = location.hostname;
    if (host && host.indexOf(".") > -1) document.cookie = base + "; domain=." + host;
  }

  function setLang(code) {
    if (code === current()) return;
    if (code === SOURCE) writeCookie("", 0);
    else writeCookie("/" + SOURCE + "/" + code, 60 * 60 * 24 * 365);
    location.reload();
  }

  function loadTranslator(code) {
    var box = document.createElement("div");
    box.id = "google_translate_element";
    box.setAttribute("aria-hidden", "true");
    document.body.appendChild(box);
    window.googleTranslateElementInit = function () {
      /* global google */
      new google.translate.TranslateElement({
        pageLanguage: SOURCE,
        includedLanguages: LANGS.map(function (l) { return l.code; }).filter(function (c) { return c !== SOURCE; }).join(","),
        autoDisplay: false
      }, "google_translate_element");
    };
    var s = document.createElement("script");
    s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    s.onerror = function () { document.documentElement.classList.remove("is-translating"); };
    document.head.appendChild(s);
    document.documentElement.classList.add("is-translating");
    document.documentElement.setAttribute("data-lang", code);
  }

  // ---------- Switcher UI (header) ----------
  var cur = current();
  var curLang = LANGS.filter(function (l) { return l.code === cur; })[0];
  var globe = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9s1.3-6.3 3.8-9z"/></svg>';

  var html =
    '<div class="lang notranslate" translate="no">' +
      '<button class="lang__toggle" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="lang-menu" aria-label="Ngôn ngữ: ' + curLang.name + '">' +
        globe + '<span class="lang__current">' + curLang.label + "</span>" +
      "</button>" +
      '<ul class="lang__menu" id="lang-menu" hidden>' +
        LANGS.map(function (l) {
          return '<li><button type="button" lang="' + l.code + '" data-lang="' + l.code + '"' +
            (l.code === cur ? ' aria-current="true"' : "") + ">" +
            "<span>" + l.label + "</span><small>" + l.name + "</small></button></li>";
        }).join("") +
      "</ul>" +
      (NOTE[cur] ? '<p class="lang__note">' + NOTE[cur] + "</p>" : "") +
    "</div>";

  var actions = document.querySelector(".header__actions");
  if (actions) {
    var search = document.getElementById("search-toggle");
    search.insertAdjacentHTML("beforebegin", html);
    var root = actions.querySelector(".lang");
    var btn = root.querySelector(".lang__toggle");
    var menu = root.querySelector(".lang__menu");
    var open = function (v) { menu.hidden = !v; btn.setAttribute("aria-expanded", String(v)); };
    btn.addEventListener("click", function (e) { e.stopPropagation(); open(menu.hidden); });
    menu.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-lang]");
      if (b) setLang(b.getAttribute("data-lang"));
    });
    document.addEventListener("click", function (e) { if (!e.target.closest(".lang")) open(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) { open(false); btn.focus(); } });
  }

  if (cur !== SOURCE) loadTranslator(cur);
})();

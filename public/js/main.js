/* Site-wide behaviour: menus, search panel, scroll strips, form validation. */
(function () {
  var HM = window.HM;

  // ---------- Mega menu / dropdowns ----------
  var items = Array.prototype.slice.call(document.querySelectorAll(".nav__item"));
  var desktop = window.matchMedia("(min-width: 1101px)");

  function closeAll(except) {
    items.forEach(function (it) {
      if (it === except) return;
      it.classList.remove("is-open");
      var b = it.querySelector("button.nav__link, .nav__sub-toggle");
      if (b) b.setAttribute("aria-expanded", "false");
    });
  }
  items.forEach(function (it) {
    var btn = it.querySelector("button.nav__link, .nav__sub-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var open = !it.classList.contains("is-open");
      closeAll(it);
      it.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
    // hover-intent on desktop
    var t;
    it.addEventListener("mouseenter", function () {
      if (!desktop.matches) return;
      clearTimeout(t);
      closeAll(it); it.classList.add("is-open"); btn.setAttribute("aria-expanded", "true");
    });
    it.addEventListener("mouseleave", function () {
      if (!desktop.matches) return;
      t = setTimeout(function () { it.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); }, 150);
    });
  });
  document.addEventListener("click", function (e) { if (!e.target.closest(".nav__item")) closeAll(); });

  // ---------- Mobile nav ----------
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
      document.body.style.overflow = open ? "hidden" : "";
    });
  }

  // ---------- Home: transparent header over the hero, solid once scrolled ----------
  var overlay = document.querySelector(".site-header--overlay");
  if (overlay) {
    var onScroll = function () { overlay.classList.toggle("is-solid", window.scrollY > 40); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // ---------- Floating contact button ----------
  var fab = document.getElementById("fab");
  var fabBtn = fab && fab.querySelector(".fab__toggle");
  var fabMenu = document.getElementById("fab-menu");
  function setFab(open) {
    fab.classList.toggle("is-open", open);
    fabMenu.hidden = !open;
    fabBtn.setAttribute("aria-expanded", String(open));
  }
  if (fab) {
    fabBtn.addEventListener("click", function () { setFab(fabMenu.hidden); });
    document.addEventListener("click", function (e) { if (!fabMenu.hidden && !e.target.closest("#fab")) setFab(false); });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (fab && !fabMenu.hidden) { setFab(false); fabBtn.focus(); }
    closeAll();
  });

  // ---------- Scroll reveal ----------
  // [data-reveal] fades/slides in when it enters the viewport; children of [data-reveal-stagger]
  // come in one after another. Besides the hand-tagged blocks, common blocks on every page are
  // tagged automatically — after DOMContentLoaded so content rendered by page scripts is included,
  // and only below the first screen so nothing visible on load flickers.
  var AUTO_SINGLE = ".section-head, .page-head, .split__text, .split__media, .collection, .concept, .form-card, .download, .policy, .two-col, .lc-block, .showroom-strip";
  var AUTO_STAGGER = ".product-grid, .news-grid, .benefits, .facts, .quick-links, .values, .concept__list, .palette, .spec-block";
  function setupReveal() {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var fold = window.innerHeight * 0.9;
    var below = function (el) { var r = el.getBoundingClientRect(); return r.height > 0 && r.top > fold; };
    var free = function (el) { return !el.closest("[data-reveal], [data-reveal-stagger]"); };
    document.querySelectorAll(AUTO_STAGGER).forEach(function (el) {
      if (!free(el) || !below(el)) return;
      el.setAttribute("data-reveal-stagger", "");
      Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty("--i", Math.min(i, 8)); });
    });
    document.querySelectorAll(AUTO_SINGLE).forEach(function (el) {
      if (free(el) && below(el) && !el.querySelector("[data-reveal], [data-reveal-stagger]")) el.setAttribute("data-reveal", "");
    });
    var reveals = document.querySelectorAll("[data-reveal], [data-reveal-stagger]");
    if (!reveals.length) return;
    document.documentElement.classList.add("js-reveal");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-visible");
        io.unobserve(en.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setupReveal);
  else setupReveal();

  // ---------- Horizontal strips (prev/next buttons) ----------
  document.querySelectorAll("[data-strip-prev], [data-strip-next]").forEach(function (b) {
    b.addEventListener("click", function () {
      var strip = document.querySelector(b.getAttribute("data-strip-prev") || b.getAttribute("data-strip-next"));
      var dir = b.hasAttribute("data-strip-next") ? 1 : -1;
      strip.scrollBy({ left: dir * strip.clientWidth * 0.7, behavior: "smooth" });
    });
  });

  // ---------- Forms: validation, Turnstile, submit to Google Sheets ----------
  var MSG = {
    valueMissing: "Vui lòng điền thông tin này.",
    typeMismatch: "Định dạng chưa đúng.",
    patternMismatch: "Định dạng chưa đúng.",
    tooShort: "Nội dung quá ngắn."
  };
  // Same rule as worker/index.js: Vietnamese numbers starting 0, 84 or +84
  var VN_PHONE = /^(?:\+84|84|0)(?:[35789]\d{8}|2\d{9})$/;
  function check(input) {
    var field = input.closest(".field") || input.closest(".check");
    if (!field) return true;
    var v = input.validity, msg = "";
    if (v.valid && input.type === "tel" && input.value.trim() && !VN_PHONE.test(input.value.replace(/[\s.()-]/g, ""))) {
      msg = "Số điện thoại chưa đúng (VD: 0912 345 678).";
    } else if (!v.valid) {
      msg = v.valueMissing ? MSG.valueMissing : v.typeMismatch ? (input.type === "email" ? "Email chưa đúng định dạng." : MSG.typeMismatch)
        : v.patternMismatch ? (input.type === "tel" ? "Số điện thoại chưa đúng." : MSG.patternMismatch)
        : v.tooShort ? MSG.tooShort : MSG.typeMismatch;
    }
    field.classList.toggle("has-error", !!msg);
    var err = field.querySelector(".field__error");
    if (err) err.textContent = msg;
    return !msg;
  }

  // Submit: validate → Cloudflare Turnstile token → POST JSON to the Worker at /api/<form>
  // (booking / consult from the contact form's "purpose" radio, partner from data-form).
  // The Worker re-validates, verifies the token and forwards the row to Google Sheets.
  var FORMS = (HM && HM.site.forms) || {};
  var dataForms = document.querySelectorAll("form[data-form]");

  // Turnstile: load the script once, only on pages with a form; one widget per form
  var tsReady = null;
  function loadTurnstile() {
    if (!FORMS.turnstileSiteKey) return Promise.resolve(null);
    if (tsReady) return tsReady;
    tsReady = new Promise(function (resolve) {
      window.hmTurnstileLoaded = function () { resolve(window.turnstile); };
      var sc = document.createElement("script");
      sc.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=hmTurnstileLoaded";
      sc.async = true; sc.defer = true;
      sc.onerror = function () { resolve(null); };
      document.head.appendChild(sc);
    });
    return tsReady;
  }

  function formData(form) {
    var out = {};
    new FormData(form).forEach(function (v, k) {
      if (k === "cf-turnstile-response") return;
      v = typeof v === "string" ? v.trim() : v;
      out[k] = out[k] ? out[k] + ", " + v : v; // checkboxes with the same name → "a, b"
    });
    return out;
  }

  dataForms.forEach(function (form) {
    form.noValidate = true;
    var status = form.querySelector(".form-status");
    var submitBtn = form.querySelector('[type="submit"]');
    var actions = form.querySelector(".form-actions");
    function say(text, kind) {
      if (!status) return;
      status.textContent = text;
      status.classList.toggle("form-status--error", kind === "error");
    }

    // honeypot: real people never see or fill this field; bots that fill every input get dropped
    form.insertAdjacentHTML("beforeend",
      '<div class="hp" aria-hidden="true"><label>Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>');

    // Turnstile widget, just above the submit button
    var widgetId = null, tsBox = null;
    if (FORMS.turnstileSiteKey && actions) {
      tsBox = document.createElement("div");
      tsBox.className = "form-turnstile";
      actions.parentNode.insertBefore(tsBox, actions);
      loadTurnstile().then(function (ts) {
        if (!ts) { tsBox.textContent = "Không tải được bước xác minh. Vui lòng tải lại trang."; return; }
        widgetId = ts.render(tsBox, {
          sitekey: FORMS.turnstileSiteKey,
          action: form.getAttribute("data-form"), // checked by the Worker (contact / partner)
          language: "vi",
          theme: "light",
          callback: function () { tsBox.classList.remove("has-error"); }
        });
      });
    }

    form.addEventListener("input", function (e) { if (e.target.closest(".has-error")) check(e.target); });
    form.addEventListener("change", function (e) { if (e.target.closest(".has-error")) check(e.target); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.classList.contains("is-sending")) return;
      var bad = null;
      form.querySelectorAll("input, select, textarea").forEach(function (i) {
        if (i.closest(".hp") || i.closest(".form-turnstile")) return;
        if (!check(i) && !bad) bad = i;
      });
      if (bad) { bad.focus(); say(""); return; }

      var token = "";
      if (tsBox) {
        token = window.turnstile && widgetId !== null ? window.turnstile.getResponse(widgetId) : "";
        if (!token) {
          tsBox.classList.add("has-error");
          say("Vui lòng hoàn tất bước xác minh bên trên trước khi gửi.", "error");
          return;
        }
      }

      var data = formData(form);
      var type = data.purpose || form.getAttribute("data-form");
      delete data.purpose;
      delete data.consent;
      data.turnstileToken = token;
      var success = form.getAttribute("data-success") || "Cảm ơn bạn! Chúng tôi sẽ liên hệ lại sớm.";
      var hotline = " Hoặc gọi hotline " + HM.site.showroom.phone + ".";
      var ERRORS = {
        captcha: "Xác minh không thành công, vui lòng thử lại.",
        invalid_phone: "Số điện thoại chưa đúng, vui lòng kiểm tra lại.",
        invalid_email: "Email chưa đúng định dạng, vui lòng kiểm tra lại.",
        invalid_date: "Ngày hẹn chưa hợp lệ, vui lòng chọn từ ngày mai trở đi.",
        missing_fields: "Vui lòng điền đủ các ô bắt buộc."
      };
      var label = submitBtn ? submitBtn.textContent : "";
      function done(ok, msg) {
        form.classList.remove("is-sending");
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = label; }
        if (window.turnstile && widgetId !== null) window.turnstile.reset(widgetId); // tokens are single-use
        say(msg, ok ? "ok" : "error");
        if (ok) form.reset();
      }

      if (location.protocol === "file:") {
        // demo mode: the page was opened from disk, there is no Worker to receive it
        console.warn("[form] demo mode (file://) — data not sent:", type, data);
        done(true, success);
        return;
      }
      form.classList.add("is-sending");
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Đang gửi…"; }
      say("");
      fetch((FORMS.api || "/api") + "/" + type, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (res) {
          if (res && res.ok) done(true, success);
          else {
            if (res && res.reason) console.warn("[form] rejected:", res.error, res.reason);
            done(false, (ERRORS[res && res.error] || "Chưa gửi được yêu cầu, vui lòng thử lại.") + hotline);
          }
        })
        .catch(function () {
          done(false, "Không kết nối được máy chủ. Vui lòng kiểm tra mạng và thử lại." + hotline);
        });
    });
  });

  // Date inputs: no past dates
  document.querySelectorAll('input[type="date"][data-future]').forEach(function (d) {
    var t = new Date(); t.setDate(t.getDate() + 1);
    d.min = t.toISOString().slice(0, 10);
  });

  // Prefill "product of interest" fields from ?product=<id>
  var pid = HM && HM.param("product");
  if (pid) {
    var p = HM.find(HM.products, pid);
    document.querySelectorAll("[data-prefill-product]").forEach(function (el) {
      if (p) el.value = "Quan tâm: " + p.name + " — " + p.code;
    });
  }

  // ---------- Timeline rail (about.html): fills from the top as the reader scrolls past it ----------
  var track = document.querySelector(".timeline-track");
  if (track && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var ticking = false;
    var paint = function () {
      ticking = false;
      var r = track.getBoundingClientRect();
      // 0 when the top of the track reaches 70% of the viewport, 1 when its bottom does
      var p = (window.innerHeight * 0.7 - r.top) / r.height;
      track.style.setProperty("--tl-progress", Math.max(0, Math.min(1, p)).toFixed(4));
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(paint); } };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  // ---------- Lightbox: click a [data-lightbox-item] inside a [data-lightbox] group to view it large ----------
  // Arrow keys / buttons / swipe move through the group; Esc, the close button or a click on the
  // dark area closes it and focus goes back to the item that opened it. The click is delegated
  // from the document, so groups rendered later by page scripts (collections.html) work too.
  if (window.HTMLDialogElement) {
    var icon = function (d) { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="' + d + '"/></svg>'; };
    var lb = document.createElement("dialog");
    lb.className = "lightbox";
    lb.setAttribute("aria-label", "Xem ảnh");
    lb.innerHTML =
      '<div class="lightbox__bar"><span class="lightbox__count" aria-live="polite"></span>' +
        '<button type="button" class="lightbox__btn lightbox__close" aria-label="Đóng">' + icon("M6 6l12 12M18 6L6 18") + "</button></div>" +
      '<div class="lightbox__stage">' +
        '<button type="button" class="lightbox__btn lightbox__prev" aria-label="Ảnh trước">' + icon("M15 6l-6 6 6 6") + "</button>" +
        '<img class="lightbox__img" alt="">' +
        '<button type="button" class="lightbox__btn lightbox__next" aria-label="Ảnh sau">' + icon("M9 6l6 6-6 6") + "</button>" +
      "</div>" +
      '<p class="lightbox__caption"></p>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector(".lightbox__img");
    var lbCap = lb.querySelector(".lightbox__caption");
    var lbCount = lb.querySelector(".lightbox__count");
    var shots = [], at = 0, opener = null;

    var show = function (i) {
      at = (i + shots.length) % shots.length;
      var img = shots[at];
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = img.alt;
      lbCount.textContent = (at + 1) + " / " + shots.length;
      // restart the zoom-in animation for each image
      lbImg.style.animation = "none"; void lbImg.offsetWidth; lbImg.style.animation = "";
    };
    document.addEventListener("click", function (e) {
      var item = e.target.closest("[data-lightbox-item]");
      var g = item && item.closest("[data-lightbox]");
      if (!g) return;
      e.preventDefault();
      shots = Array.prototype.map.call(g.querySelectorAll("[data-lightbox-item]"), function (el) { return el.querySelector("img") || el; });
      opener = item;
      lb.classList.toggle("lightbox--single", shots.length < 2);
      lb.setAttribute("aria-label", g.getAttribute("data-lightbox") || "Xem ảnh");
      show(shots.indexOf(item.querySelector("img") || item));
      lb.showModal();
      document.body.style.overflow = "hidden";
    });
    lb.addEventListener("close", function () {
      document.body.style.overflow = "";
      lbImg.removeAttribute("src");
      if (opener) opener.focus();
    });
    lb.querySelector(".lightbox__close").addEventListener("click", function () { lb.close(); });
    lb.querySelector(".lightbox__prev").addEventListener("click", function () { show(at - 1); });
    lb.querySelector(".lightbox__next").addEventListener("click", function () { show(at + 1); });
    // click on the dark background (not the image or a button) closes
    lb.addEventListener("click", function (e) { if (!e.target.closest(".lightbox__img, .lightbox__btn")) lb.close(); });
    lb.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(at - 1);
      if (e.key === "ArrowRight") show(at + 1);
    });
    var sx = null;
    lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 40 && shots.length > 1) show(at + (dx < 0 ? 1 : -1));
    });
  }

  // ---------- Count-up numbers (.facts strong, about.html) ----------
  // "1948", "3", "120+", "10 năm": the number counts up from 0 when the strip scrolls into view;
  // anything after it (+, " năm") stays put. The final text is in the HTML, so no-JS / reduced
  // motion just shows it.
  (function () {
    var els = document.querySelectorAll(".facts strong");
    if (!els.length || !("IntersectionObserver" in window) ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    function run(el) {
      var m = el.textContent.match(/^(\D*)(\d+)(.*)$/);
      if (!m) return;
      var end = +m[2], t0 = null, dur = 1600;
      function frame(t) {
        if (t0 === null) t0 = t;
        var k = Math.min(1, (t - t0) / dur);
        var eased = 1 - Math.pow(1 - k, 4); // ease-out: fast start, settles on the value
        el.textContent = m[1] + Math.round(end * eased) + m[3];
        if (k < 1) requestAnimationFrame(frame);
      }
      el.textContent = m[1] + "0" + m[3];
      requestAnimationFrame(frame);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        run(e.target);
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  })();

  // ---------- "Vì sao chọn Hamamoto" tabs: [data-why] is filled from HM.why ----------
  // Tabs on the left (click, hover on desktop, arrow keys); photo + caption + text + spec table on the right.
  document.querySelectorAll("[data-why]").forEach(function (root, n) {
    if (!HM || !HM.why) return;
    var uid = "why" + n;
    root.innerHTML =
      '<div class="why__tabs" role="tablist" aria-label="Vì sao nên chọn Hamamoto">' +
        HM.why.map(function (w, i) {
          return '<button type="button" role="tab" class="why__tab" id="' + uid + "-t" + i + '" aria-controls="' + uid + "-p" + i + '"' +
            ' aria-selected="' + (i === 0) + '"' + (i ? ' tabindex="-1"' : "") + ' style="--i:' + i + '">' +
            '<span class="why__num">' + String(i + 1).padStart(2, "0") + "</span>" + HM.esc(w.title) + "</button>";
        }).join("") +
      "</div>" +
      '<div class="why__panels">' +
        HM.why.map(function (w, i) {
          return '<div class="why__panel' + (i ? "" : " is-active") + '" role="tabpanel" id="' + uid + "-p" + i + '" aria-labelledby="' + uid + "-t" + i + '"' + (i ? " hidden" : "") + ">" +
            '<figure class="why__media"><img src="' + HM.IMG + w.img + '" alt="' + HM.esc(w.caption) + '"' + (i ? ' loading="lazy"' : "") + ">" +
              '<figcaption class="why__caption">' + HM.esc(w.caption) + "</figcaption></figure>" +
            '<div class="why__body"><div><h3 class="h3 why__heading">' + HM.esc(w.heading) + "</h3><p>" + HM.esc(w.text) + "</p></div>" +
              '<dl class="why__specs">' + w.specs.map(function (r) {
                return "<div><dt>" + HM.esc(r[0]) + "</dt><dd>" + HM.esc(r[1]) + "</dd></div>";
              }).join("") + "</dl></div>" +
          "</div>";
        }).join("") +
      "</div>";

    var tabs = root.querySelectorAll(".why__tab");
    var panels = root.querySelectorAll(".why__panel");
    var cur = 0;
    function select(i, focus) {
      i = (i + tabs.length) % tabs.length;
      if (i === cur) return;
      tabs.forEach(function (t, k) { t.setAttribute("aria-selected", String(k === i)); t.tabIndex = k === i ? 0 : -1; });
      panels[cur].classList.remove("is-active"); panels[cur].hidden = true;
      panels[i].hidden = false;
      void panels[i].offsetWidth; // restart the fade-in
      panels[i].classList.add("is-active");
      if (focus) tabs[i].focus();
      // keep the active tab in view on the horizontal (mobile) tab row
      var list = tabs[i].parentNode;
      if (list.scrollWidth > list.clientWidth) list.scrollTo({ left: tabs[i].offsetLeft - 16, behavior: "smooth" });
      cur = i;
    }
    var hover = window.matchMedia("(hover: hover)").matches, ht;
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(i); });
      // desktop: hovering a tab switches to it after a short pause (so passing over doesn't flicker)
      if (hover) {
        t.addEventListener("mouseenter", function () { clearTimeout(ht); ht = setTimeout(function () { select(i); }, 120); });
        t.addEventListener("mouseleave", function () { clearTimeout(ht); });
      }
      t.addEventListener("keydown", function (e) {
        var k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (k) { e.preventDefault(); select(cur + k, true); }
        if (e.key === "Home") { e.preventDefault(); select(0, true); }
        if (e.key === "End") { e.preventDefault(); select(tabs.length - 1, true); }
      });
    });
  });

  // Fill elements marked data-site="key" with showroom contact info
  if (HM) {
    document.querySelectorAll("[data-site]").forEach(function (el) {
      var k = el.getAttribute("data-site"), S = HM.site.showroom;
      el.textContent = S[k];
      if (el.tagName === "A") el.href = k === "phone" ? S.phoneHref : k === "email" ? "mailto:" + S.email : el.href;
    });
  }
})();

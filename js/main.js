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

  // ---------- Forms: validation + confirmation (no backend yet) ----------
  var MSG = {
    valueMissing: "Vui lòng điền thông tin này.",
    typeMismatch: "Định dạng chưa đúng.",
    patternMismatch: "Định dạng chưa đúng.",
    tooShort: "Nội dung quá ngắn."
  };
  function check(input) {
    var field = input.closest(".field") || input.closest(".check");
    if (!field) return true;
    var v = input.validity, msg = "";
    if (!v.valid) {
      msg = v.valueMissing ? MSG.valueMissing : v.typeMismatch ? (input.type === "email" ? "Email chưa đúng định dạng." : MSG.typeMismatch)
        : v.patternMismatch ? (input.type === "tel" ? "Số điện thoại chưa đúng." : MSG.patternMismatch)
        : v.tooShort ? MSG.tooShort : MSG.typeMismatch;
    }
    field.classList.toggle("has-error", !!msg);
    var err = field.querySelector(".field__error");
    if (err) err.textContent = msg;
    return !msg;
  }

  document.querySelectorAll("form[data-form]").forEach(function (form) {
    form.noValidate = true;
    var status = form.querySelector(".form-status");
    form.addEventListener("input", function (e) { if (e.target.closest(".has-error")) check(e.target); });
    form.addEventListener("change", function (e) { if (e.target.closest(".has-error")) check(e.target); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = null;
      form.querySelectorAll("input, select, textarea").forEach(function (i) { if (!check(i) && !bad) bad = i; });
      if (bad) { bad.focus(); if (status) status.textContent = ""; return; }
      // TODO: send FormData(form) to the CRM / email service here.
      if (status) status.textContent = form.getAttribute("data-success") || "Cảm ơn bạn! Chúng tôi sẽ liên hệ lại sớm.";
      form.reset();
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

  // Fill elements marked data-site="key" with showroom contact info
  if (HM) {
    document.querySelectorAll("[data-site]").forEach(function (el) {
      var k = el.getAttribute("data-site"), S = HM.site.showroom;
      el.textContent = S[k];
      if (el.tagName === "A") el.href = k === "phone" ? S.phoneHref : k === "email" ? "mailto:" + S.email : el.href;
    });
  }
})();

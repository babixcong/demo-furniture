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

  // ---------- Search panel ----------
  var sBtn = document.getElementById("search-toggle");
  var sPanel = document.getElementById("search-panel");
  if (sBtn && sPanel) {
    sBtn.addEventListener("click", function () {
      var open = sPanel.hidden;
      sPanel.hidden = !open;
      sBtn.setAttribute("aria-expanded", String(open));
      if (open) sPanel.querySelector("input").focus();
    });
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
    if (sPanel && !sPanel.hidden) { sPanel.hidden = true; sBtn.setAttribute("aria-expanded", "false"); sBtn.focus(); }
  });

  // ---------- Scroll reveal: [data-reveal] fades/slides in when it enters the viewport ----------
  var reveals = document.querySelectorAll("[data-reveal]");
  if (reveals.length && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-reveal");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-visible");
        io.unobserve(en.target);
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

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
      if (p) el.value = "Quan tâm: " + p.name + " (" + HM.find(HM.collections, p.col).no + ")";
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

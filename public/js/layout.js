/* Shared header + footer, injected into every page.
   Usage: <body data-page="..."> with <header id="site-header"></header>
   and <footer id="site-footer"></footer>; load js/data.js first.
   data-page: home | categories | products | collections | concepts | brand |
              materials | professionals | news | contact | policies
   The home page gets a transparent header over the hero (see .site-header--overlay). */
(function () {
  var HM = window.HM;
  var page = document.body.getAttribute("data-page");
  var S = HM.site.showroom;

  var chevron = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

  // Glossary for header labels (machine translation got these wrong, e.g. "Trademark")
  var L = {
    products: { vi: "Sản phẩm", en: "Products", ja: "製品" },
    brand: { vi: "Thương hiệu", en: "Brand", ja: "ブランド" },
    contact: { vi: "Liên hệ", en: "Contact", ja: "お問い合わせ" },
    book: { vi: "Đặt lịch showroom", en: "Book a visit", ja: "来店予約" },
    quote: { vi: "Báo giá", en: "Quote", ja: "見積もり" }
  };

  function current(ids) { return ids.indexOf(page) > -1 ? ' aria-current="page"' : ""; }
  function li(href, label) { return '<li><a href="' + href + '">' + label + "</a></li>"; }

  var brandPanel =
    '<div class="nav__panel" id="panel-brand"><div class="container dropdown">' +
      '<a href="about.html"><strong>Hamamoto</strong><span>Lịch sử, triết lý, nghệ thuật chế tác và chất lượng</span></a>' +
      '<a href="materials.html"><strong>Vật liệu &amp; Craftsmanship</strong><span>Gỗ, da, vải, màu hoàn thiện và kỹ thuật</span></a>' +
    "</div></div>";

  var productsPanel =
    '<div class="nav__panel" id="panel-products"><div class="container dropdown dropdown--grid">' +
      HM.categories.map(function (c) {
        return '<a class="dropdown__cat" href="shop.html?category=' + c.id + '">' + HM.catIcon(c.id, 22) + "<strong>" + HM.esc(c.name) + "</strong><span>" + HM.esc(c.desc) + "</span></a>";
      }).join("") +
      '<a class="dropdown__cat" href="shop.html">' + HM.catIcon("all", 22) + "<strong>Tất cả sản phẩm</strong><span>Tìm kiếm và lọc theo chất liệu, màu</span></a>" +
    "</div></div>";

  // Order (brief 2): Logo · Thương hiệu · Collections · Living Concepts · Sản phẩm · Liên hệ · CTA · Ngôn ngữ
  var header =
    '<div class="container header__inner">' +
      '<a class="header__logo" href="index.html"><img src="' + HM.IMG + 'hamamoto-logo.svg" width="115" height="49" alt="Hamamoto — Trang chủ"></a>' +
      '<nav class="header__nav" aria-label="Chính"><ul class="nav" id="main-nav">' +
        // "Thương hiệu" opens the Hamamoto page; the chevron (and hover on desktop) opens Hamamoto / Vật liệu
        '<li class="nav__item nav__item--split"><a class="nav__link" href="about.html"' + current(["brand", "materials"]) + ">" + HM.t(L.brand) + "</a>" +
          '<button class="nav__sub-toggle" type="button" aria-expanded="false" aria-controls="panel-brand" aria-label="Mở menu Thương hiệu">' + chevron + "</button>" + brandPanel + "</li>" +
        '<li class="nav__item"><a class="nav__link" href="collections.html"' + current(["collections"]) + ">" + HM.nt("Collections") + "</a></li>" +
        '<li class="nav__item"><a class="nav__link" href="living-concepts.html"' + current(["concepts"]) + ">" + HM.nt("Living Concepts") + "</a></li>" +
        // "Sản phẩm" opens the category landing page; the chevron (and hover on desktop) lists the categories
        '<li class="nav__item nav__item--split"><a class="nav__link" href="categories.html"' + current(["categories", "products"]) + ">" + HM.t(L.products) + "</a>" +
          '<button class="nav__sub-toggle" type="button" aria-expanded="false" aria-controls="panel-products" aria-label="Mở menu Sản phẩm">' + chevron + "</button>" + productsPanel + "</li>" +
        '<li class="nav__item"><a class="nav__link" href="contact.html"' + current(["contact", "policies"]) + ">" + HM.t(L.contact) + "</a></li>" +
        // phones: the header CTA is hidden, so repeat it at the end of the menu
        '<li class="nav__item nav__item--cta"><a class="btn btn--primary btn--block" href="contact.html#booking">' + HM.t(L.book) + "</a></li>" +
      "</ul></nav>" +
      '<div class="header__actions">' +
        '<a class="btn btn--primary btn--sm header__cta" href="contact.html#booking">' + HM.t(L.book) + "</a>" +
        // language switcher is inserted here by js/i18n.js
        '<button class="icon-btn nav-toggle" type="button" aria-expanded="false" aria-controls="main-nav" aria-label="Mở menu">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"/></svg>' +
        "</button>" +
      "</div>" +
    "</div>";

  var col = function (title, links) {
    return '<div class="footer__col"><h3>' + title + "</h3><ul>" +
      links.map(function (l) { return li(l[1], l[0]); }).join("") + "</ul></div>";
  };

  var footer =
    '<div class="container">' +
      '<div class="footer__top">' +
        '<div class="footer__brand">' +
          '<a href="index.html"><img src="' + HM.IMG + 'hamamoto-logo.svg" width="115" height="49" alt="Hamamoto"></a>' +
          "<p>" + HM.esc(S.address) + "<br>" +
            '<a href="' + S.phoneHref + '">' + HM.esc(S.phone) + "</a> · " +
            '<a href="mailto:' + S.email + '">' + HM.esc(S.email) + "</a><br>" + HM.esc(S.hours) + "</p>" +
          // '<div class="socials">' +
          //   '<a href="#" aria-label="Facebook"><img src="assets/icons/facebook.svg" width="6.09179" height="13.0557" alt=""></a>' +
          //   '<a href="#" aria-label="Instagram"><img src="assets/icons/instagram.svg" width="12.8" height="12.8001" alt=""></a>' +
          //   '<a href="#" aria-label="YouTube"><img src="assets/icons/youtube.svg" width="12.8" height="9.2" alt=""></a>' +
          // "</div>" +
        "</div>" +
        col("Khám phá", [["Sản phẩm", "categories.html"], ["Collections", "collections.html"], ["Living Concepts", "living-concepts.html"]]) +
        col("Thương hiệu", [["Hamamoto", "about.html"], ["Vật liệu &amp; Craftsmanship", "materials.html"]]) +
        col("Kết nối", [["Tin tức / Projects", "news.html"], [HM.nt("For Professionals"), "professionals.html"], ["Showroom", "contact.html#showroom"]]) +
        col("Liên hệ &amp; chính sách", [["Liên hệ &amp; đặt lịch", "contact.html"], ["Bảo hành", "policies.html#bao-hanh"], ["Giao nhận", "policies.html#giao-nhan"], ["Quyền riêng tư", "policies.html#quyen-rieng-tu"], ["Điều khoản", "policies.html#dieu-khoan"]]) +
      "</div>" +
      '<div class="footer__bottom">' +
        "<p>© " + new Date().getFullYear() + " Hamamoto. Bảo lưu mọi quyền.</p>" +
        '<nav aria-label="Chính sách"><a href="policies.html#bao-hanh">Bảo hành</a><a href="policies.html#giao-nhan">Giao nhận</a><a href="policies.html#quyen-rieng-tu">Quyền riêng tư</a><a href="policies.html#dieu-khoan">Điều khoản</a></nav>' +
      "</div>" +
    "</div>";

  // Contact tag (every page): a tab fixed to the right edge with the Facebook (Messenger) and Zalo
  // logos as direct links. Each logo's name slides out on hover/focus; the icons "ring" in turn
  // every few seconds to catch the eye (CSS, off with reduced motion).
  var C = HM.site.chat;
  var fab =
    '<aside class="fab" id="fab" aria-label="Liên hệ nhanh">' +
      '<span class="fab__label" aria-hidden="true">Chat ngay</span>' +
      '<a class="fab__link fab__link--fb" href="' + C.messenger + '" target="_blank" rel="noopener" aria-label="Nhắn tin qua Facebook Messenger (mở tab mới)">' +
        '<span class="fab__logo" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.15.26.35.27.57l.05 1.78c.02.57.6.94 1.12.71l1.98-.87c.17-.08.36-.09.54-.04.91.25 1.87.38 2.9.38 5.64 0 10-4.13 10-9.7S17.64 2 12 2z"/><path class="fab__bolt" fill="#fff" d="M5.99 14.54l2.94-4.66c.47-.74 1.47-.93 2.17-.4l2.34 1.75c.21.16.51.16.72 0l3.16-2.4c.42-.32.97.18.69.63l-2.94 4.66c-.47.74-1.47.93-2.17.4l-2.34-1.75a.6.6 0 0 0-.72 0l-3.16 2.4c-.42.32-.97-.18-.69-.63z"/></svg></span>' +
        '<span class="fab__name" aria-hidden="true">Facebook</span></a>' +
      '<a class="fab__link fab__link--zalo" href="' + C.zalo + '" target="_blank" rel="noopener" aria-label="Chat qua Zalo (mở tab mới)">' +
        '<span class="fab__logo" aria-hidden="true"><svg width="30" height="30" viewBox="0 0 48 48"><path fill="currentColor" d="M24 5C12.4 5 3 12.9 3 22.6c0 5.6 3.1 10.6 8 13.8-.4 2.3-1.6 4.4-3.4 6 3.5.3 6.9-.8 9.6-2.9 2.2.6 4.4.9 6.8.9 11.6 0 21-7.9 21-17.6S35.6 5 24 5z"/><text x="24" y="27.5" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="11.5" font-weight="700" fill="#fff">Zalo</text></svg></span>' +
        '<span class="fab__name" aria-hidden="true">Zalo</span></a>' +
    "</aside>";

  var h = document.getElementById("site-header");
  var f = document.getElementById("site-footer");
  if (h) { h.className = "site-header" + (page === "home" ? " site-header--overlay" : ""); h.innerHTML = header; }
  if (f) { f.className = "site-footer"; f.innerHTML = footer; }
  // Right-edge dock: the quote-list tab ("Báo giá" + count, shown once something is picked)
  // sits on top of the contact tab; both move together.
  var qfab =
    '<div class="qfab" id="quote-link" hidden>' +
      '<a class="fab__link qfab__link" href="quote.html"' + (page === "quote" ? ' aria-current="page"' : "") + ">" +
        '<span class="fab__logo qfab__icon" aria-hidden="true">' + HM.ICON.quote + "</span>" +
        '<span class="qfab__n" id="quote-n" aria-hidden="true">0</span>' +
        '<span class="fab__name" aria-hidden="true">' + HM.t(L.quote) + "</span></a>" +
    "</div>";
  document.body.insertAdjacentHTML("beforeend", '<div class="side-dock">' + qfab + fab + "</div>");

  // "Báo giá" tab (right-edge dock): count of pieces in the quote list; visible when the list has
  // something (always on quote.html). Kept in sync across pages/tabs via "hm:store".
  var qLink = document.getElementById("quote-link");
  var qN = document.getElementById("quote-n");
  function paintQuote() {
    if (!qLink) return;
    var n = HM.store.count();
    qN.textContent = n;
    qN.hidden = !n;
    qLink.hidden = !(n || page === "quote");
    qLink.querySelector("a").setAttribute("aria-label", "Danh sách báo giá: " + n + " món");
  }
  paintQuote();
  document.addEventListener("hm:store", paintQuote);

  // Small notice at the bottom of the screen (e.g. "Đã thêm vào yêu cầu báo giá · Xem danh sách")
  document.body.insertAdjacentHTML("beforeend", '<div class="toast" id="toast" role="status" aria-live="polite"></div>');
  var toast = document.getElementById("toast"), toastT;
  HM.toast = function (html) {
    toast.innerHTML = html;
    toast.classList.add("is-on");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toast.classList.remove("is-on"); }, 3200);
    if (qLink && !qLink.hidden) { qLink.classList.remove("is-bump"); void qLink.offsetWidth; qLink.classList.add("is-bump"); }
  };

  // Back-to-top button (every page): bottom-right corner, appears after scrolling down;
  // the ring around it fills with the reading progress.
  document.body.insertAdjacentHTML("beforeend",
    '<button class="to-top" id="to-top" type="button" aria-label="Lên đầu trang" tabindex="-1">' +
      '<svg class="to-top__ring" width="48" height="48" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22.5"/><circle class="to-top__progress" cx="24" cy="24" r="22.5" pathLength="100"/></svg>' +
      '<svg class="to-top__arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>' +
    "</button>");
  var toTop = document.getElementById("to-top");
  var ring = toTop.querySelector(".to-top__progress");
  var ticking = false;
  function updateTop() {
    ticking = false;
    var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    var on = y > window.innerHeight * 0.8;
    toTop.classList.toggle("is-visible", on);
    toTop.tabIndex = on ? 0 : -1;
    ring.style.strokeDashoffset = String(100 - (max > 0 ? Math.min(100, y / max * 100) : 0));
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(updateTop); } }, { passive: true });
  window.addEventListener("resize", updateTop);
  updateTop();
  toTop.addEventListener("click", function () {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    // keyboard users land at the top of the page, not on a now-hidden button
    var logo = document.querySelector(".header__logo");
    if (logo) logo.focus({ preventScroll: true });
  });

  // Page-transition loader (#page-loader is in each page's markup so it covers the first paint).
  // Shows on arrival and when following a link to another page. In-page changes (shop filters,
  // anchors on the same page) don't use it; shop pagination calls HM.loader.flash() itself.
  var loader = document.getElementById("page-loader");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function hideLoader() { if (loader) loader.classList.add("is-done"); }
  function showLoader() { if (loader) { loader.classList.add("is-leaving"); loader.classList.remove("is-done"); } }
  HM.loader = {
    show: showLoader,
    hide: function () { if (loader) { loader.classList.remove("is-leaving"); hideLoader(); } },
    // cover the page, run fn while hidden, then lift (used for in-page "page" changes)
    flash: function (fn) {
      if (!loader || reduce) { fn(); return; }
      showLoader();
      setTimeout(function () { fn(); setTimeout(HM.loader.hide, 150); }, 350);
    }
  };
  if (loader) {
    loader.style.animation = "none"; // JS is running: drop the CSS failsafe
    // lift once the page has loaded (min ~250ms so the animation reads; max 2s for slow images)
    var t0 = Date.now(), lifted = false;
    var lift = function () {
      if (lifted) return; lifted = true;
      setTimeout(hideLoader, Math.max(0, 250 - (Date.now() - t0)));
    };
    if (document.readyState === "complete") lift(); else window.addEventListener("load", lift);
    setTimeout(lift, 2000);
    // back/forward cache restores the page with the loader still down
    window.addEventListener("pageshow", function (e) { if (e.persisted) HM.loader.hide(); });

    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest("a[href]");
      if (!a || a.target && a.target !== "_self" || a.hasAttribute("download")) return;
      var url = new URL(a.href, location.href);
      if (!/^(https?|file):$/.test(url.protocol) || url.origin !== location.origin) return;
      // same document (only the hash differs): let the browser scroll, no loader
      if (url.pathname === location.pathname && url.search === location.search) return;
      e.preventDefault();
      showLoader();
      setTimeout(function () { location.href = url.href; }, reduce ? 0 : 300);
    });
  }
})();

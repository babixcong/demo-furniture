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
    book: { vi: "Đặt lịch showroom", en: "Book a visit", ja: "来店予約" }
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
        return '<a href="shop.html?category=' + c.id + '"><strong>' + HM.esc(c.name) + "</strong><span>" + HM.esc(c.desc) + "</span></a>";
      }).join("") +
      '<a href="shop.html"><strong>Tất cả sản phẩm</strong><span>Tìm kiếm và lọc theo chất liệu, màu</span></a>' +
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

  // Floating contact button (every page): opens Facebook Messenger / Zalo
  var C = HM.site.chat;
  var fab =
    '<div class="fab" id="fab">' +
      '<ul class="fab__menu" id="fab-menu" hidden>' +
        '<li><a class="fab__item" href="' + C.messenger + '" target="_blank" rel="noopener">' +
          '<span class="fab__icon fab__icon--fb" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v1.9H8V11.7h2.6V21.5H14v-9.8h2.6l.4-3.2z"/></svg></span>' +
          "<span><strong>Facebook</strong><small>Nhắn tin qua Messenger</small></span></a></li>" +
        '<li><a class="fab__item" href="' + C.zalo + '" target="_blank" rel="noopener">' +
          '<span class="fab__icon fab__icon--zalo" aria-hidden="true">Zalo</span>' +
          "<span><strong>Zalo</strong><small>Chat với tư vấn viên</small></span></a></li>" +
      "</ul>" +
      '<button class="fab__toggle" type="button" aria-expanded="false" aria-controls="fab-menu" aria-label="Liên hệ nhanh qua Facebook, Zalo">' +
        '<svg class="fab__open" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8.5 8.5 0 0 1-12.3 7.6L3 21l1.4-5.4A8.5 8.5 0 1 1 21 12z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01" stroke-width="2.4" stroke-linecap="round"/></svg>' +
        '<svg class="fab__close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      "</button>" +
    "</div>";

  var h = document.getElementById("site-header");
  var f = document.getElementById("site-footer");
  if (h) { h.className = "site-header" + (page === "home" ? " site-header--overlay" : ""); h.innerHTML = header; }
  if (f) { f.className = "site-footer"; f.innerHTML = footer; }
  document.body.insertAdjacentHTML("beforeend", fab);
})();

/* Hamamoto — shared site data + small render helpers.
   Products come from js/catalog.js (official catalogue); load it before this file.
   Contact details, banners, scene photos and news are still MOCKUP content. */
window.HM = (function () {
  var IMG = "assets/images/";

  var site = {
    name: "Hamamoto",
    tagline: "made in japan · since 1948",
    showroom: {
      name: "Hamamoto Showroom Hà Nội",
      address: "Royal City",
      hours: "09:00 – 21:00, Thứ Hai – Chủ Nhật",
      phone: "12345678",
      phoneHref: "tel:+12345678",
      email: "anhtu@email.com",
      map: "https://maps.google.com/maps?q=21.0031749,105.8154535&z=17&t=k&output=embed",
      mapLink: "https://www.google.com/maps/search/?api=1&query=21.0031749,105.8154535"
    },
    // Language switcher. Phase 1 = machine translation (js/i18n.js); "vi" is the source language.
    languages: [
      { code: "vi", label: "VI", name: "Tiếng Việt" },
      { code: "en", label: "EN", name: "English" },
      { code: "ja", label: "日本語", name: "日本語" }
    ],
    // Floating contact button (bottom-right). TODO: replace with the real page / Zalo number.
    chat: {
      messenger: "https://m.me/hamamoto",        // Facebook Page username → m.me/<username>
      facebook: "https://www.facebook.com/hamamoto",
      zalo: "https://zalo.me/12345678"           // zalo.me/<số điện thoại Zalo hoặc OA id>
    }
  };

  // ---------------------------------------------------------------------------
  // Product data comes from the official catalogue (js/catalog.js, generated
  // from Hamamoto_CatalogueSanPham_KWB260806_VI.pdf + ..._EN.pdf).
  // Banners/scene photos below are still MOCKUP images.
  // ---------------------------------------------------------------------------
  var CAT = window.HM_CATALOG || { products: [], swatches: {} };

  // Nhóm hàng (banner = lifestyle image for the category landing page)
  var categories = [
    { id: "sofa", name: "Sofa", en: "Sofas", banner: "cat-sofas.png", desc: "Sofa module No.6000 và No.7000: vỏ bọc tháo giặt, ghép linh hoạt thành sofa góc." },
    { id: "sofa-an", name: "Sofa ăn · Living Dining", en: "Dining sofas", banner: "room-kitchen.png", desc: "Êm như sofa, nhưng giữ đúng tư thế ngồi bàn ăn." },
    { id: "ghe-an", name: "Ghế ăn & băng ghế", en: "Dining chairs & benches", banner: "cat-chairs.png", desc: "Lưng tựa công thái học, đệm lò xo nhiều lớp." },
    { id: "ottoman", name: "Ghế đôn (Ottoman)", en: "Ottomans", banner: "cat-armchairs.png", desc: "Gác chân, chỗ ngồi phụ đi cùng bộ sofa." },
    { id: "ban", name: "Bàn", en: "Tables", banner: "cat-tables.png", desc: "Bàn phụ lồng nhau, mặt gỗ, kính hoặc melamine." },
    { id: "tu-ke", name: "Tủ & kệ", en: "Storage", banner: "room-hallway.png", desc: "Mỏng gọn, làm vách ngăn phòng hoặc tủ lưu trữ." },
    { id: "ghe-hoc", name: "Ghế học & làm việc", en: "Study chairs", banner: "room-bedroom.png", desc: "Điều chỉnh theo chiều cao, bánh xe có khóa." },
    { id: "phu-kien", name: "Phụ kiện", en: "Accessories", banner: "info-video.png", desc: "Khối nối và phụ kiện ghép cho hệ No.6000 Desk Unit." }
  ];

  // Chất liệu bọc (upholstery) — "wood" = products without upholstery
  var materials = [
    { id: "leather", name: "Da thật", en: "Leather" },
    { id: "smooth", name: "Da trơn", en: "Smooth Leather" },
    { id: "dinamica", name: "Dinamica", en: "Dinamica" },
    { id: "aquaclean", name: "AquaClean", en: "AquaClean" },
    { id: "fauxleather", name: "Giả da", en: "Faux leather" },
    { id: "softleather", name: "Da mềm", en: "Soft leather" },
    { id: "fabric", name: "Vải", en: "Fabric" },
    { id: "wood", name: "Gỗ (không bọc)", en: "Wood only" }
  ];

  // Màu sơn khung gỗ (frame finishes); hex sampled from the catalogue swatches
  var finishHex = {};
  (CAT.swatches.finishes || []).forEach(function (f) { finishHex[f.id] = f.hex; });
  var colors = [
    { id: "NA", name: "NA · Tự nhiên", en: "NA · Natural", hex: finishHex.NA },
    { id: "DA", name: "DA · Dark Natural", en: "DA · Dark Natural", hex: finishHex.DA },
    { id: "CA", name: "CA · Nâu", en: "CA · Brown", hex: finishHex.CA },
    { id: "BK", name: "BK · Đen", en: "BK · Black", hex: finishHex.BK },
    { id: "PR", name: "PR", en: "PR", hex: finishHex.PR }
  ];

  // Main series from the catalogue (other series such as No.7100 / No.6400 / No.2300
  // are shown on the product card but have no collection page)
  var collections = [
    { id: "no3000", no: "No.3000", name: "Living Dining", en: "Living Dining",
      text: "Dòng module kết hợp sự thoải mái của sofa với tư thế ngồi của ghế ăn. Gầm ghế thấp và phẳng, chiều cao ghế chọn 40 hoặc 43cm.",
      textEn: "A modular series that combines sofa comfort with dining-chair posture. Low, flat under-seat clearance; seat height 40 or 43 cm.",
      material: "Gỗ sồi, sơn PU · NA / DA / CA", img: "room-kitchen.png" },
    { id: "no6000", no: "No.6000", name: "Living & Desk Unit", en: "Living & Desk Unit",
      text: "Sofa module có bàn phụ kèm ngăn kéo, chân hai chiều cao hoán đổi, vỏ bọc tháo giặt; cùng hệ bàn, kệ sách và khối nối Desk Unit.",
      textEn: "Modular sofas with drawer side tables, swappable leg heights and washable covers, plus the Desk Unit tables, bookshelves and joint parts.",
      material: "Gỗ sồi · AquaClean", img: "room-living.png" },
    { id: "no7000", no: "No.7000", name: "Living", en: "Living",
      text: "Mặt ghế lò xo túi, lưng tựa lưới gỗ đẹp cả khi nhìn từ phía sau; tháo gối tựa để dùng tạm như giường, ghép thành sofa góc chữ L.",
      textEn: "Pocket-coil seats and a wooden lattice back that looks good from behind; remove the back cushions to use it as a bed, or join units into an L.",
      material: "Gỗ sồi, sơn BK · AquaClean", img: "cat-sofas.png" },
    { id: "no8200", no: "No.8200", name: "Dining", en: "Dining",
      text: "Ghế ăn và băng ghế cùng thiết kế lưng tựa công thái học hai điểm tựa, đệm lò xo bọc vải kết hợp urethane nhiều độ cứng.",
      textEn: "Dining chair and bench sharing an ergonomic two-point backrest and layered pocket-spring and urethane cushioning.",
      material: "Gỗ sồi, sơn CA · Da thật", img: "cat-chairs.png" }
  ];

  // Products: add filter fields (mat / color are arrays)
  var products = CAT.products.map(function (p) {
    p.mat = p.uph.length ? p.uph : ["wood"];
    p.color = p.finishes;
    return p;
  });

  // Living concepts: scene image + products shown, with hotspot positions (% of scene; mockup photos)
  var concepts = [
    { id: "20-30", area: "20–30", title: "Căn hộ nhỏ, sống trọn vẹn", text: "Sofa không tay vịn, bàn phụ lồng nhau và kệ mở để căn phòng luôn thoáng.", img: "room-living.png",
      items: [["s7000-173sh42", 30, 64], ["t6000", 52, 74], ["7000-73sh42", 68, 72], ["3800", 86, 52]] },
    { id: "30-40", area: "30–40", title: "Phòng khách cho những buổi tụ họp", text: "Sofa No.6000 có ngăn kéo, ghế đôn đi kèm và tủ Living Board làm vách ngăn.", img: "hero.png",
      items: [["sl6000-211sh42", 26, 64], ["6000-na", 46, 72], ["t6000", 62, 70], ["1400-150", 82, 58]] },
    { id: "40-50", area: "40–50", title: "Không gian mở rộng rãi", text: "Phòng khách liền phòng ăn: bộ Living Dining No.3000 ngồi ăn cũng như ngồi nghỉ.", img: "about-live-comfortably.png",
      items: [["wl3000-165sh40", 24, 66], ["c3000-70", 44, 64], ["t6000", 60, 72], ["sl6000-183sh42-r", 80, 64]] },
    { id: "gia-dinh", area: "Gia đình", title: "Ngôi nhà cho cả gia đình", text: "Ghế học lớn theo trẻ, kệ sách ghép bàn và ghế làm việc xoay.", img: "room-bedroom.png",
      items: [["dsc2300", 34, 68], ["6000-d60", 58, 56], ["dsa1300", 80, 64]] },
    { id: "bep-an", area: "Bếp – ăn", title: "Bàn ăn là trái tim ngôi nhà", text: "Ghế ăn và băng ghế No.8200, sofa ăn A7100 êm cho những bữa cơm dài.", img: "room-kitchen.png",
      items: [["da8200-sh43", 26, 66], ["8200-160sh43", 46, 70], ["da6400", 64, 64], ["a7100", 82, 68]] }
  ];

  var news = [
    { type: "du-an", typeName: "Dự án", date: "10.2026", title: "Penthouse 180 m² tại Tây Hồ", text: "Toàn bộ nội thất No.5100 trong một căn hộ nhìn ra hồ.", img: "room-bedroom.png" },
    { type: "tin-tuc", typeName: "Tin tức", date: "09.2026", title: "Ra mắt bộ sưu tập No.7000 mùa thu", text: "Bảng màu vải mới lấy cảm hứng từ lá phong Kyoto.", img: "cat-sofas.png" },
    { type: "su-kien", typeName: "Sự kiện", date: "08.2026", title: "Workshop: chăm sóc đồ gỗ tại nhà", text: "Nghệ nhân Hamamoto hướng dẫn tra dầu và bảo dưỡng gỗ.", img: "cat-tables.png" },
    { type: "khong-gian", typeName: "Không gian thực tế", date: "07.2026", title: "Căn hộ 28 m² cho người trẻ", text: "Bố trí thông minh với ba món đồ đa năng.", img: "room-living.png" },
    { type: "du-an", typeName: "Dự án", date: "06.2026", title: "Boutique hotel tại Hội An", text: "32 phòng nghỉ sử dụng nội thất đặt riêng theo thiết kế.", img: "room-hallway.png" },
    { type: "tin-tuc", typeName: "Tin tức", date: "05.2026", title: "Hamamoto đạt chứng nhận FSC", text: "100% gỗ sử dụng có nguồn gốc rừng được quản lý bền vững.", img: "cat-chairs.png" },
    { type: "khong-gian", typeName: "Không gian thực tế", date: "04.2026", title: "Bếp mở cho gia đình bốn người", text: "Bàn ăn óc chó và ghế No.6000 trong không gian 45 m².", img: "room-kitchen.png" }
  ];

  function vnd(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " VNĐ"; }
  function find(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // Active language (phase 1: read from the googtrans cookie set by js/i18n.js)
  var lang = (function () {
    var m = document.cookie.match(/(?:^|;\s*)googtrans=\/[a-z-]+\/([a-zA-Z-]+)/);
    var c = m ? m[1] : "vi";
    return site.languages.some(function (l) { return l.code === c; }) ? c : "vi";
  })();
  var useEn = lang === "en";

  // Wrap brand terms / collection numbers so machine translation leaves them alone
  function nt(text) { return '<span class="notranslate" translate="no">' + esc(text) + "</span>"; }

  // Hand-written label for the active language, protected from machine translation.
  // Usage: HM.t({ vi: "Thương hiệu", en: "Brand", ja: "ブランド" })
  function t(dict) {
    var text = dict[lang] || dict.vi;
    return lang === "vi" ? esc(text) : nt(text);
  }
  // Catalogue text {vi: ..., en: ...}: official English when EN is active (kept out of machine translation)
  function tx(o) { return useEn && o.en != null ? o.en : o.vi; }
  function txt(o) { var v = tx(o); return useEn ? nt(v) : esc(v); }
  // Category / collection / material labels that carry an `en` field
  function label(item, field) { return useEn && item.en ? nt(item.en) : esc(item[field || "name"]); }

  function productImg(p, alt) {
    return '<img class="photo" src="assets/' + p.img + '" alt="' + esc(alt == null ? p.name + " " + p.code : alt) + '" loading="lazy">';
  }

  function card(p) {
    var cat = find(categories, p.cat);
    return '<a class="pcard" href="product.html?id=' + p.id + '">' +
      '<div class="pcard__img">' + productImg(p) + "</div>" +
      '<div class="pcard__body"><div>' +
        '<h3 class="pcard__name">' + nt(p.name) + "</h3>" +
        '<p class="pcard__meta">' + nt(p.series) + " · " + label(cat) + "</p>" +
      '</div><p class="pcard__price">' + nt(p.code) + "</p></div></a>";
  }

  function param(name) { return new URLSearchParams(location.search).get(name); }

  return {
    IMG: IMG, site: site, categories: categories, materials: materials, colors: colors,
    collections: collections, products: products, concepts: concepts, news: news, swatches: CAT.swatches,
    vnd: vnd, find: find, esc: esc, nt: nt, t: t, tx: tx, txt: txt, label: label, lang: lang,
    productImg: productImg, card: card, param: param
  };
})();

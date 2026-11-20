/* Hamamoto — shared site data + small render helpers.
   All content here is MOCKUP data: swap names, prices, images and
   contact details for the real ones. Loaded before every other script. */
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

  // banner = large lifestyle image for the category landing page (mockup photos)
  var categories = [
    { id: "sofa", name: "Sofa & ghế nằm", banner: "cat-sofas.png", desc: "Đệm êm, dáng thấp, cho những buổi chiều thật chậm." },
    { id: "ghe-banh", name: "Ghế bành & thư giãn", banner: "cat-armchairs.png", desc: "Một chỗ ngồi riêng để đọc sách, uống trà, nghỉ ngơi." },
    { id: "ghe-an", name: "Ghế ăn & ghế đôn", banner: "cat-chairs.png", desc: "Ôm lưng vừa vặn cho những bữa cơm dài bên gia đình." },
    { id: "ban", name: "Bàn", banner: "cat-tables.png", desc: "Mặt gỗ đặc, mộng ghép tay, càng dùng càng đẹp." },
    { id: "tu-ke", name: "Tủ & kệ", banner: "room-hallway.png", desc: "Cất giữ gọn gàng, để không gian luôn thoáng đãng." },
    { id: "giuong", name: "Giường", banner: "room-bedroom.png", desc: "Khung gỗ vững chãi cho giấc ngủ yên tĩnh." }
  ];

  var materials = [
    { id: "go-soi", name: "Gỗ sồi" },
    { id: "go-oc-cho", name: "Gỗ óc chó" },
    { id: "da", name: "Da" },
    { id: "vai", name: "Vải" }
  ];

  var colors = [
    { id: "tu-nhien", name: "Tự nhiên", hex: "#d8bf9f" },
    { id: "nau-tram", name: "Nâu trầm", hex: "#6b4a33" },
    { id: "den", name: "Đen", hex: "#1f1d1b" },
    { id: "kem", name: "Kem", hex: "#ece3d4" },
    { id: "xam", name: "Xám", hex: "#a9a6a1" }
  ];

  var collections = [
    {
      id: "no3000", no: "No.3000", name: "Tối giản gỗ sồi",
      text: "Đường nét thẳng, mộc mạc, để vân gỗ sồi tự nhiên lên tiếng. Dòng sản phẩm nền tảng cho mọi không gian.",
      material: "Gỗ sồi trắng", since: "1978", img: "room-living.png"
    },
    {
      id: "no5100", no: "No.5100", name: "Óc chó trầm ấm",
      text: "Gỗ óc chó Bắc Mỹ được hoàn thiện dầu thủ công, sắc nâu sâu và ấm, càng dùng càng đẹp.",
      material: "Gỗ óc chó", since: "1996", img: "room-bedroom.png"
    },
    {
      id: "no6000", no: "No.6000", name: "Da và khung gỗ",
      text: "Da bò nguyên tấm kết hợp khung gỗ ghép mộng truyền thống. Bền chắc, đứng dáng, tinh tế.",
      material: "Da Ý, gỗ sồi", since: "2004", img: "room-hallway.png"
    },
    {
      id: "no7000", no: "No.7000", name: "Mềm mại & thư giãn",
      text: "Đệm nhiều lớp, vải dệt từ sợi tự nhiên. Bộ sưu tập dành cho những giờ nghỉ ngơi trọn vẹn.",
      material: "Vải lanh, len", since: "2015", img: "room-kitchen.png"
    }
  ];

  // price in VNĐ
  var products = [
    { id: "ban-tra-tron", name: "Bàn trà tròn", cat: "ban", col: "no3000", mat: "go-soi", color: "tu-nhien", price: 18500000, img: "best-6.png", dims: "Ø 80 × C 45 cm", tag: "Mới" },
    { id: "ghe-thu-gian-papasan", name: "Ghế thư giãn Papasan", cat: "ghe-banh", col: "no7000", mat: "vai", color: "kem", price: 12900000, img: "hero-card-3.png", dims: "R 110 × S 95 × C 80 cm" },
    { id: "ghe-an-co-dien", name: "Ghế ăn cổ điển", cat: "ghe-an", col: "no5100", mat: "go-oc-cho", color: "nau-tram", price: 6800000, img: "featured-classic-chair.png", dims: "R 45 × S 52 × C 88 cm" },
    { id: "ghe-banh-khung-cong", name: "Ghế bành khung cong", cat: "ghe-banh", col: "no6000", mat: "da", color: "den", price: 24000000, img: "new-armchair.png", dims: "R 72 × S 80 × C 78 cm" },
    { id: "ghe-banh-classic", name: "Ghế bành Classic", cat: "ghe-banh", col: "no6000", mat: "da", color: "nau-tram", price: 21500000, img: "shop-classic-armchair.png", dims: "R 80 × S 84 × C 82 cm" },
    { id: "ghe-quay-bar", name: "Ghế quầy bar", cat: "ghe-an", col: "no3000", mat: "go-soi", color: "tu-nhien", price: 5200000, img: "hero-card-1.png", dims: "R 42 × S 46 × C 98 cm" },
    { id: "tu-dau-giuong", name: "Tủ đầu giường", cat: "tu-ke", col: "no5100", mat: "go-oc-cho", color: "nau-tram", price: 9800000, img: "best-1.png", dims: "R 50 × S 40 × C 55 cm" },
    { id: "ban-lam-viec", name: "Bàn làm việc", cat: "ban", col: "no3000", mat: "go-soi", color: "kem", price: 16000000, img: "shop-white-table.png", dims: "R 140 × S 70 × C 75 cm" },
    { id: "ghe-egg", name: "Ghế Egg", cat: "ghe-banh", col: "no7000", mat: "vai", color: "xam", price: 27000000, img: "new-egg-chair.png", dims: "R 86 × S 80 × C 107 cm", tag: "Bán chạy" },
    { id: "ghe-nam-thu-gian", name: "Ghế nằm thư giãn", cat: "sofa", col: "no7000", mat: "vai", color: "xam", price: 32000000, img: "new-chaise.png", dims: "R 70 × S 160 × C 85 cm" },
    { id: "giuong-ngu", name: "Giường ngủ thấp", cat: "giuong", col: "no5100", mat: "go-oc-cho", color: "nau-tram", price: 45000000, img: "shop-modern-bed.png", dims: "R 180 × D 200 cm" },
    { id: "ban-gap", name: "Bàn gấp", cat: "ban", col: "no3000", mat: "go-soi", color: "tu-nhien", price: 7500000, img: "best-2.png", dims: "R 90 × S 60 × C 74 cm" },
    { id: "ghe-an-hien-dai", name: "Ghế ăn hiện đại", cat: "ghe-an", col: "no6000", mat: "da", color: "den", price: 7900000, img: "best-5.png", dims: "R 47 × S 54 × C 84 cm" },
    { id: "ban-ben", name: "Bàn bên cổ điển", cat: "ban", col: "no5100", mat: "go-oc-cho", color: "nau-tram", price: 8200000, img: "best-8.png", dims: "R 60 × S 60 × C 70 cm" },
    { id: "ghe-don", name: "Ghế đôn", cat: "ghe-an", col: "no3000", mat: "go-soi", color: "tu-nhien", price: 3900000, img: "hero-card-2.png", dims: "Ø 35 × C 46 cm" },
    { id: "ghe-banh-boc-vai", name: "Ghế bành bọc vải", cat: "ghe-banh", col: "no7000", mat: "vai", color: "kem", price: 19000000, img: "best-3.png", dims: "R 78 × S 82 × C 80 cm" },
    { id: "ghe-bap-benh", name: "Ghế bập bênh", cat: "ghe-banh", col: "no5100", mat: "go-oc-cho", color: "nau-tram", price: 15500000, img: "best-7.png", dims: "R 66 × S 90 × C 96 cm" }
  ];

  // Living concepts: scene image + products shown, with hotspot positions (% of scene)
  var concepts = [
    { id: "20-30", area: "20–30", title: "Căn hộ nhỏ, sống trọn vẹn", text: "Đồ nội thất gọn, đa năng và nhẹ về thị giác để căn phòng luôn thoáng.", img: "room-living.png",
      items: [["ghe-banh-boc-vai", 28, 62], ["ban-tra-tron", 50, 74], ["ghe-don", 72, 70], ["tu-dau-giuong", 86, 58]] },
    { id: "30-40", area: "30–40", title: "Phòng khách cho những buổi tụ họp", text: "Một bộ ghế bành làm tâm điểm, bàn trà thấp và ánh sáng ấm.", img: "hero.png",
      items: [["ghe-banh-classic", 24, 64], ["ghe-egg", 44, 58], ["ban-ben", 62, 72], ["ghe-bap-benh", 80, 60]] },
    { id: "40-50", area: "40–50", title: "Không gian mở rộng rãi", text: "Phòng khách liền phòng ăn, phân vùng tự nhiên bằng đồ nội thất.", img: "about-live-comfortably.png",
      items: [["ghe-nam-thu-gian", 22, 66], ["ban-lam-viec", 46, 62], ["ghe-an-co-dien", 60, 66], ["ghe-banh-khung-cong", 80, 64]] },
    { id: "gia-dinh", area: "Gia đình", title: "Ngôi nhà cho cả gia đình", text: "Chất liệu bền, dễ chăm sóc, an toàn cho trẻ nhỏ.", img: "room-bedroom.png",
      items: [["giuong-ngu", 40, 70], ["tu-dau-giuong", 70, 66], ["ghe-thu-gian-papasan", 84, 60]] },
    { id: "bep-an", area: "Bếp – ăn", title: "Bàn ăn là trái tim ngôi nhà", text: "Bàn gỗ đặc và ghế ăn ôm lưng cho những bữa cơm dài.", img: "room-kitchen.png",
      items: [["ban-gap", 40, 70], ["ghe-an-hien-dai", 26, 66], ["ghe-quay-bar", 62, 62], ["ghe-an-co-dien", 78, 68]] }
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

  function productImg(p, alt) {
    return '<img class="cutout" src="' + IMG + p.img + '" alt="' + esc(alt == null ? p.name : alt) + '" loading="lazy">';
  }

  function card(p) {
    var col = find(collections, p.col);
    var cat = find(categories, p.cat);
    return '<a class="pcard" href="product.html?id=' + p.id + '">' +
      '<div class="pcard__img">' + productImg(p) + (p.tag ? '<span class="pcard__tag">' + esc(p.tag) + "</span>" : "") + "</div>" +
      '<div class="pcard__body"><div>' +
        '<h3 class="pcard__name">' + esc(p.name) + "</h3>" +
        '<p class="pcard__meta">' + nt(col.no) + " · " + esc(cat.name) + "</p>" +
      '</div><p class="pcard__price">' + vnd(p.price) + "</p></div></a>";
  }

  // Active language (phase 1: read from the googtrans cookie set by js/i18n.js)
  var lang = (function () {
    var m = document.cookie.match(/(?:^|;\s*)googtrans=\/[a-z-]+\/([a-zA-Z-]+)/);
    var c = m ? m[1] : "vi";
    return site.languages.some(function (l) { return l.code === c; }) ? c : "vi";
  })();

  // Hand-written label for the active language, protected from machine translation.
  // Usage: HM.t({ vi: "Thương hiệu", en: "Brand", ja: "ブランド" })
  function t(dict) {
    var text = dict[lang] || dict.vi;
    return lang === "vi" ? esc(text) : '<span class="notranslate" translate="no">' + esc(text) + "</span>";
  }

  // Wrap brand terms / collection numbers so machine translation leaves them alone
  function nt(text) { return '<span class="notranslate" translate="no">' + esc(text) + "</span>"; }

  function param(name) { return new URLSearchParams(location.search).get(name); }

  return {
    IMG: IMG, site: site, categories: categories, materials: materials, colors: colors,
    collections: collections, products: products, concepts: concepts, news: news,
    vnd: vnd, find: find, esc: esc, nt: nt, t: t, lang: lang, productImg: productImg, card: card, param: param
  };
})();

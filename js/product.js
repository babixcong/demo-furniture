/* Product detail: renders product.html?id=<product id> from the catalogue (js/catalog.js). */
(function () {
  var HM = window.HM;
  var p = HM.find(HM.products, HM.param("id")) || HM.products[0];
  var col = p.col ? HM.find(HM.collections, p.col) : null;
  var cat = HM.find(HM.categories, p.cat);
  var $ = function (id) { return document.getElementById(id); };
  var EN = HM.lang === "en";

  document.title = p.name + " " + p.code + " — Hamamoto";
  $("crumbs").insertAdjacentHTML("beforeend",
    '<li><a href="shop.html?category=' + cat.id + '">' + HM.label(cat) + "</a></li><li>" + HM.nt(p.name) + "</li>");
  $("pdp-collection").innerHTML = HM.nt(p.series) + (col ? " " + HM.label(col) : "") + " · " + HM.label(cat);
  $("pdp-collection").href = col ? "collections.html#" + col.id : "shop.html?category=" + cat.id;
  $("pdp-name").innerHTML = HM.nt(p.name);
  $("pdp-code").innerHTML = (EN ? HM.nt("Model No.") : "Mã sản phẩm") + " " + HM.nt(p.code);

  $("pdp-main").innerHTML = HM.productImg(p, p.name + " " + p.code).replace(' loading="lazy"', "");
  if (p.note) { $("pdp-note").hidden = false; $("pdp-note").innerHTML = HM.txt(p.note); }

  // Spec sections, as written in the catalogue (VI, or the official EN text when EN is active)
  function list(o) { return HM.tx(o).map(function (t) { return "<li>" + (EN ? HM.nt(t) : HM.esc(t)) + "</li>"; }).join(""); }
  $("pdp-dims").innerHTML = list(p.dims);
  $("pdp-materials").innerHTML = list(p.materials);
  $("pdp-features").innerHTML = list(p.features);

  // Options summary (upholstery types + frame finishes)
  if (p.uph.length) {
    $("opt-uph").innerHTML = p.uph.map(function (id) { return "<span>" + HM.label(HM.find(HM.materials, id)) + "</span>"; }).join("");
  } else $("opt-uph-wrap").hidden = true;
  if (p.finishes.length) {
    $("opt-finish").innerHTML = p.finishes.map(function (id) {
      var c = HM.find(HM.colors, id);
      return '<span><i style="--c:' + c.hex + '"></i>' + HM.label(c) + "</span>";
    }).join("");
  } else $("opt-finish-wrap").hidden = true;

  var q = "?product=" + p.id;
  $("cta-book").href = "contact.html" + q + "#booking";
  $("cta-contact").href = "contact.html" + q + "&purpose=consult#booking";

  // Related: same collection, else same category
  var related = HM.products.filter(function (x) { return x.id !== p.id && (col ? x.col === p.col : x.cat === p.cat); }).slice(0, 4);
  if (!related.length) related = HM.products.filter(function (x) { return x.id !== p.id && x.cat === p.cat; }).slice(0, 4);
  $("related").innerHTML = related.map(HM.card).join("");
  $("related-eyebrow").textContent = col ? "Cùng bộ sưu tập " + col.no : "Cùng nhóm hàng";
  $("related-link").href = col ? "collections.html#" + col.id : "shop.html?category=" + cat.id;
  if (!related.length) $("related").closest("section").hidden = true;
})();

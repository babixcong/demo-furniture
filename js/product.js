/* Product detail: renders product.html?id=<product id> from HM.products. */
(function () {
  var HM = window.HM;
  var p = HM.find(HM.products, HM.param("id")) || HM.products[0];
  var col = HM.find(HM.collections, p.col);
  var cat = HM.find(HM.categories, p.cat);
  var mat = HM.find(HM.materials, p.mat);
  var $ = function (id) { return document.getElementById(id); };

  document.title = p.name + " " + col.no + " — Hamamoto";
  $("crumbs").insertAdjacentHTML("beforeend", "<li>" + HM.esc(p.name) + "</li>");
  $("pdp-collection").innerHTML = HM.nt(col.no) + " · " + HM.esc(cat.name);
  $("pdp-collection").href = "collections.html#" + col.id;
  $("pdp-name").textContent = p.name;
  $("pdp-price").textContent = "Từ " + HM.vnd(p.price);
  $("pdp-desc").textContent = "Thuộc bộ sưu tập " + col.no + " — " + col.name.toLowerCase() + ". " + col.text;

  // Gallery: cut-out + lifestyle shots (collection + concepts featuring the product)
  var shots = [{ cutout: true, src: p.img }, { src: col.img }];
  HM.concepts.forEach(function (c) {
    if (shots.length < 4 && c.items.some(function (i) { return i[0] === p.id; }) && c.img !== col.img) shots.push({ src: c.img });
  });
  ["cat-tables.png", "cat-chairs.png"].forEach(function (s) { if (shots.length < 4) shots.push({ src: s }); });

  function shotImg(s, alt) {
    return '<img class="' + (s.cutout ? "cutout" : "is-photo") + '" src="' + HM.IMG + s.src + '" alt="' + HM.esc(alt) + '">';
  }
  function show(i) {
    $("pdp-main").innerHTML = shotImg(shots[i], p.name);
    $("pdp-thumbs").querySelectorAll("button").forEach(function (b, j) { b.setAttribute("aria-pressed", String(i === j)); });
  }
  $("pdp-thumbs").innerHTML = shots.map(function (s, i) {
    return '<button type="button" aria-label="Ảnh ' + (i + 1) + '">' + shotImg(s, "") + "</button>";
  }).join("");
  $("pdp-thumbs").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (b) show(Array.prototype.indexOf.call(b.parentNode.children, b));
  });
  show(0);

  // Options: wood products offer both woods; upholstered pieces offer leather/fabric
  var isWood = p.mat === "go-soi" || p.mat === "go-oc-cho";
  var matOpts = HM.materials.filter(function (m) { return isWood ? /^go-/.test(m.id) : !/^go-/.test(m.id); });
  $("opt-material").innerHTML = matOpts.map(function (m) {
    return '<label><input type="radio" name="material" value="' + m.id + '"' + (m.id === p.mat ? " checked" : "") + "><span>" + m.name + "</span></label>";
  }).join("");
  $("opt-color").innerHTML = HM.colors.map(function (c) {
    return '<label title="' + c.name + '"><input type="radio" name="color" value="' + c.id + '"' + (c.id === p.color ? " checked" : "") + ' aria-label="' + c.name + '"><i style="--c:' + c.hex + '"></i></label>';
  }).join("");

  function updateChoice() {
    var f = $("pdp-options");
    var m = HM.find(HM.materials, f.material.value), c = HM.find(HM.colors, f.color.value);
    $("mat-label").textContent = m.name;
    $("color-label").textContent = c.name;
    var q = "?product=" + p.id + "&material=" + m.id + "&color=" + c.id;
    $("cta-book").href = "showroom.html" + q + "#booking";
    $("cta-contact").href = "contact.html" + q;
  }
  $("pdp-options").addEventListener("change", updateChoice);
  updateChoice();

  var specs = [
    ["Bộ sưu tập", col.no + " — " + col.name],
    ["Nhóm hàng", cat.name],
    ["Kích thước", p.dims],
    ["Chất liệu tiêu chuẩn", mat.name],
    ["Hoàn thiện", isWood ? "Dầu tự nhiên, phủ mờ" : "Bọc tháo rời, khung gỗ sồi"],
    ["Bảo hành", "10 năm khung, 2 năm bọc"],
    ["Thời gian đặt làm", "6 – 8 tuần"]
  ];
  $("pdp-specs").innerHTML = specs.map(function (s) { return "<div><dt>" + s[0] + "</dt><dd>" + HM.esc(s[1]) + "</dd></div>"; }).join("");

  var related = HM.products.filter(function (x) { return x.col === p.col && x.id !== p.id; }).slice(0, 4);
  $("related").innerHTML = related.map(HM.card).join("");
  $("related-link").href = "collections.html#" + col.id;
})();

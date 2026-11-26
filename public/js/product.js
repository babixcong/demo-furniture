/* Product detail: renders product.html?id=<product id> from the catalogue (js/catalog.js).
   Gallery · options (size / wood finish / upholstery) · quantity → "Thêm vào yêu cầu báo giá"
   (HM.store, listed on quote.html) · spec table · about the collection · related products. */
(function () {
  var HM = window.HM;
  var p = HM.find(HM.products, HM.param("id")) || HM.products[0];
  var col = p.col ? HM.find(HM.collections, p.col) : null;
  var cat = HM.find(HM.categories, p.cat);
  var $ = function (id) { return document.getElementById(id); };
  var EN = HM.lang === "en";
  var groups = HM.options(p);

  // the visitor's choice
  var sel = { finish: p.finishes[0] || "", uph: "", opts: groups.map(function () { return 0; }) };

  document.title = p.name + " " + p.code + " — Hamamoto";
  $("crumbs").insertAdjacentHTML("beforeend",
    '<li><a href="shop.html?category=' + cat.id + '">' + HM.label(cat) + "</a></li>" +
    (col ? '<li><a href="collections.html#' + col.id + '">' + HM.nt(col.no) + "</a></li>" : "") +
    "<li>" + HM.nt(p.code) + "</li>");

  // ---------- Heading ----------
  $("pdp-eyebrow").innerHTML = HM.eyebrow(p);
  $("pdp-name").innerHTML = HM.nt(p.name) + "<br>" + HM.nt(p.code);
  $("pdp-status").innerHTML = (HM.displayed(p) ? HM.badge() : '<span class="status-dot status-dot--off">Đặt theo đơn</span>') +
    '<span class="pdp__code">' + HM.nt(p.code) + "</span>";
  var feats = HM.tx(p.features);
  $("pdp-lead").innerHTML = feats[0] ? (EN ? HM.nt(feats[0]) : HM.esc(feats[0])) : "";
  if (p.note) { $("pdp-note").hidden = false; $("pdp-note").innerHTML = HM.txt(p.note); }

  // ---------- Gallery: product photo, then showroom scenes with this product, then the collection ----------
  var shots = [{ src: "assets/" + p.img, alt: p.name + " " + p.code, photo: true }];
  HM.concepts.forEach(function (c) {
    if (c.items.some(function (it) { return it[0] === p.id; })) shots.push({ src: HM.IMG + c.img, alt: c.title });
  });
  if (col && shots.every(function (s) { return s.src !== HM.IMG + col.img; })) shots.push({ src: HM.IMG + col.img, alt: col.no + " " + col.name });
  shots = shots.slice(0, 4);
  var main = $("pdp-main");
  function show(i) {
    var s = shots[i];
    var old = main.querySelector("img");
    if (old) old.remove();
    main.insertAdjacentHTML("afterbegin", '<img class="' + (s.photo ? "photo" : "scene") + '" src="' + s.src + '" alt="' + HM.esc(s.alt) + '">');
    main.classList.toggle("is-scene", !s.photo);
    $("pdp-thumbs").querySelectorAll("button").forEach(function (b, k) { b.setAttribute("aria-pressed", String(k === i)); });
  }
  if (shots.length > 1) {
    $("pdp-thumbs").innerHTML = shots.map(function (s, i) {
      return '<button type="button" aria-label="Ảnh ' + (i + 1) + '"><img class="' + (s.photo ? "photo" : "scene") + '" src="' + s.src + '" alt="" loading="lazy"></button>';
    }).join("");
    $("pdp-thumbs").addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (b) show(Array.prototype.indexOf.call(b.parentNode.children, b));
    });
  } else $("pdp-thumbs").hidden = true;
  show(0);

  // ---------- Size / option groups (catalogue lines marked "có thể chọn") ----------
  var dimsLine = HM.sizeText(p, null, true);
  if (groups.length) {
    $("pdp-groups").innerHTML = groups.map(function (g, gi) {
      return '<section class="pdp__group"><div class="pdp__group-head"><h2 id="g' + gi + '">' + (gi === 0 && g.seat ? "Kích thước" : HM.esc(g.label)) + "</h2>" +
        "<span>" + g.values.length + " lựa chọn</span></div>" +
        '<div class="size-pick" role="radiogroup" aria-labelledby="g' + gi + '">' +
        g.values.map(function (v, vi) {
          return '<button type="button" role="radio" data-g="' + gi + '" data-v="' + vi + '" aria-checked="' + (vi === 0) + '">' +
            (v.code ? '<b class="notranslate" translate="no">' + HM.esc(v.code) + "</b>" : "") +
            "<span><strong>" + (g.seat ? "Cao mặt ngồi " : "") + HM.esc(v.text) + "</strong>" +
            (v.sub ? "<small>" + HM.esc(v.sub) + "</small>" : "") + "</span></button>";
        }).join("") + "</div></section>";
    }).join("");
    $("pdp-groups").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-g]");
      if (!b) return;
      var gi = +b.getAttribute("data-g");
      sel.opts[gi] = +b.getAttribute("data-v");
      b.parentNode.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-checked", String(x === b)); });
    });
  } else if (dimsLine) {
    // one fixed size: show it the same way, not selectable
    $("pdp-groups").innerHTML = '<section class="pdp__group"><div class="pdp__group-head"><h2>Kích thước</h2><span>1 cỡ</span></div>' +
      '<div class="size-pick"><div class="size-pick__one"><span><strong>' + HM.esc(dimsLine) + "</strong></span></div></div></section>";
  }

  // ---------- Wood finish ----------
  function paintFinish() {
    var parts = HM.finishParts(sel.finish);
    $("opt-finish-name").innerHTML = HM.nt(parts[0]) + (parts[1] ? " · " + HM.esc(parts[1]) : "");
    var tag = $("pdp-tag");
    tag.hidden = !sel.finish;
    tag.innerHTML = "Màu " + HM.nt(parts[0]) + (parts[1] ? " · " + HM.esc(parts[1]) : "");
    $("opt-finish").querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-checked", String(b.getAttribute("data-f") === sel.finish)); });
  }
  if (p.finishes.length) {
    $("opt-finish").innerHTML = p.finishes.map(function (id) {
      var c = HM.find(HM.colors, id);
      return '<button type="button" role="radio" data-f="' + id + '" style="--c:' + c.hex + '" aria-label="' + HM.esc(c.name) + '" title="' + HM.esc(c.name) + '"></button>';
    }).join("");
    $("opt-finish").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-f]");
      if (b) { sel.finish = b.getAttribute("data-f"); paintFinish(); }
    });
    paintFinish();
  } else $("opt-finish-wrap").hidden = true;

  // ---------- Upholstery type (optional: may be left for the consultation) ----------
  if (p.uph.length) {
    $("opt-uph").innerHTML = p.uph.map(function (id) {
      return '<button type="button" role="radio" data-u="' + id + '" aria-checked="false">' + HM.label(HM.find(HM.materials, id)) + "</button>";
    }).join("");
    $("opt-uph").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-u]");
      if (!b) return;
      var id = b.getAttribute("data-u");
      sel.uph = sel.uph === id ? "" : id; // click again = decide later
      $("opt-uph").querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-checked", String(x.getAttribute("data-u") === sel.uph)); });
    });
  } else $("opt-uph-wrap").hidden = true;

  // ---------- Quantity + add to quote ----------
  var qty = $("qty");
  var stepBtns = $("pdp-qty").querySelectorAll("button");
  stepBtns[0].innerHTML = HM.ICON.minus;
  stepBtns[1].innerHTML = HM.ICON.plus;
  function clampQty() { qty.value = Math.max(1, Math.min(99, parseInt(qty.value, 10) || 1)); }
  $("pdp-qty").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-step]");
    if (!b) return;
    qty.value = (parseInt(qty.value, 10) || 1) + +b.getAttribute("data-step");
    clampQty();
  });
  qty.addEventListener("change", clampQty);

  var add = $("pdp-add"), addLabel = add.textContent, addT;
  add.addEventListener("click", function () {
    clampQty();
    HM.store.add({ id: p.id, finish: sel.finish, uph: sel.uph, opts: sel.opts.slice(), qty: +qty.value });
    add.classList.add("is-done");
    add.innerHTML = HM.ICON.check + " Đã thêm vào danh sách";
    clearTimeout(addT);
    addT = setTimeout(function () { add.classList.remove("is-done"); add.textContent = addLabel; }, 2200);
    HM.toast("Đã thêm " + qty.value + " × <b>" + HM.esc(p.name + " " + p.code) + '</b> vào yêu cầu báo giá. <a href="quote.html">Xem danh sách</a>');
    qty.value = 1;
  });

  // Contact tiles
  $("cta-zalo").href = HM.site.chat.zalo;
  $("cta-call").href = HM.site.showroom.phoneHref;
  $("cta-book").href = "contact.html?product=" + p.id + "#booking";

  // ---------- Spec table ----------
  function list(o) { return HM.tx(o).map(function (t) { return "<li>" + (EN ? HM.nt(t) : HM.esc(t)) + "</li>"; }).join(""); }
  var rows = [
    ["Mã sản phẩm", HM.nt(p.code) + "<small>" + HM.nt(p.series) + " · " + HM.label(cat) + "</small>"],
    ["Bộ sưu tập", col ? '<a href="collections.html#' + col.id + '">' + HM.nt(col.no) + " " + HM.label(col) + "</a>" : HM.nt(p.series)],
    ["Kích thước", "<ul>" + list(p.dims) + "</ul>"],
    ["Vật liệu chính", "<ul>" + list(p.materials) + "</ul>"],
    ["Màu hoàn thiện", p.finishes.length ? p.finishes.map(function (id) { return HM.dot(id) + HM.finishName(id); }).join("<br>") : "—"],
    ["Chất liệu bọc", p.uph.length ? p.uph.map(function (id) { return HM.label(HM.find(HM.materials, id)); }).join(" · ") : "Không bọc (gỗ)"],
    ["Tính năng", "<ul>" + list(p.features) + "</ul>"],
    ["Tình trạng", HM.displayed(p) ? HM.badge() : "Đặt theo đơn · liên hệ để xem mẫu vật liệu"],
    ["Xuất xứ", "Sản xuất tại Nhật Bản<small>Nhà máy Hamamoto, Hiroshima</small>"]
  ];
  $("spec-grid").innerHTML = rows.map(function (r) {
    return '<div class="spec__row"><span class="spec__k">' + r[0] + '</span><div class="spec__v">' + r[1] + "</div></div>";
  }).join("");

  // ---------- About the collection ----------
  if (col) {
    $("pdp-col").hidden = false;
    $("pdp-col-eyebrow").innerHTML = "Về bộ sưu tập " + HM.nt(col.no);
    $("pdp-col-t").innerHTML = HM.label(col);
    $("pdp-col-text").innerHTML = EN && col.textEn ? HM.nt(col.textEn) : HM.esc(col.text);
    $("pdp-col-link").href = "collections.html#" + col.id;
    $("pdp-col-link").innerHTML = "Xem cả bộ " + HM.nt(col.no) + ' <span aria-hidden="true">→</span>';
    $("pdp-col-img").src = HM.IMG + col.img;
    $("pdp-col-img").alt = col.no + " " + col.name;
    $("pdp-why").innerHTML = HM.why.slice(0, 3).map(function (w) {
      return "<div><h3>" + HM.esc(w.heading) + "</h3><p>" + HM.esc(w.text.split(". ")[0].replace(/\.?$/, ".")) + "</p></div>";
    }).join("");
  }

  // ---------- Related: same collection, else same category ----------
  var related = HM.products.filter(function (x) { return x.id !== p.id && (col ? x.col === p.col : x.cat === p.cat); }).slice(0, 4);
  if (!related.length) related = HM.products.filter(function (x) { return x.id !== p.id && x.cat === p.cat; }).slice(0, 4);
  $("related").innerHTML = related.map(HM.card).join("");
  $("related-eyebrow").textContent = col ? "Cùng bộ sưu tập " + col.no : "Cùng nhóm hàng";
  $("related-link").href = col ? "collections.html#" + col.id : "shop.html?category=" + cat.id;
  if (!related.length) $("related").closest("section").hidden = true;
})();

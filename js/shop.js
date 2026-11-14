/* Sản phẩm listing: search, filters (nhóm hàng / bộ sưu tập / chất liệu / màu),
   sort and pagination over HM.products. Filter state is mirrored in the URL
   (?category=&collection=&material=&color=&q=) so links from menus work. */
(function () {
  var HM = window.HM;
  var PER_PAGE = 9;
  var form = document.getElementById("filters");
  var grid = document.getElementById("product-grid");
  var pager = document.getElementById("pagination");
  var q = document.getElementById("q");

  // filter key -> [product field, option list, url param]
  var FILTERS = {
    cat: ["cat", HM.categories, "category"],
    col: ["col", HM.collections.map(function (c) { return { id: c.id, name: c.no + " " + c.name }; }), "collection"],
    mat: ["mat", HM.materials, "material"],
    color: ["color", HM.colors, "color"]
  };

  var state = { page: 1, sort: "featured", q: "", sel: { cat: [], col: [], mat: [], color: [] } };

  // Build filter checkboxes with real counts
  Object.keys(FILTERS).forEach(function (key) {
    var f = FILTERS[key];
    form.querySelector('[data-filter="' + key + '"]').innerHTML = f[1].map(function (o) {
      var n = HM.products.filter(function (p) { return p[f[0]] === o.id; }).length;
      var dot = key === "color" ? ' class="dot" style="--c:' + o.hex + '"' : "";
      return '<label class="filter-option"><span class="filter-option__label">' +
        '<input type="checkbox" name="' + key + '" value="' + o.id + '"' + dot + ">" + HM.esc(o.name) +
        '</span><span class="count">' + n + "</span></label>";
    }).join("");
  });

  // Read initial state from URL
  var params = new URLSearchParams(location.search);
  Object.keys(FILTERS).forEach(function (key) {
    var v = params.get(FILTERS[key][2]);
    if (!v) return;
    v.split(",").forEach(function (id) {
      var box = form.querySelector('input[name="' + key + '"][value="' + id + '"]');
      if (box) { box.checked = true; state.sel[key].push(id); }
    });
  });
  state.q = (params.get("q") || "").trim();
  q.value = state.q;

  function norm(s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d"); }

  function matches(p) {
    for (var key in state.sel) {
      var sel = state.sel[key];
      if (sel.length && sel.indexOf(p[FILTERS[key][0]]) < 0) return false;
    }
    if (state.q) {
      var col = HM.find(HM.collections, p.col);
      var hay = norm(p.name + " " + col.no + " " + col.name + " " + HM.find(HM.categories, p.cat).name);
      if (hay.indexOf(norm(state.q)) < 0) return false;
    }
    return true;
  }

  function syncUrl() {
    var u = new URLSearchParams();
    Object.keys(FILTERS).forEach(function (k) { if (state.sel[k].length) u.set(FILTERS[k][2], state.sel[k].join(",")); });
    if (state.q) u.set("q", state.q);
    var s = u.toString();
    history.replaceState(null, "", location.pathname + (s ? "?" + s : ""));
  }

  function render() {
    var list = HM.products.filter(matches);
    if (state.sort === "price-asc") list.sort(function (a, b) { return a.price - b.price; });
    if (state.sort === "price-desc") list.sort(function (a, b) { return b.price - a.price; });
    if (state.sort === "name") list.sort(function (a, b) { return a.name.localeCompare(b.name, "vi"); });

    var pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    state.page = Math.min(state.page, pages);
    var start = (state.page - 1) * PER_PAGE;
    grid.innerHTML = list.slice(start, start + PER_PAGE).map(HM.card).join("");
    document.getElementById("listing-empty").hidden = list.length > 0;
    document.getElementById("result-count").textContent = list.length + " sản phẩm";

    var html = "";
    if (pages > 1) for (var i = 1; i <= pages; i++) {
      html += '<button type="button" class="page-btn" data-page="' + i + '"' + (i === state.page ? ' aria-current="page"' : "") + ">" + i + "</button>";
    }
    pager.innerHTML = html;
    syncUrl();
  }

  form.addEventListener("change", function () {
    Object.keys(FILTERS).forEach(function (k) {
      state.sel[k] = Array.prototype.map.call(form.querySelectorAll('input[name="' + k + '"]:checked'), function (i) { return i.value; });
    });
    state.page = 1;
    render();
  });
  form.addEventListener("reset", function () {
    setTimeout(function () { form.dispatchEvent(new Event("change")); }, 0);
  });

  var t;
  q.addEventListener("input", function () {
    clearTimeout(t);
    t = setTimeout(function () { state.q = q.value.trim(); state.page = 1; render(); }, 200);
  });

  document.getElementById("sort").addEventListener("change", function (e) { state.sort = e.target.value; render(); });

  pager.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-page]");
    if (!b) return;
    state.page = +b.getAttribute("data-page");
    render();
    document.getElementById("listing").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  var toggle = document.querySelector(".filters__toggle");
  toggle.addEventListener("click", function () {
    var open = form.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  render();
})();

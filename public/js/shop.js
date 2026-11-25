/* Sản phẩm listing: search, filters (nhóm hàng / bộ sưu tập / chất liệu / màu),
   sort and pagination over HM.products. The whole state is mirrored in the URL
   (?category=&collection=&material=&color=&q=&sort=&page=) so links from menus
   work, a reload keeps it, and Back/Forward step through filter/page changes. */
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
    col: ["col", HM.collections.map(function (c) { return { id: c.id, name: c.no + " " + c.name, en: c.no + " " + c.en }; }), "collection"],
    mat: ["mat", HM.materials, "material"],
    color: ["color", HM.colors, "color"]
  };

  var state = { page: 1, sort: "featured", q: "", sel: { cat: [], col: [], mat: [], color: [] } };

  // Build filter checkboxes with real counts (the category filter is the grid above the listing)
  Object.keys(FILTERS).forEach(function (key) {
    var f = FILTERS[key];
    var box = form.querySelector('[data-filter="' + key + '"]');
    if (!box) return;
    box.innerHTML = f[1].map(function (o) {
      var n = HM.products.filter(function (p) { return has(p[f[0]], o.id); }).length;
      var dot = key === "color" ? ' class="dot" style="--c:' + o.hex + '"' : "";
      return '<label class="filter-option"><span class="filter-option__label">' +
        '<input type="checkbox" name="' + key + '" value="' + o.id + '"' + dot + ">" + HM.label(o) +
        '</span><span class="count">' + n + "</span></label>";
    }).join("");
  });

  // Category grid (same look as the home page): one category at a time, or "all"
  var cats = document.getElementById("shop-cats");
  var catCell = function (id, name, n, extra) {
    return '<button type="button" class="cat-grid__cell' + (extra || "") + '" data-cat="' + id + '" aria-pressed="false">' + HM.catIcon(id, 26) +
      '<span class="cat-grid__name">' + name + '</span><span class="cat-grid__count">' + n + " mẫu</span></button>";
  };
  cats.innerHTML = HM.categories.map(function (c) {
    return catCell(c.id, HM.label(c), HM.products.filter(function (p) { return p.cat === c.id; }).length);
  }).join("") + catCell("all", "Tất cả sản phẩm", HM.products.length, " cat-grid__cell--all");
  cats.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-cat]");
    if (!b) return;
    var id = b.getAttribute("data-cat");
    // clicking the active category again goes back to all products
    state.sel.cat = id === "all" || (state.sel.cat.length === 1 && state.sel.cat[0] === id) ? [] : [id];
    state.page = 1;
    render(true);
  });
  function paintCats() {
    cats.querySelectorAll("button[data-cat]").forEach(function (b) {
      var id = b.getAttribute("data-cat");
      var on = id === "all" ? !state.sel.cat.length : state.sel.cat.indexOf(id) > -1;
      b.setAttribute("aria-pressed", String(on));
    });
  }

  var sortEl = document.getElementById("sort");
  var SORTS = ["featured", "name", "code"];

  // Read state from the URL (on load and on Back/Forward) and reflect it in the controls
  function readUrl() {
    var params = new URLSearchParams(location.search);
    Object.keys(FILTERS).forEach(function (key) {
      var ids = (params.get(FILTERS[key][2]) || "").split(",");
      state.sel[key] = [];
      var boxes = form.querySelectorAll('input[name="' + key + '"]');
      if (!boxes.length) {
        // no checkboxes (category grid): keep the valid ids from the URL
        state.sel[key] = FILTERS[key][1].filter(function (o) { return ids.indexOf(o.id) > -1; }).map(function (o) { return o.id; });
        return;
      }
      boxes.forEach(function (box) {
        box.checked = ids.indexOf(box.value) > -1;
        if (box.checked) state.sel[key].push(box.value);
      });
    });
    state.q = (params.get("q") || "").trim();
    q.value = state.q;
    var sort = params.get("sort");
    state.sort = SORTS.indexOf(sort) > -1 ? sort : "featured";
    sortEl.value = state.sort;
    state.page = Math.max(1, parseInt(params.get("page"), 10) || 1);
  }
  readUrl();

  // product fields may be a single id or a list of ids (materials, finishes)
  function has(v, id) { return Array.isArray(v) ? v.indexOf(id) > -1 : v === id; }

  function norm(s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d"); }

  function matches(p) {
    for (var key in state.sel) {
      var sel = state.sel[key];
      if (sel.length && !sel.some(function (id) { return has(p[FILTERS[key][0]], id); })) return false;
    }
    if (state.q) {
      var cat = HM.find(HM.categories, p.cat);
      var hay = norm([p.name, p.code, p.series, cat.name, cat.en].join(" "));
      if (hay.indexOf(norm(state.q)) < 0) return false;
    }
    return true;
  }

  // push = new history entry (filter / sort / page clicks); otherwise replace (typing, initial load)
  function syncUrl(push) {
    var u = new URLSearchParams();
    Object.keys(FILTERS).forEach(function (k) { if (state.sel[k].length) u.set(FILTERS[k][2], state.sel[k].join(",")); });
    if (state.q) u.set("q", state.q);
    if (state.sort !== "featured") u.set("sort", state.sort);
    if (state.page > 1) u.set("page", state.page);
    var s = u.toString();
    var url = location.pathname + (s ? "?" + s : "") + location.hash;
    if (url === location.pathname + location.search + location.hash) return;
    history[push ? "pushState" : "replaceState"](null, "", url);
  }

  // Banner heading + text and the breadcrumb follow the category when exactly one is selected
  var titleEl = document.getElementById("listing-title");
  var descEl = document.getElementById("listing-desc");
  var defaultDesc = descEl.textContent;
  var crumbs = document.getElementById("crumbs");
  function updateTitle() {
    var c = state.sel.cat.length === 1 ? HM.find(HM.categories, state.sel.cat[0]) : null;
    titleEl.textContent = c ? c.name : "Tất cả sản phẩm";
    descEl.textContent = c ? c.desc : defaultDesc;
    document.title = (c ? c.name : "Sản phẩm") + " — Hamamoto";
    var last = crumbs.querySelector("li[data-cat]");
    if (last) last.remove();
    if (c) crumbs.insertAdjacentHTML("beforeend", '<li data-cat>' + HM.esc(c.name) + "</li>");
  }

  function render(push) {
    var list = HM.products.filter(matches);
    if (state.sort === "name") list.sort(function (a, b) { return a.name.localeCompare(b.name, "vi"); });
    if (state.sort === "code") list.sort(function (a, b) { return a.code.localeCompare(b.code, "en", { numeric: true }); });

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
    syncUrl(push);
    updateTitle();
    paintCats();
  }

  form.addEventListener("change", function () {
    Object.keys(FILTERS).forEach(function (k) {
      if (!form.querySelector('[data-filter="' + k + '"]')) return; // category comes from the grid
      state.sel[k] = Array.prototype.map.call(form.querySelectorAll('input[name="' + k + '"]:checked'), function (i) { return i.value; });
    });
    state.page = 1;
    render(true);
  });
  // "Xóa bộ lọc" clears the category too
  form.addEventListener("reset", function () {
    state.sel.cat = [];
    setTimeout(function () { form.dispatchEvent(new Event("change")); }, 0);
  });

  var t;
  q.addEventListener("input", function () {
    clearTimeout(t);
    t = setTimeout(function () { state.q = q.value.trim(); state.page = 1; render(); }, 200);
  });

  sortEl.addEventListener("change", function () { state.sort = sortEl.value; state.page = 1; render(true); });

  pager.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-page]");
    if (!b) return;
    var n = +b.getAttribute("data-page");
    if (n === state.page) return;
    // page change: cover with the site loader, swap the products and jump to the listing underneath
    HM.loader.flash(function () {
      state.page = n;
      render(true);
      document.getElementById("listing").scrollIntoView({ behavior: "instant", block: "start" });
    });
  });

  var toggle = document.querySelector(".filters__toggle");
  toggle.addEventListener("click", function () {
    var open = form.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  window.addEventListener("popstate", function () { readUrl(); render(); });

  render();
})();

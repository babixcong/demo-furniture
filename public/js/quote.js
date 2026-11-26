/* quote.html — "Danh sách của bạn": the quote list (HM.store.quote) plus the "Gửi yêu cầu báo giá" form. The form itself is handled by js/main.js (data-form="quote" →
   POST /api/quote); this file keeps the hidden "items" field in step with the list and clears the
   list once the request has been sent. */
(function () {
  var HM = window.HM, S = HM.store;
  var $ = function (id) { return document.getElementById(id); };
  var form = $("quote-form");

  // ---------- Rows ----------
  // configuration text of one quote line: size / options · finish · upholstery
  function config(it) {
    var p = HM.find(HM.products, it.id), groups = HM.options(p), parts = [];
    var seat = groups[0] && groups[0].seat ? groups[0].values[it.opts[0] || 0] : null;
    if (seat) parts.push(seat.sub.replace(/^Rộng (\S+) × Sâu (\S+) × Cao (\S+)/, "R $1 × S $2 × C $3"));
    else {
      var size = HM.sizeText(p);
      if (size && !/^Ø/.test(size)) parts.push(size);
      groups.forEach(function (g, gi) {
        var v = g.values[it.opts[gi] || 0];
        if (v) parts.push(g.label + " " + v.text);
      });
    }
    if (it.finish) { var f = HM.finishParts(it.finish); parts.push("Màu " + f[0] + (f[1] ? " " + f[1] : "")); }
    if (it.uph) parts.push("Bọc " + HM.find(HM.materials, it.uph).name);
    return parts.join(" · ");
  }

  function head(p) {
    return '<a class="qrow__img" href="product.html?id=' + p.id + '" tabindex="-1" aria-hidden="true">' + HM.productImg(p, "") + "</a>" +
      '<div class="qrow__info"><span class="pdp__eyebrow">' + HM.eyebrow(p) + "</span>" +
      '<a class="qrow__name" href="product.html?id=' + p.id + '">' + HM.nt(p.name) + " · " + HM.nt(p.code) + "</a>";
  }

  function renderQuote() {
    var list = S.quote();
    $("qlist").innerHTML = list.map(function (it) {
      var p = HM.find(HM.products, it.id);
      return '<li class="qrow" data-key="' + HM.esc(it.key) + '">' + head(p) +
        '<p class="qrow__meta">' + HM.esc(config(it)) + "</p>" +
        '<div class="stepper stepper--sm">' +
          '<button type="button" data-step="-1" aria-label="Giảm số lượng"' + (it.qty <= 1 ? " disabled" : "") + ">" + HM.ICON.minus + "</button>" +
          '<input type="number" value="' + it.qty + '" min="1" max="99" inputmode="numeric" aria-label="Số lượng ' + HM.esc(p.name) + '">' +
          '<button type="button" data-step="1" aria-label="Tăng số lượng">' + HM.ICON.plus + "</button></div>" +
        "</div>" +
        '<button type="button" class="qrow__del" data-del>' + TRASH + "Bỏ</button></li>";
    }).join("");
    $("qempty").hidden = list.length > 0 || !$("qsent").hidden;
    if (list.length) $("qsent").hidden = true;
    var pieces = list.reduce(function (n, x) { return n + x.qty; }, 0);
    $("q-sum").textContent = list.length + " mẫu · " + pieces + " món";
    // what the Worker receives / the sheet stores
    $("q-models").value = list.length;
    $("q-pieces").value = pieces;
    $("q-items").value = list.map(function (it, i) {
      var p = HM.find(HM.products, it.id);
      return (i + 1) + ". " + p.code + " " + p.name + " — " + config(it) + " — SL " + it.qty;
    }).join("\n");
    $("q-submit").disabled = !list.length;
  }

  var TRASH = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>';

  function render() {
    // keep focus on the quantity box while typing / stepping
    var a = document.activeElement, row = a && a.closest(".qrow"), key = row && row.getAttribute("data-key");
    var which = a && a.matches("[data-step='1']") ? "[data-step='1']" : a && a.matches("[data-step='-1']") ? "[data-step='-1']" : a && a.matches("input") ? "input" : null;
    renderQuote();
    if (key && which) {
      var r = $("qlist").querySelector('.qrow[data-key="' + CSS.escape(key) + '"]');
      var el = r && r.querySelector(which);
      if (el && !el.disabled) el.focus();
    }
  }

  // ---------- Actions ----------
  $("qlist").addEventListener("click", function (e) {
    var row = e.target.closest(".qrow");
    if (!row) return;
    var key = row.getAttribute("data-key");
    var step = e.target.closest("[data-step]");
    if (step) {
      var input = row.querySelector("input");
      S.setQty(key, (parseInt(input.value, 10) || 1) + +step.getAttribute("data-step"));
    } else if (e.target.closest("[data-del]")) {
      S.remove(key);
      HM.toast("Đã bỏ khỏi yêu cầu báo giá.");
    }
  });
  $("qlist").addEventListener("change", function (e) {
    if (!e.target.matches("input")) return;
    S.setQty(e.target.closest(".qrow").getAttribute("data-key"), parseInt(e.target.value, 10) || 1);
  });

  // nothing to ask about: stop before main.js validates / sends
  document.addEventListener("submit", function (e) {
    if (e.target !== form || S.quote().length) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    var st = form.querySelector(".form-status");
    st.textContent = "Danh sách đang trống. Hãy chọn ít nhất một sản phẩm.";
    st.classList.add("form-status--error");
  }, true);
  // sent: the request is with the showroom now — say so where the list was, then start a fresh list
  form.addEventListener("hm:sent", function () {
    var sum = $("q-sum").textContent;
    $("qsent-text").textContent = "Chúng tôi đã nhận yêu cầu (" + sum + "). Tư vấn viên sẽ gọi lại trong giờ làm việc để xác nhận cấu hình và gửi báo giá chi tiết.";
    $("qsent").hidden = false;
    S.clear();
    $("qsent").focus({ preventScroll: true });
  });

  document.addEventListener("hm:store", render);
  render();
})();

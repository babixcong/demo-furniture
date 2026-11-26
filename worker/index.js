/**
 * Hamamoto – Cloudflare Worker
 *
 *   POST /api/booking  (contact.html, "Đặt lịch xem showroom")  → Turnstile → Google Sheet khách hàng
 *   POST /api/consult  (contact.html, "Nhận tư vấn")            → Turnstile → Google Sheet khách hàng
 *   POST /api/partner  (professionals.html, "Đăng ký hợp tác")  → Turnstile → Google Sheet đối tác
 *   POST /api/quote    (quote.html, "Gửi yêu cầu báo giá")      → Turnstile → Google Sheet khách hàng
 *   Mọi đường dẫn khác → file tĩnh của website (env.ASSETS, thư mục public/)
 *
 * Biến môi trường (Cloudflare → Worker → Settings → Variables and Secrets, loại Secret):
 *   TURNSTILE_SECRET           Secret key của Turnstile (dùng chung cho mọi form)
 *   SHEET_WEBHOOK_URL          URL Web app (…/exec) của Apps Script gắn với Sheet khách hàng
 *   SHEET_TOKEN                Chuỗi bí mật, trùng với TOKEN trong Apps Script của Sheet khách hàng
 *   PARTNER_SHEET_WEBHOOK_URL  URL Web app của Apps Script gắn với Sheet đối tác
 *                              (bỏ trống thì ghi chung vào Sheet khách hàng)
 *   PARTNER_SHEET_TOKEN        TOKEN của Sheet đối tác (bỏ trống thì dùng SHEET_TOKEN)
 */

// Mỗi form: đường dẫn API, action của widget Turnstile, tên tab (title + ngày gửi,
// vd. "Đặt lịch showroom 25/11/2026"), các trường được nhận (trường khác bị bỏ qua), trường bắt buộc,
// giá trị cho phép của ô chọn (multi = được chọn nhiều, ngăn bởi ", "),
// và tên biến chứa URL/TOKEN của Apps Script nhận dữ liệu.
// Giá trị trong choices phải trùng với value trong HTML (public/contact.html, public/professionals.html, public/quote.html).
const FORMS = {
  booking: {
    path: '/api/booking',
    action: 'contact',
    title: 'Đặt lịch showroom',
    fields: ['name', 'phone', 'email', 'date', 'time', 'interest', 'message'],
    required: ['name', 'phone', 'date', 'time'],
    choices: {
      time: ['09:00 – 10:00', '10:30 – 11:30', '14:00 – 15:00', '15:30 – 16:30', '18:00 – 19:00', '19:30 – 20:30'],
      interest: ['Phòng khách', 'Bếp – ăn', 'Phòng ngủ', 'Trọn bộ căn hộ'],
    },
    multi: ['interest'],
    sheetUrl: 'SHEET_WEBHOOK_URL',
    sheetToken: 'SHEET_TOKEN',
  },
  consult: {
    path: '/api/consult',
    action: 'contact',
    title: 'Nhận tư vấn',
    fields: ['name', 'phone', 'email', 'message'],
    required: ['name', 'phone', 'message'],
    sheetUrl: 'SHEET_WEBHOOK_URL',
    sheetToken: 'SHEET_TOKEN',
  },
  quote: {
    path: '/api/quote',
    action: 'quote',
    title: 'Yêu cầu báo giá',
    fields: ['name', 'phone', 'email', 'city', 'role', 'models', 'pieces', 'items', 'message'],
    required: ['name', 'phone', 'models', 'pieces', 'items'],
    choices: {
      city: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Quảng Ninh', 'Khánh Hòa', 'Tỉnh, thành khác'],
      role: ['Khách mua cho gia đình', 'Kiến trúc sư / nhà thiết kế', 'Doanh nghiệp / dự án'],
    },
    maxLen: { items: 10000 },
    // models = số mẫu, pieces = tổng số món; items = mỗi dòng một mẫu "1. <mã> <tên> — <cấu hình> — SL <n>"
    check: checkQuote,
    sheetUrl: 'SHEET_WEBHOOK_URL',
    sheetToken: 'SHEET_TOKEN',
  },
  partner: {
    path: '/api/partner',
    action: 'partner',
    title: 'Đăng ký đối tác',
    fields: ['name', 'company', 'email', 'phone', 'role', 'project_type', 'message'],
    required: ['name', 'company', 'email', 'phone', 'role'],
    choices: {
      role: ['Kiến trúc sư', 'Nhà thiết kế nội thất', 'Nhà thầu', 'Chủ đầu tư'],
      project_type: ['Căn hộ / nhà ở', 'Biệt thự', 'Khách sạn / resort', 'Văn phòng', 'Nhà hàng / café'],
    },
    sheetUrl: 'PARTNER_SHEET_WEBHOOK_URL',
    sheetToken: 'PARTNER_SHEET_TOKEN',
  },
};
const MAX_LEN = 2000;
// Giống public/js/main.js: SĐT Việt Nam đầu 0, 84 hoặc +84; email dạng ten@congty.vn
const VN_PHONE = /^(?:\+84|84|0)(?:[35789]\d{8}|2\d{9})$/;
const EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const formName = Object.keys(FORMS).find((name) => FORMS[name].path === url.pathname);
    if (formName) {
      try {
        return await handleForm(request, env, formName);
      } catch (err) {
        console.error('Form error', err && err.stack || err);
        return json({ ok: false, error: 'server' }, 500);
      }
    }
    return env.ASSETS.fetch(request);
  },
};

async function handleForm(request, env, formName) {
  if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400);
  }

  // Ô bẫy (honeypot): người thật không thấy ô này nên luôn để trống
  if (body.website) return json({ ok: true });

  const spec = FORMS[formName];
  const data = {};
  for (const key of spec.fields) data[key] = String(body[key] ?? '').trim().slice(0, (spec.maxLen || {})[key] || MAX_LEN);
  if (spec.required.some((k) => !data[k])) return json({ ok: false, error: 'missing_fields' }, 400);
  for (const [key, allowed] of Object.entries(spec.choices || {})) {
    if (!data[key]) continue;
    const picked = (spec.multi || []).includes(key) ? data[key].split(', ') : [data[key]];
    if (picked.some((v) => !allowed.includes(v))) return json({ ok: false, error: 'invalid_choice' }, 400);
  }
  if (data.email && (data.email.length > 254 || !EMAIL.test(data.email) || data.email.includes('..'))) return json({ ok: false, error: 'invalid_email' }, 400);
  data.phone = data.phone.replace(/[\s.()-]/g, '');
  if (!VN_PHONE.test(data.phone)) return json({ ok: false, error: 'invalid_phone' }, 400);
  if ('date' in data && data.date) {
    // Ngày hẹn: đúng định dạng YYYY-MM-DD và từ ngày mai trở đi (giờ Việt Nam)
    if (!ISO_DATE.test(data.date) || data.date <= isoToday()) return json({ ok: false, error: 'invalid_date' }, 400);
    data.date = data.date.split('-').reverse().join('/');
  }

  if (spec.check) {
    const err = spec.check(data);
    if (err) return json({ ok: false, error: err }, 400);
  }

  const captcha = await verifyTurnstile(env, body.turnstileToken, spec.action || formName, request.headers.get('CF-Connecting-IP'));
  if (!captcha.ok) return json({ ok: false, error: 'captcha', reason: captcha.reason }, 403);

  const sheetUrl = env[spec.sheetUrl] || env.SHEET_WEBHOOK_URL;
  const sheetToken = env[spec.sheetToken] || env.SHEET_TOKEN;
  if (!sheetUrl || !sheetToken) {
    console.error(`Thiếu biến ${spec.sheetUrl} hoặc ${spec.sheetToken}`);
    return json({ ok: false, error: 'sheet', reason: 'missing-sheet-config' }, 500);
  }
  const res = await fetch(sheetUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: sheetToken,
      form: formName,
      sheet: `${spec.title} ${formatDate(new Date())}`,
      data,
      meta: { page: request.headers.get('Referer') || '' },
    }),
  });
  const result = await res.json().catch(() => ({}));
  if (!res.ok || !result.ok) {
    console.error('Sheet error', res.status, JSON.stringify(result));
    return json({ ok: false, error: 'sheet' }, 502);
  }
  return json({ ok: true });
}

// Yêu cầu báo giá: số mẫu / số món là số nguyên hợp lệ, và khớp với danh sách sản phẩm gửi kèm
const QUOTE_LINE = /^\d{1,2}\. .+ — SL (\d{1,2})$/;
const MAX_MODELS = 50;
function checkQuote(data) {
  const models = Number(data.models);
  const pieces = Number(data.pieces);
  if (!Number.isInteger(models) || !Number.isInteger(pieces) || models < 1 || models > MAX_MODELS || pieces < models || pieces > MAX_MODELS * 99) {
    return 'invalid_items';
  }
  const lines = data.items.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length !== models) return 'invalid_items';
  let sum = 0;
  for (const line of lines) {
    const m = line.match(QUOTE_LINE);
    if (!m || Number(m[1]) < 1) return 'invalid_items';
    sum += Number(m[1]);
  }
  if (sum !== pieces) return 'invalid_items';
  if (data.name.length < 2) return 'missing_fields';
  return '';
}

async function verifyTurnstile(env, token, action, ip) {
  if (!token) return { ok: false, reason: 'missing-token' };
  if (!env.TURNSTILE_SECRET) {
    console.error('Thiếu biến TURNSTILE_SECRET');
    return { ok: false, reason: 'missing-secret' };
  }
  const params = new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token });
  if (ip) params.set('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: params });
  const r = await res.json().catch(() => ({}));
  // Lý do bị từ chối, trả về cho trình duyệt để dễ tìm lỗi (không chứa khoá)
  let reason = '';
  if (r.success !== true) reason = (r['error-codes'] || ['unknown']).join(',');
  else if (r.action && r.action !== action) reason = 'action-mismatch';
  if (reason) {
    // "secret" chỉ ghi độ dài + 8 ký tự đầu của mã băm SHA-256, không lộ khoá, dùng để so với khoá đúng
    console.warn('Turnstile rejected', JSON.stringify({ reason, action: r.action, hostname: r.hostname, errors: r['error-codes'],
      tokenLength: token.length, secret: await fingerprint(env.TURNSTILE_SECRET) }));
  }
  return { ok: !reason, reason };
}

// Các phần ngày theo giờ Việt Nam
function vnDateParts(date) {
  return Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric' })
      .formatToParts(date).map((x) => [x.type, x.value])
  );
}

// Ngày theo giờ Việt Nam, định dạng d/m/Y: 25/11/2026
function formatDate(date) {
  const p = vnDateParts(date);
  return `${p.day}/${p.month}/${p.year}`;
}

// Hôm nay theo giờ Việt Nam, định dạng YYYY-MM-DD (so sánh được với value của input type="date")
function isoToday() {
  const p = vnDateParts(new Date());
  return `${p.year}-${p.month}-${p.day}`;
}

async function fingerprint(value) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  const hex = [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `length=${value.length} sha256=${hex.slice(0, 8)}`;
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

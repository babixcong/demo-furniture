# Hamamoto website

Static site (HTML/CSS/JS) in `public/`, served by a Cloudflare Worker (`worker/index.js`). The Worker also handles the form API.

```
public/                      website (web root): *.html, css/, js/, assets/, robots.txt, sitemap.xml
worker/index.js              Cloudflare Worker: /api/* forms → Turnstile → Google Sheet; other paths → public/
worker/google-apps-script.gs Apps Script that writes rows into the Google Sheet
wrangler.jsonc               Worker config (assets = ./public, 404 → public/404.html)
```

## Run / deploy

```bash
npx wrangler dev      # local: http://localhost:8787 (forms need .dev.vars, see below)
npx wrangler deploy   # deploy to Cloudflare
```

Opening an HTML file straight from disk (`file://`) runs the forms in demo mode: they show the success message but send nothing.

## Form → Google Sheet

| Form | Page | API | Sheet tab (one per day) |
|---|---|---|---|
| Đặt lịch xem showroom | `contact.html` | `POST /api/booking` | `Đặt lịch showroom 25/11/2026` |
| Nhận tư vấn | `contact.html` | `POST /api/consult` | `Nhận tư vấn 25/11/2026` |
| Đăng ký hợp tác | `professionals.html` | `POST /api/partner` | `Đăng ký đối tác 25/11/2026` |
| Yêu cầu báo giá | `quote.html` | `POST /api/quote` | `Yêu cầu báo giá 25/11/2026` |

Flow: browser → Worker. The Worker checks fields, Vietnamese phone, email, appointment date and allowed choices, then verifies Turnstile. It then calls Apps Script with a secret `TOKEN`, and Apps Script appends the row.

### 1. Cloudflare Turnstile
1. dash.cloudflare.com → **Turnstile** → **Add widget**. Add your domain (and `localhost` for testing). Mode: Managed.
2. Put the **Site Key** in `public/js/data.js` → `site.forms.turnstileSiteKey`. It currently holds the test key `1x00000000000000000000AA`, which always passes.
3. Keep the **Secret Key** for step 3.

### 2. Google Sheet + Apps Script
Use one sheet for customers (booking + consult + quote). Re-paste the Apps Script after updating it so the quote columns exist. You can add a second sheet for partners (partner); otherwise partner rows go to the customer sheet.

For each sheet:
1. Extensions → **Apps Script** → paste in all of `worker/google-apps-script.gs`.
2. Project Settings → **Script Properties** → `TOKEN` = a long random string (for example `openssl rand -hex 32`).
3. Deploy → **New deployment** → Web app, Execute as: **Me**, Who has access: **Anyone**. Copy the URL ending in `/exec`.

When you change the script later, use Deploy → Manage deployments → Edit → **New version**. This keeps the same URL.

### Quote form columns (`Yêu cầu báo giá dd/mm/yyyy` tab)
Thời gian · Họ và tên · Số điện thoại · Email · Tỉnh, thành phố · Khách hàng là · Số mẫu · Tổng số món · Sản phẩm yêu cầu báo giá · Ghi chú · Trang gửi.

"Sản phẩm yêu cầu báo giá" has one line per model: `1. <code> <name> — <size · finish · upholstery> — SL <qty>`. The Worker rejects the request (`invalid_items`) when the lines do not match the model count or the quantities do not add up to the piece count.

### 3. Worker secrets
Cloudflare → Worker → Settings → **Variables and Secrets** (type Secret), or `npx wrangler secret put <NAME>`:

| Name | Value |
|---|---|
| `TURNSTILE_SECRET` | Turnstile Secret Key |
| `SHEET_WEBHOOK_URL` | `/exec` URL of the customer sheet's Apps Script |
| `SHEET_TOKEN` | `TOKEN` of the customer sheet |
| `PARTNER_SHEET_WEBHOOK_URL` | `/exec` URL of the partner sheet (leave empty to use the customer sheet) |
| `PARTNER_SHEET_TOKEN` | `TOKEN` of the partner sheet (leave empty to use `SHEET_TOKEN`) |

For `wrangler dev`, put the same values in a `.dev.vars` file at the repo root (it is git-ignored).

### Notes
- Allowed values for selects and checkboxes (time slots, spaces of interest, roles, project types) are in `FORMS` in `worker/index.js`. They must match the `value`s in the HTML exactly. Update both when you change them.
- When a request is rejected, the Worker returns `error` (and `reason` for captcha). The browser shows a matching message and logs the reason to the console. The Worker logs it too (Workers → Observability).
- The privacy policy page should mention that the forms use Cloudflare Turnstile and that data is stored in Google Sheets.

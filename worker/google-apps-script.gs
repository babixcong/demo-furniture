/**
 * Hamamoto – nhận dữ liệu form từ Cloudflare Worker và ghi vào Google Sheet.
 *
 * Cài đặt (xem README.md ở thư mục gốc, mục "Form → Google Sheet"):
 *   1. Mở Google Sheet → Extensions (Tiện ích mở rộng) → Apps Script → dán toàn bộ file này.
 *   2. Project Settings (biểu tượng bánh răng) → Script Properties → thêm:
 *        TOKEN = <chuỗi bí mật, trùng với SHEET_TOKEN (Sheet khách hàng) hoặc PARTNER_SHEET_TOKEN (Sheet đối tác) trên Cloudflare>
 *   3. Deploy → New deployment → Web app
 *        Execute as: Me   ·   Who has access: Anyone
 *      → copy "Web app URL" (kết thúc bằng /exec).
 *
 * Dùng chung 1 file cho cả 2 Sheet: Sheet khách hàng (form "booking" + "consult")
 * và Sheet đối tác (form "partner"). Có thể dùng 1 Sheet cho cả 3 form nếu không tách.
 * Tên tab do Worker gửi sang (vd. "Đặt lịch showroom 25/11/2026"): mỗi ngày một tab, tự tạo nếu chưa có.
 */

var COLUMNS = {
  booking: [
    ['Thời gian', 'time'],
    ['Họ và tên', 'name'],
    ['Số điện thoại', 'phone'],
    ['Email', 'email'],
    ['Ngày hẹn', 'date'],
    ['Khung giờ', 'slot'],
    ['Không gian quan tâm', 'interest'],
    ['Ghi chú', 'message'],
    ['Trang gửi', 'page'],
  ],
  consult: [
    ['Thời gian', 'time'],
    ['Họ và tên', 'name'],
    ['Số điện thoại', 'phone'],
    ['Email', 'email'],
    ['Câu hỏi', 'message'],
    ['Trang gửi', 'page'],
  ],
  partner: [
    ['Thời gian', 'time'],
    ['Họ và tên', 'name'],
    ['Công ty / Studio', 'company'],
    ['Email', 'email'],
    ['Số điện thoại', 'phone'],
    ['Vai trò', 'role'],
    ['Loại công trình', 'project_type'],
    ['Mô tả dự án', 'message'],
    ['Trang gửi', 'page'],
  ],
};

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var token = PropertiesService.getScriptProperties().getProperty('TOKEN');
    if (!token || body.token !== token) return out({ ok: false, error: 'unauthorized' });

    var cols = COLUMNS[body.form];
    if (!cols) return out({ ok: false, error: 'unknown_form' });

    // "time" của form đặt lịch (khung giờ) đổi thành "slot" để không trùng cột "Thời gian" gửi
    var data = Object.assign({}, body.data);
    if ('time' in data) { data.slot = data.time; delete data.time; }
    var values = Object.assign({}, data, body.meta, { time: new Date() });
    var row = cols.map(function (c) { return clean(values[c[1]]); });

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var sheet = getSheet(body.sheet || body.form, cols);
      sheet.appendRow(row);
    } finally {
      lock.releaseLock();
    }
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

function getSheet(name, cols) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(cols.map(function (c) { return c[0]; }));
    sheet.getRange(1, 1, 1, cols.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    // Cột dữ liệu để dạng chữ, giữ số 0 đầu số điện thoại (cột 1 là thời gian)
    sheet.getRange(1, 2, sheet.getMaxRows(), cols.length - 1).setNumberFormat('@');
  }
  return sheet;
}

// Chặn chèn công thức: ô bắt đầu bằng = + - @ sẽ được thêm dấu ' để Sheet coi là chữ
function clean(v) {
  if (v instanceof Date || typeof v === 'number') return v;
  v = v == null ? '' : String(v);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

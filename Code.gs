// Incolla questo file così com'è in Estensioni → Apps Script del tuo Google Sheet.
// Non serve modificare nulla: il codice segreto qui sotto è già identico a quello
// del file .env.example (variabile APPS_SCRIPT_SECRET da mettere su Vercel).
var SHARED_SECRET = 'MAjVdbFro-CTgcPR9232nx7o8BZgiGKm';
var SHEET_NAME = 'Lead';
var HEADERS = ['Data', 'Nome', 'Cognome', 'Email', 'Libro', 'Ultimo accesso'];

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return json_({ ok: true, info: 'Script attivo. I lead arrivano via POST.' });
}

function doPost(e) {
  var data;
  try { data = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'json' }); }
  if (!data || data.secret !== SHARED_SECRET) return json_({ ok: false, error: 'unauthorized' });
  var email = String(data.email || '').trim().toLowerCase();
  if (!email) return json_({ ok: false, error: 'email' });

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) { sh = ss.insertSheet(SHEET_NAME); sh.appendRow(HEADERS); sh.setFrozenRows(1); }
    var now = new Date();
    var last = sh.getLastRow();
    if (last >= 2) {
      var emails = sh.getRange(2, 4, last - 1, 1).getValues();
      for (var i = 0; i < emails.length; i++) {
        if (String(emails[i][0]).toLowerCase() === email) {
          sh.getRange(i + 2, 2, 1, 2).setValues([[data.nome || '', data.cognome || '']]);
          sh.getRange(i + 2, 6).setValue(now);
          return json_({ ok: true, updated: true });
        }
      }
    }
    sh.appendRow([now, data.nome || '', data.cognome || '', email, data.libro || '', now]);
    return json_({ ok: true, created: true });
  } finally {
    lock.releaseLock();
  }
}

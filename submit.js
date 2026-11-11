// Funzione serverless Vercel: salva il lead sul Google Sheet e SOLO se la
// scrittura riesce restituisce il link del bonus. Il link non è mai nel codice
// della pagina: vive solo nella variabile d'ambiente BONUS_DRIVE_URL (o BONUS_URL).
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LIBRO = 'Gialli dopo Cena - 18 Giochi Investigativi per Coppie';

function clean(v, max) {
  return typeof v === 'string' ? v.trim().replace(/[\u0000-\u001f]/g, '').slice(0, max) : '';
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch (e) { return {}; } }
  return {};
}

module.exports = async function handler(req, res) {
  const send = (status, obj) => { res.status(status).setHeader('Cache-Control', 'no-store'); res.json(obj); };
  if (req.method !== 'POST') return send(405, { ok: false, error: 'Metodo non consentito.' });

  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  const secret = process.env.APPS_SCRIPT_SECRET;
  const bonusUrl = process.env.BONUS_DRIVE_URL || process.env.BONUS_URL;
  if (!scriptUrl || !secret || !bonusUrl) {
    console.error('Variabili d\'ambiente mancanti: GOOGLE_SCRIPT_URL, APPS_SCRIPT_SECRET e BONUS_DRIVE_URL sono obbligatorie.');
    return send(500, { ok: false, error: 'Il servizio non è configurato. Riprovate più tardi.' });
  }

  const b = await readBody(req);
  if (clean(b.website, 200)) return send(400, { ok: false, error: 'Invio non valido.' }); // honeypot
  const nome = clean(b.nome, 80), cognome = clean(b.cognome, 80), email = clean(b.email, 160).toLowerCase();
  if (!nome || !cognome) return send(400, { ok: false, error: 'Scrivete nome e cognome.' });
  if (!EMAIL.test(email)) return send(400, { ok: false, error: 'Controllate l\'indirizzo email.' });
  if (b.consenso !== true) return send(400, { ok: false, error: 'Per ricevere il caso serve il vostro consenso.' });

  try {
    const r = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ secret, nome, cognome, email, libro: LIBRO, timestamp: new Date().toISOString() }),
      redirect: 'follow',
    });
    let j = null;
    try { j = JSON.parse(await r.text()); } catch (e) { j = null; }
    if (!r.ok || !j || j.ok !== true) {
      console.error('Scrittura sul foglio non riuscita:', r.status, j && j.error);
      return send(502, { ok: false, error: 'Non siamo riusciti a registrare i dati. Riprovate tra poco.' });
    }
  } catch (e) {
    console.error('Google Apps Script non raggiungibile:', e && e.message);
    return send(502, { ok: false, error: 'Non siamo riusciti a registrare i dati. Riprovate tra poco.' });
  }
  return send(200, { ok: true, bonusUrl });
};

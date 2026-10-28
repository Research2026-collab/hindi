/**
 * Hindi · 5 Minuten: Lernstand in einer Google-Tabelle
 *
 * Einrichtung (einmalig, etwa fünf Minuten)
 *  1. Neue Google-Tabelle anlegen, z. B. „Hindi Lernstand“.
 *  2. Erweiterungen › Apps Script öffnen, den Inhalt dieser Datei einfügen, speichern.
 *  3. Oben die Funktion „einrichten“ auswählen und auf Ausführen klicken. Google fragt einmal nach Berechtigungen.
 *     Danach steht dein Schlüssel im Ausführungsprotokoll.
 *  4. Bereitstellen › Neue Bereitstellung › Typ „Web-App“.
 *     Ausführen als: Ich. Zugriff: Jeder. Auf „Bereitstellen“ klicken und die Web-App-URL kopieren.
 *  5. In der App unter Einstellungen › Auf allen Geräten die URL und den Schlüssel eintragen.
 *
 * Die Tabelle bekommt drei Blätter:
 *  Lernstand   der vollständige Speicherstand (bitte nicht von Hand ändern)
 *  Lektionen   wann du welche Lektion abgeschlossen hast, mit Satz des Tages
 *  Wörter      alle gelernten Wörter mit Umschrift, Bedeutung und Lernstand
 */

const BLATT = 'Lernstand';
const TEIL = 40000;   // Zeichen pro Zelle (Google erlaubt 50 000)
const MARKE = '~';    // verhindert, dass Google Teile als Zahl oder Formel liest

function einrichten() {
  const props = PropertiesService.getScriptProperties();
  let token = props.getProperty('TOKEN');
  if (!token) {
    token = Utilities.getUuid().replace(/-/g, '').slice(0, 24);
    props.setProperty('TOKEN', token);
  }
  blatt_(BLATT);
  Logger.log('Dein Schlüssel: ' + token);
  return token;
}

function doGet(e) { return antwort_(verarbeite_((e && e.parameter) || {})); }

function doPost(e) {
  let daten = {};
  try { daten = JSON.parse(e.postData.contents); } catch (x) { return antwort_({ ok: false, fehler: 'format' }); }
  return antwort_(verarbeite_(daten));
}

function verarbeite_(d) {
  const token = PropertiesService.getScriptProperties().getProperty('TOKEN');
  if (!token) return { ok: false, fehler: 'nicht eingerichtet' };
  if (d.token !== token) return { ok: false, fehler: 'schluessel' };
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sh = blatt_(BLATT);
    if (d.aktion === 'speichern') {
      const json = JSON.stringify(d.stand || {});
      const teile = [];
      for (let i = 0; i < json.length; i += TEIL) teile.push([MARKE + json.slice(i, i + TEIL)]);
      const alt = Math.max(sh.getLastRow() - 1, 1);
      sh.getRange(2, 1, alt, 1).clearContent();
      sh.getRange(2, 1, teile.length, 1).setNumberFormat('@').setValues(teile);
      sh.getRange('B1:C1').setValues([[new Date(), String(d.geraet || '')]]);
      if (d.uebersicht) uebersicht_(d.uebersicht);
      return { ok: true, zeit: new Date().toISOString() };
    }
    const n = sh.getLastRow();
    const json = n >= 2 ? sh.getRange(2, 1, n - 1, 1).getValues().map(r => String(r[0]).replace(/^~/, '')).join('') : '';
    return { ok: true, stand: json ? JSON.parse(json) : null };
  } finally {
    lock.releaseLock();
  }
}

function uebersicht_(u) {
  const schreibe = (name, kopf, zeilen) => {
    const sh = blatt_(name);
    sh.clearContents();
    sh.getRange(1, 1, 1, kopf.length).setValues([kopf]).setFontWeight('bold');
    if (zeilen && zeilen.length) sh.getRange(2, 1, zeilen.length, kopf.length).setNumberFormat('@').setValues(zeilen.map(z => kopf.map((_, i) => String(z[i] == null ? '' : z[i]))));
    sh.setFrozenRows(1);
  };
  schreibe('Lektionen', ['Nr.', 'Lektion', 'Abgeschlossen am', 'Satz des Tages', 'Umschrift', 'Deutsch'], u.lektionen);
  schreibe('Wörter', ['Hindi', 'Umschrift', 'Deutsch', 'Lektion', 'Stand'], u.woerter);
}

function blatt_(name) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (name === BLATT) sh.getRange('A1').setValue('Speicherstand der App, bitte nicht bearbeiten');
  }
  return sh;
}

function antwort_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

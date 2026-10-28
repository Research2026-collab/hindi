// Prüft die Lerninhalte: Jede Übung darf nur Wörter verwenden, die bis zu dieser Lektion eingeführt wurden.
// Aufruf: node tools/validate.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { window: {} };
vm.createContext(ctx);
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const contentFiles = [...html.matchAll(/<script src="(content\/[^"]+)"/g)].map(m => m[1]);
for (const f of contentFiles) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx);
const ITEMS = ctx.window.HINDI_ITEMS, LESSONS = ctx.window.HINDI_LESSONS;
const SCRIPT = ctx.window.HINDI_SCRIPT || { startLesson: 1, units: [] };
const scriptFor = idx => { const k = idx + 1 - SCRIPT.startLesson; return k >= 0 ? SCRIPT.units[k] || null : null; };

const errors = [], warnings = [];
const err = (l, m) => errors.push(`${l}: ${m}`);
const warn = (l, m) => warnings.push(`${l}: ${m}`);
const N = s => s.normalize('NFD');
const isDeva = t => /[ऀ-ॿ]/.test(t);
const tokens = s => N(s.replace(/\{name\}/g, ' ')).replace(/[।॥?!,.“”„"'…:;()]/g, ' ').split(/\s+/).filter(t => t && isDeva(t));

const known = new Set();      // bekannte Wörter (Token)
const knownAt = {};
const introduced = new Set(); // eingeführte item-ids
const scriptChars = new Set();
const ids = new Set();

for (const [id, it] of Object.entries(ITEMS)) {
  for (const f of ['hi', 'tr', 'de', 'cat']) if (!it[f]) err('items', `${id} ohne ${f}`);
}

LESSONS.forEach((L, idx) => {
  const lid = L.id || `#${idx + 1}`;
  if (ids.has(L.id)) err(lid, 'doppelte id'); ids.add(L.id);
  for (const f of ['title', 'topic', 'new', 'key', 'exercises']) if (!L[f]) err(lid, `fehlendes Feld ${f}`);
  if (L.new.length < 2 || L.new.length > 4) err(lid, `${L.new.length} neue Wörter (erlaubt 2 bis 4)`);
  for (const id of L.new) {
    if (!ITEMS[id]) { err(lid, `unbekanntes item ${id}`); continue; }
    if (introduced.has(id)) err(lid, `${id} wurde schon früher eingeführt`);
    introduced.add(id);
    tokens(ITEMS[id].hi).forEach(t => known.add(t));
  }
  const gloss = new Set(Object.keys(L.gloss || {}).map(N));
  const check = (where, s, allowGloss) => {
    for (const t of tokens(s)) if (!known.has(t) && !(allowGloss && gloss.has(t))) err(lid, `${where}: „${t}“ ist noch nicht eingeführt (${s})`);
  };
  (L.dialog || []).forEach((d, i) => { check(`Dialog ${i + 1}`, d.hi, true); if (!d.tr || !d.de) err(lid, `Dialogzeile ${i + 1} unvollständig`); });
  for (const g of gloss) if (known.has(g)) warn(lid, `Glosse „${g}“ ist bereits bekannt`);
  check('Satz des Tages', L.key.hi, true);
  if (L.speak) check('Sprechübung', L.speak.hi, false);
  else for (const t of tokens(L.key.hi)) if (gloss.has(t)) warn(lid, `Sprechübung enthält Glosse ${t}`);
  const itemOk = (id, where) => { if (!ITEMS[id]) err(lid, `${where}: unbekanntes item ${id}`); else if (!introduced.has(id)) err(lid, `${where}: ${id} noch nicht eingeführt`); };

  L.exercises.forEach((e, i) => {
    const w = `Übung ${i + 1} (${e.t})`;
    switch (e.t) {
      case 'meaning': case 'reverse': case 'listen': case 'recall': itemOk(e.item, w); break;
      case 'match': if (idx < 3) warn(lid, `${w}: Zuordnen so früh ist wenig sinnvoll`); if (e.items.length !== 4) warn(lid, `${w}: ${e.items.length} Paare`); e.items.forEach(id => itemOk(id, w));
        if (new Set(e.items.map(id => ITEMS[id]?.de)).size !== e.items.length) err(lid, `${w}: doppelte Bedeutungen`); break;
      case 'cloze':
        check(w, e.hi.replace('___', ' '), false); e.options.forEach(o => check(w, o, false));
        if (!e.options.includes(e.answer)) err(lid, `${w}: Lösung nicht in Optionen`);
        for (const k of Object.keys(e.why || {})) if (!e.options.includes(k)) err(lid, `${w}: why-Schlüssel ${k} keine Option`);
        for (const o of e.options) if (o !== e.answer && !(e.why || {})[o]) err(lid, `${w}: keine Erklärung für ${o}`);
        (e.items || []).forEach(id => itemOk(id, w)); break;
      case 'order': check(w, e.hi, false); if (!e.why) warn(lid, `${w}: ohne Erklärung`); if (tokens(e.hi).length < 3) warn(lid, `${w}: weniger als 3 Bausteine`); (e.items || []).forEach(id => itemOk(id, w)); break;
      case 'natural': {
        check(w, e.situation, false);
        e.options.forEach(o => { check(w, o.hi, false); if (!o.why) err(lid, `${w}: Option ohne Erklärung`); });
        if (e.options.filter(o => o.ok).length !== 1) err(lid, `${w}: genau eine Option muss ok sein`);
        (e.items || []).forEach(id => itemOk(id, w)); break;
      }
      default: err(lid, `${w}: unbekannter Typ`);
    }
  });

  const s = scriptFor(idx);
  if (s) {
    const focusChars = N(s.focus).replace(/\s/g, '');
    for (const c of focusChars) scriptChars.add(c);
    const tk = s.task;
    if (tk.t === 'find') {
      tk.options.forEach(o => check('Schrift', o, false));
      if (!tk.options.includes(tk.answer)) err(lid, 'Schrift: Lösung fehlt');
      const firstFocus = [...N(s.focus).replace(/\s/g, '')];
      tk.options.forEach(o => {
        const has = firstFocus.some(c => N(o).includes(c));
        if (o === tk.answer && !has) err(lid, `Schrift: Lösung ${o} enthält das Zeichen nicht`);
        if (o !== tk.answer && has) err(lid, `Schrift: Ablenker ${o} enthält das Zeichen auch`);
      });
    } else if (tk.t === 'read') {
      for (const c of N(tk.word)) if (!scriptChars.has(c)) err(lid, `Schrift: „${tk.word}“ enthält das noch nicht gelernte Zeichen ${c}`);
      if (!tk.options.includes(tk.answer)) err(lid, 'Schrift: Lösung fehlt');
      if (new Set(tk.options).size !== tk.options.length) err(lid, 'Schrift: doppelte Optionen');
    } else err(lid, 'Schrift: unbekannter Aufgabentyp');
  }
  knownAt[L.id] = new Set(known);
});

const RP = ctx.window.HINDI_ROLEPLAYS || [];
for (const r of RP) {
  const ks = knownAt[r.after];
  if (!ks) { err('rollenspiel ' + r.id, `unbekannte Lektion ${r.after}`); continue; }
  const chk = (w, t) => { for (const x of tokens(t || '')) if (!ks.has(x)) err('rollenspiel ' + r.id, `${w}: „${x}“ ist nach ${r.after} noch nicht bekannt`); };
  r.turns.forEach((t, i) => {
    chk(`Zug ${i + 1}`, t.hi);
    if (t.choices.filter(c => c.ok).length !== 1) err('rollenspiel ' + r.id, `Zug ${i + 1}: genau eine Antwort muss ok sein`);
    t.choices.forEach(c => { chk(`Zug ${i + 1} Antwort`, c.hi); if (!c.ok && !c.why) err('rollenspiel ' + r.id, `Zug ${i + 1}: Erklärung fehlt`); });
  });
  chk('Schluss', r.end.hi);
}
for (const pc of ctx.window.HINDI_POSTCARDS || []) if (!knownAt[pc.after]) err('postkarte', `unbekannte Lektion ${pc.after}`);
const unused = Object.keys(ITEMS).filter(id => !introduced.has(id));
if (unused.length) warn('items', `nie eingeführt: ${unused.join(', ')}`);

console.log(`${LESSONS.length} Lektionen, ${introduced.size} Wörter und Wendungen, ${known.size} Wortformen, ${scriptChars.size} Schriftzeichen`);
warnings.forEach(w => console.log('Hinweis  ' + w));
errors.forEach(e => console.log('FEHLER   ' + e));
if (errors.length) { console.log(`${errors.length} Fehler`); process.exit(1); }
console.log('Inhalte gültig.');

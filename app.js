/* Hindi · 5 Minuten
   Lernlogik, Wiederholung, Audio und Sprechübung. Inhalte liegen in content/. */
(() => {
'use strict';

const ITEMS = window.HINDI_ITEMS || {};
const LESSONS = window.HINDI_LESSONS || [];
const AUDIO = window.HINDI_AUDIO || {};
const ROLEPLAYS = window.HINDI_ROLEPLAYS || [];
const POSTCARDS = window.HINDI_POSTCARDS || [];
const SCRIPT = window.HINDI_SCRIPT || { startLesson: 11, units: [] };
const scriptFor = idx => { const k = idx + 1 - SCRIPT.startLesson; return k >= 0 ? SCRIPT.units[k] || null : null; };          // optional: { 'नमस्ते': 'audio/namaste.mp3' }
const STORE = 'hindi5.state.v2';
const app = document.getElementById('app');

/* ───────── Hilfen ───────── */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pad = n => String(n).padStart(2, '0');
const dstr = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => dstr(new Date());
const addDays = (s, n) => { const [y, m, d] = s.split('-').map(Number); return dstr(new Date(y, m - 1, d + n)); };
const daysBetween = (a, b) => Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / 864e5);
const reduceMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const fill = s => String(s ?? '').replace(/\{name\}/g, S.name || 'Elisabeth');
const PUNCT = /[।॥?!,.“”„"'…:;()]/g;
const words = s => fill(s).replace(PUNCT, ' ').split(/\s+/).filter(Boolean);

/* ───────── Zustand ───────── */
const defaults = () => ({
  v: 2, name: 'Elisabeth',
  settings: { roman: 'auto', rate: 'normal', voice: '' },
  next: 0, done: {}, items: {}, days: {}, session: null, last: null, introSeen: false, created: today()
});
let S = defaults();
let storageOk = true;
function load() {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) S = Object.assign(defaults(), JSON.parse(raw));
    S.settings = Object.assign(defaults().settings, S.settings || {});
  } catch (e) { storageOk = false; }
}
function save(opts = {}) {
  if (!opts.quiet) S.updatedAt = Date.now();
  try { localStorage.setItem(STORE, JSON.stringify(S)); storageOk = true; } catch (e) { storageOk = false; }
  if (!opts.quiet && typeof Sync !== 'undefined') Sync.schedule();
}
load();
try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) {}

/* ───────── Abgleich über eine Google-Tabelle (Apps Script) ─────────
   Beide Geräte holen zuerst den gespeicherten Stand, führen ihn mit dem eigenen zusammen
   und schreiben das Ergebnis zurück. So geht nichts verloren, auch wenn zwei Geräte offline waren. */
const SYNC_KEY = 'hindi5.sync';
function mergeState(L, R) {
  if (!R || typeof R !== 'object') return L;
  const out = JSON.parse(JSON.stringify(L));
  out.items = out.items || {};
  for (const [id, r] of Object.entries(R.items || {})) {
    const l = out.items[id];
    const newer = !l || (r.last || '') > (l.last || '') || ((r.last || '') === (l.last || '') && (r.ok + r.bad) > (l.ok + l.bad));
    if (newer) out.items[id] = r;
  }
  out.done = out.done || {};
  for (const [k, v] of Object.entries(R.done || {})) if (!out.done[k] || v < out.done[k]) out.done[k] = v;
  out.next = Math.max(out.next || 0, R.next || 0);
  out.days = out.days || {};
  for (const [d, v] of Object.entries(R.days || {})) out.days[d] = Math.max(out.days[d] || 0, v);
  out.introSeen = !!(out.introSeen || R.introSeen);
  if (R.games) {
    out.games = out.games || { rp: {}, mem: 0 }; out.games.rp = out.games.rp || {};
    for (const [k, v] of Object.entries(R.games.rp || {})) out.games.rp[k] = Math.max(out.games.rp[k] || 0, v);
  }
  if ((R.updatedAt || 0) > (L.updatedAt || 0)) {
    out.name = R.name || out.name;
    out.settings = Object.assign({}, out.settings, R.settings || {});
    if (R.last && (!out.last || R.last.date >= out.last.date)) out.last = R.last;
  }
  out.updatedAt = Math.max(L.updatedAt || 0, R.updatedAt || 0);
  return out;
}
const Sync = {
  cfg: null, timer: null, busy: false, lastOk: 0, lastError: '',
  load() { try { this.cfg = JSON.parse(localStorage.getItem(SYNC_KEY) || 'null'); } catch (e) { this.cfg = null; } },
  store() { try { this.cfg ? localStorage.setItem(SYNC_KEY, JSON.stringify(this.cfg)) : localStorage.removeItem(SYNC_KEY); } catch (e) {} },
  on() { return !!(this.cfg && this.cfg.url && this.cfg.token); },
  code() { return this.on() ? btoa(unescape(encodeURIComponent(JSON.stringify({ u: this.cfg.url, t: this.cfg.token })))) : ''; },
  fromCode(c) { try { const o = JSON.parse(decodeURIComponent(escape(atob(c.trim())))); return o.u && o.t ? { url: o.u, token: o.t } : null; } catch (e) { return null; } },
  async call(body) {
    const r = await fetch(this.cfg.url, { method: 'POST', body: JSON.stringify({ token: this.cfg.token, ...body }), redirect: 'follow' });
    const j = await r.json();
    if (!j.ok) throw new Error(j.fehler === 'schluessel' ? 'Der Schlüssel passt nicht zur Tabelle.' : j.fehler === 'nicht eingerichtet' ? 'Im Apps-Script wurde „einrichten“ noch nicht ausgeführt.' : 'Die Tabelle hat die Anfrage abgelehnt.');
    return j;
  },
  overview() {
    const lektionen = LESSONS.map((L, i) => S.done[L.id] ? [i + 1, L.title, S.done[L.id], fill(L.key.hi), fill(L.key.tr), fill(L.key.de)] : null).filter(Boolean);
    const woerter = LESSONS.flatMap((L, i) => L.new.filter(id => S.items[id]).map(id => [ITEMS[id].hi, ITEMS[id].tr, ITEMS[id].de, i + 1, itemState(id).label]));
    return { lektionen, woerter };
  },
  async sync(reason = '') {
    if (!this.on() || this.busy) return false;
    this.busy = true;
    try {
      const got = await this.call({ aktion: 'laden' });
      const before = JSON.stringify({ ...S, session: null, updatedAt: 0 });
      const merged = mergeState(S, got.stand);
      merged.session = S.session;
      S = merged;
      save({ quiet: true });
      const { session, ...stand } = S;
      await this.call({ aktion: 'speichern', stand, geraet: navigator.platform || '', uebersicht: this.overview() });
      this.lastOk = Date.now(); this.lastError = '';
      const changed = before !== JSON.stringify({ ...S, session: null, updatedAt: 0 });
      if (changed && ['home', 'woerter', 'lernpfad', 'heft'].includes(current.view)) route(current.view);
      return true;
    } catch (e) {
      this.lastError = e && e.message && !/fetch|network|JSON/i.test(e.message) ? e.message : 'Die Tabelle ist gerade nicht erreichbar. Der Lernstand bleibt auf diesem Gerät und wird später abgeglichen.';
      return false;
    } finally {
      this.busy = false;
      if (current.view === 'einstellungen') renderSyncStatus();
    }
  },
  schedule(ms = 4000) {
    if (!this.on()) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.sync('auto'), ms);
  }
};
Sync.load();

/* ───────── Inhalte nachschlagen ───────── */
const lessonIndexOfItem = {};
LESSONS.forEach((L, i) => L.new.forEach(id => { lessonIndexOfItem[id] = i; }));
function getItem(id) {
  if (id.startsWith('s:')) {
    const L = LESSONS.find(l => l.id === id.slice(2));
    return L ? { hi: L.key.hi, tr: L.key.tr, de: L.key.de, cat: 'sentence', sentence: true } : null;
  }
  return ITEMS[id] || null;
}
/* Umschrift einzelner Wörter, gewonnen aus allen Einträgen mit Umschrift */
const tokenTr = {};
const learnTr = (hi, tr) => {
  if (!hi || !tr) return;
  const a = String(hi).replace(PUNCT, ' ').split(/\s+/).filter(Boolean), b = String(tr).replace(/[?!,.…:;“”„"]/g, ' ').split(/\s+/).filter(Boolean);
  if (a.length === b.length) a.forEach((w, i) => { if (!tokenTr[w]) tokenTr[w] = b[i]; });
};
Object.values(ITEMS).forEach(it => learnTr(it.hi, it.tr));
LESSONS.forEach(L => { (L.dialog || []).forEach(d => learnTr(d.hi, d.tr)); learnTr(L.key.hi, L.key.tr); (L.exercises || []).forEach(e => e.tr && learnTr(e.hi.replace('___', ' '), e.tr.replace('___', ' '))); });
const trGuess = hi => { const ws = String(hi).replace(PUNCT, ' ').split(/\s+/).filter(Boolean); const out = ws.map(w => w === '{name}' ? '{name}' : tokenTr[w]); return out.every(Boolean) ? out.join(' ') : ''; };
const tokenMeaning = {};
Object.values(ITEMS).forEach(it => {
  const ws = String(it.hi).replace(PUNCT, ' ').split(/\s+/).filter(Boolean);
  if (ws.length === 1 && !tokenMeaning[ws[0]]) tokenMeaning[ws[0]] = it.de.split(/[;(]/)[0].trim();
  if (it.lit) ws.forEach((w, i) => { if (!tokenMeaning[w] && it.lit[i]) tokenMeaning[w] = it.lit[i]; });
});
const tokenHints = {};
for (const it of Object.values(ITEMS)) {
  const ws = words(it.hi);
  ws.forEach(w => { if (it.hint && !tokenHints[w]) tokenHints[w] = it.hint; });
}

/* ───────── Wiederholung (Spaced Repetition) ─────────
   Kästen 0 bis 7. Ein richtiger Abruf an einem fälligen Tag schiebt das Wort einen Kasten weiter.
   Ein Fehler setzt es auf Kasten 0 zurück: Es kommt morgen wieder und wird bevorzugt abgefragt. */
const INTERVALS = [1, 1, 3, 7, 14, 30, 60, 120];
function introduce(id) {
  if (!S.items[id]) S.items[id] = { box: 0, due: addDays(today(), 1), seen: today(), ok: 0, bad: 0, lapses: 0, last: null };
  return S.items[id];
}
function grade(id, correct) {
  if (!getItem(id)) return;
  const r = introduce(id), t = today();
  if (correct) {
    r.ok++;
    if (r.due <= t && r.last !== t) r.box = Math.min(r.box + 1, INTERVALS.length - 1);
    else r.box = Math.max(r.box, 1);
    r.due = addDays(t, INTERVALS[r.box]);
  } else {
    r.bad++;
    if (r.ok > 0) r.lapses++;
    r.box = 0;
    r.due = addDays(t, 1);
  }
  r.last = t;
}
function dueItems() {
  const t = today();
  return Object.entries(S.items)
    .filter(([id, r]) => r.due <= t && getItem(id))
    .sort((a, b) => (b[1].lapses + b[1].bad * 0.3) - (a[1].lapses + a[1].bad * 0.3) || a[1].box - b[1].box || (a[1].due < b[1].due ? -1 : 1))
    .map(([id]) => id);
}
const knownWords = () => Object.keys(S.items).filter(id => !id.startsWith('s:') && S.items[id].ok > 0).length;
const understoodSentences = () => Object.keys(S.items).filter(id => id.startsWith('s:') && S.items[id].box >= 2).length;
const doneCount = () => LESSONS.filter(L => S.done[L.id]).length;
const learnedToday = () => S.days[today()] || 0;

/* Umschrift: anfangs voll, ab Lektion 11 zurückhaltender, ab Lektion 21 nur auf Antippen */
function romanMode(isNew) {
  const s = S.settings.roman;
  if (s === 'always') return 'full';
  if (s === 'tap') return isNew ? 'soft' : 'tap';
  const i = S.session ? S.session.idx : S.next;
  if (i < 10) return 'full';
  if (i < 20) return 'soft';
  return isNew ? 'soft' : 'tap';
}
let showRomanOnce = false;
function trHTML(tr, isNew = false, cls = '') {
  if (!tr) return '';
  const m = showRomanOnce ? 'full' : romanMode(isNew);
  if (m === 'tap') return `<button class="tr tr-tap ${cls}" data-act="reveal-tr" aria-label="Umschrift zeigen"><span>${esc(fill(tr))}</span></button>`;
  return `<span class="tr ${m === 'soft' ? 'tr-soft' : ''} ${cls}">${esc(fill(tr))}</span>`;
}

/* ───────── Audio: Browserstimme oder eigene Dateien ───────── */
const TTS = {
  voices: [], ready: false, warned: false,
  init() {
    if (!('speechSynthesis' in window)) return;
    const load = () => {
      this.voices = speechSynthesis.getVoices().filter(v => /^hi([-_]|$)/i.test(v.lang));
      this.ready = speechSynthesis.getVoices().length > 0;
      if (current.view === 'einstellungen') renderSettings();
    };
    load();
    speechSynthesis.addEventListener ? speechSynthesis.addEventListener('voiceschanged', load) : (speechSynthesis.onvoiceschanged = load);
  },
  rank(v) {
    let s = 0;
    if (/premium|enhanced|neural|natural/i.test(v.name)) s += 4;
    if (/google/i.test(v.name)) s += 3;
    if (/lekha|kiyara|swara|madhur|aditi/i.test(v.name)) s += 2;
    if (/^hi-IN$/i.test(v.lang.replace('_', '-'))) s += 1;
    return s;
  },
  voice() {
    if (!this.voices.length) return null;
    const pref = this.voices.find(v => v.name === S.settings.voice);
    return pref || this.voices.slice().sort((a, b) => this.rank(b) - this.rank(a))[0];
  },
  hasHindi() { return this.voices.length > 0 || Object.keys(AUDIO).length > 0; },
  canSpeak() { return 'speechSynthesis' in window; },
  speak(text, opts = {}) {
    const t = fill(text);
    const file = AUDIO[t] || AUDIO[t.replace(PUNCT, '').trim()];
    if (file) { const a = new Audio(file); a.playbackRate = opts.slow ? 0.75 : 1; return a.play().catch(() => {}); }
    if (!this.canSpeak()) { toast('Dieser Browser kann keine Sprache ausgeben.'); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t.replace(/[।॥]/g, '.'));
    u.lang = 'hi-IN';
    const v = this.voice();
    if (v) u.voice = v;
    const slow = opts.slow || S.settings.rate === 'slow';
    u.rate = slow ? 0.6 : 0.85;
    if (opts.onend) u.onend = opts.onend;
    speechSynthesis.speak(u);
    if (!v && !this.warned) {
      this.warned = true;
      toast('Auf diesem Gerät fehlt eine Hindi-Stimme. Wie du sie installierst, steht in den Einstellungen.', 6000);
    }
  }
};

/* ───────── Spracherkennung und Bewertung ───────── */
const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
const SPEECH = {
  canRecognize: !!Rec,
  canRecord: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder),
  blocked: false,
  framed: (() => { try { return window.self !== window.top; } catch (e) { return true; } })()
};
const speechMode = () => SPEECH.framed ? 'self' : SPEECH.canRecognize && !SPEECH.blocked ? 'recognize' : SPEECH.canRecord && !SPEECH.recBlocked ? 'record' : 'self';
const FRAMED_NOTE = 'In dieser Vorschau sperrt der Browser das Mikrofon. In der installierten App bekommst du hier eine Rückmeldung zu deiner Aussprache.';

const CONS = { 'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'n', 'च': 'c', 'छ': 'ch', 'ज': 'j', 'झ': 'jh', 'ञ': 'n', 'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n', 'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n', 'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm', 'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h' };
const VOW = { 'अ': 'a', 'आ': 'a', 'इ': 'i', 'ई': 'i', 'उ': 'u', 'ऊ': 'u', 'ऋ': 'ri', 'ए': 'e', 'ऐ': 'e', 'ओ': 'o', 'औ': 'o', 'ऑ': 'o' };
const MAT = { 'ा': 'a', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u', 'ृ': 'ri', 'े': 'e', 'ै': 'e', 'ो': 'o', 'ौ': 'o', 'ॉ': 'o' };
const NUM = { 0: 'shuny', 1: 'ek', 2: 'do', 3: 'tin', 4: 'car', 5: 'panc', 6: 'chah', 7: 'sat', 8: 'ath', 9: 'nau', 10: 'das', 100: 'sau' };
function devaSkel(w) {
  let out = '', pend = false, last = '';
  for (const ch of w.normalize('NFD')) {
    if (CONS[ch]) { if (pend) out += 'a'; out += CONS[ch]; pend = true; last = ch; }
    else if (ch === '़') { // Nukta
      if (last === 'ड') out = out.slice(0, -1) + 'r';
      else if (last === 'ढ') out = out.slice(0, -2) + 'rh';
    }
    else if (MAT[ch]) { out += MAT[ch]; pend = false; }
    else if (VOW[ch]) { if (pend) out += 'a'; out += VOW[ch]; pend = false; }
    else if (ch === '्') { pend = false; }
    else if (ch === 'ं' || ch === 'ँ') { if (pend) out += 'a'; out += 'n'; pend = false; }
    else if (ch === 'ः') { out += 'h'; }
    else if (/[a-z]/i.test(ch)) { out += ch.toLowerCase(); pend = false; }
  }
  return out.replace(/(.)\1+/g, '$1');
}
function latSkel(w) {
  return w.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z]/g, '').replace(/w/g, 'v').replace(/ee/g, 'i').replace(/oo/g, 'u').replace(/(.)\1+/g, '$1');
}
const skel = w => /[ऀ-ॿ]/.test(w) ? devaSkel(w) : latSkel(w);
function numWords(tok) {
  const d = tok.replace(/[०-९]/g, c => String('०१२३४५६७८९'.indexOf(c)));
  if (!/^\d+$/.test(d)) return [tok];
  const n = Number(d);
  if (NUM[n]) return [NUM[n]];
  if (n % 100 === 0 && NUM[n / 100]) return [NUM[n / 100], 'sau'];
  return [tok];
}
function lev(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}
const sim = (a, b) => (!a && !b) ? 1 : 1 - lev(a, b) / Math.max(a.length, b.length);
const altsFor = {};
for (const it of Object.values(ITEMS)) if (it.alt) {
  const ws = words(it.hi);
  for (const w of ws) altsFor[w] = (altsFor[w] || []).concat(it.alt);
}
function evaluate(target, transcripts) {
  const raw = String(target).replace(PUNCT, ' ').split(/\s+/).filter(Boolean);
  const tw = raw.map(w => w === '{name}' ? { w: fill(w), wild: true } : { w: fill(w), wild: !/[ऀ-ॿ]/.test(w) });
  let best = null;
  for (const t of (transcripts.length ? transcripts : [''])) {
    const heard = t.replace(PUNCT, ' ').split(/\s+/).filter(Boolean).flatMap(numWords);
    const hs = heard.map(skel).filter(Boolean);
    const lower = t.toLowerCase();
    const res = tw.map(x => {
      if (x.wild) return { w: x.w, ok: true, wild: true };
      const k = skel(x.w);
      const thr = k.length <= 3 ? 0.66 : 0.8;
      let s = 0;
      for (let i = 0; i < hs.length; i++) {
        s = Math.max(s, sim(k, hs[i]));
        if (i + 1 < hs.length) s = Math.max(s, sim(k, hs[i] + hs[i + 1]));
      }
      for (const a of altsFor[x.w] || []) {
        if (/^[a-z ]+$/i.test(a) ? lower.includes(a.toLowerCase()) : hs.some(h => sim(skel(a), h) >= 0.8)) s = 1;
      }
      return { w: x.w, ok: s >= thr, s };
    });
    const score = res.length ? res.filter(r => r.ok).length / res.length : 0;
    if (!best || score > best.score) best = { score, words: res, heard: t };
  }
  return best;
}
function translitHeard(t) {
  return t.split(/\s+/).map(w => /[ऀ-ॿ]/.test(w) ? devaSkel(w) : w).join(' ');
}

/* ───────── Übungen erzeugen ───────── */
function poolUpTo(idx) {
  const ids = [];
  LESSONS.slice(0, idx + 1).forEach(L => ids.push(...L.new));
  return ids;
}
function distractors(id, idx, n, field, shown) {
  const t = getItem(id);
  const pool = poolUpTo(idx).filter(x => !shown || shown.has(x)).filter(x => x !== id && ITEMS[x] && !(t.syn && ITEMS[x].syn === t.syn) && ITEMS[x][field] !== t[field]);
  const same = shuffle(pool.filter(x => ITEMS[x].cat === t.cat));
  const other = shuffle(pool.filter(x => ITEMS[x].cat !== t.cat));
  const out = [], seen = new Set([t[field]]);
  for (const x of [...same.slice(0, 2), ...other, ...same.slice(2)]) {
    if (out.length >= n) break;
    if (seen.has(ITEMS[x][field])) continue;
    seen.add(ITEMS[x][field]); out.push(x);
  }
  return out;
}
function choose(id, idx, dir, seen) {
  const field = dir === 'de2hi' ? 'hi' : 'de';
  const ds = distractors(id, idx, idx < 5 ? 2 : 3, field, seen);
  return { t: 'choose', dir, item: id, options: shuffle([id, ...ds]), items: [id] };
}
function sentenceMeaning(sid, idx) {
  const others = LESSONS.slice(0, idx + 1).filter(L => 's:' + L.id !== sid && S.items['s:' + L.id] && L.key.de !== getItem(sid).de).map(L => 's:' + L.id);
  if (others.length < 2) return null;
  return { t: 'choose', dir: 'sent2de', item: sid, options: shuffle([sid, ...shuffle(others).slice(0, 3)]), items: [sid] };
}
function orderEx(hi, tr, de, why, items) {
  const toks = words(hi);
  let tiles = toks.map((w, i) => ({ w, i }));
  for (let k = 0; k < 4 && tiles.length > 1 && tiles.every((t, i) => t.i === i); k++) tiles = shuffle(tiles);
  return { t: 'order', hi, tr, de, why, tiles, items };
}
function materialize(e, idx) {
  switch (e.t) {
    case 'meaning': return choose(e.item, idx, 'hi2de');
    case 'reverse': return choose(e.item, idx, 'de2hi');
    case 'listen': return choose(e.item, idx, idx < 5 ? 'hi2de' : 'audio2de');
    case 'recall': return { t: 'recall', item: e.item, items: [e.item] };
    case 'match': return { t: 'match', items: e.items.slice(), left: shuffle(e.items), right: shuffle(e.items) };
    case 'cloze': return { t: 'cloze', hi: e.hi, tr: e.tr, de: e.de, answer: e.answer, options: shuffle(e.options), why: e.why || {}, items: e.items || [] };
    case 'order': return orderEx(e.hi, e.tr, e.de, e.why, e.items || []);
    case 'natural': return { t: 'natural', situation: e.situation, options: shuffle(e.options.map(o => ({ ...o }))), items: e.items || [] };
  }
  return null;
}
function reviewEx(id, idx) {
  const r = S.items[id] || { box: 0, lapses: 0 };
  if (id.startsWith('s:')) {
    const it = getItem(id);
    if (r.box % 2 === 1) { const m = sentenceMeaning(id, idx); if (m) return m; }
    return orderEx(it.hi, it.tr, it.de, 'Das ist ein Satz des Tages aus einer früheren Lektion.', [id]);
  }
  if (r.lapses > 1 || r.box === 0) return choose(id, idx, 'hi2de');
  if (r.box === 1) return choose(id, idx, 'de2hi');
  if (r.box === 2) return choose(id, idx, idx < 5 ? 'de2hi' : 'audio2de');
  return { t: 'recall', item: id, items: [id] };
}
function scriptEx(sc) {
  const tk = sc.task;
  if (tk.t === 'find') return { t: 'sfind', focus: sc.focus, options: shuffle(tk.options), answer: tk.answer, items: [] };
  return { t: 'sread', word: tk.word, options: shuffle(tk.options), answer: tk.answer, after: tk.after || '', items: [] };
}

/* ───────── Sitzungen ───────── */
function buildLesson(idx, repeat = false) {
  const L = LESSONS[idx];
  const steps = [];
  if (idx === 0 && !S.introSeen) steps.push({ k: 'intro' });
  steps.push({ k: 'goal' });
  const exclude = new Set(L.new);
  let warm = dueItems().filter(id => !exclude.has(id)).slice(0, 3);
  if (idx > 0 && warm.length < 2) {
    const prev = LESSONS[idx - 1].new.filter(id => S.items[id] && !warm.includes(id))
      .sort((a, b) => S.items[a].box - S.items[b].box || S.items[b].bad - S.items[a].bad);
    warm = warm.concat(prev.slice(0, 2 - warm.length));
  }
  warm.forEach(id => steps.push({ k: 'ex', phase: 'review', ex: reviewEx(id, idx) }));
  // Neues Wort zeigen, beim nächsten Wort das vorige kurz abfragen (Erkennen vor Erinnern)
  // Ablenker nur aus Wörtern, die zu diesem Zeitpunkt schon gezeigt wurden
  const before = new Set(poolUpTo(idx - 1));
  const seenAt = i => new Set([...before, ...L.new.slice(0, i + 1)]);
  L.new.forEach((id, i) => {
    steps.push({ k: 'learn', item: id, n: i + 1, of: L.new.length });
    if (i > 0) steps.push({ k: 'ex', phase: 'check', ex: choose(L.new[i - 1], idx, 'hi2de', seenAt(i)) });
  });
  steps.push({ k: 'ex', phase: 'check', ex: choose(L.new[L.new.length - 1], idx, 'hi2de', seenAt(L.new.length - 1)) });
  if (L.dialog && L.dialog.length) steps.push({ k: 'dialog' });
  L.exercises.forEach(e => { const ex = materialize(e, idx); if (ex) steps.push({ k: 'ex', phase: 'practice', ex }); });
  const sp = L.speak || L.key;
  steps.push({ k: 'speak', hi: sp.hi, tr: sp.tr, de: sp.de });
  const sc = scriptFor(idx);
  if (sc) { steps.push({ k: 'script' }); steps.push({ k: 'ex', phase: 'script', ex: scriptEx(sc) }); }
  steps.push({ k: 'close' });
  return { mode: repeat ? 'repeat' : 'lesson', idx, steps, i: 0, date: today(), secs: 0, wrong: 0, right: 0, retried: [] };
}
function buildReview() {
  const idx = Math.max(0, Math.min(doneCount(), LESSONS.length) - 1);
  let ids = dueItems().slice(0, 8);
  if (ids.length < 4) {
    const weak = Object.entries(S.items).filter(([id]) => !ids.includes(id) && getItem(id))
      .sort((a, b) => a[1].box - b[1].box || b[1].bad - a[1].bad).map(([id]) => id);
    ids = ids.concat(shuffle(weak.slice(0, 10)).slice(0, 6 - ids.length));
  }
  const steps = ids.map(id => ({ k: 'ex', phase: 'review', ex: reviewEx(id, idx) }));
  const sentences = LESSONS.slice(0, idx + 1).filter(L => S.done[L.id]);
  if (sentences.length) { const L = sentences[Math.floor(Math.random() * sentences.length)]; steps.push({ k: 'speak', hi: L.key.hi, tr: L.key.tr, de: L.key.de }); }
  steps.push({ k: 'close' });
  return { mode: 'review', idx, steps, i: 0, date: today(), secs: 0, wrong: 0, right: 0, retried: [] };
}
function buildPractice(kind, ids) {
  const idx = Math.max(0, Math.min(S.next, LESSONS.length) - 1);
  const known = Object.keys(S.items).filter(id => getItem(id));
  let steps = [];
  if (kind === 'speak') {
    const pick = shuffle(known).slice(0, 5);
    steps = pick.map(id => { const it = getItem(id); return { k: 'speak', hi: it.hi, tr: it.tr, de: it.de }; });
  } else if (kind === 'script') {
    const units = SCRIPT.units.slice(0, Math.max(0, S.next + 1 - SCRIPT.startLesson));
    steps = shuffle(units).slice(0, 6).map(u => ({ k: 'ex', phase: 'script', ex: scriptEx(u) }));
  } else {
    const list = (ids && ids.length ? ids : known.filter(id => !id.startsWith('s:'))).slice();
    steps = shuffle(list).slice(0, 8).map(id => ({ k: 'ex', phase: 'review', ex: reviewEx(id, idx) }));
  }
  steps.push({ k: 'close' });
  return { mode: 'practice', kind, idx, steps, i: 0, date: today(), secs: 0, wrong: 0, right: 0, retried: [] };
}
const step = () => S.session && S.session.steps[S.session.i];
const lessonOf = () => LESSONS[S.session.idx];

function queueRetry(itemIds) {
  const se = S.session;
  for (const id of itemIds) {
    if (!id || se.retried.includes(id) || !getItem(id)) continue;
    se.retried.push(id);
    let at = se.steps.findIndex((s, i) => i > se.i && (s.k === 'speak' || s.k === 'close'));
    if (at < 0) at = se.steps.length;
    const ex = id.startsWith('s:') ? reviewEx(id, se.idx) : choose(id, se.idx, S.items[id] && S.items[id].ok > 0 ? 'de2hi' : 'hi2de');
    se.steps.splice(at, 0, { k: 'ex', phase: 'retry', ex });
  }
}
function record(correct, itemIds, opts = {}) {
  const se = S.session;
  if (correct) se.right++; else se.wrong++;
  for (const id of itemIds || []) grade(id, correct);
  if (!correct && !opts.noRetry) queueRetry(itemIds || []);
  save();
}

/* ───────── Zeit ───────── */
let lastTick = Date.now(), lastInput = Date.now();
['pointerdown', 'keydown'].forEach(ev => addEventListener(ev, () => { lastInput = Date.now(); }, { passive: true }));
setInterval(() => {
  const now = Date.now(), dt = Math.min(5, (now - lastTick) / 1000); lastTick = now;
  if (current.view !== 'lektion' || document.visibilityState !== 'visible' || now - lastInput > 90000 || !S.session) return;
  S.session.secs += dt;
  const t = today(); S.days[t] = (S.days[t] || 0) + dt;
}, 1000);
setInterval(() => { if (current.view === 'lektion') save(); }, 5000);
const minutes = s => Math.max(1, Math.round(s / 60));

/* ───────── Ansichten ───────── */
const current = { view: 'home' };
const ICON = {
  speaker: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3.5" width="6" height="11" rx="3" fill="currentColor"/><path d="M6 11.5a6 6 0 0 0 12 0M12 17.5v3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  stop: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  gear: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8M18.5 18.5l-1.8-1.8M7.3 7.3L5.5 5.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10-6.5z" fill="currentColor"/></svg>'
};
const audioBtn = (text, label = 'Anhören', withSlow = true) =>
  `<span class="audio"><button class="speak-btn" data-act="say" data-text="${esc(text)}" aria-label="${esc(label)}">${ICON.speaker}</button>${withSlow ? `<button class="slow-btn" data-act="say-slow" data-text="${esc(text)}">langsam</button>` : ''}</span>`;
function hiWithTr(hi, cls = 'dopt') {
  const m = romanMode();
  const t = m === 'tap' ? '' : trGuess(hi);
  return `<span class="hi-stack">${deva(hi, cls)}${t ? `<span class="tr opt-tr ${m === 'soft' ? 'tr-soft' : ''}">${esc(fill(t))}</span>` : ''}</span>`;
}
const deva = (hi, cls = '') => `<span class="deva ${cls}" lang="hi">${esc(fill(hi))}</span>`;

/* Lernheft: alle Texte abgeschlossener Lektionen zum Nachlesen */
function renderNotebook() {
  const done = LESSONS.map((L, i) => ({ L, i })).filter(x => S.done[x.L.id]);
  const hideDe = !!current.heftDe;
  const de = t => hideDe ? `<button class="rp-de" data-act="reveal-de">${esc(fill(t))}</button>` : `<span class="de">${esc(fill(t))}</span>`;
  const sp = hi => `<button class="speak-btn sm" data-act="say" data-text="${esc(hi)}" aria-label="Anhören">${ICON.speaker}</button>`;
  const lessonBlock = ({ L, i }) => `<section class="heft-l" id="heft-${L.id}">
      <p class="small">Lektion ${i + 1} · ${esc(L.topic)} · gelernt ${relDay(S.done[L.id])}</p>
      <h3 class="heft-h">${esc(L.title)}</h3>
      ${L.dialog ? `<ol class="dialog heft-dialog">${L.dialog.map(d => `<li class="${d.who === 'du' ? 'me' : ''}"><span class="who">${d.who === 'du' ? 'Du' : esc(d.who)}</span><div class="line"><div class="line-hi">${deva(d.hi, 'md')}${sp(d.hi)}</div><span class="tr">${esc(fill(d.tr))}</span>${de(d.de)}</div></li>`).join('')}</ol>` : ''}
      ${L.gloss ? `<p class="small">Im Dialog außerdem: ${Object.entries(L.gloss).map(([h, d]) => `${deva(h, 'inl')} ${esc(d)}`).join(' · ')}</p>` : ''}
      <div class="heft-key"><span class="aside-k">Satz des Tages</span><div class="line-hi">${deva(L.key.hi, 'md')}${sp(L.key.hi)}</div><span class="tr">${esc(fill(L.key.tr))}</span>${de(L.key.de)}</div>
      <table class="heft-words"><tbody>${L.new.map(id => { const it = ITEMS[id]; return `<tr><td>${deva(it.hi, 'inl')}</td><td class="tr">${esc(it.tr)}</td><td>${hideDe ? `<button class="rp-de" data-act="reveal-de">${esc(it.de)}</button>` : esc(it.de)}</td><td>${sp(it.hi)}</td></tr>`; }).join('')}</tbody></table>
      ${L.note ? `<p class="help heft-note">${esc(L.note)}</p>` : ''}
    </section>`;
  app.innerHTML = `<div class="page view-enter">${backNav()}
    <h2>Lernheft</h2>
    ${done.length ? `<p class="small">Alle Dialoge, Sätze und Wörter deiner abgeschlossenen Lektionen. Tippe auf den Lautsprecher, um sie zu hören.</p>
      <div class="row heft-tools"><button class="secondary" data-act="heft-de">${hideDe ? 'Übersetzung zeigen' : 'Übersetzung verdecken'}</button></div>
      <nav class="heft-jump" aria-label="Lektionen">${done.map(({ L, i }) => `<a href="#heft-${L.id}" data-jump="heft-${L.id}">${i + 1}</a>`).join('')}</nav>
      ${done.slice().reverse().map(lessonBlock).join('')}`
    : '<p class="help">Hier stehen nach deiner ersten Lektion alle Dialoge, Sätze des Tages und neuen Wörter zum Nachlesen.</p>'}
  </div>`;
  app.querySelectorAll('[data-jump]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); const t = document.getElementById(a.dataset.jump); if (t) t.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth' }); }));
}

const VIEWS = { heft: () => renderNotebook(), lektion: () => renderLesson(), lernpfad: () => renderPath(), einstellungen: () => renderSettings(), woerter: () => renderWords(), details: () => renderDetail(), rollenspiel: () => renderRoleplay(), memory: () => renderMemory(), postkarten: () => renderPostcards(), home: () => renderHome() };
function route(view) {
  if (view === 'lesson') view = 'lektion';
  if (!VIEWS[view]) view = 'home';
  current.view = view;
  const h = view === 'home' ? '' : '#' + view;
  if (location.hash !== h) history.replaceState(null, '', h || location.pathname + location.search);
  VIEWS[view]();
  window.scrollTo(0, 0);
}

/* Startseite */
function relDay(d) {
  const n = daysBetween(d, today());
  return n === 0 ? 'heute' : n === 1 ? 'gestern' : n < 7 ? `vor ${n} Tagen` : new Date(d + 'T12:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'long' });
}
function pathLine() {
  const n = LESSONS.length;
  const marks = LESSONS.map((L, i) => {
    const done = !!S.done[L.id], nextOne = i === S.next && !done;
    return `<i class="${done ? 'd' : ''}${nextOne ? ' n' : ''}" style="left:${(i + 0.5) / n * 100}%"></i>`;
  }).join('');
  return `<div class="rekha-path" role="img" aria-label="${doneCount()} von ${n} Lektionen abgeschlossen"><span class="bar"></span>${marks}</div>`;
}
function renderHome() {
  const se = S.session;
  const doneToday = Object.values(S.done).includes(today());
  const allDone = S.next >= LESSONS.length;
  const L = LESSONS[Math.min(S.next, LESSONS.length - 1)];
  const due = dueItems().length;
  const dayNo = allDone ? LESSONS.length : (doneToday ? doneCount() : S.next + 1);
  let main;
  if (se && (se.i > 0 || se.mode === 'repeat')) {
    const SL = LESSONS[se.idx];
    main = `<button class="primary big" data-act="resume">Weitermachen →</button>
      <p class="sub-line">${se.mode === 'review' ? 'Wiederholung' : esc(SL.title)} · Schritt ${se.i + 1} von ${se.steps.length}</p>`;
  } else if (allDone) {
    main = `<button class="primary big" data-act="review">Heute wiederholen →</button>
      <p class="sub-line">Alle ${LESSONS.length} Lektionen sind gelernt. Die Wiederholung hält sie frisch.</p>`;
  } else if (doneToday) {
    main = `<p class="today-done">Für heute geschafft. Heute gelernt: ${minutes(learnedToday())} ${minutes(learnedToday()) === 1 ? 'Minute' : 'Minuten'}.</p>
      <div class="row">
        <button class="secondary" data-act="start">Nächste Lektion: ${esc(L.title)}</button>
        <button class="ghost" data-act="path">Üben</button>
        ${due ? `<button class="ghost" data-act="review">${due} ${due === 1 ? 'Wort' : 'Wörter'} wiederholen</button>` : ''}
      </div>`;
  } else {
    main = `<button class="primary big" data-act="start">Heutige Lektion starten →</button>
      <p class="sub-line">${esc(L.title)} · Danach kannst du ${esc(L.goal || '')}</p>`;
  }
  const kw = knownWords(), us = understoodSentences();
  const facts = [];
  if (kw) facts.push(`Du kennst inzwischen ${kw} ${kw === 1 ? 'Wort' : 'Wörter'}.`);
  if (us) facts.push(`${us} ${us === 1 ? 'Satz kannst' : 'Sätze kannst'} du bereits ohne Hilfe verstehen.`);
  app.innerHTML = `
  <div class="home view-enter">
    <nav class="topnav" aria-label="Navigation">
      <span class="brand" lang="hi">हिंदी</span>
      <span class="nav-links"><button class="link" data-act="heft">Heft</button><button class="link" data-act="words">Wörter</button><button class="link" data-act="path">Lernpfad</button><button class="link icon-link" data-act="settings" aria-label="Einstellungen">${ICON.gear}</button></span>
    </nav>
    <section class="greet">
      <h1><span class="deva hello" lang="hi">नमस्ते,</span><span class="name">${esc(S.name)}</span></h1>
      <p class="day">Tag ${dayNo}</p>
      <p class="meta">Hindi · 5 Minuten</p>
    </section>
    <section class="cta">${main}</section>
    <section class="progress">
      ${pathLine()}
      <p class="small">${doneCount()} von ${LESSONS.length} Lektionen${S.last ? ` · Zuletzt gelernt: ${esc(LESSONS.find(l => l.id === S.last.lesson)?.title || '')}, ${relDay(S.last.date)}` : ''}</p>
      ${facts.length ? `<p class="small facts">${facts.join(' ')}</p>` : ''}
      ${storageOk ? '' : '<p class="small warn">Dieser Browser erlaubt gerade keine Speicherung. Dein Fortschritt geht beim Schließen verloren.</p>'}
    </section>
  </div>`;
}

/* Status eines Wortes in einfacher Sprache */
function itemState(id) {
  const r = S.items[id];
  if (!r) return { k: 'new', label: 'neu' };
  if (r.box >= 3) return { k: 'sure', label: 'sicher' };
  if (r.bad > 0 && r.box <= 1) return { k: 'weak', label: 'übst du noch' };
  return { k: 'learning', label: 'im Aufbau' };
}
const weakItems = () => Object.keys(S.items).filter(id => !id.startsWith('s:') && getItem(id) && itemState(id).k !== 'sure');
const backNav = (act = 'home') => `<nav class="topnav"><button class="link back" data-act="${act}">${ICON.back}<span>Zurück</span></button></nav>`;
const EX_NAMES = { meaning: 'Bedeutung erkennen', reverse: 'Auf Hindi sagen', listen: 'Hören und verstehen', recall: 'Aktiv erinnern', match: 'Zuordnen', cloze: 'Lücke füllen', order: 'Satz bauen', natural: 'Passende Antwort wählen' };

/* Lernpfad mit Übungsbereich */
function renderPath() {
  const due = dueItems().length;
  const learned = Object.keys(S.items).filter(id => getItem(id)).length;
  const scriptOpen = S.next + 1 > SCRIPT.startLesson;
  let topic = '';
  const rows = LESSONS.map((L, i) => {
    const done = S.done[L.id], open = done || i === S.next;
    let head = '';
    if (L.topic !== topic) { topic = L.topic; head = `<li class="topic">${esc(topic)}</li>`; }
    return `${head}<li><button class="lesson-row ${done ? 'is-done' : ''} ${i === S.next ? 'is-next' : ''}" ${open ? `data-act="detail" data-idx="${i}"` : 'disabled'}>
      <span class="num">${i + 1}</span><span class="t">${esc(L.title)}</span>
      <span class="state">${done ? 'gelernt' : i === S.next ? 'als Nächstes' : ''}</span></button></li>`;
  }).join('');
  const prac = (kind, title, sub, enabled) => `<li><button class="prac-row" data-act="practice" data-kind="${kind}" ${enabled ? '' : 'disabled'}><span class="t">${title}</span><span class="sub">${sub}</span></button></li>`;
  app.innerHTML = `<div class="page view-enter">
    ${backNav()}
    <h2>Üben</h2>
    <ul class="prac-list">
      ${prac('words', 'Wörter wiederholen', due ? `${due} ${due === 1 ? 'Wort ist' : 'Wörter sind'} heute fällig` : 'eine kurze Runde mit gelernten Wörtern', learned > 0)}
      ${prac('speak', 'Sprechen üben', 'fünf bekannte Wörter und Sätze nachsprechen', learned > 0)}
      ${prac('script', 'Schrift üben', scriptOpen ? 'gelernte Zeichen wiedererkennen' : `ab Lektion ${SCRIPT.startLesson}`, scriptOpen)}
    </ul>
    <h2>Spielen</h2>
    <ul class="prac-list">
      ${ROLEPLAYS.map(r => { const open = !!S.done[r.after], n = (S.games && S.games.rp && S.games.rp[r.id]) || 0, li = LESSONS.findIndex(L => L.id === r.after);
        return `<li><button class="prac-row" data-act="rp-open" data-id="${r.id}" ${open ? '' : 'disabled'}><span class="t">Rollenspiel: ${esc(r.title)}</span><span class="sub">${open ? (n ? `${n} Mal gespielt` : esc(r.intro.split('.')[0]) + '.') : `nach Lektion ${li + 1}`}</span></button></li>`; }).join('')}
      <li><button class="prac-row" data-act="mem-open" ${learned >= 6 ? '' : 'disabled'}><span class="t">Hör-Memory</span><span class="sub">${learned >= 6 ? 'Paare aus Hindi und Deutsch finden, jedes Wort klingt beim Aufdecken' : 'sobald du sechs Wörter kennst'}</span></button></li>
      <li><button class="prac-row" data-act="pc-open"><span class="t">Postkarten</span><span class="sub">${POSTCARDS.filter(c => S.done[c.after]).length} von ${POSTCARDS.length} gesammelt</span></button></li>
    </ul>
    <h2>Lernpfad</h2>
    <p class="small">Tippe eine Lektion an, um ihre Wörter, den Dialog und die Übungen zu sehen. Neue Lektionen öffnen sich der Reihe nach.</p>
    <ol class="path-list">${rows}</ol>
  </div>`;
}

/* Detailseite einer Lektion */
function renderDetail() {
  const i = current.detail ?? S.next, L = LESSONS[i];
  if (!L) return route('lernpfad');
  const done = !!S.done[L.id];
  const sc = scriptFor(i);
  const types = [...new Set(L.exercises.map(e => EX_NAMES[e.t]))];
  const wordRow = id => { const it = ITEMS[id], st = itemState(id);
    return `<li class="vrow"><span class="v-hi">${deva(it.hi, 'md')}</span><span class="v-tr tr">${esc(it.tr)}</span><span class="v-de">${esc(it.de)}</span>
      <span class="v-end"><span class="pill pill-${st.k}">${st.label}</span><button class="speak-btn sm" data-act="say" data-text="${esc(it.hi)}" aria-label="Anhören">${ICON.speaker}</button></span></li>`; };
  app.innerHTML = `<div class="page view-enter">
    ${backNav('path')}
    <p class="small">Lektion ${i + 1} · ${esc(L.topic)}</p>
    <h2 class="detail-h">${esc(L.title)}</h2>
    ${L.goal ? `<p class="lead">Nach dieser Lektion kannst du ${esc(L.goal)}</p>` : ''}
    <div class="row detail-cta"><button class="primary" data-act="${done ? 'repeat' : 'start'}" data-idx="${i}">${done ? 'Lektion wiederholen' : 'Lektion starten'}</button>${done ? '<button class="ghost" data-act="heft">Im Lernheft lesen</button>' : ''}</div>
    <h3>Neue Wörter</h3>
    <ul class="vlist">${L.new.map(wordRow).join('')}</ul>
    <h3>Satz des Tages</h3>
    <div class="detail-key">${deva(L.key.hi, 'md')} <button class="speak-btn sm" data-act="say" data-text="${esc(L.key.hi)}" aria-label="Anhören">${ICON.speaker}</button>
      <span class="tr">${esc(fill(L.key.tr))}</span><span class="v-de">${esc(fill(L.key.de))}</span></div>
    ${L.dialog ? `<h3>Dialog</h3><ol class="dialog small-dialog">${L.dialog.map(d => `<li class="${d.who === 'du' ? 'me' : ''}"><span class="who">${d.who === 'du' ? 'Du' : esc(d.who)}</span><div class="line"><div class="line-hi">${deva(d.hi, 'inl')}<button class="speak-btn sm" data-act="say" data-text="${esc(d.hi)}" aria-label="Anhören">${ICON.speaker}</button></div><span class="tr">${esc(fill(d.tr))}</span><span class="de">${esc(fill(d.de))}</span></div></li>`).join('')}</ol>` : ''}
    <h3>Ablauf</h3>
    <p class="help">Kurze Wiederholung, ${L.new.length} neue Wörter mit Nachsprechen und Kontrollfrage, Dialog, ${types.join(', ')}, Sprechübung${sc ? `, Schriftzeichen ${esc(sc.focus.split(/\s+/).join(' und '))}` : ''}.</p>
    ${L.note ? `<h3>Gut zu wissen</h3><p class="help">${esc(L.note)}</p>` : ''}
  </div>`;
}

/* Wörterliste */
function renderWords() {
  const f = current.filter || 'all';
  const ids = LESSONS.flatMap(L => L.new).filter(id => S.items[id]);
  const shown = ids.filter(id => f === 'all' || (f === 'weak' ? itemState(id).k !== 'sure' : itemState(id).k === 'sure'));
  const counts = { all: ids.length, weak: ids.filter(id => itemState(id).k !== 'sure').length, sure: ids.filter(id => itemState(id).k === 'sure').length };
  let topic = '';
  const rows = shown.map(id => {
    const L = LESSONS[lessonIndexOfItem[id]], it = ITEMS[id], st = itemState(id);
    let head = '';
    if (L.topic !== topic) { topic = L.topic; head = `<li class="topic">${esc(topic)}</li>`; }
    return `${head}<li class="vrow"><span class="v-hi">${deva(it.hi, 'md')}</span><span class="v-tr tr">${esc(it.tr)}</span><span class="v-de">${esc(it.de)}</span>
      <span class="v-end"><span class="pill pill-${st.k}">${st.label}</span><button class="speak-btn sm" data-act="say" data-text="${esc(it.hi)}" aria-label="Anhören">${ICON.speaker}</button></span></li>`;
  }).join('');
  const sentences = LESSONS.filter(L => S.done[L.id]);
  app.innerHTML = `<div class="page view-enter">
    ${backNav()}
    <h2>Deine Wörter</h2>
    ${ids.length ? `<div class="seg" role="radiogroup" aria-label="Filter">${[['all', 'Alle'], ['weak', 'Noch nicht sicher'], ['sure', 'Sicher']].map(([k, l]) =>
      `<button role="radio" aria-checked="${f === k}" class="${f === k ? 'on' : ''}" data-act="filter" data-val="${k}">${l} <span class="cnt">${counts[k]}</span></button>`).join('')}</div>
      ${shown.length ? `<div class="row words-cta"><button class="secondary" data-act="practice" data-kind="words">${f === 'weak' ? 'Diese Wörter üben' : 'Wörter üben'}</button></div>` : ''}
      <ul class="vlist">${rows || '<li class="small empty">Hier steht noch nichts.</li>'}</ul>
      ${sentences.length ? `<h3>Sätze des Tages</h3><ul class="vlist">${sentences.map(L => `<li class="vrow"><span class="v-hi">${deva(L.key.hi, 'inl')}</span><span class="v-tr tr">${esc(fill(L.key.tr))}</span><span class="v-de">${esc(fill(L.key.de))}</span><span class="v-end"><button class="speak-btn sm" data-act="say" data-text="${esc(L.key.hi)}" aria-label="Anhören">${ICON.speaker}</button></span></li>`).join('')}</ul>` : ''}`
    : '<p class="help">Sobald du die erste Lektion gemacht hast, stehen hier alle Wörter, die du kennst, mit Aussprache und Lernstand.</p>'}
  </div>`;
}

/* Einstellungen */
function renderSettings() {
  const v = TTS.voices;
  const seg = (name, val, opts) => `<div class="seg" role="radiogroup" aria-label="${esc(name)}">${opts.map(([k, l]) =>
    `<button role="radio" aria-checked="${val === k}" class="${val === k ? 'on' : ''}" data-act="set" data-key="${name}" data-val="${k}">${l}</button>`).join('')}</div>`;
  const speechState = SPEECH.canRecognize ? 'Aussprache-Rückmeldung über die Spracherkennung des Browsers ist verfügbar.'
    : SPEECH.canRecord ? 'Dieser Browser bietet keine Spracherkennung. Du kannst dich aufnehmen und mit dem Vorbild vergleichen.'
    : 'In dieser Umgebung sind Mikrofon und Spracherkennung nicht verfügbar. Du sprichst nach und bewertest dich selbst.';
  app.innerHTML = `<div class="page view-enter">
    <nav class="topnav"><button class="link back" data-act="home">${ICON.back}<span>Zurück</span></button></nav>
    <h2>Einstellungen</h2>
    <div class="field"><label for="f-name">Dein Name</label><input id="f-name" type="text" value="${esc(S.name)}" autocomplete="given-name" maxlength="30"></div>
    <div class="field"><span class="label">Umschrift</span>${seg('roman', S.settings.roman, [['auto', 'Automatisch'], ['always', 'Immer'], ['tap', 'Auf Antippen']])}
      <p class="help">Automatisch: in den ersten zehn Lektionen deutlich, danach zurückhaltender, ab Lektion 21 nur noch auf Antippen.</p></div>
    <div class="field"><span class="label">Sprechtempo der Stimme</span>${seg('rate', S.settings.rate, [['normal', 'Normal'], ['slow', 'Langsam']])}</div>
    <div class="field"><label for="f-voice">Hindi-Stimme</label>
      ${v.length ? `<select id="f-voice"><option value="">Automatisch wählen</option>${v.map(x => `<option ${x.name === S.settings.voice ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>
      <button class="ghost small-btn" data-act="say" data-text="नमस्ते! आप कैसे हैं?">Stimme testen</button>`
      : `<p class="help">${TTS.ready ? 'Auf diesem Gerät ist keine Hindi-Stimme installiert.' : 'Stimmen werden geladen.'} iPhone und Mac: Einstellungen › Bedienungshilfen › Gesprochene Inhalte › Stimmen › Hindi. Am Mac in Chrome ist „Google हिन्दी“ meist schon vorhanden.</p>`}
    </div>
    <div class="field"><span class="label">Aussprache</span><p class="help">${speechState}</p></div>
    <div class="field" id="sync-field"><span class="label">Auf allen Geräten</span><div id="sync-zone"></div></div>
    <div class="field"><span class="label">Lernstand von Hand sichern</span>
      <p class="help">Ohne Google-Tabelle kannst du den Lernstand hier kopieren und auf einem anderen Gerät einfügen.</p>
      <div class="row"><button class="secondary" data-act="export">Lernstand kopieren</button><button class="ghost" data-act="import-open">Lernstand einfügen</button></div>
      <div id="io" hidden><textarea id="f-io" rows="4" spellcheck="false" aria-label="Lernstand"></textarea><div class="row"><button class="secondary" data-act="import" id="io-apply">Übernehmen</button></div><p class="help" id="io-msg"></p></div>
    </div>
    <div class="field"><span class="label">Neu beginnen</span>
      <div id="reset-zone"><button class="ghost danger" data-act="reset-ask">Lernstand zurücksetzen</button></div>
    </div>
    <p class="small colophon">${LESSONS.length} Lektionen · ${Object.keys(ITEMS).length} Wörter und Wendungen</p>
  </div>`;
  renderSyncStatus();
  const n = document.getElementById('f-name');
  n.addEventListener('change', () => { S.name = n.value.trim() || 'Elisabeth'; save(); toast('Gespeichert.'); });
  const fv = document.getElementById('f-voice');
  if (fv) fv.addEventListener('change', () => { S.settings.voice = fv.value; save(); });
}

function renderSyncStatus() {
  const z = document.getElementById('sync-zone'); if (!z) return;
  if (Sync.on()) {
    const t = Sync.lastOk ? new Date(Sync.lastOk).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '';
    z.innerHTML = `<p class="help">${Sync.busy ? 'Wird gerade abgeglichen …' : Sync.lastError ? esc(Sync.lastError) : t ? `Verbunden mit deiner Google-Tabelle. Zuletzt abgeglichen um ${t} Uhr.` : 'Verbunden mit deiner Google-Tabelle.'}</p>
      <div class="row"><button class="secondary" data-act="sync-now">Jetzt abgleichen</button><button class="ghost" data-act="sync-code">Code für weitere Geräte</button><button class="ghost danger" data-act="sync-off">Trennen</button></div>
      <div id="sync-code" hidden><p class="help">Füge diesen Code auf deinem anderen Gerät unter Einstellungen › Auf allen Geräten ein.</p><textarea id="f-code" rows="3" readonly aria-label="Verbindungscode"></textarea></div>`;
  } else {
    z.innerHTML = `<p class="help">Verbinde die App mit einer eigenen Google-Tabelle. Dann haben iPhone und MacBook denselben Lernstand, und in der Tabelle stehen deine Lektionen und Wörter zum Nachlesen.</p>
      <details class="howto"><summary>So richtest du die Tabelle ein</summary><ol>
        <li>Lege in Google Drive eine neue Tabelle an, etwa „Hindi Lernstand“.</li>
        <li>Öffne Erweiterungen › Apps Script, lösche den vorhandenen Text und füge das Skript ein. Speichern. <button class="link inline-link" data-act="copy-script">Skript kopieren</button></li>
        <li>Wähle oben die Funktion „einrichten“ und klicke auf Ausführen. Bestätige die Berechtigungen. Im Protokoll steht danach dein Schlüssel.</li>
        <li>Klicke auf Bereitstellen › Neue Bereitstellung › Web-App. Ausführen als: Ich. Zugriff: Jeder. Kopiere die Web-App-URL.</li>
        <li>Trage URL und Schlüssel hier ein. Auf dem zweiten Gerät genügt danach der Verbindungscode.</li></ol></details>
      <label for="f-surl" class="sub-label">Web-App-URL</label><input id="f-surl" type="url" inputmode="url" placeholder="https://script.google.com/macros/s/…/exec" autocomplete="off">
      <label for="f-stok" class="sub-label">Schlüssel</label><input id="f-stok" type="text" autocomplete="off" spellcheck="false">
      <div class="row"><button class="secondary" data-act="sync-connect">Verbinden</button></div>
      <label for="f-scode" class="sub-label">Oder Verbindungscode vom anderen Gerät</label><input id="f-scode" type="text" autocomplete="off" spellcheck="false">
      <div class="row"><button class="ghost" data-act="sync-paste">Mit Code verbinden</button></div>
      <p class="help" id="sync-msg">${esc(Sync.lastError || '')}</p>`;
  }
}

/* ───────── Lektion ───────── */
function renderLesson() {
  const se = S.session;
  if (!se) return route('home');
  if (se.i >= se.steps.length) se.i = se.steps.length - 1;
  const st = step();
  const pct = Math.round(se.i / Math.max(1, se.steps.length - 1) * 100);
  const L = lessonOf();
  const label = se.mode === 'review' ? 'Wiederholung' : se.mode === 'practice' ? ({ speak: 'Sprechen üben', script: 'Schrift üben' }[se.kind] || 'Wörter üben') : L.title;
  showRomanOnce = false;
  app.innerHTML = `<div class="lesson">
    <header class="lbar">
      <div class="lbar-left"><button class="icon-btn" data-act="pause" aria-label="Pausieren und zur Startseite">${ICON.close}</button>
      <button class="icon-btn" data-act="prev" aria-label="Zurück zum vorigen Schritt" ${se.i === 0 ? 'disabled' : ''}>${ICON.back}</button></div>
      <div class="lbar-mid"><span class="lbar-title">${esc(label)}</span><div class="rekha" aria-hidden="true"><span style="width:${pct}%"></span></div></div>
      <span class="lbar-step" aria-label="Schritt ${se.i + 1} von ${se.steps.length}">${se.i + 1}/${se.steps.length}</span>
    </header>
    <main class="stage" id="stage"></main>
    <footer class="dock" id="dock"></footer>
  </div>`;
  const stage = document.getElementById('stage'), dock = document.getElementById('dock');
  const R = RENDER[st.k === 'ex' ? 'ex_' + st.ex.t : st.k];
  R(st, stage, dock);
  stage.classList.add('step-enter');
  const auto = stage.querySelector('[data-autoplay]');
  if (auto && !st.res && !st.played) { st.played = true; setTimeout(() => TTS.speak(auto.dataset.text), 250); }
  const focusEl = dock.querySelector('#primary:not([disabled])') || stage.querySelector('button, input');
  if (focusEl && matchMedia('(hover: hover)').matches) focusEl.focus({ preventScroll: true });
}
function next() {
  const se = S.session;
  if (se.i < se.steps.length - 1) { se.i++; save(); renderLesson(); window.scrollTo(0, 0); }
  else finish();
}
function finish() {
  const se = S.session, L = LESSONS[se.idx];
  if (se.mode === 'lesson') {
    L.new.forEach(introduce);
    S.done[L.id] = today();
    S.next = Math.max(S.next, se.idx + 1);
    S.last = { lesson: L.id, date: today() };
  } else if (se.mode === 'repeat') {
    S.last = { lesson: L.id, date: today() };
  }
  const back = se.mode === 'practice' ? (se.kind === 'words' ? 'woerter' : 'lernpfad') : 'home';
  S.session = null;
  save();
  route(back);
}
const dockNext = (label = 'Weiter') => `<button class="primary" id="primary" data-act="next">${label}</button>`;
const dunnoBtn = '<button class="link skip" data-act="dunno">Weiß ich nicht, zeig mir die Lösung</button>';
const phaseLabel = st => st.phase === 'review' ? 'Wiederholung' : st.phase === 'retry' ? 'Noch einmal' : st.phase === 'script' ? 'Schrift' : st.phase === 'check' ? 'Kurz prüfen' : 'Übung';

function feedback(dock, ok, html, label = 'Weiter', head) {
  dock.innerHTML = `<div class="fb ${ok ? 'fb-ok' : head ? 'fb-info' : 'fb-bad'}" role="status">
      <p class="fb-head">${head || (ok ? 'Richtig.' : 'Nicht ganz.')}</p>${html ? `<p class="fb-body">${html}</p>` : ''}
    </div>${dockNext(label)}`;
  dock.classList.add('dock-up');
  const p = dock.querySelector('#primary'); if (p && matchMedia('(hover: hover)').matches) p.focus({ preventScroll: true });
}

const RENDER = {
  intro(st, stage, dock) {
    stage.innerHTML = `<p class="eyebrow">Bevor es losgeht</p>
      <h2 class="h-lead">So liest du die Umschrift</h2>
      <p class="lead">Unter jedem Hindi-Wort steht anfangs eine lateinische Lesehilfe. Ein paar Zeichen genügen, um sie richtig zu lesen.</p>
      <dl class="legend">
        <div><dt>ā ī ū</dt><dd>lange Vokale, wie in „Vater“, „Liebe“, „Mut“</dd></div>
        <div><dt>ã ĩ ũ ẽ</dt><dd>durch die Nase gesprochen, wie im französischen „bon“</dd></div>
        <div><dt>ṭ ḍ ṛ</dt><dd>Zungenspitze nach hinten gebogen</dd></div>
        <div><dt>kh th bh</dt><dd>Konsonant mit hörbarem Hauch, kein „ch“ und kein englisches „th“</dd></div>
        <div><dt>c · j · ś · x</dt><dd>„tsch“ · „dsch“ · „sch“ · „ch“ wie in „Bach“</dd></div>
      </dl>
      <p class="small">Tippe auf den Lautsprecher, um jedes Wort zu hören. Mit „langsam“ hörst du es gedehnt.</p>`;
    dock.innerHTML = `<button class="primary" id="primary" data-act="intro-done">Los geht’s</button>`;
  },

  goal(st, stage, dock) {
    const L = lessonOf(), i = S.session.idx;
    const warm = S.session.steps.filter(x => x.phase === 'review').length;
    const parts = [warm ? `${warm} kurze Wiederholungen` : '', `${L.new.length} neue Wörter und Wendungen mit Nachsprechen`, L.dialog ? 'ein kleiner Dialog' : '', 'ein paar Übungen', 'Sprechen', scriptFor(i) ? 'ein Schriftzeichen' : ''].filter(Boolean);
    stage.innerHTML = `<p class="eyebrow">Lektion ${i + 1} · ${esc(L.topic)}</p>
      <h2 class="h-lead">${esc(L.title)}</h2>
      <p class="lead">Nach dieser Lektion kannst du ${esc(L.goal || '')}</p>
      <p class="aside-k block-k">Heute neu</p>
      <ul class="goal-words">${L.new.map(id => `<li>${deva(ITEMS[id].hi, 'inl')} <span class="small">${esc(ITEMS[id].de)}</span></li>`).join('')}</ul>
      <p class="small goal-flow">So läuft es ab: ${parts.join(', ')}. Etwa fünf Minuten.</p>`;
    dock.innerHTML = dockNext('Los geht’s');
  },

  learn(st, stage, dock) {
    const it = ITEMS[st.item];
    introduce(st.item); save();
    st.hi = it.hi; st.tr = it.tr; st.de = it.de;
    const mode = speechMode();
    const multi = words(it.hi).length > 1;
    const speakRow = multi
      ? `<p class="aside-k block-k">Wort für Wort</p>${wordByWord(it.hi)}
         <p class="aside-k block-k">Nachsprechen, Stück für Stück</p>
         <p class="small">Erst anhören, dann nachsprechen. Jede Zeile ist ein Stück länger.${mode === 'self' && SPEECH.framed && st.n <= 2 ? ' ' + FRAMED_NOTE : ''}</p>
         ${ladderHTML(st, it.hi, mode)}`
      : mode === 'self'
      ? `<p class="small say-aloud">Hör es dir an und sprich das Wort zwei Mal laut nach.${SPEECH.framed && st.n === 1 ? ' ' + FRAMED_NOTE : ''}</p>`
      : `<div class="mic-zone row-zone">${micZone(st, mode, true)}</div>${speakResult(st.result)}`;
    stage.innerHTML = `<p class="eyebrow">Neu · ${st.n} von ${st.of}</p>
      <div class="word">${deva(it.hi, words(it.hi).length > 1 ? 'sent' : 'xl')}</div>
      <div class="word-meta">${trHTML(it.tr, true, 'tr-lg')}<span class="de">${esc(it.de)}</span></div>
      ${audioBtn(it.hi)}
      <span hidden data-autoplay data-text="${esc(it.hi)}"></span>
      ${speakRow}
      ${it.hint ? `<p class="aside"><span class="aside-k">Aussprache</span>${esc(it.hint)}</p>` : ''}
      ${it.note ? `<p class="aside"><span class="aside-k">Gebrauch</span>${esc(it.note)}</p>` : ''}`;
    dock.innerHTML = dockNext();
  },

  dialog(st, stage, dock) {
    const L = lessonOf();
    const g = Object.entries(L.gloss || {});
    stage.innerHTML = `<p class="eyebrow">Im Gespräch</p>
      <ol class="dialog">${L.dialog.map((d, i) => `<li class="${d.who === 'du' ? 'me' : ''}">
        <span class="who">${d.who === 'du' ? 'Du' : esc(d.who)}</span>
        <div class="line"><div class="line-hi">${deva(d.hi, 'md')}<button class="speak-btn sm" data-act="say" data-text="${esc(d.hi)}" aria-label="Zeile anhören">${ICON.speaker}</button></div>
        ${trHTML(d.tr)}<span class="de">${esc(fill(d.de))}</span></div></li>`).join('')}</ol>
      ${L.dialog.length > 1 ? `<button class="ghost play-all" data-act="play-dialog">${ICON.play}<span>Ganzes Gespräch anhören</span></button>` : ''}
      ${g.length ? `<p class="aside"><span class="aside-k">Neu im Gespräch</span>${g.map(([h, d]) => `${deva(h, 'inl')} ${esc(d)}`).join(' · ')}</p>` : ''}
      ${L.note ? `<p class="aside"><span class="aside-k">Gut zu wissen</span>${esc(L.note)}</p>` : ''}`;
    dock.innerHTML = dockNext();
  },

  script(st, stage, dock) {
    const s = scriptFor(S.session.idx);
    const focus = s.focus.split(/\s+/);
    const fNFD = focus.map(f => f.normalize('NFD'));
    const knownIds = poolUpTo(S.session.idx).filter(id => fNFD.some(f => ITEMS[id].hi.normalize('NFD').includes(f)));
    const examples = [...new Set(knownIds.flatMap(id => words(ITEMS[id].hi)).filter(w => fNFD.some(f => w.normalize('NFD').includes(f))))].slice(0, 4);
    const hl = w => {
      const seg = window.Intl && Intl.Segmenter ? [...new Intl.Segmenter('hi', { granularity: 'grapheme' }).segment(w)].map(x => x.segment) : [w];
      return seg.map(g => fNFD.some(f => g.normalize('NFD').includes(f)) ? `<mark>${esc(g)}</mark>` : esc(g)).join('');
    };
    const glyph = f => /^[ा-्ँ-ः़]$/.test(f) ? '◌' + f : f;
    stage.innerHTML = `<p class="eyebrow">Schrift · ${esc(s.sound)}</p>
      ${S.session.idx + 1 === SCRIPT.startLesson ? '<p class="lead">Ab heute lernst du nach und nach die Schrift kennen, immer ein Zeichen pro Lektion und nur in Wörtern, die du schon sprechen kannst.</p>' : ''}
      <div class="glyphs" lang="hi">${focus.map(f => `<span class="glyph">${esc(glyph(f))}</span>`).join('')}</div>
      <p class="lead">${esc(s.text)}</p>
      ${examples.length ? `<p class="aside-k">In Wörtern, die du kennst</p><ul class="ex-words">${examples.map(w => `<li><span class="deva md" lang="hi">${hl(w)}</span><button class="speak-btn sm" data-act="say" data-text="${esc(w)}" aria-label="Anhören">${ICON.speaker}</button></li>`).join('')}</ul>` : ''}`;
    dock.innerHTML = dockNext('Ausprobieren');
  },

  ex_choose(st, stage, dock) {
    const ex = st.ex, t = getItem(ex.item);
    const listen = ex.dir === 'audio2de' && TTS.canSpeak() && (!TTS.ready || TTS.hasHindi());
    const dir = ex.dir === 'audio2de' && !listen ? 'hi2de' : ex.dir;
    let prompt, head;
    if (dir === 'hi2de') { head = 'Was bedeutet das?'; prompt = `<div class="word">${deva(t.hi, 'lg')}</div>${trHTML(t.tr)}${audioBtn(t.hi, 'Anhören', false)}`; }
    else if (dir === 'sent2de') { head = 'Was bedeutet dieser Satz?'; prompt = `<div class="word">${deva(t.hi, 'sent')}</div>${trHTML(t.tr)}${audioBtn(t.hi, 'Anhören', true)}`; }
    else if (dir === 'de2hi') { head = 'Wie sagst du das auf Hindi?'; prompt = `<p class="de-prompt">${esc(t.de)}</p>`; }
    else { head = 'Was hörst du?'; prompt = `<div class="listen-box">${audioBtn(t.hi, 'Noch einmal anhören', true)}<span hidden data-autoplay data-text="${esc(t.hi)}"></span></div>`; }
    const label = id => { const o = getItem(id); return dir === 'de2hi' ? `${deva(o.hi, 'dopt')}${romanMode() !== 'tap' ? `<span class="tr opt-tr ${romanMode() === 'soft' ? 'tr-soft' : ''}">${esc(fill(o.tr))}</span>` : ''}` : `<span>${esc(fill(o.de))}</span>`; };
    stage.innerHTML = `<p class="eyebrow">${phaseLabel(st)}</p><h2 class="q">${head}</h2>${prompt}
      <div class="options ${dir === 'de2hi' ? 'opts-hi' : ''}" role="group">${ex.options.map((id, i) =>
        `<button class="opt" data-act="pick" data-val="${esc(id)}" data-key="${i + 1}"><kbd>${i + 1}</kbd>${label(id)}</button>`).join('')}</div>`;
    if (st.res) return showChoose(st, stage, dock, dir);
    dock.innerHTML = `<p class="dock-hint">Wähle eine Antwort.</p>${dunnoBtn}`;
  },

  ex_recall(st, stage, dock) {
    const it = getItem(st.ex.item);
    stage.innerHTML = `<p class="eyebrow">${phaseLabel(st)} · aktiv erinnern</p>
      <h2 class="q">Wie heißt das auf Hindi?</h2>
      <p class="de-prompt">${esc(fill(it.de))}</p>
      <p class="small">Sag es dir laut oder leise vor. Dann sieh nach.</p>
      <div id="reveal" ${st.revealed ? '' : 'hidden'}><div class="word">${deva(it.hi, 'lg')}</div>${trHTML(it.tr)}${audioBtn(it.hi)}</div>`;
    if (st.res) { feedback(dock, st.res.ok, st.res.ok ? '' : 'Das Wort kommt bald noch einmal.'); return; }
    dock.innerHTML = st.revealed
      ? `<p class="dock-hint">Wie gut wusstest du es?</p><div class="rate"><button class="secondary" data-act="rate" data-val="0">Noch nicht</button><button class="secondary" data-act="rate" data-val="1">Fast</button><button class="primary" id="primary" data-act="rate" data-val="2">Gewusst</button></div>`
      : `<button class="primary" id="primary" data-act="reveal">Antwort zeigen</button>`;
  },

  ex_match(st, stage, dock) {
    const ex = st.ex; st.m = st.m || { done: [], sel: null, miss: 0 };
    const m = st.m;
    stage.innerHTML = `<p class="eyebrow">${phaseLabel(st)}</p><h2 class="q">Was gehört zusammen?</h2>
      <div class="match">
        <div class="col">${ex.left.map(id => `<button class="opt m-hi ${m.done.includes(id) ? 'is-done' : ''} ${m.sel === 'L' + id ? 'is-sel' : ''}" data-act="m" data-side="L" data-val="${id}" ${m.done.includes(id) ? 'disabled' : ''}>${hiWithTr(ITEMS[id].hi)}</button>`).join('')}</div>
        <div class="col">${ex.right.map(id => `<button class="opt m-de ${m.done.includes(id) ? 'is-done' : ''} ${m.sel === 'R' + id ? 'is-sel' : ''}" data-act="m" data-side="R" data-val="${id}" ${m.done.includes(id) ? 'disabled' : ''}>${esc(ITEMS[id].de)}</button>`).join('')}</div>
      </div><p class="match-msg small" id="mmsg">${st.mmsg || ''}</p>`;
    if (m.done.length === ex.items.length) feedback(dock, m.miss === 0, m.miss ? 'Die verwechselten Wörter kommen bald noch einmal.' : 'Alle Paare stimmen.');
    else dock.innerHTML = `<p class="dock-hint">Tippe ein Hindi-Wort und dann seine Bedeutung.</p>`;
  },

  ex_cloze(st, stage, dock) {
    const ex = st.ex;
    const filled = st.res ? st.res.val : null;
    const sentence = esc(fill(ex.hi)).replace('___', `<span class="gap ${filled ? (st.res.ok ? 'gap-ok' : 'gap-bad') : ''}">${filled ? esc(filled) : '&nbsp;'}</span>`);
    stage.innerHTML = `<p class="eyebrow">${phaseLabel(st)}</p><h2 class="q">Ergänze das fehlende Wort.</h2>
      <p class="de-prompt sm">${esc(fill(ex.de))}</p>
      <div class="cloze deva sent" lang="hi">${sentence}</div>
      ${trHTML(ex.tr.replace('___', '…'))}
      <div class="tiles">${ex.options.map((o, i) => `<button class="tile ${filled === o ? (st.res.ok ? 'is-ok' : 'is-bad') : ''} ${st.res && o === ex.answer ? 'is-answer' : ''}" data-act="cloze" data-val="${esc(o)}" data-key="${i + 1}" ${st.res ? 'disabled' : ''}>${hiWithTr(o)}</button>`).join('')}</div>`;
    if (st.res && st.res.dunno) {
      const full = fill(ex.hi).replace('___', ex.answer);
      feedback(dock, false, `Es fehlt ${deva(ex.answer, 'inl')}: ${deva(full, 'inl')} ${audioBtn(full, 'Satz anhören', false)}`, 'Weiter', 'Die Lösung');
    } else if (st.res) {
      const full = fill(ex.hi).replace('___', ex.answer);
      feedback(dock, st.res.ok, st.res.ok ? `${deva(full, 'inl')} ${audioBtn(full, 'Satz anhören', false)}` : `${esc(ex.why[st.res.val] || '')} Richtig ist ${deva(ex.answer, 'inl')}.`);
    } else dock.innerHTML = `<p class="dock-hint">Wähle einen Baustein.</p>${dunnoBtn}`;
  },

  ex_order(st, stage, dock) {
    const ex = st.ex; st.pick = st.pick || [];
    const used = new Set(st.pick);
    stage.innerHTML = `<p class="eyebrow">${phaseLabel(st)}</p><h2 class="q">Bilde den Satz.</h2>
      <p class="de-prompt">${esc(fill(ex.de))}</p>
      <div class="build ${st.res ? (st.res.ok ? 'is-ok' : 'is-bad') : ''}" aria-label="Dein Satz">${st.pick.map((ti, k) => `<button class="tile in" data-act="unpick" data-pos="${k}" ${st.res ? 'disabled' : ''}><span class="deva dopt" lang="hi">${esc(ex.tiles[ti].w)}</span></button>`).join('') || '<span class="build-ph">Tippe die Bausteine in der richtigen Reihenfolge an.</span>'}</div>
      <div class="tiles">${ex.tiles.map((t, ti) => `<button class="tile ${used.has(ti) ? 'is-used' : ''}" data-act="opick" data-val="${ti}" ${used.has(ti) || st.res ? 'disabled' : ''}>${hiWithTr(t.w)}</button>`).join('')}</div>`;
    if (st.res && st.res.dunno) {
      feedback(dock, false, `${deva(fill(ex.hi), 'inl')} ${audioBtn(ex.hi, 'Satz anhören', false)}<br>${esc(ex.why || '')}`, 'Weiter', 'Die Lösung');
    } else if (st.res) {
      const right = words(ex.hi).join(' ');
      feedback(dock, st.res.ok, st.res.ok ? `${audioBtn(ex.hi, 'Satz anhören', false)} ${esc(ex.why || '')}` : `Richtig ist ${deva(fill(ex.hi), 'inl')} ${audioBtn(ex.hi, 'Satz anhören', false)}<br>${esc(ex.why || '')}`);
      void right;
    } else dock.innerHTML = `<button class="primary" id="primary" data-act="check-order" ${st.pick.length === ex.tiles.length ? '' : 'disabled'}>Prüfen</button>${dunnoBtn}`;
  },

  ex_natural(st, stage, dock) {
    const ex = st.ex;
    stage.innerHTML = `<p class="eyebrow">${phaseLabel(st)}</p><h2 class="q">Was sagst du?</h2>
      <p class="situation">${esc(ex.situation).replace(/([ऀ-ॿ][ऀ-ॿ\s।?!,]*[ऀ-ॿ।?!])/g, '<span class="deva inl" lang="hi">$1</span>')}</p>
      <div class="options opts-hi" role="group">${ex.options.map((o, i) => `<button class="opt ${st.res ? (o.ok ? 'is-ok' : st.res.val === i ? 'is-bad' : 'is-dim') : ''}" data-act="nat" data-val="${i}" data-key="${i + 1}" ${st.res ? 'disabled' : ''}><kbd>${i + 1}</kbd><span class="opt-stack">${deva(o.hi, 'dopt')}${romanMode() === 'full' && trGuess(o.hi) ? `<span class="tr opt-tr">${esc(fill(trGuess(o.hi)))}</span>` : ''}</span></button>`).join('')}</div>`;
    if (st.res) {
      const chosen = ex.options[st.res.val], good = ex.options.find(o => o.ok);
      if (st.res.dunno) return feedback(dock, false, `${deva(good.hi, 'inl')} ${audioBtn(good.hi, 'Anhören', false)} ${esc(good.why)}`, 'Weiter', 'Die Lösung');
      feedback(dock, st.res.ok, st.res.ok ? `${esc(good.why)} ${audioBtn(good.hi, 'Anhören', false)}` : `${esc(chosen.why)} Natürlich wäre ${deva(good.hi, 'inl')}. ${esc(good.why)}`);
    } else dock.innerHTML = `<p class="dock-hint">Wähle die natürlichste Antwort.</p>${dunnoBtn}`;
  },

  ex_sfind(st, stage, dock) {
    const ex = st.ex;
    stage.innerHTML = `<p class="eyebrow">Schrift</p><h2 class="q">In welchem Wort steckt <span class="deva inl" lang="hi">${esc(ex.focus.split(/\s+/)[0])}</span>?</h2>
      <div class="options opts-hi" role="group">${ex.options.map((o, i) => `<button class="opt ${st.res ? (o === ex.answer ? 'is-ok' : st.res.val === o ? 'is-bad' : 'is-dim') : ''}" data-act="spick" data-val="${esc(o)}" data-key="${i + 1}" ${st.res ? 'disabled' : ''}><kbd>${i + 1}</kbd>${deva(o, 'dopt')}</button>`).join('')}</div>`;
    if (st.res && st.res.dunno) feedback(dock, false, `Das Zeichen steht in ${deva(ex.answer, 'inl')}.`, 'Weiter', 'Die Lösung');
    else if (st.res) feedback(dock, st.res.ok, st.res.ok ? '' : `Das Zeichen steht in ${deva(ex.answer, 'inl')}. Achte auf seine Form am Anfang oder in der Mitte des Wortes.`);
    else dock.innerHTML = `<p class="dock-hint">Suche das Zeichen.</p>${dunnoBtn}`;
  },

  ex_sread(st, stage, dock) {
    const ex = st.ex;
    stage.innerHTML = `<p class="eyebrow">Schrift</p><h2 class="q">Lies dieses Wort.</h2>
      <div class="word">${deva(ex.word, 'xl')}</div>
      <p class="small">Alle Zeichen darin hast du schon kennengelernt.</p>
      <div class="options" role="group">${ex.options.map((o, i) => `<button class="opt ${st.res ? (o === ex.answer ? 'is-ok' : st.res.val === o ? 'is-bad' : 'is-dim') : ''}" data-act="spick" data-val="${esc(o)}" data-key="${i + 1}" ${st.res ? 'disabled' : ''}><kbd>${i + 1}</kbd><span class="tr-plain">${esc(o)}</span></button>`).join('')}</div>`;
    if (st.res && st.res.dunno) feedback(dock, false, `Es heißt ${esc(ex.answer)}. ${esc(ex.after || '')} ${audioBtn(ex.word, 'Anhören', false)}`, 'Weiter', 'Die Lösung');
    else if (st.res) feedback(dock, st.res.ok, `${st.res.ok ? '' : `Es heißt ${esc(ex.answer)}. `}${esc(ex.after || '')} ${audioBtn(ex.word, 'Anhören', false)}`);
    else dock.innerHTML = `<p class="dock-hint">Wie klingt es?</p>${dunnoBtn}`;
  },

  speak(st, stage, dock) { renderSpeak(st, stage, dock); },

  close(st, stage, dock) {
    const se = S.session, L = lessonOf();
    let body;
    if (se.mode === 'review' || se.mode === 'practice') {
      body = `<p class="eyebrow">Wiederholung</p><h2 class="h-lead">Gut gemacht.</h2>
        <p class="lead">${se.right} von ${se.right + se.wrong} Antworten waren richtig. Was noch wackelt, kommt in den nächsten Tagen wieder.</p>`;
    } else {
      const sid = 's:' + L.id;
      introduce(sid);
      if (!st.sentGraded) { st.sentGraded = true; grade(sid, true); }
      save();
      body = `<p class="eyebrow">Satz des Tages</p>
        <div class="key">${deva(L.key.hi, 'sent key-hi')}<span class="key-rule" aria-hidden="true"></span></div>
        <div class="word-meta">${trHTML(L.key.tr, true)}<span class="de">${esc(fill(L.key.de))}</span></div>
        ${audioBtn(L.key.hi, 'Satz anhören')}
        ${(() => { const pc = POSTCARDS.find(c => c.after === L.id); return pc && se.mode === 'lesson' && !S.done[L.id] ? `<div class="pc-new"><span class="aside-k">Neue Postkarte</span>${postcardHTML(pc, true)}</div>` : ''; })()}
        ${L.goal ? `<p class="cando"><span class="aside-k">Das kannst du jetzt</span>Du kannst ${esc(L.goal)}</p>` : ''}`;
    }
    const kw = knownWords(), us = understoodSentences();
    stage.innerHTML = `${body}
      <ul class="facts">
        <li>Heute gelernt: <strong>${minutes(learnedToday())} ${minutes(learnedToday()) === 1 ? 'Minute' : 'Minuten'}</strong></li>
        <li>Du kennst inzwischen <strong>${kw} ${kw === 1 ? 'Wort' : 'Wörter'}</strong>.</li>
        ${us ? `<li><strong>${us} ${us === 1 ? 'Satz' : 'Sätze'}</strong> kannst du bereits ohne Hilfe verstehen.</li>` : ''}
      </ul>`;
    dock.innerHTML = `<button class="primary" id="primary" data-act="finish">${se.mode === 'lesson' ? 'Für heute fertig' : 'Fertig'}</button>${se.mode !== 'review' && se.mode !== 'practice' ? '<p class="small heft-hint">Dialog, Satz und Wörter stehen ab jetzt auch im Lernheft.</p>' : ''}`;
  }
};

function showChoose(st, stage, dock, dir) {
  const ex = st.ex, t = getItem(ex.item), c = getItem(st.res.val || ex.item);
  stage.querySelectorAll('.opt').forEach(b => {
    b.disabled = true;
    if (b.dataset.val === ex.item) b.classList.add('is-ok');
    else if (b.dataset.val === st.res.val) b.classList.add('is-bad');
    else b.classList.add('is-dim');
  });
  if (st.res.dunno) return feedback(dock, false, `${deva(t.hi, 'inl')} ${trHTML(t.tr)} heißt „${esc(fill(t.de))}“. ${audioBtn(t.hi, 'Anhören', false)} Das Wort kommt gleich noch einmal.`, 'Weiter', 'Die Lösung');
  let why = '';
  if (!st.res.ok) {
    if (dir === 'de2hi') why = `„${esc(fill(t.de))}“ heißt ${deva(t.hi, 'inl')}. ${deva(c.hi, 'inl')} bedeutet „${esc(fill(c.de))}“.`;
    else if (dir === 'audio2de') why = `Du hast ${deva(t.hi, 'inl')} gehört, das heißt „${esc(fill(t.de))}“. „${esc(fill(c.de))}“ wäre ${deva(c.hi, 'inl')}.`;
    else if (dir === 'sent2de') why = `Der Satz heißt „${esc(fill(t.de))}“.`;
    else why = `${deva(t.hi, 'inl')} heißt „${esc(fill(t.de))}“. „${esc(fill(c.de))}“ wäre ${deva(c.hi, 'inl')}.`;
  } else if (dir === 'audio2de' || dir === 'de2hi') why = `${deva(t.hi, 'inl')} ${trHTML(t.tr)} ${audioBtn(t.hi, 'Anhören', false)}`;
  feedback(dock, st.res.ok, why);
}

/* ───────── Spielerisches: Rollenspiele, Memory, Postkarten ───────── */
function gamesState() { S.games = S.games || { rp: {}, mem: 0 }; S.games.rp = S.games.rp || {}; return S.games; }
function postcardHTML(pc, fresh = false) {
  return `<article class="pc ${fresh ? 'pc-fresh' : ''}"><div class="pc-stamp" lang="hi">${esc(pc.hi)}</div><p class="pc-tr">${esc(pc.tr)}</p><h3 class="pc-title">${esc(pc.title)}</h3><p class="pc-text">${esc(pc.text)}</p></article>`;
}
function renderPostcards() {
  app.innerHTML = `<div class="page view-enter">${backNav('path')}<h2>Postkarten</h2>
    <p class="small">Alle fünf Lektionen öffnet sich eine Karte mit einer kleinen Geschichte zur Sprache.</p>
    <div class="pc-grid">${POSTCARDS.map(pc => { const L = LESSONS.findIndex(x => x.id === pc.after);
      return S.done[pc.after] ? postcardHTML(pc) : `<article class="pc pc-locked"><div class="pc-stamp">?</div><p class="small">öffnet sich nach Lektion ${L + 1}</p></article>`; }).join('')}</div></div>`;
}

/* Rollenspiel: Gegenseite spricht, du antwortest, falsche Antworten haben eine kleine Folge */
function renderRoleplay() {
  const g = current.rp; if (!g) return route('lernpfad');
  const r = ROLEPLAYS.find(x => x.id === g.id);
  const t = r.turns[g.turn];
  const line = (who, hi, tr, de, me) => `<li class="${me ? 'me' : ''}"><span class="who">${me ? 'Du' : esc(who)}</span><div class="line"><div class="line-hi">${deva(hi, 'md')}<button class="speak-btn sm" data-act="say" data-text="${esc(hi)}" aria-label="Anhören">${ICON.speaker}</button></div>${trHTML(tr)}${de ? `<button class="rp-de ${g.showDe ? 'on' : ''}" data-act="rp-de">${esc(fill(de))}</button>` : ''}</div></li>`;
  const log = g.log.map(l => l.scene ? `<li class="rp-scene">${esc(l.scene)}</li>` : line(r.partner, l.hi, l.tr, l.de, l.me)).join('');
  const done = g.turn >= r.turns.length;
  let choices = '';
  if (!done && !g.waiting) choices = `<div class="options opts-hi rp-choices" role="group">${t.choices.map((c, i) => `<button class="opt ${g.wrong === i ? 'is-bad' : ''}" data-act="rp-pick" data-val="${i}" data-key="${i + 1}" ${g.wrong === i ? 'disabled' : ''}><kbd>${i + 1}</kbd>${hiWithTr(c.hi)}</button>`).join('')}</div>`;
  app.innerHTML = `<div class="lesson">
    <header class="lbar"><div class="lbar-left"><button class="icon-btn" data-act="path" aria-label="Rollenspiel beenden">${ICON.close}</button></div>
      <div class="lbar-mid"><span class="lbar-title">Rollenspiel · ${esc(r.title)}</span><div class="rekha" aria-hidden="true"><span style="width:${Math.round(g.turn / r.turns.length * 100)}%"></span></div></div><span></span></header>
    <main class="stage">
      <p class="lead rp-intro">${esc(r.intro)}</p>
      <ol class="dialog rp-log">${log}</ol>
      ${done ? `<div class="result res-ok"><p class="res-head">Szene geschafft.</p><p class="small">${g.misses ? `${g.misses === 1 ? 'Eine Antwort hast' : g.misses + ' Antworten hast'} du unterwegs angepasst. Genau so lernt man im Gespräch.` : 'Ohne einen einzigen Umweg. Sehr schön.'}</p></div>` : choices}
    </main>
    <footer class="dock">${done ? `<div class="row rp-end"><button class="secondary" data-act="rp-open" data-id="${r.id}">Noch einmal spielen</button><button class="primary" id="primary" data-act="path">Fertig</button></div>`
      : g.waiting ? '<p class="dock-hint">…</p>' : g.wrong != null ? `<div class="fb fb-info"><p class="fb-head">Hm.</p><p class="fb-body">${esc(t.choices[g.wrong].why)}</p></div><p class="dock-hint">Versuch eine andere Antwort.</p>` : `<p class="dock-hint">Was sagst du? Tippe die Zeilen an, um sie zu hören.</p>`}</footer>
  </div>`;
  const last = document.querySelectorAll('.rp-log li:not(.rp-scene)');
  if (g.speakLast && last.length) { g.speakLast = false; const b = last[last.length - 1].querySelector('.speak-btn'); if (b) setTimeout(() => TTS.speak(b.dataset.text), 200); }
  const lg = document.querySelector('.rp-log'); if (lg && lg.lastElementChild) lg.lastElementChild.scrollIntoView({ block: 'nearest' });
}
function rpAdvance(g, r) {
  const t = r.turns[g.turn];
  if (!t) { g.log.push({ hi: r.end.hi, tr: r.end.tr, de: r.end.de }); g.speakLast = true; const gs = gamesState(); gs.rp[r.id] = (gs.rp[r.id] || 0) + 1; save(); return; }
  if (t.hi) { g.log.push({ hi: t.hi, tr: t.tr, de: t.de }); g.speakLast = true; }
  if (t.scene) g.log.push({ scene: t.scene });
}

/* Hör-Memory: sechs Paare, beim Aufdecken klingt das Wort */
function startMemory() {
  const ids = Object.keys(S.items).filter(id => !id.startsWith('s:') && ITEMS[id]);
  const weak = shuffle(ids.filter(id => itemState(id).k !== 'sure'));
  const pick = [...new Set([...weak.slice(0, 4), ...shuffle(ids)])].filter((id, i, a) => a.findIndex(x => ITEMS[x].de === ITEMS[id].de) === i).slice(0, 6);
  current.mem = { cards: shuffle(pick.flatMap(id => [{ id, side: 'hi' }, { id, side: 'de' }])), open: [], found: [], moves: 0, lock: false };
  route('memory');
}
function renderMemory() {
  const m = current.mem; if (!m) return route('lernpfad');
  const done = m.found.length * 2 === m.cards.length;
  app.innerHTML = `<div class="page view-enter">${backNav('path')}<h2>Hör-Memory</h2>
    <p class="small">Finde zu jedem Hindi-Wort seine Bedeutung. Beim Aufdecken hörst du das Wort.</p>
    <div class="mem-grid">${m.cards.map((c, i) => { const up = m.open.includes(i) || m.found.includes(c.id);
      return `<button class="mem ${up ? 'up' : ''} ${m.found.includes(c.id) ? 'found' : ''}" data-act="mem-flip" data-i="${i}" ${m.found.includes(c.id) ? 'disabled' : ''} aria-label="${up ? esc(c.side === 'hi' ? ITEMS[c.id].hi : ITEMS[c.id].de) : 'Verdeckte Karte'}">
        ${up ? (c.side === 'hi' ? hiWithTr(ITEMS[c.id].hi) : `<span class="mem-de">${esc(ITEMS[c.id].de)}</span>`) : '<span class="mem-back" lang="hi">हि</span>'}</button>`; }).join('')}</div>
    <p class="small mem-status">${done ? `Alle Paare gefunden, in ${m.moves} Zügen.` : `${m.found.length} von ${m.cards.length / 2} Paaren`}</p>
    ${done ? `<div class="row"><button class="primary" data-act="mem-open">Neue Runde</button><button class="ghost" data-act="path">Fertig</button></div>` : ''}
  </div>`;
}

/* ───────── Sprechübung ───────── */
let recActive = null, mediaRec = null, recChunks = [], recUrl = null;
function speakResult(r) {
  let resultHTML = '';
  if (r && r.kind === 'eval') {
    const tier = r.score >= 0.99 ? 'Sehr gut verständlich.' : r.score >= 0.5 ? 'Fast. Ein Teil kam noch nicht klar an.' : 'Das wurde noch nicht erkannt.';
    const miss = r.words.filter(w => !w.ok && !w.wild);
    const hint = miss.map(w => tokenHints[w.w]).find(Boolean);
    resultHTML = `<div class="result ${r.score >= 0.99 ? 'res-ok' : r.score >= 0.5 ? 'res-mid' : 'res-bad'}">
      <p class="res-head">${tier}</p>
      <div class="res-words" lang="hi">${r.words.map(w => `<span class="rw ${w.ok ? 'ok' : 'miss'}">${esc(w.w)}</span>`).join(' ')}</div>
      ${r.heard ? `<p class="small">Erkannt wurde: <span class="deva inl" lang="hi">${esc(r.heard)}</span>${/[ऀ-ॿ]/.test(r.heard) ? ` <span class="tr tr-soft">(${esc(translitHeard(r.heard))})</span>` : ''}</p>` : ''}
      ${miss.length ? `<p class="small">Achte auf ${miss.map(w => deva(w.w, 'inl')).join(', ')}.${hint ? ' ' + esc(hint) : ''}</p>` : ''}
      ${r.score < 0.99 ? '<p class="small">Hör dir das Vorbild langsam an und sprich es dann Silbe für Silbe nach.</p>' : ''}
    </div>`;
  } else if (r && r.kind === 'error') resultHTML = `<div class="result res-bad"><p class="res-head">${esc(r.msg)}</p></div>`;
  else if (r && r.kind === 'self') resultHTML = `<div class="result res-ok"><p class="res-head">${r.ok ? 'Schön. Sprich es morgen noch einmal.' : 'Hör es dir noch zwei, drei Mal an und sprich mit.'}</p></div>`;
  return resultHTML;
}
function micZone(st, mode, compact = false) {
  const r = st.result;
  const idle = compact ? (r ? 'Noch einmal sprechen' : 'Nachsprechen') : (r ? 'Noch einmal versuchen' : 'Sprechen');
  if (mode === 'recognize') return `<button class="mic ${compact ? 'sm' : ''} ${recActive ? 'is-on' : ''}" data-act="mic" aria-label="${recActive ? 'Aufnahme beenden' : 'Sprechen'}">${recActive ? ICON.stop : ICON.mic}</button><p class="mic-state" id="mic-state">${recActive ? 'Ich höre zu …' : idle}</p>`;
  if (mode === 'record') return `<button class="mic ${compact ? 'sm' : ''} ${mediaRec ? 'is-on' : ''}" data-act="record" aria-label="${mediaRec ? 'Aufnahme beenden' : 'Aufnehmen'}">${mediaRec ? ICON.stop : ICON.mic}</button><p class="mic-state" id="mic-state">${mediaRec ? 'Aufnahme läuft …' : (compact ? 'Nachsprechen und aufnehmen' : 'Aufnehmen')}</p>
        ${st.recUrl ? `<div class="compare"><button class="secondary" data-act="play-me">${ICON.play}<span>Meine Aufnahme</span></button><button class="secondary" data-act="say" data-text="${esc(st.hi)}">${ICON.speaker}<span>Vorbild</span></button></div>` : ''}`;
  return '';
}
function ladderSteps(hi) {
  const toks = words(hi), n = toks.length;
  const sizes = n <= 4 ? Array.from({ length: n }, (_, i) => i + 1) : [...new Set([1, 2, Math.ceil(n / 2) + 1, n])].filter(k => k <= n);
  return sizes.map(k => k === n ? fill(hi) : toks.slice(n - k).join(' '));
}
function wordByWord(hi) {
  const toks = words(hi);
  return `<div class="wbw" aria-label="Wort für Wort">${toks.map(w => `<button class="wbw-i" data-act="say" data-text="${esc(w)}"><span class="deva dopt" lang="hi">${esc(w)}</span><span class="tr opt-tr">${esc(tokenTr[w] || (w === fill('{name}') ? w : ''))}</span><span class="wbw-de">${esc(tokenMeaning[w] || (w === fill('{name}') ? 'Name' : ''))}</span></button>`).join('')}</div>`;
}
function ladderHTML(st, hi, mode) {
  const steps = ladderSteps(hi), lres = st.lres || {};
  return `<ol class="ladder">${steps.map((seg, k) => {
    const r = lres[k], on = recActive && st.listening === k;
    let res = '';
    if (r && r.kind === 'eval') {
      const miss = r.words.filter(w => !w.ok && !w.wild);
      res = `<p class="lres ${r.score >= 0.99 ? 'ok' : r.score >= 0.5 ? 'mid' : 'bad'}">${r.score >= 0.99 ? 'Sehr gut verständlich.' : `Noch nicht klar: ${miss.map(w => deva(w.w, 'inl')).join(', ')}.`}${r.heard && r.score < 0.99 ? ` Erkannt wurde ${deva(r.heard, 'inl')}.` : ''}${miss.length && tokenHints[miss[0].w] ? ' ' + esc(tokenHints[miss[0].w]) : ''}</p>`;
    } else if (r && r.kind === 'error') res = `<p class="lres bad">${esc(r.msg)}</p>`;
    return `<li class="${k === steps.length - 1 ? 'full' : ''}">
      <div class="lad-line"><span class="lad-hi">${deva(seg, k === steps.length - 1 ? 'md' : 'dopt')}<span class="tr opt-tr">${esc(fill(trGuess(seg.replace(PUNCT, ' ')) || ''))}</span></span>
      <span class="lad-btns"><button class="speak-btn" data-act="say" data-text="${esc(seg)}" aria-label="Anhören">${ICON.speaker}</button>${mode === 'recognize' ? `<button class="mic xs ${on ? 'is-on' : ''}" data-act="lmic" data-slot="${k}" aria-label="Nachsprechen">${on ? ICON.stop : ICON.mic}</button>` : ''}</span></div>${res}</li>`;
  }).join('')}</ol>`;
}
function renderSpeak(st, stage, dock) {
  if (words(st.hi).length >= 3) return renderLadderSpeak(st, stage, dock);
  const mode = speechMode();
  st.mode = mode;
  const r = st.result;
  const resultHTML = speakResult(r);

  const intro = mode === 'recognize'
    ? 'Tippe auf das Mikrofon und sprich den Satz. Die Spracherkennung zeigt dir, welche Wörter klar ankamen.'
    : mode === 'record' ? 'Nimm dich auf und vergleiche deine Aufnahme mit dem Vorbild.'
    : (SPEECH.framed ? FRAMED_NOTE + ' Hier sprichst du laut nach und vergleichst selbst.' : 'Sprich den Satz laut nach. Hör dir danach das Vorbild noch einmal an und vergleiche.');
  stage.innerHTML = `<p class="eyebrow">Aussprache</p><h2 class="q">Jetzt sprichst du.</h2>
    <div class="word">${deva(st.hi, words(st.hi).length > 1 ? 'sent' : 'lg')}</div>
    <div class="word-meta">${trHTML(st.tr, true)}<span class="de">${esc(fill(st.de))}</span></div>
    ${audioBtn(st.hi, 'Vorbild anhören')}
    <p class="small speak-intro">${intro}</p>
    <div class="mic-zone">
      ${micZone(st, mode)}
      ${mode === 'self' ? `<div class="compare"><button class="secondary" data-act="say" data-text="${esc(st.hi)}">${ICON.speaker}<span>Vorbild anhören</span></button></div>` : ''}
    </div>
    <div id="result">${resultHTML}</div>`;
  const selfRate = (mode !== 'recognize' && (mode === 'self' || st.recUrl) && !(r && r.kind === 'self'));
  dock.innerHTML = selfRate
    ? `<p class="dock-hint">Wie klang es?</p><div class="rate"><button class="secondary" data-act="selfrate" data-val="0">Noch unsicher</button><button class="primary" id="primary" data-act="selfrate" data-val="1">Klang ähnlich</button></div><button class="link skip" data-act="next">Überspringen</button>`
    : `<button class="primary" id="primary" data-act="next">${r ? 'Weiter' : 'Überspringen'}</button>`;
}
function renderLadderSpeak(st, stage, dock) {
  const mode = speechMode();
  stage.innerHTML = `<p class="eyebrow">Aussprache</p><h2 class="q">Jetzt sprichst du, Schritt für Schritt.</h2>
    <div class="word">${deva(st.hi, 'sent')}</div>
    <div class="word-meta">${trHTML(st.tr, true)}<span class="de">${esc(fill(st.de))}</span></div>
    <p class="small speak-intro">Höre jede Zeile zuerst an und sprich sie dann nach. Der Satz wächst von hinten, so übst du das Satzende mit dem Verb am häufigsten.${mode === 'self' ? ' ' + (SPEECH.framed ? FRAMED_NOTE : 'Sprich jede Zeile laut nach.') : ''}</p>
    ${ladderHTML(st, st.hi, mode)}`;
  const any = st.lres && Object.keys(st.lres).length;
  dock.innerHTML = `<button class="primary" id="primary" data-act="next">${any || mode !== 'recognize' ? 'Weiter' : 'Überspringen'}</button>`;
}
function startRecognition(st, target = st.hi, slot = null) {
  const put = v => { if (slot == null) st.result = v; else (st.lres = st.lres || {})[slot] = v; };
  st.listening = slot;
  if (recActive) { try { recActive.stop(); } catch (e) {} return; }
  speechSynthesis && speechSynthesis.cancel && speechSynthesis.cancel();
  let r;
  try { r = new Rec(); } catch (e) { SPEECH.blocked = true; renderLesson(); return; }
  r.lang = 'hi-IN'; r.interimResults = true; r.maxAlternatives = 5; r.continuous = false;
  let finals = [], interim = '', error = null;
  const timer = setTimeout(() => { try { r.stop(); } catch (e) {} }, 9000);
  r.onresult = e => {
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const res = e.results[i];
      if (res.isFinal) finals = Array.from(res).map(a => a.transcript.trim());
      else interim = res[0].transcript.trim();
    }
    const ms = document.getElementById('mic-state');
    if (ms && (interim || finals[0])) ms.innerHTML = `<span class="deva inl" lang="hi">${esc(finals[0] || interim)}</span>`;
  };
  r.onerror = e => { error = e.error; };
  r.onend = () => {
    clearTimeout(timer);
    recActive = null; st.listening = undefined;
    const heard = finals.length ? finals : interim ? [interim] : [];
    if (error === 'not-allowed' || error === 'service-not-allowed') {
      put({ kind: 'error', msg: error === 'service-not-allowed' ? 'Die Spracherkennung ist ausgeschaltet. Auf dem iPhone und Mac muss „Diktieren“ bzw. Siri aktiviert sein. Du kannst dich stattdessen aufnehmen.' : 'Kein Zugriff auf das Mikrofon. Erlaube den Zugriff in den Browser-Einstellungen.' });
      SPEECH.blocked = true;
    } else if (error === 'network') {
      put({ kind: 'error', msg: 'Die Spracherkennung braucht eine Internetverbindung. Du kannst dich stattdessen aufnehmen.' });
      SPEECH.blocked = true;
    } else if (!heard.length) {
      put({ kind: 'error', msg: error === 'no-speech' || !error ? 'Ich habe nichts gehört. Sprich etwas lauter und näher am Mikrofon.' : `Die Erkennung wurde unterbrochen (${error}). Versuch es noch einmal.` });
    } else {
      const ev = evaluate(target, heard);
      put({ kind: 'eval', ...ev });
      st.tries = (st.tries || 0) + 1;
      if (ev.score >= 0.99 && !st.counted) { st.counted = true; S.spoken = (S.spoken || 0) + 1; }
    }
    save();
    if (step() === st) renderLesson();
  };
  try { r.start(); recActive = r; } catch (e) { SPEECH.blocked = true; }
  if (step() === st) renderLesson();
}
async function startRecording(st) {
  if (mediaRec) { mediaRec.stop(); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const type = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'].find(t => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t));
    mediaRec = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
    recChunks = [];
    mediaRec.ondataavailable = e => e.data.size && recChunks.push(e.data);
    mediaRec.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      if (recUrl) URL.revokeObjectURL(recUrl);
      recUrl = URL.createObjectURL(new Blob(recChunks, { type: mediaRec.mimeType || 'audio/mp4' }));
      st.recUrl = true; mediaRec = null;
      if (step() === st) renderLesson();
    };
    mediaRec.start();
    setTimeout(() => { if (mediaRec && mediaRec.state === 'recording') mediaRec.stop(); }, 6000);
  } catch (e) {
    SPEECH.recBlocked = true;
    st.result = { kind: 'error', msg: 'Kein Zugriff auf das Mikrofon. Sprich den Satz laut nach und vergleiche selbst.' };
  }
  if (step() === st) renderLesson();
}

/* ───────── Aktionen ───────── */
function checkOrder(st) {
  const ex = st.ex;
  const got = st.pick.map(i => ex.tiles[i].w), want = words(ex.hi);
  const ok = got.join(' ') === want.join(' ');
  st.res = { ok };
  record(ok, ex.items, { noRetry: false });
}
const ACT = {
  start(el) {
    const idx = el && el.dataset.idx != null ? Number(el.dataset.idx) : S.next;
    if (S.session && S.session.idx === idx && S.session.mode === 'lesson') return route('lektion');
    S.session = buildLesson(Math.min(idx, LESSONS.length - 1)); save(); route('lektion');
  },
  repeat(el) { S.session = buildLesson(Number(el.dataset.idx), true); save(); route('lektion'); },
  review() { S.session = buildReview(); save(); route('lektion'); },
  resume() { route('lektion'); },
  pause() { if (recActive) try { recActive.abort(); } catch (e) {} save(); route('home'); },
  home() { route('home'); }, path() { route('lernpfad'); }, settings() { route('einstellungen'); }, words() { current.filter = current.filter || 'all'; route('woerter'); },
  prev() { const se = S.session; if (recActive) try { recActive.abort(); } catch (e) {} if (se && se.i > 0) { se.i--; save(); renderLesson(); window.scrollTo(0, 0); } },
  detail(el) { current.detail = Number(el.dataset.idx); route('details'); },
  practice(el) { S.session = buildPractice(el.dataset.kind, el.dataset.kind === 'words' && current.filter === 'weak' ? weakItems() : null); save(); route('lektion'); },
  filter(el) { current.filter = el.dataset.val; renderWords(); },
  next() { if (recActive) try { recActive.abort(); } catch (e) {} next(); },
  finish() { finish(); },
  'intro-done'() { S.introSeen = true; next(); },
  say(el) { TTS.speak(el.dataset.text); },
  'say-slow'(el) { TTS.speak(el.dataset.text, { slow: true }); },
  'play-dialog'() {
    const lines = lessonOf().dialog.map(d => d.hi); let i = 0;
    const go = () => { if (i < lines.length && current.view === 'lektion') TTS.speak(lines[i++], { onend: () => setTimeout(go, 350) }); };
    go();
  },
  'reveal-tr'(el) { el.classList.add('is-open'); el.setAttribute('aria-label', 'Umschrift'); },
  pick(el) {
    const st = step(); if (st.res) return;
    const ok = el.dataset.val === st.ex.item;
    st.res = { ok, val: el.dataset.val };
    record(ok, st.ex.items);
    renderLesson();
  },
  reveal() { step().revealed = true; save(); renderLesson(); TTS.speak(getItem(step().ex.item).hi); },
  rate(el) {
    const st = step(), v = Number(el.dataset.val);
    st.res = { ok: v === 2 };
    if (v === 1) { const r = introduce(st.ex.item); r.last = today(); r.due = addDays(today(), 1); r.box = Math.max(1, r.box); r.ok++; save(); next(); return; }
    record(v === 2, st.ex.items);
    if (v === 2) next(); else renderLesson();
  },
  m(el) {
    const st = step(), m = st.m, side = el.dataset.side, id = el.dataset.val;
    if (!m.sel || m.sel[0] === side) { m.sel = side + id; st.mmsg = ''; renderLesson(); return; }
    const other = m.sel.slice(1);
    if (other === id) {
      m.done.push(id); m.sel = null; st.mmsg = '';
      if (!m.wrongIds || !m.wrongIds.includes(id)) grade(id, true);
      if (m.done.length === st.ex.items.length) {
        S.session.right += m.miss ? 0 : 1; if (m.miss) S.session.wrong++;
        queueRetry(m.wrongIds || []);
      }
      save(); renderLesson();
    } else {
      m.miss++; m.sel = null;
      const hiId = side === 'L' ? id : other, deId = side === 'L' ? other : id;
      m.wrongIds = [...new Set([...(m.wrongIds || []), hiId])];
      grade(hiId, false);
      st.mmsg = `${deva(ITEMS[hiId].hi, 'inl')} heißt „${esc(ITEMS[hiId].de)}“, nicht „${esc(ITEMS[deId].de)}“.`;
      save(); renderLesson();
      const card = document.querySelector(`[data-val="${hiId}"][data-side="L"]`);
      if (card && !reduceMotion()) card.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }], { duration: 260 });
    }
  },
  cloze(el) {
    const st = step(); if (st.res) return;
    const ok = el.dataset.val === st.ex.answer;
    st.res = { ok, val: el.dataset.val };
    record(ok, st.ex.items);
    renderLesson();
    if (ok) TTS.speak(fill(st.ex.hi).replace('___', st.ex.answer));
  },
  opick(el) { const st = step(); if (st.res) return; st.pick.push(Number(el.dataset.val)); save(); renderLesson(); },
  unpick(el) { const st = step(); if (st.res) return; st.pick.splice(Number(el.dataset.pos), 1); save(); renderLesson(); },
  'check-order'() { const st = step(); checkOrder(st); renderLesson(); if (st.res.ok) TTS.speak(st.ex.hi); },
  nat(el) {
    const st = step(); if (st.res) return;
    const i = Number(el.dataset.val), ok = !!st.ex.options[i].ok;
    st.res = { ok, val: i };
    record(ok, st.ex.items);
    renderLesson();
  },
  spick(el) {
    const st = step(); if (st.res) return;
    const ok = el.dataset.val === st.ex.answer;
    st.res = { ok, val: el.dataset.val };
    record(ok, [], { noRetry: true });
    renderLesson();
  },
  mic() { startRecognition(step()); },
  'rp-open'(el) { const r = ROLEPLAYS.find(x => x.id === el.dataset.id); current.rp = { id: r.id, turn: 0, log: [], wrong: null, misses: 0 }; rpAdvance(current.rp, r); route('rollenspiel'); },
  'rp-de'() { current.rp.showDe = !current.rp.showDe; renderRoleplay(); },
  'rp-pick'(el) {
    const g = current.rp, r = ROLEPLAYS.find(x => x.id === g.id), t = r.turns[g.turn], c = t.choices[Number(el.dataset.val)];
    if (!c.ok) { g.wrong = Number(el.dataset.val); g.misses++; renderRoleplay(); return; }
    g.wrong = null;
    g.log.push({ hi: c.hi, tr: trGuess(c.hi), de: '', me: true });
    TTS.speak(c.hi);
    g.turn++; g.waiting = true;
    setTimeout(() => { g.waiting = false; rpAdvance(g, r); if (current.view === 'rollenspiel') renderRoleplay(); }, 900);
    renderRoleplay();
  },
  'mem-open'() { startMemory(); },
  'pc-open'() { route('postkarten'); },
  'mem-flip'(el) {
    const m = current.mem, i = Number(el.dataset.i), c = m.cards[i];
    if (m.lock || m.open.includes(i)) return;
    m.open.push(i);
    if (c.side === 'hi') TTS.speak(ITEMS[c.id].hi);
    if (m.open.length === 2) {
      m.moves++;
      const [a, b] = m.open.map(k => m.cards[k]);
      if (a.id === b.id) { m.found.push(a.id); m.open = []; if (c.side !== 'hi') TTS.speak(ITEMS[c.id].hi); grade(a.id, true); save(); }
      else { m.lock = true; setTimeout(() => { m.open = []; m.lock = false; if (current.view === 'memory') renderMemory(); }, 1100); }
    }
    renderMemory();
  },
  async 'sync-connect'() {
    const url = document.getElementById('f-surl').value.trim(), token = document.getElementById('f-stok').value.trim();
    const msg = document.getElementById('sync-msg');
    if (!/^https:\/\/script\.google(usercontent)?\.com\//.test(url)) { msg.textContent = 'Die Adresse sollte mit https://script.google.com/macros/ beginnen und auf /exec enden.'; return; }
    if (!token) { msg.textContent = 'Bitte trage den Schlüssel aus dem Apps-Script-Protokoll ein.'; return; }
    Sync.cfg = { url, token }; msg.textContent = 'Verbinde …';
    const ok = await Sync.sync('connect');
    if (ok) { Sync.store(); toast('Verbunden. Der Lernstand ist abgeglichen.'); renderSettings(); }
    else { const e = Sync.lastError; Sync.cfg = null; Sync.lastError = e; renderSyncStatus(); }
  },
  async 'sync-paste'() {
    const c = Sync.fromCode(document.getElementById('f-scode').value);
    const msg = document.getElementById('sync-msg');
    if (!c) { msg.textContent = 'Der Code ist unvollständig. Kopiere ihn auf dem anderen Gerät noch einmal.'; return; }
    Sync.cfg = c; msg.textContent = 'Verbinde …';
    const ok = await Sync.sync('connect');
    if (ok) { Sync.store(); toast('Verbunden. Der Lernstand ist abgeglichen.'); renderSettings(); }
    else { const e = Sync.lastError; Sync.cfg = null; Sync.lastError = e; renderSyncStatus(); }
  },
  async 'sync-now'() { renderSyncStatus(); const ok = await Sync.sync('manual'); toast(ok ? 'Abgeglichen.' : 'Abgleich gerade nicht möglich.'); },
  'sync-code'() {
    const box = document.getElementById('sync-code'), ta = document.getElementById('f-code');
    box.hidden = false; ta.value = Sync.code(); ta.focus(); ta.select();
    try { navigator.clipboard.writeText(ta.value).then(() => toast('Code kopiert.'), () => {}); } catch (e) {}
  },
  async 'copy-script'() {
    try {
      const t = await (await fetch('google-apps-script/Code.gs')).text();
      await navigator.clipboard.writeText(t);
      toast('Skript kopiert. Jetzt in Apps Script einfügen.');
    } catch (e) { window.open('google-apps-script/Code.gs', '_blank'); }
  },
  'sync-off'() { Sync.cfg = null; Sync.lastError = ''; Sync.store(); renderSettings(); toast('Getrennt. Der Lernstand bleibt auf diesem Gerät.'); },
  heft() { route('heft'); },
  'reveal-de'(el) { el.classList.add('on'); },
  'heft-de'() { current.heftDe = !current.heftDe; renderNotebook(); },
  dunno() {
    const st = step(); if (!st || st.res) return;
    st.res = { ok: false, dunno: true, val: null };
    record(false, st.ex.items || [], { noRetry: ['sfind', 'sread'].includes(st.ex.t) });
    renderLesson();
  },
  lmic(el) {
    const st = step(), k = Number(el.dataset.slot);
    if (recActive) { try { recActive.stop(); } catch (e) {} return; }
    const hi = st.k === 'learn' ? ITEMS[st.item].hi : st.hi;
    startRecognition(st, ladderSteps(hi)[k], k);
  },
  record() { startRecording(step()); },
  'play-me'() { if (recUrl) new Audio(recUrl).play().catch(() => {}); },
  selfrate(el) { const st = step(); st.result = { kind: 'self', ok: el.dataset.val === '1' }; save(); renderLesson(); },
  set(el) { S.settings[el.dataset.key] = el.dataset.val; save(); renderSettings(); },
  export() {
    const data = JSON.stringify({ app: 'hindi5', exported: new Date().toISOString(), state: { ...S, session: null } });
    const box = document.getElementById('io'), ta = document.getElementById('f-io');
    box.hidden = false; ta.value = data; document.getElementById('io-apply').hidden = true;
    const msg = document.getElementById('io-msg');
    const done = () => { msg.textContent = 'Kopiert. Füge den Text auf dem anderen Gerät unter „Lernstand einfügen“ ein.'; };
    const fallback = () => { ta.focus(); ta.select(); msg.textContent = 'Der Text ist markiert. Kopiere ihn jetzt.'; };
    try { navigator.clipboard.writeText(data).then(done, fallback); } catch (e) { fallback(); }
  },
  'import-open'() {
    const box = document.getElementById('io'); box.hidden = false;
    document.getElementById('io-apply').hidden = false;
    const ta = document.getElementById('f-io'); ta.value = ''; ta.placeholder = 'Kopierten Lernstand hier einfügen'; ta.focus();
    document.getElementById('io-msg').textContent = '';
  },
  import() {
    const msg = document.getElementById('io-msg');
    try {
      const d = JSON.parse(document.getElementById('f-io').value);
      if (d.app !== 'hindi5' || !d.state || typeof d.state.items !== 'object') throw new Error();
      S = Object.assign(defaults(), d.state, { session: null }); save();
      msg.textContent = 'Lernstand übernommen.'; setTimeout(() => route('home'), 700);
    } catch (e) { msg.textContent = 'Das sieht nicht nach einem kopierten Lernstand aus. Kopiere ihn auf dem anderen Gerät erneut.'; }
  },
  'reset-ask'() {
    document.getElementById('reset-zone').innerHTML = `<p class="help">Alle gelernten Wörter und Lektionen werden auf diesem Gerät gelöscht.</p>
      <div class="row"><button class="secondary danger" data-act="reset">Ja, zurücksetzen</button><button class="ghost" data-act="settings">Abbrechen</button></div>`;
  },
  reset() { const name = S.name; S = defaults(); S.name = name; save(); route('home'); }
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const f = ACT[el.dataset.act];
  if (f) { e.preventDefault(); f(el); }
});
document.addEventListener('keydown', e => {
  if (e.target.matches('input, textarea, select') || e.metaKey || e.ctrlKey || e.altKey) return;
  if (current.view !== 'lektion') return;
  if (e.key === 'Enter') {
    const p = document.querySelector('#primary:not([disabled])');
    if (p && document.activeElement !== p) { e.preventDefault(); p.click(); }
  } else if (/^[1-6]$/.test(e.key)) {
    const b = document.querySelector(`#stage [data-key="${e.key}"]:not([disabled])`);
    if (b) { e.preventDefault(); b.click(); }
  } else if (e.key === ' ' && !e.target.matches('button')) {
    const s = document.querySelector('#stage .speak-btn');
    if (s) { e.preventDefault(); s.click(); }
  } else if (e.key === 'Escape') ACT.pause();
});
addEventListener('hashchange', () => {
  const h = location.hash.slice(1);
  const v = VIEWS[h] ? h : 'home';
  if (v !== current.view) { if (v === 'lektion' && !S.session) route('home'); else route(v); }
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') { save({ quiet: true }); if (Sync.on()) Sync.sync('hidden'); }
  else if (Sync.on() && Date.now() - Sync.lastOk > 60000) Sync.sync('visible');
});
addEventListener('pagehide', save);

/* ───────── Hinweis ───────── */
let toastTimer;
function toast(msg, ms = 3200) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('on');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), ms);
}

/* ───────── Start ───────── */
if (S.session && S.session.date !== today() && S.session.mode === 'review') S.session = null;
TTS.init();
if (Sync.on()) setTimeout(() => Sync.sync('start'), 300);
const startHash = location.hash.slice(1);
route(startHash === 'lektion' ? (S.session ? 'lektion' : 'home') : ['lernpfad', 'einstellungen', 'woerter', 'heft'].includes(startHash) ? startHash : 'home');
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
window.Hindi5 = { get state() { return S; }, Sync, mergeState, mem: () => current.mem, evaluate, devaSkel, dueItems, grade, save, buildLesson, LESSONS, ITEMS };
})();

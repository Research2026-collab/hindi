"""Funktionstest im echten Browser (Chromium, per Playwright).
Aufruf:  python3 tools/e2e.py [ausgabeordner-fuer-screenshots]
Spielt Lektionen durch, prüft Speicherung, Wiederaufnahme, Wiederholungslogik, Spracherkennung (simuliert) und Darstellung."""
import asyncio, sys, os, json, threading, http.server, functools, datetime
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'tools', 'shots')
os.makedirs(OUT, exist_ok=True)
PORT = 8765
URL = f'http://127.0.0.1:{PORT}/index.html'

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = http.server.ThreadingHTTPServer(('127.0.0.1', PORT), functools.partial(Quiet, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()

FAKE = """
window.__say = null;           // null: Zielsatz sprechen; sonst dieser Text
window.__spoken = [];
class FakeRec { start(){ setTimeout(()=>{ const st = window.Hindi5.state.session.steps[window.Hindi5.state.session.i];
  const t = window.__say ?? st.hi.replace('{name}', window.Hindi5.state.name);
  const alt = [{transcript: t}]; alt.isFinal = true;
  this.onresult && this.onresult({resultIndex:0, results:[alt]}); this.onend && this.onend(); }, 120); }
  stop(){} abort(){} }
window.webkitSpeechRecognition = FakeRec; window.SpeechRecognition = FakeRec;
const _speak = speechSynthesis.speak.bind(speechSynthesis);
speechSynthesis.speak = u => { window.__spoken.push(u.text); };
"""

SOLVE = """async (wrongRate) => {
  const H = window.Hindi5, se = H.state.session; if (!se) return 'nosession';
  const st = se.steps[se.i];
  const click = sel => { const el = document.querySelector(sel); if (!el) throw new Error('fehlt: ' + sel + ' bei ' + st.k + (st.ex ? ':' + st.ex.t : '')); el.click(); };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const wrong = Math.random() < wrongRate;
  const ex = st.ex;
  if (st.k !== 'ex' && st.k !== 'speak') { click('#primary'); return st.k; }
  if (st.k === 'speak' && document.querySelector('[data-act=lmic]')) { const ls=[...document.querySelectorAll('[data-act=lmic]')]; ls[ls.length-1].click(); await wait(300); click('#primary'); return 'speak-ladder'; }
  if (st.k === 'speak') { click('[data-act=mic], [data-act=selfrate][data-val="1"]'); await wait(300);
    if (document.querySelector('[data-act=selfrate]')) click('[data-act=selfrate][data-val="1"]');
    click('#primary'); return 'speak'; }
  const t = ex.t;
  const pickWrong = sel => { const els=[...document.querySelectorAll(sel)].filter(e=>!e.disabled); return els[0]; };
  if (t === 'choose') { const b = wrong ? [...document.querySelectorAll('[data-act=pick]')].find(b => b.dataset.val !== ex.item) : document.querySelector(`[data-act=pick][data-val="${ex.item}"]`); b.click(); }
  else if (t === 'recall') { click('[data-act=reveal]'); click(`[data-act=rate][data-val="${wrong ? 0 : 2}"]`); if (H.state.session.steps[H.state.session.i] !== st) return 'recall'; }
  else if (t === 'match') { if (wrong) { document.querySelector(`[data-side=L][data-val="${ex.items[0]}"]`).click(); document.querySelector(`[data-side=R][data-val="${ex.items[1]}"]`).click(); }
    for (const id of ex.items) { document.querySelector(`[data-side=L][data-val="${id}"]`).click(); document.querySelector(`[data-side=R][data-val="${id}"]`).click(); } }
  else if (t === 'cloze') { const v = wrong ? ex.options.find(o => o !== ex.answer) : ex.answer; document.querySelector(`[data-act=cloze][data-val="${v}"]`).click(); }
  else if (t === 'order') { const want = ex.hi.replace('{name}', H.state.name).replace(/[।॥?!,.“”„"'…:;()]/g,' ').split(/\\s+/).filter(Boolean);
    const seq = wrong ? want.slice().reverse() : want; const used = new Set();
    for (const w of seq) { const i = ex.tiles.findIndex((x, k) => x.w === w && !used.has(k)); used.add(i); document.querySelector(`[data-act=opick][data-val="${i}"]`).click(); }
    click('[data-act=check-order]'); }
  else if (t === 'natural') { const i = ex.options.findIndex(o => wrong ? !o.ok : o.ok); document.querySelector(`[data-act=nat][data-val="${i}"]`).click(); }
  else if (t === 'sfind' || t === 'sread') { const v = wrong ? ex.options.find(o => o !== ex.answer) : ex.answer; document.querySelector(`[data-act=spick][data-val="${v}"]`).click(); }
  click('#primary');
  return t + (wrong ? ' (falsch)' : '');
}"""

results = []
def check(cond, msg):
    results.append(('OK  ' if cond else 'FEHLER ') + msg)
    print(('OK  ' if cond else 'FEHLER ') + msg, flush=True)

async def play_lesson(page, wrong=0.0, shots=None, prefix=''):
    seen = []
    for n in range(80):
        se = await page.evaluate('window.Hindi5.state.session && {i: Hindi5.state.session.i, n: Hindi5.state.session.steps.length, k: Hindi5.state.session.steps[Hindi5.state.session.i].k, t: (Hindi5.state.session.steps[Hindi5.state.session.i].ex||{}).t}')
        if not se: return seen
        key = se['k'] + (':' + se['t'] if se['t'] else '')
        if shots is not None and key not in shots:
            shots.add(key); await page.wait_for_timeout(450)
            await page.screenshot(path=os.path.join(OUT, f'{prefix}{len(shots):02d}-{key.replace(":", "-")}.png'), full_page=True)
        r = await page.evaluate(SOLVE, wrong)
        seen.append(r)
        await page.wait_for_timeout(30)
    raise RuntimeError('Lektion endet nicht')

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        errors = []
        ctx = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True, locale='de-DE')
        await ctx.add_init_script(FAKE)
        page = await ctx.new_page()
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: m.type == 'error' and errors.append(m.text))
        await page.clock.install(time=datetime.datetime(2026, 10, 28, 7, 30))
        await page.goto(URL); await page.wait_for_timeout(600)
        await page.screenshot(path=os.path.join(OUT, '00-home-neu.png'))
        txt = await page.inner_text('body')
        check('नमस्ते' in txt and 'Elisabeth' in txt and 'Tag 1' in txt and 'Heutige Lektion starten' in txt, 'Startseite zeigt Begrüßung, Tag 1 und Startknopf')

        # Fonts geladen
        fonts = await page.evaluate("document.fonts.ready.then(()=>[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family+' '+f.weight))")
        check(any('Tiro' in f for f in fonts), f'Devanagari-Schrift geladen ({", ".join(sorted(set(fonts)))})')

        # Lektion 1 vollständig, mit Screenshots
        await page.click('[data-act=start]'); await page.wait_for_timeout(300)
        await page.click('#primary'); await page.wait_for_timeout(300)
        await page.click('#primary'); await page.wait_for_timeout(300)
        await page.click('[data-act=mic]'); await page.wait_for_timeout(500)
        res = await page.inner_text('#stage')
        check('Sehr gut' in res, 'Nachsprechen direkt auf der Wortkarte mit Rückmeldung')
        await page.click('#primary'); await page.wait_for_timeout(200)
        i1 = await page.evaluate('Hindi5.state.session.i')
        await page.click('[data-act=prev]'); await page.wait_for_timeout(200)
        check(await page.evaluate('Hindi5.state.session.i') == i1 - 1, 'Zurück-Knopf führt zum vorigen Schritt')
        await page.evaluate("() => { const se=Hindi5.state.session; se.i = se.steps.findIndex(s=>s.k==='learn' && s.item==='aapkaise'); Hindi5.save(); }")
        await page.goto(URL); await page.wait_for_timeout(300); await page.click('[data-act=resume]'); await page.wait_for_timeout(300)
        check(await page.locator('.wbw-i').count() == 3 and await page.locator('.ladder li').count() == 3, 'Wendung wird Wort für Wort zerlegt und von hinten aufgebaut')
        await page.evaluate("window.__say = 'हैं'")
        await page.click('[data-act=lmic][data-slot="0"]'); await page.wait_for_timeout(500)
        check('Sehr gut' in await page.inner_text('.ladder'), 'Erste Stufe (nur हैं) wird einzeln bewertet')
        await page.evaluate("window.__say = 'आप कैसे'")
        await page.click('[data-act=lmic][data-slot="2"]'); await page.wait_for_timeout(500)
        await page.screenshot(path=os.path.join(OUT, 'l01-00b-aufbau.png'), full_page=True)
        check('Noch nicht klar' in await page.inner_text('.ladder'), 'Unvollständiger Satz wird auf der passenden Stufe bemängelt')
        await page.evaluate("window.__say = null")
        await page.evaluate("() => { const se=Hindi5.state.session; se.i = se.steps.findIndex(s=>s.k==='learn'); Hindi5.save(); }")
        await page.goto(URL); await page.wait_for_timeout(300); await page.click('[data-act=resume]'); await page.wait_for_timeout(300)
        await page.evaluate("window.__say = 'नमस'")
        await page.click('[data-act=mic]'); await page.wait_for_timeout(500)
        await page.screenshot(path=os.path.join(OUT, 'l01-00-wort-sprechen.png'), full_page=True)
        res = await page.inner_text('#stage')
        check('nicht' in res or 'Fast' in res, 'Ungenaues Nachsprechen wird erkannt')
        await page.evaluate("window.__say = null")
        await page.evaluate("() => { const se=Hindi5.state.session; se.i = 0; Hindi5.save(); }")
        await page.goto(URL); await page.wait_for_timeout(300); await page.click('[data-act=start]'); await page.wait_for_timeout(300)
        shots = set()
        seen = await play_lesson(page, 0.0, shots, 'l01-')
        st = await page.evaluate('Hindi5.state')
        check(st['next'] == 1 and 'l01' in st['done'], 'Lektion 1 abgeschlossen und gespeichert')
        check(all(st['items'][i]['ok'] > 0 for i in ['namaste', 'aapkaise', 'theekhoon']), 'Alle Wörter aus Lektion 1 als gewusst erfasst')
        check('s:l01' in st['items'], 'Satz des Tages in die Wiederholung aufgenommen')
        spoken = await page.evaluate('window.__spoken')
        check(len(spoken) > 0 and all(isinstance(s, str) for s in spoken), f'Audio wurde angestoßen ({len(spoken)} Ausgaben, z. B. {spoken[:2]})')
        await page.screenshot(path=os.path.join(OUT, '01-home-fertig.png'))
        txt = await page.inner_text('body')
        check('Für heute geschafft' in txt, 'Startseite meldet „Für heute geschafft“')

        # Neu laden: Fortschritt bleibt
        await page.reload(); await page.wait_for_timeout(400)
        st2 = await page.evaluate('Hindi5.state')
        check(st2['next'] == 1 and st2['done'].get('l01') == '2026-10-28', 'Fortschritt übersteht das Neuladen')

        # Nächster Tag: Lektion 2, Wiederaufnahme mitten in der Lektion
        await page.clock.set_fixed_time(datetime.datetime(2026, 10, 29, 7, 30))
        await page.reload(); await page.wait_for_timeout(400)
        txt = await page.inner_text('body')
        check('Tag 2' in txt and 'Heutige Lektion starten' in txt, 'Am nächsten Tag: Tag 2 und neue Lektion')
        due = await page.evaluate('Hindi5.dueItems()')
        check(len(due) >= 4, f'Wörter von gestern sind fällig ({len(due)})')
        await page.click('[data-act=start]'); await page.wait_for_timeout(200)
        first = await page.evaluate('Hindi5.state.session.steps.slice(0,4).map(s=>s.k+":"+(s.phase||""))')
        check(first[0] == 'goal:' and first[1] == 'ex:review', f'Lektion beginnt mit Wiederholung ({first})')
        for _ in range(4): await page.evaluate(SOLVE, 0.0); await page.wait_for_timeout(30)
        pos = await page.evaluate('Hindi5.state.session.i')
        await page.close()
        page = await ctx.new_page(); page.on('pageerror', lambda e: errors.append(str(e)))
        await page.clock.install(time=datetime.datetime(2026, 10, 29, 7, 40))
        await page.goto(URL); await page.wait_for_timeout(400)
        txt = await page.inner_text('body')
        check('Weitermachen' in txt, 'Nach dem Schließen bietet die Startseite „Weitermachen“ an')
        await page.click('[data-act=resume]'); await page.wait_for_timeout(200)
        pos2 = await page.evaluate('Hindi5.state.session.i')
        check(pos2 == pos, f'Wiederaufnahme genau beim Schritt {pos + 1}')

        # Fehler in Lektion 2: Wiederholung im selben Durchgang und am Folgetag
        await page.evaluate("""() => { const se = Hindi5.state.session; const k = se.steps.findIndex((s,i)=> i>=se.i && s.k==='ex' && s.ex.t==='cloze'); se.i = k; Hindi5.save(); }""")
        await page.goto(URL); await page.wait_for_timeout(300)
        await page.click('[data-act=resume]'); await page.wait_for_timeout(200)
        n_before = await page.evaluate('Hindi5.state.session.steps.length')
        await page.evaluate(SOLVE, 1.0)
        await page.wait_for_timeout(100)
        n_after = await page.evaluate('Hindi5.state.session.steps.length')
        fb = await page.inner_text('#dock') if False else ''
        check(n_after == n_before + 1, 'Falsche Antwort fügt eine Wiederholung in dieselbe Lektion ein')
        hoon = await page.evaluate("Hindi5.state.items.main")
        check(hoon['bad'] == 1 and hoon['box'] == 0, 'Fehler wird beim Wort vermerkt (Kasten 0)')
        await play_lesson(page, 0.0)
        hoon = await page.evaluate("Hindi5.state.items.main")
        check(hoon['due'] == '2026-10-30', f'Schwieriges Wort ist morgen fällig ({hoon["due"]})')

        # Erklärung bei falscher Antwort sichtbar
        await page.clock.set_fixed_time(datetime.datetime(2026, 10, 30, 7, 30))
        await page.reload(); await page.wait_for_timeout(300)
        due = await page.evaluate('Hindi5.dueItems()')
        check(due[0] == 'main', f'Schwieriges Wort steht in der Wiederholung vorn ({due[:4]})')
        await page.click('[data-act=start]'); await page.wait_for_timeout(200)
        warm = await page.evaluate('Hindi5.state.session.steps.filter(s=>s.phase==="review").map(s=>s.ex.item || (s.ex.items||[])[0])')
        check('main' in warm, f'Einstieg von Lektion 3 wiederholt das schwierige Wort ({warm})')
        # eine falsche Antwort provozieren und Erklärung prüfen
        await page.evaluate(SOLVE, 1.0)
        # SOLVE klickt danach Weiter; daher Feedback vorab prüfen:
        await page.evaluate("() => { const se=Hindi5.state.session; se.i=se.steps.findIndex(s=>s.k==='ex'&&s.ex.t==='natural'); Hindi5.save(); }")
        await page.goto(URL); await page.wait_for_timeout(300); await page.click('[data-act=resume]'); await page.wait_for_timeout(200)
        ex = await page.evaluate('Hindi5.state.session.steps[Hindi5.state.session.i].ex')
        bad = next(i for i, o in enumerate(ex['options']) if not o.get('ok'))
        await page.click(f'[data-act=nat][data-val="{bad}"]'); await page.wait_for_timeout(300)
        dock = await page.inner_text('#dock')
        check('Nicht ganz' in dock and ex['options'][bad]['why'][:20] in dock, 'Falsche Antwort zeigt eine kurze Begründung')
        await page.screenshot(path=os.path.join(OUT, '02-erklaerung.png'))
        await page.click('#primary'); await page.wait_for_timeout(200)
        await page.evaluate("() => { const se=Hindi5.state.session; se.i=se.steps.findIndex((s,i)=>i>=se.i && s.k==='ex' && !s.res && ['choose','cloze','natural','order'].includes(s.ex.t)); Hindi5.save(); }")
        await page.goto(URL); await page.wait_for_timeout(300); await page.click('[data-act=resume]'); await page.wait_for_timeout(200)
        await page.click('[data-act=dunno]'); await page.wait_for_timeout(200)
        dock = await page.inner_text('#dock')
        check('Die Lösung' in dock, '„Weiß ich nicht“ zeigt die Lösung ohne Raten')
        await page.screenshot(path=os.path.join(OUT, '02b-loesung.png'))
        await page.click('#primary')
        await play_lesson(page, 0.0)

        # Spracherkennung: Bewertung
        cases = await page.evaluate("""() => [
          Hindi5.evaluate('मैं ठीक हूँ।', ['मैं ठीक हूं']).score,
          Hindi5.evaluate('मैं ठीक हूँ।', ['में ठीक']).score,
          Hindi5.evaluate('एक कॉफ़ी, प्लीज़।', ['1 coffee please']).score,
          Hindi5.evaluate('मेरा नाम {name} है।', ['मेरा नाम एलिज़ाबेथ है']).score,
          Hindi5.evaluate('बहुत शुक्रिया!', ['बहुत सुक्रिया']).score,
          Hindi5.evaluate('धन्यवाद', ['नमस्ते']).score,
          Hindi5.evaluate('दस नहीं, पाँच।', ['10 नहीं 5']).score
        ]""")
        check(cases[0] == 1 and 0.4 < cases[1] < 1 and cases[2] == 1 and cases[3] == 1 and cases[4] == 1 and cases[5] == 0 and cases[6] == 1, f'Aussprachebewertung plausibel {cases}')

        # Sprechübung mit teilweise falscher Erkennung
        await page.evaluate("() => { Hindi5.state.session = Hindi5.buildLesson(3, true); const se=Hindi5.state.session; se.i = se.steps.findIndex(s=>s.k==='speak'); Hindi5.save(); }")
        await page.goto(URL); await page.wait_for_timeout(300); await page.click('[data-act=resume]'); await page.wait_for_timeout(200)
        await page.evaluate("window.__say = 'बहुत सुकिया'")
        await page.click('[data-act=mic]'); await page.wait_for_timeout(500)
        res = await page.inner_text('#result')
        check('Fast' in res or 'nicht' in res, f'Sprechübung zeigt Rückmeldung: {res[:80]!r}')
        await page.screenshot(path=os.path.join(OUT, '03-sprechen-fast.png'), full_page=True)
        await page.evaluate("window.__say = null")
        await page.click('[data-act=mic]'); await page.wait_for_timeout(500)
        res = await page.inner_text('#result')
        check('Sehr gut' in res, 'Richtig gesprochener Satz wird erkannt')
        await page.screenshot(path=os.path.join(OUT, '04-sprechen-gut.png'), full_page=True)
        await page.click('[data-act=pause]')

        # Restliche Lektionen an aufeinanderfolgenden Tagen, mit 20 % Fehlern
        await page.evaluate("Hindi5.state.session = null; Hindi5.save()")
        day = datetime.datetime(2026, 10, 31, 7, 30)
        later_shots = set(['ex:choose', 'ex:match', 'ex:order', 'ex:cloze', 'ex:natural', 'learn', 'dialog', 'script', 'ex:sfind', 'ex:sread', 'speak', 'close', 'ex:recall', 'intro'])
        while True:
            await page.clock.set_fixed_time(day)
            await page.reload(); await page.wait_for_timeout(150)
            st = await page.evaluate('Hindi5.state')
            if st['next'] >= 30: break
            await page.click('[data-act=start]')
            snap = set() if st['next'] in (14, 24) else None
            await play_lesson(page, 0.2, snap, f'l{st["next"] + 1:02d}-')
            day += datetime.timedelta(days=1)
        st = await page.evaluate('Hindi5.state')
        check(len(st['done']) == 30, 'Alle 30 Lektionen durchlaufen')
        boxes = [r['box'] for k, r in st['items'].items()]
        check(max(boxes) >= 3, f'Wiederholungsintervalle wachsen (höchster Kasten {max(boxes)})')
        missing = await page.evaluate("Object.keys(Hindi5.ITEMS).filter(k=>!Hindi5.state.items[k])")
        check(not missing, f'Alle Einträge im Wortspeicher (fehlend: {missing})')
        await page.screenshot(path=os.path.join(OUT, '05-home-ende.png'))
        await page.click('[data-act=review]'); await page.wait_for_timeout(200)
        await play_lesson(page, 0.1)
        check(await page.evaluate('Hindi5.state.session === null'), 'Wiederholungsrunde nach Abschluss des Lernpfads funktioniert')

        # Wörterliste und Lektionsdetails
        await page.click('[data-act=words]'); await page.wait_for_timeout(200)
        check(await page.locator('.vrow').count() >= 116, 'Wörterliste zeigt alle gelernten Wörter')
        await page.screenshot(path=os.path.join(OUT, '08-woerter.png'))
        await page.click('[data-act=filter][data-val=weak]'); await page.wait_for_timeout(100)
        await page.click('[data-act=practice][data-kind=words]'); await page.wait_for_timeout(200)
        await play_lesson(page, 0.0)
        check(await page.evaluate('location.hash') == '#woerter', 'Übungsrunde aus der Wörterliste kehrt dorthin zurück')
        await page.click('[data-act=home]'); await page.click('[data-act=path]'); await page.wait_for_timeout(200)
        await page.click('[data-act=practice][data-kind=speak]'); await page.wait_for_timeout(200)
        await play_lesson(page, 0.0)
        await page.click('[data-act=practice][data-kind=script]'); await page.wait_for_timeout(200)
        await play_lesson(page, 0.0)
        check(await page.evaluate('location.hash') == '#lernpfad', 'Sprech- und Schriftübung laufen durch')
        await page.click('[data-act=detail][data-idx="4"]'); await page.wait_for_timeout(200)
        await page.screenshot(path=os.path.join(OUT, '09-details.png'), full_page=True)
        check('Satz des Tages' in await page.inner_text('body'), 'Lektionsdetails zeigen Wörter, Satz und Ablauf')
        await page.click('[data-act=path]'); await page.click('[data-act=home]')

        # Spielerisches
        await page.click('[data-act=path]'); await page.wait_for_timeout(200)
        for rp in ['zug', 'chai', 'markt', 'rikscha', 'anjali']:
            await page.click(f'[data-act=rp-open][data-id={rp}]'); await page.wait_for_timeout(300)
            first = True
            for _ in range(12):
                if await page.locator('[data-act=rp-pick]').count() == 0: break
                g = await page.evaluate("(() => { const H = window.Hindi5; return null; })()")
                n = await page.locator('[data-act=rp-pick]').count()
                # erst eine falsche, dann die richtige Antwort wählen
                ok_i = await page.evaluate("(() => { const g = window.__rp(); return g; })()") if False else None
                clicked = False
                for i in range(n):
                    await page.click(f'[data-act=rp-pick][data-val="{i}"]'); await page.wait_for_timeout(150)
                    if await page.locator('.fb-info').count() == 0: clicked = True; break
                    if first:
                        first = False
                        await page.screenshot(path=os.path.join(OUT, f'12-rollenspiel-{rp}-umweg.png'), full_page=True)
                await page.wait_for_timeout(1100)
            txt = await page.inner_text('body')
            check('Szene geschafft' in txt, f'Rollenspiel {rp} lässt sich durchspielen')
            if rp == 'chai': await page.screenshot(path=os.path.join(OUT, '12-rollenspiel-ende.png'), full_page=True)
            await page.click('#primary'); await page.wait_for_timeout(200)
        await page.click('[data-act=mem-open]'); await page.wait_for_timeout(200)
        cards = await page.evaluate("(() => { const o = {}; document.querySelectorAll('[data-act=mem-flip]').forEach(b => { o[b.dataset.i] = 1; }); return Object.keys(o).length; })()")
        check(cards == 12, 'Memory mit sechs Paaren')
        await page.click('[data-act=mem-flip][data-i="0"]'); await page.wait_for_timeout(150)
        await page.screenshot(path=os.path.join(OUT, '13-memory.png'), full_page=True)
        await page.evaluate("(() => { const m = document.querySelectorAll('[data-act=mem-flip]'); })()")
        pairs = await page.evaluate("Hindi5.mem().cards.map(c=>c.id)")
        await page.goto(URL); await page.wait_for_timeout(200)
        await page.click('[data-act=path]'); await page.click('[data-act=mem-open]'); await page.wait_for_timeout(200)
        ids = await page.evaluate("Hindi5.mem().cards.map(c=>c.id)")
        for cid in dict.fromkeys(ids):
            c1, c2 = [i for i, x in enumerate(ids) if x == cid]
            await page.click(f'[data-act=mem-flip][data-i="{c1}"]'); await page.click(f'[data-act=mem-flip][data-i="{c2}"]'); await page.wait_for_timeout(60)
        check('Alle Paare gefunden' in await page.inner_text('body'), 'Memory lässt sich lösen')
        await page.click('[data-act=path]'); await page.click('[data-act=pc-open]'); await page.wait_for_timeout(200)
        check(await page.locator('.pc:not(.pc-locked)').count() == 6, 'Alle sechs Postkarten gesammelt')
        await page.screenshot(path=os.path.join(OUT, '14-postkarten.png'), full_page=True)
        await page.click('[data-act=path]'); await page.click('[data-act=home]')

        # Lernpfad, Einstellungen, Umschrift
        await page.click('[data-act=path]'); await page.wait_for_timeout(200)
        await page.screenshot(path=os.path.join(OUT, '06-lernpfad.png'), full_page=True)
        check(await page.locator('.lesson-row.is-done').count() == 30, 'Lernpfad zeigt 30 gelernte Lektionen')
        await page.click('[data-act=home]'); await page.click('[data-act=settings]'); await page.wait_for_timeout(200)
        await page.fill('#f-name', 'Lisa'); await page.press('#f-name', 'Tab')
        await page.click('[data-act=set][data-key=roman][data-val=always]')
        await page.screenshot(path=os.path.join(OUT, '07-einstellungen.png'), full_page=True)
        st = await page.evaluate('Hindi5.state')
        check(st['name'] == 'Lisa' and st['settings']['roman'] == 'always', 'Einstellungen werden gespeichert')
        await page.click('[data-act=export]'); await page.wait_for_timeout(200)
        exported = await page.input_value('#f-io')
        check(json.loads(exported)['app'] == 'hindi5', 'Lernstand lässt sich exportieren')
        await page.click('[data-act=reset-ask]'); await page.click('[data-act=reset]'); await page.wait_for_timeout(200)
        check(await page.evaluate('Hindi5.state.next') == 0, 'Zurücksetzen funktioniert')
        await page.click('[data-act=settings]'); await page.click('[data-act=import-open]')
        await page.fill('#f-io', exported); await page.click('[data-act=import]'); await page.wait_for_timeout(900)
        check(await page.evaluate('Hindi5.state.next') == 30, 'Import stellt den Lernstand wieder her')

        # Horizontal überlaufende Seiten auf dem iPhone?
        await page.evaluate("() => { Hindi5.state.session = Hindi5.buildLesson(16, true); Hindi5.state.settings.roman='auto'; Hindi5.save(); }")
        await page.goto(URL); await page.wait_for_timeout(200); await page.click('[data-act=resume]') if await page.locator('[data-act=resume]').count() else await page.click('[data-act=start]')
        over = []
        for _ in range(40):
            if not await page.evaluate('!!Hindi5.state.session'): break
            w = await page.evaluate('document.documentElement.scrollWidth')
            if w > 390: over.append(await page.evaluate('Hindi5.state.session.steps[Hindi5.state.session.i].k'))
            await page.evaluate(SOLVE, 0.0); await page.wait_for_timeout(20)
        check(not over, f'Kein horizontales Scrollen auf iPhone-Breite {over}')
        await ctx.close()

        # Desktop und dunkler Modus
        for scheme in ['light', 'dark']:
            c2 = await b.new_context(viewport={'width': 1280, 'height': 800}, color_scheme=scheme, locale='de-DE')
            await c2.add_init_script(FAKE)
            pg = await c2.new_page(); pg.on('pageerror', lambda e: errors.append(str(e)))
            await pg.goto(URL); await pg.wait_for_timeout(500)
            await pg.screenshot(path=os.path.join(OUT, f'10-desktop-{scheme}-home.png'))
            await pg.click('[data-act=start]'); await pg.wait_for_timeout(200)
            for i in range(9):
                await pg.wait_for_timeout(350)
                k = await pg.evaluate('Hindi5.state.session.steps[Hindi5.state.session.i].k + ":" + ((Hindi5.state.session.steps[Hindi5.state.session.i].ex||{}).t||"")')
                await pg.screenshot(path=os.path.join(OUT, f'11-desktop-{scheme}-{i:02d}-{k.replace(":", "-")}.png'))
                # Tastatur: Enter für Weiter, Ziffern für Antworten
                if k.startswith('ex:choose'):
                    ex = await pg.evaluate('Hindi5.state.session.steps[Hindi5.state.session.i].ex')
                    await pg.keyboard.press(str(ex['options'].index(ex['item']) + 1)); await pg.wait_for_timeout(250)
                    await pg.screenshot(path=os.path.join(OUT, f'11-desktop-{scheme}-{i:02d}b-feedback.png'))
                    await pg.keyboard.press('Enter')
                elif k in ('intro:', 'learn:', 'dialog:', 'script:'):
                    await pg.keyboard.press('Enter')
                else:
                    await pg.evaluate(SOLVE, 0.0)
            await c2.close()
        await b.close()

        if errors: print('JS-FEHLER:\n' + '\n'.join(sorted(set(errors))))
        fails = [r for r in results if r.startswith('FEHLER')]
        print(f'\n{len(results) - len(fails)} von {len(results)} Prüfungen bestanden, {len(set(errors))} JS-Fehler')
        sys.exit(1 if fails or errors else 0)

asyncio.run(main())

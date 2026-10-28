"""Abgleich zwischen zwei Geräten mit nachgebildetem Apps-Script-Endpunkt, außerdem das Lernheft.
Aufruf: python3 tools/e2e_sync.py [screenshot-ordner]"""
import asyncio, sys, os, json, threading, http.server, functools, datetime
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'tools', 'shots')
os.makedirs(OUT, exist_ok=True)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
app_srv = http.server.ThreadingHTTPServer(('127.0.0.1', 8775), functools.partial(Quiet, directory=ROOT))
threading.Thread(target=app_srv.serve_forever, daemon=True).start()

STORE = {'stand': None, 'calls': 0, 'uebersicht': None}
TOKEN = 'geheim123'
class Script(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def do_POST(self):
        d = json.loads(self.rfile.read(int(self.headers['Content-Length'])) or b'{}')
        STORE['calls'] += 1
        if d.get('token') != TOKEN: out = {'ok': False, 'fehler': 'schluessel'}
        elif d.get('aktion') == 'speichern':
            STORE['stand'] = d['stand']; STORE['uebersicht'] = d.get('uebersicht'); out = {'ok': True}
        else: out = {'ok': True, 'stand': STORE['stand']}
        b = json.dumps(out).encode()
        self.send_response(200); self.send_header('Content-Type', 'application/json'); self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', str(len(b))); self.end_headers(); self.wfile.write(b)
script_srv = http.server.ThreadingHTTPServer(('127.0.0.1', 8776), Script)
threading.Thread(target=script_srv.serve_forever, daemon=True).start()
URL = 'http://127.0.0.1:8775/index.html'
SYNC = json.dumps({'url': 'http://127.0.0.1:8776/exec', 'token': TOKEN})

SOLVE = open(os.path.join(ROOT, 'tools', 'e2e.py')).read().split('SOLVE = """')[1].split('"""')[0]
FAKE = open(os.path.join(ROOT, 'tools', 'e2e.py')).read().split('FAKE = """')[1].split('"""')[0]
results = []
def check(c, m):
    results.append(c); print(('OK  ' if c else 'FEHLER ') + m, flush=True)

async def play(page, wrong=0.0):
    for _ in range(80):
        if not await page.evaluate('!!Hindi5.state.session'): return
        await page.evaluate(SOLVE.replace('\\\\s', '\\s'), wrong); await page.wait_for_timeout(25)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        errs = []
        # Gerät A: MacBook
        a = await b.new_context(viewport={'width': 1280, 'height': 800}, locale='de-DE')
        await a.add_init_script(FAKE)
        pa = await a.new_page(); pa.on('pageerror', lambda e: errs.append(str(e)))
        await pa.clock.install(time=datetime.datetime(2026, 10, 28, 7, 30))
        await pa.goto(URL); await pa.wait_for_timeout(300)
        await pa.click('[data-act=start]'); await play(pa)
        await pa.click('[data-act=start]'); await play(pa)
        await pa.evaluate(f"localStorage.setItem('hindi5.sync', JSON.stringify({SYNC})); Hindi5.Sync.load()")
        ok = await pa.evaluate('Hindi5.Sync.sync("test")')
        check(ok and STORE['stand'] and STORE['stand']['next'] == 2, 'Gerät A schreibt seinen Lernstand in die Tabelle')
        check(STORE['stand'].get('session') is None, 'Laufende Lektion bleibt auf dem Gerät')
        check(STORE['uebersicht'] and len(STORE['uebersicht']['lektionen']) == 2 and len(STORE['uebersicht']['woerter']) == 7, 'Tabelle bekommt Lektionen und Wörter zum Nachlesen')

        # Gerät B: iPhone, verbindet sich mit Code
        code = await pa.evaluate('Hindi5.Sync.code()')
        bctx = await b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=2, locale='de-DE')
        await bctx.add_init_script(FAKE)
        pb = await bctx.new_page(); pb.on('pageerror', lambda e: errs.append(str(e)))
        await pb.clock.install(time=datetime.datetime(2026, 10, 28, 20, 0))
        await pb.goto(URL); await pb.wait_for_timeout(300)
        await pb.click('[data-act=settings]'); await pb.wait_for_timeout(200)
        await pb.screenshot(path=os.path.join(OUT, '20-sync-einstellungen.png'), full_page=True)
        # Codefeld akzeptiert den Code; die echte Prüfung der Adresse gilt nur für Google-URLs
        await pb.fill('#f-scode', code); await pb.click('[data-act=sync-paste]'); await pb.wait_for_timeout(800)
        st = await pb.evaluate('Hindi5.state')
        check(st['next'] == 2 and 'l02' in st['done'], 'Gerät B übernimmt den Stand über den Verbindungscode')
        await pb.screenshot(path=os.path.join(OUT, '21-sync-verbunden.png'), full_page=True)
        check('Verbunden' in await pb.inner_text('#sync-zone'), 'Einstellungen zeigen die Verbindung an')

        # B lernt weiter, A hat in der Zwischenzeit offline gelernt: beides muss erhalten bleiben
        await pb.click('[data-act=home]'); await pb.click('[data-act=start]'); await play(pb, 0.3)
        await pb.evaluate('Hindi5.Sync.sync("t")')
        await pa.evaluate("() => { Hindi5.state.items.namaste.bad += 5; Hindi5.state.items.namaste.last = '2026-10-29'; Hindi5.save(); }")
        await pa.evaluate('Hindi5.Sync.sync("t")')
        sa = await pa.evaluate('Hindi5.state')
        check(sa['next'] == 3 and 'l03' in sa['done'], 'Gerät A bekommt die Lektion von Gerät B')
        await pb.evaluate('Hindi5.Sync.sync("t")')
        sb = await pb.evaluate('Hindi5.state')
        check(sb['items']['namaste']['bad'] >= 5, 'Gerät B bekommt den neueren Wortstand von Gerät A')

        # Falscher Schlüssel
        await pa.evaluate("() => { Hindi5.Sync.cfg.token = 'falsch'; }")
        ok = await pa.evaluate('Hindi5.Sync.sync("t")')
        err = await pa.evaluate('Hindi5.Sync.lastError')
        check(not ok and 'Schlüssel' in err, f'Falscher Schlüssel wird verständlich gemeldet ({err})')

        # Lernheft
        await pb.click('[data-act=home]') if await pb.locator('[data-act=home]').count() else None
        await pb.goto(URL); await pb.wait_for_timeout(300)
        await pb.click('[data-act=heft]'); await pb.wait_for_timeout(300)
        txt = await pb.inner_text('body')
        check('Lernheft' in txt and 'Wie geht es Ihnen?' in txt and 'Mir geht es gut.' in txt, 'Lernheft zeigt Dialoge und Übersetzungen der gelernten Lektionen')
        check(await pb.locator('.heft-l').count() == 3, 'Lernheft enthält alle drei gelernten Lektionen')
        await pb.screenshot(path=os.path.join(OUT, '22-lernheft.png'), full_page=True)
        await pb.click('[data-act=heft-de]'); await pb.wait_for_timeout(200)
        check(await pb.locator('.heft-l .rp-de').count() > 5, 'Übersetzung lässt sich zum Selbsttest verdecken')
        await pb.screenshot(path=os.path.join(OUT, '23-lernheft-verdeckt.png'))
        await b.close()
        print('JS-Fehler:', errs or 'keine')
        print(f'{sum(results)} von {len(results)} Prüfungen bestanden')
        sys.exit(0 if all(results) and not errs else 1)

asyncio.run(main())

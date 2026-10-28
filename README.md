# Hindi · 5 Minuten

Eine kleine Web-App für tägliche Hindi-Lektionen von etwa fünf Minuten. Sie läuft im Browser auf iPhone und Mac, lässt sich auf dem iPhone wie eine App zum Home-Bildschirm hinzufügen und funktioniert nach dem ersten Aufruf auch ohne Internet (Ausnahme ist die Spracherkennung).

## Online stellen

Die App besteht nur aus statischen Dateien und braucht keinen Server mit Programmlogik. Für Mikrofon, Spracherkennung und Offline-Betrieb ist eine HTTPS-Adresse nötig.

Der einfachste Weg führt über GitHub Pages. Du legst ein Repository an, lädst den gesamten Ordnerinhalt hoch und aktivierst unter Settings › Pages die Veröffentlichung aus dem Hauptzweig. Nach etwa einer Minute ist die App unter einer Adresse wie `https://deinname.github.io/hindi5/` erreichbar. Netlify oder Cloudflare Pages funktionieren genauso, dort ziehst du den Ordner einfach ins Browserfenster.

Lokal testen lässt sich die App mit `python3 -m http.server` im Ordner und dem Aufruf von `http://localhost:8000`.

## Auf dem iPhone installieren

Öffne die Adresse in Safari, tippe auf Teilen und dann auf „Zum Home-Bildschirm“. Die App startet danach ohne Browserleiste. Der Lernstand der installierten App ist von dem in Safari getrennt.

Für die Aussprache braucht das iPhone eine Hindi-Stimme. Du findest sie unter Einstellungen › Bedienungshilfen › Gesprochene Inhalte › Stimmen › Hindi. Die Stimme „Lekha“ in der erweiterten Qualität klingt deutlich natürlicher als die Grundfassung. Für die Spracherkennung muss unter Einstellungen › Allgemein › Tastatur das Diktieren eingeschaltet sein.

Auf dem Mac funktioniert alles in Safari und Chrome. Chrome bringt die Stimme „Google हिन्दी“ meist schon mit, die Spracherkennung in Chrome braucht eine Internetverbindung.

## Wie die Aussprache bewertet wird

Beim Sprechen nutzt die App die Spracherkennung des Browsers mit der Spracheinstellung Hindi (Indien). Das Erkannte wird Wort für Wort mit dem Zielsatz verglichen. Beide Fassungen werden dazu in eine vereinfachte Lautschrift umgewandelt, sodass kleine Schreibvarianten nicht als Fehler zählen, ein falsch verstandenes Wort aber schon. Du siehst danach, welche Wörter klar ankamen, was das System gehört hat und einen gezielten Aussprachehinweis zum ersten unklaren Wort.

Diese Rückmeldung prüft Verständlichkeit, keine Lautphonetik im engeren Sinn. Ob ein ṭ wirklich retroflex klang, kann eine Spracherkennung nicht zuverlässig beurteilen. Wo der Browser keine Spracherkennung anbietet, nimmt die App dich auf und spielt deine Aufnahme neben dem Vorbild ab, und du bewertest den Vergleich selbst. In Umgebungen ohne Mikrofonzugriff (etwa in der Vorschau auf claude.ai) bleibt das Nachsprechen mit Selbstbewertung.

## Hochwertigere Audiodateien einbinden

Die App liest Hindi standardmäßig mit der Systemstimme vor. Eigene Aufnahmen oder einmalig erzeugte Dateien eines professionellen Sprachdienstes (etwa Google Cloud Text-to-Speech oder Azure Speech mit einer hi-IN-Stimme) haben Vorrang, sobald sie eingetragen sind. Dafür legst du die Dateien in einen Ordner `audio/` und eine Datei `content/audio.js` an:

```js
window.HINDI_AUDIO = {
  'नमस्ते': 'audio/namaste.mp3',
  'नमस्ते! आप कैसे हैं?': 'audio/l01-key.mp3'
};
```

Schlüssel ist der Hindi-Text genau wie in den Inhalten. Die Datei wird in `index.html` vor `app.js` eingebunden und zusammen mit den Audiodateien in die Liste `FILES` in `sw.js` aufgenommen, damit alles offline verfügbar ist. Für alles ohne Eintrag bleibt die Systemstimme zuständig.

## Spielerisches

Die App verzichtet bewusst auf Punkte, Serien und Zeitdruck. Spielerisch sind stattdessen drei Formen, in denen du selbst Sprache benutzt. In kurzen Rollenspielen spricht eine Figur mit dir, etwa ein Chaiwala oder ein Rikschafahrer, und du wählst deine Antwort. Eine unpassende Antwort hat eine kleine Folge in der Szene, danach versuchst du es neu. Jede Szene öffnet sich erst, wenn alle Wörter darin gelernt sind. Im Hör-Memory deckst du Paare aus Hindi und Deutsch auf und hörst dabei jedes Wort. Alle fünf Lektionen öffnet sich außerdem eine Postkarte mit einer kurzen Geschichte zur Sprache. Neue Szenen und Karten kommen in `content/games.js`.

## Lernlogik

Der Ablauf folgt verbreiteten Grundsätzen des Fremdsprachenlernens für Erwachsene. Jede Lektion nennt zu Beginn ihr Ziel als Kann-Beschreibung, etwa „Nach dieser Lektion kannst du jemanden begrüßen“, und greift es am Ende wieder auf. Danach kommen zwei bis drei fällige Wiederholungen und zwei bis vier neue Wörter oder Wendungen. Jede Wendung wird Wort für Wort mit wörtlicher Bedeutung zerlegt und dann von hinten aufgebaut nachgesprochen, also erst हैं, dann कैसे हैं, dann आप कैसे हैं?. Auf jedes neue Element folgt eine kurze Kontrollfrage, bei der nur bereits gezeigte Wörter zur Auswahl stehen. Es folgen ein kurzer Dialog, zwei bis drei Übungen und eine Sprechübung zum Satz des Tages, die ebenfalls schrittweise aufgebaut ist. Bei jeder Aufgabe kannst du „Weiß ich nicht“ wählen und bekommst die Lösung, ohne raten zu müssen. Die Devanagari-Schrift beginnt mit Lektion 11, ein Zeichen pro Lektion und nur in Wörtern, die du schon sprechen kannst. Der Beginn lässt sich in `content/script.js` über `startLesson` verschieben.

Die Wiederholung arbeitet mit acht Kästen und den Abständen 1, 1, 3, 7, 14, 30, 60 und 120 Tagen. Ein richtiger Abruf an einem fälligen Tag schiebt ein Wort einen Kasten weiter. Ein Fehler setzt es auf den ersten Kasten zurück, es taucht noch in derselben Lektion ein zweites Mal auf, ist am nächsten Tag fällig und wird dort vor anderen Wörtern abgefragt. Ein Satz zählt als „ohne Hilfe verstanden“, sobald er an einem späteren Tag erneut richtig erkannt wurde.

Die Umschrift ist in den Lektionen 1 bis 10 gut sichtbar, wird in den Lektionen 11 bis 20 kleiner und blasser und erscheint ab Lektion 21 nur noch auf Antippen. In den Einstellungen lässt sich das ändern.

Unter „Wörter“ siehst du alles Gelernte mit Aussprache und Lernstand und kannst gezielt die unsicheren Wörter üben. Im Lernpfad gibt es Übungsrunden für Wörter, Sprechen und Schrift, und jede Lektion lässt sich vorab mit Wörtern, Dialog und Ablauf ansehen.

Der Lernstand liegt im lokalen Speicher des Browsers, eine laufende Lektion wird nach jedem Schritt gesichert. In den Einstellungen kannst du ihn kopieren und auf einem anderen Gerät einfügen.

## Neue Lektionen ergänzen

Programm und Inhalte sind getrennt. Der Wortschatz steht in `content/items.js`, die Lektionen in `content/lessons-001-030.js`. Der Aufbau einer Lektion ist am Anfang dieser Datei beschrieben.

Für weitere Lektionen legst du eine neue Datei an, etwa `content/lessons-031-060.js`, die mit `window.HINDI_LESSONS.push(...)` beginnt, trägst neue Wörter in `items.js` ein und bindest die Datei in `index.html` und `sw.js` ein. Danach die Versionsnummer in `sw.js` erhöhen, damit installierte Geräte die neue Fassung laden. Die `id` einer Lektion und die Schlüssel der Wörter dürfen sich später nicht mehr ändern, weil der Lernstand daran hängt.

Vor dem Hochladen prüft `node tools/validate.mjs` alle Inhalte. Das Skript meldet unter anderem jedes Wort, das in einer Übung vorkommt, bevor es eingeführt wurde, jede Schriftaufgabe mit noch unbekannten Zeichen und jede falsche Antwort ohne Erklärung.

## Tests

`python3 tools/e2e.py` spielt alle 30 Lektionen in einem echten Browser über 30 simulierte Tage durch, mit absichtlich falschen Antworten, und prüft Speicherung, Wiederaufnahme, Wiederholungslogik, Aussprachebewertung (mit simulierter Spracherkennung), Einstellungen, Export und Import sowie die Darstellung in iPhone-Breite. Voraussetzung ist Python mit Playwright.

## Dateien

```
index.html                 Einstieg
styles.css                 Gestaltung, helles und dunkles Farbschema
app.js                     Lernlogik, Wiederholung, Audio, Spracherkennung
content/items.js           Wortschatz (116 Wörter und Wendungen)
content/lessons-001-030.js Lektionen 1 bis 30
content/script.js          Schrift-Strang, ab Lektion 11
content/games.js           Rollenspiele und Postkarten
fonts/                     Tiro Devanagari Hindi, Noto Sans Devanagari, Source Sans 3 (SIL Open Font License)
icons/                     App-Symbole
manifest.webmanifest, sw.js  Installation und Offline-Betrieb
tools/                     Inhaltsprüfung und Browsertest
```

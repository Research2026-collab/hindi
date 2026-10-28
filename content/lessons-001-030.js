/*
  Lektionen 1 bis 30
  ------------------
  Weitere Lektionen kommen in eigene Dateien (z. B. lessons-031-060.js), die ebenfalls
  window.HINDI_LESSONS.push(...) aufrufen und in index.html sowie sw.js eingetragen werden.

  Aufbau einer Lektion
    id        eindeutige Kennung, bleibt dauerhaft gleich (der Lernstand hängt daran)
    title     Titel
    topic     Situation, zu der die Lektion gehört
    goal      Lernziel als Kann-Beschreibung, ergänzt „Nach dieser Lektion kannst du …“
    new       2 bis 4 ids aus items.js, die hier neu eingeführt werden
    dialog    Mini-Dialog; who: 'du' für die Lernerin, sonst ein Name
    gloss     Wörter, die im Dialog vorkommen, aber noch nicht gelernt wurden (mit Übersetzung)
    key       Satz des Tages
    note      ein kurzer kultureller oder sprachlicher Hinweis
    (Die Schrift hat einen eigenen Strang in content/script.js.)
    exercises aktive Übungen. Typen:
                meaning  Hindi sehen, Bedeutung wählen        { t, item }
                reverse  Deutsch sehen, Hindi wählen          { t, item }
                listen   hören, Bedeutung wählen              { t, item }
                recall   aktiv erinnern, dann selbst bewerten { t, item }
                match    Hindi und Deutsch zuordnen           { t, items: [4 ids] }  nur für Wörter mit eigener Bedeutung
                cloze    Lücke füllen                         { t, hi, tr, de, answer, options, why, items }
                order    Satz aus Bausteinen bilden           { t, hi, tr, de, why, items }
                natural  natürlichste Antwort wählen          { t, situation, options: [{ hi, ok, why }], items }
    speak     Sprechübung (Standard: Satz des Tages)

  Regel: Übungen verwenden ausschließlich Wörter, die in dieser oder einer früheren Lektion
  eingeführt wurden. tools/validate.mjs prüft das automatisch.
  {name} wird durch den Namen der Lernerin ersetzt.
*/
window.HINDI_LESSONS = window.HINDI_LESSONS || [];
window.HINDI_LESSONS.push(

/* ───────────── Begrüßen und vorstellen ───────────── */
{
  id: 'l01', title: 'Begrüßen', topic: 'Begrüßen',
  goal: 'jemanden begrüßen und fragen, wie es ihm geht.',
  new: ['namaste', 'aapkaise', 'theekhoon'],
  dialog: [
    { who: 'Priya', hi: 'नमस्ते! आप कैसे हैं?', tr: 'namaste! āp kaise haĩ?', de: 'Hallo! Wie geht es Ihnen?' },
    { who: 'du', hi: 'नमस्ते! मैं ठीक हूँ।', tr: 'namaste! maĩ ṭhīk hũ.', de: 'Hallo! Mir geht es gut.' }
  ],
  key: { hi: 'नमस्ते! आप कैसे हैं?', tr: 'namaste! āp kaise haĩ?', de: 'Hallo! Wie geht es Ihnen?' },
  note: 'नमस्ते passt zu jeder Tageszeit und auch zum Abschied. Oft legt man dabei die Handflächen vor der Brust zusammen.',
  exercises: [
    { t: 'natural', situation: 'Priya begrüßt dich mit नमस्ते! आप कैसे हैं? Was antwortest du?', items: ['theekhoon'], options: [
      { hi: 'नमस्ते! मैं ठीक हूँ।', ok: true, why: 'Du grüßt zurück und sagst, dass es dir gut geht.' },
      { hi: 'आप कैसे हैं?', why: 'Damit stellst du nur dieselbe Frage zurück und antwortest nicht.' } ] },
    { t: 'order', hi: 'आप कैसे हैं?', tr: 'āp kaise haĩ?', de: 'Wie geht es Ihnen?', why: 'Wörtlich heißt der Satz „Sie wie sind?“. Das Verb steht im Hindi am Ende.', items: ['aapkaise'] }
  ]
},
{
  id: 'l02', title: 'Ich und Sie', topic: 'Befinden',
  goal: 'sagen, dass es dir gut geht, und die Frage höflich zurückgeben.',
  new: ['main', 'aap', 'theek', 'aur'],
  dialog: [
    { who: 'Priya', hi: 'आप कैसे हैं?', tr: 'āp kaise haĩ?', de: 'Wie geht es Ihnen?' },
    { who: 'du', hi: 'मैं ठीक हूँ। और आप?', tr: 'maĩ ṭhīk hũ. aur āp?', de: 'Mir geht es gut. Und Ihnen?' },
    { who: 'Priya', hi: 'मैं भी ठीक हूँ।', tr: 'maĩ bhī ṭhīk hũ.', de: 'Mir geht es auch gut.' }
  ],
  gloss: { 'भी': 'auch' },
  key: { hi: 'मैं ठीक हूँ। और आप?', tr: 'maĩ ṭhīk hũ. aur āp?', de: 'Mir geht es gut. Und Ihnen?' },
  note: 'In den Sätzen von gestern stecken die Wörter मैं (ich) und आप (Sie). Zu मैं gehört हूँ, zu आप gehört हैं.',
  exercises: [
    { t: 'natural', situation: 'Priya fragt dich: आप कैसे हैं?', items: ['aur'], options: [
      { hi: 'मैं ठीक हूँ। और आप?', ok: true, why: 'Kurz antworten und die Frage zurückgeben ist die übliche Form.' },
      { hi: 'नमस्ते।', why: 'Damit grüßt du nur zurück. Die Frage bleibt offen.' },
      { hi: 'आप ठीक हूँ।', why: 'Damit sprichst du über Priya, nicht über dich. Außerdem gehört zu आप immer हैं.' } ] },
    { t: 'cloze', hi: 'मैं ठीक ___।', tr: 'maĩ ṭhīk ___.', de: 'Mir geht es gut.', answer: 'हूँ', options: ['हूँ', 'हैं'],
      why: { 'हैं': 'हैं gehört zu आप. Zu मैं passt हूँ.' }, items: ['main'] }
  ]
},
{
  id: 'l03', title: 'Ja und nein', topic: 'Zustimmung',
  goal: 'mit ja, nein und okay auf einfache Fragen reagieren.',
  new: ['haan', 'nahin', 'hai', 'theekhai'],
  dialog: [
    { who: 'Raj', hi: 'आप ठीक हैं?', tr: 'āp ṭhīk haĩ?', de: 'Geht es Ihnen gut?' },
    { who: 'du', hi: 'हाँ, मैं ठीक हूँ।', tr: 'hã, maĩ ṭhīk hũ.', de: 'Ja, mir geht es gut.' },
    { who: 'Raj', hi: 'ठीक है।', tr: 'ṭhīk hai.', de: 'Okay.' }
  ],
  key: { hi: 'हाँ, ठीक है।', tr: 'hã, ṭhīk hai.', de: 'Ja, in Ordnung.' },
  note: 'ठीक है gehört zu den häufigsten Wendungen. Es bestätigt, beruhigt und beendet ein Gespräch.',
  exercises: [
    { t: 'meaning', item: 'nahin' },
    { t: 'cloze', hi: 'हाँ, ठीक ___।', tr: 'hã, ṭhīk ___.', de: 'Ja, in Ordnung.', answer: 'है', options: ['है', 'हूँ', 'हैं'],
      why: { 'हूँ': 'हूँ gehört zu मैं. ठीक है ist eine feste Wendung mit है.', 'हैं': 'हैं steht bei आप. In der festen Wendung heißt es ठीक है.' }, items: ['theekhai'] },
    { t: 'natural', situation: 'Ein Freund fragt: आप ठीक हैं? Dir geht es gut.', items: ['haan', 'nahin'], options: [
      { hi: 'हाँ, मैं ठीक हूँ।', ok: true, why: 'Zustimmung mit हाँ, dann der Satz über dich.' },
      { hi: 'नहीं, मैं ठीक हूँ।', why: 'नहीं heißt „nein“. Das passt nicht zu deiner Antwort.' },
      { hi: 'हाँ, आप ठीक हैं।', why: 'Das heißt „Ja, Sie sind in Ordnung“. Gefragt war nach dir.' } ] },
    { t: 'recall', item: 'haan' }
  ]
},
{
  id: 'l04', title: 'Danke', topic: 'Höflichkeit',
  goal: 'dich bedanken und auf einen Dank antworten.',
  new: ['dhanyavaad', 'shukriya', 'bahut', 'koibaat'],
  dialog: [
    { who: 'du', hi: 'बहुत शुक्रिया!', tr: 'bahut śukriyā!', de: 'Vielen Dank!' },
    { who: 'Anjali', hi: 'कोई बात नहीं।', tr: 'koī bāt nahĩ.', de: 'Keine Ursache.' }
  ],
  key: { hi: 'बहुत शुक्रिया!', tr: 'bahut śukriyā!', de: 'Vielen Dank!' },
  note: 'Im Alltag hörst du oft einfach „thank you“. Unter engen Freunden und in der Familie bedankt man sich selten, ein förmlicher Dank kann dort sogar distanziert wirken.',
  exercises: [
    { t: 'match', items: ['dhanyavaad', 'bahut', 'koibaat', 'haan'] },
    { t: 'natural', situation: 'Du hast jemandem den Weg gezeigt. Er sagt: बहुत शुक्रिया!', items: ['koibaat'], options: [
      { hi: 'कोई बात नहीं।', ok: true, why: 'So antwortest du auf einen Dank.' },
      { hi: 'बहुत शुक्रिया!', why: 'Du würdest dich zurückbedanken, obwohl du geholfen hast.' },
      { hi: 'नहीं।', why: 'Ein bloßes „nein“ wirkt abweisend.' } ] },
    { t: 'reverse', item: 'bahut' }
  ]
},
{
  id: 'l05', title: 'Wie heißt du?', topic: 'Sich vorstellen',
  goal: 'nach dem Namen fragen und deinen eigenen nennen.',
  new: ['mera', 'naam', 'aapka', 'kya'],
  dialog: [
    { who: 'Raj', hi: 'आपका नाम क्या है?', tr: 'āpkā nām kyā hai?', de: 'Wie heißen Sie?' },
    { who: 'du', hi: 'मेरा नाम {name} है।', tr: 'merā nām {name} hai.', de: 'Ich heiße {name}.' }
  ],
  key: { hi: 'मेरा नाम {name} है।', tr: 'merā nām {name} hai.', de: 'Ich heiße {name}.' },
  note: 'Im Hindi steht das Verb am Satzende. है schließt den Satz ab, wie ein Punkt, den man ausspricht.',
  exercises: [
    { t: 'order', hi: 'मेरा नाम {name} है।', tr: 'merā nām {name} hai.', de: 'Ich heiße {name}.', why: 'Zuerst „mein Name“, dann der Name, ganz am Ende है.', items: ['mera', 'naam'] },
    { t: 'cloze', hi: 'आपका नाम क्या ___?', tr: 'āpkā nām kyā ___?', de: 'Wie heißen Sie?', answer: 'है', options: ['है', 'हैं', 'हूँ'],
      why: { 'हैं': 'Hier ist नाम das Subjekt: „Ihr Name ist was?“. Zu einem Namen passt है.', 'हूँ': 'हूँ gehört zu मैं.' }, items: ['aapka', 'kya'] },
    { t: 'meaning', item: 'kya' },
    { t: 'reverse', item: 'aapka' }
  ]
},
{
  id: 'l06', title: 'Woher kommst du?', topic: 'Sich vorstellen',
  goal: 'sagen, woher du kommst, und danach fragen.',
  new: ['kahan', 'se', 'jarmani', 'bharat'],
  dialog: [
    { who: 'Raj', hi: 'आप कहाँ से हैं?', tr: 'āp kahã se haĩ?', de: 'Woher kommen Sie?' },
    { who: 'du', hi: 'मैं जर्मनी से हूँ।', tr: 'maĩ jarmanī se hũ.', de: 'Ich komme aus Deutschland.' }
  ],
  key: { hi: 'मैं जर्मनी से हूँ।', tr: 'maĩ jarmanī se hũ.', de: 'Ich komme aus Deutschland.' },
  note: 'Indien heißt auf Hindi भारत. Im Alltag ist auch „India“ ganz geläufig.',
  exercises: [
    { t: 'order', hi: 'आप कहाँ से हैं?', tr: 'āp kahã se haĩ?', de: 'Woher kommen Sie?', why: 'Das Fragewort steht dort, wo in der Antwort der Ort steht: आप कहाँ से हैं, मैं जर्मनी से हूँ.', items: ['kahan', 'se'] },
    { t: 'cloze', hi: 'मैं जर्मनी ___ हूँ।', tr: 'maĩ jarmanī ___ hũ.', de: 'Ich komme aus Deutschland.', answer: 'से', options: ['से', 'कहाँ', 'और'],
      why: { 'कहाँ': 'कहाँ ist das Fragewort „wo“.', 'और': 'और heißt „und“.' }, items: ['se'] },
    { t: 'meaning', item: 'bharat' }
  ]
},
{
  id: 'l07', title: 'Bis bald', topic: 'Verabschieden',
  goal: 'dich freundlich verabschieden.',
  new: ['achha', 'phir', 'milenge', 'chalti'],
  dialog: [
    { who: 'du', hi: 'अच्छा, चलती हूँ।', tr: 'acchā, caltī hũ.', de: 'Also, ich mache mich auf den Weg.' },
    { who: 'Priya', hi: 'ठीक है। फिर मिलेंगे!', tr: 'ṭhīk hai. phir milẽge!', de: 'Okay. Bis bald!' }
  ],
  key: { hi: 'अच्छा, चलती हूँ। फिर मिलेंगे!', tr: 'acchā, caltī hũ. phir milẽge!', de: 'Also, ich gehe dann. Bis bald!' },
  note: 'Als Frau sagst du चलती हूँ, ein Mann sagt चलता हूँ. Das ई am Wortende zeigt oft die weibliche Form.',
  exercises: [
    { t: 'meaning', item: 'achha' },
    { t: 'natural', situation: 'Du willst dich nach einem Treffen verabschieden.', items: ['chalti', 'milenge'], options: [
      { hi: 'अच्छा, चलती हूँ। फिर मिलेंगे!', ok: true, why: 'Ankündigen, dass du gehst, und ein Wiedersehen in Aussicht stellen.' },
      { hi: 'नमस्ते! आप कैसे हैं?', why: 'Das ist eine Begrüßung mit der Frage nach dem Befinden.' },
      { hi: 'कोई बात नहीं।', why: 'Das ist die Antwort auf einen Dank.' } ] },
    { t: 'recall', item: 'milenge' }
  ],
  speak: { hi: 'फिर मिलेंगे!', tr: 'phir milẽge!', de: 'Bis bald!' }
},

/* ───────────── Essen und Trinken ───────────── */
{
  id: 'l08', title: 'Ich hätte gern', topic: 'Essen und Trinken',
  goal: 'sagen, was du gern hättest, etwa Wasser oder Tee.',
  new: ['paani', 'chai', 'mujhe', 'chahiye'],
  dialog: [
    { who: 'Kellner', hi: 'आपको चाय चाहिए?', tr: 'āpko cāy cāhie?', de: 'Möchten Sie Tee?' },
    { who: 'du', hi: 'नहीं, मुझे पानी चाहिए।', tr: 'nahĩ, mujhe pānī cāhie.', de: 'Nein, ich hätte gern Wasser.' }
  ],
  gloss: { 'आपको': 'Ihnen' },
  key: { hi: 'मुझे पानी चाहिए।', tr: 'mujhe pānī cāhie.', de: 'Ich hätte gern Wasser.' },
  note: 'Wörtlich heißt der Satz „Mir ist Wasser nötig“. Mit मुझे … चाहिए kannst du fast alles erbitten.',
  exercises: [
    { t: 'cloze', hi: 'मुझे पानी ___।', tr: 'mujhe pānī ___.', de: 'Ich hätte gern Wasser.', answer: 'चाहिए', options: ['चाहिए', 'है', 'हूँ'],
      why: { 'है': 'मुझे पानी है drückt keinen Wunsch aus. Für „hätte gern“ steht चाहिए.', 'हूँ': 'हूँ gehört zu मैं. Mit मुझे steht चाहिए.' }, items: ['chahiye'] },
    { t: 'order', hi: 'मुझे चाय चाहिए।', tr: 'mujhe cāy cāhie.', de: 'Ich hätte gern Tee.', why: 'Zuerst die Person (मुझे), dann das Gewünschte, am Ende चाहिए.', items: ['mujhe', 'chai', 'chahiye'] },
    { t: 'natural', situation: 'Der Kellner bietet dir Tee an. Du möchtest lieber Wasser.', items: ['paani'], options: [
      { hi: 'नहीं, मुझे पानी चाहिए।', ok: true, why: 'Ablehnen und den eigenen Wunsch nennen.' },
      { hi: 'हाँ, मुझे चाय चाहिए।', why: 'Damit nimmst du den Tee an.' },
      { hi: 'मैं पानी हूँ।', why: 'Das heißt „Ich bin Wasser“.' } ] },
    { t: 'listen', item: 'paani' }
  ]
},
{
  id: 'l09', title: 'Essen', topic: 'Essen und Trinken',
  goal: 'einfache Gerichte bestellen.',
  new: ['khaana', 'roti', 'chaawal', 'daal'],
  dialog: [
    { who: 'Kellner', hi: 'आपको क्या चाहिए?', tr: 'āpko kyā cāhie?', de: 'Was möchten Sie?' },
    { who: 'du', hi: 'मुझे रोटी और दाल चाहिए।', tr: 'mujhe roṭī aur dāl cāhie.', de: 'Ich hätte gern Roti und Dal.' }
  ],
  gloss: { 'आपको': 'Ihnen' },
  key: { hi: 'मुझे रोटी और दाल चाहिए।', tr: 'mujhe roṭī aur dāl cāhie.', de: 'Ich hätte gern Roti und Dal.' },
  note: 'खाना heißt zugleich „Essen“ und „essen“. Roti isst man meist mit der rechten Hand und tunkt damit das Dal auf.',
  exercises: [
    { t: 'match', items: ['khaana', 'roti', 'chaawal', 'daal'] },
    { t: 'meaning', item: 'khaana' },
    { t: 'order', hi: 'मुझे रोटी और दाल चाहिए।', tr: 'mujhe roṭī aur dāl cāhie.', de: 'Ich hätte gern Roti und Dal.', why: 'Die gewünschten Dinge stehen zwischen मुझे und चाहिए.', items: ['roti', 'daal'] }
  ]
},

/* ───────────── Zahlen ───────────── */
{
  id: 'l10', title: 'Eins bis vier', topic: 'Zahlen',
  goal: 'von eins bis vier zählen und eine Menge bestellen.',
  new: ['ek', 'do', 'teen', 'chaar'],
  dialog: [
    { who: 'Kellner', hi: 'कितनी रोटी?', tr: 'kitnī roṭī?', de: 'Wie viele Roti?' },
    { who: 'du', hi: 'दो। नहीं, तीन!', tr: 'do. nahĩ, tīn!', de: 'Zwei. Nein, drei!' }
  ],
  gloss: { 'कितनी': 'wie viele' },
  key: { hi: 'मुझे दो रोटी चाहिए।', tr: 'mujhe do roṭī cāhie.', de: 'Ich hätte gern zwei Roti.' },
  note: 'Preise und Uhrzeiten werden oft auf Englisch genannt. Die Hindi-Zahlen bis zehn erkennst du trotzdem bald überall.',
  exercises: [
    { t: 'match', items: ['ek', 'do', 'teen', 'chaar'] },
    { t: 'listen', item: 'teen' },
    { t: 'cloze', hi: 'मुझे ___ रोटी चाहिए।', tr: 'mujhe ___ roṭī cāhie.', de: 'Ich hätte gern zwei Roti.', answer: 'दो', options: ['दो', 'तीन', 'एक'],
      why: { 'तीन': 'तीन ist drei.', 'एक': 'एक ist eins.' }, items: ['do'] },
    { t: 'recall', item: 'chaar' }
  ]
},
{
  id: 'l11', title: 'Fünf bis zehn', topic: 'Zahlen',
  goal: 'Zahlen bis zehn verstehen und eine Menge korrigieren.',
  new: ['paanch', 'chhah', 'saat', 'das'],
  dialog: [
    { who: 'Verkäufer', hi: 'सात रोटी?', tr: 'sāt roṭī?', de: 'Sieben Roti?' },
    { who: 'du', hi: 'नहीं, छह।', tr: 'nahĩ, chah.', de: 'Nein, sechs.' }
  ],
  key: { hi: 'दस नहीं, पाँच।', tr: 'das nahĩ, pãc.', de: 'Nicht zehn, fünf.' },
  note: 'Manche zählen mit dem Daumen über die Fingerglieder. So reicht eine Hand bis zwölf.',
  exercises: [
    { t: 'match', items: ['paanch', 'chhah', 'saat', 'das'] },
    { t: 'listen', item: 'saat' },
    { t: 'natural', situation: 'Die Verkäuferin will dir zehn Mangos geben. Du willst nur fünf.', items: ['das', 'paanch'], options: [
      { hi: 'दस नहीं, पाँच।', ok: true, why: 'नहीं nach der Zahl verneint genau diese Zahl.' },
      { hi: 'पाँच नहीं, दस।', why: 'Das bedeutet zehn statt fünf.' },
      { hi: 'सात नहीं, छह।', why: 'Hier geht es um sieben und sechs.' } ] },
    { t: 'reverse', item: 'chhah' }
  ]
},

/* ───────────── Café und Restaurant ───────────── */
{
  id: 'l12', title: 'Im Café', topic: 'Café und Restaurant',
  goal: 'im Café Kaffee oder Tee bestellen.',
  new: ['coffee', 'doodh', 'cheeni', 'please'],
  dialog: [
    { who: 'Kellner', hi: 'चाय या कॉफ़ी?', tr: 'cāy yā kŏfī?', de: 'Tee oder Kaffee?' },
    { who: 'du', hi: 'एक कॉफ़ी, प्लीज़।', tr: 'ek kŏfī, plīz.', de: 'Einen Kaffee, bitte.' },
    { who: 'Kellner', hi: 'दूध और चीनी?', tr: 'dūdh aur cīnī?', de: 'Milch und Zucker?' },
    { who: 'du', hi: 'सिर्फ़ दूध।', tr: 'sirf dūdh.', de: 'Nur Milch.' }
  ],
  gloss: { 'या': 'oder', 'सिर्फ़': 'nur' },
  key: { hi: 'एक कॉफ़ी, प्लीज़।', tr: 'ek kŏfī, plīz.', de: 'Einen Kaffee, bitte.' },
  note: 'Für „bitte“ gibt es das förmliche कृपया. Im Café hörst du fast immer प्लीज़.',
  exercises: [
    { t: 'meaning', item: 'doodh' },
    { t: 'natural', situation: 'Du bestellst im Café einen Kaffee.', items: ['coffee', 'please'], options: [
      { hi: 'एक कॉफ़ी, प्लीज़।', ok: true, why: 'Kurz, freundlich und im Café völlig üblich.' },
      { hi: 'मुझे कॉफ़ी है।', why: 'Ohne चाहिए wird daraus kein Wunsch.' },
      { hi: 'कॉफ़ी कहाँ है?', why: 'Damit fragst du, wo der Kaffee ist.' } ] },
    { t: 'cloze', hi: 'दूध और ___?', tr: 'dūdh aur ___?', de: 'Milch und Zucker?', answer: 'चीनी', options: ['चीनी', 'पानी', 'चाय'],
      why: { 'पानी': 'पानी ist Wasser.', 'चाय': 'चाय ist Tee.' }, items: ['cheeni'] },
    { t: 'reverse', item: 'please' }
  ]
},
{
  id: 'l13', title: 'Im Restaurant', topic: 'Café und Restaurant',
  goal: 'im Restaurant um Speisekarte, Nachschlag und Rechnung bitten.',
  new: ['laiye', 'bill', 'menu', 'ekaur'],
  dialog: [
    { who: 'du', hi: 'मेनू लाइए, प्लीज़।', tr: 'menū lāie, plīz.', de: 'Bringen Sie bitte die Speisekarte.' },
    { who: 'du', hi: 'एक और चाय, प्लीज़।', tr: 'ek aur cāy, plīz.', de: 'Noch einen Tee, bitte.' },
    { who: 'du', hi: 'बिल लाइए, प्लीज़।', tr: 'bil lāie, plīz.', de: 'Die Rechnung, bitte.' }
  ],
  key: { hi: 'बिल लाइए, प्लीज़।', tr: 'bil lāie, plīz.', de: 'Die Rechnung, bitte.' },
  note: 'Die Endung -इए macht aus einem Verb eine höfliche Bitte. लाइए heißt „bringen Sie“.',
  exercises: [
    { t: 'natural', situation: 'Du möchtest zahlen.', items: ['bill', 'laiye'], options: [
      { hi: 'बिल लाइए, प्लीज़।', ok: true, why: 'So bittest du höflich um die Rechnung.' },
      { hi: 'मेनू लाइए, प्लीज़।', why: 'Damit bittest du um die Speisekarte.' },
      { hi: 'एक और चाय, प्लीज़।', why: 'Damit bestellst du noch einen Tee.' } ] },
    { t: 'cloze', hi: 'एक ___ चाय, प्लीज़।', tr: 'ek ___ cāy, plīz.', de: 'Noch einen Tee, bitte.', answer: 'और', options: ['और', 'से', 'क्या'],
      why: { 'से': 'से heißt „aus, von“.', 'क्या': 'क्या ist das Fragewort „was“.' }, items: ['ekaur'] },
    { t: 'match', items: ['laiye', 'bill', 'menu', 'please'] }
  ]
},
{
  id: 'l14', title: 'Scharf?', topic: 'Café und Restaurant',
  goal: 'sagen, wie scharf du dein Essen möchtest, und es loben.',
  new: ['teekha', 'kam', 'thoda', 'badhiya'],
  dialog: [
    { who: 'du', hi: 'खाना तीखा है?', tr: 'khānā tīkhā hai?', de: 'Ist das Essen scharf?' },
    { who: 'Kellner', hi: 'हाँ, थोड़ा।', tr: 'hã, thoṛā.', de: 'Ja, ein bisschen.' },
    { who: 'du', hi: 'थोड़ा कम तीखा, प्लीज़।', tr: 'thoṛā kam tīkhā, plīz.', de: 'Bitte etwas weniger scharf.' }
  ],
  key: { hi: 'खाना बहुत बढ़िया है!', tr: 'khānā bahut baṛhiyā hai!', de: 'Das Essen ist super!' },
  note: '„Ein bisschen scharf“ kann in Indien deutlich schärfer ausfallen als erwartet. थोड़ा कम तीखा ist ein sehr nützlicher Satz.',
  exercises: [
    { t: 'meaning', item: 'teekha' },
    { t: 'natural', situation: 'Das Essen ist dir zu scharf.', items: ['thoda', 'kam'], options: [
      { hi: 'थोड़ा कम तीखा, प्लीज़।', ok: true, why: 'Du bittest um etwas weniger Schärfe.' },
      { hi: 'बहुत तीखा, प्लीज़।', why: 'So bestellst du es noch schärfer.' },
      { hi: 'खाना बहुत बढ़िया है!', why: 'Ein Lob, über die Schärfe sagt es nichts.' } ] },
    { t: 'order', hi: 'खाना बहुत बढ़िया है!', tr: 'khānā bahut baṛhiyā hai!', de: 'Das Essen ist super!', why: 'बहुत steht direkt vor dem Wort, das es verstärkt.', items: ['badhiya', 'bahut'] },
    { t: 'recall', item: 'thoda' }
  ]
},

/* ───────────── Einkaufen ───────────── */
{
  id: 'l15', title: 'Was kostet das?', topic: 'Einkaufen',
  goal: 'nach einem Preis fragen und die Antwort verstehen.',
  new: ['yah', 'kitneka', 'rupaye', 'sau'],
  dialog: [
    { who: 'du', hi: 'यह कितने का है?', tr: 'yah kitne kā hai?', de: 'Was kostet das?' },
    { who: 'Verkäufer', hi: 'दो सौ रुपये।', tr: 'do sau rupaye.', de: 'Zweihundert Rupien.' },
    { who: 'du', hi: 'और यह?', tr: 'aur yah?', de: 'Und das?' },
    { who: 'Verkäufer', hi: 'सौ रुपये।', tr: 'sau rupaye.', de: 'Hundert Rupien.' }
  ],
  key: { hi: 'यह कितने का है?', tr: 'yah kitne kā hai?', de: 'Was kostet das?' },
  note: 'Hunderter werden einfach gebildet: दो सौ ist zweihundert, पाँच सौ fünfhundert.',
  exercises: [
    { t: 'order', hi: 'यह कितने का है?', tr: 'yah kitne kā hai?', de: 'Was kostet das?', why: 'यह (das) steht vorn, die Frage nach dem Preis folgt, है schließt ab.', items: ['yah', 'kitneka'] },
    { t: 'listen', item: 'sau' },
    { t: 'cloze', hi: 'दो ___ रुपये।', tr: 'do ___ rupaye.', de: 'Zweihundert Rupien.', answer: 'सौ', options: ['सौ', 'दस', 'सात'],
      why: { 'दस': 'दो दस ergibt keine Zahl. दस ist zehn.', 'सात': 'सात ist sieben.' }, items: ['sau'] },
    { t: 'reverse', item: 'rupaye' }
  ]
},
{
  id: 'l16', title: 'Handeln', topic: 'Einkaufen',
  goal: 'auf dem Markt freundlich um einen besseren Preis bitten.',
  new: ['mahanga', 'sasta', 'kijiye'],
  dialog: [
    { who: 'Verkäufer', hi: 'तीन सौ रुपये।', tr: 'tīn sau rupaye.', de: 'Dreihundert Rupien.' },
    { who: 'du', hi: 'बहुत महँगा है! थोड़ा कम कीजिए।', tr: 'bahut mahãgā hai! thoṛā kam kījie.', de: 'Sehr teuer! Gehen Sie etwas runter.' },
    { who: 'Verkäufer', hi: 'ठीक है, दो सौ।', tr: 'ṭhīk hai, do sau.', de: 'Gut, zweihundert.' },
    { who: 'du', hi: 'अच्छा, ठीक है।', tr: 'acchā, ṭhīk hai.', de: 'Gut, einverstanden.' }
  ],
  key: { hi: 'बहुत महँगा है! थोड़ा कम कीजिए।', tr: 'bahut mahãgā hai! thoṛā kam kījie.', de: 'Sehr teuer! Gehen Sie etwas runter.' },
  note: 'Auf Märkten gehört Handeln dazu und darf freundlich bleiben. In Geschäften mit Preisschild handelt man nicht.',
  exercises: [
    { t: 'meaning', item: 'mahanga' },
    { t: 'natural', situation: 'Der Preis ist dir zu hoch.', items: ['mahanga', 'kijiye'], options: [
      { hi: 'बहुत महँगा है! थोड़ा कम कीजिए।', ok: true, why: 'Du nennst den Preis teuer und bittest um Nachlass.' },
      { hi: 'बहुत सस्ता है!', why: 'सस्ता heißt billig. Damit lobst du den Preis.' },
      { hi: 'बहुत बढ़िया है!', why: 'Das heißt „sehr gut“. Der Händler bleibt dann beim Preis.' } ] },
    { t: 'recall', item: 'sasta' }
  ]
},

/* ───────────── Weg und Verkehr ───────────── */
{
  id: 'l17', title: 'Wo ist der Bahnhof?', topic: 'Weg und Orientierung',
  goal: 'Fremde höflich nach dem Weg fragen.',
  new: ['station', 'yahan', 'door', 'maaf'],
  dialog: [
    { who: 'du', hi: 'माफ़ कीजिए, स्टेशन कहाँ है?', tr: 'māf kījie, sṭeśan kahã hai?', de: 'Entschuldigung, wo ist der Bahnhof?' },
    { who: 'Passant', hi: 'वहाँ। यहाँ से दूर नहीं है।', tr: 'vahã. yahã se dūr nahĩ hai.', de: 'Dort. Es ist nicht weit von hier.' }
  ],
  gloss: { 'वहाँ': 'dort' },
  key: { hi: 'माफ़ कीजिए, स्टेशन कहाँ है?', tr: 'māf kījie, sṭeśan kahã hai?', de: 'Entschuldigung, wo ist der Bahnhof?' },
  note: 'माफ़ कीजिए eröffnet höflich eine Frage an Fremde. Viele sagen auch einfach „excuse me“.',
  exercises: [
    { t: 'meaning', item: 'door' },
    { t: 'natural', situation: 'Du willst eine Passantin nach dem Bahnhof fragen.', items: ['maaf', 'station'], options: [
      { hi: 'माफ़ कीजिए, स्टेशन कहाँ है?', ok: true, why: 'Höflich ansprechen, dann fragen.' },
      { hi: 'स्टेशन कहाँ से हैं?', why: 'कहाँ से fragt nach der Herkunft, und हैं passt nicht zu स्टेशन.' },
      { hi: 'बिल लाइए, प्लीज़।', why: 'Damit bittest du um die Rechnung.' } ] },
    { t: 'order', hi: 'यहाँ से दूर नहीं है।', tr: 'yahã se dūr nahĩ hai.', de: 'Es ist nicht weit von hier.', why: 'नहीं steht direkt vor dem Verb है.', items: ['yahan', 'door'] },
    { t: 'reverse', item: 'yahan' }
  ]
},
{
  id: 'l18', title: 'Rechts, links', topic: 'Weg und Orientierung',
  goal: 'eine einfache Wegbeschreibung verstehen.',
  new: ['seedha', 'daen', 'baen', 'jaiye'],
  dialog: [
    { who: 'du', hi: 'स्टेशन कहाँ है?', tr: 'sṭeśan kahã hai?', de: 'Wo ist der Bahnhof?' },
    { who: 'Passant', hi: 'सीधा जाइए, फिर बाएँ।', tr: 'sīdhā jāie, phir bāẽ.', de: 'Gehen Sie geradeaus, dann links.' },
    { who: 'du', hi: 'बाएँ?', tr: 'bāẽ?', de: 'Links?' },
    { who: 'Passant', hi: 'हाँ, फिर दाएँ।', tr: 'hã, phir dāẽ.', de: 'Ja, dann rechts.' }
  ],
  key: { hi: 'सीधा जाइए, फिर दाएँ।', tr: 'sīdhā jāie, phir dāẽ.', de: 'Gehen Sie geradeaus, dann rechts.' },
  note: 'फिर kennst du aus फिर मिलेंगे. In Wegbeschreibungen bedeutet es „dann“.',
  exercises: [
    { t: 'match', items: ['seedha', 'daen', 'baen', 'jaiye'] },
    { t: 'listen', item: 'baen' },
    { t: 'cloze', hi: 'सीधा जाइए, फिर ___।', tr: 'sīdhā jāie, phir ___.', de: 'Gehen Sie geradeaus, dann rechts.', answer: 'दाएँ', options: ['दाएँ', 'बाएँ', 'यहाँ'],
      why: { 'बाएँ': 'बाएँ heißt links.', 'यहाँ': 'यहाँ heißt hier.' }, items: ['daen'] }
  ]
},
{
  id: 'l19', title: 'Im Auto-Rikscha', topic: 'Taxi und Verkehr',
  goal: 'einem Fahrer das Ziel nennen und ihn anhalten lassen.',
  new: ['bhaiya', 'chaliye', 'rukiye', 'yaheen'],
  dialog: [
    { who: 'du', hi: 'भैया, स्टेशन चलिए।', tr: 'bhaiyā, sṭeśan calie.', de: 'Zum Bahnhof, bitte.' },
    { who: 'Fahrer', hi: 'ठीक है, दीदी।', tr: 'ṭhīk hai, dīdī.', de: 'In Ordnung.' },
    { who: 'du', hi: 'यहीं रुकिए, प्लीज़।', tr: 'yahĩ rukie, plīz.', de: 'Halten Sie bitte genau hier.' }
  ],
  gloss: { 'दीदी': 'große Schwester (Anrede für Frauen)' },
  key: { hi: 'भैया, यहीं रुकिए।', tr: 'bhaiyā, yahĩ rukie.', de: 'Halten Sie bitte genau hier.' },
  note: 'Fahrer, Verkäufer und Kellner sprichst du freundlich mit भैया an. Frauen werden oft mit दीदी angesprochen.',
  exercises: [
    { t: 'meaning', item: 'rukiye' },
    { t: 'natural', situation: 'Du sitzt im Auto-Rikscha und bist am Ziel.', items: ['yaheen', 'rukiye'], options: [
      { hi: 'भैया, यहीं रुकिए।', ok: true, why: 'Freundliche Anrede und die Bitte, hier zu halten.' },
      { hi: 'भैया, स्टेशन चलिए।', why: 'Damit nennst du ein Fahrtziel. Du wolltest halten.' },
      { hi: 'भैया, सीधा जाइए।', why: 'Damit bittest du, geradeaus weiterzufahren.' } ] },
    { t: 'reverse', item: 'chaliye' },
    { t: 'recall', item: 'bhaiya' }
  ]
},
{
  id: 'l20', title: 'Wie spät?', topic: 'Uhrzeit',
  goal: 'nach der Uhrzeit fragen und eine Zeit verabreden.',
  new: ['aath', 'nau', 'baje', 'abhi'],
  dialog: [
    { who: 'du', hi: 'अभी कितने बजे हैं?', tr: 'abhī kitne baje haĩ?', de: 'Wie spät ist es jetzt?' },
    { who: 'Priya', hi: 'आठ बजे हैं।', tr: 'āṭh baje haĩ.', de: 'Es ist acht Uhr.' },
    { who: 'du', hi: 'नौ बजे मिलेंगे?', tr: 'nau baje milẽge?', de: 'Sehen wir uns um neun?' },
    { who: 'Priya', hi: 'ठीक है।', tr: 'ṭhīk hai.', de: 'Okay.' }
  ],
  key: { hi: 'नौ बजे मिलेंगे?', tr: 'nau baje milẽge?', de: 'Sehen wir uns um neun?' },
  note: 'Uhrzeiten werden sehr oft auf Englisch genannt, etwa „nine o’clock“ oder einfach „nine“.',
  exercises: [
    { t: 'match', items: ['aath', 'nau', 'baje', 'abhi'] },
    { t: 'order', hi: 'अभी कितने बजे हैं?', tr: 'abhī kitne baje haĩ?', de: 'Wie spät ist es jetzt?', why: 'Die Uhrzeit wird mit हैं gefragt, weil बजे als Mehrzahl gilt.', items: ['abhi', 'baje'] },
    { t: 'listen', item: 'nau' }
  ]
},

/* ───────────── Familie ───────────── */
{
  id: 'l21', title: 'Geschwister', topic: 'Familie und Beziehungen',
  goal: 'von deinen Geschwistern erzählen.',
  new: ['bhai', 'bahan', 'meri'],
  dialog: [
    { who: 'Anjali', hi: 'क्या आपका भाई है?', tr: 'kyā āpkā bhāī hai?', de: 'Haben Sie einen Bruder?' },
    { who: 'du', hi: 'हाँ, मेरा एक भाई है और मेरी एक बहन है।', tr: 'hã, merā ek bhāī hai aur merī ek bahan hai.', de: 'Ja, ich habe einen Bruder und eine Schwester.' }
  ],
  key: { hi: 'मेरी एक बहन है।', tr: 'merī ek bahan hai.', de: 'Ich habe eine Schwester.' },
  note: 'मेरा passt zu भाई, मेरी zu बहन. Das Besitzwort richtet sich nach dem Wort, das folgt, nicht nach dir.',
  exercises: [
    { t: 'cloze', hi: '___ एक बहन है।', tr: '___ ek bahan hai.', de: 'Ich habe eine Schwester.', answer: 'मेरी', options: ['मेरी', 'मेरा', 'आपका'],
      why: { 'मेरा': 'मेरा steht vor männlichen Wörtern wie भाई. बहन ist weiblich.', 'आपका': 'आपका heißt „Ihr“.' }, items: ['meri', 'bahan'] },
    { t: 'cloze', hi: '___ एक भाई है।', tr: '___ ek bhāī hai.', de: 'Ich habe einen Bruder.', answer: 'मेरा', options: ['मेरा', 'मेरी'],
      why: { 'मेरी': 'भाई ist männlich, deshalb मेरा.' }, items: ['bhai', 'mera'] },
    { t: 'meaning', item: 'bahan' }
  ]
},
{
  id: 'l22', title: 'Familie', topic: 'Familie und Beziehungen',
  goal: 'Familienmitglieder und Freunde vorstellen.',
  new: ['maa', 'papa', 'dost', 'pati'],
  dialog: [
    { who: 'Raj', hi: 'यह कौन है?', tr: 'yah kaun hai?', de: 'Wer ist das?' },
    { who: 'du', hi: 'यह मेरी दोस्त है।', tr: 'yah merī dost hai.', de: 'Das ist meine Freundin.' },
    { who: 'Raj', hi: 'और यह?', tr: 'aur yah?', de: 'Und das?' },
    { who: 'du', hi: 'मेरे पति।', tr: 'mere pati.', de: 'Mein Mann.' }
  ],
  gloss: { 'कौन': 'wer', 'मेरे': 'mein (höflich, bei Respektspersonen)' },
  key: { hi: 'यह मेरी दोस्त है।', tr: 'yah merī dost hai.', de: 'Das ist meine Freundin.' },
  note: 'Im Alltag sagen viele मम्मी und पापा. Respektvoller klingen माताजी und पिताजी.',
  exercises: [
    { t: 'match', items: ['maa', 'papa', 'dost', 'pati'] },
    { t: 'order', hi: 'यह मेरी दोस्त है।', tr: 'yah merī dost hai.', de: 'Das ist meine Freundin.', why: 'यह (das) vorn, है am Ende, dazwischen „meine Freundin“.', items: ['dost', 'meri'] },
    { t: 'recall', item: 'maa' }
  ]
},

/* ───────────── Tagesablauf ───────────── */
{
  id: 'l23', title: 'Heute und morgen', topic: 'Tagesablauf',
  goal: 'Verabredungen für heute und morgen treffen.',
  new: ['aaj', 'kal', 'subah', 'raat'],
  dialog: [
    { who: 'Priya', hi: 'आज मिलेंगे?', tr: 'āj milẽge?', de: 'Sehen wir uns heute?' },
    { who: 'du', hi: 'आज नहीं। कल सुबह?', tr: 'āj nahĩ. kal subah?', de: 'Heute nicht. Morgen früh?' },
    { who: 'Priya', hi: 'ठीक है, कल मिलेंगे!', tr: 'ṭhīk hai, kal milẽge!', de: 'Gut, bis morgen!' }
  ],
  key: { hi: 'कल मिलेंगे!', tr: 'kal milẽge!', de: 'Bis morgen!' },
  note: 'कल bedeutet gestern und morgen. Welcher Tag gemeint ist, zeigt erst das Verb.',
  exercises: [
    { t: 'meaning', item: 'kal' },
    { t: 'natural', situation: 'Ihr wollt euch morgen früh treffen.', items: ['kal', 'subah'], options: [
      { hi: 'कल सुबह मिलेंगे!', ok: true, why: 'कल mit dem Zukunftsverb मिलेंगे heißt hier „morgen“.' },
      { hi: 'आज रात मिलेंगे!', why: 'आज रात heißt „heute Abend“.' },
      { hi: 'कल नहीं।', why: 'Damit sagst du „morgen nicht“.' } ] },
    { t: 'reverse', item: 'raat' }
  ]
},
{
  id: 'l24', title: 'Mein Tag', topic: 'Tagesablauf',
  goal: 'kurz von deinem Tagesablauf erzählen.',
  new: ['kaam', 'ghar', 'jaati', 'par'],
  dialog: [
    { who: 'Raj', hi: 'आप सुबह कहाँ जाती हैं?', tr: 'āp subah kahã jātī haĩ?', de: 'Wohin gehen Sie morgens?' },
    { who: 'du', hi: 'मैं सुबह काम पर जाती हूँ।', tr: 'maĩ subah kām par jātī hũ.', de: 'Morgens gehe ich zur Arbeit.' },
    { who: 'Raj', hi: 'और रात को?', tr: 'aur rāt ko?', de: 'Und abends?' },
    { who: 'du', hi: 'घर!', tr: 'ghar!', de: 'Nach Hause!' }
  ],
  gloss: { 'को': 'am, zu (bei Zeitangaben)' },
  key: { hi: 'मैं सुबह काम पर जाती हूँ।', tr: 'maĩ subah kām par jātī hũ.', de: 'Morgens gehe ich zur Arbeit.' },
  note: 'Ein Mann sagt जाता हूँ. Das Muster kennst du schon von चलती हूँ.',
  exercises: [
    { t: 'order', hi: 'मैं सुबह काम पर जाती हूँ।', tr: 'maĩ subah kām par jātī hũ.', de: 'Morgens gehe ich zur Arbeit.', why: 'Zuerst die Zeit, dann das Ziel, das Verb steht ganz am Ende.', items: ['kaam', 'par', 'jaati'] },
    { t: 'cloze', hi: 'मैं घर ___ हूँ।', tr: 'maĩ ghar ___ hũ.', de: 'Ich gehe nach Hause.', answer: 'जाती', options: ['जाती', 'चलती', 'हैं'],
      why: { 'चलती': 'चलती हूँ heißt „ich mache mich auf den Weg“. Mit einem Ziel steht जाती.', 'हैं': 'हैं gehört zu आप.' }, items: ['jaati'] },
    { t: 'meaning', item: 'ghar' }
  ]
},

/* ───────────── Gefühle und Befinden ───────────── */
{
  id: 'l25', title: 'Gefühle', topic: 'Gefühle und Befinden',
  goal: 'sagen, wie du dich fühlst, und dass du Hunger hast.',
  new: ['khush', 'thakgayi', 'bhookh', 'bhookhlagi'],
  dialog: [
    { who: 'Priya', hi: 'आप कैसी हैं?', tr: 'āp kaisī haĩ?', de: 'Wie geht es dir?' },
    { who: 'du', hi: 'थोड़ी थक गई हूँ। और मुझे भूख लगी है!', tr: 'thoṛī thak gaī hũ. aur mujhe bhūkh lagī hai!', de: 'Ich bin etwas müde. Und ich habe Hunger!' }
  ],
  gloss: { 'कैसी': 'wie (zu einer Frau)', 'थोड़ी': 'ein bisschen (weibliche Form)' },
  key: { hi: 'मैं बहुत ख़ुश हूँ।', tr: 'maĩ bahut xuś hũ.', de: 'Ich freue mich sehr.' },
  note: 'Zu einer Frau sagt man कैसी हैं, zu einem Mann कैसे हैं. Hunger und Durst „befallen“ dich: मुझे भूख लगी है.',
  exercises: [
    { t: 'match', items: ['khush', 'thakgayi', 'bhookh', 'bahut'] },
    { t: 'natural', situation: 'Es ist Mittag und du hast Hunger.', items: ['bhookhlagi'], options: [
      { hi: 'मुझे भूख लगी है।', ok: true, why: 'Hunger steht im Hindi mit मुझे.' },
      { hi: 'मैं भूख हूँ।', why: 'Das heißt „Ich bin Hunger“.' },
      { hi: 'मुझे पानी चाहिए।', why: 'Damit bittest du um Wasser.' } ] },
    { t: 'recall', item: 'khush' }
  ]
},
{
  id: 'l26', title: 'Mir geht es nicht gut', topic: 'Gefühle und Befinden',
  goal: 'sagen, dass es dir nicht gut geht und wo es weh tut.',
  new: ['tabiyat', 'sir', 'dard', 'mein'],
  dialog: [
    { who: 'Anjali', hi: 'आप ठीक हैं?', tr: 'āp ṭhīk haĩ?', de: 'Geht es Ihnen gut?' },
    { who: 'du', hi: 'नहीं, मेरी तबीयत ठीक नहीं है। सिर में दर्द है।', tr: 'nahĩ, merī tabīyat ṭhīk nahĩ hai. sir mẽ dard hai.', de: 'Nein, mir geht es nicht gut. Ich habe Kopfschmerzen.' }
  ],
  key: { hi: 'मेरी तबीयत ठीक नहीं है।', tr: 'merī tabīyat ṭhīk nahĩ hai.', de: 'Mir geht es nicht gut.' },
  note: 'तबीयत ist weiblich, deshalb मेरी तबीयत. Wörtlich sagt der Satz „Mein Befinden ist nicht gut“.',
  exercises: [
    { t: 'meaning', item: 'dard' },
    { t: 'order', hi: 'सिर में दर्द है।', tr: 'sir mẽ dard hai.', de: 'Ich habe Kopfschmerzen.', why: 'में steht nach dem Wort: सिर में, „im Kopf“.', items: ['sir', 'mein', 'dard'] },
    { t: 'cloze', hi: '___ तबीयत ठीक नहीं है।', tr: '___ tabīyat ṭhīk nahĩ hai.', de: 'Mir geht es nicht gut.', answer: 'मेरी', options: ['मेरी', 'मेरा'],
      why: { 'मेरा': 'तबीयत ist weiblich, deshalb मेरी.' }, items: ['tabiyat', 'meri'] }
  ]
},

/* ───────────── Reisen ───────────── */
{
  id: 'l27', title: 'Am Bahnhof', topic: 'Reisen',
  goal: 'am Bahnhof nach einem Zug fragen und eine Fahrkarte kaufen.',
  new: ['train', 'ticket', 'kab', 'dilli'],
  dialog: [
    { who: 'du', hi: 'दिल्ली की ट्रेन कब है?', tr: 'dillī kī ṭren kab hai?', de: 'Wann fährt der Zug nach Delhi?' },
    { who: 'Schalter', hi: 'नौ बजे।', tr: 'nau baje.', de: 'Um neun Uhr.' },
    { who: 'du', hi: 'एक टिकट, प्लीज़।', tr: 'ek ṭikaṭ, plīz.', de: 'Eine Fahrkarte, bitte.' }
  ],
  gloss: { 'की': 'von, nach (verbindet zwei Wörter)' },
  key: { hi: 'दिल्ली की ट्रेन कब है?', tr: 'dillī kī ṭren kab hai?', de: 'Wann fährt der Zug nach Delhi?' },
  note: 'Bei der Bahn sind englische Wörter wie ट्रेन, टिकट und स्टेशन ganz normales Hindi.',
  exercises: [
    { t: 'match', items: ['train', 'ticket', 'kab', 'dilli'] },
    { t: 'natural', situation: 'Du willst am Schalter eine Fahrkarte kaufen.', items: ['ticket'], options: [
      { hi: 'एक टिकट, प्लीज़।', ok: true, why: 'Kurz und am Schalter völlig üblich.' },
      { hi: 'टिकट कब है?', why: 'Damit fragst du, wann die Fahrkarte ist.' },
      { hi: 'ट्रेन कहाँ है?', why: 'Du fragst nach dem Zug, nicht nach einer Fahrkarte.' } ] },
    { t: 'listen', item: 'kab' }
  ],
  speak: { hi: 'ट्रेन कब है?', tr: 'ṭren kab hai?', de: 'Wann fährt der Zug?' }
},
{
  id: 'l28', title: 'Im Hotel', topic: 'Reisen',
  goal: 'im Hotel nach einem freien Zimmer fragen.',
  new: ['kamra', 'khaali', 'keliye'],
  dialog: [
    { who: 'du', hi: 'क्या कमरा ख़ाली है?', tr: 'kyā kamrā xālī hai?', de: 'Ist ein Zimmer frei?' },
    { who: 'Rezeption', hi: 'हाँ। कितने दिन के लिए?', tr: 'hã. kitne din ke lie?', de: 'Ja. Für wie viele Tage?' },
    { who: 'du', hi: 'दो रात के लिए।', tr: 'do rāt ke lie.', de: 'Für zwei Nächte.' }
  ],
  gloss: { 'दिन': 'Tag' },
  key: { hi: 'क्या कमरा ख़ाली है?', tr: 'kyā kamrā xālī hai?', de: 'Ist ein Zimmer frei?' },
  note: 'क्या am Satzanfang kündigt eine Ja-Nein-Frage an. Im Gespräch lassen es viele weg und heben nur die Stimme.',
  exercises: [
    { t: 'meaning', item: 'khaali' },
    { t: 'order', hi: 'क्या कमरा ख़ाली है?', tr: 'kyā kamrā xālī hai?', de: 'Ist ein Zimmer frei?', why: 'क्या eröffnet die Ja-Nein-Frage, है steht am Ende.', items: ['kamra', 'khaali'] },
    { t: 'cloze', hi: 'दो रात ___ लिए।', tr: 'do rāt ___ lie.', de: 'Für zwei Nächte.', answer: 'के', options: ['के', 'से', 'में'],
      why: { 'से': 'से heißt „aus, von“.', 'में': 'में heißt „in“.' }, items: ['keliye'] },
    { t: 'reverse', item: 'kamra' }
  ]
},

/* ───────────── Einfache Gespräche ───────────── */
{
  id: 'l29', title: 'Ich lerne Hindi', topic: 'Einfache Gespräche',
  goal: 'erzählen, dass dir Indien gefällt und du Hindi lernst.',
  new: ['pasand', 'hindi', 'seekh', 'bhi'],
  dialog: [
    { who: 'Raj', hi: 'आपको भारत पसंद है?', tr: 'āpko bhārat pasand hai?', de: 'Gefällt Ihnen Indien?' },
    { who: 'du', hi: 'हाँ, बहुत! मैं हिंदी भी सीख रही हूँ।', tr: 'hã, bahut! maĩ hindī bhī sīkh rahī hũ.', de: 'Ja, sehr! Ich lerne auch Hindi.' }
  ],
  gloss: { 'आपको': 'Ihnen' },
  key: { hi: 'मैं हिंदी सीख रही हूँ।', tr: 'maĩ hindī sīkh rahī hũ.', de: 'Ich lerne Hindi.' },
  note: 'Schon ein paar Sätze Hindi öffnen viele Gespräche. Die Freude darüber ist meist deutlich zu spüren.',
  exercises: [
    { t: 'order', hi: 'मैं हिंदी सीख रही हूँ।', tr: 'maĩ hindī sīkh rahī hũ.', de: 'Ich lerne Hindi.', why: 'सीख रही हूँ ist eine Einheit: „bin gerade am Lernen“. Sie steht geschlossen am Ende.', items: ['hindi', 'seekh'] },
    { t: 'natural', situation: 'Jemand fragt dich, ob dir Indien gefällt. Es gefällt dir sehr.', items: ['pasand', 'bahut'], options: [
      { hi: 'हाँ, बहुत!', ok: true, why: 'Kurz, herzlich und ganz natürlich.' },
      { hi: 'नहीं, बहुत!', why: 'नहीं verneint. Das widerspricht dem „sehr“.' },
      { hi: 'मुझे भूख लगी है।', why: 'Das heißt „Ich habe Hunger“.' } ] },
    { t: 'recall', item: 'pasand' }
  ]
},
{
  id: 'l30', title: 'Bitte langsamer', topic: 'Einfache Gespräche',
  goal: 'um langsameres Sprechen und eine Wiederholung bitten.',
  new: ['dheere', 'boliye', 'phirse', 'thodi'],
  dialog: [
    { who: 'Raj', hi: 'आप कहाँ से हैं?', tr: 'āp kahã se haĩ?', de: 'Woher kommen Sie?' },
    { who: 'du', hi: 'माफ़ कीजिए, धीरे बोलिए, प्लीज़। मुझे थोड़ी हिंदी आती है।', tr: 'māf kījie, dhīre bolie, plīz. mujhe thoṛī hindī ātī hai.', de: 'Entschuldigung, bitte sprechen Sie langsam. Ich kann ein bisschen Hindi.' },
    { who: 'Raj', hi: 'आप कहाँ से हैं?', tr: 'āp kahã se haĩ?', de: 'Woher kommen Sie?' },
    { who: 'du', hi: 'मैं जर्मनी से हूँ।', tr: 'maĩ jarmanī se hũ.', de: 'Ich komme aus Deutschland.' }
  ],
  gloss: { 'आती': '(es) kommt; mit मुझे: ich kann' },
  key: { hi: 'धीरे बोलिए, प्लीज़।', tr: 'dhīre bolie, plīz.', de: 'Bitte sprechen Sie langsam.' },
  note: 'मुझे थोड़ी हिंदी आती है heißt wörtlich „Mir kommt ein bisschen Hindi“. So sagt man, dass man eine Sprache kann.',
  exercises: [
    { t: 'match', items: ['dheere', 'boliye', 'phirse', 'thodi'] },
    { t: 'natural', situation: 'Dein Gegenüber spricht sehr schnell.', items: ['dheere', 'boliye'], options: [
      { hi: 'धीरे बोलिए, प्लीज़।', ok: true, why: 'Eine höfliche Bitte, langsamer zu sprechen.' },
      { hi: 'फिर मिलेंगे!', why: 'Damit verabschiedest du dich.' },
      { hi: 'धीरे जाइए।', why: 'जाइए heißt „gehen Sie“.' } ] },
    { t: 'natural', situation: 'Du hast einen Satz nicht verstanden.', items: ['phirse'], options: [
      { hi: 'फिर से बोलिए, प्लीज़।', ok: true, why: 'Du bittest darum, es noch einmal zu sagen.' },
      { hi: 'कोई बात नहीं।', why: 'Das antwortet auf einen Dank.' },
      { hi: 'ठीक है।', why: 'Damit signalisierst du, dass alles klar ist.' } ] }
  ]
}
);

/*
  Wortschatz der App
  ------------------
  Jeder Eintrag ist ein Wort oder eine feste Wendung, die in einer Lektion
  neu eingeführt wird. Lektionen verweisen über die id auf diese Einträge.

  Felder
    hi    Devanagari
    tr    Umschrift (ā ī ū lang, ã ĩ ũ ẽ nasal, ṭ ḍ ṛ retroflex, c = tsch, j = dsch, ś = sch)
    de    Bedeutung auf Deutsch
    cat   Wortgruppe (für sinnvolle Ablenker in Übungen)
    syn   optionale Gruppe gleichbedeutender Ausdrücke (werden nie gegeneinander abgefragt)
    hint  optionaler Aussprachehinweis
    note  optionaler Gebrauchshinweis
    lit   bei Wendungen: wörtliche Bedeutung jedes Wortes, für die Zerlegung Wort für Wort
    alt   optionale weitere Schreibungen, die die Spracherkennung liefern kann (z. B. englische Lehnwörter)
    audio optionaler Pfad zu einer eigenen Audiodatei (mp3/m4a), hat Vorrang vor der Browserstimme
*/
window.HINDI_ITEMS = {
  /* 1 Begrüßen: zuerst ganze Sätze, die Einzelwörter folgen in Lektion 2 */
  namaste:   { hi: 'नमस्ते', tr: 'namaste', de: 'Hallo, guten Tag', cat: 'greet', hint: 'Das t ist weich. Die Zungenspitze berührt die oberen Schneidezähne.' },
  aapkaise:  { lit: ['Sie', 'wie', 'sind'], hi: 'आप कैसे हैं?', tr: 'āp kaise haĩ?', de: 'Wie geht es Ihnen?', cat: 'phrase', hint: 'ai klingt in beiden Wörtern wie das ä in „Käse“. हैं endet leicht nasal.' },
  theekhoon: { lit: ['ich', 'gut', 'bin'], hi: 'मैं ठीक हूँ।', tr: 'maĩ ṭhīk hũ.', de: 'Mir geht es gut.', cat: 'phrase', hint: 'ṭh: Zungenspitze nach hinten biegen und einen Hauch folgen lassen. hũ ist ein langes, nasales u.' },

  /* 2 Ich und Sie */
  main:      { hi: 'मैं', tr: 'maĩ', de: 'ich', cat: 'person', hint: 'Wie „mä“ mit nasalem Ausklang.' },
  aap:       { hi: 'आप', tr: 'āp', de: 'Sie, du (höflich)', cat: 'person', hint: 'Langes ā wie in „Vater“.' },
  theek:     { hi: 'ठीक', tr: 'ṭhīk', de: 'gut, in Ordnung', cat: 'adj', hint: 'ṭh: Zungenspitze nach hinten biegen und einen Hauch folgen lassen.' },
  aur:       { hi: 'और', tr: 'aur', de: 'und', cat: 'link', hint: 'Klingt fast wie ein offenes „or“.' },

  /* 3 Ja und nein */
  haan:      { hi: 'हाँ', tr: 'hã', de: 'ja', cat: 'answer', hint: 'Ein langes, nasales a.' },
  nahin:     { hi: 'नहीं', tr: 'nahĩ', de: 'nein, nicht', cat: 'answer', hint: 'Die Betonung liegt auf dem langen, nasalen ĩ am Ende.' },
  hai:       { hi: 'है', tr: 'hai', de: 'ist', cat: 'verb', hint: 'Gesprochen wie „hä“.' },
  theekhai:  { lit: ['gut', 'ist'], hi: 'ठीक है', tr: 'ṭhīk hai', de: 'okay, in Ordnung', cat: 'phrase' },

  /* 4 Danke */
  dhanyavaad:{ hi: 'धन्यवाद', tr: 'dhanyavād', de: 'danke (förmlich)', cat: 'polite', syn: 'thanks', hint: 'dh ist ein d mit hörbarem Hauch.' },
  shukriya:  { hi: 'शुक्रिया', tr: 'śukriyā', de: 'danke (alltäglich)', cat: 'polite', syn: 'thanks', hint: 'ś wie „sch“, das r kurz gerollt.' },
  bahut:     { hi: 'बहुत', tr: 'bahut', de: 'sehr, viel', cat: 'adv', hint: 'Das h ist kaum hörbar, fast „ba-ut“.' },
  koibaat:   { lit: ['irgendeine', 'Sache', 'nicht'], hi: 'कोई बात नहीं', tr: 'koī bāt nahĩ', de: 'keine Ursache, kein Problem', cat: 'phrase' },

  /* 5 Sich vorstellen */
  mera:      { hi: 'मेरा', tr: 'merā', de: 'mein', cat: 'person', hint: 'Das r wird mit der Zungenspitze einmal getippt.' },
  naam:      { hi: 'नाम', tr: 'nām', de: 'Name', cat: 'noun' },
  aapka:     { hi: 'आपका', tr: 'āpkā', de: 'Ihr, dein (höflich)', cat: 'person' },
  kya:       { hi: 'क्या', tr: 'kyā', de: 'was', cat: 'question', hint: 'k und y verschmelzen zu einer Silbe: „kjaa“.' },

  /* 6 Herkunft */
  kahan:     { hi: 'कहाँ', tr: 'kahã', de: 'wo', cat: 'question' },
  se:        { hi: 'से', tr: 'se', de: 'aus, von', cat: 'link' },
  jarmani:   { hi: 'जर्मनी', tr: 'jarmanī', de: 'Deutschland', cat: 'place', alt: ['germany', 'जर्मन'] },
  bharat:    { hi: 'भारत', tr: 'bhārat', de: 'Indien', cat: 'place', hint: 'bh ist ein b mit Hauch.', alt: ['india', 'इंडिया'] },

  /* 7 Verabschieden */
  achha:     { hi: 'अच्छा', tr: 'acchā', de: 'gut, also, aha', cat: 'interj', hint: 'cch ist ein verdoppeltes „tsch“ mit Hauch: „atsch-tschaa“.' },
  phir:      { hi: 'फिर', tr: 'phir', de: 'wieder, dann', cat: 'adv', hint: 'Ein p mit Hauch. Viele sprechen es heute wie f.' },
  milenge:   { hi: 'मिलेंगे', tr: 'milẽge', de: '(wir) sehen uns', cat: 'verb' },
  chalti:    { lit: ['gehend', 'bin'], hi: 'चलती हूँ', tr: 'caltī hũ', de: 'ich gehe dann (als Frau)', cat: 'phrase', note: 'Ein Mann sagt चलता हूँ.' },

  /* 8 Etwas möchten */
  paani:     { hi: 'पानी', tr: 'pānī', de: 'Wasser', cat: 'drink' },
  chai:      { hi: 'चाय', tr: 'cāy', de: 'Tee', cat: 'drink', alt: ['chai'] },
  mujhe:     { hi: 'मुझे', tr: 'mujhe', de: 'mir, mich', cat: 'person', hint: 'jh ist ein „dsch“ mit Hauch.' },
  chahiye:   { hi: 'चाहिए', tr: 'cāhie', de: 'wird gebraucht, hätte gern', cat: 'verb' },

  /* 9 Essen */
  khaana:    { hi: 'खाना', tr: 'khānā', de: 'Essen; essen', cat: 'food', hint: 'kh ist ein k mit Hauch, kein ch wie in „Bach“.' },
  roti:      { hi: 'रोटी', tr: 'roṭī', de: 'Fladenbrot', cat: 'food', alt: ['roti'] },
  chaawal:   { hi: 'चावल', tr: 'cāval', de: 'Reis', cat: 'food' },
  daal:      { hi: 'दाल', tr: 'dāl', de: 'Linsen, Linsengericht', cat: 'food', alt: ['dal'] },

  /* 10 Zahlen 1 bis 4 */
  ek:        { hi: 'एक', tr: 'ek', de: 'eins, ein', cat: 'num', alt: ['1', '१'] },
  do:        { hi: 'दो', tr: 'do', de: 'zwei', cat: 'num', alt: ['2', '२'] },
  teen:      { hi: 'तीन', tr: 'tīn', de: 'drei', cat: 'num', alt: ['3', '३'] },
  chaar:     { hi: 'चार', tr: 'cār', de: 'vier', cat: 'num', alt: ['4', '४'] },

  /* 11 Zahlen 5 bis 10 */
  paanch:    { hi: 'पाँच', tr: 'pãc', de: 'fünf', cat: 'num', alt: ['5', '५'] },
  chhah:     { hi: 'छह', tr: 'chah', de: 'sechs', cat: 'num', hint: 'ch ist ein „tsch“ mit kräftigem Hauch.', alt: ['6', '६', 'छः'] },
  saat:      { hi: 'सात', tr: 'sāt', de: 'sieben', cat: 'num', alt: ['7', '७'] },
  das:       { hi: 'दस', tr: 'das', de: 'zehn', cat: 'num', alt: ['10', '१०'] },

  /* 12 Café */
  coffee:    { hi: 'कॉफ़ी', tr: 'kŏfī', de: 'Kaffee', cat: 'drink', hint: 'ŏ ist ein offenes o wie in „Koffer“.', alt: ['coffee', 'कॉफी'] },
  doodh:     { hi: 'दूध', tr: 'dūdh', de: 'Milch', cat: 'drink' },
  cheeni:    { hi: 'चीनी', tr: 'cīnī', de: 'Zucker', cat: 'food' },
  please:    { hi: 'प्लीज़', tr: 'plīz', de: 'bitte (alltäglich)', cat: 'polite', alt: ['please', 'प्लीज'] },

  /* 13 Restaurant */
  laiye:     { hi: 'लाइए', tr: 'lāie', de: 'bringen Sie bitte', cat: 'verb' },
  bill:      { hi: 'बिल', tr: 'bil', de: 'Rechnung', cat: 'noun', alt: ['bill'] },
  menu:      { hi: 'मेनू', tr: 'menū', de: 'Speisekarte', cat: 'noun', alt: ['menu', 'मेन्यू'] },
  ekaur:     { lit: ['ein', 'noch'], hi: 'एक और', tr: 'ek aur', de: 'noch ein, noch eine', cat: 'phrase' },

  /* 14 Geschmack */
  teekha:    { hi: 'तीखा', tr: 'tīkhā', de: 'scharf', cat: 'adj' },
  kam:       { hi: 'कम', tr: 'kam', de: 'weniger, wenig', cat: 'adv' },
  thoda:     { hi: 'थोड़ा', tr: 'thoṛā', de: 'ein bisschen', cat: 'adv', hint: 'ṛ: Die Zunge schnellt von hinten kurz nach vorn.' },
  badhiya:   { hi: 'बढ़िया', tr: 'baṛhiyā', de: 'super, prima', cat: 'adj' },

  /* 15 Einkaufen */
  yah:       { hi: 'यह', tr: 'yah', de: 'das, dies', cat: 'person', hint: 'Im Alltag oft wie „ye“ gesprochen.' },
  kitneka:   { lit: ['wie viel', 'von'], hi: 'कितने का', tr: 'kitne kā', de: 'für wie viel, was kostet', cat: 'phrase' },
  rupaye:    { hi: 'रुपये', tr: 'rupaye', de: 'Rupien', cat: 'noun', alt: ['rupees', 'रुपए', 'rupee'] },
  sau:       { hi: 'सौ', tr: 'sau', de: 'hundert', cat: 'num', hint: 'au klingt wie ein offenes o.', alt: ['100', '१००'] },

  /* 16 Handeln */
  mahanga:   { hi: 'महँगा', tr: 'mahãgā', de: 'teuer', cat: 'adj' },
  sasta:     { hi: 'सस्ता', tr: 'sastā', de: 'billig', cat: 'adj' },
  kijiye:    { hi: 'कीजिए', tr: 'kījie', de: 'machen Sie bitte', cat: 'verb' },

  /* 17 Orientierung */
  station:   { hi: 'स्टेशन', tr: 'sṭeśan', de: 'Bahnhof', cat: 'place', alt: ['station'] },
  yahan:     { hi: 'यहाँ', tr: 'yahã', de: 'hier', cat: 'place' },
  door:      { hi: 'दूर', tr: 'dūr', de: 'weit, fern', cat: 'adj' },
  maaf:      { lit: ['Verzeihung', 'machen Sie'], hi: 'माफ़ कीजिए', tr: 'māf kījie', de: 'Entschuldigung', cat: 'phrase', alt: ['excuse me', 'माफ कीजिए'] },

  /* 18 Richtung */
  seedha:    { hi: 'सीधा', tr: 'sīdhā', de: 'geradeaus', cat: 'dir' },
  daen:      { hi: 'दाएँ', tr: 'dāẽ', de: 'rechts', cat: 'dir' },
  baen:      { hi: 'बाएँ', tr: 'bāẽ', de: 'links', cat: 'dir' },
  jaiye:     { hi: 'जाइए', tr: 'jāie', de: 'gehen Sie, fahren Sie', cat: 'verb' },

  /* 19 Taxi */
  bhaiya:    { hi: 'भैया', tr: 'bhaiyā', de: 'Bruder (freundliche Anrede)', cat: 'person' },
  chaliye:   { hi: 'चलिए', tr: 'calie', de: 'fahren wir, los geht’s', cat: 'verb' },
  rukiye:    { hi: 'रुकिए', tr: 'rukie', de: 'halten Sie an', cat: 'verb' },
  yaheen:    { hi: 'यहीं', tr: 'yahĩ', de: 'genau hier', cat: 'place' },

  /* 20 Uhrzeit */
  aath:      { hi: 'आठ', tr: 'āṭh', de: 'acht', cat: 'num', alt: ['8', '८'] },
  nau:       { hi: 'नौ', tr: 'nau', de: 'neun', cat: 'num', alt: ['9', '९'] },
  baje:      { hi: 'बजे', tr: 'baje', de: 'Uhr (bei Uhrzeiten)', cat: 'time' },
  abhi:      { hi: 'अभी', tr: 'abhī', de: 'jetzt, gerade', cat: 'time' },

  /* 21 Geschwister */
  bhai:      { hi: 'भाई', tr: 'bhāī', de: 'Bruder', cat: 'family' },
  bahan:     { hi: 'बहन', tr: 'bahan', de: 'Schwester', cat: 'family' },
  meri:      { hi: 'मेरी', tr: 'merī', de: 'meine (bei weiblichen Wörtern)', cat: 'person' },

  /* 22 Familie */
  maa:       { hi: 'माँ', tr: 'mã', de: 'Mutter', cat: 'family' },
  papa:      { hi: 'पापा', tr: 'pāpā', de: 'Papa', cat: 'family', alt: ['papa'] },
  dost:      { hi: 'दोस्त', tr: 'dost', de: 'Freund, Freundin', cat: 'family' },
  pati:      { hi: 'पति', tr: 'pati', de: 'Ehemann', cat: 'family' },

  /* 23 Zeit */
  aaj:       { hi: 'आज', tr: 'āj', de: 'heute', cat: 'time' },
  kal:       { hi: 'कल', tr: 'kal', de: 'morgen; gestern', cat: 'time' },
  subah:     { hi: 'सुबह', tr: 'subah', de: 'Morgen, morgens', cat: 'time' },
  raat:      { hi: 'रात', tr: 'rāt', de: 'Nacht, Abend', cat: 'time' },

  /* 24 Tagesablauf */
  kaam:      { hi: 'काम', tr: 'kām', de: 'Arbeit', cat: 'noun' },
  ghar:      { hi: 'घर', tr: 'ghar', de: 'Zuhause, Haus', cat: 'place' },
  jaati:     { lit: ['gehend', 'bin'], hi: 'जाती हूँ', tr: 'jātī hũ', de: 'ich gehe (als Frau)', cat: 'phrase', note: 'Ein Mann sagt जाता हूँ.' },
  par:       { hi: 'पर', tr: 'par', de: 'zu, auf', cat: 'link' },

  /* 25 Gefühle */
  khush:     { hi: 'ख़ुश', tr: 'xuś', de: 'froh, glücklich', cat: 'feel', hint: 'x klingt wie das ch in „Bach“.', alt: ['खुश'] },
  thakgayi:  { lit: ['müde', 'geworden', 'bin'], hi: 'थक गई हूँ', tr: 'thak gaī hũ', de: 'ich bin müde (als Frau)', cat: 'phrase', note: 'Ein Mann sagt थक गया हूँ.' },
  bhookh:    { hi: 'भूख', tr: 'bhūkh', de: 'Hunger', cat: 'feel' },
  bhookhlagi:{ lit: ['mir', 'Hunger', 'angekommen', 'ist'], hi: 'मुझे भूख लगी है', tr: 'mujhe bhūkh lagī hai', de: 'ich habe Hunger', cat: 'phrase' },

  /* 26 Befinden */
  tabiyat:   { hi: 'तबीयत', tr: 'tabīyat', de: 'Befinden, Gesundheit', cat: 'feel', alt: ['तबियत'] },
  sir:       { hi: 'सिर', tr: 'sir', de: 'Kopf', cat: 'body' },
  dard:      { hi: 'दर्द', tr: 'dard', de: 'Schmerz', cat: 'body' },
  mein:      { hi: 'में', tr: 'mẽ', de: 'in', cat: 'link' },

  /* 27 Bahn */
  train:     { hi: 'ट्रेन', tr: 'ṭren', de: 'Zug', cat: 'travel', alt: ['train'] },
  ticket:    { hi: 'टिकट', tr: 'ṭikaṭ', de: 'Fahrkarte, Ticket', cat: 'travel', alt: ['ticket'] },
  kab:       { hi: 'कब', tr: 'kab', de: 'wann', cat: 'question' },
  dilli:     { hi: 'दिल्ली', tr: 'dillī', de: 'Delhi', cat: 'place', alt: ['delhi'] },

  /* 28 Hotel */
  kamra:     { hi: 'कमरा', tr: 'kamrā', de: 'Zimmer', cat: 'travel', alt: ['room'] },
  khaali:    { hi: 'ख़ाली', tr: 'xālī', de: 'frei, leer', cat: 'adj', alt: ['खाली'] },
  keliye:    { lit: ['(verbindet)', 'für'], hi: 'के लिए', tr: 'ke lie', de: 'für', cat: 'link' },

  /* 29 Smalltalk */
  pasand:    { hi: 'पसंद', tr: 'pasand', de: 'gefallen, mögen', cat: 'feel' },
  hindi:     { hi: 'हिंदी', tr: 'hindī', de: 'Hindi', cat: 'noun', alt: ['hindi', 'हिन्दी'] },
  seekh:     { lit: ['lernen', 'gerade', 'bin'], hi: 'सीख रही हूँ', tr: 'sīkh rahī hũ', de: 'ich lerne gerade (als Frau)', cat: 'phrase', note: 'Ein Mann sagt सीख रहा हूँ.' },
  bhi:       { hi: 'भी', tr: 'bhī', de: 'auch', cat: 'adv' },

  /* 30 Gespräch */
  dheere:    { hi: 'धीरे', tr: 'dhīre', de: 'langsam', cat: 'adv' },
  boliye:    { hi: 'बोलिए', tr: 'bolie', de: 'sprechen Sie', cat: 'verb' },
  phirse:    { lit: ['wieder', 'von'], hi: 'फिर से', tr: 'phir se', de: 'noch einmal', cat: 'phrase' },
  thodi:     { hi: 'थोड़ी', tr: 'thoṛī', de: 'ein bisschen (bei weiblichen Wörtern)', cat: 'adv' }
};

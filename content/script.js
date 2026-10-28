/*
  Schrift-Strang
  ---------------
  Devanagari wird erst eingeführt, wenn genug Wörter mündlich sitzen. Ab Lektion startLesson
  kommt pro Lektion ein Schriftmoment dazu, in dieser Reihenfolge. Weitere Einheiten einfach anhängen.

  focus  Zeichen (mehrere durch Leerzeichen getrennt)
  sound  Lautwert
  text   kurze Erklärung
  task   find: in welchem bekannten Wort steckt das Zeichen; read: ein Wort aus bekannten Zeichen lesen
*/
window.HINDI_SCRIPT = {
  startLesson: 11,
  units: [
    {"focus":"न","sound":"n","text":"न klingt wie n. Die Linie oben verbindet alle Zeichen eines Wortes.","task":{"t":"find","options":["नमस्ते","आप","कैसे"],"answer":"नमस्ते"}},
    {"focus":"म","sound":"m","text":"म ist m. Du kennst es aus नमस्ते und मैं.","task":{"t":"find","options":["मैं","ठीक","और"],"answer":"मैं"}},
    {"focus":"ह","sound":"h","text":"ह ist h. Es steckt in हाँ, है, हूँ und हैं.","task":{"t":"find","options":["हाँ","ठीक","और"],"answer":"हाँ"}},
    {"focus":"ा","sound":"ā","text":"Der senkrechte Strich ा nach einem Zeichen macht den Vokal lang. Aus न wird ना.","task":{"t":"find","options":["धन्यवाद","बहुत","मैं"],"answer":"धन्यवाद"}},
    {"focus":"क","sound":"k","text":"क ist ein k ohne Hauch. Du findest es in आपका und क्या.","task":{"t":"read","word":"काम","options":["kām","mān","kam"],"answer":"kām","after":"काम heißt „Arbeit“. Du hast es gerade aus bekannten Zeichen gelesen."}},
    {"focus":"स","sound":"s","text":"स ist ein scharfes s, nie ein summendes.","task":{"t":"find","options":["से","मैं","क्या"],"answer":"से"}},
    {"focus":"े","sound":"e","text":"Das Häkchen े über einem Zeichen ergibt e. स und े werden zu से.","task":{"t":"find","options":["मिलेंगे","नहीं","हाँ"],"answer":"मिलेंगे"}},
    {"focus":"प ी","sound":"p, ī","text":"प ist p. Das Zeichen ी steht nach dem Buchstaben und ergibt ein langes ī.","task":{"t":"read","word":"पानी","options":["pānī","panī","nīpā"],"answer":"pānī"}},
    {"focus":"द ल","sound":"d, l","text":"द ist ein weiches d an den Zähnen, ल ist l.","task":{"t":"read","word":"दाल","options":["dāl","lād","dal"],"answer":"dāl"}},
    {"focus":"च र","sound":"c, r","text":"च ist „tsch“, र ein kurz getipptes r.","task":{"t":"read","word":"चार","options":["cār","rāc","cal"],"answer":"cār"}},
    {"focus":"त","sound":"t","text":"त ist ein weiches t mit der Zunge an den Zähnen.","task":{"t":"read","word":"सात","options":["sāt","tās","sat"],"answer":"sāt"}},
    {"focus":"ू ँ","sound":"ū, Nasal","text":"ू unter dem Zeichen ergibt ein langes ū. Der Bogen mit Punkt ँ lässt den Vokal durch die Nase klingen.","task":{"t":"read","word":"हूँ","options":["hũ","hĩ","hã"],"answer":"hũ"}},
    {"focus":"ि ब","sound":"i, b","text":"Das Zeichen ि wird vor den Buchstaben geschrieben, aber nach ihm gesprochen. ब ist b.","task":{"t":"read","word":"बिल","options":["bil","lib","bīl"],"answer":"bil"}},
    {"focus":"ो","sound":"o","text":"ो, ein Strich mit Häkchen nach dem Zeichen, ergibt o.","task":{"t":"read","word":"दो","options":["do","de","dā"],"answer":"do"}},
    {"focus":"य","sound":"y","text":"य klingt wie das deutsche j in „ja“.","task":{"t":"read","word":"यह","options":["yah","hay","yā"],"answer":"yah"}},
    {"focus":"ै ं","sound":"ai, Nasal","text":"Zwei Häkchen ै ergeben ai, gesprochen wie ä. Der Punkt ं darüber macht den Laut nasal.","task":{"t":"read","word":"हैं","options":["haĩ","hẽ","hã"],"answer":"haĩ"}},
    {"focus":"्","sound":"Verbindung","text":"Hat ein Zeichen keinen eigenen Vokal, wird es halbiert und mit dem nächsten verbunden. स् und त werden zu स्त.","task":{"t":"read","word":"नमस्ते","options":["namaste","namsate","nāmaste"],"answer":"namaste","after":"Damit hast du dein erstes Wort vollständig Zeichen für Zeichen gelesen."}},
    {"focus":"आ","sound":"ā","text":"Am Wortanfang steht ein Vokal als eigener Buchstabe. आ ist das lange ā, etwa in आप.","task":{"t":"read","word":"आप","options":["āp","pā","ap"],"answer":"āp"}},
    {"focus":"भ","sound":"bh","text":"भ ist ein b mit Hauch. Ohne Hauch wäre es ब.","task":{"t":"read","word":"भारत","options":["bhārat","bārat","bhatār"],"answer":"bhārat"}},
    {"focus":"ज","sound":"j","text":"ज klingt wie „dsch“ in „Dschungel“.","task":{"t":"read","word":"बजे","options":["baje","jabe","bajā"],"answer":"baje"}},
    {"focus":"ए","sound":"e","text":"ए ist das e am Wortanfang, etwa in एक.","task":{"t":"read","word":"एक","options":["ek","ke","ak"],"answer":"ek"}},
    {"focus":"ध थ","sound":"dh, th","text":"ध ist d mit Hauch, थ ist t mit Hauch. Beide gibt es im Deutschen nicht als eigene Laute.","task":{"t":"read","word":"दूध","options":["dūdh","dhūd","dūd"],"answer":"dūdh"}},
    {"focus":"ु","sound":"u","text":"Das kurze u ु hängt unten am Zeichen, wie in सुबह.","task":{"t":"read","word":"सुबह","options":["subah","sūbah","sabuh"],"answer":"subah"}},
    {"focus":"घ","sound":"gh","text":"घ ist ein g mit Hauch.","task":{"t":"read","word":"घर","options":["ghar","gar","hagr"],"answer":"ghar"}},
    {"focus":"ख","sound":"kh","text":"ख ist ein k mit Hauch. Mit Punkt darunter, ख़, klingt es wie ch in „Bach“.","task":{"t":"read","word":"भूख","options":["bhūkh","khūbh","bhūk"],"answer":"bhūkh"}},
    {"focus":"फ ़","sound":"ph, f","text":"फ ist p mit Hauch. Der Punkt ़ verändert den Laut: फ़ ist f, ज़ ist z.","task":{"t":"read","word":"माफ़","options":["māf","māph","fām"],"answer":"māf"}},
    {"focus":"ट","sound":"ṭ","text":"ट ist ein t mit zurückgebogener Zunge. Englische t werden im Hindi meist so gesprochen.","task":{"t":"read","word":"टिकट","options":["ṭikaṭ","kiṭaṭ","ṭīkaṭ"],"answer":"ṭikaṭ"}},
    {"focus":"श","sound":"ś","text":"श klingt wie „sch“.","task":{"t":"read","word":"ख़ुश","options":["xuś","kuś","xūs"],"answer":"xuś"}},
    {"focus":"ड़","sound":"ṛ","text":"ड़ entsteht, wenn die zurückgebogene Zunge kurz nach vorn schnellt. Es klingt zwischen r und d.","task":{"t":"read","word":"थोड़ा","options":["thoṛā","ṭhorā","thodā"],"answer":"thoṛā"}},
    {"focus":"ध ी र े","sound":"Wiederholung","text":"Alles, was du für dieses Wort brauchst, kennst du schon.","task":{"t":"read","word":"धीरे","options":["dhīre","dīre","dhire"],"answer":"dhīre"}}
  ]
};

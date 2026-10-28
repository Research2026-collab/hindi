/*
  Spielerische Elemente
  ---------------------
  Rollenspiele: kleine Alltagsszenen. Die Gegenseite spricht, du wählst die passende Antwort.
    after   id der Lektion, nach der die Szene freigeschaltet wird (alle Wörter müssen bis dahin bekannt sein)
    turns   who/hi/tr/de: Zeile der Gegenseite (optional), scene: Erzähltext, choices: Antworten (eine mit ok: true)
    end     Schlusszeile der Gegenseite
  Postkarten: kleine Kulturnotizen, die sich nach einer Lektion öffnen.
  tools/validate.mjs prüft, dass jede Szene nur bekannte Wörter verwendet.
*/
window.HINDI_ROLEPLAYS = [
{
  id: 'zug', title: 'Im Zug', after: 'l07',
  intro: 'Du sitzt im Zug nach Jaipur. Neben dir sitzt Raj und lächelt dich an.',
  partner: 'Raj',
  turns: [
    { hi: 'नमस्ते!', tr: 'namaste!', de: 'Hallo!', choices: [
      { hi: 'नमस्ते! आप कैसे हैं?', ok: true },
      { hi: 'धन्यवाद।', why: 'Raj hat dich nur begrüßt. Für einen Dank gibt es keinen Anlass.' } ] },
    { hi: 'मैं ठीक हूँ। आपका नाम क्या है?', tr: 'maĩ ṭhīk hũ. āpkā nām kyā hai?', de: 'Mir geht es gut. Wie heißen Sie?', choices: [
      { hi: 'मेरा नाम {name} है।', ok: true },
      { hi: 'मैं जर्मनी से हूँ।', why: 'Raj hat nach deinem Namen gefragt, nicht nach deiner Herkunft.' } ] },
    { hi: 'आप कहाँ से हैं?', tr: 'āp kahã se haĩ?', de: 'Woher kommen Sie?', choices: [
      { hi: 'मैं ठीक हूँ।', why: 'Das beantwortet die Frage nach dem Befinden. Raj schaut dich fragend an.' },
      { hi: 'मैं जर्मनी से हूँ।', ok: true } ] },
    { hi: 'अच्छा! बहुत अच्छा।', tr: 'acchā! bahut acchā.', de: 'Ah, schön! Sehr schön.', scene: 'Der Zug hält. Hier musst du aussteigen.', choices: [
      { hi: 'कोई बात नहीं।', why: 'So antwortest du auf einen Dank. Raj hat sich aber gar nicht bedankt.' },
      { hi: 'अच्छा, चलती हूँ। फिर मिलेंगे!', ok: true } ] }
  ],
  end: { hi: 'फिर मिलेंगे!', tr: 'phir milẽge!', de: 'Bis bald!' }
},
{
  id: 'chai', title: 'Am Chai-Stand', after: 'l14',
  intro: 'Am Straßenrand kocht ein Chaiwala Tee in einem großen Topf. Es duftet nach Kardamom.',
  partner: 'Chaiwala',
  turns: [
    { hi: 'नमस्ते! चाय?', tr: 'namaste! cāy?', de: 'Hallo! Tee?', choices: [
      { hi: 'हाँ, एक चाय, प्लीज़।', ok: true },
      { hi: 'बिल लाइए, प्लीज़।', why: 'Du hast noch gar nichts bestellt. Der Chaiwala lacht.' } ] },
    { hi: 'दूध और चीनी?', tr: 'dūdh aur cīnī?', de: 'Milch und Zucker?', choices: [
      { hi: 'एक और चाय, प्लीज़।', why: 'Du hast den ersten Tee noch nicht einmal bekommen.' },
      { hi: 'हाँ, थोड़ा कम चीनी, प्लीज़।', ok: true } ] },
    { hi: 'चाय ठीक है?', tr: 'cāy ṭhīk hai?', de: 'Ist der Tee in Ordnung?', scene: 'Der Tee ist heiß und duftet.', choices: [
      { hi: 'हाँ, बहुत बढ़िया है!', ok: true },
      { hi: 'नहीं, मैं ठीक हूँ।', why: 'Das klingt, als würdest du den Tee ablehnen und über dich sprechen.' } ] },
    { scene: 'Du trinkst aus und möchtest dich bedanken.', choices: [
      { hi: 'मेनू लाइए, प्लीज़।', why: 'Ein Chai-Stand hat keine Speisekarte.' },
      { hi: 'बहुत शुक्रिया!', ok: true } ] }
  ],
  end: { hi: 'कोई बात नहीं। फिर मिलेंगे!', tr: 'koī bāt nahĩ. phir milẽge!', de: 'Gern geschehen. Bis bald!' }
},
{
  id: 'markt', title: 'Auf dem Markt', after: 'l16',
  intro: 'Auf dem Basar hängen bunte Tücher. Eines gefällt dir besonders.',
  partner: 'Händler',
  turns: [
    { scene: 'Du möchtest wissen, was das Tuch kostet.', choices: [
      { hi: 'यह कितने का है?', ok: true },
      { hi: 'आप कहाँ से हैं?', why: 'Eine nette Frage, aber der Preis bleibt offen.' } ] },
    { hi: 'पाँच सौ रुपये।', tr: 'pãc sau rupaye.', de: 'Fünfhundert Rupien.', choices: [
      { hi: 'बहुत सस्ता है!', why: 'Damit lobst du den Preis. Der Händler bleibt bei fünfhundert.' },
      { hi: 'बहुत महँगा है! थोड़ा कम कीजिए।', ok: true } ] },
    { hi: 'ठीक है, चार सौ।', tr: 'ṭhīk hai, cār sau.', de: 'Gut, vierhundert.', choices: [
      { hi: 'तीन सौ?', ok: true },
      { hi: 'दस रुपये!', why: 'So wenig, dass der Händler nur den Kopf schüttelt und lacht.' } ] },
    { hi: 'अच्छा, ठीक है। तीन सौ।', tr: 'acchā, ṭhīk hai. tīn sau.', de: 'Also gut. Dreihundert.', choices: [
      { hi: 'बहुत शुक्रिया!', ok: true },
      { hi: 'नहीं।', why: 'Ihr habt euch gerade geeinigt. Jetzt abzulehnen wäre unhöflich.' } ] }
  ],
  end: { hi: 'धन्यवाद! फिर मिलेंगे।', tr: 'dhanyavād! phir milẽge.', de: 'Danke! Bis bald.' }
},
{
  id: 'rikscha', title: 'Mit der Rikscha', after: 'l19',
  intro: 'Vor dem Hotel wartet eine Auto-Rikscha. Du willst zum Bahnhof.',
  partner: 'Fahrer',
  turns: [
    { hi: 'कहाँ?', tr: 'kahã?', de: 'Wohin?', choices: [
      { hi: 'भैया, यहीं रुकिए।', why: 'Ihr seid noch gar nicht losgefahren.' },
      { hi: 'भैया, स्टेशन चलिए।', ok: true } ] },
    { hi: 'सौ रुपये।', tr: 'sau rupaye.', de: 'Hundert Rupien.', choices: [
      { hi: 'ठीक है, चलिए।', ok: true },
      { hi: 'मेनू लाइए, प्लीज़।', why: 'Du sitzt in einer Rikscha, nicht im Restaurant.' } ] },
    { scene: 'Ihr seid fast da. Rechts siehst du schon den Bahnhof.', choices: [
      { hi: 'भैया, सीधा जाइए।', why: 'Dann fahrt ihr am Bahnhof vorbei.' },
      { hi: 'भैया, यहीं रुकिए।', ok: true } ] },
    { hi: 'ठीक है। सौ रुपये।', tr: 'ṭhīk hai. sau rupaye.', de: 'In Ordnung. Hundert Rupien.', choices: [
      { hi: 'बहुत शुक्रिया, भैया!', ok: true },
      { hi: 'आप कैसे हैं?', why: 'Ein bisschen spät für diese Frage. Der Fahrer muss grinsen.' } ] }
  ],
  end: { hi: 'धन्यवाद!', tr: 'dhanyavād!', de: 'Danke!' }
},
{
  id: 'anjali', title: 'Ein längeres Gespräch', after: 'l30',
  intro: 'Bei einer Hochzeit sitzt du neben Anjali. Sie ist neugierig und spricht schnell.',
  partner: 'Anjali',
  turns: [
    { hi: 'आप कहाँ से हैं?', tr: 'āp kahã se haĩ?', de: 'Woher kommen Sie?', choices: [
      { hi: 'मैं जर्मनी से हूँ।', ok: true },
      { hi: 'मैं ठीक हूँ।', why: 'Anjali wollte wissen, woher du kommst.' } ] },
    { hi: 'क्या आपका भाई है?', tr: 'kyā āpkā bhāī hai?', de: 'Haben Sie einen Bruder?', scene: 'Anjali spricht so schnell, dass du kaum etwas verstehst.', choices: [
      { hi: 'फिर मिलेंगे!', why: 'Damit würdest du das Gespräch einfach beenden.' },
      { hi: 'धीरे बोलिए, प्लीज़।', ok: true } ] },
    { hi: 'क्या आपका भाई है?', tr: 'kyā āpkā bhāī hai?', de: 'Haben Sie einen Bruder?', scene: 'Jetzt ganz langsam.', choices: [
      { hi: 'हाँ, मेरा एक भाई है।', ok: true },
      { hi: 'हाँ, मेरी एक भाई है।', why: 'भाई ist männlich, deshalb heißt es मेरा.' } ] },
    { hi: 'आप हिंदी सीख रही हैं?', tr: 'āp hindī sīkh rahī haĩ?', de: 'Lernen Sie Hindi?', choices: [
      { hi: 'नहीं, मुझे भूख लगी है।', why: 'Das kommt überraschend. Anjali muss lachen und reicht dir einen Teller.' },
      { hi: 'हाँ, मैं हिंदी सीख रही हूँ।', ok: true } ] }
  ],
  end: { hi: 'बहुत अच्छा! फिर मिलेंगे।', tr: 'bahut acchā! phir milẽge.', de: 'Sehr schön! Bis bald.' }
}
];

window.HINDI_POSTCARDS = [
  { after: 'l05', hi: 'नमस्ते', tr: 'namaste', title: 'Eine Verbeugung vor dir',
    text: 'नमस्ते stammt aus dem Sanskrit. namas bedeutet Verbeugung, te heißt dir. Der Gruß ist also wörtlich eine kleine Verbeugung vor dem Gegenüber.' },
  { after: 'l10', hi: 'चायवाला', tr: 'cāyvālā', title: 'Der Chai-Mann',
    text: 'Chai wird meist mit Milch, viel Zucker und Gewürzen wie Kardamom oder Ingwer gekocht. Wer ihn am Straßenrand verkauft, heißt चायवाला. Die Endung -वाला bezeichnet jemanden, der mit etwas zu tun hat.' },
  { after: 'l15', hi: 'रुपया', tr: 'rupayā', title: 'Silbergeld',
    text: 'Das Wort Rupie geht auf Sanskrit rūpya zurück, das mit Silber in Verbindung steht. Seit 2010 hat die indische Rupie ein eigenes Zeichen, das ₹.' },
  { after: 'l20', hi: 'भैया · दीदी', tr: 'bhaiyā · dīdī', title: 'Fremde als Familie',
    text: 'Im Alltag spricht man Fremde gern mit Verwandtschaftswörtern an: भैया für Männer, दीदी für Frauen, ältere Menschen mit अंकल und आंटी. Das klingt freundlich und ist ganz normal.' },
  { after: 'l25', hi: 'हिंग्लिश', tr: 'hinglish', title: 'Hindi mit Englisch',
    text: 'Viele Menschen in den Städten mischen Hindi und Englisch im selben Satz. Wörter wie ट्रेन, टिकट oder प्लीज़ gehören ganz selbstverständlich zum gesprochenen Hindi.' },
  { after: 'l30', hi: 'हिंदी · उर्दू', tr: 'hindī · urdū', title: 'Zwei Schriften, eine Alltagssprache',
    text: 'Gesprochenes Hindi und Urdu sind im Alltag eng verwandt. Die Unterschiede liegen vor allem in der Schrift und im gehobenen Wortschatz. Mit deinem Hindi verstehst du deshalb auch viel Urdu.' }
];

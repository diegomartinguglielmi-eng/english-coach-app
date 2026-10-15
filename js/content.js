// SayIt · contenido del programa
// Niveles: 0=A1, 1=A2, 2=B1, 3=B2, 4=C1

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
export const LEVEL_NAMES = {
  A1: 'Inicial', A2: 'Básico', B1: 'Intermedio', B2: 'Intermedio alto', C1: 'Avanzado'
};

/* ------------------------------------------------------------------ */
/* Diagnóstico                                                         */
/* ------------------------------------------------------------------ */

export const DIAG = {
  grammar: [
    { d: 0, q: 'She ___ a teacher.', a: ['is', 'are', 'be'], ok: 0 },
    { d: 0, q: '___ you like coffee?', a: ['Do', 'Are', 'Does'], ok: 0 },
    { d: 0, q: 'There ___ two cats in the garden.', a: ['is', 'are', 'am'], ok: 1 },
    { d: 1, q: "I've lived here ___ 2022.", a: ['for', 'since', 'during'], ok: 1 },
    { d: 1, q: 'Yesterday we ___ to the beach.', a: ['go', 'went', 'gone'], ok: 1 },
    { d: 1, q: 'This hotel is ___ than the other one.', a: ['more cheap', 'cheaper', 'cheapest'], ok: 1 },
    { d: 2, q: 'If I ___ more time, I would travel more.', a: ['have', 'had', 'will have'], ok: 1 },
    { d: 2, q: "I'm not used to ___ up so early.", a: ['get', 'getting', 'got'], ok: 1 },
    { d: 2, q: 'The report ___ by the manager last week.', a: ['was written', 'wrote', 'has written'], ok: 0 },
    { d: 3, q: 'By the time we arrived, the film ___.', a: ['already started', 'had already started', 'has already started'], ok: 1 },
    { d: 3, q: 'She suggested ___ a taxi.', a: ['to take', 'taking', 'we taking'], ok: 1 },
    { d: 3, q: 'I wish I ___ that email yesterday.', a: ["hadn't sent", "didn't send", "wouldn't send"], ok: 0 },
    { d: 4, q: 'Hardly ___ the house when it started to rain.', a: ['I had left', 'had I left', 'I left'], ok: 1 },
    { d: 4, q: "I'd rather you ___ anyone about it.", a: ["didn't tell", "don't tell", "won't tell"], ok: 0 },
    { d: 4, q: '___ the weather, the event went ahead as planned.', a: ['Despite', 'Although', 'However'], ok: 0 }
  ],
  vocab: [
    { d: 0, q: 'Lo contrario de "cheap" es…', a: ['expensive', 'small', 'early'], ok: 0 },
    { d: 0, q: '¿Cuál es un miembro de la familia?', a: ['niece', 'kitchen', 'Tuesday'], ok: 0 },
    { d: 0, q: '"I\'m hungry" significa…', a: ['Tengo hambre', 'Estoy enojada', 'Tengo frío'], ok: 0 },
    { d: 1, q: 'I need to ___ an appointment with the dentist.', a: ['do', 'make', 'take'], ok: 1 },
    { d: 1, q: '"Borrow" significa…', a: ['pedir prestado', 'prestar', 'devolver'], ok: 0 },
    { d: 1, q: 'Can you ___ me a favour?', a: ['make', 'do', 'give'], ok: 1 },
    { d: 2, q: "Let's ___ the meeting until Friday.", a: ['put off', 'put on', 'put up'], ok: 0 },
    { d: 2, q: '"We need to figure this out" significa…', a: ['Tenemos que resolverlo', 'Tenemos que cancelarlo', 'Tenemos que anotarlo'], ok: 0 },
    { d: 2, q: 'I\'m looking forward ___ you.', a: ['to seeing', 'to see', 'seeing'], ok: 0 },
    { d: 3, q: '"Actually" en español significa…', a: ['en realidad', 'actualmente', 'activamente'], ok: 0 },
    { d: 3, q: 'The new policy had a ___ effect on sales.', a: ['significant', 'sensible', 'sensitive'], ok: 0 },
    { d: 3, q: 'We need to ___ a decision before Monday.', a: ['reach', 'arrive', 'get to do'], ok: 0 },
    { d: 4, q: 'Her argument was so ___ that nobody could disagree.', a: ['compelling', 'compulsive', 'competing'], ok: 0 },
    { d: 4, q: '"To take something for granted" significa…', a: ['No valorarlo porque siempre está', 'Aceptar un regalo', 'Tomarlo sin permiso'], ok: 0 },
    { d: 4, q: 'The plan was ___ from the start: it never had a chance.', a: ['doomed', 'doubted', 'dimmed'], ok: 0 }
  ],
  reading: [
    { d: 0, text: "Hi, I'm Tom. I live in London with my sister. I work in a hospital and I go to work by bike.", q: 'How does Tom go to work?', a: ['By bike', 'By bus', 'On foot'], ok: 0 },
    { d: 1, text: 'The library will be closed on Monday for cleaning. Books due on Monday can be returned on Tuesday without a fine.', q: 'What happens if you return a book on Tuesday?', a: ["You don't pay extra", 'You pay a fine', 'You can\'t return it'], ok: 0 },
    { d: 2, text: 'Hi Ana, thanks for the report. The figures look good, but could you double-check the March totals before we send it to the client? No rush — Thursday is fine.', q: 'What does the writer want Ana to do?', a: ['Check some numbers by Thursday', 'Send the report today', 'Call the client'], ok: 0 },
    { d: 3, text: 'Although remote work was first seen as a temporary solution, many companies have discovered that it reduces costs without harming productivity. However, some managers still worry about its impact on team culture.', q: 'What is the main concern mentioned?', a: ['How it affects the way teams connect', 'How much it costs', 'How it affects productivity'], ok: 0 },
    { d: 4, text: "The committee's decision, far from settling the matter, merely shifted the debate from whether the project should go ahead to how it could be funded.", q: 'What does the sentence imply?', a: ['The debate continued in a different form', 'The project was cancelled', 'The funding was approved'], ok: 0 }
  ],
  listening: [
    { d: 0, audio: "My name is Laura and I'm thirty-two years old.", q: 'How old is Laura?', a: ['32', '22', '23'], ok: 0 },
    { d: 0, audio: 'The supermarket opens at nine and closes at eight.', q: 'When does the supermarket open?', a: ['At 9', 'At 8', 'At 5'], ok: 0 },
    { d: 1, audio: 'Could you send me the updated report by Friday?', q: 'What is the speaker asking for?', a: ['The updated report by Friday', 'A meeting on Friday', 'The report today'], ok: 0 },
    { d: 1, audio: "I'd like a table for two, please, near the window.", q: 'What does the speaker want?', a: ['A table for two by the window', 'Two coffees', 'A window seat on a plane'], ok: 0 },
    { d: 2, audio: "Sorry I'm late. The train was cancelled, so I had to take a bus.", q: 'Why is the speaker late?', a: ['The train was cancelled', 'The bus was late', 'They overslept'], ok: 0 },
    { d: 2, audio: "If it doesn't rain tomorrow, we're going hiking in the mountains.", q: 'What will they do?', a: ['Go hiking if the weather is dry', 'Stay at home all day', 'They already went hiking'], ok: 0 },
    { d: 3, audio: "Would you mind walking me through the numbers again? I didn't quite follow the second part.", q: 'What does the speaker want?', a: ['An explanation of the numbers again', 'New numbers tomorrow', 'To cancel the presentation'], ok: 0 },
    { d: 3, audio: 'I was going to call you last night, but it completely slipped my mind.', q: 'What happened?', a: ['She forgot to call', 'She called twice', 'Her phone was broken'], ok: 0 },
    { d: 4, audio: "Had I known how long the renovation would take, I'd never have agreed to it.", q: 'What does the speaker mean?', a: ["He didn't expect it to take so long", 'He refused the renovation', 'The renovation was quick'], ok: 0 },
    { d: 4, audio: "It's not that I don't appreciate the offer; it's just that the timing couldn't be worse.", q: 'How does she feel?', a: ['She likes the offer, but the timing is bad', "She doesn't like the offer", 'She accepts immediately'], ok: 0 }
  ],
  readAloud: "I usually walk to work, but yesterday I took the bus because it was raining.",
  speakPrompt: 'Hablá en inglés entre 20 y 40 segundos: contá a qué te dedicás o cómo es un día normal para vos.',
  writePrompt: 'Escribí entre 3 y 5 oraciones en inglés: qué hiciste el fin de semana pasado y qué planes tenés para el próximo.'
};

/* ------------------------------------------------------------------ */
/* Sonidos (los que más cuestan a quien habla español)                 */
/* ------------------------------------------------------------------ */

export const SOUNDS = {
  ih: {
    name: 'Ship o sheep', ipa: '/ɪ/ – /iː/', type: 'pairs',
    tip: 'La /iː/ de "sheep" es larga y con la boca estirada, como sonriendo. La /ɪ/ de "ship" es corta y relajada, casi entre una "i" y una "e". En español tenemos una sola "i": en inglés son dos.',
    pairs: [['ship', 'sheep'], ['live', 'leave'], ['sit', 'seat'], ['fill', 'feel'], ['bit', 'beat'], ['hit', 'heat'], ['chip', 'cheap'], ['still', 'steal'], ['rich', 'reach'], ['fit', 'feet']],
    shadow: ['Please sit in this seat.', 'I live here, but I leave at six.', 'This cheap chip is still hot.', 'We need to fill in the form.']
  },
  bv: {
    name: 'B y V', ipa: '/b/ – /v/', type: 'pairs',
    tip: 'En inglés la V suena distinto de la B. Para la /v/ apoyá los dientes de arriba sobre el labio de abajo y hacé vibrar la voz, como un zumbido. La /b/ se hace juntando los dos labios.',
    pairs: [['berry', 'very'], ['ban', 'van'], ['best', 'vest'], ['boat', 'vote'], ['bet', 'vet'], ['curb', 'curve'], ['bow', 'vow'], ['bowl', 'vole']],
    shadow: ['Victor has a very big van.', 'I voted for the best boat.', 'Leave the berries in the bowl.', 'Have you ever visited Venice?']
  },
  th: {
    name: 'TH suave', ipa: '/θ/', type: 'pairs',
    tip: 'Sacá apenas la punta de la lengua entre los dientes y soplá aire, sin voz. Se parece a la "z" de España. No es "t" ni "s": "think" no es "tink" ni "sink".',
    pairs: [['think', 'sink'], ['thick', 'sick'], ['thank', 'tank'], ['three', 'tree'], ['path', 'pass'], ['mouth', 'mouse'], ['thought', 'taught'], ['bath', 'bass']],
    shadow: ['Thank you for the three things.', 'I think it is Thursday.', 'Both paths go north.', 'Thirty-three thousand.']
  },
  dh: {
    name: 'TH con voz', ipa: '/ð/', type: 'pairs',
    tip: 'La misma posición que la TH suave, lengua entre los dientes, pero ahora con voz: tiene que vibrar. Es la "d" suave de "nada" en español, un poco más adelante.',
    pairs: [['they', 'day'], ['then', 'den'], ['those', 'doze'], ['though', 'dough'], ['breathe', 'breed'], ['there', 'dare'], ['worthy', 'wordy'], ['loathe', 'load']],
    shadow: ['This is their mother.', 'They were there with them.', 'The weather is better than that.', 'Those are my brothers.']
  },
  ae: {
    name: 'Cat o cut', ipa: '/æ/ – /ʌ/', type: 'pairs',
    tip: 'Para /æ/ ("cat") abrí bien la boca, como una "a" que tira hacia la "e". Para /ʌ/ ("cut") la boca está más relajada y el sonido es corto, parecido a una "a" apagada.',
    pairs: [['cat', 'cut'], ['bag', 'bug'], ['cap', 'cup'], ['hat', 'hut'], ['ran', 'run'], ['match', 'much'], ['fan', 'fun'], ['bat', 'but']],
    shadow: ['The cat ran under the bus.', 'I had a cup of black coffee.', 'Pack the bag and run.', 'It was fun, but my back hurts.']
  },
  ed: {
    name: 'Terminaciones -ed', ipa: '/t/ /d/ /ɪd/', type: 'classify',
    tip: 'La -ed casi nunca suena "ed". Después de sonidos sordos (p, k, s, sh, ch, f) suena /t/: "worked" = "workt". Después de sonidos con voz suena /d/: "played". Solo después de t o d se agrega una sílaba /ɪd/: "wanted", "needed".',
    words: [['worked', 't'], ['stopped', 't'], ['watched', 't'], ['laughed', 't'], ['missed', 't'], ['played', 'd'], ['called', 'd'], ['opened', 'd'], ['lived', 'd'], ['cleaned', 'd'], ['wanted', 'id'], ['needed', 'id'], ['started', 'id'], ['decided', 'id'], ['visited', 'id']],
    shadow: ['I worked late and watched a film.', 'She called me and we talked.', 'They decided to start again.', 'We visited the museum and walked home.']
  },
  sp: {
    name: 'S inicial', ipa: '/sp/ /st/ /sk/', type: 'pairs',
    tip: 'En inglés no hay "e" antes de la S: es "Spain", no "Espain". Empezá con un siseo largo, "sssss", y recién después decí la consonante.',
    pairs: [['Spain', 'Espain'], ['school', 'eschool'], ['study', 'estudy'], ['star', 'estar'], ['speak', 'espeak'], ['street', 'estreet'], ['special', 'especial'], ['student', 'estudent']],
    pairsNote: 'Elegí la versión correcta en inglés.',
    shadow: ['Students study at school.', 'Speak slowly, please.', 'Stop at the station on State Street.', 'Spring is special in Spain.']
  },
  dj: {
    name: 'J y Y', ipa: '/dʒ/ – /j/', type: 'pairs',
    tip: 'La /dʒ/ de "jet" es fuerte, como la "ll" de Buenos Aires con un golpecito de "d" adelante: "dyet". La /j/ de "yet" es suave, como una "i" rápida: "iet".',
    pairs: [['jet', 'yet'], ['jam', 'yam'], ['joke', 'yolk'], ['jello', 'yellow'], ['juice', 'use'], ['jess', 'yes'], ['major', 'mayor'], ['jail', 'Yale']],
    shadow: ['Yes, I enjoy jazz.', 'Your job is just great.', 'Yesterday I had orange juice.', 'The yellow jacket is in June.']
  },
  h: {
    name: 'La H aspirada', ipa: '/h/', type: 'pairs',
    tip: 'La H inglesa es solo aire, como cuando empañás un vidrio: "hhh". No es la "j" de "jamón", que raspa en la garganta. Y cuando no hay H, no la agregues.',
    pairs: [['hear', 'ear'], ['hold', 'old'], ['hate', 'eight'], ['hair', 'air'], ['heat', 'eat'], ['harm', 'arm'], ['hill', 'ill'], ['high', 'eye']],
    shadow: ['How are you? Happy holidays!', 'His house is on the hill.', 'I hope you have a nice holiday.', 'Help me hold this, please.']
  },
  sh: {
    name: 'SH y CH', ipa: '/ʃ/ – /tʃ/', type: 'pairs',
    tip: 'La /ʃ/ ("shop") es un "shhh" continuo, como pedir silencio. La /tʃ/ ("chop") es como nuestra "ch": un golpe corto.',
    pairs: [['ship', 'chip'], ['shop', 'chop'], ['share', 'chair'], ['wash', 'watch'], ['shoes', 'choose'], ['cash', 'catch'], ['sheet', 'cheat'], ['wish', 'witch']],
    shadow: ['She chose cheap shoes.', 'Wash the dishes and watch TV.', 'Share the chair with Charlie.', 'I wish I could catch the ship.']
  },
  sz: {
    name: 'S y Z finales', ipa: '/s/ – /z/', type: 'pairs',
    tip: 'Muchas S en inglés suenan /z/, con voz, como un zumbido de abeja: "eyes", "rose", "dogs". Poné los dedos en la garganta: con /z/ vibra, con /s/ no.',
    pairs: [['ice', 'eyes'], ['price', 'prize'], ['bus', 'buzz'], ['place', 'plays'], ['rice', 'rise'], ['loss', 'laws'], ['peace', 'peas'], ['face', 'phase']],
    shadow: ['She closes her eyes.', 'He plays with his dogs.', 'These roses are for my cousins.', 'The prize was a nice surprise.']
  },
  stress: {
    name: 'Acento y schwa', ipa: '/ə/', type: 'stress',
    tip: 'En inglés una sílaba se pronuncia fuerte y las demás se "comen", con un sonido neutro: la schwa /ə/, como una "e" muy relajada. Si acentuás la sílaba equivocada, cuesta entenderte aunque los sonidos estén bien.',
    words: [['photograph', ['pho', 'to', 'graph'], 0], ['photography', ['pho', 'tog', 'ra', 'phy'], 1], ['comfortable', ['com', 'for', 'ta', 'ble'], 0], ['develop', ['de', 'vel', 'op'], 1], ['hotel', ['ho', 'tel'], 1], ['vegetable', ['veg', 'e', 'ta', 'ble'], 0], ['important', ['im', 'por', 'tant'], 1], ['interesting', ['in', 'ter', 'est', 'ing'], 0], ['banana', ['ba', 'na', 'na'], 1], ['decide', ['de', 'cide'], 1], ['family', ['fam', 'i', 'ly'], 0], ['company', ['com', 'pa', 'ny'], 0]],
    shadow: ['The hotel was very comfortable.', 'Photography is an interesting hobby.', 'My family eats a lot of vegetables.', 'It is important to decide today.']
  }
};

/* ------------------------------------------------------------------ */
/* Programa de 12 semanas                                              */
/* ------------------------------------------------------------------ */
// grammar.ex: {q, a, ok} opción múltiple, o {order: 'frase completa'} para ordenar palabras
// listen: {audio, q, a, ok} o {dictation: 'frase'}

export const WEEKS = [
  {
    n: 1, title: 'Presentarte con confianza', sound: 'ih',
    grammar: {
      name: 'Presente simple y continuo',
      tip: 'Usá el presente simple para lo habitual o permanente ("I work in a hospital") y el continuo para lo que pasa ahora o en este período ("I\'m working on a new project"). Error típico: "I am work" ✗.',
      ex: [
        { q: 'I ___ in a bank, but this month I ___ from home.', a: ['work / am working', 'am working / work', 'work / work'], ok: 0 },
        { q: 'What ___ you do? — I\'m a nurse.', a: ['do', 'are', 'does'], ok: 0 },
        { q: 'Look! It ___.', a: ['rains', 'is raining', 'rain'], ok: 1 },
        { q: 'She usually ___ coffee in the morning.', a: ['drinks', 'is drinking', 'drink'], ok: 0 },
        { order: "I'm currently working on a new project" },
        { order: 'Where do you live these days' }
      ]
    },
    vocab: [
      ['Nice to meet you', 'Encantada de conocerte', 'Hi, I\'m Cecilia. Nice to meet you!'],
      ['What do you do?', '¿A qué te dedicás?', 'So, what do you do?'],
      ['I\'m in charge of…', 'Estoy a cargo de…', 'I\'m in charge of the admin team.'],
      ['I\'ve been living here for…', 'Vivo acá hace…', 'I\'ve been living here for ten years.'],
      ['originally', 'originalmente, de origen', 'I\'m originally from Buenos Aires.'],
      ['to get along with', 'llevarse bien con', 'I get along with my neighbours.'],
      ['spare time', 'tiempo libre', 'In my spare time I read.'],
      ['to be into something', 'estar copada con algo', 'I\'m really into cooking.'],
      ['How about you?', '¿Y vos?', 'I love it here. How about you?'],
      ['Let\'s keep in touch', 'Sigamos en contacto', 'It was great to chat. Let\'s keep in touch!']
    ],
    listen: [
      { audio: "Hi, I'm Mark. I'm a teacher, but at the moment I'm working at a summer camp.", q: 'Where is Mark working now?', a: ['At a summer camp', 'At a school', 'At a hotel'], ok: 0 },
      { dictation: 'Nice to meet you. What do you do?' },
      { audio: "I'm originally from Chile, but I've been living in Canada for five years.", q: 'Where does she live now?', a: ['In Canada', 'In Chile', 'In Spain'], ok: 0 },
      { dictation: 'In my spare time I like to read.' }
    ],
    scenario: { title: 'Conocer a una vecina nueva', role: 'You are Emma, a friendly new neighbour who just moved in next door. You meet the learner in the hallway.', opener: "Hi there! I'm Emma, I just moved in next door. Have you been living here long?" },
    challenge: 'Escribí una presentación tuya de 4 oraciones: quién sos, a qué te dedicás, qué te gusta hacer y algo que estés haciendo estos días.'
  },
  {
    n: 2, title: 'Tu día a día', sound: 'bv',
    grammar: {
      name: 'Frecuencia y preguntas en presente',
      tip: 'Los adverbios de frecuencia van antes del verbo principal ("I usually get up at 7") pero después de "to be" ("I\'m always tired"). En preguntas usá do/does: "How often do you go to the gym?".',
      ex: [
        { q: 'I ___ late for work.', a: ['am never', 'never am', 'never is'], ok: 0 },
        { q: 'How often ___ she go swimming?', a: ['does', 'do', 'is'], ok: 0 },
        { q: 'We ___ have dinner at nine.', a: ['usually', 'usual', 'are usually'], ok: 0 },
        { q: '___ do you get to work? — By train.', a: ['How', 'What', 'When'], ok: 0 },
        { order: 'I hardly ever watch TV in the morning' },
        { order: 'How often do you go to the gym' }
      ]
    },
    vocab: [
      ['to wake up', 'despertarse', 'I usually wake up at 6:30.'],
      ['to get ready', 'prepararse', 'It takes me twenty minutes to get ready.'],
      ['to commute', 'viajar al trabajo', 'I commute by train.'],
      ['to run errands', 'hacer trámites, mandados', 'I run errands on Saturday morning.'],
      ['to do the dishes', 'lavar los platos', 'My husband does the dishes.'],
      ['to grab a bite', 'comer algo rápido', 'Let\'s grab a bite before the movie.'],
      ['hardly ever', 'casi nunca', 'I hardly ever eat fast food.'],
      ['to unwind', 'relajarse, desenchufarse', 'I unwind with a good series.'],
      ['a busy day', 'un día ocupado', 'Tuesdays are always busy days.'],
      ['to call it a day', 'dar por terminado el día', 'I\'m exhausted. Let\'s call it a day.']
    ],
    listen: [
      { audio: 'I hardly ever drive to work. I usually take the train, and on Fridays I ride my bike.', q: 'How does he usually go to work?', a: ['By train', 'By car', 'By bike'], ok: 0 },
      { dictation: 'I usually wake up at seven.' },
      { audio: "After work I run a few errands, then I unwind with a good book. I'm in bed by eleven.", q: 'What does she do to relax?', a: ['She reads', 'She runs', 'She watches TV'], ok: 0 },
      { dictation: 'We have dinner very late.' }
    ],
    scenario: { title: 'Contar tu rutina', role: 'You are Sam, a curious coworker from the London office chatting on a video call before a meeting starts. Ask about the learner\'s daily routine.', opener: "Morning! Well, it's morning for me. What does a normal day look like for you over there?" },
    challenge: 'Escribí cómo es tu día típico, de la mañana a la noche, usando al menos tres adverbios de frecuencia (always, usually, sometimes, hardly ever…).'
  },
  {
    n: 3, title: 'Pedir cosas con amabilidad', sound: 'th',
    grammar: {
      name: 'Can, could, would para pedir',
      tip: '"Can you…?" es directo; "Could you…?" es más amable; "Would you mind + -ing…?" es muy cortés. Para responder que sí a "Would you mind…?" se dice "Not at all" o "Sure, no problem".',
      ex: [
        { q: 'Would you mind ___ the window?', a: ['opening', 'to open', 'open'], ok: 0 },
        { q: '___ you send me the file, please?', a: ['Could', 'Should', 'Must'], ok: 0 },
        { q: 'Would you mind helping me? — ___', a: ['Not at all.', 'Yes, I mind.', 'No, I wouldn\'t mind it.'], ok: 0 },
        { q: '___ I ask you a question?', a: ['Could', 'Would', 'Will'], ok: 0 },
        { order: 'Could you give me a hand with this' },
        { order: 'Would you mind calling me back later' }
      ]
    },
    vocab: [
      ['Could you give me a hand?', '¿Me das una mano?', 'Could you give me a hand with these boxes?'],
      ['Would you mind…?', '¿Te molestaría…?', 'Would you mind closing the door?'],
      ['I was wondering if…', 'Quería saber si…', 'I was wondering if you could help me.'],
      ['to follow up', 'hacer seguimiento', 'I\'m just following up on my email.'],
      ['as soon as possible', 'lo antes posible', 'Please reply as soon as possible.'],
      ['Thanks in advance', 'Gracias de antemano', 'Thanks in advance for your help.'],
      ['to look into it', 'averiguarlo, revisarlo', 'I\'ll look into it and get back to you.'],
      ['to get back to someone', 'volver a contactar a alguien', 'Can I get back to you tomorrow?'],
      ['No worries', 'No hay problema', 'No worries, take your time.'],
      ['I\'d appreciate it', 'Te lo agradecería', 'I\'d really appreciate it if you could call me.']
    ],
    listen: [
      { audio: "I was wondering if you could look into my order. It hasn't arrived yet.", q: 'What is the problem?', a: ['The order has not arrived', 'The order is wrong', 'The order was cancelled'], ok: 0 },
      { dictation: 'Could you give me a hand?' },
      { audio: "Would you mind calling back in ten minutes? I'm in a meeting right now.", q: 'What should the caller do?', a: ['Call again later', 'Send an email', 'Come to the meeting'], ok: 0 },
      { dictation: 'Thank you for your help.' }
    ],
    scenario: { title: 'Pedir ayuda en el trabajo', role: 'You are Rachel, a busy but kind colleague. The learner needs to ask you for help with something at work. Be realistic: you are busy, so negotiate a time.', opener: "Hey, what's up? I've only got a couple of minutes before my next call." },
    challenge: 'Escribí un mensaje corto a un colega pidiéndole algo de forma amable. Usá "I was wondering if…" o "Would you mind…".'
  },
  {
    n: 4, title: 'Aeropuertos y hoteles', sound: 'dh',
    grammar: {
      name: 'There is / there are y preposiciones',
      tip: '"There is" para una cosa, "there are" para varias. Preposiciones de lugar útiles: next to (al lado de), opposite (enfrente de), between (entre), at the end of (al final de).',
      ex: [
        { q: '___ any restaurants near the hotel?', a: ['Are there', 'Is there', 'There are'], ok: 0 },
        { q: 'The pharmacy is ___ the bank and the café.', a: ['between', 'among', 'next'], ok: 0 },
        { q: 'Your gate is ___ the end of the corridor.', a: ['at', 'in', 'on'], ok: 0 },
        { q: '___ a problem with my booking.', a: ["There's", 'There are', 'It has'], ok: 0 },
        { order: 'Is there a pharmacy near here' },
        { order: 'The lifts are next to the reception' }
      ]
    },
    vocab: [
      ['boarding pass', 'tarjeta de embarque', 'Can I see your boarding pass?'],
      ['to check in', 'hacer el check-in', 'We need to check in two hours before.'],
      ['carry-on', 'equipaje de mano', 'Is this your only carry-on?'],
      ['delayed', 'demorado', 'Our flight is delayed by an hour.'],
      ['a booking under the name…', 'una reserva a nombre de…', 'I have a booking under the name Guglielmi.'],
      ['Is breakfast included?', '¿Está incluido el desayuno?', 'Is breakfast included in the price?'],
      ['to drop off', 'dejar (algo o a alguien)', 'Can I drop off my luggage here?'],
      ['opposite', 'enfrente de', 'The bus stop is opposite the hotel.'],
      ['to head to', 'dirigirse a', 'We\'re heading to the city centre.'],
      ['a window seat', 'asiento de ventanilla', 'Could I have a window seat, please?']
    ],
    listen: [
      { audio: 'Flight BA two-four-seven to London is delayed. The new departure time is six fifteen.', q: 'What is the new departure time?', a: ['6:15', '2:47', '5:16'], ok: 0 },
      { dictation: 'Is breakfast included in the price?' },
      { audio: "There's a pharmacy just opposite the hotel, next to the bakery.", q: 'Where is the pharmacy?', a: ['Opposite the hotel', 'Inside the hotel', 'Behind the bakery'], ok: 0 },
      { dictation: 'I have a booking for three nights.' }
    ],
    scenario: { title: 'Check-in en un hotel', role: 'You are Daniel, a hotel receptionist in New York. The learner is checking in. Ask for the name, confirm dates, mention breakfast hours and the wifi. Create one small problem: the room is not ready yet.', opener: 'Good afternoon, welcome to the Parkview Hotel. Do you have a reservation with us?' },
    challenge: 'Escribí un email corto a un hotel para preguntar si se puede hacer el check-in temprano y si el desayuno está incluido.'
  },
  {
    n: 5, title: 'En el restaurante', sound: 'ae',
    grammar: {
      name: 'Some, any, much, many',
      tip: '"Some" en afirmaciones y ofrecimientos ("Would you like some water?"); "any" en negativas y preguntas. "Many" con cosas contables (many tables), "much" con incontables (much time, much water).',
      ex: [
        { q: 'Would you like ___ bread?', a: ['some', 'any', 'many'], ok: 0 },
        { q: "We don't have ___ tables free right now.", a: ['any', 'some', 'much'], ok: 0 },
        { q: 'How ___ water do we need?', a: ['much', 'many', 'any'], ok: 0 },
        { q: "There aren't ___ vegetarian options.", a: ['many', 'much', 'some'], ok: 0 },
        { order: "I'd like the chicken with a side salad" },
        { order: 'Could we have the bill please' }
      ]
    },
    vocab: [
      ['I\'d like…', 'Quisiera…', 'I\'d like the fish, please.'],
      ['a table for…', 'una mesa para…', 'A table for four, please.'],
      ['Are you ready to order?', '¿Están listos para pedir?', 'Are you ready to order, or do you need a minute?'],
      ['What do you recommend?', '¿Qué recomienda?', 'Everything looks good. What do you recommend?'],
      ['a side dish', 'una guarnición', 'It comes with a side dish.'],
      ['medium rare', 'jugoso (carne)', 'I\'d like my steak medium rare.'],
      ['still or sparkling', 'sin gas o con gas', 'Still or sparkling water?'],
      ['the bill / the check', 'la cuenta', 'Could we have the bill, please?'],
      ['to split the bill', 'dividir la cuenta', 'Shall we split the bill?'],
      ['to be allergic to', 'ser alérgica a', 'I\'m allergic to nuts.']
    ],
    listen: [
      { audio: "I'll have the steak, medium rare, with a side of fries. And a glass of red wine, please.", q: 'How does he want the steak?', a: ['Medium rare', 'Well done', 'With rice'], ok: 0 },
      { dictation: 'Could we have the bill, please?' },
      { audio: "Sorry, we don't have any tables free right now, but there'll be one in about fifteen minutes.", q: 'How long is the wait?', a: ['About 15 minutes', 'About 50 minutes', 'There is no wait'], ok: 0 },
      { dictation: 'A table for two near the window.' }
    ],
    scenario: { title: 'Pedir la cena', role: 'You are Lucy, a waitress at a busy restaurant in London. Take the learner\'s order, recommend the special (grilled salmon), ask about drinks and allergies, and later bring the bill.', opener: "Hi, good evening! Here are your menus. Can I get you something to drink while you decide?" },
    challenge: 'Escribí el diálogo de un pedido en un restaurante: lo que pedís de entrada, plato principal y bebida, y una pregunta al mozo.'
  },
  {
    n: 6, title: 'Contar lo que pasó', sound: 'ed',
    grammar: {
      name: 'Pasado simple',
      tip: 'Los verbos regulares agregan -ed (worked, played). Los irregulares hay que aprenderlos (go → went, see → saw, buy → bought). En preguntas y negativas se usa "did" + verbo base: "Did you go?", "I didn\'t see it" (no "didn\'t saw").',
      ex: [
        { q: 'Last weekend we ___ my parents.', a: ['visited', 'visit', 'have visited'], ok: 0 },
        { q: 'I ___ the email, sorry.', a: ["didn't see", "didn't saw", "don't saw"], ok: 0 },
        { q: '___ you enjoy the party?', a: ['Did', 'Were', 'Have'], ok: 0 },
        { q: 'She ___ a new phone yesterday.', a: ['bought', 'buyed', 'buy'], ok: 0 },
        { order: 'We went to the beach and had a great time' },
        { order: 'What did you do last weekend' }
      ]
    },
    vocab: [
      ['last weekend', 'el fin de semana pasado', 'What did you do last weekend?'],
      ['It was a blast', 'Fue genial', 'The concert was a blast!'],
      ['to hang out', 'pasar el rato', 'We hung out with some friends.'],
      ['all of a sudden', 'de repente', 'All of a sudden, the lights went out.'],
      ['in the end', 'al final', 'In the end, we stayed at home.'],
      ['to turn out', 'resultar', 'The trip turned out to be amazing.'],
      ['a while ago', 'hace un tiempo', 'I saw her a while ago.'],
      ['to run into someone', 'cruzarse con alguien', 'I ran into an old friend at the mall.'],
      ['to have a great time', 'pasarla muy bien', 'We had a great time at the wedding.'],
      ['Guess what!', '¡Adiviná qué!', 'Guess what! I passed the exam.']
    ],
    listen: [
      { audio: 'Guess what! I ran into my old English teacher at the supermarket yesterday.', q: 'Who did she meet?', a: ['Her old teacher', 'Her neighbour', 'Her boss'], ok: 0 },
      { dictation: 'We had a great time at the beach.' },
      { audio: 'We planned a picnic, but all of a sudden it started to rain, so in the end we watched a movie at home.', q: 'What did they do in the end?', a: ['Watched a movie at home', 'Had a picnic', 'Went to the cinema'], ok: 0 },
      { dictation: 'I watched a film and cooked dinner.' }
    ],
    scenario: { title: 'Contar tu fin de semana', role: 'You are Jake, a cheerful friend. It\'s Monday morning and you want to hear about the learner\'s weekend. React with interest and ask follow-up questions in the past tense.', opener: "Hey! How was your weekend? Did you do anything fun?" },
    challenge: 'Contá en 5 oraciones algo divertido o inesperado que te pasó. Usá al menos dos verbos irregulares y una expresión como "all of a sudden" o "in the end".'
  },
  {
    n: 7, title: 'Experiencias', sound: 'sp',
    grammar: {
      name: 'Presente perfecto vs. pasado',
      tip: 'Presente perfecto (have + participio) para experiencias sin momento exacto ("I\'ve been to Brazil") o algo que sigue ("I\'ve worked here for 5 years"). Pasado simple cuando decís cuándo: "I went to Brazil in 2019". For = durante (for 5 years); since = desde (since 2019).',
      ex: [
        { q: '___ you ever ___ to Italy?', a: ['Have / been', 'Did / go', 'Have / went'], ok: 0 },
        { q: 'I ___ there in 2018.', a: ['went', 'have gone', 'have been'], ok: 0 },
        { q: "She's worked here ___ ten years.", a: ['for', 'since', 'during'], ok: 0 },
        { q: "We've known each other ___ we were kids.", a: ['since', 'for', 'from'], ok: 0 },
        { order: "I've never tried Japanese food before" },
        { order: 'How long have you worked there' }
      ]
    },
    vocab: [
      ['Have you ever…?', '¿Alguna vez…?', 'Have you ever been to Mexico?'],
      ['I\'ve never…', 'Nunca…', 'I\'ve never tried sushi.'],
      ['so far', 'hasta ahora', 'So far, so good.'],
      ['to gain experience', 'ganar experiencia', 'I gained a lot of experience there.'],
      ['to be responsible for', 'ser responsable de', 'I\'m responsible for the schedules.'],
      ['a strength', 'una fortaleza', 'One of my strengths is organisation.'],
      ['to deal with', 'lidiar con, encargarse de', 'I deal with customers every day.'],
      ['skills', 'habilidades', 'I\'ve improved my computer skills.'],
      ['once in a lifetime', 'única en la vida', 'It was a once-in-a-lifetime trip.'],
      ['to look back', 'mirar hacia atrás', 'Looking back, it was a great decision.']
    ],
    listen: [
      { audio: "I've worked in customer service for eight years, and since last March I've been in charge of a small team.", q: 'How long has she worked in customer service?', a: ['Eight years', 'Since March', 'Eight months'], ok: 0 },
      { dictation: 'Have you ever been to London?' },
      { audio: "I've been to Spain three times, but I've never visited Portugal.", q: 'Which country has he never visited?', a: ['Portugal', 'Spain', 'France'], ok: 0 },
      { dictation: 'I have never tried this before.' }
    ],
    scenario: { title: 'Entrevista de trabajo', role: 'You are Mr. Thompson, a friendly HR interviewer for an international company. Interview the learner about their experience, strengths and a challenge they have dealt with. Ask one question at a time.', opener: "Thanks for coming in today. To start, could you tell me a bit about your experience?" },
    challenge: 'Escribí 4 oraciones sobre tu experiencia laboral o de vida usando "I\'ve…", "for" y "since".'
  },
  {
    n: 8, title: 'Planes y futuro', sound: 'dj',
    grammar: {
      name: 'Going to, will y presente continuo',
      tip: '"Going to" para planes ya decididos ("I\'m going to study tonight"). "Will" para decisiones en el momento, promesas y predicciones ("I\'ll call you"). Presente continuo para citas ya arregladas ("I\'m meeting Ana on Friday").',
      ex: [
        { q: "The phone's ringing. — I ___ get it.", a: ["'ll", "'m going to", 'am'], ok: 0 },
        { q: 'We ___ visit my parents next month. We booked the tickets.', a: ['are going to', 'will', 'go'], ok: 0 },
        { q: "I ___ the dentist at 4 tomorrow.", a: ["'m seeing", "'ll see", 'see'], ok: 0 },
        { q: "Don't worry, I ___ tell anyone.", a: ["won't", "'m not going", "don't"], ok: 0 },
        { order: "We're going to travel to Bariloche in January" },
        { order: "I'll send you the details tonight" }
      ]
    },
    vocab: [
      ['to make plans', 'hacer planes', 'Have you made any plans for the summer?'],
      ['to look forward to', 'esperar con ganas', 'I\'m looking forward to the holidays.'],
      ['to book', 'reservar', 'We booked a cabin in the mountains.'],
      ['to be up for something', 'tener ganas de algo', 'Are you up for a coffee later?'],
      ['It depends on…', 'Depende de…', 'It depends on the weather.'],
      ['to sort out', 'organizar, resolver', 'I need to sort out the tickets.'],
      ['in advance', 'con anticipación', 'Book in advance; it\'s cheaper.'],
      ['to call off', 'cancelar', 'They called off the trip.'],
      ['Sounds good!', '¡Me parece bien!', 'Saturday at eight? Sounds good!'],
      ['to be about to', 'estar a punto de', 'I\'m about to leave.']
    ],
    listen: [
      { audio: "We're going to spend two weeks in the south. We've already booked a cabin near the lake.", q: 'What have they already done?', a: ['Booked a cabin', 'Bought plane tickets', 'Rented a car'], ok: 0 },
      { dictation: 'I am looking forward to the holidays.' },
      { audio: "I'm meeting Sarah for lunch on Friday, so I can't do Friday. How about Saturday morning?", q: 'When does he suggest meeting?', a: ['Saturday morning', 'Friday lunch', 'Friday evening'], ok: 0 },
      { dictation: 'We are going to travel in January.' }
    ],
    scenario: { title: 'Planear un viaje', role: 'You are Olivia, a friend from Australia who wants to visit Argentina. Plan a trip together: ask about places, dates, weather and what to pack. Make suggestions and ask the learner\'s opinion.', opener: "I've finally decided: I'm coming to Argentina next year! Where do you think I should go?" },
    challenge: 'Escribí tus planes para las próximas vacaciones: qué vas a hacer (going to), algo ya organizado (presente continuo) y una predicción (will).'
  },
  {
    n: 9, title: 'Salud y consultas médicas', sound: 'h',
    grammar: {
      name: 'Should, have to, must',
      tip: '"Should" es un consejo ("You should rest"). "Have to" es una obligación externa ("I have to take this twice a day"). "Mustn\'t" es una prohibición; "don\'t have to" significa que no es necesario.',
      ex: [
        { q: 'You look tired. You ___ get some rest.', a: ['should', 'must not', "don't have to"], ok: 0 },
        { q: 'I ___ take these pills twice a day.', a: ['have to', 'should to', 'must to'], ok: 0 },
        { q: "You ___ come if you don't want to. It's optional.", a: ["don't have to", "mustn't", "shouldn't to"], ok: 0 },
        { q: "You ___ smoke in the hospital.", a: ["mustn't", "don't have to", "haven't to"], ok: 0 },
        { order: 'You should drink plenty of water' },
        { order: "I've had a headache since yesterday" }
      ]
    },
    vocab: [
      ['to make an appointment', 'sacar un turno', 'I\'d like to make an appointment with Dr. Lee.'],
      ['a sore throat', 'dolor de garganta', 'I\'ve had a sore throat for three days.'],
      ['a headache', 'dolor de cabeza', 'I have a terrible headache.'],
      ['to feel dizzy', 'estar mareada', 'I feel a bit dizzy.'],
      ['a prescription', 'una receta', 'You need a prescription for this.'],
      ['to get better', 'mejorarse', 'I hope you get better soon.'],
      ['to take it easy', 'tomárselo con calma', 'Take it easy this weekend.'],
      ['symptoms', 'síntomas', 'What are your symptoms?'],
      ['It hurts here', 'Me duele acá', 'It hurts here when I walk.'],
      ['health insurance', 'obra social, seguro médico', 'Do you have health insurance?']
    ],
    listen: [
      { audio: "I've had a sore throat and a slight fever since Tuesday, and I feel a bit dizzy in the mornings.", q: 'When did the symptoms start?', a: ['On Tuesday', 'This morning', 'Last week'], ok: 0 },
      { dictation: 'I would like to make an appointment.' },
      { audio: "You don't have to come back unless the pain gets worse, but you should drink plenty of water.", q: 'What does the doctor say?', a: ['Come back only if it gets worse', 'Come back tomorrow', 'Stop drinking water'], ok: 0 },
      { dictation: 'I hope you get better soon.' }
    ],
    scenario: { title: 'Consulta con la médica', role: 'You are Dr. Harris, a calm and kind doctor at a clinic. The learner is a patient. Ask about symptoms, how long they have had them, allergies, and give simple advice using should and have to. This is a language practice role-play, not real medical advice.', opener: 'Good morning, please have a seat. So, what seems to be the problem today?' },
    challenge: 'Escribí un mensaje para pedir un turno médico explicando dos síntomas y desde cuándo los tenés.'
  },
  {
    n: 10, title: 'Compras y reclamos', sound: 'sh',
    grammar: {
      name: 'Comparativos y superlativos',
      tip: 'Palabras cortas: cheap → cheaper → the cheapest. Largas: expensive → more expensive → the most expensive. Irregulares: good → better → the best; bad → worse → the worst. Para igualdad: "as big as".',
      ex: [
        { q: 'This one is ___ than the blue one.', a: ['cheaper', 'more cheap', 'cheapest'], ok: 0 },
        { q: "It's the ___ store in town.", a: ['best', 'better', 'most good'], ok: 0 },
        { q: 'The new model is ___ expensive than the old one.', a: ['more', 'most', 'much'], ok: 0 },
        { q: "This size isn't ___ big ___ I need.", a: ['as / as', 'so / than', 'more / as'], ok: 0 },
        { order: 'Do you have this in a smaller size' },
        { order: "I'd like to return this because it doesn't work" }
      ]
    },
    vocab: [
      ['to try on', 'probarse (ropa)', 'Can I try this on?'],
      ['a refund', 'un reembolso', 'I\'d like a refund, please.'],
      ['a receipt', 'un ticket, comprobante', 'Do you have the receipt?'],
      ['to exchange', 'cambiar (un producto)', 'Can I exchange it for a bigger size?'],
      ['on sale', 'en oferta', 'These shoes are on sale.'],
      ['It doesn\'t work', 'No funciona', 'I bought this yesterday and it doesn\'t work.'],
      ['a bargain', 'una ganga', 'At this price, it\'s a bargain!'],
      ['to complain', 'quejarse, reclamar', 'I\'d like to complain about the service.'],
      ['the fitting room', 'el probador', 'Where is the fitting room?'],
      ['to be out of stock', 'estar agotado', 'Sorry, it\'s out of stock.']
    ],
    listen: [
      { audio: "I'm afraid we can't give you a refund without the receipt, but we can exchange it for something else.", q: 'What can the customer do?', a: ['Exchange the product', 'Get a refund', 'Nothing at all'], ok: 0 },
      { dictation: 'Can I try this on, please?' },
      { audio: "The black jacket is on sale, so it's actually cheaper than the grey one now.", q: 'Which jacket is cheaper now?', a: ['The black one', 'The grey one', 'They cost the same'], ok: 0 },
      { dictation: 'I would like to exchange this.' }
    ],
    scenario: { title: 'Devolver un producto', role: 'You are Ben, a shop assistant at an electronics store. The learner wants to return headphones that stopped working. Ask for the receipt and explain the options (repair, exchange or refund). Be polite but follow the store policy.', opener: "Hi there, how can I help you today?" },
    challenge: 'Escribí un reclamo breve y educado por un producto que llegó roto: qué compraste, cuándo, el problema y qué solución pedís.'
  },
  {
    n: 11, title: 'Dar tu opinión', sound: 'sz',
    grammar: {
      name: 'Opinar y primer condicional',
      tip: 'Para opinar: "I think…", "In my opinion…", "I\'d say…". Para coincidir o no: "I totally agree", "I see your point, but…". Primer condicional para consecuencias reales: "If we leave now, we\'ll arrive on time" (if + presente, will + verbo).',
      ex: [
        { q: 'If it ___ tomorrow, we ___ stay home.', a: ['rains / will', 'will rain / will', 'rains / would'], ok: 0 },
        { q: "I see your point, ___ I don't agree.", a: ['but', 'so', 'because'], ok: 0 },
        { q: "If you ___ hurry, you'll miss the bus.", a: ["don't", "won't", "didn't"], ok: 0 },
        { q: '___ my opinion, the film was too long.', a: ['In', 'On', 'For'], ok: 0 },
        { order: "I see your point but I'm not so sure" },
        { order: "If we leave now we'll get there on time" }
      ]
    },
    vocab: [
      ['In my opinion…', 'En mi opinión…', 'In my opinion, it\'s too expensive.'],
      ['I totally agree', 'Estoy totalmente de acuerdo', 'I totally agree with you.'],
      ['I see your point, but…', 'Entiendo lo que decís, pero…', 'I see your point, but I think it\'s risky.'],
      ['to be worth it', 'valer la pena', 'Was the trip worth it?'],
      ['on the other hand', 'por otro lado', 'On the other hand, it\'s very convenient.'],
      ['to make sense', 'tener sentido', 'That makes sense.'],
      ['It\'s up to you', 'Depende de vos', 'Pizza or sushi? It\'s up to you.'],
      ['to be overrated', 'estar sobrevalorado', 'I think that series is overrated.'],
      ['I\'m not so sure', 'No estoy tan segura', 'I\'m not so sure about that.'],
      ['to change your mind', 'cambiar de opinión', 'I changed my mind about the trip.']
    ],
    listen: [
      { audio: "I see your point, but I think the movie was overrated. The ending didn't make sense to me.", q: 'What did he think of the movie?', a: ['It was overrated', 'It was the best of the year', 'It was too short'], ok: 0 },
      { dictation: 'In my opinion, it is worth it.' },
      { audio: "If we take the highway, we'll save an hour, but on the other hand, the coast road is more beautiful.", q: 'What is the advantage of the highway?', a: ['It is faster', 'It is more beautiful', 'It is cheaper'], ok: 0 },
      { dictation: 'It is up to you.' }
    ],
    scenario: { title: 'Debatir sobre una película', role: 'You are Chris, a friend who just watched a popular series and has strong opinions. Disagree politely with some of the learner\'s opinions so they have to defend them. Ask "why?" often.', opener: "So, have you seen anything good lately? I just finished a series everyone's talking about, and honestly, I think it's overrated." },
    challenge: 'Escribí tu opinión sobre una película, serie o libro: qué te gustó, qué no y si vale la pena. Usá "In my opinion" y "on the other hand".'
  },
  {
    n: 12, title: 'Llamadas y mensajes', sound: 'stress',
    grammar: {
      name: 'Phrasal verbs del teléfono y el email',
      tip: 'Muy usados: call back (devolver el llamado), hang up (cortar), hold on (esperar en línea), get through (lograr comunicarse), put through (pasar la llamada), look forward to (esperar con ganas), get back to (responder más tarde).',
      ex: [
        { q: "Could you ___ on a moment? I'll check.", a: ['hold', 'hang', 'get'], ok: 0 },
        { q: "I tried to call, but I couldn't get ___.", a: ['through', 'back', 'up'], ok: 0 },
        { q: "She's not here. Can she call you ___ later?", a: ['back', 'up', 'on'], ok: 0 },
        { q: "I'll put you ___ to the sales department.", a: ['through', 'on', 'off'], ok: 0 },
        { order: "I'll get back to you by Friday" },
        { order: 'Could you ask her to call me back' }
      ]
    },
    vocab: [
      ['Who\'s calling, please?', '¿Quién habla?', 'Good morning. Who\'s calling, please?'],
      ['Hold on a moment', 'Espere un momento', 'Hold on a moment, I\'ll check.'],
      ['to call back', 'devolver la llamada', 'Can you call me back in ten minutes?'],
      ['to leave a message', 'dejar un mensaje', 'Would you like to leave a message?'],
      ['to reschedule', 'reprogramar', 'Can we reschedule for Thursday?'],
      ['You\'re breaking up', 'Se corta', 'Sorry, you\'re breaking up.'],
      ['Could you speak up?', '¿Podés hablar más fuerte?', 'Could you speak up a little?'],
      ['I\'m calling about…', 'Llamo por…', 'I\'m calling about my appointment.'],
      ['to confirm', 'confirmar', 'I\'m calling to confirm the booking.'],
      ['Best regards', 'Saludos cordiales', 'Best regards, Cecilia']
    ],
    listen: [
      { audio: "Hi, this is Paula from Doctor Martin's office. I'm calling to confirm your appointment on Wednesday at ten thirty.", q: 'When is the appointment?', a: ['Wednesday at 10:30', 'Tuesday at 10:30', 'Wednesday at 12:30'], ok: 0 },
      { dictation: 'Could you call me back later?' },
      { audio: "Sorry, you're breaking up. Could you send me a message with the new time instead?", q: 'What does the speaker want?', a: ['A message with the new time', 'A call later', 'A meeting in person'], ok: 0 },
      { dictation: 'I am calling about my appointment.' }
    ],
    scenario: { title: 'Reprogramar un turno por teléfono', role: 'You are Megan, a receptionist at a dental clinic. The learner calls to reschedule an appointment. Offer two alternative times, confirm the details and spell back the name. Occasionally say the line is bad so they practise asking you to repeat.', opener: "Good morning, Brightsmile Dental Clinic, Megan speaking. How can I help you?" },
    challenge: 'Escribí un email corto para reprogramar una reunión: disculpate, proponé dos horarios nuevos y cerrá con una fórmula de despedida.'
  }
];

export const FREE_SCENARIOS = [
  { title: 'Charla libre', role: 'You are a friendly English conversation partner. Talk about whatever the learner wants, ask open questions and keep it natural.', opener: "Hi! What would you like to talk about today?" },
  { title: 'Small talk con alguien que acabás de conocer', role: 'You are Alex, a friendly stranger at a friend\'s birthday party. Make small talk.', opener: "Hi! I don't think we've met. How do you know Mariana?" },
  { title: 'Pedir indicaciones en la calle', role: 'You are a local in London. The learner is lost and asks for directions. Give clear directions with left, right, opposite, next to.', opener: 'You look a bit lost. Can I help you find something?' },
  { title: 'Reunión de trabajo', role: 'You are Tom, a project manager in a short weekly meeting. Ask the learner for a status update, a problem they have and the next steps.', opener: "Okay, let's get started. Could you give us a quick update on your side?" }
];

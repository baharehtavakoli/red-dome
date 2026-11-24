/* =====================================================================
   LANGUAGES  —  English (en) and Persian (fa).
   The language is chosen in Settings and remembered per device; the first time it follows the
   phone's language. Persian switches the page to right-to-left and the Vazirmatn font.

   t("key", { name: value })  → the UI text for the current language ({name} is filled in).
   Names of items, chains, characters and dome parts, and the whole story, are swapped in
   once at start-up (I18N.apply), so the rest of the code just reads .name / STORY as usual.
   To edit a Persian text, change it here; English story text lives in story.js.
   ===================================================================== */
(function () {
  const KEY = "reddome_lang";
  const SAVE_KEYS = ["reddome_save_v1", KEY];
  // Testers: open the game with ?reset in the address to start completely fresh.
  if (/[?&]reset\b/.test(location.search)) {
    try { SAVE_KEYS.forEach((k) => localStorage.removeItem(k)); } catch (e) {}
    history.replaceState(null, "", location.pathname);
  }
  let lang = "en", chosen = false;
  try {
    chosen = !!localStorage.getItem(KEY);
    lang = localStorage.getItem(KEY) || ((navigator.language || "").toLowerCase().startsWith("fa") ? "fa" : "en");
  } catch (e) {}
  if (lang !== "fa") lang = "en";

  const S = {
    en: {
      taleKicker1: "Nasrin-Nush's tale · Night 1", tale1Title: "The Prince in Red", taleOn: "Take the test", taleOpen: "Open the book", taleClose: "Close the book",
      tale1p1: "In my land there lived a princess, as clever as she was beautiful. Many kings came to ask for her hand, but most of them wanted her throne, not her.",
      tale1p2: "So the princess built a castle high on a mountain, and set talismans along the road to stop every stranger. The names of those who failed were hung on the city gate, for everyone to read.",
      tale1p3: "One day a young prince came to that city and saw the princess's portrait on the gate. He lost his heart at first sight. He put on red, the colour of those who seek justice, and set out for the mountain.",
      twinsLeft: "Tries left: {n}", twinsFailTitle: "The talismans woke up!", missionRetry: "Try again",
      twinsFail: "The road has closed again. Talismans are not easy: try once more.",
      use_pebble: "the foundation mortar", use_stone: "the stairs", use_red_brick: "the columns", use_red_tile: "the hall floor", use_glazed_red_tile: "the mihrab wall", use_carved_red_panel: "the porch gateway", use_rough_gem: "the turquoise patterns over the gate", use_polished_gem: "the jewels in the dome ceiling", use_pearl: "the edges of the muqarnas", use_pearl_string: "the chandelier in the hall", use_royal_pearl: "the crown on top of the dome", use_star_shard: "the dome windows", use_star: "the sunburst in the middle of the ceiling", use_astrolabe_charm: "breaking the talismans", use_seed: "the flower beds by the pool", use_sprout: "the garden beds", use_rose_bush: "the foot of the walls", use_pomegranate_tree: "the courtyard", ord_mehrab0: "Master, I need this {item} for {use}.", ord_mehrab1: "I need a {item}, master, for {use}.", ord_mehrab2: "Bring me a {item} for {use}!", ord_shideh0: "I need this {item} for {use}.", ord_shideh1: "A {item}, please, for {use}.", ord_shideh2: "We're short of a {item} for {use}.", ord_golnar0: "I want a {item} for {use}!", ord_golnar1: "Bring me a {item} for {use}!", ord_golnar2: "This {item} is for {use}!",
      taleKicker2: "Nasrin-Nush's tale · Night 2", tale2Title: "The Secret of the Talismans", tale2p1: "Tired and wounded, the prince came down the mountain and went to a sage who lived in a cave above the valley.", tale2p2: "The sage said: “Talismans are not broken with swords. Every talisman has a twin; find its twin, and it will step aside by itself.”", tale2p3: "The prince went back to the road. This time he looked at the guardians one by one, and found the twins.", doorTitle: "The Wall Without a Door", doorIntro: "Now you stand before that wall. Turn the stones until the golden lines meet and draw the door.", doorTip: "Tap a stone to turn it. When every golden line joins up, the door appears.", doorLeft: "Turns left: {n}", doorCold: "The drum stays silent.", doorWarm: "The drum trembles softly...", doorHot: "The drum answers loudly!", doorWinTitle: "The door opened!", doorWin: "The outline of the door was complete, and it opened slowly. But behind this door, the princess had left one more test...", doorFailTitle: "The door stayed hidden", doorFail: "The wall closed up again. Turn the stones more carefully, and try once more.",
      taleKicker3: "Nasrin-Nush's tale · Night 3", tale3Title: "The Wall Without a Door", tale3p1: "At the end of the road the prince reached a high wall: a wall with no door. No gate, not even a crack.", tale3p2: "The only thing on that wall was a drum, hanging there. Whoever knocked on the stones, the drum answered.", tale3p3: "The other suitors had grown tired and turned back. But the prince was patient and listened to the drum; with every beat, a golden line shone on the stones, and the outline of a hidden door began to appear.", twinsIntro: "Now you are the prince. Find the twin talismans to open the road.", twinsWin: "The talismans stepped aside. But higher up the road, something else was waiting for the prince...", guardTitle: "The Guardian Wakes", guardIntro: "At the first bend of the road, a bronze guardian opened its eyes and blocked the way. Raise your shield!", guardTip: "Merge two of the same tool to use it. The bigger the tool you make, the stronger it is.", guardBlock: "Block", guardLeft: "The guardian strikes in {n}", guardWinTitle: "The guardian fell asleep", guardWin: "The prince escaped alive. But he understood: no sword could get him past this road...", guardFailTitle: "The guardian drove the prince back", guardFail: "Catch your breath, and raise your shield again.", guardResult: "Moves: {n}", doorResult: "Turns: {n}",
      guardName: "Guardian", princeName: "Prince", guardBlocked: "Blocked!", guardWarn: "The guardian is about to strike: make a shield!", tool_sword: "Strike", tool_shield: "Block", tool_rose: "Heal", tool_star: "Delay",
      rwEnergy: "Energy", rwStars: "Stars",
      obPrev: "Back", obNext: "Next", obStart: "Build the Red Dome",
      ob1a: "Once upon a time, there lived a king named Bahram, who was fascinated by the mysteries of the sky and the planets.",
      ob1b: "He decided to visit all seven planets, and ordered a magnificent dome to be built on each one.",
      ob2: "On each night of his stay, the lady of that planet would welcome the king and tell him the most beautiful tale of her land.",
      ob3: "Building these domes was entrusted to Shideh, the king's architect.",
      ob4a: "Shideh's fourth task was to build the Red Dome.",
      ob4b: "Shideh went to meet the Lady of the Red Dome and said:\n“Tell me the tale of your land too, and I will build you the most beautiful dome.”",
      ob5: "Merge items to make new materials and tools, and help Shideh build the Red Dome, step by step. As you build, Nasrin-Nush will tell you her tale.",
      missionKicker: "Story mission", missionStart: "Start", missionLater: "Later", missionCollect: "Collect",
      twinsTitle: "The Talisman Road", twinsTip: "Turn over two talismans. If they guard the same treasure, they are twins and the road opens.",
      twinsMoves: "Tries: {n}", twinsWinTitle: "The road is open!",
      merge: "Workshop", dome: "Dome", skip: "Skip ›", skipConfirm: "Skip story? Tap again",
      deliver: "Deliver", sure: "Sure?", remove: "Remove", lv: "Lv",
      sellFor: "Sell for {n} stars", removeItem: "Remove item", activate: "Activate",
      infoHint: "Tap a <b>generator ⚡</b> to make items. Drag two matching items together to <b>merge</b>.",
      talismanInfo: "Merge an item right next to it, or use an Astrolabe Charm, to break it.",
      genInfo: "Tap to make {item} · {cost} ⚡",
      chainTitle: "{chain} chain", chainSub: "Two of the same make the next one.", gotIt: "Got it",
      wants: "{who} wants a {item}.", someone: "Someone",
      outOfEnergy: "Out of energy!", energy: "Energy", watchAd: "Watch ad", close: "Close",
      adsLeft1: "1 ad left today", adsLeftN: "{n} ads left today", noAds: "No more ads today. Come back tomorrow!",
      energyFull: "Energy is full.", energyNext: "+1 in {next} · full in {full}",
      adPlaying: "Ad playing…", adHere: "Your ad here", adFake: "Fake ad for testing — no network calls.",
      adThanks: "Thanks for watching! +{n} energy",
      settings: "Settings", stats: "Orders delivered: {orders} · Dome: {built}/{parts}",
      soundOn: "🔊 Sound: On", soundOff: "🔇 Sound: Off", replayIntro: "📜 Replay intro",
      language: "🌐 Language: English", reset: "Reset progress", resetConfirm: "Tap again to erase everything",
      builtTitle: "The Red Dome is built!", builtText: "The red light of Mars has a home. Keep merging — orders will keep coming.",
      wonderful: "Wonderful",
      orderLine: "{who}: “{line}”",
      missing: "Still missing: {items}", and: " and ", bothNeeded: "Both items are needed at the same time.",
      locked: "Locked by a talisman. Merge right next to it to break it.",
      maxed: "{item} is already at max level ✦",
      boardFull: "The board is full! Merge or deliver some items.",
      noTalismans: "No talismans around the charm. Move it next to one, then tap it.",
      charmBroke1: "The astrolabe hums... 1 talisman broken!", charmBrokeN: "The astrolabe hums... {n} talismans broken!",
      lucky: "Lucky! ✨",
      buildFirst: "Build the {part} first.",
      needMore: "{part} needs {n} more ⭐ — merge items and deliver orders!",
      hintReady: "We have the stars! Tap the {part} to build it.",
      hintNeed: "Next: the {part}. We need {n} more ⭐, so let's merge!",
      backAgain: "Press Back again to leave the game",
      tutOpen: "Let's gather materials. Tap the <b>Workshop</b>!",
      tutDig: "Tap the <b>Quarry</b> to dig up pebbles. Each tap costs 1 ⚡.",
      tutMerge: "Two of a kind make something better. <b>Drag one pebble onto the other.</b>",
      tutDeliver: "Mehrab needs a <b>Stone</b>. Tap <b>Deliver</b>!",
      tutBack: "Orders pay ⭐ stars. You have enough for the first part. <b>Back to the dome!</b>",
      tutBuild: "Tap here to <b>build</b> the terrace!",
      tutToBoard: "Back to the workshop: tap <b>Workshop</b>.",
      tutToScene: "Tap here to go back to the dome.",
      tutDone: "Well done! Merge, deliver orders and build the whole Red Dome.",
      dailyTitle: "Daily Gift", dailyText: "Come back every day. Miss a day and the calendar starts again.",
      day: "Day {n}", claim: "Claim day {n}", claimed: "Today's gift is claimed. See you tomorrow!",
      dailyToast: "Day {n} gift: {gift}", boardFullStars: " (board full: +{n} ⭐)",
    },
    fa: {
      taleKicker1: "قصه‌ی نسرین‌نوش · شب اول", tale1Title: "شاهزاده‌ی سرخ‌پوش", taleOn: "آزمون را بده", taleOpen: "باز کردن کتاب", taleClose: "بستن کتاب",
      tale1p1: "در سرزمین من بانویی بود، هم زیرک و هم زیبا. شاهان بسیاری به خواستگاری‌اش آمدند، اما بیشترشان تاج و تخت او را می‌خواستند، نه خودش را.",
      tale1p2: "پس بانو دژی بر فراز کوه ساخت و بر سر راهش طلسم‌هایی گذاشت که هر غریبه‌ای را بازمی‌داشتند. نام آن‌ها که شکست می‌خوردند بر دروازه‌ی شهر آویخته می‌شد تا همه بخوانند.",
      tale1p3: "روزی شاهزاده‌ای جوان به آن شهر رسید و بر دروازه، تصویر بانو را دید. از همان نگاه دلش رفت. جامه‌ی سرخ پوشید، رنگ دادخواهی، و رو به کوه گذاشت.",
      twinsLeft: "تلاش‌های باقی‌مانده: {n}", twinsFailTitle: "طلسم‌ها بیدار شدند!", missionRetry: "دوباره امتحان کن",
      twinsFail: "راه دوباره بسته شد. طلسم‌ها آسان نیستند؛ یک بار دیگر امتحان کن.",
      use_pebble: "ملات پی", use_stone: "پله‌ها", use_red_brick: "ستون‌ها", use_red_tile: "کف تالار", use_glazed_red_tile: "دیوار محراب", use_carved_red_panel: "سردر ایوان", use_rough_gem: "نقش‌های فیروزه‌ای سردر", use_polished_gem: "نگین‌های سقف گنبد", use_pearl: "لبه‌ی مقرنس‌ها", use_pearl_string: "آویز چلچراغ تالار", use_royal_pearl: "تاج نوک گنبد", use_star_shard: "پنجره‌های گنبد", use_star: "شمسه‌ی وسط سقف", use_astrolabe_charm: "شکستن طلسم‌ها", use_seed: "باغچه‌های کنار حوض", use_sprout: "کرت‌های باغ", use_rose_bush: "پای دیوارها", use_pomegranate_tree: "حیاط", ord_mehrab0: "استاد، این {item} رو برای {use} می‌خوام.", ord_mehrab1: "{item} لازم دارم، استاد؛ برای {use}.", ord_mehrab2: "چند تا {item} برسون، برای {use}!", ord_shideh0: "این {item} رو برای {use} لازم دارم.", ord_shideh1: "{item} می‌خوام؛ برای {use}.", ord_shideh2: "برای {use}، {item} کم داریم.", ord_golnar0: "{item} رو برای {use} می‌خوام!", ord_golnar1: "برای {use} یه {item} بیار!", ord_golnar2: "برای {use}، {item} لازمه!",
      taleKicker2: "قصه‌ی نسرین‌نوش · شب دوم", tale2Title: "راز طلسم‌ها", tale2p1: "شاهزاده خسته و زخمی از کوه پایین آمد و سراغ حکیمی رفت که در غاری بالای دره زندگی می‌کرد.", tale2p2: "حکیم گفت: «طلسم را با شمشیر نمی‌شکنند. هر طلسمی جفتی دارد؛ جفتش را پیدا کن تا خودش کنار برود.»", tale2p3: "شاهزاده به جاده برگشت. این بار نگهبان‌ها را یکی‌یکی نگاه کرد و جفت‌ها را پیدا کرد.", doorTitle: "دیوار بی‌در", doorIntro: "حالا تو پای آن دیواری. سنگ‌ها را بچرخان تا خط‌های طلایی به هم برسند و نقش در کامل شود.", doorTip: "روی هر سنگ بزن تا بچرخد. وقتی همه‌ی خط‌های طلایی به هم وصل شوند، در پیدا می‌شود.", doorLeft: "چرخش‌های باقی‌مانده: {n}", doorCold: "طبل ساکت ماند.", doorWarm: "طبل آرام لرزید…", doorHot: "طبل بلند جواب داد!", doorWinTitle: "در باز شد!", doorWin: "نقش در کامل شد و در آرام باز شد. ولی پشت این در، بانو آزمون دیگری هم گذاشته بود…", doorFailTitle: "در پنهان ماند", doorFail: "دیوار دوباره بسته شد. با دقت بیشتری بچرخان و یک بار دیگر امتحان کن.",
      taleKicker3: "قصه‌ی نسرین‌نوش · شب سوم", tale3Title: "دیوار بی‌در", tale3p1: "جاده که تمام شد، شاهزاده به دیواری بلند رسید؛ دیواری بی‌در. نه دروازه‌ای، نه حتی شکافی.", tale3p2: "تنها چیزی که بر آن دیوار بود، طبلی بود آویخته. هر که بر سنگ‌ها می‌کوبید، طبل جوابش را می‌داد.", tale3p3: "خواستگاران دیگر خسته شده و برگشته بودند. ولی شاهزاده صبر کرد و به طبل گوش داد؛ با هر ضربه، خطی طلایی بر سنگ‌ها می‌درخشید و نقش دری پنهان پیدا می‌شد.", twinsIntro: "حالا تو جای شاهزاده‌ای. جفت طلسم‌ها را پیدا کن تا راه باز شود.", twinsWin: "طلسم‌ها کنار رفتند. ولی بالای جاده، چیز دیگری انتظار شاهزاده را می‌کشید…", guardTitle: "نگهبان بیدار شد", guardIntro: "در نخستین پیچ جاده، نگهبانی مفرغی چشم گشود و راه را بست. سپرت را بالا بگیر!", guardTip: "دو ابزار یکسان را روی هم بکش تا به کار بیفتد. هر چه ابزار بزرگ‌تری بسازی، قوی‌تر است.", guardBlock: "دفاع", guardLeft: "ضربه‌ی نگهبان تا {n} حرکت دیگر", guardWinTitle: "نگهبان به خواب رفت", guardWin: "شاهزاده جان سالم به در برد. ولی فهمید با شمشیر نمی‌شود از این جاده گذشت…", guardFailTitle: "نگهبان شاهزاده را عقب راند", guardFail: "نفسی تازه کن و دوباره سپر را بالا بگیر.", guardResult: "حرکت‌ها: {n}", doorResult: "چرخش‌ها: {n}",
      guardName: "نگهبان", princeName: "شاهزاده", guardBlocked: "دفع شد!", guardWarn: "نگهبان آماده‌ی ضربه است؛ سپر بساز!", tool_sword: "ضربه", tool_shield: "دفاع", tool_rose: "درمان", tool_star: "درنگ",
      rwEnergy: "انرژی", rwStars: "ستاره",
      obPrev: "قبلی", obNext: "بعدی", obStart: "ساخت گنبد سرخ",
      ob1a: "روزی روزگاری، پادشاهی به نام بهرام زندگی می‌کرد که شیفته‌ی رازهای آسمان و سیاره‌ها بود.",
      ob1b: "او تصمیم گرفت از هر هفت سیاره دیدن کند و فرمان داد در هر یک، گنبدی باشکوه بنا کنند.",
      ob2: "قرار بود در هر شب اقامت، بانوی آن سیاره میزبان پادشاه باشد و زیباترین افسانه‌ی سرزمینش را برای او روایت کند.",
      ob3: "ساخت این گنبدها به شیده، معمار پادشاه، سپرده شد.",
      ob4a: "چهارمین مأموریت شیده، ساخت گنبد سرخ بود.",
      ob4b: "شیده به دیدار بانوی گنبد سرخ رفت و گفت:\n«قصه‌ی سرزمینت را برای من هم روایت کن، تا زیباترین گنبد را برایت بسازم.»",
      ob5: "با ترکیب آیتم‌ها، مصالح و ابزار تازه بساز و به شیده کمک کن گنبد سرخ را قدم‌به‌قدم کامل کند. در همین حین، نسرین‌نوش قصه‌اش را برایت روایت خواهد کرد.",
      missionKicker: "مأموریت قصه", missionStart: "شروع", missionLater: "بعداً", missionCollect: "دریافت",
      twinsTitle: "جاده‌ی طلسم‌ها", twinsTip: "دو طلسم را برگردان. اگر از یک گنج نگهبانی کنند، جفت هم‌اند و راه باز می‌شود.",
      twinsMoves: "تلاش‌ها: {n}", twinsWinTitle: "راه باز شد!",
      merge: "کارگاه", dome: "گنبد", skip: "رد شدن ›", skipConfirm: "داستان رد شود؟ دوباره بزنید",
      deliver: "تحویل", sure: "مطمئنی؟", remove: "حذف", lv: "سطح",
      sellFor: "فروش به {n} ستاره", removeItem: "حذف آیتم", activate: "فعال کن",
      infoHint: "روی یک <b>مولد ⚡</b> بزنید تا آیتم بسازد. دو آیتم یکسان را روی هم بکشید تا <b>ترکیب</b> شوند.",
      talismanInfo: "کنارش دو آیتم یکسان را ترکیب کنید، یا از اسطرلاب استفاده کنید، تا بشکند.",
      genInfo: "بزنید تا {item} بسازد · {cost} ⚡",
      chainTitle: "زنجیره‌ی {chain}", chainSub: "دو تای یکسان، بعدی را می‌سازند.", gotIt: "فهمیدم",
      wants: "{who} یک {item} می‌خواهد.", someone: "کسی",
      outOfEnergy: "انرژی تمام شد!", energy: "انرژی", watchAd: "تماشای تبلیغ", close: "بستن",
      adsLeft1: "امروز ۱ تبلیغ مانده", adsLeftN: "امروز {n} تبلیغ مانده", noAds: "تبلیغ امروز تمام شد. فردا برگردید!",
      energyFull: "انرژی پر است.", energyNext: "+۱ تا {next} دیگر · پر شدن تا {full}",
      adPlaying: "در حال پخش تبلیغ…", adHere: "جای تبلیغ شما", adFake: "تبلیغ آزمایشی است و به اینترنت وصل نمی‌شود.",
      adThanks: "ممنون از تماشا! +{n} انرژی",
      settings: "تنظیمات", stats: "سفارش‌های تحویل‌شده: {orders} · گنبد: {built}/{parts}",
      soundOn: "🔊 صدا: روشن", soundOff: "🔇 صدا: خاموش", replayIntro: "📜 پخش دوباره‌ی پیش‌درآمد",
      language: "🌐 زبان: فارسی", reset: "شروع از اول", resetConfirm: "برای پاک کردن همه‌چیز دوباره بزنید",
      builtTitle: "گنبد سرخ ساخته شد!", builtText: "نور سرخ مریخ خانه پیدا کرد. به ساختن ادامه دهید؛ سفارش‌ها باز هم می‌آیند.",
      wonderful: "عالی",
      orderLine: "{who}: «{line}»",
      missing: "هنوز کم است: {items}", and: " و ", bothNeeded: "هر دو آیتم باید هم‌زمان روی صفحه باشند.",
      locked: "با طلسم قفل شده. کنارش دو آیتم یکسان را ترکیب کنید تا بشکند.",
      maxed: "{item} به آخرین سطح رسیده ✦",
      boardFull: "صفحه پر است! چند آیتم را ترکیب یا تحویل دهید.",
      noTalismans: "طلسمی کنار اسطرلاب نیست. آن را کنار یک طلسم ببرید و بزنید.",
      charmBroke1: "اسطرلاب زمزمه می‌کند... ۱ طلسم شکست!", charmBrokeN: "اسطرلاب زمزمه می‌کند... {n} طلسم شکست!",
      lucky: "خوش‌شانسی! ✨",
      buildFirst: "اول {part} را بسازید.",
      needMore: "{part} {n} ستاره‌ی دیگر لازم دارد. آیتم بسازید و سفارش تحویل دهید!",
      hintReady: "ستاره‌ها جورند! روی {part} بزن تا بسازیمش.",
      hintNeed: "بعدی: {part}. {n} ستاره‌ی دیگه لازم داریم؛ بریم سراغ کارگاه!",
      backAgain: "برای خروج از بازی دوباره «بازگشت» را بزنید",
      tutOpen: "برویم مصالح جمع کنیم. روی <b>کارگاه</b> بزن!",
      tutDig: "روی <b>معدن</b> بزن تا سنگریزه دربیاید. هر ضربه ۱ ⚡ است.",
      tutMerge: "دو تای یکسان، چیز بهتری می‌سازند. <b>یک سنگریزه را روی دیگری بکش.</b>",
      tutDeliver: "مهراب یک <b>سنگ</b> می‌خواهد. <b>تحویل</b> را بزن!",
      tutBack: "سفارش‌ها ⭐ ستاره می‌دهند. برای اولین بخش کافی است. <b>برگرد به گنبد!</b>",
      tutBuild: "اینجا بزن تا <b>سکو</b> ساخته شود!",
      tutToBoard: "برگرد به کارگاه: روی <b>کارگاه</b> بزن.",
      tutToScene: "اینجا بزن تا به گنبد برگردی.",
      tutDone: "آفرین! آیتم‌ها را ترکیب کن، سفارش تحویل بده و کل گنبد سرخ را بساز.",
      dailyTitle: "هدیه‌ی روزانه", dailyText: "هر روز سر بزنید. اگر یک روز جا بیفتد، تقویم از اول شروع می‌شود.",
      day: "روز {n}", claim: "گرفتن هدیه‌ی روز {n}", claimed: "هدیه‌ی امروز را گرفتید. فردا می‌بینمتان!",
      dailyToast: "هدیه‌ی روز {n}: {gift}", boardFullStars: " (صفحه پر بود: +{n} ⭐)",
    },
  };

  /* Persian names. Items by id, chains by key, characters by key, dome parts by id. */
  const FA_NAMES = {
    chains: { stone: "سنگ", garden: "باغ", jewel: "جواهر", magic: "جادو" },
    generators: { quarry: "معدن", flower_pot: "گلدان", jewel_box: "صندوقچه‌ی جواهر", star_chest: "صندوق ستاره" },
    items: {
      pebble: "سنگریزه", stone: "سنگ", red_brick: "آجر سرخ", red_tile: "کاشی سرخ", glazed_red_tile: "کاشی لعابی سرخ", carved_red_panel: "قاب کنده‌کاری سرخ",
      seed: "دانه", sprout: "جوانه", rose_bush: "بوته‌ی گل سرخ", pomegranate_tree: "درخت انار",
      rough_gem: "سنگ خام", polished_gem: "گوهر صیقلی", pearl: "مروارید", pearl_string: "رشته‌ی مروارید", royal_pearl: "مروارید شاهانه",
      star_shard: "تکه‌ستاره", star: "ستاره", astrolabe_charm: "اسطرلاب جادویی",
    },
    characters: {
      shideh: ["شیده", "معمار"], nasrin: ["نسرین‌نوش", "شاهزاده"], mehrab: ["مهراب", "شاگرد شیده"],
      golnar: ["گلنار", "باغبان"], sage: ["حکیم", "زاهد کوهستان"],
    },
    parts: {
      terrace: "سکو", stairs: "پلکان سنگی", walls: "دیوارهای آجری", arch: "ایوان و درها", balcony: "تالار",
      dome: "گنبد سرخ", tiles: "کاشی‌کاری", towers: "برج‌ها", pool: "حوض و فواره", garden: "باغ",
    },
    talisman: "طلسم",
  };

  const FA_STORY = {
    intro: {
      chapter: "پیش‌درآمد", title: "هفت نور",
      lines: [
        "روزگاری، بهرام‌شاه هفت گنبد خواست؛ هر کدام برای یکی از نورهایی که در آسمان می‌گردند.",
        "کیوان، برجیس، خورشید، ناهید، تیر، ماه... و مریخ، آن سرخ‌رو، که نام دیگرش بهرام است.",
        "یک شب، ستاره‌ی سرخ تنها یک پرتو فرستاد؛ روی دشتی برهنه بر فراز کوه.",
        "همین‌جاست. مریخ درست به همین‌جا اشاره کرد.",
        "استاد، اینجا جز سنگ چیزی نیست. آن طرح درخشان چیست؟",
        "نقشه‌ی من است؛ با اسطرلاب کشیده‌امش. حالا نور را سنگ می‌کنیم.",
        "پس تو همان معماری. من نسرین‌نوشم، از سرزمین‌های شمال. این گنبد از آنِ من خواهد بود.",
        "خوب بسازش، تا قصه‌ای از سرزمینم برایت بگویم. برای هر بخشی که می‌سازی، تکه‌ای از قصه.",
        "و این مهرهای طلایی که همه‌جای کارگاه پخش‌اند؟",
        "نور مریخ است که در نقشه گیر افتاده. دو چیز یکسان را درست کنارش ترکیب کن تا بشکند.",
      ],
    },
    terrace: { chapter: "فصل ۱", title: "سنگ نخست", lines: [

    ] },
    stairs: { chapter: "فصل ۲", title: "پله‌های سنگی", lines: [
      "مادرم این قصه را روی همین کوه برایم می‌گفت. آن موقع اینجا فقط باد بود.",
      "حالا یه گنبد داره.",
      "…بنشین. نوبت من است.",
    ] },
    walls: { chapter: "فصل ۳", title: "دیوارها", lines: [

    ] },
    arch: { chapter: "فصل ۴", title: "طاق بزرگ", lines: [
      "این طاق را ببین؛ هر سنگش جفتی دارد که به آن تکیه داده.",
      "اگه یکی‌شون نباشه، طاق می‌ریزه.",
      "راز طلسم‌های قصه‌ی ما هم همین بود. بنشین.",
    ] },
    balcony: { chapter: "فصل ۵", title: "گلنار باغبان", lines: [
      "سلام! من گلنارم، باغبونِ ده پایین.",
      "خوش اومدی، گلنار. این باغ با دست تو جون می‌گیره.",
      "دورتادور گنبد گل سرخ می‌کارم.",
    ] },
    dome: { chapter: "فصل ۶", title: "حکیم کوهستان", lines: [
      "سلام، معمار. من حکیم این کوهم؛ سی سال است از اینجا ستاره‌ها را می‌شمارم.",
      "پس اسطرلاب کار شما بود. جای گنبد رو درست نشونم داد.",
      "من فقط ستاره را نشان دادم. ساختنش کار تو بود.",
      "شما هم بنشینید. این بخش قصه را حتماً باید بشنوید.",
    ] },
    tiles: { chapter: "فصل ۷", title: "کاشی‌های سرخ", lines: [

    ] },
    towers: { chapter: "فصل ۸", title: "برج‌ها", lines: [
      "از بالای برج، راهی که شاه از آن می‌آید پیداست.",
      "نگرانی؟",
      "نه. فقط می‌خواهم ببینم کی می‌رسد.",
    ] },
    pool: { chapter: "فصل ۹", title: "دو گنبد", lines: [

    ] },
    garden: { chapter: "فصل ۱۰", title: "گنبد سرخ", lines: [
      "انارها گل دادن! زودتر از همیشه.",
      "استاد! پیک شاه اومده. سه‌شنبه می‌رسه! باید برم بازار یه لباس نو بخرم!",
      "قصه‌ام آماده است. گنبدم هم.",
      "پس من می‌رم سراغ گنبد بعدی.",
      "شیده… ممنونم.",
    ] },
  };

  const FA_BARKS = {
    shideh: ["آجر به آجر، گنبد رو با هم می‌سازیم.", "از همین الان سرخیش رو می‌بینم.", "مصالح کم داریم. یه سر به کارگاه بزن."],
    mehrab: [
      "استاد، کارگاه باز پر از سنگریزه شد! من نبودم.",
      "دو تا جوونه کنار هم، یه بوته‌ی گل سرخ! دارم یاد می‌گیرم.",
      "از این سنگ‌های آبی مروارید ساختم! نگاه کن، استاد.",
      { text: "شب‌ها صدای طلسم‌ها رو می‌شنوم. شما هم می‌شنوین، استاد؟", reply: { who: "shideh", text: "می‌شنوم. ولی طلسم‌ها با ما کاری ندارن." } },
    ],
    golnar: ["گل سرخ و انار؛ باغ دیگه چی می‌خواد؟", "یه دونه بهم بده، یه باغ تحویل بگیر."],
    nasrin: ["این کوه سال‌ها منتظر چنین گنبدی بود.", "هر معمایی جوابش کلمه نیست."],
  };

  const I18N = {
    lang,
    rtl: lang === "fa",
    chosen, // false until the player has picked a language once

    /* First launch: a full-screen choice of language. Calls done() when the game can go on
       (picking the other language reloads the page in that language). */
    ask(done) {
      const bg = (window.GAME_CONFIG.scene.intro || {}).sky || "";
      const el = document.createElement("div");
      el.id = "lang-pick";
      el.innerHTML = `
        ${bg ? `<img class="lp-bg" src="${bg}" alt="">` : ""}
        <div class="lp-card">
          <div class="lp-title">The Red Dome<br><span>گنبد سرخ</span></div>
          <p>Choose your language<br><span>زبان بازی را انتخاب کنید</span></p>
          <button class="btn gold wide" data-l="fa">فارسی</button>
          <button class="btn wide" data-l="en">English</button>
          <button class="lp-reset" data-reset>⟲ Reset game · شروع از اول</button>
        </div>`;
      document.body.appendChild(el);
      el.addEventListener("click", (e) => {
        const r = e.target.closest("[data-reset]");
        if (r) {
          // two taps, so it isn't hit by accident
          if (!r.classList.contains("confirm")) {
            r.classList.add("confirm");
            r.textContent = "Tap again to erase everything · برای پاک شدن دوباره بزنید";
            return;
          }
          this.resetAll();
          return;
        }
        const b = e.target.closest("[data-l]");
        if (!b) return;
        const l = b.dataset.l;
        try { localStorage.setItem(KEY, l); } catch (err) {}
        if (l !== lang) { location.reload(); return; }
        this.chosen = true;
        el.classList.add("out");
        setTimeout(() => el.remove(), 400);
        done && done();
      });
    },

    /* Erase the save and the language choice, and start again from the language screen. */
    resetAll() {
      if (window.State) { State.saveNow = () => {}; State.save = () => {}; } // don't write the old game back on unload
      try { SAVE_KEYS.forEach((k) => localStorage.removeItem(k)); } catch (e) {}
      location.reload();
    },

    set(l) {
      try { localStorage.setItem(KEY, l); } catch (e) {}
      location.reload();
    },

    /* Swap names, story and lines for the chosen language. Runs once, before the game boots. */
    apply() {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
      document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = window.t(el.dataset.i18n); });
      if (lang !== "fa") return;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;600;700;800;900&display=swap";
      document.head.appendChild(link);

      Object.entries(window.CHAINS).forEach(([k, c]) => {
        c.name = FA_NAMES.chains[k] || c.name;
        c.generator.name = FA_NAMES.generators[c.generator.id] || c.generator.name;
        c.items.forEach((it) => { it.name = FA_NAMES.items[it.id] || it.name; });
      });
      Object.entries(window.CHARACTERS).forEach(([k, c]) => {
        const n = FA_NAMES.characters[k];
        if (n) { c.name = n[0]; c.role = n[1]; }
      });
      window.GAME_CONFIG.domeParts.forEach((p) => { p.name = FA_NAMES.parts[p.id] || p.name; });
      window.GAME_CONFIG.talisman.name = FA_NAMES.talisman;
      // story: same speakers and order as story.js, Persian text
      Object.entries(FA_STORY).forEach(([id, fa]) => {
        const s = window.STORY[id];
        if (!s) return;
        s.chapter = fa.chapter;
        s.title = fa.title;
        s.lines.forEach((ln, i) => { if (fa.lines[i]) ln.text = fa.lines[i]; });
      });
      window.BARKS = FA_BARKS;
    },
  };

  window.t = function (key, vars) {
    let s = (S[lang] && S[lang][key]) ?? S.en[key] ?? key;
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
    return s;
  };
  window.I18N = I18N;
  I18N.apply();
})();

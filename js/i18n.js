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
      taleKicker1: "Nasrin-Nush's tale · Night 1", tale1Title: "The Talisman Road", taleOn: "Take the test", taleOpen: "Open the book", taleClose: "Close the book",
      tale1p1: "In my land there lived a princess, as clever as she was beautiful. Many kings came to ask for her hand, but most of them wanted her throne, not her.",
      tale1p2: "So the princess built a castle high on a mountain, and set talismans along the road to stop every stranger. The names of those who failed were hung on the city gate, for everyone to read.",
      tale1p3: "Every talisman on that road had a twin. Only a suitor who found the twins could pass.",
      twinsLeft: "Tries left: {n}", twinsFailTitle: "The talismans woke up!", missionRetry: "Try again",
      twinsFail: "The road has closed again. Talismans are not easy: try once more.",
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
      twinsIntro: "Now you are the suitor. Can you find the twins and open the road?",
      twinsMoves: "Tries: {n}", twinsWinTitle: "The road is open!",
      twinsWin: "You would have passed the road! But the princess had harder tests still. Keep building and I'll tell you.",
      merge: "Merge", dome: "Dome", skip: "Skip ›", skipConfirm: "Skip story? Tap again",
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
      tutOpen: "Let's gather materials. Tap <b>Merge</b>!",
      tutDig: "Tap the <b>Quarry</b> to dig up pebbles. Each tap costs 1 ⚡.",
      tutMerge: "Two of a kind make something better. <b>Drag one pebble onto the other.</b>",
      tutDeliver: "Mehrab needs a <b>Stone</b>. Tap <b>Deliver</b>!",
      tutBack: "Orders pay ⭐ stars. You have enough for the first part. <b>Back to the dome!</b>",
      tutBuild: "Tap here to <b>build</b> the terrace!",
      tutToBoard: "Back to the board: tap <b>Merge</b>.",
      tutToScene: "Tap here to go back to the dome.",
      tutDone: "Well done! Merge, deliver orders and build the whole Red Dome.",
      dailyTitle: "Daily Gift", dailyText: "Come back every day. Miss a day and the calendar starts again.",
      day: "Day {n}", claim: "Claim day {n}", claimed: "Today's gift is claimed. See you tomorrow!",
      dailyToast: "Day {n} gift: {gift}", boardFullStars: " (board full: +{n} ⭐)",
    },
    fa: {
      taleKicker1: "قصه‌ی نسرین‌نوش · شب اول", tale1Title: "جاده‌ی طلسم‌ها", taleOn: "آزمون را بده", taleOpen: "باز کردن کتاب", taleClose: "بستن کتاب",
      tale1p1: "در سرزمین من بانویی بود، هم زیرک و هم زیبا. شاهان بسیاری به خواستگاری‌اش آمدند، اما بیشترشان تاج و تخت او را می‌خواستند، نه خودش را.",
      tale1p2: "پس بانو دژی بر فراز کوه ساخت و بر سر راهش طلسم‌هایی گذاشت که هر غریبه‌ای را بازمی‌داشتند. نام آن‌ها که شکست می‌خوردند بر دروازه‌ی شهر آویخته می‌شد تا همه بخوانند.",
      tale1p3: "هر طلسمِ آن جاده جفتی داشت. تنها خواستگاری که جفت‌ها را می‌یافت، می‌توانست از جاده بگذرد.",
      twinsLeft: "تلاش‌های باقی‌مانده: {n}", twinsFailTitle: "طلسم‌ها بیدار شدند!", missionRetry: "دوباره امتحان کن",
      twinsFail: "راه دوباره بسته شد. طلسم‌ها آسان نیستند؛ یک بار دیگر امتحان کن.",
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
      twinsIntro: "حالا تو جای خواستگاری. می‌توانی جفت طلسم‌ها را پیدا کنی و راه را باز کنی؟",
      twinsMoves: "تلاش‌ها: {n}", twinsWinTitle: "راه باز شد!",
      twinsWin: "تو از جاده می‌گذشتی! ولی بانو آزمون‌های سخت‌تری هم داشت. بساز تا برایت بگویم.",
      merge: "ادغام", dome: "گنبد", skip: "رد شدن ›", skipConfirm: "داستان رد شود؟ دوباره بزنید",
      deliver: "تحویل", sure: "مطمئنی؟", remove: "حذف", lv: "سطح",
      sellFor: "فروش به {n} ستاره", removeItem: "حذف آیتم", activate: "فعال کن",
      infoHint: "روی یک <b>مولد ⚡</b> بزنید تا آیتم بسازد. دو آیتم یکسان را روی هم بکشید تا <b>ادغام</b> شوند.",
      talismanInfo: "کنارش یک آیتم ادغام کنید، یا از اسطرلاب استفاده کنید، تا بشکند.",
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
      builtTitle: "گنبد سرخ ساخته شد!", builtText: "نور سرخ مریخ خانه پیدا کرد. ادغام را ادامه دهید؛ سفارش‌ها باز هم می‌آیند.",
      wonderful: "عالی",
      orderLine: "{who}: «{line}»",
      missing: "هنوز کم است: {items}", and: " و ", bothNeeded: "هر دو آیتم باید هم‌زمان روی صفحه باشند.",
      locked: "با طلسم قفل شده. کنارش ادغام کنید تا بشکند.",
      maxed: "{item} به آخرین سطح رسیده ✦",
      boardFull: "صفحه پر است! چند آیتم را ادغام یا تحویل دهید.",
      noTalismans: "طلسمی کنار اسطرلاب نیست. آن را کنار یک طلسم ببرید و بزنید.",
      charmBroke1: "اسطرلاب زمزمه می‌کند... ۱ طلسم شکست!", charmBrokeN: "اسطرلاب زمزمه می‌کند... {n} طلسم شکست!",
      lucky: "خوش‌شانسی! ✨",
      buildFirst: "اول {part} را بسازید.",
      needMore: "{part} {n} ستاره‌ی دیگر لازم دارد. ادغام کنید و سفارش تحویل دهید!",
      hintReady: "ستاره‌ها جورند! روی {part} بزن تا بسازیمش.",
      hintNeed: "بعدی: {part}. {n} ستاره‌ی دیگر لازم داریم؛ برویم سراغ ادغام!",
      backAgain: "برای خروج از بازی دوباره «بازگشت» را بزنید",
      tutOpen: "برویم مصالح جمع کنیم. روی <b>ادغام</b> بزن!",
      tutDig: "روی <b>معدن</b> بزن تا سنگریزه دربیاید. هر ضربه ۱ ⚡ است.",
      tutMerge: "دو تای یکسان، چیز بهتری می‌سازند. <b>یک سنگریزه را روی دیگری بکش.</b>",
      tutDeliver: "مهراب یک <b>سنگ</b> می‌خواهد. <b>تحویل</b> را بزن!",
      tutBack: "سفارش‌ها ⭐ ستاره می‌دهند. برای اولین بخش کافی است. <b>برگرد به گنبد!</b>",
      tutBuild: "اینجا بزن تا <b>سکو</b> ساخته شود!",
      tutToBoard: "برگرد به صفحه‌ی ادغام: روی <b>ادغام</b> بزن.",
      tutToScene: "اینجا بزن تا به گنبد برگردی.",
      tutDone: "آفرین! ادغام کن، سفارش تحویل بده و کل گنبد سرخ را بساز.",
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
        "نور مریخ است که در نقشه گیر افتاده. دو چیز یکسان را درست کنارش ادغام کن تا بشکند.",
      ],
    },
    terrace: { chapter: "فصل ۱", title: "سنگ نخست", lines: [
      "سکو گذاشته شد؛ درست همون‌جا که پرتو افتاد.",
      "یه تیکه‌ی دیگه بسازیم، استاد! بعدش نسرین‌نوش قول داده قصه‌ش رو برامون بگه.",
    ] },
    stairs: { chapter: "فصل ۲", title: "پله‌های سنگی", lines: [
      "پله‌ها آماده‌ست. گنبد اولین قدم‌هاش رو برداشت.",
      "دو تیکه ساختی، همون‌طور که قول داده بودم. حالا نوبت قصه‌ی منه: قصه‌ی سرزمینم رو گوش کن.",
    ] },
    walls: { chapter: "فصل ۳", title: "دیوارها", lines: [
      "دیوارها بالا رفت. حالا باد به نقشه‌مون نمی‌رسه.",
      "بعدی طاق بزرگه. آجرها با من!",
    ] },
    arch: { chapter: "فصل ۴", title: "طاق بزرگ", lines: [
      "طاق محکم وایساد. هر سنگ به سنگ کناری‌ش تکیه داده.",
      "مثل ما، استاد!",
    ] },
    balcony: { chapter: "فصل ۵", title: "گلنار باغبان", lines: [
      "من گلنارم، باغبون. زیر همچین ایوون قشنگی باید گل سرخ کاشت!",
      "باغ مال تو، گلنار. وقتش که برسه.",
    ] },
    dome: { chapter: "فصل ۶", title: "حکیم کوهستان", lines: [
      "من حکیم کوهستانم. گنبد بسته شد؛ حالا نور سرخ خونه داره.",
      "راه درازی اومدی تا ببینیش.",
      "برای همچین گنبدی، دو برابرش رو هم میام.",
    ] },
    tiles: { chapter: "فصل ۷", title: "کاشی‌های سرخ", lines: [
      "ببین کاشی‌ها چه برقی می‌زنن، استاد! سرخ مثل مریخ.",
      "هر کاشی سر جای خودش؛ مثل ستاره‌ها توی مدارشون.",
    ] },
    towers: { chapter: "فصل ۸", title: "برج‌ها", lines: [
      "برج‌ها بالا رفت. از بالاش سه تا دره پیداست.",
      "پس شاه گنبدش رو از دور می‌بینه.",
    ] },
    pool: { chapter: "فصل ۹", title: "دو گنبد", lines: [
      "آب جلوی گنبد... حالا دو تا گنبد داریم: یکی توی آسمون، یکی توی حوض.",
      "از اول توی نقشه بود.",
    ] },
    garden: { chapter: "فصل ۱۰", title: "گنبد سرخ", lines: [
      "باغ کاشته شد! گل سرخ و انار، دورتادور گنبد.",
      "استاد! پیک بهرام‌شاه اومده. شاه سه‌شنبه میاد؛ روز مریخ.",
      "پس گنبد سرخش رو تموم‌شده می‌بینه، و قصه‌ی من هم آماده‌ست. ممنونم، شیده.",
      "و شش گنبد دیگه منتظر منه.",
    ] },
  };

  const FA_ORDER_LINES = {
    mehrab: ["بناها منتظرند، استاد!", "این‌ها را برای داربست می‌دهی؟", "خودم بالا می‌برمشان، قول می‌دهم."],
    nasrin: ["آرزوهای یک شاهزاده ساده است.", "این‌ها را برایم بیاور، معمار.", "گنبد بهترین‌ها را می‌خواهد."],
    golnar: ["گل‌های سرخم هم‌نشین می‌خواهند.", "خاک بالاخره آماده است!", "باغ با صبر قد می‌کشد."],
  };

  const FA_BARKS = {
    shideh: ["هر ادغام ما را یک قدم نزدیک‌تر می‌کند.", "از همین حالا گنبد را سرخ و درخشان می‌بینم.", "روی یک مولد بزن تا مصالح دربیاید."],
    mehrab: ["استاد، صفحه باز پر از سنگریزه شد!", "دو تای یکسان چیز بهتری می‌سازند. دارم یاد می‌گیرم!", "سفارش‌ها ستاره می‌دهند. ستاره، سنگ و طلا می‌خرد.", "شنیدی؟ طلسم‌ها شب‌ها زمزمه می‌کنند."],
    golnar: ["گل سرخ و انار؛ باغ همین‌ها را می‌خواهد.", "دانه بیاور تا معجزه نشانت بدهم."],
    nasrin: ["گنبدی سرخ... درست مثل قصه‌ی سرزمینم.", "هر معمایی با کلمه جواب داده نمی‌شود."],
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
      window.ORDER_LINES = FA_ORDER_LINES;
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

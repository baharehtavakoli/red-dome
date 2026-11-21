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
      obNext: "Next", obStart: "Build the Red Dome",
      ob1a: "Once upon a time, there lived a king named Bahram, who was fascinated by the mysteries of the sky and the planets.",
      ob1b: "He decided to visit all seven planets, and ordered a magnificent dome to be built on each one.",
      ob2: "On each night of his stay, the lady of that planet would welcome the king and tell him the most beautiful tale of her land.",
      ob3: "Building these domes was entrusted to Shideh, the king's architect.",
      ob4a: "Shideh's fourth task was the Red Dome. So Shideh went to meet the Lady of the Red Dome and said:",
      ob4b: "“Tell me the tale of your land too, and I will build you the most beautiful dome.”",
      ob5: "Merge items to make new materials and tools, and help Shideh build the Red Dome, step by step. As you build, Nasrin-Nush will tell you her tale.",
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
      obNext: "بعدی", obStart: "ساخت گنبد سرخ",
      ob1a: "روزی روزگاری، پادشاهی به نام بهرام زندگی می‌کرد که شیفته‌ی رازهای آسمان و سیاره‌ها بود.",
      ob1b: "او تصمیم گرفت از هر هفت سیاره دیدن کند و فرمان داد در هر یک، گنبدی باشکوه بنا کنند.",
      ob2: "قرار بود در هر شب اقامت، بانوی آن سیاره میزبان پادشاه باشد و زیباترین افسانه‌ی سرزمینش را برای او روایت کند.",
      ob3: "ساخت این گنبدها به شیده، معمار پادشاه، سپرده شد.",
      ob4a: "چهارمین مأموریت شیده، ساخت گنبد سرخ بود. شیده به دیدار بانوی گنبد سرخ رفت و گفت:",
      ob4b: "«قصه‌ی سرزمینت را برای من هم روایت کن، تا زیباترین گنبد را برایت بسازم.»",
      ob5: "با ترکیب آیتم‌ها، مصالح و ابزار تازه بساز و به شیده کمک کن گنبد سرخ را قدم‌به‌قدم کامل کند. در همین حین، نسرین‌نوش قصه‌اش را برایت روایت خواهد کرد.",
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
      "سکو گذاشته شد؛ درست همان‌جا که پرتو افتاد.",
      "پس قصه‌ی من شروع می‌شود. در سرزمین من شاهزاده‌ای بود، به همان اندازه زیرک که زیبا.",
      "همه‌ی پادشاهان خواستگارش بودند. بیشترشان پادشاهی‌اش را می‌خواستند.",
      "پس پایه‌ای محکم لازم داشت. مثل همین.",
    ] },
    stairs: { chapter: "فصل ۲", title: "راه طلسم‌ها", lines: [
      "دژی بر کوه ساخت و در راهش طلسم گذاشت: نگهبانان مفرغی که با گذر هر غریبه بیدار می‌شدند.",
      "مثل همین مهرهای طلایی روی صفحه‌ی ما!",
      "همان فکر است. نوری که در یک نقش گیر افتاده. نقش را بشکنی، راه باز می‌شود.",
      "کم خواستگاری از نخستین طلسم گذشت.",
    ] },
    walls: { chapter: "فصل ۳", title: "نام‌ها بر دروازه", lines: [
      "نام آن‌ها که شکست می‌خوردند بر دروازه‌ی شهر آویخته می‌شد تا همه بخوانند.",
      "سخت‌گیرانه است. ولی دیوار هم بیرون را نگه می‌دارد، هم درون را.",
      "شاهزاده این را از هر کسی بهتر می‌دانست.",
    ] },
    arch: { chapter: "فصل ۴", title: "دری که با گوش پیدا شد", lines: [
      "پس از طلسم‌ها دیواری بود بی‌در. فقط یک طبل از آن آویخته بود.",
      "و هر که گوش داد، در را پیدا کرد؟",
      "فقط آن‌ها که صبور بودند.",
      "پس بیایید دری بسازیم که با گوش پیدا شود، استاد!",
      "در نقشه هست. به لنگه‌ی چپ بکوب.",
    ] },
    balcony: { chapter: "فصل ۵", title: "تصویر", lines: [
      "این تکه را مادربزرگم تعریف می‌کند! شاهزاده‌ای تصویر نقاشی‌شده‌ی آن دختر را دید...",
      "...و دیگر نتوانست چهره‌اش را فراموش کند. بله. مادربزرگت خوب تعریفش می‌کند.",
      "می‌گوید از آن روز سرخ پوشید؛ مثل کسی که دادخواهی می‌کند.",
      "سرخ. مثل همین گنبد.",
    ] },
    dome: { chapter: "فصل ۶", title: "حکیم کوهستان", lines: [
      "گنبد بسته شد. خوب است. حالا نور سرخ خانه دارد.",
      "راه درازی آمده‌ای، پیرمرد.",
      "در قصه، شاهزاده هم پیش از بالا رفتن از کوه نزد من آمد.",
      "وقتی کاشی‌ها آماده شد، همان را که به او گفتم به تو هم می‌گویم.",
    ] },
    tiles: { chapter: "فصل ۷", title: "هر طلسمی جفتی دارد", lines: [
      "گوش کن: هر طلسمی جفتی دارد. تکه‌های همسان را کنار هم بگذار تا افسون خودش باز شود.",
      "تکه‌های همسان... این که دقیقاً کار ما روی صفحه است!",
      "و این کاشی‌ها نقش قفل‌اند. هر ستاره جواب یکی از مهرهای راه است.",
      "حالا راز شاهزاده را می‌دانی.",
    ] },
    towers: { chapter: "فصل ۸", title: "شاهزاده‌ی سرخ‌پوش", lines: [
      "شاهزاده سرخ‌پوش بالا رفت و طلسم‌ها را دو به دو شکست؛ همان‌طور که حکیم یادش داده بود.",
      "به طبل گوش داد و در را پیدا کرد.",
      "و شاهزاده‌خانم؟",
      "منتظر بود. با معماهایش.",
    ] },
    pool: { chapter: "فصل ۹", title: "معماهای مروارید", lines: [
      "دو مروارید برایش فرستاد: عمر کوتاه است. او سه تا پس فرستاد: پس شیرینش کن.",
      "مرواریدها را با شکر سایید؛ او شیر رویش ریخت و همه را نوشید. یک مروارید فرستاد؛ او جفت بی‌همتایش را یافت.",
      "و فهمید که او همان است.",
      "سخن آسان دروغ می‌گوید. مروارید نه.",
    ] },
    garden: { chapter: "فصل ۱۰", title: "گنبد سرخ", lines: [
      "عروسی کردند و او نگهبانانش را به خواب فرستاد.",
      "و در باغی مثل همین زندگی کردند!",
      "استاد! پیکی از سوی بهرام‌شاه. سه‌شنبه می‌آید؛ روز مریخ.",
      "پس گنبد سرخش را تمام‌شده می‌بیند. و عروسی که این قصه را... خوب می‌داند.",
      "خوب می‌داند؟ نسرین... آن شاهزاده خودت بودی؟",
      "هر قصه کمی راز لازم دارد، معمار. شش گنبد دیگر منتظر توست.",
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

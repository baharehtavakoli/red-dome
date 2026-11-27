/* =====================================================================
   GAME CONFIG  —  art paths, characters, scene, board, energy, orders.
   Changing the board layout only affects NEW games (Settings -> Reset progress).

   ART: every path below is optional. If the PNG exists it is used,
   otherwise a placeholder (emoji / drawn shape) is shown.
   ===================================================================== */

/* ---------- Characters ----------
   portrait  large half-body image used in story scenes (assets/characters/)
             Transparent PNG, roughly 600x900, character's waist at the bottom edge.
   avatar    small round head used on order cards
   emoji     placeholder face when the images are missing
   color     name-tag / placeholder clothing colour
   body      folder of full-body poses (one PNG per pose in POSES), used for characters standing
             in the Dome Scene */
window.POSES = ["neutral", "happy", "surprised", "sad", "angry", "arms_open"];
window.CHARACTERS = {
  shideh: { name: "Shideh",      role: "Architect",           emoji: "👷‍♀️", color: "#9b1c1c",
            portrait: "assets/characters/shideh.webp?v=2", avatar: "assets/characters/shideh_avatar.webp?v=2",
            body: "assets/characters/full_body/shideh/" },
  nasrin: { name: "Nasrin-Nush", role: "Princess",            emoji: "👸",   color: "#b8860b",
            portrait: "assets/characters/nasrin.webp", avatar: "assets/characters/nasrin_avatar.webp",
            body: "assets/characters/full_body/nasrin/" },
  mehrab: { name: "Mehrab",      role: "Shideh's apprentice", emoji: "🧑‍🔧", color: "#137470",
            portrait: "assets/characters/mehrab.webp", avatar: "assets/characters/mehrab_avatar.webp",
            body: "assets/characters/full_body/mehrab/" },
  golnar: { name: "Golnar",      role: "Gardener",            emoji: "👩‍🌾", color: "#3f7a2f",
            portrait: "assets/characters/golnar.webp", avatar: "assets/characters/golnar_avatar.webp",
            body: "assets/characters/full_body/golnar/" },
  sage:   { name: "The Sage",    role: "Hermit of the hills", emoji: "🧙",   color: "#5b3a8c",
            portrait: "assets/characters/sage.webp",   avatar: "assets/characters/sage_avatar.webp",
            body: "assets/characters/full_body/sage/" },
};

window.GAME_CONFIG = {
  cols: 7,
  rows: 9,

  /* Try to load PNGs from art paths. Set false to skip (silences 404s). */
  tryImages: true,

  /* ---------- The Dome Scene (main screen) ----------
     The scene is a fixed "world" of width x height units (portrait 9:16).
     Draw your background at this ratio (e.g. 720x1280 or 1080x1920).
     Everything below (part boxes, task buttons) uses these world units. */
  scene: {
    width: 360,
    height: 640,
    background: "assets/scenes/stages/stage_00.webp", // empty plateau with the whole building as a golden blueprint
    stagedArt: true, // parts are cut from stage paintings (tools/cut_stages.py): "ruined" layers only show while building
    buildStyle: "blueprint", // "blueprint": the golden outline glows and the part rises into place; "ruin": shake + dust
    // onboarding pictures (js/onboard.js). bahram / ladies / architect / build are optional:
    // until their files exist, the onboarding falls back to sky, ray and the scene background.
    intro: {
      sky: "assets/scenes/intro/intro_sky.webp", ray: "assets/scenes/intro/intro_ray.webp",
      bahram: "assets/scenes/intro/intro_bahram.webp", ladies: "assets/scenes/intro/intro_ladies.webp",
      domeTop: "assets/scenes/intro/intro_dome_top.webp", meet: "assets/scenes/intro/intro_meet.webp?v=2",
    },
    maxZoom: 2.6, // how far the camera may zoom into a part

    /* Characters standing in the scene, in one row across the courtyard.
       cx = centre of the figure, feet = where they stand, h = height (all world units).
       Keep cx within ~60-300 (phones crop the edges) and leave ~65 between centres so
       nobody overlaps. flip: true makes them face left (use it right of centre).
       after: a dome part id; they only appear once that part is restored.
       Tap one and they say a line from BARKS (story.js). With full-body poses they stand in
       "neutral" and switch pose while talking; without them the half-body portrait is used. */
    residents: [
      { who: "shideh", cx: 62,  feet: 556, h: 104 },
      { who: "nasrin", cx: 126, feet: 552, h: 100, after: "dome" },
      { who: "golnar", cx: 236, feet: 552, h: 96, flip: true, after: "garden" },
      { who: "mehrab", cx: 298, feet: 556, h: 100, flip: true },
    ],
    barkEverySeconds: 16, // a random resident speaks up this often while you're on the scene
  },

  /* ---------- Restorable parts ----------
     Restored in this order. Each has:
       cost      stars needed
       story     scene key in story.js, played after the build animation
       box       where the part's art layers sit in the world {x, y, w, h} (from tools/stage_parts.json)
       focus     what the camera frames while it's being built (defaults to box)
       button    centre of its task button in world units {x, y}
       ruined    art before it's built: the golden blueprint (drawn to fill `box`)
       restored  art once it's built (drawn to fill `box`)
       emoji     shown on the task button
     Parts are layered in list order (later = on top). */
  domeParts: [
    // Build order. `layer` = paint order: the part layers were cut from the stage paintings in the old order
    // (terrace, stairs, walls, arch, balcony, dome, tiles, towers, pool, garden), so a later layer must stay on top.
    { id: "stairs", layer: 1, name: "Stone Stairs", cost: 5, story: "stairs", icon: "assets/scenes/parts/icon_stairs.webp?v=4", emoji: "🪜",
      box: { x: 31, y: 163, w: 298, h: 319 }, focus: { x: 70, y: 420, w: 220, h: 85 }, button: { x: 180, y: 392 }, // above the fountain
      ruined: "assets/scenes/parts/stairs_ruined.webp?v=4", restored: "assets/scenes/parts/stairs_restored.webp?v=4" },
    { id: "pool", layer: 8, name: "Pool & Fountain", cost: 8, story: "pool", tale: "tale1", mission: "guard", keepBlueprint: true, icon: "assets/scenes/parts/icon_pool.webp?v=5", emoji: "⛲",
      box: { x: 69, y: 0, w: 291, h: 513 }, focus: { x: 90, y: 450, w: 180, h: 75 }, button: { x: 180, y: 488 },
      ruined: "assets/scenes/parts/pool_ruined.webp?v=4", restored: "assets/scenes/parts/pool_restored.webp?v=5" },
    { id: "terrace", layer: 0, name: "Terrace", cost: 12, story: "terrace", emoji: "🧱",
      box: { x: 0, y: 161, w: 360, h: 371 }, focus: { x: 0, y: 330, w: 360, h: 150 }, button: { x: 300, y: 392 }, // on the right stone wall, clear of the fountain and the Workshop button // frame the stone side walls, stairs and the paved yard: what actually changes
      ruined: "assets/scenes/parts/terrace_ruined.webp?v=3", restored: "assets/scenes/parts/terrace_restored.webp?v=3" },
    { id: "walls", layer: 2, name: "Red Brick Walls", cost: 18, story: "walls", emoji: "🧱",
      box: { x: 0, y: 34, w: 360, h: 406 }, focus: { x: 25, y: 265, w: 310, h: 185 }, button: { x: 90, y: 360 },
      ruined: "assets/scenes/parts/walls_ruined.webp?v=3", restored: "assets/scenes/parts/walls_restored.webp?v=3" },
    { id: "arch", layer: 3, name: "Iwan & Doors", cost: 24, story: "arch", tale: "tale2", mission: "twins", emoji: "🚪",
      box: { x: 31, y: 163, w: 273, h: 260 }, focus: { x: 120, y: 290, w: 120, h: 160 }, button: { x: 180, y: 330 },
      ruined: "assets/scenes/parts/arch_ruined.webp?v=3", restored: "assets/scenes/parts/arch_restored.webp?v=3" },
    { id: "balcony", layer: 4, name: "Balcony", cost: 32, story: "balcony", emoji: "🏛️",
      box: { x: 22, y: 36, w: 337, h: 404 }, focus: { x: 30, y: 210, w: 300, h: 100 }, button: { x: 180, y: 250 },
      ruined: "assets/scenes/parts/balcony_ruined.webp?v=3", restored: "assets/scenes/parts/balcony_restored.webp?v=3" },
    { id: "dome", layer: 5, name: "Red Dome", cost: 42, story: "dome", tale: "tale3", mission: "door", emoji: "🕌",
      box: { x: 0, y: 34, w: 360, h: 425 }, focus: { x: 95, y: 60, w: 170, h: 160 }, button: { x: 180, y: 140 },
      ruined: "assets/scenes/parts/dome_ruined.webp?v=3", restored: "assets/scenes/parts/dome_restored.webp?v=3" },
    { id: "tiles", layer: 6, name: "Tilework", cost: 52, story: "tiles", emoji: "💠",
      box: { x: 0, y: 5, w: 360, h: 502 }, focus: { x: 30, y: 250, w: 300, h: 200 }, button: { x: 270, y: 360 },
      ruined: "assets/scenes/parts/tiles_ruined.webp?v=3", restored: "assets/scenes/parts/tiles_restored.webp?v=3" },
    { id: "towers", layer: 7, name: "Towers", cost: 64, story: "towers", emoji: "🗼",
      box: { x: 0, y: 0, w: 360, h: 513 }, focus: { x: 20, y: 150, w: 320, h: 150 }, button: { x: 62, y: 210 },
      ruined: "assets/scenes/parts/towers_ruined.webp?v=3", restored: "assets/scenes/parts/towers_restored.webp?v=3" },
    { id: "garden", layer: 9, name: "Garden", cost: 80, story: "garden", emoji: "🌳",
      box: { x: 0, y: 15, w: 360, h: 443 }, focus: { x: 0, y: 280, w: 360, h: 220 }, button: { x: 84, y: 430 },
      ruined: "assets/scenes/parts/garden_ruined.webp?v=3", restored: "assets/scenes/parts/garden_restored.webp?v=3" },
  ],

  energy: {
    max: 60,           // regen stops here (rewards and the start can go above it)
    start: 100,        // a long first session, then refills every ~2 h
    regenSeconds: 120, // +1 energy every 2 minutes
    adReward: 20,
    adSeconds: 2.5,    // length of the fake ad
    adsPerDay: 4,      // rewarded ads per day (0 = unlimited)
    partReward: 20,    // energy gift for every dome part built
  },

  /* Daily gift calendar (js/daily.js): one entry per day, energy / stars / an item for the board. */
  daily: [
    { energy: 20 },
    { stars: 3 },
    { energy: 30 },
    { item: { chain: "stone", level: 3 } },
    { stars: 6 },
    { energy: 40, item: { chain: "jewel", level: 3 } },
    { energy: 60, stars: 10 },
  ],

  /* Chance that a generator drops an item one level higher than usual. */
  luckyDropChance: 0.12,

  startStars: 0,

  /* Tale nights (js/tale.js): Nasrin-Nush's tale as a storybook, opened by domeParts[].tale, then its mission.
     img = the page's picture; until it exists, fallback is shown (fit: "cover" | "contain" | "portrait"). */
  taleBook: "assets/scenes/tale/tale_book.webp", // the storybook on the desk, shown before every tale night
  tales: {
    // night 1, after the Pool & Fountain: the princess, her castle, the prince in red; then he fights a guardian
    tale1: {
      host: "nasrin", kicker: "taleKicker1", title: "tale1Title", mission: "guard",
      pages: [
        { key: "tale1p1", img: "assets/scenes/tale/tale1_1.webp", fallback: "assets/characters/nasrin.webp", fit: "portrait" },
        { key: "tale1p2", img: "assets/scenes/tale/tale1_2.webp", fallback: "assets/scenes/intro/intro_ladies.webp" },
        { key: "tale1p3", img: "assets/scenes/tale/tale1_3b.webp", fallback: "assets/scenes/tale/tale1_3.webp" },
      ],
    },
    // night 2, after the arch: the sage and the secret of the twin talismans
    tale2: {
      host: "nasrin", kicker: "taleKicker2", title: "tale2Title", mission: "twins",
      pages: [
        { key: "tale2p1", img: "assets/scenes/tale/tale2_1.webp", fallback: "assets/scenes/tale/tale1_2.webp" },
        { key: "tale2p2", img: "assets/scenes/tale/tale2_2.webp", fallback: "assets/tiles/talisman.webp", fit: "contain" },
        { key: "tale2p3", img: "assets/scenes/tale/tale1_3.webp", fallback: "assets/scenes/tale/tale1_3.webp" },
      ],
    },
    // night 3, after the dome: the wall without a door
    tale3: {
      host: "nasrin", kicker: "taleKicker3", title: "tale3Title", mission: "door",
      pages: [
        { key: "tale3p1", img: "assets/scenes/tale/tale3_1.webp", fallback: "assets/scenes/tale/tale1_2.webp" },
        { key: "tale3p2", img: "assets/scenes/tale/tale3_2.webp", fallback: "assets/scenes/tale/tale1_2.webp" },
        { key: "tale3p3", img: "assets/scenes/tale/tale3_3.webp", fallback: "assets/scenes/tale/tale1_3.webp" },
      ],
    },
  },

  /* Story missions (js/mission.js): a mini-game after a chapter, opened by domeParts[].mission. */
  missions: {
    twins: { host: "nasrin", maxTries: 14, reward: { energy: 20, stars: 3 } }, // after the Stone Stairs; 6 pairs, 14 tries
    door: { host: "nasrin", extraTurns: 6, reward: { energy: 25, stars: 5 } },  // after the dome; turns allowed = fewest needed + 6
    guard: { host: "nasrin", reward: { energy: 20, stars: 3 },   // after the pool: the merge battle with a bronze guardian
             guardianHp: 12, princeHp: 6,   // its temper (how often/hard it strikes) is GUARD_PHASES in mission.js
             bg: "assets/scenes/battle/battle_bg.webp", bgFallback: "assets/scenes/tale/tale1_2.webp",
             guardianArt: "assets/scenes/battle/guardian.webp", guardianFallback: "assets/scenes/tale/guardian_body_temp.webp",
             princeArt: "assets/scenes/battle/prince.webp", princeFallback: "assets/scenes/tale/prince_temp.webp",
             // poses swap in during the fight as soon as the files exist (see ART_BRIEF_BATTLE.md)
             poses: {
               prince: { idle: "assets/scenes/battle/prince_idle.webp", ready: "assets/scenes/battle/prince_ready.webp", attack: "assets/scenes/battle/prince_attack.webp", block: "assets/scenes/battle/prince_block.webp", hurt: "assets/scenes/battle/prince_hurt.webp" },
               guardian: { idle: "assets/scenes/battle/guardian_idle.webp", windup: "assets/scenes/battle/guardian_windup.webp", strike: "assets/scenes/battle/guardian_strike.webp", fallen: "assets/scenes/battle/guardian_fallen.webp" },
             },
             poseScale: { prince: { attack: 1.22 } },   // the lunge was drawn ~20% smaller than the other poses
             fx: { slash: "assets/scenes/battle/fx_slash.webp", impact: "assets/scenes/battle/fx_impact.webp", wave: "assets/scenes/battle/fx_wave.webp" },
             // tool icons by level (1-4); until they exist the board shows emoji
             // one icon per tool (the battle has no levels any more)
             tools: {
               sword: "assets/scenes/battle/sword.webp",
               shield: "assets/scenes/battle/shield.webp",
               rose: "assets/scenes/battle/rosewater.webp",
               star: "assets/scenes/battle/delay.webp",
             } },
  },

  talisman: {
    name: "Talisman",
    icon: "assets/tiles/talisman.webp",
    emoji: "🔯",
    revealChance: 0.6, // chance a broken talisman leaves a random level-1 item
  },

  /* Merge board layout, one string per row (7 chars each). */
  layout: [
    "TTTTTTT",
    "TXT.TYT",
    "T.a.b.T",
    "..Q.F..",
    ".c...d.",
    "..J.S..",
    ".......",
    "TZ...WT",
    "TTTTTTT",
  ],
  legend: {
    ".": null,
    T: { talisman: true },
    Q: { gen: "stone" },
    F: { gen: "garden" },
    J: { gen: "jewel" },
    S: { gen: "magic" },
    a: { chain: "stone", level: 1 },
    b: { chain: "garden", level: 1 },
    c: { chain: "jewel", level: 1 },
    d: { chain: "magic", level: 1 },
    // Talismans hiding a better item, so breaking the inner ring pays off:
    X: { talisman: true, hides: { chain: "stone", level: 3 } },
    Y: { talisman: true, hides: { chain: "garden", level: 3 } },
    Z: { talisman: true, hides: { chain: "jewel", level: 2 } },
    W: { talisman: true, hides: { chain: "stone", level: 2 } },
  },

  orders: {
    slots: 3,
    refillDelayMs: 700,
    twoItemChance: 0.45,
    baseMaxLevel: 2,   // highest level requested before any dome part is restored
    levelPerPart: 0.5, // max level rises by 1 every 2 dome parts
    starReward: [1, 2, 5, 11, 24, 50, 100], // stars per item, by level (index 0 = level 1); higher levels pay better
    twoItemBonus: 2,
    /* Who gives orders, and which chains they like to ask for. */
    givers: {
      mehrab: { chains: ["stone", "magic", "stone"] },
      shideh: { chains: ["jewel", "magic", "stone"] },
      golnar: { chains: ["garden", "jewel", "garden"] },
    },
  },
};

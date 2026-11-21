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
            portrait: "assets/characters/shideh.png", avatar: "assets/characters/shideh_avatar.png",
            body: "assets/characters/full_body/shideh/" },
  nasrin: { name: "Nasrin-Nush", role: "Princess",            emoji: "👸",   color: "#b8860b",
            portrait: "assets/characters/nasrin.png", avatar: "assets/characters/nasrin_avatar.png",
            body: "assets/characters/full_body/nasrin/" },
  mehrab: { name: "Mehrab",      role: "Shideh's apprentice", emoji: "🧑‍🔧", color: "#137470",
            portrait: "assets/characters/mehrab.png", avatar: "assets/characters/mehrab_avatar.png",
            body: "assets/characters/full_body/mehrab/" },
  golnar: { name: "Golnar",      role: "Gardener",            emoji: "👩‍🌾", color: "#3f7a2f",
            portrait: "assets/characters/golnar.png", avatar: "assets/characters/golnar_avatar.png",
            body: "assets/characters/full_body/golnar/" },
  sage:   { name: "The Sage",    role: "Hermit of the hills", emoji: "🧙",   color: "#5b3a8c",
            portrait: "assets/characters/sage.png",   avatar: "assets/characters/sage_avatar.png",
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
    background: "assets/scenes/stages/stage_00.png", // the full ruin; restored parts fade in over it
    stagedArt: true, // parts are cut from stage paintings (tools/cut_stages.py): ruined layers only show while building
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
       box       where the part sits in the world {x, y, w, h}
       button    centre of its task button in world units {x, y}
       ruined    art for the ruined state  (drawn to fill `box`)
       restored  art for the restored state (drawn to fill `box`)
       emoji     shown on the task button
     Parts are layered in list order (later = on top). */
  domeParts: [
    { id: "stairs", name: "Stone Stairs", cost: 5, story: "stairs", emoji: "🪜",
      box: { x: 48, y: 407, w: 261, h: 79 }, button: { x: 177, y: 441 },
      ruined: "assets/scenes/parts/stairs_ruined.png", restored: "assets/scenes/parts/stairs_restored.png" },
    { id: "terrace", name: "Terrace", cost: 8, story: "terrace", emoji: "🧱",
      box: { x: 0, y: 409, w: 360, h: 65 }, button: { x: 174, y: 434 },
      ruined: "assets/scenes/parts/terrace_ruined.png", restored: "assets/scenes/parts/terrace_restored.png" },
    { id: "walls", name: "Red Brick Walls", cost: 12, story: "walls", emoji: "🧱",
      box: { x: 25, y: 274, w: 311, h: 147 }, button: { x: 176, y: 321 },
      ruined: "assets/scenes/parts/walls_ruined.png", restored: "assets/scenes/parts/walls_restored.png" },
    { id: "arch", name: "Iwan & Doors", cost: 18, story: "arch", emoji: "🚪",
      box: { x: 116, y: 281, w: 124, h: 140 }, button: { x: 178, y: 349 },
      ruined: "assets/scenes/parts/arch_ruined.png", restored: "assets/scenes/parts/arch_restored.png" },
    { id: "balcony", name: "Balcony", cost: 24, story: "balcony", emoji: "🏛️",
      box: { x: 20, y: 184, w: 319, h: 109 }, button: { x: 180, y: 231 },
      ruined: "assets/scenes/parts/balcony_ruined.png", restored: "assets/scenes/parts/balcony_restored.png" },
    { id: "dome", name: "Red Dome", cost: 32, story: "dome", emoji: "🕌",
      box: { x: 55, y: 59, w: 250, h: 146 }, button: { x: 179, y: 152 },
      ruined: "assets/scenes/parts/dome_ruined.png", restored: "assets/scenes/parts/dome_restored.png" },
    { id: "tiles", name: "Tilework", cost: 42, story: "tiles", emoji: "💠",
      box: { x: 40, y: 259, w: 279, h: 99 }, button: { x: 179, y: 302 },
      ruined: "assets/scenes/parts/tiles_ruined.png", restored: "assets/scenes/parts/tiles_restored.png" },
    { id: "towers", name: "Towers", cost: 52, story: "towers", emoji: "🗼",
      box: { x: 20, y: 127, w: 320, h: 154 }, button: { x: 62, y: 184 },
      ruined: "assets/scenes/parts/towers_ruined.png", restored: "assets/scenes/parts/towers_restored.png" },
    { id: "pool", name: "Pool & Fountain", cost: 64, story: "pool", emoji: "⛲",
      box: { x: 87, y: 431, w: 186, h: 80 }, button: { x: 180, y: 477 },
      ruined: "assets/scenes/parts/pool_ruined.png", restored: "assets/scenes/parts/pool_restored.png" },
    { id: "garden", name: "Garden", cost: 80, story: "garden", emoji: "🌳",
      box: { x: 0, y: 197, w: 360, h: 260 }, button: { x: 62, y: 342 },
      ruined: "assets/scenes/parts/garden_ruined.png", restored: "assets/scenes/parts/garden_restored.png" },
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

  /* Chance that a generator drops an item one level higher than usual. */
  luckyDropChance: 0.12,

  startStars: 0,

  talisman: {
    name: "Talisman",
    icon: "assets/tiles/talisman.png",
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
      nasrin: { chains: ["jewel", "magic", "stone"] },
      golnar: { chains: ["garden", "jewel", "garden"] },
    },
  },
};

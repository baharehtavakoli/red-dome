/* =====================================================================
   STORY  —  scene text and order flavour lines. Rewrite freely.
   (Characters and their art paths live in config.js -> CHARACTERS.)

   STORY  sceneId -> {
            chapter, title,
            cast:  [leftCharacter, rightCharacter]  who stands on stage at the start
            lines: [{ who, text, side? }]
          }
          `who` is a CHARACTERS key. If a speaker isn't on stage they replace
          whoever spoke least recently (or force a side with side: "left"/"right").
          Scenes are triggered by "intro" (first launch) and by dome parts
          (config.js -> domeParts[].story).

   ORDER_LINES  characterKey -> short lines shown when tapping an order card.
   ===================================================================== */
window.STORY = {
  /* bg: "sky" / "ray" shows a full-screen picture behind the dialogue (config.js -> scene.intro),
     bg: "none" goes back to the Dome Scene. who: "narrator" has no portrait and no name tag. */
  intro: {
    chapter: "Prologue",
    title: "Seven Lights",
    cast: ["shideh", "mehrab"],
    lines: [
      { who: "narrator", bg: "sky", text: "Long ago, King Bahram asked for seven domes: one for each light that wanders the sky." },
      { who: "narrator", text: "Saturn, Jupiter, the Sun, Venus, Mercury, the Moon... and Mars, the red one, whose other name is Bahram." },
      { who: "narrator", bg: "ray", text: "One evening the red star sent down a single ray, onto a bare mountain plateau." },
      { who: "shideh", bg: "none", text: "This is the place. Mars pointed right at it." },
      { who: "mehrab", text: "There's nothing here but stones, master. And that glowing... drawing?" },
      { who: "shideh", text: "My plan, drawn with the astrolabe. Now we turn light into stone." },
      { who: "nasrin", side: "right", text: "So you're the architect. I am Nasrin-Nush, from the lands of the north. This dome will be mine." },
      { who: "nasrin", text: "Build it well, and I'll tell you a tale from my country. One piece for every part you build." },
      { who: "mehrab", side: "right", text: "And the golden seals all over the site?" },
      { who: "shideh", text: "Mars-light caught in the plan. Merge two of a kind right next to one, and it breaks open." },
    ],
  },

  terrace: {
    chapter: "Chapter 1",
    title: "The First Stone",
    cast: ["shideh", "mehrab"],
    lines: [
      { who: "shideh", text: "The terrace is down, right where the ray fell." },
      { who: "mehrab", text: "One more part, master! Then Lady Nasrin-Nush has promised us her tale." },
    ],
  },

  stairs: {
    chapter: "Chapter 2",
    title: "The Talisman Road",
    cast: ["shideh", "nasrin"],
    lines: [
      { who: "shideh", text: "The stairs are ready. The dome has taken its first steps." },
      { who: "nasrin", text: "Two parts built, as promised. Now it's my turn: listen to the tale of my land." },
    ],
  },

  walls: {
    chapter: "Chapter 3",
    title: "The Walls",
    cast: ["shideh", "mehrab"],
    lines: [
      { who: "shideh", text: "The walls are up. Now the wind can't touch our plan." },
      { who: "mehrab", text: "Next comes the great arch. I'll carry the bricks!" },
    ],
  },

  arch: {
    chapter: "Chapter 4",
    title: "The Great Arch",
    cast: ["shideh", "mehrab"],
    lines: [
      { who: "shideh", text: "The arch holds. Every stone leans on the one beside it." },
      { who: "mehrab", text: "Like us, master!" },
    ],
  },

  balcony: {
    chapter: "Chapter 5",
    title: "The Gardener",
    cast: ["shideh", "golnar"],
    lines: [
      { who: "golnar", text: "I'm Golnar, the gardener. A balcony this beautiful needs roses under it!" },
      { who: "shideh", text: "Then the garden is yours, Golnar, when the time comes." },
    ],
  },

  dome: {
    chapter: "Chapter 6",
    title: "The Sage of the Hills",
    cast: ["shideh", "sage"],
    lines: [
      { who: "sage", text: "I am the sage of the hills. The dome is closed: now the red light has a home." },
      { who: "shideh", text: "You came a long way to see it." },
      { who: "sage", text: "For a dome like this, I would walk twice as far." },
    ],
  },

  tiles: {
    chapter: "Chapter 7",
    title: "Crimson Tiles",
    cast: ["mehrab", "sage"],
    lines: [
      { who: "mehrab", text: "Look how the tiles shine, master! Red like Mars." },
      { who: "sage", text: "Each tile in its place, like the stars on their paths." },
    ],
  },

  towers: {
    chapter: "Chapter 8",
    title: "The Towers",
    cast: ["shideh", "nasrin"],
    lines: [
      { who: "shideh", text: "The towers are up. From the top you can see three valleys." },
      { who: "nasrin", text: "Then the king will see his dome from far away." },
    ],
  },

  pool: {
    chapter: "Chapter 9",
    title: "Two Domes",
    cast: ["shideh", "nasrin"],
    lines: [
      { who: "nasrin", text: "Water in front of the dome... Now there are two domes: one in the sky, one in the pool." },
      { who: "shideh", text: "That was in the plan from the start." },
    ],
  },

  garden: {
    chapter: "Chapter 10",
    title: "The Red Dome",
    cast: ["shideh", "nasrin"],
    lines: [
      { who: "golnar", side: "left", text: "The garden is planted! Roses and pomegranates, all around the dome." },
      { who: "mehrab", side: "left", text: "Master! A herald from King Bahram. He comes on Tuesday, the day of Mars." },
      { who: "nasrin", text: "Then he'll find his red dome finished, and my tale ready. Thank you, Shideh." },
      { who: "shideh", side: "left", text: "And six more domes are waiting for me." },
    ],
  },
};

window.ORDER_LINES = {
  mehrab: [
    "The masons are waiting, master!",
    "Can you spare these for the scaffold?",
    "I'll carry them up, promise.",
  ],
  nasrin: [
    "A princess has simple wishes.",
    "Bring me these, architect.",
    "The dome deserves the finest.",
  ],
  golnar: [
    "My roses want company.",
    "The soil is finally ready!",
    "Gardens grow on patience.",
  ],
};

/* BARKS: short lines characters say in their speech bubble when you tap them
   in the Dome Scene (or now and then on their own).
   Shideh also says a live hint about the next part to build (see scene.js). */
window.BARKS = {
  shideh: [
    "Every merge gets us closer.",
    "I can already see the dome glowing red.",
    "Tap a generator on the board to get materials.",
  ],
  mehrab: [
    "Master, the board is full of pebbles again!",
    "Two of the same make something better. I'm learning!",
    "The orders pay in stars. Stars buy stone and gold.",
    "Did you hear that? The talismans hum at night.",
  ],
  golnar: [
    "Roses and pomegranates, that's all a garden needs.",
    "Bring me seeds and I'll show you a miracle.",
  ],
  nasrin: [
    "A red dome... just like in the tale from my country.",
    "Not every riddle is answered with words.",
  ],
};

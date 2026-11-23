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
      { who: "mehrab", text: "Master, the terrace is perfectly flat! I put a marble on it and it didn't roll." },
      { who: "shideh", text: "Did you pick your marble up?" },
      { who: "mehrab", text: "...Picking it up now." },
    ],
  },

  stairs: {
    chapter: "Chapter 2",
    title: "Stone Stairs",
    cast: ["mehrab", "nasrin"],
    lines: [
      { who: "mehrab", text: "Thirty-three steps! I counted twice. Once it came to thirty-four." },
      { who: "nasrin", text: "My mother told me this tale on this very mountain. Back then there was nothing here but wind." },
      { who: "shideh", side: "left", text: "Now it has stairs." },
      { who: "nasrin", text: "Then sit down. It's my turn." },
    ],
  },

  walls: {
    chapter: "Chapter 3",
    title: "The Walls",
    cast: ["shideh", "nasrin"],
    lines: [
      { who: "nasrin", text: "From here I can't see the plain anymore." },
      { who: "shideh", text: "You'll see a red dome instead." },
      { who: "mehrab", side: "left", text: "I can see the plain from up here! Come on up if you like, there's room." },
    ],
  },

  arch: {
    chapter: "Chapter 4",
    title: "The Great Arch",
    cast: ["shideh", "mehrab"],
    lines: [
      { who: "mehrab", text: "What a strong arch I built!" },
      { who: "shideh", text: "You built?" },
      { who: "mehrab", text: "Well... with your engineering, master." },
    ],
  },

  balcony: {
    chapter: "Chapter 5",
    title: "The Gardener",
    cast: ["shideh", "golnar"],
    lines: [
      { who: "golnar", text: "Hello! I'm Golnar, the gardener from the village below." },
      { who: "shideh", text: "Welcome, Golnar. This garden will come alive in your hands." },
      { who: "golnar", text: "I'll plant red roses all around the dome." },
    ],
  },

  dome: {
    chapter: "Chapter 6",
    title: "The Sage of the Hills",
    cast: ["shideh", "sage"],
    lines: [
      { who: "sage", text: "Greetings, architect. I am the sage of this mountain; for thirty years I have counted the stars from here." },
      { who: "shideh", text: "So the astrolabe was yours. It showed me exactly where the dome should go." },
      { who: "sage", text: "I only showed you the star. Building it was your work." },
    ],
  },

  tiles: {
    chapter: "Chapter 7",
    title: "Crimson Tiles",
    cast: ["shideh", "mehrab"],
    lines: [
      { who: "mehrab", text: "Master, my hands are red, my clothes are red... it's like all of me has turned red!" },
      { who: "shideh", text: "That's all right. Red is the colour of life." },
    ],
  },

  towers: {
    chapter: "Chapter 8",
    title: "The Towers",
    cast: ["shideh", "nasrin"],
    lines: [
      { who: "nasrin", text: "From the top of the tower I can see the road the king will come by." },
      { who: "shideh", text: "Worried?" },
      { who: "nasrin", text: "No. I just want to see when he arrives." },
    ],
  },

  pool: {
    chapter: "Chapter 9",
    title: "Two Domes",
    cast: ["shideh", "nasrin"],
    lines: [
      { who: "nasrin", text: "Now I have two domes: one in the sky, one in the water." },
      { who: "shideh", text: "I didn't build the one in the water." },
      { who: "nasrin", text: "But it wouldn't be there without you." },
    ],
  },

  garden: {
    chapter: "Chapter 10",
    title: "The Red Dome",
    cast: ["shideh", "nasrin"],
    lines: [
      { who: "golnar", side: "left", text: "The pomegranates are in bloom! Earlier than ever." },
      { who: "mehrab", side: "left", text: "Master! The king's herald is here. He arrives on Tuesday! I have to go to the bazaar and buy new clothes!" },
      { who: "nasrin", text: "My tale is ready. And so is my dome." },
      { who: "shideh", side: "left", text: "Then I'm off to the next dome." },
      { who: "nasrin", text: "Shideh... thank you." },
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

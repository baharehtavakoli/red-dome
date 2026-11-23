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

   Order lines are built from the item asked for (orders.js -> lineFor, i18n.js -> use_ / ord_).
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

    ],
  },

  stairs: {
    chapter: "Chapter 2",
    title: "Stone Stairs",
    cast: ["shideh", "nasrin"],
    lines: [
      { who: "nasrin", text: "My mother told me this tale on this very mountain. Back then there was nothing here but wind." },
      { who: "shideh", side: "left", text: "Now it has a dome." },
      { who: "nasrin", text: "...Sit down. It's my turn." },
    ],
  },

  walls: {
    chapter: "Chapter 3",
    title: "The Walls",
    cast: ["shideh", "nasrin"],
    lines: [

    ],
  },

  arch: {
    chapter: "Chapter 4",
    title: "The Great Arch",
    cast: ["shideh", "mehrab"],
    lines: [

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

/* ORDER_LINES are no longer fixed sentences: orders.js builds each line from the item asked for
   and what it's for on the building (i18n.js -> use_<item> and ord_<who>0-2). */

/* BARKS: short lines characters say in their speech bubble when you tap them
   in the Dome Scene (or now and then on their own). A line can be { text, reply: { who, text } }:
   the other character answers in their own bubble a moment later.
   Shideh also says a live hint about the next part to build (see scene.js). */
window.BARKS = {
  shideh: [
    "Brick by brick, we'll build the dome together.",
    "I can already see it glowing red.",
    "We're short on materials. Pop into the workshop.",
  ],
  mehrab: [
    "Master, the workshop's full of pebbles again! Wasn't me.",
    "Two sprouts side by side make a rose bush! I'm learning.",
    "I made pearls out of these blue stones! Look, master.",
    { text: "I hear the talismans at night. Do you hear them too, master?", reply: { who: "shideh", text: "I do. But the talismans mean us no harm." } },
  ],
  golnar: [
    "Roses and pomegranates. What more could a garden want?",
    "Give me one seed, and I'll give you a garden.",
  ],
  nasrin: [
    "This mountain waited a long time for a dome like this.",
    "Not every riddle is answered with words.",
  ],
};

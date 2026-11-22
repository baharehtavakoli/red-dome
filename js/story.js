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
    title: "Names on the Gate",
    cast: ["shideh", "nasrin"],
    lines: [
      { who: "nasrin", text: "Those who failed had their names hung on the city gate, for everyone to read." },
      { who: "shideh", text: "Harsh. But walls keep things out as well as in." },
      { who: "nasrin", text: "The princess knew that better than anyone." },
    ],
  },

  arch: {
    chapter: "Chapter 4",
    title: "The Door Found by Ear",
    cast: ["shideh", "nasrin"],
    lines: [
      { who: "nasrin", text: "Past the talismans stood a wall with no door. Only a drum, hanging there." },
      { who: "shideh", text: "And whoever listened found the door?" },
      { who: "nasrin", text: "Only the patient ones." },
      { who: "mehrab", side: "left", text: "Then let's build a door you can find by ear, master!" },
      { who: "shideh", text: "Already in the plan. Knock on the left panel." },
    ],
  },

  balcony: {
    chapter: "Chapter 5",
    title: "The Portrait",
    cast: ["golnar", "nasrin"],
    lines: [
      { who: "golnar", text: "My grandmother tells this part! A prince saw a painting of the princess..." },
      { who: "nasrin", text: "...and could not forget her face. Yes. Your grandmother tells it well." },
      { who: "golnar", text: "She says he wore red from that day on, like a man asking for justice." },
      { who: "shideh", side: "left", text: "Red. Like this dome will be." },
    ],
  },

  dome: {
    chapter: "Chapter 6",
    title: "The Sage of the Hills",
    cast: ["shideh", "sage"],
    lines: [
      { who: "sage", text: "The dome is closed. Good. Now the red light has a home." },
      { who: "shideh", text: "You've come a long way, old man." },
      { who: "sage", text: "In the tale, the prince came to me too, before he climbed the mountain." },
      { who: "sage", text: "I'll tell you what I told him, once the tiles are ready." },
    ],
  },

  tiles: {
    chapter: "Chapter 7",
    title: "Every Talisman Has a Twin",
    cast: ["mehrab", "sage"],
    lines: [
      { who: "sage", text: "Listen: every talisman has a twin. Bring matching pieces together and the spell undoes itself." },
      { who: "mehrab", text: "Matching pieces... that's exactly how we work the board!" },
      { who: "shideh", side: "left", text: "And these tiles are the lock pattern. Each star answers to a seal on the road." },
      { who: "sage", text: "Now you know the prince's secret." },
    ],
  },

  towers: {
    chapter: "Chapter 8",
    title: "The Prince in Red",
    cast: ["shideh", "nasrin"],
    lines: [
      { who: "nasrin", text: "The prince climbed in red. He broke the talismans two by two, as the sage had taught him." },
      { who: "nasrin", text: "He listened to the drum, and he found the door." },
      { who: "shideh", text: "And the princess?" },
      { who: "nasrin", text: "She was waiting. With riddles." },
    ],
  },

  pool: {
    chapter: "Chapter 9",
    title: "Riddles in Pearls",
    cast: ["shideh", "nasrin"],
    lines: [
      { who: "nasrin", text: "She sent him two pearls: life is short. He sent back three: then let it be sweet." },
      { who: "nasrin", text: "She ground them with sugar, and he poured in milk and drank it all. She sent one pearl; he found its perfect twin." },
      { who: "shideh", text: "And she knew he was the one." },
      { who: "nasrin", text: "Words lie easily. Pearls don't." },
    ],
  },

  garden: {
    chapter: "Chapter 10",
    title: "The Red Dome",
    cast: ["shideh", "nasrin"],
    lines: [
      { who: "nasrin", text: "They married, and she let her guardians rest." },
      { who: "golnar", side: "left", text: "And they lived in a garden like this one!" },
      { who: "mehrab", side: "left", text: "Master! A herald from King Bahram. He comes on Tuesday, the day of Mars." },
      { who: "nasrin", text: "Then he'll find his red dome finished. And a bride who knows this tale... rather well." },
      { who: "shideh", side: "left", text: "Rather well? Nasrin... was that princess you?" },
      { who: "nasrin", text: "Every tale needs a little mystery, architect. Six more domes are waiting for you." },
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

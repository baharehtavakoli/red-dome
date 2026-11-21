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
  intro: {
    chapter: "Prologue",
    title: "The Ruin on the Mountain",
    cast: ["shideh", "mehrab"],
    lines: [
      { who: "shideh", text: "So this is the Red Dome. Or what's left of it." },
      { who: "mehrab", text: "Locals say the stones are cursed. There are glowing symbols all over the site." },
      { who: "nasrin", side: "right", text: "Not cursed. Guarded. I set those talismans myself, a long time ago." },
      { who: "nasrin", text: "Rebuild my dome, architect, and I'll tell you how it all began." },
    ],
  },

  stairs: {
    chapter: "Chapter 1",
    title: "A Castle Above the Clouds",
    cast: ["shideh", "nasrin"],
    lines: [
      { who: "nasrin", text: "When I was young, every king wanted my hand. Mostly they wanted my kingdom." },
      { who: "nasrin", text: "So I used what my teachers gave me: sorcery. I raised a castle on a mountain no army could climb." },
      { who: "shideh", text: "That explains these stairs. They're cut straight into the rock." },
      { who: "nasrin", text: "I wanted a home only the worthy could reach." },
    ],
  },

  terrace: {
    chapter: "Chapter 2",
    title: "A Place to Stand",
    cast: ["shideh", "mehrab"],
    lines: [
      { who: "mehrab", text: "The terrace is level again. You can finally stand here without sliding down the mountain." },
      { who: "shideh", text: "Every palace needs a good place to stand. Even a sorceress's." },
      { who: "nasrin", side: "right", text: "Especially a sorceress's. Princes used to wait right there, hoping I'd come out." },
    ],
  },

  walls: {
    chapter: "Chapter 3",
    title: "The Talisman Road",
    cast: ["mehrab", "nasrin"],
    lines: [
      { who: "nasrin", text: "On the road up I placed talismans. Bronze guardians that wake when a stranger passes." },
      { who: "mehrab", text: "Like the tiles that lock half our worksite?" },
      { who: "nasrin", text: "The very same. A suitor had to break them one by one." },
      { who: "shideh", text: "And most of them never made it past the first." },
    ],
  },

  arch: {
    chapter: "Chapter 4",
    title: "The Hidden Door",
    cast: ["shideh", "nasrin"],
    lines: [
      { who: "nasrin", text: "Get past the talismans, and you still face a wall with no door." },
      { who: "shideh", text: "The arch! It was bricked over on purpose." },
      { who: "nasrin", text: "A drum hung on the wall. Only someone patient enough to listen found where the door was." },
      { who: "mehrab", text: "So that's why the arch rings when you knock on it." },
    ],
  },

  balcony: {
    chapter: "Chapter 5",
    title: "The Watching Balcony",
    cast: ["shideh", "nasrin"],
    lines: [
      { who: "nasrin", text: "From this balcony I watched every suitor climb the road." },
      { who: "nasrin", text: "Most turned back at the first talisman. I never had to say a word." },
      { who: "shideh", text: "So you tested their patience before they ever met you." },
      { who: "nasrin", text: "Patience and courage. Cleverness was a bonus." },
    ],
  },

  dome: {
    chapter: "Chapter 6",
    title: "Stars Under the Dome",
    cast: ["shideh", "sage"],
    lines: [
      { who: "sage", text: "Under this dome the princess read the stars, and learned to bind them into talismans." },
      { who: "nasrin", side: "left", text: "Old friend. You taught me half of what I know." },
      { who: "sage", text: "And you kept the other half secret, as you should." },
      { who: "shideh", side: "left", text: "The dome is back. It feels like the whole mountain is breathing again." },
    ],
  },

  tiles: {
    chapter: "Chapter 7",
    title: "Patterns That Bind",
    cast: ["shideh", "nasrin"],
    lines: [
      { who: "shideh", text: "These tile patterns repeat like a lock and a key." },
      { who: "nasrin", text: "They are a lock. Each talisman on the road answers to one panel here." },
      { who: "mehrab", side: "left", text: "So fixing the tiles calms the talismans?" },
      { who: "nasrin", text: "It lets them rest. They've guarded this mountain long enough." },
    ],
  },

  towers: {
    chapter: "Chapter 8",
    title: "The Prince and the Sage",
    cast: ["golnar", "sage"],
    lines: [
      { who: "golnar", text: "My grandmother told this part. A prince saw a painting of the princess and couldn't forget her." },
      { who: "golnar", text: "Before he climbed the mountain, he went to a sage who lived in the hills." },
      { who: "sage",   text: "Every talisman has a twin, boy. Bring matching pieces together and the spell undoes itself." },
      { who: "shideh", text: "Matching pieces... Huh. That's exactly how we've been working." },
    ],
  },

  pool: {
    chapter: "Chapter 9",
    title: "Riddles in Pearls",
    cast: ["shideh", "nasrin"],
    lines: [
      { who: "nasrin", text: "Whoever found the door sat with me here, by the pool, for my riddles." },
      { who: "nasrin", text: "I didn't ask with words. I sent pearls, and waited to see what came back." },
      { who: "shideh", text: "A whole conversation in pearls. Bold." },
      { who: "nasrin", text: "Words lie easily. Pearls don't." },
    ],
  },

  garden: {
    chapter: "Chapter 10",
    title: "The Red Dome",
    cast: ["shideh", "nasrin"],
    lines: [
      { who: "nasrin", text: "He broke every talisman, found the door, and answered every pearl with the right one." },
      { who: "nasrin", text: "So I called off my guardians and painted this dome red. The color of a happy ending." },
      { who: "shideh", text: "Then let's finish the garden. The very last piece." },
      { who: "nasrin", text: "Thank you, Shideh. The Red Dome is home again." },
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
   Shideh also says a live hint about the next part to rebuild (see scene.js). */
window.BARKS = {
  shideh: [
    "Every merge gets us closer.",
    "I can already picture the dome glowing red again.",
    "Tap a generator on the board to get materials.",
  ],
  mehrab: [
    "Master, the board is full of pebbles again!",
    "Two of the same make something better. I'm learning!",
    "The orders pay in stars. Stars buy repairs.",
    "Did you hear that? The talismans hum at night.",
  ],
  golnar: [
    "Roses and pomegranates, that's all a garden needs.",
    "Bring me seeds and I'll show you a miracle.",
  ],
  nasrin: [
    "My dome, red again. I never thought I'd see it.",
    "Not every riddle is answered with words.",
  ],
};

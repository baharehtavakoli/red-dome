/* =====================================================================
   MERGE CHAINS  —  edit freely, no other code changes needed.

   Each chain:
     name       Display name of the chain
     color      Tint used behind items of this chain (any CSS color)
     generator  The board piece that produces level-1 items of this chain
                  id, name, icon, emoji
                  energyCost  energy spent per tap (default 1)
                  dropLevel   level of the item it drops (default 1)
     items      Ordered list, level 1 first. Two of item N merge into item N+1.
                  id          unique id
                  name        shown when the item is tapped
                  icon        path to a PNG. If the file is missing, emoji is used.
                  emoji       fallback placeholder art
                  orderable   false = never requested by orders (optional)
                  special     "clearTalismans" = tapping it (twice) breaks every
                              talisman around it and consumes it (optional)
                  description short extra text in the info bar (optional)

   Adding a level: just append an object to `items`.
   Adding a chain: add a new key; also place its generator in the board
   layout (config.js) and add it to an order giver's `chains` list.
   ===================================================================== */

window.CHAINS = {
  stone: {
    name: "Stone",
    color: "#c0503a",
    frame: "assets/ui/slot_clay.webp", // item box behind this chain's items (orders, info bar)
    generator: { id: "quarry", name: "Quarry", icon: "assets/generators/quarry.webp", emoji: "⛏️", energyCost: 1 },
    items: [
      { id: "pebble",           name: "Pebble",           icon: "assets/items/pebble.webp",           emoji: "🪨" },
      { id: "stone",            name: "Stone",            icon: "assets/items/stone.webp",            emoji: "🗿" },
      { id: "red_brick",        name: "Red Brick",        icon: "assets/items/red_brick.webp",        emoji: "🧱" },
      { id: "red_tile",         name: "Red Tile",         icon: "assets/items/red_tile.webp",         emoji: "🟥" },
      { id: "glazed_red_tile",  name: "Glazed Red Tile",  icon: "assets/items/glazed_red_tile.webp",  emoji: "🀄" },
      { id: "carved_red_panel", name: "Carved Red Panel", icon: "assets/items/carved_red_panel.webp", emoji: "🏵️" },
    ],
  },

  garden: {
    name: "Garden",
    color: "#4f8a3c",
    frame: "assets/ui/slot_turquoise.webp",
    generator: { id: "flower_pot", name: "Flower Pot", icon: "assets/generators/flower_pot.webp", emoji: "🪴", energyCost: 1 },
    items: [
      { id: "seed",             name: "Seed",             icon: "assets/items/seed.webp",             emoji: "🌰" },
      { id: "sprout",           name: "Sprout",           icon: "assets/items/sprout.webp",           emoji: "🌱" },
      { id: "rose_bush",        name: "Rose Bush",        icon: "assets/items/rose_bush.webp",        emoji: "🌹" },
      { id: "pomegranate_tree", name: "Pomegranate Tree", icon: "assets/items/pomegranate_tree.webp", emoji: "🌳" },
    ],
  },

  jewel: {
    name: "Jewel",
    color: "#1f9e9a",
    frame: "assets/ui/slot_lapis.webp",
    generator: { id: "jewel_box", name: "Jewel Box", icon: "assets/generators/jewel_box.webp", emoji: "🧰", energyCost: 1 },
    items: [
      { id: "rough_gem",    name: "Rough Gem",    icon: "assets/items/rough_gem.webp",    emoji: "🔹" },
      { id: "polished_gem", name: "Polished Gem", icon: "assets/items/polished_gem.webp", emoji: "💎" },
      { id: "pearl",        name: "Pearl",        icon: "assets/items/pearl.webp",        emoji: "🦪" },
      { id: "pearl_string", name: "Pearl String", icon: "assets/items/pearl_string.webp", emoji: "📿" },
      { id: "royal_pearl",  name: "Royal Pearl",  icon: "assets/items/royal_pearl.webp",  emoji: "👑" },
    ],
  },

  magic: {
    name: "Magic",
    color: "#c9971f",
    frame: "assets/ui/slot_gold.webp",
    generator: { id: "star_chest", name: "Star Chest", icon: "assets/generators/star_chest.webp", emoji: "🌠", energyCost: 1 },
    items: [
      { id: "star_shard", name: "Star Shard", icon: "assets/items/star_shard.webp", emoji: "✨" },
      { id: "star",       name: "Star",       icon: "assets/items/star.webp",       emoji: "🌟" },
      {
        id: "astrolabe_charm", name: "Astrolabe Charm", icon: "assets/items/astrolabe_charm.webp", emoji: "🧭",
        orderable: false,
        special: "clearTalismans",
        description: "Breaks all talismans around it",
      },
    ],
  },
};

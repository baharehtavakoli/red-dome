# The Red Dome: merge-2 prototype

A mobile-first, story-driven merge-2 prototype based on the Red Dome tale from Nizami's *Haft Peykar*.
You play Shideh, an architect who is restoring the ruined Red Dome for princess Nasrin-Nush.

Plain HTML, CSS and vanilla JavaScript. No build step and no dependencies.

## Run it

**On a computer:** double-click `index.html`. It works from `file://`.

**On a phone (portrait):** use any of these:

- **Same Wi-Fi (fastest):** in this folder, run
  ```bash
  python -m http.server 8000
  ```
  Then open `http://<your-computer's-IP>:8000` on the phone.
- **Static host:** drag the folder onto Netlify Drop, or push it to GitHub Pages, and open the URL.
- **Local file:** copy the folder to the phone and open `index.html` from a file manager. Some mobile browsers block local files, so the first two options are more reliable.

To get a full-screen, app-like view, use "Add to Home Screen" from the browser.

## How to play

The game opens on the **Dome Scene**: the ruined Red Dome, with each of its six parts drawn in place. Earn stars on the merge board, then come back and rebuild.

| Action | How |
|---|---|
| Restore a part | Tap the task button on a ruined part (it shows the ⭐ cost). Parts unlock in order: the next one glows gold when you can afford it, later ones show 🔒. The camera zooms in, dust rises, the restored part fades in, and its story scene plays right there. |
| Replay a story | Tap a restored part. |
| Go to the board | Press the big **Merge** button. A green badge shows how many orders are ready. Press **‹ Back to Dome** to return; it shows a "!" when you can afford the next part. |
| Make items | Tap a gold **generator** (⚡). Each tap costs 1 energy and drops a level-1 item into the nearest empty cell. |
| Merge | Drag an item onto an identical item. You get the next level. |
| Move / swap | Drag an item to an empty cell, or onto a different item to swap them. |
| Item info | Tap any item. Its name, level and what it merges into appear in the bar at the bottom. |
| Talismans | Merge an item **right next to** a talisman (up, down, left or right) to break it. A broken talisman sometimes leaves a bonus item. |
| Astrolabe Charm | Tap it to select it, then tap again (or press **Activate**). It breaks every talisman in the 8 cells around it and is used up. |
| Orders | When all items on a card are on the board, press **Deliver**. You earn ⭐. |
| Energy | Max 100, +1 every 2 minutes, including while the game is closed. Tap the energy pill and choose **Watch ad** for +20 (a fake ad). |
| Settings ⚙️ | Replay the intro, or **Reset progress** (tap twice). |
| Story scenes | Tap anywhere to finish the current line or move to the next one. **Skip ›** ends the scene. |
| Debug 🐞 | Bottom-right button: add energy or stars, spawn any item, break all talismans, reroll orders, restore the next part (free, with the full animation), un-restore the dome, and fast energy regen. |

Progress saves automatically to `localStorage`.

## Project layout

```
index.html
css/style.css        all styling and animations (palette variables are at the top)
js/chains.js         ← EDIT: merge chains, items, generators
js/story.js          ← EDIT: story scenes (text + who stands on stage), order lines
js/config.js         ← EDIT: characters + art paths, scene background, dome parts
                              (position, cost, art), board layout, energy, orders
js/util.js           helpers + art loader (PNG with emoji fallback)
js/state.js          save/load, energy regeneration
js/board.js          grid, drag & drop, merging, generators, talismans
js/orders.js         order generation and delivery
js/scene.js          Dome Scene: camera, parts, task buttons, build animation,
                     placeholder drawings
js/dialogue.js       story player (half-body portraits + dialogue box)
js/ui.js             top bar, info bar, modals, toasts, effects
js/debug.js          debug panel
js/main.js           boot
assets/              drop real art here (see below)
```

## Editing merge chains: `js/chains.js`

Each chain has a `generator` and an ordered list of `items` (level 1 first):

```js
garden: {
  name: "Garden",
  color: "#4f8a3c",
  generator: { id: "flower_pot", name: "Flower Pot", icon: "assets/generators/flower_pot.png", emoji: "🪴", energyCost: 1 },
  items: [
    { id: "seed",   name: "Seed",   icon: "assets/items/seed.png",   emoji: "🌰" },
    { id: "sprout", name: "Sprout", icon: "assets/items/sprout.png", emoji: "🌱" },
    ...
  ],
},
```

- **Add a level:** append an item to `items`.
- **Rename or re-skin:** change `name`, `emoji` or `icon`.
- **Optional item fields:**
  - `orderable: false` keeps the item out of orders.
  - `special: "clearTalismans"` gives the item the charm's ability.
  - `description` adds text to the info bar.
- **Add a whole chain:** add a new key here. Then place its generator in `config.js` (add a letter to `legend` and use it in `layout`), and add the chain to an order giver's `chains` list.

## Editing the story: `js/story.js`

- `STORY`: the scenes. `intro` plays on first launch. The other six are triggered by dome parts through the `story` field in `config.js`.
  - `cast: ["shideh", "nasrin"]` sets who stands on the left and right when the scene starts.
  - Each line is `{ who: "nasrin", text: "..." }`. If the speaker isn't on stage, they replace whoever spoke least recently. Add `side: "left"` or `side: "right"` to a line to choose the side yourself.
- `ORDER_LINES`: short quotes shown when you tap an order card's character.

## Tuning the game: `js/config.js`

- `CHARACTERS`: name, emoji, name-tag colour, `portrait` (half-body, for story scenes) and `avatar` (small, for order cards).
- `scene`: the world size (360×640 units, portrait 9:16), the `background` image, and `maxZoom` for the camera.
- `domeParts`: for each part:
  - `cost` in ⭐ and the `story` scene it plays
  - `box`: where the part sits in the world `{x, y, w, h}`
  - `button`: where its task button sits `{x, y}`
  - `ruined` and `restored` art paths

  Parts are restored, and layered, in list order.
- `layout`: the 7×9 starting board, one string per row.
  - `T` = talisman
  - `Q F J S` = generators
  - lowercase letters = starting items
  - `.` = empty

  Use `hides` in `legend` to put a specific item under a talisman.
- `energy`: max, regen speed, ad reward.
- `orders`: how many slots, star rewards per level, which chains each character asks for, and how quickly the requested levels rise as you restore the dome.

Layout changes only apply to a **new game**: use ⚙️ → Reset progress. Other edits apply on reload. Old saves are sanitised, so removing items or chains won't crash the game.

## Adding real art

Every art slot is a file path in `config.js` or `chains.js`. On load, the game tries each path:

- **The file exists:** the PNG is shown.
- **The file is missing:** a placeholder is shown (an emoji, or a simple drawing).

To add art, save a PNG to the matching path and reload. You don't need to change any code.

| What | Path (default) | Notes |
|---|---|---|
| Scene background | `assets/scenes/red_dome_bg.png` | Portrait 9:16 (e.g. 1080×1920). Paint it **without** the six parts. |
| Part, ruined / restored | `assets/scenes/parts/<id>_ruined.png`, `<id>_restored.png` | Each image is stretched to fill the part's `box`. Draw both states at the same size and framing so the crossfade lines up. |
| Story portraits | `assets/characters/<name>.png` | Half-body, transparent background, roughly 600×900, waist at the bottom edge. |
| Order avatars | `assets/characters/<name>_avatar.png` | Square head shots. |
| Items / generators | `assets/items/`, `assets/generators/` | Square, transparent, around 256×256. |
| Talisman tile | `assets/tiles/talisman.png` | Square. |

**Positioning parts with real art.** The world is 360×640 units. A part with `box: { x: 92, y: 200, w: 176, h: 164 }` covers that rectangle of the background. If you paint the full scene at 1080×1920 (3× the world), divide your pixel coordinates by 3 to get `box` values. For example, a wall painted at x=276, y=600, 528×492 px becomes `{ x: 92, y: 200, w: 176, h: 164 }`. Then place `button` near the part.

The placeholder drawings for the scene and parts are inline SVG at the top of `js/scene.js`. They're only used while the PNGs are missing.

While the art is missing, the browser console shows 404 messages for those files. This is harmless. Set `tryImages: false` in `config.js` to hide them.

## Painted art (current setup)

**Scene (10 stages, current).** `assets/scenes/stages/stage_00.png` (full ruin) to `stage_10.png`
(finished) are the same painting, each with one more part rebuilt. `tools/cut_stages.py` compares each
stage with the one before, keeps only the area that changed (ignoring small drift elsewhere), and writes
`assets/scenes/parts/<id>_restored.png` / `_ruined.png` plus `tools/stage_parts.json` with the
`box`/`button` values for `domeParts` in `js/config.js`. After replacing the stage paintings, run it again:

```bash
python tools/cut_stages.py
```

Only the next part's task button is shown in the scene. `scene.stagedArt: true` in the config makes
ruined layers appear only during the build animation.

**Scene (older two-painting setup, kept for reference).** The first version used two full paintings with identical framing:
`assets/scenes/source_ruined.png` (the background) and `source_restored.png`.
`tools/cut_scene_parts.py` cuts each of the six parts out of both paintings with soft-edged masks,
and prints the `box` / `button` values for `js/config.js`. If you repaint the scene, run it again:

```bash
python tools/cut_scene_parts.py
```

Then paste the printed values into `domeParts` in `js/config.js`. To change which area belongs to which part,
edit `SHAPES` at the top of the script; coordinates are in pixels of the 1080×1920 painting.

**UI skin.** `css/skin.css` paints the interface with the PNGs in `assets/ui/` (buttons, top-bar pills,
order cards, board frame and tiles, dialogue box, name tag, popups). It switches on automatically when
`assets/ui/btn_gold.png` exists; without the PNGs the game keeps its plain CSS look. Stretchy pieces use
9-slice (`border-image`), so the ornate ends keep their size. If you replace a PNG with a differently
shaped one, adjust its slice numbers in `skin.css`. Each chain's item box comes from `frame` in `js/chains.js`.

**Portraits** in story scenes all face right, so the one standing on the right is mirrored automatically.
Order-card avatars (`*_avatar.png`) were cropped from the portraits.

## Characters in the scene and merge help

- **Full-body poses:** `assets/characters/full_body/<who>/<pose>.png`, poses listed in `window.POSES`
  (`js/config.js`). Characters in the scene stand in `neutral` and switch to a talking pose while their
  bubble is up. A `BARKS` line can pick the pose: `{ text: "...", pose: "surprised" }`.
- **Characters standing in the Dome Scene:** `GAME_CONFIG.scene.residents` in `js/config.js` sets who stands where.
  They stand in one row: `cx` is the centre, `feet` is the ground line, `h` is the height (world units). Keep about
  65 between centres so they don't overlap. It also sets whether they face left (`flip`) and which restored part
  makes them appear (`after`). Speech bubbles grow toward the middle of the screen automatically.
  Tap one and they say a line from `BARKS` in `js/story.js`. Every `barkEverySeconds` someone speaks up on
  their own. Shideh mixes in a live hint about the next part to rebuild and how many stars are missing.
- **Story scenes:** the speaker gets a warm glow and a small talking motion while their line types out, and a
  gold arrow button in the corner of the dialogue box shows you can tap to continue.
- **Merge help on the board:**
  - When you select an item, every identical item glows.
  - The info bar shows "2× item → next item". Tap it for the chain card, which lists the whole chain from its generator.
  - Tapping an item on an order card opens the same card with that item highlighted and says how to make it.
  - After 7 idle seconds, two items that can be merged wiggle.

## Sound: `js/sound.js`

All sound effects are made in code with the Web Audio API, so there are no audio files and no
licences to track. Melodic sounds use a plucked-string tone (close to a santur) on a Persian scale
(Homayoun on D), and merges climb the scale as items level up.

- Events call `Sfx.play("name", arg)`: `merge` (level), `maxed`, `produce`, `shatter` (talismans),
  `charm`, `deliver`, `stars`, `arrive`, `build`, `fanfare`, `energy`, `whoosh`/`whooshBack`
  (board open/close), `open` (modal), `pop` (speech bubble), `blip` (dialogue typing), `next`,
  `select`, `lift`, `place`, `error`, `click` (every button).
- To change a sound, edit its function in `SOUNDS`. To try one in the browser console:
  `Sfx.play("build")`. Sound needs one tap on the page first; browsers block it before that.
- Settings has a Sound on/off switch. The choice is saved on each device.
- No music yet. A music track can be added later as an audio file.

## Phase 1 changes (economy, selling, safety)

- **Economy** (`js/config.js`): higher-level orders pay better (`starReward`), part costs rise
  to 80 (337 total), order level grows every 2 parts (`levelPerPart: 0.5`), energy refills to 60
  (start 100), 4 ads a day (`adsPerDay`), +20 energy per built part (`partReward`), 12% lucky
  drops (`luckyDropChance`), and inner talismans hide better items (legend X/Y/Z/W).
- **Sell / Remove**: the info bar has a 🗑 button for any item (tap twice). It pays a quarter of
  the order value (`Board.sellValue`), so it frees space without beating deliveries.
- **Saves**: an old or changed save is migrated (stars, dome, energy kept; board rebuilt) and the
  original is copied to `reddome_save_v1_backup`. Setting the phone clock back no longer stops regen.
- **Phone**: Back closes the top window / story / board; on the main screen a second Back leaves.
  Pinch zoom is allowed. Skip asks once. A grey Deliver says which item is missing.
- **Debug** 🐞 only shows on localhost or with `?debug` in the address.

## Art files: PNG sources, WebP in the game

The game loads **WebP** copies of the art (about 3.4 MB instead of 38 MB of PNG). The full-size
PNGs stay in `assets/` on your computer as the sources, but are not uploaded to GitHub.

After adding or changing any PNG, run:

    python tools/optimize_assets.py

It writes a resized `.webp` next to each PNG (items 224 px, portraits 600x900, full-body poses
480x600, avatars 160 px; scenes and UI keep their size). Paths in `js/` and `css/` point at `.webp`.

Art downloads in priority order, a few at a time (`Art.allPaths` in `js/util.js`): background and
intro faces first, then the board, then everything else.

**Offline / home screen:** on the live site `sw.js` caches the game so it opens offline, and
`manifest.webmanifest` lets phones "Add to Home screen" as an app (icon in `assets/app/`).
After changing art, bump `VERSION` in `sw.js` so phones fetch the new images.

## First-time guide: `js/tutorial.js`

New players get a hand pointer and a short tip through one full loop after the intro:
Merge button → tap the Quarry → drag pebble onto pebble → Deliver Mehrab's Stone (a guaranteed
first order worth exactly the stairs' cost) → back to the dome → build the stairs.

Steps are checked several times a second against the game state, so the guide follows what the
player actually does and never gets stuck (if the pebbles are used elsewhere it goes back to
"dig"). It hides during stories, cinematics and windows. Progress is `State.d.tut` (-1 = done);
saves that already delivered an order or built a part skip it. Settings → Reset progress shows it again.

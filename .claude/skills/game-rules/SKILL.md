---
name: game-rules
description: Use when a request touches the game rules — player actions, combat, enemies, tension cards, turns, hit points, bag, victory/defeat — to find the function carrying each concept and follow the right procedure for additions.
auto_invoke: true
---

# Game rules

All rules are functions in `src/rules/`: they take the state `s`, mutate it in place,
and never touch the DOM nor `Math.random` (randomness goes through `s.rng`, seeded —
same seed, same game).

## Concept → implementation

| Game concept | Function | File |
| --- | --- | --- |
| Legal actions of a state | `actions(s)` → `[{type, cost, …}]` | `src/rules/actions.js` |
| Resolving an action | `play(s, action)` | `src/rules/play.js` |
| Action types | `move`, `attack`, `search`, `door`, `heal`, `combine`, `weapon`, `end` | `actions.js` + `play.js` |
| Move cost (1, or 2 when engaged in contact) | `MOVE_COST`, `DISENGAGE_MOVE_COST` | `src/config.js`, read by `actions` |
| Door toggle (open/close the adjacent door; key required while locked) | `door` action, `DOOR_COST` | `actions.js` + `play.js`, `src/config.js` |
| Attack dice roll | `DIE[rndInt(s.rng, DIE.length)]` × `weapon.dice` | `src/rules/play.js`, `attack` case |
| Weapon profiles (dice, range, ammo, area) | `WEAPONS` | `src/config.js` |
| Enemy profiles (hp, damage, speed) | `ENEMIES` | `src/config.js` |
| Enemy activation (chase, contact strike) | `activate(s, bonus)` | `src/rules/enemies.js` |
| Spawn point (nearest ≥ minDist) | `spawnPoint(s, minDist)`, `spawn(s, type, minDist)` | `src/rules/enemies.js` |
| Drawing and resolving a tension card | `drawTension(s)` (switch on `c.id`) | `src/rules/tension.js` |
| Deck build (14 cards, licker never in the first 8) | `TENSION`, `DECK_SPLIT` + build in `createGame` | `src/config.js`, `src/state/game.js` |
| End of turn (enemies → tension → player phases) | `endTurn(s)` | `src/rules/turn.js` |
| Bag: stacks, capacity | `addItem`, `removeItem`, `hasItem`, `ammoCount` | `src/rules/bag.js` |
| Healing (green herb +3, green+red = full) | `heal`/`combine` cases of `play`; `GREEN_HERB_HEAL` | `src/rules/play.js`, `src/config.js` |
| Victory (reaching `parking`) | `move` case of `play` | `src/rules/play.js` |
| Defeats (hp ≤ 0, empty deck) | `activate`; `drawTension` | `src/rules/enemies.js`, `src/rules/tension.js` |
| Log messages | `say(s, message, type)` — types `info`/`good`/`bad`/`tension`/`sys` | `src/rules/log.js` |
| Game setup | `createGame(seed)` | `src/state/game.js` |

## Adding a tension card

1. `src/config.js`: add the card to `TENSION` (`{id, title, text}` — title and text in
   French, the game is French); if it carries a value (distance, healing…), export it
   as a named constant. Mind `DECK_SPLIT`: the first 8 cards of the filtered array are
   shuffled apart.
2. `src/rules/tension.js`: add the `case '<id>'` in the `drawTension` switch.
3. `tests/tension.test.js`: one macro test on the card's effect.
4. `npm test` green, then check in game (`npm run dev`).

## Adding a weapon / an enemy / an item

1. `src/config.js`: add the entry to `WEAPONS` / `ENEMIES` / `ITEMS` (for an item:
   `name` in French, `stack`, possibly `key:true`).
2. Weapon: the "Changer d'arme" button cycle is hard-coded
   (`['knife','pistol','shotgun']`) in `src/rules/actions.js` **and**
   `src/input/buttons.js` — update both.
3. Enemy: its drawn shape is a ternary on `e.type` in `src/render/canvas.js`
   ("enemies" section); item: its glyph lives in `ICONS` (`src/render/hud.js`).
4. Macro test in the affected rule's file, `npm test`, in-game check.

## Adding a player action type

1. `src/rules/actions.js`: the legality condition (pushes `{type, cost}` into `out`).
2. `src/rules/play.js`: the resolution `case`.
3. `src/input/buttons.js` or `src/input/mouse.js`: the trigger, calling
   `act(app, actions(app.S).find(…))`.
4. `src/render/hud.js`: the button's `disabled` state if it is one.
5. Tests: legality in `tests/actions.test.js`, resolution in `tests/play.test.js`.

## Guardrails

- Never call `Math.random` in a rule: `rndInt(s.rng, n)`.
- Every new numeric value → named export of `src/config.js`.
- The behaviours listed under "Deliberately left alone" in `docs/decisions.md`
  (possible loot overwrite by the spade key, Chebyshev vs BFS range, partitioned
  deck…) are wanted as they are: do not "fix" them without an explicit decision.

---
name: architecture
description: Use when a change must be located in the code — which module carries which responsibility, who imports whom, and where new code goes depending on the type of modification.
auto_invoke: true
---

# Architecture

## Module map

| Module | Role | Key dependencies |
| --- | --- | --- |
| `index.html` | HTML/CSS shell (layout, styles, HUD ids), loads `src/main.js` | — |
| `src/config.js` | Data tables (tiles, doors, tokens, items, weapons, enemies, tension deck) and every rule value | nothing |
| `src/rules/rng.js` | Seeded generator: `makeRng`, `rnd`, `rndInt`, `shuffle` | nothing |
| `src/rules/board.js` | `CELLS`/`DOOR_INDEX`/`BOUNDS` indexes, `key`, `tileAt`, `tile`, `sameCell`, `cellDistance`, `canPass`, `neighbors` | config |
| `src/rules/movement.js` | BFS: `distances` (reachability), `firstStep` (path) | config, board |
| `src/rules/sight.js` | `lineOfSight`: line of sight (decomposed Bresenham) | config, board |
| `src/rules/bag.js` | `hasItem`, `addItem`, `removeItem`, `ammoCount` | config |
| `src/rules/actions.js` | `actions(s)`: the set of legal actions | config, board, movement, sight, bag |
| `src/rules/play.js` | `play(s, action)`: applies a legal action | config, rng, board, movement, sight, bag, log, turn |
| `src/rules/enemies.js` | `activate`, `spawnPoint`, `spawn` | config, board, movement, log |
| `src/rules/tension.js` | `drawTension(s)`: draws and resolves a card | config, bag, enemies, log |
| `src/rules/turn.js` | `endTurn(s)`: enemies → tension → player | enemies, tension |
| `src/rules/log.js` | `say(s, m, t)`: pushes a message into `s.log` | nothing |
| `src/state/game.js` | `createGame(seed)`: builds the whole state `S` | config, rng, board |
| `src/render/canvas.js` | `resize`, `geometry`, `recompute`, `draw` — canvas board, shake | config, board, actions |
| `src/render/hud.js` | `refresh(app, cardDrawn)` — sheet, gauges, bag, log, tension card, game over | config, board, bag, actions, canvas |
| `src/input/mouse.js` | `bindMouse(app, {act, refresh, draw})` — board hover and click | config, rules (read) |
| `src/input/buttons.js` | `bindButtons(app, {act})` — footer buttons | rules (read) |
| `src/loop/controller.js` | `act(app, a)`: intent → `play` → `refresh` | rules/play, render/hud |
| `src/main.js` | `app` object, seed (URL or random), wiring, `newGame` | everything |

Import arrows always point down this table. `input/` never touches `render/` nor
`loop/` directly: `main.js` injects `act`, `refresh` and `draw` into it.

## The two state objects

- `S` (game state, `createGame`): `seed`, `rng`, `turn`, `ap`/`maxAp`, `player`,
  `bag`/`bagMax`, `enemies`, `nextId`, `tokens`, `openedDoors`, `deck`/`discard`/
  `lastCard`, `lastTile`, `phase` (`player`|`enemies`|`tension`), `over`
  (`null`|`victory`|`defeat`), `log`.
- `app` (application state, `main.js`): `cv`, `ctx`, `S`, `G` (geometry), `hover`,
  `reachable`, `targets`, `shake`.

## Where new code goes, by type of change

| Change | Files to touch, in order |
| --- | --- |
| New balancing value (cost, range, threshold…) | `src/config.js` (named export), then the rule consuming it |
| New rule or rule modification | `src/rules/<module>.js` + its macro test in `tests/<module>.test.js` |
| New player action type | `src/rules/actions.js` (legality) → `src/rules/play.js` (resolution) → trigger in `src/input/` → display in `src/render/hud.js` if needed |
| New tension card, weapon, enemy, item | see the `game-rules` skill |
| Map change (tiles, doors, tokens) | see the `board` skill |
| New UI or display element | see the `render-ui` skill |
| New game-state field | `createGame` (`src/state/game.js`), then the affected rules |
| New test | `tests/<module>.test.js`, see the `testing` skill |

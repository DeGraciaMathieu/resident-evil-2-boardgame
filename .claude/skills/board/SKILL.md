---
name: board
description: Use when a request touches the map — tiles, doors, locks, cells, spawn points, search tokens, distances, reachability or line of sight — to modify the topology without breaking the derived indexes.
auto_invoke: true
---

# Board

The map is declared as data in `src/config.js` and indexed once and for all in
`src/rules/board.js`. A cell is a pair `[x, y]`; its serialized key is `"x,y"`
(`key(c)`).

## Concept → implementation

| Concept | Data / function | File |
| --- | --- | --- |
| Tile (union of `[x, y, width, height]` rectangles) | `TILES` | `src/config.js` |
| Door between two adjacent cells of two tiles | `DOORS` (`{a, b, lock}`) | `src/config.js` |
| Locks | `lock: 'spade_key'` or `'keycard'` (`ITEMS` ids) | `src/config.js` |
| Enemy spawn points | `SPAWN_POINTS` | `src/config.js` |
| Search tokens (position, type A/B) | `TOKENS` | `src/config.js` |
| Cell → tile index | `CELLS` (Map, built at load time) | `src/rules/board.js` |
| Edge → door index | `DOOR_INDEX` (Map, both directions) | `src/rules/board.js` |
| Grid dimensions | `BOUNDS` (`{w, h}`, derived from `CELLS`) | `src/rules/board.js` |
| Edge passability | `canPass(s, a, b)` | `src/rules/board.js` |
| Door touching a cell / door key | `doorAt(c)`, `doorKey(d)` | `src/rules/board.js` |
| Doors currently open (toggleable) | `s.openDoors` (`"x,y\|x2,y2"` keys) | state `S` |
| Doors unlocked during the game (durable) | `s.unlockedDoors` (same keys) | state `S` |
| Reachable cells (bounded BFS) | `distances(s, from, max)` | `src/rules/movement.js` |
| Cell-by-cell path | `firstStep(s, from, to)` | `src/rules/movement.js` |
| Line of sight | `lineOfSight(s, a, b)` | `src/rules/sight.js` |
| Chebyshev distance (weapon range) | `cellDistance(a, b)` | `src/rules/board.js` |
| Range of one move action | `MOVE_RANGE` (2 cells) | `src/config.js` |
| On-screen tile colours | `TINTS` | `src/render/canvas.js` |

## Topology rules (deduced from the code)

- Two cells of the **same tile** always communicate; between **two tiles**, an entry
  in `DOORS` is required, otherwise it is a wall — even when the cells touch (that is
  what landlocks the darkroom, cf. `docs/decisions.md`).
- Doors are **closed by default** and block everyone — player, enemies, line of
  sight. Passage requires the door in `s.openDoors`, toggled by the `door` action
  (see the `game-rules` skill). Keys grant no passage by themselves: they only make
  the open action legal on a locked door (unlocking is durable, `s.unlockedDoors`).
- Crossing an open door is a normal step (no surcharge).
- Two metrics deliberately coexist: orthogonal BFS for movement, Chebyshev for weapon
  range.

## Modifying the map

1. `src/config.js`: edit `TILES` / `DOORS` / `SPAWN_POINTS` / `TOKENS`. The indexes
   (`CELLS`, `DOOR_INDEX`, `BOUNDS`) and the rendering recompute themselves — never
   edit them by hand.
2. Check the invariants `createGame` (`src/state/game.js`) assumes: a token exists on
   the `armory` tile (it receives `keycard` + `shotgun`) and at least one token
   outside the armory (to hide `spade_key`). Victory is coded on the `parking` tile
   id in `src/rules/play.js`.
3. New tile: add its colour to `TINTS` (`src/render/canvas.js`), otherwise it gets
   `_default`. Its `name` is in French (player-facing).
4. Adapt/add the tests quoting real coordinates (`tests/board.test.js`,
   `tests/movement.test.js`, `tests/sight.test.js` use the hall `[3,4]`, the locked
   door `[10,3]→[10,4]`, the darkroom…).
5. `npm test` green, then visual check in game (`npm run dev`).

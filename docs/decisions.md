# Refactor decisions

Written by `/refactor-game`. Records what the code cannot express: why this layout, why
this toolchain, what was deliberately not touched, what is still undecided.

Read by `/scaffold-claude` so it does not have to re-deduce any of it.

A later pass translated the codebase to English (identifiers, file names, comments,
data ids, DOM ids, CSS classes). Player-facing text stays French: the game is French.
The original French names are kept below in parentheses where useful for archaeology.

## Archetype

Selected: `turn-based board`
Why: discrete cell grid, one action at a time, no continuous loop
(`requestAnimationFrame` only for the cosmetic screen shake), rendering reacting to
state changes, a phase enum (`player`/`enemies`/`tension`), action legality
(`actions`), reachability BFS, line of sight, dice-based combat resolution,
victory/defeat conditions. The board already lives in the state, not in the DOM.
Does not fit: rendering is a full 2D canvas (not a light DOM render) with a transient
shake animation; the tension-deck mechanic (draw/discard/partitioned deck build) does
not exist in the archetype → dedicated module `rules/tension.js`; the seeded RNG
(`makeRng`) already existed in the prototype.

## Toolchain

Branch: `zero-build`
Triggering signal: no Vite signal present — no npm import, no TypeScript, no assets to
bundle (Google Fonts loaded from the network), 840 lines < 2000.
Node: 22
Test runner: `node:test`

## Layout

| Module | Responsibility | Came from |
| --- | --- | --- |
| `src/config.js` | data tables (tiles, doors, tokens, items, weapons, enemies, tension deck) and rule values | prototype lines 180–251 + scattered magic values |
| `src/rules/rng.js` | seeded generator (makeRng, rnd, rndInt, shuffle) | lines 165–178 |
| `src/rules/board.js` (plateau) | cell/door indexes, passability, Chebyshev distance | lines 253–288, 342 |
| `src/rules/movement.js` (deplacement) | reachability BFS (`distances`) and path BFS (`firstStep`) | lines 289–316 |
| `src/rules/sight.js` (vue) | line of sight (decomposed Bresenham) | lines 318–341 |
| `src/rules/bag.js` (sac) | inventory: stacks, capacity, ammo | lines 375–389 |
| `src/rules/actions.js` | legality: the set of possible actions | lines 392–431 |
| `src/rules/play.js` (jouer) | applying a legal action | lines 433–485 |
| `src/rules/enemies.js` (ennemis) | activation (chase, strike) and spawning | lines 487–522 |
| `src/rules/tension.js` | drawing and resolving tension cards | lines 524–537 |
| `src/rules/turn.js` (tour) | enemies → tension → player sequencing | lines 539–543 |
| `src/rules/log.js` (journal) | `say`: game log messages | line 390 |
| `src/state/game.js` (partie) | factory of a game's state (`createGame`) | lines 344–373 |
| `src/render/canvas.js` | board rendering (2D canvas), cosmetic shake | lines 548–705 |
| `src/render/hud.js` | DOM HUD: sheet, bag, log, tension card, game over | lines 754–811 |
| `src/input/mouse.js` (souris) | board hover and click → intents | lines 707–744 |
| `src/input/buttons.js` (boutons) | footer buttons → intents | lines 813–822 |
| `src/loop/controller.js` (controleur) | `act`: intent → rule → render | lines 746–752 |
| `src/main.js` | entry point: `app` object, seed, wiring | lines 824–836 |

Deviations from the `rules-extraction` skill's layer table, approved at GATE 2:

- `src/rules/log.js` was added (not in the initial plan): `say` is used by the rules,
  which are not allowed to import `state/`.
- `src/state/game.js` imports `rules/rng.js` and `rules/board.js`: the factory needs
  the seeded RNG and `tileAt` for the setup. The `state → rules` arrow is not in the
  table, but the alternative (duplicating or moving the setup) would have changed the
  original code's structure.
- The prototype's globals (`S`, `G`, hover, reachable cells, targets, shake, canvas)
  became an `app` object created by `main.js` and passed as a parameter to `render/`,
  `input/` and `loop/` functions. The `input/` modules receive their effects (`act`,
  `refresh`, `draw`) by injection from `main.js` so they import neither `render/` nor
  `loop/`.

## Rules extracted

| Rule | Module | Test | Notes |
| --- | --- | --- | --- |
| Seeded RNG | `src/rules/rng.js` | `tests/rng.test.js` | unchanged from the prototype |
| Passability | `src/rules/board.js` | `tests/board.test.js` | doors, locks, enemy case |
| Reachability and path | `src/rules/movement.js` | `tests/movement.test.js` | crossing a door is a normal step |
| Line of sight | `src/rules/sight.js` | `tests/sight.test.js` | dead variable `prev` kept |
| Inventory | `src/rules/bag.js` | `tests/bag.test.js` | stacks and capacity |
| Action legality | `src/rules/actions.js` | `tests/actions.test.js` | disengage surcharge |
| Applying an action | `src/rules/play.js` | `tests/play.test.js` | reproducible seeded dice |
| Enemies | `src/rules/enemies.js` | `tests/enemies.test.js` | contact strike, minDist spawn |
| Tension | `src/rules/tension.js` | `tests/tension.test.js` | defeat on empty deck |
| End of turn | `src/rules/turn.js` | `tests/turn.test.js` | interruption on defeat |
| Setup | `src/state/game.js` | `tests/game.test.js` | scenario invariants |

## Randomness and time

| Call site | Classification | Handling |
| --- | --- | --- |
| `draw()` — screen shake (`Math.random()` ×2, canvas translation) | cosmetic | left in render, unseeded |
| `newGame()` — seed draw when the URL provides none | entry-point seed | stays in the bootstrap: only the entry point decides the seed |
| `createGame` — token contents, spade-key placement, deck shuffles | rule-bearing | already seeded via `makeRng(seed)` → `s.rng`, kept as is |
| `play` case `attack` — dice rolls | rule-bearing | already seeded via `s.rng`, kept as is |
| `draw()` / `addFx()` — end-of-turn playback FX (`performance.now()`, canvas tweens) | cosmetic | added later in render, presentation timing only — never read by the rules |

Seed: `user-provided` (URL parameter `?seed=N`), otherwise drawn randomly at bootstrap.

No `Date.now()` nor `performance.now()` call in the prototype: turn-based game, no
`dt` to inject. The de-randomisation step therefore changed no rule code — the
prototype already injected its seeded RNG.

Purity contract, "no mutation of its arguments" point: the prototype's rules mutate
the state `s` in place (`play`, `activate`, `drawTension`, `addItem`…). Rewriting them
as immutable would be a rewrite, not an extraction — behaviour must stay identical.
Decision: the extracted rules keep mutating `s`; determinism (same inputs → same
outputs) is guaranteed by the seeded RNG carried by `s.rng`.

## Deliberately left alone

Behaviour that looks wrong but was preserved, because the refactor must not change the
game. Each entry: what it is, where, and why it was not fixed.

- The spade-key placement (`createGame`) can overwrite an already-drawn token content
  (ammo or a herb), not only a `nothing` token. Possibly intentional (the key replaces
  the loot), the code does not say — kept as is.
- Weapon range uses Chebyshev distance (`cellDistance`) while movement uses an
  orthogonal BFS: two metrics coexist. Kept as is.
- Dead variable `prev` in `lineOfSight()`: assigned twice, never read. Left in place
  (no deletion, even an "obvious" one, during the refactor).
- Partitioned tension-deck build: the first 8 cards (without the licker) are shuffled
  apart, so the licker can never come out in the first 8. Behaviour preserved, intent
  undocumented in the code.
- Token `bonus` field: only the armory token gets one (`content:'keycard'` +
  `bonus:'shotgun'`), and `search` handles `bonus` before `content`. Mechanism kept
  as is.

## Open questions

Decisions the code does not settle and that were not made. Never resolved by guessing.

- The `darkroom` tile ("Chambre noire") is landlocked inside the hall's ring with a
  single door (`[4,4]→[4,5]`); its other faces are implicit walls. The thematic
  meaning (and whether other accesses were planned) is unspecified.
- Is the possible loot overwrite by the spade key (see above) intended?
- Could tokens other than the armory's carry a `bonus`? The code neither provides for
  it nor forbids it.

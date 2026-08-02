# RPD — Ground floor

Solo turn-based board game inspired by Resident Evil 2: Leon crosses the police
station's ground floor and must reach the parking exit before the tension deck runs out.

## Stack and commands

- Vanilla JavaScript, native ESM modules, **zero dependencies** (neither runtime nor dev).
- Rendering: 2D canvas (board) + DOM (HUD). Node ≥ 22 for the tests.
- `npm run dev` — serves the folder over HTTP (mandatory: ESM modules do not load over
  `file://`, double-clicking `index.html` does not work).
- `npm test` — `node --test` suite (tests in `tests/*.test.js`).
- `npm run test:watch` — same, continuously.
- No linter nor formatter: that is a choice, do not add one without an explicit request.
- A game replays identically with `?seed=N` in the URL.

## Non-negotiable conventions

- **No access to `document`, `window`, `canvas` in `src/rules/`** — neither read nor
  write. A rule takes the state `s`, decides, and that is all.
- **No `Math.random()`, `Date.now()`, `performance.now()` in `src/rules/`.**
  Rule randomness goes exclusively through `s.rng` (seeded generator from
  `src/rules/rng.js`). Only exceptions, documented in `docs/decisions.md`: the cosmetic
  shake in `src/render/canvas.js` and the seed draw in `src/main.js`.
- **No magic value outside `src/config.js`**: every rule value (cost, range, damage,
  distance, threshold, delay) is a named export of `config.js`.
- **Imports point downward, never the other way**:
  `config` ← `rules` ← `state`/`render` ← (`input`, `loop`) ← `main`.
  In particular: `rules/` imports only `config.js` and other `rules/` modules;
  `input/` imports neither `render/` nor `loop/` — its effects (`act`, `refresh`,
  `draw`) are injected by `main.js`.
- **The game state lives in `S`** (built by `createGame`, `src/state/game.js`) and the
  application state (canvas, geometry, hover, targets) in the `app` object created by
  `src/main.js`. Do not create new globals: extend `S` or `app`.
- The rules **mutate `s` in place** (documented choice): follow that style, do not
  introduce partial immutability.
- Language: code, tests and docs in **English**; player-facing text (cards, log
  messages, UI labels) in **French** — the game is French.

## Expected behaviour

- Never declare a task finished without running `npm test` and seeing the suite green.
- If an approach fails twice, stop and revisit the plan instead of a third variant.
- Test at the macro level: the behaviour a player observes, in the game's vocabulary —
  not implementation details (see the `testing` skill).
- `docs/decisions.md` is authoritative for deliberately preserved behaviours and open
  questions: do not "fix" anything listed there without an explicit decision.

## Available skills

- `architecture` — module map and "where new code goes" by type of change.
- `game-rules` — pure rules: legality, resolution, enemies, tension, turn, seed.
- `board` — topology: tiles, doors, locks, BFS, line of sight.
- `render-ui` — the `app` contract, canvas/HUD rendering, injected inputs.
- `testing` — command, macro philosophy, test map, where to write a new test.
- `feature` — implementation workflow, from restating the request to the summary.
- `prd` — writes a specification (PRD) without implementing anything.

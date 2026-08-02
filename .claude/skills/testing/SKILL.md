---
name: testing
description: Use when tests must be written, adapted or run — to know which file covers what, how to build a test state and which philosophy to follow.
auto_invoke: true
---

# Tests

## Command

- `npm test` — `node --test` (Node ≥ 22), zero dependencies. Discovers `tests/*.test.js`.
- `npm run test:watch` — continuously.
- Imports: `node:test` and `node:assert/strict`.

## Philosophy

**Macro tests**: each test asserts a behaviour a player observes, in the game's
vocabulary ("disengaging from an enemy in contact costs two actions"), never an
implementation detail ("the internal array has 3 elements"). One or two tests per
rule: the nominal case and the edge case that justifies the rule. Coverage percentage
is not a target.

Test state is built as a **small, local, explicit literal** (see the `base()`
factories at the top of `tests/actions.test.js`, `tests/play.test.js`…), never via a
shared helper hiding the setup. Determinism comes from `makeRng(seed)`: same seed,
same dice.

## File → covered scope

| File | Covers | Example assertions |
| --- | --- | --- |
| `tests/rng.test.js` | `src/rules/rng.js` | same seed → same sequence; shuffle = permutation without mutation |
| `tests/board.test.js` | `src/rules/board.js` | intra-tile movement; wall without a door; locks (player/enemy) |
| `tests/movement.test.js` | `src/rules/movement.js` | move range; door = normal step; absence of route |
| `tests/sight.test.js` | `src/rules/sight.js` | sight along a corridor; cut by a wall or a closed door |
| `tests/bag.test.js` | `src/rules/bag.js` | stacking; refusal on full bag; slot freed |
| `tests/actions.test.js` | `src/rules/actions.js` | nothing outside the player phase; disengage surcharge; attack conditions |
| `tests/play.test.js` | `src/rules/play.js` | AP cost; durable unlocking; parking victory; seeded dice |
| `tests/enemies.test.js` | `src/rules/enemies.js` | contact strike; chase; defeat at 0 hp; spawn minDist |
| `tests/tension.test.js` | `src/rules/tension.js` | defeat on empty deck; card effects; draw → discard |
| `tests/turn.test.js` | `src/rules/turn.js` | phase sequencing; interruption on defeat |
| `tests/game.test.js` | `src/state/game.js` | seed determinism; setup invariants |

No test imports `render/`, `input/`, `loop/` nor `main.js`: those layers are verified
by playing (`npm run dev`).

## Where to put a new test

1. Modified existing rule → extend the matching `tests/<module>.test.js`.
2. New rules module `src/rules/x.js` → create `tests/x.test.js` (same name).
3. Tests quote real board cells (hall `[3,4]`, door `[10,3]→[10,4]`…): rely on
   `src/config.js` to pick true coordinates, and on the existing tests as models.
4. Always finish with a full `npm test` — never a single file — before concluding.

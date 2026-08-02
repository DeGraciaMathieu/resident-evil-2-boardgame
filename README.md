# RPD — Ground floor

Solo turn-based board game inspired by Resident Evil 2: Leon must cross the
police station's ground floor and reach the parking exit before the tension
deck runs out. The game's interface and texts are in French.

> ⚠️ **Opening `index.html` by double-click no longer works.** The code is
> split into native ESM modules, which browsers refuse to load over
> `file://`. The folder must be served over HTTP:
>
> ```sh
> npm run dev
> ```

## Run the game

```sh
npm run dev        # serves the folder (npx serve), then open the printed URL
```

A specific game can be replayed with `?seed=N` in the URL.

## Test

```sh
npm test           # node --test (Node ≥ 22, zero dependencies)
npm run test:watch
```

## Architecture

```
index.html            HTML/CSS shell, loads src/main.js
src/
  config.js           data tables and rule values
  rules/              pure rules (deterministic via the state's seeded RNG)
    rng.js            seeded generator
    board.js          cells, doors, passability
    movement.js       reachability and path BFS
    sight.js          line of sight
    bag.js            inventory
    actions.js        action legality
    play.js           applying an action
    enemies.js        activation and spawning
    tension.js        tension deck
    turn.js           phase sequencing
    log.js            game log messages
  state/game.js       factory of a game's state
  render/             canvas (board) and HUD (DOM)
  input/              mouse and buttons → intents
  loop/controller.js  intent → rule → render
  main.js             entry point: app, seed, wiring
tests/                macro tests (node:test), one file per rule
docs/decisions.md     refactoring decisions, preserved behaviours, open questions
```

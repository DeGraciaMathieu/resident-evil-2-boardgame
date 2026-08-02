---
name: render-ui
description: Use when a request touches the display or the interactions — canvas, HUD, buttons, mouse, game-over screen, animated tension card — to honour the app contract and the effect injection into input/.
auto_invoke: true
---

# Rendering and interface

Rendering reads the state, never decides it. All application state flows through the
`app` object created by `src/main.js`:

```js
app = { cv, ctx, S, G, hover, reachable, targets, shake, focus, fx, raf }
```

`S` is the game state; `G` the geometry (`{t, ox, oy}`: cell size and centering);
`reachable` (Map of cell key → `move` action) and `targets` (Set of enemy ids) are
recomputed by `recompute(app)` from `actions(S)`; `focus` (enemy id or null) is set
by the controller's end-of-turn playback and ringed by `draw`; `fx` (list of
transient cosmetic effects pushed via `addFx`, timed with `performance.now`) and
`raf` (guard so only one `requestAnimationFrame` chain runs) belong to the render.

## Who does what

| Element | Function | File |
| --- | --- | --- |
| Resizing (DPR included) | `resize(app)` | `src/render/canvas.js` |
| Full board rendering | `draw(app)` — grid, tiles, spawn points, tokens, doors, reachable cells, enemies, player | `src/render/canvas.js` |
| Screen shake after a shot | `app.shake` (init `SHAKE_INITIAL` in `mouse.js`, damped in `draw`) — the only legitimate `Math.random` use, cosmetic | `src/render/canvas.js` |
| Full HUD | `refresh(app, cardDrawn)` — turn, weapon, HP/AP gauges, bag, `disabled` buttons, log, deck counter, card flip, game-over screen | `src/render/hud.js` |
| Item glyphs | `ICONS` | `src/render/hud.js` |
| Tile colours | `TINTS` | `src/render/canvas.js` |
| Board hover and click | `bindMouse(app, {act, refresh, draw})` | `src/input/mouse.js` |
| Footer buttons | `bindButtons(app, {act})` | `src/input/buttons.js` |
| Intent → rule → render | `act(app, action)` | `src/loop/controller.js` |
| End-of-turn playback | `playback` (private) — replays `endTurnSteps` with `STEP_DELAYS`, one `refresh` per step, sets `app.focus`, stages FX via `stage` | `src/loop/controller.js` |
| Playback FX (move tween, spawn pop, floating damage) | `addFx(app, fx)` + rendering in `draw`, durations in `FX_DURATION` | `src/render/canvas.js` |
| Phase banner over the board | `banner(text, tone)` — ids `banner`/`bannerText`, tones `enemy`/`tension`/`player`; shown by class `show`, hidden on a JS timer (`BANNER_HOLD`) | `src/render/hud.js` |
| Card pull animation | class `pull` on id `deck` (keyframes `pull`), added by `refresh` when a card is drawn | `src/render/hud.js` |
| Phase label (header) | `PHASE_LABELS` + id `phase` (class `busy` outside the player phase) | `src/render/hud.js` |
| HUD DOM ids | `turnNo`, `phase`, `seedNo`, `hp`, `ap`, `weapon`, `dice`, `ammo`, `location`, `bag`, `log`, `remaining`, `card`, `cardTitle`, `cardText`, `cardNum`, `gameOver`, `gameOverTitle`, `gameOverText`, buttons `btnSearch`/`btnHeal`/`btnCombine`/`btnWeapon`/`btnEndTurn` | `index.html` |

## The layer contract

- `render/` reads `app` and `S`, writes to the screen — never into `S`.
- `input/` translates an event into an **intent** and calls the **injected** effects
  (`act`, `refresh`, `draw`). It imports neither `render/` nor `loop/`: if a new
  handler needs an effect, add it to the injection parameter and to the wiring in
  `src/main.js`.
- Every game action goes through `act(app, action)` — never call `play` then `refresh`
  by hand from a handler.

## Adding a UI element

1. `index.html`: the markup (with an id) and the style in the leading `<style>`.
   Visible labels are in French (the game is French); ids and classes in English.
2. `src/render/hud.js`: its update in `refresh` (or `src/render/canvas.js` in `draw`
   if it lives on the board).
3. If interactive: wire it in `src/input/buttons.js` (or `mouse.js`), the action going
   through `act`.
4. New values (delay, threshold, rule-tied colour) → `src/config.js`.
5. Rendering is untested (no test imports `render/` nor `input/`): check in game with
   `npm run dev`, and keep `npm test` green.

## Known pitfalls

- `newGame` is exposed on `window` (`src/main.js`) because the game-over screen button
  uses an inline `onclick` — keep it when touching the bootstrap.
- The tension-card flip relies on the `flip` CSS class and `CARD_FLIP_DELAY` (260 ms):
  both must stay consistent with the `.card` CSS transition.
- `refresh(app, cardDrawn)` only triggers the animation when `cardDrawn` is true — it
  is `act` that detects it by comparing the deck size before/after `play`.

---
name: feature
description: Use when the user asks to implement a feature or a game modification — runs the full workflow, from restating the request to the final summary, within the layer rules.
user_invocable: true
---

# Workflow: implementing a request

## 1. Understand

- Restate the request in one or two sentences, in the game's vocabulary.
- Invoke the `architecture` skill (and `game-rules` / `board` / `render-ui` depending
  on the topic) to locate the affected files.
- Ask the clarifying questions **before** coding:
  - numeric values (AP cost, range, damage, spawn distance…);
  - interactions with the existing game (does it stack with the disengage surcharge?
    effect on the tension deck? visible in the HUD?);
  - edge cases (full bag, not enough AP, game over, occupied cell).
- If the request touches a behaviour listed in `docs/decisions.md` ("Deliberately left
  alone" or "Open questions"), flag it and have it settled.

## 2. Implement

- Follow `CLAUDE.md`: values in `src/config.js`, pure rules in `src/rules/`
  (randomness via `s.rng`), rendering in `src/render/`, triggers in `src/input/`
  going through `act`. Player-facing text in French.
- Follow the order of the relevant domain skill's procedures (e.g. "adding a tension
  card": config → tension.js → test → game).
- Add no dependency, nor any unrequested feature.

## 3. Test

- Write the macro test(s) in the matching `tests/<module>.test.js` (player behaviour,
  literal state, fixed seed).
- Full `npm test`, fix until green. Two failures of the same approach → stop and
  revisit the plan with the user.
- Check in game if rendering or inputs are touched (`npm run dev`).

## 4. Update the documentation

Only if the scope moved:
- `CLAUDE.md` if a convention changes;
- the affected domain skill if a concept → implementation table is no longer exact;
- `README.md` if the tree or the commands change;
- `docs/decisions.md` if an open question was settled.

## 5. Summarise

End with: files changed, tests added (name + covered behaviour), `npm test` result,
and what remains open if anything.

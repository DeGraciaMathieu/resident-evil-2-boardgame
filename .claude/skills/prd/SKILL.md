---
name: prd
description: Use when the user wants a specification (PRD) of a game evolution before any implementation — explores the code for the technical baseline, asks only the product decisions, implements nothing.
user_invocable: true
---

# Workflow: writing a PRD

This workflow produces a specification document. **It implements nothing**: no file in
`src/` nor `tests/` is modified.

## Approach

1. Explore the existing code (`architecture`, `game-rules`, `board`, `render-ui`
   skills) to fill the whole technical part alone: affected files, functions to
   extend, existing constants in `src/config.js`, impacted tests.
2. Ask the user only the **product decisions** the code does not settle: balancing
   values, expected behaviour in edge cases, priorities.
3. Write the PRD in the fixed format below, in the game's vocabulary. Any quoted
   player-facing text is written in French (the game is French).

## Fixed format

```markdown
# PRD — <title>

## Goal
<the problem or wish, in one or two player-side sentences>

## Technical baseline
<current state of the affected code: modules, functions, constants, with real paths>

## Behaviour
<the target behaviour, nominal case then edge cases, explicit numeric values>

## Out of scope
<what this evolution deliberately does not do>

## Impact per layer
| Layer | Impact |
| --- | --- |
| `src/config.js` | <constants to add/modify> |
| `src/rules/` | <affected rules> |
| `src/state/` | <new state fields> |
| `src/render/` + `index.html` | <displays> |
| `src/input/` + `src/loop/` | <triggers> |

## Acceptance criteria
<verifiable list, from the player's point of view>

## Tests
<the macro tests to write: target file + asserted behaviour>

## Risks and open questions
<including interactions with docs/decisions.md where relevant>
```

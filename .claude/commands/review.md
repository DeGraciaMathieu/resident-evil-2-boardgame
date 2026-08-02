# /review — full review of the pending changes

1. Read `CLAUDE.md` (non-negotiable conventions) and keep `docs/decisions.md` in mind
   (deliberately preserved behaviours).
2. Establish the scope: `git diff`, `git diff --cached`, `git status`,
   `git log --oneline -5`. **If there is no change, say so and stop.**
3. Check point by point, each rated OK / VIOLATION / N-A with file:line:

   **Conventions**
   - Purity of `src/rules/`: no `document`/`window`/`canvas`, no
     `Math.random`/`Date.now`/`performance.now` (randomness goes through `s.rng`).
   - No magic value outside `src/config.js` (every rule value is a named export).
   - Import direction: `config ← rules ← state/render ← (input, loop) ← main`;
     `input/` imports neither `render/` nor `loop/` (effects injected by `main.js`).
   - State: nothing new as a global — extend `S` (via `createGame`) or `app` (`main.js`).
   - Language: code, tests and docs in English; player-facing text in French.

   **Test coverage**
   - Every new or modified rule has its macro test in `tests/<module>.test.js`.
   - Tests assert player behaviour, not an internal shape; state built as an explicit
     literal; seed fixed for anything random.

   **Maintainability**
   - Coupling and single responsibility (one rule function = one decision).
   - Duplication (mind the weapon cycle hard-coded in both `actions.js` **and**
     `buttons.js` — if it changes, update both).
   - Function length/complexity, names faithful to the game's vocabulary.

   **System coherence**
   - Integration follows the established patterns: action → `actions` + `play` +
     input through `act`; display → `refresh`/`draw`; map → data in `config.js`.
   - No silent "fix" of a behaviour listed in `docs/decisions.md`.
   - `README.md` and skills still accurate if the tree or the commands moved.

4. Run `npm test` and report the real result (test count, failures).
5. Final report: a table per point with status, then an overall verdict
   (**compliant** / **to fix** with the ordered list of corrections).
